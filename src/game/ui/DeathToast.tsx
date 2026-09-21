import type { DeathToastCopy } from "@/game/backpack";

/** Death, respawn, and bones hint — premium panel depth, not the flat line toast. */
export function DeathToast({ copy }: { copy: DeathToastCopy }) {
  return (
    <div
      role="status"
      data-loss={copy.lostSomething ? "lost" : "none"}
      className="vale-death-toast pointer-events-none absolute left-1/2 top-[22%] z-20 w-[min(92vw,24rem)] -translate-x-1/2 px-4 py-3.5 sm:px-5"
    >
      <div className="vale-screen-title vale-screen-title-sm">{copy.title}</div>
      <p className="vale-death-respawn">{copy.respawn}</p>
      <p className="vale-death-bones">{copy.bones}</p>
      <div className="vale-ledger-line vale-death-loss">{copy.loss}</div>
      <p className="vale-screen-hint">{copy.safe}</p>
    </div>
  );
}
