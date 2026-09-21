/**
 * Distinct clothed pixel folk (original Vale art, character polish).
 * Cached per folk-id + color. Labels stay in folkCanvas.
 * Pass 4: outfit silhouettes that don't blur; painted volume kept.
 */
import { makeCanvas, ctx2d, px, shadeHex, mixHex, paintVolume, drawSoftShadow, drawWithWarmRim, addPixelVolume, GROUND_SHADOW_ALPHA } from "@/game/gfx/canvasUtil";

export const FOLK_FRAME = 32;

type Sheet = HTMLCanvasElement | OffscreenCanvas;
const cache = new Map<string, Sheet>();

const SKIN = "#d4a574";
const SKIN_D = "#b07a50";
const OUT = "#1a1814";
const BOOT = "#2a2418";

type Look =
  | "watch"
  | "shop"
  | "healer"
  | "guide"
  | "tide"
  | "choir"
  | "pilgrim"
  | "captain"
  | "crafter"
  | "lantern"
  | "scribe"
  | "cooper"
  | "generic";

const LOOK_BY_ID: Record<string, Look> = {
  rook: "watch",
  "mara-hearth": "shop",
  noll: "healer",
  "cress-ledger": "shop",
  "perrin-loaf": "shop",
  "old-tam": "guide",
  "old-reed": "guide",
  "selene-tide": "tide",
  "choir-keeper": "choir",
  "ash-pilgrim": "pilgrim",
  "nightglass-pilot": "captain",
  "sera-kettle": "crafter",
  "liska-ash": "lantern",
  "wren-quill": "scribe",
  "bram-cooper": "cooper",
};

function lookFor(folkId: string | undefined): Look {
  if (folkId && LOOK_BY_ID[folkId]) return LOOK_BY_ID[folkId]!;
  return "generic";
}

function body(
  ctx: CanvasRenderingContext2D,
  tunic: string,
  tunicDark: string,
  opts?: { skirt?: boolean; pants?: string },
): void {
  px(ctx, 11, 24, OUT, 5, 5);
  px(ctx, 16, 24, OUT, 5, 5);
  px(ctx, 12, 24, BOOT, 3, 4);
  px(ctx, 17, 24, BOOT, 3, 4);
  paintVolume(ctx, 12, 24, 3, 4, BOOT, 1.22, 0.62);
  paintVolume(ctx, 17, 24, 3, 4, BOOT, 1.16, 0.6);
  px(ctx, 12, 27, "#1a1410", 3, 1);
  px(ctx, 17, 27, "#1a1410", 3, 1);
  const pants = opts?.pants ?? tunicDark;
  px(ctx, 12, 20, OUT, 5, 5);
  px(ctx, 15, 20, OUT, 5, 5);
  px(ctx, 13, 20, pants, 3, 5);
  px(ctx, 16, 20, pants, 3, 5);
  paintVolume(ctx, 13, 20, 3, 5, pants, 1.14, 0.72);
  paintVolume(ctx, 16, 20, 3, 5, pants, 1.08, 0.68);
  px(ctx, 11, 12, OUT, 10, 10);
  px(ctx, 12, 12, tunic, 8, 9);
  paintVolume(ctx, 12, 12, 8, 9, tunic, 1.18, 0.72);
  px(ctx, 13, 13, shadeHex(tunic, 1.22), 3, 2);
  px(ctx, 16, 16, tunicDark, 4, 5);
  px(ctx, 12, 18, tunicDark, 8, 3);
  if (opts?.skirt) {
    px(ctx, 10, 18, OUT, 12, 6);
    px(ctx, 11, 18, tunicDark, 10, 5);
    paintVolume(ctx, 11, 18, 10, 5, tunicDark, 1.14, 0.7);
  }
  px(ctx, 8, 12, OUT, 5, 8);
  px(ctx, 19, 12, OUT, 5, 8);
  px(ctx, 9, 13, SKIN, 3, 6);
  px(ctx, 20, 13, SKIN, 3, 6);
  paintVolume(ctx, 9, 13, 3, 6, SKIN, 1.12, 0.8);
  paintVolume(ctx, 20, 13, 3, 6, SKIN, 1.08, 0.78);
  px(ctx, 9, 13, tunicDark, 2, 3);
  px(ctx, 21, 13, tunicDark, 2, 3);
}

function head(
  ctx: CanvasRenderingContext2D,
  hair: string,
  opts?: { beard?: boolean; bun?: boolean },
): void {
  px(ctx, 13, 6, OUT, 6, 7);
  px(ctx, 14, 7, SKIN, 4, 5);
  paintVolume(ctx, 14, 7, 4, 5, SKIN, 1.14, 0.8);
  px(ctx, 15, 10, SKIN_D, 2, 1);
  px(ctx, 14, 8, "#1a1410", 2, 2);
  px(ctx, 16, 8, "#1a1410", 2, 2);
  px(ctx, 14, 8, "#f4eee4", 1, 1);
  px(ctx, 16, 8, "#f4eee4", 1, 1);
  px(ctx, 13, 5, hair, 6, 3);
  paintVolume(ctx, 13, 5, 6, 3, hair, 1.18, 0.72);
  px(ctx, 13, 6, hair, 2, 3);
  px(ctx, 18, 6, hair, 2, 2);
  if (opts?.bun) {
    px(ctx, 19, 4, OUT, 4, 4);
    px(ctx, 19, 4, hair, 3, 3);
    paintVolume(ctx, 19, 4, 3, 3, hair, 1.16, 0.74);
  }
  if (opts?.beard) {
    px(ctx, 14, 11, hair, 4, 3);
    paintVolume(ctx, 14, 11, 4, 3, hair, 1.12, 0.75);
    px(ctx, 15, 13, mixHex(hair, "#c8c0b0", 0.3), 2, 2);
  }
}

function paintWatch(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.6);
  body(ctx, color, dark, { pants: "#3a4030" });
  head(ctx, "#2a2418");
  // cloak
  px(ctx, 8, 12, dark, 3, 10);
  paintVolume(ctx, 8, 12, 3, 10, dark, 1.16, 0.7);
  px(ctx, 21, 12, dark, 3, 10);
  paintVolume(ctx, 21, 12, 3, 10, dark, 1.1, 0.68);
  px(ctx, 10, 20, shadeHex(color, 0.45), 12, 3);
  // bronze badge
  px(ctx, 14, 14, "#c9a227", 3, 3);
  px(ctx, 15, 15, "#e8d070", 1, 1);
  // spear
  px(ctx, 23, 4, "#6b4423", 2, 22);
  paintVolume(ctx, 23, 4, 2, 22, "#6b4423", 1.16, 0.7);
  px(ctx, 22, 3, "#8a929a", 4, 4);
  paintVolume(ctx, 22, 3, 4, 4, "#8a929a", 1.2, 0.72);
  px(ctx, 12, 17, "#c9a227", 8, 1);
  px(ctx, 6, 14, "#6b4423", 4, 8);
  paintVolume(ctx, 6, 14, 4, 8, "#8a929a", 1.18, 0.7);
  px(ctx, 7, 16, "#c9a227", 2, 2);
}

function paintShop(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.65);
  body(ctx, color, dark, { skirt: true });
  head(ctx, "#4a3020", { bun: true });
  // apron
  px(ctx, 13, 14, "#e8e0c8", 6, 8);
  paintVolume(ctx, 13, 14, 6, 8, "#e8e0c8", 1.12, 0.8);
  px(ctx, 14, 15, "#d0c8a8", 4, 6);
  px(ctx, 15, 18, "#c9a227", 2, 2);
  // coin pouch
  px(ctx, 20, 19, "#6b4423", 3, 3);
  paintVolume(ctx, 20, 19, 3, 3, "#6b4423", 1.16, 0.74);
  // loaf
  px(ctx, 8, 18, "#c97a4a", 4, 3);
  paintVolume(ctx, 8, 18, 4, 3, "#c97a4a", 1.16, 0.78);
}

function paintHealer(ctx: CanvasRenderingContext2D, color: string): void {
  const robe = mixHex(color, "#e8f0e0", 0.35);
  const dark = shadeHex(robe, 0.7);
  body(ctx, robe, dark, { skirt: true });
  head(ctx, "#c8b090");
  px(ctx, 12, 13, "#8ab87a", 8, 2);
  paintVolume(ctx, 12, 13, 8, 2, "#8ab87a", 1.16, 0.78);
  px(ctx, 15, 12, "#e8e6d9", 2, 6);
  // satchel
  px(ctx, 8, 16, "#6b4423", 4, 5);
  paintVolume(ctx, 8, 16, 4, 5, "#6b4423", 1.16, 0.74);
  px(ctx, 9, 17, "#c9a227", 2, 1);
  px(ctx, 21, 16, "#8ab87a", 3, 4);
  px(ctx, 22, 17, "#e8f0e0", 1, 2);
}

function paintGuide(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.65);
  body(ctx, color, dark, { pants: "#4a4030" });
  head(ctx, "#6a6860", { beard: true });
  // straw hat
  px(ctx, 11, 5, "#c9a227", 10, 2);
  paintVolume(ctx, 11, 5, 10, 2, "#c9a227", 1.16, 0.78);
  px(ctx, 9, 6, "#c9a227", 14, 2);
  px(ctx, 13, 2, "#b89040", 6, 4);
  paintVolume(ctx, 13, 2, 6, 4, "#b89040", 1.18, 0.74);
  // staff
  px(ctx, 7, 6, "#6b4423", 2, 20);
  paintVolume(ctx, 7, 6, 2, 20, "#6b4423", 1.16, 0.7);
  px(ctx, 6, 5, "#8ab87a", 4, 3);
}

function paintTide(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.6);
  body(ctx, color, dark);
  head(ctx, "#3a2a18");
  // scarf
  px(ctx, 12, 11, "#d8e8f0", 8, 3);
  paintVolume(ctx, 12, 11, 8, 3, "#d8e8f0", 1.14, 0.82);
  px(ctx, 20, 12, "#d8e8f0", 3, 6);
  px(ctx, 22, 16, "#d8e8f0", 3, 5);
  px(ctx, 24, 19, "#c8d8e0", 2, 3);
  // fish at hip
  px(ctx, 20, 19, "#c97a4a", 4, 2);
  paintVolume(ctx, 20, 19, 4, 2, "#c97a4a", 1.16, 0.78);
  px(ctx, 23, 19, "#e8e6d9", 1, 1);
}

function paintChoir(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.5);
  body(ctx, color, dark, { skirt: true });
  // deep hood hides hair
  px(ctx, 12, 4, dark, 8, 9);
  paintVolume(ctx, 12, 4, 8, 9, dark, 1.16, 0.7);
  px(ctx, 14, 2, dark, 4, 3);
  px(ctx, 15, 1, shadeHex(color, 0.35), 2, 2);
  px(ctx, 13, 7, SKIN, 4, 4);
  paintVolume(ctx, 13, 7, 4, 4, SKIN, 1.12, 0.8);
  px(ctx, 14, 8, "#1a1410", 2, 2);
  px(ctx, 14, 8, "#f4eee4", 1, 1);
  px(ctx, 12, 4, shadeHex(color, 0.35), 8, 3);
  px(ctx, 11, 6, dark, 2, 6);
  px(ctx, 19, 6, dark, 2, 6);
  px(ctx, 12, 16, "#c9a227", 8, 1);
  // hymn book
  px(ctx, 8, 16, "#e8e0c8", 4, 5);
  paintVolume(ctx, 8, 16, 4, 5, "#e8e0c8", 1.12, 0.8);
  px(ctx, 9, 17, "#6a3a4a", 2, 3);
}

function paintPilgrim(ctx: CanvasRenderingContext2D, color: string): void {
  const ash = mixHex(color, "#6a6860", 0.4);
  const dark = shadeHex(ash, 0.6);
  body(ctx, ash, dark, { skirt: true });
  px(ctx, 12, 4, dark, 8, 8);
  paintVolume(ctx, 12, 4, 8, 8, dark, 1.16, 0.7);
  px(ctx, 13, 7, SKIN, 4, 4);
  paintVolume(ctx, 13, 7, 4, 4, SKIN, 1.12, 0.8);
  px(ctx, 12, 4, shadeHex(ash, 0.4), 8, 3);
  px(ctx, 7, 8, "#5a5048", 2, 18);
  paintVolume(ctx, 7, 8, 2, 18, "#5a5048", 1.14, 0.7);
  px(ctx, 6, 6, "#c97a4a", 4, 3);
  px(ctx, 5, 4, "#c97a4a", 4, 3);
  px(ctx, 6, 3, "#e8d0a8", 2, 2);
}

function paintCaptain(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.55);
  body(ctx, color, dark, { pants: "#2a2438" });
  head(ctx, "#1a1814");
  // tricorn
  px(ctx, 11, 4, "#1a1814", 10, 3);
  px(ctx, 12, 2, "#2a2438", 8, 3);
  paintVolume(ctx, 12, 2, 8, 3, "#2a2438", 1.2, 0.7);
  px(ctx, 10, 5, "#1a1814", 3, 2);
  px(ctx, 19, 5, "#1a1814", 3, 2);
  px(ctx, 9, 4, "#1a1814", 3, 2);
  px(ctx, 20, 4, "#1a1814", 3, 2);
  // coat tails
  px(ctx, 10, 20, dark, 3, 6);
  px(ctx, 19, 20, dark, 3, 6);
  // sash
  px(ctx, 12, 16, "#c9a227", 8, 2);
  paintVolume(ctx, 12, 16, 8, 2, "#c9a227", 1.16, 0.78);
  px(ctx, 21, 12, dark, 3, 8);
}

function paintGeneric(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.65);
  body(ctx, color, dark);
  head(ctx, "#3a3028");
  px(ctx, 12, 17, "#c9a227", 8, 1);
}

function paintCrafter(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.65);
  body(ctx, color, dark, { skirt: true });
  head(ctx, "#4a3a28", { bun: true });
  px(ctx, 13, 14, "#6a5040", 6, 7);
  paintVolume(ctx, 13, 14, 6, 7, "#6a5040", 1.14, 0.72);
  px(ctx, 20, 17, "#8a929a", 4, 5);
  paintVolume(ctx, 20, 17, 4, 5, "#c9a227", 1.16, 0.75);
  px(ctx, 21, 16, "#e8d070", 2, 2);
}

function paintLantern(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.6);
  body(ctx, color, dark);
  head(ctx, "#3a3020");
  px(ctx, 21, 10, "#6b4423", 3, 8);
  px(ctx, 20, 8, "#c97a2a", 5, 5);
  paintVolume(ctx, 20, 8, 5, 5, "#e8b86a", 1.22, 0.78);
  px(ctx, 22, 9, "#fff4c8", 2, 2);
}

function paintScribe(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.65);
  body(ctx, color, dark);
  head(ctx, "#2a2418");
  px(ctx, 8, 15, "#e8e0c8", 5, 6);
  paintVolume(ctx, 8, 15, 5, 6, "#e8e0c8", 1.12, 0.8);
  px(ctx, 9, 16, "#6a3a4a", 3, 4);
  px(ctx, 21, 14, "#2a2418", 2, 6);
  px(ctx, 20, 13, "#c9a227", 3, 2);
}

function paintCooper(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.6);
  body(ctx, color, dark, { pants: "#4a3a28" });
  head(ctx, "#3a2a18", { beard: true });
  px(ctx, 20, 16, "#6b4423", 6, 7);
  paintVolume(ctx, 20, 16, 6, 7, "#6b4423", 1.16, 0.72);
  px(ctx, 21, 18, "#c9a227", 4, 1);
  px(ctx, 21, 20, "#c9a227", 4, 1);
}

function paintFolk(color: string, folkId: string | undefined): Sheet {
  const c = makeCanvas(FOLK_FRAME, FOLK_FRAME);
  const ctx = ctx2d(c);
  switch (lookFor(folkId)) {
    case "watch":
      paintWatch(ctx, color);
      break;
    case "shop":
      paintShop(ctx, color);
      break;
    case "healer":
      paintHealer(ctx, color);
      break;
    case "guide":
      paintGuide(ctx, color);
      break;
    case "tide":
      paintTide(ctx, color);
      break;
    case "choir":
      paintChoir(ctx, color);
      break;
    case "pilgrim":
      paintPilgrim(ctx, color);
      break;
    case "captain":
      paintCaptain(ctx, color);
      break;
    case "crafter":
      paintCrafter(ctx, color);
      break;
    case "lantern":
      paintLantern(ctx, color);
      break;
    case "scribe":
      paintScribe(ctx, color);
      break;
    case "cooper":
      paintCooper(ctx, color);
      break;
    default:
      paintGeneric(ctx, color);
  }
  addPixelVolume(ctx, FOLK_FRAME, FOLK_FRAME, 0.15, 0.2);
  return c;
}

export function getFolkSheet(color: string, folkId?: string): Sheet {
  const key = `${folkId ?? "anon"}|${color}`;
  let sheet = cache.get(key);
  if (!sheet) {
    sheet = paintFolk(color, folkId);
    cache.set(key, sheet);
  }
  return sheet;
}

export function drawFolkSprite(
  ctx: CanvasRenderingContext2D,
  color: string,
  sx: number,
  sy: number,
  folkId?: string,
  lift = 0,
): void {
  const sheet = getFolkSheet(color, folkId);
  const size = 44;
  // Contact stays planted while the body takes a 1px idle breath.
  drawSoftShadow(ctx, sx, sy + size * 0.34, size * 0.36, size * 0.13, GROUND_SHADOW_ALPHA);
  ctx.imageSmoothingEnabled = false;
  drawWithWarmRim(ctx, () => {
    ctx.drawImage(
      sheet as CanvasImageSource,
      Math.floor(sx - size / 2),
      Math.floor(sy - size / 2 - 5 + lift),
      size,
      size,
    );
  });
}

export function warmFolkSheets(
  folk: { id: string; color: string }[],
): void {
  for (const f of folk) getFolkSheet(f.color, f.id);
}
