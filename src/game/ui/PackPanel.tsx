import type { ValeCharacter } from "@/game/character";
import { getItem } from "@/game/items";
import {
  carriedWeight,
  maxWeightFor,
  maxSlotsFor,
  DEATH_RULES_BLURB,
  PREMIUM_BACKPACK_SLOTS,
  PREMIUM_WEIGHT_BONUS,
} from "@/game/backpack";
import {
  isPremiumDemoAllowed,
  isStripeClientConfigured,
} from "@/game/premium";

export function PackPanel({
  character,
  unlocking,
  onUnlockDemo,
  onUnlockStripe,
  onClose,
}: {
  character: ValeCharacter;
  unlocking: boolean;
  onUnlockDemo: () => void;
  onUnlockStripe: () => void;
  onClose: () => void;
}) {
  const weight = carriedWeight(character.inventory);
  const maxW = maxWeightFor(character.premiumBackpack);
  const slots = character.inventory.length;
  const maxS = maxSlotsFor(character.premiumBackpack);
  const ratio = maxW > 0 ? weight / maxW : 0;
  const bar =
    ratio >= 1 ? "#c45c3e" : ratio >= 0.8 ? "#c9a227" : "#7ab85a";
  const demo = isPremiumDemoAllowed();
  const stripe = isStripeClientConfigured();

  return (
    <div className="vale-panel pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,24rem)] -translate-x-1/2 rounded border border-[#2a2e24] bg-[#161812]/96 p-3 shadow-xl backdrop-blur-md max-md:bottom-8 sm:bottom-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-sm tracking-wide text-[#c9a227]">
            Pack
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
            {weight}/{maxW} wt · {slots}/{maxS} slots
            {character.premiumBackpack ? " · Premium" : ""}
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

      <div className="mb-2 h-1.5 overflow-hidden rounded-sm bg-[#050604]">
        <div
          className="h-full rounded"
          style={{
            width: `${Math.min(100, Math.round(ratio * 100))}%`,
            background: bar,
          }}
        />
      </div>

      {character.inventory.length === 0 ? (
        <p className="mb-3 px-1 text-xs text-[#6a7260]">Empty pack.</p>
      ) : (
        <ul className="mb-3 flex max-h-32 flex-col gap-1 overflow-y-auto">
          {character.inventory.map((stack) => {
            const item = getItem(stack.id);
            return (
              <li
                key={stack.id}
                className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-xs text-[#e8e6d9]"
              >
                <span className="truncate">
                  {item.name}{" "}
                  <span className="text-[#6a7260]">×{stack.qty}</span>
                </span>
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-[#6a7260]">
                  {item.weight * stack.qty} wt
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="vale-chrome mb-2 rounded-sm px-2.5 py-2">
        <div className="font-display text-[11px] tracking-wide text-[#c9a227]">
          Premium Backpack
        </div>
        {character.premiumBackpack ? (
          <p className="mt-1 text-xs leading-relaxed text-[#a8b09a]">
            Unlocked — {PREMIUM_BACKPACK_SLOTS} slots and +
            {Math.round(PREMIUM_WEIGHT_BONUS * 100)}% carry weight. Persists
            with this character.
          </p>
        ) : (
          <>
            <p className="mt-1 text-xs leading-relaxed text-[#a8b09a]">
              {PREMIUM_BACKPACK_SLOTS} slots and +
              {Math.round(PREMIUM_WEIGHT_BONUS * 100)}% weight capacity.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {demo && (
                <button
                  type="button"
                  disabled={unlocking}
                  onClick={onUnlockDemo}
                  className="vale-tap-sm rounded border border-[#c9a227]/50 bg-[#1c1f16] px-3 py-2 text-xs text-[#c9a227] hover:border-[#c9a227] disabled:opacity-40"
                >
                  Demo unlock
                </button>
              )}
              {stripe && (
                <button
                  type="button"
                  disabled={unlocking}
                  onClick={onUnlockStripe}
                  className="vale-tap-sm rounded border border-[#2a2e24] px-3 py-2 text-xs text-[#e8e6d9] hover:border-[#c9a227]/50 disabled:opacity-40"
                >
                  Stripe checkout
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <p className="text-[10px] leading-relaxed text-[#6a7260]">
        {DEATH_RULES_BLURB}
      </p>
    </div>
  );
}
