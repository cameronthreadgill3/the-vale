import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { VAULTS, type Vault } from "@/canon/catalog";
import { cleanHandle, mergeHandles, toPayBoard, type PayBoard, type PayHandles } from "@/lib/pay";

export type Membership = {
  member: boolean;
  voices: boolean;
  anime: boolean;
  status: string;
  innkeeper: boolean;
  houseClaimed: boolean;
  periodEnd: string | null;
  voicesEnd: string | null;
  animeEnd: string | null;
};

function toIso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === "string" && value.trim()) {
    const t = Date.parse(value);
    return Number.isNaN(t) ? null : new Date(t).toISOString();
  }
  return null;
}

function stillOpen(end: string | null): boolean {
  if (!end) return false;
  const t = Date.parse(end);
  if (Number.isNaN(t)) return false;
  return t > Date.now();
}

function stillActive(status: string, periodEnd: string | null): boolean {
  if (status !== "active") return false;
  if (!periodEnd) return true;
  return stillOpen(periodEnd);
}

function parseVault(raw: unknown): Vault {
  if (raw === "voices" || raw === "anime" || raw === "kettle") return raw;
  return "kettle";
}

async function mintCode(vault: Vault) {
  const { randomBytes } = await import("node:crypto");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let raw = "";
  for (const b of bytes) raw += alphabet[b % alphabet.length];
  return `${VAULTS[vault].prefix}-${raw.slice(0, 4)}-${raw.slice(4)}`;
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function extendEnd(from: string | null, months: number) {
  const now = Date.now();
  const current = from ? Date.parse(from) : Number.NaN;
  const base = !Number.isNaN(current) && current > now ? current : now;
  return new Date(base + months * 30 * 24 * 60 * 60 * 1000).toISOString();
}

function later(a: string | null, b: string | null) {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

async function isInnkeeper(userId: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`
    select user_id from kettle_keepers where user_id = ${userId} limit 1
  `;
  return Boolean(rows[0]);
}

async function currentEnds(userId: string) {
  const sql = await getSql();
  const rows = await sql<{
    status: string;
    period_end: unknown;
    voices_end: unknown;
    anime_end: unknown;
  }>`
    select status, period_end, voices_end, anime_end from subscribers where user_id = ${userId}
  `;
  const row = rows[0];
  return {
    status: row?.status ?? "none",
    kettle: toIso(row?.period_end),
    voices: toIso(row?.voices_end),
    anime: toIso(row?.anime_end),
  };
}

async function grantVault(userId: string, vault: Vault, months: number) {
  const sql = await getSql();
  const cur = await currentEnds(userId);
  let kettle = cur.kettle;
  let voices = cur.voices;
  let anime = cur.anime;
  if (vault === "kettle") {
    kettle = extendEnd(cur.kettle, months);
    voices = later(cur.voices, kettle);
    anime = later(cur.anime, kettle);
  } else if (vault === "voices") {
    voices = extendEnd(cur.voices, months);
  } else {
    anime = extendEnd(cur.anime, months);
  }
  await sql`
    insert into subscribers (user_id, status, period_end, voices_end, anime_end)
    values (${userId}, 'active', ${kettle}::timestamptz, ${voices}::timestamptz, ${anime}::timestamptz)
    on conflict (user_id) do update
      set status = 'active',
          period_end = excluded.period_end,
          voices_end = excluded.voices_end,
          anime_end = excluded.anime_end
  `;
  return { kettle, voices, anime };
}

export const getMembership = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Membership> => {
    try {
      const sql = await getSql();
      const [subs, keepers, house] = await Promise.all([
        sql<{ status: string; period_end: unknown; voices_end: unknown; anime_end: unknown }>`
          select status, period_end, voices_end, anime_end from subscribers where user_id = ${context.userId}
        `,
        sql<{ user_id: string }>`
          select user_id from kettle_keepers where user_id = ${context.userId} limit 1
        `,
        sql<{ n: number }>`select count(*)::int as n from kettle_keepers`,
      ]);
      const row = subs[0];
      const periodEnd = toIso(row?.period_end);
      const voicesEnd = toIso(row?.voices_end);
      const animeEnd = toIso(row?.anime_end);
      const innkeeper = Boolean(keepers[0]);
      const status = row?.status ?? "none";
      const member = innkeeper || stillActive(status, periodEnd);
      return {
        member,
        voices: member || stillOpen(voicesEnd),
        anime: member || stillOpen(animeEnd),
        status: innkeeper ? "innkeeper" : status,
        innkeeper,
        houseClaimed: (house[0]?.n ?? 0) > 0,
        periodEnd,
        voicesEnd,
        animeEnd,
      };
    } catch {
      return {
        member: false,
        voices: false,
        anime: false,
        status: "none",
        innkeeper: false,
        houseClaimed: false,
        periodEnd: null,
        voicesEnd: null,
        animeEnd: null,
      };
    }
  });

export type ClaimResult =
  | { ok: true; already: boolean }
  | { ok: false; reason: "taken" };

export const claimInnkeeper = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<ClaimResult> => {
    const sql = await getSql();
    const mine = await sql<{ user_id: string }>`
      select user_id from kettle_keepers where user_id = ${context.userId} limit 1
    `;
    if (mine[0]) return { ok: true, already: true };
    try {
      await sql`
        insert into kettle_keepers (slot, user_id) values (1, ${context.userId})
      `;
    } catch {
      return { ok: false, reason: "taken" };
    }
    const far = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();
    await sql`
      insert into subscribers (user_id, status, period_end, voices_end, anime_end)
      values (${context.userId}, 'active', ${far}::timestamptz, ${far}::timestamptz, ${far}::timestamptz)
      on conflict (user_id) do update
        set status = 'active',
            period_end = excluded.period_end,
            voices_end = excluded.voices_end,
            anime_end = excluded.anime_end
    `;
    return { ok: true, already: false };
  });

export type MintResult = { ok: true; code: string; vault: Vault } | { ok: false; reason: "not_keeper" };

export const mintKettleKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { vault?: string } | Vault | undefined) => {
    if (typeof input === "string") return { vault: parseVault(input) };
    return { vault: parseVault(input?.vault) };
  })
  .handler(async ({ context, data }): Promise<MintResult> => {
    if (!(await isInnkeeper(context.userId))) return { ok: false, reason: "not_keeper" };
    const sql = await getSql();
    for (let i = 0; i < 6; i += 1) {
      const code = await mintCode(data.vault);
      try {
        await sql`
          insert into kettle_keys (code, months, vault, created_by)
          values (${code}, 1, ${data.vault}, ${context.userId})
        `;
        return { ok: true, code, vault: data.vault };
      } catch {
        // unique collision — try again
      }
    }
    throw new Error("could not mint a key");
  });

export type KettleKeyRow = {
  code: string;
  months: number;
  vault: Vault;
  redeemed: boolean;
  createdAt: string;
  redeemedAt: string | null;
};

export const listKettleKeys = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<KettleKeyRow[]> => {
    if (!(await isInnkeeper(context.userId))) return [];
    const sql = await getSql();
    const rows = await sql<{
      code: string;
      months: number;
      vault: string | null;
      redeemed_by: string | null;
      created_at: unknown;
      redeemed_at: unknown;
    }>`
      select code, months, vault, redeemed_by, created_at, redeemed_at
      from kettle_keys
      where created_by = ${context.userId}
      order by created_at desc
    `;
    return rows.map((row) => ({
      code: row.code,
      months: row.months,
      vault: parseVault(row.vault),
      redeemed: Boolean(row.redeemed_by),
      createdAt: toIso(row.created_at) ?? "",
      redeemedAt: toIso(row.redeemed_at),
    }));
  });

export type RedeemResult =
  | { ok: true; vault: Vault; periodEnd: string | null; voicesEnd: string | null; animeEnd: string | null }
  | { ok: false; reason: "invalid" | "used" };

export const redeemKettleKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((code: string) => normalizeCode(code))
  .handler(async ({ context, data: code }): Promise<RedeemResult> => {
    if (!code || code.length < 8) return { ok: false, reason: "invalid" };
    const sql = await getSql();
    const rows = await sql<{
      code: string;
      months: number;
      vault: string | null;
      redeemed_by: string | null;
    }>`
      select code, months, vault, redeemed_by from kettle_keys where code = ${code} limit 1
    `;
    const key = rows[0];
    if (!key) return { ok: false, reason: "invalid" };
    if (key.redeemed_by) return { ok: false, reason: "used" };

    const taken = await sql<{ code: string }>`
      update kettle_keys
      set redeemed_by = ${context.userId}, redeemed_at = now()
      where code = ${code} and redeemed_by is null
      returning code
    `;
    if (!taken[0]) return { ok: false, reason: "used" };

    const vault = parseVault(key.vault);
    const ends = await grantVault(context.userId, vault, key.months || 1);
    return {
      ok: true,
      vault,
      periodEnd: ends.kettle,
      voicesEnd: ends.voices,
      animeEnd: ends.anime,
    };
  });

export const getPayLinks = createServerFn({ method: "GET" }).handler(async (): Promise<PayBoard> => {
  try {
    const sql = await getSql();
    const rows = await sql<{
      paypal: string | null;
      cash_app: string | null;
      venmo: string | null;
      kofi: string | null;
      patreon: string | null;
    }>`
      select paypal, cash_app, venmo, kofi, patreon from kettle_keepers where slot = 1 limit 1
    `;
    const row = rows[0];
    return toPayBoard(
      mergeHandles({
        paypal: row?.paypal ?? "",
        cashApp: row?.cash_app ?? "",
        venmo: row?.venmo ?? "",
        kofi: row?.kofi ?? "",
        patreon: row?.patreon ?? "",
      }),
    );
  } catch {
    return toPayBoard(undefined);
  }
});

export const getPayHandles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<PayHandles> => {
    if (!(await isInnkeeper(context.userId))) return mergeHandles(undefined);
    const sql = await getSql();
    const rows = await sql<{
      paypal: string | null;
      cash_app: string | null;
      venmo: string | null;
      kofi: string | null;
      patreon: string | null;
    }>`
      select paypal, cash_app, venmo, kofi, patreon from kettle_keepers where user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    return mergeHandles({
      paypal: row?.paypal ?? "",
      cashApp: row?.cash_app ?? "",
      venmo: row?.venmo ?? "",
      kofi: row?.kofi ?? "",
      patreon: row?.patreon ?? "",
    });
  });

export const setPayHandles = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Partial<PayHandles>) => ({
    paypal: cleanHandle(input?.paypal, "paypal"),
    cashApp: cleanHandle(input?.cashApp, "cashApp"),
    venmo: cleanHandle(input?.venmo, "venmo"),
    kofi: cleanHandle(input?.kofi, "kofi"),
    patreon: cleanHandle(input?.patreon, "patreon"),
  }))
  .handler(async ({ context, data }): Promise<{ ok: true } | { ok: false; reason: "not_keeper" }> => {
    if (!(await isInnkeeper(context.userId))) return { ok: false, reason: "not_keeper" };
    const sql = await getSql();
    await sql`
      update kettle_keepers
      set paypal = ${data.paypal || null},
          cash_app = ${data.cashApp || null},
          venmo = ${data.venmo || null},
          kofi = ${data.kofi || null},
          patreon = ${data.patreon || null}
      where user_id = ${context.userId}
    `;
    return { ok: true };
  });
