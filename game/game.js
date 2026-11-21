// The Midnight Bakery — game state, input, timer, hints and scoring.
// One job: run a scene. Art lives in bakery.js, sounds in audio.js.

import { SCENES } from './bakery.js';
import { playFound, playMiss, playHint, playWin, playTick } from './audio.js';

const PANEL_W = 600;
const PANEL_H = 580;
const TIME_PER_SCENE = 90;
const HINTS_PER_SCENE = 3;

export function createGame(onEvent) {
  const left = document.getElementById('left-canvas');
  const right = document.getElementById('right-canvas');
  const lctx = left.getContext('2d');
  const rctx = right.getContext('2d');

  const state = {
    sceneIndex: 0,
    found: new Set(),
    hint: null,          // diff id currently hinted, or null
    hintsLeft: HINTS_PER_SCENE,
    timeLeft: TIME_PER_SCENE,
    score: 0,
    streak: 0,
    totalFound: 0,
    frozen: false,       // screenshot presets freeze the clock
    over: false,
    won: false,
    muted: false,
    lastTickSecond: TIME_PER_SCENE,
  };

  let timerId = null;

  function scene() { return SCENES[state.sceneIndex]; }

  function drawPanels() {
    const s = scene();
    s.draw(lctx, PANEL_W, PANEL_H, 'left');
    s.draw(rctx, PANEL_W, PANEL_H, 'right');
    drawMarks(lctx);
    drawMarks(rctx);
  }

  function drawMarks(ctx) {
    const s = scene();
    // Hint ring first, under the found rings: dashed gold, pulsing.
    if (state.hint !== null) {
      const d = s.diffs[state.hint];
      const pulse = 6 + 4 * Math.sin(Date.now() / 180);
      ctx.strokeStyle = '#ffd66e';
      ctx.lineWidth = 5;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Found rings: thick gold circle + number badge, on both panels.
    let n = 0;
    for (const id of state.found) {
      n += 1;
      const d = s.diffs[id];
      ctx.strokeStyle = '#ffc95e';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#8a5a28';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffc95e';
      ctx.beginPath();
      ctx.arc(d.x, d.y - d.r, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a5a28';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#2a1708';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n), d.x, d.y - d.r);
    }
  }

  function refreshHud() {
    const s = scene();
    document.getElementById('scene-name').textContent = s.name;
    document.getElementById('found-count').textContent =
      `${state.found.size} / ${s.diffs.length}`;
    const timerEl = document.getElementById('timer');
    timerEl.textContent = String(Math.max(0, Math.ceil(state.timeLeft)));
    timerEl.classList.toggle('low', state.timeLeft <= 15);
    document.getElementById('score').textContent = String(state.score);
    document.getElementById('streak').textContent = `×${Math.max(1, state.streak)}`;
    document.getElementById('hint-btn').textContent =
      `HINT (H) · ${state.hintsLeft}`;
    document.getElementById('hint-btn').disabled = state.hintsLeft <= 0 || state.over;
    const dots = document.getElementById('dots');
    dots.innerHTML = '';
    SCENES.forEach((sc, i) => {
      const dot = document.createElement('span');
      dot.className = 'dot' + (i < state.sceneIndex ? ' done' : i === state.sceneIndex ? ' now' : '');
      dot.title = sc.name;
      dots.appendChild(dot);
    });
  }

  function say(text) {
    document.getElementById('message').textContent = text;
  }

  function stopTimer() {
    if (timerId !== null) { clearInterval(timerId); timerId = null; }
  }

  function startTimer() {
    stopTimer();
    state.lastTickSecond = Math.ceil(state.timeLeft);
    timerId = setInterval(() => {
      if (state.frozen || state.over) return;
      state.timeLeft -= 0.25;
      const whole = Math.ceil(state.timeLeft);
      if (whole !== state.lastTickSecond) {
        state.lastTickSecond = whole;
        if (whole <= 10 && whole > 0) playTick(state.muted);
      }
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        refreshHud();
        endScene(false);
        return;
      }
      refreshHud();
    }, 250);
  }

  function startScene(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.hint = null;
    state.hintsLeft = HINTS_PER_SCENE;
    state.timeLeft = TIME_PER_SCENE;
    state.streak = 0;
    state.over = false;
    drawPanels();
    refreshHud();
    say(`Find ${scene().diffs.length} differences in ${scene().name.split('·')[1].trim()} — click one on either picture.`);
    startTimer();
  }

  function endScene(finished) {
    stopTimer();
    state.over = true;
    if (!finished) {
      state.streak = 0;
      showOverlay(
        'TIME UP',
        `You found ${state.found.size} of ${scene().diffs.length} differences in this scene.\nThe bakery closes for the night — try again?`,
        'PLAY AGAIN',
        () => { hideOverlay(); startScene(0); state.score = 0; state.totalFound = 0; refreshHud(); },
      );
      onEvent({ type: 'scene-lost', scene: state.sceneIndex });
      return;
    }
    const bonus = Math.ceil(state.timeLeft) * 10;
    state.score += bonus;
    refreshHud();
    playWin(state.muted);
    if (state.sceneIndex + 1 >= SCENES.length) {
      state.won = true;
      showOverlay(
        'YOU FOUND THEM ALL!',
        `All ${state.totalFound} differences across 3 scenes — the bakery is yours.\nTime bonus +${bonus} · Final score ${state.score}`,
        'PLAY AGAIN',
        () => { hideOverlay(); state.score = 0; state.totalFound = 0; startScene(0); },
      );
      onEvent({ type: 'won', score: state.score });
      return;
    }
    showOverlay(
      'SCENE CLEAR!',
      `All ${scene().diffs.length} differences found — time bonus +${bonus}.\nNext: ${SCENES[state.sceneIndex + 1].name}`,
      'NEXT SCENE',
      () => { hideOverlay(); startScene(state.sceneIndex + 1); },
    );
    onEvent({ type: 'scene-clear', scene: state.sceneIndex, bonus });
  }

  function showOverlay(title, text, btn, onClick) {
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-text').textContent = text;
    const b = document.getElementById('overlay-btn');
    b.textContent = btn;
    b.onclick = onClick;
    document.getElementById('overlay').classList.remove('hidden');
  }

  function hideOverlay() {
    document.getElementById('overlay').classList.add('hidden');
  }

  function clickAt(canvas, event) {
    if (state.over || state.frozen) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (PANEL_W / rect.width);
    const y = (event.clientY - rect.top) * (PANEL_H / rect.height);
    const s = scene();
    for (const d of s.diffs) {
      if (state.found.has(d.id)) continue;
      const dx = x - d.x, dy = y - d.y;
      if (dx * dx + dy * dy <= (d.r + 12) * (d.r + 12)) {
        state.found.add(d.id);
        state.totalFound += 1;
        state.streak += 1;
        const gained = 100 * Math.max(1, state.streak) + Math.ceil(state.timeLeft);
        state.score += gained;
        if (state.hint === d.id) state.hint = null;
        playFound(state.muted);
        drawPanels();
        refreshHud();
        say(`Found it — ${d.name}! +${gained} points${state.streak > 1 ? ` (streak ×${state.streak})` : ''}`);
        onEvent({ type: 'found', scene: state.sceneIndex, diff: d.id, score: state.score });
        if (state.found.size === s.diffs.length) endScene(true);
        return;
      }
    }
    // A miss: streak resets, 5 seconds off the clock.
    state.streak = 0;
    state.timeLeft = Math.max(0, state.timeLeft - 5);
    playMiss(state.muted);
    refreshHud();
    say('Not a difference — 5 seconds lost. Look closer.');
    onEvent({ type: 'miss', scene: state.sceneIndex });
  }

  function useHint() {
    if (state.over || state.frozen || state.hintsLeft <= 0) return;
    const s = scene();
    const remaining = s.diffs.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return;
    state.hintsLeft -= 1;
    state.hint = remaining[Math.floor(Math.random() * remaining.length)].id;
    playHint(state.muted);
    drawPanels();
    refreshHud();
    say('Hint: look inside the dashed gold ring — a difference hides there.');
    onEvent({ type: 'hint', scene: state.sceneIndex });
  }

  function toggleMute() {
    state.muted = !state.muted;
    document.getElementById('mute-btn').textContent = state.muted ? 'SOUND OFF' : 'SOUND ON';
  }

  left.addEventListener('click', (e) => clickAt(left, e));
  right.addEventListener('click', (e) => clickAt(right, e));
  document.getElementById('hint-btn').addEventListener('click', useHint);
  document.getElementById('mute-btn').addEventListener('click', toggleMute);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') useHint();
    if (e.key === 'm' || e.key === 'M') toggleMute();
  });

  // Screenshot presets: deterministic states, frozen clock, no overlay
  // unless the preset is the win screen (?shot=win).
  function applyPreset(name) {
    const s = scene();
    if (name === 'cover') {
      startScene(0);
      state.frozen = true;
      for (const id of [0, 1, 2]) state.found.add(id);
      state.totalFound = 3;
      state.score = 1250;
      state.streak = 3;
      state.timeLeft = 72;
      drawPanels();
      refreshHud();
      say('3 of 6 found — three more hide in this picture. Can you see them?');
    } else if (name === 'scene2') {
      startScene(1);
      state.frozen = true;
      for (const id of [0, 3]) state.found.add(id);
      state.totalFound = 8;
      state.score = 3120;
      state.streak = 2;
      state.hint = 1;
      state.timeLeft = 58;
      drawPanels();
      refreshHud();
      say('Hint: look inside the dashed gold ring — a difference hides there.');
    } else if (name === 'scene3') {
      startScene(2);
      state.frozen = true;
      state.found.add(4);
      state.totalFound = 13;
      state.score = 5480;
      state.streak = 1;
      state.timeLeft = 81;
      drawPanels();
      refreshHud();
      say('The garden at dusk — only 1 of 6 found so far. The last scene is the hardest.');
    } else if (name === 'win') {
      startScene(2);
      state.frozen = true;
      state.over = true;
      state.won = true;
      for (const d of s.diffs) state.found.add(d.id);
      state.totalFound = 18;
      state.score = 8450;
      drawPanels();
      refreshHud();
      showOverlay(
        'YOU FOUND THEM ALL!',
        'All 18 differences across 3 scenes — the bakery is yours.\nTime bonus +320 · Final score 8450',
        'PLAY AGAIN',
        () => {},
      );
    }
  }

  return { state, startScene, applyPreset, toggleMute, useHint };
}
