import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { echoFor } from "@/canon/vale-lore";
import { freeBody } from "@/canon/bodies";
import { CanonProse } from "@/components/canon-prose";
import { EchoAside } from "@/components/echo-aside";
import { GateCard } from "@/components/gate-card";
import { SpeechPlayer } from "@/components/speech-player";
import { Button } from "@/components/ui/button";
import type { MediaItem, MediaKind } from "@/canon/catalog";
import { mediaList, vaultForAccess, VAULTS } from "@/canon/catalog";
import { useMembership } from "@/lib/use-membership";

const KIND_META: Record<MediaKind, { kicker: string; listTo: "/audio" | "/anime" | "/comics"; listLabel: string }> = {
  audio: { kicker: "Voices", listTo: "/audio", listLabel: "All tracks" },
  anime: { kicker: "Episodes", listTo: "/anime", listLabel: "All episodes" },
  comic: { kicker: "Issues", listTo: "/comics", listLabel: "All issues" },
};

export function MediaDetail({ item, kind }: { item: MediaItem; kind: MediaKind }) {
  const { open, authPending } = useMembership();
  const echo = echoFor(item.slug);
  const body = freeBody(item.slug);
  const meta = KIND_META[kind];
  const list = mediaList(kind);
  const idx = list.findIndex((m) => m.id === item.id);
  const prev = idx > 0 ? list[idx - 1] : undefined;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined;
  const still = item.still ?? echoStill(item.slug);
  const locked = !open(item.access);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">{meta.kicker}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance">{item.title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-fg-muted">{item.note}</p>
      {echo && <EchoAside echo={echo} />}

      {still && (
        <figure className="mt-10 max-w-3xl overflow-hidden rounded-2xl border border-border">
          <img src={still} alt="" className="aspect-video w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10" />
        </figure>
      )}

      <div className="mt-10">
        {authPending ? (
          <div className="h-40 max-w-lg animate-pulse rounded-2xl bg-surface" />
        ) : locked ? (
          <GateCard
            title="Member vault"
            copy={`${item.title} unlocks with ${vaultForAccess(item.access) === "kettle" ? "the kettle" : VAULTS[vaultForAccess(item.access)].label.toLowerCase()}. Book One in prose stays free. The First Story echo above is the Vale showing through — not a rewrite.`}
            vault={vaultForAccess(item.access)}
          />
        ) : (
          <div className="max-w-[65ch]">
            {kind === "audio" && echo && (
              <div className="mb-8">
                <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">Spoken First Story</p>
                <p className="mt-3 text-sm leading-relaxed text-pretty text-fg">{echo.spoken}</p>
                <div className="mt-4">
                  <SpeechPlayer label="the echo" text={echo.spoken} />
                </div>
              </div>
            )}
            {kind === "anime" && echo && (
              <ol className="mb-10 divide-y divide-border border-y border-border">
                <Scene n="01" title="The Vale, under the copy" body={echo.note} />
                <Scene n="02" title="Hollow Reach" body={item.note} />
                <Scene n="03" title="What shows through" body={echo.spoken} />
              </ol>
            )}
            {kind === "comic" && echo && (
              <div className="mb-10 grid gap-3 sm:grid-cols-2">
                <Panel kicker="Panel 01" title={echo.vale} body={echo.note} />
                <Panel kicker="Panel 02" title={item.title} body={item.note} />
                <Panel kicker="Panel 03" title="The copy" body={echo.spoken} />
                <Panel kicker="Panel 04" title="Do not rewrite" body="Lucas stays in his trial. The Vale is texture, not a transplant." />
              </div>
            )}
            {body ? (
              <>
                <p className="mb-4 text-xs tracking-[0.18em] text-fg-subtle uppercase">
                  {kind === "audio" ? "Locked to canon" : "Companion prose"}
                </p>
                {kind === "audio" && <SpeechPlayer label="the chapter" text={body.slice(0, 12000)} />}
                <div className="mt-8">
                  <CanonProse text={body} />
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-pretty text-fg-muted">
                The First Story echo is on this page. Full canon playback of this {kind} lands here from the house vault.
              </p>
            )}
          </div>
        )}
      </div>

      <nav className="mt-16 flex max-w-[65ch] items-center justify-between gap-4 border-t border-border pt-6">
        {prev ? (
          <MediaNav kind={kind} id={prev.id}>
            ← {prev.title}
          </MediaNav>
        ) : (
          <span />
        )}
        <Button asChild variant="ghost" size="sm">
          <Link to={meta.listTo}>{meta.listLabel}</Link>
        </Button>
        {next ? (
          <MediaNav kind={kind} id={next.id}>
            {next.title} →
          </MediaNav>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

function MediaNav({ kind, id, children }: { kind: MediaKind; id: string; children: ReactNode }) {
  const className = "text-sm text-fg-muted hover:text-fg";
  if (kind === "audio") {
    return (
      <Link to="/audio/$id" params={{ id }} className={className}>
        {children}
      </Link>
    );
  }
  if (kind === "anime") {
    return (
      <Link to="/anime/$id" params={{ id }} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/comics/$id" params={{ id }} className={className}>
      {children}
    </Link>
  );
}

function Scene({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="py-5">
      <p className="font-mono text-xs tabular-nums text-fg-subtle">{n}</p>
      <p className="mt-1 font-medium text-fg">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-pretty text-fg-muted">{body}</p>
    </li>
  );
}

function Panel({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">{kicker}</p>
      <p className="mt-2 text-sm font-medium text-fg">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-pretty text-fg-muted">{body}</p>
    </div>
  );
}

function echoStill(slug: string) {
  if (slug === "b1-c01") return "/house/accession.jpg";
  if (slug === "b1-c02") return "/house/hounds.jpg";
  if (slug === "b1-c07") return "/house/hearth.jpg";
  if (slug === "b1-c12" || slug === "b1-c13" || slug === "b1-c29") return "/house/sunken.jpg";
  if (slug === "b1-c21" || slug === "b1-c25") return "/house/glasswaste.jpg";
  if (slug === "b1-c31") return "/house/kettle.jpg";
  return "/house/fountain.jpg";
}
