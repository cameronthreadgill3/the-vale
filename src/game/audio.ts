/**
 * Original Vale audio via the Web Audio API (oscillators + filtered noise).
 * No CipSoft / Tibia packs and no third-party samples.
 *
 * Cues: footsteps, hits, overlay toasts.
 * Beds: quiet plaza (overworld) and hollow loops, crossfaded on map.kind.
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
  duckAmbient(next);
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

function loopSeam(data: Float32Array, fade = 512): void {
  const n = Math.min(fade, Math.floor(data.length / 8));
  for (let i = 0; i < n; i++) {
    const w = i / n;
    const end = data.length - n + i;
    data[end] = data[end]! * (1 - w) + data[i]! * w;
  }
}

function brownNoiseBuffer(audio: AudioContext, seconds: number): AudioBuffer {
  const n = Math.max(1, Math.floor(audio.sampleRate * seconds));
  const buf = audio.createBuffer(1, n, audio.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = Math.max(-1, Math.min(1, last * 3.5));
  }
  loopSeam(data);
  return buf;
}

/** Sparse crackle bursts — torch/ember air, not a fire loop. */
function emberBuffer(audio: AudioContext, seconds: number): AudioBuffer {
  const n = Math.max(1, Math.floor(audio.sampleRate * seconds));
  const buf = audio.createBuffer(1, n, audio.sampleRate);
  const data = buf.getChannelData(0);
  let i = 0;
  while (i < n) {
    if (Math.random() < 0.00055) {
      const burst = 120 + Math.floor(Math.random() * 520);
      let v = 0;
      for (let k = 0; k < burst && i < n; k++, i++) {
        v = v * 0.96 + (Math.random() * 2 - 1) * 0.42;
        data[i] = v * (1 - k / burst);
      }
    } else {
      data[i++] = 0;
    }
  }
  loopSeam(data, 256);
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

export type AmbientBed = "plaza" | "hollow";

const FADE_SEC = 1.4;
const DUCK_SEC = 0.22;
const AMBIENT_SCALE = 0.45;

type SourceNode = OscillatorNode | AudioBufferSourceNode;

interface BedVoice {
  out: GainNode;
  sources: SourceNode[];
  nodes: AudioNode[];
  tearTimer: ReturnType<typeof setTimeout> | null;
}

let ambientBus: GainNode | null = null;
let wantedBed: AmbientBed | null = null;
let liveBed: AmbientBed | null = null;
const beds: Partial<Record<AmbientBed, BedVoice>> = {};
let brownLoop: AudioBuffer | null = null;
let whiteLoop: AudioBuffer | null = null;
let emberLoop: AudioBuffer | null = null;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;

function ambientPeak(peak: number): number {
  return Math.max(0.0002, peak * MASTER * AMBIENT_SCALE);
}

function ensureAmbientBus(audio: AudioContext): GainNode {
  if (!ambientBus) {
    ambientBus = audio.createGain();
    ambientBus.gain.value = muted ? 0.0001 : 1;
    ambientBus.connect(audio.destination);
  }
  return ambientBus;
}

function loopBuffers(audio: AudioContext): void {
  if (!brownLoop) brownLoop = brownNoiseBuffer(audio, 3.2);
  if (!whiteLoop) {
    const buf = noiseBuffer(audio, 2.6);
    loopSeam(buf.getChannelData(0));
    whiteLoop = buf;
  }
  if (!emberLoop) emberLoop = emberBuffer(audio, 4.4);
}

function startLfo(
  audio: AudioContext,
  param: AudioParam,
  rate: number,
  depth: number,
  offset: number,
  voice: BedVoice,
): void {
  const osc = audio.createOscillator();
  osc.type = "sine";
  osc.frequency.value = rate;
  const g = audio.createGain();
  g.gain.value = depth;
  param.value = offset;
  osc.connect(g);
  g.connect(param);
  osc.start();
  voice.sources.push(osc);
  voice.nodes.push(g);
}

function loopNoise(audio: AudioContext, buf: AudioBuffer, voice: BedVoice): AudioBufferSourceNode {
  const src = audio.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  src.start();
  voice.sources.push(src);
  return src;
}

function tone(
  audio: AudioContext,
  type: OscillatorType,
  freq: number,
  voice: BedVoice,
): OscillatorNode {
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.start();
  voice.sources.push(osc);
  return osc;
}

function filter(
  audio: AudioContext,
  type: BiquadFilterType,
  freq: number,
  q: number,
  voice: BedVoice,
): BiquadFilterNode {
  const f = audio.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  voice.nodes.push(f);
  return f;
}

function mixGain(audio: AudioContext, peak: number, voice: BedVoice): GainNode {
  const g = audio.createGain();
  g.gain.value = ambientPeak(peak);
  voice.nodes.push(g);
  return g;
}

function chain(nodes: AudioNode[]): void {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i]!.connect(nodes[i + 1]!);
}

/** Warm grass/leaf bed — quiet plaza air. */
function buildPlaza(audio: AudioContext, dest: GainNode): BedVoice {
  const out = audio.createGain();
  out.gain.value = 0.0001;
  out.connect(dest);
  const voice: BedVoice = { out, sources: [], nodes: [out], tearTimer: null };
  loopBuffers(audio);

  const air = loopNoise(audio, brownLoop!, voice);
  const airLp = filter(audio, "lowpass", 420, 0.55, voice);
  const airG = mixGain(audio, 0.07, voice);
  startLfo(audio, airG.gain, 0.06, ambientPeak(0.018), ambientPeak(0.07), voice);
  chain([air, airLp, airG, out]);

  const leaf = loopNoise(audio, whiteLoop!, voice);
  const leafBp = filter(audio, "bandpass", 780, 0.85, voice);
  const leafHp = filter(audio, "highpass", 280, 0.5, voice);
  const leafG = mixGain(audio, 0.038, voice);
  startLfo(audio, leafBp.frequency, 0.09, 90, 780, voice);
  startLfo(audio, leafG.gain, 0.13, ambientPeak(0.012), ambientPeak(0.038), voice);
  chain([leaf, leafHp, leafBp, leafG, out]);

  const padLp = filter(audio, "lowpass", 640, 0.7, voice);
  const padG = mixGain(audio, 0.034, voice);
  startLfo(audio, padLp.frequency, 0.04, 80, 640, voice);
  chain([padLp, padG, out]);
  tone(audio, "sine", 110, voice).connect(padLp);
  const fifth = tone(audio, "triangle", 164.8, voice);
  fifth.detune.value = 7;
  fifth.connect(padLp);

  return voice;
}

/** Cooler hollow air — dark drone + sparse ember. */
function buildHollow(audio: AudioContext, dest: GainNode): BedVoice {
  const out = audio.createGain();
  out.gain.value = 0.0001;
  out.connect(dest);
  const voice: BedVoice = { out, sources: [], nodes: [out], tearTimer: null };
  loopBuffers(audio);

  const droneLp = filter(audio, "lowpass", 210, 0.8, voice);
  const droneG = mixGain(audio, 0.055, voice);
  startLfo(audio, droneG.gain, 0.035, ambientPeak(0.012), ambientPeak(0.055), voice);
  chain([droneLp, droneG, out]);
  tone(audio, "sine", 58, voice).connect(droneLp);
  tone(audio, "sine", 87, voice).connect(droneLp);

  const air = loopNoise(audio, brownLoop!, voice);
  const airLp = filter(audio, "lowpass", 190, 0.6, voice);
  const airHp = filter(audio, "highpass", 40, 0.4, voice);
  const airG = mixGain(audio, 0.05, voice);
  chain([air, airHp, airLp, airG, out]);

  const ember = loopNoise(audio, emberLoop!, voice);
  const emberBp = filter(audio, "bandpass", 1680, 3.2, voice);
  const emberHp = filter(audio, "highpass", 700, 0.5, voice);
  const emberG = mixGain(audio, 0.028, voice);
  startLfo(audio, emberG.gain, 0.22, ambientPeak(0.008), ambientPeak(0.028), voice);
  chain([ember, emberHp, emberBp, emberG, out]);

  const chill = tone(audio, "triangle", 146.8, voice);
  const chillLp = filter(audio, "lowpass", 320, 0.7, voice);
  const chillG = mixGain(audio, 0.016, voice);
  chain([chill, chillLp, chillG, out]);

  return voice;
}

function stopVoice(voice: BedVoice): void {
  if (voice.tearTimer) {
    clearTimeout(voice.tearTimer);
    voice.tearTimer = null;
  }
  for (const s of voice.sources) {
    try {
      s.stop();
    } catch {
      /* already stopped */
    }
    try {
      s.disconnect();
    } catch {
      /* already disconnected */
    }
  }
  for (const n of voice.nodes) {
    try {
      n.disconnect();
    } catch {
      /* already disconnected */
    }
  }
  voice.sources.length = 0;
  voice.nodes.length = 0;
}

function fadeGain(g: GainNode, audio: AudioContext, to: number, seconds: number): void {
  const now = audio.currentTime;
  const current = Math.max(0.0001, g.gain.value);
  g.gain.cancelScheduledValues(now);
  g.gain.setValueAtTime(current, now);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, to), now + seconds);
}

function scheduleTeardown(kind: AmbientBed, delaySec: number): void {
  const voice = beds[kind];
  if (!voice) return;
  if (voice.tearTimer) clearTimeout(voice.tearTimer);
  voice.tearTimer = setTimeout(() => {
    if (wantedBed === kind && !muted) return;
    stopVoice(voice);
    if (beds[kind] === voice) delete beds[kind];
    if (liveBed === kind) liveBed = wantedBed && beds[wantedBed] ? wantedBed : null;
  }, Math.ceil((delaySec + 0.05) * 1000));
}

function ensureBed(kind: AmbientBed, audio: AudioContext): BedVoice {
  const existing = beds[kind];
  if (existing && existing.sources.length > 0) return existing;
  if (existing) stopVoice(existing);
  const bus = ensureAmbientBus(audio);
  const voice = kind === "hollow" ? buildHollow(audio, bus) : buildPlaza(audio, bus);
  beds[kind] = voice;
  return voice;
}

function crossfadeTo(kind: AmbientBed, audio: AudioContext): void {
  const incoming = ensureBed(kind, audio);
  fadeGain(incoming.out, audio, kind === "hollow" ? 1 : 0.82, liveBed ? FADE_SEC : 0.9);
  if (incoming.tearTimer) {
    clearTimeout(incoming.tearTimer);
    incoming.tearTimer = null;
  }
  for (const other of ["plaza", "hollow"] as const) {
    if (other === kind) continue;
    const outgoing = beds[other];
    if (!outgoing || outgoing.sources.length === 0) continue;
    fadeGain(outgoing.out, audio, 0.0001, FADE_SEC);
    scheduleTeardown(other, FADE_SEC);
  }
  liveBed = kind;
}

function duckAmbient(nextMuted: boolean): void {
  const audio = ctx;
  if (!audio || !ambientBus) {
    if (nextMuted) {
      for (const kind of ["plaza", "hollow"] as const) {
        const v = beds[kind];
        if (v) {
          stopVoice(v);
          delete beds[kind];
        }
      }
      liveBed = null;
    }
    return;
  }
  fadeGain(ambientBus, audio, nextMuted ? 0.0001 : 1, DUCK_SEC);
  if (nextMuted) {
    for (const kind of ["plaza", "hollow"] as const) {
      if (beds[kind]) scheduleTeardown(kind, DUCK_SEC);
    }
  } else if (wantedBed) {
    crossfadeTo(wantedBed, audio);
  }
}

/**
 * Keep the plaza/hollow bed in sync with the loaded map.
 * No-ops when muted or when the bed is already live; crossfades on hollow enter/exit.
 */
export function syncAmbient(kind: "overworld" | "hollow"): void {
  const next: AmbientBed = kind === "hollow" ? "hollow" : "plaza";
  wantedBed = next;
  holdAmbient();
  if (muted) return;
  const audio = gated();
  if (!audio) return;
  if (audio.state !== "running") return;
  if (liveBed === next && beds[next] && beds[next]!.sources.length > 0) return;
  crossfadeTo(next, audio);
}

/** Cancel a pending shell-unmount stop (hollow remounts GameShell). */
export function holdAmbient(): void {
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }
}

/** Fade and stop beds shortly after the play shell unmounts (class select). */
export function releaseAmbient(): void {
  holdAmbient();
  releaseTimer = setTimeout(() => {
    releaseTimer = null;
    wantedBed = null;
    liveBed = null;
    const audio = ctx;
    if (audio) {
      for (const kind of ["plaza", "hollow"] as const) {
        const v = beds[kind];
        if (!v) continue;
        fadeGain(v.out, audio, 0.0001, 0.45);
        scheduleTeardown(kind, 0.45);
      }
    } else {
      for (const kind of ["plaza", "hollow"] as const) {
        const v = beds[kind];
        if (v) {
          stopVoice(v);
          delete beds[kind];
        }
      }
    }
  }, 360);
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
