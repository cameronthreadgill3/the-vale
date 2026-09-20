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
  type ValeCharacter,
} from "@/game/character";
import {
  SKILLS,
  SKILL_IDS,
  skillSnapshot,
  type SkillId,
} from "@/game/skills";
import { ClassSelectOverlay } from "@/game/ui/ClassSelectOverlay";
import { GameShell } from "@/game/GameShell";

/** Explicit train click / hotkey awards this base amount (class mult applies). */
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
  /** Continent we arrived from - used to spawn near the linking gate. */
  const [arrivedFrom, setArrivedFrom] = useState<ContinentId | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const pickClass = useCallback((id: ClassId) => {
    setCharacter(createCharacter(id));
    setArrivedFrom(null);
  }, []);

  const resetPath = useCallback(() => {
    clearCharacter();
    setCharacter(null);
    setSkillsOpen(false);
    setMapOpen(false);
    setArrivedFrom(null);
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
      setCharacter((prev) => {
        if (!prev) return prev;
        return travelToContinent(prev, target);
      });
      setArrivedFrom(from);
      setMapOpen(false);
      showToast(`Gate opens onto ${getContinent(target).name}`);
    },
    [showToast],
  );

  const goHollow = useCallback(
    (index: number, returnTile: { x: number; y: number }) => {
      setCharacter((prev) => {
        if (!prev) return prev;
        return enterHollow(prev, index, returnTile);
      });
      setArrivedFrom(null);
      showToast(`Descending into Hollow ${index + 1}`);
    },
    [showToast],
  );

  const leaveHollow = useCallback(() => {
    setCharacter((prev) => {
      if (!prev) return prev;
      return exitHollow(prev);
    });
    setArrivedFrom(null);
    showToast("Returning to the overworld");
  }, [showToast]);

  // One-shot: after exiting a hollow, drop the return tile from save
  useEffect(() => {
    if (!character) return;
    if (character.hollowIndex === null && character.hollowReturn) {
      setCharacter(clearHollowReturn(character));
    }
  }, [character]);

  if (!character) {
    return <ClassSelectOverlay onPick={pickClass} />;
  }

  const cls = getClass(character.classId);
  const skills = skillRowsFrom(character);
  const continent = getContinent(character.continentId);
  const inHollow = character.hollowIndex !== null;
  const locationKey = `${character.continentId}:${character.hollowIndex ?? "over"}`;

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
      toast={toast}
      continentName={continent.name}
      inHollow={inHollow}
      hollowIndex={character.hollowIndex}
      onToggleSkills={() => setSkillsOpen((o) => !o)}
      onToggleMap={() => setMapOpen((o) => !o)}
      onTrain={trainSkill}
      onResetPath={resetPath}
      onTravel={goContinent}
      onEnterHollow={goHollow}
      onExitHollow={leaveHollow}
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
