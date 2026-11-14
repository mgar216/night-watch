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
  const v = add(`<div class="veil"><div class="dlg pop" role="dialog" aria-modal="true" aria-labelledby="owlText">
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
  if (!o.quiet) sfx.hoot();
  ($('.btn.go', acts) || acts.firstChild).focus({ preventScroll: true });   // Enter continues; it never restarts or leaves by surprise
  return v;
}
function drawPortrait() {
  if (!portrait) return;
  if (!portrait.el.isConnected) { portrait = null; return; }
  const { c, d } = portrait;
  c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, 108, 100);
  owl(c, 54, 97, .78, V.t, portrait.mood === 'talk' && V.t - portrait.t0 > 2.2 ? 'idle' : portrait.mood, false);
}
const picsHtml = names => `<div class="pics">${names.map(n => ic(n, 40)).join('')}</div>`;

// Top bar used by most screens. `slim` bars drop the Night, star and moonbeam pills on low landscape screens.
function hud(backFn, extra = '', slim = false) {
  const n = add(`<div class="hud${slim ? ' slim' : ''}"><button class="btn round" aria-label="${esc(t('home'))}">${ic('home', 28)}</button>
    <span class="pill extra">${esc(t('night', { n: S.night }))}</span><span class="sp"></span>${extra}
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
function award(id, stars) {
  const gain = Math.max(0, stars - S.st[id]);
  S.st[id] = Math.max(S.st[id], stars); S.stars += gain; S.beams += gain * 5; save();
  refreshHud();
  return gain;
}
function stationWin(id, stars, gain, text, html = '') {
  sfx.win();
  burst(V.w / 2, V.h * .35, 40, { colors: ['#ffd86b', '#fff', '#ff9ecb', '#7fd0ff'], speed: 320, life: 1.4, kind: 'star', size: 9 });
  owlSay(text || t('win'), { title: t('s_' + id), stars, mood: 'cheer', quiet: true,
    html: html + (gain ? `<div class="pics"><span class="pill pop">${ic('beam', 22)}<b>+${gain * 5}</b></span></div>` : ''),
    acts: [{ label: t('retry'), icon: 'retry', fn: () => go(id) }, { label: t('ok'), cls: 'go', icon: 'yes', fn: () => go('hub') }] });
}
function stationFail(id, text, retry) {
  sfx.oops();
  owlSay(text, { mood: 'idle', quiet: true, acts: [{ label: t('home'), icon: 'home', fn: () => go('hub') }, { label: t('retry'), cls: 'go', icon: 'retry', fn: retry || (() => go(id)) }] });
}
function askName(then) {
  const v = owlSay(t('nameAsk'), { html: `<div class="pics"><input class="name" maxlength="16" autocomplete="off" placeholder="${esc(t('nameDef'))}" value="${esc(S.name)}" aria-label="${esc(t('nameAsk'))}"></div>`,
    acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: () => { save(); then(); } }] });
  $('input', v).oninput = e => { S.name = e.target.value.trim().slice(0, 16); };
}

// ----- Home -----
scenes.home = {
  enter() {
    this.cheer = 0;
    const n = add(`<div class="home"><h1 class="title">${esc(t('title'))}</h1><div class="mid"></div>
      <div class="row"><button class="btn gold big pulse" id="bPlay">${ic('play', 30)}${esc(t('play'))}</button></div>
      <div class="row"><div class="langs" role="group" aria-label="${esc(t('lang'))}">${LANGS.map((l, i) => `<button class="btn" data-l="${i}" aria-label="${esc(L.langName[i])}" aria-pressed="${i === lang}">${ic('bird:' + i, 30)}${l.toUpperCase()}</button>`).join('')}</div>
      <button class="btn round" id="bSnd" aria-label="${esc(t('sound'))}" aria-pressed="${!S.mute}">${ic('snd:' + (S.mute ? 0 : 1), 28)}</button>
      <button class="btn round" id="bBadge" aria-label="${esc(t('badgeTitle'))}">${ic('rank:' + rank(), 34)}</button></div>
      <p class="foot">${esc(t('foot'))}</p></div>`);
    $('#bPlay', n).onclick = () => { sfx.pop(); S.name || S.night > 1 || S.briefed ? go('hub') : askName(() => go('hub')); };
    $('#bSnd', n).onclick = () => { setMute(!S.mute); sfx.click(); go('home'); };
    $('#bBadge', n).onclick = () => { sfx.click(); go('badge', { from: 'home' }); };
    n.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { setLang(+b.dataset.l); sfx.chirp(); go('home'); });
  },
  down(x, y) {
    const T = treeArea(), [lx, ly] = toTree(T, x, y);
    for (const [jx, jy, r] of [[300, 868, 95], ...JARS.map(j => [...j, 46])]) if (Math.hypot(lx - jx, ly - jy) < r) { this.jarT = V.t; sfx.sparkle(); burst(x, y, 22, { speed: 220, size: 9, colors: ['#ffd86b', '#fff6da', '#fff'] }); return; }
    if (Math.hypot(lx - OWL[0], ly - OWL[1] + 45) < 60) { sfx.hoot(); this.cheer = V.t + 1.2; }
  },
  draw() {
    const T = treeArea(), t0 = V.t;
    drawSky(ctx, t0); drawTree(ctx, T, t0);
    treeOwl(ctx, T, t0, t0 < this.cheer ? 'cheer' : 'idle');
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
scenes.hub = {
  enter() {
    if (S.promo) return go('badge', { promo: true });   // a ceremony that a reload interrupted still takes place
    hud(() => go('home'), `<button class="btn round" id="bBadge" aria-label="${esc(t('badgeTitle'))}">${ic('rank:' + rank(), 34)}</button>`);
    $('#bBadge').onclick = () => { sfx.click(); go('badge', { from: 'hub' }); };
    const ready = S.st.cam && S.st.gate && S.st.forge;
    const n = add(`<div class="hub"><div class="cards">${[['cam', 'cam'], ['gate', 'gateI'], ['forge', 'lock']].map(([id, i]) =>
      `<button class="card ${S.st[id] ? 'done' : ''}" data-s="${id}" aria-label="${esc(t('s_' + id))}, ${S.st[id]}/3">${ic(i, 44)}<span>${esc(t('s_' + id))}</span>${starsHtml(S.st[id], 18)}</button>`).join('')}</div>
      <div class="row" style="display:flex;gap:.5em;flex-wrap:wrap;justify-content:center">
      <button class="btn" id="bTinker">${ic('hammer', 28)}${esc(t('s_tinker'))}</button>
      <button class="btn gold ${ready ? 'pulse' : ''}" id="bRaid" ${ready ? '' : 'disabled'}>${ic('jar', 28)}${esc(t('raidGo'))}</button></div></div>`);
    n.querySelectorAll('.card').forEach(b => b.onclick = () => { sfx.pop(); go(b.dataset.s); });
    $('#bTinker', n).onclick = () => { sfx.pop(); go('tinker'); };
    $('#bRaid', n).onclick = () => { sfx.alarm(); go('raid'); };
    if (S.briefed < S.night) {
      const back = S.nest > 0;
      S.briefed = S.night; S.nest = 0; save();
      owlSay(t('b' + Math.min(S.night, 8)), { title: t('night', { n: S.night }), html: picsHtml(BRIEF_PICS[Math.min(S.night, 8) - 1]),
        acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => { if (back) { toast(t('jarsBack')); sfx.chirp(); } } }] });
    }
  },
  draw() {
    const T = treeArea(), t0 = V.t;
    drawSky(ctx, t0); drawTree(ctx, T, t0);
    treeOwl(ctx, T, t0);
    zip(ctx, T.ox + (500 + Math.sin(t0 * .7) * 300) * T.k, T.oy + (200 + Math.sin(t0 * 1.4) * 60) * T.k, Math.max(.6, T.k * 1.6), t0, Math.cos(t0 * .7) > 0 ? 1 : -1);
    fireflies(ctx, t0, 10);
  },
};

// The Night ends after the raid: stars, moonbeams, maybe a promotion, then the Tinker Treehouse.
function finishNight(stolen) {
  const stars = stolen === 0 ? 3 : stolen === 1 ? 2 : 1, old = rank();
  S.stars += stars; S.beams += 15 + stars * 10; S.nest = stolen; S.night++; S.st = { cam: 0, gate: 0, forge: 0 };
  S.promo = rank() > old;   // kept in the save, so closing the page here cannot skip the ceremony
  save();
  stolen ? sfx.hoot() : sfx.win();
  owlSay(stolen ? t('raid1') + ' ' + t('raid2') : t('raid0'), { title: t('night', { n: S.night - 1 }), stars, mood: stolen ? 'idle' : 'cheer', quiet: true,
    html: `<div class="pics"><span class="pill pop">${ic('beam', 22)}<b>+${15 + stars * 10}</b></span></div>`,
    acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: () => S.promo ? go('badge', { promo: true }) : go('tinker') }] });
}

// ----- Badge: profile, promotion ceremony and the Chief's forest-wide celebration -----
scenes.badge = {
  enter(o = {}) {
    this.o = o; this.t0 = V.t; this.panel = null;
    const r = rank(), party = this.party = r === 3;   // a Chief always gets the forest-wide celebration
    if (o.promo) sfx.fanfare();
    const n = add(`<div class="bar badgebar"><div class="dlg" style="width:min(26em,100%)">
      <h2>${esc(o.promo ? t('promo', { r: t('rank' + r) }) : t('badgeTitle'))}</h2>
      ${party ? `<div id="fin">${esc(t('finale', { n: playerName() }))}</div>` : ''}
      <div class="pics"><input class="name" maxlength="16" autocomplete="off" placeholder="${esc(t('nameDef'))}" value="${esc(S.name)}" aria-label="${esc(t('nameAsk'))}"></div>
      <div class="pics"><span class="pill">${ic('rank:' + r, 26)}${esc(t('rank' + r))}</span><span class="pill">${ic('star', 22)}<b>${S.stars}</b></span>
      <span class="pill">${ic('moon', 22)}${esc(t('nights'))}: <b>${S.night - 1}</b></span></div>
      <div class="acts"><button class="btn go">${ic('yes', 26)}${esc(t('ok'))}</button></div></div></div>`);
    this.panel = $('.dlg', n);
    $('input', n).oninput = e => { S.name = e.target.value.trim().slice(0, 16); save(); const f = $('#fin', n); if (f) f.textContent = t('finale', { n: playerName() }); };
    $('button', n).onclick = () => { sfx.click(); if (o.promo) { S.promo = false; save(); } go(o.promo ? 'tinker' : o.from || 'home'); };
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
      for (let i = 0; i < 3; i++) magpie(ctx, T.ox + 600 * T.k + i * Math.max(80 * T.k, 58 * s), gy - (still() ? 0 : Math.abs(Math.sin(t0 * 5 + i)) * 10), s, t0, { face: 'shock', dir: -1 });
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
