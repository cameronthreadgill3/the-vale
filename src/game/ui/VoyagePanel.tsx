import { getContinent, type ContinentId } from "@/game/continents";
import type { ShipDock } from "@/game/folk";

export function VoyagePanel({
  dock,
  currentContinent,
  discovered,
  onSail,
  onClose,
}: {
  dock: ShipDock;
  currentContinent: ContinentId;
  discovered: ContinentId[];
  onSail: (dest: ContinentId) => void;
  onClose: () => void;
}) {
  const ports = dock.destinations.filter((d) => d !== currentContinent);

  return (
    <div className="pointer-events-auto absolute bottom-20 left-1/2 z-30 w-[min(100%-2rem,24rem)] -translate-x-1/2 rounded border border-[#5a9aaa]/40 bg-[#161812]/96 p-4 shadow-xl backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-sm tracking-wide text-[#7ab8c9]">
            {dock.name}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
            Choose a coastal port
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-xs text-[#a8b09a] hover:text-[#e8e6d9]"
        >
          Close
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {ports.map((dest) => {
          const cont = getContinent(dest);
          const known = discovered.includes(dest);
          const flavor =
            dock.routeFlavor[dest] ??
            `Sail for ${cont.name}.`;
          return (
            <li key={dest}>
              <button
                type="button"
                onClick={() => onSail(dest)}
                className="w-full rounded border border-[#2a2e24] bg-[#1c1f16] px-3 py-2 text-left hover:border-[#7ab8c9]/50"
              >
                <div className="font-display text-xs text-[#e8e6d9]">
                  {cont.name}
                  {!known && (
                    <span className="ml-2 text-[10px] uppercase text-[#6a7260]">
                      uncharted
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] leading-snug text-[#a8b09a]">
                  {flavor}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
