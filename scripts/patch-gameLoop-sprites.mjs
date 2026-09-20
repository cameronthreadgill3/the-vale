#!/usr/bin/env node
/** Idempotent: wire facing/walkFrame into gameLoop if missing. Verify render has drawPlayerSprite. */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const loopPath = join(root, "src/game/gameLoop.ts");
const renderPath = join(root, "src/game/gameLoopRender.ts");
let loop = readFileSync(loopPath, "utf8");
const render = readFileSync(renderPath, "utf8");

if (!render.includes("drawPlayerSprite")) {
  console.error("gameLoopRender missing drawPlayerSprite");
  process.exit(1);
}

if (!loop.includes("facingFromMove")) {
  if (!loop.includes('from "@/game/playerSprites"')) {
    const needle = "import { createPlayerAttack } from \"@/game/gameLoopCombat\";\n";
    if (!loop.includes(needle)) {
      console.error("import anchor not found");
      process.exit(1);
    }
    loop = loop.replace(
      needle,
      needle +
        "import {\n" +
        "  facingFromMove,\n" +
        "  preloadPlayerSprite,\n" +
        "  WALK_FPS,\n" +
        "  type Facing,\n" +
        '} from "@/game/playerSprites";\n',
    );
  }

  if (!loop.includes("let facing:")) {
    const needle = "let playerFlash = 0;\n";
    if (!loop.includes(needle)) {
      console.error("playerFlash anchor not found");
      process.exit(1);
    }
    loop = loop.replace(
      needle,
      needle +
        '    let facing: Facing = "south";\n' +
        "    let walkFrame = 0;\n" +
        "    let walkAccum = 0;\n" +
        "    void preloadPlayerSprite(character.classId);\n",
    );
  }

  if (!loop.includes("facing = facingFromMove")) {
    const old =
      "      if (moved) {\n" +
      "        passiveAccum.current += PASSIVE_SKILL_XP_PER_SEC * dt;\n" +
      "        if (passiveAccum.current >= 1) {\n" +
      "          const grant = Math.floor(passiveAccum.current);\n" +
      "          passiveAccum.current -= grant;\n" +
      "          passiveRef.current(grant);\n" +
      "        }\n" +
      "      }";
    const neu =
      "      if (moved) {\n" +
      "        facing = facingFromMove(dx, dy, facing);\n" +
      "        walkAccum += dt;\n" +
      "        const frameDur = 1 / WALK_FPS;\n" +
      "        while (walkAccum >= frameDur) {\n" +
      "          walkAccum -= frameDur;\n" +
      "          walkFrame = (walkFrame + 1) % 4;\n" +
      "        }\n" +
      "        passiveAccum.current += PASSIVE_SKILL_XP_PER_SEC * dt;\n" +
      "        if (passiveAccum.current >= 1) {\n" +
      "          const grant = Math.floor(passiveAccum.current);\n" +
      "          passiveAccum.current -= grant;\n" +
      "          passiveRef.current(grant);\n" +
      "        }\n" +
      "      } else {\n" +
      "        walkFrame = 0;\n" +
      "        walkAccum = 0;\n" +
      "      }";
    if (!loop.includes(old)) {
      console.error("moved-block anchor not found");
      process.exit(1);
    }
    loop = loop.replace(old, neu);
  }

  if (!loop.includes("facing,\n        walkFrame,")) {
    const old = "        playerFlash,\n        accent: accentRef.current,";
    const neu =
      "        playerFlash,\n" +
      "        facing,\n" +
      "        walkFrame,\n" +
      "        accent: accentRef.current,";
    if (!loop.includes(old)) {
      console.error("render-args anchor not found");
      process.exit(1);
    }
    loop = loop.replace(old, neu);
  }

  writeFileSync(loopPath, loop);
  console.log("patched gameLoop.ts for class sprites");
} else {
  console.log("gameLoop sprite wiring ok");
}

loop = readFileSync(loopPath, "utf8");
if (!loop.includes("facingFromMove") || !render.includes("drawPlayerSprite")) {
  console.error("class sprite wiring missing after patch");
  process.exit(1);
}
