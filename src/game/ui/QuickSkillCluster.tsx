import {
  useCallback,
  useEffect,
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

  const releaseAttack = useCallback(() => {
    keysRef.current.Space = false;
    setAttackHeld(false);
  }, [keysRef]);

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
    releaseAttack();
  };

  useEffect(() => {
    const onBlur = () => releaseAttack();
    const onVisibility = () => {
      if (document.hidden) releaseAttack();
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [releaseAttack]);

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
            aria-label="Interact"
            className="vale-round-control pointer-events-auto flex h-16 w-16 touch-none flex-col items-center justify-center rounded-full text-xs text-[#e8e6d9]"
            onPointerDown={tapInteract}
          >
            <span className="font-display leading-tight tracking-wide">Interact</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-wider text-[#a8b09a]">
              E
            </span>
          </button>
        )}
        <div className="relative h-[9.75rem] w-[9.75rem]">
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
            className={`vale-round-control vale-round-control-attack pointer-events-auto absolute left-1/2 top-1/2 flex h-[4.6rem] w-[4.6rem] -translate-x-1/2 -translate-y-1/2 touch-none flex-col items-center justify-center rounded-full text-xs font-medium transition ${
              attackHeld
                ? "vale-round-control-ember text-[#e8e6d9]"
                : "text-[#e8e6d9]"
            }`}
            onPointerDown={attackDown}
            onPointerUp={attackUp}
            onPointerCancel={attackUp}
            onLostPointerCapture={attackUp}
          >
            <span className="font-display text-sm tracking-wide">Attack</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-wider text-[#e8c878]">
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
      className={`vale-round-control pointer-events-auto flex h-[3.25rem] w-[3.25rem] min-h-12 min-w-12 touch-none flex-col items-center justify-center rounded-full text-[#e8e6d9] ${className}`}
      onPointerDown={onPointerDown}
    >
      <span className="text-[10px] uppercase leading-none tracking-wider text-[#c9a227]">
        {slot}
      </span>
      <span className="mt-0.5 text-xs font-medium leading-none">
        {skillAbbrev(skill)}
      </span>
      {row ? (
        <span className="mt-0.5 text-[9px] tabular-nums leading-none text-[#a8b09a]">
          {row.level}
        </span>
      ) : null}
    </button>
  );
}
