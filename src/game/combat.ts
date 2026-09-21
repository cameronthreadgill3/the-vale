/** Player combat stats, class attack profiles, and damage helpers (Tibia-flavored).
 *
 * First-hunt feel knobs live at the top — tune without hunting through the loop.
 */

import type { ClassId, ValeClass } from "@/game/classes";
import type { ValeCharacter } from "@/game/character";
import { skillLevelFromXp, type SkillId } from "@/game/skills";
import { levelFromXp } from "@/game/xp";

/** --- Combat-feel tunables (first hunt polish) --- */
/** Plaza fountain heal radius from spawn tile center (tiles). */
export const FOUNTAIN_HEAL_RADIUS_TILES = 1.4;
/** HP restored per second while standing on the fountain. */
export const FOUNTAIN_HEAL_PER_SEC = 28;
/** Min seconds between fountain "+HP" float texts. */
export const FOUNTAIN_HEAL_FLOAT_INTERVAL = 0.4;
/** Brief invulnerability after taking a hit (seconds). */
export const HIT_IFRAMES_SEC = 0.55;
/** Knockback distance on hit (pixels) so retreat stays readable. */
export const HIT_KNOCKBACK_PX = 30;
/** HP ratio that triggers a one-shot low-HP toast. */
export const LOW_HP_RATIO = 0.35;
export const LOW_HP_TOAST = "Low HP — retreat to the fountain!";
