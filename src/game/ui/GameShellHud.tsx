import type { ValeClass } from "@/game/classes";
import type { ValeCharacter } from "@/game/character";
import type { HudState } from "@/game/canvasConstants";

export function GameShellHud({
  cls,
  character,
  hud,
  locationLabel,
}: {
  cls: ValeClass;
  character: ValeCharacter;
  hud: HudState;
  locationLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-xl tracking-wide text-[#c9a227] sm:text-2xl">
          The Vale
        </h1>
        <p className="mt-0.5 text-xs text-[#a8b09a] sm:text-sm">
          {locationLabel}
        </p>
        <p
          className="mt-1 font-display text-sm tracking-wide sm:text-base"
          style={{ color: cls.accent }}
        >
          {cls.name}
        </p>
      </div>
      <div className="rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-2 text-xs text-[#e8e6d9] backdrop-blur-sm sm:text-sm">
        <div className="font-display" style={{ color: cls.accent }}>
          Level {hud.level}
        </div>
        <div className="mt-1 text-[#a8b09a]">
          XP {hud.xp} / {hud.next}
        </div>
        <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded bg-[#0c0d0b]">
          <div
            className="h-full rounded"
            style={{
              width: `${Math.round(hud.progress * 100)}%`,
              background: cls.accent,
            }}
          />
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#6a7260]">
            <span>HP</span>
            <span className="normal-case tracking-normal text-[#e8e6d9]">
              {hud.hp}/{hud.maxHp}
            </span>
          </div>
          <div className="mt-0.5 h-1.5 w-28 overflow-hidden rounded bg-[#0c0d0b]">
            <div
              className="h-full rounded bg-[#c45c3e]"
              style={{
                width: `${hud.maxHp > 0 ? Math.round((hud.hp / hud.maxHp) * 100) : 0}%`,
              }}
            />
          </div>
          {hud.maxMana > 0 && (
            <>
              <div className="mt-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-[#6a7260]">
                <span>Mana</span>
                <span className="normal-case tracking-normal text-[#e8e6d9]">
                  {hud.mana}/{hud.maxMana}
                </span>
              </div>
              <div className="mt-0.5 h-1.5 w-28 overflow-hidden rounded bg-[#0c0d0b]">
                <div
                  className="h-full rounded bg-[#4a8ab8]"
                  style={{
                    width: `${hud.maxMana > 0 ? Math.round((hud.mana / hud.maxMana) * 100) : 0}%`,
                  }}
                />
              </div>
            </>
          )}
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-wider text-[#6a7260]">
          Tile {hud.x}, {hud.y} · {character.gold}g
        </div>
      </div>
    </div>
  );
}
