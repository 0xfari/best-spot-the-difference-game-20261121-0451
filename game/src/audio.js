// All sound is synthesized with WebAudio: no audio files, no network. A short
// two-note chime for a find, a low buzz for a miss, a rising arpeggio for a win and a
// soft blip for a hint. The context is created lazily on the first user gesture, so
// the page stays silent until it is played.

export function createSound() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx === null) {
      try {
        const AC = window.AudioContext ?? window.webkitAudioContext;
        ctx = AC ? new AC() : null;
      } catch {
        ctx = null;
      }
    }
    if (ctx !== null && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, start, dur, type = 'sine', vol = 0.12) {
    const ac = ensure();
    if (ac === null || muted) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ac.currentTime + start);
    gain.gain.linearRampToValueAtTime(vol, ac.currentTime + start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + start);
    osc.stop(ac.currentTime + start + dur + 0.05);
  }

  return {
    setMuted(value) {
      muted = value;
    },
    isMuted() {
      return muted;
    },
    unlock() {
      ensure();
    },
    click() {
      tone(660, 0, 0.06, 'triangle', 0.06);
    },
    found() {
      tone(880, 0, 0.12, 'sine', 0.12);
      tone(1318, 0.09, 0.18, 'sine', 0.12);
    },
    wrong() {
      tone(160, 0, 0.22, 'sawtooth', 0.08);
    },
    hint() {
      tone(520, 0, 0.1, 'sine', 0.08);
      tone(780, 0.08, 0.12, 'sine', 0.08);
    },
    win() {
      tone(523, 0, 0.14, 'sine', 0.12);
      tone(659, 0.12, 0.14, 'sine', 0.12);
      tone(784, 0.24, 0.14, 'sine', 0.12);
      tone(1046, 0.36, 0.3, 'sine', 0.12);
    },
    lose() {
      tone(392, 0, 0.18, 'sine', 0.1);
      tone(311, 0.16, 0.18, 'sine', 0.1);
      tone(233, 0.32, 0.34, 'sine', 0.1);
    },
  };
}
