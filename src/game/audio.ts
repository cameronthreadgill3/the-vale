type Bus = { ctx: AudioContext; master: GainNode; sfx: GainNode; music: GainNode };

let bus: Bus | null = null;
let musicTimer = 0;
let musicOn = false;

function ensure(): Bus | null {
  if (typeof window === "undefined") return null;
  if (bus) return bus;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC({ latencyHint: "interactive" });
  const master = ctx.createGain();
  const sfx = ctx.createGain();
  const music = ctx.createGain();
  sfx.connect(master);
  music.connect(master);
  master.connect(ctx.destination);
  bus = { ctx, master, sfx, music };
  return bus;
}

export function unlockAudio() {
  const b = ensure();
  if (!b) return;
  if (b.ctx.state === "suspended") void b.ctx.resume();
}

export function setVolumes(sfx: number, music: number) {
  const b = ensure();
  if (!b) return;
  b.sfx.gain.setTargetAtTime(sfx * sfx, b.ctx.currentTime, 0.03);
  b.music.gain.setTargetAtTime(music * music * 0.45, b.ctx.currentTime, 0.05);
}

function beep(freq: number, dur: number, type: OscillatorType, gain: number, detune = 0) {
  const b = bus;
  if (!b) return;
  const t = b.ctx.currentTime;
  const o = b.ctx.createOscillator();
  const g = b.ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune + (Math.random() * 30 - 15);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(b.sfx);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, gain: number) {
  const b = bus;
  if (!b) return;
  const n = b.ctx.createBuffer(1, Math.floor(b.ctx.sampleRate * dur), b.ctx.sampleRate);
  const data = n.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = b.ctx.createBufferSource();
  src.buffer = n;
  const g = b.ctx.createGain();
  const t = b.ctx.currentTime;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const f = b.ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 900 + Math.random() * 400;
  src.connect(f);
  f.connect(g);
  g.connect(b.sfx);
  src.start();
}

export function sfxHit() {
  noise(0.08, 0.18);
  beep(180, 0.09, "square", 0.08);
}
export function sfxSwing() {
  noise(0.05, 0.1);
}
export function sfxSpell() {
  beep(520, 0.16, "sine", 0.1);
  beep(780, 0.2, "triangle", 0.06);
}
export function sfxHeal() {
  beep(440, 0.18, "sine", 0.08);
  beep(660, 0.22, "sine", 0.06);
}
export function sfxDeath() {
  beep(220, 0.28, "sawtooth", 0.1);
  beep(110, 0.4, "square", 0.06);
}
export function sfxLevel() {
  beep(392, 0.12, "sine", 0.08);
  beep(523, 0.16, "sine", 0.08);
  beep(659, 0.22, "sine", 0.09);
}
export function sfxUi() {
  beep(640, 0.05, "triangle", 0.05);
}
export function sfxChest() {
  beep(300, 0.1, "square", 0.07);
  beep(450, 0.14, "triangle", 0.06);
}
export function sfxStep() {
  noise(0.04, 0.045);
  beep(90 + Math.random() * 40, 0.05, "sine", 0.03);
}
export function sfxHuntEnter() {
  beep(196, 0.18, "sine", 0.05);
  beep(247, 0.28, "triangle", 0.04);
}
export function sfxUnique() {
  beep(147, 0.22, "sine", 0.06);
  beep(196, 0.3, "triangle", 0.04);
}
export function sfxFountain() {
  beep(330, 0.12, "sine", 0.04);
  beep(495, 0.18, "sine", 0.035);
}

export function startMusic() {
  musicOn = true;
}

export function tickMusic(dt: number) {
  if (!musicOn || !bus) return;
  musicTimer -= dt;
  if (musicTimer > 0) return;
  musicTimer = 2.4 + Math.random() * 1.6;
  const notes = [196, 220, 247, 262, 294];
  beep(notes[(Math.random() * notes.length) | 0], 1.4, "sine", 0.035, 0);
}

export function stopMusic() {
  musicOn = false;
}
