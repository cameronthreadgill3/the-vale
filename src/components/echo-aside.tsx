import type { ChapterEcho } from "@/canon/vale-lore";

export function EchoAside({ echo }: { echo: ChapterEcho }) {
  return (
    <aside className="mt-6 max-w-[65ch] rounded-xl border border-border bg-surface px-5 py-4">
      <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">First Story</p>
      <p className="mt-2 text-sm font-medium text-fg">{echo.vale}</p>
      <p className="mt-1 text-sm leading-relaxed text-fg-muted">{echo.note}</p>
    </aside>
  );
}
