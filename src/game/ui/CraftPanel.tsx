import type { ValeCharacter } from "@/game/character";
import { getItem } from "@/game/items";
import {
  CRAFT_RECIPES,
  professionSnapshot,
  type CraftRecipe,
} from "@/game/professions";

function haveQty(character: ValeCharacter, itemId: string): number {
  return character.inventory.find((s) => s.id === itemId)?.qty ?? 0;
}

function canCraft(character: ValeCharacter, recipe: CraftRecipe): boolean {
  return recipe.ingredients.every((ing) => haveQty(character, ing.itemId) >= ing.qty);
}

/** One kettle recipe — name, mats, yield, then a full-width craft like a vault deposit. */
function RecipeRow({
  character,
  recipe,
  onCraft,
}: {
  character: ValeCharacter;
  recipe: CraftRecipe;
  onCraft: (recipeId: string) => void;
}) {
  const result = getItem(recipe.resultId);
  const ready = canCraft(character, recipe);
  return (
    <li className="vale-skill-row px-1.5 py-1.5">
      <div className="truncate">
        <span className="vale-skill-name">{recipe.name}</span>
        <span className="vale-skill-tag text-[#c9a227]">+{recipe.xp} XP</span>
      </div>
      <div className="vale-skill-blurb">{recipe.blurb}</div>
      <div className="vale-skill-blurb">
        {recipe.ingredients.map((ing, i) => {
          const item = getItem(ing.itemId);
          const have = haveQty(character, ing.itemId);
          const ok = have >= ing.qty;
          return (
            <span key={ing.itemId}>
              {i > 0 ? " + " : ""}
              <span className={ok ? "vale-craft-have" : "vale-craft-short"}>
                {item.name} {have}/{ing.qty}
              </span>
            </span>
          );
        })}
        {" → "}
        <span className="vale-craft-yield">
          {result.name} ×{recipe.resultQty}
        </span>
      </div>
      <button
        type="button"
        disabled={!ready}
        onClick={() => onCraft(recipe.id)}
        className="vale-tap-sm vale-ghost-btn vale-ghost-btn-accent mt-1.5 w-full px-2 py-1.5 text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Craft
      </button>
    </li>
  );
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
  const craftXp = character.professionXp?.crafting ?? 0;
  const snap = professionSnapshot(craftXp);
  const into = Math.max(0, Math.round(snap.progress * snap.next));
  const readyCount = CRAFT_RECIPES.filter((recipe) => canCraft(character, recipe)).length;

  return (
    <div className="vale-panel vale-craft-sheet vale-text-screen pointer-events-auto absolute bottom-4 left-1/2 z-30 w-[min(100%-2rem,24rem)] -translate-x-1/2 p-3.5 max-md:bottom-8 sm:bottom-6">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="vale-screen-title">Sera's Kettle</div>
          <div className="vale-screen-kicker">Bind two mats · First Story craft</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close craft"
          className="vale-tap-sm vale-ghost-btn shrink-0 px-3 py-2 text-xs text-[#a8b09a]"
        >
          Close
        </button>
      </div>

      <div className="vale-inv-stats mb-2">
        <span className="vale-inv-chip vale-inv-chip-gold">Crafting Lv {snap.level}</span>
        <span className="vale-inv-chip">
          {into} / {snap.next} XP
        </span>
        <span className="vale-inv-chip">{readyCount > 0 ? "Mats ready" : "Short mats"}</span>
      </div>

      <div className="vale-skill-meter vale-craft-meter mb-3">
        <div
          className="vale-skill-meter-fill"
          style={{ width: `${Math.min(100, Math.round(snap.progress * 100))}%` }}
        />
      </div>

      <section className="vale-inv-well vale-craft-well">
        <div className="vale-screen-kicker mb-1.5">Recipes</div>
        <ul className="flex max-h-52 flex-col gap-1.5 overflow-y-auto">
          {CRAFT_RECIPES.map((recipe) => (
            <RecipeRow
              key={recipe.id}
              character={character}
              recipe={recipe}
              onCraft={onCraft}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
