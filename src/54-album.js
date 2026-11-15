// ---------- Sticker album: the magpies by name, their disguises, and the shiny treasures of their nest ----------
// Every sticker is a small drawing in the icon box (-1 to 1), used as `stk:<id>`.
const stkPie = o => c => magpie(c, .115, .8, .0165, 0, o);
const shine = (c, x, y, r = .2) => { starPath(c, x, y, r, r * .28, 4); c.fillStyle = '#fff'; c.fill(); };
const STK = {
  m1: stkPie({ pose: 'sneak' }), m2: stkPie({ face: 'smug', carry: true }), m3: stkPie({ hat: 1, face: 'sweat' }),
  m4: stkPie({ face: 'sleep' }), m5: stkPie({ pose: 'dizzy' }), m6: stkPie({ baron: 1, face: 'smug' }),
  d1: stkPie({ disguise: 1 }), d2: stkPie({ disguise: 2 }), d3: stkPie({ disguise: 3, face: 'puppy' }), d4: stkPie({ disguise: 4 }),
  d5: c => { poly(c, [-.2, .42, -.98, .6, -.93, .76, -.15, .62], '#1a1a22'); line(c, [-.3, .52, -.88, .67], '#3f6fe0', .05); critter(c, .12, .8, .0165, 0, 0); },   // a squirrel suit with a magpie's tail
  d6: c => { c.save(); c.rotate(-.15); c.scale(.8, .8); badgeArt(c, 'star', 2); c.restore(); c.save(); c.rotate(.55); rr(c, -.8, -.15, 1.6, .3, .04); c.fillStyle = 'rgba(255,246,200,.92)'; c.fill(); c.restore(); },   // a badge mended with tape
  t1: c => { c.save(); c.rotate(.6); rr(c, -.07, -.15, .14, 1.1, .07); c.fillStyle = '#dfe6f5'; c.fill(); ell(c, 0, -.5, .34, .45, '#dfe6f5'); ell(c, -.08, -.58, .11, .2, '#fff'); c.restore(); shine(c, .55, -.6); },
  t2: c => { circ(c, 0, 0, .8, '#c93a26'); circ(c, 0, 0, .6, '#ff8a7a'); for (const [x, y] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]]) circ(c, x, y, .09, '#7a1f12'); shine(c, .5, -.55); },
  t3: c => { c.save(); c.rotate(-.7); c.beginPath(); c.arc(0, -.5, .32, 0, TAU); c.lineWidth = .18; c.strokeStyle = '#ffcf4a'; c.stroke(); c.fillStyle = '#ffcf4a'; for (const [x, y, w, h] of [[-.08, -.2, .16, 1.1], [.06, .5, .3, .13], [.06, .72, .22, .13]]) { rr(c, x, y, w, h, .04); c.fill(); } c.restore(); shine(c, -.5, -.55); },
  t4: c => { circ(c, 0, .04, .8, '#b07a00'); circ(c, 0, -.04, .76, '#ffcf4a'); starPath(c, 0, -.04, .42, .18, 5); c.fillStyle = '#b07a00'; c.fill(); shine(c, .5, -.55); },
  t5: c => { circ(c, 0, 0, .78, '#3a8de0'); c.beginPath(); c.arc(0, 0, .48, .3, 2.6); c.lineWidth = .16; c.strokeStyle = '#bfeee4'; c.stroke(); circ(c, -.28, -.3, .16, 'rgba(255,255,255,.85)'); shine(c, .55, -.6); },
  t6: c => { c.beginPath(); c.arc(0, .25, .52, 0, TAU); c.lineWidth = .2; c.strokeStyle = '#ffcf4a'; c.stroke(); poly(c, [-.3, -.4, 0, -.92, .3, -.4, 0, -.14], '#7fd0ff'); line(c, [-.3, -.4, .3, -.4], '#fff', .06); shine(c, .55, -.7); },
  t7: c => { starPath(c, 0, 0, .85, .7, 14); c.fillStyle = '#2ec4a6'; c.fill(); circ(c, 0, 0, .55, '#bfeee4'); starPath(c, 0, 0, .32, .14, 5); c.fillStyle = '#1e8f7a'; c.fill(); shine(c, .55, -.6); },
  t8: c => { c.beginPath(); c.moveTo(-.55, .62); c.lineTo(-.42, -.3); c.arc(0, -.3, .42, Math.PI, 0); c.lineTo(.55, .62); c.closePath(); c.fillStyle = '#c9d2e6'; c.fill(); rr(c, -.66, .5, 1.32, .28, .1); c.fillStyle = '#aeb9d0'; c.fill(); for (let i = 0; i < 9; i++) circ(c, -.24 + (i % 3) * .24, -.3 + (i / 3 | 0) * .24, .05, '#8a94a8'); shine(c, .5, -.65); },
  t9: c => { c.save(); c.rotate(.5); c.lineWidth = .13; c.strokeStyle = '#ff9ecb'; rr(c, -.42, -.85, .84, 1.7, .42); c.stroke(); rr(c, -.2, -.48, .4, 1.12, .2); c.stroke(); c.restore(); shine(c, .6, -.55); },
  t10: c => { c.beginPath(); c.arc(0, -.68, .16, 0, TAU); c.lineWidth = .09; c.strokeStyle = '#b07a00'; c.stroke(); circ(c, 0, .12, .7, '#ffcf4a'); line(c, [-.42, .3, .42, .3], '#7a4c00', .1); circ(c, 0, .5, .1, '#7a4c00'); shine(c, -.35, -.2); },
  t11: c => { poly(c, [-.72, -.28, -.3, -.76, .36, -.7, .8, -.2, .62, .5, .05, .8, -.6, .56], '#c9d2e6'); for (const p of [[-.3, -.76, 0, -.08, .8, -.2], [0, -.08, .05, .8], [0, -.08, -.72, -.28], [0, -.08, .62, .5]]) line(c, p, '#8a94a8', .06); poly(c, [-.3, -.76, 0, -.08, -.72, -.28], '#eef3ff'); shine(c, .5, -.75); },
  t12: c => { rr(c, -.1, .3, .2, .66, .08); c.fillStyle = '#c8813a'; c.fill(); ell(c, 0, -.2, .62, .7, '#c8813a'); ell(c, 0, -.2, .49, .57, '#bfe6ff'); line(c, [-.22, -.42, .08, -.6], '#fff', .1); line(c, [-.12, -.1, .1, -.24], '#fff', .07); shine(c, .55, -.75); },
};
ICON.stk = (c, id) => STK[id](c);
ICON.stk0 = c => { c.setLineDash([.2, .16]); c.lineWidth = .09; c.strokeStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(0, 0, .82, 0, TAU); c.stroke(); c.setLineDash([]); c.beginPath(); c.arc(0, -.22, .26, Math.PI, Math.PI * 2.45); c.lineTo(0, .22); c.lineWidth = .13; c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke(); circ(c, 0, .5, .09, 'rgba(255,255,255,.6)'); };
ICON.album = c => { rr(c, -.8, -.7, 1.6, 1.45, .15); c.fillStyle = '#c2503c'; c.fill(); rr(c, -.62, -.7, 1.42, 1.45, .12); c.fillStyle = '#fff6da'; c.fill(); line(c, [-.62, -.7, -.62, .75], '#8a2c1e', .1); starPath(c, .1, 0, .45, .2, 5); c.fillStyle = '#ffcf4a'; c.fill(); };
const STK_SETS = [['m1', 'm2', 'm3', 'm4', 'm5', 'm6'], ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'], ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12']];
const STK_OWN = ['m6', 'd6'];   // earned in their own way: the Baron's Night, and fooling the owl as a magpie

// A sticker is 1 while it is new and 2 once it has been seen in the album.
function stick(id) {
  if (S.stk[id]) return false;
  S.stk[id] = 1; save();
  return true;
}
// One sticker the player does not have yet ('' when the album has them all).
function stickAny() {
  const left = STK_SETS.flat().filter(id => !S.stk[id] && !STK_OWN.includes(id));
  if (!left.length) return '';
  const id = pick(left);
  stick(id);
  return id;
}
const stickerPill = id => id ? `<span class="pill pop got">${ic('stk:' + id, 44)}<span>${esc(t('stkNew'))}<br><b>${esc(t('k_' + id))}</b></span></span>` : '';
const stickerHtml = id => id ? `<div class="pics">${stickerPill(id)}</div>` : '';

scenes.album = {
  enter(o = {}) {
    this.from = o.from || this.from || 'home';
    this.page = o.page === undefined ? Math.max(0, STK_SETS.findIndex(set => set.some(id => S.stk[id] === 1))) : o.page;   // open where something is new
    const have = STK_SETS.flat().filter(id => S.stk[id]).length, set = STK_SETS[this.page];
    const bar = add(`<div class="hud"><button class="btn round" id="aBack" aria-label="${esc(t('home'))}">${ic('home', 28)}</button>
      <span class="pill">${ic('album', 24)}<span class="extra">${esc(t('album'))}</span></span>
      <button class="btn round" id="aPals" aria-label="${esc(t('palsT'))}">${ic('pals', 30)}</button><span class="sp"></span>
      <span class="pill">${ic('star', 22)}<span><b>${have}</b>/${STK_SETS.flat().length}</span></span></div>`);
    $('#aBack', bar).onclick = () => { sfx.click(); go(this.from); };
    $('#aPals', bar).onclick = () => { sfx.pop(); go('pals', { from: 'album' }); };   // the friendly magpies have a page of their own
    // Portrait: three stickers in a row; landscape: six. The pictures take the room that is left.
    const cols = wide() ? 6 : 3, rows = Math.ceil(set.length / cols);
    const px = clamp(Math.min((Math.min(V.w, 720) - 16) / cols - 22, (V.h - 150) / rows - 46), 40, 110) | 0;
    const n = add(`<div class="album"><div class="tabs" role="group">${STK_SETS.map((s, i) => `<button class="btn" data-p="${i}" aria-pressed="${i === this.page}">${ic('stk:' + s[0], 30)}<span>${esc(t('set' + i))}</span></button>`).join('')}</div>
      <div class="stks" style="grid-template-columns:repeat(${cols},1fr)">${set.map(id => S.stk[id]
        ? `<button class="stk${S.stk[id] === 1 ? ' new' : ''}" data-id="${id}">${ic('stk:' + id, px)}<span>${esc(t('k_' + id))}</span></button>`
        : `<button class="stk none" data-id="" aria-label="?">${ic('stk0', px)}<span>?</span></button>`).join('')}</div></div>`);
    n.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { sfx.click(); ui.innerHTML = ''; this.enter({ page: +b.dataset.p }); });
    n.querySelectorAll('.stk').forEach(b => b.onclick = () => {
      const id = b.dataset.id;
      if (!id) { sfx.empty(); return nudge(b); }
      b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
      id[0] === 't' ? sfx.sparkle() : speak(t('k_' + id), 'pie');   // treasures twinkle, magpies chatter
      later(() => speak(t('k_' + id)), 450);                         // then the owl reads the name
    });
    for (const id of set) if (S.stk[id] === 1) S.stk[id] = 2;        // seen now; the "new" marks stay until the page is left
    save();
  },
  draw() { drawSky(ctx, V.t); fireflies(ctx, V.t, 10); },
};
