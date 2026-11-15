// ---------- Core: helpers, saved state, scene manager, input, particles ----------
const $ = (s, r = document) => r.querySelector(s);
const cv = $('#c'), ctx = cv.getContext('2d'), ui = $('#ui');
const V = { w: 0, h: 0, t: 0 };                      // viewport (CSS px) and clock (s)
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ease = k => 1 - (1 - k) * (1 - k);
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);   // a key of the table itself, never an inherited one such as "constructor"

// Saved career. Ranks follow completed Nights: 2 -> Guard, 4 -> Senior Guard, 7 -> Chief.
// Up to four players share one device: each has a save slot of their own (the first one keeps the original key).
const SLOTS = 4, slotKey = i => 'nightwatch.v1' + (i ? '.' + (i + 1) : '');
let slot = 0;
try { slot = clamp(localStorage.getItem('nightwatch.slot') | 0, 0, SLOTS - 1); } catch (e) { /* private mode: one player, nothing saved */ }
const SAVE = slotKey(slot);
const S = { lang: -1, mute: false, name: '', night: 1, st: { cam: 0, gate: 0, forge: 0, extra: 0 }, beams: 30, stars: 0,
  items: [{ t: 'cam', m: 1 }], nest: 0, testStar: 0, gateStar: 0, briefed: 0, tinkered: 0, promo: false,
  voice: true, stk: {}, own: {}, hat: '', scarf: '', zhat: '', zscarf: '', boss: 0, fooled: 0,   // owl's voice on; stickers; wardrobe; last Baron Night won
  day: -1,     // 1 while the day after a finished Night has not begun (first light, fishing); -1 in a save from before there were days
  gifts: {},   // gifts of the Legendary fish that the owl has told the player about (src/49-gifts.js)
  bedN: 3, bed: { d: '', n: 0, more: 0 },   // bedtime after so many Nights a day (0: never); Nights finished on day d, and Nights a grown-up added
  caught: 0, pals: {}, helper: '',          // magpies caught kindly; friends the owl has introduced; the friend who helps in raids (src/57-pals.js)
  lit: 0,                                   // three-star Nights: each lights a lantern on the Watchwood map of the fishing game
  grow: 0,                                  // additions to the treehouse that the owl has told of (src/46-life.js)
  visit: { d: '', done: 0, n: 0 },          // today's visitor: the day, whether the wish was granted, visits so far
  mem: { d: '', k: '' }, memD: '',          // what happened last, for the day's first words; the day they were last said
  eye: 0,                                   // owl's eyes for tonight's Gate Check: a good day's fishing brings one
  flag: '',                                 // the flag the player painted (src/59-flag.js)
  bday: '', bdayY: 0,                       // birthday as month-day, and the year it was last kept
  sup: '',                                  // the last day's fishing that was counted (its id), so that supper comes once
  saga: 0 };                                // chapters of the Baron's story seen; at 3 his museum is open and he raids no more
try { Object.assign(S, JSON.parse(localStorage.getItem(SAVE) || '{}')); } catch (e) { /* private mode: play without saving */ }
function save() { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { /* ignore */ } }
const rankAt = night => night > 7 ? 3 : night > 4 ? 2 : night > 2 ? 1 : 0;
const rank = () => rankAt(S.night);
function setLang(i) {
  lang = S.lang = i; save();
  document.documentElement.lang = LANGS[i];
  document.title = t('title');
}
setLang(LANGS[S.lang] ? S.lang : Math.max(0, LANGS.indexOf((navigator.language || 'en').slice(0, 2))));

// DOM helpers: scenes build their overlay from small HTML snippets.
function add(html, parent = ui) {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  const n = d.firstChild;
  parent.appendChild(n);
  paintIcons(n);
  return n;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function say(text) { $('#live').textContent = text; }
function toast(text, ms = 1600) {
  const n = add(`<div class="toast">${esc(text)}</div>`);
  n.style.animationDuration = ms + 'ms';   // a longer line stays longer
  say(text); speak(text, 'owl', true);
  setTimeout(() => n.remove(), ms);
}
// Restart the small "no" shake on an element (a full bar, an empty try).
function nudge(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
// Timers that die with the scene, so a late callback never touches the next screen.
let timers = [];
function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

// Scenes: { enter(arg), update(dt), draw(), down(x,y), move(x,y), up(x,y), key(e), exit() }
const scenes = {};
let scene = null;
// The music follows the scene (src/33-music.js); a scene that is not listed is a station.
const MOOD = { home: 'night', hub: 'night', tinker: 'night', album: 'night', wear: 'night', badge: 'night', pals: 'night', flag: 'night', story: 'night', saga: 'night', raid: 'raid', boss: 'raid', dawn: 'dawn', bed: 'bed' };
function go(name, arg) {
  if (scene && scene.exit) scene.exit();
  timers.forEach(clearTimeout); timers = [];
  ui.innerHTML = '';
  fx.length = 0;
  hush();
  scene = scenes[name];
  scene.id = name;
  music.mood(MOOD[name] || 'watch');
  scene.enter(arg);
}

// Particles: sparkles, feathers, stars, floating text.
const fx = [];
function burst(x, y, n, o = {}) {
  if (calm.matches) n = Math.ceil(n / 4);
  for (let i = 0; i < n; i++) {
    const a = rnd(TAU), v = rnd(.3, 1) * (o.speed || 160);
    fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0), g: o.g === undefined ? 220 : o.g, life: 0,
      max: rnd(.5, 1) * (o.life || .9), size: rnd(.6, 1) * (o.size || 7), color: o.colors ? pick(o.colors) : (o.color || '#ffd86b'),
      kind: o.kind || 'spark', rot: rnd(TAU), spin: rnd(-6, 6) });
  }
}
function floatText(x, y, text, color = '#fff6da') {
  fx.push({ x, y, vx: 0, vy: -46, g: 0, life: 0, max: 1.1, size: 22, color, kind: 'text', text, rot: 0, spin: 0 });
}
function drawFx(dt) {
  for (let i = fx.length - 1; i >= 0; i--) {
    const p = fx[i];
    p.life += dt;
    if (p.life >= p.max) { fx.splice(i, 1); continue; }
    p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.spin * dt;
    const k = 1 - p.life / p.max;
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 2);
    ctx.translate(p.x, p.y);
    ctx.fillStyle = p.color;
    if (p.kind === 'text') {
      ctx.font = `900 ${p.size}px ui-rounded, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.6)';
      ctx.strokeText(p.text, 0, 0); ctx.fillText(p.text, 0, 0);
    } else if (p.kind === 'feather') {
      ctx.rotate(p.rot);
      ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * .35, 0, 0, TAU); ctx.fill();
    } else if (p.kind === 'star') {
      ctx.rotate(p.rot); starPath(ctx, 0, 0, p.size, p.size * .45, 5); ctx.fill();
    } else {
      const r = p.size * k;
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .3, -r * .3); ctx.lineTo(r, 0); ctx.lineTo(r * .3, r * .3);
      ctx.lineTo(0, r); ctx.lineTo(-r * .3, r * .3); ctx.lineTo(-r, 0); ctx.lineTo(-r * .3, -r * .3); ctx.fill();
    }
    ctx.restore();
  }
}

// Canvas sizing (device pixel ratio capped at 2 to stay smooth on phones).
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  V.w = window.innerWidth; V.h = window.innerHeight;
  cv.width = Math.round(V.w * dpr); cv.height = Math.round(V.h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (scene && scene.resize) scene.resize();
}
addEventListener('resize', resize);
addEventListener('orientationchange', resize);

// Input: pointer events cover touch, mouse and pen; keys go to the scene.
const ptr = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
// Secrets of the menu screens (scenes marked `sky`): a shaken phone, or one quick swipe, scatters the fireflies;
// `lastTouch` lets the owl doze off when nobody plays.
let lastTouch = 0, scatterT = -9, winkT = -9, swipe = null, grav = null;
function scatter() {
  if (!scene || !scene.sky || V.t - scatterT < 2.6) return;
  scatterT = V.t; sfx.sparkle(); buzz(30);
}
addEventListener('devicemotion', e => {
  const g = e.accelerationIncludingGravity;
  if (!g || g.x === null) return;
  if (!grav) grav = [g.x, g.y, g.z];
  const d = Math.hypot(g.x - grav[0], g.y - grav[1], g.z - grav[2]);   // how far this moment is from the resting pull of gravity
  grav[0] += (g.x - grav[0]) * .1; grav[1] += (g.y - grav[1]) * .1; grav[2] += (g.z - grav[2]) * .1;
  if (d > 12) scatter();
});
// (the event comes along as a last argument, for a scene that must tell one finger from another: the flag's painter)
cv.addEventListener('pointerdown', e => { audioOn(); lastTouch = V.t; const p = ptr(e); swipe = [p[0], p[1], V.t]; if (scene && scene.down) scene.down(...p, e); });
addEventListener('pointermove', e => { if (scene && scene.move) scene.move(...ptr(e), e); });
addEventListener('pointerup', e => {
  const p = ptr(e);
  if (swipe && V.t - swipe[2] < .4 && Math.hypot(p[0] - swipe[0], p[1] - swipe[1]) > Math.min(V.w, V.h) * .35) scatter();
  swipe = null;
  if (scene && scene.up) scene.up(...p);
});
addEventListener('pointercancel', e => { swipe = null; if (scene && scene.up) scene.up(...ptr(e), true); });
// While a dialog is open the keys belong to its buttons, not to the scene underneath.
addEventListener('keydown', e => { audioOn(); lastTouch = V.t; if (scene && scene.key && !$('.veil') && !/INPUT/.test(e.target.tagName)) scene.key(e); });
addEventListener('contextmenu', e => e.preventDefault());
ui.addEventListener('pointerdown', () => { audioOn(); lastTouch = V.t; });   // buttons count as playing too: the owl must not doze off meanwhile
addEventListener('click', () => audioOn(), true);   // iOS only unlocks sound on a completed tap

let last = 0;
function frame(ms) {
  const dt = Math.min(.05, (ms - last) / 1000 || 0);
  last = ms; V.t += dt;
  if (scene) {
    if (scene.update) scene.update(dt);
    scene.draw(dt);
    drawFx(dt);
    drawPortrait();
  }
  requestAnimationFrame(frame);
}
