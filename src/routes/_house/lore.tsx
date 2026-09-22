import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { VALE_LORE, PROLOGUE, VOCATIONS, CONTINENTS, RANKS, TRACKS, FOLK } from "@/canon/vale-lore";
import { CanonProse } from "@/components/canon-prose";

export const Route = createFileRoute("/_house/lore")({ component: Lore });

function Lore() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">Canon</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance">{VALE_LORE.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-pretty text-fg-muted">{VALE_LORE.kicker}.</p>

      <figure className="mt-10 overflow-hidden rounded-2xl border border-border">
        <img
          src="/house/fountain.jpg"
          alt="Thornhearth square. A fountain that does not charge."
          className="aspect-video w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
        <figcaption className="px-5 py-3 text-xs tracking-[0.16em] text-fg-subtle uppercase">
          Thornhearth · the fountain does not charge
        </figcaption>
      </figure>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <CanonProse text={PROLOGUE.body} />
        <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
          <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">Do not rewrite</p>
          <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-fg-muted">
            {VALE_LORE.instruction.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <Button asChild className="mt-6 w-full">
            <Link to="/read/$slug" params={{ slug: "prologue" }}>
              Open in the reader
            </Link>
          </Button>
        </aside>
      </div>

      <h2 className="mt-20 font-display text-2xl font-semibold">The six</h2>
      <p className="mt-2 max-w-xl text-sm text-fg-muted">
        Hollow Reach waits until you earn a word. The Vale used to hand these out by name.
      </p>
      <ul className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {VOCATIONS.map((v) => (
          <li key={v.id} className="bg-bg p-6">
            <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">{v.epithet}</p>
            <h3 className="mt-2 font-display text-xl font-semibold">{v.name}</h3>
            <p className="mt-1 text-sm text-fg">{v.vow}</p>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">{v.vale}</p>
            <p className="mt-2 text-sm leading-relaxed text-fg-subtle">{v.reach}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-20 font-display text-2xl font-semibold">Eight continents</h2>
      <p className="mt-2 max-w-xl text-sm text-fg-muted">
        Five cities, fifteen towns, twenty villages on each. Roads that cost nothing. Glasswaste would not take a gate.
      </p>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {CONTINENTS.map((c) => (
          <li key={c.id} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-8">
            <p className="text-sm font-medium text-fg">{c.name}</p>
            <p className="text-sm leading-relaxed text-fg-muted">{c.blurb}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <img
          src="/house/sunken.jpg"
          alt="A sunken road of worked stone."
          className="aspect-video w-full rounded-2xl object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
        <img
          src="/house/glasswaste.jpg"
          alt="Glasswaste. Ship-only."
          className="aspect-video w-full rounded-2xl object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
      </div>

      <h2 className="mt-20 font-display text-2xl font-semibold">Tracks and ranks</h2>
      <p className="mt-2 max-w-xl text-sm text-fg-muted">
        No single overall level. Race, Class, Profession. Concordance waits at the cap.
      </p>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {TRACKS.map((t) => (
          <li key={t.name} className="rounded-2xl border border-border bg-surface p-6">
            <p className="font-display text-lg font-semibold">{t.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{t.note}</p>
          </li>
        ))}
      </ul>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {RANKS.map((r) => (
          <li key={r.rank} className="grid grid-cols-[3rem_6rem_1fr] items-baseline gap-4 py-3">
            <p className="font-mono text-sm text-fg">{r.rank}</p>
            <p className="font-mono text-xs tabular-nums text-fg-subtle">{r.levels}</p>
            <p className="text-sm text-fg-muted">{r.note}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-20 font-display text-2xl font-semibold">Ordinary</h2>
      <p className="mt-2 max-w-xl text-sm text-fg-muted">
        Echo the type, not the names, unless a locked chapter already used them.
      </p>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {FOLK.map((f) => (
          <li key={f.vale} className="grid gap-1 py-5 sm:grid-cols-2 sm:gap-8">
            <p className="text-sm font-medium text-fg">{f.vale}</p>
            <p className="text-sm leading-relaxed text-fg-muted">{f.reach}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-20 font-display text-2xl font-semibold">Echoes</h2>
      <p className="mt-2 max-w-xl text-sm text-fg-muted">
        Same grammar. Different trial. Lucas never walks Thornhearth. The Vale shows through anyway.
      </p>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {VALE_LORE.echoes.map((e) => (
          <li key={e.vale} className="grid gap-2 py-6 sm:grid-cols-[1fr_1fr_1.4fr] sm:gap-6">
            <p className="text-sm font-medium text-fg">{e.vale}</p>
            <p className="text-sm text-fg-muted">{e.reach}</p>
            <p className="text-sm leading-relaxed text-fg-subtle">{e.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
