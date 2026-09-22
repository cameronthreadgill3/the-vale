#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, renameSync, copyFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createWriteStream } from "node:fs";
import { readdir, stat, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, "dist-itch");
const zipName = "A-Story-as-Old-as-Time-itch.html5.zip";
const artifacts = join(root, "artifacts");
const workdirArtifacts = "/home/workdir/artifacts";

const build = spawnSync(
  "npx",
  ["vite", "build", "--config", "vite.itch.config.ts"],
  { cwd: root, stdio: "inherit", env: process.env },
);
if (build.status !== 0) process.exit(build.status ?? 1);

const htmlIn = join(outDir, "itch.html");
const htmlOut = join(outDir, "index.html");
if (existsSync(htmlIn)) renameSync(htmlIn, htmlOut);

mkdirSync(artifacts, { recursive: true });
mkdirSync(workdirArtifacts, { recursive: true });

const zipPath = join(artifacts, zipName);
if (existsSync(zipPath)) rmSync(zipPath);

const { default: JSZip } = await import("jszip").catch(async () => {
  spawnSync("npm", ["install", "jszip", "--no-save"], { cwd: root, stdio: "inherit" });
  return import("jszip");
});

const zip = new JSZip();

async function addDir(dir, prefix) {
  const entries = await readdir(dir);
  for (const name of entries) {
    if (name === "__grok") continue;
    const full = join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    const st = await stat(full);
    if (st.isDirectory()) await addDir(full, rel);
    else zip.file(rel, await readFile(full));
  }
}

await addDir(outDir, "");
zip.file("ITCH-SETUP.md", await readFile(join(root, "ITCH-SETUP.md")));

const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 6 } });
const { writeFileSync } = await import("node:fs");
writeFileSync(zipPath, buf);
copyFileSync(zipPath, join(workdirArtifacts, zipName));

const coverSrc = join(root, "screenshots", "title-rebrand.png");
if (existsSync(coverSrc)) {
  copyFileSync(coverSrc, join(artifacts, "cover.png"));
  copyFileSync(coverSrc, join(workdirArtifacts, "cover.png"));
}
copyFileSync(join(root, "ITCH-SETUP.md"), join(artifacts, "ITCH-SETUP.md"));
copyFileSync(join(root, "ITCH-SETUP.md"), join(workdirArtifacts, "ITCH-SETUP.md"));

console.log("packed", zipPath, buf.length);
