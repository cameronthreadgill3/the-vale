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
      <div className="vale-tab-bar pointer-events-auto flex">
        <TabBtn
          label="Skills"
          hint="K"
          active={skillsOpen}
          onClick={onToggleSkills}
        />
        <TabBtn
          label="Map"
          hint="M"
          active={mapOpen}
          onClick={onToggleMap}
        />
      </div>
      {open && (
        <div className="vale-text-screen vale-panel vale-corner-panel pointer-events-auto w-[min(100vw-1.5rem,22rem)] overflow-auto">
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
  onClick,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`vale-tab vale-tap-sm min-w-[5.5rem] flex-1 px-3.5 py-2.5 ${
        active ? "vale-tab-active" : ""
      }`}
    >
      <span>{label}</span>
      <span className="vale-tab-hint">{hint}</span>
    </button>
  );
}
