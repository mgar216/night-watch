// ---------- Story strips: a three-panel comic before each promotion ceremony ----------
// go('story', { rank: 1 | 2 | 3, then }) shows that rank's three panels one at a time; Next after the third calls then().
// ----- Panel pieces. Every panel is drawn in a 360 x 300 box with the ground at y = 255 -----
function storyBg(c, T, dark) {
  const g = c.createLinearGradient(0, -60, 0, 255);
  g.addColorStop(0, dark ? '#050a1f' : '#0b1640'); g.addColorStop(1, dark ? '#17214e' : '#2c4190');
  c.fillStyle = g; c.fillRect(-300, -300, 960, 556);   // oversized: a panel wider or taller than the box shows more sky
  for (let i = 0; i < 14; i++) {
    const a = still() ? .7 : .45 + .45 * Math.sin(T * 1.6 + i * 2.3);
    starPath(c, hash(i + 11) * 360, -40 + hash(i + 37) * 160, 2 + a * 2.5, .9, 4); c.fillStyle = `rgba(255,246,218,${a})`; c.fill();
  }
  if (!dark) drawIcon(c, 'moon', 34, 30, 32);   // top left: the right side holds the blackboard, the coat's branch and the nest
  ell(c, 70, 262, 230, 44, dark ? '#0c1538' : '#17275e'); ell(c, 300, 266, 200, 38, dark ? '#0a1231' : '#132157');
  c.fillStyle = dark ? '#070d2a' : '#0c1740'; c.fillRect(-300, 255, 960, 400);
}
// A magpie that bobs and, when standing, blinks now and then; `i` gives each bird its own rhythm.
// Returns how far the head moved this frame, so a cap or a dollop of cream can follow it.
function storyPie(c, x, y, s, T, o = {}, i = 0) {
  const d = o.dir === -1 ? -1 : 1, by = still() ? 0 : Math.sin(T * 2.4 + i * 1.9) * 1.8 * s;
  magpie(c, x, y + by, s, T + i, o);
  if ((o.pose || 'stand') === 'stand' && !still() && (T + i * 1.3) % 3.3 < .14) {
    const ex = x + 25 * s * d, ey = y + by - 55 * s;
    circ(c, ex, ey, 8.6 * s, '#1a1a22'); line(c, [ex - 5 * s, ey, ex + 5 * s, ey], '#fff', 1.6 * s);
  }
  return by + (o.pose === 'dizzy' && !still() ? Math.sin((T + i) * 9) * 2 * s : 0);
}
// A tiny guard's cap on a standing magpie (feet at x, y), in a light blue that shows against the night; `salute` raises a wing to the brim.
function storyCap(c, x, y, s, dir, salute) {
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  if (salute) {   // the near wing, raised to the brim: the magpie's own blue with a pale edge and a white tip
    line(c, [4, -30, 30, -40, 38, -62], 'rgba(150,180,255,.8)', 10); line(c, [4, -30, 30, -40, 38, -62], '#27408f', 7); ell(c, 38, -63, 4, 3.2, '#f4f4f0');
  }
  ell(c, 20, -64, 13, 3.6, '#2b3f8f'); rr(c, 11, -77, 18, 13, 4); c.fillStyle = '#3a52ad'; c.fill();
  c.lineWidth = 1.4; c.strokeStyle = 'rgba(190,210,255,.9)'; c.stroke();
  ell(c, 28, -63, 8, 2.4, '#1b2a6b'); starPath(c, 20, -70.5, 3.6, 1.6, 5); c.fillStyle = '#ffd24a'; c.fill();
  c.restore();
}
// The owl raises one eyebrow: drawn over owl() with the same bob; one eye squints, the other opens wide under a high brow.
function storyBrow(c, x, y, s, T) {
  c.save(); c.translate(x, y + (still() ? 0 : Math.sin(T * 2) * 1.5) * s); c.scale(s, s);
  c.save(); c.beginPath(); c.arc(-15, -60, 14.5, 0, TAU); c.clip(); c.fillStyle = '#7a4e28'; c.fillRect(-30, -75, 30, 19); c.restore();
  if (T % 3.7 >= .14) { circ(c, 15, -60, 14, '#fff6da'); circ(c, 17, -59, 6.5, '#2a1c05'); circ(c, 19, -62, 2, '#fff'); }   // open unless the owl blinks
  line(c, [-27, -72, -4, -69], '#e8c89a', 4.5);   // low and flat over the squint
  c.beginPath(); c.arc(15, -66, 18, -2.6, -.9); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = '#e8c89a'; c.stroke();   // high and curved over the wide eye
  c.restore();
}
// The treehouse far away: a trunk and a cabin with two warm windows.
function storyHouse(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, [0, 0, 0, -70], '#3a2716', 12);
  rr(c, -28, -106, 56, 38, 4); c.fillStyle = '#5a3a22'; c.fill(); poly(c, [-36, -104, 0, -130, 36, -104], '#a8463a');
  for (const wx of [-13, 13]) { glow(c, wx, -88, 24, '255,216,107', .5); rr(c, wx - 6, -95, 12, 13, 2); c.fillStyle = '#ffd86b'; c.fill(); }
  c.restore();
}
// The giant cake (bottom centre at x, y) walking on three pairs of thin magpie legs; `w` (-1..1) sways the tiers.
function storyCake(c, x, y, s, T, w) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (let i = 0; i < 3; i++) {
    const st = still() ? 0 : Math.sin(T * 9 + i * 2.1) * 5, lx = -54 + i * 46;
    line(c, [lx, -12, lx + st, 0], '#a4a8bc', 3.5); line(c, [lx + 12, -12, lx + 12 - st, 0], '#a4a8bc', 3.5);
  }
  let top = -12;
  [[170, 54], [128, 44], [88, 36]].forEach(([tw, th], i) => {   // three tiers, each sways a little more than the one below
    const dx = w * (i + 1) * 5, lx = dx - tw / 2;
    rr(c, lx, top - th, tw, th, 10); c.fillStyle = i === 1 ? '#f3b98c' : '#f7c9a0'; c.fill();
    rr(c, lx - 2, top - th - 2, tw + 4, 14, 7); c.fillStyle = '#ff9ecb'; c.fill();
    for (let j = 0; j < tw / 22 - 1; j++) { ell(c, lx + 14 + j * 22, top - th + 12, 5, 6 + (j % 2) * 4, '#ff9ecb'); circ(c, lx + 25 + j * 22, top - 9, 2.6, '#fff6f0'); }
    top -= th;
  });
  // a peep hole in the middle tier: two eyes look left and right
  const hx = w * 10, ex = still() ? 0 : Math.sin(T * 1.3) * 3;
  ell(c, hx, -86, 19, 11, '#3a2418');
  for (const sx of [-7, 7]) { circ(c, hx + sx + ex, -87, 4.5, '#fff'); circ(c, hx + sx + ex * 1.4, -86.5, 2, '#111'); }
  // a candle and a cherry on top
  const tx = w * 15, fl = still() ? 0 : Math.sin(T * 17) * 1.5;
  rr(c, tx - 4, top - 26, 8, 26, 2); c.fillStyle = '#58a6ff'; c.fill();
  ell(c, tx + fl * .4, top - 34, 4.5, 8 + fl, '#ffb02e'); ell(c, tx, top - 32, 2, 4, '#ffe9a3');
  circ(c, tx + 24, top - 6, 7, '#d83a3a'); circ(c, tx + 22, top - 8, 2, 'rgba(255,255,255,.7)');
  c.restore();
}
// A long coat hanging from its collar at (x, y); the hem is 146 * s lower. `a` turns it a little (swinging on a branch).
function storyCoat(c, x, y, s, a = 0) {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  ell(c, -36, 50, 9, 36, '#7a5c3a', .18); ell(c, 36, 50, 9, 36, '#7a5c3a', -.18);   // empty sleeves
  poly(c, [-30, 8, 30, 8, 44, 146, -44, 146], '#9a7a50');
  poly(c, [-30, 8, 0, 50, 30, 8, 22, -2, -22, -2], '#6b4f30');   // collar
  line(c, [0, 50, 0, 146], '#6b4f30', 2.5);
  rr(c, -40, 92, 80, 9, 3); c.fillStyle = '#5e4229'; c.fill();   // belt
  for (const by of [58, 112, 132]) circ(c, 7, by, 3.2, '#ffe9a3');
  c.restore();
}
// The same coat after the fall: a crumpled heap of cloth (bottom centre at x, y) with a sleeve, the collar and the belt showing.
function storyHeap(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ell(c, -70, -8, 28, 9, '#7a5c3a', -.25);
  c.beginPath(); c.moveTo(-86, 0); c.quadraticCurveTo(-78, -42, -26, -38); c.quadraticCurveTo(6, -54, 40, -36); c.quadraticCurveTo(86, -34, 90, 0); c.closePath();
  c.fillStyle = '#9a7a50'; c.fill();
  poly(c, [-40, -36, -14, -48, 2, -34], '#6b4f30');
  line(c, [-74, -12, -10, -18, 76, -10], '#5e4229', 7);
  for (const bx of [-30, 14, 52]) circ(c, bx, -26, 3.2, '#ffe9a3');
  c.restore();
}
// A bowler hat with a red band, brim centre at (x, y), scaled by s and turned by `a`.
function storyHat(c, x, y, s, a = 0) {
  c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
  c.beginPath(); c.arc(0, -1, 12, Math.PI, 0); c.fillStyle = '#6a4c8c'; c.fill();
  rr(c, -12, -5, 24, 4, 1.5); c.fillStyle = '#e8503a'; c.fill(); ell(c, 0, 0, 18, 4, '#4a3660');
  c.restore();
}
// The very tall visitor (feet at x, y): three magpies in one coat. The top one wears the hat and a mustache,
// the middle one peeks out between two buttons, the bottom one's legs and tail stick out below.
function storyTall(c, x, y, s, T, wob, walking) {
  c.save(); c.translate(x, y); c.rotate(wob); c.scale(-s, s);   // faces left, towards the gate
  magpie(c, 0, 0, 1, T, { pose: walking ? 'walk' : 'stand', face: 'sweat' });
  magpie(c, 4, -124, 1, T + 1, { face: 'smug', hat: 1, disguise: 2 });
  storyCoat(c, 0, -160, 1);
  ell(c, 14, -80, 12, 8, '#1a1a22'); circ(c, 17, -81, 4.4, '#fff'); circ(c, 18.5, -81, 2.2, '#111'); poly(c, [24, -83, 37, -79, 24, -75], '#6a6a78');
  c.restore();
}
// The treehouse gate (bottom centre at x, y): two posts, an arch, a lantern.
function storyGate(c, x, y) {
  line(c, [x - 38, y, x - 38, y - 124], '#6b462a', 12); line(c, [x + 38, y, x + 38, y - 124], '#6b462a', 12);
  c.beginPath(); c.arc(x, y - 124, 38, Math.PI, 0); c.lineWidth = 12; c.strokeStyle = '#8a5a34'; c.stroke();
  drawIcon(c, 'lamp', x, y - 130, 30);
}
// The magpies' own tree (roots at x, y, scaled by s) with their nest. `lit` puts their own glowing jar in it;
// `birds()` draws whoever sits in the nest, in the tree's own units, between the back and the front of the nest.
function storyNest(c, x, y, s, T, lit, birds) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (lit) glow(c, 0, -140, 130, '255,216,107', .45);
  line(c, [0, 0, 0, -124], '#3a2716', 16); line(c, [0, -60, -50, -92], '#3a2716', 8); line(c, [2, -84, 46, -110], '#3a2716', 7);
  circ(c, -56, -100, 18, '#1a4c33'); circ(c, 52, -118, 16, '#1f5a3c');
  ell(c, 0, -126, 58, 14, '#3e2a18');
  if (lit) jar(c, 0, -142, 15, T, 1);
  if (birds) birds();
  c.beginPath(); c.ellipse(0, -126, 62, 24, 0, 0, Math.PI); c.fillStyle = '#6b4a2e'; c.fill();
  for (let i = 0; i < 6; i++) line(c, [-58 + i * 20, -124 + (i % 2) * 7, -40 + i * 20, -118 - (i % 2) * 4], '#8a6a44', 3);
  c.restore();
}

// The nine panels: [rank][panel](c, T, k). T is the clock (frozen with reduced motion), k the seconds since the panel appeared.
const storyPanels = [
  [ // 1. The Great Cake Plan
    (c, T, k) => {   // the plan on the blackboard, chalked stroke by stroke while the planner taps it
      line(c, [150, 150, 140, 255], '#6b462a', 6); line(c, [310, 150, 320, 255], '#6b462a', 6);
      rr(c, 124, 26, 212, 132, 8); c.fillStyle = '#8a5a34'; c.fill(); rr(c, 132, 34, 196, 116, 5); c.fillStyle = '#24463a'; c.fill();
      const ch = 'rgba(244,241,224,.92)', box = (x, y, w, h) => { rr(c, x, y, w, h, 4); c.lineWidth = 2.5; c.strokeStyle = ch; c.stroke(); };
      c.save(); c.translate(0, -4);
      const strokes = [
        () => { box(148, 104, 58, 30); box(158, 84, 38, 20); line(c, [177, 84, 177, 74], ch, 2.5); circ(c, 177, 69, 3, ch); },   // the cake
        () => { circ(c, 170, 118, 2.6, ch); circ(c, 183, 118, 2.6, ch); line(c, [188, 119, 196, 121, 188, 123], ch, 2); },   // eyes inside it
        () => { for (let i = 0; i < 3; i++) { line(c, [156 + i * 18, 134, 153 + i * 18, 144], ch, 2.5); line(c, [162 + i * 18, 134, 165 + i * 18, 144], ch, 2.5); } },   // six thin legs
        () => { c.setLineDash([6, 6]); c.beginPath(); c.moveTo(214, 110); c.quadraticCurveTo(240, 64, 262, 96); c.lineWidth = 2.5; c.strokeStyle = ch; c.stroke(); c.setLineDash([]); line(c, [251, 93, 262, 96, 263, 85], ch, 2.5); },
        () => { box(270, 90, 44, 40); line(c, [264, 90, 292, 66, 320, 90], ch, 2.5); },   // the treehouse
        () => { box(285, 102, 14, 20); line(c, [283, 100, 301, 100], ch, 2.5); starPath(c, 316, 56, 8, 3.4, 5); c.lineWidth = 2; c.strokeStyle = ch; c.stroke(); },   // and the jar
      ];
      strokes.slice(0, Math.ceil(clamp(k / 2.4, .01, 1) * strokes.length)).forEach(f => f());
      c.restore();
      storyPie(c, 66, 255, 1.1, T, { face: 'smug' }, 0);
      const tap = still() ? 0 : Math.max(0, Math.sin(T * 6)) * 4;
      line(c, [114, 199, 150 + tap, 122 - tap], '#e8c984', 3.5);   // a pointer held in the beak
      storyPie(c, 250, 255, .9, T, { face: 'puppy', dir: -1 }, 1); storyPie(c, 306, 255, .9, T, { face: 'sly', dir: -1 }, 2);
    },
    (c, T, k) => {   // the cake tiptoes up to the treehouse on six thin legs
      storyHouse(c, 322, 255, .9);
      zip(c, 292, 56, 1.2, T, -1);
      storyCake(c, still() ? 168 : 96 + Math.min(k, 5) * 14.4, 255, 1.1, T, still() ? 0 : Math.sin(T * 4.2));
    },
    (c, T) => {   // splat: three dizzy magpies sit in a puddle of cream, cake crumbs all around
      owl(c, 44, 255, .85, T, 'idle', false);
      ell(c, 222, 250, 140, 24, '#fff0f4');
      for (const [x, y, r] of [[100, 244, .5], [334, 246, -.4], [258, 232, .25]]) {
        c.save(); c.translate(x, y); c.rotate(r); rr(c, -18, -11, 36, 22, 6); c.fillStyle = '#f7c9a0'; c.fill(); rr(c, -18, -11, 36, 8, 4); c.fillStyle = '#ff9ecb'; c.fill(); c.restore();
      }
      c.save(); c.translate(196, 236); c.rotate(-1.2); rr(c, -4, -26, 8, 26, 2); c.fillStyle = '#58a6ff'; c.fill(); c.restore();   // the candle, fallen over
      storyPie(c, 166, 252, 1, T, { pose: 'dizzy', dir: -1 }, 0);
      const by = storyPie(c, 236, 256, 1.05, T, { pose: 'dizzy', dir: 1 }, 1);
      storyPie(c, 314, 250, .95, T, { pose: 'dizzy', dir: -1 }, 2);
      c.beginPath(); c.moveTo(86, 264); for (let x = 86; x <= 356; x += 10) c.lineTo(x, 251 + Math.sin(x * .17) * 4); c.lineTo(356, 268); c.closePath();
      c.fillStyle = '#fff6f0'; c.fill();   // the cream in front covers their feet
      const hx = 236 + 21 * 1.05, hy = 256 - 66 * 1.05 + by;
      ell(c, hx, hy, 14, 7, '#fff6f0'); ell(c, hx + 1, hy - 6, 8, 5, '#fff6f0'); circ(c, hx + 3, hy - 13, 6, '#d83a3a'); circ(c, hx + 1, hy - 15, 1.8, 'rgba(255,255,255,.8)');   // a dollop and a cherry on one head
    },
  ],
  [ // 2. The Very Tall Visitor
    (c, T) => {   // three birds stack up; the long coat and the hat wait on a branch
      line(c, [380, 44, 212, 66], '#5a3a22', 9); circ(c, 356, 36, 24, '#1f5a3c'); circ(c, 220, 58, 14, '#1a4c33');
      storyCoat(c, 292, 56, .92, still() ? 0 : Math.sin(T * 1.4) * .04);
      storyHat(c, 236, 60, 1.3, -.15);
      c.save(); c.translate(104, 255);
      ['sweat', 'worry', 'smug'].forEach((face, i) => {   // each one stands on the back of the one below; the sway grows towards the top
        if (i) { c.translate(5, -54); c.rotate(still() ? 0 : Math.sin(T * 2.6 + i) * .06); }
        magpie(c, 0, 0, 1.1, T + i, { face });
      });
      c.restore();
    },
    (c, T, k) => {   // the tall visitor wobbles up to the gate; the owl raises one eyebrow
      storyGate(c, 72, 255); owl(c, 72, 255, .85, T, 'idle', false); storyBrow(c, 72, 255, .85, T);
      zip(c, 128, 86, 1.1, T, 1);
      const walking = !still() && k < 2.5;
      storyTall(c, still() ? 240 : 384 - Math.min(k, 2.5) * 57.6, 255, 1, T, still() ? 0 : Math.sin(T * 3) * .07, walking);
    },
    (c, T, k) => {   // a heap: legs in the air out of the crumpled coat, one bird on top, the hat rolls away
      storyGate(c, 72, 255); owl(c, 72, 255, .85, T, 'cheer');
      storyHeap(c, 220, 256, 1);
      // the bottom bird is upside down inside the coat: only its tail and two kicking legs stick out
      poly(c, [150, 226, 112, 208, 108, 220, 146, 236], '#1a1a22'); line(c, [146, 229, 114, 213], '#3f6fe0', 2.5);
      const kick = still() ? 0 : Math.sin(T * 7) * 3;
      for (const lx of [180, 196]) line(c, [lx, 218, lx + kick, 192, lx + kick - 5, 186, lx + kick, 192, lx + kick + 5, 186], '#a4a8bc', 3);
      storyPie(c, 254, 222, .95, T, { pose: 'dizzy', dir: 1 }, 1);
      storyPie(c, 320, 254, .95, T, { pose: 'dizzy', dir: 1 }, 2);
      const hk = still() ? 1 : ease(clamp(k / 1.4, 0, 1));
      storyHat(c, lerp(232, 136, hk), lerp(176, 252, hk) - Math.abs(Math.sin(hk * Math.PI * 2)) * 20 * (1 - hk), 1.3, -hk * 6.5);
      ell(c, 276, 258, 8, 3.4, '#8a5a2a', .4); ell(c, 290, 258, 8, 3.4, '#8a5a2a', -.4);   // the mustache, lost
    },
  ],
  [ // 3. Light for Everyone
    (c, T) => {   // the magpies' nest is dark and they are sad; far away the treehouse glows
      storyHouse(c, 52, 255, .8);
      zip(c, 110, 136, 1, T, 1);
      storyNest(c, 236, 255, 1.4, T, 0, () => [[-34, 1], [2, -1], [36, -1]].forEach(([dx, d], i) => storyPie(c, dx, -122, .62, T, { pose: 'sulk', face: 'sad', dir: d }, i)));
    },
    (c, T, k) => {   // the owl and Zip bring a glowing firefly jar
      storyNest(c, 256, 255, 1.4, T, 0, () => [[-34, -1], [2, -1], [36, -1]].forEach(([dx, d], i) => storyPie(c, dx, -122, .62, T, { face: 'puppy', dir: d }, i)));
      const ox = still() ? 92 : lerp(-20, 92, ease(clamp(k / 1.6, 0, 1)));
      owl(c, ox, 255, .95, T, 'talk', false);
      glow(c, ox + 48, 200, 90, '255,216,107', .35); jar(c, ox + 48, 204, 18, T, 1);
      zip(c, ox + 48 + Math.cos(T * 2.5) * 32, 160 + Math.sin(T * 5) * 8, 1, T, Math.sin(T * 2.5) < 0 ? 1 : -1);
    },
    (c, T) => {   // tiny guard caps and a salute: now the magpies help guard the forest
      storyNest(c, 318, 255, 1.15, T, 1);
      owl(c, 48, 255, .85, T, 'cheer');
      [[144, 'puppy'], [206, 'smug'], [268, 'puppy']].forEach(([x, face], i) => { const by = storyPie(c, x, 255, .98, T, { face, dir: -1 }, i); storyCap(c, x, 255 + by, .98, -1, true); });
      zip(c, 196 + Math.sin(T * .9) * 70, 62 + Math.sin(T * 1.8) * 14, 1.1, T, Math.cos(T * .9) > 0 ? 1 : -1);
    },
  ],
];

scenes.story = {
  enter(o = {}) {
    this.r = clamp(o.rank || rank() || 1, 1, 3); this.then = o.then || (() => go('hub')); this.i = 0;
    this.hud = hud(() => go('home'), '', true);
    // The caption card reuses the ceremony's bar: at the bottom in portrait, the right half in landscape.
    // Two caption lines are always reserved, so the panel keeps its size from page to page.
    this.box = $('.dlg', add(`<div class="bar badgebar"><div class="dlg" style="width:min(26em,100%)"><h2>${esc(t('st_t' + this.r))}</h2>
      <p id="stCap" style="margin:.2em 0;font-size:1.15em;font-weight:800;min-height:2.6em;display:flex;align-items:center;justify-content:center"></p>
      <div class="pics" id="stDots" aria-hidden="true"></div>
      <div class="acts"><button class="btn go big" id="stNext">${ic('play', 30)}${esc(t('st_next'))}</button></div></div></div>`));
    $('#stNext').onclick = () => this.next();
    $('#stNext').focus({ preventScroll: true });
    this.show();
  },
  show() {
    this.at = V.t;
    const cap = t(`st_c${this.r}${this.i + 1}`);
    $('#stCap').textContent = cap;
    // page dots: pages seen are filled, the current one is bigger, so the colour is never the only cue
    $('#stDots').innerHTML = [0, 1, 2].map(j => { const z = j === this.i ? 20 : 14; return `<span style="width:${z}px;height:${z}px;border-radius:50%;border:3px solid var(--gold);background:${j <= this.i ? 'var(--gold)' : 'none'}"></span>`; }).join('');
    say(cap); speak(cap);
    if (this.i < 2) return sfx.pop();
    // the last panel lands with a bump: cream, feathers or stars fly
    const p = this.rect();
    sfx[['puff', 'bonk', 'sparkle'][this.r - 1]]();
    burst(p.x + p.w / 2, p.y + p.h * .7, 26, [{ colors: ['#fff6f0', '#ff9ecb', '#f7c9a0'], speed: 240 },
      { kind: 'feather', colors: ['#1a1a22', '#f4f4f0', '#3f6fe0'], speed: 200, g: 120, life: 1.3, size: 9 },
      { kind: 'star', colors: ['#ffd86b', '#fff', '#7fd0ff'], speed: 220, size: 8 }][this.r - 1]);
  },
  next() {
    if (this.i > 2 || V.t - this.at < .35) return;   // a quick double tap never skips a panel
    if (++this.i > 2) return this.then();
    this.show();
  },
  // Enter and Space on a focused button already click it; anywhere else they turn the page, as ArrowRight always does.
  key(e) {
    if (e.key === 'ArrowRight' || (e.key === 'Enter' || e.key === ' ') && !e.target.closest('button')) { e.preventDefault(); this.next(); }
  },
  // A tap on the picture just sparkles; only Next turns the page, so a stray tap never skips a caption.
  down(x, y) {
    const p = this.rect();
    if (x > p.x && x < p.x + p.w && y > p.y && y < p.y + p.h) { sfx.chirp(); burst(x, y, 10, { speed: 140, size: 7, colors: ['#ffd86b', '#fff6da'] }); }
  },
  // The panel fills the room above the caption card (portrait) or left of it (landscape), never much taller than wide.
  rect() {
    const d = this.box.getBoundingClientRect(), m = 10, ay = this.hud.getBoundingClientRect().bottom;
    const aw = (wide() ? d.left : V.w) - 2 * m, ah = (wide() ? V.h : d.top) - ay - m;
    const w = Math.min(aw, ah * 1.4), h = Math.min(ah, aw * .95);
    return { x: m + (aw - w) / 2, y: ay + (ah - h) / 2, w, h };
  },
  draw() {
    const T = still() ? 1 : V.t, k = still() ? 99 : V.t - this.at, p = this.rect(), pop = still() ? 1 : ease(clamp(k / .35, 0, 1));
    this.panel = [p.x, p.y, p.w, p.h];   // read by the layout audit: the overlay must not cover it
    drawSky(ctx, T); fireflies(ctx, T, 8);
    ctx.save(); ctx.translate(p.x + p.w / 2, p.y + p.h / 2); ctx.scale(.94 + .06 * pop, .94 + .06 * pop); ctx.translate(-p.w / 2, -p.h / 2);
    rr(ctx, 0, 7, p.w, p.h, 18); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
    rr(ctx, 0, 0, p.w, p.h, 18); ctx.fillStyle = '#fff6da'; ctx.fill();   // the cream comic frame
    ctx.save(); rr(ctx, 6, 6, p.w - 12, p.h - 12, 13); ctx.clip();
    // the box sits on the panel's bottom edge, so a tall panel shows more sky, never more empty ground
    const u = Math.min((p.w - 12) / 360, (p.h - 12) / 300);
    ctx.translate(p.w / 2 - 180 * u, p.h - 6 - 300 * u); ctx.scale(u, u);
    storyBg(ctx, T, this.r === 3 && this.i < 2);
    storyPanels[this.r - 1][Math.min(this.i, 2)](ctx, T, k);
    ctx.restore();
    if (pop < 1) { rr(ctx, 6, 6, p.w - 12, p.h - 12, 13); ctx.fillStyle = `rgba(255,246,218,${1 - pop})`; ctx.fill(); }   // a new panel appears out of a soft flash
    ctx.restore();
  },
};
