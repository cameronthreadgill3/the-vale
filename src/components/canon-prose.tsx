import { cn } from "@/lib/utils";

function isSystem(line: string) {
  const t = line.trim();
  if (t.length < 3 || t.length > 90) return false;
  if (/[.!?]{2,}/.test(t)) return false;
  const letters = t.replace(/[^A-Za-z]/g, "");
  if (letters.length < 4) return false;
  const upper = letters.replace(/[a-z]/g, "").length;
  return upper / letters.length > 0.72;
}

function isLeadTitle(block: string) {
  const t = block.trim();
  if (/^chapter\s+\d+/i.test(t)) return true;
  if (t.length < 48 && t === t.toUpperCase() && !t.includes(".")) return true;
  return false;
}

export function CanonProse({ text, className }: { text: string; className?: string }) {
  const blocks = text
    .replace(/\\!/g, "!")
    .replace(/^#{1,6}\s+.*$/gm, "")
    .trim()
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  let start = 0;
  while (start < 3 && blocks[start] && isLeadTitle(blocks[start] ?? "")) start += 1;

  return (
    <div className={cn("max-w-[65ch] text-base leading-relaxed text-fg", className)}>
      {blocks.slice(start).map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) return null;
        if (lines.every(isSystem)) {
          return (
            <div
              key={i}
              className="my-6 border-y border-border py-4 font-mono text-xs leading-6 tracking-wide text-fg-muted"
            >
              {lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          );
        }
        return (
          <p key={i} className="mb-5 whitespace-pre-wrap">
            {lines.join(" ")}
          </p>
        );
      })}
    </div>
  );
}
