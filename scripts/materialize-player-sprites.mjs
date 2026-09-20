#!/usr/bin/env node
import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function materializeB64(basePath, outPath) {
  if (existsSync(basePath)) {
    const buf = Buffer.from(readFileSync(basePath, "utf8").trim(), "base64");
    writeFileSync(outPath, buf);
    return buf.length;
  }
  const name = basePath.split("/").pop();
  const dir = dirname(basePath);
  const partFiles = readdirSync(dir)
    .filter((f) => f.startsWith(name + ".part"))
    .sort();
  if (partFiles.length === 0) return 0;
  const b64 = partFiles.map((f) => readFileSync(join(dir, f), "utf8").trim()).join("");
  const buf = Buffer.from(b64, "base64");
  writeFileSync(outPath, buf);
  return buf.length;
}

const patchOut = join(root, "scripts/patch-gameLoop-sprites.mjs");
const patchB64 = join(root, "scripts/patch-gameLoop-sprites.mjs.b64");
const n = materializeB64(patchB64, patchOut);
if (n) console.log("wrote patch-gameLoop-sprites.mjs", n);

const dir = join(root, "public/sprites/player");
mkdirSync(dir, { recursive: true });
const classes = ["pathfinder", "thornblade", "hearthmage", "verdant", "hollowborn", "warden"];
for (const id of classes) {
  const b64Path = join(dir, `${id}.png.b64`);
  const out = join(dir, `${id}.png`);
  const n = materializeB64(b64Path, out);
  if (n) console.log("wrote", id + ".png", n);
  else {
    const partFiles = readdirSync(dir).filter((f) => f.startsWith(`${id}.png.b64.part`)).sort();
    if (partFiles.length) {
      const b64 = partFiles.map((f) => readFileSync(join(dir, f), "utf8").trim()).join("");
      const buf = Buffer.from(b64, "base64");
      writeFileSync(out, buf);
      console.log("wrote", id + ".png", buf.length, "(from parts)");
    }
  }
}
