#!/usr/bin/env node
/**
 * Convert google_drive_read_file MCP dumps into house-reader markdown.
 * Maps Drive file_id → b1-cXX.md using the catalog.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const catalogPath = "/workspace/src/canon/catalog.ts";
const src = readFileSync(catalogPath, "utf8");
const idToSlug = new Map();
const slugToTitle = new Map();
for (const m of src.matchAll(
  /\{\s*slug:\s*"([^"]+)"[^}]*title:\s*"([^"]+)"[^}]*driveId:\s*"([^"]+)"/g,
)) {
  idToSlug.set(m[3], m[1]);
  slugToTitle.set(m[1], m[2]);
}

const dumpDir = "/workspace/artifacts/.tmp/mcp-results";
const artifactCanon = "/workspace/artifacts/canon";
const outDir = "/workspace/src/canon/chapters";
mkdirSync(outDir, { recursive: true });

function unescapeDrive(s) {
  return s
    .replace(/\\\\([.!+])/g, "$1")
    .replace(/\\([.!+])/g, "$1")
    .replace(/Ding\\\\\\!/g, "Ding!")
    .replace(/Ding\\\\!/g, "Ding!")
    .replace(/Ding\\!/g, "Ding!");
}

function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bA\b/g, "a")
    .replace(/\bThe\b/g, "The")
    .replace(/\bOf\b/g, "of")
    .replace(/\bIn\b/g, "in")
    .replace(/\bOn\b/g, "on");
}

function toMarkdown(content, slug) {
  const text = unescapeDrive(content).replace(/\r\n/g, "\n").trim();
  const lines = text.split("\n");
  let n = Number(slug.match(/c(\d+)/)?.[1] ?? 0);
  let title = slugToTitle.get(slug) ?? "Untitled";
  let i = 0;
  while (i < Math.min(8, lines.length)) {
    const line = (lines[i] ?? "").trim();
    const ch = line.match(/^CHAPTER\s+(\d+)/i);
    if (ch) {
      n = Number(ch[1]);
      i++;
      continue;
    }
    if (line && !/^CHAPTER/i.test(line)) {
      const candidate = line.replace(/\s+/g, " ").trim();
      if (candidate.length > 2 && candidate.length < 80) {
        title = /[a-z]/.test(candidate) ? candidate : titleCase(candidate);
      }
      i++;
      break;
    }
    i++;
  }
  while (i < lines.length && !(lines[i] ?? "").trim()) i++;
  const body = lines
    .slice(i)
    .join("\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return `# Chapter ${n}\n## ${title}\n\n${body}\n`;
}

function ingestContent(id, content, name = "") {
  const slug = idToSlug.get(id);
  if (!slug || !content || content.length < 400) return false;
  const md = toMarkdown(content, slug);
  writeFileSync(join(outDir, `${slug}.md`), md);
  process.stdout.write(`${slug}  ${md.length} chars  ${name}\n`);
  return true;
}

const seen = new Map();

if (existsSync(dumpDir)) {
  for (const name of readdirSync(dumpDir)) {
    if (!name.startsWith("google_drive_read_file-") || !name.endsWith(".json")) continue;
    const path = join(dumpDir, name);
    let raw;
    try {
      raw = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      continue;
    }
    const id = raw.file_id;
    const slug = idToSlug.get(id);
    if (!slug || !raw.content) continue;
    const prev = seen.get(slug) ?? 0;
    if (raw.content.length < prev) continue;
    seen.set(slug, raw.content.length);
    ingestContent(id, raw.content, raw.name ?? name);
  }
}

if (existsSync(artifactCanon)) {
  for (const name of readdirSync(artifactCanon)) {
    const path = join(artifactCanon, name);
    try {
      const text = readFileSync(path, "utf8");
      const idMatch = text.match(/file_id["']?\s*[:=]\s*["']([A-Za-z0-9_-]{20,})["']/);
      if (idMatch) ingestContent(idMatch[1], text, name);
    } catch {
      /* skip binaries */
    }
  }
}
