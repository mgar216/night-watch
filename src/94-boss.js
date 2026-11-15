// ---------- The Baron's Night: Baron von Shiny's silly three-step plan falls apart, act by act ----------
// go('boss', { then }) plays an owl intro, three acts and a finale; the result dialog's button calls then() (default: the hub),
// after the next chapter of the Baron's story when one is due (src/95-saga.js).
// Each act asks for one thing. A wrong choice is never a failure: a short funny moment, one tip from the owl, and the same
// act goes on. Nothing is timed: every act waits for the player.
// Progress of one animation step: eased, or complete at once when the player asked for reduced motion.
const bossE = k => k <= 0 ? 0 : still() ? 1 : ease(Math.min(1, k));
// Sounds of the Baron's Night, made with tone() and noise() like sfx in 30-audio.js.
const bossSnd = {
  giggle: () => [0, .1, .2, .3].forEach((w, i) => tone(1250 + i % 2 * 260, .07, 'square', .035, w, 1600)),
  horn: () => { tone(330, .55, 'sawtooth', .07, 0, 415); tone(415, .45, 'square', .035, .08, 520); },
  rewind: () => { for (let i = 0; i < 10; i++) tone(1700 - i * 120, .05, 'square', .035, i * .045); },
  rasp: () => { for (let i = 0; i < 22; i++) tone(92 + i % 2 * 26, .09, 'sawtooth', .1, i * .08, 70); noise(1.8, .05, 260); },   // a long raspberry
  thud: () => tone(210, .12, 'sine', .14, 0, 120),
  plop: () => { sfx.puff(); tone(190, .32, 'sine', .25, 0, 80); },
};
// Three locks for the vault: rows of 1, 2 and 4 different pictures, in a shuffled order.
function bossLocks() { const p = shuffle([...FWORDS]); return shuffle([p.slice(0, 1), p.slice(1, 3), p.slice(3, 7)]); }
// Split a line into rows that fit `w` pixels in the current canvas font.
function bossWrap(text, w) {
  const out = [];
  for (const word of text.split(' ')) { const s = out.length ? out[out.length - 1] + ' ' + word : word; if (out.length && ctx.measureText(s).width <= w) out[out.length - 1] = s; else out.push(word); }
  return out;
}
// The owl's short lines: a new one replaces one still showing, so two never sit on top of each other.
function bossToast(key) { ui.querySelectorAll('.toast').forEach(n => n.remove()); toast(t(key)); }

// ----- Pieces of the stage. All are drawn in stage units: the ground is y = 0 and the gate stands at x = 12..80 -----

// The Baron. `chef` adds his far-too-small baker's disguise; `tip` 0..1 lifts his hat in a grand farewell.
// Without the hat, magpie() also leaves out his medal, monocle and moustache, so they are drawn here as in 45-chars.js.
function bossBaron(c, x, y, s, t, o = {}) {
  const tip = o.tip || 0, hx = 20, hy = -52;
  magpie(c, x, y, s, t, { ...o, baron: tip ? 0 : 1 });
  if (!tip && !o.chef) return;
  c.save(); c.translate(x, y); c.scale(s * (o.dir === -1 ? -1 : 1), s);
  if (tip) {
    poly(c, [7, -31, 15, -31, 11, -23], '#e8503a'); circ(c, 11, -20, 5, '#ffd24a'); starPath(c, 11, -20, 3, 1.3, 5); c.fillStyle = '#b07a00'; c.fill();
    c.lineWidth = 2; c.strokeStyle = '#ffd24a'; c.beginPath(); c.arc(hx + 5, hy - 3, 8.5, 0, TAU); c.stroke();
    line(c, [hx + 1, hy + 5, hx - 3, hy + 14, hx - 9, hy + 19], '#ffd24a', 1.2);
    for (const d of [-1, 1]) { c.beginPath(); c.moveTo(hx + 15, hy + 8); c.quadraticCurveTo(hx + 15 + d * 9, hy + 15, hx + 15 + d * 12, hy + 5); c.lineWidth = 2.8; c.strokeStyle = '#e4e4ee'; c.stroke(); }
    line(c, [0, -34, 14, -50 - 16 * tip, 22, -62 - 24 * tip], '#27408f', 7);   // the raised wing that holds the hat
    c.translate(hx + 4, hy - 12 - 26 * tip); c.rotate(-.6 * tip);
    rr(c, -11, -26, 22, 27, 3); c.fillStyle = '#4a3470'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(210,200,255,.85)'; c.stroke();
    ell(c, 0, 0, 19, 4.5, '#4a3470'); rr(c, -11, -8, 22, 5, 1); c.fillStyle = '#ffd24a'; c.fill();
  } else {
    // a tiny baker's hat perched on top of his top hat, and a tiny dotted apron that hardly covers anything
    rr(c, hx - 4, -96, 8, 7, 2); c.fillStyle = '#fff'; c.fill(); circ(c, hx - 3.5, -98, 3.6, '#fff'); circ(c, hx + 1, -100.5, 4.2, '#fff'); circ(c, hx + 4.5, -98, 3.4, '#fff');
    line(c, [2, -30, 8, -38, 14, -30], '#ff9ecb', 1.4);
    rr(c, 1, -31, 13, 14, 3); c.fillStyle = '#ff9ecb'; c.fill(); for (const [dx, dy] of [[4.5, -27], [10, -24], [5, -20]]) circ(c, dx, dy, 1.3, '#fff');
  }
  c.restore();
}
// The owl hides its eyes behind its wings (drawn over owl() with the same bob).
function bossHide(c, x, y, s, t) {
  c.save(); c.translate(x, y + (still() ? 0 : Math.sin(t * 2) * 1.5) * s); c.scale(s, s);
  for (const d of [-1, 1]) { ell(c, d * 13, -58, 17, 12, '#7a4e28', d * .5); line(c, [d * 4, -52, d * 20, -62], '#9a6a3c', 2); }
  c.restore();
}
// The giant cake on a cart (bottom centre at x). o: roll (wheel turn), wob (tilt), walk (the feet step), lid (0..1 the top
// tier pops off), peek (0..1 three magpies rise with party horns), giggle (laugh marks by the peep slit).
function bossCake(c, x, t, o = {}) {
  const st = o.walk && !still() ? Math.sin(t * 14) * 4 : 0, lid = o.lid || 0, peek = o.peek || 0;
  c.save(); c.translate(x, 0); c.rotate(o.wob || 0);
  for (const fx of [-26, 14]) for (const [dx, d] of [[0, 1], [9, -1]]) line(c, [fx + dx, -22, fx + dx + st * d, -2, fx + dx + st * d + 6, -1], '#5a5a66', 2.4);   // magpie feet
  rr(c, -82, -34, 164, 13, 4); c.fillStyle = '#8a5a34'; c.fill();
  for (const wx of [-58, 58]) {
    circ(c, wx, -14, 14, '#4a2e1a'); circ(c, wx, -14, 10, '#c8813a');
    for (let i = 0; i < 3; i++) { const a = (o.roll || 0) + i * Math.PI / 3; line(c, [wx - Math.cos(a) * 9, -14 - Math.sin(a) * 9, wx + Math.cos(a) * 9, -14 + Math.sin(a) * 9], '#4a2e1a', 2); }
  }
  const wag = still() ? 0 : Math.sin(t * 6) * .14;   // a magpie tail sticks out of the side and wags
  c.save(); c.translate(-70, -58); c.rotate(wag); poly(c, [0, -6, -42, -1, -40, 9, 0, 6], '#1a1a22'); c.lineWidth = 1.5; c.strokeStyle = 'rgba(190,210,255,.85)'; c.stroke(); line(c, [-4, 0, -36, 4], '#3f6fe0', 2.5); c.restore();
  const tier = (x0, y0, w, h, col) => {
    rr(c, x0, y0, w, h, 9); c.fillStyle = col; c.fill();
    rr(c, x0 - 3, y0 - 3, w + 6, 13, 6); c.fillStyle = '#ff9ecb'; c.fill();
    for (let i = 0; i < w / 20 - 1; i++) ell(c, x0 + 12 + i * 20, y0 + 10, 4.5, 5 + (i % 2) * 4, '#ff9ecb');   // icing drips
  };
  tier(-76, -90, 152, 58, '#f7c9a0');
  ell(c, -36, -56, 10, 7, '#3a2418'); poly(c, [-42, -59, -62, -55, -42, -51], '#6a6a78');   // a beak pokes out of a hole
  if (peek) [[-30, -1], [2, 1], [32, 1]].forEach(([px, d], i) => {
    // party guests: three magpies rise out of the cake, each blowing a striped party horn
    const py = -96 - 26 * peek, bx = px + d * 30, by = py - 32, L = 6 + 24 * peek;
    magpie(c, px, py, .62, t + i, { dir: d, face: 'joy' });
    poly(c, [bx, by - 3, bx + d * 14, by - 6, bx + d * 14, by + 4, bx, by + 2], '#ffd24a'); line(c, [bx + d * 5, by - 4, bx + d * 5, by + 3], '#e8503a', 2);
    c.beginPath(); c.moveTo(bx + d * 14, by - 1); c.lineTo(bx + d * (14 + L), by - 1 - L * .2); c.arc(bx + d * (14 + L), by - 1 - L * .2 + 5, 5, -Math.PI / 2, d > 0 ? Math.PI : 0, d < 0);
    c.lineWidth = 3.5; c.strokeStyle = ['#7fd0ff', '#ff8a7a', '#6fdc95'][i]; c.stroke();
  });
  tier(-56, -134, 112, 44, '#f3b98c');
  if (!peek) {   // two eyes peek through a slit, and the cake giggles
    rr(c, -6, -118, 30, 12, 6); c.fillStyle = '#3a2418'; c.fill();
    for (const ex of [2, 16]) { circ(c, ex, -112, 4, '#fff'); circ(c, ex - 1.5, -112, 2, '#111'); }
    if (o.giggle) for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(30 + i * 5, -112, 5 + i * 3, -.7, .7); c.lineWidth = 2; c.strokeStyle = `rgba(255,246,218,${still() ? .85 : .45 + .4 * Math.sin(t * 8 - i)})`; c.stroke(); }
  }
  c.save(); c.translate(lid * 30, -lid * 74); c.rotate(lid * .55);   // the lid: the top tier with a candle and a cherry
  tier(-38, -170, 76, 38, '#f7c9a0');
  const fl = still() ? 0 : Math.sin(t * 17) * 1.5;
  rr(c, -4, -196, 8, 26, 2); c.fillStyle = '#58a6ff'; c.fill(); ell(c, fl * .4, -204, 4.5, 8 + fl, '#ffb02e'); ell(c, 0, -202, 2, 4, '#ffe9a3');
  circ(c, 22, -176, 7, '#d83a3a'); circ(c, 20, -178, 2, 'rgba(255,255,255,.7)');
  c.restore();
  c.restore();
}
// What is left of the cake after the crash: cream, crumbs, the fallen candle. `front` draws only the near edge of the
// cream, over the feet of whoever sits in it.
function bossSplat(c, x, front) {
  if (front) {
    c.beginPath(); c.moveTo(x - 63, 3); for (let i = 0; i <= 14; i++) c.lineTo(x - 63 + i * 9, -5 - (i % 2) * 5); c.lineTo(x + 63, 3); c.closePath();
    c.fillStyle = '#fff6f0'; c.fill(); return;
  }
  ell(c, x, -3, 66, 12, '#fff0f4');
  for (const [dx, dy, r, col] of [[-46, -10, .5, '#f7c9a0'], [40, -12, -.4, '#f3b98c'], [-10, -17, .2, '#f7c9a0']]) {
    c.save(); c.translate(x + dx, dy); c.rotate(r); rr(c, -14, -9, 28, 18, 5); c.fillStyle = col; c.fill(); rr(c, -14, -9, 28, 6, 3); c.fillStyle = '#ff9ecb'; c.fill(); c.restore();
  }
  c.save(); c.translate(x + 24, -6); c.rotate(-1.3); rr(c, -4, -24, 8, 24, 2); c.fillStyle = '#58a6ff'; c.fill(); c.restore();
  circ(c, x - 28, -8, 6, '#d83a3a');
}
// A wrapped parcel, bottom centre at (x, y), scaled by s (about 50 x 46 units). p.pie: a magpie hides inside and shows
// p.kind 0 its tail, 1 its beak, 2 its feet; otherwise it is a friend's present (p.kind 0 a fluffy tail, 1 soft ears)
// with a heart tag. `lid` 0..1 lifts the lid off; `empty` shows the open box after the magpie has gone.
const BOSS_PAPER = [['#58a6ff', '#2c6fbb'], ['#ff8a7a', '#c0392b'], ['#6fdc95', '#2e8b3a'], ['#c9a0ff', '#6b3fd1']];
function bossParcel(c, x, y, s, p, lid = 0, empty = false) {
  const [col, dark] = BOSS_PAPER[p.paper];
  c.save(); c.translate(x, y); c.scale(s, s);
  if (p.pie && p.kind === 2) { for (const fx of [-9, 7]) line(c, [fx, -12, fx, 0, fx + 6, 0], '#5a5a66', 2.6); c.translate(0, -10); }   // it stands on magpie feet
  if (p.pie && p.kind === 0 && !empty) { poly(c, [18, -24, 50, -32, 52, -22, 18, -14], '#1a1a22'); c.lineWidth = 1.5; c.strokeStyle = 'rgba(190,210,255,.85)'; c.stroke(); line(c, [20, -19, 48, -26], '#3f6fe0', 2.5); }
  if (!p.pie && p.kind === 0) { ell(c, 28, -30, 11, 19, '#a85c28', .5); ell(c, 29, -33, 6, 12, '#c8763a', .5); }   // a fluffy squirrel tail
  if (!p.pie && p.kind === 1 && lid < .5) for (const d of [-1, 1]) { ell(c, d * 7, -52, 4.5, 13, '#cfc6c0', d * .2); ell(c, d * 7, -52, 2.2, 9, '#f5b8c4', d * .2); }   // soft rabbit ears
  rr(c, -22, -34, 44, 34, 4); c.fillStyle = col; c.fill();
  c.save(); rr(c, -22, -34, 44, 34, 4); c.clip(); for (let i = -3; i < 4; i++) line(c, [i * 14 - 8, 0, i * 14 + 8, -34], dark, 3); c.restore();
  rr(c, -4, -34, 8, 34, 2); c.fillStyle = '#fff6da'; c.fill();
  if (empty) { rr(c, -19, -36, 38, 7, 3); c.fillStyle = '#2a1a10'; c.fill(); }
  if (p.pie && p.kind === 1 && !empty) { ell(c, -12, -18, 7, 5.5, '#2a1a10'); poly(c, [-16, -20, -33, -17, -16, -14], '#6a6a78'); circ(c, -10, -20, 2.4, '#fff'); circ(c, -10.5, -20, 1.2, '#111'); }
  c.save(); c.translate(lid * 30, -lid * 18); c.rotate(lid * 1.1);
  rr(c, -25, -42, 50, 10, 3); c.fillStyle = dark; c.fill(); rr(c, -4, -42, 8, 10, 2); c.fillStyle = '#fff6da'; c.fill();
  ell(c, -8, -46, 8, 4.5, '#fff6da', -.3); ell(c, 8, -46, 8, 4.5, '#fff6da', .3); circ(c, 0, -45, 3.5, '#f2b93b');   // the bow
  c.restore();
  if (!p.pie) {   // a heart tag on a string
    line(c, [-3, -42, -14, -36], '#fff6da', 1.4);
    rr(c, -30, -38, 20, 17, 3); c.fillStyle = '#fff6da'; c.fill();
    c.beginPath(); c.moveTo(-20, -24.5); c.bezierCurveTo(-28, -29, -27, -36, -20, -32.5); c.bezierCurveTo(-13, -36, -12, -29, -20, -24.5); c.fillStyle = '#e8436a'; c.fill();
  }
  c.restore();
}
// A small parachute over a falling parcel (same place and scale as bossParcel).
function bossChute(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  for (const d of [-1, 0, 1]) line(c, [d * 18, -46, d * 32, -80], 'rgba(255,246,218,.8)', 1.2);
  c.beginPath(); c.ellipse(0, -80, 36, 24, 0, Math.PI, 0); c.closePath(); c.fillStyle = '#fff6da'; c.fill();
  c.save(); c.clip(); for (const d of [-1, 0, 1]) ell(c, d * 23, -80, 7, 26, '#e8503a'); c.restore();
  c.restore();
}
// The Baron's patched balloon; (x, y) is the bottom of its basket. o: fl (0..1 the air goes out), rot, baron (he rides in
// the basket, with o.face).
function bossBalloon(c, x, y, s, t, o = {}) {
  const fl = o.fl || 0, rx = 54 * (1 - .5 * fl), ry = 62 * (1 - .6 * fl), cy = -92 - ry;
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  for (const d of [-1, 1]) line(c, [d * rx * .55, cy + ry * .83, d * 20, -28], '#c9b27a', 1.5);
  c.save(); c.beginPath(); c.ellipse(0, cy, rx, ry, 0, 0, TAU); c.clip();
  c.fillStyle = '#7a5ca8'; c.fillRect(-rx, cy - ry, rx * 2, ry * 2);
  for (const d of [-.5, .5]) ell(c, d * rx, cy, rx * .2, ry, '#ffd24a');
  for (const [px, py, w, col] of [[-.42, -.3, .34, '#ff9ecb'], [.32, .2, .3, '#7fd0ff'], [0, .52, .26, '#6fdc95']]) {   // patches, stitched on
    rr(c, px * rx - w * rx / 2, cy + py * ry - w * rx / 2, w * rx, w * rx, 3); c.fillStyle = col; c.fill();
    c.setLineDash([3, 3]); c.lineWidth = 1.5; c.strokeStyle = '#fff6da'; c.stroke(); c.setLineDash([]);
  }
  c.restore();
  if (fl > 0 && !still()) for (let i = 0; i < 3; i++) line(c, [-6 + i * 6, cy + ry + 3, -12 + i * 12, cy + ry + 15 + Math.sin(t * 30 + i) * 3], 'rgba(255,246,218,.7)', 2);   // the air rushes out
  if (o.baron) bossBaron(c, 0, -4, .72, t, { dir: -1, face: o.face });
  rr(c, -24, -30, 48, 30, 6); c.fillStyle = '#a8703f'; c.fill();
  for (const yy of [-20, -10]) line(c, [-22, yy, 22, yy], '#8a5a30', 2);
  c.restore();
}
// A cog with teeth, turned by `a`.
function bossCog(c, x, y, r, a, col) {
  const n = Math.max(6, Math.round(r * .6)) * 4;
  c.save(); c.translate(x, y); c.rotate(a); c.beginPath();
  for (let i = 0; i < n; i++) { const q = i % 4 < 2 ? r : r * .74, b = i * TAU / n; c.lineTo(Math.cos(b) * q, Math.sin(b) * q); }
  c.closePath(); c.fillStyle = col; c.fill(); circ(c, 0, 0, r * .32, '#3a2a4a');
  c.restore();
}
// A loose spring: a zigzag coil `len` long, turned by `a`.
function bossSpring(c, x, y, len, a) {
  c.save(); c.translate(x, y); c.rotate(a); c.beginPath();
  for (let i = 0; i <= 8; i++) c.lineTo(i % 2 ? 6 : -6, -i * len / 8);
  c.lineWidth = 2.6; c.strokeStyle = '#dfe6f5'; c.lineJoin = 'round'; c.stroke();
  c.restore();
}
// The Guess-o-Matic (bottom centre at x): a box on wheels with a crank, a horn, a picture window and far too many cogs.
// o: a (crank angle), pic (the guess in the window), ok (a tick: it guessed the lock), broken (fallen apart).
function bossMachine(c, x, o = {}) {
  const a = o.a || 0;
  c.save(); c.translate(x, 0);
  if (o.broken) {   // what is left: a squashed box with its lid askew, springs sticking out, the horn drooping
    for (const [sx, ln, r] of [[-26, 34, -.4], [2, 44, .1], [26, 30, .5]]) bossSpring(c, sx, -30, ln, r);
    rr(c, -54, -34, 108, 34, 8); c.fillStyle = '#7a5ca8'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#4a3470'; c.stroke();
    c.save(); c.translate(-30, -36); c.rotate(-.35); rr(c, -26, -8, 70, 10, 4); c.fillStyle = '#4a3470'; c.fill(); c.restore();
    c.save(); c.translate(-52, -18); c.rotate(-2.2); poly(c, [-4, 0, 4, 0, 9, -26, -9, -26], '#c9a25a'); ell(c, 0, -27, 13, 6, '#ffd24a'); c.restore();
    rr(c, 4, -28, 34, 20, 4); c.fillStyle = '#fff6da'; c.fill();
    c.restore(); return;
  }
  for (const wx of [-34, 34]) { circ(c, wx, -12, 12, '#3a2a4a'); circ(c, wx, -12, 5, '#c9a25a'); }
  bossCog(c, -20, -108, 16, a, '#c9a25a'); bossCog(c, 6, -118, 11, -a * 1.45, '#ffd24a'); bossCog(c, 28, -106, 13, a * 1.2, '#c9a25a');
  bossCog(c, -50, -50, 12, -a * 1.3, '#ffd24a'); bossCog(c, 48, -30, 10, a * 1.6, '#ffd24a');
  rr(c, -50, -100, 100, 82, 10); c.fillStyle = '#7a5ca8'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#4a3470'; c.stroke();
  for (const [rx, ry] of [[-42, -92], [42, -92], [-42, -26], [42, -26]]) circ(c, rx, ry, 2.5, '#c9a25a');
  rr(c, -38, -90, 46, 42, 7); c.fillStyle = '#fff6da'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#c9a25a'; c.stroke();   // the picture window
  if (o.ok) { circ(c, -15, -69, 15, '#3fae5e'); drawIcon(c, 'yes', -15, -69, 18); } else if (o.pic) drawIcon(c, o.pic, -15, -69, 30);
  circ(c, 28, -76, 9, '#fff6da'); line(c, [28, -76, 28 + Math.cos(a * 2) * 7, -76 + Math.sin(a * 2) * 7], '#e8503a', 2);   // a dial
  bossCog(c, 28, -42, 9, a * 2, '#c9a25a'); bossCog(c, -26, -32, 7, -a * 2.4, '#ffd24a');
  c.save(); c.translate(-40, -100); c.rotate(-.35); poly(c, [-4, 0, 4, 0, 9, -26, -9, -26], '#c9a25a'); ell(c, 0, -27, 13, 6, '#ffd24a'); ell(c, 0, -27, 7, 3, '#7a4c00'); c.restore();
  const hx = 54 + Math.cos(a) * 16, hy = -64 + Math.sin(a) * 16;   // the crank on the right side
  circ(c, 54, -64, 5, '#4a3470'); line(c, [54, -64, hx, hy], '#c9a25a', 4); circ(c, hx, hy, 5, '#e8503a');
  c.restore();
}
// The firefly vault beside the gate: a round door on a stone step. o: lock (the chosen picture row, or null), drop 0..1
// (the lock comes down into place), pop 0..1 (it springs open), safe (the door glows gold).
function bossVault(c, x, o = {}) {
  rr(c, x - 54, -14, 108, 14, 4); c.fillStyle = '#4a5468'; c.fill();
  if (o.safe) glow(c, x, -64, 96, '255,216,107', .55);
  circ(c, x, -64, 48, '#5a6478'); circ(c, x, -64, 41, o.safe ? '#ffd86b' : '#8a94a8'); circ(c, x, -64, 31, o.safe ? '#ffe9a3' : '#aeb9d0');
  for (let i = 0; i < 8; i++) circ(c, x + Math.cos(i * TAU / 8) * 36, -64 + Math.sin(i * TAU / 8) * 36, 2.6, '#5a6478');
  if (!o.lock) {   // where the lock goes: a dashed outline with a question mark
    c.setLineDash([5, 4]); c.lineWidth = 3; c.strokeStyle = '#fff6da';
    c.beginPath(); c.arc(x, -72, 10, Math.PI, 0); c.stroke(); rr(c, x - 16, -72, 32, 26, 5); c.stroke(); c.setLineDash([]);
    c.font = '900 20px ui-rounded, "Segoe UI", Roboto, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#fff6da'; c.fillText('?', x, -52);
    return;
  }
  const n = o.lock.length, tw = 22, sw = n * tw + 6, pop = o.pop || 0;
  c.save(); c.translate(x, -64 - (1 - o.drop) * 130);
  rr(c, -sw / 2, 14, sw, tw + 4, 6); c.fillStyle = '#fff6da'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#c9a25a'; c.stroke();   // its password: one tile per picture
  o.lock.forEach((p, i) => drawIcon(c, p, -sw / 2 + 3 + tw / 2 + i * tw, 16 + tw / 2, tw - 3));
  c.translate(0, -pop * 16); c.rotate(pop * .5);
  c.beginPath(); c.arc(pop * 8, -8 - pop * 10, 10, Math.PI, 0); c.lineWidth = 5; c.strokeStyle = '#dfe6f5'; c.stroke();   // the shackle springs up when it opens
  rr(c, -16, -9, 32, 24, 5); c.fillStyle = '#ffcf4a'; c.fill(); circ(c, 0, 1, 4, '#7a4c00'); rr(c, -1.6, 1, 3.2, 8, 1); c.fillStyle = '#7a4c00'; c.fill();
  c.restore();
}

scenes.boss = {
  enter(o = {}) {
    this.then = o.then || (() => go('hub'));
    Object.assign(this, { act: 0, ph: 'wait', at: V.t, ev: {}, miss: 0, stars: 0, fresh: false, asked: {}, bar: null, splat: false, parcels: [], found: 0,
      sel: -1, kb: false, busy: 0, locks: bossLocks(), lockOn: null, crank: 0, bits: [], bubKey: '', bubT: -9, anchor: null, bubble: null });
    this.hudEl = hud(() => go('hub'), '', true);
    owlSay(t('boss_intro'), { title: t('s_boss'), html: `<div class="pics">${ic('stk:m6', 64)}</div>`, acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => this.to('in1') }] });
  },
  // The stage: units with the ground at y = 0, scaled to fit between the top bar and the button band (the Gate Check's
  // ground line). It is 400 to 640 units wide and centred; L and R are the screen edges in units.
  geo() {
    const top = this.hudEl.getBoundingClientRect().bottom + 4, gy = V.h - Math.max(118, V.h * .2);
    const u = Math.max(.4, Math.min(V.w / 400, (gy - top) / 225)), SW = clamp(V.w / u, 400, 640), ox = (V.w - SW * u) / 2;
    return { top, gy, u, SW, ox, HH: (gy - top) / u, L: -ox / u, R: SW + ox / u, ps: clamp(.75 / u, 1, 1.4), XC: SW - 40, MX: clamp(SW * .62, 258, 400) };
  },
  boughs(G) { return [-Math.max(175, G.HH * .4), -Math.max(140, G.HH * .33)]; },
  // Where the five parcels land: one on each branch, three on the ground between the gate and the leftover cake.
  spot(G, i) { const [yL, yR] = this.boughs(G); return [[80, yL - 4], [G.SW - 80, yR - 4], [116, 0], [G.SW / 2 - 9, 0], [G.SW - 134, 0]][i]; },
  to(ph) {
    this.ph = ph; this.at = V.t; this.ev = {};
    const act = { in1: 1, in2: 2, in3: 3, fin: 4 }[ph];
    if (act) this.act = act;
    if (ph === 'ask1') {
      if (!this.bar) {   // the same two buttons as at the Gate Check
        this.bar = add(`<div class="bar gatebtns"><button class="btn go" id="bIn">${ic('yes', 30)}${esc(t('letIn'))}</button>
          <button class="btn no" id="bOut">${ic('no', 30)}${esc(t('shoo'))}</button></div>`);
        $('#bIn', this.bar).onclick = () => this.cake(true);
        $('#bOut', this.bar).onclick = () => this.cake(false);
      }
      this.talk(1);
    }
    if (ph === 'back1') { bossToast('boss_tip1'); bossSnd.rewind(); }
    if ((ph === 'win1' || ph === 'oops3' || ph === 'win3') && this.bar) { this.bar.remove(); this.bar = null; }
    if (ph === 'in2') {
      const order = shuffle([0, 1, 2, 3, 4]);
      this.parcels = shuffle([[1, 0], [1, 1], [1, 2], [0, 0], [0, 1]]).map(([pie, kind], i) => ({ pie: !!pie, kind, spot: i, paper: (i + order[i]) % 4, drop: 1.3 + order[i] * .32, openT: 0, sadT: -9, seed: rnd(TAU) }));
      this.found = 0; this.sel = -1;
    }
    if (ph === 'ask3') {
      const isz = V.w < 420 ? 24 : 32;
      this.bar = add(`<div class="bar">${this.locks.map((p, i) => `<button class="btn" data-i="${i}" style="min-height:64px;padding:.3em .6em;gap:3px"
        aria-label="${esc(t('pass') + ': ' + p.map(n => t(n)).join(', '))}">${p.map(n => `<span style="display:inline-flex;padding:2px;border-radius:.4em;background:#fff6da">${ic(n, isz)}</span>`).join('')}</button>`).join('')}</div>`);
      this.bar.onclick = e => { const b = e.target.closest('button'); if (b) { sfx.click(); this.lock(+b.dataset.i); } };
      this.bar.firstChild.focus({ preventScroll: true });
      this.talk(3);
    }
  },
  // The Baron's line shows in a bubble for a few seconds; the first time in each act he chatters it, and when the bubble
  // has gone the owl asks for the one action. A second try shows the bubble silently, so the owl's tip is not cut off.
  talk(n) {
    const s = t('boss_say' + n);
    this.bubKey = 'boss_say' + n; this.bubT = V.t;
    if (this.asked[n]) return;
    this.asked[n] = 1; say(s); speak(s, 'pie');
    if (n < 4) later(() => { if (this.ph === 'ask' + n) bossToast('boss_ask' + n); }, 3200);   // not needed once the player has acted
  },
  // ----- the player's choices; a test can call these directly (each only works while its act waits for it) -----
  cake(letIn) {
    if (this.ph !== 'ask1') return;
    if (letIn) { this.miss++; this.to('oops1'); } else { sfx.squawk(); this.to('win1'); }
  },
  open(i) {
    const p = this.parcels[i];
    if (this.ph !== 'ask2' || !p || p.openT || V.t < this.busy) return;
    const G = this.geo(), [sx, sy] = this.spot(G, p.spot);
    if (p.pie) {
      p.openT = V.t; this.found++;
      sfx.squawk(); buzz(30); this.puff(G, sx, sy - 30, 16, ['#1a1a22', '#f4f4f0', '#3f6fe0'], 'feather');
      if (this.found === 3) this.to('win2');
    } else { p.sadT = V.t; this.busy = V.t + 1.6; this.miss++; sfx.oops(); later(() => bossToast('boss_tip2'), 350); }
  },
  lock(i) {
    if (this.ph !== 'ask3' || !this.locks[i]) return;
    this.lockOn = this.locks[i];
    if (this.lockOn.length < 4) { this.miss++; this.to('oops3'); return; }
    // The strongest lock wins the Night's last act: everything is saved now, before the celebration.
    const stars = this.stars = this.miss === 0 ? 3 : this.miss <= 2 ? 2 : 1;
    S.boss = S.night; S.stars += stars; S.beams += stars * 10; this.fresh = stick('m6'); save(); refreshHud();
    sfx.slam(); this.to('win3');
  },
  puff(G, x, y, n, colors, kind) { burst(G.ox + x * G.u, G.gy + y * G.u, n, { colors, kind, speed: 220, g: kind === 'feather' ? 120 : 220, size: kind === 'feather' ? 9 : 7, life: kind === 'feather' ? 1.2 : .9 }); },
  // Parcels from left to right that can still be opened, for the arrow keys.
  order() { const G = this.geo(); return this.parcels.map((p, i) => i).filter(i => !this.parcels[i].openT).sort((a, b) => this.spot(G, this.parcels[a].spot)[0] - this.spot(G, this.parcels[b].spot)[0]); },
  // Act 1: arrows like the Gate Check (left lets in, right shoos). Act 2: arrows move the highlight, Enter or Space opens.
  // Act 3: arrows move between the three locks, 1 to 3 pick one.
  key(e) {
    if (this.ph === 'ask1') { if (e.key === 'ArrowLeft') this.cake(true); if (e.key === 'ArrowRight') this.cake(false); }
    if (this.ph === 'ask2') {
      const ord = this.order(), j = ord.indexOf(this.sel);
      if (/^Arrow/.test(e.key)) { e.preventDefault(); this.kb = true; this.sel = ord[j < 0 ? 0 : (j + (/Left|Up/.test(e.key) ? -1 : 1) + ord.length) % ord.length]; }
      else if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('button')) { e.preventDefault(); if (this.kb && j >= 0) this.open(this.sel); else { this.kb = true; this.sel = ord[0]; } }
    }
    if (this.ph === 'ask3' && this.bar) {
      const bs = [...this.bar.children], j = bs.indexOf(document.activeElement);
      if (/^[1-3]$/.test(e.key)) bs[e.key - 1].click();
      else if (/^Arrow/.test(e.key)) { e.preventDefault(); bs[j < 0 ? 0 : (j + (/Left|Up/.test(e.key) ? -1 : 1) + 3) % 3].focus(); }
    }
  },
  // A tap opens the nearest parcel within reach; the reach is at least 30 px around its middle.
  down(x, y) {
    if (this.ph !== 'ask2') return;
    const G = this.geo(), ux = (x - G.ox) / G.u, uy = (y - G.gy) / G.u;
    let best = -1, bd = Math.max(34 * G.ps, 30 / G.u);
    this.parcels.forEach((p, i) => { if (p.openT) return; const [sx, sy] = this.spot(G, p.spot), d = Math.hypot(ux - sx, uy - sy + 22 * G.ps); if (d < bd) { bd = d; best = i; } });
    if (best >= 0) { this.kb = false; this.open(best); }
  },
  update(dt) {
    const k = V.t - this.at, at = s => k >= s && !this.ev[s] && (this.ev[s] = 1), G = this.geo();
    switch (this.ph) {
      case 'in1': if (at(1.6)) bossSnd.giggle(); if (at(2.2)) this.to('ask1'); break;
      case 'oops1': if (at(.45)) { sfx.pop(); bossSnd.horn(); this.puff(G, 172, -160, 26, ['#ff9ecb', '#ffd86b', '#7fd0ff', '#6fdc95'], 'star'); } if (at(2.4)) this.to('back1'); break;
      case 'back1': if (at(1.1)) { bossSnd.giggle(); this.to('ask1'); } break;
      case 'win1':
        if (at(1.4)) { sfx.puff(); sfx.bonk(); buzz(40); this.splat = true; this.puff(G, G.XC, -40, 30, ['#fff6f0', '#ff9ecb', '#f7c9a0']); }
        if (at(3.8)) sfx.squawk();
        if (at(4.6)) this.to('in2');
        break;
      case 'in2':
        if (at(1.2)) this.talk(2);
        for (const p of this.parcels) if (at(p.drop + 1.1)) bossSnd.thud();
        if (at(3.8)) this.to('ask2');
        break;
      case 'win2': if (at(.4)) sfx.sparkle(); if (at(3)) this.to('in3'); break;
      case 'in3': if (at(2)) this.to('ask3'); break;
      case 'oops3':
        if (k > .4 && k < 1.6) this.turn(7 * dt);
        if (at(1.6)) { sfx.ding(); bossSnd.horn(); this.puff(G, 142, -90, 26, ['#ff9ecb', '#ffd86b', '#7fd0ff', '#6fdc95'], 'star'); }
        if (at(2)) bossToast('boss_tip3');
        if (at(3.4)) { this.locks = bossLocks(); this.lockOn = null; this.to('ask3'); }
        break;
      case 'win3': {
        const q = clamp((k - .4) / 2.6, 0, 1);
        if (k > .4 && k < 3) this.turn((5 + 34 * q * q) * dt);   // faster and faster
        if (at(1.2) || at(2.2)) bossSnd.horn();
        if (at(3)) {   // it falls apart: cogs and springs everywhere
          sfx.bonk(); sfx.boing(); later(() => sfx.boing(), 260); buzz(60);
          this.puff(G, G.MX, -70, 20, ['#c9c9d6', '#fff'], 'spark');
          this.bits = [...Array(10)].map((_, i) => ({ x: G.MX + rnd(-30, 30), y: -70 - rnd(30), vx: rnd(-150, 150), vy: rnd(-320, -160), a: rnd(TAU), va: rnd(-9, 9), r: rnd(6, 11), cog: i % 3 < 2, rest: false }));
          if (still()) for (const b of this.bits) Object.assign(b, { x: G.MX + rnd(-100, 100), y: -b.r * (b.cog ? 1 : .2), rest: true });
        }
        if (at(4.8)) this.to('fin');
        break;
      }
      case 'fin':
        if (at(2.2)) bossSnd.rasp();
        if (at(4.4)) { bossSnd.plop(); this.puff(G, G.XC, -12, 22, ['#fff6f0', '#ff9ecb']); }
        if (at(4.8)) this.talk(4);
        if (at(7.1)) sfx.fanfare();
        if (at(9)) { this.ph = 'end'; this.result(); }   // the clock keeps running, so the stage stays in its final picture
        break;
    }
    // loose cogs and springs fly, bounce and settle (stage units per second)
    for (const b of this.bits) {
      if (b.rest) continue;
      b.vy += 640 * dt; b.x = clamp(b.x + b.vx * dt, G.L + 12, G.R - 12); b.y += b.vy * dt; b.a += b.va * dt;
      const floor = -b.r * (b.cog ? 1 : .2);
      if (b.y > floor) { b.y = floor; b.vy *= -.35; b.vx *= .55; b.va *= .5; if (Math.abs(b.vy) < 40) b.rest = true; }
    }
  },
  // The crank turns; every quarter turn clicks like a ratchet and the window shows the next guess.
  turn(da) { const q = Math.floor(this.crank / (TAU / 4)); this.crank += da; if (Math.floor(this.crank / (TAU / 4)) !== q) sfx.type(); },
  mood(k) {
    const ph = this.ph;
    if (ph === 'win1' && k > 1.4 || ph === 'win2' || ph === 'win3' && k > 3 || ph === 'fin' && k > 4.4 || ph === 'end') return 'cheer';
    if (ph === 'oops3' && k > 1.6 && k < 2.8 || this.act === 2 && V.t < this.busy) return 'no';
    return 'idle';
  },
  result() {
    burst(V.w / 2, V.h * .35, 40, { colors: ['#ffd86b', '#fff', '#ff9ecb', '#7fd0ff'], speed: 320, life: 1.4, kind: 'star', size: 9 });
    owlSay(t('boss_win'), { title: t('s_boss'), stars: this.stars, mood: 'cheer', quiet: true,
      html: stickerHtml(this.fresh ? 'm6' : '') + `<div class="pics"><span class="pill pop">${ic('beam', 22)}<b>+${this.stars * 10}</b></span></div>`,
      acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: () => sagaAfter(this.then) }] });
  },
  draw() {
    const G = this.geo(), t0 = V.t, k = t0 - this.at, ph = this.ph, [yL, yR] = this.boughs(G);
    drawSky(ctx, t0);
    ctx.fillStyle = '#0c1740'; ctx.fillRect(0, G.gy, V.w, V.h - G.gy);
    ell(ctx, V.w / 2, G.gy + 6, V.w * .6, 12, '#13235a');
    ctx.save(); ctx.translate(G.ox, G.gy); ctx.scale(G.u, G.u);
    this.anchor = null;
    // two branches reach in from the sides; in act 2 parcels land on them
    for (const [x0, x1, y] of [[G.L - 10, 120, yL], [G.R + 10, G.SW - 120, yR]]) {
      line(ctx, [x0, y + 8, x1, y], '#5a3a22', 13); line(ctx, [x0, y + 3, x1, y - 4], '#6b462a', 4);
      circ(ctx, x1, y - 10, 22, '#1f5a3c'); circ(ctx, x1 - 13, y - 3, 15, '#1a4c33'); circ(ctx, x1 + 14, y - 5, 16, '#246a45');
    }
    // the treehouse gate with its lantern; the owl keeps watch in it
    line(ctx, [12, 0, 12, -120], '#6b462a', 12); line(ctx, [80, 0, 80, -120], '#6b462a', 12);
    ctx.beginPath(); ctx.arc(46, -120, 34, Math.PI, 0); ctx.lineWidth = 12; ctx.strokeStyle = '#8a5a34'; ctx.stroke();
    drawIcon(ctx, 'lamp', 46, -126, 34);
    owl(ctx, 46, 0, .62, t0, this.mood(k));
    if (ph === 'oops1' && k > .5) bossHide(ctx, 46, 0, .62, t0);
    if (this.splat) bossSplat(ctx, G.XC);
    if (this.act === 1) this.draw1(G, t0, k);
    if (this.act === 2) this.draw2(G, t0, k);
    if (this.act >= 3) this.draw3(G, t0, k);
    if (this.act === 4) this.draw4(G, t0, k);
    ctx.restore();
    if (ph === 'back1') {   // "rewind": everything plays backwards under a big rewind sign
      const r = clamp(Math.min(V.w, V.h) * .08, 26, 60), x = V.w / 2, y = G.top + (G.gy - G.top) * .45;
      rr(ctx, x - r * 1.7, y - r, r * 3.4, r * 2, r * .5); ctx.fillStyle = 'rgba(13,22,60,.75)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff6da'; ctx.stroke();
      poly(ctx, [x - r * 1.2, y, x, y - r * .6, x, y + r * .6], '#fff6da'); poly(ctx, [x, y, x + r * 1.2, y - r * .6, x + r * 1.2, y + r * .6], '#fff6da');
    }
    if (this.act === 2) {   // three magpies to find, in the empty ground band: each one found gets a tick
      const s = clamp(Math.min(V.w, V.h) * .1, 36, 56), x0 = V.w / 2 - s - 10, y0 = (G.gy + V.h) / 2;
      for (let i = 0; i < 3; i++) {
        const x = x0 + i * (s + 10), got = i < this.found;
        circ(ctx, x, y0, s * .58, 'rgba(255,246,218,.95)');
        ctx.globalAlpha = got ? 1 : .3; drawIcon(ctx, 'pie', x, y0, s * .9); ctx.globalAlpha = 1;
        if (got) { circ(ctx, x + s * .36, y0 + s * .32, s * .24, '#3fae5e'); drawIcon(ctx, 'yes', x + s * .36, y0 + s * .32, s * .28); }
      }
    }
    this.bubble = null;
    if (this.anchor && t0 - this.bubT < 3.2) this.speech(G, ...this.anchor);
  },
  // The Baron's speech bubble, in screen pixels, one sentence per row when it fits. The tail points at the anchor
  // (stage units); the bubble goes above it, or below it (`down`), or to its left (`left`). Its rectangle is kept for
  // a layout test: the overlay must not cover it.
  // `clear` [x0, x1, y] (stage units) names something tall beside the speaker (the cake). A bubble that would lie
  // across it moves to the far side of it when the screen is wide enough (a phone held sideways), or else above it (a
  // phone held upright), and its tail still comes down to the speaker.
  speech(G, x, y, mode, clear) {
    const fs = clamp(Math.min(V.w, V.h) * .042, 13, 18), ax = G.ox + x * G.u, ay = G.gy + y * G.u, lh = fs * 1.2, left = mode === 'left', down = mode === 'down';
    ctx.font = `800 ${fs}px ui-rounded, "Segoe UI", Roboto, sans-serif`;
    const rows = sentences(t(this.bubKey)).flatMap(s => bossWrap(s, Math.min(V.w - 40, fs * 13))), w = Math.max(...rows.map(s => ctx.measureText(s).width)) + 26, h = rows.length * lh + 14;
    let bx = clamp(left ? ax - w - 18 : ax - w / 2, 6, V.w - w - 6), by = clamp(left ? ay - h / 2 : down ? ay + 14 : ay - h - 14, G.top + 2, V.h - h - 6);
    if (clear && bx < G.ox + clear[1] * G.u && bx + w > G.ox + clear[0] * G.u) {
      const past = G.ox + clear[1] * G.u + 4, over = G.gy + clear[2] * G.u - h - 4;
      if (past + w <= V.w - 6) bx = past; else if (over >= G.top + 2) by = Math.min(by, over);
    }
    rr(ctx, bx, by, w, h, 14); ctx.fillStyle = '#fff6da'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#4a3470'; ctx.stroke();
    const tx = clamp(ax, bx + 18, bx + w - 18), ty = clamp(ay, by + 14, by + h - 14);
    poly(ctx, left ? [bx + w - 2, ty - 8, bx + w - 2, ty + 8, ax, ay] : down ? [tx - 9, by + 2, tx + 9, by + 2, ax, ay] : [tx - 9, by + h - 2, tx + 9, by + h - 2, ax, ay], '#fff6da');
    ctx.fillStyle = '#2a1c05'; ctx.textAlign = 'center';
    rows.forEach((s, i) => ctx.fillText(s, bx + w / 2, by + 7 + fs * .95 + i * lh));
    this.bubble = [bx, by, w, h];
  },
  // Act 1, the Trojan Cake. SHOO: it rolls back, crashes and falls apart. LET IN: a surprise party, then a rewind.
  draw1(G, t0, k) {
    const ph = this.ph, CX = 172;
    let x = CX, lid = 0, peek = 0, walk = false, bface = 'smug', bpose = 'stand';
    if (ph === 'in1') { x = lerp(G.R + 120, CX, bossE(k / 2.2)); walk = x > CX + .5; bpose = walk ? 'walk' : 'stand'; }
    if (ph === 'oops1') { lid = bossE((k - .4) / .4); peek = bossE((k - .5) / .5); if (k > .4) bface = 'joy'; }
    if (ph === 'back1') lid = peek = 1 - bossE(k / .9);
    if (ph !== 'win1' || k < 1.4) {
      if (ph === 'win1') { x = lerp(CX, G.XC, still() ? 1 : Math.pow(k / 1.4, 2)); walk = true; bface = 'shock'; bpose = 'walk'; }   // rolling back downhill
      const wob = still() ? 0 : Math.sin(t0 * 5) * (ph === 'win1' ? .07 : .025);
      bossCake(ctx, x, t0, { roll: (x - CX) / 14, wob, walk, lid, peek, giggle: ph === 'ask1' || ph === 'in1' });
      bossBaron(ctx, x + 104, 0, .95, t0, { dir: -1, pose: bpose, face: bface, chef: true });   // he pushes from behind (and is pushed back)
      if (ph === 'ask1') this.anchor = [x + 85, -104, '', [x - 62, x + 62, -222]];   // on a phone the bubble is wider than the gap beside the cake
      return;
    }
    // the crash: the tiers fly, three dizzy magpies sit in the cream, the Baron is flung off to the right
    const q = k - 1.4;
    if (!still() && q < .8) [[-1, 80, 280, -40], [.4, 150, 340, -100], [1, 120, 300, -150]].forEach(([d, vx, vy, y0], i) => {
      const px = G.XC + d * vx * q, py = y0 - vy * q + 680 * q * q;
      if (py > -12) return;
      ctx.save(); ctx.translate(px, py); ctx.rotate(d * q * 6 + i);
      rr(ctx, -30 + i * 6, -14, 60 - i * 12, 28, 8); ctx.fillStyle = '#f7c9a0'; ctx.fill(); rr(ctx, -32 + i * 6, -16, 64 - i * 12, 10, 5); ctx.fillStyle = '#ff9ecb'; ctx.fill();
      ctx.restore();
    });
    const fq = k < 3.8 ? 0 : k - 3.8, dx = still() ? (fq ? 1e4 : 0) : fq * fq * 420;
    [-40, -4, 32].forEach((d, i) => magpie(ctx, G.XC + d + dx, 5, .62, t0 + i, { dir: fq || i % 2 ? 1 : -1, pose: fq ? 'flee' : 'dizzy' }));
    if (!fq) bossSplat(ctx, G.XC, true);
    const fly = bossE(q / .7);
    if (fly < 1) { ctx.save(); ctx.translate(lerp(G.XC + 104, G.R + 110, fly), -40 - Math.sin(fly * Math.PI) * 70); ctx.rotate(fly * 5); bossBaron(ctx, 0, 40, .95, t0, { dir: -1, face: 'shock', chef: true }); ctx.restore(); }
  },
  // Where the balloon's basket is in act 2: it floats in, bobs while parcels drop, and drifts away at the end.
  basket(G, k) {
    const bs = clamp(G.HH / 400, .6, 1), x0 = G.SW / 2 + 30;
    let x = x0, y = -G.HH + 218 * bs + 4 + (still() ? 0 : Math.sin(V.t * 1.6) * 4);
    if (this.ph === 'in2') x = lerp(G.R + 90, x0, bossE(k / 1.2));
    if (this.ph === 'win2') { const q = bossE((k - 1.1) / 1.8); x = lerp(x0, G.R + 120, q); y -= 160 * q; }
    return [x, y, bs];
  },
  // Act 2, parcels from the sky. Magpie parcels pop open and the magpie flees; a friend peeks out sadly and hides again.
  draw2(G, t0, k) {
    const ph = this.ph, [bx, by, bs] = this.basket(G, k), ps = G.ps;
    bossBalloon(ctx, bx, by, bs, t0, { baron: true, face: ph === 'win2' ? 'shock' : 'smug' });
    if (ph === 'in2' && k > 1.2) this.anchor = wide() ? [bx - 26 * bs, by - 34 * bs, 'left'] : [bx, by + 2, 'down'];
    const flee = [];
    this.parcels.forEach((p, i) => {
      let [sx, sy] = this.spot(G, p.spot), q = 1;
      if (ph === 'in2') {
        // tossed up out of the basket, then down under a little parachute (with reduced motion it simply appears)
        q = (k - p.drop) / 1.1;
        if (q <= 0) return;
        if (q < 1 && !still()) {
          const px = lerp(bx, sx, .3), py = Math.min(by - 8, sy) - 40;
          if (q < .3) { const r = q / .3; sx = lerp(bx, px, r); sy = lerp(by - 8, py, 1 - (1 - r) * (1 - r)); }
          else { const r = (q - .3) / .7; sx = lerp(px, sx, r) + Math.sin(r * TAU) * 10 * (1 - r); sy = lerp(py, sy, r); bossChute(ctx, sx, sy, ps); }
        }
      }
      if (p.openT) {
        bossParcel(ctx, sx, sy, ps, p, 1, true);
        flee.push([sx, sy, t0 - p.openT, sx < G.SW / 2 ? -1 : 1]);
        return;
      }
      const sad = t0 - p.sadT, happy = ph === 'win2' && !p.pie;
      let out = happy ? bossE(k / .35) : sad < .25 ? bossE(sad / .25) : sad < 1.15 ? 1 : sad < 1.5 ? 1 - bossE((sad - 1.15) / .35) : 0;
      if (out > 0) critter(ctx, sx, sy - (8 + 30 * out) * ps, .5 * ps, t0, p.kind, !happy);   // the friend inside: sad when disturbed, happy at the end
      ctx.save(); ctx.translate(sx, sy);
      if (p.pie && q >= 1 && !still()) ctx.rotate(Math.sin(t0 * 7 + p.seed) * .08);   // something inside wriggles
      bossParcel(ctx, 0, 0, ps, p, out);
      ctx.restore();
      if (this.kb && this.sel === i && ph === 'ask2') {   // the keyboard highlight: a dashed ring and an arrow
        const b = still() ? 0 : Math.abs(Math.sin(t0 * 4)) * 6, top = sy - 70 * ps;
        ctx.setLineDash([6, 5]); ctx.lineWidth = 4; ctx.strokeStyle = '#ffd86b'; ctx.beginPath(); ctx.arc(sx, sy - 24 * ps, 38 * ps, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        poly(ctx, [sx - 10, top - 18 - b, sx + 10, top - 18 - b, sx, top - b], '#ffd86b');
      }
    });
    for (const [sx, sy, f, d] of flee) {   // a found magpie flies off squawking (with reduced motion it just stands by its box a moment)
      if (still()) { if (f < .8) magpie(ctx, sx + d * 36 * ps, sy, .62 * ps, t0, { dir: d, face: 'shock' }); }
      else if (f < 1.8) magpie(ctx, sx + d * f * 260, sy - 24 - f * 150, .62 * ps, t0, { dir: d, pose: 'flee', face: 'shock' });
    }
  },
  // Act 3, the Guess-o-Matic, and its wreck in the finale.
  draw3(G, t0, k) {
    const ph = this.ph, VX = 142, broken = ph === 'win3' && k >= 3 || this.act === 4;
    const busy = ph === 'oops3' && k > .4 && k < 1.6 || ph === 'win3' && k > .4 && k < 3;
    const mx = (ph === 'in3' ? lerp(G.R + 80, G.MX, bossE(k / 2)) : G.MX) + (ph === 'win3' && busy && !still() ? Math.sin(t0 * 47) * 4 * clamp((k - .4) / 2.6, 0, 1) : 0);
    const pop = ph === 'oops3' ? bossE((k - 1.6) / .35) : 0;
    bossVault(ctx, VX, { lock: this.lockOn, drop: ph === 'oops3' || ph === 'win3' ? bossE(k / .4) : 1, pop, safe: broken });
    if (pop) for (let i = 0; i < 4; i++) {   // party streamers spring out of the opened lock
      const a = -Math.PI / 2 + (i - 1.5) * .5, len = 74 * pop;
      ctx.beginPath(); for (let j = 0; j <= 12; j++) { const r = j / 12 * len; ctx.lineTo(VX + Math.cos(a) * r + Math.sin(j * 1.4 + i) * 5, -90 + Math.sin(a) * r); }
      ctx.lineWidth = 4; ctx.strokeStyle = ['#ff8a7a', '#ffd24a', '#6fdc95', '#7fd0ff'][i]; ctx.lineCap = 'round'; ctx.stroke();
    }
    if (!broken) {   // the guessing arm reaches from the machine to the lock, with a key at its tip
      const ax = mx - 50, lx = VX + 26, jig = busy && !still() ? Math.sin(t0 * 30) * 3 : 0;
      ctx.beginPath(); ctx.moveTo(ax, -58); ctx.quadraticCurveTo((ax + lx) / 2, -14 + jig, lx, -62 + jig); ctx.lineWidth = 8; ctx.strokeStyle = '#4a3470'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#8a94a8'; ctx.stroke();
      ctx.beginPath(); ctx.arc(lx + 8, -62 + jig, 6, 0, TAU); ctx.lineWidth = 3.5; ctx.strokeStyle = '#ffcf4a'; ctx.stroke();
      line(ctx, [lx + 2, -62 + jig, lx - 12, -62 + jig, lx - 12, -56 + jig, lx - 12, -62 + jig, lx - 7, -62 + jig, lx - 7, -57 + jig], '#ffcf4a', 3);
    }
    bossMachine(ctx, mx, { a: this.crank, pic: FWORDS[Math.floor(this.crank / (TAU / 4)) % FWORDS.length], ok: ph === 'oops3' && k >= 1.6, broken });
    if (ph === 'win3' && k > 1.2 || broken) for (let i = 0; i < 4; i++) {   // smoke
      const q = still() ? i / 4 : (t0 * .7 + i / 4) % 1;
      ctx.globalAlpha = (1 - q) * (broken ? .4 : .7); circ(ctx, mx + 6 + Math.sin(q * 5 + i) * 8, (broken ? -44 : -132) - q * 70, 8 + q * 14, '#c9c9d6'); ctx.globalAlpha = 1;
    }
    for (const b of this.bits) b.cog ? bossCog(ctx, b.x, b.y, b.r, b.a, '#c9a25a') : bossSpring(ctx, b.x, b.y, b.r * 2.4, b.a);
    if (this.act !== 3) return;
    // the Baron turns the crank from the right; when the machine breaks he is left dizzy among the cogs
    const bxp = mx + 92, hx = mx + 54 + Math.cos(this.crank) * 16, hy = -64 + Math.sin(this.crank) * 16;
    if (!broken) line(ctx, [bxp - 4, -32, hx, hy], '#27408f', 6);
    const face = ph === 'oops3' && k >= 1.6 ? 'joy' : ph === 'win3' ? 'sweat' : 'smug';
    bossBaron(ctx, bxp, 0, .9, t0, { dir: -1, pose: broken ? 'dizzy' : ph === 'in3' && k < 2 ? 'walk' : 'stand', face });
    if (this.splat) bossSplat(ctx, G.XC, true);   // on a narrow screen he stands in the leftover cream
    if (ph === 'ask3') this.anchor = [bxp - 18, -100];
  },
  // The finale: the balloon picks the Baron up, loses its air with a long raspberry and drops him softly into the
  // leftover cake. He tips his hat, and his magpies carry him off on their shoulders.
  draw4(G, t0, k) {
    const bs = clamp(G.HH / 400, .6, 1), x0 = G.MX + 92, XC = G.XC;
    if (k < 4.4) {
      let bx = x0, by, fl = 0, rot = 0, inside = k >= 1.4, face = 'smug';
      if (k < 1.4) { const q = bossE(k / 1.4); bx = lerp(G.R + 90, x0, q); by = lerp(-G.HH * .8, -34, q); }
      else if (k < 2.2) by = lerp(-34, -G.HH * .55, bossE((k - 1.4) / .8));
      else {
        const q = still() ? .5 : (k - 2.2) / 2.2;
        fl = q; face = 'shock';
        bx = lerp(x0, XC, q) + (still() ? 0 : Math.sin(q * 15) * 34 * (1 - q)); by = lerp(-G.HH * .55, -6, q * q); rot = still() ? .2 : Math.sin(q * 21) * .35 * (1 - q);
      }
      if (!inside) bossBaron(ctx, x0, 0, .9, t0, { dir: -1, face: 'sweat' });
      bossBalloon(ctx, bx, by, bs, t0, { fl, rot, baron: inside, face });
      return;
    }
    // the empty balloon lies in a heap beside the cake
    ctx.beginPath(); ctx.moveTo(XC + 18, 0); ctx.quadraticCurveTo(XC + 34, -34, XC + 58, -22); ctx.quadraticCurveTo(XC + 84, -30, XC + 92, 0); ctx.closePath(); ctx.fillStyle = '#7a5ca8'; ctx.fill();
    ell(ctx, XC + 50, -14, 7, 12, '#ffd24a', .4); rr(ctx, XC + 78, -24, 30, 22, 5); ctx.fillStyle = '#a8703f'; ctx.fill();
    const lift = k < 7 ? 0 : bossE((k - 7) / .4), off = k < 7.4 ? 0 : still() ? (k > 8.2 ? 1e4 : 0) : Math.pow(k - 7.4, 2) * 170, mq = k < 6 ? 0 : bossE((k - 6) / 1);
    const tip = k >= 4.8 && k < 6 ? (still() ? 1 : Math.sin(Math.PI * (k - 4.8) / 1.2)) : 0, by = lerp(8, -46, lift);
    bossBaron(ctx, XC + off, by, .9, t0, { dir: -1, face: k < 6 ? 'sad' : 'smug', tip });
    if (!lift) bossSplat(ctx, XC, true);   // he sits in the cream
    if (k >= 6) [-30, 0, 30].forEach((d, i) => magpie(ctx, lerp(G.R + 60 + d, XC + d, mq) + off, 0, .72, t0 + i, { dir: off ? 1 : -1, pose: mq < 1 || off ? 'walk' : 'stand', face: 'joy' }));
    this.anchor = [XC + off - 18, by - 100];
  },
};
