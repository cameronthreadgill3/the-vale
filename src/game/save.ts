import type { ClassId } from "./classes";
import { sanitizeSkills, type SkillSet } from "./skills";
import { START_ID } from "./atlas";
import { emptyPack, emptyWorn, emptyVault, sanitizeVault, sanitizeWorn, type InvStack, type Loadout, type Vault } from "./items";

const SAVE_VERSION = 2;
const SCORES_KEY = "thornvale.scores.v1";
const SETTINGS_KEY = "thornvale.settings.v1";
const ROSTER_KEY = "thornvale.roster.v2";

export const SLOT_COUNT = 4;

export type ScoreEntry = {
  name: string;
  classId: ClassId;
  level: number;
  score: number;
  date: number;
};

export type Settings = {
  sfx: number;
  music: number;
  shake: boolean;
};

export type CharacterSave = {
  slot: number;
  name: string;
  classId: ClassId;
  level: number;
  xp: number;
  score: number;
  skills: SkillSet;
  gold: number;
  pack: InvStack[];
  worn: Loadout;
  vaultCopper: number;
  vault: Vault;
  locationId: string;
  createdAt: number;
  updatedAt: number;
};

const defaultSettings: Settings = { sfx: 0.7, music: 0.35, shake: true };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T & { version?: number };
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function loadSettings(): Settings {
  return readJson(SETTINGS_KEY, defaultSettings);
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...s, version: SAVE_VERSION }));
  } catch {
    /* private mode */
  }
}

export function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { version?: number; entries?: ScoreEntry[] };
    return Array.isArray(parsed.entries) ? parsed.entries : [];
  } catch {
    return [];
  }
}

export function submitScore(entry: ScoreEntry): ScoreEntry[] {
  const next = [...loadScores(), entry]
    .sort((a, b) => b.score - a.score || b.level - a.level)
    .slice(0, 12);
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify({ version: SAVE_VERSION, entries: next }));
  } catch {
    /* ignore */
  }
  return next;
}

export function emptyRoster(): (CharacterSave | null)[] {
  return [null, null, null, null];
}

function validClass(id: unknown): id is ClassId {
  return (
    id === "warrior" ||
    id === "archer" ||
    id === "mage" ||
    id === "healer" ||
    id === "paladin" ||
    id === "monk"
  );
}

export function loadRoster(): (CharacterSave | null)[] {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (!raw) return emptyRoster();
    const parsed = JSON.parse(raw) as { slots?: unknown[] };
    const src = Array.isArray(parsed.slots) ? parsed.slots : [];
    const slots = emptyRoster();
    for (let i = 0; i < SLOT_COUNT; i++) {
      const s = src[i];
      if (!s || typeof s !== "object") continue;
      const c = s as CharacterSave;
      if (!c.name || !validClass(c.classId)) continue;
      slots[i] = {
        slot: i,
        name: String(c.name).slice(0, 18),
        classId: c.classId,
        level: Math.max(1, Math.floor(Number(c.level) || 1)),
        xp: Math.max(0, Math.floor(Number(c.xp) || 0)),
        score: Math.max(0, Math.floor(Number(c.score) || 0)),
        skills: sanitizeSkills(c.classId, (c as CharacterSave).skills),
        gold: Math.max(0, Math.floor(Number((c as CharacterSave).gold) || 25)),
        pack: Array.isArray((c as CharacterSave).pack) ? (c as CharacterSave).pack : emptyPack(),
        worn: sanitizeWorn((c as CharacterSave).worn) ?? emptyWorn(),
        vaultCopper: Math.max(0, Math.floor(Number((c as CharacterSave).vaultCopper) || 0)),
        vault: sanitizeVault((c as CharacterSave).vault),
        locationId: typeof (c as CharacterSave).locationId === "string" ? (c as CharacterSave).locationId : START_ID,
        createdAt: Number(c.createdAt) || Date.now(),
        updatedAt: Number(c.updatedAt) || Date.now(),
      };
    }
    return slots;
  } catch {
    return emptyRoster();
  }
}

export function saveRoster(slots: (CharacterSave | null)[]) {
  try {
    localStorage.setItem(ROSTER_KEY, JSON.stringify({ version: SAVE_VERSION, slots }));
  } catch {
    /* private mode */
  }
}

export function nameTaken(slots: (CharacterSave | null)[], name: string, exceptSlot?: number) {
  const n = name.trim().toLowerCase();
  if (!n) return false;
  return slots.some((s, i) => s && i !== exceptSlot && s.name.trim().toLowerCase() === n);
}
