import {
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { SkillId } from "@/game/skills";
import { skillAbbrev, skillName, type QuickSlots } from "@/game/skills";
import type { SkillRow } from "@/game/ui/SkillsPanel";

export function QuickSkillCluster({
  keysRef,
  interactRequestRef,
  quickSlots,
  skills,
  onTrain,
  showInteract,
}: {
  keysRef: MutableRefObject<Record<string, boolean>>;
  interactRequestRef: MutableRefObject<boolean>;
  quickSlots: QuickSlots;
  skills: SkillRow[];
  onTrain: (skill: SkillId) => void;
  showInteract: boolean;
}) {
  const [attackHeld, setAttackHeld] = useState(false);

  const attackDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    keysRef.current.Space = true;
    setAttackHeld(true);
  };
  const attackUp = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    keysRef.current.Space = false;
    setAttackHeld(false);
  };

  const tapInteract = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    interactRequestRef.current = true;
  };

  const tapSkill = (skill: SkillId) => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onTrain(skill);
  };

  const rowFor = (id: SkillId) => skills.find((s) => s.id === id);

  return (
    <div
      className="pointer-events-none absolute z-40"
      style={{
        right: "max(0.75rem, env(safe-area-inset-right))",
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-end gap-2">
        {showInteract && (
          <button
            type="button"
            className="pointer-events-auto flex h-14 w-14 touch-none flex-col items-center justify-center rounded-full border border-[#2a2e24] bg-[#161812]/60 text-[11px] text-[#e8e6d9] shadow-md backdrop-blur-sm active:border-[#c9a227]/60"
            onPointerDown={tapInteract}
          >
            <span className="leading-tight">Interact</span>
            <span className="text-[9px] uppercase tracking-wider text-[#6a7260]">
              E
            </span>
          </button>
        )}
        <div className="relative h-[9.5rem] w-[9.5rem]">
          <QuickSlotBtn
            slot={1}
            skill={quickSlots[0]}
            row={rowFor(quickSlots[0])}
            onPointerDown={tapSkill(quickSlots[0])}
            className="absolute left-0 top-1/2 -translate-x-[18%] -translate-y-1/2"
          />
          <QuickSlotBtn
            slot={2}
            skill={quickSlots[1]}
            row={rowFor(quickSlots[1])}
            onPointerDown={tapSkill(quickSlots[1])}
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[18%]"
          />
          <QuickSlotBtn
            slot={3}
            skill={quickSlots[2]}
            row={rowFor(quickSlots[2])}
            onPointerDown={tapSkill(quickSlots[2])}
            className="absolute right-0 top-1/2 translate-x-[18%] -translate-y-1/2"
          />
          <button
            type="button"
            aria-label="Attack"
            className={`pointer-events-auto absolute left-1/2 top-1/2 flex h-[4.35rem] w-[4.35rem] -translate-x-1/2 -translate-y-1/2 touch-none flex-col items-center justify-center rounded-full border text-xs font-medium shadow-lg backdrop-blur-sm transition ${
              attackHeld
                ? "border-[#c45c3e] bg-[#c45c3e]/45 text-[#e8e6d9]"
                : "border-[#c45c3e]/55 bg-[#161812]/70 text-[#e8e6d9]"
            }`}
            onPointerDown={attackDown}
            onPointerUp={attackUp}
            onPointerCancel={attackUp}
          >
            <span className="font-display text-sm tracking-wide">Attack</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[#a8b09a]">
              Hold
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickSlotBtn({
  slot,
  skill,
  row,
  onPointerDown,
  className,
}: {
  slot: 1 | 2 | 3;
  skill: SkillId;
  row: SkillRow | undefined;
  onPointerDown: (e: ReactPointerEvent) => void;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Quick skill ${slot}: ${skillName(skill)}`}
      className={`pointer-events-auto flex h-12 w-12 touch-none flex-col items-center justify-center rounded-full border border-[#c9a227]/45 bg-[#161812]/80 text-[#e8e6d9] shadow-md backdrop-blur-sm active:border-[#c9a227]/80 ${className}`}
      onPointerDown={onPointerDown}
    >
      <span className="text-[9px] uppercase leading-none tracking-wider text-[#c9a227]">
        {slot}
      </span>
      <span className="mt-0.5 text-[11px] font-medium leading-none">
        {skillAbbrev(skill)}
      </span>
      {row ? (
        <span className="mt-0.5 text-[8px] tabular-nums leading-none text-[#6a7260]">
          {row.level}
        </span>
      ) : null}
    </button>
  );
}
