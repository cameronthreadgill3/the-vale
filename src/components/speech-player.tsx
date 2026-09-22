import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpeechPlayer({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const [playing, setPlaying] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stop = () => {
    window.speechSynthesis?.cancel();
    utterRef.current = null;
    setPlaying(false);
  };

  const toggle = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (playing) {
      window.speechSynthesis.pause();
      setPlaying(false);
      return;
    }
    if (window.speechSynthesis.paused && utterRef.current) {
      window.speechSynthesis.resume();
      setPlaying(true);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.pitch = 0.95;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setPlaying(true);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" onClick={toggle}>
        {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        {playing ? "Pause" : `Speak ${label}`}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={stop}>
        <Square className="size-3.5" />
        Stop
      </Button>
    </div>
  );
}
