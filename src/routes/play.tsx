import { createFileRoute } from "@tanstack/react-router";
import { GameApp } from "@/game/GameApp";

export const Route = createFileRoute("/play")({ component: Play });

function Play() {
  return (
    <div className="relative h-dvh overflow-hidden overscroll-none bg-bg touch-manipulation">
      <GameApp />
    </div>
  );
}
