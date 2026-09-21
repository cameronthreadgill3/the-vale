import type { ValeCharacter } from "@/game/character";
import { getItem } from "@/game/items";
import {
  carriedWeight,
  maxWeightFor,
  maxSlotsFor,
  formatWeightChrome,
  formatSlotsChrome,
} from "@/game/backpack";

export function BankPanel({
  character,
  onDepositItem,
  onWithdrawItem,
  onDepositGold,
  onWithdrawGold,
  onClose,
}: {
  character: ValeCharacter;
  onDepositItem: (itemId: string) => void;
  onWithdrawItem: (itemId: string) => void;
  onDepositGold: (amount: number) => void;
  onWithdrawGold: (amount: number) => void;
  onClose: () => void;
}) {
  const weight = carriedWeight(character.inventory);
  const maxW = maxWeightFor(character.premiumBackpack);
  const slots = character.inventory.length;
  const maxS = maxSlotsFor(character.premiumBackpack);

  return (
    <div className="vale-panel vale-text-screen pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,28rem)] -translate-x-1/2 p-3.5 max-md:bottom-8 sm:bottom-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="vale-screen-title">Bank · Thornreach Vault</div>
          <div className="vale-screen-kicker">
            Gold and items here never drop on death
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

      <div className="vale-screen-kicker mb-2 flex flex-wrap gap-x-3 gap-y-1">
        <span>{formatWeightChrome(weight, maxW)}</span>
        <span>{formatSlotsChrome(slots, maxS)}</span>
        <span>Carried gold {character.gold}g</span>
        <span>Bank gold {character.bankGold}g</span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <section>
          <div className="vale-screen-kicker mb-1">Pack items</div>
          {character.inventory.length === 0 ? (
            <p className="px-1 text-xs text-[#6a7260]">No items in pack.</p>
          ) : (
            <ul className="flex max-h-36 flex-col gap-1 overflow-y-auto">
              {character.inventory.map((stack) => {
                const item = getItem(stack.id);
                return (
                  <li
                    key={stack.id}
                    className="vale-ledger-line flex items-center justify-between gap-1 px-1.5 py-2"
                  >
                    <span className="min-w-0 truncate text-xs text-[#e8e6d9]">
                      {item.name}{" "}
                      <span className="text-[#6a7260]">×{stack.qty}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onDepositItem(stack.id)}
                      className="vale-tap-sm shrink-0 rounded border border-[#2a2e24] px-2 py-1.5 text-[10px] text-[#c9a227] hover:border-[#c9a227]/50"
                    >
                      Deposit
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section>
          <div className="vale-screen-kicker mb-1">Bank items</div>
          {character.bank.length === 0 ? (
            <p className="px-1 text-xs text-[#6a7260]">No items in bank.</p>
          ) : (
            <ul className="flex max-h-36 flex-col gap-1 overflow-y-auto">
              {character.bank.map((stack) => {
                const item = getItem(stack.id);
                return (
                  <li
                    key={stack.id}
                    className="vale-ledger-line flex items-center justify-between gap-1 px-1.5 py-2"
                  >
                    <span className="min-w-0 truncate text-xs text-[#e8e6d9]">
                      {item.name}{" "}
                      <span className="text-[#6a7260]">×{stack.qty}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onWithdrawItem(stack.id)}
                      className="vale-tap-sm shrink-0 rounded border border-[#2a2e24] px-2 py-1.5 text-[10px] text-[#a8b09a] hover:border-[#c9a227]/40 hover:text-[#e8e6d9]"
                    >
                      Withdraw
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="vale-screen-actions">
        <button
          type="button"
          disabled={character.gold <= 0}
          onClick={() => onDepositGold(Math.min(10, character.gold))}
          className="vale-tap-sm vale-ghost-btn vale-ghost-btn-accent px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Deposit 10g
        </button>
        <button
          type="button"
          disabled={character.gold <= 0}
          onClick={() => onDepositGold(character.gold)}
          className="vale-tap-sm vale-ghost-btn vale-ghost-btn-accent px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Deposit all gold
        </button>
        <button
          type="button"
          disabled={character.bankGold <= 0}
          onClick={() => onWithdrawGold(Math.min(10, character.bankGold))}
          className="vale-tap-sm vale-ghost-btn px-3 py-2 text-xs text-[#a8b09a] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Withdraw 10g
        </button>
        <button
          type="button"
          disabled={character.bankGold <= 0}
          onClick={() => onWithdrawGold(character.bankGold)}
          className="vale-tap-sm vale-ghost-btn px-3 py-2 text-xs text-[#a8b09a] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Withdraw all gold
        </button>
      </div>
    </div>
  );
}
