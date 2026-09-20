import { CLASSES, type ClassId } from "@/game/classes";

export function ClassSelectOverlay({ onPick }: { onPick: (id: ClassId) => void }) {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-[#0c0d0b] p-4 sm:p-8">
      <div className="w-full max-w-3xl">
        <h1 className="font-display text-center text-2xl tracking-wide text-[#c9a227] sm:text-3xl">
          Choose your path
        </h1>
        <p className="mt-2 text-center text-sm text-[#a8b09a]">
          Six ways through Thornvale. Favored skills start higher and train faster.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {CLASSES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className="group rounded border border-[#2a2e24] bg-[#161812] p-4 text-left transition hover:border-[#c9a227]/60 hover:bg-[#1c1f16] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]"
              style={{ borderLeftWidth: 4, borderLeftColor: c.accent }}
            >
              <div
                className="font-display text-lg tracking-wide"
                style={{ color: c.accent }}
              >
                {c.name}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#a8b09a] sm:text-sm">
                {c.blurb}
              </p>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-[#6a7260]">
                Primary · {c.primarySkill}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
