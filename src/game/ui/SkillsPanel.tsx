import type { ValeClass } from "@/game/classes";
import type { SkillId } from "@/game/skills";

export type SkillRow = {
  id: SkillId;
  name: string;
  hotkey: string;
  xp: number;
  level: number;
  progress: number;
  next: number;
};

export function SkillsPanel({
  cls,
  skills,
  onTrain,
  onClose,
}: {
  cls: ValeClass;
  skills: SkillRow[];
  onTrain: (skill: SkillId) => void;
  onClose: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 w-[min(100%-2rem,20rem)] rounded border border-[#2a2e24] bg-[#161812]/95 p-3 shadow-xl backdrop-blur-md sm:bottom-6 sm:right-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-sm tracking-wide text-[#c9a227]">
            Skills
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
            Cubic XP · click or 1–7 to train
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
      <ul className="flex flex-col gap-1.5">
        {skills.map((s) => {
          const favored = (cls.gainMultipliers[s.id] ?? 1) > 1;
          const isPrimary = cls.primarySkill === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onTrain(s.id)}
                className="flex w-full flex-col gap-1 rounded border border-transparent px-2 py-1.5 text-left transition hover:border-[#2a2e24] hover:bg-[#1c1f16]"
              >
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-[#e8e6d9]">
                    <span className="mr-1.5 inline-block w-3 text-[#6a7260]">
                      {s.hotkey}
                    </span>
                    {s.name}
                    {isPrimary && (
                      <span
                        className="ml-1.5 text-[10px] uppercase tracking-wider"
                        style={{ color: cls.accent }}
                      >
                        primary
                      </span>
                    )}
                    {favored && !isPrimary && (
                      <span className="ml-1.5 text-[10px] uppercase tracking-wider text-[#6a7260]">
                        favored
                      </span>
                    )}
                  </span>
                  <span className="font-display" style={{ color: cls.accent }}>
                    {s.level}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-[#0c0d0b]">
                  <div
                    className="h-full rounded transition-[width] duration-200"
                    style={{
                      width: `${Math.round(s.progress * 100)}%`,
                      background: isPrimary ? cls.accent : "#c9a227",
                    }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
