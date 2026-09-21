#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs";
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
assemble("gl\\.b64", "src/game/gameLoop.ts");
// Quest 4+: GameApp, GameShell, quests, README are first-class (not assembled).
assemble("aa\\.b64", "src/account/AccountApp.tsx");
assemble("ch\\.b64", "src/game/character.ts");
assemble("en\\.b64", "src/game/enemies.ts");
