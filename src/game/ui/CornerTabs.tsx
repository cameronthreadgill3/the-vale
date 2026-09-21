import type { ReactNode } from "react";

/** Skills + Map share one corner dock (desktop bottom-left, mobile top-right). */
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
    <div className="pointer-events-none absolute z-30 flex max-w-[min(100%-1.5rem,22rem)] flex-col gap-1 max-md:right-3 max-md:top-20 max-md:max-h-[calc(100dvh-11.5rem)] md:bottom-6 md:left-6 md:flex-col-reverse">
      <div className="pointer-events-auto flex overflow-hidden rounded border border-[#2a2e24] bg-[#161812]/90 shadow-lg backdrop-blur-md">
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
        <div className="pointer-events-auto vale-panel vale-corner-panel w-[min(100vw-1.5rem,22rem)] overflow-auto rounded border border-[#2a2e24] bg-[#161812]/95 shadow-xl backdrop-blur-md max-md:max-h-[calc(100dvh-13rem)] md:max-h-[min(58vh,28rem)]">
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
      className={`vale-tap-sm min-w-[5.5rem] flex-1 px-3 py-2 text-xs tracking-wide ${
        active
          ? "bg-[#1c1f16] text-[#c9a227]"
          : "text-[#e8e6d9] hover:bg-[#1c1f16]/70"
      }`}
    >
      <span className="font-display">{label}</span>
      <span className="ml-1.5 text-[9px] uppercase tracking-wider text-[#6a7260]">
        {hint}
      </span>
    </button>
  );
}
