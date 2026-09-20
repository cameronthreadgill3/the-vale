#!/usr/bin/env node
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scriptsDir = join(root, "scripts");
const outDir = join(root, "public/sprites/player");
mkdirSync(outDir, { recursive: true });
const dataDir = join(scriptsDir, "sprite-data");
const classes = ["pathfinder", "thornblade", "hearthmage", "verdant", "hollowborn", "warden"];

function stripB64(s) {
  return s.replace(/\s+/g, "");
}

function joinParts(dir, prefix) {
  const partFiles = readdirSync(dir).filter((f) => f.startsWith(prefix + ".part")).sort();
  if (!partFiles.length) return null;
  return stripB64(partFiles.map((f) => readFileSync(join(dir, f), "utf8")).join(""));
}

if (!existsSync(dataDir)) {
  console.warn("no scripts/sprite-data; skipping materialize");
  process.exit(0);
}
for (const id of classes) {
  const single = join(dataDir, `${id}.b64`);
  let b64 = null;
  if (existsSync(single)) b64 = stripB64(readFileSync(single, "utf8"));
  else b64 = joinParts(dataDir, `${id}.b64`);
  if (!b64) {
    console.warn("missing b64 for", id);
    continue;
  }
  const buf = Buffer.from(b64, "base64");
  writeFileSync(join(outDir, `${id}.png`), buf);
  console.log("wrote", id + ".png", buf.length);
}
