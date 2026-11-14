// ---------- Station one: Camera Watch (watch patiently, tell friends from thieves, mind the battery) ----------
ICON.pie = c => magpie(c, -.15, .8, .021, 0);
let scanPat = null;
scenes.cam = {
  enter() {
    const n = S.night, cams = Math.min(count('cam'), 4), lamps = Math.min(count('lamp'), 3);
    // Difficulty creeps up gently with the Night; Tinker cameras slow magpies, lanterns brighten the feeds.
    this.P = { feeds: n <= 2 ? 4 : n <= 5 ? 6 : 9, need: Math.min(4 + n, 12), speed: Math.min(.12 + .012 * n, .25) * (1 - .05 * cams),
      gap: Math.max(2, 4.6 - .32 * n), live: n >= 8 ? 3 : n >= 5 ? 2 : 1, hide: (1.5 - Math.min(n, 8) * .07) * (1 - .12 * lamps),
      friendGap: n === 1 ? 6 : Math.max(2.2, 4.5 - .25 * n), decoy: n >= 4 ? .2 : 0, statics: n >= 6, dark: .18 - .05 * lamps };
    this.fav = n >= 3 ? shuffle([...Array(this.P.feeds).keys()]).slice(0, 2) : [];
    this.feeds = [...Array(this.P.feeds)].map(() => ({ bushes: [rnd(.22, .36), rnd(.62, .78)], mag: null, friend: null, staticT: 0, flashT: 0, wait: 0 }));
    Object.assign(this, { caught: 0, stolen: 0, friendHits: 0, decoyHits: 0, misses: 0, empty: 0, batt: 5, spawnT: 1.2, friendT: 3, staticT: 8,
      time: this.P.need * this.P.gap * 1.7 + 20, run: false, noT: 0, cur: -1, shakeT: 0 });
    this.total = this.time;
    hud(() => go('hub'), `<span class="pill" id="pCatch">${ic('pie', 26)}<b>0</b>/${this.P.need}</span>`);
    owlSay(t('camIntro'), { html: picsHtml(['pie', 'torch']), acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => { this.run = true; } }] });
  },
  rect(i) {
    const n = this.P.feeds, cols = n === 4 ? 2 : n === 9 ? 3 : wide() ? 3 : 2, rows = n / cols, top = 112, pad = 8;
    const w = (V.w - pad * (cols + 1)) / cols, h = (V.h - top - pad * (rows + 1)) / rows;
    return [pad + (i % cols) * (w + pad), top + pad + (i / cols | 0) * (h + pad), w, h];
  },
  spawn() {
    const free = this.feeds.map((f, i) => i).filter(i => !this.feeds[i].mag && this.feeds[i].wait <= 0);
    if (!free.length) return;
    const pool = free.flatMap(i => this.fav.includes(i) ? [i, i, i] : [i]), f = this.feeds[pick(pool)], dir = pick([1, -1]);
    f.mag = { x: dir > 0 ? -.14 : 1.14, dir, phase: 'in', state: 'walk', hideT: 0, stops: S.night === 1 ? [pick(f.bushes)] : [...f.bushes], decoy: Math.random() < this.P.decoy, carry: false };
  },
  flash(i) {
    const f = this.feeds[i], m = f.mag;
    if (!this.run || i >= this.feeds.length) return;
    if (this.batt < 1) { sfx.empty(); this.empty++; this.shakeT = .4; return; }
    this.batt -= 1; f.flashT = .4; sfx.flash();
    const [x, y, w, h] = this.rect(i), exposed = m && m.state === 'walk' && m.x > .03 && m.x < .97 && f.staticT <= 0;
    if (exposed && !m.decoy) {
      m.state = 'caught'; m.dir = m.phase === 'in' ? -m.dir : m.dir; this.caught++;
      sfx.squawk(); burst(x + m.x * w, y + h * .6, 12, { kind: 'feather', color: '#dfe6f5', speed: 140, size: 7 });
      if (m.carry) { m.carry = false; floatText(x + m.x * w, y + h * .4, '+1', '#ffd86b'); burst(x + m.x * w, y + h * .5, 14, { speed: 120 }); sfx.sparkle(); }
      $('#pCatch b').textContent = this.caught;
      if (this.caught >= this.P.need) this.finish(true);
    } else if (exposed) { m.state = 'flat'; m.hideT = 1; this.decoyHits++; this.noT = V.t + 1.1; sfx.bonk(); }
    else if (f.friend) { this.friendHits++; this.noT = V.t + 1.1; f.friend.hit = 1; sfx.oops(); }
    else this.misses++;
  },
  finish(won, timeout) {
    if (!this.run) return;
    this.run = false;
    if (won) return later(() => stationWin('cam', this.stolen === 0 && this.friendHits + this.decoyHits + this.misses <= 2 ? 3 : this.stolen <= 1 ? 2 : 1), 700);
    const tip = timeout ? 'camTipTime' : this.friendHits >= 3 ? 'camTipFriend' : this.decoyHits >= 2 ? 'camTipDecoy' : this.empty >= 3 ? 'camTipBatt' : 'camTipSlow';
    later(() => { const v = owlSay(t('soft') + ' ' + t(tip), { quiet: true, mood: 'idle', html: `<div class="pics" style="font-size:.8em">${ic('jar', 26)}${esc(t('nestOk'))}</div>`,
      acts: [{ label: t('home'), icon: 'home', fn: () => go('hub') }, { label: t('retry'), cls: 'go', icon: 'retry', fn: () => go('cam') }] }); sfx.oops(); return v; }, 600);
  },
  down(x, y) { for (let i = 0; i < this.feeds.length; i++) { const [fx0, fy, w, h] = this.rect(i); if (x >= fx0 && x <= fx0 + w && y >= fy && y <= fy + h) return this.flash(i); } },
  key(e) {
    const n = this.feeds.length, cols = n === 4 ? 2 : n === 9 ? 3 : wide() ? 3 : 2;
    if (e.key >= '1' && e.key <= '9') return this.flash(+e.key - 1);
    const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[e.key];
    if (d) { this.cur = clamp((this.cur < 0 ? 0 : this.cur + d), 0, n - 1); e.preventDefault(); }
    if ((e.key === ' ' || e.key === 'Enter') && this.cur >= 0 && e.target.tagName !== 'BUTTON') { this.flash(this.cur); e.preventDefault(); }
  },
  update(dt) {
    if (!this.run) return;
    const P = this.P;
    this.batt = Math.min(5, this.batt + dt / 2.2);
    this.time -= dt; this.shakeT -= dt;
    if (this.time <= 0) return this.finish(false, true);
    if ((this.spawnT -= dt) <= 0 && this.feeds.filter(f => f.mag).length < P.live) { this.spawn(); this.spawnT = P.gap * rnd(.8, 1.2); }
    if ((this.friendT -= dt) <= 0) {
      const f = pick(this.feeds);
      if (!f.friend) f.friend = { kind: pick(['zip', 'leaf', 'flies']), t: 0, y: rnd(.2, .55), dir: pick([1, -1]) };
      this.friendT = P.friendGap * rnd(.7, 1.3);
    }
    if (P.statics && (this.staticT -= dt) <= 0) { pick(this.feeds).staticT = 1.5; this.staticT = rnd(7, 11); sfx.type(); }
    for (const f of this.feeds) {
      f.flashT -= dt; f.staticT -= dt; f.wait -= dt;
      if (f.friend && (f.friend.t += dt) > { zip: 1.1, leaf: 2.8, flies: 3.2 }[f.friend.kind]) f.friend = null;
      const m = f.mag;
      if (!m) continue;
      if (m.state === 'hide' || m.state === 'flat') { if ((m.hideT -= dt) <= 0) { if (m.state === 'flat') { f.mag = null; continue; } m.state = 'walk'; } continue; }
      const v = P.speed * (m.state === 'caught' ? 4 : m.carry ? 1.3 : 1);
      m.x += m.dir * v * dt;
      if (m.state === 'walk' && !m.decoy) {
        const s = m.stops.findIndex(b => Math.abs(m.x - b) < v * dt * 1.5 + .004);
        if (s >= 0) { m.stops.splice(s, 1); m.state = 'hide'; m.hideT = P.hide * rnd(.8, 1.2) * (m.carry ? .6 : 1); }
      }
      if (m.x < -.16 || m.x > 1.16) {
        if (m.state === 'caught' || m.decoy) { f.mag = null; f.wait = .8; }
        else if (m.phase === 'in') { m.phase = 'out'; m.dir = -m.dir; m.carry = true; m.stops = [pick(f.bushes)]; m.x = m.dir > 0 ? -.15 : 1.15; m.state = 'hide'; m.hideT = 1.3; }
        else {
          f.mag = null; f.wait = .8; this.stolen++;
          const [x, y, w, h] = this.rect(this.feeds.indexOf(f));
          floatText(x + w / 2, y + h / 2, '-1', '#ff8a7a'); sfx.oops();
          if (this.stolen >= 3) return this.finish(false);
        }
      }
    }
  },
  draw() {
    const t0 = V.t, P = this.P;
    ctx.fillStyle = '#070d2a'; ctx.fillRect(0, 0, V.w, V.h);
    // status strip: owl, battery cells (shape-coded), time bar, jars taken
    const sy = 62, sx = this.shakeT > 0 && !still() ? Math.sin(t0 * 60) * 4 : 0;
    owl(ctx, 30, sy + 46, .46, t0, t0 < this.noT ? 'no' : 'idle');
    drawIcon(ctx, 'torch', 78 + sx, sy + 22, 30);
    for (let i = 0; i < 5; i++) {
      rr(ctx, 98 + i * 20 + sx, sy + 8, 15, 28, 4);
      ctx.fillStyle = i < Math.floor(this.batt) ? '#ffd86b' : 'rgba(255,255,255,.14)'; ctx.fill();
      if (i === Math.floor(this.batt)) { ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(255,216,107,.55)'; const k = this.batt % 1; ctx.fillRect(98 + i * 20 + sx, sy + 36 - 28 * k, 15, 28 * k); ctx.restore(); }
    }
    const bx = 206, bw = Math.max(40, V.w - bx - 104);
    rr(ctx, bx, sy + 14, bw, 16, 8); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fill();
    rr(ctx, bx, sy + 14, Math.max(16, bw * this.time / this.total), 16, 8); ctx.fillStyle = '#7fd0ff'; ctx.fill();
    drawIcon(ctx, 'moon', bx + bw * this.time / this.total, sy + 22, 24);
    for (let i = 0; i < 3; i++) { ctx.globalAlpha = i < this.stolen ? .25 : 1; drawIcon(ctx, 'jar', V.w - 86 + i * 28, sy + 22, 26); ctx.globalAlpha = 1; if (i < this.stolen) drawIcon(ctx, 'no', V.w - 86 + i * 28, sy + 22, 16); }
    if (!scanPat) { const o = document.createElement('canvas'); o.width = 4; o.height = 4; const g = o.getContext('2d'); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 0, 4, 1); scanPat = ctx.createPattern(o, 'repeat'); }
    this.feeds.forEach((f, i) => {
      const [x, y, w, h] = this.rect(i), by = y + h * .76, s = Math.min(h * .36, w * .34) / 80, m = f.mag;
      ctx.save(); rr(ctx, x, y, w, h, 12); ctx.clip();
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0f3a40'); g.addColorStop(1, '#0a2226'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      glow(ctx, x + w * (.2 + hash(i) * .6), y + h * .2, h * .5, '160,255,220', .18);
      line(ctx, [x - 10, by + 6 + hash(i + 3) * 8, x + w + 10, by + 6 - hash(i + 5) * 8], '#1c5548', Math.max(8, h * .09));
      for (let j = 0; j < 3; j++) { const a = t0 * .8 + j * 2 + i; circ(ctx, x + w * (.5 + .4 * Math.sin(a * .6 + j)), y + h * (.4 + .25 * Math.cos(a)), 1.6, 'rgba(200,255,220,.7)'); }
      const drawMag = () => {
        const mx = x + m.x * w;
        if (m.state === 'flat') { ctx.save(); ctx.translate(mx, by); ctx.scale(1, .25); magpie(ctx, 0, 0, s, 0, { shadow: 1, dir: m.dir }); ctx.restore(); return; }
        if (!m.decoy) glow(ctx, mx, by - 30 * s, 62 * s, '170,255,225', .22);   // night-vision shimmer keeps the dark bird readable
        magpie(ctx, mx, by, s, t0, { dir: m.dir, shadow: m.decoy, carry: m.carry, pose: m.state === 'caught' ? 'flee' : 'sneak', face: m.state === 'caught' ? 'shock' : 'sly' });
      };
      if (m && m.state === 'hide') drawMag();
      f.bushes.forEach((b, j) => {
        const rustle = m && m.state === 'hide' && Math.abs(m.x - b) < .05 && !still() ? Math.sin(t0 * 30) * 2.5 : 0, r = Math.min(h * .2, w * .13), cx = x + b * w + rustle, cy = by - r * .7;
        circ(ctx, cx, cy, r, '#1d6a52'); circ(ctx, cx - r * .7, cy + r * .35, r * .7, '#18584a'); circ(ctx, cx + r * .7, cy + r * .3, r * .75, '#237a5c'); circ(ctx, cx + r * .1, cy - r * .55, r * .6, '#2a8a66');
        if (rustle) { line(ctx, [cx - r * 1.5, cy - r, cx - r * 1.8, cy - r * 1.3], '#bfeee4', 2); line(ctx, [cx + r * 1.5, cy - r, cx + r * 1.8, cy - r * 1.3], '#bfeee4', 2); }
      });
      if (m && m.state !== 'hide') drawMag();
      const fr = f.friend;
      if (fr) {
        const k = fr.t;
        if (fr.kind === 'zip') { const zx = fr.dir > 0 ? k / 1.1 : 1 - k / 1.1; zip(ctx, x + zx * w, y + h * fr.y + (fr.hit ? Math.sin(t0 * 40) * 4 : 0), Math.max(.5, s * 2.2), t0, fr.dir); }
        else if (fr.kind === 'leaf') { ctx.save(); ctx.translate(x + w * (.3 + fr.y * .6) + Math.sin(k * 3) * w * .08, y + h * k / 2.8); ctx.rotate(Math.sin(k * 3)); ctx.scale(h * .07, h * .07); ctx.beginPath(); SHAPES.leaf(ctx); ctx.fillStyle = '#62c26a'; ctx.fill(); ctx.restore(); }
        else for (let j = 0; j < 5; j++) { const a = k * 2 + j * 1.3, sp = fr.hit ? 2.2 : 1, px = x + w * (fr.dir > 0 ? k / 3.2 : 1 - k / 3.2) + Math.cos(a) * h * .1 * sp, py = y + h * fr.y + Math.sin(a * 1.4) * h * .1 * sp; glow(ctx, px, py, h * .09, '255,230,140', .7); circ(ctx, px, py, 2.2, '#fff6c8'); }
      }
      ctx.fillStyle = `rgba(0,10,20,${P.dark})`; ctx.fillRect(x, y, w, h);
      if (f.flashT > 0) glow(ctx, m ? x + clamp(m.x, 0, 1) * w : x + w / 2, by - h * .2, Math.max(w, h) * .8, '255,246,200', Math.min(.75, f.flashT * 2.2));
      if (f.staticT > 0) for (let j = 0; j < 60; j++) { ctx.fillStyle = `rgba(${hash(j + (t0 * 30 | 0)) > .5 ? '220,240,235' : '20,40,40'},.8)`; ctx.fillRect(x + hash(j * 3 + (t0 * 30 | 0)) * w, y + hash(j * 7 + (t0 * 30 | 0)) * h, w * .18, 3); }
      ctx.fillStyle = scanPat; ctx.fillRect(x, y, w, h);
      circ(ctx, x + 14, y + 14, 4, t0 % 1 < .5 || still() ? '#ff6b5a' : 'rgba(255,107,90,.3)');
      ctx.font = '800 13px ui-monospace, Menlo, Consolas, monospace'; ctx.fillStyle = 'rgba(220,255,240,.85)'; ctx.textAlign = 'left'; ctx.fillText(i + 1, x + 23, y + 19);
      ctx.restore();
      rr(ctx, x, y, w, h, 12); ctx.lineWidth = i === this.cur ? 4 : 2; ctx.strokeStyle = i === this.cur ? '#fff' : this.fav.includes(i) && S.night >= 3 ? 'rgba(127,208,255,.55)' : 'rgba(127,208,255,.35)'; ctx.stroke();
    });
  },
};
