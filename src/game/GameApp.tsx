import { useCallback, useEffect, useState } from "react";
import { getClass, type ClassId } from "@/game/classes";
import { getContinent, type ContinentId } from "@/game/continents";
import {
  awardSkillXp,
  clearCharacter,
  createCharacter,
  clearHollowReturn,
  enterHollow,
  exitHollow,
  loadCharacter,
  travelToContinent,
  markFolkMet,
  addInventoryItem,
  removeInventoryItem,
  setGold,
  awardCombatXp,
  setVitals,
  applyDeath,
  type ValeCharacter,
} from "@/game/character";
import {
  SKILLS,
  SKILL_IDS,
  skillSnapshot,
  type SkillId,
} from "@/game/skills";
import { isItemId } from "@/game/items";
import {
  getFolk,
  getShop,
  getDock,
  dockSpawnForContinent,
  folkOnContinent,
} from "@/game/folk";
import { goldLostOnDeath } from "@/game/combat";
import { ClassSelectOverlay } from "@/game/ui/ClassSelectOverlay";
import { GameShell } from "@/game/GameShell";

const TRAIN_SKILL_XP = 18;

function skillRowsFrom(character: ValeCharacter) {
  return SKILL_IDS.map((id) => {
    const def = SKILLS.find((s) => s.id === id)!;
    const snap = skillSnapshot(character.skillXp[id]);
    return { id, name: def.name, hotkey: def.hotkey, ...snap };
  });
}

export function GameApp() {
  const [character, setCharacter] = useState<ValeCharacter | null>(() =>
    loadCharacter(),
  );
  const [skillsOpen, setSkillsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [skillTick, setSkillTick] = useState(0);
  const [arrivedFrom, setArrivedFrom] = useState<ContinentId | null>(null);
  const [shipSpawn, setShipSpawn] = useState<{ x: number; y: number } | null>(
    null,
  );
  /** Bumps GameShell remount on death so deadLock / spawn reset even on same continent. */
  const [worldEpoch, setWorldEpoch] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [dialogue, setDialogue] = useState<{
    name: string;
    line: string;
    hasShop: boolean;
    shopId?: string;
  } | null>(null);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [activeDockId, setActiveDockId] = useState<string | null>(null);

  const pickClass = useCallback((id: ClassId) => {
    setCharacter(createCharacter(id));
    setArrivedFrom(null);
    setShipSpawn(null);
    setWorldEpoch(0);
  }, []);

  const resetPath = useCallback(() => {
    clearCharacter();
    setCharacter(null);
    setSkillsOpen(false);
    setMapOpen(false);
    setArrivedFrom(null);
    setShipSpawn(null);
    setDialogue(null);
    setActiveShopId(null);
    setActiveDockId(null);
    setWorldEpoch(0);
  }, []);

  const trainSkill = useCallback((skill: SkillId) => {
    setCharacter((prev) => {
      if (!prev) return prev;
      const next: ValeCharacter = {
        ...prev,
        skillXp: { ...prev.skillXp },
      };
      awardSkillXp(next, skill, TRAIN_SKILL_XP);
      return { ...next, skillXp: { ...next.skillXp } };
    });
    setSkillTick((t) => t + 1);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200);
  }, []);

  const goContinent = useCallback(
    (target: ContinentId, from: ContinentId) => {
      setCharacter((prev) => (prev ? travelToContinent(prev, target) : prev));
      setArrivedFrom(from);
      setShipSpawn(null);
      setMapOpen(false);
      setDialogue(null);
      setActiveShopId(null);
      setActiveDockId(null);
      const dest = getContinent(target);
      if (folkOnContinent(target).length === 0) {
        showToast(`${dest.name} — ${dest.blurb}`);
      } else {
        showToast(`Gate opens onto ${dest.name}`);
      }
    },
    [showToast],
  );

  const goHollow = useCallback(
    (index: number, returnTile: { x: number; y: number }) => {
      setCharacter((prev) =>
        prev ? enterHollow(prev, index, returnTile) : prev,
      );
      setArrivedFrom(null);
      setShipSpawn(null);
      setDialogue(null);
      setActiveShopId(null);
      setActiveDockId(null);
      showToast(`Descending into Hollow ${index + 1}`);
    },
    [showToast],
  );

  const leaveHollow = useCallback(() => {
    setCharacter((prev) => (prev ? exitHollow(prev) : prev));
    setArrivedFrom(null);
    setShipSpawn(null);
    showToast("Returning to the overworld");
  }, [showToast]);

  const openFolk = useCallback((folkId: string) => {
    const folk = getFolk(folkId);
    if (!folk) return;
    setActiveShopId(null);
    setActiveDockId(null);
    setDialogue({
      name: folk.name,
      line: folk.line,
      hasShop: Boolean(folk.shopId),
      shopId: folk.shopId,
    });
    setCharacter((prev) => (prev ? markFolkMet(prev, folkId) : prev));
  }, []);

  const openShop = useCallback((shopId: string) => {
    setDialogue(null);
    setActiveDockId(null);
    setActiveShopId(shopId);
  }, []);

  const openShip = useCallback((dockId: string) => {
    setDialogue(null);
    setActiveShopId(null);
    setActiveDockId(dockId);
  }, []);

  const buyItem = useCallback(
    (itemId: string, price: number) => {
      if (!isItemId(itemId)) return;
      setCharacter((prev) => {
        if (!prev || prev.gold < price) return prev;
        let next = setGold(prev, prev.gold - price);
        next = addInventoryItem(next, itemId, 1);
        return next;
      });
      showToast(`Bought for ${price}g`);
    },
    [showToast],
  );

  const sellItem = useCallback(
    (itemId: string, price: number) => {
      if (!isItemId(itemId)) return;
      setCharacter((prev) => {
        if (!prev) return prev;
        const removed = removeInventoryItem(prev, itemId, 1);
        if (!removed) return prev;
        return setGold(removed, removed.gold + price);
      });
      showToast(`Sold for ${price}g`);
    },
    [showToast],
  );

  const sailTo = useCallback(
    (dest: ContinentId) => {
      setCharacter((prev) => (prev ? travelToContinent(prev, dest) : prev));
      setArrivedFrom(null);
      setShipSpawn(dockSpawnForContinent(dest));
      setActiveDockId(null);
      setMapOpen(false);
      const c = getContinent(dest);
      if (folkOnContinent(dest).length === 0) {
        showToast(`Sailing to ${c.name} — ${c.blurb}`);
      } else {
        showToast(`Sailing to ${c.name}`);
      }
    },
    [showToast],
  );

  useEffect(() => {
    if (!character) return;
    if (character.hollowIndex === null && character.hollowReturn) {
      setCharacter(clearHollowReturn(character));
    }
  }, [character]);


  const handleCombatReward = useCallback(
    (combatXpGain: number, skill: SkillId, skillXpGain: number, goldGain: number) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        let next = awardCombatXp(prev, combatXpGain);
        next = { ...next, skillXp: { ...next.skillXp } };
        awardSkillXp(next, skill, skillXpGain);
        next = setGold(next, next.gold + goldGain);
        return { ...next, skillXp: { ...next.skillXp } };
      });
      setSkillTick((t) => t + 1);
    },
    [],
  );

  const handleVitals = useCallback((hp: number, mana: number) => {
    setCharacter((prev) => (prev ? setVitals(prev, hp, mana) : prev));
  }, []);

  const handlePlayerDeath = useCallback(() => {
    let loss = 0;
    setCharacter((prev) => {
      if (!prev) return prev;
      loss = goldLostOnDeath(prev.gold);
      return applyDeath(prev);
    });
    setArrivedFrom(null);
    setShipSpawn(null);
    setDialogue(null);
    setActiveShopId(null);
    setActiveDockId(null);
    setMapOpen(false);
    setSkillsOpen(false);
    // Remount canvas even when continent/hollow unchanged (clears deadLock).
    setWorldEpoch((e) => e + 1);
    showToast(
      loss > 0
        ? `You wake at spawn (−${loss}g)...`
        : "You wake at the continent spawn...",
    );
  }, [showToast]);

  if (!character) {
    return <ClassSelectOverlay onPick={pickClass} />;
  }

  const cls = getClass(character.classId);
  const skills = skillRowsFrom(character);
  const continent = getContinent(character.continentId);
  const inHollow = character.hollowIndex !== null;
  const locationKey = `${character.continentId}:${character.hollowIndex ?? "over"}:${shipSpawn ? "ship" : "gate"}:${worldEpoch}`;
  const shop = activeShopId ? (getShop(activeShopId) ?? null) : null;
  const voyageDock = activeDockId ? (getDock(activeDockId) ?? null) : null;

  return (
    <GameShell
      key={locationKey}
      character={character}
      cls={cls}
      skills={skills}
      skillsOpen={skillsOpen}
      mapOpen={mapOpen}
      skillTick={skillTick}
      arrivedFrom={arrivedFrom}
      shipSpawn={shipSpawn}
      toast={toast}
      continentName={continent.name}
      inHollow={inHollow}
      hollowIndex={character.hollowIndex}
      dialogue={dialogue}
      shop={shop}
      voyageDock={voyageDock}
      onToggleSkills={() => setSkillsOpen((o) => !o)}
      onToggleMap={() => setMapOpen((o) => !o)}
      onTrain={trainSkill}
      onResetPath={resetPath}
      onTravel={goContinent}
      onEnterHollow={goHollow}
      onExitHollow={leaveHollow}
      onOpenFolk={openFolk}
      onOpenShop={openShop}
      onOpenShip={openShip}
      onCloseDialogue={() => setDialogue(null)}
      onCloseShop={() => setActiveShopId(null)}
      onCloseVoyage={() => setActiveDockId(null)}
      onBuy={buyItem}
      onSell={sellItem}
      onSail={sailTo}
      onCombatReward={handleCombatReward}
      onVitals={handleVitals}
      onPlayerDeath={handlePlayerDeath}
      onPassivePrimary={(amount) => {
        setCharacter((prev) => {
          if (!prev) return prev;
          const next: ValeCharacter = {
            ...prev,
            skillXp: { ...prev.skillXp },
          };
          awardSkillXp(next, cls.primarySkill, amount);
          return { ...next, skillXp: { ...next.skillXp } };
        });
        setSkillTick((t) => t + 1);
      }}
    />
  );
}
