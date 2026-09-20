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

export function MobileControls({
  keysRef,
  interactRequestRef,
  onToggleSkills,
  onToggleMap,
}: {
  keysRef: MutableRefObject<Record<string, boolean>>;
  interactRequestRef: MutableRefObject<boolean>;
  onToggleSkills: () => void;
  onToggleMap: () => void;
}) {
  const stickRef = useRef<HTMLDivElement>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const activePointerRef = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [attackHeld, setAttackHeld] = useState(false);

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

  return (
    <div
      className="mobile-chrome pointer-events-none absolute inset-0 z-40"
      aria-hidden={false}
    >
      {/* Virtual joystick — bottom-left */}
      <div
        className="pointer-events-auto absolute"
        style={{
          left: "max(0.75rem, env(safe-area-inset-left))",
          bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div
          ref={stickRef}
          className="relative h-[7.25rem] w-[7.25rem] touch-none rounded-full border border-[#c9a227]/35 bg-[#161812]/55 shadow-lg backdrop-blur-sm"
          onPointerDown={onStickDown}
          onPointerMove={onStickMove}
          onPointerUp={onStickUp}
          onPointerCancel={onStickUp}
          role="presentation"
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a227]/60 bg-[#c9a227]/25"
            style={{
              transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
            }}
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-[9px] uppercase tracking-wider text-[#a8b09a]/80">
            Move
          </span>
        </div>
      </div>

      {/* Action cluster — bottom-right */}
      <div
        className="pointer-events-auto absolute flex flex-col items-end gap-2"
        style={{
          right: "max(0.75rem, env(safe-area-inset-right))",
          bottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex gap-2">
          <ActionBtn label="Skills" sub="K" onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSkills();
          }} />
          <ActionBtn label="Map" sub="M" onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleMap();
          }} />
        </div>
        <div className="flex items-end gap-2">
          <ActionBtn
            label="Interact"
            sub="E"
            size="md"
            onPointerDown={tapInteract}
          />
          <button
            type="button"
            className={`flex h-[4.5rem] w-[4.5rem] touch-none flex-col items-center justify-center rounded-full border text-xs font-medium shadow-lg backdrop-blur-sm transition ${
              attackHeld
                ? "border-[#c45c3e] bg-[#c45c3e]/45 text-[#e8e6d9]"
                : "border-[#c45c3e]/55 bg-[#161812]/60 text-[#e8e6d9]"
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

function ActionBtn({
  label,
  sub,
  size = "sm",
  onPointerDown,
}: {
  label: string;
  sub: string;
  size?: "sm" | "md";
  onPointerDown: (e: ReactPointerEvent) => void;
}) {
  const dim =
    size === "md"
      ? "h-14 w-14 text-[11px]"
      : "h-12 w-12 text-[10px]";
  return (
    <button
      type="button"
      className={`flex ${dim} touch-none flex-col items-center justify-center rounded-full border border-[#2a2e24] bg-[#161812]/60 text-[#e8e6d9] shadow-md backdrop-blur-sm active:border-[#c9a227]/60`}
      onPointerDown={onPointerDown}
    >
      <span className="leading-tight">{label}</span>
      <span className="text-[9px] uppercase tracking-wider text-[#6a7260]">
        {sub}
      </span>
    </button>
  );
}
