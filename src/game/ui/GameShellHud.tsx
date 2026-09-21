import { useEffect, useRef, useState } from "react";
import type { ValeClass } from "@/game/classes";
import type { ValeCharacter } from "@/game/character";
import { getItem } from "@/game/items";
import type { HudState } from "@/game/canvasConstants";
import {
  armAudio,
  holdAmbient,
  isAudioMuted,
  playToast,
  releaseAmbient,
  setAudioMuted,
  subscribeAudioMuted,
  watchOverlayToasts,
} from "@/game/audio";
import { LOW_HP_RATIO } from "@/game/combat";
import { SAFE_ZONE_LABEL } from "@/game/safeZone";
import {
  TEETH_QUEST_TITLE,
  ASHWOOD_QUEST_TITLE,
  HOLLOW_QUEST_TITLE,
  GATE_QUEST_TITLE,
  MISTMERE_QUEST_TITLE,
  WATCHLINE_QUEST_TITLE,
  ASHVEIL_QUEST_TITLE,
  CHOIR_COUNTS_QUEST_TITLE,
  WHARF_QUEST_TITLE,
  teethHudLines,
  ashwoodHudLines,
  hollowHudLines,
  gateWatchHudLines,
  mistmereHudLines,
  watchlineHudLines,
  ashveilHudLines,
  choirCountsHudLines,
  wharfHudLines,
  type TeethQuestProgress,
  type AshwoodQuestProgress,
  type HollowQuestProgress,
  type GateWatchQuestProgress,
  type MistmereQuestProgress,
  type WatchlineQuestProgress,
  type AshveilQuestProgress,
  type ChoirCountsQuestProgress,
  type WharfQuestProgress,
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

function activeQuest(
  wharfQuest: WharfQuestProgress | null,
  choirCountsQuest: ChoirCountsQuestProgress | null,
  ashveilQuest: AshveilQuestProgress | null,
  watchlineQuest: WatchlineQuestProgress | null,
  mistmereQuest: MistmereQuestProgress | null,
  gateWatchQuest: GateWatchQuestProgress | null,
  hollowQuest: HollowQuestProgress | null,
  ashwoodQuest: AshwoodQuestProgress | null,
  teethQuest: TeethQuestProgress | null,
): { title: string; lines: string[] } | null {
  if (wharfQuest?.status === "active") {
    return { title: WHARF_QUEST_TITLE, lines: wharfHudLines(wharfQuest) };
  }
  if (choirCountsQuest?.status === "active") {
    return { title: CHOIR_COUNTS_QUEST_TITLE, lines: choirCountsHudLines(choirCountsQuest) };
  }
  if (ashveilQuest?.status === "active") {
    return { title: ASHVEIL_QUEST_TITLE, lines: ashveilHudLines(ashveilQuest) };
  }
  if (watchlineQuest?.status === "active") {
    return { title: WATCHLINE_QUEST_TITLE, lines: watchlineHudLines(watchlineQuest) };
  }
  if (mistmereQuest?.status === "active") {
    return { title: MISTMERE_QUEST_TITLE, lines: mistmereHudLines(mistmereQuest) };
  }
  if (gateWatchQuest?.status === "active") {
    return { title: GATE_QUEST_TITLE, lines: gateWatchHudLines(gateWatchQuest) };
  }
  if (hollowQuest?.status === "active") {
    return { title: HOLLOW_QUEST_TITLE, lines: hollowHudLines(hollowQuest) };
  }
  if (ashwoodQuest?.status === "active") {
    return { title: ASHWOOD_QUEST_TITLE, lines: ashwoodHudLines(ashwoodQuest) };
  }
  if (teethQuest?.status === "active") {
    return { title: TEETH_QUEST_TITLE, lines: teethHudLines(teethQuest) };
  }
  return null;
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
  watchlineQuest,
  ashveilQuest,
  choirCountsQuest,
  wharfQuest,
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
  watchlineQuest: WatchlineQuestProgress | null;
  ashveilQuest: AshveilQuestProgress | null;
  choirCountsQuest: ChoirCountsQuestProgress | null;
  wharfQuest: WharfQuestProgress | null;
  onOpenPack: () => void;
}) {
  const [muted, setMuted] = useState(isAudioMuted);
  const quest = activeQuest(
    wharfQuest,
    choirCountsQuest,
    ashveilQuest,
    watchlineQuest,
    mistmereQuest,
    gateWatchQuest,
    hollowQuest,
    ashwoodQuest,
    teethQuest,
  );
  const hpRatio = hud.maxHp > 0 ? hud.hp / hud.maxHp : 0;
  const hpLow = hpRatio <= LOW_HP_RATIO;
  const packHeavy = hud.weight >= hud.maxWeight;
  const packHigh = hud.weight / Math.max(1, hud.maxWeight) >= 0.8;
  const questPing = quest ? `${quest.title}:${quest.lines.join("|")}` : "";
  const prevQuestPing = useRef<string | null>(null);

  useEffect(() => {
    armAudio();
    holdAmbient();
    const unsub = subscribeAudioMuted(setMuted);
    return () => {
      unsub();
      releaseAmbient();
    };
  }, []);

  useEffect(() => {
    const root = document.querySelector(".game-root");
    if (!root) return;
    return watchOverlayToasts(root);
  }, []);

  useEffect(() => {
    if (prevQuestPing.current === null) {
      prevQuestPing.current = questPing;
      return;
    }
    if (questPing && questPing !== prevQuestPing.current) playToast();
    prevQuestPing.current = questPing;
  }, [questPing]);

  return (
    <div className="vale-hud grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-lg tracking-wide text-[#c9a227] sm:text-2xl">
          The Vale
        </h1>
        <p className="mt-0.5 text-xs leading-snug text-[#c8c4b0] sm:text-sm">
          {locationLabel}
        </p>
        {hud.huntZoneLabel && (
          <p className="text-[11px] leading-snug text-[#a8b09a] sm:text-xs">
            {hud.huntZoneLabel}
          </p>
        )}
        <p
          className="mt-1 font-display text-sm tracking-wide sm:text-base"
          style={{ color: cls.accent }}
        >
          {cls.name}
        </p>
        {hud.objectiveLabel && (
          <div className="vale-hud-panel vale-chrome mt-2 max-w-xs rounded-sm border-[#c9a227]/70 px-2.5 py-1.5 text-[12px] leading-snug text-[#f0d060] sm:text-sm">
            <div className="text-[9px] uppercase tracking-wider text-[#c9a227]/90">
              Objective
            </div>
            <div className="font-display tracking-wide">
              {hud.objectiveLabel}
              {typeof hud.objectiveDist === "number" && (
                <span className="ml-1 font-sans text-[11px] text-[#c8c4b0] sm:text-xs">
                  · {hud.objectiveDist} tiles
                </span>
              )}
            </div>
          </div>
        )}
        {quest && <QuestHudCard title={quest.title} lines={quest.lines} />}
      </div>
      <div className="vale-hud-vitals vale-hud-panel vale-chrome mt-9 w-[8.75rem] shrink-0 rounded-sm px-2.5 py-2 text-xs text-[#e0dcc8] sm:mt-10 sm:w-36 sm:px-3 sm:text-sm">
        <div className="font-display" style={{ color: cls.accent }}>
          Level {hud.level}
        </div>
        <div className="mt-1 text-[#a8b09a]">
          XP {hud.xp} / {hud.next}
        </div>
        <HudMeter ratio={hud.progress} fill={cls.accent} />
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8a9080] sm:text-[11px]">
            <span className={hpLow ? "text-[#e07030]" : ""}>HP</span>
            <span
              className={`normal-case tracking-normal tabular-nums ${
                hpLow ? "text-[#f0d060]" : "text-[#e8e6d9]"
              }`}
            >
              {hud.hp}/{hud.maxHp}
            </span>
          </div>
          <HudMeter
            ratio={hpRatio}
            fill={hpLow ? "#a03030" : "#e07030"}
            ember
            low={hpLow}
          />
          {hud.maxMana > 0 && (
            <>
              <div className="mt-1.5 flex items-center justify-between text-[10px] uppercase tracking-wider text-[#8a9080] sm:text-[11px]">
                <span>Mana</span>
                <span className="normal-case tracking-normal tabular-nums text-[#e8e6d9]">
                  {hud.mana}/{hud.maxMana}
                </span>
              </div>
              <HudMeter
                ratio={hud.maxMana > 0 ? hud.mana / hud.maxMana : 0}
                fill="#4a8ab8"
              />
            </>
          )}
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-wider text-[#8a9080]">
          {character.gold}g
          <span className="vale-hud-extra">
            {" "}
            · Tile {hud.x}, {hud.y}
            {character.bankGold > 0 ? ` · Bank ${character.bankGold}g` : ""}
          </span>
        </div>
        <button
          type="button"
          className="pointer-events-auto mt-1 w-full rounded-sm py-1.5 text-left text-[11px] uppercase tracking-wider text-[#8a9080] hover:text-[#c9a227]"
          onClick={onOpenPack}
        >
          <span
            className={
              packHeavy ? "text-[#e07030]" : packHigh ? "text-[#c9a227]" : ""
            }
          >
            Pack {hud.weight}/{hud.maxWeight} wt
          </span>
          <span className="text-[#8a9080]">
            {" "}
            · {hud.slots}/{hud.maxSlots}
          </span>
          {character.premiumBackpack && (
            <span className="text-[#c9a227]"> · Prem</span>
          )}
        </button>
        <div className="vale-hud-extra mt-0.5 truncate text-[10px] text-[#c8c4b0]">
          {equippedLine(character)}
        </div>
        {hud.inSafeZone && (
          <div className="mt-1 text-[10px] uppercase tracking-wider text-[#7ab8c9]">
            {SAFE_ZONE_LABEL} — beasts will not hunt here
          </div>
        )}
        <button
          type="button"
          className="pointer-events-auto mt-0.5 w-full rounded-sm py-1 text-left text-[11px] uppercase tracking-wider text-[#8a9080] hover:text-[#c9a227]"
          aria-pressed={muted}
          onClick={() => {
            armAudio();
            setAudioMuted(!muted);
          }}
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
      </div>
    </div>
  );
}

function QuestHudCard({ title, lines }: { title: string; lines: string[] }) {
  const current = lines.findIndex((line) => line.startsWith("[ ]"));
  return (
    <div className="vale-hud-quest vale-hud-panel vale-chrome pointer-events-auto mt-2 max-w-xs rounded-sm px-2.5 py-1.5 text-[11px] leading-relaxed text-[#c8c4b0] sm:text-xs">
      <div className="font-display text-[12px] tracking-wide text-[#c9a227] sm:text-sm">
        {title}
      </div>
      <ul className="mt-1 space-y-0.5">
        {lines.map((line, i) => {
          const done = line.startsWith("[done]");
          const isNow = i === current;
          return (
            <li
              key={line}
              className={
                done
                  ? "text-[#6a7260]"
                  : isNow
                    ? "text-[#f0d060]"
                    : "text-[#c8c4b0]"
              }
            >
              {isNow ? <span className="text-[#c9a227]">▸ </span> : null}
              {line}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HudMeter({
  ratio,
  fill,
  ember = false,
  low = false,
}: {
  ratio: number;
  fill: string;
  ember?: boolean;
  low?: boolean;
}) {
  const width = `${Math.round(Math.max(0, Math.min(1, ratio)) * 100)}%`;
  return (
    <div
      className={`vale-meter mt-0.5 w-full ${ember ? "vale-meter-ember" : ""} ${
        low ? "vale-meter-low" : ""
      }`}
    >
      <div className="vale-meter-fill h-full rounded-sm" style={{ width, background: fill }}>
        {ember && <div className="vale-meter-ember-sheen" />}
      </div>
    </div>
  );
}
