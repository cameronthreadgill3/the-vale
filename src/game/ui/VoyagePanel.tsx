import { getContinent, type ContinentId } from "@/game/continents";
import type { ShipDock } from "@/game/folk";
import { canAffordFare, quoteShipFare } from "@/game/travelFares";

export function VoyagePanel({
  dock,
  currentContinent,
  discovered,
  gold,
  onSail,
  onClose,
}: {
  dock: ShipDock;
  currentContinent: ContinentId;
  discovered: ContinentId[];
  gold: number;
  onSail: (dest: ContinentId) => void;
  onClose: () => void;
}) {
  const ports = dock.destinations.filter((d) => d !== currentContinent);

  return (
    <div className="vale-panel vale-text-screen pointer-events-auto absolute bottom-24 left-1/2 z-30 w-[min(100%-2rem,24rem)] -translate-x-1/2 border-[#5a9aaa]/40 px-4 py-3.5 max-md:bottom-8">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-sm tracking-wide text-[#7ab8c9]">
            {dock.name}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
            Choose a coastal port · purse {gold}g
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
      <ul className="flex flex-col gap-2">
        {ports.map((dest) => {
          const cont = getContinent(dest);
          const known = discovered.includes(dest);
          const quote = quoteShipFare(currentContinent, dest, discovered);
          const canPay = canAffordFare(gold, quote);
          const flavor =
            dock.routeFlavor[dest] ??
            `Sail for ${cont.name}.`;
          const fareLine = quote.firstCrossing
            ? "First sail — no fare"
            : `${quote.gold}g pier fare`;
          return (
            <li key={dest}>
              <button
                type="button"
                onClick={() => onSail(dest)}
                className="vale-tap w-full rounded border border-[#2a2e24] bg-[#1c1f16] px-3 py-3 text-left hover:border-[#7ab8c9]/50 active:border-[#7ab8c9]/60"
              >
                <div className="font-display text-xs text-[#e8e6d9]">
                  {cont.name}
                  <span className="ml-2 text-[10px] uppercase text-[#7ab8c9]">
                    {fareLine}
                  </span>
                  {!known && (
                    <span className="ml-2 text-[10px] uppercase text-[#6a7260]">
                      uncharted
                    </span>
                  )}
                  {!canPay && (
                    <span className="ml-2 text-[10px] uppercase text-[#c45c3e]">
                      short
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
