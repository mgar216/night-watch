// ---------- Shared screens: owl dialog, home, hub (Night menu), badge ceremony ----------
const wide = () => V.w >= V.h * 1.15;   // the same limit as `min-aspect-ratio: 23/20` in the stylesheet
const treeArea = () => wide() ? fitTree(0, V.h * .04, V.w * .5, V.h * .94) : fitTree(0, V.h * .09, V.w, V.h * (V.h < 700 ? .55 : .6));
const playerName = () => S.name || t('nameDef');

// The owl speaks: one short sentence, optional pictures / stars, big buttons.
// It is a real modal dialog: the rest of the overlay is inert while it is open, and focus goes back afterwards.
let portrait = null, closeDlg = null;
function owlSay(text, o = {}) {
  if (closeDlg) closeDlg();   // never two dialogs at once
  const before = document.activeElement, others = [...ui.children];
  const v = add(`<div class="veil"><div class="dlg pop${text.length > 240 ? ' long' : ''}" role="dialog" aria-modal="true" aria-labelledby="owlText">
    ${o.title ? `<h2>${esc(o.title)}</h2>` : ''}${o.stars !== undefined ? starsHtml(o.stars, 46) : ''}
    <div class="owlrow"><canvas class="owl" style="width:108px;height:100px;flex:none"></canvas><div class="bubble" id="owlText">${esc(text)}</div></div>
    ${o.html || ''}<div class="acts"></div></div></div>`);
  others.forEach(el => { el.inert = true; });
  closeDlg = () => { v.remove(); portrait = null; closeDlg = null; others.forEach(el => { el.inert = false; }); };
  const acts = $('.acts', v);
  for (const a of o.acts || [{ label: t('ok'), cls: 'go', icon: 'yes' }]) {
    const b = add(`<button class="btn ${a.cls || ''}">${a.icon ? ic(a.icon, 26) : ''}${esc(a.label)}</button>`, acts);
    b.onclick = () => {
      sfx.click(); closeDlg();
      if (before && before.isConnected && before !== document.body) before.focus({ preventScroll: true });
      if (a.fn) a.fn();
    };
  }
  const el = $('canvas.owl', v), d = Math.min(window.devicePixelRatio || 1, 2);
  el.width = 108 * d; el.height = 100 * d;   // the owl is drawn at a scale where raised wings fit; the flashlight beam is left out
  portrait = { el, c: el.getContext('2d'), d, mood: o.mood || 'talk', t0: V.t };
  say(text);
  // the owl says it, or at least hoots (o.voice: the owl's recorded words, where the line on the screen carries the player's name)
  if (S.voice && !S.mute) speak(o.voice || text); else if (!o.quiet) sfx.hoot();
  ($('.btn.go', acts) || acts.firstChild).focus({ preventScroll: true });   // Enter continues; it never restarts or leaves by surprise
  dlgHome(v);
  return v;
}
// A plain modal panel with the same manners as the owl's dialog: the rest is inert, and focus goes back when it closes.
function modal(inner, label, cls = '') {
  if (closeDlg) closeDlg();
  const before = document.activeElement, others = [...ui.children];
  const v = add(`<div class="veil"><div class="dlg pop ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}">${inner}</div></div>`);
  others.forEach(el => { el.inert = true; });
  closeDlg = () => {
    v.remove(); closeDlg = null; others.forEach(el => { el.inert = false; });
    if (before && before.isConnected && before !== document.body) before.focus({ preventScroll: true });
  };
  dlgHome(v);
  return v;
}
// Home stays in reach while a dialog is open. The dialog makes the bar under it inert, so its veil carries a home button
// of its own: exactly over the bar's one, and it does what that one does (in a station: back to the Night menu). A screen
// without such a bar leads to the title; the title screen itself needs none. The stylesheet keeps dialogs clear of it.
function dlgHome(v) {
  if (scene === scenes.home) return;
  const h = [...ui.querySelectorAll('[data-home]')].find(b => !v.contains(b));
  const b = add(`<button class="btn round vhome" aria-label="${esc(h ? h.getAttribute('aria-label') : t('home'))}">${ic(h ? h.dataset.home : 'home', 28)}</button>`, v);
  if (h) { const r = h.getBoundingClientRect(), u = v.getBoundingClientRect(); Object.assign(b.style, { left: r.left - u.left + 'px', top: r.top - u.top + 'px', width: r.width + 'px', height: r.height + 'px' }); }
  b.onclick = () => { closeDlg(); if (h) h.click(); else { sfx.click(); go('home'); } };
  v.classList.add('homed');
}
function drawPortrait() {
  if (!portrait) return;
  if (!portrait.el.isConnected) { portrait = null; return; }
  const { c, d } = portrait;
  c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, 108, 100);
  owl(c, 54, 97, .78, V.t, portrait.mood === 'talk' && V.t - portrait.t0 > 2.2 ? 'idle' : portrait.mood, false);
}
const picsHtml = names => `<div class="pics">${names.map(n => ic(n, 40)).join('')}</div>`;
// The language switch (the title screen, the guide's bar): each language under its own name, with its own bird. A tap
// draws the screen `back` again in the new language.
const langsHtml = () => `<div class="langs" role="group" aria-label="${esc(t('lang'))}">${LANGS.map((l, i) => `<button class="btn" data-l="${i}" aria-label="${esc(L.langName[i])}" aria-pressed="${i === lang}">${ic('bird:' + i, 30)}${l.toUpperCase()}</button>`).join('')}</div>`;
const langsOn = (root, back) => root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { setLang(+b.dataset.l); sfx.chirp(); go(back); });

// Top bar used by most screens. `slim` bars drop the Night, star and moonbeam pills on low landscape screens.
function hud(backFn, extra = '', slim = false) {
  const n = add(`<div class="hud${slim ? ' slim' : ''}"><button class="btn round" data-home="home" aria-label="${esc(t('home'))}">${ic('home', 28)}</button>
    <span class="pill extra">${esc(practice ? t('g_practice') : t('night', { n: S.night }))}</span><span class="sp"></span>${extra}
    <span class="pill" id="pStars">${ic('star', 22)}<b>${S.stars}</b></span><span class="pill" id="pBeams">${ic('beam', 22)}<b>${S.beams}</b></span></div>`);
  $('button', n).onclick = () => { sfx.click(); backFn(); };
  return n;
}
function refreshHud() {
  const a = $('#pStars b'), b = $('#pBeams b');
  if (a) a.textContent = S.stars;
  if (b) b.textContent = S.beams;
}

// Station results. Stars and moonbeams are paid for improvement, so replaying is always worth a try.
// The win is saved the moment it happens (the player may leave during the celebration); the owl's dialog follows.
// From Night 2 each Night also offers one extra station; the three take turns and share one star slot.
const EXTRAS = ['flies', 'mail', 'code'];
const extraOf = night => night >= 2 ? EXTRAS[(night - 2) % EXTRAS.length] : null;
// The first win of a station in a Night also brings a sticker for the album.
let newStk = '';
function award(id, stars) {
  if (practice) { newStk = ''; return 0; }   // tried from the guide: no stars, no moonbeams, no sticker
  const k = EXTRAS.includes(id) ? 'extra' : id, gain = Math.max(0, stars - S.st[k]);
  newStk = stars && !S.st[k] ? stickAny() : '';
  S.st[k] = Math.max(S.st[k], stars); S.stars += gain; S.beams += gain * 5; save();
  refreshHud();
  return gain;
}
function stationWin(id, stars, gain, text, html = '') {
  sfx.win();
  burst(V.w / 2, V.h * .35, 40, { colors: ['#ffd86b', '#fff', '#ff9ecb', '#7fd0ff'], speed: 320, life: 1.4, kind: 'star', size: 9 });
  owlSay(text || t('win'), { title: t('s_' + id), stars, mood: 'cheer', quiet: true,
    html: html + (gain || newStk ? `<div class="pics">${gain ? `<span class="pill pop">${ic('beam', 22)}<b>+${gain * 5}</b></span>` : ''}${stickerPill(newStk)}</div>` : ''),
    acts: [{ label: t('retry'), icon: 'retry', fn: () => go(id) }, { label: t('ok'), cls: 'go', icon: 'yes', fn: () => go('hub') }] });
  newStk = '';
}
function stationFail(id, text, retry) {
  sfx.oops();
  owlSay(text, { mood: 'idle', quiet: true, acts: [{ label: t('home'), icon: 'home', fn: () => go('hub') }, { label: t('retry'), cls: 'go', icon: 'retry', fn: retry || (() => go(id)) }] });
}
// A name field. The keyboard's own "done" key presses the field's button (on a phone the keyboard can cover it), or,
// without a button, just puts the keyboard away.
const NAME_FIELD = () => `<div class="pics"><input class="name" maxlength="16" autocomplete="off" enterkeyhint="done" placeholder="${esc(t('nameDef'))}" value="${esc(S.name)}" aria-label="${esc(t('nameAsk'))}"></div>`;
function nameField(inp, onName, btn) {
  inp.oninput = () => { S.name = inp.value.trim().slice(0, 16); onName(); };
  inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); inp.blur(); if (btn) btn.click(); } };
}
function askName(then) {
  const v = owlSay(t('nameAsk'), { html: NAME_FIELD(), acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: () => { save(); then(); } }] });
  nameField($('input', v), () => {}, $('.acts .btn', v));
}

// ----- Home -----
// Secrets on the menu screens: tap the moon, tap a room, swipe or shake the fireflies; after a quiet while the owl dozes off.
const dozing = () => V.t - lastTouch > 25;
function snore(sc) { if (dozing() && V.t > (sc.snoreT || 0)) { sc.snoreT = V.t + 3.6; sfx.snore(); } }
// Everything that lives at the tree on the menu screens, drawn between the tree and the owl: the gifts of the Legendary
// fish, the friendly magpies, today's visitor.
function lifeTree(c, T, t) { giftTree(c, T, t); palsTree(c, T, t); visitTree(c, T, t); }
scenes.home = {
  sky: true,
  enter() {
    this.cheer = 0;
    const fresh = STK_SETS.flat().some(id => S.stk[id] === 1);
    const n = add(`<div class="home"><h1 class="title">${esc(t('title'))}</h1><div class="mid"></div>
      <div class="row"><button class="btn gold big pulse" id="bPlay">${ic('play', 30)}${esc(t('play'))}</button>
      <button class="btn round" id="bGuide" aria-label="${esc(t('guide'))}">${ic('help', 34)}${S.toured ? '' : '<i class="dot"></i>'}</button></div>
      <div class="row shelf"><button class="btn round" id="bAlbum" aria-label="${esc(t('album'))}">${ic('album', 30)}${fresh ? '<i class="dot"></i>' : ''}</button>
      <button class="btn round" id="bWear" aria-label="${esc(t('wardrobe'))}">${ic('hanger', 30)}</button>
      <button class="btn round" id="bPie" aria-label="${esc(t('s_pie'))}">${ic('pie', 32)}</button>
      <a class="btn round" id="bFish" href="fishing/index.html#day" aria-label="${esc(t('fishing'))}">${ic('fish', 30)}</a>
      <button class="btn round" id="bBadge" aria-label="${esc(t('badgeTitle'))}">${ic('rank:' + rank(), 34)}</button></div>
      <div class="row">${langsHtml()}
      <button class="btn round" id="bSnd" aria-label="${esc(t('sound'))}" aria-pressed="${!S.mute}">${ic('snd:' + (S.mute ? 0 : 1), 28)}</button>
      <button class="btn round" id="bVoice" aria-label="${esc(t('voice'))}" aria-pressed="${S.voice}">${ic('talk:' + (S.voice ? 1 : 0), 28)}</button></div>
      <p class="foot">${esc(t('foot'))}</p></div>`);
    // a new player tells the owl a name, and is offered the tour of the guide once (src/53-guide.js)
    $('#bPlay', n).onclick = () => { sfx.pop(); S.name || S.night > 1 || S.briefed ? go('hub') : askName(() => tourAsk(() => go('hub'))); };
    $('#bGuide', n).onclick = () => { sfx.pop(); go('guide', { from: 'home' }); };
    $('#bSnd', n).onclick = () => { setMute(!S.mute); sfx.click(); go('home'); };
    $('#bVoice', n).onclick = () => { S.voice = !S.voice; save(); sfx.click(); go('home'); if (S.voice) speak(t('win')); };
    $('#bBadge', n).onclick = () => { sfx.click(); go('badge', { from: 'home' }); };
    // at bedtime the fishing and the magpie game sleep too; the album and the wardrobe stay open for a quiet look
    $('#bFish', n).onclick = e => { if (asleep()) { e.preventDefault(); go('bed'); } else { S.day = 0; save(); } };   // going fishing from here is the day as well: first light does not ask again that evening
    for (const [id, sc] of [['#bAlbum', 'album'], ['#bWear', 'wear'], ['#bPie', 'pie']]) $(id, n).onclick = () => { sfx.pop(); sc === 'pie' && asleep() ? go('bed') : go(sc, { from: 'home' }); };
    this.zz = asleep();
    langsOn(n, 'home');
  },
  update() { snore(this); },
  down(x, y) {
    const T = treeArea(), [lx, ly] = toTree(T, x, y);
    for (const [jx, jy, r] of [[300, 868, 95], ...JARS.map(j => [...j, 46])]) if (Math.hypot(lx - jx, ly - jy) < r) { this.jarT = V.t; sfx.sparkle(); burst(x, y, 22, { speed: 220, size: 9, colors: ['#ffd86b', '#fff6da', '#fff'] }); return; }
    if (Math.hypot(lx - OWL[0], ly - OWL[1] + 45) < 60) { sfx.hoot(); this.cheer = V.t + 1.2; return; }
    menuTap(x, y, T);
  },
  draw() {
    const T = treeArea(), t0 = V.t;
    drawSky(ctx, t0); drawTree(ctx, T, t0); lifeTree(ctx, T, t0);
    treeOwl(ctx, T, t0, t0 < this.cheer ? 'cheer' : this.zz || dozing() ? 'sleep' : 'idle');
    const zx = 500 + Math.sin(t0 * .9) * 330, zy = 230 + Math.sin(t0 * 1.8) * 90;
    zip(ctx, T.ox + zx * T.k, T.oy + zy * T.k, Math.max(.6, T.k * 1.6), t0, Math.cos(t0 * .9) > 0 ? 1 : -1);
    // the big jar by the roots: tap it and it sparkles
    const jp = Math.max(0, 1 - (t0 - (this.jarT || -9)) * 3);
    jar(ctx, T.ox + 300 * T.k, T.oy + 868 * T.k, (62 + jp * 14 + (still() ? 0 : Math.sin(t0 * 2.2) * 2)) * T.k, t0, 1);
    fireflies(ctx, t0);
  },
};

// ----- Hub: the Night menu -----
const BRIEF_PICS = [['jar', 'torch'], ['feather', 'jar'], ['cam', 'cam', 'cam'], ['badge:leaf:0', 'lock'], ['torch', 'torch'], ['cam', 'cam', 'cam'], ['star', 'star', 'star'], ['jar', 'beam']];
const isBoss = n => n % 5 === 0 && S.saga < 3;   // every fifth Night the Baron comes with a plan of his own, until his story has ended
const EXTRA_ICON = { flies: 'fliesFly', mail: 'mailBox', code: 'codeNote' };
scenes.hub = {
  sky: true,
  enter() {
    if (S.promo) return go('badge', { promo: true });   // a ceremony that a reload interrupted still takes place
    if (asleep()) return go('bed');                      // enough Nights for one day: the owl says good night
    if (S.day) return go('dawn');                        // first light comes once between two Nights
    if (S.boss === S.night && S.saga < 3 && S.night >= 10 * (S.saga + 1)) return go('saga', { ch: S.saga + 1 });   // a chapter of the Baron's story that a reload or the home button cut short
    // the Night menu greets the player by name (the owl's own word for the player when there is no name). On a phone held
    // sideways there is no room for a line of its own, and the greeting stands in the top bar (the stylesheet shows one of the two).
    const hello = `<span class="pill hello">${esc(S.name ? t('hello', { n: S.name }) : t('helloDef'))}</span>`;
    hud(() => go('home'), `${hello}<button class="btn round" id="bBadge" aria-label="${esc(t('badgeTitle'))}">${ic('rank:' + rank(), 34)}</button>`);
    $('#bBadge').onclick = () => { sfx.click(); go('badge', { from: 'hub' }); };
    // Three stations open the raid; from Night 2 a fourth, extra one takes turns (dashed card: a bonus, never needed).
    const ready = S.st.cam && S.st.gate && S.st.forge, extra = extraOf(S.night), boss = isBoss(S.night) && S.boss !== S.night;
    const cards = [['cam', 'cam', S.st.cam], ['gate', 'gateI', S.st.gate], ['forge', 'lock', S.st.forge]].concat(extra ? [[extra, EXTRA_ICON[extra], S.st.extra]] : []);
    const n = add(`<div class="hub">${hello}<div class="cards${extra ? ' four' : ''}">${cards.map(([id, i, st]) =>
      `<button class="card ${st ? 'done' : ''}${id === extra ? ' bonus' : ''}" data-s="${id}" aria-label="${esc(t('s_' + id))}, ${st}/3">${ic(i, 44)}<span>${esc(t('s_' + id))}</span>${starsHtml(st, 18)}</button>`).join('')}</div>
      <div class="row" style="display:flex;gap:.5em;flex-wrap:wrap;justify-content:center">
      <button class="btn" id="bTinker">${ic('hammer', 28)}${esc(t('s_tinker'))}</button>
      <button class="btn round" id="bGuide" aria-label="${esc(t('guide'))}">${ic('help', 34)}</button>
      <button class="btn gold ${ready ? 'pulse' : ''}" id="bRaid" ${ready ? '' : 'disabled'}>${ic(boss ? 'stk:m6' : 'jar', 28)}${esc(t(boss ? 'bossGo' : 'raidGo'))}</button></div></div>`);
    n.querySelectorAll('.card').forEach(b => b.onclick = () => { sfx.pop(); go(b.dataset.s); });
    $('#bTinker', n).onclick = () => { sfx.pop(); go('tinker'); };
    $('#bGuide', n).onclick = () => { sfx.pop(); go('guide', { from: 'hub' }); };   // the same guide as on the title screen; its home button leads back here
    hubHint(n, ready);   // with hints on: what comes next, and the way into the guide (src/53-guide.js)
    $('#bRaid', n).onclick = () => { sfx.alarm(); boss ? go('boss', { then: () => go('raid') }) : go('raid'); };
    // News first (a gift from a Legendary fish, a new friend, an addition to the treehouse), then the day's first words,
    // then the Night's briefing.
    giftNews(() => palNews(() => growNews(() => greet(() => this.brief()))));
  },
  brief() {
    if (S.briefed >= S.night) return;
    const back = S.nest > 0, b = Math.min(S.night, 8), arc = arcBrief(S.night), wx = weatherLine(S.night);   // later Nights bring new tricks; some Nights have weather
    S.briefed = S.night; S.nest = 0; save();
    // the first briefing welcomes the player by name on the screen; the owl's voice says its recorded welcome
    const said = (arc ? arc.text : t('b' + b)) + (isBoss(S.night) ? ' ' + t('bBoss') : '') + (wx ? ' ' + t(wx) : '');
    owlSay(b === 1 && S.name ? said.replace(t('b1'), () => t('b1n', { n: S.name })) : said, { title: t('night', { n: S.night }), voice: said,
      html: picsHtml((arc ? arc.pics : BRIEF_PICS[b - 1]).concat(isBoss(S.night) ? ['stk:m6'] : [])),
      acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => { if (back) { toast(t('jarsBack')); sfx.chirp(); } } }] });
  },
  update() { snore(this); },
  down(x, y) { menuTap(x, y, treeArea()); },
  draw() {
    const T = treeArea(), t0 = V.t;
    drawSky(ctx, t0); drawTree(ctx, T, t0); lifeTree(ctx, T, t0);
    treeOwl(ctx, T, t0, dozing() ? 'sleep' : 'idle');
    zip(ctx, T.ox + (500 + Math.sin(t0 * .7) * 300) * T.k, T.oy + (200 + Math.sin(t0 * 1.4) * 60) * T.k, Math.max(.6, T.k * 1.6), t0, Math.cos(t0 * .7) > 0 ? 1 : -1);
    fireflies(ctx, t0, 10);
  },
};

// ----- First light: the day between two Nights. The magpies sleep; the Chief may go fishing (the sister game) or rest. -----
// The day is pending in the save from the end of a Night until this choice is made, so closing the page cannot lose it.
scenes.dawn = {
  leave(url) { location.href = url; },   // a method of its own, so that a test can watch the way out instead of leaving the page
  enter() {
    this.t0 = V.t;
    const over = fn => () => { S.day = 0; save(); fn(); };
    sfx.chirp();
    // the veil of this dialog is almost clear: the morning is the picture
    owlSay(t('dawn1'), { title: t('dawnT'), mood: 'cheer', acts: [
      { label: t('dawnRest'), icon: 'moon', fn: over(() => go('hub')) },
      // if the page is still here a while later, there was no way to the fishing game: the Night goes on instead
      { label: t('dawnFish'), cls: 'go', icon: 'fish', fn: over(() => { this.leave('fishing/index.html#day'); later(() => go('hub'), 6000); }) }] }).classList.add('day');
  },
  draw() {
    const T = treeArea(), t0 = V.t, k = still() ? 1 : Math.min(1, (t0 - this.t0) / 2.5), g = ctx.createLinearGradient(0, 0, 0, V.h);
    drawSky(ctx, t0);
    // the night sky warms from the horizon up; the sun climbs where the dialog leaves room: from behind the far hills
    // on a wide screen, in the upper sky across from the moon on a phone (there the horizon lies behind the dialog)
    g.addColorStop(0, `rgba(104,150,222,${.8 * k})`); g.addColorStop(.5, `rgba(255,192,150,${.8 * k})`); g.addColorStop(.8, `rgba(255,214,150,${.6 * k})`); g.addColorStop(1, `rgba(255,214,150,${.4 * k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, V.w, V.h);
    const r = Math.min(V.w, V.h) * .08, sx = V.w * (wide() ? .9 : .15), sy = V.h * (wide() ? .8 - .22 * k : .27 - .13 * k);
    glow(ctx, sx, sy, r * 3.4, '255,238,180', .6 * k); circ(ctx, sx, sy, r, '#fff4cf');
    farHills(ctx, V.w, V.h);
    drawTree(ctx, T, t0); lifeTree(ctx, T, t0);
    treeOwl(ctx, T, t0, 'cheer');
  },
};
// The browser's Back button brings this page back as it was left: on the morning screen, with its question already answered.
addEventListener('pageshow', e => { if (e.persisted && scene === scenes.dawn) go('hub'); });

// ----- Gifts from the water: the Legendary fish of the day leave gifts at the treehouse (the fishing game shares this
// site's storage). The owl tells each piece of news once, at the Night menu; from then on the gift is part of the night
// (src/49-gifts.js draws it). -----
function giftsEarned() {
  try { const log = (JSON.parse(localStorage.getItem('firstlight.v1' + (slot ? '.' + (slot + 1) : '')) || '{}') || {}).log || {}; return GIFTS.filter(id => log[id] && log[id].n > 0); } catch (e) { return []; }
}
function giftNews(then) {
  const id = giftsEarned().find(g => !S.gifts[g]);
  if (!id) return then();
  S.gifts[id] = 1; save();
  // The veil of this dialog is almost clear. When the owl has spoken, a sparkle shows where to look, and the rest waits a moment.
  owlSay(t('gift_' + id), { title: t('giftT'), mood: 'cheer', acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: () => {
    const [x, y] = giftAt(id, treeArea());
    sfx.sparkle(); burst(x, y, 26, { speed: 200, size: 9, kind: 'star', colors: ['#ffd86b', '#fff6da', '#9fe8ff'] });
    later(() => giftNews(then), 1400);
  } }] }).classList.add('clear');
}

// ----- The day's first words: what happened last time, or the birthday. After a good day's fishing there is fish for
// supper, and with it an owl's eye for tonight's Gate Check. -----
function remember(k) { S.mem = { d: today(), k }; }
const dayNo = s => { const [y, m, d] = String(s).split('-').map(Number); return Math.round(Date.UTC(y || 1970, (m || 1) - 1, d || 1) / 864e5); };
const isBirthday = () => !!S.bday && (today(), S.bday === todayMD || S.bday === todayAlso);
// What the day's fishing brought (the fishing game leaves a note in the shared storage): a memory, and from three fish on, supper.
function supper() {
  try {
    const r = JSON.parse(localStorage.getItem('firstlight.day' + (slot ? '.' + (slot + 1) : '')) || 'null');
    if (!r || !(r.n > 0) || !Number.isSafeInteger(r.id) || r.id < 0 || String(r.id) === S.sup) return false;   // the id is the time the day's fishing began
    S.sup = String(r.id); remember('fish');
    if (r.n < 3) return false;
    S.eye = 1;
    return true;
  } catch (e) { return false; }
}
function greet(then) {
  const d = today(), y = +d.split('-')[0], parts = [], fish = supper();
  const party = isBirthday() && S.bdayY !== y;   // once a year: the party hat for the wardrobe and a few moonbeams, also when the date was set later that day
  if (party) { S.bdayY = y; S.own.party = 1; S.beams += 30; parts.push(t('bday1'), t('bday2')); }
  if (S.memD !== d) {
    const away = S.memD ? dayNo(d) - dayNo(S.memD) : 0;   // days since the last visit to the Night menu
    S.memD = d;
    if (!party && away >= 7) parts.push(t('mem_away'));
    else if (!party && S.mem.k && !fish && L['mem_' + S.mem.k]) parts.push(t('mem_' + S.mem.k));
  }
  if (fish) parts.push(t('eye1'));
  save();
  if (!parts.length) return then();
  if (party) { music.mood('party'); sfx.fanfare(); burst(V.w / 2, V.h * .35, 50, { colors: ['#ffd86b', '#ff9ecb', '#7fd0ff', '#6fdc95'], speed: 340, kind: 'star', size: 9, life: 1.5 }); refreshHud(); }
  owlSay(parts.join(' '), { mood: 'cheer', quiet: party,
    html: party ? `<div class="pics">${ic('wear:party', 56)}<span class="pill pop">${ic('beam', 22)}<b>+30</b></span></div>` : fish ? picsHtml(['fish', 'fish', 'fish']) : '',
    acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: then }] });
}

// ----- Bedtime: after so many Nights in one real day the owl says good night until tomorrow. A grown-up sets how many
// (in the players panel; 0 switches it off) and can allow one more Night. The watch's day turns at four in the morning. -----
// The watch's day ('Y-M-D') and its month and day ('M-D'). Drawing asks for them in every frame (the birthday, today's
// visitor), so they are worked out once a second. On 28 February of a year without a 29th, the 29th counts as today
// too: a child born on that day has a birthday every year.
let todayAt = -1, todayS = '', todayMD = '', todayAlso = '';
const today = () => {
  const s = Math.floor(Date.now() / 1e3);
  if (s !== todayAt) {
    const d = new Date(Date.now() - 144e5); todayAt = s; todayMD = (d.getMonth() + 1) + '-' + d.getDate(); todayS = d.getFullYear() + '-' + todayMD;
    todayAlso = todayMD === '2-28' && new Date(d.getFullYear(), 1, 29).getMonth() !== 1 ? '2-29' : '';
  }
  return todayS;
};
const asleep = () => S.bedN > 0 && S.bed.d === today() && S.bed.n >= S.bedN + S.bed.more;
scenes.bed = {
  enter() {
    remember('bed'); save();   // tomorrow's first words praise the rested watcher
    owlSay(t('bed1'), { title: t('bedT'), acts: [
      { label: t('bedMore'), icon: 'lock', fn: () => askGrownUp(() => { S.bed.more++; save(); go('hub'); }, () => go('bed')) },
      { label: t('bedOk'), cls: 'go', icon: 'moon', fn: () => go('home') }] });
  },
  draw() {
    const T = treeArea(), t0 = V.t;
    drawSky(ctx, t0); drawTree(ctx, T, t0); lifeTree(ctx, T, t0);
    treeOwl(ctx, T, t0, 'sleep');
    ctx.fillStyle = 'rgba(4,8,28,.4)'; ctx.fillRect(0, 0, V.w, V.h);   // the lights are low
    fireflies(ctx, t0, 5);
  },
};

// The Night ends after the raid: stars, moonbeams, maybe a promotion, then the Tinker Treehouse, then first light.
// closeNight() counts and saves it the moment the raid is over; the owl's word about it may come later (after a replay).
function closeNight(stolen, laughed = 0) {
  const stars = stolen === 0 ? 3 : stolen === 1 ? 2 : 1, old = rank();
  S.stars += stars; S.beams += 15 + stars * 10; S.nest = stolen; S.night++; S.st = { cam: 0, gate: 0, forge: 0, extra: 0 };
  S.promo = rank() > old;   // kept in the save, so closing the page here cannot skip the ceremony
  S.day = 1;                // nor the day that follows the Night
  if (stolen === 0) S.lit++;   // a Night without a lost jar lights one lantern on the Watchwood map of the fishing game
  // (once his museum is open the Baron is no grumbler any more: that Night is remembered for itself)
  remember(S.boss === S.night - 1 && S.saga < 3 ? 'boss' : S.promo ? 'promo' : laughed ? 'laugh' : stolen === 0 ? 'perfect' : stolen >= 3 ? 'hard' : 'lost');
  if (S.bed.d !== today()) S.bed = { d: today(), n: 0, more: 0 };
  S.bed.n++;                // Nights finished today, for bedtime
  save();
  return stars;
}
function finishNight(stolen, stars = closeNight(stolen)) {
  stolen ? sfx.hoot() : sfx.win();
  // the first lantern comes with a word about what it is for
  owlSay(stolen ? t('raid1') + ' ' + t('raid2') : t('raid0') + (S.lit === 1 ? ' ' + t('lit1') : ''), { title: t('night', { n: nightsDone() }), stars, mood: stolen ? 'idle' : 'cheer', quiet: true,
    html: `<div class="pics"><span class="pill pop">${ic('beam', 22)}<b>+${15 + stars * 10}</b></span>${stolen ? '' : `<span class="pill pop">${ic('lamp', 22)}${esc(t('litNew'))}</span>`}</div>`,
    acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: () => S.promo ? go('badge', { promo: true }) : go('tinker') }] });
}

// ----- Badge: profile, promotion ceremony and the Chief's forest-wide celebration -----
// A promotion starts with its story strip; the ceremony also shows the room the treehouse has just gained.
scenes.badge = {
  enter(o = {}) {
    this.o = o; this.t0 = V.t; this.panel = null;
    const r = rank(), party = this.party = r === 3;   // a Chief always gets the forest-wide celebration
    if (o.promo && !o.told) return go('story', { rank: r, then: () => go('badge', { promo: true, told: true }) });
    if (party || o.promo) music.mood('party');   // a promotion, or the Chief's forest-wide celebration
    if (o.promo) { sfx.fanfare(); later(() => speak(t('promo', { r: t('rank' + r) }) + (party ? ' ' + t('finaleSay') : '')), 1300); }
    const n = add(`<div class="bar badgebar"><div class="dlg" style="width:min(26em,100%)">
      <h2>${esc(o.promo ? t('promo', { r: t('rank' + r) }) : t('badgeTitle'))}</h2>
      ${party ? `<div id="fin">${esc(t('finale', { n: playerName() }))}</div>` : ''}
      ${o.promo ? `<div class="pics"><span class="pill pop got">${ic('room:' + r, 30)}<span>${esc(t('roomNew'))}<br><b>${esc(t('room' + r))}</b></span></span></div>`
        : NAME_FIELD()}
      <div class="pics"><span class="pill">${ic('rank:' + r, 26)}${esc(t('rank' + r))}</span><span class="pill">${ic('star', 22)}<b>${S.stars}</b></span>
      <span class="pill">${ic('moon', 22)}${esc(t('nights'))}: <b>${nightsDone()}</b></span></div>
      <div class="acts"><button class="btn round" id="bCert" aria-label="${esc(t('cert'))}">${ic('cert', 30)}</button>
      ${o.promo ? '' : `<button class="btn round" id="bWho" aria-label="${esc(t('players'))}">${ic('faces', 30)}</button>`}
      <button class="btn go" id="bOk">${ic('yes', 26)}${esc(t('ok'))}</button></div></div></div>`);
    this.panel = $('.dlg', n);
    if ($('input', n)) nameField($('input', n), () => { save(); const f = $('#fin', n); if (f) f.textContent = t('finale', { n: playerName() }); });
    $('#bCert', n).onclick = () => { sfx.click(); showCert(); };
    if ($('#bWho', n)) $('#bWho', n).onclick = () => { sfx.click(); showPlayers(); };
    $('#bOk', n).onclick = () => {
      if (o.promo && V.t - this.t0 < .6) return;   // a second tap meant for the story's last "Next" must not skip the ceremony
      sfx.click(); if (o.promo) { S.promo = false; save(); } go(o.promo ? 'tinker' : o.from || 'home');
    };
    $('#bOk', n).focus({ preventScroll: true });
  },
  draw() {
    // Landscape: the badge (or the party tree) keeps the left half, the panel sits on the right half.
    const t0 = V.t, k = Math.min(1, (t0 - this.t0) * 1.6), land = wide(), aw = land ? V.w / 2 : V.w;
    const cx = aw / 2, cy = land ? V.h * .44 : V.h * .3, size = Math.min(aw, V.h) * (land ? .56 : .42);
    drawSky(ctx, t0);
    if (this.party) {
      // in portrait the party tree uses the room the panel leaves free, so the cheering crowd is never behind it
      const T = land ? fitTree(0, V.h * .02, aw, V.h * .96) : fitTree(0, V.h * .02, V.w, this.panel.getBoundingClientRect().top - V.h * .04);
      drawTree(ctx, T, t0, { jars: JARS.length, nest: 0 });   // the party shows every jar lit and none in the nest
      treeOwl(ctx, T, t0, 'cheer');
      const gy = T.oy + 930 * T.k, s = Math.max(.45, T.k * 1.1);
      for (let i = 0; i < 5; i++) critter(ctx, T.ox + 130 * T.k + i * Math.max(62 * T.k, 44 * s), gy, s, t0 + i * .4, i);
      for (let i = 0; i < 3; i++) magpie(ctx, T.ox + 600 * T.k + i * Math.max(80 * T.k, 58 * s), gy - (still() ? 0 : Math.abs(Math.sin(t0 * 5 + i)) * 10), s, t0, { face: 'joy', dir: -1, disguise: 4 });   // the newest guards, in caps that are far too big
      for (let i = 0; i < 3; i++) zip(ctx, cx + Math.sin(t0 * (1 + i * .3) + i * 2) * aw * .35, V.h * .2 + Math.cos(t0 * 1.7 + i) * V.h * .1, Math.max(.6, T.k * 1.6), t0 + i, 1);
      if (Math.random() < .06) burst(rnd(V.w), rnd(V.h * .5), 14, { colors: ['#ffd86b', '#ff9ecb', '#7fd0ff', '#6fdc95'], speed: 200, kind: 'star', size: 8 });
    } else if (this.o.promo && Math.random() < .08) burst(cx + rnd(-size, size), cy + rnd(-size, size) * .6, 8, { colors: ['#ffd86b', '#fff'], speed: 120, size: 7 });
    fireflies(ctx, t0, 12);
    if (!this.party) {
      const pop = still() ? 1 : .6 + .4 * Math.sin(k * Math.PI / 2) + (this.o.promo ? Math.sin(t0 * 3) * .03 : 0);
      glow(ctx, cx, cy, size * .95, '255,216,107', .4);
      drawIcon(ctx, 'rank:' + rank(), cx, cy, size * pop);
      ctx.font = `900 ${Math.max(18, size * .14)}px ui-rounded, "Segoe UI", Roboto, sans-serif`; ctx.textAlign = 'center';
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(7,13,42,.8)'; ctx.fillStyle = '#fff6da';
      ctx.strokeText(playerName(), cx, cy + size * .68); ctx.fillText(playerName(), cx, cy + size * .68);
    }
  },
};
