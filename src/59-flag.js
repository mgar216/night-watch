// ---------- The treehouse flag: the player paints it, and it flies beside the roof in every scene with the tree ----------
// Called by the other files:
//   flagDraw(c, t, k)      from drawTree, inside the tree's transform (tree units); k is the tree's scale on screen
//   flagTap(lx, ly, T)     from menuTap, tree units: a tap on the flag opens the painting screen; true when it did
//   scenes.flag            the painting screen: go('flag', { from })
// The painting is saved in S.flag (a short string; '' means the Night Watch's own flag).

// A painting is 12 x 8 cells, row by row, one digit per cell: the index of one of eight colours. On the palette every
// colour carries a mark of its own (moon, star, heart, flower, leaf, drop, diamond, snowflake) and its name for screen
// readers, so no colour is known by its hue alone.
const FLAG_C = ['#3048a8', '#ffd24a', '#e8503a', '#ff8fc8', '#4cc46a', '#7fd0ff', '#9b5fd6', '#fdf8ec'];
const FLAG_MK = [
  c => { c.beginPath(); SHAPES.moon(c); c.fill(); },
  c => { starPath(c, 0, .08, .95, .42, 5); c.fill(); },
  c => { c.beginPath(); c.moveTo(0, .85); c.bezierCurveTo(-1.2, 0, -.6, -1, 0, -.4); c.bezierCurveTo(.6, -1, 1.2, 0, 0, .85); c.fill(); },
  c => { for (let i = 0; i < 5; i++) circ(c, Math.cos(i * TAU / 5 - Math.PI / 2) * .52, Math.sin(i * TAU / 5 - Math.PI / 2) * .52, .38, c.fillStyle); },
  c => { c.beginPath(); SHAPES.leaf(c); c.fill(); },
  c => { c.beginPath(); SHAPES.drop(c); c.fill(); },
  c => poly(c, [0, -.95, .72, 0, 0, .95, -.72, 0], c.fillStyle),
  c => { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; line(c, [Math.cos(a) * .9, Math.sin(a) * .9, -Math.cos(a) * .9, -Math.sin(a) * .9], c.strokeStyle, .2); } },
];
// The Night Watch's own flag: a golden moon and star on night blue, with two little white stars.
const FLAG_OWN = ['000000000000', '000110001007', '001100011100', '011100111110', '011100011100', '001100010100', '000110000070', '000000000000'].join('');
// Anything else in the save (damaged, or typed in by hand) flies as the Night Watch's own flag.
const flagCode = () => typeof S.flag === 'string' && /^[0-7]{96}$/.test(S.flag) ? S.flag : FLAG_OWN;
// One note per column (pentatonic): a stroke along a row runs up or down a little scale.
const FLAG_NOTE = [392, 440, 523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];

// One quad of the cloth, without an array per call (the cloth is drawn in every frame).
const flagQuad = (c, x0, x1, ya, yb, yc, yd, col) => { c.beginPath(); c.moveTo(x0, ya); c.lineTo(x1, yb); c.lineTo(x1, yc); c.lineTo(x0, yd); c.closePath(); c.fillStyle = col; c.fill(); };
// The cloth from its corner at the pole (x, y), w x h. Held at the pole and freer towards its end, it waves as one slow sine
// with light and shade on the folds; it hangs flat when motion is reduced, and in icons.
function flagCloth(c, x, y, w, h, t, f = flagCode(), flat = still()) {
  const cw = w / 12, ch = h / 8, amp = flat ? 0 : h * .07, dy = i => amp * i / 12 * Math.sin(t * 3 - i * .8), ga = c.globalAlpha;
  c.beginPath();
  for (let i = 0; i <= 12; i++) c.lineTo(x + i * cw, y + dy(i));
  for (let i = 12; i >= 0; i--) c.lineTo(x + i * cw, y + h + dy(i));
  c.closePath(); c.lineJoin = 'round'; c.lineWidth = h * .06; c.strokeStyle = 'rgba(8,12,40,.75)'; c.stroke();
  for (let i = 0; i < 12; i++) {
    const a = dy(i), b = dy(i + 1), x0 = x + i * cw, x1 = x0 + cw * (i < 11 ? 1.15 : 1);   // a little overlap hides the seams
    for (let j = 0, e; j < 8; j = e) {   // one quad per run of cells of the same colour down the column
      for (e = j + 1; e < 8 && f[e * 12 + i] === f[j * 12 + i]; e++);
      const y0 = y + j * ch, y1 = y + e * ch + (e < 8 ? ch * .15 : 0);
      flagQuad(c, x0, x1, y0 + a, y0 + b, y1 + b, y1 + a, FLAG_C[f[j * 12 + i]]);
    }
    if (amp) { const sh = .22 * Math.cos(t * 3 - (i + .5) * .8) * (i + .5) / 12; c.globalAlpha = ga * Math.abs(sh); flagQuad(c, x0, x0 + cw, y + a, y + b, y + h + b, y + h + a, sh > 0 ? '#000' : '#fff'); c.globalAlpha = ga; }
  }
}
// On the tree: the pole stands on the right roof slope, the flag flies to its right. On a phone it grows (to the right
// and down, away from the items on the roof's spots) so that the painting can still be seen.
function flagDraw(c, t, k) {
  const s = Math.max(1, .5 / k);
  line(c, [612, 204, 612, 80], '#e8c984', 4 * s); circ(c, 612, 78, 5.5 * s, '#ffd24a');
  flagCloth(c, 614, 83, 90 * s, 60 * s, t);
}
function flagTap(lx, ly, T) {
  const s = Math.max(1, .5 / T.k), m = 24 / T.k;   // the flag's rectangle, grown to at least 48 CSS px
  if (Math.abs(lx - 614 - 45 * s) > Math.max(45 * s, m) || Math.abs(ly - 83 - 30 * s) > Math.max(30 * s, m)) return false;
  sfx.pop(); go('flag', { from: scene.id });
  return true;
}
ICON.flagI = (c, own) => { line(c, [-.8, .95, -.8, -.86], '#e8c984', .12); circ(c, -.8, -.88, .11, '#ffd24a'); flagCloth(c, -.75, -.78, 1.68, 1.12, 0, own ? FLAG_OWN : flagCode(), true); };
ICON.flagMk = (c, i) => { c.fillStyle = c.strokeStyle = [0, 2, 6].includes(+i) ? '#fff6da' : '#1b2550'; c.scale(.8, .8); FLAG_MK[+i](c); };

// ----- The painting screen: tap or drag across the cells; arrows and Enter or Space for the keyboard, 1 to 8 pick a colour -----
scenes.flag = {
  enter(o = {}) {
    Object.assign(this, { from: o.from || 'home', col: this.col >= 0 ? this.col : 2, drag: false, dirty: false, kb: false, cx: 0, cy: 0 });
    if (S.flag !== flagCode()) S.flag = '';   // a damaged value counts as no painting yet: the owl's first word comes as well
    this.bar = add(`<div class="hud"><button class="btn round" id="flagBack" aria-label="${esc(t('home'))}">${ic('home', 28)}</button>
      <span class="pill">${ic('flagI', 24)}<span>${esc(t('flagT'))}</span></span><span class="sp"></span>
      <button class="btn" id="flagNew">${ic('retry', 24)}<span>${esc(t('flag_new'))}</span></button></div>`);
    $('#flagBack', this.bar).onclick = () => { sfx.click(); go(this.from); };
    $('#flagNew', this.bar).onclick = () => { sfx.click(); this.ask(); };
    this.pal = add(`<div id="flagPal" role="group" aria-label="${esc(t('flag_cols'))}" style="position:absolute;display:grid;gap:6px;pointer-events:auto">${FLAG_C.map((col, i) =>
      `<button class="pal" data-c="${i}" aria-label="${esc(t('flag_c' + i))}" style="position:relative;min-width:0;min-height:0;max-width:none;padding:0;cursor:pointer;touch-action:manipulation;background:${col}">${ic('flagMk:' + i, 36)}<canvas class="ic" data-i="pieTick" data-s="18" style="position:absolute;top:2px;right:2px"></canvas></button>`).join('')}</div>`);
    this.pal.onclick = e => { const b = e.target.closest('[data-c]'); if (b) this.pick(+b.dataset.c); };
    // Enter or Space on a colour takes it and hands the keys to the painting: arrows move the cursor, Enter paints.
    this.pal.onkeydown = e => { const b = e.target.closest('[data-c]'); if (b && (e.key === 'Enter' || e.key === ' ')) { this.pick(+b.dataset.c); this.kb = true; b.blur(); e.preventDefault(); } };
    this.lay(); this.marks();
    if (!S.flag) owlSay(t('flag_hi'), { mood: 'cheer', html: picsHtml(['flagI']) });
  },
  exit() { this.up(); },
  resize() { this.lay(); },
  pick(i) { this.col = i; sfx.click(); this.marks(); },
  marks() {
    this.pal.querySelectorAll('[data-c]').forEach(b => {
      const on = +b.dataset.c === this.col;
      b.setAttribute('aria-pressed', on);
      b.style.borderColor = on ? '#fff' : ''; b.style.boxShadow = on ? '0 0 0 4px #ffd86b' : '';
      b.lastChild.style.visibility = on ? '' : 'hidden';
    });
  },
  // The grid takes all the room the screen allows: above the palette in portrait; beside it in landscape, where the
  // palette sits under the preview in a column on the right (within a thumb's reach on a phone held sideways).
  lay() {
    const u = ui.getBoundingClientRect(), top = this.bar.getBoundingClientRect().bottom, p = 8, g = 6, s = this.pal.style, land = wide();
    const cols = land || u.width - 2 * p < 8 * 56 + 7 * g ? 4 : 8, rows = 8 / cols;
    const bh = land ? clamp((V.h - top - 2 * p) / 5.8 | 0, 48, 64) : clamp(V.h * .085 | 0, 48, 64);
    const bw = land ? bh : Math.min(80, (u.width - 2 * p - (cols - 1) * g) / cols | 0), pw = cols * bw + (cols - 1) * g, ph = rows * bh + (rows - 1) * g;
    Object.assign(s, { gridTemplateColumns: `repeat(${cols},${bw}px)`, gridAutoRows: bh + 'px' });
    let c, x, y;
    if (land) {
      const H = V.h - top - 2 * p;
      c = Math.min(64, (u.width - 3 * p - pw) / 12 | 0, H / 8 | 0);
      x = u.left + (u.width - 12 * c - p - pw) / 2 | 0; y = top + p + (H - 8 * c) / 2 | 0;
      Object.assign(s, { left: x + 12 * c + p - u.left + 'px', top: y + 8 * c - ph + 'px', bottom: '' });
      this.P = [x + 12 * c + p, y, pw, 8 * c - ph - p];
    } else {
      Object.assign(s, { left: (u.width - pw) / 2 + 'px', top: '', bottom: `calc(${p}px + env(safe-area-inset-bottom))` });
      const H = this.pal.getBoundingClientRect().top - top - 3 * p;
      c = Math.min(64, (u.width - 2 * p) / 12 | 0, H * .7 / 8 | 0);
      const pv = Math.min(H - 8 * c, 6 * c);
      x = u.left + (u.width - 12 * c) / 2 | 0; y = top + 2 * p + (H - 8 * c - pv) / 2 + pv | 0;
      this.P = [x, y - p - pv, 12 * c, pv];
    }
    this.G = { x, y, c };
  },
  cell(x, y) { const { x: gx, y: gy, c } = this.G, i = Math.floor((x - gx) / c), j = Math.floor((y - gy) / c); return i >= 0 && i < 12 && j >= 0 && j < 8 ? j * 12 + i : -1; },
  // One cell takes the chosen colour (true when it changed). The save is written when the stroke ends.
  dab(n) {
    const f = flagCode();
    if (n < 0 || +f[n] === this.col) return false;
    S.flag = f.slice(0, n) + this.col + f.slice(n + 1);
    tone(FLAG_NOTE[n % 12], .1, 'sine', .12);
    return this.dirty = true;
  },
  // One finger paints: a second finger or a palm on the screen starts nothing and draws nothing.
  down(x, y, e) { const n = this.cell(x, y); if (n < 0 || this.drag) return; Object.assign(this, { drag: true, kb: false, lx: x, ly: y, pid: e && e.pointerId }); this.dab(n); },
  // A quick drag can jump over cells between two pointer events: the way between them is walked in thirds of a cell.
  move(x, y, e) {
    if (!this.drag || e && e.pointerId !== this.pid) return;
    const n = Math.ceil(Math.hypot(x - this.lx, y - this.ly) / (this.G.c / 3));
    for (let i = 1; i <= n; i++) this.dab(this.cell(lerp(this.lx, x, i / n), lerp(this.ly, y, i / n)));
    this.lx = x; this.ly = y;
  },
  // (the lift of another finger does not end the stroke; the keys and the way out call up() without an event)
  up(x, y, cancel, e) { if (e && this.drag && this.pid !== undefined && e.pointerId !== this.pid) return; this.drag = false; if (this.dirty) { this.dirty = false; save(); } },
  key(e) {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (d) { e.preventDefault(); this.kb = true; this.cx = clamp(this.cx + d[0], 0, 11); this.cy = clamp(this.cy + d[1], 0, 7); }
    else if (/^[1-8]$/.test(e.key)) this.pick(e.key - 1);
    else if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('button')) { e.preventDefault(); this.kb = true; this.dab(this.cy * 12 + this.cx); this.up(); }
  },
  // "Start again" asks first: a painting is a child's work, and one stray tap must not wipe it.
  ask() {
    owlSay(t('flag_ask'), { mood: 'idle', html: picsHtml(['flagI', 'play', 'flagI:1']), acts: [
      { label: t('flag_new'), icon: 'retry', fn: () => { S.flag = ''; save(); sfx.pop(); const { x, y, c } = this.G; burst(x + 6 * c, y + 4 * c, 24, { speed: 220, kind: 'star', size: 8 }); } },
      { label: t('flag_keep'), cls: 'go', icon: 'yes' }] });
  },
  draw() {
    const t0 = V.t, { x, y, c } = this.G, [px, py, pw, ph] = this.P, f = flagCode();
    drawSky(ctx, t0); fireflies(ctx, t0, 6);
    // the live preview: a window onto the real treehouse roof, with the flag as it flies there
    if (ph > 40) {
      const k = Math.min(pw / 260, ph / 180);
      ctx.save(); rr(ctx, px, py, pw, ph, 14); ctx.fillStyle = '#13225c'; ctx.fill(); ctx.clip();
      drawTree(ctx, { k, ox: px + pw / 2 - 650 * k, oy: py + ph / 2 - 140 * k }, t0);
      ctx.restore();
      rr(ctx, px, py, pw, ph, 14); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,216,107,.45)'; ctx.stroke();
    }
    // the painting: big cells with thin lines between them, and the keyboard's cursor
    rr(ctx, x - 6, y - 6, 12 * c + 12, 8 * c + 12, 12); ctx.fillStyle = 'rgba(6,10,32,.88)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,216,107,.45)'; ctx.stroke();
    for (let n = 0; n < 96; n++) { ctx.fillStyle = FLAG_C[f[n]]; ctx.fillRect(x + n % 12 * c, y + (n / 12 | 0) * c, c, c); }
    ctx.beginPath();
    for (let i = 1; i < 12; i++) { ctx.moveTo(x + i * c, y); ctx.lineTo(x + i * c, y + 8 * c); }
    for (let j = 1; j < 8; j++) { ctx.moveTo(x, y + j * c); ctx.lineTo(x + 12 * c, y + j * c); }
    ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(6,10,32,.45)'; ctx.stroke();
    if (this.kb) {
      const qx = x + this.cx * c + 2, qy = y + this.cy * c + 2;
      ctx.lineWidth = 6; ctx.strokeStyle = '#0b1437'; ctx.strokeRect(qx, qy, c - 4, c - 4); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.strokeRect(qx, qy, c - 4, c - 4);
    }
  },
};
