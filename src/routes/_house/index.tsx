import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BOOK1, BOOK2, ANIME, COMICS, AUDIO, PRICE } from "@/canon/catalog";
import { VALE_LORE } from "@/canon/vale-lore";

export const Route = createFileRoute("/_house/")({ component: Hub });

function Hub() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-medium tracking-[0.28em] text-fg-muted uppercase">{VALE_LORE.kicker}</p>
        <h1 className="mt-4 max-w-[16ch] font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-6xl">
          {VALE_LORE.title}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-fg-muted">
          Thornvale is the First Story. Hollow Reach is a later trial. Walk the Vale for free. Read Book One for free. The rest of the house is ten a month, or five for voices or anime.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/play">Enter the Vale</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/read/$slug" params={{ slug: "prologue" }}>
              Read the First Story
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <img
            src="/house/fountain.jpg"
            alt="Thornhearth square"
            className="aspect-video w-full rounded-2xl object-cover outline outline-1 -outline-offset-1 outline-fg/10"
          />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-3">
          <Offer
            kicker="Free"
            title="The Vale"
            body="Six vocations. Named hunts. A fountain that does not charge. The First Story you can still walk."
            to="/play"
            action="Play"
          />
          <Offer
            kicker="Free"
            title={`Book One · ${BOOK1.length} chapters`}
            body="Lucas Mercer. Day 0. Basin Grass. The System names a later copy of an older square."
            to="/read"
            action="Read"
          />
          <Offer
            kicker={`$${PRICE.dollars}/mo`}
            title="The later story"
            body={`${BOOK2.length} Book Two chapters, ${AUDIO.length} voice tracks, ${ANIME.length} episodes, ${COMICS.length} issues. Ten for the house. Five for voices or anime.`}
            to="/subscribe"
            action="Membership"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">How the stories fit</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {VALE_LORE.thesis.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-pretty text-fg-muted">
              {line}
            </p>
          ))}
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Link to="/audio" className="group overflow-hidden rounded-2xl border border-border">
            <img src="/house/hounds.jpg" alt="" className="aspect-video w-full object-cover" />
            <div className="p-5">
              <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">Voices · $5/mo</p>
              <p className="mt-2 font-medium text-fg group-hover:underline">The First Trial, spoken</p>
            </div>
          </Link>
          <Link to="/anime" className="group overflow-hidden rounded-2xl border border-border">
            <img src="/house/hearth.jpg" alt="" className="aspect-video w-full object-cover" />
            <div className="p-5">
              <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">Anime · $5/mo</p>
              <p className="mt-2 font-medium text-fg group-hover:underline">Hollow Reach, drawn</p>
            </div>
          </Link>
          <Link to="/comics" className="group overflow-hidden rounded-2xl border border-border">
            <img src="/house/comic-01.jpg" alt="" className="aspect-video w-full object-cover object-top" />
            <div className="p-5">
              <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">Comics · ${PRICE.dollars}/mo</p>
              <p className="mt-2 font-medium text-fg group-hover:underline">The Accession, in panels</p>
            </div>
          </Link>
        </div>
        <Button asChild variant="ghost" className="mt-8 px-0">
          <Link to="/lore">The First Story, in full</Link>
        </Button>
      </section>
    </div>
  );
}

function Offer({
  kicker,
  title,
  body,
  to,
  action,
}: {
  kicker: string;
  title: string;
  body: string;
  to: "/play" | "/read" | "/subscribe";
  action: string;
}) {
  return (
    <div className="bg-bg p-8 sm:p-10">
      <p className="text-xs tracking-[0.2em] text-fg-subtle uppercase">{kicker}</p>
      <h2 className="mt-3 font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-pretty text-fg-muted">{body}</p>
      <Link to={to} className="mt-6 inline-flex h-11 items-center text-sm font-medium text-fg hover:underline">
        {action}
      </Link>
    </div>
  );
}
