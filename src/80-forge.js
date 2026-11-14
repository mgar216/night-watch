// ---------- Station three: Password Forge (long beats complicated; security you can measure) ----------
const FWORDS = ['sun', 'pizza', 'dragon', 'banana', 'rocket', 'cat', 'fish', 'cake', 'robot', 'frog', 'boat', 'drum'];
const YEAR = 31557600, OLDEST = 5000 * YEAR;
const FORGE_LV = [[3600, 5], [30 * 86400, 5], [10 * YEAR, 5], [100 * YEAR, 5], [1000 * YEAR, 5], [4000 * YEAR, 5], [OLDEST + 1, 6]];   // [goal seconds, "few tiles" limit]
// How long the hacker's computer needs. Each new word is a big brick (12 bits); numbers and symbols are small ones;
// a repeated tile adds almost nothing; mixing kinds gives a little extra.
function crackSeconds(tiles) {
  if (!tiles.length) return 0;
  const seen = new Set(), kinds = new Set();
  let bits = 0;
  for (const tl of tiles) {
    const id = tl.k + tl.v;
    bits += seen.has(id) ? (tl.k === 'w' ? 3 : 2) : { w: 12, n: 4, s: 5 }[tl.k];
    seen.add(id); kinds.add(tl.k);
  }
  bits += [0, 0, 2, 4][kinds.size];
  return Math.max(1, Math.pow(2, bits - 12));
}
function crackLabel(sec) {
  if (sec > OLDEST) return t('oldest');
  const r = v => Math.max(1, v >= 100 ? Math.round(v / 10) * 10 : Math.round(v));
  if (sec < 60) return plural('u_s', r(sec));
  if (sec < 3600) return plural('u_m', r(sec / 60));
  if (sec < 86400) return plural('u_h', r(sec / 3600));
  if (sec < YEAR) return plural('u_d', r(sec / 86400));
  if (sec < 100 * YEAR) return plural('u_y', r(sec / YEAR));
  return plural('u_c', r(sec / YEAR / 100));
}
const meterPos = sec => clamp(Math.log2(sec + 1) / Math.log2(OLDEST * 1.3), 0, 1);
function forgeStars(tiles, few) {
  const words = new Set(tiles.filter(x => x.k === 'w').map(x => x.v)).size;
  return [true, tiles.length <= few, words >= 3 && tiles.some(x => x.k === 'n') && tiles.some(x => x.k === 's')];
}
scenes.forge = {
  enter() {
    const [goal, few] = FORGE_LV[Math.min(S.night, 7) - 1];
    Object.assign(this, { goal, few, tiles: [], sec: 0, crackT: 0, wonT: 0, run: true });
    this.tray = shuffle([...FWORDS]).slice(0, 6).map(v => ({ k: 'w', v }))
      .concat(shuffle(['2', '3', '5', '7', '8', '9', '12', '42', '77', '99']).slice(0, 3).map(v => ({ k: 'n', v })))
      .concat(shuffle(['!', '?', '#', '*', '&', '+', '@', '%']).slice(0, 3).map(v => ({ k: 's', v })));
    hud(() => go('hub'));
    this.panel = add(`<div class="forge"><div class="meter"><div class="val" id="fVal">&nbsp;</div>
      <div class="track"><div class="fill" id="fFill"></div><div class="flag" style="left:${meterPos(goal) * 100}%"></div></div>
      <div style="font-size:.8em">${ic('star', 18)} ${esc(t('goal'))}: ${esc(crackLabel(goal))}</div></div>
      <div class="slots" id="fSlots" role="group" aria-label="${esc(t('pass'))}"></div><div class="tiles" id="fTray"></div>
      <button class="btn gold" id="fTry">${ic('lock', 26)}${esc(t('tryIt'))}</button></div>`);
    const tileHtml = (x, i) => `<button class="tile ${x.k === 'w' ? '' : x.k}" data-i="${i}">${x.k === 'w' ? ic(x.v, 30) + `<span>${esc(t(x.v))}</span>` : `<b>${esc(x.v)}</b>`}</button>`;
    this.tileHtml = tileHtml;
    $('#fTray').innerHTML = this.tray.map(tileHtml).join(''); paintIcons($('#fTray'));
    $('#fTray').onclick = e => {
      const b = e.target.closest('.tile');
      if (!b || !this.run || this.crackT) return;   // no changes while the hacker is busy with the last try
      if (this.tiles.length >= 8) { sfx.empty(); nudge($('#fSlots')); return; }   // the bar is full: show it
      this.tiles.push(this.tray[+b.dataset.i]); sfx.tile(this.tiles.length); this.refresh();
    };
    $('#fSlots').onclick = e => { const b = e.target.closest('.tile'); if (b && this.run && !this.crackT) { this.tiles.splice(+b.dataset.i, 1); sfx.click(); this.refresh(); } };
    $('#fTry').onclick = () => this.tryIt();
    this.refresh();
    if (!S.st.forge) owlSay(t('forgeIntro'), { html: this.goalsHtml([false, false, false]), acts: [{ label: t('go'), cls: 'go', icon: 'play' }] });
  },
  goalsHtml(on) {
    const rows = [[t('g_target') + ': ' + crackLabel(this.goal)], [t('g_few', { n: this.few })], [t('g_mix')]];
    return `<div class="goals">${rows.map(([s], i) => `<div class="${on[i] ? 'on' : ''}">${ic(on[i] ? 'star' : 'star0', 22)}${esc(s)}</div>`).join('')}</div>`;
  },
  refresh() {
    this.sec = crackSeconds(this.tiles);
    $('#fSlots').innerHTML = this.tiles.map(this.tileHtml).join(''); paintIcons($('#fSlots'));
    $('#fVal').textContent = this.tiles.length ? crackLabel(this.sec) : '\u00a0';
    $('#fFill').style.width = meterPos(this.sec) * 100 + '%';
    say($('#fVal').textContent);
  },
  tryIt() {
    if (!this.run || this.crackT || !this.tiles.length) { if (!this.tiles.length) nudge($('#fTry')); return; }
    if (this.sec >= this.goal) {
      this.run = false; this.wonT = V.t; sfx.slam();
      const on = forgeStars(this.tiles, this.few), stars = on.filter(Boolean).length, gain = award('forge', stars);
      later(() => stationWin('forge', stars, gain, t('forgeWin'), this.goalsHtml(on)), 1700);
      return;
    }
    // Below the goal: the hacker cracks it in a puff of feathers, the owl gives one idea, and building goes on.
    this.crackT = V.t;
    for (let i = 0; i < 8; i++) later(() => sfx.type(), i * 110);
    later(() => {
      const r = $('#fSlots').getBoundingClientRect();
      sfx.puff(); burst(r.left + r.width / 2, r.top + r.height / 2, 34, { kind: 'feather', colors: ['#dfe6f5', '#1a1a22', '#3f6fe0'], speed: 260, size: 9, life: 1.3, g: 120 });
      toast(t('cracked', { t: crackLabel(this.sec) }));
    }, 950);
    later(() => {
      const w = this.tiles.filter(x => x.k === 'w'), uniq = new Set(w.map(x => x.v)).size;
      this.crackT = 0;
      // one idea the child can act on: twins out, or (bar full) small tiles out, or mix kinds, or one more word
      owlSay(t(uniq < w.length ? 'forgeTipSame' : this.tiles.length >= 8 ? 'forgeTipFull' : uniq >= 3 && w.length === this.tiles.length ? 'forgeTipMix' : 'forgeTipWord'), { mood: 'talk' });
    }, 2300);
  },
  draw() {
    const t0 = V.t, top = 56, aw = wide() ? V.w * .45 : V.w, ah = (wide() ? V.h : this.panel.offsetTop) - top, u = Math.min(aw / 400, ah / 230);
    drawSky(ctx, t0);
    const sec = this.sec, won = this.wonT > 0, wk = won ? Math.min(1, (t0 - this.wonT) / .5) : 0;
    const face = won || sec >= 100 * YEAR ? 'sleep' : sec >= YEAR ? 'sweat' : sec >= 3600 ? 'worry' : 'smug';
    ctx.save(); ctx.translate((aw - 400 * u) / 2, top + (ah - 230 * u) / 2); ctx.scale(u, u);
    line(ctx, [-400, 196, wide() ? aw / (2 * u) + 200 : 800, 196], '#5a3a22', 14);   // in landscape the floor stops where the tile panel begins
    owl(ctx, 24, 190, .5, t0, won ? 'cheer' : 'idle');
    // tiny laptop with a glowing screen
    const busy = this.crackT && !still();
    ctx.save(); ctx.translate(26, 0);
    glow(ctx, 178, 160, 60, '127,208,255', .35);
    poly(ctx, [160, 186, 204, 186, 210, 191, 154, 191], '#8a94a8'); poly(ctx, [164, 186, 200, 186, 206, 154, 170, 154], '#22305e'); poly(ctx, [168, 182, 197, 182, 202, 158, 173, 158], busy && t0 * 12 % 2 < 1 ? '#bff0ff' : '#7fd0ff');
    ctx.restore();
    magpie(ctx, 128 + (busy ? Math.sin(t0 * 50) * 1.5 : 0), 190, 1.05, t0, { face, hat: 1, flame: sec > OLDEST && !won, pose: 'stand' });
    if (face === 'sleep' && !still()) for (let i = 0; i < 3; i++) { const k = (t0 * .5 + i / 3) % 1; ctx.globalAlpha = 1 - k; circ(ctx, 150 + k * 16, 110 - k * 30, 2 + k * 4, '#dff0ff'); ctx.globalAlpha = 1; }
    // the vault door: it slams shut with a golden glow when the password is strong enough
    ctx.translate(44, 0);
    if (won) glow(ctx, 282, 128, 130, '255,216,107', .7 * wk);
    circ(ctx, 282, 128, 62, '#5a6478'); circ(ctx, 282, 128, 54, won ? '#ffd86b' : '#8a94a8'); circ(ctx, 282, 128, 44, won ? '#ffe9a3' : '#aeb9d0');
    for (let i = 0; i < 8; i++) circ(ctx, 282 + Math.cos(i * TAU / 8) * 49, 128 + Math.sin(i * TAU / 8) * 49, 3, '#5a6478');
    ctx.save(); ctx.translate(282, 128); ctx.rotate(busy ? t0 * 6 : wk * 2); for (let i = 0; i < 3; i++) { ctx.rotate(TAU / 6); line(ctx, [-30, 0, 30, 0], '#5a6478', 6); } ctx.restore();
    drawIcon(ctx, 'lock', 282, 128, 34 + wk * 8);
    ctx.restore();
    fireflies(ctx, t0, 6);
  },
};
