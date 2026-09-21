import type { ValeCharacter } from "@/game/character";
import { getItem, isEquippable, itemStatLine, type EquipSlot } from "@/game/items";
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
import { EQUIP_SLOTS, SLOT_LABEL, emptyEquipment } from "@/game/equipment";
import {
  PROFESSIONS,
  emptyProfessionXp,
  professionSnapshot,
} from "@/game/professions";

export function PackPanel({
  character,
  unlocking,
  onUnlockDemo,
  onUnlockStripe,
  onEquip,
  onUnequip,
  onClose,
}: {
  character: ValeCharacter;
  unlocking: boolean;
  onUnlockDemo: () => void;
  onUnlockStripe: () => void;
  onEquip: (itemId: string) => void;
  onUnequip: (slot: EquipSlot) => void;
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
  const equipment = character.equipment ?? emptyEquipment();

  return (
    <div className="vale-panel vale-overlay-above-chrome pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,24rem)] -translate-x-1/2 rounded border border-[#2a2e24] bg-[#161812]/96 p-3 shadow-xl backdrop-blur-md sm:bottom-6">
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

      <div className="mb-1 text-[10px] uppercase tracking-wider text-[#6a7260]">
        Worn
      </div>
      <ul className="mb-3 flex flex-col gap-1">
        {EQUIP_SLOTS.map((slot) => {
          const id = equipment[slot];
          const item = id ? getItem(id) : null;
          return (
            <li
              key={slot}
              className="flex items-center justify-between gap-2 rounded border border-[#2a2e24]/80 px-2 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
                  {SLOT_LABEL[slot]}
                </div>
                {item ? (
                  <>
                    <div className="truncate text-xs text-[#e8e6d9]">{item.name}</div>
                    <div className="truncate text-[10px] text-[#6a7260]">
                      {itemStatLine(item)}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-[#6a7260]">Empty</div>
                )}
              </div>
              {item && (
                <button
                  type="button"
                  onClick={() => onUnequip(slot)}
                  className="vale-tap-sm shrink-0 rounded border border-[#2a2e24] px-3 py-2 text-xs text-[#a8b09a] hover:border-[#c9a227]/40 hover:text-[#e8e6d9]"
                >
                  Unequip
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mb-1 text-[10px] uppercase tracking-wider text-[#6a7260]">
        Pack
      </div>
      {character.inventory.length === 0 ? (
        <p className="mb-3 px-1 text-xs text-[#6a7260]">Empty pack.</p>
      ) : (
        <ul className="mb-3 flex max-h-32 flex-col gap-1 overflow-y-auto">
          {character.inventory.map((stack) => {
            const item = getItem(stack.id);
            const gear = isEquippable(item);
            return (
              <li
                key={stack.id}
                className="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-xs text-[#e8e6d9]"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate">
                    {item.name}{" "}
                    <span className="text-[#6a7260]">×{stack.qty}</span>
                  </div>
                  <div className="truncate text-[10px] text-[#6a7260]">
                    {gear ? itemStatLine(item) : `${item.weight} wt · ${item.blurb}`}
                  </div>
                </div>
                {gear ? (
                  <button
                    type="button"
                    onClick={() => onEquip(stack.id)}
                    className="vale-tap-sm shrink-0 rounded border border-[#2a2e24] px-3 py-2 text-xs text-[#c9a227] hover:border-[#c9a227]/50"
                  >
                    Equip
                  </button>
                ) : (
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-[#6a7260]">
                    {item.weight * stack.qty} wt
                  </span>
                )}
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

      <div className="vale-chrome mb-2 rounded-sm px-2.5 py-2">
        <div className="font-display text-[11px] tracking-wide text-[#c9a227]">
          Professions
        </div>
        <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-[#a8b09a]">
          {PROFESSIONS.map((p) => {
            const xp = (character.professionXp ?? emptyProfessionXp())[p.id];
            const snap = professionSnapshot(xp);
            return (
              <div key={p.id} className="flex justify-between gap-2">
                <span>{p.name}</span>
                <span className="tabular-nums text-[#c9a227]">Lv {snap.level}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-[#6a7260]">
        {DEATH_RULES_BLURB}
      </p>
    </div>
  );
}
