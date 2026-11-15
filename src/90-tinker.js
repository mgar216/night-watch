// ---------- Tinker Treehouse and raids: design, test, watch, improve ----------
// Who comes tonight. Better station results mean fewer raiders; the plan is fixed per Night, so a test raid is a fair prediction.
// From Night 9 the numbers stay at Night 8's and new tricks come instead (src/91-arc.js).
function raidPlan(n, st) {
  const c = Math.min(n, 8), routes = c <= 2 ? ['lt', 'rt'] : c <= 4 ? ['lt', 'rt', 'lb', 'rb'] : ['lt', 'rt', 'lb', 'rb', 'sky'];
  const branch = Math.min(Math.ceil(c / 2) + (3 - st.cam), 7), gate = Math.min(3 - st.gate + (c >= 4 ? 1 : 0), 3), list = [];
  let at = 1;
  for (let i = 0; i < branch; i++) {
    list.push({ route: routes[((c >= 6 ? i >> 1 : i) + n) % routes.length], at });   // from Night 6 partners share a route
    at += c >= 4 && i % 2 === 0 ? (c >= 6 ? .9 : .3) : 3.2;   // later Nights: partners arrive together
  }
  for (let i = 0; i < gate; i++) list.push({ route: 'lad', at: 2 + i * 3.5 });
  arcTricks(n, list);
  return list.sort((a, b) => a.at - b.at);
}
const covers = (d, key) => {
  if (d.t === 'bell' && key !== 'lad') return false;
  const p = ROUTES[key];
  for (let s = 100; s <= p.len; s += 25) { const [x, y] = routeAt(p, s); if (Math.hypot(x - d.x, y - d.y) < d.r) return true; }
  return false;
};
// The chosen helper (src/57-pals.js) and the weather of Night n (src/47-season.js) count in test raids too, so a test stays
// fair. The raid passes its own Night: when it is over the Night has been counted, and the replay must not run in the
// weather of the next one.
function makeRaid(plan, holds, n = S.night) {
  const P = palPerk(), W = nightWeather(n), cd = it => (ITEMS[it.t].cd || 0) * (P === 'post' && (it.t === 'cam' || it.t === 'bell') ? .8 : 1);
  const at = it => ({ t: it.t, x: MOUNTS[it.m][0], y: MOUNTS[it.m][1], r: ITEMS[it.t].r * (P === 'lamp' && it.t === 'lamp' || P === 'music' && ITEMS[it.t].silly ? 1.2 : 1), cd: 0, cd0: cd(it) });
  const R = { t: 0, holds: holds + (P === 'guard' ? 1 : 0), shield: count('shield') + (P === 'garden' ? 1 : 0), spd: 1 - (W.slow || 0), wind: W.k === 'wind',
    stolen: 0, reached: {}, covered: {}, beams: [], done: false, zipX: 500, zipY: 150,
    cams: S.items.filter(i => i.t === 'cam' || i.t === 'bell').map(at), lamps: S.items.filter(i => i.t === 'lamp').map(at),
    toys: S.items.filter(i => ITEMS[i.t].silly).map(at), arc: S.items.filter(i => ITEMS[i.t].arc).map(at), fun: [], puffs: [], laughed: 0, mags: plan.map(arcRaider) };
  R.timed = R.cams.concat(R.arc);   // everything that recharges, for the rings the raid draws in every frame
  if (P === 'baker' && R.mags.length) R.mags[0].at += 5;   // the first magpie stops for a bun
  for (const k in ROUTES) R.covered[k] = R.cams.some(d => covers(d, k));
  return R;
}
// Silly gadgets. Each gadget plays its trick on every magpie once. The antic (m.fx) holds the magpie up, a jar it carried pops free,
// and a magpie that met three gadgets goes home laughing. Antics close together are a chain: R.fun remembers them for the replay.
const ANTIC = { peel: ['slip', .7], tramp: ['boing', .9], tickle: ['giggle', 1.7], bubbler: ['bubble', 2.4], cannon: ['bang', .6], disco: ['dance', 3] };   // antic and its seconds
function prank(R, m, g, x, y) {
  const [k, T] = ANTIC[g.t];
  m.met.add(g); m.fx = { k, t: T, T, dir: m.state === 'back' ? -1 : 1 }; m.dizzy = 0;
  m.combo = R.t - m.last < 3 ? m.combo + 1 : 1; m.last = R.t;
  R.fun.push({ t: R.t, w: m.combo });
  R.puffs.push({ k: g.t, x: g.x, y: g.y - 20, t: 1.2, n: m.combo });
  if (m.carry) { m.carry = false; m.state = 'sulk'; m.home = 1; R.zipX = x; R.zipY = y - 60; sfx.sparkle(); }   // Zip catches the jar and takes it home
  sfx[{ peel: 'slip', tramp: 'boing', tickle: 'giggle', bubbler: 'bubble', cannon: 'bang', disco: 'disco' }[g.t]]();
  buzz(20);
}
const STEP = 1 / 60;   // raids run in fixed steps, so the same design always gives the same raid (and the replay can run it again)
function stepRaid(R, dt) {
  R.t += dt;
  for (const d of R.cams) d.cd -= dt;
  for (const d of R.arc) d.cd -= dt;
  for (const b of R.beams) b.t -= dt;
  for (const b of R.puffs) b.t -= dt;
  R.beams = R.beams.filter(b => b.t > 0); R.puffs = R.puffs.filter(b => b.t > 0);
  let alive = 0;
  for (const m of R.mags) {
    if (m.state === 'gone') continue;
    alive++;
    if (m.state === 'wait') { if (R.t >= m.at) m.state = 'go'; continue; }
    const p = ROUTES[m.route], [x, y] = routeAt(p, m.d), active = m.state === 'go' || m.state === 'back';
    if (m.fx) {
      // a slip slides on the way the magpie was going; a bounce or a bang throws it back the way it came
      const a = m.fx;
      a.t -= dt;
      m.d = clamp(m.d + dt * a.dir * ({ slip: 300, boing: -260, bang: -300 }[a.k] || 0), 1, p.len - 1);
      if (a.t <= 0) {
        m.fx = null; m.dizzy = { slip: 1, boing: .6, bang: .8, bubble: .6 }[a.k] || 0;
        if (m.met.size >= 3 && m.state === 'go') { m.state = 'flee'; m.happy = true; m.home = 1; R.laughed += m.n; }
      }
    } else if (m.dizzy > 0) m.dizzy -= dt;
    else m.d += dt * 170 * R.spd * (R.wind && m.kind === 'balloon' ? .6 : 1) * { go: 1, back: -1.15, flee: -3, sulk: -1.3 }[m.state];
    if (m.kind && active && arcStep(R, m, x, y)) continue;   // a trickster meets the gadget that answers it (src/91-arc.js)
    // `home` marks a magpie sent home without a jar: it counts as caught kindly when a real raid ends
    if (!arcIgnores(m, 'cam') && (active || m.dizzy > 0 && m.state !== 'flee' && m.state !== 'sulk')) {
      const cam = R.cams.find(d => d.cd <= 0 && (d.t === 'cam' || m.route === 'lad') && Math.hypot(x - d.x, y - d.y) < d.r);
      if (cam) {
        cam.cd = cam.cd0;
        if (m.n > 1) arcSplit(R, m, x, y);   // two in a coat: one is caught, the other walks on
        else { m.state = 'flee'; m.dizzy = 0; m.carry = false; m.fx = null; m.home = 1; }
        R.beams.push({ x1: cam.x, y1: cam.y - 20, x2: x, y2: y - 20, t: .45, bell: cam.t === 'bell' });
        R.zipX = cam.x; R.zipY = cam.y - 60; cam.t === 'bell' ? sfx.ding() : sfx.flash(); sfx.squawk();
        continue;
      }
    }
    if (active && !arcIgnores(m, 'lamp') && !m.fx && m.dizzy <= 0) {
      const lamp = R.lamps.find(l => !m.bonked.has(l) && Math.hypot(x - l.x, y - l.y) < l.r);
      if (lamp) { m.bonked.add(lamp); m.dizzy = 2.2; sfx.bonk(); }
    }
    if (active && !arcIgnores(m, 'toy') && !m.fx && m.dizzy <= 0) {
      const g = R.toys.find(q => !m.met.has(q) && Math.hypot(x - q.x, y - q.y) < q.r);
      if (g) {
        prank(R, m, g, x, y);
        // a disco ball and a confetti cannon catch everyone in reach at once
        if (g.t === 'disco' || g.t === 'cannon') for (const q of R.mags) if (q !== m && (q.state === 'go' || q.state === 'back') && !q.fx && !q.met.has(g) && !arcIgnores(q, 'toy')) {
          const [qx, qy] = routeAt(ROUTES[q.route], q.d);
          if (Math.hypot(qx - g.x, qy - g.y) < g.r) prank(R, q, g, qx, qy);
        }
      }
    }
    if (m.state === 'go' && !m.fx && m.d >= p.len) {
      R.reached[m.route] = (R.reached[m.route] || 0) + 1; m.reach = 1;
      if (R.holds > 0) { R.holds--; m.state = 'sulk'; sfx.empty(); }
      else if (R.shield > 0) { R.shield--; m.state = 'flee'; m.home = 1; sfx.boing(); }
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
  if (!hit.length) return t(R.laughed ? 'o_silly' : 'o_great');
  const trick = R.mags.find(m => m.reach && m.trick && !m.fixed);   // a trick that worked comes first: the owl names it and its gadget
  if (trick) return t('o_' + trick.trick);
  const open = hit.find(r => !R.covered[r]);
  if (open === 'lad' && count('bell')) return t('o_bell');
  return t(open ? 'o_route' : 'o_busy', { r: t('r_' + (open || hit[0])) });
}

// The palette has two pages: defences and decorations, and the silly gadgets; from Night 9 a third one with the new gadgets
// (src/91-arc.js). The last button turns the page and shows the page that comes next.
const PALETTE = ['cam', 'lamp', 'bell', 'shield', 'banner', 'flowers', 'scope', 'lights'], SILLY = ['peel', 'tramp', 'tickle', 'bubbler', 'cannon', 'disco'];
scenes.tinker = {
  enter() {
    Object.assign(this, { hand: null, drag: false, px: 0, py: 0, sx: 0, sy: 0, kb: -1, page: this.page || 0 });
    const bar = add(`<div class="hud tbar"><button class="btn round go" id="tDone" aria-label="${esc(t('done'))}">${ic('yes', 28)}</button><span class="sp"></span>${palPill()}
      <button class="btn gold" id="tTest">${ic('pie', 26)}${esc(t('testRaid'))}</button><span class="pill" id="pBeams">${ic('beam', 22)}<b>${S.beams}</b></span></div>`);
    $('#tDone', bar).onclick = () => { sfx.click(); go('hub'); };
    $('#tTest', bar).onclick = () => { sfx.alarm(); go('raid', { test: true }); };
    this.pal = add('<div class="palette"></div>');
    this.fill();
    if (!S.tinkered) { S.tinkered = 1; save(); owlSay(t('tinkerIntro'), { html: picsHtml(['cam', 'lamp', 'bell', 'shield']) }); }
    else if (S.tinkered === 1 && S.night >= 2) { S.tinkered = 2; save(); owlSay(t('sillyIntro'), { html: picsHtml(['party', 'peel', 'tramp', 'disco']) }); }
  },
  fill() {
    const pages = [PALETTE, SILLY].concat(arcNew().length ? [arcNew()] : []);
    this.page %= pages.length;   // another player's save may have fewer pages
    const next = (this.page + 1) % pages.length;
    this.pal.innerHTML = pages[this.page].map(k => `<button class="pal" data-k="${k}" aria-label="${esc(t('i_' + k))}, ${ITEMS[k].cost}">${ic(k, 34)}<span>${ic('beam', 14)}${ITEMS[k].cost}</span></button>`).join('') +
      `<button class="pal more" id="tPage" aria-label="${esc(t(['guards', 'silly', 'arc_new'][next]))}">${ic(['cam', 'party', 'fan'][next], 34)}<span>${ic('skipI', 14)}</span></button>`;
    paintIcons(this.pal);
    this.pal.querySelectorAll('.pal[data-k]').forEach(b => {
      b.onpointerdown = e => { const k = b.dataset.k; this.hand = this.hand === k && !this.drag ? null : k; this.drag = !!this.hand; [this.sx, this.sy] = [this.px, this.py] = [e.clientX, e.clientY]; sfx.click(); this.marks(); };
      // Keyboard: Enter picks the item and hands the keys to the tree (arrows choose a free spot, Enter places it there).
      b.onkeydown = e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const k = b.dataset.k, spots = this.free(k);
        this.hand = this.hand === k ? null : k; this.kb = this.hand && spots.length ? spots[0] : -1;
        this.marks(); b.blur(); e.preventDefault();
      };
    });
    $('#tPage', this.pal).onclick = () => { sfx.pop(); this.page = next; this.hand = null; this.drag = false; this.fill(); $('#tPage', this.pal).focus({ preventScroll: true }); };
    this.marks();
  },
  marks() {
    this.pal.querySelectorAll('.pal[data-k]').forEach(b => {
      const on = b.dataset.k === this.hand, poor = ITEMS[b.dataset.k].cost > S.beams;
      b.classList.toggle('sel', on); b.classList.toggle('poor', poor);
      b.setAttribute('aria-pressed', on); b.setAttribute('aria-disabled', poor);
    });
    refreshHud();
  },
  // The tree gets whatever the palette leaves free: the space above it, or (low landscape) the space to its left.
  T() { const p = this.pal.getBoundingClientRect(); return p.top > V.h * .5 ? fitTree(0, 60, V.w, p.top - 64) : fitTree(0, 60, p.left, V.h - 64); },
  overPal(x, y) { const p = this.pal.getBoundingClientRect(); return x >= p.left && y >= p.top; },
  free(type) { const at = ITEMS[type].at; return MOUNTS.map((m, i) => i).filter(i => (type === 'shield') === (i === VAULT) && (!at || at.includes(i)) && !S.items.some(it => it.m === i)); },
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
// When gadgets made the magpies laugh, the funniest moment is shown once more in slow motion before the result.
scenes.raid = {
  enter(o = {}) {
    this.test = !!o.test; this.endT = 0; this.acc = 0; this.rp = null;
    this.rooms = rank();   // the Night is counted when the raid ends: a room won by it first shows at the ceremony, not here
    const st = this.test ? { cam: S.st.cam || 2, gate: S.st.gate || 2, forge: S.st.forge || 2 } : S.st;
    this.n = S.night; this.plan = raidPlan(this.n, st); this.holds = st.forge - 1;
    this.R = makeRaid(this.plan, this.holds, this.n);
    add(`<div class="hud">${this.test ? `<button class="btn round" id="rBack" aria-label="${esc(t('done'))}">${ic('no', 24)}</button>` : ''}
      <span class="pill">${ic('pie', 24)}${esc(t(this.test ? 'testRaid' : 'raidGo'))}</span><span class="sp"></span>${palPill()}</div>`);
    if (this.test) $('#rBack').onclick = () => { sfx.click(); go('tinker'); };   // a practice raid can be left at any time
    if (!this.test) later(() => toast(t('raidGo')), 100);
  },
  update(dt) {
    if (this.rp) return this.replay(dt);
    const R = this.R;
    if (!R.done) { for (this.acc += dt; this.acc >= STEP && !R.done; this.acc -= STEP) stepRaid(R, STEP); return; }
    if (this.endT) return;
    this.endT = V.t;
    // What the raid earned is counted and saved now; the replay and the owl's word come after.
    if (!this.test) {
      const kind = R.mags.reduce((a, m) => a + (m.home ? m.n : 0), 0);   // sent home without a jar, or laughing
      if (kind) pieCaught(kind);
      this.stars = closeNight(R.stolen, R.laughed);
    } else {
      this.clean = !Object.keys(R.reached).length && S.items.some(i => !ITEMS[i.t].deco); this.bonus = this.clean && S.testStar !== S.night;
      if (this.bonus) { S.testStar = S.night; S.stars++; S.beams += 10; save(); }
    }
    later(() => this.rewind() || this.result(), 800);
  },
  // The funniest moment is the 2.5 seconds with the most antics; chains count for more. The same raid is run again
  // silently up to just before that moment, then played at less than half speed.
  rewind() {
    const fun = this.R.fun;
    if (!fun.length) return false;
    let best = 0, at = 0;
    for (const f of fun) { const w = fun.reduce((a, g) => a + (g.t >= f.t && g.t < f.t + 2.5 ? g.w : 0), 0); if (w > best) { best = w; at = f.t; } }
    const R = makeRaid(this.plan, this.holds, this.n);
    quiet = true;
    while (R.t < at - .7 && !R.done) stepRaid(R, STEP);
    quiet = false;
    this.rp = { R, end: at + 2.3, acc: 0 };
    sfx.rewind();
    const n = add(`<div class="replay"><span class="pill pop">${ic('retry', 22)}${esc(t('replay'))}</span><button class="btn" id="rSkip">${ic('skipI', 22)}${esc(t('skip'))}</button></div>`);
    $('#rSkip', n).onclick = () => { sfx.click(); this.skip(); };
    return true;
  },
  replay(dt) {
    const rp = this.rp;
    for (rp.acc += dt * .4; rp.acc >= STEP && !rp.R.done; rp.acc -= STEP) stepRaid(rp.R, STEP);
    if (rp.R.t >= rp.end || rp.R.done) this.skip();
  },
  skip() {
    if (!this.rp) return;
    this.rp = null;
    const n = $('.replay');
    if (n) n.remove();
    this.result();
  },
  key(e) { if (this.rp && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) { this.skip(); e.preventDefault(); } },
  result() {
    const R = this.R, clean = this.clean, bonus = this.bonus;
    if (!this.test) return finishNight(R.stolen, this.stars);
    if (clean) { sfx.fanfare(); burst(V.w / 2, V.h * .4, 50, { colors: ['#ffd86b', '#ff9ecb', '#7fd0ff', '#6fdc95'], speed: 340, kind: 'star', size: 9, life: 1.5 }); }
    owlSay(observe(R), { title: clean ? t('giveUp') : '', mood: clean ? 'cheer' : 'talk', quiet: clean,
      html: bonus ? `<div class="pics"><span class="pill pop">${ic('star', 24)}${esc(t('bonus'))}</span><span class="pill pop">${ic('beam', 22)}<b>+10</b></span></div>` : '',
      acts: [{ label: t('testRaid'), icon: 'retry', fn: () => go('raid', { test: true }) }, { label: t('ok'), cls: 'go', icon: 'yes', fn: () => go('tinker') }] });
  },
  draw() {
    const t0 = V.t, R = this.rp ? this.rp.R : this.R, T = fitTree(0, 56, V.w, V.h - 70);
    const carrying = R.mags.filter(m => m.carry).length, party = R.mags.some(m => m.fx && m.fx.k === 'dance');
    drawSky(ctx, t0);
    drawTree(ctx, T, t0, { zones: true, jars: JARS.length - R.stolen - carrying, nest: R.stolen, rooms: this.rooms, night: this.n });
    ctx.save(); ctx.translate(T.ox, T.oy); ctx.scale(T.k, T.k);
    owl(ctx, OWL[0], OWL[1], 1.05, t0, R.done ? (R.stolen ? 'idle' : 'cheer') : carrying ? 'no' : party ? 'cheer' : 'sleep');   // the disco ball wakes the owl too
    for (const d of R.timed) if (d.cd > 0) { ctx.beginPath(); ctx.arc(d.x, d.y - 20, 30, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - d.cd / d.cd0)); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke(); }
    for (const b of R.beams) {
      ctx.globalAlpha = Math.min(1, b.t * 3);
      if (b.bell) { ctx.lineWidth = 5; ctx.strokeStyle = '#ff9ecb'; for (const r of [40, 70]) { ctx.beginPath(); ctx.arc(b.x1, b.y1, r * (1.45 - b.t), 0, TAU); ctx.stroke(); } }
      else { poly(ctx, [b.x1, b.y1, b.x2 - 26, b.y2 - 30, b.x2 + 26, b.y2 + 30], 'rgba(255,246,200,.75)'); glow(ctx, b.x2, b.y2, 70, '255,246,200', .8); }
      ctx.globalAlpha = 1;
    }
    // What a gadget throws out when its trick goes off: confetti, bubbles, disco lights or a plain ring; and the length of a chain.
    for (const b of R.puffs) {
      const k = 1 - b.t / 1.2;
      ctx.globalAlpha = Math.min(1, b.t * 2.5);
      if (b.k === 'cannon') for (let i = 0; i < 14; i++) { const a = hash(i + 3) * TAU, d = 30 + k * (60 + hash(i) * 90); ctx.fillStyle = ['#ff8a7a', '#ffd24a', '#6fdc95', '#58a6ff', '#ff9ecb'][i % 5]; ctx.fillRect(b.x + Math.cos(a) * d - 5, b.y + Math.sin(a) * d * .7 - 5 + k * k * 40, 10, 10); }
      else if (b.k === 'bubbler') for (let i = 0; i < 6; i++) { ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x + Math.sin(i * 2.1 + k * 4) * 26, b.y - k * (50 + i * 18), 6 + i % 3 * 4, 0, TAU); ctx.stroke(); }
      else if (b.k === 'disco') for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + (still() ? 0 : t0 * 3); circ(ctx, b.x + Math.cos(a) * 95, b.y + Math.sin(a) * 60, 16, ['rgba(255,138,122,.55)', 'rgba(255,210,74,.55)', 'rgba(111,220,149,.55)', 'rgba(88,166,255,.55)'][i % 4]); }
      else if (ARC_PUFF[b.k]) ARC_PUFF[b.k](ctx, b, k);
      else { ctx.lineWidth = 5; ctx.strokeStyle = '#fff6da'; ctx.beginPath(); ctx.arc(b.x, b.y, 20 + k * 50, 0, TAU); ctx.stroke(); }
      if (b.n > 1) {
        ctx.font = '900 46px ui-rounded, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(7,13,42,.85)'; ctx.fillStyle = '#ffd86b';
        ctx.strokeText('×' + b.n, b.x, b.y - 70 - k * 30); ctx.fillText('×' + b.n, b.x, b.y - 70 - k * 30);
      }
      ctx.globalAlpha = 1;
    }
    for (const m of R.mags) {
      if (m.state === 'wait' || m.state === 'gone') continue;
      // on a small tree the raiders are drawn a little larger than life, so the bonks and sulks can be seen
      const [x, y, f] = routeAt(ROUTES[m.route], Math.max(0, m.d)), dir = m.state !== 'go' ? -f : f, a = m.fx, k = a ? 1 - a.t / a.T : 0, s = .62 * Math.max(1, .6 / T.k);
      let pose = m.dizzy > 0 ? 'dizzy' : { go: 'sneak', back: 'walk', flee: 'flee', sulk: 'sulk' }[m.state], face = m.happy ? 'joy' : m.state === 'flee' ? 'shock' : m.state === 'sulk' ? 'sad' : 'sly', dy = 0, rot = 0;
      if (a) {   // the antic of a silly gadget: every one has a pose that also reads without motion
        pose = 'stand'; face = a.k === 'giggle' || a.k === 'dance' ? 'joy' : a.k === 'bubble' ? 'worry' : 'shock';
        if (a.k === 'slip') rot = -1.4;
        else if (a.k === 'boing') { dy = -Math.sin(Math.PI * k) * 150; rot = still() ? 0 : k * TAU; }
        else if (a.k === 'bang') dy = -Math.sin(Math.PI * k) * 45;
        else if (a.k === 'bubble') dy = -Math.sin(Math.PI * Math.min(1, k * 1.15)) * 95;
        else if (a.k === 'giggle') rot = still() ? .1 : Math.sin(t0 * 30) * .12;
        else { rot = still() ? .25 : Math.sin(t0 * 9) * .3; dy = still() ? 0 : -Math.abs(Math.sin(t0 * 9)) * 14; }
      }
      ctx.save(); ctx.translate(x, y + dy - 30 * s); ctx.rotate(rot * dir);
      (m.kind ? arcMag : magpie)(ctx, 0, 30 * s, s, t0 + m.at, { dir, carry: m.carry, pose, face, m });   // tricksters: src/91-arc.js
      ctx.restore();
      const hy = y + dy - 88 * s;
      if (a && a.k === 'bubble') { ctx.beginPath(); ctx.arc(x, y + dy - 32 * s, 52 * s, 0, TAU); ctx.fillStyle = 'rgba(190,230,255,.28)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); circ(ctx, x - 20 * s, y + dy - 54 * s, 7 * s, 'rgba(255,255,255,.8)'); }
      if (a && a.k === 'giggle') for (const i of [-1, 0, 1]) line(ctx, [x + i * 13 * s, hy, x + i * 22 * s, hy - 15 * s], '#fff6da', 3.5);
      if (a && a.k === 'dance') for (const i of [-1, 1]) { circ(ctx, x + i * 30 * s, hy + 6 * s, 5.5 * s, '#fff6da'); line(ctx, [x + i * 30 * s + 5 * s, hy + 6 * s, x + i * 30 * s + 5 * s, hy - 16 * s, x + i * 30 * s + 14 * s, hy - 11 * s], '#fff6da', 3); }
    }
    R.zipX = lerp(R.zipX, 500 + Math.sin(t0) * 200, .01); R.zipY = lerp(R.zipY, 150, .01);
    zip(ctx, R.zipX, R.zipY, 1.5, t0, 1);
    ctx.restore();
    fireflies(ctx, t0, 8);
    if (this.rp) { ctx.fillStyle = 'rgba(7,13,42,.6)'; ctx.fillRect(0, 0, V.w, 58); ctx.fillRect(0, V.h - 40, V.w, 40); }   // film bars: this is a replay
  },
};
