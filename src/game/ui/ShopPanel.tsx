import type { ValeCharacter } from "@/game/character";
import { getItem, isEquippable, itemStatLine, type ItemId } from "@/game/items";
import type { ShopDef, ShopStock } from "@/game/folk";
import { sellPrice } from "@/game/folk";
import {
  canCarry,
  carriedWeight,
  maxWeightFor,
  maxSlotsFor,
  formatWeightChrome,
  formatSlotsChrome,
} from "@/game/backpack";

function loadBand(ratio: number): "ok" | "high" | "full" {
  if (ratio >= 1) return "full";
  if (ratio >= 0.8) return "high";
  return "ok";
}

function itemDetail(item: ReturnType<typeof getItem>): string {
  return isEquippable(item) ? itemStatLine(item) : `${item.blurb} · ${item.weight} wt`;
}

/** Listed stock — name, line, then a full-width buy like a vault deposit. */
function StockRow({
  row,
  character,
  onBuy,
}: {
  row: ShopStock;
  character: ValeCharacter;
  onBuy: (itemId: string, price: number) => void;
}) {
  const item = getItem(row.itemId);
  const carry = canCarry(
    character.inventory,
    character.premiumBackpack,
    row.itemId as ItemId,
    1,
  );
  const canBuy = character.gold >= row.price && carry.ok;
  return (
    <li className="vale-skill-row px-1.5 py-1.5">
      <div className="truncate">
        <span className="vale-skill-name">{item.name}</span>
        {!carry.ok && (
          <span className="vale-skill-tag text-[#c45c3e]">
            {carry.reason === "weight" ? "Too heavy" : "Pack full"}
          </span>
        )}
      </div>
      <div className="vale-skill-blurb truncate">{itemDetail(item)}</div>
      <button
        type="button"
        disabled={!canBuy}
        onClick={() => onBuy(row.itemId, row.price)}
        className="vale-tap-sm vale-ghost-btn vale-ghost-btn-accent mt-1.5 w-full px-2 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Buy <span className="vale-shop-coin">{row.price}g</span>
      </button>
    </li>
  );
}

/** Pack side of the counter — sell at half, same row lip as the vault. */
function SellRow({
  stack,
  price,
  onSell,
}: {
  stack: ValeCharacter["inventory"][number];
  price: number;
  onSell: (itemId: string, price: number) => void;
}) {
  const item = getItem(stack.id);
  return (
    <li className="vale-skill-row px-1.5 py-1.5">
      <div className="truncate">
        <span className="vale-skill-name">{item.name}</span>
        <span className="vale-skill-tag text-[#c9a227]">×{stack.qty}</span>
      </div>
      <div className="vale-skill-blurb truncate">{itemDetail(item)}</div>
      <button
        type="button"
        onClick={() => onSell(stack.id, price)}
        className="vale-tap-sm vale-ghost-btn mt-1.5 w-full px-2 py-1.5 text-[10px] text-[#a8b09a]"
      >
        Sell <span className="vale-shop-coin">{price}g</span>
      </button>
    </li>
  );
}

export function ShopPanel({
  shop,
  character,
  onBuy,
  onSell,
  onClose,
}: {
  shop: ShopDef;
  character: ValeCharacter;
  onBuy: (itemId: string, price: number) => void;
  onSell: (itemId: string, price: number) => void;
  onClose: () => void;
}) {
  const arms = shop.stock.filter((row) => isEquippable(getItem(row.itemId)));
  const stores = shop.stock.filter((row) => !isEquippable(getItem(row.itemId)));
  const weight = carriedWeight(character.inventory);
  const maxW = maxWeightFor(character.premiumBackpack);
  const slots = character.inventory.length;
  const maxS = maxSlotsFor(character.premiumBackpack);
  const ratio = maxW > 0 ? weight / maxW : 0;

  return (
    <div className="vale-panel vale-shop-sheet vale-text-screen pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,28rem)] -translate-x-1/2 p-3.5 max-md:bottom-8 sm:bottom-6">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="vale-screen-title">{shop.name}</div>
          <div className="vale-screen-kicker">Buy listed · sell ~half</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close shop"
          className="vale-tap-sm vale-ghost-btn shrink-0 px-3 py-2 text-xs text-[#a8b09a]"
        >
          Close
        </button>
      </div>

      <div className="vale-inv-stats mb-2">
        <span className="vale-inv-chip">{formatWeightChrome(weight, maxW)}</span>
        <span className="vale-inv-chip">{formatSlotsChrome(slots, maxS)}</span>
        <span className="vale-inv-chip vale-inv-chip-gold">
          Gold {character.gold}g
        </span>
        {character.premiumBackpack ? (
          <span className="vale-inv-chip vale-inv-chip-gold">Premium</span>
        ) : null}
      </div>

      <div
        className="vale-skill-meter vale-inv-meter mb-3"
        data-load={loadBand(ratio)}
      >
        <div
          className="vale-skill-meter-fill"
          style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <section className="vale-inv-well">
          <div className="vale-screen-kicker mb-1.5">Stock</div>
          <div className="flex max-h-52 flex-col gap-2 overflow-y-auto">
            {arms.length > 0 && (
              <div>
                <div className="vale-skill-meta mb-1.5">Arms</div>
                <ul className="flex flex-col gap-1.5">
                  {arms.map((row) => (
                    <StockRow
                      key={row.itemId}
                      row={row}
                      character={character}
                      onBuy={onBuy}
                    />
                  ))}
                </ul>
              </div>
            )}
            {stores.length > 0 && (
              <div>
                <div className="vale-skill-meta mb-1.5">Stores</div>
                <ul className="flex flex-col gap-1.5">
                  {stores.map((row) => (
                    <StockRow
                      key={row.itemId}
                      row={row}
                      character={character}
                      onBuy={onBuy}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="vale-inv-well vale-shop-pack">
          <div className="vale-screen-kicker mb-1.5">Your pack</div>
          {character.inventory.length === 0 ? (
            <p className="vale-inv-empty">Empty pack.</p>
          ) : (
            <ul className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
              {character.inventory.map((stack) => {
                const item = getItem(stack.id);
                const stockRow = shop.stock.find((s) => s.itemId === stack.id);
                const price = sellPrice(stockRow?.price ?? item.value);
                return (
                  <SellRow
                    key={stack.id}
                    stack={stack}
                    price={price}
                    onSell={onSell}
                  />
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
