export function DialogueOverlay({
  name,
  line,
  hasShop,
  onTalkClose,
  onOpenShop,
}: {
  name: string;
  line: string;
  hasShop: boolean;
  onTalkClose: () => void;
  onOpenShop?: () => void;
}) {
  return (
    <div className="vale-panel pointer-events-auto absolute bottom-24 left-1/2 z-30 w-[min(100%-2rem,26rem)] -translate-x-1/2 rounded border border-[#c9a227]/40 bg-[#161812]/96 p-4 shadow-xl backdrop-blur-md max-md:bottom-8">
      <div className="font-display text-sm tracking-wide text-[#c9a227]">
        {name}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#e8e6d9]">{line}</p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {hasShop && onOpenShop && (
          <button
            type="button"
            onClick={onOpenShop}
            className="vale-tap rounded border border-[#2a2e24] bg-[#1c1f16] px-4 py-2.5 text-sm text-[#e8e6d9] hover:border-[#c9a227]/50"
          >
            Shop
          </button>
        )}
        <button
          type="button"
          onClick={onTalkClose}
          className="vale-tap rounded border border-[#2a2e24] bg-[#1c1f16] px-4 py-2.5 text-sm text-[#a8b09a] hover:text-[#e8e6d9]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
