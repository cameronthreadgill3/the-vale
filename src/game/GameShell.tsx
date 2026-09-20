import { type ValeClass } from "@/game/classes";
import { type ContinentId } from "@/game/continents";
import type { ValeCharacter } from "@/game/character";
import type { SkillId } from "@/game/skills";
import type { ShopDef, ShipDock } from "@/game/folk";
import { ContinentMapPanel } from "@/game/ui/ContinentMapPanel";
import { SkillsPanel, type SkillRow } from "@/game/ui/SkillsPanel";
import { DialogueOverlay } from "@/game/ui/DialogueOverlay";
import { ShopPanel } from "@/game/ui/ShopPanel";
import { VoyagePanel } from "@/game/ui/VoyagePanel";
import { useGameCanvas } from "@/game/useGameCanvas";

export function GameShell({
  character,
  cls,
  skills,
  skillsOpen,
  mapOpen,
  skillTick,
  arrivedFrom,
  shipSpawn,
  toast,
  continentName,
  inHollow,
  hollowIndex,
  dialogue,
  shop,
  voyageDock,
  onToggleSkills,
  onToggleMap,
  onTrain,
  onResetPath,
  onTravel,
  onEnterHollow,
  onExitHollow,
  onPassivePrimary,
  onOpenFolk,
  onOpenShop,
  onOpenShip,
  onCloseDialogue,
  onCloseShop,
  onCloseVoyage,
  onBuy,
  onSell,
  onSail,
  onCombatReward,
  onVitals,
  onPlayerDeath,
}: {
  character: ValeCharacter;
  cls: ValeClass;
  skills: SkillRow[];
  skillsOpen: boolean;
  mapOpen: boolean;
  skillTick: number;
  arrivedFrom: ContinentId | null;
  shipSpawn: { x: number; y: number } | null;
  toast: string | null;
  continentName: string;
  inHollow: boolean;
  hollowIndex: number | null;
  dialogue: { name: string; line: string; hasShop: boolean; shopId?: string } | null;
  shop: ShopDef | null;
  voyageDock: ShipDock | null;
  onToggleSkills: () => void;
  onToggleMap: () => void;
  onTrain: (skill: SkillId) => void;
  onResetPath: () => void;
  onTravel: (target: ContinentId, from: ContinentId) => void;
  onEnterHollow: (index: number, returnTile: { x: number; y: number }) => void;
  onExitHollow: () => void;
  onPassivePrimary: (amount: number) => void;
  onOpenFolk: (folkId: string) => void;
  onOpenShop: (shopId: string) => void;
  onOpenShip: (dockId: string) => void;
  onCloseDialogue: () => void;
  onCloseShop: () => void;
  onCloseVoyage: () => void;
  onBuy: (itemId: string, price: number) => void;
  onSell: (itemId: string, price: number) => void;
  onSail: (dest: ContinentId) => void;
  onCombatReward: (
    combatXp: number,
    skill: SkillId,
    skillXp: number,
    gold: number,
  ) => void;
  onVitals: (hp: number, mana: number) => void;
  onPlayerDeath: () => void;
}) {
  const overlayOpen = Boolean(dialogue || shop || voyageDock);
  const { canvasRef, hud, prompt } = useGameCanvas({
    character,
    cls,
    arrivedFrom,
    shipSpawn,
    overlayOpen,
    onTrain,
    onToggleSkills,
    onToggleMap,
    onTravel,
    onEnterHollow,
    onExitHollow,
    onPassivePrimary,
    onOpenFolk,
    onOpenShop,
    onOpenShip,
    onCombatReward,
    onVitals,
    onPlayerDeath,
  });

  void skillTick;

  const locationLabel = inHollow
    ? `${continentName} | Hollow ${(hollowIndex ?? 0) + 1}`
    : continentName;

  

  return (
    <div className="relative h-full w-full select-none">
      <canvas ref={canvasRef} className="block h-full w-full" tabIndex={0} />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-2 p-4 sm:p-5">
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
        <div className="flex flex-wrap gap-2">
          <div className="w-fit rounded border border-[#2a2e24] bg-[#161812]/80 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm">
            Move <span className="text-[#e8e6d9]">WASD</span> /{" "}
            <span className="text-[#e8e6d9]">Arrows</span>
            {" | "}
            <span className="text-[#e8e6d9]">Space</span>/<span className="text-[#e8e6d9]">Click</span> attack
            {" | "}
            <span className="text-[#e8e6d9]">E</span> talk/shop/board
            {" | "}
            <span className="text-[#e8e6d9]">M</span> map
            {" | "}
            <span className="text-[#e8e6d9]">K</span> skills
            {" | "}
            <span className="text-[#e8e6d9]">1-7</span> train
          </div>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#e8e6d9] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onToggleMap}
          >
            {mapOpen ? "Hide map" : "Map (M)"}
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#e8e6d9] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onToggleSkills}
          >
            {skillsOpen ? "Hide skills" : "Skills (K)"}
          </button>
          <button
            type="button"
            className="pointer-events-auto rounded border border-[#2a2e24] bg-[#161812]/90 px-3 py-1.5 text-xs text-[#a8b09a] backdrop-blur-sm hover:border-[#c9a227]/50"
            onClick={onResetPath}
          >
            Change path
          </button>
        </div>
      </div>

      {prompt && !overlayOpen && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded border border-[#c9a227]/50 bg-[#161812]/95 px-4 py-2 text-center text-sm text-[#e8e6d9] shadow-lg backdrop-blur-md">
          {prompt.kind === "gate" && (
            <>
              Gate to <span className="text-[#c9a227]">{prompt.name}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Walk in or press <span className="text-[#e8e6d9]">E</span>
              </div>
            </>
          )}
          {prompt.kind === "hollow" && (
            <>
              Hollow entrance {(prompt.index + 1).toString()}
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Descend with <span className="text-[#e8e6d9]">E</span> or walk in
              </div>
            </>
          )}
          {prompt.kind === "exit" && (
            <>
              Hollow exit
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Return with <span className="text-[#e8e6d9]">E</span> or walk onto the tile
              </div>
            </>
          )}
          {prompt.kind === "folk" && (
            <>
              <span className="text-[#c9a227]">{prompt.name}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Press <span className="text-[#e8e6d9]">E</span> to{" "}
                {prompt.hasShop ? "talk / shop" : "talk"}
              </div>
            </>
          )}
          {prompt.kind === "shop" && (
            <>
              <span className="text-[#c9a227]">{prompt.name}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Press <span className="text-[#e8e6d9]">E</span> to shop
              </div>
            </>
          )}
          {prompt.kind === "ship" && (
            <>
              Ship at <span className="text-[#7ab8c9]">{prompt.name}</span>
              <div className="mt-0.5 text-xs text-[#a8b09a]">
                Press <span className="text-[#e8e6d9]">E</span> to board
              </div>
            </>
          )}
        </div>
      )}

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-1/3 z-20 -translate-x-1/2 rounded border border-[#2a2e24] bg-[#0c0d0b]/90 px-4 py-2 font-display text-sm tracking-wide text-[#c9a227] shadow-xl">
          {toast}
        </div>
      )}

      {mapOpen && (
        <ContinentMapPanel character={character} onClose={onToggleMap} />
      )}

      {skillsOpen && (
        <SkillsPanel
          cls={cls}
          skills={skills}
          onTrain={onTrain}
          onClose={onToggleSkills}
        />
      )}

      {dialogue && (
        <DialogueOverlay
          name={dialogue.name}
          line={dialogue.line}
          hasShop={dialogue.hasShop}
          onTalkClose={onCloseDialogue}
          onOpenShop={
            dialogue.shopId
              ? () => onOpenShop(dialogue.shopId!)
              : undefined
          }
        />
      )}

      {shop && (
        <ShopPanel
          shop={shop}
          character={character}
          onBuy={onBuy}
          onSell={onSell}
          onClose={onCloseShop}
        />
      )}

      {voyageDock && (
        <VoyagePanel
          dock={voyageDock}
          currentContinent={character.continentId}
          discovered={character.discoveredContinents}
          onSail={onSail}
          onClose={onCloseVoyage}
        />
      )}
    </div>
  );
}
