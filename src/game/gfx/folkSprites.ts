/**
 * Distinct clothed pixel folk (original Vale art, gfx pass 3).
 * Cached per folk-id + color. Labels stay in folkCanvas.
 */
import { makeCanvas, ctx2d, px, shadeHex, mixHex, drawSoftShadow } from "@/game/gfx/canvasUtil";

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
  px(ctx, 12, 24, BOOT, 3, 4);
  px(ctx, 17, 24, BOOT, 3, 4);
  const pants = opts?.pants ?? tunicDark;
  px(ctx, 13, 20, pants, 3, 5);
  px(ctx, 16, 20, pants, 3, 5);
  px(ctx, 11, 12, OUT, 10, 10);
  px(ctx, 12, 12, tunic, 8, 9);
  px(ctx, 12, 18, tunicDark, 8, 3);
  if (opts?.skirt) px(ctx, 11, 18, tunicDark, 10, 5);
  px(ctx, 9, 13, SKIN, 3, 6);
  px(ctx, 20, 13, SKIN, 3, 6);
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
  px(ctx, 15, 9, SKIN_D, 2, 1);
  px(ctx, 13, 5, hair, 6, 3);
  px(ctx, 13, 6, hair, 2, 3);
  px(ctx, 18, 6, hair, 2, 2);
  if (opts?.bun) px(ctx, 19, 4, hair, 3, 3);
  if (opts?.beard) {
    px(ctx, 14, 11, hair, 4, 3);
    px(ctx, 15, 13, mixHex(hair, "#c8c0b0", 0.3), 2, 2);
  }
}

function paintWatch(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.6);
  body(ctx, color, dark, { pants: "#3a4030" });
  head(ctx, "#2a2418");
  // cloak
  px(ctx, 8, 12, dark, 3, 10);
  px(ctx, 21, 12, dark, 3, 10);
  px(ctx, 10, 20, shadeHex(color, 0.45), 12, 3);
  // bronze badge
  px(ctx, 14, 14, "#c9a227", 3, 3);
  px(ctx, 15, 15, "#e8d070", 1, 1);
  // spear
  px(ctx, 23, 4, "#6b4423", 2, 22);
  px(ctx, 22, 3, "#8a929a", 4, 4);
  px(ctx, 12, 17, "#c9a227", 8, 1);
}

function paintShop(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.65);
  body(ctx, color, dark, { skirt: true });
  head(ctx, "#4a3020", { bun: true });
  // apron
  px(ctx, 13, 14, "#e8e0c8", 6, 8);
  px(ctx, 14, 15, "#d0c8a8", 4, 6);
  px(ctx, 15, 18, "#c9a227", 2, 2);
  // coin pouch
  px(ctx, 20, 19, "#6b4423", 3, 3);
}

function paintHealer(ctx: CanvasRenderingContext2D, color: string): void {
  const robe = mixHex(color, "#e8f0e0", 0.35);
  const dark = shadeHex(robe, 0.7);
  body(ctx, robe, dark, { skirt: true });
  head(ctx, "#c8b090");
  px(ctx, 12, 13, "#8ab87a", 8, 2);
  px(ctx, 15, 12, "#e8e6d9", 2, 6);
  // satchel
  px(ctx, 8, 16, "#6b4423", 4, 5);
  px(ctx, 9, 17, "#c9a227", 2, 1);
}

function paintGuide(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.65);
  body(ctx, color, dark, { pants: "#4a4030" });
  head(ctx, "#6a6860", { beard: true });
  // straw hat
  px(ctx, 11, 5, "#c9a227", 10, 2);
  px(ctx, 13, 2, "#b89040", 6, 4);
  // staff
  px(ctx, 7, 6, "#6b4423", 2, 20);
  px(ctx, 6, 5, "#8ab87a", 4, 3);
}

function paintTide(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.6);
  body(ctx, color, dark);
  head(ctx, "#3a2a18");
  // scarf
  px(ctx, 12, 11, "#d8e8f0", 8, 3);
  px(ctx, 20, 12, "#d8e8f0", 3, 6);
  // fish at hip
  px(ctx, 20, 19, "#c97a4a", 4, 2);
  px(ctx, 23, 19, "#e8e6d9", 1, 1);
}

function paintChoir(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.5);
  body(ctx, color, dark, { skirt: true });
  // deep hood hides hair
  px(ctx, 12, 4, dark, 8, 9);
  px(ctx, 13, 7, SKIN, 4, 4);
  px(ctx, 12, 4, shadeHex(color, 0.35), 8, 3);
  px(ctx, 11, 6, dark, 2, 6);
  px(ctx, 19, 6, dark, 2, 6);
  px(ctx, 12, 16, "#c9a227", 8, 1);
  // hymn book
  px(ctx, 8, 16, "#e8e0c8", 4, 5);
  px(ctx, 9, 17, "#6a3a4a", 2, 3);
}

function paintPilgrim(ctx: CanvasRenderingContext2D, color: string): void {
  const ash = mixHex(color, "#6a6860", 0.4);
  const dark = shadeHex(ash, 0.6);
  body(ctx, ash, dark, { skirt: true });
  px(ctx, 12, 4, dark, 8, 8);
  px(ctx, 13, 7, SKIN, 4, 4);
  px(ctx, 12, 4, shadeHex(ash, 0.4), 8, 3);
  px(ctx, 7, 8, "#5a5048", 2, 18);
  px(ctx, 6, 6, "#c97a4a", 4, 3);
}

function paintCaptain(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.55);
  body(ctx, color, dark, { pants: "#2a2438" });
  head(ctx, "#1a1814");
  // tricorn
  px(ctx, 11, 4, "#1a1814", 10, 3);
  px(ctx, 12, 2, "#2a2438", 8, 3);
  px(ctx, 10, 5, "#1a1814", 3, 2);
  px(ctx, 19, 5, "#1a1814", 3, 2);
  // sash
  px(ctx, 12, 16, "#c9a227", 8, 2);
  px(ctx, 21, 12, dark, 3, 8);
}

function paintGeneric(ctx: CanvasRenderingContext2D, color: string): void {
  const dark = shadeHex(color, 0.65);
  body(ctx, color, dark);
  head(ctx, "#3a3028");
  px(ctx, 12, 17, "#c9a227", 8, 1);
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
    default:
      paintGeneric(ctx, color);
  }
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
): void {
  const sheet = getFolkSheet(color, folkId);
  const size = 44;
  drawSoftShadow(ctx, sx, sy + size * 0.24, size * 0.3, size * 0.11, 0.36);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet as CanvasImageSource,
    Math.floor(sx - size / 2),
    Math.floor(sy - size / 2 - 5),
    size,
    size,
  );
}

export function warmFolkSheets(
  folk: { id: string; color: string }[],
): void {
  for (const f of folk) getFolkSheet(f.color, f.id);
}
