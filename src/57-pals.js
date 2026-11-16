// ---------- Friends: magpies that were caught kindly often enough give up stealing, get a name and a job, and help ----------
// Called by the other files:
//   pieCaught(n = 1)       a magpie was caught or sent home kindly (Camera Watch, Gate Check, a raid): counts in S.caught
//   palNews(then)          the owl tells of a new friend once (S.pals[id] = 1), then calls then()
//   palPerk()              what the chosen helper does in tonight's raid: '' | 'guard' | 'baker' | 'lamp' | 'post' |
//                          'garden' | 'music' (the raid applies it, see src/90-tinker.js)
//   palPill()              HTML of a small pill that names the helper and the help, for the Tinker Treehouse ('' if none)
//   palsTree(c, T, t)      from the menu scenes, after the tree and before the owl: the helper on the ground by the
//                          ladder and other friends on their perches
//   palTap(lx, ly, T)      from menuTap, tree units: true when a friend answered the tap
//   scenes.pals            the Friends page: go('pals', { from }) (opened from the album)

// The six friends in the order they come, and the number of kind catches that brings each one. A friend's id is also the
// name of its help in a raid (palPerk). Baron von Shiny is no friend of this kind: once his story has ended he has a card.
const PALS = ['guard', 'baker', 'lamp', 'post', 'garden', 'music'], PAL_AT = [25, 60, 110, 170, 240, 320];
// What each friend wears or carries, drawn over magpie() in its units (facing right, feet at 0, 0, head at 20, -52), and the
// box the whole friend takes up there [left, top, right, bottom]: a placed item it overlaps is drawn again in front of it.
// Each job has its own shape: a cap far too big, a tall white hat, a lantern on a pole, a satchel, a straw hat, a drum.
const PAL = {
  guard: { box: [-64, -82, 54, 0] },   // the cap is magpie()'s own disguise 4: the guard stood by the ladder before it had a name
  baker: { box: [-64, -91, 50, 0], gear(c) {
    c.save(); c.translate(10, -20); c.rotate(-.4);   // a rolling pin across the white chest
    line(c, [-17, 0, 17, 0], '#7a4a22', 2.4); rr(c, -11, -3.5, 22, 7, 3.5); c.fillStyle = '#d9965a'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#6b3d18'; c.stroke();
    c.restore();
    wearOn(c, 'chef', 20, -62, 12, .12);   // the wardrobe's chef's hat
  } },
  lamp: { box: [-64, -106, 50, 0], gear(c, t, calm) {
    const f = calm ? 1 : 1 + .08 * Math.sin(t * 9) + .05 * Math.sin(t * 13.7);   // the flame flickers a little
    glow(c, -3, -86, 24 * f, '255,216,107', .5);
    line(c, [0, -24, -15, -99], '#8a5a34', 3);   // the pole, held under the wing
    line(c, [-15, -99, -10, -104, -3, -102, -3, -97], '#4a2f1a', 1.8);
    poly(c, [-8, -98, 2, -98, 5, -94, -11, -94], '#3d3b4c');
    rr(c, -10.5, -94, 15, 15, 3); c.fillStyle = '#ffe9a3'; c.fill(); c.lineWidth = 1.4; c.strokeStyle = '#4a2f1a'; c.stroke();
    ell(c, -3, -86.5, 2.6 * f, 4.4 * f, '#ff9a3a');
    rr(c, -11.5, -79.5, 17, 3, 1); c.fillStyle = '#3d3b4c'; c.fill();
  } },
  post: { box: [-64, -68, 50, 0], gear(c) {
    line(c, [16, -43, -8, -21], '#6b3d18', 2.4);   // the strap over the chest
    c.save(); c.translate(-12, -18); c.rotate(.15);
    rr(c, -7, -17, 15, 10, 1); c.fillStyle = '#fff'; c.fill(); line(c, [-7, -17, .5, -11.5, 8, -17], '#9aa6c2', 1.1); circ(c, 5, -14, 1.6, '#e8503a');   // a letter peeks out
    rr(c, -11, -8, 22, 16, 4); c.fillStyle = '#c8813a'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#fff3dc'; c.stroke();
    rr(c, -11, -8, 22, 7, 3); c.fillStyle = '#9a5a26'; c.fill(); circ(c, 0, -2, 1.9, '#ffd24a');   // the flap and its buckle
    c.restore();
  } },
  garden: { box: [-64, -79, 50, 0], gear(c) {
    c.save(); c.translate(-40, 0);   // an orange watering can stands by the tail: it shows on bark and on grass
    line(c, [-6, -9, -15, -19], '#e0791f', 3); ell(c, -16, -20, 3.4, 2, '#e0791f', -.7);
    rr(c, -8, -13, 16, 13, 3); c.fillStyle = '#ff9a3a'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#ffe2b0'; c.stroke();
    c.beginPath(); c.arc(1, -13, 5, Math.PI, 0); c.lineWidth = 2; c.strokeStyle = '#e0791f'; c.stroke();
    c.restore();
    c.save(); c.translate(19, -66); c.rotate(.12);   // a straw hat much wider than the head, with a ribbon and a flower
    ell(c, 0, 1, 23, 5, '#e9c05a'); c.lineWidth = 1; c.strokeStyle = '#a07a1a'; c.stroke();
    c.beginPath(); c.arc(0, 0, 11, Math.PI, 0); c.closePath(); c.fillStyle = '#f5d77a'; c.fill();
    rr(c, -11, -4, 22, 4, 1); c.fillStyle = '#58a84f'; c.fill(); circ(c, 6, -6, 2.8, '#ff9ecb'); circ(c, 6, -6, 1.1, '#fff');
    c.restore();
  } },
  music: { box: [-64, -101, 55, 0], gear(c, t, calm) {
    const hit = calm ? 0 : Math.max(0, Math.sin(t * 6)) * .45;   // now and then the stick taps the drum
    line(c, [15, -42, 9, -28], '#2a1d12', 1.6);
    rr(c, 4, -28, 22, 13, 3); c.fillStyle = '#e8503a'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#fff3dc'; c.stroke();
    line(c, [5, -24, 10, -18, 15, -24, 20, -18, 25, -24], '#ffd24a', 1.3); ell(c, 15, -28, 11, 3, '#fff3dc');
    c.save(); c.translate(-3, -36); c.rotate(.28 - hit); line(c, [0, 0, 17, 1], '#c8813a', 2); circ(c, 17, 1, 1.8, '#fff3dc'); c.restore();
    if (!calm) for (let i = 0; i < 2; i++) {   // and a note floats up
      const q = (t * .4 + i * .5) % 1;
      if (q > .6) continue;
      const x = 36 + i * 6 + q * 8, y = -70 - q * 30;
      c.globalAlpha = Math.sin(Math.PI * q / .6); ell(c, x, y, 3, 2.2, '#fff6da', -.4); line(c, [x + 2.6, y - 1, x + 2.6, y - 12, x + 6, y - 9], '#fff6da', 1.3); c.globalAlpha = 1;
    }
  } },
};
const palT = {};   // when each friend was last tapped
function pieCaught(n = 1) { S.caught = (S.caught | 0) + n; }
// A friend counts once the owl has introduced it. The save may hold anything, so ids are looked up in the table first.
const palMet = id => has(PAL, id) && !!S.pals && S.pals[id] === 1;
const palHelper = () => typeof S.helper === 'string' && palMet(S.helper) ? S.helper : '';
// The friend whose turn has come. At the top rank the story has already told that the magpies joined the watch, so the
// first friend comes at once there.
function palDue() {
  if (rank() === 3 && !PALS.some(palMet)) return PALS[0];
  return PALS.find((id, i) => !palMet(id) && (S.caught | 0) >= PAL_AT[i]) || '';
}
function palNews(then) {
  const id = palDue();
  if (!id) return then();
  if (!S.pals || typeof S.pals !== 'object' || Array.isArray(S.pals)) S.pals = {};
  S.pals[id] = 1;
  if (!palHelper()) S.helper = id;   // the first friend helps at once
  save();
  // The veil is almost clear and the friend is already at the tree; after OK a sparkle shows where, then the next news.
  owlSay(t('pal_hi_' + id) + ' ' + t('pal_do_' + id), { title: t('pal_n_' + id), mood: 'cheer', html: `<div class="pics">${ic('pal:' + id, 64)}</div>`, acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: () => {
    const p = palAt(id, treeArea());
    if (p) { sfx.sparkle(); burst(p[0], p[1], 26, { speed: 200, size: 9, kind: 'star', colors: ['#ffd86b', '#fff6da', '#9fe8ff'] }); }
    later(() => palNews(then), 1400);
  } }] }).classList.add('clear');
}
function palPerk() { return palHelper(); }
function palPill() {
  const id = palHelper();
  // the pill says who helps and how; where a bar is narrow only the picture stays (.tbar in the stylesheet), so the words are its label too
  return id ? `<span class="pill helper" role="img" aria-label="${esc(t('pal_n_' + id) + ': ' + t('pal_p_' + id))}">${ic('pal:' + id, 30)}<span>${esc(t('pal_p_' + id))}</span></span>` : '';
}

// One friend with its feet at (x, y); s scales as for magpie(), dir -1 faces left; calm: no flicker, no floating notes.
function palDraw(c, id, x, y, s, t, dir = 1, face = 'kind', calm = true) {
  const P = has(PAL, id) ? PAL[id] : null;
  magpie(c, x, y, s, t, { dir, face, disguise: id === 'guard' ? 4 : 0, baron: id === 'baron' ? 1 : 0 });
  if (!P || !P.gear) return;
  c.save(); c.translate(x, y); c.scale(s * dir, s); c.lineCap = c.lineJoin = 'round'; P.gear(c, t, calm); c.restore();
}
ICON.pal = (c, id) => palDraw(c, id, .1, .82, .0155, 0);   // a friend's portrait; 'baron' is Baron von Shiny
const palHeart = (c, x, y, r) => { c.beginPath(); c.moveTo(x, y + r); c.bezierCurveTo(x - r * 1.5, y - r * .1, x - r * .8, y - r * 1.3, x, y - r * .45); c.bezierCurveTo(x + r * .8, y - r * 1.3, x + r * 1.5, y - r * .1, x, y + r); c.fillStyle = '#ff6b8a'; c.fill(); };
ICON.pals = c => { magpie(c, 0, .86, .016, 0, { face: 'joy' }); palHeart(c, .56, -.56, .34); };

// Where the friends live on the menu screens, in tree units [id, feet x, feet y, facing]: the helper on the ground by the
// ladder, the others on these seats in order, each in a gap between item spots: three branches, the roof (not on a low wide
// screen, where the Night menu's top bar covers it), the kitchen's roof (once there is a kitchen), and last the lower left
// branch, where the slide takes the taps along its middle and the one place left is item spot 6.
const PAL_SEATS = [[205, 353, 1], [790, 328, -1], [780, 645, -1], [455, 146, -1], [432, 440, 1], [160, 607, 1]];
function palPlaces() {
  const h = palHelper(), out = h ? [[h, 745, 930, -1]] : [], low = wide() && V.h <= 520;
  const seats = PAL_SEATS.filter((s, i) => !(i === 3 && low) && !(i === 4 && rank() < 2));
  let i = 0;
  for (const id of PALS) if (id !== h && palMet(id) && i < seats.length) out.push([id, ...seats[i++]]);
  return out;
}
// The middle of a friend on the screen (for the sparkle of its news).
function palAt(id, T) {
  const p = palPlaces().find(q => q[0] === id), u = Math.max(.42, T.k * .95) / T.k;
  return p ? [T.ox + (p[1] - 7 * p[3] * u) * T.k, T.oy + (p[2] - 34 * u) * T.k] : null;
}
function palsTree(c, T, t) {
  const at = palPlaces();
  if (!at.length) return;
  const k = T.k, s = Math.max(.42, k * .95), u = s / k, calm = still(), night = scene === scenes.bed || scene === scenes.dawn, box = [];
  at.forEach(([id, x, y, dir], i) => {
    // A tapped friend hops twice and laughs; now and then one hops a little and blinks. Not with motion reduced (a tapped
    // friend only laughs then), and not at bedtime or first light, when the magpies sleep.
    const d = t - (palT[id] || -9), q = (t * .45 + i * .29) % 1, rest = calm || night;
    const hop = rest ? 0 : d < .6 ? Math.abs(Math.sin(d / .3 * Math.PI)) * 12 : q < .1 ? Math.sin(q * 10 * Math.PI) * 3 : 0;
    const face = night ? 'sleep' : d < 1.2 ? 'joy' : !calm && (t * .8 + i * .61) % 4.4 < .14 ? 'sleep' : 'kind';
    palDraw(c, id, T.ox + x * k, T.oy + y * k - hop * s, s, t, dir, face, rest);
    const b = PAL[id].box;
    box.push([x + (dir > 0 ? b[0] : -b[2]) * u, y + b[1] * u, x + (dir > 0 ? b[2] : -b[0]) * u, y + 2]);
  });
  // Placed items stay in full view: one that a friend overlaps is drawn once more, in front of it (the box as in drawItem).
  let on = false;
  for (const it of Array.isArray(S.items) ? S.items : []) {
    const m = it && Array.isArray(MOUNTS[it.m]) ? MOUNTS[it.m] : null;
    if (!m || it.m === VAULT || !has(ITEMS, it.t)) continue;
    const big = Math.max(ITEMS[it.t].deco ? 62 : 50, 22 / k), x0 = m[0] - big / 2, x1 = m[0] + big / 2, y0 = m[1] - big * .92, y1 = m[1] + big * .08;
    if (!box.some(b => b[0] < x1 && b[2] > x0 && b[1] < y1 && b[3] > y0)) continue;
    if (!on) { c.save(); c.translate(T.ox, T.oy); c.scale(k, k); c.lineCap = c.lineJoin = 'round'; on = true; }
    drawItem(c, it.t, m[0], m[1], t, k);
  }
  if (on) c.restore();
}
function palTap(lx, ly, T) {
  const k = T.k, u = Math.max(.42, k * .95) / k;
  let id = '', best = Math.max(45, 26 / k), px = 0, py = 0;
  for (const [f, x, y, dir] of palPlaces()) { const d = Math.hypot(lx - x + 7 * dir * u, ly - y + 34 * u); if (d < best) { best = d; id = f; px = x - 7 * dir * u; py = y; } }
  if (!id) return false;
  // the heron and the pond are right beside the helper: a gift nearer to the tap keeps it
  const g = giftOn() || {}, sx = T.ox + lx * k, sy = T.oy + ly * k;
  if (GIFTS.some(gid => g[gid] === 1 && (p => Math.hypot(p[0] - sx, p[1] - sy) < best * k)(giftAt(gid, T)))) return false;
  palT[id] = V.t;
  speak(t('pal_n_' + id), 'pie');   // magpie chatter
  toast(t('pal_n_' + id) + ' · ' + t('pal_j_' + id), 2200, [T.ox + px * k, T.oy + (py - 84 * u) * k]);   // the name goes over the friend it belongs to
  return true;
}

// ----- The Friends page: everyone met so far, and who helps in the raids. A friend not met yet is a dashed question mark. -----
scenes.pals = {
  enter(o = {}) {
    this.from = has(scenes, o.from) && o.from !== 'pals' ? o.from : 'home';
    // the number shown is the one that brings the next friend not met yet (at the top rank the guard came without any)
    const n = S.caught | 0, next = PAL_AT.find((v, i) => !palMet(PALS[i])), back = this.from === 'album' ? 'album' : 'home';
    // the top bar: back where the page came from, the title, and the kind catches so far with the number for the next friend
    const bar = add(`<div class="hud"><button class="btn round" id="palBack" data-home="${back}" aria-label="${esc(t(back))}">${ic(back, 28)}</button>
      <span class="pill">${ic('pals', 24)}<span class="extra">${esc(t('palsT'))}</span></span><span class="sp"></span>
      <span class="pill" role="img" aria-label="${esc(next ? t('pal_count', { n, m: next }) : t('pal_countAll', { n }))}">${ic('pie', 26)}<b>${n}</b>${next ? `<span>/ ${next}</span>` : ''}</span></div>`);
    $('#palBack', bar).onclick = () => { sfx.click(); go(this.from); };
    // Upright three cards in a row (two on a very narrow screen), sideways six; the pictures take the room that is left.
    const ids = PALS.concat((S.saga | 0) >= 3 ? ['baron'] : []);
    const cols = wide() ? (V.w >= 480 ? 6 : 3) : V.w >= 330 ? 3 : 2, rows = Math.ceil(ids.length / cols);
    const u = parseFloat(getComputedStyle(ui).fontSize) || 16, f = Math.max(11, u * .7), gap = u * .4;
    const px = clamp(Math.min((Math.min(45 * u, V.w - u) - (cols - 1) * gap) / cols - 18, (V.h - 4.5 * u - (rows - 1) * gap) / rows - 2.6 * f - 18), 36, 120) | 0;
    const w = `flex:0 0 calc(${(100 / cols).toFixed(3)}% - ${(gap * (cols - 1) / cols + .5).toFixed(1)}px)`;   // half a pixel to spare: rounding must not push a card to the next row
    const card = id => id === 'baron' ? `<button class="stk" data-pal="baron" style="${w}">${ic('pal:baron', px)}<b>${esc(t('k_m6'))}</b><span>${esc(t('pal_baron'))}</span></button>`
      : palMet(id) ? `<button class="stk" data-pal="${id}" aria-pressed="false" style="${w}">${ic('pal:' + id, px)}<b>${esc(t('pal_n_' + id))}</b><span>${esc(t('pal_j_' + id))}</span><span data-tick style="position:absolute;top:4px;right:4px;display:none">${ic('pieTick', 24)}</span></button>`
      : `<button class="stk none" data-pal="" aria-label="${esc(t('pal_unmet'))}" style="${w}">${ic('stk0', px)}<span>?</span></button>`;
    const box = add(`<div class="album"><div style="display:flex;flex-wrap:wrap;justify-content:center;align-content:center;gap:${gap}px;width:min(45em,100%);flex:1;min-height:0">${ids.map(card).join('')}</div></div>`);
    box.querySelectorAll('[data-pal]').forEach(b => b.onclick = () => this.tap(b));
    this.mark();
  },
  // A friend's card makes it the helper: it chatters, and the owl tells what it does in a raid. The Baron only chats.
  tap(b) {
    const id = b.dataset.pal;
    if (!id) { sfx.empty(); return nudge(b); }
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    speak(t(id === 'baron' ? 'k_m6' : 'pal_n_' + id), 'pie');
    if (id !== 'baron') { S.helper = id; save(); this.mark(); }
    later(() => toast(t(id === 'baron' ? 'pal_baronSay' : 'pal_do_' + id), 3800), 350);   // (one line at a time, however fast the taps: a new line takes the old one's place)
  },
  // The helper's card: pressed, a white rim with a gold ring, and a tick in its corner.
  mark() {
    const h = palHelper();
    for (const b of ui.querySelectorAll('[data-pal]')) {
      const tick = $('[data-tick]', b), on = b.dataset.pal === h;
      if (!tick) continue;   // the Baron and the friends not met yet never help
      b.setAttribute('aria-pressed', on); b.style.borderColor = on ? '#fff' : ''; b.style.boxShadow = on ? '0 0 0 3px var(--gold)' : ''; tick.style.display = on ? 'block' : 'none';
    }
  },
  draw() { drawSky(ctx, V.t); fireflies(ctx, V.t, 10); },
};
