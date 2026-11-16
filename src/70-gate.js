// ---------- Station two: Gate Check (two checks before trust: the password AND the badge) ----------
// The owl's eye: an almond eye with an owl's amber iris.
ICON.eyeI = c => {
  c.beginPath(); c.moveTo(-.95, 0); c.quadraticCurveTo(0, -.95, .95, 0); c.quadraticCurveTo(0, .95, -.95, 0); c.closePath();
  c.fillStyle = '#fff6da'; c.fill(); c.lineWidth = .12; c.strokeStyle = '#2a1c05'; c.stroke();
  circ(c, 0, 0, .36, '#f2a93b'); circ(c, 0, 0, .17, '#2a1c05'); circ(c, .12, -.13, .08, '#fff');
};
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
// A round that is left by the home button waits here until the player comes back: the same password, badge and queue,
// the same score. It belongs to its Night. A finished round starts afresh, and so does a practice round from the guide.
// ponytail: kept in memory only, so a reload starts a fresh round; put it into the save if that ever matters.
let gateKept = null;
scenes.gate = {
  enter() {
    const n = S.night, kept = !practice && gateKept && gateKept.n === n ? gateKept.round : null;
    if (!practice) gateKept = null;
    this.prac = !!practice;
    if (kept) Object.assign(this, kept);
    else {
      this.pass = shuffle([...GSYM]).slice(0, 3);
      this.badge = { shape: pick(SHAPE_KEYS), style: Math.random() * 4 | 0 };
      this.q = gateQueue(n, this.pass, this.badge);
      Object.assign(this, { i: 0, correct: 0, wrong: 0, let: 0, streak: 0 });
    }
    Object.assign(this, { state: 'in', at: V.t, noT: 0, cut: 0, run: false, won: false, why: '',
      patience: n >= 3 ? (15 - Math.min(n, 8) * .8) * (count('bell') ? 1.35 : 1) : 1e9 });
    hud(() => go('hub'), `<span class="pill" id="pGate">${ic('yes', 20)}<span><b>${this.correct}</b>/${this.q.length}</span></span>`);
    const lab = s => `<span class="lab">${ic(s, 34)}${esc(t(s))}</span>`;
    this.ref = add(`<div class="ref"><span class="lab">${esc(t('pass'))}</span>${this.pass.map(lab).join('')}<span class="sep"></span>
      <span class="lab">${ic(`badge:${this.badge.shape}:${this.badge.style}`, 40)}${esc(t('badge'))}</span></div>`);
    const b = add(`<div class="bar gatebtns"><button class="btn go" id="bIn">${ic('yes', 30)}${esc(t('letIn'))}</button>
      <button class="btn no" id="bOut">${ic('no', 30)}${esc(t('shoo'))}</button></div>`);
    $('#bIn', b).onclick = () => this.decide(true);
    $('#bOut', b).onclick = () => this.decide(false);
    // the owl's eye: a round button beside the reference card while there is an eye to use (added before the dialog, so it is inert
    // under it). It stands alone in the overlay, which lets taps through to the canvas: the button takes its own taps back.
    this.eyeB = S.eye > 0 ? add(`<button class="btn round gold" id="bEye" style="position:absolute;pointer-events:auto" aria-label="${esc(t('eye_btn'))}">${ic('eyeI', 34)}</button>`) : null;
    if (this.eyeB) { this.eyeB.onclick = () => this.eyeUse(); this.resize(); }
    owlSay(t('gateIntro'), { html: picsHtml([`badge:${this.badge.shape}:${this.badge.style}`, ...this.pass]), acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => { this.run = true; this.at = V.t; } }] });
  },
  // Leaving in the middle of a round keeps it (see gateKept); a visitor who has been answered is not asked again.
  exit() {
    const i = this.i + (this.state === 'out' ? 1 : 0);
    if (this.prac || this.cut || this.state === 'end' || i >= this.q.length) return;
    gateKept = { n: S.night, round: { pass: this.pass, badge: this.badge, q: this.q, i, correct: this.correct, wrong: this.wrong, let: this.let, streak: this.streak } };
  },
  key(e) { if (e.key === 'ArrowLeft') this.decide(true); if (e.key === 'ArrowRight') this.decide(false); },
  // What was wrong with a trickster, in the owl's words: the badge first, then the password. A word that differs is named:
  // the right one, and the one this visitor said.
  whyNot(v) {
    const out = [], b = v.badge, sorted = p => [...p].sort().join();
    if (!b) out.push(t('gateWhyNone'));
    else if (b.shape !== this.badge.shape) out.push(t('gateWhyShape'));
    else if (b.style !== this.badge.style) out.push(t('gateWhyStyle'));
    if (v.pass.length < this.pass.length) out.push(t('gateWhyShort'));
    else if (v.pass.join() !== this.pass.join()) {
      const j = v.pass.findIndex((p, i) => p !== this.pass[i]);
      if (sorted(v.pass) === sorted(this.pass)) out.push(t('gateWhyOrder'));
      else out.push(t('gateWhyWord', { w: t(this.pass[j]) }), t('gateWhySaid', { w: t(v.pass[j]) }));
    }
    return out.join(' ');
  },
  // One close look of the owl's at the visitor who waits: the wrong thing gets a ring (the badge first), a friend gets two ticks.
  // The owl only points; the Chief still decides. Between visitors a tap does nothing and costs nothing; a second tap repeats the words.
  eyeUse() {
    const v = this.q[this.i];
    if (!this.run || this.state !== 'ask' || S.eye < 1) return;
    if (!v.eye) {
      const same = k => v.badge && v.badge[k] === this.badge[k];
      v.eye = !same('shape') || !same('style') ? 'badge' : v.pass.join() !== this.pass.join() ? 'pass' : 'ok';
      S.eye--; save(); sfx.sparkle();
      if (!S.eye && this.eyeB) { this.eyeB.remove(); this.eyeB = null; }
    }
    say(t('eye_' + v.eye)); speak(t('eye_' + v.eye));
  },
  // The eye's button stands beside the reference card: under it in portrait, to its left in landscape. There it covers
  // neither the visitor nor the password bubble nor the two answers.
  resize() {
    if (!this.eyeB) return;
    const r = this.ref.getBoundingClientRect(), u = ui.getBoundingClientRect(), st = this.eyeB.style;
    if (wide()) { st.left = r.left - u.left - 60 + 'px'; st.top = r.top - u.top + 'px'; }
    else { st.left = r.right - u.left - 52 + 'px'; st.top = r.bottom - u.top + 8 + 'px'; }
  },
  decide(letIn) {
    if (!this.run || this.state !== 'ask') return;
    const v = this.q[this.i], ok = letIn === v.friend;
    v.letIn = letIn; this.state = 'out'; this.at = V.t;
    if (ok) {
      this.correct++; this.streak++;
      if (letIn) sfx.yes(); else { sfx.squawk(); pieCaught(); }   // a trickster turned away kindly counts towards a new friend
      burst(V.w / 2, this.gy() - 80, letIn ? 14 : 10, letIn ? { speed: 160 } : { kind: 'feather', color: '#8fd08a', speed: 150 });
      // Five right in a row earns a bonus star, once per Night: a reward for steady checking, not for speed.
      const bonus = this.streak === 5 && S.gateStar !== S.night;
      if (bonus) { S.gateStar = S.night; S.stars++; save(); refreshHud(); }
      if ([3, 5, 8].includes(this.streak)) { const n = this.streak; later(() => { toast(t('streak', { n }) + (bonus ? ' ' + t('bonus') : '')); sfx.sparkle(); }, 350); }
    } else {
      this.streak = 0; sfx.oops(); this.noT = V.t + 1.2;
      if (letIn) {
        this.let++; this.why = this.whyNot(v);
        if (this.let >= 2) { this.cut = V.t; later(() => { toast(t('alarm')); sfx.alarm(); }, 900); }
        else { const why = this.why; later(() => toast(why, 1800 + why.length * 45), 500); }   // the first slip is explained at once: what was wrong (a longer line stays longer)
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
    if (this.cut) { this.run = false; return stationFail('gate', t('soft') + ' ' + this.why + ' ' + t('gateTip')); }
    if (++this.i < this.q.length) { this.state = 'in'; this.at = V.t; return; }
    this.run = false; this.state = 'end';
    if (this.won) stationWin('gate', this.stars, this.gain);
    else stationFail('gate', t('soft') + ' ' + t(this.wrong > this.let ? 'gateTipFriend' : 'gateTip'));
  },
  gy() { return V.h - Math.max(118, V.h * .2); },
  update() {
    if (!this.run) return;
    const dt = V.t - this.at;
    if (this.state === 'in' && dt > .7) {
      this.state = 'ask'; this.at = V.t; sfx.pop();
      const v = this.q[this.i];
      if (!v.badge || v.puppy) later(() => speak(t(v.badge ? 'please' : 'lost'), 'pie'), 250);   // a magpie's own words are only chatter
    }
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
    // The waiting queue: always on screen, and always clear of the visitor in question (a magpie's tail reaches 63 units to
    // the right of its feet, a cap 52 to the left). Beside that visitor where the screen has the room. On a phone held
    // upright it has none: there the next ones wait on the slope behind, smaller and higher, on their way down to the gate.
    const wob = this.state === 'ask' && dt > this.patience && !still() ? Math.sin(t0 * 9) * .07 : 0;
    const q0 = cx + 68 * s, edge = land && V.h <= 520 ? this.ref.getBoundingClientRect().left - 6 : V.w - 8, beside = Math.min(32 * s / 52, (edge - q0) / 219);
    const hx = cx + 40 * s, hr = V.w + 12 - hx, hh = 46 * s, qh = clamp((V.w - 4 - hx) / 120, .34, .62);
    if (beside < .45) {   // the slope: the left flank of a round hill whose top lies just off the screen, with a rim of moonlight
      ctx.beginPath(); ctx.ellipse(V.w + 12, gy + 6, hr, hh + 4, 0, Math.PI, Math.PI * 1.5); ctx.lineTo(V.w + 12, gy + 6); ctx.closePath(); ctx.fillStyle = '#1a2c6e'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(V.w + 12, gy + 6, hr, hh + 4, 0, Math.PI, Math.PI * 1.5); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(150,180,255,.4)'; ctx.stroke();
    }
    const spot = beside >= .45 ? j => [q0 + 52 * j * beside, gy, beside]
      : j => { const x = hx + 50 * qh + (j - 1) * 40 * qh, k = (V.w + 12 - x) / hr; return [x, gy + 2 - hh * Math.sqrt(Math.max(0, 1 - k * k)), qh]; };
    this.queue = [];   // where the waiting ones stand; with `front` (the visitor in question) it is read by the layout audit
    for (let j = Math.min(3, this.q.length - 1 - this.i); j >= 1; j--) {
      const [qx, qy, qs] = spot(j);
      if (qx + 63 * qs > V.w - 2) continue;   // no room for this one: it is still on its way
      this.queue.push([qx, qy, qs, this.q[this.i + j]]);
      ctx.save(); ctx.translate(qx, qy); ctx.rotate(wob * .7); ctx.globalAlpha = .75;
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
    this.front = [x, gy, sc];
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
    this.bubble = [lx, top, bw, bh];   // read by the layout audit: the overlay must not cover it
    rr(ctx, lx, top, bw, bh, 14); ctx.fillStyle = '#fff6da'; ctx.fill(); poly(ctx, [x - 8, top + bh - 1, x + 8, top + bh - 1, x + 2, top + bh + 12], '#fff6da');
    ctx.font = `800 ${fs}px ui-rounded, "Segoe UI", Roboto, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#2a1c05';
    v.pass.forEach((p, j) => { const px = lx + 4 + j * col + col / 2; drawIcon(ctx, p, px, top + 8 + isz / 2, isz); ctx.fillText(t(p), px, top + isz + fs + 8, col - 4); });   // each word keeps its own column
    const extra = !v.badge ? t('lost') : v.puppy ? t('please') : '';
    if (extra) {
      const ew = ctx.measureText(extra).width + 20, ex = clamp(x + 30 * s, 6, V.w - ew - 6), ey = gy - 40 * s;
      rr(ctx, ex, ey, ew, fs + 14, 10); ctx.fillStyle = '#fff6da'; ctx.fill(); ctx.fillStyle = '#2a1c05'; ctx.textAlign = 'left'; ctx.fillText(extra, ex + 10, ey + fs + 4);
    }
    if (!v.eye) return;
    // The owl's close look: a gold ring round the wrong thing, or a tick on each when all is right; its words lie on the ground by the gate.
    const pu = still() ? 0 : Math.sin(t0 * 5) * 2, ring = () => { ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(7,13,42,.7)'; ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffd86b'; ctx.stroke(); };
    if (v.eye === 'badge') { ctx.beginPath(); ctx.arc(bx, by, bs * .62 + 8 + pu, 0, TAU); ring(); }
    else if (v.eye === 'pass') { rr(ctx, lx - 6 - pu, top - 6 - pu, bw + 12 + pu * 2, bh + 12 + pu * 2, 18); ring(); }
    else for (const [tx, ty] of [[bx + bs * .55, by - bs * .55], [lx + bw - 2, top + 2]]) { circ(ctx, tx, ty, 12, '#3fae5e'); drawIcon(ctx, 'yes', tx, ty, 16); }
    const msg = t('eye_' + v.eye), mh = fs + 14, mw = ctx.measureText(msg).width + mh + 14, mx = clamp(gx - 20 * g, 6, V.w - mw - 6);
    rr(ctx, mx, gy + 6, mw, mh, 10); ctx.fillStyle = '#fff6da'; ctx.fill();
    drawIcon(ctx, 'eyeI', mx + 5 + mh * .4, gy + 6 + mh / 2, mh * .8);
    ctx.fillStyle = '#2a1c05'; ctx.textAlign = 'left'; ctx.fillText(msg, mx + mh + 6, gy + fs + 11);
  },
};
