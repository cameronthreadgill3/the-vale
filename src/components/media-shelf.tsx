import { Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { MediaItem, MediaKind } from "@/canon/catalog";
import { vaultForAccess } from "@/canon/catalog";
import { echoFor } from "@/canon/vale-lore";
import { GateCard } from "@/components/gate-card";
import { useMembership } from "@/lib/use-membership";

const DETAIL: Record<MediaKind, "/audio/$id" | "/anime/$id" | "/comics/$id"> = {
  audio: "/audio/$id",
  anime: "/anime/$id",
  comic: "/comics/$id",
};

export function MediaShelf({
  kicker,
  title,
  intro,
  items,
  empty,
  kind,
}: {
  kicker: string;
  title: string;
  intro: string;
  items: MediaItem[];
  empty: string;
  kind: MediaKind;
}) {
  const house = useMembership();
  const { authPending } = house;
  const shelfOpen = items[0] ? house.open(items[0].access) : house.member;
  const vault = items[0] ? vaultForAccess(items[0].access) : "kettle";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">{kicker}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-pretty text-fg-muted">{intro}</p>

      {authPending ? (
        <div className="mt-10 h-48 animate-pulse rounded-2xl bg-surface" />
      ) : !shelfOpen ? (
        <div className="mt-10">
          <GateCard title="Member vault" copy={empty} vault={vault} />
        </div>
      ) : (
        <p className="mt-8 max-w-xl text-sm text-fg-muted">
          This shelf is open. The First Story sits on every track, episode, and issue — Lucas stays in his trial.
        </p>
      )}

      <ol className="mt-10 divide-y divide-border border-y border-border">
        {items.map((item, i) => {
          const echo = echoFor(item.slug);
          return (
            <li key={item.id}>
              <Link
                to={DETAIL[kind]}
                params={{ id: item.id }}
                className="flex items-start gap-4 py-5 transition-colors hover:bg-surface/60"
              >
                <span className="w-8 shrink-0 pt-0.5 font-mono text-xs tabular-nums text-fg-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.still && (
                  <img
                    src={item.still}
                    alt=""
                    className="hidden size-16 shrink-0 rounded-md object-cover outline outline-1 -outline-offset-1 outline-fg/10 sm:block"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-fg">{item.title}</p>
                  <p className="mt-1 text-sm text-fg-muted">{item.note}</p>
                  {echo && <p className="mt-1 text-sm text-fg-subtle">{echo.vale}</p>}
                </div>
                {house.open(item.access) ? (
                  <span className="shrink-0 pt-1 text-xs tracking-wide text-fg-subtle uppercase">Open</span>
                ) : (
                  <Lock className="mt-1 size-3.5 shrink-0 text-fg-subtle" />
                )}
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="mt-8 text-sm text-fg-subtle">
        The game and{" "}
        <Link to="/read" className="text-fg hover:underline">
          Book One
        </Link>{" "}
        stay free.
      </p>
    </div>
  );
}
