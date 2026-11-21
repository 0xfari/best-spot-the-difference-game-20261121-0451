// Every pixel the game paints: the header bar, the two picture panels with their
// frames, the found markers, the hint ring, the wrong-click flashes, the footer bar
// with its buttons, and the title / level-clear / win / game-over / paused overlays.
// The renderer only reads the game state; it never changes it.

import { FIELD, FONT, LEVELS, PALETTE, PANEL, PANEL_LEFT, PANEL_RIGHT } from './config.js';

export const BUTTONS = {
  hint: { x: 1020, y: 664, w: 110, h: 40 },
  restart: { x: 890, y: 664, w: 120, h: 40 },
  mute: { x: 1140, y: 664, w: 110, h: 40 },
  next: { x: 540, y: 520, w: 200, h: 52 },
  again: { x: 540, y: 560, w: 200, h: 52 },
};

function text(ctx, str, x, y, size, colour, align = 'left', bold = false) {
  ctx.fillStyle = colour;
  ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function button(ctx, box, label, enabled = true) {
  ctx.fillStyle = enabled ? PALETTE.button : '#3a2c18';
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, 8);
  ctx.fill();
  ctx.strokeStyle = enabled ? '#8a6a3a' : '#5a4632';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, box.x + box.w / 2, box.y + box.h / 2 + 7, 17, enabled ? PALETTE.buttonText : PALETTE.muted, 'center', true);
}

function ring(ctx, x, y, r, colour, width) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPanel(ctx, game, origin, altered, showCursor) {
  const scene = game.scene();
  ctx.save();
  ctx.beginPath();
  ctx.rect(origin.x, origin.y, PANEL.width, PANEL.height);
  ctx.clip();
  scene.draw(ctx, origin.x, origin.y, altered);
  ctx.restore();
  ctx.strokeStyle = PALETTE.panelFrame;
  ctx.lineWidth = 6;
  ctx.strokeRect(origin.x, origin.y, PANEL.width, PANEL.height);

  // Found markers: a gold ring plus a small star, drawn on both panels.
  for (const id of game.found) {
    const diff = scene.differences.find((d) => d.id === id);
    if (!diff) continue;
    const cx = origin.x + diff.x;
    const cy = origin.y + diff.y;
    ring(ctx, cx, cy, 24, PALETTE.foundRingSoft, 10);
    ring(ctx, cx, cy, 20, PALETTE.foundRing, 4);
    text(ctx, '★', cx, cy + 7, 22, PALETTE.foundRing, 'center', true);
  }
  // Hint flash: a pulsing ring around one unfound difference, on both panels.
  if (game.hintFlash !== null) {
    const diff = game.hintFlash.diff;
    const pulse = 22 + Math.sin(Date.now() / 120) * 5;
    ring(ctx, origin.x + diff.x, origin.y + diff.y, pulse, PALETTE.hintRing, 4);
  }
  // Wrong-click flashes, at the panel they happened on.
  for (const flash of game.wrongFlashes) {
    ring(ctx, origin.x + flash.x, origin.y + flash.y, 18, PALETTE.wrongMark, 4);
    text(ctx, '✕', origin.x + flash.x, origin.y + flash.y + 7, 22, PALETTE.wrongMark, 'center', true);
  }
  // Keyboard cursor: a crosshair on the focused panel.
  if (showCursor && game.screen === 'play') {
    const isThis = (origin === PANEL_LEFT && game.cursor.panel === 0) || (origin === PANEL_RIGHT && game.cursor.panel === 1);
    if (isThis) {
      const cx = origin.x + game.cursor.x;
      const cy = origin.y + game.cursor.y;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy);
      ctx.lineTo(cx + 14, cy);
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx, cy + 14);
      ctx.stroke();
      ring(ctx, cx, cy, 10, '#ffffff', 2);
    }
  }
}

function drawHeader(ctx, game) {
  ctx.fillStyle = PALETTE.header;
  ctx.fillRect(0, 0, FIELD.width, 64);
  text(ctx, 'SPOT THE DIFFERENCE', 24, 28, 24, PALETTE.headerText, 'left', true);
  const level = LEVELS[game.levelIndex];
  text(ctx, `Level ${game.levelIndex + 1}/3 — ${level.name}`, 24, 52, 15, PALETTE.muted);
  const total = game.scene().differences.length;
  text(ctx, `${game.found.size} / ${total} found`, 640, 34, 22, PALETTE.headerText, 'center', true);
  text(ctx, `${total - game.found.size} left`, 640, 56, 14, PALETTE.muted, 'center');
  text(ctx, `Score ${game.score}`, 1000, 34, 20, PALETTE.headerText, 'center', true);
  const mm = Math.floor(Math.max(0, game.timeLeft) / 60);
  const ss = Math.floor(Math.max(0, game.timeLeft) % 60).toString().padStart(2, '0');
  const low = game.timeLeft <= 15 && game.screen === 'play';
  text(ctx, `${mm}:${ss}`, 1180, 34, 24, low ? PALETTE.timerLow : PALETTE.headerText, 'center', true);
  // Timer bar.
  const frac = Math.max(0, Math.min(1, game.timeLeft / level.seconds));
  ctx.fillStyle = '#3a2c18';
  ctx.fillRect(880, 48, 320, 8);
  ctx.fillStyle = low ? PALETTE.timerLow : PALETTE.good;
  ctx.fillRect(880, 48, 320 * frac, 8);
}

function drawFooter(ctx, game) {
  ctx.fillStyle = PALETTE.header;
  ctx.fillRect(0, 640, FIELD.width, 80);
  text(ctx, game.message, 24, 672, 17, PALETTE.headerText);
  text(ctx, 'Click a difference · H hint · R restart · P pause · M mute · Arrows move, Enter clicks', 24, 700, 14, PALETTE.muted);
  button(ctx, BUTTONS.restart, 'Restart (R)');
  button(ctx, BUTTONS.hint, `Hint (H) x${game.hintsLeft}`, game.hintsLeft > 0 && game.screen === 'play');
  button(ctx, BUTTONS.mute, game.muted ? 'Muted (M)' : 'Sound (M)');
}

function overlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(23, 19, 14, 0.72)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = '#241c12';
  ctx.beginPath();
  ctx.roundRect(340, 170, 600, 440, 16);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, title, 640, 250, 40, PALETTE.headerText, 'center', true);
  let y = 310;
  for (const line of lines) {
    text(ctx, line, 640, y, 20, PALETTE.headerText, 'center');
    y += 34;
  }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;

  // showCursor is false for staged screenshots: the keyboard crosshair belongs
  // to live play, and in a still frame it reads as a stray mark on the picture.
  function draw(game, screen, best, showCursor = true) {
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.page;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    // The right panel shows every difference as altered from the start; the left
    // panel shows the plain picture. Found marks are drawn on both.
    drawPanel(ctx, game, PANEL_LEFT, new Set(), showCursor);
    drawPanel(ctx, game, PANEL_RIGHT, new Set(game.scene().differences.map((d) => d.id)), showCursor);
    // Panel labels.
    text(ctx, 'A', PANEL_LEFT.x + 14, PANEL_LEFT.y + 30, 20, '#ffffff', 'left', true);
    text(ctx, 'B', PANEL_RIGHT.x + 14, PANEL_RIGHT.y + 30, 20, '#ffffff', 'left', true);
    drawHeader(ctx, game);
    drawFooter(ctx, game);

    if (screen === 'title') {
      overlay(ctx, 'SPOT THE DIFFERENCE', [
        'Two pictures, side by side — nearly the same.',
        `${game.scene().differences.length} differences hide between them.`,
        'Click one to mark it. Find them all before time runs out!',
        '',
        'Press Space or click anywhere to start.',
        `Best score: ${best}`,
      ], PALETTE.foundRing);
    } else if (screen === 'level-clear') {
      overlay(ctx, 'LEVEL CLEAR!', [
        `You found all ${game.scene().differences.length} differences.`,
        `Time bonus +${game.levelBonus}.  Score ${game.score}.`,
        '',
        'Press Space or click to play the next level.',
      ], PALETTE.good);
      button(ctx, BUTTONS.next, 'Next level →');
    } else if (screen === 'win') {
      overlay(ctx, 'YOU FOUND THEM ALL!', [
        'Three rooms, every difference spotted.',
        `Final score: ${game.score}.   Best: ${best}.`,
        '',
        'Press Space or click to play again.',
      ], PALETTE.foundRing);
      button(ctx, BUTTONS.again, '↻ Play again');
    } else if (screen === 'game-over') {
      overlay(ctx, 'OUT OF TIME', [
        `You found ${game.found.size} of ${game.scene().differences.length} differences.`,
        `Score ${game.score}.   Best: ${best}.`,
        '',
        'Press Space or click to try this level again.',
      ], PALETTE.bad);
      button(ctx, BUTTONS.again, '↻ Try again');
    } else if (screen === 'paused') {
      overlay(ctx, 'PAUSED', ['Take a breath. The clock is stopped.', '', 'Press P or click to keep playing.'], PALETTE.muted);
    }
  }

  return { draw, canvas };
}
