#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const parts = [0,1,2].map(i => readFileSync(join(root, `scripts/gameLoop.part${i}.txt`), "utf8"));
writeFileSync(join(root, "src/game/gameLoop.ts"), parts.join(""));
console.log("assembled gameLoop.ts", parts.reduce((a,b)=>a+b.length,0));
