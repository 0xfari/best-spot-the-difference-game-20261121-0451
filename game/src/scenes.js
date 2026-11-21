// The three original scenes. Each scene draws one 560x420 picture into a panel; the left
// panel draws with no differences active, the right panel with the level's difference set
// active. A difference is one small, fair change: a hand moved, a colour swapped, one thing
// gone, one thing added. Every difference carries its scene coordinates and hit radius so
// the game can test clicks against it. Nothing here is copied from any existing game: the
// rooms, the objects and the names are all invented for this entry.

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function el(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function star4(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

function dot(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, width, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function text(ctx, str, x, y, size, colour, align = 'left', bold = false) {
  ctx.fillStyle = colour;
  ctx.font = `${bold ? 'bold ' : ''}${size}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

// ---------------------------------------------------------------------------
// Level 1 — The Clockmaker's Attic. Night, a round clock, a bookshelf, a cat
// asleep on the rug, a teapot, a hanging lantern and a potted plant.
// ---------------------------------------------------------------------------
function drawAttic(ctx, ox, oy, altered) {
  const g = ctx.createLinearGradient(0, oy, 0, oy + 420);
  g.addColorStop(0, '#f2e3c0');
  g.addColorStop(1, '#dfc795');
  ctx.fillStyle = g;
  ctx.fillRect(ox, oy, 560, 420);
  // Wooden floor.
  ctx.fillStyle = '#a97c50';
  ctx.fillRect(ox, oy + 356, 560, 64);
  ctx.fillStyle = '#96683f';
  for (let i = 0; i < 5; i += 1) ctx.fillRect(ox, oy + 356 + i * 13, 560, 2);
  line(ctx, ox + 140, oy + 356, ox + 140, oy + 420, 2, '#96683f');
  line(ctx, ox + 380, oy + 356, ox + 380, oy + 420, 2, '#96683f');

  // Window with night sky, moon and stars.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(ox + 24, oy + 24, 152, 156);
  ctx.fillStyle = '#1d2b4d';
  ctx.fillRect(ox + 32, oy + 32, 136, 140);
  dot(ctx, ox + 100, oy + 66, 22, '#f5e9c8');
  dot(ctx, ox + 92, oy + 60, 18, '#1d2b4d');
  dot(ctx, ox + 56, oy + 52, 2, '#ffffff');
  dot(ctx, ox + 148, oy + 92, 2, '#ffffff');
  dot(ctx, ox + 66, oy + 130, 2, '#ffffff');
  dot(ctx, ox + 120, oy + 148, 2, '#ffffff');
  if (altered.has('extra-star')) star4(ctx, ox + 146, oy + 52, 9, '#ffe9a0');
  // Window cross bars.
  line(ctx, ox + 100, oy + 32, ox + 100, oy + 172, 5, '#6b4a2f');
  line(ctx, ox + 32, oy + 102, ox + 168, oy + 102, 5, '#6b4a2f');
  // Curtain on the left side of the window.
  ctx.fillStyle = '#b0503c';
  ctx.fillRect(ox + 18, oy + 20, 26, 164);
  ctx.fillStyle = '#9a4232';
  line(ctx, ox + 30, oy + 24, ox + 30, oy + 180, 3, '#9a4232');

  // Wall clock.
  dot(ctx, ox + 272, oy + 82, 44, '#6b4a2f');
  dot(ctx, ox + 272, oy + 82, 37, '#fbf3da');
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    dot(ctx, ox + 272 + Math.sin(a) * 30, oy + 82 - Math.cos(a) * 30, 2, '#6b4a2f');
  }
  if (altered.has('clock-hands')) {
    line(ctx, ox + 272, oy + 82, ox + 286, oy + 96, 4, '#33302a');
    line(ctx, ox + 272, oy + 82, ox + 272, oy + 108, 3, '#33302a');
  } else {
    line(ctx, ox + 272, oy + 82, ox + 294, oy + 82, 4, '#33302a');
    line(ctx, ox + 272, oy + 82, ox + 272, oy + 56, 3, '#33302a');
  }
  dot(ctx, ox + 272, oy + 82, 4, '#c65a4a');

  // Bookshelf with two shelves of books.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(ox + 384, oy + 36, 156, 196);
  ctx.fillStyle = '#e8d3a8';
  ctx.fillRect(ox + 392, oy + 44, 140, 82);
  ctx.fillRect(ox + 392, oy + 140, 140, 82);
  const shelfBooks = [
    [398, 78, 14, 48, '#c65a4a'], [414, 84, 12, 42, '#4a7fd9'], [428, 74, 16, 52, '#5a9e6a'],
    [446, 82, 12, 44, '#d9a441'], [460, 76, 14, 50, '#7a5ad9'], [476, 84, 12, 42, '#c65a4a'],
    [490, 78, 14, 48, '#4a7fd9'], [506, 84, 12, 42, '#5a9e6a'], [520, 80, 12, 46, '#d9a441'],
  ];
  for (const [x, y, w, h, c] of shelfBooks) {
    if (altered.has('missing-book') && c === '#c65a4a' && x === 398) continue;
    ctx.fillStyle = c;
    ctx.fillRect(ox + x, oy + y, w, h);
  }
  const shelfBooks2 = [
    [398, 178, 14, 44, '#7a5ad9'], [414, 184, 12, 38, '#d9a441'], [428, 176, 16, 46, '#c65a4a'],
    [446, 182, 12, 40, '#4a7fd9'], [460, 178, 14, 44, '#5a9e6a'], [476, 184, 12, 38, '#c65a4a'],
    [490, 178, 14, 44, '#d9a441'], [506, 182, 12, 40, '#4a7fd9'],
  ];
  for (const [x, y, w, h, c] of shelfBooks2) {
    ctx.fillStyle = c;
    ctx.fillRect(ox + x, oy + y, w, h);
  }

  // Rug with stripes, and the cat asleep on it.
  el(ctx, ox + 300, oy + 336, 120, 30);
  ctx.fillStyle = '#c65a4a';
  ctx.fill();
  el(ctx, ox + 300, oy + 336, 96, 22);
  ctx.fillStyle = altered.has('rug-stripe') ? '#5a9e6a' : '#e8d3a8';
  ctx.fill();
  el(ctx, ox + 300, oy + 336, 70, 15);
  ctx.fillStyle = '#c65a4a';
  ctx.fill();
  // Cat: curled body, head, ears, tail.
  el(ctx, ox + 296, oy + 330, 52, 20);
  ctx.fillStyle = '#d98e4a';
  ctx.fill();
  dot(ctx, ox + 340, oy + 322, 17, '#d98e4a');
  ctx.fillStyle = '#d98e4a';
  ctx.beginPath();
  ctx.moveTo(ox + 330, oy + 310);
  ctx.lineTo(ox + 336, oy + 296);
  ctx.lineTo(ox + 342, oy + 310);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox + 344, oy + 308);
  ctx.lineTo(ox + 352, oy + 296);
  ctx.lineTo(ox + 356, oy + 310);
  ctx.closePath();
  ctx.fill();
  if (altered.has('cat-tail')) {
    line(ctx, ox + 250, oy + 330, ox + 244, oy + 300, 7, '#d98e4a');
    line(ctx, ox + 244, oy + 300, ox + 256, oy + 292, 7, '#d98e4a');
  } else {
    line(ctx, ox + 250, oy + 336, ox + 232, oy + 342, 7, '#d98e4a');
  }
  dot(ctx, ox + 346, oy + 320, 2, '#33302a');

  // Small table with a teapot.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(ox + 56, oy + 306, 96, 10);
  ctx.fillRect(ox + 98, oy + 316, 10, 40);
  el(ctx, ox + 104, oy + 284, 30, 24);
  ctx.fillStyle = '#4a7fd9';
  ctx.fill();
  line(ctx, ox + 76, oy + 282, ox + 62, oy + 268, 6, '#4a7fd9');
  ctx.fillStyle = altered.has('teapot-knob') ? '#4a7fd9' : '#d9a441';
  ctx.beginPath();
  ctx.arc(ox + 104, oy + 256, 7, 0, Math.PI * 2);
  ctx.fill();

  // Hanging lantern.
  line(ctx, ox + 496, oy + 210, ox + 496, oy + 236, 3, '#6b4a2f');
  ctx.fillStyle = '#3a2c18';
  rr(ctx, ox + 478, oy + 236, 36, 52, 6);
  ctx.fill();
  ctx.fillStyle = '#fbf3da';
  rr(ctx, ox + 484, oy + 244, 24, 36, 4);
  ctx.fill();
  el(ctx, ox + 496, oy + 264, 8, 13);
  ctx.fillStyle = altered.has('lantern-flame') ? '#5aa8ff' : '#ffcf4d';
  ctx.fill();

  // Potted plant.
  ctx.fillStyle = '#b0503c';
  ctx.beginPath();
  ctx.moveTo(ox + 486, oy + 372);
  ctx.lineTo(ox + 526, oy + 372);
  ctx.lineTo(ox + 520, oy + 402);
  ctx.lineTo(ox + 492, oy + 402);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3f7a34';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(ox + 506, oy + 372);
  ctx.quadraticCurveTo(ox + 492, oy + 340, ox + 486, oy + 322);
  ctx.moveTo(ox + 506, oy + 372);
  ctx.quadraticCurveTo(ox + 520, oy + 340, ox + 528, oy + 324);
  ctx.moveTo(ox + 506, oy + 372);
  ctx.quadraticCurveTo(ox + 506, oy + 336, ox + 506, oy + 318);
  ctx.stroke();
  if (altered.has('plant-flower')) {
    dot(ctx, ox + 506, oy + 312, 8, '#e87aa8');
    dot(ctx, ox + 506, oy + 312, 3, '#ffd94d');
  }
}

const ATTIC_DIFFS = [
  { id: 'clock-hands', x: 272, y: 82, r: 30, name: 'clock hands moved' },
  { id: 'extra-star', x: 146, y: 52, r: 24, name: 'an extra star' },
  { id: 'missing-book', x: 405, y: 100, r: 26, name: 'a red book gone' },
  { id: 'cat-tail', x: 248, y: 312, r: 26, name: "the cat's tail up" },
  { id: 'teapot-knob', x: 104, y: 256, r: 22, name: 'teapot knob blue' },
  { id: 'lantern-flame', x: 496, y: 264, r: 24, name: 'lantern flame blue' },
  { id: 'plant-flower', x: 506, y: 312, r: 22, name: 'a flower bloomed' },
  { id: 'rug-stripe', x: 300, y: 336, r: 30, name: 'rug stripe green' },
];

// ---------------------------------------------------------------------------
// Level 2 — The Garden Shed. Day, a window with the sun, a pegboard of tools,
// a shelf of pots, a watering can, a birdhouse, boots and a wheelbarrow.
// ---------------------------------------------------------------------------
function drawShed(ctx, ox, oy, altered) {
  const g = ctx.createLinearGradient(0, oy, 0, oy + 420);
  g.addColorStop(0, '#d5e6ba');
  g.addColorStop(1, '#b5d19a');
  ctx.fillStyle = g;
  ctx.fillRect(ox, oy, 560, 420);
  ctx.fillStyle = '#9a9a92';
  ctx.fillRect(ox, oy + 356, 560, 64);
  ctx.fillStyle = '#8a8a82';
  for (let i = 0; i < 4; i += 1) ctx.fillRect(ox, oy + 356 + i * 16, 560, 2);

  // Window with sun (and, in the altered panel, a cloud over it).
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(ox + 24, oy + 24, 152, 140);
  ctx.fillStyle = '#9fd0e8';
  ctx.fillRect(ox + 32, oy + 32, 136, 124);
  dot(ctx, ox + 100, oy + 80, 26, '#ffd94d');
  dot(ctx, ox + 100, oy + 80, 20, '#ffe98a');
  if (altered.has('sun-cloud')) {
    el(ctx, ox + 92, oy + 78, 30, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    el(ctx, ox + 116, oy + 84, 24, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
  line(ctx, ox + 100, oy + 32, ox + 100, oy + 156, 5, '#6b4a2f');
  line(ctx, ox + 32, oy + 94, ox + 168, oy + 94, 5, '#6b4a2f');
  // Grass at the window's foot.
  ctx.fillStyle = '#5a9e4a';
  ctx.fillRect(ox + 32, oy + 136, 136, 20);

  // Pegboard with tools.
  ctx.fillStyle = '#a97c50';
  ctx.fillRect(ox + 196, oy + 28, 168, 152);
  ctx.fillStyle = '#8a6238';
  for (let y = 48; y < 170; y += 22) {
    for (let x = 212; x < 350; x += 22) dot(ctx, ox + x, oy + y, 2, '#8a6238');
  }
  // Saw.
  ctx.fillStyle = '#c8c8c8';
  ctx.beginPath();
  ctx.moveTo(ox + 300, oy + 60);
  ctx.lineTo(ox + 348, oy + 60);
  ctx.lineTo(ox + 348, oy + 78);
  ctx.lineTo(ox + 300, oy + 78);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(ox + 288, oy + 58, 14, 22);
  // Spanner.
  line(ctx, ox + 230, oy + 130, ox + 260, oy + 100, 8, '#c8c8c8');
  dot(ctx, ox + 262, oy + 98, 8, '#c8c8c8');
  // Hammer (gone in the altered panel).
  if (!altered.has('missing-hammer')) {
    line(ctx, ox + 222, oy + 60, ox + 222, oy + 118, 7, '#7a5230');
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(ox + 206, oy + 48, 32, 16);
  }

  // Shelf with three pots and a jar.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(ox + 384, oy + 150, 156, 12);
  ctx.fillRect(ox + 392, oy + 162, 8, 26);
  ctx.fillRect(ox + 524, oy + 162, 8, 26);
  const pots = [
    { x: 398, c: '#c96a3f' },
    { x: 438, c: altered.has('pot-colour') ? '#4a7fd9' : '#c96a3f' },
    { x: 478, c: '#5a9e6a' },
  ];
  for (const p of pots) {
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.moveTo(ox + p.x, oy + 108);
    ctx.lineTo(ox + p.x + 32, oy + 108);
    ctx.lineTo(ox + p.x + 28, oy + 150);
    ctx.lineTo(ox + p.x + 4, oy + 150);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3f7a34';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox + p.x + 16, oy + 108);
    ctx.quadraticCurveTo(ox + p.x + 8, oy + 88, ox + p.x + 6, oy + 76);
    ctx.moveTo(ox + p.x + 16, oy + 108);
    ctx.quadraticCurveTo(ox + p.x + 24, oy + 88, ox + p.x + 28, oy + 78);
    ctx.stroke();
  }
  // Jar with a label.
  ctx.fillStyle = '#e8f0e0';
  rr(ctx, ox + 514, oy + 112, 22, 38, 5);
  ctx.fill();
  ctx.fillStyle = altered.has('jar-label') ? '#5a9e6a' : '#c65a4a';
  ctx.fillRect(ox + 516, oy + 124, 18, 14);

  // Watering can.
  ctx.fillStyle = '#3f7a34';
  el(ctx, ox + 104, oy + 296, 34, 26);
  ctx.fill();
  line(ctx, ox + 134, oy + 288, ox + 158, oy + 268, 8, '#3f7a34');
  ctx.fillStyle = '#c8c8c8';
  ctx.beginPath();
  ctx.moveTo(ox + 156, oy + 262);
  ctx.lineTo(ox + 168, oy + 270);
  ctx.lineTo(ox + 160, oy + 280);
  ctx.lineTo(ox + 150, oy + 272);
  ctx.closePath();
  ctx.fill();
  if (altered.has('water-drops')) {
    dot(ctx, ox + 164, oy + 292, 4, '#5aa8ff');
    dot(ctx, ox + 158, oy + 312, 4, '#5aa8ff');
    dot(ctx, ox + 168, oy + 330, 4, '#5aa8ff');
  }

  // Birdhouse on a post.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(ox + 456, oy + 300, 10, 56);
  ctx.fillStyle = '#c96a3f';
  ctx.fillRect(ox + 434, oy + 252, 54, 50);
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath();
  ctx.moveTo(ox + 428, oy + 254);
  ctx.lineTo(ox + 461, oy + 228);
  ctx.lineTo(ox + 494, oy + 254);
  ctx.closePath();
  ctx.fill();
  dot(ctx, ox + 461, oy + 278, 7, '#3a2c18');
  if (altered.has('bird')) {
    el(ctx, ox + 461, oy + 222, 12, 9);
    ctx.fillStyle = '#4a7fd9';
    ctx.fill();
    dot(ctx, ox + 472, oy + 218, 5, '#4a7fd9');
    line(ctx, ox + 476, oy + 218, ox + 482, oy + 220, 2, '#d9a441');
  }

  // Boots by the door.
  ctx.fillStyle = '#5a4632';
  rr(ctx, ox + 196, oy + 340, 30, 58, 8);
  ctx.fill();
  rr(ctx, ox + 196, oy + 372, 46, 26, 8);
  ctx.fill();
  if (!altered.has('one-boot')) {
    ctx.fillStyle = '#6b4a2f';
    rr(ctx, ox + 236, oy + 340, 30, 58, 8);
    ctx.fill();
    rr(ctx, ox + 236, oy + 372, 46, 26, 8);
    ctx.fill();
  }

  // Wheelbarrow with a sunflower in the altered panel.
  ctx.fillStyle = '#8a8a82';
  dot(ctx, ox + 360, oy + 372, 16, '#3a2c18');
  dot(ctx, ox + 360, oy + 372, 6, '#c8c8c8');
  ctx.fillStyle = '#c65a4a';
  ctx.beginPath();
  ctx.moveTo(ox + 316, oy + 330);
  ctx.lineTo(ox + 452, oy + 330);
  ctx.lineTo(ox + 430, oy + 372);
  ctx.lineTo(ox + 338, oy + 372);
  ctx.closePath();
  ctx.fill();
  line(ctx, ox + 452, oy + 336, ox + 486, oy + 312, 6, '#7a5230');
  line(ctx, ox + 316, oy + 336, ox + 292, oy + 318, 6, '#7a5230');
  if (altered.has('sunflower')) {
    line(ctx, ox + 380, oy + 330, ox + 380, oy + 292, 4, '#3f7a34');
    dot(ctx, ox + 380, oy + 282, 13, '#d9a441');
    dot(ctx, ox + 380, oy + 282, 6, '#6b4a2f');
  }
}

const SHED_DIFFS = [
  { id: 'sun-cloud', x: 100, y: 80, r: 28, name: 'a cloud over the sun' },
  { id: 'missing-hammer', x: 222, y: 82, r: 26, name: 'the hammer gone' },
  { id: 'pot-colour', x: 454, y: 128, r: 24, name: 'a blue pot' },
  { id: 'water-drops', x: 162, y: 310, r: 24, name: 'water drops falling' },
  { id: 'bird', x: 461, y: 220, r: 22, name: 'a bird on the roof' },
  { id: 'one-boot', x: 252, y: 368, r: 26, name: 'one boot missing' },
  { id: 'sunflower', x: 380, y: 282, r: 24, name: 'a sunflower' },
  { id: 'jar-label', x: 525, y: 131, r: 20, name: 'jar label green' },
];

// ---------------------------------------------------------------------------
// Level 3 — The Harbour Café. A big window on the sea and a lighthouse, a
// chalk menu, a hanging lamp, a counter with a coffee cup, a cat and a jar.
// ---------------------------------------------------------------------------
function drawCafe(ctx, ox, oy, altered) {
  const g = ctx.createLinearGradient(0, oy, 0, oy + 420);
  g.addColorStop(0, '#f6ddc0');
  g.addColorStop(1, '#ecc79b');
  ctx.fillStyle = g;
  ctx.fillRect(ox, oy, 560, 420);
  // Checkered floor.
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 14; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#e8d3a8' : '#b98d5f';
      ctx.fillRect(ox + col * 40, oy + 356 + row * 32, 40, 32);
    }
  }

  // Big window: sky, sea, a lighthouse on rocks, and a little boat.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(ox + 24, oy + 24, 176, 176);
  ctx.fillStyle = '#a8d4ea';
  ctx.fillRect(ox + 32, oy + 32, 160, 160);
  ctx.fillStyle = '#5a9ec4';
  ctx.fillRect(ox + 32, oy + 122, 160, 70);
  // Lighthouse.
  ctx.fillStyle = '#e8e0d0';
  ctx.beginPath();
  ctx.moveTo(ox + 76, oy + 122);
  ctx.lineTo(ox + 82, oy + 62);
  ctx.lineTo(ox + 94, oy + 62);
  ctx.lineTo(ox + 100, oy + 122);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c65a4a';
  ctx.fillRect(ox + 80, oy + 86, 16, 10);
  ctx.fillRect(ox + 78, oy + 108, 20, 8);
  dot(ctx, ox + 88, oy + 56, 7, '#ffd94d');
  ctx.fillStyle = '#7a7a7a';
  el(ctx, ox + 88, oy + 122, 26, 8);
  ctx.fill();
  if (altered.has('lighthouse-beam')) {
    ctx.fillStyle = 'rgba(255, 233, 160, 0.55)';
    ctx.beginPath();
    ctx.moveTo(ox + 88, oy + 56);
    ctx.lineTo(ox + 186, oy + 40);
    ctx.lineTo(ox + 186, oy + 76);
    ctx.closePath();
    ctx.fill();
  }
  // Little boat with a sail.
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath();
  ctx.moveTo(ox + 130, oy + 158);
  ctx.lineTo(ox + 168, oy + 158);
  ctx.lineTo(ox + 160, oy + 170);
  ctx.lineTo(ox + 138, oy + 170);
  ctx.closePath();
  ctx.fill();
  line(ctx, ox + 149, oy + 158, ox + 149, oy + 128, 3, '#6b4a2f');
  ctx.fillStyle = altered.has('sail-colour') ? '#c65a4a' : '#ffffff';
  ctx.beginPath();
  ctx.moveTo(ox + 149, oy + 128);
  ctx.lineTo(ox + 149, oy + 156);
  ctx.lineTo(ox + 168, oy + 156);
  ctx.closePath();
  ctx.fill();
  line(ctx, ox + 100, oy + 32, ox + 100, oy + 192, 5, '#6b4a2f');
  line(ctx, ox + 32, oy + 112, ox + 192, oy + 112, 5, '#6b4a2f');

  // Chalk menu board.
  ctx.fillStyle = '#3a2c18';
  rr(ctx, ox + 236, oy + 36, 164, 124, 8);
  ctx.fill();
  text(ctx, 'MENU', ox + 318, oy + 64, 20, '#f5e9c8', 'center', true);
  text(ctx, 'COFFEE', ox + 250, oy + 94, 16, '#f5e9c8');
  text(ctx, altered.has('menu-price') ? '5' : '3', ox + 384, oy + 94, 16, '#ffd94d', 'right', true);
  text(ctx, 'TEA', ox + 250, oy + 120, 16, '#f5e9c8');
  text(ctx, '2', ox + 384, oy + 120, 16, '#ffd94d', 'right', true);
  text(ctx, 'CAKE', ox + 250, oy + 146, 16, '#f5e9c8');
  text(ctx, '4', ox + 384, oy + 146, 16, '#ffd94d', 'right', true);

  // Framed picture: a ship, or a lighthouse in the altered panel.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(ox + 236, oy + 176, 96, 84);
  ctx.fillStyle = '#a8d4ea';
  ctx.fillRect(ox + 242, oy + 182, 84, 72);
  if (altered.has('picture')) {
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.moveTo(ox + 276, oy + 254);
    ctx.lineTo(ox + 280, oy + 206);
    ctx.lineTo(ox + 288, oy + 206);
    ctx.lineTo(ox + 292, oy + 254);
    ctx.closePath();
    ctx.fill();
    dot(ctx, ox + 284, oy + 200, 5, '#ffd94d');
  } else {
    ctx.fillStyle = '#6b4a2f';
    ctx.beginPath();
    ctx.moveTo(ox + 252, oy + 236);
    ctx.lineTo(ox + 316, oy + 236);
    ctx.lineTo(ox + 308, oy + 248);
    ctx.lineTo(ox + 260, oy + 248);
    ctx.closePath();
    ctx.fill();
    line(ctx, ox + 284, oy + 236, ox + 284, oy + 206, 3, '#6b4a2f');
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(ox + 284, oy + 206);
    ctx.lineTo(ox + 284, oy + 234);
    ctx.lineTo(ox + 304, oy + 234);
    ctx.closePath();
    ctx.fill();
  }

  // Hanging lamp.
  line(ctx, ox + 466, oy + 24, ox + 466, oy + 66, 3, '#6b4a2f');
  ctx.fillStyle = altered.has('lamp-colour') ? '#5a9e6a' : '#c65a4a';
  ctx.beginPath();
  ctx.moveTo(ox + 442, oy + 96);
  ctx.lineTo(ox + 490, oy + 96);
  ctx.lineTo(ox + 478, oy + 66);
  ctx.lineTo(ox + 454, oy + 66);
  ctx.closePath();
  ctx.fill();
  el(ctx, ox + 466, oy + 102, 12, 7);
  ctx.fillStyle = '#ffd94d';
  ctx.fill();

  // Counter.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(ox, oy + 296, 560, 18);
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(ox, oy + 314, 560, 42);
  // Coffee cup with steam in the altered panel.
  ctx.fillStyle = '#fbf3da';
  rr(ctx, ox + 88, oy + 258, 44, 38, 6);
  ctx.fill();
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath();
  ctx.arc(ox + 134, oy + 276, 10, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(ox + 134, oy + 276, 10, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  if (altered.has('cup-steam')) {
    ctx.strokeStyle = 'rgba(120, 120, 120, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ox + 100, oy + 252);
    ctx.quadraticCurveTo(ox + 94, oy + 238, ox + 100, oy + 226);
    ctx.moveTo(ox + 114, oy + 252);
    ctx.quadraticCurveTo(ox + 120, oy + 238, ox + 114, oy + 224);
    ctx.stroke();
  }
  // Cat sitting on the counter (gone in the altered panel).
  if (!altered.has('cat')) {
    el(ctx, ox + 340, oy + 276, 26, 20);
    ctx.fillStyle = '#8a8a8a';
    ctx.fill();
    dot(ctx, ox + 358, oy + 258, 13, '#8a8a8a');
    ctx.fillStyle = '#8a8a8a';
    ctx.beginPath();
    ctx.moveTo(ox + 350, oy + 250);
    ctx.lineTo(ox + 354, oy + 238);
    ctx.lineTo(ox + 360, oy + 250);
    ctx.closePath();
    ctx.fill();
    line(ctx, ox + 318, oy + 272, ox + 312, oy + 250, 5, '#8a8a8a');
    dot(ctx, ox + 362, oy + 256, 2, '#33302a');
  }
  // Cookie jar: full, or half-full in the altered panel.
  ctx.fillStyle = 'rgba(232, 240, 224, 0.9)';
  rr(ctx, ox + 436, oy + 238, 56, 58, 8);
  ctx.fill();
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(ox + 442, oy + 232, 44, 10);
  const cookies = altered.has('cookie-jar') ? 2 : 5;
  for (let i = 0; i < cookies; i += 1) {
    dot(ctx, ox + 448 + (i % 3) * 16, oy + 262 + Math.floor(i / 3) * 18, 7, '#c98a4b');
    dot(ctx, ox + 448 + (i % 3) * 16, oy + 262 + Math.floor(i / 3) * 18, 2, '#6b4a2f');
  }
}

const CAFE_DIFFS = [
  { id: 'lighthouse-beam', x: 140, y: 56, r: 28, name: 'the lighthouse beam on' },
  { id: 'menu-price', x: 380, y: 90, r: 22, name: 'coffee costs 5 now' },
  { id: 'lamp-colour', x: 466, y: 84, r: 24, name: 'the lamp is green' },
  { id: 'cup-steam', x: 106, y: 238, r: 24, name: 'steam over the cup' },
  { id: 'cat', x: 340, y: 268, r: 28, name: 'the cat is gone' },
  { id: 'cookie-jar', x: 464, y: 268, r: 26, name: 'half the cookies gone' },
  { id: 'picture', x: 284, y: 220, r: 28, name: 'a lighthouse in the picture' },
  { id: 'sail-colour', x: 156, y: 142, r: 24, name: 'a red sail' },
];

export const SCENES = {
  attic: { title: "The Clockmaker's Attic", draw: drawAttic, differences: ATTIC_DIFFS },
  shed: { title: 'The Garden Shed', draw: drawShed, differences: SHED_DIFFS },
  cafe: { title: 'The Harbour Café', draw: drawCafe, differences: CAFE_DIFFS },
};
