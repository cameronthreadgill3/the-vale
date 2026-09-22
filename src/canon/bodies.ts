import { PROLOGUE } from "./vale-lore";

const files = import.meta.glob("./chapters/*.md", {
  query: "?raw",
  eager: true,
  import: "default",
}) as Record<string, string>;

export function freeBody(slug: string): string | undefined {
  if (slug === "prologue") return PROLOGUE.body;
  const hit = Object.entries(files).find(([path]) => path.endsWith(`/${slug}.md`));
  return hit?.[1];
}

export function hasFreeBody(slug: string): boolean {
  return Boolean(freeBody(slug));
}
