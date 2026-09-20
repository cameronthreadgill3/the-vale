import { type ValeClass } from "@/game/classes";
import { type ContinentId } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";
import type { SkillId } from "@/game/skills";
import { ContinentMapPanel } from "@/game/ui/ContinentMapPanel";
import { SkillsPanel, type SkillRow } from "@/game/ui/SkillsPanel";
import { useGameCanvas } from "@/game/useGameCanvas";

export function GameShell({
  character,
  cls,
  skills,
  skillsOpen,
  mapOpen,
  skillTick,
  arrivedFrom,
  toast,
  continentName,
  inHollow,
  hollowIndex,
  onToggleSkills,
  onToggleMap,
  onTrain,
  onResetPath,
  onTravel,
  onEnterHollow,
  onExitHollow,
  onPassivePrimary,
}: {
  character: ValeCharacter;
  cls: ValeClass;
  skills: SkillRow[];
  skillsOpen: boolean;
  mapOpen: boolean;
  skillTick: number;
  arrivedFrom: ContinentId | null;
  toast: string | null;
  continentName: string;
  inHollow: boolean;
  hollowIndex: number | null;
  onToggleSkills: () => void;
  onToggleMap: () => void;
  onTrain: (skill: SkillId) => void;
  onResetPath: () => void;
  onTravel: (target: ContinentId, from: ContinentId) => void;
  onEnterHollow: (index: number, returnTile: { x: number; y: number }) => void;
  onExitHollow: () => void;
  onPassivePrimary: (amount: number) => void;
}) {
  const { canvasRef, hud, prompt } = useGameCanvas({
    character,
    cls,
    arrivedFrom,
    onTrain,
    onToggleSkills,
    onToggleMap,
    onTravel,
    onEnterHollow,
    onExitHollow,
    onPassivePrimary,
  });

  void skillTick;

  const locationLabel = inHollow
    ? `${continentName} | Hollow ${(hollowIndex ?? 0) + 1}`
    : continentName;

  return (
    <div className="relative h-full w-full select-none">
      <canvas ref={canvasRef} className="block h-full w-full" tabIndex={0} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl tracking-wide text-[#c9a227] sm:text-2xl">
              The Vale
            </h1>
            <p className="mt-0.5 text-xs text-[#a8b09a] sm:text-sm">
              {locationLabel}
            </p>
            <p
              className="mt-1 font-display text-sm tracking-wide sm:text-base"
              style={{ color: cls.accent }}
            >
              {cls.name}
            </p>
          </div>
          <div className="rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-2 text-xs text-[#e8e6d9] backdrop-blur-sm sm:text-sm">
            <div className="font-display" style={{ color: cls.accent }}>
              Level {hud.level}
            </div>
            <div className="mt-1 text-[#a8b09a]">
              XP {hud.xp} / {hud.next}
            </div>
            <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded bg-[#0c0d0b]">
              <div
                className="h-full rounded"
                style={{
                  width: `${Math.round(hud.progress * 100)}%`,
                  background: cls.accent,
                }}
              />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-wider text-[#6a7260]">
              Tile {hud.x}, {hud.y}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="w-fit rounded border border-[#2a2e24] bg-[#161812]/80 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm">
            Move <span className="text-[#e8e6d9]">WASD</span> /{" "}
            <span className="text-[#e8e6d9]">Arrows</span>
            {" | "}
            <span className="text-[#e8e6d9]">E</span> interact
            {" | "}
            <span className="text-[#e8e6d9]">M</span> map
            {" | "}
            <span className="text-[#e8e6d9]">K</span> skills
            {" | "}
            <span className="text-[#e8e6d9]">1-7</span> train
          </div>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#e8e6d9] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onToggleMap}
          >
            {mapOpen ? "Hide map" : "Map (M)"}
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#e8e6d9] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onToggleSkills}
          >
            {skillsOpen ? "Hide skills" : "Skills (K)"}
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onResetPath}
          >
            Change path
          </button>
        </div>
      </div>

      {prompt && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded border border-[#c9a227]/50 bg-[#161812]/95 px-4 py-2 text-center text-sm text-[#e8e6d9] shadow-lg backdrop-blur-md">
          {prompt.kind === "gate" && (
            <>
              Gate to <span className="text-[#c9a227]">{prompt.name}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Walk in or press <span className="text-[#e8e6d9]">E</span>
              </div>
            </>
          )}
          {prompt.kind === "hollow" && (
            <>
              Hollow entrance {(prompt.index + 1).toString()}
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Descend with <span className="text-[#e8e6d9]">E</span> or walk in
              </div>
            </>
          )}
          {prompt.kind === "exit" && (
            <>
              Hollow exit
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Return with <span className="text-[#e8e6d9]">E</span> or walk onto the tile
              </div>
            </>
          )}
        </div>
      )}

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-1/3 z-20 -translate-x-1/2 rounded border border-[#2a2e24] bg-[#0c0d0b]/90 px-4 py-2 font-display text-sm tracking-wide text-[#c9a227] shadow-xl">
          {toast}
        </div>
      )}

      {mapOpen && (
        <ContinentMapPanel character={character} onClose={onToggleMap} />
      )}

      {skillsOpen && (
        <SkillsPanel
          cls={cls}
          skills={skills}
          onTrain={onTrain}
          onClose={onToggleSkills}
        />
      )}
    </div>
  );
}
