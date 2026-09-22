import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOK2, ANIME, COMICS, AUDIO, VAULTS, VAULT_ORDER, type Vault } from "@/canon/catalog";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  claimInnkeeper,
  getPayHandles,
  getPayLinks,
  listKettleKeys,
  mintKettleKey,
  redeemKettleKey,
  setPayHandles,
  type KettleKeyRow,
} from "@/lib/membership";
import {
  EMPTY_HANDLES,
  PAY_ORDER,
  hasAnyPayLink,
  toPayBoard,
  type PayBoard,
  type PayHandles,
  type PayKind,
  type PayLinks,
} from "@/lib/pay";
import { useMembership } from "@/lib/use-membership";

export const Route = createFileRoute("/_house/subscribe")({ component: Subscribe });

const INCLUDES = [
  `Kettle · $${VAULTS.kettle.dollars} — ${BOOK2.length} Book Two chapters, ${AUDIO.length} voices, ${ANIME.length} episodes, ${COMICS.length} issues`,
  `Voices · $${VAULTS.voices.dollars} — the ${AUDIO.length} audiobook tracks only`,
  `Anime · $${VAULTS.anime.dollars} — the ${ANIME.length} episodes only`,
  "Comics stay with the kettle. The game and Book One stay free.",
];

const PATREON_TIERS = `Page name: A Story as Old as Time
Creating: the First Story, and a later trial
Brand color: #0c0d0b
https://www.patreon.com/c/AStoryasOldasTime
Subscription billing. Mark Kettle recommended.

About:
Thornvale is the First Story. Hollow Reach is a later trial. Walk the Vale for free. Read Book One for free. Voices is five. Anime is five. The kettle is ten for Book Two, voices, anime, and comics. Lucas stays in his trial. The Vale is texture, not a rewrite.

Voices — $5/mo
The First Trial, spoken. 35 audiobook tracks. This shelf only.

Anime — $5/mo
Hollow Reach, drawn. 14 episodes. This shelf only.

Kettle — $10/mo (recommended)
The whole later story: Book Two, voices, anime, comics.`;

function Subscribe() {
  const { user, isPending } = useCurrentUserState();
  const house = useMembership();
  const [board, setBoard] = useState<PayBoard>(() => toPayBoard(undefined));

  useEffect(() => {
    getPayLinks()
      .then(setBoard)
      .catch(() => setBoard(toPayBoard(undefined)));
  }, [house.innkeeper]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">The kettle</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">From $5 a month</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-pretty text-fg-muted">
        Voices or anime is five. The kettle is ten for the whole later story — Book Two, voices, anime, and comics. Venmo is one month by hand. Patreon is the same three tiers, billed each month. Then a key opens the shelf you paid for.
      </p>

      <ul className="mt-10 flex flex-col gap-3">
        {INCLUDES.map((line) => (
          <li key={line} className="flex gap-3 text-sm text-fg">
            <Check className="mt-0.5 size-4 shrink-0 text-fg-muted" />
            {line}
          </li>
        ))}
      </ul>

      <PayPanel board={board} />

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        {isPending || house.authPending ? (
          <div className="h-11 w-48 animate-pulse rounded-md bg-surface-2" />
        ) : house.member ? (
          <Held
            label="You are on the kettle. Thank you."
            until={house.periodEnd}
            innkeeper={house.innkeeper}
          />
        ) : house.voices || house.anime ? (
          <div className="flex flex-col gap-3">
            {house.voices && (
              <Held label="Voices is open." until={house.voicesEnd} innkeeper={false} />
            )}
            {house.anime && (
              <Held label="Anime is open." until={house.animeEnd} innkeeper={false} />
            )}
            <p className="text-sm text-fg-muted">Book Two and comics still ask for the kettle.</p>
            {user ? <RedeemForm onRedeemed={() => void house.reload()} /> : <SignInPrompt />}
          </div>
        ) : !user ? (
          <SignInPrompt />
        ) : (
          <RedeemForm onRedeemed={() => void house.reload()} />
        )}
      </div>

      {user && !isPending && (
        <InnkeeperPanel
          innkeeper={house.innkeeper}
          houseClaimed={house.houseClaimed}
          onChange={() => {
            void house.reload();
            getPayLinks()
              .then(setBoard)
              .catch(() => undefined);
          }}
        />
      )}

      <p className="mt-8 text-sm text-fg-subtle">
        Walk the Vale anyway —{" "}
        <Link to="/play" className="text-fg hover:underline">
          the game is free
        </Link>
        . Or{" "}
        <Link to="/read" className="text-fg hover:underline">
          start Book One
        </Link>
        .
      </p>
    </div>
  );
}

function Held({
  label,
  until,
  innkeeper,
}: {
  label: string;
  until: string | null;
  innkeeper: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-fg">{label}</p>
      {until && !innkeeper && (
        <p className="mt-2 text-sm text-fg-muted">
          This month holds until {new Date(until).toLocaleDateString()}.
        </p>
      )}
    </div>
  );
}

function SignInPrompt() {
  return (
    <div>
      <p className="text-sm text-fg-muted">Paid? Sign in, then redeem the key. Google or X.</p>
      {authEnabled ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant="secondary"
              onClick={() => signIn(p.providerId, { callbackURL: "/subscribe" })}
            >
              Continue with {p.label}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-fg-subtle">Sign-in is disabled.</p>
      )}
    </div>
  );
}

const PAY_LABEL: Record<PayKind, string> = {
  paypal: "PayPal",
  cashApp: "Cash App",
  venmo: "Venmo",
  kofi: "Ko-fi",
  patreon: "Patreon",
};

function PayPanel({ board }: { board: PayBoard | null }) {
  return (
    <section className="mt-10 grid gap-4">
      {VAULT_ORDER.map((vault) => (
        <VaultCard key={vault} vault={vault} links={board ? board[vault] : null} />
      ))}
    </section>
  );
}

function VaultCard({ vault, links }: { vault: Vault; links: PayLinks | null }) {
  const tier = VAULTS[vault];
  const ready = hasAnyPayLink(links);
  const recommended = vault === "kettle";
  return (
    <article className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">
        {recommended ? "Recommended" : "Add-on"}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {tier.label} · ${tier.dollars}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-pretty text-fg">
        {tier.opens}. Send ${tier.dollars} on Venmo, or pick this tier on Patreon. Then a {tier.prefix} key opens it.
      </p>
      {links === null ? (
        <div className="mt-6 h-11 w-48 animate-pulse rounded-md bg-surface-2" />
      ) : ready ? (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {PAY_ORDER.map((kind) => {
            const href = links[kind];
            if (!href) return null;
            const label =
              kind === "patreon"
                ? `Join ${tier.label} on Patreon`
                : `Pay $${tier.dollars} with ${PAY_LABEL[kind]}`;
            const primary = kind === "patreon" || (kind === "venmo" && !links.patreon);
            return (
              <Button key={kind} asChild size="lg" variant={primary ? "default" : "secondary"}>
                <a href={href} target="_blank" rel="noreferrer">
                  {label}
                </a>
              </Button>
            );
          })}
        </div>
      ) : (
        <p className="mt-6 text-sm leading-relaxed text-pretty text-fg-muted">
          A {tier.prefix} key still opens the month once one is minted.
        </p>
      )}
    </article>
  );
}

function RedeemForm({ onRedeemed }: { onRedeemed: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const redeem = () => {
    const next = code.trim();
    if (!next) {
      setNote("A key looks like KETTLE-XXXX-XXXX, VOICE-XXXX-XXXX, or ANIME-XXXX-XXXX.");
      return;
    }
    setBusy(true);
    setNote(null);
    redeemKettleKey({ data: next })
      .then((r) => {
        if (r.ok) {
          onRedeemed();
          return;
        }
        setNote(r.reason === "used" ? "That key has already been used." : "That key does not open a shelf.");
      })
      .catch(() => setNote("Sign in first, then try again."))
      .finally(() => setBusy(false));
  };

  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        redeem();
      }}
    >
      <p className="text-sm text-fg">Have a key? Type it here.</p>
      <label className="mt-4 block">
        <span className="text-xs tracking-[0.18em] text-fg-subtle uppercase">Month key</span>
        <input
          type="text"
          name="kettle-key"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="KETTLE-XXXX-XXXX"
          className="mt-2 h-11 w-full rounded-md border border-border bg-bg px-3 font-mono text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <Button type="submit" size="lg" className="mt-4" disabled={busy}>
        {busy ? "Checking…" : "Redeem a month"}
      </Button>
      {note && <p className="mt-4 text-sm text-fg">{note}</p>}
    </form>
  );
}

function InnkeeperPanel({
  innkeeper,
  houseClaimed,
  onChange,
}: {
  innkeeper: boolean;
  houseClaimed: boolean;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [fresh, setFresh] = useState<{ code: string; vault: Vault } | null>(null);
  const [keys, setKeys] = useState<KettleKeyRow[]>([]);

  useEffect(() => {
    if (!innkeeper) return;
    listKettleKeys()
      .then(setKeys)
      .catch(() => setKeys([]));
  }, [innkeeper, fresh]);

  const claim = () => {
    setBusy(true);
    setNote(null);
    claimInnkeeper()
      .then((r) => {
        if (!r.ok) {
          setNote("Someone already keeps this house.");
          onChange();
          return;
        }
        onChange();
      })
      .catch(() => setNote("Sign in first, then try again."))
      .finally(() => setBusy(false));
  };

  const mint = (vault: Vault) => {
    setBusy(true);
    setNote(null);
    mintKettleKey({ data: { vault } })
      .then((r) => {
        if (!r.ok) {
          setNote("Only the innkeeper can mint keys.");
          return;
        }
        setFresh({ code: r.code, vault: r.vault });
      })
      .catch(() => setNote("Could not mint a key."))
      .finally(() => setBusy(false));
  };

  if (!innkeeper && houseClaimed) return null;

  if (!innkeeper) {
    return (
      <section className="mt-6 rounded-2xl border border-border p-6 sm:p-8">
        <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">If this is your house</p>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-fg-muted">
          The first person to keep the kettle becomes the innkeeper. They post payment and mint the month keys. Nobody else should tap this.
        </p>
        <Button type="button" variant="secondary" className="mt-4" disabled={busy} onClick={claim}>
          {busy ? "Claiming…" : "I keep this house"}
        </Button>
        {note && <p className="mt-4 text-sm text-fg">{note}</p>}
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-border p-6 sm:p-8">
      <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">Innkeeper</p>
      <p className="mt-3 text-sm leading-relaxed text-pretty text-fg-muted">
        Post Venmo and your Patreon page. When a payment lands, mint the matching key: kettle $10, voices $5, anime $5.
      </p>
      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-bg px-4 py-3 font-sans text-sm leading-relaxed text-fg">
        {PATREON_TIERS}
      </pre>
      <PaySetup onSaved={onChange} />
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {VAULT_ORDER.map((vault) => (
          <Button
            key={vault}
            type="button"
            variant={vault === "kettle" ? "default" : "secondary"}
            disabled={busy}
            onClick={() => mint(vault)}
          >
            {busy ? "Minting…" : `Mint ${VAULTS[vault].label} key`}
          </Button>
        ))}
      </div>
      {fresh && (
        <div className="mt-4 rounded-xl border border-border bg-bg px-4 py-3">
          <p className="text-xs tracking-[0.18em] text-fg-subtle uppercase">
            Hand this over · {VAULTS[fresh.vault].label}
          </p>
          <p className="mt-2 font-mono text-lg tracking-wide text-fg">{fresh.code}</p>
          <CopyKey code={fresh.code} />
        </div>
      )}
      {keys.length > 0 && (
        <ol className="mt-6 divide-y divide-border border-y border-border">
          {keys.map((k) => (
            <li key={k.code} className="flex items-center justify-between gap-3 py-3">
              <span className="font-mono text-sm text-fg">{k.code}</span>
              <span className="text-xs tracking-wide text-fg-subtle uppercase">
                {VAULTS[k.vault].label} · {k.redeemed ? "Redeemed" : "Open"}
              </span>
            </li>
          ))}
        </ol>
      )}
      {note && <p className="mt-4 text-sm text-fg">{note}</p>}
    </section>
  );
}

function PaySetup({ onSaved }: { onSaved: () => void }) {
  const [handles, setHandles] = useState<PayHandles>(EMPTY_HANDLES);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    getPayHandles()
      .then(setHandles)
      .catch(() => setHandles(EMPTY_HANDLES));
  }, []);

  const save = () => {
    setBusy(true);
    setNote(null);
    setPayHandles({ data: handles })
      .then((r) => {
        if (!r.ok) {
          setNote("Only the innkeeper can post payment.");
          return;
        }
        setNote("Posted. Join on Patreon and Pay with Venmo now open those links.");
        onSaved();
      })
      .catch(() => setNote("Could not save."))
      .finally(() => setBusy(false));
  };

  const field = (kind: PayKind, label: string, placeholder: string) => (
    <label className="block">
      <span className="text-xs tracking-[0.18em] text-fg-subtle uppercase">{label}</span>
      <input
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={handles[kind]}
        onChange={(e) => setHandles((h) => ({ ...h, [kind]: e.target.value }))}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );

  return (
    <form
      className="mt-6 grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {field("patreon", "Patreon", "yourpage")}
      {field("venmo", "Venmo", "yourname")}
      {field("paypal", "PayPal.me", "yourname")}
      {field("cashApp", "Cash App", "$yourtag")}
      {field("kofi", "Ko-fi", "yourpage")}
      <div className="sm:col-span-2">
        <Button type="submit" variant="secondary" disabled={busy}>
          {busy ? "Saving…" : "Post payment links"}
        </Button>
        {note && <p className="mt-3 text-sm text-fg">{note}</p>}
      </div>
    </form>
  );
}

function CopyKey({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="mt-2 px-0"
      onClick={() => {
        const write = navigator.clipboard?.writeText(code);
        if (write) {
          void write.then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          });
        }
      }}
    >
      {copied ? "Copied" : "Copy key"}
    </Button>
  );
}
