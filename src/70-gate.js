// ---------- Station two: Gate Check (two checks before trust: the password AND the badge) ----------
const GSYM = ['moon', 'berry', 'star', 'leaf', 'acorn', 'mushroom', 'feather', 'flower'];
// Build tonight's queue. Friends always have both right; every trickster has at least one thing wrong.
function gateQueue(n, pass, badge) {
  const total = Math.min(5 + n, 10), bad = Math.max(2, Math.round(total * .45));
  const kinds = ['shape', 'pic', 'both'].concat(n >= 3 ? ['order', 'style'] : [], n >= 4 ? ['short'] : [], n >= 5 ? ['lost'] : []);
  // From Night 4 some tricksters come inside a full forest-animal costume. Looks stop helping: only badge and password decide.
  const costumes = n < 4 ? 0 : n < 6 ? 1 : n < 8 ? 2 : 3;
  const q = [];
  for (let i = 0; i < total; i++) {
    const v = { friend: i >= bad, pass: [...pass], badge: { ...badge }, kind: Math.random() * (n >= 4 ? 5 : 4) | 0 };
    if (!v.friend) {
      const err = i < kinds.length && n >= 3 ? kinds[kinds.length - 1 - i] : pick(kinds);
      v.disguise = 1 + (Math.random() * Math.min(n, 4) | 0);
      v.puppy = n >= 4 && i === 0;                                  // the very polite one keeps his magpie face
      if (i >= 1 && i <= costumes) v.costume = Math.random() * 4 | 0;
      if (err === 'shape' || err === 'both') v.badge.shape = pick(SHAPE_KEYS.filter(s => s !== badge.shape));
      if (err === 'pic' || err === 'both') v.pass[Math.random() * 3 | 0] = pick(GSYM.filter(s => !pass.includes(s)));
      if (err === 'order') { const a = Math.random() * 3 | 0, b = (a + 1) % 3; [v.pass[a], v.pass[b]] = [v.pass[b], v.pass[a]]; }
      if (err === 'style') v.badge.style = (badge.style + 1 + (Math.random() * 3 | 0)) % 4;
      if (err === 'short') v.pass.pop();
      if (err === 'lost') v.badge = null;
    }
    q.push(v);
  }
  shuffle(q);
  if (n === 1) q.unshift(...q.splice(q.findIndex(v => v.friend), 1));   // the first Night opens with a friend
  return q;
}
// One visitor at (0, 0): a forest friend, a magpie in a small disguise, or a magpie hidden in an animal costume.
// `off` means the disguise or costume has just come off.
function gateVisitor(c, v, s, t, o = {}) {
  if (v.friend || v.costume !== undefined && !o.off) return critter(c, 0, 0, s, t, v.friend ? v.kind : v.costume, o.sad);
  magpie(c, 0, 0, s, t, { dir: o.dir || -1, pose: o.pose, face: o.face, disguise: o.off ? 0 : v.disguise });
}
scenes.gate = {
  enter() {
    const n = S.night;
    this.pass = shuffle([...GSYM]).slice(0, 3);
    this.badge = { shape: pick(SHAPE_KEYS), style: Math.random() * 4 | 0 };
    this.q = gateQueue(n, this.pass, this.badge);
    Object.assign(this, { i: 0, state: 'in', at: V.t, correct: 0, wrong: 0, let: 0, streak: 0, noT: 0, cut: 0, run: false, won: false,
      patience: n >= 3 ? (15 - Math.min(n, 8) * .8) * (count('bell') ? 1.35 : 1) : 1e9 });
    hud(() => go('hub'), `<span class="pill" id="pGate">${ic('yes', 20)}<span><b>0</b>/${this.q.length}</span></span>`);
    const lab = s => `<span class="lab">${ic(s, 34)}${esc(t(s))}</span>`;
    add(`<div class="ref"><span class="lab">${esc(t('pass'))}</span>${this.pass.map(lab).join('')}<span class="sep"></span>
      <span class="lab">${ic(`badge:${this.badge.shape}:${this.badge.style}`, 40)}${esc(t('badge'))}</span></div>`);
    const b = add(`<div class="bar gatebtns"><button class="btn go" id="bIn">${ic('yes', 30)}${esc(t('letIn'))}</button>
      <button class="btn no" id="bOut">${ic('no', 30)}${esc(t('shoo'))}</button></div>`);
    $('#bIn', b).onclick = () => this.decide(true);
    $('#bOut', b).onclick = () => this.decide(false);
    owlSay(t('gateIntro'), { html: picsHtml([`badge:${this.badge.shape}:${this.badge.style}`, ...this.pass]), acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => { this.run = true; this.at = V.t; } }] });
  },
  key(e) { if (e.key === 'ArrowLeft') this.decide(true); if (e.key === 'ArrowRight') this.decide(false); },
  decide(letIn) {
    if (!this.run || this.state !== 'ask') return;
    const v = this.q[this.i], ok = letIn === v.friend;
    v.letIn = letIn; this.state = 'out'; this.at = V.t;
    if (ok) {
      this.correct++; this.streak++;
      letIn ? sfx.yes() : sfx.squawk();
      burst(V.w / 2, this.gy() - 80, letIn ? 14 : 10, letIn ? { speed: 160 } : { kind: 'feather', color: '#8fd08a', speed: 150 });
      // Five right in a row earns a bonus star, once per Night: a reward for steady checking, not for speed.
      const bonus = this.streak === 5 && S.gateStar !== S.night;
      if (bonus) { S.gateStar = S.night; S.stars++; save(); refreshHud(); }
      if ([3, 5, 8].includes(this.streak)) { const n = this.streak; later(() => { toast(t('streak', { n }) + (bonus ? ' ' + t('bonus') : '')); sfx.sparkle(); }, 350); }
    } else {
      this.streak = 0; sfx.oops(); this.noT = V.t + 1.2;
      if (letIn) {
        this.let++;
        if (this.let >= 2) { this.cut = V.t; later(() => { toast(t('alarm')); sfx.alarm(); }, 900); }
        else later(() => toast(t('gateTip')), 500);   // the first slip gets its tip at once
      } else { this.wrong++; later(() => toast(t('gateOops')), 200); }
    }
    $('#pGate b').textContent = this.correct;
    // The result is settled and saved with the last decision; the dialog follows after the visitor has left.
    if (this.i === this.q.length - 1 && !this.cut) {
      const N = this.q.length;
      this.won = this.correct >= Math.ceil(N * .8);
      if (this.won) { this.stars = this.correct === N ? 3 : this.let === 0 ? 2 : 1; this.gain = award('gate', this.stars); }
    }
  },
  next() {
    if (this.cut) { this.run = false; return stationFail('gate', t('soft') + ' ' + t('gateTip')); }
    if (++this.i < this.q.length) { this.state = 'in'; this.at = V.t; return; }
    this.run = false; this.state = 'end';
    if (this.won) stationWin('gate', this.stars, this.gain);
    else stationFail('gate', t('soft') + ' ' + t(this.wrong > this.let ? 'gateTipFriend' : 'gateTip'));
  },
  gy() { return V.h - Math.max(118, V.h * .2); },
  update() {
    if (!this.run) return;
    const dt = V.t - this.at;
    if (this.state === 'in' && dt > .7) { this.state = 'ask'; this.at = V.t; sfx.pop(); }
    else if (this.state === 'out' && dt > (this.cut ? 3 : 1.2)) this.next();
  },
  draw() {
    const t0 = V.t, gy = this.gy(), s = clamp(V.h * .0031, .85, 2.2), land = wide(), cx = land ? V.w / 2 : V.w * .64, dt = t0 - this.at, v = this.q[this.i];
    drawSky(ctx, t0);
    ctx.fillStyle = '#0c1740'; ctx.fillRect(0, gy, V.w, V.h);
    ell(ctx, cx, gy + 6, V.w * .6, 12, '#13235a');
    // the gate: two posts, an arch, a lantern (and the bell when the player has placed one)
    const g = land ? s : s * .58, gx = Math.max(40 * g, V.w * .11), gh = 120 * g;
    line(ctx, [gx - 34 * g, gy, gx - 34 * g, gy - gh], '#6b462a', 12 * g); line(ctx, [gx + 34 * g, gy, gx + 34 * g, gy - gh], '#6b462a', 12 * g);
    ctx.beginPath(); ctx.arc(gx, gy - gh, 34 * g, Math.PI, 0); ctx.lineWidth = 12 * g; ctx.strokeStyle = '#8a5a34'; ctx.stroke();
    drawIcon(ctx, 'lamp', gx, gy - gh - 6 * g, 34 * g);
    if (count('bell')) drawIcon(ctx, 'bell', gx + 52 * g, gy - gh + 10 * g, 28 * g);
    owl(ctx, gx, gy, g * .62, t0, t0 < this.noT ? 'no' : 'idle');
    zip(ctx, gx + 44 * g + (this.cut ? Math.sin(t0 * 14) * 30 : Math.sin(t0) * 12), gy - gh - 70 * g + Math.sin(t0 * 2) * 6, Math.max(.7, g * .8), t0, 1);
    if (this.cut) jar(ctx, gx + 62 * g, gy - 14 * g, 15 * g, t0, 1);   // the jar the trickster is after, just outside the gate
    // the waiting queue: always on screen, between the visitor and the right edge
    const wob = this.state === 'ask' && dt > this.patience && !still() ? Math.sin(t0 * 9) * .07 : 0;
    const step = Math.min((V.w - 8 - (cx + 30 * s)) / 3, 32 * s), qs = step / 52;
    for (let j = Math.min(3, this.q.length - 1 - this.i); j >= 1; j--) {
      ctx.save(); ctx.translate(cx + 30 * s + (j - .5) * step, gy); ctx.rotate(wob * .7); ctx.globalAlpha = .75;
      gateVisitor(ctx, this.q[this.i + j], qs, t0 + j);
      ctx.restore();
    }
    if (!v || this.state === 'end') return;
    let x = cx, sc = s, face = v.puppy ? 'puppy' : 'sly', pose = 'stand', sad = false, alpha = 1, dir = -1;
    if (this.state === 'in') { x = lerp(V.w + 60, cx, ease(Math.min(1, dt / .7))); pose = 'walk'; }
    if (this.state === 'out') {
      const k = Math.min(1, dt / 1.1);
      if (v.letIn) {
        // going in through the gate, shrinking to the gate's own scale; a second trickster tiptoes to the jar instead
        const kk = ease(Math.min(1, dt / (this.cut ? 2.4 : 1.1)));
        x = lerp(cx, this.cut ? gx + 104 * g : gx, kk); sc = lerp(s, g, kk);
        pose = v.friend ? 'walk' : 'sneak'; face = 'smug'; alpha = this.cut ? 1 : 1 - k * k;
      } else { x = lerp(cx, V.w + 80, k * k); pose = 'sulk'; face = 'sad'; sad = true; dir = 1; }
    }
    // a shooed trickster loses the disguise at once; one who slipped in drops the costume a moment later
    const off = this.state === 'out' && (v.letIn ? v.costume !== undefined && dt > .3 : dt > .15);
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, gy); ctx.rotate(this.state === 'ask' ? wob : 0);
    gateVisitor(ctx, v, sc, t0, { dir, pose, face, sad, off });
    ctx.restore();
    if (this.state !== 'ask') return;
    // the badge is held up high and in front, clear of beak and whiskers; the password is spoken in pictures plus words
    const bs = 46 * s * .68, bx = x - 66 * s, by = gy - 77 * s;
    circ(ctx, bx, by, bs * .62, 'rgba(255,246,218,.95)');
    if (v.badge) drawIcon(ctx, `badge:${v.badge.shape}:${v.badge.style}`, bx, by, bs);
    else { ctx.setLineDash([5, 5]); ctx.lineWidth = 3; ctx.strokeStyle = '#8a7a5a'; ctx.beginPath(); ctx.arc(bx, by, bs * .4, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    const isz = clamp(V.w * .1, 34, 30 * s), fs = clamp(isz * .32, 11, 15), n = v.pass.length, col = isz + 24, bw = n * col + 8, bh = isz + fs + 18, top = gy - 96 * s - bh;
    const lx = clamp(x - bw / 2, 6, V.w - bw - 6);
    rr(ctx, lx, top, bw, bh, 14); ctx.fillStyle = '#fff6da'; ctx.fill(); poly(ctx, [x - 8, top + bh - 1, x + 8, top + bh - 1, x + 2, top + bh + 12], '#fff6da');
    ctx.font = `800 ${fs}px ui-rounded, "Segoe UI", Roboto, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#2a1c05';
    v.pass.forEach((p, j) => { const px = lx + 4 + j * col + col / 2; drawIcon(ctx, p, px, top + 8 + isz / 2, isz); ctx.fillText(t(p), px, top + isz + fs + 8, col - 4); });   // each word keeps its own column
    const extra = !v.badge ? t('lost') : v.puppy ? t('please') : '';
    if (extra) {
      const ew = ctx.measureText(extra).width + 20, ex = clamp(x + 30 * s, 6, V.w - ew - 6), ey = gy - 40 * s;
      rr(ctx, ex, ey, ew, fs + 14, 10); ctx.fillStyle = '#fff6da'; ctx.fill(); ctx.fillStyle = '#2a1c05'; ctx.textAlign = 'left'; ctx.fillText(extra, ex + 10, ey + fs + 4);
    }
  },
};
