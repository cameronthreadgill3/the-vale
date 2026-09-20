import { useEffect, type Dispatch, type SetStateAction, type MutableRefObject, type RefObject } from "react";
import { type ValeClass } from "@/game/classes";
import { type ContinentId } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";
import { SKILL_IDS, type SkillId } from "@/game/skills";
import {
  TILE,
  isSolid,
  loadLocationMap,
  spawnNearArrivalGate,
  type WorldMap,
} from "@/game/world";
import {
  PLAYER_SPEED,
  PASSIVE_SKILL_XP_PER_SEC,
  type PromptState,
  type HudState,
} from "@/game/canvasConstants";
import {
  folkOnContinent,
  shopsOnContinent,
  docksOnContinent,
} from "@/game/folk";
import {
  softClearAll,
  softClearRadius,
  resolveWalkableSpawn,
} from "@/game/folkCanvas";
import { mitigateDamage } from "@/game/combat";
import {
  spawnEnemies,
  updateEnemies,
  updateFloatTexts,
  updateProjectiles,
  type Enemy,
  type FloatText,
  type Projectile,
} from "@/game/enemies";
import { tryMovePlayer } from "@/game/gameLoopFrame";
import { advanceCameraAndRender } from "@/game/gameLoopRender";
import { attachCanvasPointers } from "@/game/gameLoopPointers";
import { createPlayerAttack } from "@/game/gameLoopCombat";

export function useGameLoopEffect(d: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  keysRef: MutableRefObject<Record<string, boolean>>;
  interactRequestRef: MutableRefObject<boolean>;
  accentRef: MutableRefObject<ValeClass>;
  passiveRef: MutableRefObject<(n: number) => void>;
  trainRef: MutableRefObject<(s: SkillId) => void>;
  toggleSkillsRef: MutableRefObject<() => void>;
  toggleMapRef: MutableRefObject<() => void>;
  travelRef: MutableRefObject<(t: ContinentId, f: ContinentId) => void>;
  enterHollowRef: MutableRefObject<(i: number, r: { x: number; y: number }) => void>;
  exitHollowRef: MutableRefObject<() => void>;
  openFolkRef: MutableRefObject<(folkId: string) => void>;
  openShopRef: MutableRefObject<(shopId: string) => void>;
  openShipRef: MutableRefObject<(dockId: string) => void>;
  passiveAccum: MutableRefObject<number>;
  promptRef: MutableRefObject<PromptState>;
  interactLock: MutableRefObject<boolean>;
  character: ValeCharacter;
  arrivedFrom: ContinentId | null;
  shipSpawn: { x: number; y: number } | null;
  combatXp: number;
  setHud: Dispatch<SetStateAction<HudState>>;
  setPrompt: Dispatch<SetStateAction<PromptState>>;
  characterRef: MutableRefObject<ValeCharacter>;
  onCombatReward: MutableRefObject<(
    combatXp: number,
    skill: SkillId,
    skillXp: number,
    gold: number,
  ) => void>;
  onVitals: MutableRefObject<(hp: number, mana: number) => void>;
  onPlayerDeath: MutableRefObject<() => void>;
  overlayOpenRef: MutableRefObject<boolean>;
}): void {
  const {
    canvasRef, keysRef, interactRequestRef, accentRef, passiveRef, trainRef, toggleSkillsRef, toggleMapRef,
    travelRef, enterHollowRef, exitHollowRef, openFolkRef, openShopRef, openShipRef,
    passiveAccum, promptRef, interactLock,
    character, arrivedFrom, shipSpawn, setHud, setPrompt,
    characterRef, onCombatReward, onVitals, onPlayerDeath, overlayOpenRef,
  } = d;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const map: WorldMap = loadLocationMap(
      character.continentId,
      character.hollowIndex,
      character.hollowReturn,
    );
    const folk = map.kind === "overworld" ? folkOnContinent(character.continentId) : [];
    const shops = map.kind === "overworld" ? shopsOnContinent(character.continentId) : [];
    const docks = map.kind === "overworld" ? docksOnContinent(character.continentId) : [];
    softClearAll(map, folk, shops, docks);
    softClearRadius(map, map.spawn.x, map.spawn.y, 2);

    let preferred = map.spawn;
    if (map.kind === "overworld") {
      if (shipSpawn) {
        preferred = { x: shipSpawn.x, y: shipSpawn.y };
      } else if (character.hollowReturn) {
        const r = character.hollowReturn;
        const candidates = [
          { x: r.x, y: r.y + 1 },
          { x: r.x, y: r.y - 1 },
          { x: r.x + 1, y: r.y },
          { x: r.x - 1, y: r.y },
        ];
        preferred = { x: r.x, y: r.y };
        for (const c of candidates) {
          if (
            c.x > 0 &&
            c.y > 0 &&
            c.x < map.width - 1 &&
            c.y < map.height - 1 &&
            !isSolid(map.tiles[c.y]![c.x]!, map.kind)
          ) {
            preferred = c;
            break;
          }
        }
      } else {
        preferred = spawnNearArrivalGate(map, arrivedFrom);
      }
    }
    const spawnTile = resolveWalkableSpawn(map, preferred);

    const player = {
      x: (spawnTile.x + 0.5) * TILE,
      y: (spawnTile.y + 0.5) * TILE,
    };
    let camX = player.x;
    let camY = player.y;
    let raf = 0;
    let last = performance.now();
    let running = true;
    let hudAccum = 0;
    let promptAccum = 0;
    const blockedTiles: { x: number; y: number }[] = [
      ...folk.map((f) => ({ x: f.x, y: f.y })),
      ...shops.map((s) => ({ x: s.x, y: s.y })),
      ...docks.map((dk) => ({ x: dk.x, y: dk.y })),
      ...map.gates.map((g) => ({ x: g.x, y: g.y })),
      ...map.hollows.map((h) => ({ x: h.x, y: h.y })),
    ];
    if (map.exit) blockedTiles.push({ x: map.exit.x, y: map.exit.y });
    const enemies: Enemy[] = spawnEnemies(map, character.continentId, blockedTiles);
    const floatTexts: FloatText[] = [];
    const projectiles: Projectile[] = [];
    let attackCd = 0;
    let playerFlash = 0;
    let deadLock = false;
    let noTargetCd = 0;
    const mouse = { x: 0, y: 0, down: false, worldX: 0, worldY: 0 };
    const combatRng = () => Math.random();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const doInteract = () => {
      if (interactLock.current || deadLock || overlayOpenRef.current) return;
      const p = promptRef.current;
      if (!p) return;
      interactLock.current = true;
      window.setTimeout(() => {
        interactLock.current = false;
      }, 400);
      if (p.kind === "gate") {
        travelRef.current(p.target, character.continentId);
      } else if (p.kind === "hollow") {
        const tx = Math.floor(player.x / TILE);
        const ty = Math.floor(player.y / TILE);
        enterHollowRef.current(p.index, { x: tx, y: ty });
      } else if (p.kind === "exit") {
        exitHollowRef.current();
      } else if (p.kind === "folk") {
        openFolkRef.current(p.folkId);
      } else if (p.kind === "shop") {
        openShopRef.current(p.shopId);
      } else if (p.kind === "ship") {
        openShipRef.current(p.dockId);
      }
    };

    const pushFloat = (x: number, y: number, text: string, color: string) => {
      floatTexts.push({ x, y, text, color, life: 0.7, vy: -28 });
    };

    const doPlayerAttack = createPlayerAttack({
      characterRef,
      overlayOpenRef,
      onCombatReward,
      onVitals,
      player,
      enemies,
      mouse,
      projectiles,
      floatTexts,
      combatRng,
      getAttackCd: () => attackCd,
      setAttackCd: (n) => { attackCd = n; },
      getNoTargetCd: () => noTargetCd,
      setNoTargetCd: (n) => { noTargetCd = n; },
      getDeadLock: () => deadLock,
    });

    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "KeyW" ||
        e.code === "KeyA" ||
        e.code === "KeyS" ||
        e.code === "KeyD"
      ) {
        e.preventDefault();
      }
      if (e.code === "KeyK" && !e.repeat) {
        e.preventDefault();
        toggleSkillsRef.current();
      }
      if (e.code === "KeyM" && !e.repeat) {
        e.preventDefault();
        toggleMapRef.current();
      }
      if (e.code === "KeyE" && !e.repeat) {
        e.preventDefault();
        doInteract();
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) doPlayerAttack();
      }
      if (!e.repeat && e.key >= "1" && e.key <= "7") {
        const idx = Number(e.key) - 1;
        const skill = SKILL_IDS[idx];
        if (skill) {
          e.preventDefault();
          trainRef.current(skill);
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const detachPointers = attachCanvasPointers(canvas, mouse);

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const keys = keysRef.current;
      const paused = deadLock || overlayOpenRef.current;

      if (interactRequestRef.current) {
        interactRequestRef.current = false;
        doInteract();
      }

      let dx = 0;
      let dy = 0;
      if (!paused) {
        if (keys.KeyW || keys.ArrowUp) dy -= 1;
        if (keys.KeyS || keys.ArrowDown) dy += 1;
        if (keys.KeyA || keys.ArrowLeft) dx -= 1;
        if (keys.KeyD || keys.ArrowRight) dx += 1;
      }
      let moved = false;
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
        const step = PLAYER_SPEED * dt;
        const nx = player.x + dx * step;
        const ny = player.y + dy * step;
        if (!tryMovePlayer(map, player, nx, ny)) {
          if (!tryMovePlayer(map, player, nx, player.y)) {
            tryMovePlayer(map, player, player.x, ny);
          }
        }
        moved = true;
      }
      if (moved) {
        passiveAccum.current += PASSIVE_SKILL_XP_PER_SEC * dt;
        if (passiveAccum.current >= 1) {
          const grant = Math.floor(passiveAccum.current);
          passiveAccum.current -= grant;
          passiveRef.current(grant);
        }
      }

      if (!paused) {
        attackCd = Math.max(0, attackCd - dt);
        noTargetCd = Math.max(0, noTargetCd - dt);
        if (playerFlash > 0) playerFlash = Math.max(0, playerFlash - dt);
        const snap = characterRef.current;
        if ((keys.Space || mouse.down) && attackCd <= 0) {
          doPlayerAttack();
        }
        const foeHit = updateEnemies(enemies, map, player.x, player.y, dt, combatRng);
        if (foeHit.playerDamage > 0) {
          const taken = mitigateDamage(snap, foeHit.playerDamage, combatRng);
          snap.hp = Math.max(0, snap.hp - taken);
          playerFlash = 0.18;
          pushFloat(player.x, player.y - 12, String(taken), "#c45c3e");
          onVitals.current(snap.hp, snap.mana);
          // Shielding gains from being hit — ties defense skill to combat.
          onCombatReward.current(0, "shielding", Math.max(1, Math.floor(taken * 0.4)), 0);
          if (snap.hp <= 0 && !deadLock) {
            deadLock = true;
            pushFloat(player.x, player.y - 24, "You fall...", "#a8b09a");
            onPlayerDeath.current();
          }
        }
        updateFloatTexts(floatTexts, dt);
        updateProjectiles(projectiles, dt);
      }

      const standingTx = Math.floor(player.x / TILE);
      const standingTy = Math.floor(player.y / TILE);
      if (
        !paused &&
        standingTx >= 0 &&
        standingTy >= 0 &&
        standingTx < map.width &&
        standingTy < map.height &&
        !interactLock.current
      ) {
        const stand = map.tiles[standingTy]![standingTx]!;
        if (stand === "gate") {
          const g = map.gates.find((x) => x.x === standingTx && x.y === standingTy);
          if (g) {
            interactLock.current = true;
            travelRef.current(g.targetContinentId, character.continentId);
            return;
          }
        } else if (stand === "hollow") {
          const h = map.hollows.find((x) => x.x === standingTx && x.y === standingTy);
          if (h) {
            interactLock.current = true;
            enterHollowRef.current(h.index, { x: standingTx, y: standingTy });
            return;
          }
        } else if (stand === "exit") {
          interactLock.current = true;
          exitHollowRef.current();
          return;
        }
      }

      const rendered = advanceCameraAndRender({
        ctx,
        canvas,
        map,
        player,
        camX,
        camY,
        dt,
        enemies,
        floatTexts,
        projectiles,
        docks,
        folk,
        shops,
        mouse,
        playerFlash,
        accent: accentRef.current,
        character: characterRef.current,
        paused,
        setHud,
        setPrompt,
        promptRef,
        hudAccum,
        promptAccum,
      });
      camX = rendered.camX;
      camY = rendered.camY;
      hudAccum = rendered.hudAccum;
      promptAccum = rendered.promptAccum;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      detachPointers();
    };
  }, []);
}
