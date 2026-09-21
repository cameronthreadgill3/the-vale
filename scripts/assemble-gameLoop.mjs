#!/usr/bin/env node
/**
 * Assemble opaque b64 sources used by a few large modules.
 * character.ts is first-class; GameApp.tsx assembles from ga.b64.* when present.
 */
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "scripts");
function assemble(prefix, outRel) {
  const files = readdirSync(dir).filter((f) => new RegExp("^" + prefix + "\\.\\d+$").test(f)).sort();
  if (files.length === 0) return;
  const b64 = files.map((f) => readFileSync(join(dir, f), "utf8")).join("");
  const buf = Buffer.from(b64, "base64");
  writeFileSync(join(root, outRel), buf);
  console.log("assembled", outRel, buf.length, "from", files.length, "b64 parts");
}
function pack(prefix, srcRel, chunkSize) {
  const src = readFileSync(join(root, srcRel));
  const b64 = src.toString("base64");
  const old = readdirSync(dir).filter((f) => new RegExp("^" + prefix + "\\.\\d+$").test(f));
  for (const f of old) unlinkSync(join(dir, f));
  const name = prefix.replace(/\\/g, "");
  let n = 0;
  for (let i = 0; i < b64.length; i += chunkSize, n++) {
    writeFileSync(
      join(dir, `${name}.${String(n).padStart(2, "0")}`),
      b64.slice(i, i + chunkSize),
    );
  }
  console.log("packed", srcRel, "→", n, name, "parts");
}
if (process.argv.includes("--pack-enemies")) {
  pack("en\\.b64", "src/game/enemies.ts", 800);
}
if (process.argv.includes("--pack-readme")) {
  pack("rd\\.b64", "README.md", 800);
}
if (process.argv.includes("--pack-gameapp")) {
  pack("ga\\.b64", "src/game/GameApp.tsx", 800);
}
if (process.argv.includes("--pack-quests")) {
  pack("qq\\.b64", "src/game/quests.ts", 800);
}
if (process.argv.includes("--pack-gameshell")) {
  pack("gs\\.b64", "src/game/GameShell.tsx", 800);
}
assemble("gl\\.b64", "src/game/gameLoop.ts");
assemble("aa\\.b64", "src/account/AccountApp.tsx");
assemble("qq\\.b64", "src/game/quests.ts");
assemble("en\\.b64", "src/game/enemies.ts");
assemble("gs\\.b64", "src/game/GameShell.tsx");
assemble("rd\\.b64", "README.md");
assemble("ga\\.b64", "src/game/GameApp.tsx");
