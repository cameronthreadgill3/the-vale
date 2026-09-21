import type { ValeCharacter } from "@/game/character";
import { getItem, isEquippable, itemStatLine, type ItemId } from "@/game/items";
import type { ShopDef, ShopStock } from "@/game/folk";
import { sellPrice } from "@/game/folk";
import {
  canCarry,
  carriedWeight,
  maxWeightFor,
  maxSlotsFor,
  formatPackLoadChrome,
} from "@/game/backpack";

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
    <li className="vale-ledger-line flex items-center justify-between gap-2 px-2 py-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs text-[#e8e6d9]">{item.name}</div>
        <div className="truncate text-[10px] text-[#6a7260]">
          {isEquippable(item) ? itemStatLine(item) : `${item.blurb} · ${item.weight} wt`}
          {!carry.ok
            ? carry.reason === "weight"
              ? " · too heavy"
              : " · pack full"
            : ""}
        </div>
      </div>
      <button
        type="button"
        disabled={!canBuy}
        onClick={() => onBuy(row.itemId, row.price)}
        className="vale-tap-sm shrink-0 rounded border border-[#2a2e24] px-3 py-2 text-xs text-[#c9a227] disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:border-[#c9a227]/50"
      >
        Buy {row.price}g
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

  return (
    <div className="vale-panel vale-text-screen pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,26rem)] -translate-x-1/2 p-3.5 max-md:bottom-8 sm:bottom-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="vale-screen-title">{shop.name}</div>
          <div className="vale-screen-kicker">
            Gold {character.gold}g ·{" "}
            {formatPackLoadChrome(
              carriedWeight(character.inventory),
              maxWeightFor(character.premiumBackpack),
              character.inventory.length,
              maxSlotsFor(character.premiumBackpack),
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="vale-tap-sm vale-ghost-btn px-3 py-2 text-xs text-[#a8b09a]"
        >
          Close
        </button>
      </div>

      <div className="mb-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
        {arms.length > 0 && (
          <div>
            <div className="vale-screen-kicker mb-1">Arms</div>
            <ul className="flex flex-col gap-1">
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
            <div className="vale-screen-kicker mb-1">Stores</div>
            <ul className="flex flex-col gap-1">
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

      <div className="vale-screen-kicker mb-1">Your pack (sell ~half)</div>
      {character.inventory.length === 0 ? (
        <p className="px-2 text-xs text-[#6a7260]">Empty pack.</p>
      ) : (
        <ul className="flex max-h-28 flex-col gap-1 overflow-y-auto">
          {character.inventory.map((stack) => {
            const item = getItem(stack.id);
            const stockRow = shop.stock.find((s) => s.itemId === stack.id);
            const price = sellPrice(stockRow?.price ?? item.value);
            return (
              <li
                key={stack.id}
                className="vale-ledger-line flex items-center justify-between gap-2 px-2 py-2.5"
              >
                <span className="text-xs text-[#e8e6d9]">
                  {item.name}{" "}
                  <span className="text-[#6a7260]">×{stack.qty}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onSell(stack.id, price)}
                  className="vale-tap-sm shrink-0 rounded border border-[#2a2e24] px-3 py-2 text-xs text-[#a8b09a] hover:border-[#c9a227]/40 hover:text-[#e8e6d9]"
                >
                  Sell {price}g
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
