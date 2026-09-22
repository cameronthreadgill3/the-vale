import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { CLASS_ORDER, type ClassId } from "./classes";
import type { GroundDrop } from "./drops";

export type RealmWalker = {
  id: string;
  name: string;
  classId: ClassId;
  level: number;
  x: number;
  y: number;
  facing: number;
  hp: number;
  maxHp: number;
};

export type RealmChat = { id: number; from: string; text: string; at: number };

export type RealmPulse = {
  now: number;
  walkers: RealmWalker[];
  chat: RealmChat[];
  loot: GroundDrop[];
  online: number;
};

const CLASSES = new Set<string>(CLASS_ORDER);

function cleanName(raw: string) {
  return raw.replace(/[^\w \-']/g, "").trim().slice(0, 18);
}

function nameKey(name: string) {
  return cleanName(name).toLowerCase();
}

function asClass(raw: string): ClassId {
  return (CLASSES.has(raw) ? raw : "warrior") as ClassId;
}

const g = globalThis as typeof globalThis & { __valeRate?: Map<string, number> };

function rate(key: string, ms: number) {
  const map = (g.__valeRate ??= new Map());
  const now = Date.now();
  const last = map.get(key) ?? 0;
  if (now - last < ms) return false;
  map.set(key, now);
  return true;
}

export const claimName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string; slot: number }) => data)
  .handler(async ({ context, data }) => {
    const name = cleanName(data.name);
    if (name.length < 2) return { ok: false as const, reason: "Give them a name." };
    const key = nameKey(name);
    const slot = Math.max(0, Math.min(3, Math.floor(Number(data.slot) || 0)));
    const sql = await getSql();
    const mine = await sql<{ name_key: string }>`
      select name_key from realm_names
      where user_id = ${context.userId} and slot = ${slot}
    `;
    if (mine[0]?.name_key === key) return { ok: true as const };
    const taken = await sql<{ user_id: string }>`
      select user_id from realm_names where name_key = ${key}
    `;
    if (taken[0] && taken[0].user_id !== context.userId) {
      return { ok: false as const, reason: "That name already walks the realm." };
    }
    await sql`
      delete from realm_names where user_id = ${context.userId} and slot = ${slot}
    `;
    try {
      await sql.query(
        `insert into realm_names (name_key, name, user_id, slot)
         values ($1, $2, $3, $4)`,
        [key, name, context.userId, slot],
      );
    } catch {
      return { ok: false as const, reason: "That name already walks the realm." };
    }
    return { ok: true as const };
  });

export const releaseName = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { slot: number }) => data)
  .handler(async ({ context, data }) => {
    const slot = Math.max(0, Math.min(3, Math.floor(Number(data.slot) || 0)));
    const sql = await getSql();
    await sql`delete from realm_names where user_id = ${context.userId} and slot = ${slot}`;
    return { ok: true as const };
  });

export const heartbeat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      sessionId: string;
      locationId: string;
      name: string;
      classId: ClassId;
      level: number;
      x: number;
      y: number;
      facing: number;
      hp: number;
      maxHp: number;
    }) => data,
  )
  .handler(async ({ context, data }): Promise<RealmPulse> => {
    const sql = await getSql();
    const sessionId = String(data.sessionId || "").slice(0, 40) || "w";
    const locationId = String(data.locationId || "thornhearth").slice(0, 64);
    const name = cleanName(data.name) || "Walker";
    await sql`delete from realm_presence where seen_at < now() - interval '12 seconds'`;
    if (rate(`hb:${context.userId}`, 180)) {
      await sql.query(
        `insert into realm_presence
          (session_id, user_id, name, class_id, level, location_id, x, y, facing, hp, max_hp, seen_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now())
         on conflict (session_id) do update set
           user_id = excluded.user_id,
           name = excluded.name,
           class_id = excluded.class_id,
           level = excluded.level,
           location_id = excluded.location_id,
           x = excluded.x,
           y = excluded.y,
           facing = excluded.facing,
           hp = excluded.hp,
           max_hp = excluded.max_hp,
           seen_at = now()`,
        [
          sessionId,
          context.userId,
          name,
          asClass(data.classId),
          Math.max(1, Math.floor(Number(data.level) || 1)),
          locationId,
          Number(data.x) || 0,
          Number(data.y) || 0,
          Number(data.facing) || 0,
          Number(data.hp) || 1,
          Number(data.maxHp) || 1,
        ],
      );
    }

    const walkers = await sql<{
      session_id: string;
      name: string;
      class_id: string;
      level: number;
      x: number;
      y: number;
      facing: number;
      hp: number;
      max_hp: number;
    }>`
      select session_id, name, class_id, level, x, y, facing, hp, max_hp
      from realm_presence
      where location_id = ${locationId}
        and session_id <> ${sessionId}
        and seen_at > now() - interval '8 seconds'
    `;

    const chat = await sql<{ id: number; from_name: string; body: string; at: string | Date }>`
      select id, from_name, body, at
      from realm_chat
      where location_id = ${locationId}
      order by id desc
      limit 24
    `;

    const loot = await sql<{
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
      where location_id = ${locationId} and expires_at > now()
    `;

    const count = await sql<{ n: number }>`
      select count(*)::int as n from realm_presence
      where seen_at > now() - interval '8 seconds'
    `;

    return {
      now: Date.now(),
      online: Number(count[0]?.n ?? walkers.length + 1),
      walkers: walkers.map((w) => ({
        id: w.session_id,
        name: w.name,
        classId: asClass(w.class_id),
        level: Number(w.level) || 1,
        x: Number(w.x) || 0,
        y: Number(w.y) || 0,
        facing: Number(w.facing) || 0,
        hp: Number(w.hp) || 1,
        maxHp: Number(w.max_hp) || 1,
      })),
      chat: chat
        .slice()
        .reverse()
        .map((c) => ({
          id: Number(c.id),
          from: c.from_name,
          text: c.body,
          at: new Date(c.at).getTime(),
        })),
      loot: loot.map((r) => ({
        id: r.id,
        locationId: r.location_id,
        x: Number(r.x),
        y: Number(r.y),
        item: r.item,
        qty: Number(r.qty) || 1,
        gold: Number(r.gold) || 0,
        expires: new Date(r.expires_at).getTime(),
      })),
    };
  });

export const sayInRealm = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { locationId: string; text: string; name: string }) => data)
  .handler(async ({ context, data }) => {
    if (!rate(`say:${context.userId}`, 1200)) {
      return { ok: false as const, reason: "Wait a breath." };
    }
    const text = data.text.trim().slice(0, 80);
    if (!text) return { ok: false as const, reason: "Say something." };
    const sql = await getSql();
    const locationId = String(data.locationId || "").slice(0, 64);
    const from = cleanName(data.name) || "Walker";
    const rows = await sql<{ id: number; at: string | Date }>`
      insert into realm_chat (location_id, from_name, body)
      values (${locationId}, ${from}, ${text})
      returning id, at
    `;
    await sql`delete from realm_chat where at < now() - interval '2 hours'`;
    const r = rows[0];
    return {
      ok: true as const,
      line: {
        id: Number(r?.id ?? 0),
        from,
        text,
        at: r ? new Date(r.at).getTime() : Date.now(),
      } satisfies RealmChat,
    };
  });

export const leavePresence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { sessionId: string }) => data)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`
      delete from realm_presence
      where session_id = ${data.sessionId} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });
