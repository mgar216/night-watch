// ---------- Core: helpers, saved state, events, scene manager, input, particles ----------
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
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// Saved career. Everything the player has earned lives here; src/99-main.js repairs a damaged save at boot.
// The fishing is the day between two Nights of The Night Watch (the two games share a site and its storage), so each player
// of the Night Watch has a fishing career of their own; the first player keeps the original key.
let nwSlot = 0, nwSave = {};
try { nwSlot = clamp(localStorage.getItem('nightwatch.slot') | 0, 0, 3); nwSave = JSON.parse(localStorage.getItem('nightwatch.v1' + (nwSlot ? '.' + (nwSlot + 1) : '')) || '{}') || {}; } catch (e) { /* private mode, or no Night Watch here */ }
const SAVE = 'firstlight.v1' + (nwSlot ? '.' + (nwSlot + 1) : '');
// `#day` in the address: the Chief comes from the Night Watch at first light, and goes back to it in the evening.
let day = location.hash === '#day', dayCatch = 0, dayTold = false;
const S = {
  lang: -1, mute: false, vol: .8, name: '',
  look: { col: 0, hat: '', boat: 0 },        // the Junior Chief: feather colour, hat, boat paint
  moons: 0, earned: 0,                       // in the purse now, and earned in a lifetime
  log: {},                                   // species id -> { n: catches, best: grams, seen: 1, id: 1, lure, depth }
  own: { rod0: 1, line0: 1, reel0: 1 },      // goods: 1 when owned, or how many are left (lures)
  rig: { rod: 'rod0', line: 'line0', reel: 'reel0', lure: 'worm' },
  ach: {},                                   // trophies earned
  stat: {},                                  // counters for the trophies
  at: 'tree',                                // the map node where the Chief stands
  gate: 0,                                   // 1 once the player chose to enter the Drowned Chapel
  tut: {},                                   // lessons already given
};
// Only the fields this game knows are taken from a save (or from a pasted save code): anything else is left behind.
try { const o = JSON.parse(localStorage.getItem(SAVE) || '{}'); for (const k in S) if (has(o, k)) S[k] = o[k]; } catch (e) { /* private mode: play without saving */ }
// Coming from the Night Watch, the Chief keeps that game's language and sound switch and, in a new career, its name.
const nwLang = Number.isInteger(nwSave.lang) && LANGS[nwSave.lang] ? nwSave.lang : -1;
if (day) { if (nwLang >= 0) S.lang = nwLang; if (typeof nwSave.mute === 'boolean') S.mute = nwSave.mute; if (!S.name && typeof nwSave.name === 'string') S.name = nwSave.name.slice(0, 16); }
function save() { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) { /* ignore */ } }
function setLang(i) {
  lang = S.lang = i; save();
  document.documentElement.lang = LANGS[i];
  document.title = t('title');
}
setLang(Number.isInteger(S.lang) && LANGS[S.lang] ? S.lang : nwLang >= 0 ? nwLang : Math.max(0, LANGS.indexOf((navigator.language || 'en').slice(0, 2))));

// Events tie the parts together without knowing each other: the fishing emits, the trophies and the logbook listen.
const subs = {};
const on = (evt, fn) => { (subs[evt] || (subs[evt] = [])).push(fn); };
const emit = (evt, data = {}) => { for (const fn of subs[evt] || []) fn(data); };

// DOM helpers: scenes build their overlay from small HTML snippets.
function add(html, parent = ui) {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  const n = d.firstChild;
  parent.appendChild(n);
  paintIcons(n);
  return n;
}
// The styles of a part live with the part: each file adds its own rules once, at load time.
function css(text) { document.head.appendChild(Object.assign(document.createElement('style'), { textContent: text })); }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function say(text) { $('#live').textContent = text; }
function toast(text, ms = 1800) {
  const n = add(`<div class="toast">${esc(text)}</div>`);
  n.style.animationDuration = ms + 'ms';
  say(text);
  setTimeout(() => n.remove(), ms);
}
// Restart the small "no" shake on an element.
function nudge(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
// Timers that die with the scene, so a late callback never touches the next screen.
let timers = [];
function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

// Scenes: { enter(arg), update(dt), draw(), down(x,y), move(x,y), up(x,y,cancelled), key(e), keyup(e), resize(), exit() }
const scenes = {};
let scene = null;
function go(name, arg) {
  if (scene && scene.exit) scene.exit();
  timers.forEach(clearTimeout); timers = [];
  ui.innerHTML = '';
  fx.length = 0;
  hold.on = false;
  scene = scenes[name];
  scene.name = name; scene.arg = arg;   // `name`, not `id`: a scene may keep an id of its own (the fishing scene's is its water)
  scene.enter(arg);
}

// Particles: sparkles, drops, stars, floating text.
const fx = [];
function burst(x, y, n, o = {}) {
  if (calm.matches) n = Math.ceil(n / 4);
  for (let i = 0; i < n; i++) {
    const a = o.arc ? -Math.PI / 2 + rnd(-o.arc, o.arc) : rnd(TAU), v = rnd(.3, 1) * (o.speed || 160);
    fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0), g: o.g === undefined ? 220 : o.g, life: 0,
      max: rnd(.5, 1) * (o.life || .9), size: rnd(.6, 1) * (o.size || 7), color: o.colors ? pick(o.colors) : (o.color || '#ffd86b'),
      kind: o.kind || 'spark', rot: rnd(TAU), spin: rnd(-6, 6) });
  }
}
function floatText(x, y, text, color = '#fff6da', size = 22) {
  fx.push({ x, y, vx: 0, vy: -46, g: 0, life: 0, max: 1.3, size, color, kind: 'text', text, rot: 0, spin: 0 });
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
    } else if (p.kind === 'drop') {
      ctx.beginPath(); ctx.ellipse(0, 0, p.size * .45, p.size * .8, Math.atan2(p.vy, p.vx) - Math.PI / 2, 0, TAU); ctx.fill();
    } else if (p.kind === 'star') {
      ctx.rotate(p.rot); starPath(ctx, 0, 0, p.size, p.size * .45, 5); ctx.fill();
    } else if (p.kind === 'ring') {
      ctx.globalAlpha = k; ctx.lineWidth = 2; ctx.strokeStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size * (2 - k) * 2, p.size * (2 - k) * .6, 0, 0, TAU); ctx.stroke();
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

// Input. Pointer events cover touch, mouse and pen; keys go to the scene.
// `hold` is the one "hold to reel" control, the same for every input: a finger or a mouse button held on the scene,
// or the space bar. `hold.dir` says which way the rod leans: the half of the screen that is held, or the arrow keys / A and D.
const hold = { on: false, x: 0, y: 0, dir: 0 };
const ptr = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
const lean = x => { hold.dir = x < V.w * .5 ? -1 : 1; };
cv.addEventListener('pointerdown', e => { audioOn(); const [x, y] = ptr(e); hold.on = true; hold.x = x; hold.y = y; lean(x); if (scene && scene.down) scene.down(x, y); });
addEventListener('pointermove', e => { const [x, y] = ptr(e); if (hold.on && e.pointerType !== 'key') { hold.x = x; hold.y = y; lean(x); } if (scene && scene.move) scene.move(x, y); });
addEventListener('pointerup', e => { hold.on = false; if (scene && scene.up) scene.up(...ptr(e)); });
addEventListener('pointercancel', e => { hold.on = false; if (scene && scene.up) scene.up(...ptr(e), true); });
addEventListener('blur', () => { hold.on = false; });
// While a dialog is open the keys belong to its buttons, not to the scene underneath.
const typing = e => /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
addEventListener('keydown', e => {
  audioOn();
  if ($('.veil') || typing(e)) return;
  if (e.key === ' ' && e.target.tagName !== 'BUTTON') { hold.on = true; e.preventDefault(); }
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') hold.dir = -1;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') hold.dir = 1;
  if (scene && scene.key && !e.repeat) scene.key(e);
});
addEventListener('keyup', e => { if (e.key === ' ') hold.on = false; if (scene && scene.keyup) scene.keyup(e); });
addEventListener('contextmenu', e => e.preventDefault());
ui.addEventListener('pointerdown', () => audioOn());
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
