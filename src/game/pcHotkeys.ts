import { useGameStore } from "./store";

function typingInField(t: EventTarget | null) {
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** F drinks a health draught from the pack. */
export function attachHealHotkey(useItem: (item: "health_potion") => boolean) {
  const onDown = (e: KeyboardEvent) => {
    if (e.code !== "KeyF" || e.repeat) return;
    if (typingInField(e.target)) return;
    const screen = useGameStore.getState().screen;
    if (screen !== "playing" && screen !== "paused") return;
    e.preventDefault();
    if (!useItem("health_potion")) {
      useGameStore.getState().pulse({ toast: "No draught in the pack." });
    }
  };
  window.addEventListener("keydown", onDown);
  return () => window.removeEventListener("keydown", onDown);
}
