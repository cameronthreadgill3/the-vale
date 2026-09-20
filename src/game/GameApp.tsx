import { useEffect, useRef, useState } from "react";
import { rngFrom, randInt } from "@/game/rng";
import { levelFromXp, progressInLevel, xpToNext } from "@/game/xp";

const TILE = 32;
const MAP_W = 48;
const MAP_H = 36;
const PLAYER_SPEED = 140; // px / second
const PLAYER_RADIUS = 10;

const TILE_COLORS = {
  grass: "#1f3a24",
  grassAlt: "#25462c",
  dirt: "#3a2f1f",
  path: "#4a3d28",
  stone: "#2c3030",
  water: "#1a2a3a",
  flower: "#3a2840",
} as const;

type TileKind = keyof typeof TILE_COLORS;

function generateMap(seed: string): TileKind[][] {
  const rng = rngFrom(seed);
  const map: TileKind[][] = [];
  for (let y = 0; y < MAP_H; y++) {
    const row: TileKind[] = [];
    for (let x = 0; x < MAP_W; x++) {
      const edge = x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1;
      if (edge) {
        row.push("stone");
        continue;
      }
      const n = rng();
      if (n < 0.06) row.push("water");
      else if (n < 0.14) row.push("dirt");
      else if (n < 0.2) row.push("path");
      else if (n < 0.24) row.push("flower");
      else row.push(rng() < 0.5 ? "grass" : "grassAlt");
    }
    map.push(row);
  }
  // Carve a soft path through the middle for readability
  const midY = Math.floor(MAP_H / 2);
  for (let x = 2; x < MAP_W - 2; x++) {
    map[midY]![x] = "path";
    if (rng() < 0.35) map[midY - 1]![x] = "dirt";
    if (rng() < 0.35) map[midY + 1]![x] = "dirt";
  }
  // Clear spawn area
  const sx = Math.floor(MAP_W / 2);
  const sy = Math.floor(MAP_H / 2);
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const tx = sx + dx;
      const ty = sy + dy;
      if (tx > 0 && ty > 0 && tx < MAP_W - 1 && ty < MAP_H - 1) {
        map[ty]![tx] = dy === 0 ? "path" : "grass";
      }
    }
  }
  // Sprinkle a few stones as landmarks (seeded)
  for (let i = 0; i < 12; i++) {
    const tx = randInt(rng, 2, MAP_W - 3);
    const ty = randInt(rng, 2, MAP_H - 3);
    if (Math.abs(tx - sx) > 3 || Math.abs(ty - sy) > 3) {
      map[ty]![tx] = "stone";
    }
  }
  return map;
}

function isSolid(tile: TileKind): boolean {
  return tile === "water" || tile === "stone";
}

type Keys = Record<string, boolean>;

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Keys>({});
  const [hud, setHud] = useState({ x: 0, y: 0, level: 1, xp: 0, progress: 0, next: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const map = generateMap("thornvale-starter-hollow");
    const xp = 0;
    const level = levelFromXp(xp);

    const player = {
      x: (MAP_W / 2) * TILE,
      y: (MAP_H / 2) * TILE,
    };

    let camX = player.x;
    let camY = player.y;
    let raf = 0;
    let last = performance.now();
    let running = true;
    let hudAccum = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight" ||
        e.code === "KeyW" ||
        e.code === "KeyA" ||
        e.code === "KeyS" ||
        e.code === "KeyD"
      ) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const tryMove = (nx: number, ny: number) => {
      const r = PLAYER_RADIUS;
      const samples = [
        [nx - r, ny - r],
        [nx + r, ny - r],
        [nx - r, ny + r],
        [nx + r, ny + r],
      ] as const;
      for (const [px, py] of samples) {
        const tx = Math.floor(px / TILE);
        const ty = Math.floor(py / TILE);
        if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
        if (isSolid(map[ty]![tx]!)) return false;
      }
      player.x = nx;
      player.y = ny;
      return true;
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      if (keys.KeyW || keys.ArrowUp) dy -= 1;
      if (keys.KeyS || keys.ArrowDown) dy += 1;
      if (keys.KeyA || keys.ArrowLeft) dx -= 1;
      if (keys.KeyD || keys.ArrowRight) dx += 1;
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
        const step = PLAYER_SPEED * dt;
        const nx = player.x + dx * step;
        const ny = player.y + dy * step;
        if (!tryMove(nx, ny)) {
          if (!tryMove(nx, player.y)) tryMove(player.x, ny);
        }
      }

      // Smooth camera follow
      camX += (player.x - camX) * Math.min(1, 8 * dt);
      camY += (player.y - camY) * Math.min(1, 8 * dt);

      const viewW = canvas.clientWidth;
      const viewH = canvas.clientHeight;
      const originX = camX - viewW / 2;
      const originY = camY - viewH / 2;

      ctx.fillStyle = "#0c0d0b";
      ctx.fillRect(0, 0, viewW, viewH);

      const startTX = Math.max(0, Math.floor(originX / TILE) - 1);
      const startTY = Math.max(0, Math.floor(originY / TILE) - 1);
      const endTX = Math.min(MAP_W - 1, Math.ceil((originX + viewW) / TILE) + 1);
      const endTY = Math.min(MAP_H - 1, Math.ceil((originY + viewH) / TILE) + 1);

      for (let ty = startTY; ty <= endTY; ty++) {
        for (let tx = startTX; tx <= endTX; tx++) {
          const kind = map[ty]![tx]!;
          ctx.fillStyle = TILE_COLORS[kind];
          const sx = Math.floor(tx * TILE - originX);
          const sy = Math.floor(ty * TILE - originY);
          ctx.fillRect(sx, sy, TILE + 1, TILE + 1);
          // Subtle grid for depth
          if (kind === "grass" || kind === "grassAlt") {
            ctx.fillStyle = "rgba(0,0,0,0.08)";
            ctx.fillRect(sx, sy, TILE + 1, 1);
            ctx.fillRect(sx, sy, 1, TILE + 1);
          }
        }
      }

      // Player shadow
      const px = Math.floor(player.x - originX);
      const py = Math.floor(player.y - originY);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(px, py + 6, PLAYER_RADIUS * 0.9, PLAYER_RADIUS * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player body (warm gold circle — Vale wanderer)
      const grad = ctx.createRadialGradient(px - 3, py - 4, 2, px, py, PLAYER_RADIUS + 2);
      grad.addColorStop(0, "#e8c96a");
      grad.addColorStop(0.6, "#c9a227");
      grad.addColorStop(1, "#7a5c12");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0c0d0b";
      ctx.lineWidth = 2;
      ctx.stroke();

      hudAccum += dt;
      if (hudAccum >= 0.2) {
        hudAccum = 0;
        setHud({
          x: Math.round(player.x / TILE),
          y: Math.round(player.y / TILE),
          level,
          xp,
          progress: progressInLevel(level, xp),
          next: xpToNext(level),
        });
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="relative h-full w-full select-none">
      <canvas ref={canvasRef} className="block h-full w-full" tabIndex={0} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl tracking-wide text-[#c9a227] sm:text-2xl">
              The Vale
            </h1>
            <p className="mt-0.5 text-xs text-[#a8b09a] sm:text-sm">
              A Story as Old as Time — starter hollow
            </p>
          </div>
          <div className="rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-2 text-xs text-[#e8e6d9] backdrop-blur-sm sm:text-sm">
            <div className="font-display text-[#c9a227]">
              Level {hud.level}
            </div>
            <div className="mt-1 text-[#a8b09a]">
              XP {hud.xp} / {hud.next}
            </div>
            <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded bg-[#0c0d0b]">
              <div
                className="h-full rounded bg-[#c9a227]"
                style={{ width: `${Math.round(hud.progress * 100)}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-[#6a7260]">
              Tile {hud.x}, {hud.y}
            </div>
          </div>
        </div>
        <div className="w-fit rounded border border-[#2a2e24] bg-[#161812]/80 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm">
          Move with <span className="text-[#e8e6d9]">WASD</span> or{" "}
          <span className="text-[#e8e6d9]">Arrow keys</span>
        </div>
      </div>
    </div>
  );
}
