// ---------- Gifts from the water: what the Legendary fish of the day leave at the treehouse of the night ----------
// A gift shows once the owl has told the player about it (S.gifts[id] === 1, set in giftNews in src/50-ui.js).
// Called by the other files:
//   giftSky(c, t)        from drawSky, over the cached sky and under the twinkling stars: the gifts that live in the sky
//   giftTree(c, T, t)    from the menu scenes (home, Night menu, first light, bedtime), after drawTree and before the owl:
//                        the gifts around the tree; T is the tree's transform { k, ox, oy }
//   giftTap(lx, ly, T)   from menuTap, in tree coordinates: true when a gift answered the tap
//   giftAt(id, T)        where the gift is on the screen, [x, y], for the sparkle that shows it for the first time
const GIFTS = ['biscuit', 'heron', 'lanternjaw', 'noise', 'millstone', 'aurora', 'wave', 'postman', 'bell'];
const giftT = {};   // when each gift was last tapped
// `#gifts` in the address shows every gift at once, for a grown-up's look at them; nothing of it is saved.
const giftPeek = location.hash === '#gifts' ? Object.fromEntries(GIFTS.map(id => [id, 1])) : null, giftOn = () => giftPeek || S.gifts;
// The fish are caught in any order, so every gift looks right on its own. On a small screen the things on the ground keep a
// readable size: Biscuit is scaled by giftM, the bell, the lantern and the millstone by the larger giftL (the millstone only
// as far as the room between the slide and the big jar allows), each around its own anchor. All keep clear of the roots,
// the ladder, both ground spots, the slide, the big jar, the magpies' nest tree and the helper, whose big cap and beak
// reach far to the left and whose tail hangs over the pond.
const giftM = T => Math.max(1, .44 / T.k), giftL = T => Math.max(1, .58 / T.k);
Object.assign(sfx, {
  splash: () => { tone(240, .12, 'sine', .12, 0, 560); noise(.3, .08, 1300, .05); },
  toll: () => { tone(196, 2.6, 'sine', .09, 0, 0, .005); tone(235, 1.6, 'sine', .03, 0, 0, .005); tone(392, 1.1, 'sine', .025, 0, 0, .005); },   // one soft, low bell note
  heron: () => { tone(560, .12, 'triangle', .06, 0, 420); tone(500, .16, 'triangle', .05, .15, 360); },
});
// Soft round lights (the mist, the teal lights, the lantern's light) share three gradients made once on a unit circle and
// scaled where they are drawn, so no frame makes new ones. i: 0 pale mist, 1 teal, 2 warm.
let giftGlows = null, giftWater = null;
function giftDot(c, x, y, rx, ry, i, a) {
  if (!giftGlows) giftGlows = ['225,235,255', '110,235,215', '255,205,120'].map(rgb => {
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(.4, `rgba(${rgb},.5)`); g.addColorStop(1, `rgba(${rgb},0)`);
    return g;
  });
  c.save(); c.translate(x, y); c.scale(rx, ry); c.globalAlpha = a; c.fillStyle = giftGlows[i]; c.fillRect(-1, -1, 2, 2); c.restore();
}

// ----- In the sky (every scene with the night sky) -----
const GIFT_AURORA = ['120,255,170', '80,215,235', '175,135,255'];   // green, teal, violet
const GIFT_WAVE = [0, .95, .28, .55, .58, .1, .9, .18, .78, .6];    // five stars in a breaking wave, in a box 1 wide and .45 high
// The wave constellation sits where the menu screens leave open sky: right of the crown on a wide screen, under the top
// bar on the left on a tall one. [x, y, size]
const giftWaveBox = () => { const s = Math.min(V.w, V.h) * .22; return wide() ? [V.w * .42, V.h * .05, s] : [V.w * .04, V.h * .1, s]; };
// One ribbon of the northern lights: its top edge waves, it is thickest in the middle and thin at both ends; `grow` widens it
// all round for the soft glow behind it.
function giftRibbon(c, x0, x1, top, H, A, f, ph, wob, grow) {
  c.beginPath();
  for (let i = 0; i <= 28; i++) { const u = i / 28; c.lineTo(lerp(x0, x1, u), top - grow + A * Math.sin(u * f * TAU + ph)); }
  for (let i = 28; i >= 0; i--) { const u = i / 28; c.lineTo(lerp(x0, x1, u), top + grow + A * Math.sin(u * f * TAU + ph) + H * Math.pow(Math.sin(Math.PI * u), .6) * (.75 + .25 * Math.sin(u * 7 + wob))); }
}
function giftSky(c, t) {
  const g = giftOn(), w = V.w, h = V.h, calm = still(), tt = calm ? 0 : t;
  if (g.aurora === 1) {
    // Northern lights: three ribbons, brightest near their lower edge, with a fainter, wider copy behind each one for a soft
    // glow. They wave slowly and end short of the moon. One gradient per ribbon.
    const x0 = -w * .05, x1 = w * .74, A = h * .025;
    for (let r = 0; r < 3; r++) {
      const H = h * (.11 - .016 * r), top = h * (.1 + .07 * r) - H / 2, f = 1.2 + .45 * r, ph = tt * (.22 + .06 * r) + r * 2.1, wob = tt * .4 + r;
      const gr = c.createLinearGradient(0, top - 2 * A, 0, top + H + 2 * A), rgb = GIFT_AURORA[r];
      gr.addColorStop(0, `rgba(${rgb},0)`); gr.addColorStop(.42, `rgba(${rgb},.2)`); gr.addColorStop(.76, `rgba(${rgb},.45)`); gr.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = gr;
      c.globalAlpha = .35; giftRibbon(c, x0, x1, top, H, A, f, ph, wob, A); c.fill();
      c.globalAlpha = 1; giftRibbon(c, x0, x1, top, H, A, f, ph, wob, 0); c.fill();
    }
  }
  if (g.wave === 1) {
    const [bx, by, s] = giftWaveBox();
    c.beginPath();
    for (let i = 0; i < 10; i += 2) c.lineTo(bx + GIFT_WAVE[i] * s, by + GIFT_WAVE[i + 1] * s * .45);
    c.lineWidth = 1.2; c.strokeStyle = 'rgba(220,232,255,.3)'; c.stroke();
    for (let i = 0; i < 10; i += 2) {
      const x = bx + GIFT_WAVE[i] * s, y = by + GIFT_WAVE[i + 1] * s * .45, R = s * (.05 + (calm ? 0 : .008 * Math.sin(t * 1.7 + i)));
      circ(c, x, y, R * 1.9, 'rgba(220,232,255,.13)'); starPath(c, x, y, R, R * .38, 4); c.fillStyle = '#eef4ff'; c.fill();
    }
    // Every 10 to 14 seconds a silver streak crosses the sky (not with motion reduced).
    const n = Math.floor(t / 12), d = t - n * 12 - 2 * hash(n + 3);
    if (!calm && d > 0 && d < 1.1) {
      const u = d / 1.1, dx = -w * .42, dy = h * .12, x = w * (.62 + .2 * hash(n + 5)) + dx * u, y = h * (.03 + .05 * hash(n + 9)) + dy * u;
      c.globalAlpha = Math.min(1, (1 - u) * 4);
      line(c, [x - dx * .16, y - dy * .16, x, y], 'rgba(225,235,255,.4)', 2.5); line(c, [x - dx * .06, y - dy * .06, x, y], 'rgba(255,255,255,.85)', 1.5);
      starPath(c, x, y, 5, 2, 4); c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1;
    }
  }
}

// ----- Around the tree (menu scenes); all in tree units -----
// Grandpa Biscuit, facing left with the middle of his body at (x, y): a deep golden sunfish with dark bars, a spiny back fin,
// the gold crown of a Legendary on his head (as in the fishing game) and long pale whiskers.
function giftFish(c, x, y, r) {
  c.save(); c.translate(x, y); c.rotate(r);
  poly(c, [18, -2, 28, -11, 30, 0, 28, 11, 18, 2], '#b0682a');
  poly(c, [-6, -13, -3, -21, 0, -14, 3, -21, 6, -14, 9, -20, 12, -11], '#b0682a'); c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,232,180,.8)'; c.stroke();
  ell(c, 0, 0, 21, 15, '#d99a42'); c.lineWidth = 1.4; c.strokeStyle = 'rgba(255,232,180,.85)'; c.stroke();
  for (let i = 0; i < 3; i++) line(c, [-4 + i * 7, -13, -6 + i * 7, 13], 'rgba(160,96,36,.85)', 2.6);
  poly(c, [-17, -8, -17, -15, -14.5, -11, -12, -17, -9.5, -12, -7, -15, -7, -11], '#ffd24a');
  circ(c, -14, -3, 2.8, '#fff4dc'); circ(c, -14.6, -3, 1.5, '#2a1a0a');
  line(c, [-20, 2, -25, 6, -27, 12], '#f3e2b8', 1.2); line(c, [-19, 4, -22, 10, -22, 15], '#f3e2b8', 1.2);
  c.restore();
}
// The pond: moonlit water with slow rings and Grandpa Biscuit in its right part, who rises and sinks slowly and leaps when
// tapped. At the top rank the helper's tail is just above him, so there the leap stays low. lamp: the lantern's light (0 none).
function giftPond(c, m, tt, now, calm, lamp) {
  if (!giftWater) { giftWater = c.createLinearGradient(0, 932, 0, 972); giftWater.addColorStop(0, '#3d64b2'); giftWater.addColorStop(1, '#1c357a'); }
  ell(c, 752, 952, 78, 20, giftWater); c.lineWidth = 2.5; c.strokeStyle = 'rgba(175,208,255,.6)'; c.stroke();
  if (lamp) giftDot(c, 788, 950, 36, 8, 2, lamp);
  c.lineWidth = 2; c.strokeStyle = '#e6efff';
  for (let i = 0; i < 3; i++) {   // the moon's glints
    c.globalAlpha = calm ? .5 : .35 + .25 * Math.sin(tt * 1.3 + i * 2);
    c.beginPath(); c.moveTo(712 + i * 14, 943 + i * 6); c.lineTo(728 + i * 8, 943 + i * 6); c.stroke();
  }
  c.lineWidth = 1.5; c.strokeStyle = '#c8e1ff';
  for (let i = 0; i < 2; i++) {
    const u = calm ? .3 + .35 * i : (tt / 6 + i / 2) % 1, rx = 6 + 30 * u;
    c.globalAlpha = .5 * (1 - u); c.beginPath(); c.ellipse(i ? 728 : 790, i ? 958 : 953, rx, rx * .27, 0, 0, TAU); c.stroke();
  }
  c.globalAlpha = 1;
  const d = now - (giftT.biscuit || -99), jump = !calm && d < 1.1;
  c.save(); c.translate(790, 955); c.scale(m, m);
  c.save(); c.beginPath(); c.rect(-60, -80, 120, 81); c.clip();   // only what is above the water shows
  if (jump) { const p = d / 1.1, J = rank() === 3 ? 9 : 26; giftFish(c, 9 - 18 * p, 16 - (16 + J) * Math.sin(Math.PI * p), .55 - 1.1 * p); }
  else giftFish(c, 0, calm ? 0 : 6 + 6 * Math.sin(tt * TAU / 7), 0);
  c.restore();
  c.lineWidth = 1.2; c.strokeStyle = '#d9ecff';
  if (!jump) { c.globalAlpha = .5; c.beginPath(); c.ellipse(0, 0, 23, 3.5, 0, 0, TAU); c.stroke(); }
  if (!calm) {   // now and then a bubble
    const b = (tt / 5.3) % 1;
    if (b < .3) { c.globalAlpha = 1 - b / .3; c.beginPath(); c.arc(-26, -2 - b * 16, 1.6 + b * 4, 0, TAU); c.stroke(); }
  }
  if (d < 1.6) {   // the splash: a ring and drops where he leaves the water and where he comes back (with motion reduced a still ring)
    for (let s = 0; s < (calm ? 1 : 2); s++) {
      const q = calm ? .3 : d - s * .95, sx = calm ? 0 : s ? -9 : 9;
      if (q < 0 || q > .6) continue;
      c.globalAlpha = 1 - q / .6; c.beginPath(); c.ellipse(sx, 1, 8 + 40 * q, 2 + 10 * q, 0, 0, TAU); c.stroke();
      if (!calm) for (let j = 0; j < 5; j++) circ(c, sx + (j - 2) * 22 * q, -(55 + 12 * (j % 2)) * q + 140 * q * q, 1.6, '#d9ecff');
    }
  }
  c.globalAlpha = 1; c.restore();
}
// The heron, feet at (0, 0), facing left: slim and long-legged, about 90 tall. It keeps this size on every screen: larger,
// its head would hide behind the helper's big cap. up 0: asleep, head on its shoulders and eye shut; 1: neck up, eye open.
// a: the way the long bill points (PI / 2 down, more is forward). wet: it stands in the pond (a ripple), else on the grass.
function giftHeron(c, up, a, br, wet) {
  if (wet) { c.beginPath(); c.ellipse(.5, 0, 8, 2, 0, 0, TAU); c.lineWidth = 1.2; c.strokeStyle = 'rgba(200,225,255,.6)'; c.stroke(); }
  else ell(c, 1, 0, 11, 2.6, 'rgba(4,8,28,.45)');
  line(c, [0, 0, .3, -40], '#e2cc94', 2.4);                  // the leg it stands on
  line(c, [1.5, -45, 6.5, -39, 2.5, -35], '#d3bc86', 2);     // the other one, tucked up
  poly(c, [7, -44, 13, -35, 3, -40], '#5d6f8a');
  c.save(); c.translate(2, -57); c.rotate(-.15); c.scale(1, br);
  ell(c, 0, 0, 9.5, 18, '#8698b3'); c.lineWidth = 1.3; c.strokeStyle = 'rgba(228,238,255,.7)'; c.stroke();
  ell(c, 2.5, 2, 7, 14.5, '#6a7d9b'); ell(c, -5.5, -2, 3.8, 12, '#e3e9f1');
  c.restore();
  const hx = -2.5 - 1.5 * up, hy = -79 - 4 * up, ca = Math.cos(a), sa = Math.sin(a);   // awake, the head rises only as far as the helper's cap leaves room
  if (up > .05) line(c, [-1, -71, hx + .5, hy + 3], '#e3e9f1', 5 * up);   // the neck
  line(c, [hx + ca * 5, hy + sa * 5, hx + ca * 15, hy + sa * 15], '#f0c25a', 2.4);
  circ(c, hx, hy, 6.3, '#eef2f8'); c.lineWidth = 1; c.strokeStyle = 'rgba(140,160,195,.9)'; c.stroke();
  line(c, [hx + 1, hy - 4.6, hx + 4.5, hy - 4.2, hx + 7, hy - 1.8], '#1d2638', 1.8);   // the black plume
  if (up > .5) { circ(c, hx - 2.4, hy - .6, 1.7, '#1d2638'); circ(c, hx - 2.7, hy - 1.1, .55, '#fff'); }
  else line(c, [hx - 4.2, hy - .6, hx - 2.4, hy + .6, hx - .6, hy - .6], '#1d2638', 1.1);
}
// A lantern on a short cord from (0, 0): fl makes the flame flicker, f (0..1) flares it after a tap.
function giftLantern(c, fl, f) {
  line(c, [0, 0, 0, 13], '#2a1d12', 2);
  c.beginPath(); c.arc(0, 15.5, 3, 0, TAU); c.lineWidth = 1.6; c.strokeStyle = '#d9c08a'; c.stroke();
  poly(c, [-7, 18, 7, 18, 14, 25, -14, 25], '#3d3b4c'); c.lineWidth = 1; c.strokeStyle = 'rgba(255,236,190,.7)'; c.stroke();
  rr(c, -15, 25, 30, 30, 5); c.fillStyle = `rgba(255,214,130,${.6 + .3 * f})`; c.fill();
  c.lineWidth = 5; c.strokeStyle = 'rgba(255,236,190,.6)'; c.stroke(); c.lineWidth = 3; c.strokeStyle = '#4a3a2a'; c.stroke();
  line(c, [-5, 26, -5, 54], '#4a3a2a', 1.5); line(c, [5, 26, 5, 54], '#4a3a2a', 1.5);
  ell(c, 0, 42 - 2 * fl, 4.5 * (1 + .4 * f), 8 * fl * (1 + .3 * f), '#ffad3b'); ell(c, 0, 43, 2.2, 4.5 * fl, '#fff6d0');
  rr(c, -12, 55, 24, 5, 2); c.fillStyle = '#3d3b4c'; c.fill();
}
// A small bronze bell on a cord from (0, 0), with a tiny fish tail for a clapper.
function giftBell(c) {
  line(c, [0, 0, 0, 10], '#2a1d12', 2);
  c.beginPath(); c.arc(0, 11.5, 3, 0, TAU); c.lineWidth = 1.6; c.strokeStyle = '#8a6a34'; c.stroke();
  c.beginPath(); c.moveTo(-7, 14); c.bezierCurveTo(-15, 14, -14, 34, -20, 46); c.lineTo(20, 46); c.bezierCurveTo(14, 34, 15, 14, 7, 14); c.closePath();
  c.fillStyle = '#c58e3e'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,232,185,.8)'; c.stroke();
  line(c, [-8, 19, -11, 32, -14, 41], 'rgba(255,240,205,.55)', 2.2);
  ell(c, 0, 46, 20, 3.5, '#93622a');
  poly(c, [0, 47, -5.5, 55, 0, 52, 5.5, 55], '#e7a85a');
}
// The millstone stands on its edge between the slide and the big jar: grey stone, grooves, a square eye, moss on top.
function giftMill(c) {
  ell(c, 0, 0, 24, 3.5, 'rgba(4,8,28,.45)');
  circ(c, 0, -22, 22, '#8d92a2'); c.lineWidth = 2; c.strokeStyle = 'rgba(228,234,248,.8)'; c.stroke();
  c.beginPath(); c.arc(0, -22, 15, 0, TAU); c.lineWidth = 1.2; c.strokeStyle = 'rgba(70,74,90,.6)'; c.stroke();
  for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + .4; line(c, [Math.cos(a) * 7, -22 + Math.sin(a) * 7, Math.cos(a + .5) * 19, -22 + Math.sin(a + .5) * 19], '#6b6f80', 1.6); }
  rr(c, -5, -27, 10, 10, 1.5); c.fillStyle = '#1b2348'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = 'rgba(228,234,248,.6)'; c.stroke();
  circ(c, -9, -40, 4.5, '#4f8a43'); circ(c, -2, -43, 5.5, '#5f9a4a'); circ(c, 6, -42, 5, '#4f8a43'); circ(c, 12, -38, 3.8, '#6aa852');
}
// The bell tolls by itself every 50 to 80 seconds while a menu screen shows it (quietly: the phone only buzzes for a tap),
// and at once when tapped.
let giftBellAt = 0, giftSeen = -9;   // when it tolls next; when a menu screen last drew the gifts
function giftToll() { giftT.bell = V.t; giftBellAt = V.t + 50 + Math.random() * 30; sfx.toll(); }

function giftTree(c, T, t) {
  const g = giftOn(), k = T.k, m = giftM(T), mL = giftL(T), calm = still(), tt = calm ? 0 : t, now = V.t;
  if (g.bell === 1) { if (now - giftSeen > 1) giftBellAt = now + 50 + Math.random() * 30; else if (now > giftBellAt) giftToll(); giftSeen = now; }
  const lit = g.lanternjaw === 1, fa = Math.max(0, 1 - (now - (giftT.lanternjaw || -99))), fl = calm ? 1 : 1 + .07 * Math.sin(t * 9) + .05 * Math.sin(t * 13.7);
  c.save(); c.translate(T.ox, T.oy); c.scale(k, k); c.lineCap = c.lineJoin = 'round';
  if (g.noise === 1) {   // mist: five soft pale ellipses drifting along the ground, in front of the roots
    const x0 = -T.ox / k - 220, span = V.w / k + 440;
    for (let i = 0; i < 5; i++) giftDot(c, x0 + (hash(i + 21) * span + tt * (8 + 6 * hash(i + 61))) % span, 916 + 18 * hash(i + 31), 150 + 70 * hash(i + 41), 11 + 6 * hash(i + 51), 0, .1 + .06 * hash(i + 71));
  }
  if (g.millstone === 1) { const s = Math.min(1.45, mL); c.save(); c.translate(228, 930); c.scale(s, s); giftMill(c); c.restore(); }   // wider would touch the slide or the jar
  if (g.biscuit === 1) giftPond(c, m, tt, now, calm, lit ? (.3 + .25 * fa) * fl : 0);
  if (g.heron === 1) {   // asleep on one leg; awake at first light; a tap: it lifts its head and looks around for a second and a half
    const d = now - (giftT.heron || -99), look = d < 1.5, dawn = scene === scenes.dawn;
    const up = Math.max(dawn ? 1 : 0, look ? (calm ? 1 : Math.min(1, d / .2, (1.5 - d) / .25)) : 0);
    const a = look && !calm ? 2.02 + .26 * Math.sin(d * 7) : up ? 2.15 : 2.05;
    c.save(); c.translate(690, 962); giftHeron(c, up, a, up < .5 ? 1 + .03 * Math.sin(tt * 1.7) : 1, g.biscuit === 1); c.restore();
  }
  if (lit) {   // the lantern under the lower right branch: warm light all around it; a tap flares it for a second
    const r = 150 * mL * (1 + .2 * fa);
    giftDot(c, 790, 668 + 40 * mL, r, r, 2, (.42 + .3 * fa) * fl);
    c.save(); c.translate(790, 668); c.scale(mL, mL); giftLantern(c, fl, fa); c.restore();
  }
  if (g.bell === 1) {   // the bell under the lower left branch: it swings when it tolls, and one faint ring spreads from it
    const d = now - (giftT.bell || -99);
    c.save(); c.translate(340, 650); c.scale(mL, mL); c.rotate(calm || d > 3 ? 0 : .3 * Math.sin(d * 7) * Math.exp(-d * 1.5)); giftBell(c); c.restore();
    if (d < (calm ? 1.2 : 1.8)) {
      const u = calm ? .3 : d / 1.8;
      c.globalAlpha = .55 * (1 - u); c.beginPath(); c.arc(340, 650 + 30 * mL, (24 + 110 * u) * mL, 0, TAU); c.lineWidth = 3; c.strokeStyle = '#ffe2a8'; c.stroke(); c.globalAlpha = 1;
    }
  }
  c.restore();
  // Slow teal lights rise from the ground around the tree and fade near the crown (screen space, like the fireflies).
  if (g.postman === 1) for (let i = 0; i < 7; i++) {
    const u = calm ? .12 + .76 * hash(i + 91) : (t / (24 + 10 * hash(i + 81)) + hash(i + 91)) % 1, a = calm ? .7 : Math.sin(Math.PI * u);
    const x = T.ox + (150 + 700 * hash(i + 101) + (calm ? 0 : 22 * Math.sin(t * .45 + i * 1.7))) * k, y = T.oy + (925 - 660 * u) * k;
    giftDot(c, x, y, 18, 18, 1, a * .55); c.globalAlpha = a; circ(c, x, y, 2.6, '#d2fff6'); c.globalAlpha = 1;
  }
}

// A tap on the menu screen, in tree units. The heron is checked before the pond it stands in.
function giftTap(lx, ly, T) {
  const g = giftOn(), mL = giftL(T), r = Math.max(60, 26 / T.k), e = Math.max(16, 12 / T.k), px = (lx - 752) / (78 + e), py = (ly - 952) / (20 + e);
  let id = '';
  if (g.heron === 1 && Math.hypot(lx - 690, ly - 917) < r) id = 'heron';
  else if (g.biscuit === 1 && px * px + py * py < 1) id = 'biscuit';
  else if (g.lanternjaw === 1 && Math.hypot(lx - 790, ly - 668 - 40 * mL) < r) id = 'lanternjaw';
  else if (g.bell === 1 && Math.hypot(lx - 340, ly - 650 - 30 * mL) < r) id = 'bell';
  if (!id) return false;
  if (id === 'bell') { giftToll(); buzz(20); }
  else { giftT[id] = V.t; (id === 'heron' ? sfx.heron : id === 'biscuit' ? sfx.splash : sfx.puff)(); }
  return true;
}
function giftAt(id, T) {
  const mL = giftL(T), p = { biscuit: [790, 948], heron: [690, 917], lanternjaw: [790, 668 + 40 * mL], noise: [500, 925], millstone: [228, 930 - 22 * Math.min(1.45, mL)], postman: [500, 700], bell: [340, 650 + 30 * mL] }[id];
  if (p) return [T.ox + p[0] * T.k, T.oy + p[1] * T.k];
  if (id === 'wave') { const [x, y, s] = giftWaveBox(); return [x + s * .5, y + s * .2]; }
  return wide() ? [V.w * .45, V.h * .12] : [V.w * .1, V.h * .2];   // the northern lights, where the crown leaves them open
}
