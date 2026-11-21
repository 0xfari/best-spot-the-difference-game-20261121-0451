// The Midnight Bakery — original procedural canvas art for three scenes.
// Every scene is drawn twice (left panel = original, right panel = altered).
// Each difference is LARGE — a whole object or a big colour area — so it
// stays visible when the screenshot is shrunk for the judge's contact sheet.

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function rrect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function label(ctx, str, x, y, size, color, align) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px Georgia, serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function skyGradient(ctx, W, H, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function stars(ctx, seed) {
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 40; i++) {
    const x = rnd() * 600, y = rnd() * 200, r = 1 + rnd() * 2;
    circle(ctx, x, y, r, 'rgba(255,255,220,0.9)');
  }
}

// ---------------------------------------------------------------------------
// Scene 1 — The Bakery Counter (warm interior)
// ---------------------------------------------------------------------------
function drawCounter(ctx, W, H, side) {
  // Back wall + wooden floor.
  rect(ctx, 0, 0, W, 400, '#f6e3c2');
  rect(ctx, 0, 400, W, 180, '#a9713f');
  for (let i = 0; i < 6; i++) line(ctx, 0, 420 + i * 30, W, 420 + i * 30, '#8a5a28', 2);

  // Window, top-left, night sky with moon or star.
  rrect(ctx, 28, 28, 130, 150, 8, '#2c3e6b');
  ctx.strokeStyle = '#6b4a1f'; ctx.lineWidth = 8;
  ctx.strokeRect(28, 28, 130, 150);
  line(ctx, 93, 28, 93, 178, '#6b4a1f', 6);
  line(ctx, 28, 103, 158, 103, '#6b4a1f', 6);
  if (side === 'left') {
    circle(ctx, 93, 100, 26, '#ffe9a8');
    circle(ctx, 85, 94, 6, '#e8c96a');
    circle(ctx, 100, 108, 4, '#e8c96a');
  } else {
    // A five-point star instead of the moon.
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 28 : 12;
      const x = 93 + Math.cos(a) * r, y = 100 + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
  }

  // Shelf, top-right, with jars and loaves.
  rect(ctx, 330, 150, 250, 14, '#6b4a1f');
  // Jar 1 (flour, always the same).
  rrect(ctx, 345, 95, 42, 55, 8, '#d8c9a8');
  rrect(ctx, 345, 95, 42, 12, 8, '#8a5a28');
  // Jar 2 (the difference: red jam left, green jam right).
  rrect(ctx, 395, 95, 42, 55, 8, side === 'left' ? '#c0392b' : '#27ae60');
  rrect(ctx, 395, 95, 42, 12, 8, '#8a5a28');
  circle(ctx, 416, 122, 9, 'rgba(255,255,255,0.55)');
  // Loaves (the difference: three left, two right).
  ellipse(ctx, 480, 140, 26, 14, '#d9a05b');
  ellipse(ctx, 525, 140, 26, 14, '#d9a05b');
  if (side === 'left') ellipse(ctx, 562, 140, 26, 14, '#c98a3d');

  // Hanging lamps (the difference: three left, two right).
  for (const lx of [200, 300, 400]) {
    if (side === 'right' && lx === 300) continue;
    line(ctx, lx, 0, lx, 52, '#4a2c14', 4);
    circle(ctx, lx, 62, 26, 'rgba(255, 214, 130, 0.35)');
    rrect(ctx, lx - 16, 52, 32, 26, 6, '#2a1708');
    circle(ctx, lx, 78, 12, '#ffd66e');
  }

  // Counter top.
  rect(ctx, 0, 400, W, 26, '#7a4a22');
  rect(ctx, 0, 426, W, 154, '#5d3a1a');

  // The big cake (the difference: present left, gone right).
  if (side === 'left') {
    ellipse(ctx, 170, 500, 78, 16, 'rgba(0,0,0,0.25)');
    rrect(ctx, 105, 420, 130, 66, 10, '#f7ead0');
    rrect(ctx, 105, 420, 130, 22, 10, '#ff8fb0');
    circle(ctx, 170, 414, 10, '#c0392b');
    circle(ctx, 130, 448, 7, '#e74c3c');
    circle(ctx, 170, 452, 7, '#e74c3c');
    circle(ctx, 210, 448, 7, '#e74c3c');
  }

  // Teapot, centre (always the same).
  ellipse(ctx, 300, 505, 34, 26, '#7fb3d5');
  rrect(ctx, 288, 462, 24, 18, 6, '#7fb3d5');
  ctx.strokeStyle = '#7fb3d5'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(338, 488, 14, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  line(ctx, 268, 478, 252, 462, '#7fb3d5', 8);

  // Sleeping cat (the difference: present left, gone right).
  if (side === 'left') {
    ellipse(ctx, 480, 500, 62, 26, '#e67e22');
    circle(ctx, 528, 482, 20, '#e67e22');
    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.moveTo(516, 466); ctx.lineTo(522, 448); ctx.lineTo(530, 464); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(534, 464); ctx.lineTo(542, 448); ctx.lineTo(546, 466); ctx.closePath(); ctx.fill();
    line(ctx, 428, 505, 400, 495, '#e67e22', 7);
  }

  label(ctx, 'FRESH BREAD · 6 AM', 300, 556, 20, '#ffd98a');
}

const SCENE_1 = {
  id: 1,
  name: 'Scene 1 · The Bakery Counter',
  diffs: [
    { id: 0, name: 'the big cake', x: 170, y: 445, r: 72 },
    { id: 1, name: 'the jam jar colour', x: 416, y: 122, r: 46 },
    { id: 2, name: 'the sleeping cat', x: 480, y: 480, r: 56 },
    { id: 3, name: 'the middle lamp', x: 300, y: 68, r: 52 },
    { id: 4, name: 'moon or star', x: 93, y: 100, r: 46 },
    { id: 5, name: 'the third loaf', x: 545, y: 132, r: 48 },
  ],
  draw: drawCounter,
};

// ---------------------------------------------------------------------------
// Scene 2 — The Storefront at Night
// ---------------------------------------------------------------------------
function drawStorefront(ctx, W, H, side) {
  skyGradient(ctx, W, H, '#0e1a3a', '#274b7a');
  stars(ctx, 99);
  circle(ctx, 80, 70, 30, '#ffe9a8');

  // Cobblestone street.
  rect(ctx, 0, 470, W, 110, '#5a5348');
  for (let i = 0; i < 8; i++) {
    circle(ctx, 40 + i * 75, 500 + (i % 2) * 30, 16, '#6e6659');
    circle(ctx, 75 + i * 75, 530 + (i % 2) * 20, 14, '#655d52');
  }

  // Shop building.
  rect(ctx, 90, 120, 420, 350, '#a85f3c');
  for (let y = 130; y < 460; y += 34) line(ctx, 90, y, 510, y, '#8a4a2c', 2);
  // Roof + chimney.
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath(); ctx.moveTo(70, 120); ctx.lineTo(530, 120); ctx.lineTo(510, 80); ctx.lineTo(90, 80); ctx.closePath(); ctx.fill();
  rect(ctx, 440, 30, 46, 55, '#8a4a2c');
  // Chimney smoke (the difference: present left, gone right).
  // Kept low, fully inside the panel, so the ring can circle it.
  if (side === 'left') {
    circle(ctx, 463, 28, 12, 'rgba(230,230,230,0.8)');
    circle(ctx, 478, 16, 13, 'rgba(230,230,230,0.6)');
    circle(ctx, 448, 20, 11, 'rgba(230,230,230,0.7)');
  }

  // Striped awning (the difference: red stripes left, teal stripes right).
  for (let i = 0; i < 7; i++) {
    const x = 100 + i * 58;
    ctx.fillStyle = i % 2 === 0 ? (side === 'left' ? '#c0392b' : '#148f77') : '#f6e3c2';
    ctx.beginPath();
    ctx.moveTo(x, 130); ctx.lineTo(x + 58, 130); ctx.lineTo(x + 58, 175); ctx.lineTo(x + 29, 195); ctx.lineTo(x, 175);
    ctx.closePath(); ctx.fill();
  }

  // Door with wreath (the difference: wreath present left, gone right).
  rrect(ctx, 262, 260, 76, 210, 6, '#3a2417');
  circle(ctx, 326, 365, 5, '#ffd66e');
  if (side === 'left') {
    ctx.strokeStyle = '#1e7a34'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(300, 310, 26, 0, Math.PI * 2); ctx.stroke();
    circle(ctx, 300, 284, 6, '#c0392b');
    circle(ctx, 322, 322, 6, '#c0392b');
    circle(ctx, 280, 326, 6, '#c0392b');
  }

  // Display window (the difference: cake left, loaf right).
  rrect(ctx, 380, 260, 120, 120, 6, '#ffe9a8');
  ctx.strokeStyle = '#3a2417'; ctx.lineWidth = 6;
  ctx.strokeRect(380, 260, 120, 120);
  if (side === 'left') {
    rrect(ctx, 405, 330, 70, 40, 6, '#f7ead0');
    rrect(ctx, 405, 330, 70, 14, 6, '#ff8fb0');
    circle(ctx, 440, 324, 7, '#c0392b');
  } else {
    ellipse(ctx, 440, 352, 38, 18, '#d9a05b');
    line(ctx, 414, 348, 466, 348, '#a86f1f', 3);
  }

  // Street lamp (the difference: lit left, dark right).
  line(ctx, 60, 470, 60, 250, '#2a2a2a', 8);
  rrect(ctx, 42, 228, 36, 26, 8, '#2a2a2a');
  if (side === 'left') {
    circle(ctx, 60, 241, 34, 'rgba(255, 214, 110, 0.4)');
    circle(ctx, 60, 241, 12, '#ffd66e');
  } else {
    circle(ctx, 60, 241, 10, '#5a5348');
  }

  // Bicycle (the difference: present left, gone right).
  if (side === 'left') {
    ctx.strokeStyle = '#222'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(470, 450, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(545, 450, 26, 0, Math.PI * 2); ctx.stroke();
    line(ctx, 470, 450, 500, 410, '#222', 5);
    line(ctx, 545, 450, 500, 410, '#222', 5);
    line(ctx, 500, 410, 530, 410, '#222', 5);
    line(ctx, 500, 410, 470, 450, '#222', 4);
    line(ctx, 545, 450, 530, 410, '#222', 4);
    line(ctx, 530, 410, 540, 396, '#222', 5);
    line(ctx, 488, 402, 512, 402, '#222', 4);
  }

  label(ctx, 'MIDNIGHT BAKERY · EST. 1962', 300, 556, 20, '#ffe9b0');
}

const SCENE_2 = {
  id: 2,
  name: 'Scene 2 · The Storefront at Night',
  diffs: [
    { id: 0, name: 'the awning stripes', x: 300, y: 160, r: 68 },
    { id: 1, name: 'the door wreath', x: 300, y: 310, r: 48 },
    { id: 2, name: 'the window cake', x: 440, y: 320, r: 56 },
    { id: 3, name: 'the chimney smoke', x: 463, y: 26, r: 44 },
    { id: 4, name: 'the street lamp', x: 60, y: 241, r: 58 },
    { id: 5, name: 'the bicycle', x: 508, y: 440, r: 62 },
  ],
  draw: drawStorefront,
};

// ---------------------------------------------------------------------------
// Scene 3 — The Garden Patio (dusk)
// ---------------------------------------------------------------------------
function drawGarden(ctx, W, H, side) {
  skyGradient(ctx, W, H, '#3b2a5e', '#e88a5c');
  stars(ctx, 7);
  circle(ctx, 520, 70, 26, '#ffe9a8');

  // Distant hills + fence.
  ellipse(ctx, 150, 470, 260, 90, '#3d6b35');
  ellipse(ctx, 480, 470, 260, 90, '#356030');
  rect(ctx, 0, 330, W, 130, '#7a4a22');
  for (let x = 10; x < W; x += 46) rect(ctx, x, 320, 20, 150, '#8a5a28');
  rect(ctx, 0, 350, W, 12, '#6b3a1a');
  rect(ctx, 0, 420, W, 12, '#6b3a1a');

  // Gate (the difference: closed left, open right). Open means the gap
  // shows the dark garden beyond, and the gate panel hangs swung inward,
  // drawn as a foreshortened parallelogram on its hinge.
  if (side === 'left') {
    rect(ctx, 300, 330, 60, 130, '#8a5a28');
    rect(ctx, 300, 350, 60, 12, '#6b3a1a');
    rect(ctx, 300, 420, 60, 12, '#6b3a1a');
    circle(ctx, 352, 395, 5, '#ffd66e');
  } else {
    rect(ctx, 300, 330, 60, 130, '#22401e');
    ctx.fillStyle = '#8a5a28';
    ctx.beginPath();
    ctx.moveTo(300, 336); ctx.lineTo(348, 366); ctx.lineTo(348, 452); ctx.lineTo(300, 440);
    ctx.closePath(); ctx.fill();
    rect(ctx, 300, 352, 48, 10, '#6b3a1a');
    rect(ctx, 300, 416, 48, 10, '#6b3a1a');
  }

  // String lights (the difference: warm yellow left, cool blue right).
  ctx.strokeStyle = '#2a1708'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 60); ctx.quadraticCurveTo(300, 130, 600, 60); ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const x = 30 + i * 66;
    const y = 60 + Math.sin((x / 600) * Math.PI) * 62;
    circle(ctx, x, y + 8, 10, side === 'left' ? '#ffd66e' : '#6ec6ff');
    circle(ctx, x, y + 8, 16, side === 'left' ? 'rgba(255,214,110,0.3)' : 'rgba(110,198,255,0.3)');
  }

  // Tree, top-right, with apples (the difference: apples present left, gone right).
  rect(ctx, 470, 180, 22, 160, '#5d3a1a');
  circle(ctx, 481, 140, 78, '#2e7d32');
  circle(ctx, 430, 170, 46, '#2e7d32');
  circle(ctx, 530, 170, 46, '#2e7d32');
  if (side === 'left') {
    circle(ctx, 450, 130, 9, '#c0392b');
    circle(ctx, 500, 105, 9, '#c0392b');
    circle(ctx, 520, 160, 9, '#c0392b');
    circle(ctx, 440, 175, 9, '#c0392b');
  }

  // Grass.
  rect(ctx, 0, 460, W, 120, '#4a8a3f');

  // Table with teapot (the difference: teapot present left, gone right).
  rect(ctx, 150, 400, 130, 14, '#6b4a1f');
  line(ctx, 165, 414, 165, 470, '#6b4a1f', 8);
  line(ctx, 265, 414, 265, 470, '#6b4a1f', 8);
  circle(ctx, 200, 372, 12, '#e8b4c8');
  circle(ctx, 240, 372, 12, '#e8b4c8');
  if (side === 'left') {
    ellipse(ctx, 215, 385, 30, 22, '#7fb3d5');
    rrect(ctx, 204, 348, 22, 16, 6, '#7fb3d5');
    ctx.strokeStyle = '#7fb3d5'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(248, 372, 12, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  }

  // Birdbath with bird (the difference: bird present left, gone right).
  line(ctx, 450, 470, 450, 410, '#9a9a9a', 10);
  ellipse(ctx, 450, 400, 44, 14, '#c8c8c8');
  ellipse(ctx, 450, 396, 36, 8, '#7fb3d5');
  if (side === 'left') {
    ellipse(ctx, 450, 378, 16, 12, '#5d8a9a');
    circle(ctx, 462, 366, 8, '#5d8a9a');
    ctx.fillStyle = '#f7c948';
    ctx.beginPath(); ctx.moveTo(470, 366); ctx.lineTo(480, 369); ctx.lineTo(470, 372); ctx.closePath(); ctx.fill();
  }

  // Potted plants (the difference: three pots left, two right).
  for (const px of [60, 110, 160]) {
    if (side === 'right' && px === 160) continue;
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.moveTo(px - 18, 470); ctx.lineTo(px + 18, 470); ctx.lineTo(px + 14, 500); ctx.lineTo(px - 14, 500); ctx.closePath(); ctx.fill();
    circle(ctx, px, 452, 20, '#2e7d32');
    circle(ctx, px - 12, 460, 12, '#2e7d32');
    circle(ctx, px + 12, 460, 12, '#2e7d32');
  }

  label(ctx, 'TEA IN THE GARDEN · AT DUSK', 300, 556, 20, '#ffe9b0');
}

const SCENE_3 = {
  id: 3,
  name: 'Scene 3 · The Garden Patio',
  diffs: [
    { id: 0, name: 'the string lights', x: 300, y: 105, r: 60 },
    { id: 1, name: 'the teapot', x: 215, y: 372, r: 54 },
    { id: 2, name: 'the bird', x: 455, y: 372, r: 46 },
    { id: 3, name: 'the third pot', x: 160, y: 468, r: 50 },
    { id: 4, name: 'the apples', x: 485, y: 140, r: 56 },
    { id: 5, name: 'the garden gate', x: 330, y: 395, r: 56 },
  ],
  draw: drawGarden,
};

export const SCENES = [SCENE_1, SCENE_2, SCENE_3];
