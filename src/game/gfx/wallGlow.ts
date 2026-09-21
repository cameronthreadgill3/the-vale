/**
 * Soft warm bounce on plaster walls and ashwood trunks near plaza lanterns
 * and path lamps. The lamp pool, door spill, and canopy dapple stay as they
 * are. This pass only washes the nearby face, brighter on the side toward
 * the flame, on the same pulse as the glass.
 * Plaster is clipped to the wall tile so cobble and signs keep their read.
 * Trunk wash is drawn with the crown, on the bark collar, so leaves still
 * cover it. Alphas stay low so the lit plaster stays under the bloom knee
 * and labels keep the read.
 * Canvas 2D gradients only. Original Vale pixels — not CipSoft.
 */
import { TILE, type WorldMap } from "@/game/world";
import { propsOnContinent } from "@/game/world/town";
import { CANOPY_PX, TILE_PX, tileVariantAt } from "@/game/gfx/tiles";
import { pathLampsInView, warmFlamePulse } from "@/game/gfx/lampFlicker";

type GlowLight = {
  /** Flame center, world pixels. */
  x: number;
  y: number;
  phase: number;
  reach: number;
  /** Path lamps stay quieter than plaza glass. */
  strength: number;
  /** Ashwood bark. Plaza lanterns only wash building plaster. */
  trunks: boolean;
};

const LANTERN_REACH = 84;
const LAMP_REACH = 62;

/** Amber under the bloom knee (158) even at full opacity. Luma ≈ 147. */
const LIP = "196, 136, 72";

const CANOPY_DRAW = Math.round(CANOPY_PX * (TILE / TILE_PX));
const CANOPY_SCALE = CANOPY_DRAW / CANOPY_PX;

let lightKey = "";
let lightList: GlowLight[] = [];

function tileAt(map: WorldMap, tx: number, ty: number): string | null {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return null;
  return map.tiles[ty]![tx] ?? null;
}

function distToTile(light: GlowLight, tx: number, ty: number): number {
  const left = tx * TILE;
  const top = ty * TILE;
  const nx = Math.max(left, Math.min(left + TILE, light.x));
  const ny = Math.max(top, Math.min(top + TILE, light.y));
  return Math.hypot(light.x - nx, light.y - ny);
}

function falloff(dist: number, reach: number): number {
  const t = 1 - dist / reach;
  if (t <= 0) return 0;
  return t * t;
}

function glowLights(
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
): readonly GlowLight[] {
  const key = `${map.kind}:${map.continentId}:${originX}:${originY}:${viewW}:${viewH}`;
  if (key === lightKey) return lightList;
  lightKey = key;
  if (map.kind !== "overworld") {
    lightList = [];
    return lightList;
  }
  const out: GlowLight[] = [];
  const x0 = originX - TILE * 2;
  const y0 = originY - TILE * 2;
  const x1 = originX + viewW + TILE * 2;
  const y1 = originY + viewH + TILE * 2;
  for (const prop of propsOnContinent(map.continentId)) {
    if (prop.kind !== "lantern") continue;
    const x = prop.x * TILE + 16;
    const y = prop.y * TILE + 10;
    if (x < x0 || y < y0 || x > x1 || y > y1) continue;
    out.push({
      x,
      y,
      phase: prop.x * 0.73 + prop.y * 0.41,
      reach: LANTERN_REACH,
      strength: 1,
      trunks: false,
    });
  }
  for (const lamp of pathLampsInView(map, originX, originY, viewW, viewH)) {
    out.push({
      x: lamp.x,
      y: lamp.y,
      phase: lamp.phase,
      reach: LAMP_REACH,
      strength: 0.66,
      trunks: true,
    });
  }
  lightList = out;
  return lightList;
}

function washFace(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  lx: number,
  ly: number,
  core: number,
  mid: number,
  lip: number,
): void {
  const cx = sx + sw / 2;
  const cy = sy + sh / 2;
  const dx = lx - cx;
  const dy = ly - cy;
  const len = Math.hypot(dx, dy);
  const nx = len < 1 ? 0 : dx / len;
  const ny = len < 1 ? 1 : dy / len;
  const span = Math.max(sw, sh);
  ctx.save();
  ctx.beginPath();
  ctx.rect(sx, sy, sw, sh);
  ctx.clip();
  const x0 = cx + nx * span * 0.48;
  const y0 = cy + ny * span * 0.48;
  const x1 = cx - nx * span * 0.55;
  const y1 = cy - ny * span * 0.55;
  const wash = ctx.createLinearGradient(x0, y0, x1, y1);
  wash.addColorStop(0, `rgba(214, 150, 74, ${core})`);
  wash.addColorStop(0.45, `rgba(176, 108, 48, ${mid})`);
  wash.addColorStop(1, "transparent");
  ctx.fillStyle = wash;
  ctx.fillRect(sx, sy, sw, sh);
  const gx = cx + nx * span * 0.32;
  const gy = cy + ny * span * 0.32;
  const radius = span * 0.62;
  const hot = ctx.createRadialGradient(gx, gy, 1, gx, gy, radius);
  hot.addColorStop(0, `rgba(222, 164, 86, ${core * 0.85})`);
  hot.addColorStop(0.5, `rgba(186, 112, 48, ${mid * 0.7})`);
  hot.addColorStop(1, "transparent");
  ctx.fillStyle = hot;
  ctx.fillRect(gx - radius, gy - radius, radius * 2, radius * 2);
  if (lip > 0.04) {
    const px = -ny;
    const py = nx;
    ctx.fillStyle = `rgba(${LIP}, ${lip})`;
    for (let i = -1; i <= 1; i++) {
      ctx.fillRect(Math.round(gx + px * i * 4), Math.round(gy + py * i * 3), 2, 1);
    }
  }
  ctx.restore();
}

function inView(sx: number, sy: number, viewW: number, viewH: number, pad: number): boolean {
  return sx >= -pad && sy >= -pad && sx <= viewW + pad && sy <= viewH + pad;
}

/**
 * Plaster on building walls near a plaza lantern or a path lamp.
 * Drawn with the ground lights, before roofs and signs.
 */
export function drawLanternWallGlow(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  if (map.kind !== "overworld") return;
  const lights = glowLights(map, originX, originY, viewW, viewH);
  for (let i = 0; i < lights.length; i++) {
    const light = lights[i]!;
    const ltx = Math.floor(light.x / TILE);
    const lty = Math.floor(light.y / TILE);
    const r = Math.ceil(light.reach / TILE);
    const lx = light.x - originX;
    const ly = light.y - originY;
    const pulse = warmFlamePulse(timeSec, light.phase);
    for (let ty = lty - r; ty <= lty + r; ty++) {
      for (let tx = ltx - r; tx <= ltx + r; tx++) {
        if (tileAt(map, tx, ty) !== "wall") continue;
        const dist = distToTile(light, tx, ty);
        const fade = falloff(dist, light.reach);
        if (fade <= 0) continue;
        const sx = Math.floor(tx * TILE - originX);
        const sy = Math.floor(ty * TILE - originY);
        if (!inView(sx, sy, viewW, viewH, TILE)) continue;
        const gain = light.strength * pulse * fade;
        washFace(
          ctx,
          sx,
          sy,
          TILE,
          TILE,
          lx,
          ly,
          0.16 * gain,
          0.055 * gain,
          Math.min(0.4, 0.32 * gain),
        );
      }
    }
  }
}

/**
 * Bark collar on an ashwood crown, facing a nearby path lamp.
 * Call after that crown's sheet so the wash sits on the visible trunk.
 * `sheetX` / `sheetY` are the canopy draw origin (sway already applied).
 */
export function drawAshwoodLampBounce(
  ctx: CanvasRenderingContext2D,
  map: WorldMap,
  tx: number,
  ty: number,
  sheetX: number,
  sheetY: number,
  originX: number,
  originY: number,
  viewW: number,
  viewH: number,
  timeSec: number,
): void {
  if (map.kind !== "overworld") return;
  if (tx <= 0 || ty <= 0 || tx >= map.width - 1 || ty >= map.height - 1) return;
  const lights = glowLights(map, originX, originY, viewW, viewH);
  let near = false;
  for (let i = 0; i < lights.length; i++) {
    const light = lights[i]!;
    if (!light.trunks) continue;
    if (falloff(distToTile(light, tx, ty), light.reach) > 0) {
      near = true;
      break;
    }
  }
  if (!near) return;
  const variant = tileVariantAt(tx, ty);
  const ox = (variant % 5) - 2;
  const oy = ((variant * 3) % 5) - 2;
  const collarX = sheetX + (29 + ox) * CANOPY_SCALE;
  const collarY = sheetY + (36 + oy) * CANOPY_SCALE;
  const bw = 12 * CANOPY_SCALE;
  const bh = 26 * CANOPY_SCALE;
  for (let i = 0; i < lights.length; i++) {
    const light = lights[i]!;
    if (!light.trunks) continue;
    const dist = distToTile(light, tx, ty);
    const fade = falloff(dist, light.reach);
    if (fade <= 0) continue;
    const pulse = warmFlamePulse(timeSec, light.phase);
    const gain = light.strength * pulse * fade;
    washFace(
      ctx,
      collarX - 2 * CANOPY_SCALE,
      collarY,
      bw,
      bh,
      light.x - originX,
      light.y - originY,
      0.2 * gain,
      0.07 * gain,
      Math.min(0.36, 0.28 * gain),
    );
  }
}
