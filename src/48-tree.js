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
// Every spot keeps clear of the jars, the owl and the ladder, so a placed item is always fully visible.
const MOUNTS = [[150, 338], [270, 368], [390, 398], [850, 310], [730, 343], [610, 376], [170, 607], [310, 622], [430, 635],
  [830, 649], [700, 635], [620, 627], [500, 480], [500, 560], [500, 760], [640, 905], [400, 905], [500, 108], [425, 165], [575, 165],
  [318, 318], [694, 318], [500, 232]];
const VAULT = 22;
const ITEMS = {
  cam: { cost: 30, r: 135, cd: 3 }, lamp: { cost: 15, r: 75 }, bell: { cost: 20, r: 120, cd: 1.5 }, shield: { cost: 45 },
  banner: { cost: 8, deco: 1 }, flowers: { cost: 6, deco: 1 }, scope: { cost: 12, deco: 1 }, lights: { cost: 10, deco: 1 },
  // silly gadgets: each one plays its trick on every magpie once (see stepRaid in src/90-tinker.js)
  peel: { cost: 10, r: 46, silly: 1 }, tramp: { cost: 18, r: 50, silly: 1 }, tickle: { cost: 12, r: 58, silly: 1 },
  bubbler: { cost: 22, r: 72, silly: 1 }, cannon: { cost: 25, r: 105, silly: 1 }, disco: { cost: 30, r: 130, silly: 1 },
};
// Two jars in each window, two on the left deck. Jars are taken from the end of the list.
const JARS = [[434, 262], [456, 262], [544, 262], [566, 262], [362, 304], [386, 304]];
const OWL = [630, 330];   // the owl's post on the right deck
const treeOwl = (c, T, t, mood) => owl(c, T.ox + OWL[0] * T.k, T.oy + OWL[1] * T.k, T.k * 1.05, t, mood);
const count = type => S.items.filter(i => i.t === type).length;

// ----- The treehouse grows with the Chief's rank: 1 a slide, 2 a kitchen, 3 an observatory (drawn in drawTree) -----
// On the menu screens a tap on a room plays its little joke; roomT[n] is when room n was last tapped.
const SLIDE = [300, 342, 150, 430, 315, 700, 150, 925];   // one curve from the left deck down to the grass
const slideAt = k => { const q = 1 - k, a = q * q * q, b = 3 * q * q * k, d = 3 * q * k * k, e = k * k * k; return [a * SLIDE[0] + b * SLIDE[2] + d * SLIDE[4] + e * SLIDE[6], a * SLIDE[1] + b * SLIDE[3] + d * SLIDE[5] + e * SLIDE[7]]; };
const roomT = [0, -9, -9, -9];
function roomAt(lx, ly, n = rank()) {
  if (n >= 3 && Math.hypot(lx - 320, ly - 140) < 62) return 3;
  if (n >= 2 && lx > 296 && lx < 464 && ly > 425 && ly < 590) return 2;
  if (n >= 1) for (let k = 0; k <= 1; k += .1) { const [x, y] = slideAt(k); if (Math.hypot(lx - x, ly - y) < 42) return 1; }
  return 0;
}
const moonAt = () => [V.w * .84, V.h * .15, Math.min(V.w, V.h) * .075];
// What the owl says about tonight's moon when it is tapped: the moon in the game is the real one, and a child can check.
const moonWord = (p = moonPhase()) => t('moon' + (p < .04 || p > .96 ? 0 : p < .46 ? 1 : p < .54 ? 2 : 3)) + ' ' + t('moonSame');
// A tap on a menu screen that hits a room or the moon (the secrets). True when the tap was used.
function menuTap(x, y, T) {
  const [lx, ly] = toTree(T, x, y), room = roomAt(lx, ly), [mx, my, mr] = moonAt();
  if (room) { roomT[room] = V.t; [null, sfx.whee, sfx.sizzle, sfx.wish][room](); return true; }
  if (Math.hypot(x - mx, y - my) < Math.max(34, mr * 1.5)) { winkT = V.t; sfx.chirp(); ui.querySelectorAll('.toast').forEach(n => n.remove()); toast(moonWord(), 3400); return true; }
  return giftTap(lx, ly, T);   // the gifts of the Legendary fish answer a tap too
}

// The two rows of far hills: part of the cached sky, and drawn once more in front of the rising sun at first light.
function farHills(g, w, h) {
  for (const [col, base, amp, f] of [['#16255c', .8, .05, 3.1], ['#0f1a45', .87, .04, 5.3]]) {
    g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) g.lineTo(x, h * (base + Math.sin(x / w * f * TAU + f) * amp * .5 - Math.abs(Math.sin(x / w * f * 9)) * amp * .4));
    g.lineTo(w, h); g.fillStyle = col; g.fill();
  }
}
// Sky, stars, moon, far hills and the magpies' nest; cached per size and per day (the moon is tonight's real moon), twinkles drawn live.
let skyCache = null;
const hash = i => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
function drawSky(c, t) {
  const w = V.w, h = V.h, day = Math.floor(Date.now() / 864e5);
  if (!skyCache || skyCache.w !== w || skyCache.h !== h || skyCache.day !== day) {
    const o = document.createElement('canvas'), d = Math.min(window.devicePixelRatio || 1, 2);
    o.width = w * d; o.height = h * d;
    const g = o.getContext('2d'); g.scale(d, d);
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#070d2a'); gr.addColorStop(.6, '#1b2a6b'); gr.addColorStop(1, '#2c3f86');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) circ(g, hash(i) * w, hash(i + 200) * h * .7, .6 + hash(i + 400) * 1.3, `rgba(255,255,255,${.35 + hash(i + 600) * .5})`);
    // the dark part of the moon stays in the sky, a shade lighter than the night; the lit part follows the real phase
    const [mx, my, mr] = moonAt(), p = moonPhase();
    glow(g, mx, my, mr * 4, '255,240,200', .12 + .23 * (1 - Math.cos(p * TAU)) / 2); circ(g, mx, my, mr, '#1b2763');
    g.save(); moonLit(g, mx, my, mr, p); g.clip();
    circ(g, mx, my, mr, '#fff3c9');
    circ(g, mx - mr * .3, my - mr * .2, mr * .18, '#f0dca0'); circ(g, mx + mr * .25, my + mr * .3, mr * .12, '#f0dca0'); circ(g, mx + mr * .2, my - mr * .4, mr * .09, '#f0dca0');
    g.restore();
    farHills(g, w, h);
    skyCache = { w, h, day, o };
  }
  c.drawImage(skyCache.o, 0, 0, w, h);
  giftSky(c, t);
  for (let i = 0; i < 14; i++) {
    const a = still() ? .6 : .5 + .5 * Math.sin(t * (1 + hash(i) * 2) + i);
    starPath(c, hash(i + 50) * w, hash(i + 90) * h * .6, 2 + a * 3, 1, 4); c.fillStyle = `rgba(255,246,218,${a})`; c.fill();
  }
  // Secret: a tapped moon shows its whole face and winks.
  if (V.t - winkT < 1.6) {
    const [mx, my, mr] = moonAt();
    circ(c, mx, my, mr, '#fff3c9');
    circ(c, mx - mr * .35, my - mr * .18, mr * .11, '#7a5a1a');
    line(c, [mx + mr * .18, my - mr * .18, mx + mr * .52, my - mr * .18], '#7a5a1a', mr * .1);
    c.beginPath(); c.arc(mx, my + mr * .08, mr * .46, .3, Math.PI - .3); c.lineWidth = mr * .1; c.strokeStyle = '#7a5a1a'; c.stroke();
  }
  // The observatory's joke: a shooting star (with motion reduced: a small constellation lights up instead).
  const ds = V.t - roomT[3];
  if (ds < 1.6) {
    if (still()) { const p = [.2, .2, .27, .13, .35, .19, .42, .1, .5, .17].map((v, i) => v * (i % 2 ? h : w)); line(c, p, 'rgba(255,246,218,.7)', 1.5); for (let i = 0; i < 10; i += 2) { starPath(c, p[i], p[i + 1], 6, 2.5, 4); c.fillStyle = '#fff6da'; c.fill(); } }
    else { const k = ds / 1.1, x = lerp(w * .08, w * .7, k), y = lerp(h * .06, h * .26, k); if (k < 1) { line(c, [x - w * .12, y - h * .038, x, y], 'rgba(255,246,218,.55)', 3); starPath(c, x, y, 9, 3.5, 4); c.fillStyle = '#fff'; c.fill(); } }
  }
}

// Fit the tree into a screen rectangle. Returns the transform used by drawTree and by pointer maths.
function fitTree(ax, ay, aw, ah) {
  const k = Math.min(aw / (aw < ah ? 800 : 1000), ah / 900);   // portrait: branch tips may run off the sides
  return { k, ox: ax + (aw - 1000 * k) / 2, oy: ay + (ah - 900 * k) / 2 - 70 * k };
}
const toTree = (T, x, y) => [(x - T.ox) / T.k, (y - T.oy) / T.k];

// `k` is the tree's on-screen scale: on small screens items keep a readable size.
function drawItem(c, type, x, y, t, k = 1) {
  const big = Math.max(ITEMS[type].deco ? 62 : 50, 22 / k);
  if (type === 'shield') { c.globalAlpha = .28 + (still() ? 0 : .08 * Math.sin(t * 3)); circ(c, 500, 265, 150, '#7fd0ff'); c.globalAlpha = 1; c.lineWidth = 4; c.setLineDash([4, 10]); c.strokeStyle = '#fff'; c.beginPath(); c.arc(500, 265, 150, 0, TAU); c.stroke(); c.setLineDash([]); }
  drawIcon(c, type, x, y - big * .42, big);
}
// Coverage zones: each defence has its own dash pattern as well as its own colour.
function drawZone(c, type, x, y) {
  const r = ITEMS[type].r;
  if (!r) return;
  const [rgb, dash] = { cam: ['127,208,255', [14, 8]], lamp: ['255,216,107', [3, 9]], bell: ['255,158,203', [24, 8, 4, 8]] }[type] || ['111,220,149', [2, 8]];   // silly gadgets: green dots
  circ(c, x, y, r, `rgba(${rgb},.13)`);
  c.setLineDash(dash); c.lineWidth = 4; c.strokeStyle = `rgba(${rgb},.85)`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.setLineDash([]);
}

// The big tree, the cabin, jars and everything the player has placed. o: { jars, nest, zones, skip (mount index being dragged) }
function drawTree(c, T, t, o = {}) {
  c.save(); c.translate(T.ox, T.oy); c.scale(T.k, T.k); c.lineCap = c.lineJoin = 'round';
  c.fillStyle = '#0c1740'; c.fillRect(-3000, 930, 7000, 3000);
  ell(c, 500, 935, 380, 26, '#13235a');
  const leaves = (x, y, r) => { circ(c, x, y, r, '#1f5a3c'); circ(c, x - r * .5, y + r * .3, r * .7, '#1a4c33'); circ(c, x + r * .55, y + r * .2, r * .75, '#246a45'); circ(c, x + r * .1, y - r * .45, r * .6, '#2b7a50'); };
  leaves(500, 110, 150); leaves(330, 170, 90); leaves(680, 160, 95);
  const rooms = o.rooms === undefined ? rank() : o.rooms;
  if (rooms >= 3) {   // the observatory in the left crown (clear of the moon on a phone): a drum, a dome with a slit, a telescope
    rr(c, 282, 150, 76, 42, 6); c.fillStyle = '#a8703f'; c.fill(); line(c, [284, 171, 356, 171], '#8f5c30', 2);
    c.beginPath(); c.arc(320, 152, 42, Math.PI, 0); c.closePath(); c.fillStyle = '#8fa4d8'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#dfe6f5'; c.stroke();
    poly(c, [313, 151, 327, 151, 321, 110, 309, 112], '#22306e');
    c.save(); c.translate(316, 130); c.rotate(-.75); rr(c, -6, -46, 12, 52, 4); c.fillStyle = '#e8c984'; c.fill(); rr(c, -8, -52, 16, 10, 3); c.fillStyle = '#c9a25a'; c.fill(); c.restore();
    starPath(c, 320, 174, 8, 3.4, 5); c.fillStyle = '#ffd24a'; c.fill();
  }
  poly(c, [440, 930, 470, 330, 530, 330, 560, 930, 610, 945, 390, 945], '#5a3a22');
  line(c, [485, 900, 490, 520], '#4a2e1a', 5); line(c, [520, 860, 515, 600], '#6b462a', 4);
  if (rooms >= 1) {   // the slide from the left deck to the grass, behind the branches; the stripes make it a pattern, not only a colour
    c.beginPath(); c.moveTo(SLIDE[0], SLIDE[1]); c.bezierCurveTo(SLIDE[2], SLIDE[3], SLIDE[4], SLIDE[5], SLIDE[6], SLIDE[7]);
    c.lineWidth = 32; c.strokeStyle = '#b8791a'; c.stroke(); c.lineWidth = 22; c.strokeStyle = '#ffcf4a'; c.stroke();
    c.lineWidth = 3; c.setLineDash([10, 18]); c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke(); c.setLineDash([]);
  }
  for (const [x1, y1, x2, y2] of [[470, 430, 70, 330], [530, 410, 930, 300], [462, 650, 90, 610], [538, 630, 910, 670]]) {
    line(c, [x1, y1, x2, y2], '#5a3a22', 26); line(c, [x1, y1 - 7, x2, y2 - 7], '#6b462a', 6);
    leaves(x2, y2 - 20, 58); leaves(lerp(x1, x2, .55), lerp(y1, y2, .55) - 46, 34);
  }
  if (rooms >= 2) {   // the kitchen under the top left branch: plank walls, a red roof, a lit round window, a steaming pipe
    rr(c, 300, 452, 160, 128, 8); c.fillStyle = '#b07a48'; c.fill();
    for (let y = 478; y < 578; y += 26) line(c, [305, y, 455, y], '#96633a', 2);
    rr(c, 318, 402, 16, 40, 3); c.fillStyle = '#8a94a8'; c.fill();
    poly(c, [286, 460, 380, 420, 474, 460], '#c2503c'); line(c, [286, 460, 380, 420, 474, 460], '#e06a54', 5);
    glow(c, 380, 518, 70, '255,216,107', .45); circ(c, 380, 518, 27, '#4a2f1a'); circ(c, 380, 518, 22, '#ffe9a3');
    line(c, [358, 518, 402, 518], '#4a2f1a', 3); line(c, [380, 496, 380, 540], '#4a2f1a', 3);
    rr(c, 294, 577, 172, 10, 4); c.fillStyle = '#8a5a34'; c.fill();
    for (let i = 0; i < 3; i++) { const k = still() ? (i + 1) / 4 : (t * .35 + i / 3) % 1; c.globalAlpha = .55 * (1 - k); circ(c, 326 + Math.sin(k * 5 + i) * 6, 398 - k * 46, 5 + k * 7, '#dff0ff'); }
    c.globalAlpha = 1;
  }
  for (const x of [560, 590]) line(c, [x, 344, x, 928], '#d9b77a', 3);
  for (let y = 370; y < 925; y += 38) line(c, [560, y, 590, y], '#d9b77a', 4);
  rr(c, 288, 330, 424, 16, 5); c.fillStyle = '#8a5a34'; c.fill();
  for (const x of [298, 702]) line(c, [x, 330, x, 296], '#8a5a34', 5);
  line(c, [298, 298, 400, 298], '#8a5a34', 4); line(c, [600, 298, 702, 298], '#8a5a34', 4);
  rr(c, 400, 205, 200, 127, 8); c.fillStyle = '#a8703f'; c.fill();
  for (let y = 230; y < 330; y += 25) line(c, [404, y, 596, y], '#8f5c30', 2);
  poly(c, [372, 214, 500, 112, 628, 214], '#c2503c'); line(c, [372, 214, 500, 112, 628, 214], '#e06a54', 6);
  for (const x of [445, 555]) { glow(c, x, 258, 70, '255,216,107', .4); rr(c, x - 26, 232, 52, 50, 8); c.fillStyle = '#4a2f1a'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#e8c984'; c.stroke(); }
  rr(c, 480, 262, 40, 68, 14); c.fillStyle = '#6b462a'; c.fill(); circ(c, 512, 300, 3, '#ffd24a');
  const n = o.jars === undefined ? JARS.length - S.nest : o.jars;
  for (let i = 0; i < JARS.length; i++) jar(c, JARS[i][0], JARS[i][1], 20, t + i, i < n ? 1 : 0.12);
  // The magpies' own little tree with their nest: jars they took sit here and glow until Zip brings them home.
  const nest = o.nest === undefined ? S.nest : o.nest;
  line(c, [868, 934, 868, 874], '#3a2716', 9); line(c, [868, 904, 846, 888], '#3a2716', 5); line(c, [868, 896, 890, 880], '#3a2716', 5);
  ell(c, 868, 868, 32, 11, '#6b4a2e');
  for (let i = 0; i < nest; i++) jar(c, 852 + i * 16, 853, 11, t + i, .75);
  line(c, [838, 866, 850, 875, 886, 875, 898, 866], '#8a6a44', 5);
  if (o.zones) for (const it of S.items) if (it.m !== o.skip) drawZone(c, it.t, MOUNTS[it.m][0], MOUNTS[it.m][1]);
  for (const it of S.items) if (it.m !== o.skip) drawItem(c, it.t, MOUNTS[it.m][0], MOUNTS[it.m][1], t, T.k);
  // The rooms' jokes, in front of everything: a friend whizzes down the slide, a pancake flips out of the kitchen pipe.
  const d1 = V.t - roomT[1], d2 = V.t - roomT[2];
  if (rooms >= 1 && d1 < 2.4) {
    const k = still() ? 1 : ease(Math.min(1, d1 / 1.3)), [x, y] = slideAt(k), land = d1 - 1.3;
    critter(c, x, y + 14 - (still() || land < 0 ? 0 : Math.abs(Math.sin(land * 9)) * 16 * Math.max(0, 1 - land)), Math.max(.5, .3 / T.k), t, (roomT[1] * 7 | 0) % 4);
  }
  if (rooms >= 2 && d2 < 1.3) {
    const k = still() ? .5 : d2 / 1.3;
    c.save(); c.translate(326 + k * 70, 396 - Math.sin(Math.PI * k) * 120); c.rotate(still() ? 0 : k * TAU * 2);
    ell(c, 0, 0, 18, 7, '#c98a3a'); ell(c, 0, -2, 16, 5, '#f2c26b'); c.restore();
  }
  c.restore();
}
// Drifting fireflies for any scene (screen space).
function fireflies(c, t, n = 16) {
  // Secret: shaken or swept away, they fly apart and drift back (with motion reduced they only glow brighter).
  const sc = V.t - scatterT, push = sc < 2.4 ? Math.sin(Math.PI * sc / 2.4) : 0;
  for (let i = 0; i < n; i++) {
    let x = (hash(i + 7) * V.w + Math.sin(t * .4 + i) * 40 + t * (6 + hash(i) * 8)) % V.w, y = V.h * (.25 + hash(i + 30) * .7) + Math.cos(t * .6 + i * 2) * 24;
    if (push && !still()) { x += (x - V.w / 2) * push * .8; y += (y - V.h * .55) * push * .8; }
    const a = still() ? .7 + push * .3 : .45 + .45 * Math.sin(t * 2.5 + i * 1.3);
    glow(c, x, y, 12 + push * 8, '255,230,140', a * .6); circ(c, x, y, 1.8 + push, `rgba(255,246,200,${a})`);
  }
}
