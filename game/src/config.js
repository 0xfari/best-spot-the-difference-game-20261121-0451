// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** One picture panel, in scene coordinates: every scene draws into a 560x420 box. */
export const PANEL = { width: 560, height: 420 };
export const PANEL_LEFT = { x: 24, y: 76 };
export const PANEL_RIGHT = { x: 696, y: 76 };

/** How close (scene units) a click must land to a difference to count. */
export const HIT_RADIUS = 30;

/** Seconds of play per level, hints per level, and the wrong-click time penalty. */
export const LEVELS = [
  { name: "The Clockmaker's Attic", scene: 'attic', seconds: 120, hints: 3 },
  { name: 'The Garden Shed', scene: 'shed', seconds: 105, hints: 3 },
  { name: 'The Harbour Café', scene: 'cafe', seconds: 90, hints: 2 },
];

export const SCORE = { find: 100, wrong: -10, timeBonusPerSecond: 5 };

export const PALETTE = {
  page: '#17130e',
  header: '#241c12',
  headerText: '#f5e9c8',
  muted: '#b8a67e',
  panelFrame: '#3a2c18',
  panelGap: '#17130e',
  foundRing: '#ffd94d',
  foundRingSoft: 'rgba(255, 217, 77, 0.35)',
  hintRing: '#7ee2ff',
  wrongMark: '#ff5a4d',
  button: '#4a3419',
  buttonText: '#ffe9a8',
  good: '#8fe388',
  bad: '#ff6b5e',
  timerLow: '#ff6b5e',
};

export const FONT = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'clockmakers-attic.best';
