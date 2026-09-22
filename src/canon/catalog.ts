export type Access = "free" | "member" | "voices" | "anime";

export type Chapter = {
  slug: string;
  book: 1 | 2;
  n: number;
  title: string;
  access: Access;
  driveId?: string;
};

export const BOOK1: Chapter[] = [
  { slug: "b1-c01", book: 1, n: 1, title: "The Accession", access: "free", driveId: "1n2uwIfL5ITmLIlmMUBVnfKRhhiNANrG2pmc87AHm-3o" },
  { slug: "b1-c02", book: 1, n: 2, title: "Teeth in the Grass", access: "free", driveId: "10AtccyPBlQ26eyk6iYL-dQJsWk0wcQaFLrF0AlUTdpo" },
  { slug: "b1-c03", book: 1, n: 3, title: "The Shape of Mana", access: "free", driveId: "1XhgB9wh2qudCVhFIUKVFg6kZEr-esX53G6Lwf4_-89I" },
  { slug: "b1-c04", book: 1, n: 4, title: "The First Choice", access: "free", driveId: "12ehFVpggXfDCJPiwS_9ErG1JEs8-_eugTyNKDt84M-U" },
  { slug: "b1-c05", book: 1, n: 5, title: "Too Much", access: "free", driveId: "1RmE-waZ8rwX-SiQysC9I66s9Qff5FBFV4je-4dQnBZY" },
  { slug: "b1-c06", book: 1, n: 6, title: "First Meat", access: "free", driveId: "1nDc7BPPwgkvR9JtpHAXk3xXFrHzYcpaZ609pgR_MJxs" },
  { slug: "b1-c07", book: 1, n: 7, title: "Lines in the Grass", access: "free", driveId: "1dDE0CYn6o2oMR2Net7E968y3hfeE24_Prv6cd9qDPro" },
  { slug: "b1-c08", book: 1, n: 8, title: "Without a Teacher", access: "free", driveId: "148kePSZQHiIerCHXUbwuE3IBCxDv-tnGjHkHC08pJEI" },
  { slug: "b1-c09", book: 1, n: 9, title: "The Longer Road", access: "free", driveId: "11pYCCFfxIeTAvMknAFTp8fFvUufHCPIAyVgDpjNHX7w" },
  { slug: "b1-c10", book: 1, n: 10, title: "A Weapon Worth Keeping", access: "free", driveId: "1xz_2QPdHW8-tV8SaFo5gbC6gC4v2auu0rlFygW8EPTc" },
  { slug: "b1-c11", book: 1, n: 11, title: "The Wrong Prey", access: "free", driveId: "1cdruy6TuIuaQf57QAMyiBHMbbyEI-e40nug8eLLA5gI" },
  { slug: "b1-c12", book: 1, n: 12, title: "The Road Beneath", access: "free", driveId: "1AwmCyKuH5uAtRsmUP2a1iXoQTidWSWLO7C7aoySRB_k" },
  { slug: "b1-c13", book: 1, n: 13, title: "What the Road Remembered", access: "free", driveId: "1dGFKDuevpuTS4YYk0D9uaUPnQQO0hQRydNfoNDzovFk" },
  { slug: "b1-c14", book: 1, n: 14, title: "The Shape of a Path", access: "free", driveId: "1E8vI4ckTUgg-Uib9cDxt_Vq2KrOS3cFFc_8sM6-p968" },
  { slug: "b1-c15", book: 1, n: 15, title: "Lines Between Fires", access: "free", driveId: "1q4BGrGNyIk2piunXw8qQi7Q_Nwejd6v7CguSwgKsCVg" },
  { slug: "b1-c16", book: 1, n: 16, title: "The Price of a Trail", access: "free", driveId: "1_vIwTSLsW8-XRqZSdmgxAvm1ee2oLEQTBddKGz0bfVc" },
  { slug: "b1-c17", book: 1, n: 17, title: "Beneath Shiverstone", access: "free", driveId: "1N6f6xm1a3Ab4KRTxasocdusl8_WTTCCdixo7hljjvrA" },
  { slug: "b1-c18", book: 1, n: 18, title: "The First Descent", access: "free", driveId: "1bE_COu1lOHPr8jVtrjZqoi7XO7oDmJhAUdoUDyWpFss" },
  { slug: "b1-c19", book: 1, n: 19, title: "The Cost Below", access: "free", driveId: "1DYV2bBHVuu_oxJbBKwiNLxqWJxysSKQCm3Z9ZhfTMu8" },
  { slug: "b1-c20", book: 1, n: 20, title: "The Space Between Steps", access: "free", driveId: "18BXRw_HEHCTbLmYj4VMsAWwq18jL4ZgG61MCBjJTvVU" },
  { slug: "b1-c21", book: 1, n: 21, title: "The Root That Drinks", access: "free", driveId: "1poOx3EOUhdHkPuJcCDweBoe501a6XlLNV23adjvu0cI" },
  { slug: "b1-c22", book: 1, n: 22, title: "The Narrow Moment", access: "free", driveId: "1UDPcX47GW326r9MRhePX2Ne4nVd_jY_uiIFtr_GtEOk" },
  { slug: "b1-c23", book: 1, n: 23, title: "What the Roots Keep", access: "free", driveId: "1wvZ7_mxnGDlJQsFmdAKvuLLH8m1DKHGJo2wErygsDBU" },
  { slug: "b1-c24", book: 1, n: 24, title: "The Load That Moves", access: "free", driveId: "17zVv7Kq0U1-ptdToBlW0UniMkuZo3FVAK5Hgc7vQkyM" },
  { slug: "b1-c25", book: 1, n: 25, title: "The Price of Glass", access: "free", driveId: "1NmN4jrx8J4WbQupU3_y2bsUVj5AQYUbQNcov4O2X1bk" },
  { slug: "b1-c26", book: 1, n: 26, title: "What Travels", access: "free", driveId: "12exkIDRZVMucF76Kptq5WcyTUlthh-ff7QC3HZQxTuo" },
  { slug: "b1-c27", book: 1, n: 27, title: "The Ground Between", access: "free", driveId: "1_bGBm33OmgBZo5WLtoclhVrI-W2qHS2Wj9COaPSYwYQ" },
  { slug: "b1-c28", book: 1, n: 28, title: "The Reach of a Spear", access: "free", driveId: "1jPuyl2kzatQMMtWYFGk6L30MjRwIf9l88oQapU_eIH0" },
  { slug: "b1-c29", book: 1, n: 29, title: "Where the Road Vanishes", access: "free", driveId: "1xHQDYDBe-zf7xLc64N_frvbAFHb1jaJWl3HqfiGRJmc" },
  { slug: "b1-c30", book: 1, n: 30, title: "The Line Behind You", access: "free", driveId: "1-KKkP4NWjmVmkeYu7LpziBMbbJ9-xBktxKzSg6Ag06I" },
  { slug: "b1-c31", book: 1, n: 31, title: "What Still Points Home", access: "free", driveId: "16jwR0F3eGoW9E_xrhDRYoOlAP1izHm-P7xeGZX8ftBQ" },
  { slug: "b1-c32", book: 1, n: 32, title: "The Measure That Holds", access: "free", driveId: "1aXvhSg-o0L8ze9Kc7JOF3VxIMsv8FH9xezsbNLrCeFQ" },
  { slug: "b1-c33", book: 1, n: 33, title: "The Distance Between Levels", access: "free", driveId: "1jANLdwULyx17iVgz4v_-j1Q_7CYzsiuwz_zb02zyFiY" },
  { slug: "b1-c34", book: 1, n: 34, title: "The Shape of an Answer", access: "free", driveId: "1KWrBxpLiqHl9EB39ApgWMbY6tWSVDtgoeEcVz0d2v6c" },
  { slug: "b1-c35", book: 1, n: 35, title: "The Road That Chooses", access: "free", driveId: "1fkmSvete8zOMj3o7_ttzwhpVn8VcN4Mt20YNolw9LXk" },
];

export const BOOK2: Chapter[] = [
  { slug: "b2-c01", book: 2, n: 1, title: "A Spear That Stayed Broken", access: "member", driveId: "1IFIO1XVTx5iyHAfOg6qsBWg7DNWtSocTtp9iFkD0fdo" },
  { slug: "b2-c02", book: 2, n: 2, title: "The Map Gets Larger", access: "member", driveId: "1_hE3bEeJGEWtiZ6GI36TE-msrC_x75TFEe6Lp_l_G-E" },
  { slug: "b2-c03", book: 2, n: 3, title: "What a Weapon Remembers", access: "member", driveId: "1dplKhl_4IKhvOa9VXmqyGwSwOKN_BajtJZmjMnJEG-U" },
  { slug: "b2-c04", book: 2, n: 4, title: "West on the Old Road", access: "member", driveId: "14gtQ0QX9lDAwL5XcYzSfroWKP2VXWZx-xLbfklA9jU0" },
];

export type MediaKind = "anime" | "comic" | "audio";

export type MediaItem = {
  id: string;
  slug: string;
  title: string;
  kind: MediaKind;
  access: Access;
  note: string;
  still?: string;
};

const BOOK1_BEATS: { slug: string; title: string; note: string; still?: string }[] = [
  { slug: "b1-c01", title: "The Accession", note: "The yard. The blink. Basin Grass.", still: "/house/accession.jpg" },
  { slug: "b1-c02", title: "Teeth in the Grass", note: "Needle Rats. Bark Hounds.", still: "/house/hounds.jpg" },
  { slug: "b1-c03", title: "The Shape of Mana", note: "A current under the water." },
  { slug: "b1-c04", title: "The First Choice", note: "Mana Spearman. The six, wearing new words." },
  { slug: "b1-c05", title: "Too Much", note: "Over-reinforcement. A grazer charge." },
  { slug: "b1-c06", title: "First Meat", note: "Funnel. Hide. Liver." },
  { slug: "b1-c07", title: "Lines in the Grass", note: "Hearth. Ironbound. Freewalkers.", still: "/house/hearth.jpg" },
  { slug: "b1-c08", title: "Without a Teacher", note: "A charcoal line on ashwood." },
  { slug: "b1-c09", title: "The Longer Road", note: "Ridgeclaw. Relative difficulty." },
  { slug: "b1-c10", title: "A Weapon Worth Keeping", note: "Channelwood Spear." },
  { slug: "b1-c11", title: "The Wrong Prey", note: "Stonehide Ravager." },
  { slug: "b1-c12", title: "The Road Beneath", note: "Worked stone. Unrecognized language.", still: "/house/sunken.jpg" },
  { slug: "b1-c13", title: "What the Road Remembered", note: "Weathered Gateway. Three lines." },
  { slug: "b1-c14", title: "The Shape of a Path", note: "Explorer. Field Record." },
  { slug: "b1-c15", title: "Lines Between Fires", note: "Lowbank. Stonefield. Roads that do not charge." },
  { slug: "b1-c16", title: "The Price of a Trail", note: "Cairns, not claims." },
  { slug: "b1-c17", title: "Beneath Shiverstone", note: "A quarry becomes a hollow." },
  { slug: "b1-c18", title: "The First Descent", note: "Glassroot Depths." },
  { slug: "b1-c19", title: "The Cost Below", note: "Permanent death. Rachel Moore." },
  { slug: "b1-c20", title: "The Space Between Steps", note: "Mana Step. Footing." },
  { slug: "b1-c21", title: "The Root That Drinks", note: "Glasswaste showing through.", still: "/house/glasswaste.jpg" },
  { slug: "b1-c22", title: "The Narrow Moment", note: "Timing, not power." },
  { slug: "b1-c23", title: "What the Roots Keep", note: "The Vale closed this gate." },
  { slug: "b1-c24", title: "The Load That Moves", note: "Ships. Current. Weight." },
  { slug: "b1-c25", title: "The Price of Glass", note: "Broodmother. Glass that drinks.", still: "/house/glasswaste.jpg" },
  { slug: "b1-c26", title: "What Travels", note: "Mage-gates, except one continent." },
  { slug: "b1-c27", title: "The Ground Between", note: "Eight continents under a later trial." },
  { slug: "b1-c28", title: "The Reach of a Spear", note: "Ironfront showing through." },
  { slug: "b1-c29", title: "Where the Road Vanishes", note: "The script nobody can read.", still: "/house/sunken.jpg" },
  { slug: "b1-c30", title: "The Line Behind You", note: "You keep the name. You lose the ground." },
  { slug: "b1-c31", title: "What Still Points Home", note: "A fire in the middle of a clearing.", still: "/house/kettle.jpg" },
  { slug: "b1-c32", title: "The Measure That Holds", note: "Rank F. Independent tracks." },
  { slug: "b1-c33", title: "The Distance Between Levels", note: "Learning Saturation." },
  { slug: "b1-c34", title: "The Shape of an Answer", note: "The System remembers; it does not invent." },
  { slug: "b1-c35", title: "The Road That Chooses", note: "Book One closes. The Vale is still walking." },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export const ANIME: MediaItem[] = BOOK1_BEATS.slice(0, 14).map((b, i) => ({
  id: `a${pad(i + 1)}`,
  slug: b.slug,
  title: `Ep. ${pad(i + 1)} — ${b.title}`,
  kind: "anime" as const,
  access: "anime" as const,
  note: b.note,
  still: b.still,
}));

export const COMICS: MediaItem[] = BOOK1_BEATS.slice(0, 14).map((b, i) => ({
  id: `c${pad(i + 1)}`,
  slug: b.slug,
  title: `Issue ${pad(i + 1)} — ${b.title}`,
  kind: "comic" as const,
  access: "member" as const,
  note: b.note,
  still: i === 0 ? "/house/comic-01.jpg" : b.still,
}));

export const AUDIO: MediaItem[] = BOOK1_BEATS.map((b, i) => ({
  id: `au${pad(i + 1)}`,
  slug: b.slug,
  title: `Ch. ${pad(i + 1)} — ${b.title}`,
  kind: "audio" as const,
  access: "voices" as const,
  note: b.note,
  still: b.still,
}));

export const PRICE = { dollars: 10, period: "month" as const };

export type Vault = "kettle" | "voices" | "anime";

export const VAULTS: Record<
  Vault,
  { dollars: number; label: string; prefix: string; opens: string }
> = {
  kettle: {
    dollars: 10,
    label: "Kettle",
    prefix: "KETTLE",
    opens: "Book Two, voices, anime, and comics",
  },
  voices: { dollars: 5, label: "Voices", prefix: "VOICE", opens: "the 35 audiobook tracks" },
  anime: { dollars: 5, label: "Anime", prefix: "ANIME", opens: "the 14 episodes" },
};

export const VAULT_ORDER: Vault[] = ["kettle", "voices", "anime"];

export function entitled(
  access: Access,
  m: { member: boolean; voices: boolean; anime: boolean },
) {
  if (access === "free") return true;
  if (access === "voices") return m.member || m.voices;
  if (access === "anime") return m.member || m.anime;
  return m.member;
}

export function vaultForAccess(access: Access): Vault {
  if (access === "voices") return "voices";
  if (access === "anime") return "anime";
  return "kettle";
}

export function chapterBySlug(slug: string): Chapter | undefined {
  return [...BOOK1, ...BOOK2].find((c) => c.slug === slug);
}

export function mediaById(kind: MediaKind, id: string): MediaItem | undefined {
  const list = kind === "anime" ? ANIME : kind === "comic" ? COMICS : AUDIO;
  return list.find((m) => m.id === id);
}

export function mediaList(kind: MediaKind): MediaItem[] {
  return kind === "anime" ? ANIME : kind === "comic" ? COMICS : AUDIO;
}

export function driveDoc(id: string) {
  return `https://docs.google.com/document/d/${id}/edit`;
}
