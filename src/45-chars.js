// ---------- Characters. All are drawn with feet at (x, y); `s` scales, `t` animates ----------
const still = () => calm.matches;

// The owl: sleepy, kind, guard's cap, flashlight. mood: idle | talk | no | cheer | sleep. `beam` draws the light cone.
function owl(c, x, y, s, t, mood = 'idle', beam = true) {
  const bob = still() ? 0 : Math.sin(t * 2) * 1.5, shake = mood === 'no' && !still() ? Math.sin(t * 13) * 5 : 0;
  const blink = t % 3.7 < .14, lid = mood === 'sleep' ? 1 : blink ? 1 : mood === 'cheer' ? .05 : mood === 'talk' ? .22 : .4;
  const up = mood === 'cheer' ? -1.9 : 0;
  c.save(); c.translate(x, y + bob * s); c.scale(s, s);
  ell(c, -11, -2, 9, 4, '#ffb02e'); ell(c, 11, -2, 9, 4, '#ffb02e');
  c.save(); c.translate(-32, -52); c.rotate(.2 - up); ell(c, 0, 16, 12, 26, '#7a4e28'); c.restore();
  ell(c, 0, -42, 36, 42, '#9a6a3c');
  ell(c, 0, -30, 24, 27, '#e8c89a');
  for (let i = 0; i < 5; i++) line(c, [-12 + (i % 3) * 12 - (i > 2 ? -6 : 0), -34 + (i > 2 ? 12 : 0), -8 + (i % 3) * 12 - (i > 2 ? -6 : 0), -30 + (i > 2 ? 12 : 0), -4 + (i % 3) * 12 - (i > 2 ? -6 : 0), -34 + (i > 2 ? 12 : 0)], '#c9a06a', 1.6);
  // flashlight wing
  c.save(); c.translate(32, -52); c.rotate(-.2 + up);
  ell(c, 0, 16, 12, 26, '#7a4e28');
  if (mood !== 'cheer') { c.translate(4, 34); c.rotate(-1.1); if (beam) poly(c, [16, -5, 60, -22, 60, 22, 16, 5], 'rgba(255,233,163,.28)'); rr(c, -12, -5, 24, 10, 3); c.fillStyle = '#58a6ff'; c.fill(); poly(c, [12, -5, 19, -8, 19, 8, 12, 5], '#dfe6f5'); }
  c.restore();
  c.translate(shake, 0);
  poly(c, [-30, -70, -26, -92, -14, -78], '#7a4e28'); poly(c, [30, -70, 26, -92, 14, -78], '#7a4e28');
  for (const sx of [-15, 15]) {
    circ(c, sx, -60, 14, '#fff6da'); circ(c, sx + (mood === 'no' ? 0 : 2), -58, 6.5, '#2a1c05'); circ(c, sx + 4, -61, 2, '#fff');
    c.save(); c.beginPath(); c.arc(sx, -60, 14.5, 0, TAU); c.clip(); c.fillStyle = '#7a4e28'; c.fillRect(sx - 15, -75, 30, 30 * lid); c.restore();
  }
  poly(c, [-5, -52, 5, -52, 0, -43], '#ffb02e');
  if (mood === 'talk' && Math.sin(t * 12) > 0) poly(c, [-4, -44, 4, -44, 0, -38], '#e08a1a');
  // guard's cap
  ell(c, 0, -78, 30, 8, '#16224f'); rr(c, -22, -96, 44, 18, 7); c.fillStyle = '#22306e'; c.fill();
  ell(c, 6, -76, 22, 5, '#0d1638'); starPath(c, 0, -87, 6, 2.6, 5); c.fillStyle = '#ffd24a'; c.fill();
  if (mood === 'sleep' && !still()) for (let i = 0; i < 3; i++) { const k = (t * .5 + i / 3) % 1; c.globalAlpha = 1 - k; circ(c, 30 + k * 18, -84 - k * 30, 2 + k * 4, '#dff0ff'); c.globalAlpha = 1; }
  if (mood === 'no' && still()) { circ(c, 36, -88, 11, '#e0553f'); drawIcon(c, 'no', 36, -88, 13); }   // with motion reduced the head cannot shake: show a small cross instead
  c.restore();
}

// A magpie. o: dir, pose (sneak|walk|stand|flee|sulk|dizzy), face (sly|shock|sad|puppy|smug|worry|sweat|sleep),
// disguise (1 leaf hat, 2 mustache, 3 painted feathers, 4 big cap), carry (jar), hat (hacker's bowler), flame, shadow (decoy).
function magpie(c, x, y, s, t, o = {}) {
  const sh = o.shadow, K = sh ? '#33454a' : '#1a1a22', pose = o.pose || 'stand', face = o.face || 'sly';
  const moving = pose === 'sneak' || pose === 'walk' || pose === 'flee';
  const step = moving ? Math.sin(t * (pose === 'flee' ? 22 : pose === 'sneak' ? 7 : 11)) : 0;
  const lean = pose === 'sneak' ? .28 : pose === 'flee' ? .4 : pose === 'sulk' ? .35 : 0;
  const hop = pose === 'flee' ? -Math.abs(step) * 8 : pose === 'dizzy' && !still() ? Math.sin(t * 9) * 2 : 0;
  c.save(); c.translate(x, y + hop * s); c.scale(s * (o.dir === -1 ? -1 : 1), s);
  if (sh) { line(c, [0, -8, 0, 26], '#33454a', 3); }
  else { line(c, [-5, -14, -5 + step * 7, 0], '#5a5a66', 2.4); line(c, [7, -14, 7 - step * 7, 0], '#5a5a66', 2.4); }
  c.translate(0, pose === 'sneak' ? 4 : 0); c.rotate(lean);
  poly(c, [-16, -34, -64, -22 + step * 2, -60, -12 + step * 2, -14, -20], K);
  if (!sh) line(c, [-20, -27, -56, -17 + step * 2], o.disguise === 3 ? '#ff9ecb' : '#3f6fe0', 2.5);
  ell(c, 0, -30, 25, 20, K);
  if (!sh) {
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(150,180,255,.6)'; c.beginPath(); c.ellipse(0, -30, 25, 20, 0, Math.PI, TAU); c.stroke();
    ell(c, 6, -23, 15, 12, '#f4f4f0');
    if (o.disguise === 3) { line(c, [-4, -28, 16, -28], '#ff9ecb', 3); line(c, [-6, -22, 19, -22], '#ffd24a', 3); line(c, [-3, -16, 16, -16], '#6fdc95', 3); }
    ell(c, -6, -33, 16, 10, '#27408f', -.2); ell(c, -2, -39, 7, 4, '#f4f4f0', -.2);
  }
  c.rotate(-lean * (pose === 'sulk' ? -.6 : .8));
  const hx = 20, hy = pose === 'sulk' ? -44 : -52;
  circ(c, hx, hy, 14, K);
  poly(c, [hx + 11, hy - 4, hx + 29, hy + 1, hx + 11, hy + 6], sh ? K : '#6a6a78');
  if (!sh) {
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(150,180,255,.6)'; c.beginPath(); c.arc(hx, hy, 14, Math.PI * .9, TAU * .98); c.stroke();
    const ex = hx + 5, ey = hy - 3, big = face === 'shock' || face === 'puppy' || face === 'worry' || face === 'sweat';
    if (face === 'sleep') line(c, [ex - 5, ey, ex, ey + 3, ex + 5, ey], '#fff', 2);
    else if (pose === 'dizzy') line(c, [ex - 4, ey - 4, ex + 4, ey + 4, ex, ey, ex + 4, ey - 4, ex - 4, ey + 4], '#fff', 2);
    else {
      circ(c, ex, ey, big ? 8 : 5.5, '#fff');
      circ(c, ex + (face === 'sad' ? -1 : 1.5), ey + (face === 'sad' || face === 'puppy' ? 1.5 : 0), face === 'puppy' ? 5 : face === 'shock' ? 2 : 2.8, '#111');
      if (face === 'puppy') { circ(c, ex - 1, ey - 1, 1.8, '#fff'); circ(c, ex + 3, ey + 3, 1, '#fff'); }
      if (face === 'sly' || face === 'smug') poly(c, [ex - 7, ey - 7, ex + 7, ey - 3, ex + 7, ey - 8], K);
      if (face === 'sad' || face === 'puppy') poly(c, [ex - 8, ey - 3, ex + 6, ey - 8, ex - 8, ey - 9], K);
      if (face === 'sad') ell(c, ex - 2, ey + 9 + (t * 8 % 6), 1.6, 2.6, '#7fd0ff');
      if (face === 'sweat') ell(c, hx - 10, hy - 10 + (t * 14 % 10), 2, 3.2, '#7fd0ff');
    }
    if (o.disguise === 2) { ell(c, hx + 9, hy + 8, 7, 3.2, '#8a5a2a', .5); ell(c, hx + 19, hy + 8, 7, 3.2, '#8a5a2a', -.5); }
    if (o.disguise === 1) { c.save(); c.translate(hx - 2, hy - 13); c.rotate(-.3); c.scale(15, 9); c.beginPath(); SHAPES.leaf(c); c.fillStyle = '#62c26a'; c.fill(); c.restore(); line(c, [hx - 14, hy - 12, hx + 10, hy - 15], '#2e7a3a', 1.5); }
    if (o.disguise === 4) {   // a guard's cap that is clearly too big, in a lighter blue with a pale rim so it shows against the night
      c.save(); c.translate(hx + 2, hy - 9); c.rotate(.18); c.scale(1.3, 1.3);
      ell(c, 0, 2, 22, 6, '#2b3f8f'); rr(c, -16, -14, 32, 16, 6); c.fillStyle = '#3a52ad'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(190,210,255,.9)'; c.stroke();
      ell(c, 8, 4, 16, 4, '#1b2a6b'); starPath(c, 0, -6, 5, 2.2, 5); c.fillStyle = '#ffd24a'; c.fill(); c.restore();
    }
    if (o.hat) {
      ell(c, hx, hy - 12, 17, 4, '#3a2a4a'); c.beginPath(); c.arc(hx, hy - 13, 11, Math.PI, 0); c.fillStyle = '#4a3660'; c.fill();
      if (o.flame) { const f = still() ? 0 : Math.sin(t * 20) * 2; ell(c, hx + f * .3, hy - 30, 5, 9 + f, '#ff9a3a'); ell(c, hx, hy - 28, 2.5, 5, '#ffe9a3'); }
    }
    if (pose === 'sulk') for (let i = 0; i < 3; i++) line(c, [hx - 8 + i * 8, hy - 30, hx - 8 + i * 8, hy - 22], '#7fa0ff', 2);
    if (pose === 'dizzy') for (let i = 0; i < 3; i++) { const a = t * 5 + i * TAU / 3; starPath(c, hx + Math.cos(a) * 16, hy - 20 + Math.sin(a) * 4, 4, 1.8, 5); c.fillStyle = '#ffd24a'; c.fill(); }
    if (o.carry) jar(c, hx + 22, hy + 20, 16, t, 1);
  }
  c.restore();
}

// Zip the hummingbird: tiny, quick, sparkly.
function zip(c, x, y, s, t, dir = 1) {
  c.save(); c.translate(x, y + (still() ? 0 : Math.sin(t * 6) * 2 * s)); c.scale(s * dir, s);
  const fl = still() ? .5 : Math.sin(t * 55);
  c.globalAlpha = .55; ell(c, -2, -8, 13, 5 + Math.abs(fl) * 3, '#bfeee4', -.9 + fl * .5); ell(c, -4, -2, 12, 4, '#bfeee4', .5 - fl * .4); c.globalAlpha = 1;
  poly(c, [-10, 2, -22, 8, -20, -1], '#1e8f7a');
  ell(c, 0, 0, 11, 7, '#2ec4a6', -.25); ell(c, 4, 2, 6, 4, '#e8436a', -.25);
  circ(c, 10, -5, 6, '#2ec4a6'); line(c, [15, -5, 30, -7], '#33333d', 1.4);
  circ(c, 12, -6, 1.6, '#111'); circ(c, 12.6, -6.6, .6, '#fff');
  c.restore();
}

// Forest friends for the gate. kind: 0 squirrel, 1 rabbit, 2 hedgehog, 3 mouse, 4 blackbird
const CRITTERS = [['#c8763a', '#f3d9b0'], ['#cfc6c0', '#ffffff'], ['#b08a62', '#f0dcc0'], ['#a9a4b2', '#eeeeee'], ['#2a2a36', '#4a4a5e']];
function critter(c, x, y, s, t, kind, sad) {
  const [col, bel] = CRITTERS[kind], hopY = sad || still() ? 0 : -Math.abs(Math.sin(t * 4)) * 3;
  c.save(); c.translate(x, y + hopY * s); c.scale(s, s);
  if (kind === 0) ell(c, 26, -42, 14, 30, '#a85c28', .35);
  if (kind === 3) { c.beginPath(); c.moveTo(18, -8); c.quadraticCurveTo(44, -6, 40, -30); c.strokeStyle = '#d9a0a8'; c.lineWidth = 2.5; c.stroke(); }
  if (kind === 2) { c.beginPath(); for (let i = 0; i <= 22; i++) { const a = Math.PI * .85 + i * Math.PI * 1.3 / 22, q = i % 2 ? 41 : 33; c.lineTo(Math.cos(a) * q * .82, -42 + Math.sin(a) * q * 1.18); } c.fillStyle = '#6b4a2e'; c.fill(); }
  if (kind === 1) for (const sx of [-9, 9]) { ell(c, sx, -90, 7, 19, col, sx * .012); ell(c, sx, -90, 3.5, 13, '#f5b8c4', sx * .012); }
  if (kind === 3) for (const sx of [-18, 18]) { circ(c, sx, -74, 11, col); circ(c, sx, -74, 6.5, '#f5b8c4'); }
  if (kind === 0) for (const sx of [-13, 13]) poly(c, [sx - 6, -72, sx, -88, sx + 6, -72], col);
  if (kind === 2) for (const sx of [-15, 15]) circ(c, sx, -74, 5, col);
  ell(c, -10, -1, 9, 4, col); ell(c, 10, -1, 9, 4, col);
  ell(c, 0, -26, 22, 26, col); ell(c, 0, -22, 14, 18, bel);
  circ(c, 0, -58, 20, col);
  if (kind === 4) {
    c.lineWidth = 1.5; c.strokeStyle = 'rgba(150,180,255,.6)'; c.beginPath(); c.arc(0, -58, 20, Math.PI, TAU); c.stroke();
    poly(c, [-6, -56, 6, -56, 0, -46], '#ffb02e');
    rr(c, -17, -42, 34, 8, 4); c.fillStyle = '#e8503a'; c.fill(); rr(c, 6, -40, 8, 18, 3); c.fill(); line(c, [-8, -38, -2, -38], '#fff', 2);
  } else {
    ell(c, 0, -52, 9, 7, bel); circ(c, 0, -55, 2.6, '#3a2418');
    c.beginPath(); sad ? c.arc(0, -44, 5, Math.PI + .5, TAU - .5) : c.arc(0, -52, 5, .5, Math.PI - .5); c.strokeStyle = '#3a2418'; c.lineWidth = 1.6; c.stroke();
    c.globalAlpha = .5; circ(c, -13, -52, 4, '#ff9ecb'); circ(c, 13, -52, 4, '#ff9ecb'); c.globalAlpha = 1;
  }
  for (const sx of [-8, 8]) { circ(c, sx, -62, 3.4, kind === 4 ? '#fff' : '#1a1210'); circ(c, sx + (kind === 4 ? 0 : 1), -63, kind === 4 ? 1.8 : 1.1, kind === 4 ? '#111' : '#fff'); }
  if (sad) { line(c, [-12, -67, -5, -71], '#3a2418', 1.6); line(c, [12, -67, 5, -71], '#3a2418', 1.6); }   // inner ends up: sad, never angry
  c.restore();
}
