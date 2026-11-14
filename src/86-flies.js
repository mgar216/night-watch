// ---------- Bonus round: Firefly Round-up (a calm catch with no way to fail) ----------
const fliesTime = 45;   // seconds in one round
// Catch chimes climb the major pentatonic scale from C5 (two octaves at most), so they always fit the lullaby.
const fliesNote = k => 523.25 * Math.pow(2, (12 * (k / 5 | 0) + [0, 2, 4, 7, 9][k % 5]) / 12);
function fliesChime(k, gold) {
  const f = fliesNote(k);
  tone(f, .7, 'sine', .14, 0, 0, .005); tone(f * 2, .35, 'sine', .035, .01);
  if (gold) tone(f * 1.5, .8, 'sine', .1, .09);   // a golden one rings a second, higher note
}

// One firefly facing right at (x, y); s = 1 is about 14 px long, b is the light's brightness 0..1, wing 0..1 lifts the wings.
// Golden ones carry a star-shaped light: shape and size tell them apart, not only colour.
function fliesBug(c, x, y, s, gold, b, wing, dir = 1, tilt = 0) {
  c.save(); c.translate(x, y); c.scale(s * dir, s); c.rotate(tilt);
  ell(c, -1, -4.5, 5, 2.4, 'rgba(225,238,255,.6)', -.6 - wing * .5);
  ell(c, 1.5, -4.5, 4.4, 2.2, 'rgba(225,238,255,.5)', -.2 - wing * .4);
  ell(c, 2, 0, 5, 3.2, '#3b3029'); circ(c, 7, -.5, 2.6, '#2a211c');
  line(c, [8, -2.5, 10.5, -6], '#2a211c', .8); line(c, [7, -2.8, 8.5, -6.5], '#2a211c', .8);
  if (gold) {
    starPath(c, -4, .5, 6.5, 2.8, 5); c.fillStyle = `rgba(255,210,74,${.55 + .45 * b})`; c.fill();
    c.lineWidth = .9; c.strokeStyle = '#fff6da'; c.lineJoin = 'round'; c.stroke(); circ(c, -4, .8, 1.6, '#fff');
  } else { circ(c, -3.5, .5, 3.6, `rgba(232,255,154,${.45 + .55 * b})`); circ(c, -3.8, .2, 1.4, `rgba(255,255,255,${.4 + .6 * b})`); }
  c.restore();
}
// A sleepy moth (a friend): soft wings with eye spots, closed eyes, feathery feelers. `flap` 0..1 opens the wings.
function fliesMoth(c, x, y, s, flap, dir) {
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(dir * .2);
  for (const k of [-1, 1]) {
    c.save(); c.scale(k * (.4 + .6 * flap), 1);
    c.beginPath(); c.moveTo(1, -4); c.quadraticCurveTo(13, -21, 23, -13); c.quadraticCurveTo(26, -1, 2, 2); c.closePath(); c.fillStyle = '#c3b6dc'; c.fill();
    c.beginPath(); c.moveTo(1, 1); c.quadraticCurveTo(19, 4, 13, 14); c.quadraticCurveTo(6, 16, 1, 7); c.closePath(); c.fillStyle = '#a99cc6'; c.fill();
    circ(c, 14, -9, 3.6, '#8a7aa8'); circ(c, 14, -9, 1.6, '#efe8ff');
    c.restore();
  }
  ell(c, 0, 2, 3.6, 10, '#9a8a76'); circ(c, 0, -9, 4.6, '#ab9a84');
  c.beginPath(); c.moveTo(-1.5, -13); c.quadraticCurveTo(-4, -19, -9, -20); c.moveTo(1.5, -13); c.quadraticCurveTo(4, -19, 9, -20);
  c.lineWidth = 1.2; c.strokeStyle = '#d8ccb8'; c.lineCap = 'round'; c.stroke();
  c.lineWidth = .9; c.strokeStyle = '#3a2a1a';
  for (const k of [-1, 1]) { c.beginPath(); c.arc(k * 1.9, -9.6, 1.3, .3, Math.PI - .3); c.stroke(); }
  c.restore();
}
// The timer moon: round, with a sleepy smile.
function fliesMoon(c, x, y, r) {
  glow(c, x, y, r * 3.6, '255,240,200', .3);
  circ(c, x, y, r, '#fff3c9');
  circ(c, x - r * .4, y - r * .4, r * .15, '#f0dca0'); circ(c, x + r * .45, y + r * .32, r * .12, '#f0dca0');
  c.lineWidth = Math.max(1.2, r * .09); c.strokeStyle = '#b8954a'; c.lineCap = 'round';
  for (const k of [-1, 1]) { c.beginPath(); c.arc(x + k * r * .32, y - r * .04, r * .15, .25, Math.PI - .25); c.stroke(); }
  c.beginPath(); c.arc(x, y + r * .26, r * .2, .35, Math.PI - .35); c.stroke();
}
ICON.fliesFly = c => { glow(c, -.32, .05, 1, '214,255,140', .7); fliesBug(c, -.08, .1, .085, false, 1, .5); };
ICON.fliesGold = c => { glow(c, -.3, .05, 1, '255,206,90', .8); fliesBug(c, -.05, .12, .075, true, 1, .5); };

// The meadow, cached per size in two layers: the sky (the moon passes in front of it) and the hills and grass
// (the moon sets behind them).
let fliesBg = null;
function fliesBack(w, h, hy) {
  if (fliesBg && fliesBg.w === w && fliesBg.h === h && fliesBg.hy === hy) return fliesBg;
  const d = Math.min(window.devicePixelRatio || 1, 2), y0 = Math.round(hy - h * .08);
  const layer = ch => { const o = document.createElement('canvas'); o.width = Math.ceil(w * d); o.height = Math.ceil(ch * d); const g = o.getContext('2d'); g.scale(d, d); return [o, g]; };
  const [sky, s] = layer(hy + 2), gr = s.createLinearGradient(0, 0, 0, hy);
  gr.addColorStop(0, '#070d2a'); gr.addColorStop(1, '#22357a');
  s.fillStyle = gr; s.fillRect(0, 0, w, hy + 2);
  for (let i = 0; i < 70; i++) circ(s, hash(i + 900) * w, hash(i + 1100) * hy * .95, .5 + hash(i + 1300) * 1.2, `rgba(255,255,255,${.3 + hash(i + 1500) * .5})`);
  const [mead, g] = layer(h - y0);
  g.translate(0, -y0);
  g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w + 8; x += 8) g.lineTo(x, hy - h * .035 - Math.sin(x / w * 7.3 + 1) * h * .025 - Math.abs(Math.sin(x / w * 13)) * h * .012);
  g.lineTo(w, h); g.fillStyle = '#16295e'; g.fill();
  const gg = g.createLinearGradient(0, hy, 0, h);
  gg.addColorStop(0, '#153c46'); gg.addColorStop(1, '#0a1c26');
  g.beginPath(); g.moveTo(0, h);
  for (let x = 0; x <= w + 8; x += 8) g.lineTo(x, hy + Math.sin(x / w * 4.1 + 2) * h * .012);
  g.lineTo(w, h); g.fillStyle = gg; g.fill();
  for (const [bx, k] of [[w * .03, 1], [w * .98, .8]]) {   // round bushes at both sides
    const r = Math.min(w, h) * .07 * k, by = hy + r * .2;
    circ(g, bx, by, r, '#123c36'); circ(g, bx - r * .8, by + r * .3, r * .7, '#0f332f'); circ(g, bx + r * .8, by + r * .25, r * .75, '#164640');
  }
  // grass tufts, more and bigger towards the front
  const n = Math.min(260, Math.round(w * (h - hy) / 2600));
  for (let i = 0; i < n; i++) {
    const k = Math.pow(hash(i + 300), .6), x = hash(i + 500) * w, y = hy + 8 + k * (h - hy - 8), z = .5 + k * 1.2, col = hash(i + 700) > .5 ? '#1f5446' : '#276650';
    for (const dx of [-3, 0, 3]) line(g, [x, y, x + dx * z * 1.6, y - (6 + hash(i + dx + 3) * 5) * z], col, 1.4 * z);
  }
  for (let i = 0; i < 14; i++) {   // small meadow flowers
    const k = hash(i + 800), x = hash(i + 820) * w, y = hy + 14 + k * (h - hy - 24), r = 1.6 + k * 2.4, col = ['#e9d8ff', '#ffe9a3', '#ffd0e6'][i % 3];
    line(g, [x, y + r * 3, x, y], '#276650', 1.2);
    for (let j = 0; j < 5; j++) circ(g, x + Math.cos(j * TAU / 5) * r, y + Math.sin(j * TAU / 5) * r, r * .75, col);
    circ(g, x, y, r * .6, '#ffd24a');
  }
  return fliesBg = { w, h, hy, y0, sky, mead };
}

scenes.flies = {
  enter() {
    const n = clamp(S.night, 1, 10);
    // Night 1 is a slow, open meadow. Later Nights bring a few more, quicker and shyer fireflies, deeper blinks
    // and higher star marks. `goals` are the points for the 1st, 2nd and 3rd star; one star is always earned.
    this.P = { count: n < 4 ? 5 : n < 8 ? 6 : 7, speed: 15 + 2.2 * n, shy: n < 3 ? 0 : Math.min(.55, .08 * (n - 2)), dim: .3 + .03 * n, gold: .15,
      moths: n < 3 ? 1 : n < 7 ? 2 : 3, goals: [Math.round(8 + n / 2), 17 + n, Math.round(30 + n * 1.6)] };
    Object.assign(this, { pts: 0, time: fliesTime, run: false, endT: 0, stars: 0, note: 0, lastT: -9, fill: 0, pulse: 0, tilt: 0,
      flies: [], moths: [], sparks: [], spawnT: 0, mothT: 2, met: false });
    this.hudEl = hud(() => go('hub'), `<span class="pill" id="pFlies">${ic('fliesFly', 26)}<b>0</b></span>`, true);
    const G = this.geo();
    this.jx = this.tx = (G.x0 + G.x1) / 2; this.jy = this.ty = lerp(G.y0, G.y1, .62);
    for (let i = 0; i < this.P.count; i++) this.spawn();
    this.leaves = [...Array(5)].map((_, i) => ({ x: rnd(V.w), y: rnd(V.h), ph: rnd(TAU), sp: rnd(12, 22), size: rnd(9, 13), col: ['#6fbf72', '#e0a050', '#c97a4a'][i % 3] }));
    owlSay(t('fl_intro'), { html: `<div class="pics">${ic('jar', 40)}${ic('fliesFly', 40)}<span class="pill">${ic('fliesGold', 34)}<b>×2</b></span></div>`,
      acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => { this.run = true; } }] });
  },
  // Layout from the viewport and the overlay: top bar, horizon, the play field, the corner jar (meter) and the player's jar size.
  geo() {
    const r = ui.getBoundingClientRect(), top = this.hudEl.getBoundingClientRect().bottom, m = Math.min(V.w, V.h), u = m / 400;
    const mh = clamp(m * .26, 84, 170), mw = mh * .6;
    return { u, s: clamp(u, .9, 1.6), top, hy: Math.round(top + (V.h - top) * (wide() ? .42 : .34)), x0: r.left + 22, x1: r.right - 22, y0: top + 16, y1: V.h - 22,
      mx: r.right - 14 - mw / 2, my: V.h - 14, mw, mh, ms: clamp(mh * .2, 18, 28), js: clamp(m * .1, 34, 64) };
  },
  inMeter(x, y, G) { return x > G.mx - G.mw / 2 - G.ms * 2.4 && y > G.my - G.mh * 1.5; },
  reach(G) { return G.js * .9 + 8 * G.s; },   // generous: small hands are not precise
  markY(i, G) { return G.my - G.mh * this.P.goals[i] / (this.P.goals[2] * 1.2); },
  // A new firefly lights up somewhere free: the best of a few random spots, away from the jar and from the others.
  spawn() {
    const G = this.geo();
    let best = null, far = -1;
    for (let i = 0; i < 14; i++) {
      const x = rnd(G.x0, G.x1), y = rnd(G.y0, G.y1);
      if (this.inMeter(x, y, G)) continue;
      const d = Math.min(Math.hypot(x - this.jx, y - this.jy), ...this.flies.map(f => Math.hypot(x - f.x, y - f.y) * 1.6));
      if (d > far) { far = d; best = { x, y }; }
    }
    if (!best) return;
    const gold = !this.flies.some(f => f.gold) && Math.random() < this.P.gold;
    this.flies.push({ ...best, a: rnd(TAU), ph: rnd(TAU), gold, born: V.t });
    if (gold && this.run) { tone(1568, .4, 'sine', .035); tone(2093, .5, 'sine', .03, .12); }   // a soft twinkle: a golden one is here
  },
  aim(x, y) { const G = this.geo(); this.tx = clamp(x, G.x0, G.x1); this.ty = clamp(y, G.y0, G.y1); },
  down(x, y) { this.aim(x, y); },
  move(x, y) { this.aim(x, y); },
  key(e) {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault();
    // one press moves the jar about its own size; a held key repeats, so the jar keeps gliding
    const st = this.geo().js;
    this.aim(d[0] ? this.jx + d[0] * st : this.tx, d[1] ? this.jy + d[1] * st : this.ty);
  },
  resize() { this.aim(this.tx, this.ty); },
  gather(i, G) {
    const f = this.flies.splice(i, 1)[0], before = this.pts;
    this.pts += f.gold ? 2 : 1;
    // the chime climbs while catches keep coming and starts low again after a pause
    this.note = V.t - this.lastT < 1.6 ? Math.min(this.note + 1, 9) : 0; this.lastT = V.t;
    fliesChime(this.note, f.gold);
    burst(f.x, f.y, f.gold ? 12 : 6, { speed: 80, g: 0, life: .6, size: f.gold ? 7 : 5, kind: f.gold ? 'star' : 'spark', colors: f.gold ? ['#ffd24a', '#fff6da'] : ['#e8ff9a', '#fff6da'] });
    // the light flies on into the corner jar; with reduced motion the jar simply fills
    if (!still()) { this.sparks.push({ x: f.x, y: f.y, t0: V.t, gold: f.gold }); if (f.gold) floatText(f.x, f.y - 16, '+2', '#ffd86b'); }
    this.spawnT = Math.max(this.spawnT, rnd(.5, 1));
    $('#pFlies b').textContent = this.pts;
    const k = this.P.goals.findIndex(v => before < v && this.pts >= v);
    // a new star wins over any other message (two notes at once would sit on top of each other)
    if (k >= 0) later(() => { sfx.sparkle(); ui.querySelectorAll('.toast').forEach(n => n.remove()); toast(t('fl_star')); burst(G.mx - G.mw / 2 - G.ms * .7, this.markY(k, G), 10, { kind: 'star', speed: 90, g: 0, size: 6, life: .8 }); }, 250);
  },
  finish() {
    this.run = false; this.time = 0; this.endT = V.t;
    const g = this.P.goals, stars = this.stars = this.pts >= g[2] ? 3 : this.pts >= g[1] ? 2 : 1;
    const gain = award('flies', stars);
    later(() => stationWin('flies', stars, gain), 900);
  },
  update(dt) {
    const G = this.geo(), P = this.P, ox = this.jx;
    // the jar glides after the finger, the mouse or the arrow keys
    const k = 1 - Math.exp(-dt * 12);
    this.jx += (this.tx - this.jx) * k; this.jy += (this.ty - this.jy) * k;
    if (dt) this.tilt = lerp(this.tilt, clamp((this.jx - ox) / dt / 900, -.3, .3), Math.min(1, dt * 8));
    if (this.run && (this.time -= dt) <= 0) this.finish();
    // fireflies wander slowly and turn back near the edges and near the corner jar
    const R = this.reach(G), shyR = R * 2.6, cx = (G.x0 + G.x1) / 2, cy = (G.y0 + G.y1) / 2;
    for (const f of this.flies) {
      const sp = P.speed * G.u * (f.gold ? 1.2 : 1);
      f.a += (Math.sin(V.t * .8 + f.ph * 5) + Math.sin(V.t * 1.7 + f.ph * 3)) * .9 * dt;
      if (f.x < G.x0 + 30 || f.x > G.x1 - 30 || f.y < G.y0 + 30 || f.y > G.y1 - 30 || this.inMeter(f.x, f.y, G)) {
        const turn = ((Math.atan2(cy - f.y, cx - f.x) - f.a) % TAU + TAU * 1.5) % TAU - Math.PI;
        f.a += clamp(turn, -2.4 * dt, 2.4 * dt);
      }
      let vx = Math.cos(f.a) * sp, vy = Math.sin(f.a) * sp * .8;
      // from Night 3 they are a little shy and drift away from a jar that comes close; the jar is always faster
      const dx = f.x - this.jx, dy = f.y - this.jy, d = Math.hypot(dx, dy) || 1;
      if (P.shy && this.run && d < shyR) { const q = P.shy * sp * 2 * (1 - d / shyR); vx += dx / d * q; vy += dy / d * q; }
      f.x = clamp(f.x + vx * dt, G.x0, G.x1); f.y = clamp(f.y + vy * dt, G.y0, G.y1);
    }
    if (this.run) {
      for (let i = this.flies.length - 1; i >= 0; i--) { const f = this.flies[i]; if (Math.hypot(f.x - this.jx, f.y - this.jy) < R + (f.gold ? 6 * G.s : 0)) this.gather(i, G); }
      if (this.flies.length < P.count && (this.spawnT -= dt) <= 0) { this.spawn(); this.spawnT = rnd(.35, .7); }
    }
    // sleepy moths drift across; they are friends and flutter aside when the jar comes near
    if ((this.mothT -= dt) <= 0) {
      this.mothT = rnd(6, 10);
      if (this.moths.length < P.moths) { const dir = pick([1, -1]); this.moths.push({ x: dir > 0 ? G.x0 - 50 : G.x1 + 50, y: rnd(G.y0 + 20, Math.max(G.y0 + 21, G.my - G.mh * 1.5)), dir, ph: rnd(TAU), kx: 0, ky: 0, dodge: 0 }); }
    }
    for (let i = this.moths.length - 1; i >= 0; i--) {
      const m = this.moths[i], dx = m.x - this.jx, dy = m.y - this.jy, d = Math.hypot(dx, dy) || 1, damp = Math.exp(-dt * 2.2);
      if (d < R + 26 * G.s && m.dodge <= 0) {
        m.kx = dx / d * 170 * G.u; m.ky = dy / d * 170 * G.u; m.dodge = .8;
        if (this.run) { noise(.16, .04, 700); tone(260, .25, 'sine', .03, 0, 390); if (!this.met && !$('.toast')) { this.met = true; toast(t('fl_moth')); } }
      }
      m.dodge -= dt; m.kx *= damp; m.ky *= damp;
      // moths stay above the corner jar's row, so none ever looks caught in it
      m.x += (m.dir * 26 * G.u + m.kx) * dt; m.y = clamp(m.y + (m.ky + Math.sin(V.t * 1.4 + m.ph) * 12 * G.u) * dt, G.y0, Math.max(G.y0, G.my - G.mh * 1.5));
      if (m.x < G.x0 - 80 || m.x > G.x1 + 80) this.moths.splice(i, 1);
    }
    if (!still()) for (const l of this.leaves) {
      l.y += l.sp * G.u * dt; l.x += Math.sin(V.t * .6 + l.ph) * 16 * G.u * dt;
      if (l.y > V.h + 20) { l.y = G.top - 20; l.x = rnd(V.w); }
    }
    for (let i = this.sparks.length - 1; i >= 0; i--) if (V.t - this.sparks[i].t0 > .6) { this.sparks.splice(i, 1); this.pulse = 1; }
    this.pulse = Math.max(0, this.pulse - dt * 2.5);
    const want = Math.min(1, this.pts / (P.goals[2] * 1.2));
    this.fill = still() ? want : lerp(this.fill, want, Math.min(1, dt * 4));
  },
  draw() {
    const G = this.geo(), t0 = V.t, calmNow = still(), bg = fliesBack(V.w, V.h, G.hy);
    ctx.drawImage(bg.sky, 0, 0, V.w, G.hy + 2);
    for (let i = 0; i < 8; i++) {
      const a = calmNow ? .6 : .5 + .5 * Math.sin(t0 * (1 + hash(i) * 2) + i);
      starPath(ctx, hash(i + 50) * V.w, G.top + hash(i + 90) * (G.hy - G.top) * .8, 2 + a * 2.5, 1, 4); ctx.fillStyle = `rgba(255,246,218,${a})`; ctx.fill();
    }
    // the timer: the moon crosses the sky, solid line behind it, dotted line ahead; when it sets behind the hills the round is over
    const k = 1 - this.time / fliesTime, cx = V.w / 2, rx = V.w * .42, mr = clamp(Math.min(V.w, V.h) * .05, 13, 30), ry = Math.max(20, G.hy - G.top - mr - 10), a = Math.PI * (1 + k);
    ctx.lineWidth = 2; ctx.setLineDash([3, 9]); ctx.strokeStyle = 'rgba(255,246,218,.35)'; ctx.beginPath(); ctx.ellipse(cx, G.hy, rx, ry, 0, a, TAU); ctx.stroke(); ctx.setLineDash([]);
    if (k > 0) { ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,233,163,.55)'; ctx.beginPath(); ctx.ellipse(cx, G.hy, rx, ry, 0, Math.PI, a); ctx.stroke(); }
    fliesMoon(ctx, cx + Math.cos(a) * rx, G.hy + Math.sin(a) * ry, mr);
    ctx.drawImage(bg.mead, 0, bg.y0, V.w, V.h - bg.y0);
    if (!calmNow) for (const l of this.leaves) {
      ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(Math.sin(t0 * .7 + l.ph) * .9); ctx.scale(l.size * G.s, l.size * G.s * .8);
      ctx.beginPath(); SHAPES.leaf(ctx); ctx.globalAlpha = .75; ctx.fillStyle = l.col; ctx.fill();
      ctx.globalAlpha = 1; line(ctx, [0, -.75, 0, .9], 'rgba(20,40,30,.55)', .12); ctx.restore();
    }
    for (const m of this.moths) {
      glow(ctx, m.x, m.y, 34 * G.s, '200,190,255', .14);
      fliesMoth(ctx, m.x, m.y, 1.05 * G.s, calmNow ? .8 : .55 + .45 * Math.abs(Math.sin(t0 * (m.dodge > 0 ? 13 : 3.5) + m.ph)), m.dir);
    }
    // fireflies blink softly (a steady light with reduced motion) and fade in when they appear; at the end they say goodnight
    const end = this.endT ? clamp(1 - (t0 - this.endT) / 1.2, 0, 1) : 1;
    for (const f of this.flies) {
      const al = Math.min(1, (t0 - f.born) / .6) * end, b = calmNow ? .85 : 1 - this.P.dim * (.5 + .5 * Math.sin(t0 * 2.3 + f.ph)), sz = G.s * (f.gold ? 1.55 : 1.15), dir = Math.cos(f.a) < 0 ? -1 : 1;
      if (al <= 0) continue;
      ctx.globalAlpha = al;
      if (f.gold) { starPath(ctx, f.x - 4 * sz * dir, f.y, 22 * sz, 1.6 * sz, 4); ctx.fillStyle = `rgba(255,240,180,${.4 * b})`; ctx.fill(); }   // sparkle rays
      glow(ctx, f.x - 3.5 * sz * dir, f.y, (f.gold ? 26 : 22) * sz, f.gold ? '255,206,90' : '214,255,140', .3 + .35 * b);
      fliesBug(ctx, f.x, f.y, sz, f.gold, b, calmNow ? .5 : .5 + .5 * Math.sin(t0 * 30 + f.ph), dir, clamp(Math.sin(f.a), -.6, .6) * .6);
      ctx.globalAlpha = 1;
    }
    this.drawMeter(G, t0, calmNow);
    for (const p of this.sparks) {   // caught lights on their way into the corner jar
      const q = ease(Math.min(1, (t0 - p.t0) / .6)), ex = G.mx, ey = G.my - G.mh, c1x = lerp(p.x, ex, .3), c1y = Math.min(p.y, ey) - 60 * G.u;
      const x = lerp(lerp(p.x, c1x, q), lerp(c1x, ex, q), q), y = lerp(lerp(p.y, c1y, q), lerp(c1y, ey, q), q);
      glow(ctx, x, y, 14 * G.s, p.gold ? '255,206,90' : '214,255,140', .6); circ(ctx, x, y, 2.4 * G.s, '#fffbe0');
    }
    ctx.save(); ctx.translate(this.jx, this.jy); if (!calmNow) ctx.rotate(this.tilt);
    jar(ctx, 0, -G.js * .1, G.js, calmNow ? 0 : t0, 1);
    ctx.restore();
  },
  // The corner jar fills with light and glows brighter with every catch. The three star marks are outline stars
  // until the light reaches them, then filled stars.
  drawMeter(G, t0, calmNow) {
    const { mx, my, mw, mh, ms } = G, x = mx - mw / 2, y = my - mh, rad = mw * .3;
    glow(ctx, mx, my - mh * .45, mw * (1.1 + 1.3 * this.fill + this.pulse * .3), '255,216,107', .1 + .4 * this.fill + this.pulse * .15);
    rr(ctx, x, y, mw, mh, rad); ctx.fillStyle = 'rgba(190,220,255,.12)'; ctx.fill();
    ctx.save(); rr(ctx, x, y, mw, mh, rad); ctx.clip();
    const fy = my - mh * this.fill, gr = ctx.createLinearGradient(0, fy, 0, my);
    gr.addColorStop(0, 'rgba(255,240,180,.95)'); gr.addColorStop(1, 'rgba(255,186,64,.95)');
    ctx.fillStyle = gr; ctx.fillRect(x, fy, mw, my - fy);
    for (let i = 0; i < Math.min(this.pts, 40); i++) {   // the gathered fireflies resting in the light
      const a = calmNow ? .9 : .6 + .4 * Math.sin(t0 * 2 + i);
      circ(ctx, x + mw * (.15 + .7 * hash(i + 70)), my - 4 - Math.max(0, mh * this.fill - 8) * hash(i + 170), 1.8, `rgba(255,255,255,${a})`);
    }
    ctx.restore();
    this.P.goals.forEach((v, i) => {
      const yy = this.markY(i, G), on = this.pts >= v;
      ctx.setLineDash(on ? [] : [4, 4]); line(ctx, [x + 4, yy, x + mw - 4, yy], on ? '#fff' : 'rgba(255,255,255,.6)', 2); ctx.setLineDash([]);
      drawIcon(ctx, on ? 'star' : 'star0', x - ms * .7, yy, ms);
    });
    rr(ctx, x, y, mw, mh, rad); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.stroke();
    ctx.save(); ctx.translate(mx + mw * .42, y - 3); ctx.rotate(.35); rr(ctx, -mw * .84, -mh * .13, mw * .84, mh * .13, 5); ctx.fillStyle = '#b98a4a'; ctx.fill(); ctx.restore();   // the lid stands open
  },
};
