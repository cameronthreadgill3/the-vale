import { PRICE, VAULTS, type Vault } from "@/canon/catalog";

export type PayKind = "paypal" | "cashApp" | "venmo" | "kofi" | "patreon";

export type PayHandles = Record<PayKind, string>;

export type PayLinks = Record<PayKind, string | null>;

export type PayBoard = Record<Vault, PayLinks>;

export const EMPTY_HANDLES: PayHandles = { paypal: "", cashApp: "", venmo: "", kofi: "", patreon: "" };

/** House rails. Venmo + official Patreon join link. */
export const DEFAULT_HANDLES: PayHandles = {
  paypal: "",
  cashApp: "",
  venmo: "Cameron-Threadgill-1",
  kofi: "",
  patreon: "AStoryasOldasTime",
};

export const PAY_ORDER: PayKind[] = ["patreon", "venmo", "paypal", "cashApp", "kofi"];

const HOST: Record<PayKind, string[]> = {
  paypal: ["paypal.me", "paypal.com"],
  cashApp: ["cash.app"],
  venmo: ["venmo.com"],
  kofi: ["ko-fi.com"],
  patreon: ["patreon.com"],
};

const RESERVED_PATREON = new Set([
  "posts",
  "membership",
  "join",
  "login",
  "home",
  "user",
  "explore",
  "search",
  "checkout",
  "settings",
  "messages",
  "notifications",
  "library",
  "studio",
  "published",
  "drafts",
  "create",
]);

export function cleanHandle(raw: unknown, kind: PayKind): string {
  if (typeof raw !== "string") return "";
  let value = raw.trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, "").toLowerCase();
      if (!HOST[kind].some((h) => host === h || host.endsWith(`.${h}`))) return "";
      const parts = url.pathname.split("/").filter(Boolean);
      if (kind === "venmo" && parts[0]?.toLowerCase() === "u") value = parts[1] ?? "";
      else if (kind === "paypal" && parts[0]?.toLowerCase() === "paypalme") value = parts[1] ?? "";
      else if (kind === "patreon" && (parts[0]?.toLowerCase() === "c" || parts[0]?.toLowerCase() === "cw")) {
        value = parts[1] ?? "";
      } else if (kind === "patreon" && RESERVED_PATREON.has((parts[0] ?? "").toLowerCase())) {
        return "";
      } else value = parts[0] ?? "";
    } catch {
      return "";
    }
  }

  value = value.replace(/^[@$]/, "").replace(/\/.*$/, "");
  if (!/^[A-Za-z0-9._-]{2,32}$/.test(value)) return "";
  if (kind === "patreon" && RESERVED_PATREON.has(value.toLowerCase())) return "";
  return value;
}

export function mergeHandles(row?: Partial<PayHandles> | null): PayHandles {
  return {
    paypal: row?.paypal?.trim() || DEFAULT_HANDLES.paypal,
    cashApp: row?.cashApp?.trim() || DEFAULT_HANDLES.cashApp,
    venmo: row?.venmo?.trim() || DEFAULT_HANDLES.venmo,
    kofi: row?.kofi?.trim() || DEFAULT_HANDLES.kofi,
    patreon: row?.patreon?.trim() || DEFAULT_HANDLES.patreon,
  };
}

export function payUrl(
  kind: PayKind,
  handle: string | null | undefined,
  dollars: number = PRICE.dollars,
): string | null {
  const name = handle?.trim();
  if (!name) return null;
  const note = encodeURIComponent(`A Story as Old as Time — $${dollars} month`);
  if (kind === "paypal") return `https://www.paypal.com/paypalme/${encodeURIComponent(name)}/${dollars}`;
  if (kind === "cashApp") return `https://cash.app/$${encodeURIComponent(name)}/${dollars}`;
  if (kind === "venmo") {
    return `https://venmo.com/u/${encodeURIComponent(name)}?txn=pay&amount=${dollars}&note=${note}`;
  }
  if (kind === "patreon") return `https://www.patreon.com/c/${encodeURIComponent(name)}`;
  return `https://ko-fi.com/${encodeURIComponent(name)}`;
}

export function toPayLinks(
  handles: Partial<PayHandles> | null | undefined,
  dollars: number = PRICE.dollars,
): PayLinks {
  const merged = mergeHandles(handles);
  return {
    paypal: payUrl("paypal", merged.paypal, dollars),
    cashApp: payUrl("cashApp", merged.cashApp, dollars),
    venmo: payUrl("venmo", merged.venmo, dollars),
    kofi: payUrl("kofi", merged.kofi, dollars),
    patreon: payUrl("patreon", merged.patreon, dollars),
  };
}

export function toPayBoard(handles: Partial<PayHandles> | null | undefined): PayBoard {
  return {
    kettle: toPayLinks(handles, VAULTS.kettle.dollars),
    voices: toPayLinks(handles, VAULTS.voices.dollars),
    anime: toPayLinks(handles, VAULTS.anime.dollars),
  };
}

export function hasAnyPayLink(links: PayLinks | null | undefined) {
  if (!links) return false;
  return Boolean(links.paypal || links.cashApp || links.venmo || links.kofi || links.patreon);
}
