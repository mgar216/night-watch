// ---------- Nights 9 to 30: new magpie tricks, the gadgets that answer them, and what the owl says about them ----------
// Called by the other files:
//   arcBrief(n)            the briefing of Night n when it brings something new: { text, pics } (text is ready to show,
//                          pics are icon names), or null for the usual briefing (src/50-ui.js)
//   arcTricks(n, list)     raidPlan: turns some of tonight's raiders into tricksters (entry.kind); nothing before Night 9
//   arcRaider(entry)       makeRaid: a raider as the raid moves it
//   arcIgnores(m, what)    stepRaid: a trickster that 'cam', 'lamp' or 'toy' (silly gadgets) cannot touch
//   arcStep(R, m, x, y)    stepRaid: a trickster meets the gadget that answers it; true when it was sent home
//   arcSplit(R, m, x, y)   stepRaid: a camera caught the twins in the coat: one flies home, the other walks on
//   arcMag(c, x, y, s, t, o)  the raid draws a trickster as magpie() draws a magpie (o.m is the raider)
//   ARC_PUFF[kind]         the raid draws what a new gadget throws out when it works
//   arcNew()               the gadgets of the palette's third page that are unlocked tonight

// The new gadgets: `arc` is the Night that unlocks one. A drum only thumps through wood and earth: the trunk and the ground.
Object.assign(ITEMS, {
  fan: { cost: 25, r: 150, cd: 3, arc: 9 }, honey: { cost: 20, r: 48, arc: 13 },
  seesaw: { cost: 30, r: 60, arc: 17 }, drum: { cost: 35, r: 200, cd: 3, arc: 21, at: [12, 13, 14, 15, 16] },
});
const ARC_NEW = ['fan', 'honey', 'seesaw', 'drum'], arcNew = () => ARC_NEW.filter(k => S.night >= ITEMS[k].arc);
const ARC_GADGET = { balloon: 'fan', stilts: 'honey', twins: 'seesaw', dig: 'drum' };
// What a trickster cannot be touched by: a balloon floats over everything, a digger is under the ground,
// stilts step over lanterns and silly gadgets (cameras still see them), the twins in the coat are touched by all.
const ARC_IGNORE = { balloon: 'cam lamp toy', dig: 'cam lamp toy', stilts: 'lamp toy' };
const arcIgnores = (m, what) => !!m.kind && (ARC_IGNORE[m.kind] || '').includes(what);
// The digger stays under the ground along the ladder route until the top of the ladder.
const ARC_UP = ROUTES.lad[0][0] - ROUTES.lad[1][0], ARC_POP = ARC_UP + ROUTES.lad[1][1] - ROUTES.lad[2][1];

// Tricksters by Night (b balloon, s stilts, t twins, d digger): one or two at first, each new trick on its own;
// from Night 25 three of mixed kinds, in a six-Night round.
const ARC_PLAN = ['b', 'b', 'bb', 'bb', 's', 's', 'sb', 'ss', 't', 't', 'ts', 'tb', 'd', 'd', 'dt', 'db'], ARC_MIX = ['bsd', 'tdb', 'std', 'dbt', 'bts', 'sdb'];
const ARC_KIND = { b: 'balloon', s: 'stilts', t: 'twins', d: 'dig' };
const arcKinds = n => n < 9 ? [] : [...(n < 25 ? ARC_PLAN[n - 9] : ARC_MIX[(n - 25) % 6])].map(c => ARC_KIND[c]);
// A trickster takes the place of a raider: first the second one of a pair (its partner keeps the camera busy), then
// the first ones. The digger takes the ladder; stilts and the coat keep to the branches, only a balloon comes over the roof.
function arcTricks(n, list) {
  const br = list.filter(p => p.route !== 'lad'), slots = br.filter((p, i) => i % 2).concat(br.filter((p, i) => !(i % 2)), list.filter(p => p.route === 'lad'));
  for (const k of arcKinds(n)) {
    let p = slots.find(q => !q.kind && (k === 'dig' ? q.route === 'lad' : q.route !== 'lad' && (k === 'balloon' || q.route !== 'sky')));
    // no branch left for the stilts or the coat: a balloon that took a branch moves over the roof and gives its branch up
    const b = !p && k !== 'dig' && slots.find(q => q.kind === 'balloon' && q.route !== 'sky'), s = b && slots.find(q => !q.kind && q.route === 'sky');
    if (s) { s.kind = 'balloon'; b.kind = ''; p = b; }
    if (p) p.kind = k;
  }
}
// `n` counts the magpies inside (two in the coat); `trick` remembers the trick for the owl's word, `fixed` that its gadget met it.
function arcRaider(p) {
  return { route: p.route, at: p.at, kind: p.kind || '', trick: p.kind || '', n: p.kind === 'twins' ? 2 : 1, d: 0, state: 'wait', bonked: new Set(), met: new Set(), fx: null, combo: 0, last: -9, carry: false, dizzy: 0 };
}
function arcStep(R, m, x, y) {
  if (m.kind === 'dig' && m.d >= ARC_POP) { m.kind = ''; R.puffs.push({ k: 'dirt', x, y, t: 1.2 }); sfx.pop(); return false; }   // up at the top of the ladder
  const g = R.arc.find(q => q.t === ARC_GADGET[m.kind] && q.cd <= 0 && Math.hypot(x - q.x, y - q.y) < q.r);
  if (!g) return false;
  g.cd = g.cd0;
  R.puffs.push({ k: g.t, x: g.x, y: g.y - 20, tx: x, ty: y, t: 1.2 });
  if (m.carry) { m.carry = false; m.state = 'sulk'; m.home = 1; R.zipX = x; R.zipY = y - 60; sfx.sparkle(); }   // a jar it carried pops free: Zip takes it home
  if (m.kind === 'balloon') { m.state = 'flee'; m.home = 1; sfx.puff(); return true; }   // the fan blows it home
  if (m.kind === 'twins') {   // one on each end of the seesaw: both fly off laughing
    Object.assign(m, { kind: '', n: 1, state: 'flee', happy: true, home: 1, fx: null, dizzy: 0 });
    R.mags.push(Object.assign(arcRaider({ route: m.route, at: m.at + .5 }), { d: Math.max(1, m.d - 30), state: 'flee', happy: true, home: 1 }));
    R.laughed += 2; R.fun.push({ t: R.t, w: 2 }); sfx.boing(); sfx.giggle();
    return true;
  }
  // honey: the stilts stick and the magpie climbs down; drum: the digger is shaken out. Both walk on dizzy, as plain magpies.
  m.kind = ''; m.fixed = 1; m.dizzy = 2.2;
  if (g.t === 'drum') { R.puffs.push({ k: 'dirt', x, y, t: 1.2 }); sfx.slam(); } else sfx.slip();
  buzz(30);
  return m.state === 'sulk';   // it carried a jar: without it, it sulks home
}
function arcSplit(R, m, x, y) {
  m.kind = ''; m.n = 1;
  R.mags.push(Object.assign(arcRaider({ route: m.route, at: m.at + .5 }), { d: m.d, state: 'flee', home: 1 }));
  R.puffs.push({ k: 'coat', x, y, t: 1.2 });
}

// ----- Drawing. Every trick reads by its shape: a balloon above, long stilts below, a tall coat with two heads, a moving mound -----
const ARC_K = '#1a1a22';
// A small magpie head for the coat: o.face and o.pose as in magpie(); `hat` puts a hat on it.
function arcHead(c, hx, hy, r, o, hat) {
  circ(c, hx, hy, r, ARC_K); poly(c, [hx + r * .8, hy - r * .3, hx + r * 2.1, hy + r * .07, hx + r * .8, hy + r * .43], '#6a6a78');
  const ex = hx + r * .35, ey = hy - r * .2;
  if (o.pose === 'dizzy') line(c, [ex - 3, ey - 3, ex + 3, ey + 3, ex, ey, ex + 3, ey - 3, ex - 3, ey + 3], '#fff', 1.8);
  else if (o.face === 'joy') line(c, [ex - 4, ey + 1.5, ex, ey - 2.5, ex + 4, ey + 1.5], '#fff', 2.2);
  else { const big = o.face === 'shock' || o.face === 'worry'; circ(c, ex, ey, big ? 6 : 4.4, '#fff'); circ(c, ex + 1, ey, big ? 1.8 : 2.3, '#111'); if (o.face === 'sly') poly(c, [ex - 6, ey - 6, ex + 6, ey - 3, ex + 6, ey - 7], ARC_K); }
  if (hat) { ell(c, hx - 1, hy - r + 2, r * 1.4, r * .32, '#3a2a4a'); rr(c, hx - r * .8, hy - r * 2, r * 1.5, r * 1.15, 3); c.fillStyle = '#4a3660'; c.fill(); rr(c, hx - r * .8, hy - r * 1.15, r * 1.5, r * .28, 1); c.fillStyle = '#ffd24a'; c.fill(); }
}
function arcMag(c, x, y, s, t, o) {
  const k = o.m.kind, f = o.dir === -1 ? -1 : 1, calm = still(), w = !calm && (o.pose === 'sneak' || o.pose === 'walk' || o.pose === 'flee') ? Math.sin(t * 7) : 0;
  if (k === 'balloon') {   // it floats a little above the way, the balloon's string in its beak
    const bx = x + (30 * f + (calm ? 0 : Math.sin(t * 1.7) * 7)) * s, by = y - 190 * s;
    line(c, [x + 44 * f * s, y - 73 * s, bx, by + 44 * s], '#dfe6f5', 3 * s);
    ell(c, bx, by, 36 * s, 42 * s, '#ff8a7a'); ell(c, bx - 12 * s, by - 16 * s, 8 * s, 13 * s, 'rgba(255,255,255,.55)', .5);
    poly(c, [bx - 7 * s, by + 47 * s, bx + 7 * s, by + 47 * s, bx, by + 40 * s], '#e0553f');
    return magpie(c, x, y - 22 * s, s, t, { dir: f, carry: o.carry, face: o.face, pose: 'stand' });
  }
  if (k === 'stilts') {   // a wooden stilt under each foot, with a step for the foot
    const L = 52 * s;
    for (const [a, b] of [[-5, 1], [7, -1]]) {
      const top = x + a * f * s;
      line(c, [top, y - L - 10 * s, top - b * w * 12 * f * s, y], '#c8a070', 5 * s);
      line(c, [top - 7 * s, y - L + 3 * s, top + 7 * s, y - L + 3 * s], '#8a6a3a', 4 * s);
    }
    return magpie(c, x, y - L, s, t, o);
  }
  c.save(); c.translate(x, y);
  if (k === 'twins') {   // four feet under one long coat, a tail at the back, a head in a hat on top and one more peeking out in front
    c.scale(s * f, s);
    for (const [a, b] of [[-17, 1], [-7, -1], [7, 1], [17, -1]]) line(c, [a, -18, a + b * w * 6, 0], '#5a5a66', 2.4);
    poly(c, [-28, -24, -64, -10, -60, -2, -26, -14], ARC_K); line(c, [-32, -18, -58, -8], '#3f6fe0', 2.5);
    poly(c, [-22, -112, 22, -112, 31, -16, -31, -16], '#8a6236'); c.lineWidth = 2; c.strokeStyle = '#5a3e22'; c.stroke();
    poly(c, [-22, -112, -2, -88, -8, -112], '#6e4c2a'); poly(c, [22, -112, 2, -88, 8, -112], '#6e4c2a');
    rr(c, -28, -62, 56, 8, 2); c.fillStyle = '#5a3e22'; c.fill(); for (const by of [-98, -40, -28]) circ(c, 12, by, 2.6, '#ffd24a');
    arcHead(c, 6, -126, 14, o, true); arcHead(c, 25, -78, 11, o);
    if (o.pose === 'sulk') for (const i of [-8, 0, 8]) line(c, [6 + i, -164, 6 + i, -156], '#7fa0ff', 2);
    if (o.pose === 'dizzy') for (let i = 0; i < 3; i++) { const a = (calm ? 0 : t * 5) + i * TAU / 3; starPath(c, 6 + Math.cos(a) * 16, -160 + Math.sin(a) * 4, 4, 1.8, 5); c.fillStyle = '#ffd24a'; c.fill(); }
    if (o.carry) jar(c, 40, -56, 16, t, 1);
  } else {   // the digger: a mound of earth with a magpie's tail behind it, along the ground and then up inside the trunk
    const up = o.m.d > ARC_UP;
    if (up) c.rotate(-Math.PI / 2);
    c.scale(s * (up ? 1 : f), s);
    poly(c, [-30, -4, -68, -26, -62, -34, -26, -12], ARC_K); line(c, [-34, -9, -60, -27], '#3f6fe0', 2.5);
    c.beginPath(); c.ellipse(0, 0, 42, 28, 0, Math.PI, TAU); c.fillStyle = '#6b4a2e'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#b08a5a'; c.stroke();   // a light rim: it shows on the bark too
    for (const [a, b, r] of [[-20, -12, 6], [2, -20, 7], [20, -10, 5], [-6, -5, 4]]) circ(c, a, b, r, '#8a6040');
    if (!calm) for (let i = 0; i < 3; i++) { const q = (t * 2.5 + i / 3) % 1; circ(c, 40 + q * 22, -8 - Math.sin(q * Math.PI) * 26, 4, '#8a6040'); }   // clods fly ahead
  }
  c.restore();
}
// What a new gadget throws out when it works (k runs from 0 to 1; the raid sets the fading alpha).
const ARC_PUFF = {
  fan: (c, b, k) => { for (let i = -1; i <= 1; i++) { c.beginPath(); for (let j = 0; j <= 10; j++) { const q = j / 10 * Math.min(1, k * 2.5), px = lerp(b.x, b.tx, q), py = lerp(b.y, b.ty - 50, q) + i * 18 + Math.sin(j * 1.3 + (still() ? 0 : k * 9)) * 7; c.lineTo(px, py); } c.lineWidth = 5; c.strokeStyle = '#dff0ff'; c.stroke(); } },
  honey: (c, b) => { ell(c, b.tx, b.ty + 4, 44, 11, '#f2b93b'); line(c, [b.tx - 10, b.ty, b.tx - 20, b.ty - 62], '#c8a070', 6); line(c, [b.tx + 10, b.ty, b.tx + 22, b.ty - 58], '#c8a070', 6); },   // the stilts stay stuck
  coat: (c, b, k) => { c.save(); c.translate(b.x, b.y); c.rotate(-.25 + k * .2); poly(c, [-48, -14, 44, -18, 50, 2, -44, 4], '#8a6236'); c.restore(); },   // the coat drops
  seesaw: (c, b, k) => { for (let i = 0; i < 5; i++) { starPath(c, b.x + (i - 2) * 28, b.y - 30 - k * (60 + i % 2 * 40), 11, 4.5, 5); c.fillStyle = '#ffd86b'; c.fill(); } },
  drum: (c, b, k) => { for (const r of [1, .6]) { c.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, q = (40 + k * 160) * r * (i % 2 ? .9 : 1.06); c.lineTo(b.x + Math.cos(a) * q, b.y + Math.sin(a) * q); } c.lineWidth = 5; c.strokeStyle = '#ffd6a0'; c.stroke(); } },
  dirt: (c, b, k) => { for (let i = 0; i < 8; i++) { const a = -Math.PI * (i + .5) / 8; circ(c, b.x + Math.cos(a) * k * 70, b.y + Math.sin(a) * k * 70 + k * k * 40, 6, '#8a6040'); } },
};
// Icons: the four gadgets, and each trick as a small picture for the briefing (ic('arcK:balloon')).
ICON.fan = c => {
  line(c, [0, .1, 0, .78], '#aeb9d0', .16); ell(c, 0, .82, .5, .13, '#aeb9d0'); circ(c, 0, -.22, .72, '#22306e');
  for (let i = 0; i < 3; i++) { c.save(); c.translate(0, -.22); c.rotate(i * TAU / 3 + .3); ell(c, 0, -.34, .2, .32, '#7fd0ff'); c.restore(); }
  circ(c, 0, -.22, .13, '#ffd24a'); c.lineWidth = .08; c.strokeStyle = '#dfe6f5'; c.beginPath(); c.arc(0, -.22, .72, 0, TAU); c.stroke();
};
ICON.honey = c => {
  ell(c, 0, .6, .92, .3, '#f2b93b'); ell(c, -.35, .52, .3, .08, '#ffe08a');
  rr(c, -.44, -.62, .88, .95, .3); c.fillStyle = '#c8813a'; c.fill(); ell(c, 0, -.62, .5, .14, '#8a5a2a');
  rr(c, -.3, -.25, .6, .3, .08); c.fillStyle = '#fff6da'; c.fill(); ell(c, .32, -.38, .1, .24, '#f2b93b');
};
ICON.seesaw = c => {
  poly(c, [-.34, .82, .34, .82, 0, .22], '#c8813a');
  c.save(); c.translate(0, .16); c.rotate(-.32); rr(c, -.95, -.09, 1.9, .18, .06); c.fillStyle = '#e8c984'; c.fill();
  line(c, [-.72, -.09, -.72, -.38], '#8a6a3a', .09); line(c, [.72, -.09, .72, -.38], '#8a6a3a', .09); c.restore();
  starPath(c, .62, -.72, .24, .1, 5); c.fillStyle = '#ffd24a'; c.fill();
};
ICON.drum = c => {
  ell(c, 0, .62, .64, .2, '#a8352a'); rr(c, -.64, -.22, 1.28, .84, .08); c.fillStyle = '#e0553f'; c.fill();
  line(c, [-.6, -.15, -.3, .55, 0, -.15, .3, .55, .6, -.15], '#ffd24a', .08); ell(c, 0, -.22, .64, .2, '#fff6da');
  line(c, [-.82, -.95, -.18, -.36], '#c8813a', .11); line(c, [.82, -.95, .18, -.36], '#c8813a', .11); circ(c, -.82, -.95, .11, '#fff6da'); circ(c, .82, -.95, .11, '#fff6da');
};
const ARC_ICON = { balloon: [-.25, .95, .0085], stilts: [-.05, .95, .013], twins: [.08, .97, .0122], dig: [.08, .55, .0142] };
ICON.arcK = (c, k) => { const [x, y, s] = ARC_ICON[k]; arcMag(c, x, y, s, 0, { m: { kind: k, d: 0 }, dir: 1, face: 'sly', pose: 'stand' }); };

// The briefing: a new trick is introduced on its first Night; on the other Nights from 10 the owl names tonight's tricks.
const ARC_INTRO = { 9: 'balloon', 13: 'stilts', 17: 'twins', 21: 'dig' };
function arcBrief(n) {
  if (n < 9) return null;
  if (n === 25) return { text: t('arc_b25'), pics: Object.keys(ARC_GADGET).map(k => 'arcK:' + k) };
  if (ARC_INTRO[n]) return { text: t('arc_b' + n), pics: ['arcK:' + ARC_INTRO[n], ARC_GADGET[ARC_INTRO[n]]] };
  const ks = [...new Set(arcKinds(n))];
  return ks.length > 1 ? { text: t('arc_kmix'), pics: ks.map(k => 'arcK:' + k) } : { text: t('arc_k' + ks[0]), pics: ['arcK:' + ks[0], ARC_GADGET[ks[0]]] };
}
