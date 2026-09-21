import type { ValeCharacter } from "@/game/character";
import { getItem } from "@/game/items";
import {
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

function VaultStack({
  name,
  qty,
  action,
  accent,
  onAction,
}: {
  name: string;
  qty: number;
  action: string;
  accent?: boolean;
  onAction: () => void;
}) {
  return (
    <li className="vale-skill-row px-1.5 py-1.5">
      <div className="truncate">
        <span className="vale-skill-name">{name}</span>
        <span className="vale-skill-tag text-[#c9a227]">×{qty}</span>
      </div>
      <button
        type="button"
        onClick={onAction}
        className={`vale-tap-sm vale-ghost-btn mt-1.5 w-full px-2 py-1.5 text-[10px] ${
          accent ? "vale-ghost-btn-accent" : ""
        }`}
      >
        {action}
      </button>
    </li>
  );
}

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
  const ratio = maxW > 0 ? weight / maxW : 0;

  return (
    <div className="vale-panel vale-inv-panel vale-text-screen pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,28rem)] -translate-x-1/2 p-3.5 max-md:bottom-8 sm:bottom-6">
      <div className="mb-2.5 flex items-center justify-between gap-2">
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

      <div className="vale-inv-stats mb-2">
        <span className="vale-inv-chip">{formatWeightChrome(weight, maxW)}</span>
        <span className="vale-inv-chip">{formatSlotsChrome(slots, maxS)}</span>
        <span className="vale-inv-chip">Carried gold {character.gold}g</span>
        <span className="vale-inv-chip vale-inv-chip-gold">
          Bank gold {character.bankGold}g
        </span>
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

      <div className="mb-3 grid grid-cols-2 gap-2">
        <section className="vale-inv-well">
          <div className="vale-screen-kicker mb-1.5">Pack items</div>
          {character.inventory.length === 0 ? (
            <p className="vale-inv-empty">No items in pack.</p>
          ) : (
            <ul className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
              {character.inventory.map((stack) => {
                const item = getItem(stack.id);
                return (
                  <VaultStack
                    key={stack.id}
                    name={item.name}
                    qty={stack.qty}
                    action="Deposit"
                    accent
                    onAction={() => onDepositItem(stack.id)}
                  />
                );
              })}
            </ul>
          )}
        </section>
        <section className="vale-inv-well vale-inv-well-vault">
          <div className="vale-screen-kicker mb-1.5">Bank items</div>
          {character.bank.length === 0 ? (
            <p className="vale-inv-empty">No items in bank.</p>
          ) : (
            <ul className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
              {character.bank.map((stack) => {
                const item = getItem(stack.id);
                return (
                  <VaultStack
                    key={stack.id}
                    name={item.name}
                    qty={stack.qty}
                    action="Withdraw"
                    onAction={() => onWithdrawItem(stack.id)}
                  />
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
