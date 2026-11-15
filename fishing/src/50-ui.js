// ---------- Shared screens and parts: dialog, top bar, difficulty plaque, home ----------
const wide = () => V.w >= V.h * 1.15;   // the same limit as `min-aspect-ratio: 23/20` in the stylesheet
const playerName = () => S.name || t('nameDef');

// Someone speaks: the owl (kind, the voice of the gates), the Market magpie, or nobody (a plain card).
// A real modal dialog: the rest of the overlay is inert while it is open, and focus goes back afterwards.
// o: { who: 'owl' | 'pie' | '', title, html, acts: [{ label, cls, icon, fn }], mood }
let portrait = null, closeDlg = null;
function talk(text, o = {}) {
  if (closeDlg) closeDlg();   // never two dialogs at once
  const before = document.activeElement, others = [...ui.children], who = o.who === undefined ? 'owl' : o.who;
  const v = add(`<div class="veil"><div class="dlg pop" role="dialog" aria-modal="true" aria-labelledby="dlgText">
    ${o.title ? `<h2>${esc(o.title)}</h2>` : ''}
    <div class="owlrow">${who ? '<canvas class="owl" style="width:108px;height:100px;flex:none"></canvas>' : ''}<div class="bubble${who ? '' : ' plain'}" id="dlgText">${esc(text)}</div></div>
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
  if (who) {
    const el = $('canvas.owl', v), d = Math.min(window.devicePixelRatio || 1, 2);
    el.width = 108 * d; el.height = 100 * d;
    portrait = { el, c: el.getContext('2d'), d, who, mood: o.mood || 'talk', t0: V.t };
  }
  say(text);
  ($('.btn.go', acts) || acts.firstChild).focus({ preventScroll: true });   // Enter continues; it never leaves by surprise
  return v;
}
function drawPortrait() {
  if (!portrait) return;
  if (!portrait.el.isConnected) { portrait = null; return; }
  const { c, d, who } = portrait;
  c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, 108, 100);
  if (who === 'owl') owl(c, 54, 97, .78, V.t, portrait.mood === 'talk' && V.t - portrait.t0 > 2.2 ? 'idle' : portrait.mood, false);
  else magpie(c, 48, 92, 1.15, V.t, { face: 'puppy', disguise: 2 });   // the Market magpie, who went (mostly) honest
}

// Top bar: a way back, room for the scene's own pills, the logbook, and the purse.
function hud(backFn, extra = '', o = {}) {
  const n = add(`<div class="hud"><button class="btn round" id="hBack" aria-label="${esc(t(o.home ? 'home' : 'back'))}">${ic(o.home ? 'home' : 'backI', 28)}</button>
    ${extra}<span class="sp"></span>
    ${o.book === false ? '' : `<button class="btn round" id="hBook" aria-label="${esc(t('book'))}">${ic('bookI', 28)}</button>`}
    <span class="pill" id="pMoons">${ic('moon', 22)}<b>${S.moons}</b></span></div>`);
  $('#hBack', n).onclick = () => { sfx.click(); backFn(); };
  if ($('#hBook', n)) $('#hBook', n).onclick = () => { sfx.click(); const from = scene.name, arg = scene.arg; go('book', { back: () => go(from, arg) }); };
  return n;
}
function refreshHud() { const b = $('#pMoons b'); if (b) b.textContent = S.moons; }

// The difficulty plaque of a water: carved wood near home, then stone, iron and bone as the waters darken.
// One row of seven moons, filled up to the tier; the tier in words; the tackle level; one plain warning.
ICON.moon0 = c => { c.beginPath(); SHAPES.moon(c); c.fillStyle = 'rgba(0,0,0,.28)'; c.fill(); c.lineWidth = .08; c.strokeStyle = 'rgba(255,255,255,.45)'; c.stroke(); };
ICON.backI = c => line(c, [.35, -.65, -.4, 0, .35, .65], '#fff', .3);
ICON.bookI = c => { rr(c, -.85, -.62, 1.7, 1.3, .12); c.fillStyle = '#c8813a'; c.fill(); rr(c, -.72, -.5, .66, 1.06, .06); c.fillStyle = '#fff6da'; c.fill(); rr(c, .06, -.5, .66, 1.06, .06); c.fill(); line(c, [-.56, -.2, -.22, -.2], '#b98a4a', .08); line(c, [-.56, .1, -.22, .1], '#b98a4a', .08); ell(c, .4, 0, .22, .12, '#58a6ff'); poly(c, [.56, 0, .7, -.12, .7, .12], '#58a6ff'); };
const PLAQUE = ['wood', 'wood', 'wood', 'stone', 'stone', 'iron', 'bone'];
const moonRow = (tier, px = 18) => `<span class="moonrow" role="img" aria-label="${tier}/7">${[1, 2, 3, 4, 5, 6, 7].map(i => ic(i <= tier ? 'moon' : 'moon0', px)).join('')}</span>`;
function plaqueHtml(id, extra = '') {
  const a = AREA[id];
  return `<div class="plaque ${PLAQUE[a.tier - 1]}"><b>${esc(t('a_' + id))}</b>${moonRow(a.tier)}
    <span class="tierline">${esc(t('tier' + a.tier))} · ${esc(t('tackleLv', { n: a.tier }))}</span><i>${esc(t('w_' + id))}</i>${extra}</div>`;
}

function askName(then) {
  const v = talk(t('nameAsk'), { html: `<div class="pics"><input class="name" maxlength="16" autocomplete="off" enterkeyhint="done" placeholder="${esc(t('nameDef'))}" value="${esc(S.name)}" aria-label="${esc(t('nameAsk'))}"></div>`,
    acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: () => { save(); then(); } }] });
  const inp = $('input', v);
  inp.oninput = () => { S.name = inp.value.trim().slice(0, 16); };
  // the keyboard's own "done" key presses OK: on a phone the keyboard can cover the button
  inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); inp.blur(); $('.acts .btn', v).click(); } };
}

// ----- Home -----
scenes.home = {
  enter() {
    const n = add(`<div class="home"><h1 class="title">${esc(t('title'))}</h1><p class="subtitle">${esc(t('sub'))}</p><div class="mid"></div>
      <div class="row"><button class="btn gold big pulse" id="bPlay">${ic('play', 30)}${esc(t('play'))}</button>
      <button class="btn round" id="bLessons" aria-label="${esc(t('lessons'))}">${ic('help', 34)}</button></div>
      <div class="row"><div class="langs" role="group" aria-label="${esc(t('lang'))}">${LANGS.map((l, i) => `<button class="btn" data-l="${i}" aria-label="${esc(L.langName[i])}" aria-pressed="${i === lang}">${ic('bird:' + i, 30)}${l.toUpperCase()}</button>`).join('')}</div></div>
      <div class="row"><button class="btn round" id="bSnd" aria-label="${esc(t('sound'))}" aria-pressed="${!S.mute}">${ic('snd:' + (S.mute ? 0 : 1), 28)}</button>
      <input type="range" id="bVol" min="0" max="100" value="${Math.round(S.vol * 100)}" aria-label="${esc(t('volume'))}">
      <a class="btn" id="bSister" href="../index.html${day ? '#night' : ''}">${ic('jar', 26)}${esc(t('sister'))}</a></div></div>`);
    $('#bPlay', n).onclick = () => { sfx.pop(); S.name || allLogged() ? go('map') : askName(() => go('map')); };
    // the owl's lessons (the map, the shop, the five steps of a catch at the pond) are given once; this asks for them again
    $('#bLessons', n).onclick = () => { S.tut = {}; save(); sfx.chirp(); ui.querySelectorAll('.toast').forEach(x => x.remove()); toast(t('lessonsSay'), 2800); };
    $('#bSnd', n).onclick = () => { setMute(!S.mute); sfx.click(); go('home'); };
    $('#bVol', n).oninput = e => { setVol(e.target.value / 100); };
    $('#bVol', n).onchange = () => sfx.pop();
    n.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { setLang(+b.dataset.l); sfx.chirp(); go('home'); });
    emit('enter', { area: 'pond', home: true });   // the pond's ambience plays behind the title
  },
  draw() { drawHome(ctx, V.t); },
};
// The title picture. Replaced by the living pond once the waters are painted (see the waters' file).
let drawHome = (c, t0) => {
  const g = c.createLinearGradient(0, 0, 0, V.h);
  g.addColorStop(0, '#ffd9a0'); g.addColorStop(.45, '#f7a86b'); g.addColorStop(.46, '#2f6f8f'); g.addColorStop(1, '#0d2f4a');
  c.fillStyle = g; c.fillRect(0, 0, V.w, V.h);
  circ(c, V.w * .7, V.h * .34, Math.min(V.w, V.h) * .09, '#fff3c9');
};
