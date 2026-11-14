// ---------- Art: every picture is drawn here with canvas shapes; no image files ----------
function starPath(c, x, y, R, r, n) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / n, q = i % 2 ? r : R;
    c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
  }
  c.closePath();
}
function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function ell(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fillStyle = fill; c.fill(); }
function circ(c, x, y, r, fill) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = fill; c.fill(); }
function poly(c, pts, fill) { c.beginPath(); for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fillStyle = fill; c.fill(); }
function line(c, pts, color, w) { c.beginPath(); for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.strokeStyle = color; c.lineWidth = w; c.lineCap = c.lineJoin = 'round'; c.stroke(); }
function glow(c, x, y, r, rgb = '255,216,107', a = .5) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
// Tonight's real moon. moonPhase(): 0 new, .25 first quarter, .5 full, .75 last quarter, from the mean length of a lunar
// month (good to about half a day). moonLit() traces the lit part as it is seen from the north: lit on the right when waxing.
const moonPhase = (ms = Date.now()) => { const p = ((ms / 864e5 - 10962.76) / 29.530588853) % 1; return p < 0 ? p + 1 : p; };
function moonLit(c, x, y, r, p = moonPhase()) {
  const k = Math.min(Math.cos(p * TAU), .84), wax = p < .5;   // never thinner than a clear crescent: the moon is always there to find
  c.beginPath();
  c.arc(x, y, r, -Math.PI / 2, Math.PI / 2, !wax);
  c.ellipse(x, y, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, wax ? k > 0 : k < 0);
  c.closePath();
}

// Badge shapes and styles. Each colour always carries its own pattern, so colour is never the only cue.
const SHAPES = {
  leaf: c => { c.moveTo(0, -.9); c.bezierCurveTo(.9, -.5, .8, .6, 0, .9); c.bezierCurveTo(-.8, .6, -.9, -.5, 0, -.9); },
  star: c => { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? .42 : .95; c.lineTo(Math.cos(a) * q, Math.sin(a) * q); } c.closePath(); },
  acorn: c => { c.moveTo(-.7, -.2); c.quadraticCurveTo(-.7, -.8, 0, -.8); c.quadraticCurveTo(.7, -.8, .7, -.2); c.quadraticCurveTo(.6, .6, 0, .95); c.quadraticCurveTo(-.6, .6, -.7, -.2); },
  moon: c => { c.arc(0, 0, .9, 1, TAU - 1); c.arc(.45, 0, .758, -1.523, 1.523, true); c.closePath(); },
  drop: c => { c.moveTo(0, -.95); c.bezierCurveTo(.2, -.4, .75, 0, .75, .3); c.arc(0, .3, .75, 0, Math.PI); c.bezierCurveTo(-.75, 0, -.2, -.4, 0, -.95); },
};
const SHAPE_KEYS = Object.keys(SHAPES);
const STYLES = [['#ffcf4a', '#b07a00'], ['#58a6ff', '#0b4f9e'], ['#ff8a7a', '#a32616'], ['#6fdc95', '#14703a']];
function badgeArt(c, shape, style) {
  const [fill, dark] = STYLES[style];
  c.save();
  c.beginPath(); SHAPES[shape](c);
  c.fillStyle = fill; c.fill();
  c.save(); c.clip(); c.strokeStyle = c.fillStyle = dark; c.lineWidth = .12;
  if (style === 1) for (let y = -.8; y < 1; y += .4) { c.beginPath(); c.moveTo(-1, y); c.lineTo(1, y); c.stroke(); }
  if (style === 2) for (let y = -.8; y < 1; y += .42) for (let x = -.8; x < 1; x += .42) circ(c, x + (Math.round(y / .42) % 2 ? .21 : 0), y, .09, dark);
  if (style === 3) for (let r = .25; r < 1.2; r += .3) { c.beginPath(); c.arc(0, .1, r, 0, TAU); c.stroke(); }
  c.restore();
  c.beginPath(); SHAPES[shape](c); c.lineWidth = .12; c.strokeStyle = '#fff'; c.lineJoin = 'round'; c.stroke();
  c.restore();
}

// Icons live in a box from -1 to 1. `ic()` gives the HTML, `paintIcons()` draws them after insertion.
const ICON = {
  star: c => { starPath(c, 0, .05, .95, .42, 5); c.fillStyle = '#ffd24a'; c.fill(); c.lineWidth = .1; c.strokeStyle = '#b07a00'; c.lineJoin = 'round'; c.stroke(); },
  star0: c => { starPath(c, 0, .05, .9, .4, 5); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill(); c.lineWidth = .1; c.setLineDash([.18, .14]); c.strokeStyle = 'rgba(255,255,255,.6)'; c.stroke(); },
  beam: c => { glow(c, 0, 0, 1, '190,220,255', .6); c.beginPath(); SHAPES.moon(c); c.fillStyle = '#dff0ff'; c.fill(); starPath(c, .45, -.35, .3, .12, 4); c.fillStyle = '#fff'; c.fill(); },
  moon: c => { c.beginPath(); SHAPES.moon(c); c.fillStyle = '#ffe9a3'; c.fill(); c.lineWidth = .08; c.strokeStyle = '#c79a2e'; c.stroke(); },
  berry: c => { circ(c, -.35, .3, .5, '#d83a5c'); circ(c, .4, .35, .5, '#c22b4e'); circ(c, .05, -.2, .5, '#e84d6e'); line(c, [.05, -.7, .1, -.95], '#3d7a3a', .14); ell(c, .4, -.85, .3, .14, '#58a84f', -.5); circ(c, -.1, -.35, .12, 'rgba(255,255,255,.7)'); },
  leaf: c => { c.beginPath(); SHAPES.leaf(c); c.fillStyle = '#62c26a'; c.fill(); line(c, [0, -.75, 0, .95], '#2e7a3a', .1); line(c, [0, -.2, .4, -.45], '#2e7a3a', .07); line(c, [0, .2, -.4, -.05], '#2e7a3a', .07); },
  acorn: c => { ell(c, 0, .25, .55, .68, '#c98a45'); c.beginPath(); c.arc(0, -.15, .72, Math.PI, 0); c.closePath(); c.fillStyle = '#7a4e22'; c.fill(); line(c, [0, -.85, .1, -1], '#7a4e22', .16); circ(c, -.2, .2, .12, 'rgba(255,255,255,.5)'); },
  mushroom: c => { rr(c, -.28, -.05, .56, .95, .25); c.fillStyle = '#fff3dc'; c.fill(); c.beginPath(); c.arc(0, -.05, .9, Math.PI, 0); c.closePath(); c.fillStyle = '#e8503a'; c.fill(); circ(c, -.4, -.45, .17, '#fff'); circ(c, .3, -.6, .13, '#fff'); circ(c, .45, -.25, .1, '#fff'); },
  feather: c => { c.save(); c.rotate(.6); ell(c, 0, -.1, .38, .85, '#7fb6f5'); line(c, [0, -.9, 0, 1], '#2f5fa8', .09); line(c, [0, .2, -.3, -.05], '#2f5fa8', .06); line(c, [0, -.2, .3, -.45], '#2f5fa8', .06); c.restore(); },
  flower: c => { for (let i = 0; i < 6; i++) ell(c, Math.cos(i * TAU / 6) * .52, Math.sin(i * TAU / 6) * .52, .4, .4, '#ff9ecb'); circ(c, 0, 0, .32, '#ffd24a'); },
  sun: c => { for (let i = 0; i < 8; i++) { const a = i * TAU / 8; line(c, [Math.cos(a) * .68, Math.sin(a) * .68, Math.cos(a) * .95, Math.sin(a) * .95], '#ffb02e', .16); } circ(c, 0, 0, .55, '#ffd24a'); circ(c, -.18, -.08, .07, '#7a4c00'); circ(c, .18, -.08, .07, '#7a4c00'); c.beginPath(); c.arc(0, .08, .22, .2, Math.PI - .2); c.strokeStyle = '#7a4c00'; c.lineWidth = .07; c.stroke(); },
  pizza: c => { poly(c, [-.85, -.6, .85, -.6, 0, .95], '#f6c04a'); poly(c, [-.95, -.75, .95, -.75, .85, -.5, -.85, -.5], '#c8813a'); circ(c, -.25, -.2, .17, '#d83a3a'); circ(c, .25, -.3, .15, '#d83a3a'); circ(c, .02, .25, .15, '#d83a3a'); },
  dragon: c => { poly(c, [-.3, -.6, -.55, -1, -.05, -.75], '#3d9a52'); poly(c, [.3, -.6, .55, -1, .05, -.75], '#3d9a52'); ell(c, 0, -.1, .7, .62, '#5cc46e'); ell(c, 0, .45, .52, .4, '#7ad88a'); circ(c, -.28, -.2, .2, '#fff'); circ(c, .28, -.2, .2, '#fff'); circ(c, -.25, -.18, .09, '#222'); circ(c, .31, -.18, .09, '#222'); circ(c, -.15, .45, .06, '#2a6e3a'); circ(c, .15, .45, .06, '#2a6e3a'); poly(c, [.3, .7, .7, .95, .45, .6], '#ff9a3a'); },
  banana: c => { c.beginPath(); c.moveTo(-.8, -.5); c.quadraticCurveTo(-.5, .9, .85, .35); c.quadraticCurveTo(-.1, .45, -.55, -.6); c.closePath(); c.fillStyle = '#ffd93b'; c.fill(); c.lineWidth = .08; c.strokeStyle = '#b8901a'; c.stroke(); circ(c, -.68, -.58, .12, '#6b4a1a'); },
  rocket: c => { c.save(); c.rotate(.6); poly(c, [-.3, .5, -.7, .9, -.3, .1], '#e8503a'); poly(c, [.3, .5, .7, .9, .3, .1], '#e8503a'); c.beginPath(); c.moveTo(0, -1); c.quadraticCurveTo(.5, -.4, .35, .6); c.lineTo(-.35, .6); c.quadraticCurveTo(-.5, -.4, 0, -1); c.fillStyle = '#eef3ff'; c.fill(); circ(c, 0, -.2, .2, '#58a6ff'); poly(c, [-.2, .6, 0, 1, .2, .6], '#ffb02e'); c.restore(); },
  cat: c => { poly(c, [-.75, -.2, -.65, -.95, -.15, -.6], '#f2a04a'); poly(c, [.75, -.2, .65, -.95, .15, -.6], '#f2a04a'); ell(c, 0, .1, .8, .7, '#f7b668'); ell(c, -.3, 0, .1, .16, '#222'); ell(c, .3, 0, .1, .16, '#222'); poly(c, [-.1, .25, .1, .25, 0, .38], '#e8607a'); line(c, [-.9, .3, -.4, .35], '#7a4c1a', .05); line(c, [.9, .3, .4, .35], '#7a4c1a', .05); },
  fish: c => { poly(c, [.4, 0, .95, -.5, .95, .5], '#3a8de0'); ell(c, -.15, 0, .75, .5, '#58a6ff'); circ(c, -.5, -.12, .13, '#fff'); circ(c, -.52, -.12, .06, '#222'); line(c, [0, -.3, .15, 0, 0, .3], '#2a6fc0', .08); },
  cake: c => { rr(c, -.75, 0, 1.5, .8, .15); c.fillStyle = '#f7c9a0'; c.fill(); rr(c, -.75, -.15, 1.5, .4, .18); c.fillStyle = '#ff9ecb'; c.fill(); rr(c, -.07, -.7, .14, .5, .05); c.fillStyle = '#58a6ff'; c.fill(); ell(c, 0, -.82, .1, .16, '#ffb02e'); },
  robot: c => { line(c, [0, -.7, 0, -.95], '#8a94a8', .1); circ(c, 0, -.95, .1, '#e8503a'); rr(c, -.7, -.7, 1.4, 1.1, .2); c.fillStyle = '#b9c4d8'; c.fill(); circ(c, -.3, -.25, .18, '#fff'); circ(c, .3, -.25, .18, '#fff'); circ(c, -.3, -.25, .08, '#222'); circ(c, .3, -.25, .08, '#222'); rr(c, -.35, .08, .7, .16, .06); c.fillStyle = '#5a6478'; c.fill(); rr(c, -.45, .5, .9, .45, .12); c.fillStyle = '#8a94a8'; c.fill(); },
  frog: c => { ell(c, 0, .2, .85, .62, '#5cc46e'); circ(c, -.42, -.4, .3, '#5cc46e'); circ(c, .42, -.4, .3, '#5cc46e'); circ(c, -.42, -.42, .17, '#fff'); circ(c, .42, -.42, .17, '#fff'); circ(c, -.42, -.4, .08, '#222'); circ(c, .42, -.4, .08, '#222'); c.beginPath(); c.arc(0, .1, .5, .15, Math.PI - .15); c.strokeStyle = '#1f6e34'; c.lineWidth = .08; c.stroke(); },
  boat: c => { line(c, [0, .3, 0, -.9], '#7a4e22', .1); poly(c, [.08, -.85, .08, .15, .75, .15], '#fff3dc'); poly(c, [-.08, -.6, -.08, .15, -.6, .15], '#ff8a7a'); poly(c, [-.9, .3, .9, .3, .6, .8, -.6, .8], '#c8813a'); },
  drum: c => { rr(c, -.7, -.3, 1.4, 1, .2); c.fillStyle = '#e8503a'; c.fill(); line(c, [-.7, -.1, -.35, .6, 0, -.1, .35, .6, .7, -.1], '#ffd24a', .07); ell(c, 0, -.3, .7, .25, '#fff3dc'); line(c, [-.9, -.95, -.2, -.4], '#7a4e22', .1); line(c, [.9, -.95, .2, -.4], '#7a4e22', .1); },
  cam: c => { rr(c, -.8, -.45, 1.15, .8, .18); c.fillStyle = '#dfe6f5'; c.fill(); poly(c, [.35, -.2, .9, -.5, .9, .4, .35, .1], '#aeb9d0'); circ(c, -.25, -.05, .25, '#22305e'); circ(c, -.25, -.05, .11, '#7fd0ff'); circ(c, .12, -.28, .07, '#e8503a'); line(c, [-.2, .35, -.2, .8, -.6, .8, .2, .8], '#8a94a8', .12); },
  lamp: c => { glow(c, 0, .05, 1, '255,216,107', .7); rr(c, -.3, -.75, .6, .18, .06); c.fillStyle = '#7a4e22'; c.fill(); rr(c, -.42, -.57, .84, 1.1, .2); c.fillStyle = '#ffe9a3'; c.fill(); c.lineWidth = .1; c.strokeStyle = '#7a4e22'; c.stroke(); ell(c, 0, .05, .14, .26, '#ff9a3a'); rr(c, -.5, .5, 1, .2, .06); c.fillStyle = '#7a4e22'; c.fill(); c.beginPath(); c.arc(0, -.75, .22, Math.PI, 0); c.lineWidth = .08; c.stroke(); },
  bell: c => { c.beginPath(); c.moveTo(-.7, .5); c.quadraticCurveTo(-.5, .3, -.5, -.2); c.arc(0, -.2, .5, Math.PI, 0); c.quadraticCurveTo(.5, .3, .7, .5); c.closePath(); c.fillStyle = '#ffcf4a'; c.fill(); c.lineWidth = .08; c.strokeStyle = '#b07a00'; c.stroke(); circ(c, 0, .68, .17, '#b07a00'); circ(c, 0, -.78, .12, '#b07a00'); },
  shield: c => { c.beginPath(); c.moveTo(0, -.95); c.lineTo(.8, -.6); c.quadraticCurveTo(.8, .5, 0, .95); c.quadraticCurveTo(-.8, .5, -.8, -.6); c.closePath(); c.fillStyle = '#7fd0ff'; c.fill(); c.lineWidth = .12; c.strokeStyle = '#fff'; c.stroke(); starPath(c, 0, -.05, .42, .18, 5); c.fillStyle = '#fff'; c.fill(); },
  banner: c => { line(c, [-.95, -.6, 0, -.4, .95, -.6], '#fff3dc', .07); [['#ff8a7a', -.7], ['#ffd24a', -.25], ['#6fdc95', .2], ['#58a6ff', .65]].forEach(([col, x], i) => poly(c, [x - .2, -.5 + (i === 0 || i === 3 ? -.04 : .06), x + .2, -.5 + (i === 0 || i === 3 ? -.04 : .06), x, .25], col)); },
  flowers: c => { rr(c, -.85, .2, 1.7, .6, .1); c.fillStyle = '#a8663a'; c.fill(); [[-.5, '#ff9ecb'], [0, '#ffd24a'], [.5, '#ff8a7a']].forEach(([x, col]) => { line(c, [x, .2, x, -.25], '#3d9a52', .09); for (let i = 0; i < 5; i++) circ(c, x + Math.cos(i * TAU / 5) * .17, -.4 + Math.sin(i * TAU / 5) * .17, .13, col); circ(c, x, -.4, .09, '#fff'); }); },
  scope: c => { line(c, [0, .1, -.5, .95], '#7a4e22', .1); line(c, [0, .1, .5, .95], '#7a4e22', .1); c.save(); c.rotate(-.5); rr(c, -.85, -.2, 1.2, .4, .08); c.fillStyle = '#c9a25a'; c.fill(); rr(c, .3, -.28, .6, .56, .08); c.fillStyle = '#e8c984'; c.fill(); c.restore(); },
  lights: c => { c.beginPath(); c.moveTo(-.95, -.5); c.quadraticCurveTo(0, .1, .95, -.5); c.strokeStyle = '#fff3dc'; c.lineWidth = .06; c.stroke(); [['#ff8a7a', -.7, -.25], ['#ffd24a', -.33, -.02], ['#6fdc95', .05, .05], ['#58a6ff', .4, -.05], ['#ff9ecb', .75, -.28]].forEach(([col, x, y]) => { glow(c, x, y + .15, .35, '255,255,255', .35); ell(c, x, y + .15, .13, .19, col); }); },
  jar: c => { glow(c, 0, .1, 1, '255,216,107', .6); rr(c, -.5, -.5, 1, 1.4, .3); c.fillStyle = 'rgba(255,233,163,.85)'; c.fill(); c.lineWidth = .08; c.strokeStyle = '#fff'; c.stroke(); rr(c, -.42, -.8, .84, .3, .08); c.fillStyle = '#b98a4a'; c.fill(); circ(c, -.15, .1, .09, '#fff'); circ(c, .2, .4, .08, '#fff'); circ(c, .12, -.15, .07, '#fff'); },
  torch: c => { poly(c, [.1, -.3, .95, -.8, .95, .6], 'rgba(255,233,163,.55)'); c.save(); c.rotate(-.12); rr(c, -.9, -.2, .9, .4, .1); c.fillStyle = '#58a6ff'; c.fill(); poly(c, [0, -.2, .3, -.4, .3, .4, 0, .2], '#dfe6f5'); c.restore(); },
  lock: c => { c.beginPath(); c.arc(0, -.3, .4, Math.PI, 0); c.lineWidth = .18; c.strokeStyle = '#dfe6f5'; c.stroke(); rr(c, -.65, -.3, 1.3, 1.1, .2); c.fillStyle = '#ffcf4a'; c.fill(); circ(c, 0, .15, .16, '#7a4c00'); rr(c, -.07, .15, .14, .35, .04); c.fillStyle = '#7a4c00'; c.fill(); },
  gateI: c => { c.beginPath(); c.moveTo(-.7, .9); c.lineTo(-.7, -.2); c.arc(0, -.2, .7, Math.PI, 0); c.lineTo(.7, .9); c.closePath(); c.fillStyle = '#a8663a'; c.fill(); c.lineWidth = .1; c.strokeStyle = '#ffe9a3'; c.stroke(); line(c, [0, -.9, 0, .9], '#7a4e22', .08); circ(c, .3, .2, .1, '#ffd24a'); },
  hammer: c => { c.save(); c.rotate(.7); rr(c, -.1, -.5, .2, 1.45, .08); c.fillStyle = '#c8813a'; c.fill(); rr(c, -.55, -.9, 1.1, .5, .12); c.fillStyle = '#b9c4d8'; c.fill(); c.restore(); },
  snd: (c, on) => { poly(c, [-.8, -.25, -.45, -.25, 0, -.65, 0, .65, -.45, .25, -.8, .25], '#fff'); c.lineWidth = .13; c.strokeStyle = '#fff'; c.lineCap = 'round'; if (on === '1') { c.beginPath(); c.arc(.05, 0, .45, -.8, .8); c.stroke(); c.beginPath(); c.arc(.05, 0, .8, -.8, .8); c.stroke(); } else line(c, [.3, -.35, .9, .35, .6, 0, .9, -.35, .3, .35], '#ff8a7a', .13); },
  home: c => { poly(c, [-.95, -.05, 0, -.9, .95, -.05], '#fff'); rr(c, -.65, -.1, 1.3, .95, .1); c.fillStyle = '#fff'; c.fill(); rr(c, -.18, .3, .36, .55, .05); c.fillStyle = '#2b3f8f'; c.fill(); },
  play: c => poly(c, [-.5, -.8, .85, 0, -.5, .8], '#fff'),
  retry: c => { c.beginPath(); c.arc(0, 0, .65, -.3, TAU - 1.4); c.lineWidth = .22; c.strokeStyle = '#fff'; c.lineCap = 'round'; c.stroke(); poly(c, [.25, -.95, .95, -.5, .3, -.15], '#fff'); },
  yes: c => line(c, [-.7, .05, -.2, .6, .75, -.6], '#fff', .3),
  no: c => line(c, [-.6, -.6, .6, .6, 0, 0, .6, -.6, -.6, .6], '#fff', .3),
  // Language birds: same friendly bird, three different crests and bellies, plus the code letters beside it.
  bird: (c, i) => { i = +i; const bel = ['#ff8a5a', '#ff6b8a', '#ffd24a'][i]; ell(c, 0, .15, .7, .62, '#8a5a3a'); ell(c, .05, .32, .45, .38, bel); circ(c, .3, -.25, .42, '#8a5a3a'); circ(c, .42, -.3, .1, '#fff'); circ(c, .44, -.3, .05, '#222'); poly(c, [.68, -.28, 1, -.18, .68, -.08], '#ffb02e'); poly(c, [-.6, .1, -1, -.15, -.95, .35], '#6b4226'); if (i === 1) circ(c, .3, -.6, .2, '#222'); if (i === 2) poly(c, [.1, -.6, .2, -1, .35, -.65, .5, -.95, .5, -.55], '#ffb02e'); },
  badge: (c, shape, style) => badgeArt(c, shape, +style),
  // Rank badge: a gold shield with one chevron per rank step and a star for the Chief.
  rank: (c, n) => { c.beginPath(); c.moveTo(0, -.95); c.lineTo(.85, -.6); c.quadraticCurveTo(.85, .5, 0, .98); c.quadraticCurveTo(-.85, .5, -.85, -.6); c.closePath(); c.fillStyle = '#2b3f8f'; c.fill(); c.lineWidth = .12; c.strokeStyle = '#ffd24a'; c.stroke(); n = +n; for (let i = 0; i < Math.min(n, 2) + 1; i++) line(c, [-.4, .1 + i * .25 - (n > 2 ? -.1 : .2), 0, .35 + i * .25 - (n > 2 ? -.1 : .2), .4, .1 + i * .25 - (n > 2 ? -.1 : .2)], '#ffd24a', .13); if (n > 2) { starPath(c, 0, -.35, .36, .16, 5); c.fillStyle = '#ffd24a'; c.fill(); } },
};
function ic(name, px = 28) { return `<canvas class="ic" data-i="${name}" data-s="${px}"></canvas>`; }
function drawIcon(c, name, x, y, size) {
  const [base, ...args] = name.split(':');
  c.save(); c.translate(x, y); c.scale(size / 2, size / 2); c.lineCap = c.lineJoin = 'round';
  ICON[base](c, ...args);
  c.restore();
}
function paintIcons(root) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const list = root.matches && root.matches('canvas.ic') ? [root] : root.querySelectorAll('canvas.ic');
  for (const el of list) {
    const px = +el.dataset.s;
    el.width = el.height = Math.round(px * dpr);
    el.style.width = el.style.height = px + 'px';
    const c = el.getContext('2d');
    c.scale(dpr, dpr);
    drawIcon(c, el.dataset.i, px / 2, px / 2, px * .92);
  }
}
const starsHtml = (n, px = 30) => `<div class="stars">${[1, 2, 3].map(i => ic(i <= n ? 'star' : 'star0', px)).join('')}</div>`;

// A glowing firefly jar. `lit` 0..1 dims it; `t` animates the fireflies.
function jar(c, x, y, s, t, lit = 1) {
  glow(c, x, y, s * 2.2, '255,216,107', .45 * lit);
  rr(c, x - s * .5, y - s * .55, s, s * 1.3, s * .28);
  c.fillStyle = `rgba(255,233,163,${.25 + .5 * lit})`; c.fill();
  c.lineWidth = Math.max(1, s * .07); c.strokeStyle = `rgba(255,255,255,${.5 + .4 * lit})`; c.stroke();
  rr(c, x - s * .42, y - s * .8, s * .84, s * .28, s * .08); c.fillStyle = '#b98a4a'; c.fill();
  for (let i = 0; i < 4; i++) {
    const a = t * (1 + i * .3) + i * 1.7;
    circ(c, x + Math.cos(a) * s * .25, y + s * .12 + Math.sin(a * 1.3) * s * .35, s * (.06 + .03 * Math.sin(t * 5 + i)), `rgba(255,255,255,${lit})`);
  }
}
