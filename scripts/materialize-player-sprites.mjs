#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scriptsDir = join(root, "scripts");

function joinParts(dir, prefix) {
  const partFiles = readdirSync(dir).filter((f) => f.startsWith(prefix + ".part")).sort();
  if (!partFiles.length) return null;
  return partFiles.map((f) => readFileSync(join(dir, f), "utf8").trim()).join("");
}

const patchOut = join(scriptsDir, "patch-gameLoop-sprites.mjs");
const patchB64 = join(scriptsDir, "patch-gameLoop-sprites.mjs.b64");
if (existsSync(patchB64)) {
  writeFileSync(patchOut, Buffer.from(readFileSync(patchB64, "utf8").trim(), "base64"));
  console.log("wrote patch-gameLoop-sprites.mjs from .b64");
} else {
  const joined = joinParts(scriptsDir, "patch-gameLoop-sprites.mjs.b64");
  if (joined) {
    writeFileSync(patchOut, Buffer.from(joined, "base64"));
    console.log("wrote patch-gameLoop-sprites.mjs from parts");
  }
}

const outDir = join(root, "public/sprites/player");
mkdirSync(outDir, { recursive: true });
const dataDir = join(scriptsDir, "sprite-data");
const classes = ["pathfinder", "thornblade", "hearthmage", "verdant", "hollowborn", "warden"];

if (existsSync(dataDir)) {
  for (const id of classes) {
    const p = join(dataDir, `${id}.b64`);
    if (!existsSync(p)) continue;
    const buf = Buffer.from(readFileSync(p, "utf8").trim(), "base64");
    writeFileSync(join(outDir, `${id}.png`), buf);
    console.log("wrote", id + ".png", buf.length);
  }
  process.exit(0);
}

for (const id of classes) {
  const single = join(outDir, `${id}.png.b64`);
  if (existsSync(single)) {
    const buf = Buffer.from(readFileSync(single, "utf8").trim(), "base64");
    writeFileSync(join(outDir, `${id}.png`), buf);
    console.log("wrote", id + ".png", buf.length);
  }
}
