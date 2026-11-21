// The Midnight Aquarium — tiny WebAudio synth.
// No audio files: every sound is a few oscillator notes, so the game stays
// fully offline and the dossier lists no assets at all.

let ctx = null;
let muted = false;

function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

// One note: oscillator + gain envelope, start now, fade out by `dur`.
function note(freq, start, dur, type = 'sine', vol = 0.16) {
  if (muted) return;
  const ac = audioCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = ac.currentTime + start;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// A find rings bright: two rising notes.
export function playFind() {
  note(660, 0, 0.16, 'sine', 0.18);
  note(990, 0.09, 0.28, 'sine', 0.18);
  note(1320, 0.18, 0.2, 'triangle', 0.08);
}

// A miss buzzes low and flat.
export function playWrong() {
  note(140, 0, 0.22, 'sawtooth', 0.1);
}

// A hint pings soft and high.
export function playHint() {
  note(1180, 0, 0.3, 'sine', 0.12);
  note(1560, 0.12, 0.35, 'sine', 0.1);
}

// A finished level plays a short rising arpeggio.
export function playLevel() {
  [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.11, 0.3, 'triangle', 0.14));
}

// The whole aquarium cleared: a longer fanfare.
export function playWin() {
  [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => note(f, i * 0.13, 0.42, 'triangle', 0.14));
  note(262, 0, 0.9, 'sine', 0.07);
}

// A soft bubble pop for buttons.
export function playClick() {
  note(880, 0, 0.08, 'sine', 0.08);
}
