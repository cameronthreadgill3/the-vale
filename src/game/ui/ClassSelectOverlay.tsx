import { useEffect, useState } from "react";
import { CLASSES, type ClassId } from "@/game/classes";
import { playerSpritePreviewUrl, preloadAllPlayerSprites } from "@/game/playerSprites";

export function ClassSelectOverlay({ onPick }: { onPick: (id: ClassId) => void }) {
  const [previews, setPreviews] = useState<Partial<Record<ClassId, string>>>(
    Object.create(null) as Partial<Record<ClassId, string>>,
  );

  useEffect(() => {
    let cancelled = false;
    void preloadAllPlayerSprites().then(() => {
      if (cancelled) return;
      const next: Partial<Record<ClassId, string>> = Object.create(null);
      for (const c of CLASSES) {
        next[c.id] = playerSpritePreviewUrl(c.id);
      }
      setPreviews(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto overscroll-contain bg-[#0c0d0b] p-4 sm:p-8" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="w-full max-w-3xl">
        <h1 className="font-display text-center text-2xl tracking-wide text-[#c9a227] sm:text-3xl">
          The Vale
        </h1>
        <div className="vale-text-screen mx-auto mt-4 max-w-xl px-4 py-3.5 text-center">
          <p className="text-sm leading-relaxed text-[#d4d0bc]">
            A square that knits you. Ashwood at the edge — dark gray bark, silver-edged
            leaves — and beasts in the basin grass. Identify returns a short pane: Name,
            Rank, sparse detail.
          </p>
          <p className="vale-screen-aside">
            The System remembers this pattern as the First Story. Walkers call it
            Thornvale. Directives: Survive · Learn · Progress.
          </p>
        </div>
        <h2 className="vale-screen-title vale-screen-title-lg mt-5 text-center">
          Choose your path
        </h2>
        <p className="mt-1 text-center text-sm text-[#a8b09a]">
          Six System-recognized ways through Thornvale. Favored skills start higher and train faster.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {CLASSES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className="vale-tap vale-text-screen group min-h-[4.5rem] p-4 text-left transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]"
              style={{ borderLeftWidth: 4, borderLeftColor: c.accent }}
            >
              <div className="flex items-center gap-3">
                {previews[c.id] ? (
                  <img
                    src={previews[c.id]}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 image-rendering-pixelated"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <div
                    className="h-10 w-10 shrink-0 rounded-full"
                    style={{ background: c.accent }}
                  />
                )}
                <div>
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
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
