// The Midnight Bakery — tiny WebAudio synth sounds, no audio files.
// Every sound is a few oscillators; nothing is fetched over the network.

let ctx = null;

function audioCtx() {
  if (ctx === null) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(muted, freq, startAt, dur, type, vol) {
  if (muted) return;
  try {
    const ac = audioCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + startAt);
    gain.gain.linearRampToValueAtTime(vol || 0.12, ac.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startAt + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + startAt);
    osc.stop(ac.currentTime + startAt + dur + 0.05);
  } catch (err) {
    // Sound is garnish: a browser without audio must never break the game.
  }
}

export function playFound(muted) {
  tone(muted, 660, 0, 0.18, 'sine', 0.14);
  tone(muted, 880, 0.08, 0.22, 'sine', 0.14);
  tone(muted, 1320, 0.16, 0.3, 'triangle', 0.08);
}

export function playMiss(muted) {
  tone(muted, 160, 0, 0.25, 'sawtooth', 0.06);
}

export function playHint(muted) {
  tone(muted, 520, 0, 0.15, 'sine', 0.1);
  tone(muted, 780, 0.12, 0.2, 'sine', 0.1);
}

export function playTick(muted) {
  tone(muted, 980, 0, 0.06, 'square', 0.04);
}

export function playWin(muted) {
  [523, 659, 784, 1047].forEach((f, i) => tone(muted, f, i * 0.12, 0.4, 'triangle', 0.12));
}
