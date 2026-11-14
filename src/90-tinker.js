// ---------- Tinker Treehouse and raids: design, test, watch, improve ----------
// Who comes tonight. Better station results mean fewer raiders; the plan is fixed per Night, so a test raid is a fair prediction.
function raidPlan(n, st) {
  const routes = n <= 2 ? ['lt', 'rt'] : n <= 4 ? ['lt', 'rt', 'lb', 'rb'] : ['lt', 'rt', 'lb', 'rb', 'sky'];
  const branch = Math.min(Math.ceil(n / 2) + (3 - st.cam), 7), gate = Math.min(3 - st.gate + (n >= 4 ? 1 : 0), 3), list = [];
  let at = 1;
  for (let i = 0; i < branch; i++) {
    list.push({ route: routes[((n >= 6 ? i >> 1 : i) + n) % routes.length], at });   // from Night 6 partners share a route
    at += n >= 4 && i % 2 === 0 ? (n >= 6 ? .9 : .3) : 3.2;   // later Nights: partners arrive together
  }
  for (let i = 0; i < gate; i++) list.push({ route: 'lad', at: 2 + i * 3.5 });
  return list.sort((a, b) => a.at - b.at);
}
const covers = (d, key) => {
  if (d.t === 'bell' && key !== 'lad') return false;
  const p = ROUTES[key];
  for (let s = 100; s <= p.len; s += 25) { const [x, y] = routeAt(p, s); if (Math.hypot(x - d.x, y - d.y) < d.r) return true; }
  return false;
};
function makeRaid(plan, holds) {
  const at = it => ({ t: it.t, x: MOUNTS[it.m][0], y: MOUNTS[it.m][1], r: ITEMS[it.t].r, cd: 0 });
  const R = { t: 0, holds, shield: count('shield'), stolen: 0, reached: {}, covered: {}, beams: [], done: false, zipX: 500, zipY: 150,
    cams: S.items.filter(i => i.t === 'cam' || i.t === 'bell').map(at), lamps: S.items.filter(i => i.t === 'lamp').map(at),
    mags: plan.map(p => ({ route: p.route, at: p.at, d: 0, state: 'wait', bonked: new Set(), carry: false, dizzy: 0 })) };
  for (const k in ROUTES) R.covered[k] = R.cams.some(d => covers(d, k));
  return R;
}
function stepRaid(R, dt) {
  R.t += dt;
  for (const d of R.cams) d.cd -= dt;
  for (const b of R.beams) b.t -= dt;
  R.beams = R.beams.filter(b => b.t > 0);
  let alive = 0;
  for (const m of R.mags) {
    if (m.state === 'gone') continue;
    alive++;
    if (m.state === 'wait') { if (R.t >= m.at) m.state = 'go'; continue; }
    const p = ROUTES[m.route], [x, y] = routeAt(p, m.d), active = m.state === 'go' || m.state === 'back';
    if (m.dizzy > 0) m.dizzy -= dt;
    else m.d += dt * 170 * { go: 1, back: -1.15, flee: -3, sulk: -1.3 }[m.state];
    if (active || m.dizzy > 0 && m.state !== 'flee' && m.state !== 'sulk') {
      const cam = R.cams.find(d => d.cd <= 0 && (d.t === 'cam' || m.route === 'lad') && Math.hypot(x - d.x, y - d.y) < d.r);
      if (cam) {
        cam.cd = ITEMS[cam.t].cd; m.state = 'flee'; m.dizzy = 0; m.carry = false;
        R.beams.push({ x1: cam.x, y1: cam.y - 20, x2: x, y2: y - 20, t: .45, bell: cam.t === 'bell' });
        R.zipX = cam.x; R.zipY = cam.y - 60; cam.t === 'bell' ? sfx.ding() : sfx.flash(); sfx.squawk();
        continue;
      }
    }
    if (active && m.dizzy <= 0) {
      const lamp = R.lamps.find(l => !m.bonked.has(l) && Math.hypot(x - l.x, y - l.y) < l.r);
      if (lamp) { m.bonked.add(lamp); m.dizzy = 2.2; sfx.bonk(); }
    }
    if (m.state === 'go' && m.d >= p.len) {
      R.reached[m.route] = (R.reached[m.route] || 0) + 1;
      if (R.holds > 0) { R.holds--; m.state = 'sulk'; sfx.empty(); }
      else if (R.shield > 0) { R.shield--; m.state = 'flee'; sfx.boing(); }
      else if (R.stolen + R.mags.filter(q => q.carry).length < 3) { m.carry = true; m.state = 'back'; sfx.oops(); }
      else m.state = 'sulk';
    }
    if (m.d < 0) { if (m.carry) { R.stolen++; m.carry = false; } m.state = 'gone'; }   // a jar that left the screen is counted once, as stolen
  }
  if (!alive) R.done = true;
}
// Exactly one kind, specific observation after a test raid.
function observe(R) {
  if (!S.items.some(i => !ITEMS[i.t].deco)) return t('o_none');
  const hit = Object.keys(R.reached);
  if (!hit.length) return t('o_great');
  const open = hit.find(r => !R.covered[r]);
  if (open === 'lad' && count('bell')) return t('o_bell');
  return t(open ? 'o_route' : 'o_busy', { r: t('r_' + (open || hit[0])) });
}

const PALETTE = ['cam', 'lamp', 'bell', 'shield', 'banner', 'flowers', 'scope', 'lights'];
scenes.tinker = {
  enter() {
    Object.assign(this, { hand: null, drag: false, px: 0, py: 0, sx: 0, sy: 0, kb: -1 });
    const bar = add(`<div class="hud"><button class="btn round go" id="tDone" aria-label="${esc(t('done'))}">${ic('yes', 28)}</button><span class="sp"></span>
      <button class="btn gold" id="tTest">${ic('pie', 26)}${esc(t('testRaid'))}</button><span class="pill" id="pBeams">${ic('beam', 22)}<b>${S.beams}</b></span></div>`);
    $('#tDone', bar).onclick = () => { sfx.click(); go('hub'); };
    $('#tTest', bar).onclick = () => { sfx.alarm(); go('raid', { test: true }); };
    this.pal = add(`<div class="palette">${PALETTE.map(k => `<button class="pal" data-k="${k}" aria-label="${esc(t('i_' + k))}, ${ITEMS[k].cost}">${ic(k, 34)}<span>${ic('beam', 14)}${ITEMS[k].cost}</span></button>`).join('')}</div>`);
    this.pal.querySelectorAll('.pal').forEach(b => {
      b.onpointerdown = e => { const k = b.dataset.k; this.hand = this.hand === k && !this.drag ? null : k; this.drag = !!this.hand; [this.sx, this.sy] = [this.px, this.py] = [e.clientX, e.clientY]; sfx.click(); this.marks(); };
      // Keyboard: Enter picks the item and hands the keys to the tree (arrows choose a free spot, Enter places it there).
      b.onkeydown = e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const k = b.dataset.k, spots = this.free(k);
        this.hand = this.hand === k ? null : k; this.kb = this.hand && spots.length ? spots[0] : -1;
        this.marks(); b.blur(); e.preventDefault();
      };
    });
    this.marks();
    if (!S.tinkered) { S.tinkered = 1; save(); owlSay(t('tinkerIntro'), { html: picsHtml(['cam', 'lamp', 'bell', 'shield']) }); }
  },
  marks() {
    this.pal.querySelectorAll('.pal').forEach(b => {
      const on = b.dataset.k === this.hand, poor = ITEMS[b.dataset.k].cost > S.beams;
      b.classList.toggle('sel', on); b.classList.toggle('poor', poor);
      b.setAttribute('aria-pressed', on); b.setAttribute('aria-disabled', poor);
    });
    refreshHud();
  },
  // The tree gets whatever the palette leaves free: the space above it, or (low landscape) the space to its left.
  T() { const p = this.pal.getBoundingClientRect(); return p.top > V.h * .5 ? fitTree(0, 60, V.w, p.top - 64) : fitTree(0, 60, p.left, V.h - 64); },
  overPal(x, y) { const p = this.pal.getBoundingClientRect(); return x >= p.left && y >= p.top; },
  free(type) { return MOUNTS.map((m, i) => i).filter(i => (type === 'shield') === (i === VAULT) && !S.items.some(it => it.m === i)); },
  near(x, y, list, reach) {
    const T = this.T(), [lx, ly] = toTree(T, x, y);
    let best = -1, bd = Math.max(reach, 44 / T.k);
    for (const i of list) { const d = Math.hypot(MOUNTS[i][0] - lx, MOUNTS[i][1] - 20 - ly); if (d < bd) { bd = d; best = i; } }
    return best;
  },
  place(m) {
    const type = this.hand, cost = ITEMS[type].cost;
    if (m < 0) return false;
    if (cost > S.beams) { toast(t('poor')); sfx.empty(); this.hand = null; this.marks(); return false; }
    S.beams -= cost; S.items.push({ t: type, m }); save();
    const T = this.T();
    sfx.pop(); burst(T.ox + MOUNTS[m][0] * T.k, T.oy + MOUNTS[m][1] * T.k, 14, { speed: 150 });
    this.hand = null; this.marks();
    return true;
  },
  lift(m) {
    const i = S.items.findIndex(it => it.m === m);
    if (i < 0) return;
    const [it] = S.items.splice(i, 1);
    S.beams += ITEMS[it.t].cost; save(); sfx.click();
    this.hand = it.t; this.marks();
  },
  down(x, y) {
    [this.sx, this.sy] = [this.px, this.py] = [x, y];
    if (this.hand) { if (this.hand === 'shield') this.place(this.free('shield')[0] === undefined ? -1 : VAULT); else this.place(this.near(x, y, this.free(this.hand), 120)); return; }
    const m = this.near(x, y, S.items.map(it => it.m), 70);
    if (m >= 0) { this.lift(m); this.drag = true; }
  },
  move(x, y) { this.px = x; this.py = y; },
  up(x, y, cancelled) {
    if (!this.drag) return;
    this.drag = false;
    if (!this.hand) return;
    if (cancelled) { this.hand = null; this.marks(); return; }   // the browser took the gesture away: the item goes back to the palette
    const moved = Math.hypot(x - this.sx, y - this.sy) > 14;
    if (!this.overPal(x, y) && moved) { if (!this.place(this.hand === 'shield' ? (this.free('shield').length ? VAULT : -1) : this.near(x, y, this.free(this.hand), 120))) { this.hand = null; this.marks(); } }
    else if (moved) { this.hand = null; this.marks(); }
  },
  key(e) {
    const list = this.hand ? this.free(this.hand) : S.items.map(it => it.m), d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (d && list.length) { this.kb = list[(list.indexOf(this.kb) + d + list.length) % list.length]; e.preventDefault(); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.tagName !== 'BUTTON' && list.includes(this.kb)) { this.hand ? this.place(this.kb) : this.lift(this.kb); e.preventDefault(); }
  },
  draw() {
    const t0 = V.t, T = this.T();
    drawSky(ctx, t0); drawTree(ctx, T, t0, { zones: true });
    treeOwl(ctx, T, t0);
    ctx.save(); ctx.translate(T.ox, T.oy); ctx.scale(T.k, T.k);
    if (this.hand) {
      const free = this.free(this.hand), aim = this.drag ? this.near(this.px, this.py, free, 120) : this.kb;
      // free spots keep a visible size on small screens
      for (const i of free) { const [x, y] = MOUNTS[i], on = i === aim, r = Math.max(on ? 16 : 9, (on ? 11 : 7) / T.k) + (still() ? 0 : Math.sin(t0 * 5 + i) * 2); circ(ctx, x, y - 20, r, on ? 'rgba(255,255,255,.9)' : 'rgba(255,216,107,.6)'); ctx.lineWidth = Math.max(3, 1.5 / T.k); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y - 20, r, 0, TAU); ctx.stroke(); }
      if (free.includes(aim)) { drawZone(ctx, this.hand, MOUNTS[aim][0], MOUNTS[aim][1]); ctx.globalAlpha = .7; drawItem(ctx, this.hand, MOUNTS[aim][0], MOUNTS[aim][1], t0, T.k); ctx.globalAlpha = 1; }
    } else if (this.kb >= 0) { const [x, y] = MOUNTS[this.kb]; ctx.lineWidth = Math.max(4, 2 / T.k); ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y - 20, Math.max(34, 16 / T.k), 0, TAU); ctx.stroke(); }
    ctx.restore();
    if (this.hand && this.drag) drawIcon(ctx, this.hand, this.px, this.py - 30, 54);
    fireflies(ctx, t0, 8);
  },
};

// A raid, watchable like a cartoon. o.test: friendly practice against the player's own design.
scenes.raid = {
  enter(o = {}) {
    this.test = !!o.test; this.endT = 0;
    const st = this.test ? { cam: S.st.cam || 2, gate: S.st.gate || 2, forge: S.st.forge || 2 } : S.st;
    this.R = makeRaid(raidPlan(S.night, st), st.forge - 1);
    add(`<div class="hud">${this.test ? `<button class="btn round" id="rBack" aria-label="${esc(t('done'))}">${ic('no', 24)}</button>` : ''}
      <span class="pill">${ic('pie', 24)}${esc(t(this.test ? 'testRaid' : 'raidGo'))}</span><span class="sp"></span></div>`);
    if (this.test) $('#rBack').onclick = () => { sfx.click(); go('tinker'); };   // a practice raid can be left at any time
    if (!this.test) later(() => toast(t('raidGo')), 100);
  },
  update(dt) {
    const R = this.R;
    if (!R.done) return stepRaid(R, dt);
    if (this.endT) return;
    this.endT = V.t;
    later(() => {
      if (!this.test) return finishNight(R.stolen);
      const clean = !Object.keys(R.reached).length && S.items.some(i => !ITEMS[i.t].deco), bonus = clean && S.testStar !== S.night;
      if (bonus) { S.testStar = S.night; S.stars++; S.beams += 10; save(); }
      if (clean) { sfx.fanfare(); burst(V.w / 2, V.h * .4, 50, { colors: ['#ffd86b', '#ff9ecb', '#7fd0ff', '#6fdc95'], speed: 340, kind: 'star', size: 9, life: 1.5 }); }
      owlSay(observe(R), { title: clean ? t('giveUp') : '', mood: clean ? 'cheer' : 'talk', quiet: clean,
        html: bonus ? `<div class="pics"><span class="pill pop">${ic('star', 24)}${esc(t('bonus'))}</span><span class="pill pop">${ic('beam', 22)}<b>+10</b></span></div>` : '',
        acts: [{ label: t('testRaid'), icon: 'retry', fn: () => go('raid', { test: true }) }, { label: t('ok'), cls: 'go', icon: 'yes', fn: () => go('tinker') }] });
    }, 900);
  },
  draw() {
    const t0 = V.t, R = this.R, T = fitTree(0, 56, V.w, V.h - 70);
    const carrying = R.mags.filter(m => m.carry).length;
    drawSky(ctx, t0);
    drawTree(ctx, T, t0, { zones: true, jars: JARS.length - R.stolen - carrying, nest: R.stolen });
    ctx.save(); ctx.translate(T.ox, T.oy); ctx.scale(T.k, T.k);
    owl(ctx, OWL[0], OWL[1], 1.05, t0, R.done ? (R.stolen ? 'idle' : 'cheer') : carrying ? 'no' : 'sleep');
    for (const d of R.cams) if (d.cd > 0) { ctx.beginPath(); ctx.arc(d.x, d.y - 20, 30, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - d.cd / ITEMS[d.t].cd)); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke(); }
    for (const b of R.beams) {
      ctx.globalAlpha = Math.min(1, b.t * 3);
      if (b.bell) { ctx.lineWidth = 5; ctx.strokeStyle = '#ff9ecb'; for (const r of [40, 70]) { ctx.beginPath(); ctx.arc(b.x1, b.y1, r * (1.45 - b.t), 0, TAU); ctx.stroke(); } }
      else { poly(ctx, [b.x1, b.y1, b.x2 - 26, b.y2 - 30, b.x2 + 26, b.y2 + 30], 'rgba(255,246,200,.75)'); glow(ctx, b.x2, b.y2, 70, '255,246,200', .8); }
      ctx.globalAlpha = 1;
    }
    for (const m of R.mags) {
      if (m.state === 'wait' || m.state === 'gone') continue;
      const [x, y, f] = routeAt(ROUTES[m.route], Math.max(0, m.d)), back = m.state !== 'go';
      // on a small tree the raiders are drawn a little larger than life, so the bonks and sulks can be seen
      magpie(ctx, x, y, .62 * Math.max(1, .6 / T.k), t0 + m.at, { dir: back ? -f : f, carry: m.carry, pose: m.dizzy > 0 ? 'dizzy' : { go: 'sneak', back: 'walk', flee: 'flee', sulk: 'sulk' }[m.state], face: m.state === 'flee' ? 'shock' : m.state === 'sulk' ? 'sad' : 'sly' });
    }
    R.zipX = lerp(R.zipX, 500 + Math.sin(t0) * 200, .01); R.zipY = lerp(R.zipY, 150, .01);
    zip(ctx, R.zipX, R.zipY, 1.5, t0, 1);
    ctx.restore();
    fireflies(ctx, t0, 8);
  },
};
