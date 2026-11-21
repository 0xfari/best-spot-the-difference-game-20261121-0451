// Boot and the one loop: input is read every frame, the timer advances in real
// time, and the renderer paints what is there. The game moves between six screens:
// title, play, paused, level clear, win and game over.
//
// ?shot=start|play|level2|end stages that scene instead of running the loop,
// paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, FIELD } from './config.js';
import { createSound } from './audio.js';
import { createGame, SCREEN_GAME_OVER, SCREEN_LEVEL_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './game.js';
import { BUTTONS, createRenderer } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const sound = createSound();
const game = createGame(sound);
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

game.best = readBest();

function announce(message) {
  status.textContent = message;
}

function inBox(x, y, box) {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

function advance() {
  if (game.screen === SCREEN_TITLE) {
    game.startGame();
    announce(`Playing level 1: ${game.level().name}. Find ${game.scene().differences.length} differences.`);
  } else if (game.screen === SCREEN_LEVEL_CLEAR) {
    game.nextLevel();
    announce(`Level ${game.levelIndex + 1}: ${game.level().name}.`);
  } else if (game.screen === SCREEN_WIN) {
    game.startGame();
    announce('Playing again from level 1.');
  } else if (game.screen === SCREEN_GAME_OVER) {
    game.startLevel(game.levelIndex);
    announce(`Trying level ${game.levelIndex + 1} again.`);
  } else if (game.screen === SCREEN_PAUSED) {
    game.screen = SCREEN_PLAY;
    announce('Playing.');
  }
}

function onPointer(clientX, clientY) {
  sound.unlock();
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * FIELD.width;
  const y = ((clientY - rect.top) / rect.height) * FIELD.height;
  if (game.screen === SCREEN_PLAY) {
    if (inBox(x, y, BUTTONS.hint)) {
      if (game.useHint()) announce(game.message);
      return;
    }
    if (inBox(x, y, BUTTONS.restart)) {
      game.startLevel(game.levelIndex);
      announce('Level restarted.');
      return;
    }
    if (inBox(x, y, BUTTONS.mute)) {
      game.muted = !game.muted;
      sound.setMuted(game.muted);
      announce(game.muted ? 'Sound off.' : 'Sound on.');
      return;
    }
    const result = game.clickCanvas(x, y);
    if (result !== 'none') announce(game.message);
    return;
  }
  if (game.screen === SCREEN_TITLE || game.screen === SCREEN_LEVEL_CLEAR || game.screen === SCREEN_WIN || game.screen === SCREEN_GAME_OVER || game.screen === SCREEN_PAUSED) {
    advance();
  }
}

canvas.addEventListener('pointerdown', (event) => {
  onPointer(event.clientX, event.clientY);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    game.switchPanel();
    return;
  }
  if (game.screen === SCREEN_PLAY) {
    if (event.key === 'ArrowLeft') game.moveCursor(-24, 0);
    else if (event.key === 'ArrowRight') game.moveCursor(24, 0);
    else if (event.key === 'ArrowUp') game.moveCursor(0, -24);
    else if (event.key === 'ArrowDown') game.moveCursor(0, 24);
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const result = game.clickCursor();
      if (result !== 'none') announce(game.message);
    } else if (event.key === 'h' || event.key === 'H') {
      if (game.useHint()) announce(game.message);
    } else if (event.key === 'r' || event.key === 'R') {
      game.startLevel(game.levelIndex);
      announce('Level restarted.');
    } else if (event.key === 'p' || event.key === 'P') {
      game.screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (event.key === 'm' || event.key === 'M') {
      game.muted = !game.muted;
      sound.setMuted(game.muted);
      announce(game.muted ? 'Sound off.' : 'Sound on.');
    }
    return;
  }
  if (event.key === 'p' || event.key === 'P') {
    if (game.screen === SCREEN_PAUSED) {
      game.screen = SCREEN_PLAY;
      announce('Playing.');
    }
    return;
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    advance();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.screen === SCREEN_PLAY) {
    game.screen = SCREEN_PAUSED;
    announce('Paused.');
  }
});

function runShot(name) {
  const screen = stageShot(name, game);
  let painted = 0;
  function paint() {
    renderer.draw(game, screen, game.best, false);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    if (game.screen === SCREEN_PLAY) {
      game.update(dt);
      if (game.screen === SCREEN_GAME_OVER && game.score > game.best) {
        game.best = game.score;
        saveBest(game.best);
      }
    }
    if (game.screen === SCREEN_WIN) saveBest(game.best);
    renderer.draw(game, game.screen, game.best);
  }
  announce('Spot the difference. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
