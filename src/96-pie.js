// ---------- Toy mode: Be the Magpie (the Gate Check seen from the other side: why badge and password stay secret) ----------
// The player spies on a forest friend at the gate, builds a fake (disguise, badge, password) and lets the owl or a grown-up
// check it. No stars and no moonbeams: the only prize is the "Fake badge" sticker, the first time ever the owl is fooled.
const PIE_SHOW = 4.2;   // seconds the friend shows the badge and says the password
const PIE_FONT = 'ui-rounded, "Segoe UI", Roboto, sans-serif';
// Disguises: 0 none, 1-4 the gate's small disguises, 5 and 6 a squirrel and a rabbit suit. Icons, names and the bits that fly off.
const PIE_DIS = ['pieHead:0', 'pieHead:1', 'pieHead:2', 'pieHead:3', 'pieHead:4', 'pieSuit:0', 'pieSuit:1'];
const PIE_DIS_NAME = ['pie_d0', 'k_d1', 'k_d2', 'k_d3', 'k_d4', 'k_d5', 'pie_d6'];
const PIE_BITS = [null, ['#62c26a', '#2e7a3a'], ['#8a5a2a'], ['#ff9ecb', '#ffd24a', '#6fdc95'], ['#3a52ad', '#ffd24a'], ['#c8763a', '#f3d9b0'], ['#cfc6c0', '#fff']];
const pieShapeName = k => t(k === 'drop' ? 'pie_drop' : k);   // the other four shapes share their word with a gate picture

// A magpie's tail peeking out of an animal suit (the visitor faces left, so the tail points right). Feet at (x, y).
function pieTail(c, x, y, k) {
  c.save(); c.translate(x, y); c.scale(k, k);
  poly(c, [10, -20, 58, -10, 55, -1, 10, -10], '#1a1a22'); line(c, [16, -14, 51, -6], '#3f6fe0', 2.5);
  c.restore();
}
// The player's magpie at (0, 0) like a gate visitor; `o.off` means the disguise or the suit has just come off.
function pieVisitor(c, dis, s, t, o = {}) {
  if (dis > 4 && !o.off) pieTail(c, 0, 0, s);
  gateVisitor(c, dis > 4 ? { costume: dis - 5 } : { disguise: dis }, s, t, o);
}
// The badge held up high in front of a visitor (the gate station's numbers). Returns its centre and size.
function pieBadge(c, x, gy, s, b) {
  const bs = 46 * s * .68, bx = x - 66 * s, by = gy - 77 * s;
  circ(c, bx, by, bs * .62, 'rgba(255,246,218,.95)');
  drawIcon(c, `badge:${b.shape}:${b.style}`, bx, by, bs);
  return [bx, by, bs];
}
// The password bubble's size for a visitor of scale s (as at the gate station).
function pieBubbleSize(s) {
  const isz = clamp(V.w * .1, 34, 30 * s), fs = clamp(isz * .32, 11, 15), col = isz + 24;
  return { isz, fs, col, bw: 3 * col + 8, bh: isz + fs + 18 };
}
// The password in a speech bubble whose bottom edge is at y: each picture with its word, in order.
// o.shown: how many are said so far; o.bar (0..1): time left, a bar along the bottom; o.lo / o.hi: the room to stay in.
// An empty place shows a dashed box with '?'. Returns the bubble and the centre of every picture.
function pieBubble(c, x, y, s, pass, o = {}) {
  const { isz, fs, col, bw, bh: bh0 } = pieBubbleSize(s), bar = o.bar !== undefined, bh = bh0 + (bar ? 16 : 0), top = y - bh;
  const lo = o.lo === undefined ? 6 : o.lo, hi = o.hi === undefined ? V.w - 6 : o.hi, lx = clamp(x - bw / 2, lo, Math.max(lo, hi - bw)), tx = clamp(x, lx + 16, lx + bw - 16);
  rr(c, lx, top, bw, bh, 14); c.fillStyle = '#fff6da'; c.fill(); poly(c, [tx - 8, y - 1, tx + 8, y - 1, tx + 2, y + 12], '#fff6da');
  c.font = `800 ${fs}px ${PIE_FONT}`; c.textAlign = 'center';
  const pts = pass.map((p, j) => {
    const px = lx + 4 + j * col + col / 2, py = top + 8 + isz / 2;
    if (j >= (o.shown === undefined ? 3 : o.shown)) return [px, py, p];   // not said yet
    if (p) { drawIcon(c, p, px, py, isz); c.fillStyle = '#2a1c05'; c.fillText(t(p), px, top + isz + fs + 8, col - 4); }
    else {
      rr(c, px - isz / 2, py - isz / 2, isz, isz, 9); c.setLineDash([5, 4]); c.lineWidth = 2.5; c.strokeStyle = '#b9a272'; c.stroke(); c.setLineDash([]);
      c.font = `900 ${isz * .55}px ${PIE_FONT}`; c.fillStyle = '#b9a272'; c.fillText('?', px, py + isz * .2); c.font = `800 ${fs}px ${PIE_FONT}`;
    }
    return [px, py, p];
  });
  if (bar) {   // the time left: a striped bar that shrinks towards the left
    const bx = lx + 10, by = top + bh - 16, w = bw - 20, k = clamp(o.bar, 0, 1);
    rr(c, bx, by, w, 10, 5); c.fillStyle = 'rgba(42,28,5,.18)'; c.fill();
    if (k > 0) { rr(c, bx, by, Math.max(10, w * k), 10, 5); c.fillStyle = '#f2a93b'; c.fill(); }
  }
  return { lx, top, bw, bh, col, isz, fs, pts };
}
// "Not the same": a thick ring with a small cross badge, so the mark is a shape and not only a colour.
function pieRing(c, x, y, r) {
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.lineWidth = 8; c.strokeStyle = '#fff'; c.stroke(); c.lineWidth = 4.5; c.strokeStyle = '#e0553f'; c.stroke();
  const q = r * .71; circ(c, x + q, y - q, 11, '#e0553f'); drawIcon(c, 'no', x + q, y - q, 12);
}
// A gold banner with a star, for "A perfect copy!".
function pieBanner(c, x, y, text, fs) {
  c.font = `900 ${fs}px ${PIE_FONT}`;
  const w = c.measureText(text).width + fs * 2.8, h = fs + 16, lx = clamp(x - w / 2, 6, V.w - w - 6);
  rr(c, lx, y - h / 2, w, h, h / 2); c.fillStyle = '#ffd86b'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#fff'; c.stroke();
  drawIcon(c, 'star', lx + fs * 1.2, y, fs * 1.4);
  c.fillStyle = '#3a2400'; c.textAlign = 'left'; c.fillText(text, lx + fs * 2.2, y + fs * .36);
}
// A magpie's line in a small bubble (the text is never spoken: the magpie only babbles).
function pieLine(c, x, y, text, fs) {
  c.font = `800 ${fs}px ${PIE_FONT}`;
  const w = c.measureText(text).width + 22, h = fs + 14, lx = clamp(x, 6, V.w - w - 6);
  rr(c, lx, y, w, h, 10); c.fillStyle = '#fff6da'; c.fill(); poly(c, [lx + 8, y + h - 1, lx + 20, y + h - 1, lx + 2, y + h + 10], '#fff6da');
  c.fillStyle = '#2a1c05'; c.textAlign = 'left'; c.fillText(text, lx + 11, y + fs + 4);
}
// A tiny rain cloud over a sulking magpie (the drops stand still when motion is reduced).
function pieCloud(c, x, y, s, t) {
  for (let i = 0; i < 3; i++) {
    const q = still() ? .4 : (t * 1.6 + i / 3) % 1, dx = (i - 1) * 8 * s;
    line(c, [x + dx, y + (10 + q * 14) * s, x + dx - 1.5 * s, y + (15 + q * 14) * s], '#7fd0ff', 2 * s);
  }
  for (const [dx, dy, r] of [[-9, 2, 8], [0, -3, 10], [10, 2, 8]]) circ(c, x + dx * s, y + dy * s, r * s, '#8a94a8');
}
// The owl's magnifying glass over one thing it checks; inside the glass that thing looks bigger.
function pieLens(c, x, y, r, name) {
  c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = 'rgba(255,246,218,.94)'; c.fill(); c.clip();
  drawIcon(c, name, x, y, r * 1.5); c.restore();
  line(c, [x + r * .74, y + r * .74, x + r * 1.5, y + r * 1.5], '#7a4e28', Math.max(6, r * .24));
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.lineWidth = 6; c.strokeStyle = '#7a4e28'; c.stroke(); c.lineWidth = 2; c.strokeStyle = '#fff'; c.stroke();
}
// The owl's eyes pop wide open, drawn over owl() with the same bob: the second look of a double take.
function pieWide(c, x, y, s, t) {
  c.save(); c.translate(x, y + (still() ? 0 : Math.sin(t * 2) * 1.5) * s); c.scale(s, s);
  for (const sx of [-15, 15]) {
    circ(c, sx, -60, 15, '#fff6da'); circ(c, sx + 1, -60, 3.6, '#2a1c05');
    c.beginPath(); c.arc(sx, -64, 19, -2.5, -.64); c.lineWidth = 4; c.lineCap = 'round'; c.strokeStyle = '#e8c89a'; c.stroke();
  }
  c.restore();
}
// The gate (the gate station's posts, arch and lantern) with two small doors; `open` 0..1 swings them back to the posts.
function pieGate(c, gx, gy, g, open) {
  const gh = 120 * g, half = 28 * g;
  if (open > 0) { glow(c, gx, gy - gh * .5, 80 * g, '255,216,107', .6 * open); c.fillStyle = `rgba(255,233,163,${.35 * open})`; c.fillRect(gx - half, gy - gh, half * 2, gh); }
  for (const d of [-1, 1]) {
    const w = half * (1 - .82 * open), hx = gx + d * half;   // the hinge sits at the post
    poly(c, [hx, gy, hx - d * w, gy, hx - d * w, gy - gh + 4 * g, hx, gy - gh + 4 * g], '#7a4e28');
    for (let i = 1; i < 3; i++) line(c, [hx - d * w * i / 3, gy - 3 * g, hx - d * w * i / 3, gy - gh + 8 * g], '#5e3a1e', 2 * g);
    circ(c, hx - d * w * .8, gy - gh * .45, 3 * g, '#ffd24a');   // a small brass knob
  }
  line(c, [gx - 34 * g, gy, gx - 34 * g, gy - gh], '#6b462a', 12 * g); line(c, [gx + 34 * g, gy, gx + 34 * g, gy - gh], '#6b462a', 12 * g);
  c.beginPath(); c.arc(gx, gy - gh, 34 * g, Math.PI, 0); c.lineWidth = 12 * g; c.strokeStyle = '#8a5a34'; c.stroke();
  drawIcon(c, 'lamp', gx, gy - gh - 6 * g, 34 * g);
}
// Button pictures: the magpie close up (the small disguises sit on head and chest), a whole animal suit with the magpie's tail,
// a selected mark, a crossed-out thing for the result, and a grown-up holding the phone.
ICON.pieHead = (c, d) => magpie(c, .68, 1.67, .034, 0, { dir: -1, disguise: +d, face: 'sly' });
ICON.pieSuit = (c, kind) => { pieTail(c, -.12, .8, .0165); critter(c, -.12, .8, .0165, 0, +kind); };
ICON.pieTick = c => { circ(c, 0, 0, .95, '#14703a'); c.scale(.6, .6); ICON.yes(c); };
ICON.pieNo = (c, ...n) => {
  c.save(); c.scale(.78, .78); ICON[n[0]](c, ...n.slice(1)); c.restore();
  c.beginPath(); c.arc(0, 0, .9, 0, TAU); c.lineWidth = .12; c.strokeStyle = '#e0553f'; c.stroke();
  circ(c, .6, -.6, .36, '#e0553f'); c.translate(.6, -.6); c.scale(.3, .3); ICON.no(c);
};
ICON.pieGrown = c => {
  circ(c, -.12, -.5, .3, '#f3d9b0'); ell(c, -.12, -.72, .31, .15, '#7a4e22');
  rr(c, -.55, -.16, .86, 1.1, .32); c.fillStyle = '#58a6ff'; c.fill();
  rr(c, .28, -.08, .36, .58, .08); c.fillStyle = '#22305e'; c.fill(); rr(c, .33, -.02, .26, .4, .04); c.fillStyle = '#7fd0ff'; c.fill();
};

scenes.pie = {
  enter(o = {}) {
    this.badge = { shape: pick(SHAPE_KEYS), style: Math.random() * 4 | 0 };
    this.pass = shuffle([...GSYM]).slice(0, 3);
    // the fake starts with a badge that is wrong in both ways: copying it is the player's own work
    this.fake = { dis: 0, shape: pick(SHAPE_KEYS.filter(k => k !== this.badge.shape)), style: (this.badge.style + 1 + (Math.random() * 3 | 0)) % 4, pass: [null, null, null] };
    Object.assign(this, { kind: Math.random() * 5 | 0, looks: 2, back: '', n: 0, ev: 0, over: false, letIn: false, panel: null, spyBar: null,
      line: null, mark: null, spots: null, result: null, popT: -9, pv: null });
    this.hudEl = add(`<div class="hud"><button class="btn round" id="pieHome" aria-label="${esc(t('home'))}">${ic('home', 28)}</button>
      <span class="pill">${ic('pie', 26)}<span>${esc(t('s_pie'))}</span></span><span class="sp"></span>
      <button class="btn" id="pieLook" style="display:none;padding:.2em .8em">${ic('scope', 28)}<b></b></button></div>`);
    $('#pieHome', this.hudEl).onclick = () => { sfx.click(); go('home'); };
    $('#pieLook', this.hudEl).onclick = () => this.look();
    this.to('intro');
    if (!o.again) this.said = false;   // the owl's remark about disguises comes once per visit; "Play again" keeps it said
    if (o.again) return this.spy();
    owlSay(t('pie_intro'), { html: picsHtml(['pie', 'scope']), acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => this.spy() }] });
  },
  to(ph) { this.ph = ph; this.at = V.t; this.ev = 0; },

  // ----- 1. Spy: the friend walks up, shows the badge, says the password and goes in through the gate -----
  spy() {
    this.to('spyIn'); this.n = 0;
    if (this.spyBar) this.spyBar.style.visibility = 'hidden';
    if (this.panel) this.panel.style.display = 'none';
    $('#pieLook').style.display = 'none';
  },
  // "Look again" works twice, from the spy screen and from the workshop; afterwards the player is back where they were.
  look() {
    if (this.looks <= 0 || (this.ph !== 'spied' && this.ph !== 'shop') || $('.veil')) return;
    this.looks--; this.back = this.ph; sfx.chirp();
    this.counts(); this.spy();
  },
  counts() {
    for (const b of [$('#pieAgain'), $('#pieLook')]) if (b) {
      $('b', b).textContent = '×' + this.looks; b.disabled = this.looks <= 0;
      b.setAttribute('aria-label', `${t('pie_again')}: ${this.looks}`);
    }
  },
  spied() {
    this.to('spied');
    if (!this.spyBar) {
      this.spyBar = add(`<div class="bar gatebtns"><button class="btn" id="pieAgain">${ic('scope', 30)}<span>${esc(t('pie_again'))}</span><b></b></button>
        <button class="btn go" id="pieMake">${ic('play', 30)}${esc(t('pie_make'))}</button></div>`);
      $('#pieAgain', this.spyBar).onclick = () => this.look();
      $('#pieMake', this.spyBar).onclick = () => this.shop();
    }
    this.spyBar.style.visibility = '';
    this.counts();
    $('#pieMake').focus({ preventScroll: true });
  },

  // ----- 2. Workshop: disguise, badge shape, badge pattern and the three password pictures, with a live preview -----
  shop() {
    const first = !this.panel;
    if (this.spyBar) { this.spyBar.remove(); this.spyBar = null; }
    this.to('shop');
    $('#pieLook').style.display = '';
    this.counts();
    if (!first) return void (this.panel.style.display = '');
    sfx.pop(); this.shopUI(); toast(t('pie_copy'));
    $('.sel', this.panel).focus({ preventScroll: true });   // keyboard players start at the first row
  },
  // The panel is built from the room there is: rows of at least 48 px buttons, under the preview in portrait,
  // beside it in landscape (wide enough for the eight pictures in one row). Built again after a resize.
  shopUI() {
    const f = document.activeElement, keep = f && this.panel && this.panel.contains(f) ? f.dataset.k || f.id : '';
    if (this.panel) this.panel.remove();
    const land = wide(), top = this.hudEl.getBoundingClientRect().bottom + 2, gap = 2, pad = 4;
    const fits = w => (w - 2 * pad + gap) / (48 + gap) | 0;   // how many 48 px buttons fit across
    let W = ui.getBoundingClientRect().width, h;
    if (land) {
      h = clamp(Math.floor((V.h - top - 2 * pad - 4 * gap) / 5), 48, 72);
      W = Math.min(W - 120, clamp(V.w * .55, 8 * 48 + 7 * gap + 2 * pad, 8 * h * 1.25 + 7 * gap + 2 * pad));
    } else {
      const lines = fits(W) >= 8 ? 5 : 6;
      h = clamp(Math.floor(((V.h - top) * .55 - 2 * pad - (lines - 1) * gap) / lines), 48, 64);
    }
    const isz = clamp(h - 16, 28, 54), pc = fits(W) >= 8 ? 8 : 4;
    const btn = (k, icon, label, cw) => `<button class="pal" data-k="${k}" aria-label="${esc(label)}" style="position:relative;min-height:0;padding:0">${ic(icon, Math.min(isz, cw - 12))}
      <canvas class="ic" data-i="pieTick" data-s="16" style="position:absolute;top:2px;right:2px;display:none"></canvas></button>`;
    const row = (n, label, items) => {
      const cw = Math.min(Math.floor((W - 2 * pad - (n - 1) * gap) / n), Math.round(h * 1.5));
      return `<div class="wears" role="group" aria-label="${esc(label)}" style="width:100%;gap:${gap}px;grid-template-columns:repeat(${n},${cw}px);grid-auto-rows:${h}px;justify-content:center">${items(cw).join('')}</div>`;
    };
    const f0 = this.fake, sw = Math.min(h + 8, Math.floor((W - 2 * pad) / 6));
    this.panel = add(`<div id="pieShop" style="position:absolute;${land ? `top:${top}px;right:0;width:${W}px;border-left` : 'left:0;right:0;border-top'}:2px solid var(--line);bottom:0;
      display:flex;flex-direction:column;justify-content:center;gap:${gap}px;padding:${pad}px ${pad}px calc(${pad}px + env(safe-area-inset-bottom));background:rgba(6,10,32,.88);pointer-events:auto">
      ${row(7, t('pie_dis'), cw => PIE_DIS.map((icon, d) => btn('d:' + d, icon, t(PIE_DIS_NAME[d]), cw)))}
      ${row(5, t('pie_shape'), cw => SHAPE_KEYS.map(k => btn('s:' + k, `badge:${k}:${f0.style}`, pieShapeName(k), cw)))}
      ${row(4, t('pie_style'), cw => STYLES.map((_, i) => btn('p:' + i, `badge:${f0.shape}:${i}`, t('pie_st' + i), cw)))}
      ${row(pc, t('pass'), cw => GSYM.map(p => btn('w:' + p, p, t(p), cw)))}
      <div style="display:flex;gap:${gap}px;height:${h}px;justify-content:center">
        ${[0, 1, 2].map(i => `<button class="pal" data-k="n:${i}" style="flex:none;width:${sw}px;min-width:0;min-height:0;padding:0;cursor:pointer"></button>`).join('')}
        <button class="btn gold" id="pieReady" style="flex:1 1 auto;max-width:14em;min-height:0;margin-left:${gap * 2}px">${ic('yes', 26)}${esc(t('pie_ready'))}</button>
      </div></div>`);
    this.isz = isz;
    this.panel.onclick = e => { const b = e.target.closest('[data-k]'); if (b) this.pick(b.dataset.k); };
    $('#pieReady', this.panel).onclick = () => this.ready();
    if (this.ph !== 'shop') this.panel.style.display = 'none';
    this.marks();
    const back = keep && (this.panel.querySelector(`[data-k="${keep}"]`) || $('#' + keep));
    if (back) back.focus({ preventScroll: true });
  },
  // Selected buttons turn gold and wear a tick; shape and pattern buttons show the badge they would make; slots show the password.
  marks() {
    const f = this.fake;
    this.panel.querySelectorAll('[data-k]').forEach(b => {
      const [kind, v] = b.dataset.k.split(':');
      if (kind === 'n') {
        const p = f.pass[v];
        b.innerHTML = p ? ic(p, this.isz) : `<b style="font-size:1.6em;opacity:.7">${+v + 1}</b>`;
        b.style.borderStyle = p ? '' : 'dashed';
        b.setAttribute('aria-label', `${t('pass')} ${+v + 1}: ${p ? t(p) : t('pie_empty')}`);
        return paintIcons(b);
      }
      if (kind === 'w') return;
      const on = kind === 'd' ? f.dis === +v : kind === 's' ? f.shape === v : f.style === +v;
      b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on);
      b.lastElementChild.style.display = on ? '' : 'none';
      const icon = kind === 's' ? `badge:${v}:${f.style}` : kind === 'p' ? `badge:${f.shape}:${v}` : '', el = b.firstElementChild;
      if (icon && el.dataset.i !== icon) { el.dataset.i = icon; paintIcons(el); }
    });
    const r = $('#pieReady', this.panel), full = !f.pass.includes(null);
    r.disabled = !full; r.classList.toggle('pulse', full);
  },
  // One tap in the workshop. Keys: d:disguise, s:shape, p:pattern, w:a picture (fills the first empty slot), n:a slot (empties it).
  pick(key) {
    if (this.ph !== 'shop') return;
    const [kind, v] = key.split(':'), f = this.fake;
    if (kind === 'd') { f.dis = +v; sfx.pop(); this.popT = V.t; if (this.pv && PIE_BITS[f.dis]) burst(...this.pv, 10, { speed: 130, colors: PIE_BITS[f.dis], size: 6 }); }
    if (kind === 's') { f.shape = v; sfx.click(); this.popT = V.t; }
    if (kind === 'p') { f.style = +v; sfx.click(); this.popT = V.t; }
    if (kind === 'w') {
      const i = f.pass.indexOf(null);
      if (i < 0) { sfx.empty(); return nudge(this.panel.querySelector('[data-k="n:0"]').parentNode); }   // full: empty a slot first
      f.pass[i] = v; sfx.tile(i); say(t(v));
    }
    if (kind === 'n') { if (!f.pass[v]) return; f.pass[v] = null; sfx.click(); }
    this.marks();
  },

  // ----- 3. Who checks? -----
  ready() {
    if (this.ph !== 'shop' || this.fake.pass.includes(null)) return;
    sfx.pop();
    owlSay(t('pie_who'), { acts: [
      { label: t('k_owl'), cls: 'big', icon: 'owlI', fn: () => this.check('owl') },
      { label: t('pie_grown'), cls: 'big', icon: 'pieGrown', fn: () => owlSay(t('pie_ask') + ' ' + t('gateIntro'), { html: picsHtml(['pieGrown', 'gateI']),
        acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => this.check('guard') }] }) },
    ] });
  },
  // ----- 4. The check: the owl, or a grown-up who sees exactly what a Gate Check player sees -----
  check(who) {
    if (this.panel) { this.panel.remove(); this.panel = null; }
    $('#pieLook').style.display = 'none';
    this.mark = null; this.line = null; this.spots = null;
    this.to(who === 'owl' ? 'owlIn' : 'guardIn');
    if (who === 'owl') return;
    const lab = s => `<span class="lab">${ic(s, 34)}${esc(t(s))}</span>`;
    add(`<div class="ref"><span class="lab">${esc(t('pass'))}</span>${this.pass.map(lab).join('')}<span class="sep"></span>
      <span class="lab">${ic(`badge:${this.badge.shape}:${this.badge.style}`, 40)}${esc(t('badge'))}</span></div>`);
    const b = add(`<div class="bar gatebtns"><button class="btn go" id="pieIn">${ic('yes', 30)}${esc(t('letIn'))}</button>
      <button class="btn no" id="pieOut">${ic('no', 30)}${esc(t('shoo'))}</button></div>`);
    $('#pieIn', b).onclick = () => this.decide(true);
    $('#pieOut', b).onclick = () => this.decide(false);
  },
  key(e) {
    if (e.key === 'ArrowLeft') this.decide(true);
    if (e.key === 'ArrowRight') this.decide(false);
  },
  // What differs between the fake and tonight's real badge and password (null: a perfect copy).
  diff() {
    const f = this.fake, d = { shape: f.shape !== this.badge.shape, style: f.style !== this.badge.style, pics: f.pass.map((p, i) => p !== this.pass[i]) };
    return d.shape || d.style || d.pics.some(Boolean) ? d : null;
  },
  // The owl looks closely: a drum roll that grows while the magnifying glass visits the badge and each picture.
  lookClose() {
    this.to('owlLook');
    for (let i = 0; i < 26; i++) noise(.05, .03 + i * .003, 230 + (i % 2) * 70, i * .075);
  },
  // The owl decides. Looks never matter: only the badge shape, its pattern and the whole password in order.
  verdict() {
    const d = this.diff(), f = this.fake;
    noise(.6, .12, 5200);   // a cymbal ends the drum roll
    if (!d) {
      this.to('owlFool');
      S.fooled = 1; const fresh = stick('d6'); save();   // saved at once: the player may leave during the celebration
      sfx.win(); toast(t('pie_welcome'));
      this.result = { text: t('pie_rFool') + ' ' + t('pie_lesson'), mood: 'cheer', html: this.truthHtml(null) + stickerHtml(fresh ? 'd6' : '') };
      return;
    }
    // the owl names the ONE thing that gave the fake away: first the shape, then the pattern, then the password
    const why = d.shape ? 'pie_whyShape' : d.style ? 'pie_whyStyle' : [...f.pass].sort().join() === [...this.pass].sort().join() ? 'pie_whyOrder' : 'pie_whyPass';
    this.to('owlNo');
    this.mark = { badge: d.shape || d.style, pics: d.shape || d.style ? [] : d.pics };
    sfx.oops(); toast(t(why));
    this.result = { text: t('pie_rCaught') + ' ' + t('pie_lesson'), mood: 'talk', html: this.truthHtml(d) };
  },
  // The grown-up decides; then the truth: every difference is circled, or the banner says it was a perfect copy.
  decide(letIn) {
    if (this.ph !== 'guardAsk') return;
    const d = this.diff();
    this.letIn = letIn; this.to('guardTruth');
    this.mark = d ? { badge: d.shape || d.style, pics: d.pics } : { perfect: true, pics: [] };
    if (letIn) { sfx.sparkle(); this.chatter('pie_mIn'); } else { this.pop(); this.chatter('pie_mSulk'); }
    this.result = { text: (d ? '' : t('pie_perfect') + ' ') + t(letIn ? 'pie_rPie' : 'pie_rGuard') + ' ' + t('pie_lesson'), mood: letIn ? 'talk' : 'cheer', html: this.truthHtml(d) };
  },
  // The disguise pops off in a puff of its own colours.
  pop() {
    const { gy, s, cx } = this.stage(), cols = PIE_BITS[this.fake.dis];
    sfx.puff();
    if (cols) burst(cx, gy - 60 * s, 18, { kind: 'feather', colors: cols, speed: 220, up: 140, size: 8 });
  },
  // A magpie line: a speech bubble on the canvas and squeaky gibberish, never spoken words.
  chatter(key) { const text = t(key); this.line = { text, t0: V.t }; speak(text, 'pie'); say(text); },
  // The fake in the result dialog: what was different wears a cross; a perfect copy gets a star.
  truthHtml(d) {
    const f = this.fake;
    if (!d) return `<div class="pics"><span class="pill">${ic('star', 24)}${esc(t('pie_perfect'))}</span></div>`;
    const bad = [d.shape || d.style, ...d.pics];
    return `<div class="pics">${[`badge:${f.shape}:${f.style}`, ...f.pass].map((n, i) => ic(bad[i] ? 'pieNo:' + n : n, 40)).join('')}</div>`;
  },
  // ----- 5. The result: who won, then the owl's lesson; play again with a new badge and password, or go home -----
  end() {
    this.over = true;
    const r = this.result;
    owlSay(r.text, { mood: r.mood, html: r.html, acts: [{ label: t('home'), icon: 'home', fn: () => go('home') },
      { label: t('pie_replay'), cls: 'go', icon: 'retry', fn: () => go('pie', { again: true }) }] });
  },

  update() {
    if (this.over) return;
    const k = V.t - this.at, ph = this.ph;
    if (ph === 'spyIn' && k > .9) { this.to('spyShow'); say(this.pass.map(p => t(p)).join(', ')); }
    else if (ph === 'spyShow') {
      // the friend says the pictures one by one, each with its own note; then the bar runs out
      const n = clamp(Math.floor((k - .2) / .35) + 1, 0, 3);
      if (n > this.n) { this.n = n; tone(PENTA[1 + n * 2], .25, 'triangle', .13); }
      if (k > PIE_SHOW) { this.to('spyOut'); sfx.chirp(); }
    }
    else if (ph === 'spyOut' && k > 1.25) this.back === 'shop' ? this.shop() : this.spied();
    else if (ph === 'owlIn' && k > .8) {
      // the first disguise of the visit gets one kind remark before the owl looks
      if (this.fake.dis && !this.said) { this.said = true; this.to('owlHmm'); toast(t('pie_looks')); } else this.lookClose();
    }
    else if (ph === 'owlHmm' && k > 3) this.lookClose();
    else if (ph === 'owlLook' && k > 2) this.verdict();
    else if (ph === 'owlFool') {
      if (this.ev === 0 && k > 1) { this.ev = 1; this.chatter('pie_mIn'); }
      else if (this.ev === 1 && k > (still() ? 1.8 : 2.4)) { this.ev = 2; sfx.boing(); }   // the double take
      else if (k > 4.2) this.end();
    }
    else if (ph === 'owlNo') {
      if (this.ev === 0 && k > 2.4) { this.ev = 1; this.pop(); this.chatter('pie_mSulk'); }
      else if (k > 4.4) this.end();
    }
    else if (ph === 'guardIn' && k > .7) { this.to('guardAsk'); sfx.pop(); }
    else if (ph === 'guardTruth' && k > 3) this.end();
  },
  resize() { if (this.panel) this.shopUI(); },

  // The gate scene's layout (the same numbers as the gate station, so the grown-up sees the same screen).
  stage() {
    const gy = V.h - Math.max(118, V.h * .2), s = clamp(V.h * .0031, .85, 2.2), land = wide(), g = land ? s : s * .58;
    return { gy, s, g, cx: land ? V.w / 2 : V.w * .64, gx: Math.max(40 * g, V.w * .11), gh: 120 * g };
  },
  // How far the gate doors stand open: for the friend going in, for a fooled owl, for a grown-up who lets the magpie in.
  door(k) {
    const ramp = (a, d) => still() ? (k >= a ? 1 : 0) : ease(clamp((k - a) / d, 0, 1)), ph = this.ph;
    if (ph === 'spyOut') return ramp(0, .3) * (1 - ramp(.95, .25));
    if (ph === 'owlFool') return ramp(.9, .35);
    if (ph === 'guardTruth' && this.letIn) return ramp(0, .35);
    return 0;
  },
  draw() {
    const t0 = V.t, ph = this.ph, k = t0 - this.at;
    drawSky(ctx, t0);
    if (ph === 'shop') return this.drawShop(t0);
    const { gy, s, g, cx, gx, gh } = this.stage();
    ctx.fillStyle = '#0c1740'; ctx.fillRect(0, gy, V.w, V.h);
    ell(ctx, cx, gy + 6, V.w * .6, 12, '#13235a');
    pieGate(ctx, gx, gy, g, this.door(k));
    this.drawOwl(t0, k, gx, gy, g * .62);
    zip(ctx, gx + 44 * g + Math.sin(t0) * 12, gy - gh - 70 * g + Math.sin(t0 * 2) * 6, Math.max(.7, g * .8), t0, 1);
    if (/^(intro|spy|spied)/.test(ph)) this.drawSpy(t0, k, gy, s, cx, gx, g);
    else this.drawCheck(t0, k, gy, s, cx, gx, g);
  },
  // The owl at the gate. Checking: thinking dots. Fooled: a double take (a turn, back, a turn, a jump, wide eyes and "?!").
  drawOwl(t0, k, gx, gy, os) {
    const ph = this.ph, q = k - 1.8;
    let mood = 'idle', flip = 1, jump = 0, wideEyes = false;
    if (ph === 'owlHmm' || ph === 'owlFool' && k < 1) mood = 'talk';
    if (ph === 'owlNo' && k < 2.4) mood = 'no';
    if (ph === 'guardTruth' && !this.letIn) mood = 'cheer';   // the guard won
    if (ph === 'owlFool' && q > 0) {
      if (!still()) { flip = q < .2 || q >= .4 && q < .6 ? -1 : 1; if (q > .6 && q < 1) jump = Math.sin((q - .6) / .4 * Math.PI) * 14; }
      wideEyes = q > (still() ? 0 : .6);
    }
    ctx.save(); ctx.translate(gx, gy - jump * os); ctx.scale(flip, 1);
    owl(ctx, 0, 0, os, t0, mood);
    if (wideEyes) pieWide(ctx, 0, 0, os, t0);
    ctx.restore();
    if (wideEyes) {
      ctx.font = `900 ${Math.max(18, 34 * os)}px ${PIE_FONT}`; ctx.textAlign = 'left'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(7,13,42,.85)'; ctx.fillStyle = '#ffd86b';
      ctx.strokeText('?!', gx + 30 * os, gy - 96 * os - jump * os); ctx.fillText('?!', gx + 30 * os, gy - 96 * os - jump * os);
    }
    if (ph === 'owlLook') for (let i = 0; i < 3; i++) if (k > i * .6) circ(ctx, gx + (26 + i * 11) * os, gy - 104 * os, Math.max(3, 4 * os), '#fff6da');
  },
  // Spying: the player's magpie peeks out of a bush at the right edge while the friend shows tonight's secrets.
  drawSpy(t0, k, gy, s, cx, gx, g) {
    const ph = this.ph, ms = s * .66, mx = V.w - 8 * ms;
    magpie(ctx, mx, gy, ms, t0, { dir: -1, face: ph === 'spied' ? 'smug' : 'sly' });
    for (const [dx, dy, r, col] of [[-14, -14, 25, '#123c36'], [13, -10, 24, '#164640'], [-36, -5, 18, '#0f332f'], [32, -4, 18, '#0f332f']]) circ(ctx, mx + dx * ms, gy + dy * ms, r * ms, col);
    if (!/^spy(In|Show|Out)$/.test(ph)) return;
    let x = cx, sc = s, a = 1;
    if (ph === 'spyIn') x = lerp(V.w + 60, cx, ease(Math.min(1, k / .9)));
    if (ph === 'spyOut') { const e = ease(Math.min(1, k / 1.1)); x = lerp(cx, gx, e); sc = lerp(s, g, e); a = Math.max(0, 1 - (k / 1.1) ** 2); }
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, gy); gateVisitor(ctx, { friend: true, kind: this.kind }, sc, t0); ctx.restore();
    if (ph !== 'spyShow') return;
    pieBadge(ctx, x, gy, s, this.badge);
    this.bubble = pieBubble(ctx, x, gy - 96 * s, s, this.pass, { shown: this.n, bar: 1 - k / PIE_SHOW });
  },
  // The player's magpie at the gate: walking up, being checked, strutting in or sulking off.
  drawCheck(t0, k, gy, s, cx, gx, g) {
    const ph = this.ph, f = this.fake;
    let x = cx, sc = s, a = 1, pose = 'stand', face = 'sly', dir = -1, off = false, show = true, cloud = false, hop = 0;
    if (ph === 'owlIn' || ph === 'guardIn') { x = lerp(V.w + 60, cx, ease(Math.min(1, k / .8))); pose = 'walk'; show = false; }
    if (ph === 'owlLook') face = 'sweat';
    if (ph === 'owlFool') {
      face = 'joy';
      if (k > 1) {   // a proud strut through the open gate, shrinking into the distance
        const q = Math.min(1, (k - 1) / 1.3), e = ease(q);
        x = lerp(cx, gx, e); sc = lerp(s, g * .8, e); a = 1 - q * q; pose = 'walk'; show = false; hop = still() ? 0 : Math.abs(Math.sin(t0 * 9)) * 6 * sc;
      }
    }
    if (ph === 'owlNo') {
      face = k < 2.4 ? 'shock' : 'sad';
      if (k >= 2.4) { off = true; pose = 'sulk'; dir = 1; show = false; cloud = true; x = lerp(cx, V.w + 90, Math.max(0, (k - 2.8) / 1.5) ** 2); }
    }
    if (ph === 'guardTruth') { if (this.letIn) face = 'joy'; else { off = true; pose = 'sulk'; face = 'sad'; } }   // no cloud: badge and bubble stay in view
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, gy - hop);
    pieVisitor(ctx, f.dis, sc, t0, { dir, pose, face, sad: face === 'sad', off });
    ctx.restore();
    if (cloud) pieCloud(ctx, x + 20 * s * dir, gy - 86 * s, s, t0);
    if (show) {
      const [bx, by, bs] = pieBadge(ctx, x, gy, s, f), B = pieBubble(ctx, x, gy - 96 * s, s, f.pass), m = this.mark;
      this.bubble = B;
      this.spots = [[bx, by, `badge:${f.shape}:${f.style}`], ...B.pts];
      if (m && (ph !== 'owlNo' || k < 2.4)) {
        if (m.badge) pieRing(ctx, bx, by, bs * .78);
        m.pics.forEach((bad, j) => { if (bad) pieRing(ctx, B.pts[j][0], B.top + B.bh / 2, B.col * .47); });
        if (m.perfect) pieBanner(ctx, B.lx + B.bw / 2, B.top, t('pie_perfect'), Math.max(13, B.fs + 1));
      }
    }
    if (this.line && t0 - this.line.t0 < 2.4) pieLine(ctx, x + 30 * s, gy - 40 * s, this.line.text, clamp(14 * s, 13, 20));
    if (ph === 'owlLook' && this.spots) {
      // the glass visits the badge, then each picture in order; with reduced motion it jumps instead of gliding
      const i = Math.min(3, Math.floor(k / .5)), to = this.spots[i], from = this.spots[Math.max(0, i - 1)], e = still() ? 1 : ease(Math.min(1, (k - i * .5) * 6));
      pieLens(ctx, lerp(from[0], to[0], e), lerp(from[1], to[1], e), Math.max(26, pieBubbleSize(s).isz * .8), to[2]);
    }
  },
  // The workshop preview: the fake as a visitor would stand at the gate, scaled into the room the panel leaves free.
  drawShop(t0) {
    if (!this.panel) return;
    const land = wide(), p = this.panel.getBoundingClientRect(), ay = this.hudEl.getBoundingClientRect().bottom, f = this.fake;
    const aw = land ? p.left : V.w, ah = (land ? V.h : p.top) - ay;
    const s = clamp(Math.min((aw - 16) / 176, (ah - 20) / 150), .7, 3), B = pieBubbleSize(s), up = 96 * s + B.bh + 12;
    const x = aw / 2 - (Math.max(64 * s, B.bw / 2) - Math.max(86 * s, B.bw / 2)) / 2, gy = ay + (ah - up - 10 * s) / 2 + up;
    glow(ctx, x - 10 * s, gy - 50 * s, 120 * s, '255,233,163', .22);   // a soft spotlight on the fake
    ell(ctx, x, gy + 3, 64 * s, 9 * s, 'rgba(7,13,42,.6)');
    const sc = s * (still() ? 1 : 1 + .07 * Math.max(0, 1 - (t0 - this.popT) * 5));   // a little bounce after each change
    ctx.save(); ctx.translate(x, gy); pieVisitor(ctx, f.dis, sc, t0, { face: 'smug' }); ctx.restore();
    pieBadge(ctx, x, gy, s, f);
    this.bubble = pieBubble(ctx, x, gy - 96 * s, s, f.pass, { lo: 6, hi: aw - 6 });
    this.pv = [x, gy - 50 * s];
    fireflies(ctx, t0, 6);
  },
};
