import type { ValeCharacter } from "@/game/character";
import { getItem, isEquippable, itemStatLine, type ItemId } from "@/game/items";
import type { ShopDef, ShopStock } from "@/game/folk";
import { sellPrice } from "@/game/folk";
import {
  canCarry,
  carriedWeight,
  maxWeightFor,
  maxSlotsFor,
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
    <li className="flex items-center justify-between gap-2 rounded border border-transparent px-2 py-2 hover:border-[#2a2e24] hover:bg-[#1c1f16]">
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
    <div className="vale-panel pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,26rem)] -translate-x-1/2 rounded border border-[#2a2e24] bg-[#161812]/96 p-3 shadow-xl backdrop-blur-md max-md:bottom-8 sm:bottom-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-sm tracking-wide text-[#c9a227]">
            {shop.name}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
            Gold {character.gold} · {carriedWeight(character.inventory)}/
            {maxWeightFor(character.premiumBackpack)} wt ·{" "}
            {character.inventory.length}/{maxSlotsFor(character.premiumBackpack)}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="vale-tap-sm rounded px-3 py-2 text-xs text-[#a8b09a] hover:text-[#e8e6d9]"
        >
          Close
        </button>
      </div>

      <div className="mb-3 flex max-h-64 flex-col gap-2 overflow-y-auto">
        {arms.length > 0 && (
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wider text-[#6a7260]">
              Arms
            </div>
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
            <div className="mb-1 text-[10px] uppercase tracking-wider text-[#6a7260]">
              Stores
            </div>
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

      <div className="mb-1 text-[10px] uppercase tracking-wider text-[#6a7260]">
        Your pack (sell ~half)
      </div>
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
                className="flex items-center justify-between gap-2 rounded px-2 py-2.5 hover:bg-[#1c1f16]"
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
