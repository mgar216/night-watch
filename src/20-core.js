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

// Saved career. Ranks follow completed Nights: 2 -> Guard, 4 -> Senior Guard, 7 -> Chief.
const SAVE = 'nightwatch.v1';
const S = { lang: -1, mute: false, name: '', night: 1, st: { cam: 0, gate: 0, forge: 0 }, beams: 30, stars: 0,
  items: [{ t: 'cam', m: 1 }], nest: 0, testStar: 0, gateStar: 0, briefed: 0, tinkered: 0, promo: false };
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
function toast(text) {
  const n = add(`<div class="toast">${esc(text)}</div>`);
  say(text);
  setTimeout(() => n.remove(), 1600);
}
// Restart the small "no" shake on an element (a full bar, an empty try).
function nudge(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
// Timers that die with the scene, so a late callback never touches the next screen.
let timers = [];
function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

// Scenes: { enter(arg), update(dt), draw(), down(x,y), move(x,y), up(x,y), key(e), exit() }
const scenes = {};
let scene = null;
function go(name, arg) {
  if (scene && scene.exit) scene.exit();
  timers.forEach(clearTimeout); timers = [];
  ui.innerHTML = '';
  fx.length = 0;
  scene = scenes[name];
  scene.id = name;
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
cv.addEventListener('pointerdown', e => { audioOn(); if (scene && scene.down) scene.down(...ptr(e)); });
addEventListener('pointermove', e => { if (scene && scene.move) scene.move(...ptr(e)); });
addEventListener('pointerup', e => { if (scene && scene.up) scene.up(...ptr(e)); });
addEventListener('pointercancel', e => { if (scene && scene.up) scene.up(...ptr(e), true); });
// While a dialog is open the keys belong to its buttons, not to the scene underneath.
addEventListener('keydown', e => { audioOn(); if (scene && scene.key && !$('.veil') && !/INPUT/.test(e.target.tagName)) scene.key(e); });
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
