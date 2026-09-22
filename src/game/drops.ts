import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";

export type GroundDrop = {
  id: string;
  locationId: string;
  x: number;
  y: number;
  item: string | null;
  qty: number;
  gold: number;
  expires: number;
};

export const listGroundLoot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { locationId: string }) => data)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      location_id: string;
      x: number;
      y: number;
      item: string | null;
      qty: number;
      gold: number;
      expires_at: string | Date;
    }>`
      select id, location_id, x, y, item, qty, gold, expires_at
      from ground_loot
      where location_id = ${data.locationId} and expires_at > now()
    `;
    return rows.map((r) => ({
      id: r.id,
      locationId: r.location_id,
      x: Number(r.x),
      y: Number(r.y),
      item: r.item,
      qty: Number(r.qty) || 1,
      gold: Number(r.gold) || 0,
      expires: new Date(r.expires_at).getTime(),
    })) satisfies GroundDrop[];
  });

export const postGroundLoot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: GroundDrop) => data)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const expires = new Date(data.expires).toISOString();
    await sql.query(
      `insert into ground_loot (id, location_id, x, y, item, qty, gold, expires_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz)
       on conflict (id) do nothing`,
      [data.id, data.locationId, Math.round(data.x), Math.round(data.y), data.item, data.qty, data.gold, expires],
    );
    return { ok: true as const };
  });

export const takeGroundLoot = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      location_id: string;
      x: number;
      y: number;
      item: string | null;
      qty: number;
      gold: number;
      expires_at: string | Date;
    }>`
      delete from ground_loot
      where id = ${data.id} and expires_at > now()
      returning id, location_id, x, y, item, qty, gold, expires_at
    `;
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id,
      locationId: r.location_id,
      x: Number(r.x),
      y: Number(r.y),
      item: r.item,
      qty: Number(r.qty) || 1,
      gold: Number(r.gold) || 0,
      expires: new Date(r.expires_at).getTime(),
    } satisfies GroundDrop;
  });
