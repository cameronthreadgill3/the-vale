import type { GameHandle } from "./engine";
import { useGameStore } from "./store";

function typingInField(t: EventTarget | null) {
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** F drinks a health draught from the pack. */
export function attachHealHotkey(game: { current: GameHandle | null }) {
  const onDown = (e: KeyboardEvent) => {
    if (e.code !== "KeyF" || e.repeat) return;
    if (typingInField(e.target)) return;
    const screen = useGameStore.getState().screen;
    if (screen !== "playing" && screen !== "paused") return;
    e.preventDefault();
    const g = game.current;
    if (!g) return;
    if (!g.useItem("health_potion")) {
      useGameStore.getState().pulse({ toast: "No draught in the pack." });
    }
  };
  window.addEventListener("keydown", onDown);
  return () => window.removeEventListener("keydown", onDown);
}
