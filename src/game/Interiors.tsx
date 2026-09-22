import { Button } from "@/components/ui/button";
import { asset } from "./assets";
import type { GameHandle } from "./engine";
import { BANK_SLOTS, ITEMS, RARITY_CLASS, RARITY_LABEL, sellPrice, statLine, vaultUsed, type ItemId } from "./items";
import { shopBuys, SHOPS } from "./shops";
import { COPPER, GOLD, PLATINUM, SILVER, formatCoins } from "./money";
import { useGameStore } from "./store";
import type { RefObject } from "react";

function Room({
  art,
  kicker,
  title,
  note,
  children,
}: {
  art: string;
  kicker: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  const setOverlay = useGameStore((s) => s.setOverlay);
  return (
    <div className="absolute inset-0 overflow-y-auto">
      <img src={asset(art)} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-bg/70" />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8 safe-screen">
        <div>
          <p className="text-xs tracking-[0.22em] text-fg-muted uppercase">{kicker}</p>
          <h2 className="mt-1 font-display text-3xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-fg-muted">{note}</p>
        </div>
        {children}
        <Button variant="secondary" onClick={() => setOverlay("playing")}>
          Step outside
        </Button>
      </div>
    </div>
  );
}

function CoinRow({ label, copper }: { label: string; copper: number }) {
  return (
    <p className="text-sm">
      <span className="text-fg-muted">{label} </span>
      <span className="font-medium tabular-nums text-fg">{formatCoins(copper)}</span>
    </p>
  );
}

export function BankRoom({ game }: { game: RefObject<GameHandle | null> }) {
  const pack = useGameStore((s) => s.pack);
  const vault = useGameStore((s) => s.vault);
  const gold = useGameStore((s) => s.gold);
  const vaultCopper = useGameStore((s) => s.vaultCopper);
  const used = vaultUsed(vault);

  const chips = [
    { label: "1c", n: COPPER },
    { label: "1s", n: SILVER },
    { label: "1g", n: GOLD },
    { label: "1p", n: PLATINUM },
  ];

  return (
    <Room
      art="/interiors/bank.jpg"
      kicker="Cress & Coin"
      title="The bank"
      note="A hundred boxes. Copper, silver, gold, platinum. The purse is what you carry. The vault keeps."
    >
      <div className="rounded-2xl border border-border bg-surface/90 p-4">
        <CoinRow label="Purse" copper={gold} />
        <CoinRow label="Vault" copper={vaultCopper} />
        <p className="mt-3 text-xs tracking-[0.18em] text-fg-muted uppercase">Deposit</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Button key={`d-${c.label}`} variant="secondary" className="min-h-11" onClick={() => game.current?.depositCoin(c.n)}>
              {c.label}
            </Button>
          ))}
          <Button className="min-h-11" onClick={() => game.current?.depositCoin(0)}>
            All
          </Button>
        </div>
        <p className="mt-3 text-xs tracking-[0.18em] text-fg-muted uppercase">Withdraw</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Button key={`w-${c.label}`} variant="secondary" className="min-h-11" onClick={() => game.current?.withdrawCoin(c.n)}>
              {c.label}
            </Button>
          ))}
          <Button className="min-h-11" onClick={() => game.current?.withdrawCoin(0)}>
            All
          </Button>
        </div>
      </div>
      <div>
        <p className="text-xs tracking-[0.18em] text-fg-muted uppercase">
          Vault {used} / {BANK_SLOTS}
        </p>
        <div className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
          {vault.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (s) game.current?.takeVaultSlot(i);
              }}
              title={s ? `${ITEMS[s.item]?.name ?? s.item} ×${s.qty}` : `Box ${i + 1}`}
              className="flex min-h-11 items-center justify-center rounded-sm border border-border bg-surface/90 py-2 text-[10px] leading-tight text-fg sm:aspect-square sm:min-h-0 sm:py-0"
            >
              {s ? (
                <span className="px-0.5 text-center">
                  {(ITEMS[s.item]?.name ?? "?").slice(0, 3)}
                  <span className="block tabular-nums text-fg-muted">{s.qty}</span>
                </span>
              ) : (
                <span className="text-fg-subtle">{i + 1}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs tracking-[0.18em] text-fg-muted uppercase">Pack</p>
        <ul className="mt-2 space-y-1">
          {pack.length === 0 ? <li className="text-sm text-fg-muted">Empty pockets.</li> : null}
          {pack.map((s) => (
            <li key={s.item} className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface/90 px-3 py-2">
              <span className={`text-sm ${ITEMS[s.item]?.rarity ? RARITY_CLASS[ITEMS[s.item]!.rarity!] : "text-fg"}`}>
                {ITEMS[s.item]?.name ?? s.item}
                <span className="ml-2 tabular-nums text-xs text-fg-muted">×{s.qty}</span>
              </span>
              <Button variant="secondary" size="sm" onClick={() => game.current?.stashItem(s.item as ItemId)}>
                Stash
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Room>
  );
}

export function ShopRoom({ game }: { game: RefObject<GameHandle | null> }) {
  const shopId = useGameStore((s) => s.shopId) ?? "hides";
  const shop = SHOPS[shopId];
  return (
    <Room art={shop.art} kicker={shop.kicker} title={shop.title} note={shop.note}>
      <ShopInner game={game} />
    </Room>
  );
}

function ShopInner({ game }: { game: RefObject<GameHandle | null> }) {
  const pack = useGameStore((s) => s.pack);
  const gold = useGameStore((s) => s.gold);
  const shopId = useGameStore((s) => s.shopId) ?? "hides";
  const shop = SHOPS[shopId];
  const sellable = pack.filter((s) => shopBuys(shopId, s.item));
  return (
    <>
      <CoinRow label="Purse" copper={gold} />
      <p className="text-xs tracking-[0.18em] text-fg-muted uppercase">Buy</p>
      <ul className="space-y-2">
        {shop.stock.map((id) => {
          const d = ITEMS[id];
          if (!d) return null;
          return (
          <li key={id} className="flex items-center justify-between rounded-md border border-border bg-surface/90 px-3 py-2">
            <span>
              <span className={`text-sm ${d.rarity ? RARITY_CLASS[d.rarity] : "text-fg"}`}>{d.name}</span>
              <span className="block text-xs text-fg-subtle">
                {d.rarity ? `${RARITY_LABEL[d.rarity]} · lv ${d.levelReq} · ${statLine(d)}` : d.desc}
              </span>
            </span>
            <Button variant="secondary" size="sm" onClick={() => game.current?.buy(id)}>
              {formatCoins(d.value)}
            </Button>
          </li>
          );
        })}
      </ul>
      <p className="text-xs tracking-[0.18em] text-fg-muted uppercase">They buy</p>
      <ul className="space-y-2">
        {sellable.length === 0 ? <li className="text-sm text-fg-muted">Nothing they want in the pack.</li> : null}
        {sellable.map((s) => (
          <li key={s.item} className="flex items-center justify-between rounded-md border border-border bg-surface/90 px-3 py-2">
            <span className="text-sm text-fg">
              {ITEMS[s.item]?.name} <span className="tabular-nums text-fg-muted">×{s.qty}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => game.current?.sell(s.item)}>
              {formatCoins(sellPrice(s.item))}
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}

export function InnRoom({ game }: { game: RefObject<GameHandle | null> }) {
  return (
    <Room art="/interiors/inn.jpg" kicker="The kettle" title="Inn" note="A bed that does not charge. The mill still talks to its stones.">
      <Button onClick={() => game.current?.restInn()}>Rest — free</Button>
    </Room>
  );
}

export function MillRoom() {
  return (
    <Room art="/interiors/mill.jpg" kicker="Tamsin's stones" title="Mill" note="Grain, water, a wheel that keeps time. Nothing to buy. The stones remember.">
      <p className="text-sm text-fg-muted">The mill does not charge. Stand and listen if you like.</p>
    </Room>
  );
}

export function HouseRoom() {
  return (
    <Room art="/interiors/house.jpg" kicker="A hearth" title="Inside" note="Someone's table. Someone's fire. Nothing of yours is here.">
      <p className="text-sm text-fg-muted">The square is still outside. The fountain still mends you.</p>
    </Room>
  );
}
