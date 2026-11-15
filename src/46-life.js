// ---------- Life at the treehouse: it keeps growing with the stars, a visitor comes by each day, and a birthday is kept ----------
// Called by the other files:
//   growLevel()            how many of the three additions the stars have earned so far (0 to 3)
//   growNews(then)         the owl tells of an addition once (S.grow is how many were told), then calls then()
//   growTree(c, t, k)      from drawTree, inside the tree's transform (tree units): the additions, and on the player's
//                          birthday (isBirthday() in src/50-ui.js) the party decorations; k is the tree's scale on screen
//   growTap(lx, ly, T)     from menuTap, tree units: true when an addition answered the tap
//   visitTree(c, T, t)     from the menu scenes, after the tree and before the owl: today's visitor on the deck
//   visitTap(lx, ly, T)    from menuTap: true when the visitor answered the tap

// ----- The treehouse grows with the stars (counted, never spent): a swing, a flower garden, a hammock -----
const LIFE_AT = [60, 120, 200];
// The middle of each addition (tree units): where a sparkle shows it for the first time, and where a tap finds the swing and the hammock.
const LIFE_XY = [[785, 405], [500, 262], [155, 395]];
const lifeT = [-9, -9, -9];   // when each addition was last tapped: its joke plays for about three seconds
let lifeWho = 0;             // the forest friend in the next joke
function growLevel() { return LIFE_AT.filter(n => S.stars >= n).length; }
// At the Night menu the owl tells of each new addition once; the veil stays almost clear, and a sparkle shows the place.
function growNews(then) {
  if (growLevel() <= S.grow) return then();
  const i = S.grow++; save();
  owlSay(t('grow_' + i), { title: t('grow_t'), mood: 'cheer', acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: () => {
    const T = treeArea();
    sfx.sparkle(); burst(T.ox + LIFE_XY[i][0] * T.k, T.oy + LIFE_XY[i][1] * T.k, 26, { speed: 200, size: 9, kind: 'star', colors: ['#ffd86b', '#fff6da', '#ff9ecb'] });
    later(() => growNews(then), 1400);
  } }] }).classList.add('clear');
}
// Drawn by drawTree under the placed items, which stay in full view. m scales the small things up on a phone, each as far
// as its neighbours allow (the window jars, the item spots, the slide, the observatory).
function growTree(c, t, k) {
  const g = S.grow | 0, calm = still(), m = Math.max(1, .5 / k);
  if (g >= 1) lifeSwing(c, t, calm, Math.min(m, 1.5));
  if (g >= 2) lifeGarden(c, t, calm, Math.min(m, 1.4));
  if (g >= 3) lifeHammock(c, t, calm, Math.min(m, 1.3));
  if (isBirthday()) lifeParty(c, t, calm, Math.min(m, 1.25));
}
// The swing hangs from the underside of the upper right branch and sways a little; a tap: a friend swings high.
function lifeSwing(c, t, calm, m) {
  const d = V.t - lifeT[0], on = d < 2.8, a = calm ? 0 : on ? .75 * Math.sin(d * 4.4) * Math.min(1, d * 2, (2.8 - d) * 1.5) : .06 * Math.sin(t * 1.3);
  c.save(); c.translate(785, 350); c.rotate(a); c.scale(m, m);
  line(c, [-13, 4, -15, 96], '#e8d6a8', 2.5); line(c, [13, -2, 15, 96], '#e8d6a8', 2.5);
  if (on) critter(c, 0, 108, .44, t, lifeWho);   // seated: the plank in front hides its feet
  rr(c, -19, 94, 38, 8, 3); c.fillStyle = '#c98a45'; c.fill(); line(c, [-16, 96, 16, 96], '#e8b070', 2);
  c.restore();
}
const lifeFlower = (c, x, y, r, col) => { for (let i = 0; i < 5; i++) circ(c, x + Math.cos(i * 1.2566) * r, y + Math.sin(i * 1.2566) * r, r * .8, col); circ(c, x, y, r * .55, '#fff6da'); };
const LIFE_FL = ['#ff9ecb', '#ffd24a', '#c9b8ff', '#ff8a7a'];
// Boxes of flowers under the windows (kept below the jars) and a flowering vine along the eaves; a butterfly visits them.
// A tap: the flowers open wide and the butterfly rises over the roof and comes back.
function lifeGarden(c, t, calm, m) {
  const d = V.t - lifeT[1], on = d < 2.8, o = !on ? 0 : calm ? 1 : Math.min(1, d * 3, (2.8 - d) * 2);
  for (const x0 of [378, 502]) {
    c.beginPath(); c.moveTo(x0, 216); c.quadraticCurveTo(x0 + 60, 232, x0 + 120, 216); c.strokeStyle = '#3d9a52'; c.lineWidth = 2.5; c.stroke();
    for (let i = 1; i < 6; i++) lifeFlower(c, x0 + i * 20, 216 + 32 * (i / 6) * (1 - i / 6), 2.6 + o, LIFE_FL[(i + x0) % 4]);
  }
  for (const bx of [419, 529]) {
    for (let i = 0; i < 4; i++) { const x = bx + 8 + i * 12; line(c, [x, 288, x, 282 - o * 2], '#3d9a52', 1.5); lifeFlower(c, x, 281 - o * 2, 2 + o * 2.2, LIFE_FL[(i + bx) % 4]); }
    rr(c, bx + 1, 285, 50, 13, 3); c.fillStyle = '#9a5a2e'; c.fill(); line(c, [bx + 3, 287, bx + 49, 287], '#c07a44', 2);
  }
  const x = calm ? (on ? 440 : 426) : 440 + (on ? 30 * Math.sin(d * 3) : 24 * Math.sin(t * .7));
  const y = calm ? (on ? 224 : 292) : 292 - (on ? 150 * Math.sin(Math.PI * d / 2.8) : 0) + 3 * Math.sin(t * 2.3);
  const f = calm ? 1 : .35 + .65 * Math.abs(Math.sin(t * 11));   // wings beat: drawn narrower and wider
  c.save(); c.translate(x, y); c.scale(m * f, m);
  ell(c, -5, -3, 5, 4, '#ffd24a', -.4); ell(c, 5, -3, 5, 4, '#ffd24a', .4); ell(c, -4, 3, 3.5, 3, '#ff9a3a', .4); ell(c, 4, 3, 3.5, 3, '#ff9a3a', -.4);
  c.restore(); line(c, [x, y - 4 * m, x, y + 4 * m], '#4a2f1a', 1.6 * m);
}
// The hammock hangs from the underside of the upper left branch, striped, swaying gently; a tap: a friend snoozes in it.
function lifeHammock(c, t, calm, m) {
  const d = V.t - lifeT[2], on = d < 3, sw = calm ? 0 : (on ? 5 : 3) * Math.sin(t * 1.4);
  c.save(); c.translate(155, 364); c.scale(m, m);
  line(c, [-47, -12, -37, 24], '#e8d6a8', 2.5); line(c, [47, 12, 39, 28], '#e8d6a8', 2.5);
  c.beginPath(); c.moveTo(-37, 24); c.quadraticCurveTo(sw, 80, 39, 28); c.quadraticCurveTo(sw, 44, -37, 24); c.fillStyle = '#e8503a'; c.fill();
  c.save(); c.clip(); for (let x = -32; x < 40; x += 12) line(c, [x + sw * .3, 20, x + sw * .3, 64], '#ffd24a', 4); c.restore();
  if (on) {
    const col = CRITTERS[lifeWho][0];
    c.save(); c.translate(6 + sw * .5, 31); c.rotate(-1.3); critter(c, 0, 0, .4, 0, lifeWho);
    for (const sx of [-3.2, 3.2]) { circ(c, sx, -24.8, 1.8, col); line(c, [sx - 1.4, -24.6, sx + 1.4, -24.6], '#3a2418', .8); }   // eyes shut
    c.restore();
    rr(c, -8 + sw * .5, 22, 40, 14, 6); c.fillStyle = '#58a6ff'; c.fill(); line(c, [-4 + sw * .5, 29, 28 + sw * .5, 29], '#fff', 2);   // tucked in, head free
    c.font = '900 20px ui-rounded, "Segoe UI", Roboto, sans-serif'; c.fillStyle = '#dff0ff';
    for (let i = 0; i < 3; i++) { const u = calm ? i / 3 : (d * .6 + i / 3) % 1; c.globalAlpha = calm ? 1 : 1 - u; c.fillText('z', -26 + u * 14 + i * 3, 14 - u * 40 - (calm ? i * 4 : 0)); }
    c.globalAlpha = 1;
  }
  c.restore();
}
// On the player's birthday: bunting along the deck rails (on the left only up to the two jars on the deck) and three
// balloons tied to the left rail post, floating between the slide's top and the observatory.
function lifeParty(c, t, calm, m) {
  const COL = ['#ff6b8a', '#ffd24a', '#58a6ff'];
  for (const [x0, x1, n] of [[298, 350, 2], [600, 702, 4]]) {
    c.beginPath(); c.moveTo(x0, 299); c.quadraticCurveTo((x0 + x1) / 2, 307, x1, 299); c.strokeStyle = '#fff6da'; c.lineWidth = 1.5; c.stroke();
    for (let i = 0; i < n; i++) { const u = (i + .5) / n, x = lerp(x0, x1, u), y = 299 + 16 * u * (1 - u); poly(c, [x - 7, y, x + 7, y, x, y + 14], COL[i % 3]); circ(c, x, y + 5, 1.6, '#fff'); }
  }
  c.save(); c.translate(298, 296); c.scale(m, m);
  [[-52, -60], [-30, -80], [-8, -56]].forEach(([bx, by], i) => {
    if (!calm) { bx += 3 * Math.sin(t * 1.1 + i * 2); by += 2 * Math.sin(t * 1.6 + i); }
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(bx * .3, by * .5, bx, by + 16); c.strokeStyle = 'rgba(255,246,218,.8)'; c.lineWidth = 1; c.stroke();
    ell(c, bx, by, 11, 14, COL[i]); ell(c, bx - 4, by - 5, 2.5, 4, 'rgba(255,255,255,.55)', .4); poly(c, [bx - 2.5, by + 17, bx + 2.5, by + 17, bx, by + 13], COL[i]);
  });
  c.restore();
}
// A tap on an addition (the visitor, the friends and the gifts are asked first, see menuTap). The garden answers left of
// the flag's pole only, so that the flag (asked last) keeps the whole of its own tap area.
function growTap(lx, ly, T) {
  const g = S.grow | 0, r = Math.max(50, 26 / T.k), near = (x, y, q = r) => Math.hypot(lx - x, ly - y) < q;
  const i = g >= 1 && near(...LIFE_XY[0]) ? 0 : g >= 2 && lx < 605 && [[445, 290], [555, 290], [420, 222], [580, 222]].some(([x, y]) => near(x, y)) ? 1 : g >= 3 && near(...LIFE_XY[2]) ? 2 : -1;
  if (i < 0) return false;
  lifeT[i] = V.t; lifeWho = (lifeWho + 1) % 4;
  [sfx.whee, sfx.sparkle, sfx.snore][i]();
  return true;
}

// ----- Today's visitor: from Night 2, one forest friend a day stands on the deck in front of the door with a wish -----
// [the wish's picture, the gift that fits it, two funny wrong ones]; each gift is a text key vis_<id>, drawn with lifeIc(id).
const LIFE_WISH = [['lifeRain', 'umb', 'fish', 'banana'], ['lifeSnow', 'hat', 'frog', 'robot'], ['star', 'scope', 'banana', 'pizza'],
  ['moon', 'rocket', 'cake', 'frog'], ['lifeNote', 'drum', 'fish', 'pizza'], ['lifeBowl', 'berry', 'hammer', 'bell'],
  ['lifeWave', 'boat', 'cake', 'hammer'], ['lifeZz', 'pillow', 'drum', 'rocket'], ['party', 'cake', 'hammer', 'pillow']];
const lifeIc = id => ({ umb: 'lifeUmb', hat: 'lifeHat', pillow: 'lifePillow' })[id] || id;
let lifeJoy = -9;   // when the visitor last jumped for joy
// The visitor and the wish of day d ('Y-M-D'), fixed for the day: [forest friend 0..3, wish]. The four friends take turns
// in blocks of four days (each block starts with another friend), so any ten days bring all four. The drawing asks in
// every frame, so the last day's answer is kept (read it, do not change it).
let lifeDayOf = '', lifeDayIs = [0, 0];
const lifeDay = d => {
  if (d !== lifeDayOf) { const n = dayNo(d); lifeDayOf = d; lifeDayIs = [(n + (hash(Math.floor(n / 4) + .5) * 4 | 0)) % 4, hash(n * 2.71 + 9.5) * LIFE_WISH.length | 0]; }
  return lifeDayIs;
};
// Today's visitor ({ kind, wish, open, n }), or null before Night 2. A day without a granted wish has its wish open, so a
// new day brings its visitor lazily, and a missed day loses nothing. The save is never trusted to have the right shape.
function lifeNow() {
  if (!(S.night >= 2)) return null;
  const d = today(), v = S.visit && typeof S.visit === 'object' ? S.visit : {}, [kind, wish] = lifeDay(d);
  return { kind, wish, open: !(v.d === d && v.done), n: Math.max(0, v.n | 0) };
}
// Where it stands (tree units): [x, scale, top of its head]. It is scaled up on a phone only as far as the window jars
// allow; the squirrel stands a little left, so its tail keeps clear of them.
const lifeAt = (v, T) => { const s = clamp(.3 / T.k, .8, 1); return [v.kind ? 500 : 492, s, 330 - (v.kind === 1 ? 112 : 92) * s]; };
const lifeBub = (T, top) => { const r = clamp(15 / T.k, 34, 40); return [r, top - r - 14]; };   // the thought bubble between the roof's two upper item spots
function visitTree(c, T, t) {
  const v = lifeNow();
  if (!v) return;
  const [x, s, top] = lifeAt(v, T), d = V.t - lifeJoy, calm = still(), y = 330 - (calm || d > 1.2 ? 0 : Math.abs(Math.sin(d * 8)) * 24 * (1 - d / 1.2));
  c.save(); c.translate(T.ox, T.oy); c.scale(T.k, T.k);
  critter(c, x, y, s, t, v.kind);
  if (!v.open) drawIcon(c, lifeIc(LIFE_WISH[v.wish][1]), x + (v.kind ? 26 : -26) * s, y - 24 * s, 26 * s);   // happy, with its gift, for the rest of the day
  else {
    const [r, by] = lifeBub(T, top), q = r / 36, b = by + (calm ? 0 : 3 * Math.sin(t * 1.6));
    c.lineWidth = 2.5; c.strokeStyle = 'rgba(42,28,5,.35)';
    for (const [px, py, pr] of [[510, top - 4, 3.5], [516, top - 12, 5.5], [500, b, r]]) { c.beginPath(); c.arc(px, py, pr * (pr === r ? 1 : q), 0, TAU); c.fillStyle = '#fff6da'; c.fill(); c.stroke(); }
    drawIcon(c, LIFE_WISH[v.wish][0], 500, b, r * 1.25);
  }
  c.restore();
}
function visitTap(lx, ly, T) {
  const v = lifeNow();
  if (!v) return false;
  // the visitor answers in a wide circle, its bubble in its own (at least 48 px across): on a small screen a wider one took the taps of its neighbours
  const [x, s, top] = lifeAt(v, T), [rb, by] = lifeBub(T, top), r = Math.max(60, 28 / T.k);
  if (Math.hypot(lx - x, ly - (330 - 40 * s)) > r && !(v.open && Math.hypot(lx - 500, ly - by) < Math.max(rb, 24 / T.k))) return false;
  if (v.open) lifeAsk(v); else { lifeJoy = V.t; sfx.chirp(); }
  return true;
}
// The owl says who came and what it wishes for, and offers three gifts. A wrong one shakes and the wish stays open; the
// right one grants it: five moonbeams, once a day.
function lifeAsk(v) {
  const [pic, right, ...rest] = LIFE_WISH[v.wish];
  const dlg = owlSay(t('vis_c' + v.kind) + ' ' + t('vis_w' + v.wish), { acts: [{ label: t('vis_later') }],
    html: `<div class="pics"><span class="pill" style="background:#fff6da">${ic(pic, 34)}</span></div><div class="cards" style="margin-top:.5em">${shuffle([right, ...rest]).map(id =>
      `<button class="card" data-k="${id}">${ic(lifeIc(id), 40)}<span>${esc(t('vis_' + id))}</span></button>`).join('')}</div>` });
  dlg.querySelectorAll('.card').forEach(b => b.onclick = () => {
    const now = lifeNow();
    if (!now || !now.open) return;   // granted already: a second tap pays nothing
    if (now.kind !== v.kind || now.wish !== v.wish) return lifeAsk(now);   // the day turned while the dialog was open: today's visitor asks its own wish
    if (b.dataset.k !== right) {
      const s = t('vis_no');
      sfx.boing(); nudge(b); $('#owlText', dlg).textContent = s; say(s); speak(s); if (portrait) portrait.t0 = V.t;
      return;
    }
    S.visit = { d: today(), done: 1, n: now.n + 1 }; S.beams += 5; save(); refreshHud();
    const T = treeArea(), [x, s] = lifeAt(now, T);
    lifeJoy = V.t; sfx.win(); burst(T.ox + x * T.k, T.oy + (330 - 40 * s) * T.k, 30, { speed: 220, size: 9, kind: 'star', colors: ['#ffd86b', '#fff6da', '#ff9ecb', '#7fd0ff'] });
    owlSay(t('vis_yes'), { mood: 'cheer', quiet: true, html: `<div class="pics">${ic(lifeIc(right), 44)}<span class="pill pop">${ic('beam', 22)}<b>+5</b></span></div>` }).classList.add('clear');
  });
}
// Pictures of the wishes, and of the gifts that had no icon yet.
ICON.lifeRain = c => { for (const [x, y, r] of [[-.4, -.1, .36], [.05, -.32, .46], [.45, -.08, .34]]) circ(c, x, y, r, '#8a9cc4'); rr(c, -.76, -.12, 1.55, .38, .19); c.fillStyle = '#8a9cc4'; c.fill(); for (const x of [-.45, 0, .45]) line(c, [x, .45, x - .12, .8], '#2f6fd0', .13); };
ICON.lifeSnow = c => { for (let i = 0; i < 6; i++) { const x = Math.cos(i * TAU / 6), y = Math.sin(i * TAU / 6); line(c, [0, 0, x * .9, y * .9], '#2f6fd0', .12); line(c, [x * .4 - y * .2, y * .4 + x * .2, x * .62, y * .62, x * .4 + y * .2, y * .4 - x * .2], '#2f6fd0', .1); } };
ICON.lifeNote = c => { ell(c, -.28, .55, .34, .25, '#6b3fd1', -.35); line(c, [.04, .5, .04, -.85], '#6b3fd1', .13); c.beginPath(); c.moveTo(.04, -.85); c.quadraticCurveTo(.6, -.6, .5, -.05); c.stroke(); };
ICON.lifeBowl = c => { line(c, [.3, -.2, .8, -.9], '#8a94a8', .12); c.beginPath(); c.arc(0, -.05, .85, 0, Math.PI); c.closePath(); c.fillStyle = '#c8813a'; c.fill(); rr(c, -.92, -.18, 1.84, .2, .1); c.fillStyle = '#e8a860'; c.fill(); rr(c, -.3, .74, .6, .14, .06); c.fillStyle = '#a8663a'; c.fill(); };
ICON.lifeWave = c => { for (const y of [-.45, .05, .55]) line(c, [-.9, y, -.6, y - .2, -.3, y, 0, y - .2, .3, y, .6, y - .2, .9, y], '#2f6fd0', .13); };
ICON.lifeZz = c => { line(c, [-.8, -.6, -.05, -.6, -.8, .3, -.05, .3], '#2b3f8f', .17); line(c, [.2, -.05, .75, -.05, .2, .65, .75, .65], '#2b3f8f', .13); };
ICON.lifeUmb = c => {
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, .05); c.arc(0, .05, .92, Math.PI * (1 + i / 4), Math.PI * (1.25 + i / 4)); c.closePath(); c.fillStyle = i % 2 ? '#fff3c4' : '#e8503a'; c.fill(); }
  line(c, [0, -.87, 0, .78], '#7a4e22', .1); c.beginPath(); c.arc(-.16, .78, .16, 0, Math.PI); c.stroke();
};
ICON.lifePillow = c => {
  rr(c, -.9, -.62, 1.8, 1.24, .5); c.fillStyle = '#eef3ff'; c.fill(); c.lineWidth = .08; c.strokeStyle = '#8fa4d8'; c.stroke();
  for (const [x, y] of [[-.83, -.56], [.83, -.56], [-.83, .56], [.83, .56]]) circ(c, x, y, .14, '#8fa4d8');   // the corners' tufts
  line(c, [-.5, .3, .5, .3], 'rgba(143,164,216,.7)', .07); starPath(c, 0, -.08, .3, .13, 5); c.fillStyle = '#ffd24a'; c.fill();
};
ICON.lifeHat = c => { c.translate(0, .5); c.scale(.85, .85); WEAR.knit.draw(c); };   // the wardrobe's woolly hat, as big as the box allows
