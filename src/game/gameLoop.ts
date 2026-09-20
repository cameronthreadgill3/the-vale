import { useEffect, type Dispatch, type SetStateAction, type MutableRefObject, type RefObject } from "react";
import { type ValeClass } from "@/game/classes";
import { getContinent, type ContinentId } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";
import { SKILL_IDS, type SkillId } from "@/game/skills";
import { levelFromXp, progressInLevel, xpToNext } from "@/game/xp";
import {
TILE, isSolid, loadLocationMap, nearTile, spawnNearArrivalGate, type WorldMap,
} from "@/game/world";
import {
PLAYER_SPEED, PLAYER_RADIUS, PASSIVE_SKILL_XP_PER_SEC, INTERACT_RADIUS,
type PromptState, type HudState,
} from "@/game/canvasConstants";
import {
folkOnContinent,
shopsOnContinent,
docksOnContinent,
} from "@/game/folk";
import {
softClearAll,
softClearTile,
drawShipDocks,
drawShopMarkers,
drawNamedFolk,
} from "@/game/folkCanvas";
export function useGameLoopEffect(d: {
canvasRef: RefObject<HTMLCanvasElement | null>;
keysRef: MutableRefObject<Record<string, boolean>>;
accentRef: MutableRefObject<ValeClass>;
passiveRef: MutableRefObject<(n: number) => void>;
trainRef: MutableRefObject<(s: SkillId) => void>;
toggleSkillsRef: MutableRefObject<() => void>;
toggleMapRef: MutableRefObject<() => void>;
travelRef: MutableRefObject<(t: ContinentId, f: ContinentId) => void>;
enterHollowRef: MutableRefObject<(i: number, r: { x: number; y: number }) => void>;
exitHollowRef: MutableRefObject<() => void>;
openFolkRef: MutableRefObject<(folkId: string) => void>;
openShopRef: MutableRefObject<(shopId: string) => void>;
openShipRef: MutableRefObject<(dockId: string) => void>;
passiveAccum: MutableRefObject<number>;
promptRef: MutableRefObject<PromptState>;
interactLock: MutableRefObject<boolean>;
character: ValeCharacter;
arrivedFrom: ContinentId | null;
shipSpawn: { x: number; y: number } | null;
combatXp: number;
setHud: Dispatch<SetStateAction<HudState>>;
setPrompt: Dispatch<SetStateAction<PromptState>>;
}): void {
const {
canvasRef, keysRef, accentRef, passiveRef, trainRef, toggleSkillsRef, toggleMapRef,
travelRef, enterHollowRef, exitHollowRef, openFolkRef, openShopRef, openShipRef,
passiveAccum, promptRef, interactLock,
character, arrivedFrom, shipSpawn, combatXp, setHud, setPrompt,
} = d;
useEffect(() => {
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext("2d");
if (!ctx) return;
const map: WorldMap = loadLocationMap(
character.continentId,
character.hollowIndex,
character.hollowReturn,
);
const folk = map.kind === "overworld" ? folkOnContinent(character.continentId) : [];
const shops = map.kind === "overworld" ? shopsOnContinent(character.continentId) : [];
const docks = map.kind === "overworld" ? docksOnContinent(character.continentId) : [];
softClearAll(map, folk, shops, docks);
let spawnTile = map.spawn;
if (map.kind === "overworld") {
if (shipSpawn) {
spawnTile = { x: shipSpawn.x, y: shipSpawn.y };
softClearTile(map, spawnTile.x, spawnTile.y);
} else if (character.hollowReturn) {
const r = character.hollowReturn;
const candidates = [
{ x: r.x, y: r.y + 1 },
{ x: r.x, y: r.y - 1 },
{ x: r.x + 1, y: r.y },
{ x: r.x - 1, y: r.y },
];
spawnTile = { x: r.x, y: r.y };
for (const c of candidates) {
if (
c.x > 0 &&
c.y > 0 &&
c.x < map.width - 1 &&
c.y < map.height - 1 &&
!isSolid(map.tiles[c.y]![c.x]!, map.kind)
) {
spawnTile = c;
break;
}
}
} else {
spawnTile = spawnNearArrivalGate(map, arrivedFrom);
}
}
const xp = combatXp;
const combatLevel = levelFromXp(xp);
const player = {
x: (spawnTile.x + 0.5) * TILE,
y: (spawnTile.y + 0.5) * TILE,
};
let camX = player.x;
let camY = player.y;
let raf = 0;
let last = performance.now();
let running = true;
let hudAccum = 0;
let promptAccum = 0;
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
const doInteract = () => {
if (interactLock.current) return;
const p = promptRef.current;
if (!p) return;
interactLock.current = true;
window.setTimeout(() => {
interactLock.current = false;
}, 400);
if (p.kind === "gate") {
travelRef.current(p.target, character.continentId);
} else if (p.kind === "hollow") {
const tx = Math.floor(player.x / TILE);
const ty = Math.floor(player.y / TILE);
enterHollowRef.current(p.index, { x: tx, y: ty });
} else if (p.kind === "exit") {
exitHollowRef.current();
} else if (p.kind === "folk") {
openFolkRef.current(p.folkId);
} else if (p.kind === "shop") {
openShopRef.current(p.shopId);
} else if (p.kind === "ship") {
openShipRef.current(p.dockId);
}
};
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
if (e.code === "KeyK" && !e.repeat) {
e.preventDefault();
toggleSkillsRef.current();
}
if (e.code === "KeyM" && !e.repeat) {
e.preventDefault();
toggleMapRef.current();
}
if (e.code === "KeyE" && !e.repeat) {
e.preventDefault();
doInteract();
}
if (!e.repeat && e.key >= "1" && e.key <= "7") {
const idx = Number(e.key) - 1;
const skill = SKILL_IDS[idx];
if (skill) {
e.preventDefault();
trainRef.current(skill);
}
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
if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
if (isSolid(map.tiles[ty]![tx]!, map.kind)) return false;
}
player.x = nx;
player.y = ny;
return true;
};
const updatePrompt = () => {
const px = player.x / TILE;
const py = player.y / TILE;
let next: PromptState = null;
if (map.kind === "overworld") {
for (const g of map.gates) {
if (nearTile(px, py, g.x, g.y, INTERACT_RADIUS)) {
next = {
kind: "gate",
target: g.targetContinentId,
name: getContinent(g.targetContinentId).name,
};
break;
}
}
if (!next) {
for (const h of map.hollows) {
if (nearTile(px, py, h.x, h.y, INTERACT_RADIUS)) {
next = { kind: "hollow", index: h.index };
break;
}
}
}
if (!next) {
for (const dk of docks) {
if (nearTile(px, py, dk.x, dk.y, INTERACT_RADIUS)) {
next = { kind: "ship", dockId: dk.id, name: dk.name };
break;
}
}
}
if (!next) {
for (const f of folk) {
if (nearTile(px, py, f.x, f.y, INTERACT_RADIUS)) {
next = {
kind: "folk",
folkId: f.id,
name: f.name,
hasShop: Boolean(f.shopId),
};
break;
}
}
}
if (!next) {
for (const s of shops) {
if (nearTile(px, py, s.x, s.y, INTERACT_RADIUS)) {
next = { kind: "shop", shopId: s.id, name: s.name };
break;
}
}
}
} else if (map.exit && nearTile(px, py, map.exit.x, map.exit.y, INTERACT_RADIUS)) {
next = { kind: "exit" };
}
promptRef.current = next;
return next;
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
let moved = false;
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
moved = true;
}
if (moved) {
passiveAccum.current += PASSIVE_SKILL_XP_PER_SEC * dt;
if (passiveAccum.current >= 1) {
const grant = Math.floor(passiveAccum.current);
passiveAccum.current -= grant;
passiveRef.current(grant);
}
}
const standingTx = Math.floor(player.x / TILE);
const standingTy = Math.floor(player.y / TILE);
if (
standingTx >= 0 &&
standingTy >= 0 &&
standingTx < map.width &&
standingTy < map.height &&
!interactLock.current
) {
const stand = map.tiles[standingTy]![standingTx]!;
if (stand === "gate") {
const g = map.gates.find((x) => x.x === standingTx && x.y === standingTy);
if (g) {
interactLock.current = true;
travelRef.current(g.targetContinentId, character.continentId);
return;
}
} else if (stand === "hollow") {
const h = map.hollows.find((x) => x.x === standingTx && x.y === standingTy);
if (h) {
interactLock.current = true;
enterHollowRef.current(h.index, { x: standingTx, y: standingTy });
return;
}
} else if (stand === "exit") {
interactLock.current = true;
exitHollowRef.current();
return;
}
}
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
const endTX = Math.min(
map.width - 1,
Math.ceil((originX + viewW) / TILE) + 1,
);
const endTY = Math.min(
map.height - 1,
Math.ceil((originY + viewH) / TILE) + 1,
);
const pal = map.palette;
for (let ty = startTY; ty <= endTY; ty++) {
for (let tx = startTX; tx <= endTX; tx++) {
const kind = map.tiles[ty]![tx]!;
ctx.fillStyle = pal[kind];
const sx = Math.floor(tx * TILE - originX);
const sy = Math.floor(ty * TILE - originY);
ctx.fillRect(sx, sy, TILE + 1, TILE + 1);
if (kind === "grass" || kind === "grassAlt") {
ctx.fillStyle = "rgba(0,0,0,0.08)";
ctx.fillRect(sx, sy, TILE + 1, 1);
ctx.fillRect(sx, sy, 1, TILE + 1);
}
if (kind === "gate") {
ctx.strokeStyle = "#e8e6d9";
ctx.lineWidth = 2;
ctx.strokeRect(sx + 4, sy + 4, TILE - 8, TILE - 8);
ctx.fillStyle = "rgba(255,255,255,0.15)";
ctx.fillRect(sx + 8, sy + 8, TILE - 16, TILE - 16);
} else if (kind === "hollow") {
ctx.beginPath();
ctx.fillStyle = "rgba(0,0,0,0.45)";
ctx.arc(sx + TILE / 2, sy + TILE / 2, 10, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = pal.hollow;
ctx.lineWidth = 2;
ctx.stroke();
} else if (kind === "exit") {
ctx.strokeStyle = pal.exit;
ctx.lineWidth = 2;
ctx.strokeRect(sx + 6, sy + 6, TILE - 12, TILE - 12);
ctx.fillStyle = "rgba(200,180,100,0.25)";
ctx.fillRect(sx + 10, sy + 10, TILE - 20, TILE - 20);
}
}
}
if (map.darkness > 0) {
ctx.fillStyle = `rgba(0,0,0,${map.darkness})`;
ctx.fillRect(0, 0, viewW, viewH);
}
drawShipDocks(ctx, docks, originX, originY);
drawShopMarkers(ctx, shops, folk, originX, originY);
drawNamedFolk(ctx, folk, originX, originY);
const px = Math.floor(player.x - originX);
const py = Math.floor(player.y - originY);
ctx.fillStyle = "rgba(0,0,0,0.35)";
ctx.beginPath();
ctx.ellipse(
px,
py + 6,
PLAYER_RADIUS * 0.9,
PLAYER_RADIUS * 0.45,
0,
0,
Math.PI * 2,
);
ctx.fill();
const ac = accentRef.current;
const grad = ctx.createRadialGradient(
px - 3,
py - 4,
2,
px,
py,
PLAYER_RADIUS + 2,
);
grad.addColorStop(0, ac.accentLite);
grad.addColorStop(0.6, ac.accent);
grad.addColorStop(1, ac.accentDark);
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
level: combatLevel,
xp,
progress: progressInLevel(combatLevel, xp),
next: xpToNext(combatLevel),
});
}
promptAccum += dt;
if (promptAccum >= 0.15) {
promptAccum = 0;
const next = updatePrompt();
setPrompt(next);
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
}
