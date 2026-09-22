#!/usr/bin/env node
/**
 * Nitro's vercel preset emits the PGLite JS bundle but not the WASM/data
 * sidecars it opens by relative path. Copy them next to the chunk so
 * `vite preview` (and the deployed function) can boot without DATABASE_URL.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules/@electric-sql/pglite/dist");
const dest = join(root, ".vercel/output/functions/__server.func/_libs");
if (!existsSync(dest)) process.exit(0);
mkdirSync(dest, { recursive: true });
for (const name of ["pglite.wasm", "pglite.data", "initdb.wasm"]) {
  const from = join(src, name);
  if (!existsSync(from)) continue;
  copyFileSync(from, join(dest, name));
}
