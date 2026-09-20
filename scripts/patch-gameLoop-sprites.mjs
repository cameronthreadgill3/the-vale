#!/usr/bin/env node
/** Idempotent: ensure class sprites are wired into gameLoop + gameLoopRender. */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const loop = readFileSync(join(root, "src/game/gameLoop.ts"), "utf8");
const render = readFileSync(join(root, "src/game/gameLoopRender.ts"), "utf8");
if (!loop.includes("facingFromMove") || !render.includes("drawPlayerSprite")) {
  console.error("class sprite wiring missing from gameLoop/gameLoopRender");
  process.exit(1);
}
console.log("gameLoop sprite wiring ok");
