// ---------- The forest and the treehouse headquarters (logical 1000 x 1000 space) ----------
// Magpie routes to the vault door. Later Nights open more of them.
const ROUTES = {
  lt: [[-40, 295], [70, 320], [400, 402], [350, 328], [488, 328]],
  rt: [[1040, 265], [930, 290], [600, 381], [650, 328], [512, 328]],
  lb: [[-40, 590], [90, 600], [450, 639], [455, 440], [350, 328], [488, 328]],
  rb: [[1040, 690], [910, 660], [550, 621], [545, 420], [650, 328], [512, 328]],
  lad: [[1040, 925], [575, 925], [575, 345], [512, 328]],
  sky: [[300, -40], [440, 150], [385, 205], [350, 328], [488, 328]],
};
for (const k in ROUTES) {
  const p = ROUTES[k]; p.len = 0;
  for (let i = 1; i < p.length; i++) p.len += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
}
// Point at distance d along a route: [x, y, facing]
function routeAt(p, d) {
  for (let i = 1; i < p.length; i++) {
    const [ax, ay] = p[i - 1], [bx, by] = p[i], l = Math.hypot(bx - ax, by - ay);
    if (d <= l || i === p.length - 1) { const k = clamp(d / l, 0, 1); return [lerp(ax, bx, k), lerp(ay, by, k), bx >= ax ? 1 : -1]; }
    d -= l;
  }
}
// Places where things can be mounted. Index is saved with each item; 22 is the vault (shield only).
const MOUNTS = [[150, 338], [270, 368], [390, 398], [850, 310], [730, 343], [610, 376], [170, 607], [310, 622], [430, 635],
  [830, 649], [700, 635], [585, 623], [500, 480], [500, 560], [500, 760], [640, 905], [400, 905], [500, 108], [425, 165], [575, 165],
  [345, 318], [655, 318], [500, 232]];
const VAULT = 22;
const ITEMS = {
  cam: { cost: 30, r: 135, cd: 3 }, lamp: { cost: 15, r: 75 }, bell: { cost: 20, r: 120, cd: 1.5 }, shield: { cost: 45 },
  banner: { cost: 8, deco: 1 }, flowers: { cost: 6, deco: 1 }, scope: { cost: 12, deco: 1 }, lights: { cost: 10, deco: 1 },
};
const JARS = [[445, 262], [555, 262], [368, 304], [385, 380], [615, 380], [435, 380]];
const count = type => S.items.filter(i => i.t === type).length;

// Sky, stars, moon, far hills and the magpies' nest; cached per size, twinkles drawn live.
let skyCache = null;
const hash = i => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
function drawSky(c, t, nest = 0) {
  const w = V.w, h = V.h;
  if (!skyCache || skyCache.w !== w || skyCache.h !== h) {
    const o = document.createElement('canvas'), d = Math.min(window.devicePixelRatio || 1, 2);
    o.width = w * d; o.height = h * d;
    const g = o.getContext('2d'); g.scale(d, d);
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#070d2a'); gr.addColorStop(.6, '#1b2a6b'); gr.addColorStop(1, '#2c3f86');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) circ(g, hash(i) * w, hash(i + 200) * h * .7, .6 + hash(i + 400) * 1.3, `rgba(255,255,255,${.35 + hash(i + 600) * .5})`);
    const mr = Math.min(w, h) * .075, mx = w * .84, my = h * .15;
    glow(g, mx, my, mr * 4, '255,240,200', .35); circ(g, mx, my, mr, '#fff3c9');
    circ(g, mx - mr * .3, my - mr * .2, mr * .18, '#f0dca0'); circ(g, mx + mr * .25, my + mr * .3, mr * .12, '#f0dca0'); circ(g, mx + mr * .2, my - mr * .4, mr * .09, '#f0dca0');
    for (const [col, base, amp, f] of [['#16255c', .8, .05, 3.1], ['#0f1a45', .87, .04, 5.3]]) {
      g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) g.lineTo(x, h * (base + Math.sin(x / w * f * TAU + f) * amp * .5 - Math.abs(Math.sin(x / w * f * 9)) * amp * .4));
      g.lineTo(w, h); g.fillStyle = col; g.fill();
    }
    skyCache = { w, h, o };
  }
  c.drawImage(skyCache.o, 0, 0, w, h);
  for (let i = 0; i < 14; i++) {
    const a = still() ? .6 : .5 + .5 * Math.sin(t * (1 + hash(i) * 2) + i);
    starPath(c, hash(i + 50) * w, hash(i + 90) * h * .6, 2 + a * 3, 1, 4); c.fillStyle = `rgba(255,246,218,${a})`; c.fill();
  }
  // the magpies' nest: stolen jars glow faintly here until Zip brings them home
  const nx = w * .93, ny = h * .78;
  line(c, [nx, h * .9, nx, ny], '#0a1235', 6); ell(c, nx, ny, 22, 9, '#3a2c20');
  for (let i = 0; i < nest; i++) { glow(c, nx - 10 + i * 10, ny - 8, 16, '255,216,107', .5); circ(c, nx - 10 + i * 10, ny - 8, 3, '#ffe9a3'); }
}

// Fit the tree into a screen rectangle. Returns the transform used by drawTree and by pointer maths.
function fitTree(ax, ay, aw, ah) {
  const k = Math.min(aw / (aw < ah ? 800 : 1000), ah / 900);   // portrait: branch tips may run off the sides
  return { k, ox: ax + (aw - 1000 * k) / 2, oy: ay + (ah - 900 * k) / 2 - 70 * k };
}
const toTree = (T, x, y) => [(x - T.ox) / T.k, (y - T.oy) / T.k];

function drawItem(c, type, x, y, t) {
  const big = ITEMS[type].deco ? 62 : 50;
  if (type === 'shield') { c.globalAlpha = .28 + (still() ? 0 : .08 * Math.sin(t * 3)); circ(c, 500, 265, 150, '#7fd0ff'); c.globalAlpha = 1; c.lineWidth = 4; c.setLineDash([4, 10]); c.strokeStyle = '#fff'; c.beginPath(); c.arc(500, 265, 150, 0, TAU); c.stroke(); c.setLineDash([]); }
  drawIcon(c, type, x, y - big * .42, big);
}
// Coverage zones: each defence has its own dash pattern as well as its own colour.
function drawZone(c, type, x, y) {
  const r = ITEMS[type].r;
  if (!r) return;
  const [rgb, dash] = { cam: ['127,208,255', [14, 8]], lamp: ['255,216,107', [3, 9]], bell: ['255,158,203', [24, 8, 4, 8]] }[type];
  circ(c, x, y, r, `rgba(${rgb},.13)`);
  c.setLineDash(dash); c.lineWidth = 4; c.strokeStyle = `rgba(${rgb},.85)`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.setLineDash([]);
}

// The big tree, the cabin, jars and everything the player has placed. o: { jars, zones, skip (mount index being dragged) }
function drawTree(c, T, t, o = {}) {
  c.save(); c.translate(T.ox, T.oy); c.scale(T.k, T.k); c.lineCap = c.lineJoin = 'round';
  c.fillStyle = '#0c1740'; c.fillRect(-3000, 930, 7000, 3000);
  ell(c, 500, 935, 380, 26, '#13235a');
  const leaves = (x, y, r) => { circ(c, x, y, r, '#1f5a3c'); circ(c, x - r * .5, y + r * .3, r * .7, '#1a4c33'); circ(c, x + r * .55, y + r * .2, r * .75, '#246a45'); circ(c, x + r * .1, y - r * .45, r * .6, '#2b7a50'); };
  leaves(500, 110, 150); leaves(330, 170, 90); leaves(680, 160, 95);
  poly(c, [440, 930, 470, 330, 530, 330, 560, 930, 610, 945, 390, 945], '#5a3a22');
  line(c, [485, 900, 490, 520], '#4a2e1a', 5); line(c, [520, 860, 515, 600], '#6b462a', 4);
  for (const [x1, y1, x2, y2] of [[470, 430, 70, 330], [530, 410, 930, 300], [462, 650, 90, 610], [538, 630, 910, 670]]) {
    line(c, [x1, y1, x2, y2], '#5a3a22', 26); line(c, [x1, y1 - 7, x2, y2 - 7], '#6b462a', 6);
    leaves(x2, y2 - 20, 58); leaves(lerp(x1, x2, .55), lerp(y1, y2, .55) - 46, 34);
  }
  for (const x of [560, 590]) line(c, [x, 344, x, 928], '#d9b77a', 3);
  for (let y = 370; y < 925; y += 38) line(c, [560, y, 590, y], '#d9b77a', 4);
  rr(c, 340, 330, 320, 16, 5); c.fillStyle = '#8a5a34'; c.fill();
  for (const x of [350, 650]) line(c, [x, 330, x, 296], '#8a5a34', 5);
  line(c, [350, 298, 400, 298], '#8a5a34', 4); line(c, [600, 298, 650, 298], '#8a5a34', 4);
  rr(c, 400, 205, 200, 127, 8); c.fillStyle = '#a8703f'; c.fill();
  for (let y = 230; y < 330; y += 25) line(c, [404, y, 596, y], '#8f5c30', 2);
  poly(c, [372, 214, 500, 112, 628, 214], '#c2503c'); line(c, [372, 214, 500, 112, 628, 214], '#e06a54', 6);
  for (const x of [445, 555]) { glow(c, x, 258, 70, '255,216,107', .4); rr(c, x - 26, 232, 52, 50, 8); c.fillStyle = '#4a2f1a'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#e8c984'; c.stroke(); }
  rr(c, 480, 262, 40, 68, 14); c.fillStyle = '#6b462a'; c.fill(); circ(c, 512, 300, 3, '#ffd24a');
  for (const x of [385, 615, 435]) line(c, [x, 346, x, 366], '#d9b77a', 2);
  const n = o.jars === undefined ? JARS.length - S.nest : o.jars;
  for (let i = 0; i < JARS.length; i++) jar(c, JARS[i][0], JARS[i][1], 20, t + i, i < n ? 1 : 0.12);
  if (o.zones) for (const it of S.items) if (it.m !== o.skip) drawZone(c, it.t, MOUNTS[it.m][0], MOUNTS[it.m][1]);
  for (const it of S.items) if (it.m !== o.skip) drawItem(c, it.t, MOUNTS[it.m][0], MOUNTS[it.m][1], t);
  c.restore();
}
// Drifting fireflies for any scene (screen space).
function fireflies(c, t, n = 16) {
  for (let i = 0; i < n; i++) {
    const x = (hash(i + 7) * V.w + Math.sin(t * .4 + i) * 40 + t * (6 + hash(i) * 8)) % V.w, y = V.h * (.25 + hash(i + 30) * .7) + Math.cos(t * .6 + i * 2) * 24;
    const a = still() ? .7 : .45 + .45 * Math.sin(t * 2.5 + i * 1.3);
    glow(c, x, y, 12, '255,230,140', a * .6); circ(c, x, y, 1.8, `rgba(255,246,200,${a})`);
  }
}
