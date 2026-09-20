import { useCallback, useEffect, useRef, useState } from "react";
import { CLASSES, getClass, type ClassId, type ValeClass } from "@/game/classes";
import {
  awardSkillXp,
  clearCharacter,
  createCharacter,
  loadCharacter,
  type ValeCharacter,
} from "@/game/character";
import { rngFrom, randInt } from "@/game/rng";
import {
  SKILLS,
  SKILL_IDS,
  skillSnapshot,
  type SkillId,
} from "@/game/skills";
import { levelFromXp, progressInLevel, xpToNext } from "@/game/xp";

const TILE = 32;
const MAP_W = 48;
const MAP_H = 36;
const PLAYER_SPEED = 140; // px / second
const PLAYER_RADIUS = 10;
/** Tiny passive skill XP per second of movement into the class primary skill. */
const PASSIVE_SKILL_XP_PER_SEC = 2.5;
/** Explicit train click / hotkey awards this base amount (class mult applies). */
const TRAIN_SKILL_XP = 18;

const TILE_COLORS = {
  grass: "#1f3a24",
  grassAlt: "#25462c",
  dirt: "#3a2f1f",
  path: "#4a3d28",
  stone: "#2c3030",
  water: "#1a2a3a",
  flower: "#3a2840",
} as const;

type TileKind = keyof typeof TILE_COLORS;

function generateMap(seed: string): TileKind[][] {
  const rng = rngFrom(seed);
  const map: TileKind[][] = [];
  for (let y = 0; y < MAP_H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < MAP_W; x++) {
      const edge = x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1;
      if (edge) {
        row.push("stone");
        continue;
      }
      const n = rng();
      if (n < 0.06) row.push("water");
      else if (n < 0.14) row.push("dirt");
      else if (n < 0.2) row.push("path");
      else if (n < 0.24) row.push("flower");
      else row.push(rng() < 0.5 ? "grass" : "grassAlt");
    }
    map.push(row);
  }
  // Carve a soft path through the middle for readability
  const midY = Math.floor(MAP_H / 2);
  for (let x = 2; x < MAP_W - 2; x++) {
    map[midY]![x] = "path";
    if (rng() < 0.35) map[midY - 1]![x] = "dirt";
    if (rng() < 0.35) map[midY + 1]![x] = "dirt";
  }
  // Clear spawn area
  const sx = Math.floor(MAP_W / 2);
  const sy = Math.floor(MAP_H / 2);
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const tx = sx + dx;
      const ty = sy + dy;
      if (tx > 0 && ty > 0 && tx < MAP_W - 1 && ty < MAP_H - 1) {
        map[ty]![tx] = dy === 0 ? "path" : "grass";
      }
    }
  }
  // Sprinkle a few stones as landmarks (seeded)
  for (let i = 0; i < 12; i++) {
    const tx = randInt(rng, 2, MAP_W - 3);
    const ty = randInt(rng, 2, MAP_H - 3);
    if (Math.abs(tx - sx) > 3 || Math.abs(ty - sy) > 3) {
      map[ty]![tx] = "stone";
    }
  }
  return map;
}

function isSolid(tile: TileKind): boolean {
  return tile === "water" || tile === "stone";
}

type Keys = Record<string, boolean>;

function skillRowsFrom(character: ValeCharacter) {
  return SKILL_IDS.map((id) => {
    const def = SKILLS.find((s) => s.id === id)!;
    const snap = skillSnapshot(character.skillXp[id]);
    return { id, name: def.name, hotkey: def.hotkey, ...snap };
  });
}

export function GameApp() {
  const [character, setCharacter] = useState<ValeCharacter | null>(() =>
    loadCharacter(),
  );
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [skillTick, setSkillTick] = useState(0);

  const pickClass = useCallback((id: ClassId) => {
    setCharacter(createCharacter(id));
  }, []);

  const resetPath = useCallback(() => {
    clearCharacter();
    setCharacter(null);
    setSkillsOpen(false);
  }, []);

  const trainSkill = useCallback(
    (skill: SkillId) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        const next: ValeCharacter = {
          ...prev,
          skillXp: { ...prev.skillXp },
        };
        awardSkillXp(next, skill, TRAIN_SKILL_XP);
        return { ...next, skillXp: { ...next.skillXp } };
      });
      setSkillTick((t) => t + 1);
    },
    [],
  );

  if (!character) {
    return <ClassSelectOverlay onPick={pickClass} />;
  }

  const cls = getClass(character.classId);
  const skills = skillRowsFrom(character);

  return (
    <GameShell
      character={character}
      cls={cls}
      skills={skills}
      skillsOpen={skillsOpen}
      skillTick={skillTick}
      onToggleSkills={() => setSkillsOpen((o) => !o)}
      onTrain={trainSkill}
      onResetPath={resetPath}
      onPassivePrimary={(amount) => {
        setCharacter((prev) => {
          if (!prev) return prev;
          const next: ValeCharacter = {
            ...prev,
            skillXp: { ...prev.skillXp },
          };
          awardSkillXp(next, cls.primarySkill, amount);
          return { ...next, skillXp: { ...next.skillXp } };
        });
        setSkillTick((t) => t + 1);
      }}
    />
  );
}

function ClassSelectOverlay({ onPick }: { onPick: (id: ClassId) => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-[#0c0d0b] p-4 sm:p-8">
      <div className="w-full max-w-3xl">
        <h1 className="font-display text-center text-2xl tracking-wide text-[#c9a227] sm:text-3xl">
          Choose your path
        </h1>
        <p className="mt-2 text-center text-sm text-[#a8b09a]">
          Six ways through Thornvale. Favored skills start higher and train faster.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {CLASSES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className="group rounded border border-[#2a2e24] bg-[#161812] p-4 text-left transition hover:border-[#c9a227]/60 hover:bg-[#1c1f16] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]"
              style={{ borderLeftWidth: 4, borderLeftColor: c.accent }}
            >
              <div
                className="font-display text-lg tracking-wide"
                style={{ color: c.accent }}
              >
                {c.name}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#a8b09a] sm:text-sm">
                {c.blurb}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-[#6a7260]">
                Primary · {c.primarySkill}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

type SkillRow = ReturnType<typeof skillRowsFrom>[number];

function GameShell({
  character,
  cls,
  skills,
  skillsOpen,
  skillTick,
  onToggleSkills,
  onTrain,
  onResetPath,
  onPassivePrimary,
}: {
  character: ValeCharacter;
  cls: ValeClass;
  skills: SkillRow[];
  skillsOpen: boolean;
  skillTick: number;
  onToggleSkills: () => void;
  onTrain: (skill: SkillId) => void;
  onResetPath: () => void;
  onPassivePrimary: (amount: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Keys>({});
  const accentRef = useRef(cls);
  const passiveRef = useRef(onPassivePrimary);
  const trainRef = useRef(onTrain);
  const toggleRef = useRef(onToggleSkills);
  const primaryRef = useRef(cls.primarySkill);
  const passiveAccum = useRef(0);

  accentRef.current = cls;
  passiveRef.current = onPassivePrimary;
  trainRef.current = onTrain;
  toggleRef.current = onToggleSkills;
  primaryRef.current = cls.primarySkill;

  const combatXp = character.combatXp;
  const level = levelFromXp(combatXp);
  const [hud, setHud] = useState({
    x: Math.floor(MAP_W / 2),
    y: Math.floor(MAP_H / 2),
    level,
    xp: combatXp,
    progress: progressInLevel(level, combatXp),
    next: xpToNext(level),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const map = generateMap("thornvale-starter-hollow");
    const xp = combatXp;
    const combatLevel = levelFromXp(xp);

    const player = {
      x: (MAP_W / 2) * TILE,
      y: (MAP_H / 2) * TILE,
    };

    let camX = player.x;
    let camY = player.y;
    let raf = 0;
    let last = performance.now();
    let running = true;
    let hudAccum = 0;

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
        toggleRef.current();
      }
      // Digit hotkeys 1–7 train skills
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

    const tryMove = (nx: number, ny: number) => {
      const r = PLAYER_RADIUS;
      const samples = [
        [nx - r, ny - r],
        [nx + r, ny - r],
        [nx - r, ny + r],
        [nx + r, ny + r],
      ] as const;
      for (const [px, py] of samples) {
        const tx = Math.floor(px / TILE);
        const ty = Math.floor(py / TILE);
        if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
        if (isSolid(map[ty]![tx]!)) return false;
      }
      player.x = nx;
      player.y = ny;
      return true;
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      if (keys.KeyW || keys.ArrowUp) dy -= 1;
      if (keys.KeyS || keys.ArrowDown) dy += 1;
      if (keys.KeyA || keys.ArrowLeft) dx -= 1;
      if (keys.KeyD || keys.ArrowRight) dx += 1;
      let moved = false;
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
        const step = PLAYER_SPEED * dt;
        const nx = player.x + dx * step;
        const ny = player.y + dy * step;
        if (!tryMove(nx, ny)) {
          if (!tryMove(nx, player.y)) tryMove(player.x, ny);
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

      // Smooth camera follow
      camX += (player.x - camX) * Math.min(1, 8 * dt);
      camY += (player.y - camY) * Math.min(1, 8 * dt);

      const viewW = canvas.clientWidth;
      const viewH = canvas.clientHeight;
      const originX = camX - viewW / 2;
      const originY = camY - viewH / 2;

      ctx.fillStyle = "#0c0d0b";
      ctx.fillRect(0, 0, viewW, viewH);

      const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
      const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
      const endTX = Math.min(MAP_W - 1, Math.ceil((originX + viewW) / TILE) + 1);
      const endTY = Math.min(MAP_H - 1, Math.ceil((originY + viewH) / TILE) + 1);

      for (let ty = startTY; ty <= endTY; ty++) {
        for (let tx = startTX; tx <= endTX; tx++) {
          const kind = map[ty]![tx]!;
          ctx.fillStyle = TILE_COLORS[kind];
          const sx = Math.floor(tx * TILE - originX);
          const sy = Math.floor(ty * TILE - originY);
          ctx.fillRect(sx, sy, TILE + 1, TILE + 1);
          // Subtle grid for depth
          if (kind === "grass" || kind === "grassAlt") {
            ctx.fillStyle = "rgba(0,0,0,0.08)";
            ctx.fillRect(sx, sy, TILE + 1, 1);
            ctx.fillRect(sx, sy, 1, TILE + 1);
          }
        }
      }

      // Player shadow
      const px = Math.floor(player.x - originX);
      const py = Math.floor(player.y - originY);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(px, py + 6, PLAYER_RADIUS * 0.9, PLAYER_RADIUS * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player body — tinted by class accent
      const ac = accentRef.current;
      const grad = ctx.createRadialGradient(px - 3, py - 4, 2, px, py, PLAYER_RADIUS + 2);
      grad.addColorStop(0, ac.accentLite);
      grad.addColorStop(0.6, ac.accent);
      grad.addColorStop(1, ac.accentDark);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0c0d0b";
      ctx.lineWidth = 2;
      ctx.stroke();

      hudAccum += dt;
      if (hudAccum >= 0.2) {
        hudAccum = 0;
        setHud({
          x: Math.round(player.x / TILE),
          y: Math.round(player.y / TILE),
          level: combatLevel,
          xp,
          progress: progressInLevel(combatLevel, xp),
          next: xpToNext(combatLevel),
        });
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // Canvas loop mounts once per class session; skill updates go through React.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // silence unused skillTick in deps for future HUD flashes
  void skillTick;

  return (
    <div className="relative h-full w-full select-none">
      <canvas ref={canvasRef} className="block h-full w-full" tabIndex={0} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl tracking-wide text-[#c9a227] sm:text-2xl">
              The Vale
            </h1>
            <p className="mt-0.5 text-xs text-[#a8b09a] sm:text-sm">
              A Story as Old as Time — starter hollow
            </p>
            <p
              className="mt-1 font-display text-sm tracking-wide sm:text-base"
              style={{ color: cls.accent }}
            >
              {cls.name}
            </p>
          </div>
          <div className="rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-2 text-xs text-[#e8e6d9] backdrop-blur-sm sm:text-sm">
            <div className="font-display" style={{ color: cls.accent }}>
              Level {hud.level}
            </div>
            <div className="mt-1 text-[#a8b09a]">
              XP {hud.xp} / {hud.next}
            </div>
            <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded bg-[#0c0d0b]">
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.round(hud.progress * 100)}%`,
                  background: cls.accent,
                }}
              />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-[#6a7260]">
              Tile {hud.x}, {hud.y}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="w-fit rounded border border-[#2a2e24] bg-[#161812]/80 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm">
            Move <span className="text-[#e8e6d9]">WASD</span> /{" "}
            <span className="text-[#e8e6d9]">Arrows</span>
            {" · "}
            <span className="text-[#e8e6d9]">K</span> skills
            {" · "}
            <span className="text-[#e8e6d9]">1–7</span> train
          </div>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#e8e6d9] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onToggleSkills}
          >
            {skillsOpen ? "Hide skills" : "Skills (K)"}
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onResetPath}
          >
            Change path
          </button>
        </div>
      </div>

      {skillsOpen && (
        <SkillsPanel
          cls={cls}
          skills={skills}
          onTrain={onTrain}
          onClose={onToggleSkills}
        />
      )}
    </div>
  );
}

function SkillsPanel({
  cls,
  skills,
  onTrain,
  onClose,
}: {
  cls: ValeClass;
  skills: SkillRow[];
  onTrain: (skill: SkillId) => void;
  onClose: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 w-[min(100%-2rem,20rem)] rounded border border-[#2a2e24] bg-[#161812]/95 p-3 shadow-xl backdrop-blur-md sm:bottom-6 sm:right-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-sm tracking-wide text-[#c9a227]">
            Skills
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
            Cubic XP · click or 1–7 to train
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-xs text-[#a8b09a] hover:text-[#e8e6d9]"
        >
          Close
        </button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {skills.map((s) => {
          const favored = (cls.gainMultipliers[s.id] ?? 1) > 1;
          const isPrimary = cls.primarySkill === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onTrain(s.id)}
                className="flex w-full flex-col gap-1 rounded border border-transparent px-2 py-1.5 text-left transition hover:border-[#2a2e24] hover:bg-[#1c1f16]"
              >
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-[#e8e6d9]">
                    <span className="mr-1.5 inline-block w-3 text-[#6a7260]">
                      {s.hotkey}
                    </span>
                    {s.name}
                    {isPrimary && (
                      <span
                        className="ml-1.5 text-[10px] uppercase tracking-wider"
                        style={{ color: cls.accent }}
                      >
                        primary
                      </span>
                    )}
                    {favored && !isPrimary && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider text-[#6a7260]">
                        favored
                      </span>
                    )}
                  </span>
                  <span className="font-display" style={{ color: cls.accent }}>
                    {s.level}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-[#0c0d0b]">
                  <div
                    className="h-full rounded transition-[width] duration-200"
                    style={{
                      width: `${Math.round(s.progress * 100)}%`,
                      background: isPrimary ? cls.accent : "#c9a227",
                    }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
