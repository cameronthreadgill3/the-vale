import type { ValeClass } from "@/game/classes";
import type { ValeCharacter } from "@/game/character";
import { getItem } from "@/game/items";
import type { HudState } from "@/game/canvasConstants";
import {
  TEETH_QUEST_TITLE,
  ASHWOOD_QUEST_TITLE,
  HOLLOW_QUEST_TITLE,
  GATE_QUEST_TITLE,
  MISTMERE_QUEST_TITLE,
  teethHudLines,
  ashwoodHudLines,
  hollowHudLines,
  gateWatchHudLines,
  mistmereHudLines,
  type TeethQuestProgress,
  type AshwoodQuestProgress,
  type HollowQuestProgress,
  type GateWatchQuestProgress,
  type MistmereQuestProgress,
} from "@/game/quests";

function equippedLine(character: ValeCharacter): string {
  const eq = character.equipment;
  if (!eq) return "Unarmed";
  const bits: string[] = [];
  if (character.equipment.weapon) bits.push(getItem(character.equipment.weapon).name);
  if (character.equipment.armor) bits.push(getItem(character.equipment.armor).name);
  if (character.equipment.shield) bits.push(getItem(character.equipment.shield).name);
  return bits.length > 0 ? bits.join(" · ") : "Unarmed";
}

export function GameShellHud({
  cls,
  character,
  hud,
  locationLabel,
  teethQuest,
  ashwoodQuest,
  hollowQuest,
  gateWatchQuest,
  mistmereQuest,
  onOpenPack,
}: {
  cls: ValeClass;
  character: ValeCharacter;
  hud: HudState;
  locationLabel: string;
  teethQuest: TeethQuestProgress | null;
  ashwoodQuest: AshwoodQuestProgress | null;
  hollowQuest: HollowQuestProgress | null;
  gateWatchQuest: GateWatchQuestProgress | null;
  mistmereQuest: MistmereQuestProgress | null;
  onOpenPack: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-xl tracking-wide text-[#c9a227] sm:text-2xl">
          The Vale
        </h1>
        <p className="mt-0.5 text-xs text-[#a8b09a] sm:text-sm">
          {hud.huntZoneLabel
            ? `${locationLabel} · ${hud.huntZoneLabel}`
            : locationLabel}
        </p>
        <p
          className="mt-1 font-display text-sm tracking-wide sm:text-base"
          style={{ color: cls.accent }}
        >
          {cls.name}
        </p>
        {hud.objectiveLabel && (
          <div className="vale-chrome mt-2 max-w-xs rounded-sm border-[#c9a227]/55 bg-[#12140e]/95 px-2.5 py-1.5 text-[11px] leading-snug text-[#f0d060] sm:text-xs">
            <span className="font-display tracking-wide">
              → {hud.objectiveLabel}
            </span>
            {typeof hud.objectiveDist === "number" && (
              <span className="ml-1 text-[#a8b09a]">
                · {hud.objectiveDist} tiles
              </span>
            )}
          </div>
        )}
        {mistmereQuest && mistmereQuest.status === "active" ? (
          <div className="vale-chrome mt-2 max-w-xs rounded-sm px-2.5 py-1.5 text-[10px] leading-relaxed text-[#9aa288] sm:text-xs">
            <div className="font-display text-[11px] tracking-wide text-[#c9a227] sm:text-xs">
              {MISTMERE_QUEST_TITLE}
            </div>
            <ul className="mt-1 space-y-0.5">
              {mistmereHudLines(mistmereQuest).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : gateWatchQuest && gateWatchQuest.status === "active" ? (
          <div className="vale-chrome mt-2 max-w-xs rounded-sm px-2.5 py-1.5 text-[10px] leading-relaxed text-[#9aa288] sm:text-xs">
            <div className="font-display text-[11px] tracking-wide text-[#c9a227] sm:text-xs">
              {GATE_QUEST_TITLE}
            </div>
            <ul className="mt-1 space-y-0.5">
              {gateWatchHudLines(gateWatchQuest).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : hollowQuest && hollowQuest.status === "active" ? (
          <div className="vale-chrome mt-2 max-w-xs rounded-sm px-2.5 py-1.5 text-[10px] leading-relaxed text-[#9aa288] sm:text-xs">
            <div className="font-display text-[11px] tracking-wide text-[#c9a227] sm:text-xs">
              {HOLLOW_QUEST_TITLE}
            </div>
            <ul className="mt-1 space-y-0.5">
              {hollowHudLines(hollowQuest).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : ashwoodQuest && ashwoodQuest.status === "active" ? (
          <div className="vale-chrome mt-2 max-w-xs rounded-sm px-2.5 py-1.5 text-[10px] leading-relaxed text-[#9aa288] sm:text-xs">
            <div className="font-display text-[11px] tracking-wide text-[#c9a227] sm:text-xs">
              {ASHWOOD_QUEST_TITLE}
            </div>
            <ul className="mt-1 space-y-0.5">
              {ashwoodHudLines(ashwoodQuest).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : (
          teethQuest &&
          teethQuest.status === "active" && (
            <div className="vale-chrome mt-2 max-w-xs rounded-sm px-2.5 py-1.5 text-[10px] leading-relaxed text-[#9aa288] sm:text-xs">
              <div className="font-display text-[11px] tracking-wide text-[#c9a227] sm:text-xs">
                {TEETH_QUEST_TITLE}
              </div>
              <ul className="mt-1 space-y-0.5">
                {teethHudLines(teethQuest).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
      <div className="vale-chrome rounded-sm px-3 py-2 text-xs text-[#e0dcc8] sm:text-sm">
        <div className="font-display" style={{ color: cls.accent }}>
          Level {hud.level}
        </div>
        <div className="mt-1 text-[#a8b09a]">
          XP {hud.xp} / {hud.next}
        </div>
        <div className="mt-1.5 h-1.5 w-28 overflow-hidden rounded-sm bg-[#050604]">
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
          <div className="mt-0.5 h-1.5 w-28 overflow-hidden rounded-sm bg-[#050604]">
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
              <div className="mt-0.5 h-1.5 w-28 overflow-hidden rounded-sm bg-[#050604]">
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
          {character.bankGold > 0 ? ` · Vault ${character.bankGold}g` : ""}
        </div>
        <button
          type="button"
          className="pointer-events-auto mt-1.5 w-full text-left text-[10px] uppercase tracking-wider text-[#6a7260] hover:text-[#c9a227]"
          onClick={onOpenPack}
        >
          <span className={hud.weight >= hud.maxWeight ? "text-[#c45c3e]" : hud.weight / Math.max(1, hud.maxWeight) >= 0.8 ? "text-[#c9a227]" : ""}>
            Pack {hud.weight}/{hud.maxWeight} wt
          </span>
          <span className="text-[#6a7260]"> · {hud.slots}/{hud.maxSlots}</span>
          {character.premiumBackpack && (
            <span className="text-[#c9a227]"> · Prem</span>
          )}
        </button>
        <div className="mt-0.5 truncate text-[10px] text-[#a8b09a]">
          {equippedLine(character)}
        </div>
        {hud.inSafeZone && (
          <div className="mt-1 text-[10px] uppercase tracking-wider text-[#7ab8c9]">
            Safe — no beasts here
          </div>
        )}
      </div>
    </div>
  );
}
