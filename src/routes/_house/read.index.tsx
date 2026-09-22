import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { BOOK1, BOOK2 } from "@/canon/catalog";
import { PROLOGUE, echoFor } from "@/canon/vale-lore";
import { hasFreeBody } from "@/canon/bodies";
import { useMembership } from "@/lib/use-membership";

export const Route = createFileRoute("/_house/read/")({ component: ReadIndex });

function ReadIndex() {
  const { member } = useMembership();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">The books</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Read</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-fg-muted">
        Book One is free. A First Story echo sits on every chapter — the Vale showing through, not a rewrite. Book Two asks for the kettle.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">The First Trial</h2>
        <p className="mt-1 text-sm text-fg-muted">Book One · Lucas Mercer · free</p>
        <ol className="mt-6 divide-y divide-border border-y border-border">
          <ChapterRow slug="prologue" n="00" title={PROLOGUE.title} access="free" ready />
          {BOOK1.map((c) => (
            <ChapterRow
              key={c.slug}
              slug={c.slug}
              n={String(c.n).padStart(2, "0")}
              title={c.title}
              access="free"
              ready={hasFreeBody(c.slug)}
            />
          ))}
        </ol>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold">The map gets larger</h2>
        <p className="mt-1 text-sm text-fg-muted">Book Two · members</p>
        <ol className="mt-6 divide-y divide-border border-y border-border">
          {BOOK2.map((c) => (
            <ChapterRow
              key={c.slug}
              slug={c.slug}
              n={String(c.n).padStart(2, "0")}
              title={c.title}
              access="member"
              member={member}
              ready={false}
            />
          ))}
        </ol>
      </section>
    </div>
  );
}

function ChapterRow({
  slug,
  n,
  title,
  access,
  member,
  ready,
}: {
  slug: string;
  n: string;
  title: string;
  access: "free" | "member";
  member?: boolean;
  ready: boolean;
}) {
  const locked = access === "member" && !member;
  const echo = echoFor(slug);
  return (
    <li>
      <Link
        to="/read/$slug"
        params={{ slug }}
        className="flex items-start gap-4 py-4 transition-colors hover:bg-surface/60"
      >
        <span className="w-8 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-fg-subtle">{n}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-medium text-fg">{title}</span>
            {locked && <Lock className="size-3.5 text-fg-subtle" />}
          </span>
          {echo && <span className="mt-1 block text-sm text-fg-muted">{echo.note}</span>}
          {access === "free" && !ready && (
            <span className="mt-1 block text-xs text-fg-subtle">First Story companion on the page. Typesetting the full chapter onto the house.</span>
          )}
        </span>
        <span className="shrink-0 pt-0.5 text-xs tracking-wide text-fg-subtle uppercase">
          {locked ? "Member" : access === "member" ? "Open" : "Free"}
        </span>
      </Link>
    </li>
  );
}
