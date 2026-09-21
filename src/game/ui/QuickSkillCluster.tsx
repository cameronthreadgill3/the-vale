import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { SkillId } from "@/game/skills";
import { skillAbbrev, skillName, type QuickSlots } from "@/game/skills";
import type { SkillRow } from "@/game/ui/SkillsPanel";

/** Cast-sweep length. Visual chrome only — training and attacks are not gated. */
const CAST_MS = 640;

type CastId = "1" | "2" | "3" | "attack" | "interact";

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
  const [casts, setCasts] = useState<Partial<Record<CastId, number>>>({});
  const pointerAttack = useRef(false);
  const keyAttack = useRef(false);
  const castTimers = useRef<Partial<Record<CastId, number>>>({});

  const pulse = useCallback((id: CastId) => {
    setCasts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    const pending = castTimers.current[id];
    if (pending) window.clearTimeout(pending);
    castTimers.current[id] = window.setTimeout(() => {
      setCasts((prev) => {
        if (prev[id] == null) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      delete castTimers.current[id];
    }, CAST_MS);
  }, []);

  const syncAttackHeld = useCallback(() => {
    setAttackHeld(pointerAttack.current || keyAttack.current);
  }, []);

  const releaseAttack = useCallback(() => {
    const was = pointerAttack.current;
    pointerAttack.current = false;
    keysRef.current.Space = false;
    syncAttackHeld();
    if (was) pulse("attack");
  }, [keysRef, pulse, syncAttackHeld]);

  const attackDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointerAttack.current = true;
    keysRef.current.Space = true;
    syncAttackHeld();
  };
  const attackUp = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    releaseAttack();
  };

  useEffect(() => {
    const onBlur = () => {
      const was = pointerAttack.current || keyAttack.current;
      pointerAttack.current = false;
      keyAttack.current = false;
      keysRef.current.Space = false;
      setAttackHeld(false);
      if (was) pulse("attack");
    };
    const onVisibility = () => {
      if (document.hidden) onBlur();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === "Space" && !e.repeat) {
        keyAttack.current = true;
        syncAttackHeld();
      }
      if (e.repeat) return;
      if (e.key === "1" || e.key === "2" || e.key === "3") pulse(e.key);
      if (e.code === "KeyE") pulse("interact");
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      const was = keyAttack.current;
      keyAttack.current = false;
      syncAttackHeld();
      if (was) pulse("attack");
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      for (const id of Object.keys(castTimers.current) as CastId[]) {
        const timer = castTimers.current[id];
        if (timer) window.clearTimeout(timer);
      }
    };
  }, [keysRef, pulse, syncAttackHeld]);

  const tapInteract = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    interactRequestRef.current = true;
    pulse("interact");
  };

  const tapSkill = (slot: 1 | 2 | 3, skill: SkillId) => (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    pulse(String(slot) as "1" | "2" | "3");
    onTrain(skill);
  };

  const rowFor = (id: SkillId) => skills.find((s) => s.id === id);

  return (
    <div
      className="vale-touch-root"
      style={{
        position: "absolute",
        right: "max(0.75rem, env(safe-area-inset-right, 0px))",
        bottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        zIndex: 200,
        pointerEvents: "none",
        touchAction: "none",
      }}
    >
      <div className="flex items-end gap-2">
        {showInteract && (
          <button
            type="button"
            aria-label="Interact"
            aria-pressed={casts.interact != null}
            className={`vale-hotbar-slot pointer-events-auto flex h-16 w-16 touch-none flex-col items-center justify-center rounded-full ${
              casts.interact != null ? "vale-hotbar-slot-cast" : ""
            }`}
            onPointerDown={tapInteract}
          >
            <span className="vale-hotbar-face">
              <span className="vale-hotbar-name">Interact</span>
              <span className="vale-hotbar-key mt-1">E</span>
            </span>
            {casts.interact != null ? (
              <span key={casts.interact} className="vale-hotbar-cd" aria-hidden />
            ) : null}
          </button>
        )}
        <div className="vale-hotbar relative h-[9.75rem] w-[9.75rem]">
          <div className="vale-hotbar-tray" aria-hidden />
          <QuickSlotBtn
            slot={1}
            skill={quickSlots[0]}
            row={rowFor(quickSlots[0])}
            castKey={casts["1"]}
            onPointerDown={tapSkill(1, quickSlots[0])}
            className="absolute left-0 top-1/2 -translate-x-[18%] -translate-y-1/2"
          />
          <QuickSlotBtn
            slot={2}
            skill={quickSlots[1]}
            row={rowFor(quickSlots[1])}
            castKey={casts["2"]}
            onPointerDown={tapSkill(2, quickSlots[1])}
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[18%]"
          />
          <QuickSlotBtn
            slot={3}
            skill={quickSlots[2]}
            row={rowFor(quickSlots[2])}
            castKey={casts["3"]}
            onPointerDown={tapSkill(3, quickSlots[2])}
            className="absolute right-0 top-1/2 translate-x-[18%] -translate-y-1/2"
          />
          <button
            type="button"
            aria-label="Attack"
            aria-pressed={attackHeld}
            className={`vale-hotbar-slot vale-hotbar-attack pointer-events-auto absolute left-1/2 top-1/2 flex h-[4.6rem] w-[4.6rem] -translate-x-1/2 -translate-y-1/2 touch-none flex-col items-center justify-center rounded-full ${
              attackHeld ? "vale-hotbar-slot-held" : ""
            } ${casts.attack != null ? "vale-hotbar-slot-cast" : ""}`}
            onPointerDown={attackDown}
            onPointerUp={attackUp}
            onPointerCancel={attackUp}
            onLostPointerCapture={attackUp}
          >
            <span className="vale-hotbar-face">
              <span className="vale-hotbar-name">Attack</span>
              <span className="vale-hotbar-key mt-1">Hold</span>
            </span>
            {casts.attack != null ? (
              <span key={casts.attack} className="vale-hotbar-cd" aria-hidden />
            ) : null}
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
  castKey,
  onPointerDown,
  className,
}: {
  slot: 1 | 2 | 3;
  skill: SkillId;
  row: SkillRow | undefined;
  castKey: number | undefined;
  onPointerDown: (e: ReactPointerEvent) => void;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Quick skill ${slot}: ${skillName(skill)}`}
      aria-pressed={castKey != null}
      className={`vale-hotbar-slot pointer-events-auto flex h-[3.25rem] w-[3.25rem] min-h-12 min-w-12 touch-none flex-col items-center justify-center rounded-full ${
        castKey != null ? "vale-hotbar-slot-cast" : ""
      } ${className}`}
      onPointerDown={onPointerDown}
    >
      <span className="vale-hotbar-face">
        <span className="vale-hotbar-key">{slot}</span>
        <span className="vale-hotbar-name">{skillAbbrev(skill)}</span>
        {row ? <span className="vale-hotbar-level">{row.level}</span> : null}
      </span>
      {castKey != null ? <span key={castKey} className="vale-hotbar-cd" aria-hidden /> : null}
    </button>
  );
}
