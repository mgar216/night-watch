// ---------- The fish painter: one procedural artist for all 85 species, driven by each species' `art` (see 60-fish.js) ----------
// drawFish(c, id, x, y, len, o) draws a fish centred at (x, y), `len` px from nose to tail tip.
// o: { dir: 1 | -1 (1 looks right), t: seconds, mode: 'shadow' | 'full', alpha, wag: 0..1 (how hard the tail beats),
//      tilt: radians (a positive tilt dips the nose, whichever way the fish looks),
//      pale: shadow tone (default: pale for the Drowned Chapel's fish, dark everywhere else), ppu: css px per canvas unit (icons) }
// A shadow is cheap: the outline is rebuilt from cached numbers into one path, stroked twice for a soft edge and filled once;
// no gradients, no allocation. Things that give light (a lantern, stolen lures, light organs, a glow) show even in a shadow.

// Body families. h: height / length, m: where the body is highest (0 nose .. 1 tail root), pr: the tail root's share of the height,
// n: head shape (below 1 blunt, above 1 pointed), rq: how fast the rear tapers, up: share of the height above the mid-line,
// dp: where the back fin sits, lin: straight edges (the ray's diamond).
const FISH_BODY = {
  oval: { h: .38, m: .36, pr: .24, n: 1, rq: 1.3, up: .53, dp: .42 },
  long: { h: .26, m: .38, pr: .32, n: 1.1, rq: 1.2, up: .5, dp: .42 },
  deep: { h: .62, m: .42, pr: .26, n: .85, rq: 1.1, up: .53, dp: .36 },
  round: { h: .7, m: .48, pr: .2, n: .7, rq: 1, up: .5, dp: .5 },
  torpedo: { h: .28, m: .42, pr: .08, n: 1.5, rq: 2.2, up: .5, dp: .34 },
  pike: { h: .2, m: .62, pr: .4, n: 2, rq: 1.4, up: .45, dp: .78 },
  eel: { h: .12, m: .18, pr: .3, n: 1.1, rq: 1.6, up: .5, dp: .22 },
  whisk: { h: .3, m: .2, pr: .32, n: .6, rq: .9, up: .46, dp: .28 },
  flat: { h: .5, m: .48, pr: .2, n: .85, rq: 1.2, up: .5, dp: .5 },
  ray: { h: .9, m: .42, pr: .04, n: 1, rq: 1, up: .5, dp: .5, lin: 1 },
};
const FISH_TAIL = { fork: .2, square: .16, round: .17, fan: .26, moon: .2, point: .1, whip: .45 };
// Back fins as pairs (s along the body, height out from the outline as a share of the length), front to rear.
const FISH_DORSAL = {
  low: [-.1, 0, -.05, .05, .07, .035, .1, 0],
  high: [-.1, 0, -.04, .13, .06, .07, .11, 0],
  round: [-.1, 0, -.06, .07, .02, .095, .09, .055, .12, 0],
  spiny: [-.15, 0, -.13, .1, -.1, .06, -.07, .12, -.04, .07, -.01, .11, .02, .05, .05, .03, .08, .07, .15, .05, .18, 0],
  sail: [-.2, 0, -.17, .22, -.05, .31, .1, .27, .2, .13, .24, 0],
  long: [-.04, 0, 0, .045, .9, .04, .98, 0],
};
const FISH_N = 22;                                     // outline samples per side
const FISH_SHAPE = {};                                 // species id -> its shape numbers, worked out once
// Scratch outline for the frame being drawn (reused: nothing is allocated per fish per frame).
const fbx = new Float32Array(FISH_N + 1), fbt = new Float32Array(FISH_N + 1), fbb = new Float32Array(FISH_N + 1);
let fpx = 0, fpy = 0;

// A small seeded random generator, so each species keeps the same spots on every draw.
function fishRng(id) { let h = 2166136261; for (const ch of id) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ h >>> 15, 2246822507) + 0x6d2b79f5 | 0; return ((h ^ h >>> 13) >>> 0) / 4294967296; }; }

function fishShape(id) {
  if (FISH_SHAPE[id]) return FISH_SHAPE[id];
  const sp = SPECIES[id], a = sp.art || {}, B = FISH_BODY[a.b] || FISH_BODY.oval, mk = a.mk || [], is = k => mk.includes(k);
  const tl = a.tl || 'fork', veil = is('veil'), TL = FISH_TAIL[tl] * (veil && tl !== 'whip' ? 1.25 : 1);
  const SN = is('snout') ? (a.b === 'pike' || a.b === 'torpedo' ? .12 : .05) : 0;   // a beak or a long nose in front of the head
  const xn = .5 - SN, xp = -.5 + TL, BL = xn - xp, H = a.h || B.h;
  const f = { id, sp, a, B, mk, is, tl, TL, SN, xn, xp, BL, H, xs: new Float32Array(FISH_N + 1), yt: new Float32Array(FISH_N + 1), yb: new Float32Array(FISH_N + 1) };
  for (let i = 0; i <= FISH_N; i++) {
    const s = Math.pow(i / FISH_N, 1.4);               // denser samples at the head, where the outline turns fastest
    let v;
    if (s < B.m) { const k = s / B.m; v = B.lin ? k : Math.pow(Math.sqrt(1 - (1 - k) * (1 - k)), B.n); }
    else { const k = (s - B.m) / (1 - B.m); v = B.lin ? 1 - (1 - B.pr) * k : B.pr + (1 - B.pr) * Math.pow(1 - k * k, B.rq); }
    f.xs[i] = xn - s * BL; f.yt[i] = -H * B.up * v; f.yb[i] = H * (1 - B.up) * v;
  }
  f.hp = H * B.pr * .5 + .006;                     // half the height of the tail root
  f.tw = tl === 'point' || tl === 'whip' ? f.hp : Math.max(.09, H * (a.b === 'deep' || a.b === 'round' ? .42 : .55)) * (tl === 'moon' ? 1.2 : 1) * (veil ? 1.15 : 1);
  // fins: heights grow a little with the body's height; a ribbon fin runs from its place to the tail
  const hs = .7 + H * .6, dp = a.dp || B.dp, rib = a.b === 'eel' ? .02 : .04 * hs, fin = (pts, at, k = hs) => pts.map((v, i) => i % 2 ? v * k : v + at);
  f.dorsal = a.b === 'flat' ? [.1, 0, .2, .05, .8, .05, .95, 0] : a.df === 'long' ? [dp - .04, 0, dp, rib * 1.1, .9, rib, .98, 0] : FISH_DORSAL[a.df] ? fin(FISH_DORSAL[a.df], dp) : null;
  f.anal = a.b === 'ray' ? null : a.b === 'flat' ? [.12, 0, .22, .05, .8, .05, .95, 0] : a.b === 'eel' ? [.4, 0, .45, rib, .9, rib, .98, 0]
    : fin(a.b === 'deep' ? [.6, 0, .66, .1, .78, .07, .84, 0] : [.66, 0, .7, .06, .79, .045, .84, 0], 0);
  f.pelvic = a.b === 'ray' || a.b === 'flat' || a.b === 'eel' ? null : veil ? [.34, 0, .42, .07, .62, .17, .55, .05, .46, 0] : [.36, 0, .42, .05, .45, .045, .44, 0];
  f.crown = is('crown') ? [.1, 0, .12, .13, .15, .07, .18, .17, .21, .07, .24, .13, .27, 0] : null;
  f.finlets = is('finlets');
  const gl = a.gl || '255,230,150';
  f.lit = `rgba(${gl},.75)`; f.lit1 = `rgb(${gl})`;  // the colour of its lights, in a shadow and on the portrait
  // where the fish ends, for fitting it into an icon box
  const top = Math.max(f.dorsal ? Math.max(...f.dorsal.filter((v, i) => i % 2)) : 0, f.crown ? .17 : 0);
  const bot = Math.max(f.anal ? Math.max(...f.anal.filter((v, i) => i % 2)) : 0, f.pelvic ? Math.max(...f.pelvic.filter((v, i) => i % 2)) : 0) + (is('whisk') || is('beard') || is('lures') ? .06 : 0);
  f.bx0 = -.5; f.bx1 = .5 + (is('lantern') ? .06 : 0) + (is('whisk') ? .04 : 0);
  f.by0 = Math.min(-H * B.up - top - (is('lantern') ? .12 : 0), -f.tw * 1.3); f.by1 = Math.max(H * (1 - B.up) + bot, f.tw * 1.3);
  // the pattern's random marks, fixed per species
  const r = fishRng(id); f.rnd = new Float32Array(160); for (let i = 0; i < 160; i++) f.rnd[i] = r();
  f.freq = 3 + sp.speed * .7;                      // tail beats per second grow with speed
  return (FISH_SHAPE[id] = f);
}

// The point at s along the bent outline (0 nose .. 1 tail root), on the back (top) or the belly. Result in fpx, fpy.
function fishAt(s, top) {
  const u = Math.pow(clamp(s, 0, 1), 1 / 1.4) * FISH_N, i = Math.min(FISH_N - 1, u | 0), k = u - i, Y = top ? fbt : fbb;
  fpx = fbx[i] + (fbx[i + 1] - fbx[i]) * k; fpy = Y[i] + (Y[i + 1] - Y[i]) * k;
}
// Body outline as a closed, smoothed path (midpoint curves), from the nose along the back to the tail root and back along the belly.
function fishBody(c) {
  c.moveTo(fbx[0], fbt[0]);
  for (let i = 1; i < FISH_N; i++) c.quadraticCurveTo(fbx[i], fbt[i], (fbx[i] + fbx[i + 1]) / 2, (fbt[i] + fbt[i + 1]) / 2);
  c.lineTo(fbx[FISH_N], fbt[FISH_N]); c.lineTo(fbx[FISH_N], fbb[FISH_N]);
  for (let i = FISH_N - 1; i > 0; i--) c.quadraticCurveTo(fbx[i], fbb[i], (fbx[i] + fbx[i - 1]) / 2, (fbb[i] + fbb[i - 1]) / 2);
  c.lineTo(fbx[0], fbb[0]); c.closePath();
}
// A fin along the back or the belly from its point list; its base runs a little inside the body so the two join.
function fishFin(c, pts, top) {
  const sg = top ? -1 : 1, n = pts.length;
  for (let i = 0; i < n; i += 2) { fishAt(pts[i], top); i ? c.lineTo(fpx, fpy + sg * pts[i + 1]) : c.moveTo(fpx, fpy + sg * pts[i + 1]); }
  fishAt(pts[n - 2], top); c.lineTo(fpx, fpy - sg * .012); fishAt(pts[0], top); c.lineTo(fpx, fpy - sg * .012); c.closePath();
}
// The tail, drawn around the tail root (origin), pointing back along -x.
function fishTail(c, f) {
  const L = f.TL, w = f.tw, p = f.hp;
  c.moveTo(.012, -p);
  switch (f.tl) {
    case 'square': c.lineTo(-L, -w); c.quadraticCurveTo(-L * .88, 0, -L, w); break;
    case 'round': c.bezierCurveTo(-L * .4, -w * 1.1, -L * 1.15, -w * .8, -L, 0); c.bezierCurveTo(-L * 1.15, w * .8, -L * .4, w * 1.1, .012, p); break;
    case 'fan': c.quadraticCurveTo(-L * .4, -w * 1.3, -L, -w * 1.05); c.quadraticCurveTo(-L * .78, -w * .5, -L * .97, -w * .2); c.quadraticCurveTo(-L * .84, 0, -L * .97, w * .2);
      c.quadraticCurveTo(-L * .78, w * .5, -L, w * 1.05); c.quadraticCurveTo(-L * .4, w * 1.3, .012, p); break;
    case 'moon': c.quadraticCurveTo(-L * .3, -w * .6, -L * .78, -w * 1.25); c.quadraticCurveTo(-L * .52, -w * .45, -L * .5, 0); c.quadraticCurveTo(-L * .52, w * .45, -L * .78, w * 1.25); c.quadraticCurveTo(-L * .3, w * .6, .012, p); break;
    case 'point': c.quadraticCurveTo(-L * .5, -p * .8, -L, 0); c.quadraticCurveTo(-L * .5, p * .8, .012, p); break;
    case 'whip': c.lineTo(-L, -.004); c.lineTo(-L, .004); break;
    default: c.quadraticCurveTo(-L * .5, -w * .6, -L, -w); c.quadraticCurveTo(-L * .72, -w * .3, -L * .45, 0); c.quadraticCurveTo(-L * .72, w * .3, -L, w); c.quadraticCurveTo(-L * .5, w * .6, .012, p);   // fork
  }
  c.lineTo(.012, p); c.closePath();
}
// Shapes that stick out of the outline: an under-bite, a beak, the finlets of a tuna.
function fishExtras(c, f) {
  const H = f.H, xn = f.xn;
  if (f.is('jaw')) { c.moveTo(xn - .1, H * .12); c.lineTo(xn + .025, H * .02); c.lineTo(xn - .01, H * .2); c.closePath(); }
  if (f.SN) { c.moveTo(xn + .01, -H * .1); c.lineTo(.5, -.004); c.lineTo(.5, .006); c.lineTo(xn + .01, H * .1); c.closePath(); }
  if (f.finlets) for (let s = .78; s < .97; s += .065) { fishAt(s, true); c.moveTo(fpx + .012, fpy + .005); c.lineTo(fpx - .004, fpy - .028); c.lineTo(fpx - .016, fpy + .005); fishAt(s, false); c.moveTo(fpx + .012, fpy - .005); c.lineTo(fpx - .004, fpy + .028); c.lineTo(fpx - .016, fpy - .005); }
}
// Whiskers, a beard of barbels, the lantern's stalk and the stolen lures' lines: thin strokes from the mouth.
function fishStrokes(c, f, sw, sway) {
  const H = f.H, xn = f.xn, my = H * .06;
  c.beginPath();
  if (f.is('whisk')) { c.moveTo(xn - .02, my); c.quadraticCurveTo(xn + .06, my + .04 + sway, xn - .04, H * .4 + .1 + sway); c.moveTo(xn - .03, my); c.quadraticCurveTo(xn + .02, H * .2 + sway, xn - .1, H * .42 + .06 + sway); c.moveTo(xn - .03, -H * .08); c.quadraticCurveTo(xn + .05, -H * .2 - sway, xn + .02, -H * .45 - .02); }
  if (f.is('beard')) for (let i = 0; i < 3; i++) { const bx = xn - .03 - i * .03; c.moveTo(bx, H * .18); c.quadraticCurveTo(bx + .01, H * .3 + .03, bx - .015 + sway * .5, H * .42 + .06); }
  if (f.is('lantern')) { fishAt(.18, true); c.moveTo(fpx, fpy); c.quadraticCurveTo(fpx + .02, fpy - .2, xn + .07, -H * .52 + sway * .5); }
  if (f.is('lures')) for (let i = 0; i < 3; i++) { fishAt(.07 + i * .05, false); c.moveTo(fpx, fpy); c.lineTo(fpx - .01 + sway * .3, fpy + .05 + i * .015); }
  c.lineWidth = sw; c.stroke();
}
// Points of light carried by the fish: the lantern's bulb, the lit lures it stole, rows of light organs.
function fishLights(c, f, full, sway) {
  const H = f.H;
  c.fillStyle = full ? f.lit1 : f.lit;
  if (f.is('lantern')) { c.beginPath(); c.arc(f.xn + .07, -H * .52 + sway * .5, .026, 0, TAU); c.fill(); }
  if (f.is('lures')) for (let i = 0; i < 3; i++) { fishAt(.07 + i * .05, false); c.beginPath(); c.arc(fpx - .01 + sway * .3, fpy + .055 + i * .015, .011, 0, TAU); c.fill(); }
  if (f.is('pearl')) for (let s = .14; s < .9; s += .07) { fishAt(s, false); c.beginPath(); c.arc(fpx, fpy - .022, .009, 0, TAU); c.fill(); }
}
// One soft glow per colour, painted once into a small canvas and stretched under glowing fish (no gradient per frame).
const FISH_GLOW = {};
function fishGlowSprite(rgb) {
  if (FISH_GLOW[rgb]) return FISH_GLOW[rgb];
  const s = document.createElement('canvas'); s.width = s.height = 64;
  const g = s.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${rgb},.55)`); gr.addColorStop(.5, `rgba(${rgb},.18)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (FISH_GLOW[rgb] = s);
}

function drawFish(c, id, x, y, len, o = {}) {
  const sp = SPECIES[id]; if (!sp || !(len > 0)) return;
  const f = fishShape(id), t = o.t || 0, wag = o.wag === undefined ? .4 : clamp(o.wag, 0, 1), calmly = still();
  const px = len * (o.ppu || 1), ph = t * f.freq + f.rnd[0] * 6, beat = calmly ? 0 : Math.sin(ph);
  // the swim: a small wave runs down the body, the tail swings and turns (it looks narrower while it points at us)
  const A = calmly ? 0 : (sp.art.b === 'eel' ? .03 : .01) * (.5 + wag);
  for (let i = 0; i <= FISH_N; i++) { const s = Math.pow(i / FISH_N, 1.4), off = A * Math.sin(ph - s * 2.6) * s * s; fbx[i] = f.xs[i]; fbt[i] = f.yt[i] + off; fbb[i] = f.yb[i] + off; }
  const tailAng = beat * (.06 + .14 * wag) + (A ? A * 2.6 * Math.cos(ph - 2.6) : 0), tailK = 1 - (.15 + .35 * wag) * Math.abs(beat);
  const sway = calmly ? 0 : Math.sin(t * 1.7 + f.rnd[1] * 6) * .015;
  c.save();
  c.translate(x, y); c.scale(o.dir === -1 ? -1 : 1, 1); if (o.tilt) c.rotate(o.tilt); c.scale(len, len);
  c.lineJoin = c.lineCap = 'round';
  const alpha = o.alpha === undefined ? 1 : o.alpha;
  if (o.mode === 'full') fishPortrait(c, f, t, px, tailAng, tailK, sway, alpha);
  else {
    const pale = o.pale === undefined ? sp.area === 'chapel' : o.pale, glows = f.is('glow');
    if (glows) { c.globalAlpha = alpha * .8; c.drawImage(fishGlowSprite(f.a.gl || '200,230,255'), -.62, -f.H - .1, 1.24, f.H * 2 + .2); }
    c.fillStyle = c.strokeStyle = pale ? '#dfe3dc' : '#07101a';
    // the soft edge: the same outline a little bigger and faint underneath (a fill is far cheaper than a wide stroke)
    c.save(); c.scale(1 + 4 / px, 1 + 4 / px / Math.max(.15, f.H)); c.beginPath(); fishSilhouette(c, f, tailAng, tailK);
    c.globalAlpha = alpha * (pale ? .16 : .24); c.fill(); c.restore();
    c.beginPath(); fishSilhouette(c, f, tailAng, tailK);
    c.globalAlpha = alpha * (pale ? .42 : .72); c.fill();
    fishStrokes(c, f, Math.max(1.3 / px, .006), sway);
    c.globalAlpha = alpha; fishLights(c, f, false, sway);
  }
  c.restore();
}
// The whole outline as one path: body, fins, the shapes that stick out, and the tail turned by the beat.
function fishSilhouette(c, f, tailAng, tailK) {
  fishBody(c);
  if (f.dorsal) fishFin(c, f.dorsal, true);
  if (f.crown) fishFin(c, f.crown, true);
  if (f.anal) fishFin(c, f.anal, false);
  if (f.pelvic) fishFin(c, f.pelvic, false);
  fishExtras(c, f);
  c.save(); c.translate(fbx[FISH_N], (fbt[FISH_N] + fbb[FISH_N]) / 2); c.rotate(tailAng); c.scale(tailK, 1); fishTail(c, f); c.restore();
}

// The painted portrait: fins, a shaded body with its pattern and scales, gill, eye, mouth and the species' own marks.
function fishPortrait(c, f, t, px, tailAng, tailK, sway, alpha) {
  const a = f.a, H = f.H, [back, belly, finc] = a.c, legend = f.sp.legend, line1 = 1 / px;
  c.globalAlpha = alpha;
  if (legend) { glow(c, 0, 0, .8, '255,216,107', .32); }
  if (f.is('glow')) glow(c, 0, 0, .66, a.gl || '200,230,255', .45);
  // fins behind the body
  c.fillStyle = finc; c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = Math.max(line1, .004);
  for (const [pts, top] of [[f.dorsal, true], [f.crown, true], [f.anal, false], [f.pelvic, false]]) if (pts) { c.beginPath(); fishFin(c, pts, top); c.globalAlpha = alpha * .9; c.fill(); c.globalAlpha = alpha; c.stroke(); }
  if (f.crown) { c.beginPath(); fishFin(c, f.crown, true); c.fillStyle = legend ? '#ffd24a' : finc; c.fill(); c.fillStyle = finc; }
  c.beginPath(); fishExtras(c, f); c.fillStyle = back; c.fill();
  c.save(); c.translate(fbx[FISH_N], (fbt[FISH_N] + fbb[FISH_N]) / 2); c.rotate(tailAng); c.scale(tailK, 1);
  c.beginPath(); fishTail(c, f); c.fillStyle = finc; c.globalAlpha = alpha * .92; c.fill(); c.globalAlpha = alpha; c.stroke();
  if (f.tl !== 'whip' && px > 50) { c.beginPath(); for (let k = -2; k <= 2; k++) { c.moveTo(-.01, k * f.hp * .35); c.lineTo(-f.TL * .85, k * f.tw * .38); } c.strokeStyle = 'rgba(0,0,0,.18)'; c.stroke(); }
  c.restore();
  // body: back colour into belly colour
  const g = c.createLinearGradient(0, -H * .5, 0, H * .5);
  g.addColorStop(0, back); g.addColorStop(.45, back); g.addColorStop(1, belly);
  c.beginPath(); fishBody(c); c.fillStyle = g; c.fill();
  c.save(); c.clip();
  fishPattern(c, f, t, px);
  // light from above, shade below
  c.fillStyle = 'rgba(255,255,255,.16)'; c.beginPath(); c.ellipse(f.xn - f.BL * .45, -H * .22, f.BL * .38, H * .12, 0, 0, TAU); c.fill();
  c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(f.xn - f.BL * .5, H * .5, f.BL * .6, H * .18, 0, 0, TAU); c.fill();
  c.restore();
  c.beginPath(); fishBody(c); c.lineWidth = Math.max(1.4 * line1, .005); c.strokeStyle = legend ? 'rgba(255,214,90,.85)' : 'rgba(0,0,0,.4)'; c.stroke();
  // gill cover and the near pectoral fin
  const gs = a.b === 'whisk' ? .26 : a.b === 'eel' ? .14 : .22;
  fishAt(gs, true); const gx = fpx, gy = fpy; fishAt(gs, false);
  c.beginPath(); c.moveTo(gx + .005, gy * .7); c.quadraticCurveTo(gx - .035, (gy + fpy) / 2, gx + .005, fpy * .7); c.strokeStyle = 'rgba(0,0,0,.32)'; c.lineWidth = Math.max(1.2 * line1, .004); c.stroke();
  if (a.b !== 'ray' && a.b !== 'eel') { c.save(); c.translate(gx - .03, H * .12); c.rotate(.5 + sway * 4); c.beginPath(); c.ellipse(-.05, 0, .06 * (.7 + H), .022 * (.7 + H), 0, 0, TAU); c.fillStyle = finc; c.globalAlpha = alpha * .85; c.fill(); c.globalAlpha = alpha; c.strokeStyle = 'rgba(0,0,0,.25)'; c.stroke(); c.restore(); }
  // mouth
  c.beginPath(); c.moveTo(f.xn - .002, H * .05); c.lineTo(f.xn - .035, H * .08); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = Math.max(1.2 * line1, .004); c.stroke();
  // eye
  const flatEye = a.b === 'ray' || a.b === 'flat';
  fishAt(a.b === 'whisk' ? .1 : a.b === 'pike' ? .12 : a.b === 'ray' ? .2 : .09, true);
  const ex = fpx - .004, ey = fpy * .45 - .004, er = flatEye ? .026 : Math.max(.018, H * .085) * (f.is('eye') ? 1.4 : 1) * (a.b === 'round' ? .7 : 1);
  if (f.is('glass')) { c.beginPath(); c.ellipse(ex - .02, ey - er * .6, er * 2.4, er * 2, 0, 0, TAU); c.fillStyle = 'rgba(200,255,230,.25)'; c.fill(); c.strokeStyle = 'rgba(220,255,240,.6)'; c.stroke(); }
  if (f.is('blind')) { circ(c, ex, ey, er, '#e8e6de'); circ(c, ex, ey, er * .55, 'rgba(180,186,190,.6)'); }
  else { circ(c, ex, ey, er, '#f4f0e0'); circ(c, ex + er * .1, ey, er * .72, a.ec || '#c8a040'); circ(c, ex + er * .15, ey, er * .42, '#101010'); circ(c, ex + er * .3, ey - er * .3, er * .2, '#fff'); }
  // whiskers, beard, lantern stalk and lures
  c.strokeStyle = a.b === 'whisk' || f.is('beard') ? '#2a2018' : finc; if (f.sp.area === 'chapel') c.strokeStyle = '#b8b2a4';
  fishStrokes(c, f, Math.max(1.6 * line1, .006), sway);
  if (f.is('lantern')) glow(c, f.xn + .07, -H * .52, .14, a.gl || '255,230,150', .7);
  fishLights(c, f, true, sway);
  if (legend) {   // a few slow sparkles around a Legendary
    c.fillStyle = '#fff3c4';
    for (let i = 0; i < 4; i++) {
      const k = still() ? .7 : .5 + .5 * Math.sin(t * 2 + i * 1.7), sx = -.4 + f.rnd[10 + i] * .8, sy = (f.rnd[20 + i] < .5 ? -1 : 1) * (H * .55 + .04 + f.rnd[30 + i] * .08);
      c.globalAlpha = alpha * k; starPath(c, sx, sy, .03, .012, 4); c.fill();
    }
    c.globalAlpha = alpha;
  }
}

// Pattern, scales and special skin, inside the body's clip.
function fishPattern(c, f, t, px) {
  const a = f.a, H = f.H, R = f.rnd, x0 = f.xp + .02, x1 = f.xn - .08, pc = a.pc || 'rgba(0,0,0,.35)';
  c.fillStyle = pc;
  switch (a.pat) {
    case 'spots': for (let i = 0; i < 22; i++) circ(c, lerp(x0, x1, R[40 + i]), lerp(-H * .42, H * .2, R[70 + i]), .01 + .012 * R[100 + i], pc); break;
    case 'dots': for (let i = 0; i < 44; i++) circ(c, lerp(x0, x1, R[40 + i]), lerp(-H * .45, H * .4, R[90 + i]), .005 + .005 * R[120 + i], pc); break;
    case 'bars': c.globalAlpha *= .6; for (let i = 0; i < 6; i++) { const bx = lerp(f.xn - f.BL * .2, f.xp + f.BL * .12, i / 5); ell(c, bx, -H * .15, .022 + .008 * R[40 + i], H * .42, pc); } c.globalAlpha /= .6; break;
    case 'stripe': c.globalAlpha *= .7; c.fillRect(f.xp, -H * .06, f.BL, H * .13); c.globalAlpha /= .7; break;
    case 'mottle': c.globalAlpha *= .45; for (let i = 0; i < 16; i++) ell(c, lerp(x0, x1, R[40 + i]), lerp(-H * .45, H * .3, R[60 + i]), .025 + .03 * R[80 + i], .015 + .02 * R[100 + i], pc, R[120 + i] * 3); c.globalAlpha /= .45; break;
    case 'patch': for (let i = 0; i < 4; i++) ell(c, lerp(x0 + .05, x1, R[40 + i]), lerp(-H * .4, H * .1, R[60 + i]), .06 + .05 * R[80 + i], .04 + .04 * R[100 + i], pc, R[120 + i] * 2); break;
  }
  if (f.is('stripe2')) { c.globalAlpha *= .55; ell(c, (f.xn + f.xp) / 2, -H * .03, f.BL * .44, H * .07, a.gl ? `rgb(${a.gl})` : '#ffffff'); c.globalAlpha /= .55; }
  // scales: rows of small arcs, on the portrait only where they can be seen
  const scaly = a.sc !== 0 && !['eel', 'whisk', 'ray', 'flat'].includes(a.b) && px > 70;
  if (scaly || f.is('jewel')) {
    const st = f.is('jewel') ? .045 : Math.max(.026, 6 / px);
    c.lineWidth = Math.max(.8 / px, .003); c.strokeStyle = 'rgba(0,0,0,.16)';
    for (let x = f.xn - f.BL * .22, row = 0; x > f.xp; x -= st, row++) for (let y = -H * .55 + (row % 2) * st * .5; y < H * .55; y += st) {
      if (f.is('jewel')) {   // jewel scales carry the sky's colours, slowly shifting
        c.fillStyle = `hsl(${(x * 300 + y * 200 + (still() ? 0 : t * 30)) % 360 + 360 | 0},80%,66%)`;
        c.beginPath(); c.moveTo(x, y - st * .5); c.lineTo(x - st * .45, y); c.lineTo(x, y + st * .5); c.lineTo(x + st * .45, y); c.closePath(); c.fill(); c.stroke();
      } else { c.beginPath(); c.arc(x, y, st * .55, Math.PI * .6, Math.PI * 1.4); c.stroke(); }
    }
  }
  if (f.is('scars')) { c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = Math.max(1.2 / px, .004); c.beginPath(); for (let i = 0; i < 3; i++) { const sx = lerp(x0 + .1, x1 - .05, R[130 + i]), sy = lerp(-H * .3, H * .1, R[140 + i]); c.moveTo(sx, sy); c.lineTo(sx - .05, sy + .03); } c.stroke(); }
}

// The icon: ic('fishI:' + id, px) is the painted fish, ic('fishI:' + id + ':shadow', px) its silhouette, fitted into the box.
ICON.fishI = (c, id, mode) => {
  if (!SPECIES[id]) return;
  const f = fishShape(id), len = Math.min(1.9 / (f.bx1 - f.bx0), 1.9 / (f.by1 - f.by0)), T = c.getTransform();
  drawFish(c, id, -(f.bx0 + f.bx1) / 2 * len, -(f.by0 + f.by1) / 2 * len, len,
    { mode: mode === 'shadow' ? 'shadow' : 'full', pale: false, t: 0, wag: 0, ppu: T.a / Math.min(window.devicePixelRatio || 1, 2) });
};
