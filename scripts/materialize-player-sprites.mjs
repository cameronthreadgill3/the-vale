#!/usr/bin/env node
import { mkdirSync, writeFileSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public/sprites/player");
mkdirSync(dir, { recursive: true });
const files = readdirSync(dir).filter((f) => f.endsWith(".png.b64"));
if (files.length === 0) {
  console.warn("no .png.b64 sidecars; skipping materialize");
  process.exit(0);
}
for (const f of files) {
  const id = f.replace(/\.png\.b64$/, "");
  const b64 = readFileSync(join(dir, f), "utf8").trim();
  const buf = Buffer.from(b64, "base64");
  writeFileSync(join(dir, `${id}.png`), buf);
  console.log("wrote", id + ".png", buf.length);
}
