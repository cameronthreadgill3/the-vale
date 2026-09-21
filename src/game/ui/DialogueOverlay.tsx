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
    <div className="vale-panel vale-text-screen pointer-events-auto absolute bottom-24 left-1/2 z-30 w-[min(100%-2rem,26rem)] -translate-x-1/2 px-4 py-3.5 max-md:bottom-8">
      <div className="font-display text-sm tracking-wide text-[#c9a227]">
        {name}
      </div>
      <p className="mt-2 text-sm leading-[1.65] text-[#e8e6d9]">{line}</p>
      <div className="mt-3.5 flex flex-wrap justify-end gap-2">
        {hasBank && onOpenBank && (
          <button
            type="button"
            onClick={onOpenBank}
            className="vale-tap vale-ghost-btn px-4 py-2.5 text-sm text-[#c9a227]"
          >
            Open bank
          </button>
        )}
        {hasShop && onOpenShop && (
          <button
            type="button"
            onClick={onOpenShop}
            className="vale-tap vale-ghost-btn px-4 py-2.5 text-sm"
          >
            Shop
          </button>
        )}
        {hasCraft && onOpenCraft && (
          <button
            type="button"
            onClick={onOpenCraft}
            className="vale-tap vale-ghost-btn px-4 py-2.5 text-sm text-[#c9a227]"
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
