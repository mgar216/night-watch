// ---------- Seasons and weather: the tree follows the real calendar, and some Nights have weather that nudges the raid ----------
// Called by the other files:
//   seasonLeaf()            the four leaf colours drawTree uses, darkest first
//   seasonGround()          [ground, shadow under the tree] colours for drawTree
//   seasonTree(c, t, rooms) from drawTree, inside the tree's transform, under the placed items: snow, blossom and the
//                           like; rooms is the number of rooms the treehouse has (1 slide, 2 kitchen, 3 observatory)
//   seasonFx(c, t, n)       from drawTree, after the transform is undone (screen space): petals, leaves, snow, and the rain
//                           or wind of Night n (tonight's, unless a raid that is over still shows its own)
//   nightWeather(n)         the weather of Night n: { k: 'clear' | 'rain' | 'wind' | 'snow', slow: 0 to .25 }; the raid
//                           moves its magpies slower by `slow` (src/90-tinker.js); the object is shared, read it only
//   weatherLine(n)          the text key of the owl's sentence about that weather for the briefing, or ''
// Tests and screenshots force the month and tonight's weather here: { m: 0 to 11, w: 'clear' | 'rain' | 'wind' | 'snow' };
// either key may be left out.
let seaForce = null;
// The season of the month, northern hemisphere: 0 winter (December to February), 1 spring, 2 summer, 3 autumn. Every frame
// asks for it several times, so the calendar is read at most once a second.
let seaMon = 0, seaAt = -1e4;
const seaSeason = () => {
  const now = Date.now();
  if (now - seaAt > 1e3 || now < seaAt) { seaAt = now; seaMon = new Date(now).getMonth(); }
  return ((seaForce && seaForce.m >= 0 ? seaForce.m : seaMon) + 1) % 12 / 3 | 0;
};
const seaWrap = (v, m) => v - Math.floor(v / m) * m;

// Leaves darkest first (index 1 is the main colour), and [ground, shadow under the tree]. Summer is the tree as it always
// was. Every season stays dark enough for the night, so the coverage rings, the placed things and the magpies still read.
const SEA_LEAF = [['#173440', '#1e424c', '#265058', '#305e64'], ['#264a20', '#305e29', '#3a7031', '#46823a'],
  ['#1a4c33', '#1f5a3c', '#246a45', '#2b7a50'], ['#52281a', '#70391d', '#834d20', '#946226']];
const SEA_GROUND = [['#33426f', '#3b4b7b'], ['#0c1a40', '#13275a'], ['#0c1740', '#13235a'], ['#121640', '#1b2258']];
function seasonLeaf() { return SEA_LEAF[seaSeason()]; }
function seasonGround() { return SEA_GROUND[seaSeason()]; }

// ----- On the tree (tree units): snow lies on the roofs, the rails, the branches and the tops of the leaf balls; blossom sits
// on the leaf balls; autumn's leaves lie at the foot. All of it keeps off the windows, the jars, the door, the ladder, the
// owl's place, the flag and the item spots, and the placed things are drawn over it anyway. -----
const SEA_SNOW = '#e4ecfb';
// The branches as drawTree draws them, with where the snow on top may start (clear of the trunk and the ladder).
const SEA_BRANCH = [[470, 430, 70, 330, .05], [530, 410, 930, 300, .19], [462, 650, 90, 610, .05], [538, 630, 910, 670, .17]];
// Every leaf ball: [x, y, r, blossoms] (the crown, then the tip and the middle of each branch).
const SEA_BALL = [[500, 110, 150, 9], [330, 170, 90, 7], [680, 160, 95, 7]];
for (const [x1, y1, x2, y2] of SEA_BRANCH) SEA_BALL.push([x2, y2 - 20, 58, 5], [lerp(x1, x2, .55), lerp(y1, y2, .55) - 46, 34, 2]);
const SEA_DOT = [-.5, -.45, .55, -.5, .15, -.85, 0, -.15, .9, -.05, -.8, .05, .4, .2, -.3, .3, -.15, -.6];   // blossom spots on a ball, in its radii
// Snow along a round top: a band on the arc from angle a to b (canvas angles, -PI / 2 is straight up) with two lumps under it.
function seaCap(c, x, y, r, w, a, b) {
  c.beginPath(); c.arc(x, y, r, a, b); c.lineWidth = w; c.strokeStyle = SEA_SNOW; c.lineCap = 'round'; c.stroke();
  for (let k = .3; k < 1; k += .4) { const q = lerp(a, b, k); circ(c, x + Math.cos(q) * (r - w * .45), y + Math.sin(q) * (r - w * .45), w * .32, SEA_SNOW); }
}
const SEA_LEAVES = [175, 250, 330, 445, 478, 628, 700, 760, 805], SEA_AUT = ['#b86a2a', '#c4933a', '#94432a'];   // autumn's fallen leaves: x, colours
const SEA_DRIFTS = [425, 36, 9, 368, 22, 6, 632, 28, 8, 690, 18, 5];   // winter's snow at the foot: x, half width, height
// A blossom: five round petals and a pale yellow heart.
function seaBloom(c, x, y, r, col) {
  c.beginPath();
  for (let i = 0; i < 5; i++) { const a = i * TAU / 5 - Math.PI / 2, px = x + Math.cos(a) * r * .55, py = y + Math.sin(a) * r * .55; c.moveTo(px + r * .48, py); c.arc(px, py, r * .48, 0, TAU); }
  c.fillStyle = col; c.fill(); circ(c, x, y, r * .3, '#ffe9a8');
}
// Blossom only where the leaf ball shows: not under the roof or the cabin, the flag or the observatory.
const seaOpen = (x, y, rooms) => !(x > 360 && x < 640 && y > 204 - 102 * Math.max(0, 1 - Math.abs(x - 500) / 128)) && !(x > 600 && x < 712 && y > 70 && y < 210)
  && !(rooms >= 3 && x > 268 && x < 372 && y > 80 && y < 200);
function seasonTree(c, t, rooms) {
  const s = seaSeason();
  if (s === 0) {
    line(c, [400, 189, 500, 109, 600, 189], SEA_SNOW, 13);   // the roof, short of the eaves and of the flag's pole
    for (const x of [425, 465, 535, 575]) circ(c, x, 218 - 102 * (1 - Math.abs(x - 500) / 128), 4.5, SEA_SNOW);
    line(c, [306, 294, 342, 294], SEA_SNOW, 5); line(c, [604, 294, 696, 294], SEA_SNOW, 5);   // the rails, short of the deck's jars and the posts
    for (const [x1, y1, x2, y2, u] of SEA_BRANCH) for (const [a, b] of [[u, .46], [.64, .86]]) line(c, [lerp(x1, x2, a), lerp(y1, y2, a) - 14, lerp(x1, x2, b), lerp(y1, y2, b) - 14], SEA_SNOW, 7);
    // a cap on each leaf ball; the right crown's starts higher, above the flag, and the left one beside the telescope
    for (const [x, y, r] of SEA_BALL) seaCap(c, x + r * .1, y - r * .45, r * .58, r * .16, x === 680 ? -2.1 : rooms >= 3 && x === 330 ? -2.15 : -2.45, -.69);
    if (rooms >= 2) line(c, [295, 453, 380, 417, 465, 453], SEA_SNOW, 10);   // the kitchen roof
    if (rooms >= 3) { seaCap(c, 320, 152, 42, 8, -1.3, -.4); seaCap(c, 320, 152, 42, 8, -2.75, -2.4); }   // the dome, beside its slit and telescope
    for (let i = 0; i < 12; i += 3) { c.beginPath(); c.ellipse(SEA_DRIFTS[i], 933, SEA_DRIFTS[i + 1], SEA_DRIFTS[i + 2], 0, Math.PI, TAU); c.fillStyle = SEA_SNOW; c.fill(); }
  } else if (s === 1) {
    for (const [x, y, r, n] of SEA_BALL) for (let i = 0; i < n; i++) {
      const bx = x + SEA_DOT[i * 2] * r, by = y + SEA_DOT[i * 2 + 1] * r;
      if (seaOpen(bx, by, rooms)) seaBloom(c, bx, by, Math.max(5.5, r * .075), i % 3 ? '#ee9fc2' : '#f6cfe0');
    }
  } else if (s === 3) {
    for (let i = 0; i < 9; i++) ell(c, SEA_LEAVES[i], 936 + hash(i + 70) * 9, 9, 4, SEA_AUT[i % 3], hash(i + 80) * TAU);
    rr(c, 347, 917, 10, 15, 3); c.fillStyle = '#e8dcc0'; c.fill();   // a mushroom by the roots
    c.beginPath(); c.ellipse(352, 919, 14, 10, 0, Math.PI, TAU); c.fillStyle = '#b8432e'; c.fill();
    circ(c, 346, 914, 2, '#f4ead6'); circ(c, 356, 912, 1.6, '#f4ead6');
  }
}

// ----- Over the whole screen: the season's own drift (spring petals, autumn leaves, a little winter snow) and tonight's
// weather on top. Every place comes from hash(i), so a frame makes no arrays; at most 60 particles (spring petals and rain), all thin and pale,
// so the magpies of a raid stay easy to see. With motion reduced: every other particle, standing still. -----
const SEA_FALL = ['rgba(214,132,52,.75)', 'rgba(222,178,72,.75)', 'rgba(178,82,46,.75)'], SEA_DRIFT = [12, 34, 10, 26, 0, 0, 8, 44];   // autumn's colours; per season: count, fall speed
function seasonFx(c, t, n = S.night) {
  const s = seaSeason(), k = nightWeather(n).k, calm = still(), tt = calm ? 0 : t, step = calm ? 2 : 1;
  const w = V.w + 40, h = V.h + 40, z = Math.max(1, Math.min(V.w, V.h) / 500), gust = k === 'wind' ? 160 : 0;
  c.save();
  for (let i = 0, n = SEA_DRIFT[s * 2], fall = SEA_DRIFT[s * 2 + 1]; i < n; i += step) {
    const sway = Math.sin(tt * (.8 + hash(i + 3) * .6) + i * 2.1);
    const x = seaWrap(hash(i + 11) * w + tt * (14 + gust) + sway * 22 * z, w) - 20, y = seaWrap(hash(i + 31) * h + tt * fall * (.7 + hash(i + 51) * .6) * z, h) - 20;
    if (s === 0) circ(c, x, y, (1.2 + hash(i + 71)) * z, 'rgba(236,243,255,.6)');
    else ell(c, x, y, (s === 1 ? 3 : 4.2) * z, 2 * z, s === 1 ? 'rgba(244,184,212,.7)' : SEA_FALL[i % 3], sway * 1.2 + i);
  }
  c.beginPath();
  if (k === 'rain') {
    for (let i = 0; i < 26; i += step) { const x = seaWrap(hash(i + 101) * w - tt * 120, w) - 20, y = seaWrap(hash(i + 131) * h + tt * (520 + hash(i + 161) * 160), h) - 20; c.moveTo(x, y); c.lineTo(x - 3.2 * z, y + 16 * z); }
    c.lineWidth = 1.2 * z; c.strokeStyle = 'rgba(190,214,255,.4)'; c.stroke();
  } else if (k === 'wind') {
    for (let i = 0; i < 12; i += step) { const L = (60 + hash(i + 191) * 70) * z, x = seaWrap(hash(i + 201) * (w + L) + tt * (420 + hash(i + 221) * 200), w + L) - L, y = V.h * (.08 + hash(i + 241) * .8) + Math.sin(tt * 2 + i) * 8; c.moveTo(x, y); c.quadraticCurveTo(x + L * .25, y - 8 * z, x + L * .5, y); c.quadraticCurveTo(x + L * .75, y + 8 * z, x + L, y); }
    c.lineWidth = 1.8 * z; c.strokeStyle = 'rgba(226,236,255,.45)'; c.stroke();
  } else if (k === 'snow') {
    for (let i = 0; i < 24; i += step) { const r = (1.8 + hash(i + 261) * 1.6) * z, x = seaWrap(hash(i + 281) * w + tt * 18 + Math.sin(tt * (.6 + hash(i + 301) * .5) + i) * 26 * z, w) - 20, y = seaWrap(hash(i + 321) * h + tt * (52 + hash(i + 341) * 30) * z, h) - 20; c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }
    c.fillStyle = 'rgba(240,246,255,.7)'; c.fill();
  }
  c.restore();
}

// ----- Weather is the Night's own, not the real one: the same Night always brings the same weather. Nights 1 to 3 are clear;
// from Night 4 on, one Night in each three has weather, the first or the second of the three, so two such Nights never follow
// each other. In the winter months the rain falls as snow: only the picture changes, not the strength, so a test raid on
// the last day of February still predicts the raid on the first of March. -----
const SEA_WX = { clear: { k: 'clear', slow: 0 }, rain: { k: 'rain', slow: .15 }, wind: { k: 'wind', slow: .1 }, snow: { k: 'snow', slow: .15 } };
for (const k in SEA_WX) Object.freeze(SEA_WX[k]);
function nightWeather(n) {
  if (seaForce && has(SEA_WX, seaForce.w)) return SEA_WX[seaForce.w];
  const b = Math.floor((n - 1) / 3);
  if (!(b > 0) || (n - 1) % 3 !== (hash(b + .5) < .5 ? 0 : 1)) return SEA_WX.clear;
  return SEA_WX[hash(b + .25) < .4 ? 'wind' : seaSeason() ? 'rain' : 'snow'];
}
function weatherLine(n) { return { rain: 'wx_rain', wind: 'wx_wind', snow: 'wx_snow' }[nightWeather(n).k] || ''; }
