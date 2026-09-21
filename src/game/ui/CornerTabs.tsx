import type { ReactNode } from "react";

/** Skills + Map share one corner dock (desktop bottom-left, mobile below HP). */
export function CornerTabs({
  skillsOpen,
  mapOpen,
  onToggleSkills,
  onToggleMap,
  skillsPanel,
  mapPanel,
}: {
  skillsOpen: boolean;
  mapOpen: boolean;
  onToggleSkills: () => void;
  onToggleMap: () => void;
  skillsPanel: ReactNode;
  mapPanel: ReactNode;
}) {
  const open = skillsOpen || mapOpen;
  return (
    <div className="vale-corner-dock pointer-events-none z-30">
      <div
        className={`vale-tab-bar pointer-events-auto flex${
          skillsOpen ? " vale-tab-bar-skills" : mapOpen ? " vale-tab-bar-map" : ""
        }`}
      >
        <TabBtn
          label="Skills"
          hint="K"
          active={skillsOpen}
          skills
          onClick={onToggleSkills}
        />
        <TabBtn
          label="Map"
          hint="M"
          active={mapOpen}
          lip
          onClick={onToggleMap}
        />
      </div>
      {open && (
        <div
          className={`vale-text-screen vale-panel vale-corner-panel pointer-events-auto w-[min(100vw-1.5rem,22rem)] overflow-auto${
            skillsOpen ? " vale-skills-sheet" : mapOpen ? " vale-map-sheet" : ""
          }`}
        >
          {skillsOpen ? skillsPanel : mapPanel}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  label,
  hint,
  active,
  lip = false,
  skills = false,
  onClick,
}: {
  label: string;
  hint: string;
  active: boolean;
  lip?: boolean;
  skills?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`vale-tab vale-tap-sm min-w-[5.5rem] flex-1 px-3.5 py-2.5${
        lip ? " vale-tab-map" : ""
      }${skills ? " vale-tab-skills" : ""}${active ? " vale-tab-active" : ""}`}
    >
      <span>{label}</span>
      <span className="vale-tab-hint">{hint}</span>
    </button>
  );
}
