// Hand in "The Midnight Aquarium", a spot-the-difference game (Node 22,
// standard library only). The game itself is plain static files under game/
// — one HTML page and its ES modules, no library and no network request —
// and this program copies game/ and screenshots/ from beside this file into
// /output, then writes /output/dossier.json with the vendored make.fun
// library, so the judge can read the game from its own files and screenshots.
//
// Serve the game locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Never remove the output directory itself: on the grader it is a mount
// point, and removing it fails with EBUSY. Only create it, empty its
// contents, and fill it again.
mkdirSync(out, { recursive: true });
for (const child of readdirSync(out)) {
  rmSync(join(out, child), { recursive: true, force: true });
}

cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Fail loudly, before the dossier is written, when the screenshots do not
// meet the gate: 3 or 4 images, each a whole PNG or JPEG of at most 256 KiB.
// A silent bad hand-in would waste the entry; this check turns it into a
// visible error.
const shots = readdirSync(join(here, 'screenshots')).filter((f) => !f.startsWith('.'));
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
}
for (const shot of shots) {
  const file = join(here, 'screenshots', shot);
  const bytes = statSync(file).size;
  if (bytes > 262144) throw new Error(`screenshot ${shot} is ${bytes} bytes, over the 256 KiB cap`);
  // A size check alone would pass a truncated file, so also read the first
  // bytes: a whole PNG starts 89 50 4E 47, a whole JPEG starts FF D8 FF.
  const head = readFileSync(file, { encoding: null }).subarray(0, 4);
  const isPng = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47;
  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  if (!isPng && !isJpeg) throw new Error(`screenshot ${shot} is not a whole PNG or JPEG`);
}

// The scorer's own caps: the dossier text cap shapes the bytes, and the
// rest refuse an entry the scorer would refuse (more than 4 screenshots or
// one over 256 KiB; more than 993 files in game/ or 48 MiB of game files
// in all).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
