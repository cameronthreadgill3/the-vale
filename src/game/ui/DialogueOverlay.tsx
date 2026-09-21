export function DialogueOverlay({
  name,
  line,
  hasShop,
  hasBank,
  hasCraft,
  onTalkClose,
  onOpenShop,
  onOpenBank,
  onOpenCraft,
}: {
  name: string;
  line: string;
  hasShop: boolean;
  hasBank?: boolean;
  hasCraft?: boolean;
  onTalkClose: () => void;
  onOpenShop?: () => void;
  onOpenBank?: () => void;
  onOpenCraft?: () => void;
}) {
  return (
    <div className="vale-panel vale-text-screen pointer-events-auto absolute bottom-24 left-1/2 z-30 w-[min(100%-2rem,26rem)] -translate-x-1/2 px-4 py-4 max-md:bottom-8">
      <div className="vale-screen-title">{name}</div>
      <p className="vale-screen-body">{line}</p>
      <div className="vale-screen-actions">
        {hasBank && onOpenBank && (
          <button
            type="button"
            onClick={onOpenBank}
            className="vale-tap vale-ghost-btn vale-ghost-btn-accent px-4 py-2.5 text-sm"
          >
            Open bank
          </button>
        )}
        {hasShop && onOpenShop && (
          <button
            type="button"
            onClick={onOpenShop}
            className="vale-tap vale-ghost-btn vale-ghost-btn-accent px-4 py-2.5 text-sm"
          >
            Shop
          </button>
        )}
        {hasCraft && onOpenCraft && (
          <button
            type="button"
            onClick={onOpenCraft}
            className="vale-tap vale-ghost-btn vale-ghost-btn-accent px-4 py-2.5 text-sm"
          >
            Craft
          </button>
        )}
        <button
          type="button"
          onClick={onTalkClose}
          className="vale-tap vale-ghost-btn px-4 py-2.5 text-sm text-[#a8b09a]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
