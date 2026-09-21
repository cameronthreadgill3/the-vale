import type { ValeCharacter } from "@/game/character";
import { getItem, isEquippable, itemStatLine, type EquipSlot } from "@/game/items";
import {
  carriedWeight,
  maxWeightFor,
  maxSlotsFor,
  formatWeightChrome,
  formatSlotsChrome,
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

function loadBand(ratio: number): "ok" | "high" | "full" {
  if (ratio >= 1) return "full";
  if (ratio >= 0.8) return "high";
  return "ok";
}

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
  const demo = isPremiumDemoAllowed();
  const stripe = isStripeClientConfigured();
  const equipment = character.equipment ?? emptyEquipment();

  return (
    <div className="vale-panel vale-inv-panel vale-overlay-above-chrome vale-text-screen pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,26rem)] -translate-x-1/2 p-3.5 sm:bottom-6">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div>
          <div className="vale-screen-title">Pack</div>
          <div className="vale-screen-kicker">B or I to close</div>
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

      <div className="vale-screen-kicker mb-1.5">Worn</div>
      <ul className="flex flex-col gap-1.5">
        {EQUIP_SLOTS.map((slot) => {
          const id = equipment[slot];
          const item = id ? getItem(id) : null;
          return (
            <li
              key={slot}
              className="vale-skill-row flex items-center justify-between gap-2 px-2 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="vale-skill-meta">{SLOT_LABEL[slot]}</div>
                {item ? (
                  <>
                    <div className="vale-skill-name truncate">{item.name}</div>
                    <div className="vale-skill-blurb truncate">
                      {itemStatLine(item)}
                    </div>
                  </>
                ) : (
                  <div className="vale-skill-name vale-skill-name-dim">Empty</div>
                )}
              </div>
              {item && (
                <button
                  type="button"
                  onClick={() => onUnequip(slot)}
                  className="vale-tap-sm vale-ghost-btn shrink-0 px-3 py-2 text-xs text-[#a8b09a]"
                >
                  Unequip
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="vale-skill-section">
        <div className="vale-screen-title vale-screen-title-sm">Pack items</div>
        {character.inventory.length === 0 ? (
          <p className="vale-inv-empty">Empty pack.</p>
        ) : (
          <ul className="mt-1.5 flex max-h-36 flex-col gap-1.5 overflow-y-auto">
            {character.inventory.map((stack) => {
              const item = getItem(stack.id);
              const gear = isEquippable(item);
              return (
                <li
                  key={stack.id}
                  className="vale-skill-row flex items-center justify-between gap-2 px-2 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate">
                      <span className="vale-skill-name">{item.name}</span>
                      <span className="vale-skill-tag text-[#c9a227]">
                        ×{stack.qty}
                      </span>
                    </div>
                    <div className="vale-skill-blurb truncate">
                      {gear
                        ? itemStatLine(item)
                        : `${item.weight} wt · ${item.blurb}`}
                    </div>
                  </div>
                  {gear ? (
                    <button
                      type="button"
                      onClick={() => onEquip(stack.id)}
                      className="vale-tap-sm vale-ghost-btn vale-ghost-btn-accent shrink-0 px-3 py-2 text-xs"
                    >
                      Equip
                    </button>
                  ) : (
                    <span className="vale-skill-level shrink-0 tabular-nums text-[#9aa288]">
                      {item.weight * stack.qty} wt
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div
        className={`vale-skill-row mt-3 px-3 py-2.5 ${
          character.premiumBackpack ? "vale-inv-kept" : ""
        }`}
      >
        <div className="vale-screen-title vale-screen-title-sm">
          Premium Backpack
        </div>
        {character.premiumBackpack ? (
          <p className="vale-skill-blurb">
            Unlocked — {PREMIUM_BACKPACK_SLOTS} slots and +
            {Math.round(PREMIUM_WEIGHT_BONUS * 100)}% carry weight. Persists
            with this character.
          </p>
        ) : (
          <>
            <p className="vale-skill-blurb">
              {PREMIUM_BACKPACK_SLOTS} slots and +
              {Math.round(PREMIUM_WEIGHT_BONUS * 100)}% weight capacity.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {demo && (
                <button
                  type="button"
                  disabled={unlocking}
                  onClick={onUnlockDemo}
                  className="vale-tap-sm vale-ghost-btn vale-ghost-btn-accent px-3 py-2 text-xs disabled:opacity-40"
                >
                  Demo unlock
                </button>
              )}
              {stripe && (
                <button
                  type="button"
                  disabled={unlocking}
                  onClick={onUnlockStripe}
                  className="vale-tap-sm vale-ghost-btn px-3 py-2 text-xs text-[#e8e6d9] disabled:opacity-40"
                >
                  Stripe checkout
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="vale-skill-section">
        <div className="vale-screen-title vale-screen-title-sm">Professions</div>
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {PROFESSIONS.map((p) => {
            const xp = (character.professionXp ?? emptyProfessionXp())[p.id];
            const snap = professionSnapshot(xp);
            return (
              <li
                key={p.id}
                className="vale-skill-row flex items-baseline justify-between gap-2 px-2.5 py-1.5"
              >
                <span className="vale-skill-name">{p.name}</span>
                <span className="vale-skill-level tabular-nums text-[#c9a227]">
                  Lv {snap.level}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="vale-inv-foot">
        <p className="vale-screen-hint">{DEATH_RULES_BLURB}</p>
      </div>
    </div>
  );
}
