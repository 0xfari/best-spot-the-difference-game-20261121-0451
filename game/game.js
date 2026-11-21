// The Midnight Aquarium — game logic.
// One state object, one render loop, clicks on either panel. A difference
// counts when the click lands inside its ring on the panel that was clicked;
// found rings stay on both panels until the level ends.

import { SCENES, DIFFS_PER_LEVEL } from './scenes.js';
import { drawScene, PANEL_W, PANEL_H } from './draw.js';
import {
  playFind, playWrong, playHint, playLevel, playWin, playClick,
  setMuted, isMuted,
} from './audio.js';

const $ = (id) => document.getElementById(id);
const leftCanvas = $('canvas-left');
const rightCanvas = $('canvas-right');
const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const shotMode = shot !== null;

// Staged states for the screenshots: real renders of the game, frozen
// mid-hunt with markers, a hint, or the win screen showing.
const SHOT_PRESETS = {
  cover: { level: 0, found: [0, 1, 2, 3], timeLeft: 142, score: 1250, combo: 4 },
  trench: { level: 2, found: [0, 1, 2, 3, 4, 5, 6], timeLeft: 98, score: 3100, combo: 7 },
  hint: { level: 1, found: [0, 1], hint: 4, timeLeft: 155, score: 450, combo: 2 },
  win: { level: 4, found: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], timeLeft: 64, score: 8450, combo: 10 },
};

const state = {
  phase: 'menu', // menu | playing | levelDone | won | timeUp
  level: 0,
  found: new Set(),
  score: 0,
  levelScore: 0,
  combo: 1,
  hintsLeft: 3,
  timeLeft: 180,
  hintId: null,
  misses: [],
  timer: null,
};

function scene() {
  return SCENES[state.level];
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function updateHud() {
  $('level-name').textContent = scene().name;
  $('counter').textContent = `${DIFFS_PER_LEVEL - state.found.size} / ${DIFFS_PER_LEVEL}`;
  $('timer').textContent = formatTime(state.timeLeft);
  $('timer').classList.toggle('low', state.timeLeft <= 30 && state.phase === 'playing');
  $('timer-fill').style.width = `${(state.timeLeft / scene().time) * 100}%`;
  $('timer-fill').classList.toggle('low', state.timeLeft <= 30);
  $('score').textContent = state.score.toLocaleString('en-US');
  $('combo').textContent = `×${state.combo}`;
  $('hints-left').textContent = state.hintsLeft;
  $('hint-btn').disabled = state.hintsLeft <= 0 || state.phase !== 'playing';
  const dots = $('level-dots');
  dots.innerHTML = '';
  SCENES.forEach((sc, i) => {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i < state.level ? ' done' : i === state.level ? ' now' : '');
    dot.title = sc.name;
    dots.appendChild(dot);
  });
}

function showOverlay(title, text, statsHtml, btnLabel, onBtn) {
  $('overlay-title').textContent = title;
  $('overlay-text').textContent = text;
  $('overlay-stats').innerHTML = statsHtml;
  const btn = $('overlay-btn');
  btn.textContent = btnLabel;
  btn.onclick = () => {
    playClick();
    onBtn();
  };
  $('overlay').classList.remove('hidden');
}

function hideOverlay() {
  $('overlay').classList.add('hidden');
}

function stopTimer() {
  if (state.timer !== null) {
    clearInterval(state.timer);
    state.timer = null;
  }
}

function startTimer() {
  stopTimer();
  state.timer = setInterval(() => {
    if (state.phase !== 'playing') return;
    state.timeLeft -= 0.5;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud();
      onTimeUp();
      return;
    }
    updateHud();
  }, 500);
}

function startLevel(index) {
  state.level = index;
  state.found = new Set();
  state.levelScore = 0;
  state.combo = 1;
  state.hintsLeft = 3;
  state.timeLeft = scene().time;
  state.hintId = null;
  state.misses = [];
  state.phase = 'playing';
  hideOverlay();
  updateHud();
  if (!shotMode) startTimer();
}

function onLevelComplete() {
  stopTimer();
  const timeBonus = Math.round(state.timeLeft) * 10;
  state.score += timeBonus;
  state.levelScore += timeBonus;
  state.phase = 'levelDone';
  playLevel();
  updateHud();
  const last = state.level === SCENES.length - 1;
  showOverlay(
    last ? 'THE GARDEN IS LIT' : `${scene().name.toUpperCase()} — CLEAR!`,
    last
      ? 'Every reef searched, every change found. The whole aquarium glows for you.'
      : `All ten differences found in ${scene().name}. The next reef is darker — and trickier.`,
    `Time bonus: +${timeBonus.toLocaleString('en-US')}<br>Level score: ${state.levelScore.toLocaleString('en-US')}<br>Total score: ${state.score.toLocaleString('en-US')}`,
    last ? 'SEE YOUR TREASURE' : 'NEXT REEF →',
    () => {
      if (last) onWin();
      else startLevel(state.level + 1);
    },
  );
}

function onWin() {
  state.phase = 'won';
  playWin();
  showOverlay(
    'THE MIDNIGHT AQUARIUM',
    'Fifty differences, five reefs, one sharp-eyed diver. You found them all.',
    `Final score: ${state.score.toLocaleString('en-US')}<br>Differences found: 50 / 50`,
    'PLAY AGAIN',
    () => {
      state.score = 0;
      startLevel(0);
    },
  );
}

function onTimeUp() {
  stopTimer();
  state.phase = 'timeUp';
  playWrong();
  showOverlay(
    'THE LIGHT RAN OUT',
    `The reef went dark with ${DIFFS_PER_LEVEL - state.found.size} differences still hiding in ${scene().name}.`,
    `Found this reef: ${state.found.size} / ${DIFFS_PER_LEVEL}<br>Total score: ${state.score.toLocaleString('en-US')}`,
    'TRY THIS REEF AGAIN',
    () => {
      state.score -= state.levelScore;
      startLevel(state.level);
    },
  );
}

function useHint() {
  if (state.phase !== 'playing' || state.hintsLeft <= 0) return;
  const remaining = scene().diffs.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return;
  state.hintsLeft -= 1;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintId = pick.id;
  playHint();
  updateHud();
  setTimeout(() => {
    if (state.hintId === pick.id) state.hintId = null;
  }, 4000);
}

function toggleMute() {
  setMuted(!isMuted());
  $('mute-btn').textContent = isMuted() ? 'SOUND OFF' : 'SOUND ON';
}

// A click on either panel: convert to scene coordinates, test every
// difference that is still unfound against this panel's own ring.
function onPanelClick(event, side) {
  if (state.phase !== 'playing') return;
  const canvas = side === 'left' ? leftCanvas : rightCanvas;
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * PANEL_W;
  const y = ((event.clientY - rect.top) / rect.height) * PANEL_H;
  for (const diff of scene().diffs) {
    if (state.found.has(diff.id)) continue;
    const hx = side === 'left' ? diff.lx : diff.rx;
    const hy = side === 'left' ? diff.ly : diff.ry;
    const dist = Math.hypot(x - hx, y - hy);
    if (dist <= diff.r) {
      state.found.add(diff.id);
      const gained = 100 + 25 * (state.combo - 1);
      state.score += gained;
      state.levelScore += gained;
      state.combo += 1;
      playFind();
      updateHud();
      if (state.found.size === DIFFS_PER_LEVEL) onLevelComplete();
      return;
    }
  }
  // No ring hit: a miss costs five seconds and the combo.
  state.combo = 1;
  state.timeLeft = Math.max(0, state.timeLeft - 5);
  state.misses.push({ x, y, born: animTime() });
  playWrong();
  canvas.classList.remove('shake');
  void canvas.offsetWidth;
  canvas.classList.add('shake');
  updateHud();
}

function animTime() {
  return shotMode ? 1.2 : performance.now() / 1000;
}

function renderLoop() {
  const t = animTime();
  state.misses = state.misses.filter((m) => t - m.born <= 0.7);
  drawScene(leftCtx, scene(), 'left', state.found, state.hintId, state.misses, t);
  drawScene(rightCtx, scene(), 'right', state.found, state.hintId, state.misses, t);
  requestAnimationFrame(renderLoop);
}

function applyShotPreset(name) {
  const preset = SHOT_PRESETS[name];
  if (!preset) return false;
  state.level = preset.level;
  state.found = new Set(preset.found.map((i) => scene().diffs[i].id));
  state.score = preset.score;
  state.levelScore = preset.score;
  state.combo = preset.combo;
  state.timeLeft = preset.timeLeft;
  state.hintsLeft = 3;
  state.hintId = preset.hint !== undefined ? scene().diffs[preset.hint].id : null;
  state.phase = 'playing';
  if (name === 'win') {
    state.phase = 'won';
    showOverlay(
      'THE MIDNIGHT AQUARIUM',
      'Fifty differences, five reefs, one sharp-eyed diver. You found them all.',
      `Final score: ${state.score.toLocaleString('en-US')}<br>Differences found: 50 / 50`,
      'PLAY AGAIN',
      () => {
        state.score = 0;
        startLevel(0);
      },
    );
  }
  updateHud();
  return true;
}

leftCanvas.addEventListener('click', (e) => onPanelClick(e, 'left'));
rightCanvas.addEventListener('click', (e) => onPanelClick(e, 'right'));
$('hint-btn').addEventListener('click', useHint);
$('mute-btn').addEventListener('click', toggleMute);
document.addEventListener('keydown', (e) => {
  if (e.key === 'h' || e.key === 'H') useHint();
  if (e.key === 'm' || e.key === 'M') toggleMute();
  if ((e.key === 'r' || e.key === 'R') && state.phase === 'playing') {
    state.score -= state.levelScore;
    startLevel(state.level);
  }
});

if (shotMode) {
  if (!applyShotPreset(shot)) {
    startLevel(0);
  }
} else {
  updateHud();
  showOverlay(
    'DIVE IN, SPOTTER',
    'Two pictures of the same reef hang side by side — but the right one hides ten changes. Click every difference on either picture before the light runs out. Three hints per reef, combos pay extra, and a wrong click costs five seconds.',
    'Five reefs &middot; ten differences each &middot; 180 seconds a reef at most',
    'START THE DIVE',
    () => startLevel(0),
  );
}

requestAnimationFrame(renderLoop);
