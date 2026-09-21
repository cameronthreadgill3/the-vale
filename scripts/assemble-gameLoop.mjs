#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "scripts");
const files = readdirSync(dir).filter((f) => /^gl\.b64\.\d+$/.test(f)).sort();
const b64 = files.map((f) => readFileSync(join(dir, f), "utf8")).join("");
const buf = Buffer.from(b64, "base64");
writeFileSync(join(root, "src/game/gameLoop.ts"), buf);
console.log("assembled gameLoop.ts", buf.length, "from", files.length, "b64 parts");
