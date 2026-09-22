import { create } from "zustand";
import type { ClassId } from "./classes";
import { CLASSES } from "./classes";
import { cloneSkills, defaultSkills, type SkillSet } from "./skills";
import { START_ID } from "./atlas";
import type { Npc } from "./life";
import { emptyPack, emptyVault, emptyWorn, type InvStack, type Loadout, type Vault } from "./items";
import type { ChatLine } from "./net";
import {
  loadRoster,
  loadScores,
  loadSettings,
  nameTaken,
  saveRoster,
  saveSettings,
  submitScore,
  SLOT_COUNT,
  type CharacterSave,
  type ScoreEntry,
  type Settings,
} from "./save";
import type { ShopId } from "./shops";
import { saveWalker } from "./walkers";
import { claimName, releaseName } from "./realm";

export type Screen =
  | "title"
  | "login"
  | "class"
  | "playing"
  | "paused"
  | "gameover"
  | "scores"
  | "patches"
  | "how"
  | "atlas"
  | "shop"
  | "bank"
  | "inn"
  | "mill"
  | "house"
  | "pack"
  | "gear"
  | "who"
  | "talk";

export type HudAbility = { id: string; name: string; ready: number; mana: number; can: boolean };
export type HudSkill = { id: string; name: string; level: number; progress: number };
export type WhoRow = { name: string; level: number; className: string; ping: number | null };

export type GameStore = {
  screen: Screen;
  overlay: Screen;
  playerName: string;
  classId: ClassId;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  xp: number;
  level: number;
  xpNeed: number;
  score: number;
  lives: number;
  toast: string;
  abilities: HudAbility[];
  skills: HudSkill[];
  scores: ScoreEntry[];
  settings: Settings;
  targetName: string;
  targetHp: number;
  targetMax: number;
  inReach: boolean;
  combatHint: string;
  gold: number;
  pack: InvStack[];
  worn: Loadout;
  vaultCopper: number;
  vault: Vault;
  locationId: string;
  prompt: string;
  huntName: string;
  objective: string;
  training: string;
  idleLeft: number;
  walkers: number;
  who: WhoRow[];
  chatLog: ChatLine[];
  chatOpen: boolean;
  clock: string;
  talkNpc: Npc | null;
  shopId: ShopId | null;
  roster: (CharacterSave | null)[];
  activeSlot: number | null;
  creatingSlot: number | null;
  accountReady: boolean;
  setScreen: (s: Screen) => void;
  setOverlay: (s: Screen) => void;
  setChatOpen: (open: boolean) => void;
  pushChat: (line: ChatLine) => void;
  setName: (n: string) => void;
  setClass: (id: ClassId) => void;
  setSettings: (s: Partial<Settings>) => void;
  beginCreate: (slot: number) => void;
  createActive: (slot: number, name: string, classId: ClassId) => Promise<string | null>;
  selectSlot: (slot: number) => CharacterSave | null;
  deleteSlot: (slot: number) => void;
  hydrateRoster: (slots: (CharacterSave | null)[]) => void;
  saveProgress: (p: {
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
  }) => void;
  recordScore: () => void;
  pulse: (partial: Partial<GameStore>) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  screen: "title",
  overlay: "title",
  playerName: "Adventurer",
  classId: "warrior",
  hp: 130,
  maxHp: 130,
  mp: 40,
  maxMp: 40,
  xp: 0,
  level: 1,
  xpNeed: 100,
  score: 0,
  lives: 3,
  toast: "",
  abilities: CLASSES.warrior.abilities.map((a) => ({ id: a.id, name: a.name, ready: 1, mana: a.mana, can: true })),
  skills: [],
  scores: loadScores(),
  settings: loadSettings(),
  targetName: "",
  targetHp: 0,
  targetMax: 0,
  inReach: false,
  combatHint: "",
  gold: 25,
  pack: emptyPack(),
  worn: emptyWorn(),
  vaultCopper: 0,
  vault: emptyVault(),
  locationId: START_ID,
  prompt: "",
  huntName: "",
  objective: "",
  training: "",
  idleLeft: 0,
  walkers: 0,
  who: [],
  chatLog: [],
  chatOpen: false,
  clock: "Morning",
  talkNpc: null,
  shopId: null,
  roster: loadRoster(),
  activeSlot: null,
  creatingSlot: null,
  accountReady: false,
  setScreen: (screen) => set({ screen, overlay: screen }),
  setOverlay: (overlay) => set({ overlay }),
  setChatOpen: (chatOpen) => set({ chatOpen }),
  pushChat: (line) => set((s) => ({ chatLog: [...s.chatLog.slice(-23), line] })),
  setName: (playerName) => set({ playerName }),
  setClass: (classId) => {
    const c = CLASSES[classId];
    set({
      classId,
      hp: c.hp,
      maxHp: c.hp,
      mp: c.mp,
      maxMp: c.mp,
      abilities: c.abilities.map((a) => ({ id: a.id, name: a.name, ready: 1, mana: a.mana, can: true })),
    });
  },
  setSettings: (s) => {
    const settings = { ...get().settings, ...s };
    saveSettings(settings);
    set({ settings });
  },
  beginCreate: (slot) => {
    set({
      creatingSlot: slot,
      activeSlot: slot,
      playerName: "",
      classId: "warrior",
    });
    const c = CLASSES.warrior;
    set({
      hp: c.hp,
      maxHp: c.hp,
      mp: c.mp,
      maxMp: c.mp,
      abilities: c.abilities.map((a) => ({ id: a.id, name: a.name, ready: 1, mana: a.mana, can: true })),
      screen: "class",
      overlay: "class",
    });
  },
  createActive: async (slot, name, classId) => {
    const trimmed = name.trim().slice(0, 18);
    if (!trimmed) return "Give them a name.";
    const roster = get().roster;
    if (nameTaken(roster, trimmed, slot)) return "That name already walks.";
    try {
      const claimed = await claimName({ data: { name: trimmed, slot } });
      if (!claimed.ok) return claimed.reason;
    } catch {
      /* local keep if the realm is dark */
    }
    const now = Date.now();
    const next = roster.slice();
    next[slot] = {
      slot,
      name: trimmed,
      classId,
      level: 1,
      xp: 0,
      score: 0,
      skills: defaultSkills(classId),
      gold: 25,
      pack: emptyPack(),
      worn: emptyWorn(),
      vaultCopper: 0,
      vault: emptyVault(),
      locationId: START_ID,
      createdAt: now,
      updatedAt: now,
    };
    saveRoster(next);
    void saveWalker({ data: { slot, walker: next[slot] } }).catch(() => {});
    set({
      roster: next,
      activeSlot: slot,
      creatingSlot: null,
      playerName: trimmed,
      classId,
    });
    return null;
  },
  selectSlot: (slot) => {
    const ch = get().roster[slot];
    if (!ch) return null;
    set({
      activeSlot: slot,
      creatingSlot: null,
      playerName: ch.name,
      classId: ch.classId,
      level: ch.level,
      score: ch.score,
    });
    return ch;
  },
  deleteSlot: (slot) => {
    const next = get().roster.slice();
    next[slot] = null;
    saveRoster(next);
    void saveWalker({ data: { slot, walker: null } }).catch(() => {});
    void releaseName({ data: { slot } }).catch(() => {});
    const activeSlot = get().activeSlot === slot ? null : get().activeSlot;
    set({ roster: next, activeSlot });
  },
  hydrateRoster: (incoming) => {
    const roster = Array.from({ length: SLOT_COUNT }, (_, i) => incoming[i] ?? null);
    saveRoster(roster);
    set({ roster, accountReady: true });
  },
  saveProgress: (p) => {
    const { activeSlot, roster, playerName, classId } = get();
    if (activeSlot == null) return;
    const cur = roster[activeSlot];
    const now = Date.now();
    const next = roster.slice();
    next[activeSlot] = {
      slot: activeSlot,
      name: cur?.name ?? playerName,
      classId: cur?.classId ?? classId,
      level: p.level,
      xp: p.xp,
      score: p.score,
      skills: cloneSkills(p.skills),
      gold: p.gold,
      pack: p.pack.map((s) => ({ ...s })),
      worn: { ...p.worn },
      vaultCopper: p.vaultCopper,
      vault: p.vault.map((s) => (s ? { ...s } : null)),
      locationId: p.locationId,
      createdAt: cur?.createdAt ?? now,
      updatedAt: now,
    };
    saveRoster(next);
    void saveWalker({ data: { slot: activeSlot, walker: next[activeSlot] } }).catch(() => {});
    set({ roster: next });
  },
  recordScore: () => {
    const g = get();
    const scores = submitScore({
      name: g.playerName.trim() || "Adventurer",
      classId: g.classId,
      level: g.level,
      score: g.score,
      date: Date.now(),
    });
    set({ scores });
  },
  pulse: (partial) => set(partial),
}));
