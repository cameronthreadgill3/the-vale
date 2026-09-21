import { useEffect, useRef, useState } from "react";
import type { ValeClass } from "@/game/classes";
import type { QuickSlots, SkillId } from "@/game/skills";
import type { ProfessionId } from "@/game/professions";

export type SkillRow = {
  id: SkillId;
  name: string;
  hotkey: string;
  xp: number;
  level: number;
  progress: number;
  next: number;
};

export type ProfessionRow = {
  id: ProfessionId;
  name: string;
  blurb: string;
  xp: number;
  level: number;
  progress: number;
  next: number;
};

export function SkillsPanel({
  cls,
  skills,
  skillTick,
  quickSlots,
  onTrain,
  onAssignQuickSlot,
  onClose,
  professions,
}: {
  cls: ValeClass;
  skills: SkillRow[];
  skillTick: number;
  quickSlots: QuickSlots;
  onTrain: (skill: SkillId) => void;
  onAssignQuickSlot: (index: number, skill: SkillId) => void;
  onClose: () => void;
  professions?: ProfessionRow[];
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
    <div className="p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="font-display text-sm tracking-wide text-[#c9a227]">
            Skills
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#6a7260]">
            Click to train · 1–3 assign a quick slot
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
              <div
                className={`flex w-full items-stretch gap-1 rounded border px-1 py-1 transition ${
                  flashing ? "border-[#c9a227]/70 bg-[#1c1f16]" : "border-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onTrain(s.id)}
                  className="vale-tap-sm flex min-w-0 flex-1 flex-col gap-1 rounded px-2 py-2 text-left hover:bg-[#1c1f16] active:bg-[#1c1f16]"
                >
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-[#e8e6d9]">
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
                <div className="flex flex-row items-center gap-1 self-center pr-1">
                  {([0, 1, 2] as const).map((i) => {
                    const assigned = quickSlots[i] === s.id;
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Assign ${s.name} to quick slot ${i + 1}`}
                        aria-pressed={assigned}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAssignQuickSlot(i, s.id);
                        }}
                        className={`vale-tap-sm flex h-8 w-8 items-center justify-center rounded border text-xs tabular-nums max-md:h-10 max-md:w-10 ${
                          assigned
                            ? "border-[#c9a227]/70 bg-[#c9a227]/25 text-[#c9a227]"
                            : "border-[#2a2e24] text-[#6a7260] hover:border-[#c9a227]/40 hover:text-[#e8e6d9]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {professions && professions.length > 0 ? (
        <div className="mt-3 border-t border-[#2a2e24] pt-2">
          <div className="font-display text-sm tracking-wide text-[#c9a227]">
            Professions
          </div>
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-[#6a7260]">
            Thornreach lite · gather · fish · kettle
          </div>
          <ul className="flex flex-col gap-1.5">
            {professions.map((p) => {
              const into = Math.max(0, Math.round(p.progress * p.next));
              return (
                <li key={p.id} className="rounded px-2 py-2">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-[#e8e6d9]">{p.name}</span>
                    <span className="font-display tabular-nums text-[#c9a227]">
                      Lv {p.level}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6a7260]">{p.blurb}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#6a7260]">
                    <span>
                      {into} / {p.next} XP
                    </span>
                    <span className="tabular-nums">{p.xp} total</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded bg-[#0c0d0b]">
                    <div
                      className="h-full rounded bg-[#8a9a60]"
                      style={{ width: `${Math.round(p.progress * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
