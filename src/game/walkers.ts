import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { SLOT_COUNT, type CharacterSave } from "./save";

function asWalker(raw: unknown): CharacterSave | null {
  if (!raw) return null;
  const value = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
  if (!value || typeof value !== "object") return null;
  return value as CharacterSave;
}

export const listWalkers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ slot: number; payload: unknown }>`
      select slot, payload from walker_slots
      where user_id = ${context.userId}
      order by slot
    `;
    const slots: (CharacterSave | null)[] = Array.from({ length: SLOT_COUNT }, () => null);
    for (const row of rows) {
      const i = Number(row.slot);
      if (i < 0 || i >= SLOT_COUNT) continue;
      slots[i] = asWalker(row.payload);
    }
    return slots;
  });

export const saveWalker = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { slot: number; walker: CharacterSave | null }) => data)
  .handler(async ({ context, data }) => {
    const slot = Math.max(0, Math.min(SLOT_COUNT - 1, Math.floor(Number(data.slot))));
    const sql = await getSql();
    if (!data.walker) {
      await sql`
        delete from walker_slots
        where user_id = ${context.userId} and slot = ${slot}
      `;
      return { ok: true as const };
    }
    const payload = JSON.stringify({ ...data.walker, slot });
    await sql.query(
      `insert into walker_slots (user_id, slot, payload, updated_at)
       values ($1, $2, $3::jsonb, now())
       on conflict (user_id, slot) do update set
         payload = excluded.payload,
         updated_at = now()`,
      [context.userId, slot, payload],
    );
    return { ok: true as const };
  });
