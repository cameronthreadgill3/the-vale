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
  rest: boolean;
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
  "KeyR",
]);

export type PointerWorld = { x: number; y: number; down: boolean; justDown: boolean; touch: false };
