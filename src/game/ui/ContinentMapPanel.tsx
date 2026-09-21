import type { CSSProperties } from "react";
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
          <div className="vale-screen-title vale-map-title">Continents</div>
          <div className="vale-screen-kicker vale-map-kicker">
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
              className={`vale-skill-row vale-map-row px-2.5 py-2.5 ${
                here || inHollowHere ? "vale-map-row-here" : ""
              }`}
              style={
                here || inHollowHere
                  ? ({ "--vale-row-mark": c.palette.gate } as CSSProperties)
                  : undefined
              }
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`vale-skill-name vale-map-place ${known ? "" : "vale-skill-name-dim"}`}
                  style={known ? { color: c.palette.gate } : undefined}
                >
                  {known ? c.name : "???"}
                </span>
                {(here || inHollowHere) && (
                  <span className="vale-skill-tag vale-map-mark">
                    {inHollowHere ? "hollow" : "here"}
                  </span>
                )}
              </div>
              {known && <p className="vale-skill-blurb vale-map-blurb">{c.blurb}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
