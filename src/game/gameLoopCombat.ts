import { getClass } from "@/game/classes";
import { TILE } from "@/game/world";
import {
  attackProfileForClass,
  maxHpFor,
  playerAttackDamage,
} from "@/game/combat";
import {
  killEnemy,
  nearestEnemyInRange,
  enemyAtCursor,
  type Enemy,
  type EnemyKindId,
  type FloatText,
  type Projectile,
} from "@/game/enemies";
import type { ValeCharacter } from "@/game/character";
import type { SkillId } from "@/game/skills";
import type { ItemId } from "@/game/items";
import { rollLoot, lootFloatLabel } from "@/game/loot";
import type { MutableRefObject } from "react";
import type { MouseState } from "@/game/gameLoopPointers";
import { playHit } from "@/game/audio";

export function createPlayerAttack(opts: {
  characterRef: MutableRefObject<ValeCharacter>;
  overlayOpenRef: MutableRefObject<boolean>;
  onCombatReward: MutableRefObject<(
    combatXp: number,
    skill: SkillId,
    skillXp: number,
    gold: number,
    loot?: ItemId[],
  ) => void>;
  onEnemyKill: MutableRefObject<(kindId: EnemyKindId) => void>;
  onVitals: MutableRefObject<(hp: number, mana: number) => void>;
  player: { x: number; y: number };
  enemies: Enemy[];
  mouse: MouseState;
  projectiles: Projectile[];
  floatTexts: FloatText[];
  combatRng: () => number;
  getAttackCd: () => number;
  setAttackCd: (n: number) => void;
  getNoTargetCd: () => number;
  setNoTargetCd: (n: number) => void;
  getDeadLock: () => boolean;
}) {
  const pushFloat = (x: number, y: number, text: string, color: string) => {
    opts.floatTexts.push({ x, y, text, color, life: 0.7, vy: -28 });
  };

  return () => {
    if (opts.getDeadLock() || opts.overlayOpenRef.current) return;
    const snap = opts.characterRef.current;
    const cls = getClass(snap.classId);
    const profile = attackProfileForClass(cls.id);
    if (opts.getAttackCd() > 0) return;
    if (profile.manaCost > 0 && snap.mana < profile.manaCost) {
      pushFloat(opts.player.x, opts.player.y - 14, "No mana", "#7ab8c9");
      return;
    }
    const cursorTarget = enemyAtCursor(opts.enemies, opts.mouse.worldX, opts.mouse.worldY);
    const target =
      cursorTarget &&
      Math.hypot(cursorTarget.x - opts.player.x, cursorTarget.y - opts.player.y) / TILE <=
        profile.range + 0.25
        ? cursorTarget
        : nearestEnemyInRange(opts.enemies, opts.player.x, opts.player.y, profile.range);
    if (!target) {
      if (opts.getNoTargetCd() <= 0) {
        pushFloat(opts.player.x, opts.player.y - 14, "No foe in range", "#a8b09a");
        opts.setNoTargetCd(0.55);
      }
      return;
    }
    opts.setAttackCd(profile.cooldown);
    if (profile.manaCost > 0) {
      snap.mana = Math.max(0, snap.mana - profile.manaCost);
      opts.onVitals.current(snap.hp, snap.mana);
    }
    const dmg = playerAttackDamage(snap, profile, opts.combatRng);
    target.hp -= dmg;
    target.flash = 0.15;
    playHit("enemy");
    pushFloat(target.x, target.y - 10, String(dmg), "#e8e6d9");
    if (profile.style !== "melee") {
      opts.projectiles.push({
        x: opts.player.x,
        y: opts.player.y,
        tx: target.x,
        ty: target.y,
        color: profile.style === "magic" ? cls.accent : "#c9a227",
        life: 0.22,
        style: profile.style === "magic" ? "magic" : "bolt",
      });
    }
    if (target.hp <= 0) {
      killEnemy(target);
      const goldGain =
        target.kind.goldMin +
        Math.floor(opts.combatRng() * (target.kind.goldMax - target.kind.goldMin + 1));
      pushFloat(target.x, target.y - 22, `+${goldGain}g`, "#c9a227");
      const loot = rollLoot(target.kind.id, opts.combatRng);
      loot.forEach((id, i) => {
        pushFloat(
          target.x,
          target.y - 34 - i * 12,
          `+${lootFloatLabel(id)}`,
          "#d8c878",
        );
      });
      opts.onCombatReward.current(
        target.kind.xpBase,
        profile.skill,
        Math.max(4, Math.floor(target.kind.xpBase * 0.35)),
        goldGain,
        loot,
      );
      opts.onEnemyKill.current(target.kind.id);
      if (profile.healOnKill > 0) {
        const heal = Math.max(1, Math.floor(dmg * profile.healOnKill));
        snap.hp = Math.min(maxHpFor(snap), snap.hp + heal);
        opts.onVitals.current(snap.hp, snap.mana);
        pushFloat(opts.player.x, opts.player.y - 18, `+${heal}`, "#7ab85a");
      }
    }
  };
}
