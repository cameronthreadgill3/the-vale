export type Actions = {
  moveX: number;
  moveY: number;
  attack: boolean;
  pause: boolean;
  interact: boolean;
  inventory: boolean;
  map: boolean;
  chat: boolean;
  heal: boolean;
  mana: boolean;
  ability: [boolean, boolean, boolean, boolean];
};

const GAME_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "Escape",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "KeyP",
  "KeyE",
  "KeyI",
  "KeyB",
  "KeyM",
  "KeyF",
  "KeyQ",
]);

export type PointerWorld = { x: number; y: number; down: boolean; justDown: boolean; touch: boolean };

function typingInField(e: Event) {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function createInput(canvas: HTMLCanvasElement) {
  const keys = new Set<string>();
  const injected = new Set<string>();
  const prev: Actions = {
    moveX: 0,
    moveY: 0,
    attack: false,
    pause: false,
    interact: false,
    inventory: false,
    map: false,
    chat: false,
    heal: false,
    mana: false,
    ability: [false, false, false, false],
  };
  const stick = { x: 0, y: 0 };
  const pointer: PointerWorld = { x: 0, y: 0, down: false, justDown: false, touch: false };
  let screenToWorld: (x: number, y: number) => { x: number; y: number } = (x, y) => ({ x, y });

  const onDown = (e: KeyboardEvent) => {
    if (typingInField(e)) return;
    keys.add(e.code);
    if (GAME_KEYS.has(e.code)) e.preventDefault();
  };
  const onUp = (e: KeyboardEvent) => {
    if (typingInField(e)) return;
    keys.delete(e.code);
  };
  const clear = () => keys.clear();

  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });

  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * canvas.width;
    const sy = ((e.clientY - r.top) / r.height) * canvas.height;
    const w = screenToWorld(sx, sy);
    pointer.x = w.x;
    pointer.y = w.y;
    pointer.touch = e.pointerType !== "mouse";
    if (e.type === "pointerdown") {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (e.cancelable) e.preventDefault();
      pointer.down = true;
      pointer.justDown = true;
    }
    if (e.type === "pointerup" || e.type === "pointercancel") pointer.down = false;
  };
  canvas.addEventListener("pointerdown", onPointer, { passive: false });
  canvas.addEventListener("pointermove", onPointer);
  window.addEventListener("pointerup", onPointer);
  window.addEventListener("pointercancel", onPointer);

  function pollGamepad(a: Actions) {
    const pads = navigator.getGamepads?.() ?? [];
    for (const p of pads) {
      if (!p || p.mapping !== "standard") continue;
      const lx = p.axes[0] ?? 0;
      const ly = p.axes[1] ?? 0;
      const m = Math.hypot(lx, ly);
      if (m > 0.18) {
        const s = ((m - 0.18) / 0.82) / m;
        a.moveX += lx * s;
        a.moveY += ly * s;
      }
      if (p.buttons[0]?.pressed) a.attack = true;
      if (p.buttons[9]?.pressed) a.pause = true;
      if (p.buttons[2]?.pressed) a.ability[0] = true;
      if (p.buttons[3]?.pressed) a.ability[1] = true;
      if (p.buttons[4]?.pressed) a.ability[2] = true;
      if (p.buttons[5]?.pressed) a.ability[3] = true;
    }
  }

  return {
    pointer,
    setScreenToWorld(fn: typeof screenToWorld) {
      screenToWorld = fn;
    },
    setStick(x: number, y: number) {
      stick.x = x;
      stick.y = y;
    },
    setKeys(codes: string[]) {
      injected.clear();
      for (const c of codes) injected.add(c);
    },
    heldCodes() {
      return [...(injected.size ? injected : keys)];
    },
    sample(): Actions & {
      just: { attack: boolean; pause: boolean; interact: boolean; inventory: boolean; map: boolean; chat: boolean; heal: boolean; mana: boolean; ability: boolean[] };
    } {
      const held = injected.size ? injected : keys;
      const a: Actions = {
        moveX: 0,
        moveY: 0,
        attack: held.has("Space"),
        pause: held.has("Escape") || held.has("KeyP"),
        interact: held.has("KeyE"),
        inventory: held.has("KeyI") || held.has("KeyB"),
        map: held.has("KeyM"),
        chat: held.has("Enter") || held.has("NumpadEnter"),
        heal: held.has("KeyF"),
        mana: held.has("KeyQ"),
        ability: [held.has("Digit1"), held.has("Digit2"), held.has("Digit3"), held.has("Digit4")],
      };
      if (held.has("KeyA") || held.has("ArrowLeft")) a.moveX -= 1;
      if (held.has("KeyD") || held.has("ArrowRight")) a.moveX += 1;
      if (held.has("KeyW") || held.has("ArrowUp")) a.moveY -= 1;
      if (held.has("KeyS") || held.has("ArrowDown")) a.moveY += 1;
      a.moveX += stick.x;
      a.moveY += stick.y;
      pollGamepad(a);
      const len = Math.hypot(a.moveX, a.moveY);
      if (len > 1) {
        a.moveX /= len;
        a.moveY /= len;
      }
      const just = {
        attack: a.attack && !prev.attack,
        pause: a.pause && !prev.pause,
        interact: a.interact && !prev.interact,
        inventory: a.inventory && !prev.inventory,
        map: a.map && !prev.map,
        chat: a.chat && !prev.chat,
        heal: a.heal && !prev.heal,
        mana: a.mana && !prev.mana,
        ability: a.ability.map((v, i) => v && !prev.ability[i]),
      };
      prev.moveX = a.moveX;
      prev.moveY = a.moveY;
      prev.attack = a.attack;
      prev.pause = a.pause;
      prev.interact = a.interact;
      prev.inventory = a.inventory;
      prev.map = a.map;
      prev.chat = a.chat;
      prev.heal = a.heal;
      prev.mana = a.mana;
      prev.ability = [...a.ability] as Actions["ability"];
      const pd = pointer.justDown;
      pointer.justDown = false;
      return { ...a, just: { ...just, attack: just.attack || pd } };
    },
    destroy() {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
      canvas.removeEventListener("pointerdown", onPointer);
      canvas.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerup", onPointer);
      window.removeEventListener("pointercancel", onPointer);
    },
  };
}

export type Input = ReturnType<typeof createInput>;
