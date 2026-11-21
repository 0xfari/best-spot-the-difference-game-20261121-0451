// The Midnight Bakery — boot: wire the game to the page and honour the
// ?shot= presets the maker uses for screenshots (cover, scene2, scene3, win).

import { createGame } from './game.js';

const game = createGame((event) => {
  // The game reports its own events here; the page needs nothing more.
  void event;
});

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  game.applyPreset(shot);
} else {
  game.startScene(0);
}
