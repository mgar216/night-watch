// ---------- The Junior Chief: the small bird the player walks, paddles and fishes with ----------
// Six feather colours (body, belly), chosen by S.look.col; the hat is S.look.hat (a WEAR hat) or the small guard's cap.
const CHIEF_COLS = [['#e8843a', '#fff3dc'], ['#58a6ff', '#eef6ff'], ['#57c785', '#f4fff4'], ['#ff8ab0', '#fff0f5'], ['#a98be8', '#f6f0ff'], ['#f2c94c', '#fffbe6']];
// Drawn with the feet at (x, y). o: { dir: 1 | -1, pose: 'stand' | 'walk' | 'sit' | 'cast' | 'reel' | 'cheer', lean: -1..1 (the rod's lean while reeling) }.
// Returns [x, y] of the wing tip that holds a rod or a paddle, in the caller's coordinates.
function chief(c, x, y, s, t, o = {}) {
  const [col, bel] = CHIEF_COLS[S.look.col] || CHIEF_COLS[0], dir = o.dir === -1 ? -1 : 1, pose = o.pose || 'stand', calmly = still();
  const step = pose === 'walk' && !calmly ? Math.sin(t * 12) : 0, bob = calmly ? 0 : pose === 'walk' ? Math.abs(step) * -3 : Math.sin(t * 2.2) * 1;
  const hop = pose === 'cheer' && !calmly ? -Math.abs(Math.sin(t * 7)) * 8 : 0;
  // the wing that holds the rod: down at rest, back for a cast, forward and up while reeling, both up for a cheer
  const wing = pose === 'cast' ? -2.3 : pose === 'reel' ? -.9 + (o.lean || 0) * .25 : pose === 'cheer' ? -2.6 : pose === 'sit' ? -.5 : .5;
  c.save(); c.translate(x, y + (bob + hop) * s); c.scale(s * dir, s);
  if (pose !== 'sit') { line(c, [-5, -6, -5 + step * 5, 0], '#c9741f', 2.2); line(c, [5, -6, 5 - step * 5, 0], '#c9741f', 2.2); }
  poly(c, [-14, -18, -30, -12, -27, -22], col);                                   // tail
  ell(c, 0, -22, 18, 19, col); ell(c, 3, -17, 12, 12, bel);                        // body and belly
  c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(0, -22, 18, 19, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();   // a rim of light, so the bird shows against dark water
  poly(c, [15, -30, 26, -27, 15, -23], '#ffb02e');                                 // beak
  circ(c, 8, -31, 4.2, '#fff'); circ(c, 9.2, -31, 2.2, '#1a1210'); circ(c, 9.9, -31.8, .8, '#fff');
  if (t % 4.1 < .12) { c.fillStyle = col; c.fillRect(3, -36, 10, 9); }             // a blink
  c.globalAlpha = .5; circ(c, 13, -24, 3, '#ff9ecb'); c.globalAlpha = 1;
  if (S.look.hat && WEAR[S.look.hat]) wearOn(c, S.look.hat, 2, -39, 9, -.08);
  else { ell(c, 3, -39, 13, 3.6, '#2b3f8f'); rr(c, -7, -47, 18, 9, 3.5); c.fillStyle = '#3a52ad'; c.fill(); starPath(c, 2, -42.5, 2.8, 1.2, 5); c.fillStyle = '#ffd24a'; c.fill(); }
  c.save(); c.translate(-2, -24); c.rotate(wing); ell(c, 0, 9, 6.5, 12, '#00000022'); ell(c, 0, 9, 6, 11.5, col); c.restore();
  if (pose === 'cheer') { c.save(); c.translate(6, -24); c.rotate(-wing * .9); ell(c, 0, 9, 6, 11.5, col); c.restore(); }
  c.restore();
  const hx = -2 - Math.sin(wing) * 20, hy = -24 + Math.cos(wing) * 20;
  return [x + hx * s * dir, y + (hy + bob + hop) * s];
}
