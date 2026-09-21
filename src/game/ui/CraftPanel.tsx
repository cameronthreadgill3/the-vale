import type { ValeCharacter } from "@/game/character";
import { getItem } from "@/game/items";
import { CRAFT_RECIPES, type CraftRecipe } from "@/game/professions";

function haveQty(character: ValeCharacter, itemId: string): number {
  return character.inventory.find((s) => s.id === itemId)?.qty ?? 0;
}

function canCraft(character: ValeCharacter, recipe: CraftRecipe): boolean {
  return recipe.ingredients.every((ing) => haveQty(character, ing.itemId) >= ing.qty);
}

export function CraftPanel({
  character,
  onCraft,
  onClose,
}: {
  character: ValeCharacter;
  onCraft: (recipeId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="vale-panel vale-text-screen pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,24rem)] -translate-x-1/2 p-3.5 max-md:bottom-8 sm:bottom-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="vale-screen-title">Sera's Kettle</div>
          <div className="vale-screen-kicker">
            Bind two mats · First Story craft
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
      <ul className="flex flex-col gap-2">
        {CRAFT_RECIPES.map((recipe) => {
          const result = getItem(recipe.resultId);
          const ready = canCraft(character, recipe);
          return (
            <li
              key={recipe.id}
              className="vale-ledger-line px-2.5 py-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-[#e8e6d9]">{recipe.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#6a7260]">
                  Crafting +{recipe.xp} XP
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-[#6a7260]">{recipe.blurb}</p>
              <div className="mt-1 text-[10px] text-[#a8b09a]">
                {recipe.ingredients.map((ing, i) => {
                  const item = getItem(ing.itemId);
                  const have = haveQty(character, ing.itemId);
                  const ok = have >= ing.qty;
                  return (
                    <span key={ing.itemId}>
                      {i > 0 ? " + " : ""}
                      <span className={ok ? "text-[#7ab85a]" : "text-[#c45c3e]"}>
                        {item.name} {have}/{ing.qty}
                      </span>
                    </span>
                  );
                })}
                {" → "}
                {result.name} ×{recipe.resultQty}
              </div>
              <button
                type="button"
                disabled={!ready}
                onClick={() => onCraft(recipe.id)}
                className="vale-tap-sm mt-2 rounded border border-[#2a2e24] px-3 py-2 text-xs text-[#c9a227] hover:border-[#c9a227]/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Craft
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
