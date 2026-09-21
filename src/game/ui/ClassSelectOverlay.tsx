import { useEffect, useState } from "react";
import { CLASSES, type ClassId } from "@/game/classes";
import {
  playerSpritePreviewUrl,
  preloadAllPlayerSprites,
} from "@/game/playerSprites";

function ClassPreview({ classId, accent }: { classId: ClassId; accent: string }) {
  const [src, setSrc] = useState(() => playerSpritePreviewUrl(classId));
  useEffect(() => {
    const url = playerSpritePreviewUrl(classId);
    setSrc(url);
  }, [classId]);
  return (
    <span
      className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-[#0c0d0b] ring-1 ring-[#2a2e24]"
      style={{ boxShadow: `inset 0 0 0 1px ${accent}33` }}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        className="pointer-events-none h-12 w-12 max-w-none"
        style={{ imageRendering: "pixelated" }}
        draggable={false}
      />
    </span>
  );
}

export function ClassSelectOverlay({ onPick }: { onPick: (id: ClassId) => void }) {
  useEffect(() => {
    preloadAllPlayerSprites();
  }, []);

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-auto overscroll-contain bg-[#0c0d0b] p-4 sm:p-8"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div className="w-full max-w-3xl">
        <h1 className="font-display text-center text-2xl tracking-wide text-[#c9a227] sm:text-3xl">
          The Vale
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed text-[#a8b09a]">
          A square that knits you. Ashwood at the edge — dark gray bark, silver-edged
          leaves — and beasts in the basin grass. Identify returns a short pane: Name,
          Rank, sparse detail.
        </p>
        <p className="mx-auto mt-2 max-w-xl text-center text-xs leading-relaxed text-[#6a7260]">
          The System remembers this pattern as the First Story. Walkers call it
          Thornvale. Directives: Survive · Learn · Progress.
        </p>
        <h2 className="mt-5 text-center font-display text-lg tracking-wide text-[#e8e6d9] sm:text-xl">
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
              className="vale-tap group flex min-h-[4.5rem] gap-3 rounded border border-[#2a2e24] bg-[#161812] p-4 text-left transition hover:border-[#c9a227]/60 hover:bg-[#1c1f16] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227] active:border-[#c9a227]/70"
              style={{ borderLeftWidth: 4, borderLeftColor: c.accent }}
            >
              <ClassPreview classId={c.id} accent={c.accent} />
              <span className="min-w-0 flex-1">
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
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
