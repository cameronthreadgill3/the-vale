import { useEffect, useRef, useState } from "react";
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
  skillTick,
  onTrain,
  onClose,
}: {
  cls: ValeClass;
  skills: SkillRow[];
  skillTick: number;
  onTrain: (skill: SkillId) => void;
  onClose: () => void;
}) {
  const [flashId, setFlashId] = useState<SkillId | null>(null);
  const prevTick = useRef(skillTick);
  const prevXp = useRef<Record<string, number>>({});

  useEffect(() => {
    if (skillTick === prevTick.current) return;
    prevTick.current = skillTick;
    for (const s of skills) {
      const before = prevXp.current[s.id];
      if (typeof before === "number" && s.xp > before) {
        setFlashId(s.id);
        const id = window.setTimeout(() => setFlashId((f) => (f === s.id ? null : f)), 450);
        prevXp.current = Object.fromEntries(skills.map((r) => [r.id, r.xp]));
        return () => window.clearTimeout(id);
      }
    }
    prevXp.current = Object.fromEntries(skills.map((r) => [r.id, r.xp]));
  }, [skillTick, skills]);

  useEffect(() => {
    prevXp.current = Object.fromEntries(skills.map((r) => [r.id, r.xp]));
  }, []);

  return (
    <div className="vale-panel pointer-events-auto absolute bottom-4 right-4 z-30 w-[min(100%-2rem,20rem)] rounded border border-[#2a2e24] bg-[#161812]/95 p-3 shadow-xl backdrop-blur-md max-md:bottom-auto max-md:top-20 max-md:right-3 sm:bottom-6 sm:right-6">
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
          className="vale-tap-sm rounded px-3 py-2 text-xs text-[#a8b09a] hover:text-[#e8e6d9]"
        >
          Close
        </button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {skills.map((s) => {
          const favored = (cls.gainMultipliers[s.id] ?? 1) > 1;
          const isPrimary = cls.primarySkill === s.id;
          const into = Math.max(0, Math.round(s.progress * s.next));
          const flashing = flashId === s.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onTrain(s.id)}
                className={`vale-tap-sm flex w-full flex-col gap-1 rounded border px-2 py-2.5 text-left transition hover:border-[#2a2e24] hover:bg-[#1c1f16] active:bg-[#1c1f16] ${
                  flashing ? "border-[#c9a227]/70 bg-[#1c1f16]" : "border-transparent"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-[#e8e6d9]">
                    <span className="mr-1.5 inline-block w-3 text-[#6a7260]">
                      {s.hotkey}
                    </span>
                    {s.name}
                    {isPrimary ? (
                      <span
                        className="ml-2 text-[10px] uppercase tracking-wider"
                        style={{ color: cls.accent }}
                      >
                        {" "}
                        · primary
                      </span>
                    ) : null}
                    {favored && !isPrimary ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-[#6a7260]">
                        {" "}
                        · favored
                      </span>
                    ) : null}
                  </span>
                  <span className="font-display tabular-nums" style={{ color: cls.accent }}>
                    Lv {s.level}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#6a7260]">
                  <span>
                    {into} / {s.next} XP
                  </span>
                  <span className="tabular-nums">{s.xp} total</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-[#0c0d0b]">
                  <div
                    className={`h-full rounded transition-[width] duration-300 ${
                      flashing ? "brightness-125" : ""
                    }`}
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
