/** Pointer / touch helpers for canvas attack (desktop click + mobile tap). */
export type MouseState = {
  x: number;
  y: number;
  down: boolean;
  worldX: number;
  worldY: number;
};

export function attachCanvasPointers(
  canvas: HTMLCanvasElement,
  mouse: MouseState,
): () => void {
  const setMouseFromClient = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = clientX - rect.left;
    mouse.y = clientY - rect.top;
  };
  const onPointerMove = (e: PointerEvent) => {
    setMouseFromClient(e.clientX, e.clientY);
  };
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    mouse.down = true;
    setMouseFromClient(e.clientX, e.clientY);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    mouse.down = false;
  };
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  return () => {
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerUp);
  };
}
