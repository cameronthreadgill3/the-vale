import { groundsFor, type HuntingGround } from "./bestiary";
import { TILE } from "./world";

export function bearingWord(dx: number, dy: number): string {
  if (Math.hypot(dx, dy) < 8) return "here";
  const a = Math.atan2(dy, dx);
  const dirs = ["east", "southeast", "south", "southwest", "west", "northwest", "north", "northeast"];
  const i = Math.round((((a + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4))) % 8;
  return dirs[i]!;
}

export function nearestGround(
  locationId: string,
  x: number,
  y: number,
  townX: number,
  townY: number,
): { ground: HuntingGround; gx: number; gy: number; dist: number } | null {
  const list = groundsFor(locationId);
  let best: { ground: HuntingGround; gx: number; gy: number; dist: number } | null = null;
  for (const g of list) {
    const gx = townX + g.ox * TILE;
    const gy = townY + g.oy * TILE;
    const dist = Math.hypot(x - gx, y - gy);
    if (!best || dist < best.dist) best = { ground: g, gx, gy, dist };
  }
  return best;
}

export function huntFit(level: number, rec: [number, number]): "easy" | "fair" | "hard" | "deadly" {
  if (level > rec[1] + 6) return "easy";
  if (level < rec[0] - 4) return "deadly";
  if (level < rec[0]) return "hard";
  return "fair";
}

export function liveObjective(opts: {
  underground: boolean;
  dungeonName?: string;
  bossName?: string;
  hpRatio: number;
  sitting: boolean;
  hunt?: HuntingGround | null;
  level: number;
  locationId: string;
  x: number;
  y: number;
  townX: number;
  townY: number;
}): string {
  if (opts.hpRatio < 0.28 && !opts.underground) {
    return "The fountain would take you. Walk the square.";
  }
  if (opts.sitting) return "You sit. The square goes on.";
  if (opts.underground) {
    return opts.bossName
      ? `${opts.dungeonName ?? "The hollow"}. The far room keeps ${opts.bossName}. Stairs climb.`
      : `${opts.dungeonName ?? "The hollow"}. Stairs climb · E.`;
  }
  if (opts.hunt) {
    const fit = huntFit(opts.level, opts.hunt.rec);
    if (fit === "deadly") return `${opts.hunt.name} is above you (rec ${opts.hunt.rec[0]}–${opts.hunt.rec[1]}). Fall back.`;
    if (fit === "hard") return `${opts.hunt.name} will bite. Rec ${opts.hunt.rec[0]}–${opts.hunt.rec[1]}.`;
    if (fit === "easy") return `${opts.hunt.name} is thin now. The next cairn will teach more.`;
    return `${opts.hunt.name}. ${opts.hunt.blurb}`;
  }
  const near = nearestGround(opts.locationId, opts.x, opts.y, opts.townX, opts.townY);
  if (near) {
    const dir = bearingWord(near.gx - opts.townX, near.gy - opts.townY);
    if (opts.level < 8) return `Walk ${near.ground.name}, ${dir} of the fountain. A first hunt.`;
    return `${near.ground.name} lies ${dir}. A cairn marks it.`;
  }
  return "Talk, sit, hunt. The square goes on.";
}
