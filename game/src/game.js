// The state machine: title, play, level clear, win and game over. One game owns the
// level's difference set, the found marks, the timer, the hints, the score and the
// keyboard cursor. Clicks go through the same path whether they come from the mouse,
// the keyboard or a staged screenshot, so a screenshot shows a state the real rules
// actually reached.

import { HIT_RADIUS, LEVELS, PANEL, PANEL_LEFT, PANEL_RIGHT, SCORE } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_CLEAR = 'level-clear';
export const SCREEN_WIN = 'win';
export const SCREEN_GAME_OVER = 'game-over';
export const SCREEN_PAUSED = 'paused';

export function createGame(sound) {
  const game = {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    score: 0,
    best: 0,
    found: new Set(),
    hintsLeft: 0,
    timeLeft: 0,
    message: '',
    wrongFlashes: [],
    hintFlash: null,
    cursor: { panel: 0, x: PANEL.width / 2, y: PANEL.height / 2 },
    muted: false,
    levelBonus: 0,
  };

  function level() {
    return LEVELS[game.levelIndex];
  }

  function scene() {
    return SCENES[level().scene];
  }

  function startLevel(index) {
    game.levelIndex = index;
    game.found = new Set();
    game.hintsLeft = level().hints;
    game.timeLeft = level().seconds;
    game.wrongFlashes = [];
    game.hintFlash = null;
    game.message = `Find ${scene().differences.length} differences!`;
    game.screen = SCREEN_PLAY;
  }

  function startGame() {
    game.score = 0;
    game.levelBonus = 0;
    startLevel(0);
  }

  function nextLevel() {
    if (game.levelIndex + 1 < LEVELS.length) startLevel(game.levelIndex + 1);
    else {
      game.screen = SCREEN_WIN;
      if (game.score > game.best) game.best = game.score;
    }
  }

  /** The scene coordinates of a canvas point, or null when it is not on a panel. */
  function panelHit(canvasX, canvasY) {
    for (const [panel, origin] of [[0, PANEL_LEFT], [1, PANEL_RIGHT]]) {
      if (canvasX >= origin.x && canvasX < origin.x + PANEL.width && canvasY >= origin.y && canvasY < origin.y + PANEL.height) {
        return { panel, x: canvasX - origin.x, y: canvasY - origin.y };
      }
    }
    return null;
  }

  /** Try a click at scene coordinates of one panel. Returns 'found', 'wrong' or 'none'. */
  function clickAt(x, y) {
    if (game.screen !== SCREEN_PLAY) return 'none';
    let best = null;
    let bestDist = Infinity;
    for (const diff of scene().differences) {
      if (game.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = diff;
      }
    }
    if (best !== null && bestDist <= HIT_RADIUS) {
      game.found.add(best.id);
      game.score += SCORE.find;
      game.message = `Found: ${best.name}! (${game.found.size}/${scene().differences.length})`;
      sound.found();
      if (game.found.size === scene().differences.length) {
        game.levelBonus = Math.ceil(game.timeLeft) * SCORE.timeBonusPerSecond;
        game.score += game.levelBonus;
        game.screen = SCREEN_LEVEL_CLEAR;
        game.message = `Level clear! Time bonus +${game.levelBonus}.`;
        sound.win();
      }
      return 'found';
    }
    game.timeLeft = Math.max(0, game.timeLeft - 5);
    game.score = Math.max(0, game.score + SCORE.wrong);
    game.message = 'Not a difference — 5 seconds lost!';
    game.wrongFlashes.push({ x, y, ttl: 0.7 });
    sound.wrong();
    return 'wrong';
  }

  /** A click at canvas coordinates (logical 1280x720 space). */
  function clickCanvas(canvasX, canvasY) {
    const hit = panelHit(canvasX, canvasY);
    if (hit === null) return 'none';
    return clickAt(hit.x, hit.y);
  }

  function useHint() {
    if (game.screen !== SCREEN_PLAY || game.hintsLeft <= 0) return false;
    const remaining = scene().differences.filter((d) => !game.found.has(d.id));
    if (remaining.length === 0) return false;
    const diff = remaining[Math.floor(Math.random() * remaining.length)];
    game.hintsLeft -= 1;
    game.hintFlash = { diff, ttl: 2 };
    game.message = `Hint: look for ${diff.name}.`;
    sound.hint();
    return true;
  }

  function update(dt) {
    if (game.screen !== SCREEN_PLAY) return;
    game.timeLeft -= dt;
    if (game.hintFlash !== null) {
      game.hintFlash.ttl -= dt;
      if (game.hintFlash.ttl <= 0) game.hintFlash = null;
    }
    for (const flash of game.wrongFlashes) flash.ttl -= dt;
    game.wrongFlashes = game.wrongFlashes.filter((f) => f.ttl > 0);
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      game.screen = SCREEN_GAME_OVER;
      game.message = 'Out of time!';
      sound.lose();
    }
  }

  function moveCursor(dx, dy) {
    game.cursor.x = Math.min(PANEL.width, Math.max(0, game.cursor.x + dx));
    game.cursor.y = Math.min(PANEL.height, Math.max(0, game.cursor.y + dy));
  }

  function clickCursor() {
    return clickAt(game.cursor.x, game.cursor.y);
  }

  function switchPanel() {
    game.cursor.panel = 1 - game.cursor.panel;
  }

  // The state object carries its own methods, so the renderer and the boot code
  // use one object: game.found, game.score and game.scene() all live on it.
  Object.assign(game, {
    level,
    scene,
    startGame,
    startLevel,
    nextLevel,
    clickAt,
    clickCanvas,
    useHint,
    update,
    moveCursor,
    clickCursor,
    switchPanel,
    panelHit,
  });
  return game;
}
