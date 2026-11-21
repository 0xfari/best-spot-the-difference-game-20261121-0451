// The screenshot scenes behind ?shot=start|play|level2|end. Each one reaches its
// frame through the real rules: finds are made by calling the game's own click path
// with the differences' coordinates, and the timer is then frozen at a fixed value,
// so the frame is what real play looks like and the same seed always gives the same
// frame. The timer never advances in a staged shot: the loop does not run.

import { SCREEN_LEVEL_CLEAR, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './game.js';

/** Click the first `count` differences of the current level, through the real path. */
function findSome(game, count) {
  const diffs = game.scene().differences;
  for (let i = 0; i < count && i < diffs.length; i += 1) {
    game.clickAt(diffs[i].x, diffs[i].y);
  }
}

/** Click every difference of the current level, through the real path. */
function findAll(game) {
  for (const diff of game.scene().differences) {
    if (game.screen === SCREEN_PLAY) game.clickAt(diff.x, diff.y);
  }
}

/**
 * Put `game` into the named scene and return the screen to draw. The title scene
 * is the fresh game; play is mid-hunt with three found; level2 is the second room
 * mid-hunt with four found; end is the win screen after all three rooms.
 */
export function stageShot(name, game) {
  game.startGame();
  if (name === 'play') {
    findSome(game, 3);
    game.timeLeft = 87;
    return SCREEN_PLAY;
  }
  if (name === 'level2') {
    findAll(game);
    game.nextLevel();
    findSome(game, 4);
    game.timeLeft = 64;
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    findAll(game);
    game.nextLevel();
    findAll(game);
    game.nextLevel();
    findAll(game);
    game.nextLevel();
    return SCREEN_WIN;
  }
  game.screen = SCREEN_TITLE;
  return SCREEN_TITLE;
}
