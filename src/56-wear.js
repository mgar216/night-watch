// ---------- Dress-up: hats and scarves for the owl and for Zip, bought with moonbeams and worn in every scene ----------
// The things themselves (WEAR, WEARS) are drawn in src/45-chars.js, beside the characters that wear them.
ICON.wear = (c, id) => { c.translate(0, WEAR[id].hat ? .72 : -.35); c.scale(WEAR[id].hat ? .6 : .82, WEAR[id].hat ? .6 : .82); WEAR[id].draw(c); };
ICON.owlI = c => owl(c, 0, .93, .0185, 1, 'idle', false);   // (at time 0 the owl is in the middle of a blink)
ICON.zipI = c => zip(c, -.2, .2, .052, 0, 1);
ICON.hanger = c => { c.beginPath(); c.arc(0, -.6, .2, Math.PI * .9, Math.PI * 2.4); c.lineWidth = .12; c.strokeStyle = '#fff'; c.stroke(); line(c, [0, -.4, -.9, .3, .9, .3, 0, -.4], '#fff', .14); poly(c, [-.6, .3, .6, .3, .45, .8, -.45, .8], '#ff9ecb'); };

scenes.wear = {
  enter(o = {}) {
    this.from = o.from || this.from || 'home'; this.who = o.who || this.who || 'owl'; this.sel = '';
    tryOn = null;
    const bar = add(`<div class="hud"><button class="btn round" id="wBack" data-home="home" aria-label="${esc(t('home'))}">${ic('home', 28)}</button>
      <span class="pill">${ic('hanger', 24)}<span class="extra">${esc(t('wardrobe'))}</span></span>
      <button class="btn round" id="wFlag" aria-label="${esc(t('flagT'))}">${ic('flagI', 30)}</button><span class="sp"></span>
      <span class="pill" id="pBeams">${ic('beam', 22)}<b>${S.beams}</b></span></div>`);
    $('#wBack', bar).onclick = () => { sfx.click(); go(this.from); };
    $('#wFlag', bar).onclick = () => { sfx.pop(); go('flag', { from: 'wear' }); };   // the treehouse wears something too: its flag
    this.panel = add(`<div class="side wearbar"><div class="row"><div class="langs" role="group" aria-label="${esc(t('wardrobe'))}">
      <button class="btn" data-w="owl" aria-label="${esc(t('k_owl'))}">${ic('owlI', 40)}</button><button class="btn" data-w="zip" aria-label="${esc(t('k_zip'))}">${ic('zipI', 40)}</button></div>
      <button class="btn gold" id="wBuy" disabled>${ic('beam', 24)}<b></b><span>${esc(t('buy'))}</span></button></div>
      <div class="wears">${WEARS.map(k => `<button class="pal" data-k="${k}">${ic('wear:' + k, 36)}<span></span></button>`).join('')}</div></div>`);
    this.panel.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { sfx.click(); this.who = b.dataset.w; this.pick(''); });
    this.panel.querySelectorAll('.pal').forEach(b => b.onclick = () => this.tap(b.dataset.k));
    $('#wBuy', this.panel).onclick = () => this.buy();
    this.marks();
  },
  exit() { tryOn = null; },
  slot(k) { return (this.who === 'zip' ? 'z' : '') + (WEAR[k].hat ? 'hat' : 'scarf'); },
  // An owned thing goes on or comes off at once; a thing in the shop is tried on first.
  tap(k) {
    if (!S.own[k]) { sfx.pop(); return this.pick(this.sel === k ? '' : k); }
    const s = this.slot(k);
    S[s] = S[s] === k ? '' : k; save();
    S[s] ? sfx.yes() : sfx.click();
    this.pick('');
  },
  pick(k) {
    this.sel = k;
    tryOn = k ? Object.assign({ hat: S.hat, scarf: S.scarf, zhat: S.zhat, zscarf: S.zscarf }, { [this.slot(k)]: k }) : null;
    this.marks();
  },
  buy() {
    const k = this.sel, cost = WEAR[k].cost;
    if (cost > S.beams) { toast(t('poor')); sfx.empty(); return nudge($('#wBuy')); }
    S.beams -= cost; S.own[k] = 1; S[this.slot(k)] = k; save();
    sfx.coin(); sfx.sparkle();
    const [x, y] = this.spot(this.who);
    burst(x, y, 26, { colors: ['#ffd86b', '#fff', '#ff9ecb'], speed: 240, kind: 'star', size: 8 });
    this.pick('');
  },
  marks() {
    this.panel.querySelectorAll('[data-w]').forEach(b => b.setAttribute('aria-pressed', b.dataset.w === this.who));
    this.panel.querySelectorAll('.pal').forEach(b => {
      const k = b.dataset.k, own = S.own[k], on = own && S[this.slot(k)] === k;
      b.classList.toggle('sel', !!on); b.classList.toggle('try', this.sel === k); b.classList.toggle('poor', !own && WEAR[k].cost > S.beams);
      b.setAttribute('aria-pressed', !!on);
      b.setAttribute('aria-label', `${t('w_' + k)}${own ? '' : ', ' + WEAR[k].cost}`);
      $('span', b).innerHTML = own ? ic(on ? 'yes' : 'hanger', 16) : ic('beam', 14) + WEAR[k].cost;
      paintIcons(b);
    });
    const buy = $('#wBuy', this.panel);
    buy.disabled = !this.sel;
    $('b', buy).textContent = this.sel ? WEAR[this.sel].cost : '';
    refreshHud();
  },
  // The two models stand in the room that the panel leaves free.
  area() { const p = this.panel.getBoundingClientRect(); return wide() ? [0, 60, p.left, V.h - 60] : [0, 60, V.w, p.top - 60]; },
  spot(who) { const [x, y, w, h] = this.area(); return who === 'owl' ? [x + w * .38, y + h * .93] : [x + w * .72, y + h * .3]; },
  down(x, y) {
    const [zx, zy] = this.spot('zip'), [ox] = this.spot('owl'), who = Math.hypot(x - zx, y - zy) < 70 ? 'zip' : Math.abs(x - ox) < 90 ? 'owl' : '';
    if (who && who !== this.who) { sfx.click(); this.who = who; this.pick(''); }
  },
  draw() {
    const t0 = V.t, [, , w, h] = this.area(), s = clamp(Math.min(w / 190, h / 150), .9, 3.4), [ox, oy] = this.spot('owl'), [zx, zy] = this.spot('zip');
    drawSky(ctx, t0);
    const [sx, sy] = this.who === 'owl' ? [ox, oy - 52 * s] : [zx, zy];
    glow(ctx, sx, sy, (this.who === 'owl' ? 95 : 60) * s, '255,233,163', .32);   // a soft spotlight on the one being dressed
    ell(ctx, ox, oy + 2, 60 * s, 9 * s, 'rgba(7,13,42,.55)');
    owl(ctx, ox, oy, s, t0, 'idle', false);
    zip(ctx, zx, zy, s * 1.5, t0, -1);
    fireflies(ctx, t0, 8);
  },
};
