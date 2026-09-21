/** Active localStorage keys for character + quest persistence (guest or account slot). */

/** Original guest keys (kept for offline playtests). */
export const GUEST_CHARACTER_KEY = "vale-character-v1";
export const GUEST_QUEST_KEY = "vale-quests-v1";

let activeCharacterKey = GUEST_CHARACTER_KEY;
let activeQuestKey = GUEST_QUEST_KEY;

export function getActiveCharacterKey(): string {
  return activeCharacterKey;
}

export function getActiveQuestKey(): string {
  return activeQuestKey;
}

/** Guest / offline play — original localStorage keys. */
export function setGuestStorage(): void {
  activeCharacterKey = GUEST_CHARACTER_KEY;
  activeQuestKey = GUEST_QUEST_KEY;
}

/** Account-scoped slot storage. */
export function setSlotStorage(userId: string, slotIndex: number): void {
  activeCharacterKey = slotCharacterKey(userId, slotIndex);
  activeQuestKey = slotQuestKey(userId, slotIndex);
}

export function slotCharacterKey(userId: string, slotIndex: number): string {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  const i = Math.max(0, Math.min(3, Math.floor(slotIndex)));
  return `vale-char:${safeUser}:${i}`;
}

export function slotQuestKey(userId: string, slotIndex: number): string {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  const i = Math.max(0, Math.min(3, Math.floor(slotIndex)));
  return `vale-quests:${safeUser}:${i}`;
}
