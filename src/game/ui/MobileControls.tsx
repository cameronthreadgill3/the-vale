import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";

const DEADZONE = 0.22;
const MOVE_KEYS = ["KeyW", "KeyA", "KeyS", "KeyD"] as const;

function clearMoveKeys(keys: Record<string, boolean>) {
  for (const k of MOVE_KEYS) keys[k] = false;
}

function applyJoystickToKeys(
  keys: Record<string, boolean>,
  nx: number,
  ny: number,
) {
  clearMoveKeys(keys);
  const mag = Math.hypot(nx, ny);
  if (mag < DEADZONE) return;
  const x = nx / mag;
  const y = ny / mag;
  // Prefer 8-way; diagonals set two keys so existing normalize path works.
  if (y < -DEADZONE) keys.KeyW = true;
  if (y > DEADZONE) keys.KeyS = true;
  if (x < -DEADZONE) keys.KeyA = true;
  if (x > DEADZONE) keys.KeyD = true;
}

export function useShowMobileChrome(): boolean {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(max-width: 768px)").matches
    );
  });

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const narrow = window.matchMedia("(max-width: 768px)");
    const sync = () => setShow(coarse.matches || narrow.matches);
    sync();
    coarse.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    return () => {
      coarse.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  return show;
}

/** Virtual joystick (bottom-left). Attack / skills live in QuickSkillCluster. */
export function MobileControls({
  keysRef,
}: {
  keysRef: MutableRefObject<Record<string, boolean>>;
}) {
  const stickRef = useRef<HTMLDivElement>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const activePointerRef = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const endJoystick = useCallback(() => {
    activePointerRef.current = null;
    clearMoveKeys(keysRef.current);
    setKnob({ x: 0, y: 0 });
  }, [keysRef]);

  const onStickDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = stickRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    activePointerRef.current = e.pointerId;
    const rect = el.getBoundingClientRect();
    originRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const radius = rect.width / 2;
    const dx = e.clientX - originRef.current.x;
    const dy = e.clientY - originRef.current.y;
    const mag = Math.hypot(dx, dy);
    const clamped = mag > radius ? radius / mag : 1;
    const nx = (dx * clamped) / radius;
    const ny = (dy * clamped) / radius;
    setKnob({ x: nx * radius * 0.55, y: ny * radius * 0.55 });
    applyJoystickToKeys(keysRef.current, nx, ny);
  };

  const onStickMove = (e: ReactPointerEvent) => {
    if (activePointerRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    const el = stickRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const radius = rect.width / 2;
    const dx = e.clientX - originRef.current.x;
    const dy = e.clientY - originRef.current.y;
    const mag = Math.hypot(dx, dy);
    const clamped = mag > radius ? radius / mag : 1;
    const nx = (dx * clamped) / radius;
    const ny = (dy * clamped) / radius;
    setKnob({ x: nx * radius * 0.55, y: ny * radius * 0.55 });
    applyJoystickToKeys(keysRef.current, nx, ny);
  };

  const onStickUp = (e: ReactPointerEvent) => {
    if (activePointerRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    endJoystick();
  };

  useEffect(() => {
    return () => {
      clearMoveKeys(keysRef.current);
      keysRef.current.Space = false;
    };
  }, [keysRef]);

  return (
    <div
      className="mobile-chrome pointer-events-none absolute inset-0 z-40"
      aria-hidden={false}
    >
      <div
        className="pointer-events-auto absolute"
        style={{
          left: "max(0.75rem, env(safe-area-inset-left))",
          bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div
          ref={stickRef}
          className="relative h-[7.5rem] w-[7.5rem] touch-none rounded-full border border-[#c9a227]/45 bg-[#161812]/72 shadow-lg backdrop-blur-sm"
          onPointerDown={onStickDown}
          onPointerMove={onStickMove}
          onPointerUp={onStickUp}
          onPointerCancel={onStickUp}
          role="presentation"
          aria-label="Move"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a227]/70 bg-[#c9a227]/30"
            style={{
              transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
            }}
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-1.5 text-center font-display text-[11px] uppercase tracking-wider text-[#e8e6d9]">
            Move
          </span>
        </div>
      </div>
    </div>
  );
}
