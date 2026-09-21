import { useEffect, useState, type CSSProperties } from "react";
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
    <div className="vale-gate-stage flex h-full w-full items-center justify-center overflow-auto overscroll-contain p-4 sm:p-8" style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="w-full max-w-3xl">
        <div className="text-center">
          <div className="vale-screen-kicker">First Story</div>
          <h1 className="vale-gate-hero mt-1.5">The Vale</h1>
        </div>
        <div className="vale-text-screen mx-auto mt-4 max-w-xl px-4 py-3.5 text-center">
          <p className="vale-screen-body">
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
        <p className="vale-screen-aside text-center">
          Six System-recognized ways through Thornvale. Favored skills start higher and train faster.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {CLASSES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className="vale-tap vale-skill-row vale-map-row-here vale-gate-choice min-h-[4.5rem] p-3.5"
              style={{ "--vale-row-mark": c.accent } as CSSProperties}
            >
              <div className="flex items-center gap-3">
                <div className="vale-gate-portrait">
                  {previews[c.id] ? (
                    <img
                      src={previews[c.id]}
                      alt=""
                      width={40}
                      height={40}
                      className="image-rendering-pixelated"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <span
                      className="block h-8 w-8 rounded-full"
                      style={{ background: c.accent }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="vale-gate-name mt-0" style={{ color: c.accent }}>
                    {c.name}
                  </div>
                  <p className="vale-skill-blurb">{c.blurb}</p>
                  <p className="vale-skill-meta mt-1.5">
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
