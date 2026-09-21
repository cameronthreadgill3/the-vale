import type { ClassId } from "@/game/classes";
import type { ValeCharacter } from "@/game/character";
import type { QuestLog } from "@/game/quests";

export const SLOT_COUNT = 4 as const;

/** Compact character slot stored in Clerk unsafeMetadata or local demo store. */
export type FilledCharacterSlot = {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  updatedAt: string;
  /** Compact ValeCharacter snapshot. */
  save: ValeCharacter;
  quests?: QuestLog;
};

export type CharacterSlot = FilledCharacterSlot | null;

export type SlotArray = [
  CharacterSlot,
  CharacterSlot,
  CharacterSlot,
  CharacterSlot,
];

export type ValeAccountUser = {
  id: string;
  email: string;
  displayName: string;
  /** true when using local demo auth (no Clerk keys). */
  demo: boolean;
};
