import { createFileRoute, Link } from "@tanstack/react-router";
import { BOOK1, BOOK2, chapterBySlug } from "@/canon/catalog";
import { PROLOGUE, echoFor } from "@/canon/vale-lore";
import { freeBody } from "@/canon/bodies";
import { CanonProse } from "@/components/canon-prose";
import { EchoAside } from "@/components/echo-aside";
import { GateCard } from "@/components/gate-card";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/lib/use-membership";

export const Route = createFileRoute("/_house/read/$slug")({ component: ChapterPage });

function ChapterPage() {
  const { slug } = Route.useParams();
  const { open, authPending } = useMembership();
  const chapter =
    slug === "prologue"
      ? { slug, title: PROLOGUE.title, access: "free" as const, n: 0, book: 1 as const }
      : chapterBySlug(slug);
  const echo = echoFor(slug);
  const body = freeBody(slug);
  const all = [{ slug: "prologue", title: PROLOGUE.title }, ...BOOK1, ...BOOK2];
  const idx = all.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;

  if (!chapter) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-sm text-fg-muted">No chapter by that name.</p>
        <Link to="/read" className="mt-4 inline-block text-sm text-fg hover:underline">
          Back to the shelf
        </Link>
      </div>
    );
  }

  const locked = !open(chapter.access);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">
        {slug === "prologue" ? "Prologue" : `Book ${chapter.book} · Chapter ${chapter.n}`}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance">{chapter.title}</h1>
      {echo && <EchoAside echo={echo} />}

      <div className="mt-10">
        {authPending && chapter.access === "member" ? (
          <div className="h-40 max-w-lg animate-pulse rounded-2xl bg-surface" />
        ) : locked ? (
          <GateCard
            title="The later chapters keep the kettle going"
            copy={`${chapter.title} is a member chapter. Book One stays free. The First Story echo above is not a rewrite.`}
          />
        ) : body ? (
          <CanonProse text={body} />
        ) : chapter.access === "free" ? (
          <div className="max-w-[65ch]">
            {echo && (
              <>
                <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">First Story companion</p>
                <p className="mt-4 text-base leading-relaxed text-pretty text-fg">{echo.spoken}</p>
                <p className="mt-4 text-sm leading-relaxed text-fg-muted">{echo.note}</p>
              </>
            )}
            <p className="mt-8 text-sm leading-relaxed text-fg-muted">
              This chapter is free. The locked manuscript is being typeset onto the house so anyone can read it here without a Drive login. The First Story sits on every chapter in the meantime.
            </p>
          </div>
        ) : (
          <p className="max-w-[65ch] text-sm leading-relaxed text-fg-muted">
            Member text stays on the server. Playback of the full chapter lands here once the vault is wired to a paid period.
          </p>
        )}
      </div>

      <nav className="mt-16 flex max-w-[65ch] items-center justify-between gap-4 border-t border-border pt-6">
        {prev ? (
          <Link to="/read/$slug" params={{ slug: prev.slug }} className="text-sm text-fg-muted hover:text-fg">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        <Button asChild variant="ghost" size="sm">
          <Link to="/read">Shelf</Link>
        </Button>
        {next ? (
          <Link to="/read/$slug" params={{ slug: next.slug }} className="text-sm text-fg-muted hover:text-fg">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
