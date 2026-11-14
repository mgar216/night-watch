// ---------- Extra station: Secret Code (a key turns code shapes into pictures; from Night 5 the key is a ring) ----------
// Code shapes differ in outline (ring, hourglass, zigzag, box, spiral, waves, dots, arches); the ink colour is only a second cue.
const CODE_INK = ['#6b3fd1', '#0f7f8c', '#c0392b', '#2c6fbb', '#b8650a', '#2e8b3a', '#a3317a', '#4a4a5e'];
const CODE_GLYPH = [
  (c, k) => { c.beginPath(); c.arc(0, 0, .72, 0, TAU); c.stroke(); circ(c, 0, 0, .24, k); },
  (c, k) => { poly(c, [-.72, -.85, .72, -.85, 0, 0], k); poly(c, [-.72, .85, .72, .85, 0, 0], k); },
  c => { c.beginPath(); [-.88, .42, -.44, -.42, 0, .42, .44, -.42, .88, .42].forEach((v, i, a) => i % 2 || c.lineTo(v, a[i + 1])); c.stroke(); },
  c => { c.strokeRect(-.72, -.72, 1.44, 1.44); c.beginPath(); c.moveTo(-.36, -.36); c.lineTo(.36, .36); c.moveTo(.36, -.36); c.lineTo(-.36, .36); c.stroke(); },
  c => { c.beginPath(); for (let a = 0; a < 10.6; a += .2) c.lineTo(Math.cos(a) * (.06 + a * .078), Math.sin(a) * (.06 + a * .078)); c.stroke(); },
  c => { for (const y of [-.34, .34]) { c.beginPath(); for (let x = -.88; x < .9; x += .04) c.lineTo(x, y + Math.sin(x * 5.4) * .2); c.stroke(); } },
  (c, k) => { circ(c, 0, -.46, .26, k); circ(c, -.52, .44, .26, k); circ(c, .52, .44, .26, k); },
  c => { for (const r of [.84, .42]) { c.beginPath(); c.arc(0, .44, r, Math.PI, 0); c.stroke(); } },
];
// A code chip: the shape in ink on a cream paper square. As an icon, `ic('code:3')` also works in dialogs.
ICON.code = (c, i) => {
  rr(c, -.92, -.92, 1.84, 1.84, .32); c.fillStyle = '#fff6da'; c.fill(); c.lineWidth = .07; c.strokeStyle = '#c9b27a'; c.stroke();
  const k = CODE_INK[+i];
  c.save(); c.scale(.66, .66); c.strokeStyle = k; c.lineWidth = .26; c.lineCap = c.lineJoin = 'round'; CODE_GLYPH[+i](c, k); c.restore();
};
// The note counter in the top bar: a small coded note.
ICON.codeNote = c => {
  rr(c, -.88, -.66, 1.76, 1.32, .16); c.fillStyle = '#fff6da'; c.fill(); poly(c, [.42, -.66, .88, -.66, .88, -.2], '#d9c48f');
  line(c, [-.6, -.05, -.32, -.38, -.04, -.05, .24, -.38], '#6b3fd1', .14);
  circ(c, -.45, .36, .12, '#c0392b'); circ(c, 0, .36, .12, '#0f7f8c'); circ(c, .45, .36, .12, '#2c6fbb');
};
// Pictures that look alike when small never share a key.
const CODE_TWINS = { moon: 'banana', banana: 'moon', leaf: 'feather', feather: 'leaf', dragon: 'frog', frog: 'dragon', cake: 'drum', drum: 'cake' };
function codePics(k) {
  const out = [];
  for (const p of shuffle([...GSYM, ...FWORDS])) if (out.length < k && !out.includes(CODE_TWINS[p])) out.push(p);
  return out;
}
// Tonight's plan: notes grow from 3 to 5 shapes, the key from 5 to 6 pairs, and later sessions bring a third note.
// From Night 5 the key is a ring with a one-step rule; from Night 8 its arrow may also turn the other way.
const codePlan = n => ({ len: n < 3 ? 3 : n < 8 ? 4 : 5, keys: n < 3 ? 5 : 6, count: n < 5 ? 2 : 3, ring: n >= 5, dir: n >= 8 && Math.random() < .5 ? -1 : 1 });
const CODE_CW = 64;   // one note column, in layout units

scenes.code = {
  enter() {
    const P = codePlan(S.night);
    Object.assign(this, P, { shapes: shuffle([...CODE_GLYPH.keys()]).slice(0, P.keys), pics: codePics(P.keys), ni: 0, si: 0, wrong: 0, miss: 0,
      tipped: false, tipT: -9, hint: false, state: 'wait', at: V.t, popT: -9, missT: -9, missP: 0, stars: 0, zipAt: null });
    // pair i of the key: shapes[i] means pics[i]; each note is a row of different pairs
    this.msgs = Array.from({ length: P.count }, () => shuffle([...Array(P.keys).keys()]).slice(0, P.len));
    this.hudEl = hud(() => go('hub'), `<span class="pill" id="cDone">${ic('codeNote', 22)}<span><b>0</b>/${P.count}</span></span>`);
    const bar = add(`<div class="bar"><div id="cTray" style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px">${shuffle([...Array(P.keys).keys()]).map(p =>
      `<button class="tile" data-p="${p}" style="position:relative;width:6.2em;min-height:60px">${ic(this.pics[p], Math.min(V.w, V.h) > 600 ? 46 : 34)}<span>${esc(t(this.pics[p]))}</span></button>`).join('')}</div></div>`);
    this.trayEl = $('#cTray', bar);
    this.trayEl.onclick = e => { const b = e.target.closest('.tile'); if (b) this.pick(+b.dataset.p); };
    this.resize();
    const ex = this.msgs[0][0];   // the intro shows one pair of tonight's key
    owlSay(t('code_intro') + (this.ring ? ' ' + t('code_ring') : ''), { html: `<div class="pics">${ic('code:' + this.shapes[ex], 44)}${ic('play', 22)}${ic(this.pics[ex], 44)}</div>`,
      acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => { this.state = 'in'; this.at = V.t; sfx.chirp(); this.trayEl.firstChild.focus({ preventScroll: true }); } }] });
  },
  want() { return this.msgs[this.ni][this.si]; },
  tile(p) { return this.trayEl.querySelector(`[data-p="${p}"]`); },
  pick(p) {
    if (this.state !== 'ask') return;
    const [x, y] = this.slotAt(this.si);
    if (p === this.want()) {
      this.hintOff(); this.si++; this.miss = 0; this.popT = V.t;
      sfx.tile(this.si); say(t(this.pics[p]));
      burst(x, y, 12, { speed: 150, colors: ['#ffd86b', '#fff6da', '#7fd0ff'] });
      if (this.si === this.len) this.decoded();
      return;
    }
    // A wrong picture costs nothing now: the tile shakes, the slot shows "not this one", and after three tries the right one glows.
    this.wrong++; this.miss++; this.missP = p; this.missT = V.t;
    nudge(this.tile(p)); tone(260, .2, 'triangle', .13, 0, 200);
    // the first slip of the session puts a tip on the key card itself, where the child should look next
    if (!this.tipped) { const s = t(this.ring ? 'code_tipRing' : 'code_tip'); this.tipped = true; this.tipT = V.t; say(s); speak(s); }
    if (this.miss === 3) this.hintOn();
  },
  // The hint: the right tile pulses and wears a star (the star stays when motion is reduced); the key marks the same pair.
  hintOn() {
    const b = this.tile(this.want());
    this.hint = true; b.classList.add('pulse'); b.style.boxShadow = '0 0 0 5px #ffd86b';
    Object.assign(add(ic('star', 22), b).style, { position: 'absolute', top: '-10px', right: '-10px' });
  },
  hintOff() {
    if (!this.hint) return;
    const b = this.tile(this.want());
    this.hint = false; b.classList.remove('pulse'); b.style.boxShadow = ''; b.lastChild.remove();
  },
  decoded() {
    this.state = 'lit'; this.at = V.t;
    $('#cDone b').textContent = this.ni + 1;
    sfx.sparkle(); for (let j = 0; j < this.len; j++) tone(PENTA[3 + j], .3, 'triangle', .12, .2 + j * .22);
    burst(...this.slotAt((this.len - 1) / 2), 24, { kind: 'star', colors: ['#ffd86b', '#fff', '#ff9ecb', '#7fd0ff'], speed: 240, size: 8 });
    floatText(...this.slotAt((this.len - 1) / 2, -12), t('code_done')); say(t('code_done'));
    if (this.ni < this.count - 1) return;
    // the last note: the result is saved at once, the owl's dialog follows
    const stars = this.stars = this.wrong === 0 ? 3 : this.wrong <= 2 ? 2 : 1, gain = award('code', stars);
    later(() => stationWin('code', stars, gain), 1200);
  },
  // Keys: Enter or Space on a focused tile picks it; arrows move between tiles; 1 to 6 pick a tile directly.
  key(e) {
    const tiles = [...this.trayEl.children], i = tiles.indexOf(document.activeElement);
    if (/^[1-9]$/.test(e.key) && tiles[e.key - 1]) tiles[e.key - 1].click();
    else if (/^Arrow/.test(e.key)) { e.preventDefault(); tiles[i < 0 ? 0 : (i + (/Left|Up/.test(e.key) ? -1 : 1) + tiles.length) % tiles.length].focus(); }
  },
  // One row of tiles when it fits, otherwise two even rows.
  resize() {
    const tiles = this.trayEl.children, w = tiles[0].offsetWidth + 6;
    this.trayEl.style.maxWidth = tiles.length * w <= V.w - 16 ? '' : Math.ceil(tiles.length / 2) * w + 'px';
  },
  update() {
    const k = V.t - this.at;
    if (this.state === 'in' && k > .9) { this.state = 'ask'; this.at = V.t; }
    else if (this.state === 'lit' && k > 1.7) { this.state = 'out'; this.at = V.t; sfx.chirp(); }
    else if (this.state === 'out') {
      if (this.zipAt && !still() && Math.random() < .5) burst(...this.zipAt, 1, { speed: 40, g: 0, life: .7, colors: ['#ffd86b', '#fff', '#7fd0ff'] });
      if (k > 1) { if (++this.ni < this.count) { this.si = 0; this.state = 'in'; this.at = V.t; sfx.chirp(); } else this.state = 'end'; }
    }
  },
  // Layout units: the note (with Zip on its left and the pointer above) and the key, scaled into the room between top bar and tray.
  // Portrait stacks them; landscape puts them side by side.
  place() {
    const land = wide(), top = this.hudEl.getBoundingClientRect().bottom + 4, ah = Math.max(60, this.trayEl.getBoundingClientRect().top - top - 8);
    const pw = this.len * CODE_CW + 28, nbw = pw + 46, nbh = 136 + 28;
    const cols = land ? 3 : 2, rows = Math.ceil(this.keys / cols);
    const kw = this.ring ? 270 : cols * 126 + (cols - 1) * 8 + 20, kh = this.ring ? 292 : rows * 54 + (rows - 1) * 6 + 50;
    const LW = land ? nbw + 30 + kw + 12 : Math.max(nbw, kw) + 12, LH = land ? Math.max(nbh, kh) + 8 : nbh + 18 + kh + 8;
    const u = Math.min(V.w / LW, ah / LH, 1.7), G = { u, cols, kw, kh, pw, ox: (V.w - LW * u) / 2, oy: top + (ah - LH * u) / 2 };
    return Object.assign(G, land ? { px: 52, py: (LH - nbh) / 2 + 28, kx: 6 + nbw + 30, ky: (LH - kh) / 2 } : { px: (LW - nbw) / 2 + 46, py: 32, kx: (LW - kw) / 2, ky: nbh + 22 });
  },
  // Screen position of a point in column j of the note, `dy` below the paper's top edge (fractions give points between columns).
  slotAt(j, dy = 88) { const G = this.place(); return [G.ox + (G.px + 46 + j * CODE_CW) * G.u, G.oy + (G.py + dy) * G.u]; },
  draw() {
    const t0 = V.t, G = this.place(), u = G.u, k = t0 - this.at, st = this.state;
    drawSky(ctx, t0);
    fireflies(ctx, t0, 8);
    ctx.save(); ctx.translate(G.ox, G.oy); ctx.scale(u, u);
    this.ring ? this.drawRing(G) : this.drawTable(G);
    // the note flies in with Zip and away again; with reduced motion it fades in and out instead
    let dx = 0, dy = 0, a = st === 'wait' || st === 'end' ? 0 : 1, dir = 1;
    if (st === 'in') { if (still()) a = Math.min(1, k / .9); else { dx = (1 - ease(Math.min(1, k / .9))) * (V.w - G.ox) / u; dir = -1; } }
    if (st === 'out') { const e = Math.min(1, k); if (still()) a = 1 - e; else { dx = -e * e * (G.px + G.pw + 80 + G.ox / u); dy = -e * e * 160; dir = -1; } }
    if (a > 0) {
      ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, dy);
      this.drawNote(G, t0);
      zip(ctx, G.px - 20, G.py + 6, 1.3, t0, dir);
      ctx.restore();
    }
    this.zipAt = [G.ox + (G.px - 20 + dx) * u, G.oy + (G.py + 6 + dy) * u];
    ctx.restore();
  },
  font(G, px) { ctx.font = `800 ${Math.max(px, 11 / G.u)}px ui-rounded, "Segoe UI", Roboto, sans-serif`; },
  drawNote(G, t0) {
    const { px, py, pw } = G, msg = this.msgs[this.ni], st = this.state, k = t0 - this.at, lit = st === 'lit' || st === 'out';
    if (lit) glow(ctx, px + pw / 2, py + 68, pw * .8, '255,216,107', st === 'out' ? .7 : .7 * Math.min(1, k * 2));
    rr(ctx, px, py, pw, 136, 14); ctx.fillStyle = '#fff6da'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#d9c48f'; ctx.stroke();
    this.font(G, 13); ctx.textAlign = 'center';
    msg.forEach((p, j) => {
      const cx = px + 46 + j * CODE_CW, sy = py + 88, cur = st === 'ask' && j === this.si, done = j < this.si || lit;
      if (cur) {
        // the shape to decode now: a thick frame and a pointer above it (the pointer bobs unless motion is reduced)
        rr(ctx, cx - 29, py + 6, 58, 112, 12); ctx.lineWidth = 4; ctx.strokeStyle = '#f2a93b'; ctx.stroke();
        const b = still() ? 0 : Math.abs(Math.sin(t0 * 4)) * 5;
        poly(ctx, [cx - 12, py - 24 - b, cx + 12, py - 24 - b, cx, py - 7 - b], '#ffd86b');
      }
      drawIcon(ctx, 'code:' + this.shapes[p], cx, py + 31, cur ? 44 : 38);
      poly(ctx, [cx - 6, py + 56, cx + 6, py + 56, cx, py + 63], '#c9b27a');   // "means": the picture goes below
      if (done) {
        let s = 38;
        if (lit) {
          // the picture sentence lights up one picture after another: a gold tile behind picture and word, and a little hop
          const q = st === 'out' ? 1 : clamp((k - j * .22) / .35, 0, 1);
          if (q > 0) { rr(ctx, cx - 29, py + 62, 58, 72, 12); ctx.fillStyle = `rgba(255,200,70,${.55 * q})`; ctx.fill(); }
          if (!still()) s *= 1 + .3 * Math.sin(q * Math.PI);
        } else if (j === this.si - 1 && !still()) s *= .5 + .5 * ease(Math.min(1, (t0 - this.popT) * 5));   // the new picture pops in
        drawIcon(ctx, this.pics[p], cx, sy, s);
        ctx.fillStyle = '#2a1c05'; ctx.fillText(t(this.pics[p]), cx, py + 128, CODE_CW - 4);
      } else {
        rr(ctx, cx - 22, sy - 22, 44, 44, 10); ctx.setLineDash([5, 4]); ctx.lineWidth = 2.5; ctx.strokeStyle = '#b9a272'; ctx.stroke(); ctx.setLineDash([]);
        if (cur && t0 - this.missT < .8) {
          // "not this one": the tried picture shows faded, with a small cross badge
          ctx.save(); ctx.globalAlpha *= .4; drawIcon(ctx, this.pics[this.missP], cx, sy, 34); ctx.restore();
          circ(ctx, cx + 17, sy - 17, 11, '#e0553f'); drawIcon(ctx, 'no', cx + 17, sy - 17, 12);
        } else { ctx.fillStyle = '#b9a272'; ctx.fillText('?', cx, sy + 6); }
      }
    });
  },
  // The key card. Its title row briefly shows the tip after the first slip.
  card(G, x, y, w, h) {
    rr(ctx, x, y, w, h, 16); ctx.fillStyle = 'rgba(13,22,60,.86)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,216,107,.45)'; ctx.stroke();
    this.font(G, 15);
    if (V.t - this.tipT < 4) {
      rr(ctx, x + 8, y + 6, w - 16, 27, 13); ctx.fillStyle = '#fff6da'; ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = '#2a1c05'; ctx.fillText(t(this.ring ? 'code_tipRing' : 'code_tip'), x + w / 2, y + 25, w - 30);
    } else { ctx.textAlign = 'left'; ctx.fillStyle = '#ffd86b'; ctx.fillText(t('code_key'), x + 14, y + 25); }
  },
  drawTable(G) {
    const { kx, ky, kw, kh, cols } = G, want = this.hint ? this.want() : -1;
    this.card(G, kx, ky, kw, kh);
    for (let i = 0; i < this.keys; i++) {
      const row = i / cols | 0, inRow = Math.min(cols, this.keys - row * cols), x = kx + 10 + (cols - inRow) * 67 + (i % cols) * 134, y = ky + 63 + row * 60;
      if (i === want) { glow(ctx, x + 63, y, 80, '255,216,107', .6); rr(ctx, x - 2, y - 29, 130, 58, 14); ctx.lineWidth = 4; ctx.strokeStyle = '#ffd86b'; ctx.stroke(); }
      drawIcon(ctx, 'code:' + this.shapes[i], x + 24, y, 42);
      line(ctx, [x + 50, y, x + 68, y], '#fff6da', 4); poly(ctx, [x + 66, y - 8, x + 78, y, x + 66, y + 8], '#fff6da');
      circ(ctx, x + 102, y, 23, '#e9f0ff'); drawIcon(ctx, this.pics[i], x + 102, y, 34);
    }
  },
  // The ring key: shapes and pictures take turns around a track; every arrowhead points the same way.
  // A shape means the picture one step along the arrows, so the picture on its other side is the trap.
  drawRing(G) {
    const { kx, ky, kw, kh } = G, n = this.keys * 2, R = 104, cx = kx + kw / 2, cy = ky + 30 + (kh - 30) / 2, step = TAU / n, d = this.dir;
    const want = this.hint ? this.want() : -1;
    this.card(G, kx, ky, kw, kh);
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,246,218,.45)'; ctx.stroke();
    for (let j = 0; j < n; j++) {
      const a = -Math.PI / 2 + (j + .5) * step, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, tx = -Math.sin(a) * d, ty = Math.cos(a) * d, nx = Math.cos(a), ny = Math.sin(a);
      poly(ctx, [x + tx * 8, y + ty * 8, x - tx * 5 + nx * 7, y - ty * 5 + ny * 7, x - tx * 5 - nx * 7, y - ty * 5 - ny * 7], '#ffd86b');
    }
    for (let j = 0; j < n; j++) {
      const a = -Math.PI / 2 + j * step, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, i = j % 2 ? ((j - d) / 2 + this.keys) % this.keys : j / 2;
      if (i === want) glow(ctx, x, y, 40, '255,216,107', .95);
      if (j % 2) { circ(ctx, x, y, 21, '#e9f0ff'); drawIcon(ctx, this.pics[i], x, y, 30); }
      else drawIcon(ctx, 'code:' + this.shapes[i], x, y, 36);
    }
    // the rule in the middle: one big curved arrow and "1 step"
    const a0 = -Math.PI / 2 - d * 1.3, a1 = -Math.PI / 2 + d * 1.3;
    ctx.beginPath(); ctx.arc(cx, cy + 8, 42, a0, a1, d < 0); ctx.lineWidth = 7; ctx.strokeStyle = '#ffd86b'; ctx.lineCap = 'round'; ctx.stroke();
    const hx = cx + Math.cos(a1) * 42, hy = cy + 8 + Math.sin(a1) * 42, tx = -Math.sin(a1) * d, ty = Math.cos(a1) * d, nx = Math.cos(a1), ny = Math.sin(a1);
    poly(ctx, [hx + tx * 14, hy + ty * 14, hx + nx * 12, hy + ny * 12, hx - nx * 12, hy - ny * 12], '#ffd86b');
    this.font(G, 16); ctx.textAlign = 'center'; ctx.fillStyle = '#fff6da'; ctx.fillText(t('code_step'), cx, cy + 22, 74);
  },
};
