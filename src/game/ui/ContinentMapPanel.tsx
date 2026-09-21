import { CONTINENTS } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";

export function ContinentMapPanel({
  character,
  onClose,
}: {
  character: ValeCharacter;
  onClose: () => void;
}) {
  const discovered = new Set(character.discoveredContinents);
  return (
    <div className="p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-sm tracking-wide text-[#c9a227]">
            Continents
          </div>
          <div className="mt-0.5 text-[10px] uppercase tracking-wider text-[#8a9080]">
            Discovered via gates · M to close
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
      <ul className="flex max-h-[50vh] flex-col gap-2 overflow-auto">
        {CONTINENTS.map((c) => {
          const known = discovered.has(c.id);
          const here =
            character.continentId === c.id && character.hollowIndex === null;
          const inHollowHere =
            character.continentId === c.id && character.hollowIndex !== null;
          return (
            <li
              key={c.id}
              className="vale-skill-row px-2.5 py-2.5"
              style={{
                borderColor: here || inHollowHere ? c.palette.gate : "transparent",
                background:
                  here || inHollowHere ? "rgba(255,255,255,0.03)" : undefined,
              }}
            >
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span
                  className="font-display tracking-wide"
                  style={{ color: known ? c.palette.gate : "#6a7260" }}
                >
                  {known ? c.name : "???"}
                </span>
                {(here || inHollowHere) && (
                  <span className="text-[10px] uppercase tracking-wider text-[#a8b09a]">
                    {inHollowHere ? "hollow" : "here"}
                  </span>
                )}
              </div>
              {known && (
                <p className="mt-0.5 text-[11px] leading-snug text-[#a8b09a]">
                  {c.blurb}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
