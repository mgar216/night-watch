// ---------- How to play: the guide, practice from the guide, and hints ----------
// The guide (the "?" beside Play and in the Night menu, and the hint line of the Night menu) is a list of topics. Each
// topic is one card that the owl reads aloud: the goal, one Night, every station, the Tinker Treehouse, the raid, what
// stars and moonbeams are for, the player's own things (dress-up, album, badge), friends, the Baron, the day, the fishing
// game, the living forest, the big goal, and a word for grown-ups. Its bar also holds the language switch. "All in order" walks
// through every card. The card of a mini-game has "Try it": the station opens as practice. While `practice` is set
// nothing is saved (save() in src/20-core.js) and the first step out of the practised screens leads back to the card
// with the save exactly as it was (go() in src/20-core.js).
// Hints (S.hints, on unless switched off with the bulb in the guide's bar): a line at the Night menu that says what
// comes next, the next station's card pulsing, a reminder in a station when nothing was touched for a while, and the
// tour offered once to a new player.
// a light bulb; 'bulb:0' is switched off (grey, no rays): the state shows in the shape, not only in the colour
ICON.bulb = (c, on) => {
  const lit = on !== '0';
  if (lit) for (let i = 0; i < 5; i++) { const a = Math.PI * (1.05 + i * .225); line(c, [Math.cos(a) * .72, -.2 + Math.sin(a) * .72, Math.cos(a) * .95, -.2 + Math.sin(a) * .95], '#ffe9a3', .1); }
  circ(c, 0, -.2, .52, lit ? '#ffd24a' : '#8f96b8');
  rr(c, -.26, .3, .52, .2, .06); c.fillStyle = '#9aa0bd'; c.fill(); rr(c, -.2, .54, .4, .16, .06); c.fillStyle = '#6f7594'; c.fill();
  if (!lit) line(c, [-.75, -.85, .75, .8], '#ff8a7a', .14);
};

// A topic: its id (text g_<id>, title g_<id>T or a station's own name), its pictures (the first one stands for the topic
// in the list, so no two topics share it), for a mini-game what to try:
// [scene, what the save looks like meanwhile, the screens that belong to the practice, the scene's argument],
// and the id of a topic that this card points on to (it gets a button of its own).
const GUIDE = [
  ['goal', ['jar', 'pie', 'rank:3']],
  ['night', ['moon', 'cam', 'gateI', 'lock', 'hammer']],
  ['cam', ['cam', 'pie', 'torch'], ['cam', { night: 1 }]],
  ['gate', ['gateI', 'badge:leaf:0', 'yes', 'no', 'eyeI'], ['gate', { night: 1 }]],
  ['forge', ['lock', 'cat', 'rocket', 'star'], ['forge', { night: 1 }]],
  ['flies', ['fliesFly', 'fliesGold', 'jar'], ['flies', { night: 2 }]],
  ['mail', ['mailBox', 'mailSeal:leaf:0:1', 'mailKey', 'mailClock', 'mailGift'], ['mail', { night: 3 }]],
  ['code', ['codeNote', 'moon', 'leaf', 'star'], ['code', { night: 4 }]],
  ['tinker', ['hammer', 'cam', 'lamp', 'bell', 'shield'], ['tinker', { night: 3, beams: 120, tinkered: 0, items: [{ t: 'cam', m: 1 }] }, ['tinker', 'raid']]],
  ['gadgets', ['peel', 'tramp', 'tickle', 'fan', 'honey', 'seesaw', 'drum']],
  ['raid', ['pie', 'jar', 'zipI', 'lamp']],
  ['stars', ['star', 'beam', 'rank:3', 'album', 'hanger', 'flagI']],
  ['things', ['hanger', 'album', 'pals', 'rank:0', 'cert']],
  ['friends', ['pal:guard', 'pal:baker', 'pal:lamp', 'pals']],
  ['boss', ['stk:m6', 'cake', 'eyeI'], ['boss', { night: 5 }, ['boss'], { then: () => go('hub') }]],
  ['pie', ['pieSuit:0', 'pie', 'pieGrown'], ['pie', {}, ['pie'], { from: 'home' }]],
  ['day', ['sun', 'fish', 'fish', 'fish', 'eyeI'], null, 'fish'],   // the card points on to the fishing game's own card
  ['fish', ['fish', 'boat', 'moon']],
  ['world', ['lifeRain', 'lifeSnow', 'moon', 'leaf']],
  ['end', ['rank:3', 'stk:m6', 'star']],
  ['grown', ['faces', 'lifeZz', 'wear:party']],
];
const guideTitle = id => t(L['s_' + id] ? 's_' + id : 'g_' + id + 'T');
let guideFrom = 'home', guideTour = false, guideThen = '';   // where the guide's home button leads; walking through all cards; where the tour of a new player ends

scenes.guide = {
  sky: true,
  // o: { from: the scene to go back to, page: a card to open at once (index or id), tour: walk through every card,
  //      then: where the tour ends, tried: the card is opened after its practice }
  enter(o = {}) {
    if (o.from) { guideFrom = o.from; guideTour = false; guideThen = ''; }
    if (o.tour) { guideTour = true; guideThen = o.then || ''; }
    // the bar: home, the walk through every card, the language switch and the bulb for the hints. On a narrow screen the
    // last two stand in a second row, and the list starts under whatever height the bar has.
    const bar = add(`<div class="hud gbar"><button class="btn round" id="gBack" data-home="home" aria-label="${esc(t('home'))}">${ic('home', 28)}</button>
      <button class="btn" id="gTour">${ic('play', 24)}${esc(t('g_tour'))}</button>${langsHtml()}
      <button class="btn round" id="gHints" aria-label="${esc(t('g_hints'))}" aria-pressed="${!!S.hints}">${ic('bulb:' + (S.hints ? 1 : 0), 34)}</button></div>`);
    $('#gBack', bar).onclick = () => { sfx.click(); go(guideFrom); };
    $('#gTour', bar).onclick = () => { sfx.pop(); guideTour = true; this.page(0); };
    $('#gHints', bar).onclick = () => { S.hints = S.hints ? 0 : 1; save(); sfx.click(); go('guide'); toast(t(S.hints ? 'g_on' : 'g_off'), 2200); };
    langsOn(bar, 'guide');   // the guide is drawn again in the new language; where its home button leads stays as it was
    const n = add(`<div class="guide"><div class="dlg gbox" role="group" aria-label="${esc(t('guide'))}"><h2>${esc(t('g_all'))}</h2>
      <div class="gtopics">${GUIDE.map(([id, pics], i) => `<button class="btn" data-g="${i}">${ic(pics[0], 30)}<span>${esc(guideTitle(id))}</span></button>`).join('')}</div></div></div>`);
    n.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { sfx.pop(); guideTour = false; this.page(+b.dataset.g); });
    this.resize();
    if (!S.toured) { S.toured = 1; save(); }   // the new mark on the home screen's "?" goes out
    const at = typeof o.page === 'number' ? o.page : GUIDE.findIndex(g => g[0] === o.page);
    if (at >= 0) this.page(at, o.tried); else if (o.tour) this.page(0);
  },
  resize() { const b = $('.gbar'), g = $('.guide'); if (b && g) g.style.top = b.offsetHeight + 'px'; },
  // One card. In a tour: all topics, try it, next. Alone: try it, OK. After its practice the owl says so instead of
  // reading the card again.
  page(i, tried) {
    const [id, pics, play, see] = GUIDE[i], last = i === GUIDE.length - 1, acts = [], seeAt = GUIDE.findIndex(g => g[0] === see);
    if (guideTour) acts.push({ label: t('g_list'), fn: () => { guideTour = false; } });
    if (play) acts.push({ label: t('g_try'), icon: pics[0], fn: () => tryOut(i) });
    if (seeAt >= 0 && !guideTour) acts.push({ label: guideTitle(see), icon: GUIDE[seeAt][1][0], fn: () => this.page(seeAt) });   // (in a tour that card comes next anyway)
    if (guideTour && !last) acts.push({ label: t('g_next'), cls: 'go', icon: 'play', fn: () => this.page(i + 1) });
    else acts.push({ label: t('ok'), cls: 'go', icon: 'yes', fn: () => { const to = guideTour && guideThen; guideTour = false; if (to) go(to); } });
    owlSay(t(tried ? 'g_tried' : 'g_' + id), { title: `${i + 1}/${GUIDE.length} · ${guideTitle(id)}`, html: picsHtml(pics), mood: tried ? 'cheer' : 'talk', acts });
  },
  update() { snore(this); },
  draw() {
    const T = treeArea(), t0 = V.t;
    drawSky(ctx, t0); drawTree(ctx, T, t0); lifeTree(ctx, T, t0);
    treeOwl(ctx, T, t0, dozing() ? 'sleep' : 'idle');
    fireflies(ctx, t0);
  },
};
MOOD.guide = 'night';

// Practice: the station of card i with a small save of its own. At bedtime the stations sleep, as everywhere.
function tryOut(i) {
  const [sc, tweak, inside = [sc], arg] = GUIDE[i][2];
  if (asleep()) return go('bed');
  practice = { page: i, keep: JSON.parse(JSON.stringify(S)), in: inside };
  Object.assign(S, { st: { cam: 0, gate: 0, forge: 0, extra: 0 }, eye: 0, nest: 0 }, JSON.parse(JSON.stringify(tweak)));
  go(sc, arg);
}

// The tour is offered once, to a new player who has just told the owl a name.
function tourAsk(then) {
  if (!S.hints || S.toured) return then();
  S.toured = 1; save();
  owlSay(t('g_ask'), { html: picsHtml(['help', 'jar', 'pie']), acts: [{ label: t('g_skip'), icon: 'play', fn: then },
    { label: t('g_show'), cls: 'go', icon: 'yes', fn: () => go('guide', { from: 'home', tour: true, then: 'hub' }) }] });
}

// The hint line of the Night menu: what comes next, and a way into the guide. The first station not yet played pulses.
function hubHint(n, ready) {
  if (!S.hints) return;
  const b = add(`<button class="btn hintline" id="bHint">${ic('bulb:1', 26)}<span>${esc(t(ready ? 'h_ready' : 'h_stations'))}</span></button>`, n);
  b.onclick = () => { sfx.click(); go('guide', { from: 'hub', page: 'night' }); };
  const next = !ready && n.querySelector('.card:not(.done):not(.bonus)');
  if (next) next.classList.add('pulse');
}

// A reminder in a station when nothing has been touched for a while: [quiet seconds, the line] (lines the owl has already
// said there). Watching and comparing are part of the play, so the owl waits longer where the child has to look.
const HINT = { cam: [14, () => t('camIntro')], gate: [16, () => t('gateTip')], forge: [12, () => t('forgeIntro')], flies: [7, () => sentences(t('fl_intro'))[1]],
  mail: [16, () => t('mail_tip')], code: [16, () => t('code_tip')], tinker: [16, () => t('tinkerIntro')] };
let hintAt = 0;
function hintTick() {
  if (!S.hints || !scene || !has(HINT, scene.id) || V.t - lastTouch < HINT[scene.id][0] || V.t - hintAt < 20 || $('.veil') || $('.toast')) return;
  hintAt = V.t; toast(HINT[scene.id][1](), 2600);
}
