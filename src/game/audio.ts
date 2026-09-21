/**
 * Original Vale audio cues via the Web Audio API (oscillators + noise).
 * No CipSoft / Tibia packs and no third-party samples.
 */

const MUTE_KEY = "vale-audio-muted";
const MASTER = 0.55;

const FOOTSTEP_GAP_MS = 310;
const HIT_GAP_MS = 90;
const TOAST_GAP_MS = 240;

type HitKind = "player" | "enemy";

let ctx: AudioContext | null = null;
let armed = false;
let lastFootstep = 0;
let lastHit = 0;
let lastToast = 0;

function loadMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function storeMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* private mode */
  }
}

let muted = loadMuted();
const muteListeners = new Set<(muted: boolean) => void>();

export function isAudioMuted(): boolean {
  return muted;
}

export function setAudioMuted(next: boolean): void {
  muted = next;
  storeMuted(next);
  for (const cb of muteListeners) cb(muted);
}

export function subscribeAudioMuted(cb: (muted: boolean) => void): () => void {
  muteListeners.add(cb);
  return () => {
    muteListeners.delete(cb);
  };
}

function AudioCtxCtor(): (typeof AudioContext) | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || null;
}

function getCtx(): AudioContext | null {
  const Ctor = AudioCtxCtor();
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

function resumeCtx(): void {
  const audio = getCtx();
  if (audio && audio.state === "suspended") {
    void audio.resume();
  }
}

/** Unlock AudioContext after a user gesture (browser autoplay policy). */
export function armAudio(): void {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const unlock = () => {
    resumeCtx();
  };
  window.addEventListener("pointerdown", unlock, { capture: true });
  window.addEventListener("keydown", unlock, { capture: true });
}

function gated(): AudioContext | null {
  if (muted) return null;
  const audio = getCtx();
  if (!audio) return null;
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function noiseBuffer(audio: AudioContext, seconds: number): AudioBuffer {
  const n = Math.max(1, Math.floor(audio.sampleRate * seconds));
  const buf = audio.createBuffer(1, n, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

function envGain(
  audio: AudioContext,
  peak: number,
  attack: number,
  release: number,
  at = audio.currentTime,
): GainNode {
  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * MASTER), at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
  return g;
}

/** Soft dirt/stone step — filtered noise, throttled so walk does not spam. */
export function playFootstep(): void {
  const t = nowMs();
  if (t - lastFootstep < FOOTSTEP_GAP_MS) return;
  const audio = gated();
  if (!audio) return;
  lastFootstep = t;

  const dur = 0.05;
  const src = audio.createBufferSource();
  src.buffer = noiseBuffer(audio, dur);
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 180 + Math.random() * 90;
  filter.Q.value = 0.9;
  const g = envGain(audio, 0.11, 0.004, dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(audio.destination);
  src.start();
  src.stop(audio.currentTime + dur + 0.02);
}

/** Subtle hit tick. Player takes a duller thump; foe hits stay lighter. */
export function playHit(kind: HitKind): void {
  const t = nowMs();
  if (t - lastHit < HIT_GAP_MS) return;
  const audio = gated();
  if (!audio) return;
  lastHit = t;

  const at = audio.currentTime;
  const player = kind === "player";
  const osc = audio.createOscillator();
  osc.type = player ? "sine" : "triangle";
  const freq = player ? 92 + Math.random() * 18 : 210 + Math.random() * 40;
  osc.frequency.setValueAtTime(freq, at);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.55, at + 0.07);

  const tone = envGain(audio, player ? 0.16 : 0.09, 0.004, player ? 0.1 : 0.06, at);
  osc.connect(tone);
  tone.connect(audio.destination);
  osc.start(at);
  osc.stop(at + 0.14);

  const src = audio.createBufferSource();
  src.buffer = noiseBuffer(audio, 0.03);
  const clickFilter = audio.createBiquadFilter();
  clickFilter.type = "highpass";
  clickFilter.frequency.value = player ? 240 : 700;
  const click = envGain(audio, player ? 0.07 : 0.04, 0.002, 0.03, at);
  src.connect(clickFilter);
  clickFilter.connect(click);
  click.connect(audio.destination);
  src.start(at);
  src.stop(at + 0.04);
}

/** Short two-note ding for overlay toasts and quest progress pings. */
export function playToast(): void {
  const t = nowMs();
  if (t - lastToast < TOAST_GAP_MS) return;
  const audio = gated();
  if (!audio) return;
  lastToast = t;

  const at = audio.currentTime;
  const notes = [
    { f: 784, start: 0, dur: 0.09 },
    { f: 1175, start: 0.07, dur: 0.12 },
  ];
  for (const n of notes) {
    const osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(n.f, at + n.start);
    const g = envGain(audio, 0.12, 0.006, n.dur, at + n.start);
    osc.connect(g);
    g.connect(audio.destination);
    osc.start(at + n.start);
    osc.stop(at + n.start + n.dur + 0.04);
  }
}

/** Overlay toast in GameShell: gold text, centered at ~1/3 viewport height. */
export function isOverlayToast(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const c = el.className;
  return (
    typeof c === "string" &&
    c.includes("pointer-events-none") &&
    c.includes("absolute") &&
    c.includes("left-1/2") &&
    c.includes("top-1/3") &&
    c.includes("z-20")
  );
}

/** Play toast ding when the floating GameShell toast mounts (or is already present). */
export function watchOverlayToasts(root: Element, onToast: () => void = playToast): () => void {
  const seen = new WeakSet<Element>();
  const consider = (node: Node) => {
    if (!(node instanceof Element) || seen.has(node)) return;
    if (!isOverlayToast(node)) return;
    seen.add(node);
    onToast();
  };
  for (const child of Array.from(root.children)) consider(child);
  const obs = new MutationObserver((records) => {
    for (const rec of records) {
      rec.addedNodes.forEach(consider);
    }
  });
  obs.observe(root, { childList: true });
  return () => obs.disconnect();
}

armAudio();
