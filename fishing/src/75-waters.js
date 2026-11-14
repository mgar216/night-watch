// ---------- The waters: nine painted fishing places, their ambience, and the living title picture ----------
// WATER[id] paints one water in side view for the Engine (contract, section 6): the Chief stands at the near end on
// the left and the water runs to the right. The still parts of a picture are painted once per screen size and
// condition into offscreen canvases; every frame adds only what moves. `amb` plays the generated ambience.
// At load time the title picture (`drawHome`) becomes the living pond at first light.
const WATER = {};
const amb = { set() {}, hit() {}, stop() {}, tick() {} };

{
  // ----- Small helpers -----
  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  const X = (G, p) => G.x0 + (G.x1 - G.x0) * p;                               // screen x of a water point
  const by = (G, bed, p) => G.surf + bed(clamp(p, 0, 1)) * (G.bed - G.surf);   // screen y of the bottom at p (calm water)
  const fr = v => v - Math.floor(v);
  const hash = i => fr(Math.sin(i * 127.1 + 311.7) * 43758.5453);              // a fixed "random" number for an index
  const T = env => still() ? 0 : env.t;                                        // the clock of everything that moves
  // A repeatable random sequence: a repainted layer looks exactly like the one before.
  let seed = 7;
  const sr = (a = 1, b) => { seed = seed * 16807 % 2147483647; const k = (seed - 1) / 2147483646; return b === undefined ? k * a : a + k * (b - a); };
  // A bottom made of points [p, depth], smoothed between them.
  const prof = pts => p => {
    if (p <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (p <= pts[i][0]) {
      const a = pts[i - 1], b = pts[i], k = (p - a[0]) / (b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * (1 - Math.cos(k * Math.PI)) / 2;
    }
    return pts[pts.length - 1][1];
  };
  const mid = (feats, kind, n = 0) => { const f = feats.filter(f => f.kind === kind)[n]; return (f.p0 + f.p1) / 2; };

  // Still layers of the water on screen, rebuilt only when the size, the geometry or the condition changes.
  // Only one water keeps its layers, so a long trip around the map never piles up memory.
  let onScreen = '';
  const slots = {};
  function cached(id, part, G, cond, top, hgt, paint) {
    if (onScreen !== id) { for (const k in slots) delete slots[k]; onScreen = id; }
    const d = dpr();
    let s = slots[part];
    if (!s || s.cond !== cond || s.w !== G.w || s.h !== G.h || s.surf !== G.surf || s.bed !== G.bed || s.x0 !== G.x0 || s.x1 !== G.x1 || s.u !== G.u || s.d !== d) {
      const cv2 = s ? s.cv : document.createElement('canvas');
      cv2.width = Math.max(1, Math.ceil(G.w * d)); cv2.height = Math.max(1, Math.ceil(hgt * d));
      const k = cv2.getContext('2d');
      k.setTransform(d, 0, 0, d, 0, -top * d);   // paint in screen coordinates
      seed = 7;
      paint(k);
      s = slots[part] = { cv: cv2, cond, w: G.w, h: G.h, surf: G.surf, bed: G.bed, x0: G.x0, x1: G.x1, u: G.u, d };
    }
    return s.cv;
  }
  // Soft round sprites (a glow, a hole in the dark) made once and drawn scaled: no new gradient per frame.
  const sprites = {};
  function sprite(name, rgb, m, am) {
    let s = sprites[name];
    if (!s) {
      s = sprites[name] = document.createElement('canvas'); s.width = s.height = 64;
      const k = s.getContext('2d'), g = k.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(m, `rgba(${rgb},${am})`); g.addColorStop(1, `rgba(${rgb},0)`);
      k.fillStyle = g; k.fillRect(0, 0, 64, 64);
    }
    return s;
  }
  function glowAt(c, x, y, r, rgb, a) { c.globalAlpha = a; c.drawImage(sprite(rgb, rgb, .35, .4), x - r, y - r, r * 2, r * 2); c.globalAlpha = 1; }
  // A tall soft ray for the aurora curtains: bright at the foot, fading upwards.
  function raySprite(rgb) {
    const name = 'ray' + rgb;
    let s = sprites[name];
    if (!s) {
      s = sprites[name] = document.createElement('canvas'); s.width = 8; s.height = 64;
      const k = s.getContext('2d'), g = k.createLinearGradient(0, 64, 0, 0);
      g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(.1, `rgba(${rgb},.9)`); g.addColorStop(.35, `rgba(${rgb},.35)`); g.addColorStop(1, `rgba(${rgb},0)`);
      k.fillStyle = g; k.fillRect(0, 0, 8, 64);
    }
    return s;
  }

  // Darkness over the water outside circles of light, painted at a quarter size and stretched (it is soft anyway).
  let mask = null;
  function darkness(c, G, top, rgba, a, b) {
    const q = 4, mw = Math.ceil(G.w / q) + 1, mh = Math.ceil((G.h - top) / q) + 1;
    if (mh < 2) return;
    if (!mask) mask = document.createElement('canvas');
    if (mask.width !== mw || mask.height !== mh) { mask.width = mw; mask.height = mh; }
    const k = mask.getContext('2d'), hole = sprite('hole', '0,0,0', .55, 1);
    k.globalCompositeOperation = 'source-over'; k.clearRect(0, 0, mw, mh); k.fillStyle = rgba; k.fillRect(0, 0, mw, mh);
    k.globalCompositeOperation = 'destination-out';
    if (a) for (let i = 0; i < a.length; i++) { const l = a[i], ry = l.ry || l.r; k.drawImage(hole, (l.x - l.r) / q, (l.y - ry - top) / q, l.r * 2 / q, ry * 2 / q); }
    if (b) for (let i = 0; i < b.length; i++) { const l = b[i], ry = l.ry || l.r; k.drawImage(hole, (l.x - l.r) / q, (l.y - ry - top) / q, l.r * 2 / q, ry * 2 / q); }
    k.globalCompositeOperation = 'source-over';
    c.drawImage(mask, 0, top, mw * q, mh * q);
  }

  // The water surface: a band of the water's colour under a bright line, waving with the clock (flat when still).
  const WY = new Float32Array(420);
  function surface(c, G, env, from, amp, len, spd, fill, col, lw) {
    const t = T(env), y0 = G.surf + (env.swell || 0), n = clamp(Math.ceil((G.w - from) / 6) + 1, 2, 419), step = (G.w - from) / (n - 1);
    for (let i = 0; i < n; i++) { const x = from + i * step; WY[i] = y0 + amp * (Math.sin(x / len + t * spd) * .65 + Math.sin(x / (len * .37) - t * spd * 1.6) * .35); }
    if (fill) {
      c.beginPath(); c.moveTo(from, y0 + amp + 2);
      for (let i = 0; i < n; i++) c.lineTo(from + i * step, WY[i]);
      c.lineTo(G.w, y0 + amp + 2); c.closePath(); c.fillStyle = fill; c.fill();
    }
    c.beginPath(); c.moveTo(from, WY[0]);
    for (let i = 1; i < n; i++) c.lineTo(from + i * step, WY[i]);
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.stroke();
  }
  // Short light glints that drift along the surface (steady when still).
  function glints(c, G, env, n, col, from) {
    const t = T(env), y0 = G.surf + (env.swell || 0), u = G.u, calmly = still();
    c.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const x = from + fr(hash(i) + t * .012 * (1 + hash(i + 9))) * (G.w - from);
      c.globalAlpha = calmly ? .45 : .2 + .6 * Math.abs(Math.sin(t * 1.1 + i * 1.7));
      c.fillRect(x, y0 + (1.5 + hash(i + 5) * 6) * u, (4 + hash(i + 7) * 10) * u, .9 * u);
    }
    c.globalAlpha = 1;
  }
  // Rain falling through the air above the water: one stroke for all drops (frozen streaks when still).
  function rain(c, G, env, n, len, slant, col, lw, y1) {
    const t = T(env);
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const k = fr(hash(i + 50) + t * (.8 + hash(i) * .5)), y = k * (y1 + len) - len, x = (hash(i + 100) * 1.3 - .15) * G.w + slant * (y + len);
      c.moveTo(x, y); c.lineTo(x + slant * len, y + len);
    }
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.stroke();
  }
  // Rings where drops meet the water. Each ring is born, widens and fades; when still they rest half-grown.
  function rings(c, G, env, n, col, x0, x1, size) {
    const t = T(env), y0 = G.surf + (env.swell || 0), calmly = still();
    c.strokeStyle = col; c.lineWidth = .9 * G.u;
    for (let i = 0; i < n; i++) {
      const sp = .7 + hash(i + 3) * .5, ph = t * sp + hash(i), k = calmly ? .5 : fr(ph), gen = Math.floor(ph);
      const x = lerp(x0, x1, hash(i * 13 + gen * 7.3)), r = (2 + k * size) * G.u;
      c.globalAlpha = (1 - k) * .9;
      c.beginPath(); c.ellipse(x, y0 + 1.5 * G.u, r, r * .28, 0, 0, TAU); c.stroke();
    }
    c.globalAlpha = 1;
  }
  // Snow: small flakes drifting down and sideways.
  function snow(c, G, env, n, y1, col, drift) {
    const t = T(env), u = G.u;
    c.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const k = fr(hash(i + 7) + t * (.04 + hash(i) * .05)), x = fr(hash(i + 70) + t * drift * .01) * (G.w + 20 * u) - 10 * u + Math.sin(t * .7 + i) * 5 * u;
      const r = (.7 + hash(i + 3) * 1.3) * u;
      c.globalAlpha = .55 + hash(i + 11) * .45;
      c.beginPath(); c.arc(x, k * y1, r, 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
  }
  // A dragonfly: a long bright body and glassy wings. Wings beat in flight and rest when it has landed.
  function dragonfly(c, x, y, s, t, col, flap) {
    const b = flap ? Math.sin(t * 52) : .35;
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(232,248,255,.62)';
    c.beginPath(); c.ellipse(-1.5, -2.6 - b * 1.6, 6.5, 1.6, -.28 - b * .35, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(1.6, -2.4 - b * 1.4, 5.8, 1.5, .22 + b * .35, 0, TAU); c.fill();
    c.strokeStyle = col; c.lineWidth = 1.6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-11, .6); c.lineTo(2.5, 0); c.stroke();
    c.beginPath(); c.arc(4.2, -.3, 1.9, 0, TAU); c.fillStyle = col; c.fill();
    c.restore();
  }
  // Where a dragonfly is: a few lazy loops away from its perch, then a rest on it. With reduced motion it simply rests.
  const DF = { x: 0, y: 0, land: true };
  function fly(t, period, px, py, rx, ry, k0) {
    const ph = fr(t / period);
    DF.x = px; DF.y = py; DF.land = true;
    if (still() || ph > .55) return DF;
    const e = Math.sin(ph / .55 * Math.PI);
    DF.x = px + (Math.sin(t * 1.3 + k0) * .8 + Math.sin(t * 3.1 + k0) * .2) * rx * e;
    DF.y = py - (Math.abs(Math.sin(t * .9 + k0)) * .6 + .4) * ry * e + Math.sin(t * 4.3) * ry * .08 * e;
    DF.land = false;
    return DF;
  }

  // ----- Building blocks of the still layers -----
  function sky(c, G, s) {
    const g = c.createLinearGradient(0, 0, 0, G.surf);
    g.addColorStop(0, s[0]); g.addColorStop(.62, s[1]); g.addColorStop(1, s[2]);
    c.fillStyle = g; c.fillRect(0, 0, G.w, G.surf + 6 * G.u);
  }
  function stars(c, G, n, y1, col) {
    c.fillStyle = col;
    for (let i = 0; i < n; i++) { c.globalAlpha = sr(.25, .95); c.beginPath(); c.arc(sr(G.w), Math.pow(sr(), 1.5) * y1, (sr() < .12 ? 1.3 : .7) * G.u, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
  }
  function crescent(c, x, y, r, col) { glowAt(c, x, y, r * 4, '210,220,255', .3); c.save(); c.translate(x, y); c.rotate(-.5); c.scale(r, r); c.beginPath(); SHAPES.moon(c); c.fillStyle = col; c.fill(); c.restore(); }
  function sun(c, x, y, r, col, rgb) { glowAt(c, x, y, r * 6, rgb, .7); circ(c, x, y, r, col); }
  function cloud(c, x, y, s, col) {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < 5; i++) {
      const cx = x + (i - 2) * s * .38, cy = y - (i % 2 ? .18 : .04) * s - (i === 2 ? .14 * s : 0), rx = s * (i === 2 ? .5 : .38), ry = s * (i === 2 ? .36 : .25);
      c.moveTo(cx + rx, cy); c.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    }
    c.fill();
  }
  // A long thin cloud lit from below (dusk skies).
  function streak(c, x, y, len, th, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, len, th, 0, 0, TAU); c.fill(); }
  function hills(c, G, base, amp, per, ph, col) {
    c.beginPath(); c.moveTo(-4, base + 4);
    for (let x = -4; x <= G.w + 10; x += 6) c.lineTo(x, base - amp * (.55 + .3 * Math.sin(x / per + ph) + .15 * Math.sin(x / per * 2.7 + ph * 1.9)));
    c.lineTo(G.w + 10, base + 4); c.closePath(); c.fillStyle = col; c.fill();
  }
  const TREE = [[0, -.78, .36], [-.3, -.58, .27], [.3, -.6, .29], [.08, -1.02, .26]];
  function tree(c, x, y, s, col) {
    c.fillStyle = col; c.fillRect(x - s * .06, y - s * .5, s * .12, s * .5);
    c.beginPath();
    for (const b of TREE) { c.moveTo(x + (b[0] + b[2]) * s, y + b[1] * s); c.arc(x + b[0] * s, y + b[1] * s, b[2] * s, 0, TAU); }
    c.fill();
  }
  function pine(c, x, y, s, col) {
    poly(c, [x, y - s, x + s * .2, y - s * .64, x + s * .12, y - s * .64, x + s * .3, y - s * .3, x + s * .18, y - s * .3, x + s * .36, y,
      x - s * .36, y, x - s * .18, y - s * .3, x - s * .3, y - s * .3, x - s * .12, y - s * .64, x - s * .2, y - s * .64], col);
  }
  function bare(c, x, y, s, col, lw) {   // a dead tree, all bare branches
    line(c, [x, y, x + s * .04, y - s * .55, x - s * .06, y - s], col, lw);
    line(c, [x + s * .03, y - s * .45, x + s * .3, y - s * .72, x + s * .36, y - s * .86], col, lw * .7);
    line(c, [x - s * .02, y - s * .68, x - s * .26, y - s * .88], col, lw * .6);
    line(c, [x + s * .18, y - s * .6, x + s * .12, y - s * .8], col, lw * .5);
  }
  // The water body, light at the surface and dark at depth, and the ground under bed(p).
  function body(c, G, w, from = G.surf) {
    const g = c.createLinearGradient(0, G.surf, 0, G.bed);
    g.addColorStop(0, w[0]); g.addColorStop(.32, w[1]); g.addColorStop(1, w[2]);
    c.fillStyle = g; c.fillRect(0, from, G.w, G.h + 80 * G.u - from);
  }
  function ground(c, G, bed, cols, rough = 0) {
    const u = G.u;
    c.beginPath(); c.moveTo(-4, G.h + 80 * u);
    for (let x = -4; x <= G.w + 8; x += 4) c.lineTo(x, by(G, bed, (x - G.x0) / (G.x1 - G.x0)) + rough * u * Math.sin(x / (9 * u)) * Math.sin(x / (23 * u) + 1));
    c.lineTo(G.w + 8, G.h + 80 * u); c.closePath();
    c.fillStyle = earth(c, G, cols); c.fill();
  }
  // One gradient for the bottom and the near bank, so the two meet without a seam.
  function earth(c, G, cols) {
    const g = c.createLinearGradient(0, G.surf, 0, G.bed + 20 * G.u);
    g.addColorStop(0, cols[0]); g.addColorStop(.35, cols[0]); g.addColorStop(1, cols[1]);
    return g;
  }
  function pebbles(c, G, bed, p0, p1, n, cols, size) {
    for (let i = 0; i < n; i++) { const p = sr(p0, p1), r = sr(.5, 1) * size * G.u; ell(c, X(G, p), by(G, bed, p) + sr(0, 3) * G.u, r, r * .6, cols[i % cols.length]); }
  }
  function stone(c, x, y, rx, ry, col, hi) { ell(c, x, y, rx, ry, col); c.globalAlpha = .45; ell(c, x - rx * .25, y - ry * .38, rx * .55, ry * .38, hi); c.globalAlpha = 1; }
  function weed(c, x, y, hgt, col, lw, bend) {
    c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + hgt * .22 + bend * .3, y - hgt * .35, x - hgt * .18 + bend * .7, y - hgt * .7, x + bend, y - hgt);
    c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.stroke();
  }
  // Slanted shafts of light from the surface into the water.
  function rays(c, G, x, n, rgb, a) {
    for (let i = 0; i < n; i++) {
      const x0 = x + (i - n / 2) * 34 * G.u + sr(-8, 8) * G.u, w = sr(8, 20) * G.u, len = (G.bed - G.surf) * sr(.45, .85);
      const g = c.createLinearGradient(0, G.surf, 0, G.surf + len);
      g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = g; c.beginPath(); c.moveTo(x0, G.surf); c.lineTo(x0 + w, G.surf); c.lineTo(x0 + w + len * .22, G.surf + len); c.lineTo(x0 + len * .22 - w * .4, G.surf + len); c.fill();
    }
  }
  // Wooden boards seen from the side: the boards' edge, the beam under them, the board ends.
  function deck(c, x0, x1, y, th, wood, u) {
    c.fillStyle = wood[1]; c.fillRect(x0, y, x1 - x0, th);
    c.fillStyle = wood[0]; c.fillRect(x0, y, x1 - x0, th * .5);
    c.fillStyle = 'rgba(0,0,0,.28)'; for (let x = x0 + 9 * u; x < x1 - 2 * u; x += 12 * u) c.fillRect(x, y, .9 * u, th * .5);
    c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(x0, y, x1 - x0, .8 * u);
  }
  function post(c, x, y0, y1, w, wood) { c.fillStyle = wood[1]; c.fillRect(x - w / 2, y0, w, y1 - y0); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(x - w / 2, y0, w * .3, y1 - y0); }
  // The near shore: a mound from the left edge down into the water at x = sx.
  function bank(c, G, sx, top, col, edge) {
    const s = G.surf, u = G.u;
    c.beginPath(); c.moveTo(-4, top); c.lineTo(sx - 30 * u, top + 2 * u); c.quadraticCurveTo(sx - 8 * u, top + 3 * u, sx, s + 3 * u); c.lineTo(-4, s + 3 * u); c.closePath();
    c.fillStyle = col; c.fill();
    if (edge) { c.beginPath(); c.moveTo(-4, top); c.lineTo(sx - 30 * u, top + 2 * u); c.quadraticCurveTo(sx - 8 * u, top + 3 * u, sx, s + 3 * u); c.strokeStyle = edge; c.lineWidth = 2.2 * u; c.stroke(); }
  }
  // Under the water the near bank goes on down to the bottom just past the angler's feet: earth in cross-section,
  // with buried stones, darker away from the water, and a rim where it meets the water.
  function bankUnder(c, G, bed, sx, cols) {
    const u = G.u, xe = Math.max(X(G, .03), sx + 16 * u), yb = by(G, bed, .03);
    c.beginPath(); c.moveTo(-4, G.surf); c.lineTo(sx, G.surf); c.quadraticCurveTo(sx + 10 * u, G.surf + 10 * u, xe, yb);
    c.lineTo(xe + 30 * u, G.h + 80 * u); c.lineTo(-4, G.h + 80 * u); c.closePath(); c.fillStyle = earth(c, G, cols); c.fill();
    c.save(); c.clip();
    c.fillStyle = 'rgba(0,0,0,.1)';
    for (let i = 0; i < 22; i++) { c.beginPath(); c.ellipse(sr(-4, xe), sr(G.surf, G.h), sr(3, 8) * u, sr(2, 5) * u, 0, 0, TAU); c.fill(); }
    const g = c.createLinearGradient(xe, 0, -4, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.25)');
    c.fillStyle = g; c.fillRect(-4, G.surf, xe + 34 * u, G.h);
    c.restore();
    c.beginPath(); c.moveTo(sx, G.surf); c.quadraticCurveTo(sx + 10 * u, G.surf + 10 * u, xe, yb); c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 2 * u; c.stroke();
  }
  function tufts(c, x0, x1, y, n, col, u) {
    c.strokeStyle = col; c.lineWidth = 1.2 * u; c.lineCap = 'round'; c.beginPath();
    for (let i = 0; i < n; i++) { const x = sr(x0, x1), h = sr(3, 8) * u; c.moveTo(x, y); c.lineTo(x - 2 * u, y - h); c.moveTo(x, y); c.lineTo(x + 1.5 * u, y - h * .8); }
    c.stroke();
  }
  // Reeds and cattails standing in the water from p0 to p1; `under` draws only the stems below the surface.
  function reeds(c, G, bed, p0, p1, n, col, head, under) {
    const s = G.surf, u = G.u;
    for (let i = 0; i < n; i++) {
      const p = p0 + (p1 - p0) * (i + sr(.1, .9)) / n, x = X(G, p), yb = by(G, bed, p), h = sr(26, 50) * u, lean = sr(-5, 5) * u;
      c.strokeStyle = col; c.lineWidth = sr(1.3, 2.2) * u; c.lineCap = 'round';
      c.beginPath();
      if (under) { c.moveTo(x, yb); c.lineTo(x + lean * .2, s); }
      else { c.moveTo(x + lean * .2, s + 2 * u); c.quadraticCurveTo(x + lean * .5, s - h * .6, x + lean, s - h); }
      c.stroke();
      if (!under && head && i % 3 === 0) { c.save(); c.translate(x + lean * .9, s - h + 7 * u); c.rotate(lean / h); rr(c, -1.8 * u, -6 * u, 3.6 * u, 10 * u, 1.8 * u); c.fillStyle = head; c.fill(); c.restore(); }
      if (!under && i % 2) { c.beginPath(); c.moveTo(x, s + u); c.quadraticCurveTo(x - 7 * u, s - h * .45, x - 12 * u, s - h * .55); c.lineWidth = 1.4 * u; c.stroke(); }
    }
  }

  // One water: still layers (back, water and an optional `top` layer over the fish) plus the parts that move.
  // o: { stand, bed, feats, pal: { cond: palette }, back(c, G, P), water(c, G, P), top(c, G, P), liveBack(c, G, env, P),
  //      liveWater(c, G, env, P), front(c, G, env, P, lay) }   lay(c, G, env, P) draws the top layer where front wants it.
  function make(id, o) {
    const first = Object.keys(o.pal)[0], pal = cond => o.pal[cond] || o.pal[first];
    // Layers are drawn 1:1 on whole device pixels: a plain copy, never a resample.
    const blit = (c, img, y) => { const d = dpr(); c.drawImage(img, 0, Math.round(y * d) / d, img.width / d, img.height / d); };
    const lay = (c, G, env) => {
      if (o.top) blit(c, cached(id, 'f', G, env.cond, 0, G.h + 60 * G.u, k => o.top(k, G, pal(env.cond), env.cond)), env.swell || 0);
    };
    return WATER[id] = {
      stand: o.stand, bed: o.bed, feats: o.feats,
      back(c, G, env) {
        const P = pal(env.cond);
        blit(c, cached(id, 'b', G, env.cond, 0, G.h, k => o.back(k, G, P, env.cond)), 0);
        if (o.liveBack) o.liveBack(c, G, env, P);
      },
      water(c, G, env) {
        const P = pal(env.cond), top = Math.floor(G.surf - 60 * G.u);
        blit(c, cached(id, 'w', G, env.cond, top, G.h + 60 * G.u - top, k => o.water(k, G, P, env.cond)), top + (env.swell || 0));
        if (o.liveWater) o.liveWater(c, G, env, P);
      },
      front(c, G, env) { o.front(c, G, env, pal(env.cond), lay); },
    };
  }

  // =============== 1. Sunnybrook Pond: a golden meadow, lily pads, the dock, dragonflies, sleepy water ===============
  {
    const bed = prof([[0, .3], [.34, .4], [.44, .6], [.52, .93], [.8, 1], [.9, .62], [1, .38]]);
    const feats = [
      { kind: 'dock', p0: 0, p1: .07, d0: 0, d1: 1 },
      { kind: 'rock', p0: .16, p1: .21, d0: .72, d1: 1 },
      { kind: 'lily', p0: .23, p1: .285, d0: 0, d1: .06 },
      { kind: 'lily', p0: .3, p1: .345, d0: 0, d1: .06 },
      { kind: 'drop', p0: .42, p1: .52, d0: 0, d1: 1 },
      { kind: 'lily', p0: .6, p1: .65, d0: 0, d1: .05 },
      { kind: 'reeds', p0: .88, p1: 1, d0: 0, d1: 1 },
    ];
    const shore = G => G.x0 - 30 * G.u;
    const base = { wood: ['#b9844e', '#7a4f2a'], peb: ['#c9b27a', '#a8946a', '#e0cfa0'], rock: ['#8d8a78', '#d8d2b8'], pad: ['#4f9a3a', '#2f6a2a'], petal: '#ff9ec4', stem: 'rgba(60,110,50,.55)', reed: '#5f8a38', cat: '#7a4a28', fly1: '#2ec4c0', fly2: '#4a7fe0' };
    const pal = {
      day: Object.assign({ sky: ['#6db4ea', '#b7dff3', '#fff0c2'], sun: [.82, .24, 15, '#fffbe8', '255,246,200'], cloud: 'rgba(255,255,255,.9)', far: '#a9c7b4', hill: '#bcd06a', tree: '#7aa04c', near: '#e0cf6a', fl: ['#fff6da', '#ffcf4a', '#ff9ec4'], bank: '#8fb44a', edge: '#b9d66a', w: ['#6cbcae', '#2f7f8a', '#17485a'], g: ['#d6c08a', '#6f6c44'], weed: '#3f7a3a', ray: '255,250,210', glint: '#fffbe6', line: 'rgba(235,255,250,.9)' }, base),
      dusk: Object.assign({ sky: ['#3f447d', '#d8806c', '#ffc977'], sun: [.72, .86, 22, '#ffd27a', '255,160,90'], cloud: 'rgba(255,180,160,.75)', far: '#8a7088', hill: '#a98a56', tree: '#6a5a40', near: '#c49a50', fl: ['#ffe2b0', '#ffb35c', '#ff8aa8'], bank: '#7f7f3c', edge: '#a8a050', w: ['#6a8aa0', '#2c5070', '#152a44'], g: ['#a8906a', '#3f3a2c'], weed: '#2f5a3a', ray: '255,190,130', glint: '#ffd9a0', line: 'rgba(255,215,175,.85)', win: '#ffd27a' }, base),
      dawn: Object.assign({ sky: ['#8eaadc', '#f1c3b6', '#fff0d0'], sun: [.64, .9, 16, '#fff6dc', '255,226,190'], cloud: 'rgba(255,232,226,.8)', far: '#a9b4c8', hill: '#b4c48e', tree: '#7d9a6a', near: '#d4cc8c', fl: ['#fff6ee', '#ffe08a', '#ffb0cc'], bank: '#86aa5c', edge: '#aac87a', w: ['#7ab6bc', '#34728c', '#183e58'], g: ['#c8bc94', '#56604e'], weed: '#3a6f48', ray: '255,236,210', glint: '#fff4e8', line: 'rgba(245,252,255,.9)', mist: 'rgba(255,246,238,.6)', win: '#ffe6a8' }, base),
    };
    // The treehouse oak of the Night Watch, far across the meadow; its window glows at dawn and dusk.
    function treehouse(c, x, y, s, col, win) {
      c.fillStyle = col; c.fillRect(x - s * .07, y - s * .75, s * .14, s * .75);
      c.beginPath();
      for (const b of [[0, -1.02, .42], [-.4, -.86, .3], [.42, -.88, .32], [.1, -1.36, .3]]) { c.moveTo(x + (b[0] + b[2]) * s, y + b[1] * s); c.arc(x + b[0] * s, y + b[1] * s, b[2] * s, 0, TAU); }
      c.fill();
      c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(x - s * .2, y - s * .62, s * .4, s * .2);
      poly(c, [x - s * .25, y - s * .62, x, y - s * .78, x + s * .25, y - s * .62], 'rgba(0,0,0,.16)');
      if (win) { glowAt(c, x + s * .07, y - s * .53, s * .2, '255,214,120', .6); c.fillStyle = win; c.fillRect(x + s * .03, y - s * .57, s * .08, s * .07); }
    }
    make('pond', {
      stand: G => [G.x0 - 10 * G.u, G.surf - 9 * G.u], bed, feats, pal,
      back(c, G, P) {
        const u = G.u, s = G.surf, w = G.w, sx = shore(G);
        sky(c, G, P.sky);
        sun(c, w * P.sun[0], s * P.sun[1], P.sun[2] * u, P.sun[3], P.sun[4]);
        cloud(c, w * .2, s * .24, 34 * u, P.cloud); cloud(c, w * .55, s * .13, 24 * u, P.cloud); cloud(c, w * .9, s * .42, 20 * u, P.cloud);
        hills(c, G, s, 46 * u, 120 * u, 1.2, P.far);
        treehouse(c, w * .6, s - 24 * u, 34 * u, P.far === '#a9c7b4' ? '#8fb09c' : P.far, P.win);
        hills(c, G, s, 22 * u, 70 * u, 3.4, P.hill);
        for (let i = 0; i < 7; i++) tree(c, sr(w * .3, w * 1.02), s - sr(5, 11) * u, sr(16, 30) * u, P.tree);
        hills(c, G, s, 9 * u, 40 * u, 5.1, P.near);
        for (let i = 0; i < 70; i++) circ(c, sr(w), s - sr(1, 8) * u, sr(.7, 1.5) * u, P.fl[i % 3]);
        if (P.mist) { const g = c.createLinearGradient(0, s - 30 * u, 0, s); g.addColorStop(0, 'rgba(255,246,238,0)'); g.addColorStop(1, P.mist); c.fillStyle = g; c.fillRect(0, s - 30 * u, w, 30 * u + 2); }
        // the near bank, golden grass and flowers, sloping into the water
        bank(c, G, sx, s - 20 * u, P.bank, P.edge);
        tufts(c, -4, sx - 8 * u, s - 19 * u, 26, P.edge, u);
        for (let i = 0; i < 14; i++) circ(c, sr(-4, sx - 10 * u), s - sr(12, 19) * u, sr(1, 1.8) * u, P.fl[i % 3]);
        // the dock: posts above the water, then the boards the Chief stands on
        const de = X(G, .07);
        post(c, de - 3 * u, s - 9 * u, s + 2 * u, 4 * u, P.wood); post(c, (sx + de) / 2, s - 9 * u, s + 2 * u, 4 * u, P.wood);
        deck(c, sx - 26 * u, de, s - 9 * u, 4.5 * u, P.wood, u);
        post(c, de - 2 * u, s - 15 * u, s - 8 * u, 3 * u, P.wood);   // a mooring post at the end of the dock
      },
      water(c, G, P) {
        const u = G.u, s = G.surf, sx = shore(G), de = X(G, .07);
        body(c, G, P.w);
        rays(c, G, G.w * P.sun[0] - 60 * u, 4, P.ray, .14);
        ground(c, G, bed, P.g, 1.2);
        bankUnder(c, G, bed, sx + 22 * u, P.g);
        pebbles(c, G, bed, 0, .42, 30, P.peb, 2.6);
        stone(c, X(G, .185), by(G, bed, .185) - 2 * u, 9 * u, 6 * u, P.rock[0], P.rock[1]);
        for (let i = 0; i < 16; i++) { const p = sr(.44, .99); weed(c, X(G, p), by(G, bed, p) + 2 * u, sr(18, 60) * u, P.weed, sr(1.5, 3) * u, sr(-9, 9) * u); }
        for (const x of [de - 3 * u, (sx + de) / 2]) post(c, x, s, by(G, bed, (x - G.x0) / (G.x1 - G.x0)) + 3 * u, 4 * u, P.wood);
        // lily stems from each pad down to the bottom, reed stems at the far bank
        for (const f of feats) if (f.kind === 'lily') { const p = (f.p0 + f.p1) / 2; c.strokeStyle = P.stem; c.lineWidth = 1.2 * u; c.beginPath(); c.moveTo(X(G, p), s); c.quadraticCurveTo(X(G, p) - 6 * u, (s + by(G, bed, p)) / 2, X(G, p) + 3 * u, by(G, bed, p)); c.stroke(); }
        reeds(c, G, bed, .88, 1, 12, P.stem, '', true);
        // shade under the dock
        const g = c.createLinearGradient(0, s, 0, s + 40 * u); g.addColorStop(0, 'rgba(10,30,30,.35)'); g.addColorStop(1, 'rgba(10,30,30,0)');
        c.fillStyle = g; c.fillRect(sx, s, de - sx, 40 * u);
      },
      top(c, G, P) {
        const u = G.u, s = G.surf;
        // lily pads lying on the water; a flower on the middle one
        for (const f of feats) if (f.kind === 'lily') {
          const x = X(G, (f.p0 + f.p1) / 2), rx = (f.p1 - f.p0) * (G.x1 - G.x0) / 2;
          ell(c, x, s + .8 * u, rx, 2.4 * u, P.pad[1]); ell(c, x, s - .2 * u, rx, 1.9 * u, P.pad[0]);
          poly(c, [x + rx * .2, s - 2 * u, x + rx * .75, s - 2.2 * u, x + rx * .45, s + 1 * u], P.pad[1]);
        }
        const fx = X(G, mid(feats, 'lily', 1));
        for (let i = -2; i <= 2; i++) ell(c, fx + i * 2.4 * u, s - 4.5 * u - (2 - Math.abs(i)) * 1.3 * u, 2.1 * u, 4.4 * u, i ? P.petal : '#ffd0e2', i * .38);
        circ(c, fx, s - 4 * u, 1.9 * u, '#ffd24a');
        reeds(c, G, bed, .88, 1, 12, P.reed, P.cat, false);
      },
      front(c, G, env, P, lay) {
        const u = G.u;
        surface(c, G, env, shore(G) + 18 * u, 1.1 * u, 30 * u, 1.1, P.w[0], P.line, 1.4 * u);
        glints(c, G, env, 9, P.glint, X(G, .1));
        lay(c, G, env);
        // two dragonflies: one rests on the lily flower (or on env.perch), one on a reed tip at the far bank
        const pf = env.perch;
        let d = fly(env.t, 9, pf ? pf[0] : X(G, mid(feats, 'lily', 1)) + u, (pf ? pf[1] : G.surf - 8 * u) - 2 * u, 46 * u, 30 * u, 0);
        dragonfly(c, d.x, d.y, pf ? u * 1.4 : u, env.t, P.fly1, !d.land);
        d = fly(env.t + 3.5, 11, X(G, .935), G.surf - 47 * u, 60 * u, 24 * u, 2);
        dragonfly(c, d.x, d.y, u * .9, env.t + 1, P.fly2, !d.land);
      },
    });
  }

  // =============== 2. Willow Creek: a shaded stream under willow tunnels, a light current ===============
  {
    const bed = prof([[0, .4], [.1, .5], [.18, .36], [.28, .3], [.36, .5], [.46, .78], [.56, .8], [.64, .42], [.7, .3], [.76, .36], [.86, .92], [1, .85]]);
    const feats = [
      { kind: 'rock', p0: .2, p1: .27, d0: .62, d1: 1 },
      { kind: 'drop', p0: .36, p1: .46, d0: 0, d1: 1 },
      { kind: 'rock', p0: .66, p1: .72, d0: .55, d1: 1 },  // boulders on the riffle
      { kind: 'drop', p0: .76, p1: .86, d0: 0, d1: 1 },
      { kind: 'snag', p0: .9, p1: .98, d0: 0, d1: .55 },  // willow roots trailing into the deep pool
    ];
    const base = { trunk: '#4a3a2a', rock: ['#7a8070', '#b8bfa8'], moss: '#6f9a42', leaf: ['#e0a040', '#c87a30', '#d8b84a', '#9ab84a'], peb: ['#8a8a74', '#a8a088', '#6f725f'], streak: 'rgba(225,250,240,.35)' };
    const pal = {
      dawn: Object.assign({ sky: ['#f6d9a6', '#d6d8a2', '#a8c08a'], glow: '255,220,160', far: '#5f7f4a', bush: '#3f5f36', canopy: '#2a4426', frond: '#6a9a48', frond2: '#4f7a38', shaft: 'rgba(255,228,170,.2)', w: ['#5f9e88', '#2c6a5e', '#123a36'], g: ['#8f8a6c', '#363a2c'], weed: '#3f6a3a', line: 'rgba(235,250,235,.85)', mote: '#fff0c0' }, base),
      day: Object.assign({ sky: ['#d8eeb4', '#b6da92', '#92c07a'], glow: '255,255,210', far: '#5a8a48', bush: '#3a6a36', canopy: '#24432a', frond: '#64a24c', frond2: '#4a8038', shaft: 'rgba(255,255,215,.2)', w: ['#5aa491', '#256a60', '#0f3a38'], g: ['#8f8e70', '#33382a'], weed: '#3a7040', line: 'rgba(235,255,240,.85)', mote: '#ffffd8' }, base),
      dusk: Object.assign({ sky: ['#eaa86a', '#ad855a', '#6c6a48'], glow: '255,170,100', far: '#4a5a36', bush: '#34452c', canopy: '#1d2a1e', frond: '#56703a', frond2: '#3f5530', shaft: 'rgba(255,186,120,.18)', w: ['#4f807a', '#22504c', '#0d2a2a'], g: ['#7a705a', '#28291f'], weed: '#2f5034', line: 'rgba(255,220,180,.75)', mote: '#ffd9a0' }, base),
    };
    // A willow frond hanging from (x, y): a curved strand with little leaves along it.
    function frond(c, x, y, len, sway, col, u) {
      c.strokeStyle = col; c.lineWidth = 1.1 * u; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sway * .3, y + len * .55, x + sway, y + len); c.stroke();
      c.beginPath();
      for (let k = .2; k < 1; k += .14) { const fx = x + sway * k * k, fy = y + len * k; c.moveTo(fx, fy); c.lineTo(fx - 2.4 * u, fy + 4 * u); c.moveTo(fx, fy); c.lineTo(fx + 2.4 * u, fy + 4 * u); }
      c.stroke();
    }
    const top0 = G => G.surf * .36;   // the lower edge of the canopy
    make('creek', {
      stand: G => [G.x0 - 10 * G.u, G.surf - 13 * G.u], bed, feats, pal,
      back(c, G, P) {
        const u = G.u, s = G.surf, w = G.w;
        sky(c, G, P.sky);
        glowAt(c, w * .62, s * .62, s * .9, P.glow, .55);
        hills(c, G, s, 70 * u, 46 * u, .7, P.far);
        for (let i = 0; i < 4; i++) { const x = sr(w * .28, w * .96), tw = sr(5, 9) * u; c.fillStyle = P.trunk; c.beginPath(); c.moveTo(x - tw, s); c.quadraticCurveTo(x - tw * 2, s * .5, x + sr(-20, 20) * u, 0); c.lineTo(x + tw * 1.5, 0); c.quadraticCurveTo(x, s * .5, x + tw, s); c.fill(); }
        hills(c, G, s, 30 * u, 24 * u, 2.2, P.bush);
        // two big willows frame the stream and arch over it
        c.fillStyle = P.trunk;
        c.beginPath(); c.moveTo(-4, s); c.lineTo(14 * u, s); c.quadraticCurveTo(22 * u, s * .45, 70 * u, -4); c.lineTo(-4, -4); c.fill();
        c.beginPath(); c.moveTo(w + 4, s); c.lineTo(w - 16 * u, s); c.quadraticCurveTo(w - 30 * u, s * .4, w - 90 * u, -4); c.lineTo(w + 4, -4); c.fill();
        // the canopy across the top, scalloped, with fronds hanging towards the water
        const cy = top0(G);
        c.fillStyle = P.canopy; c.beginPath(); c.moveTo(-4, -4);
        for (let x = -4; x <= w + 14; x += 14 * u) c.lineTo(x, cy * (.7 + .3 * Math.sin(x / (31 * u)) * Math.sin(x / (13 * u) + 1)) + sr(-4, 4) * u);
        c.lineTo(w + 14, -4); c.closePath(); c.fill();
        for (let i = 0; i < w / (6 * u); i++) { const x = i * 6 * u + sr(-3, 3) * u, y0 = cy * sr(.45, .9); frond(c, x, y0, (s - y0) * sr(.25, .9), sr(-6, 6) * u, i % 3 ? P.frond2 : P.frond, u); }
        // shafts of light through the gap in the willows
        c.fillStyle = P.shaft;
        for (let i = 0; i < 4; i++) { const x = w * (.42 + i * .13); c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 16 * u, 0); c.lineTo(x - 40 * u, s); c.lineTo(x - 70 * u, s); c.fill(); }
        // ferns on the near bank (the boulder the Chief stands on is painted with the water)
        const rx = X(G, .015);
        for (let i = 0; i < 5; i++) { const fx = sr(-4, rx - 30 * u); for (let k = -2; k <= 2; k++) weed(c, fx, s - 12 * u, sr(10, 16) * u, P.moss, 1.4 * u, k * 6 * u); }
      },
      water(c, G, P) {
        const u = G.u, s = G.surf, rx = X(G, .015), bx0 = G.x0 - 5 * u;
        body(c, G, P.w);
        ground(c, G, bed, P.g, 1.5);
        bankUnder(c, G, bed, rx + 6 * u, P.g);
        // the big mossy boulder at the near bank: the Chief stands on it
        stone(c, bx0, s - u, 24 * u, 13 * u, P.rock[0], P.rock[1]);
        c.strokeStyle = P.moss; c.lineWidth = 3 * u; c.beginPath(); c.ellipse(bx0, s - u, 23 * u, 12 * u, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
        pebbles(c, G, bed, 0, 1, 70, P.peb, 3);
        stone(c, X(G, .235), by(G, bed, .235) - 3 * u, 12 * u, 8 * u, P.rock[0], P.rock[1]);
        stone(c, X(G, .21), by(G, bed, .21), 7 * u, 5 * u, P.rock[0], P.rock[1]);
        // boulders on the riffle; the water runs quick over them
        const bx = X(G, .69), bw = (X(G, .72) - X(G, .66)) / 2, yb = by(G, bed, .69);
        stone(c, bx - bw * .4, yb - bw * .35, bw * .8, bw * .55, P.rock[0], P.rock[1]);
        stone(c, bx + bw * .45, yb - bw * .3, bw * .6, bw * .45, P.rock[0], P.rock[1]);
        stone(c, bx, yb - bw * .75, bw * .55, bw * .45, P.rock[0], P.rock[1]);
        for (let i = 0; i < 10; i++) { const p = sr(.36, .6); weed(c, X(G, p), by(G, bed, p) + 2 * u, sr(14, 40) * u, P.weed, 2 * u, 12 * u); }
        // willow roots trail into the deep pool on the far side
        c.strokeStyle = P.trunk; c.lineCap = 'round';
        for (let i = 0; i < 7; i++) { const x = X(G, sr(.9, .99)), lw = sr(1.5, 3.5) * u; c.lineWidth = lw; c.beginPath(); c.moveTo(x + 10 * u, s - 2 * u); c.bezierCurveTo(x, s + 20 * u, x + sr(-14, 14) * u, s + 40 * u, x + sr(-10, 6) * u, s + .55 * bed(.94) * (G.bed - G.surf)); c.stroke(); }
      },
      liveBack(c, G, env, P) {
        // a few fronds sway in the air; motes drift in the light
        const t = T(env), u = G.u, cy = top0(G);
        for (let i = 0; i < 6; i++) { const x = G.w * (.3 + i * .12), y0 = cy * .8; frond(c, x, y0, (G.surf - y0) * (.55 + hash(i) * .3), Math.sin(t * .6 + i) * 5 * u, P.frond, u); }
        c.fillStyle = P.mote;
        for (let i = 0; i < 9; i++) { c.globalAlpha = .5 + .4 * Math.sin(t + i); c.beginPath(); c.arc(G.w * (.35 + hash(i) * .55) + Math.sin(t * .3 + i) * 12 * u, G.surf * (.45 + hash(i + 4) * .45) + Math.sin(t * .23 + i * 2) * 8 * u, 1.1 * u, 0, TAU); c.fill(); }
        c.globalAlpha = 1;
      },
      liveWater(c, G, env, P) {
        // the current: light streaks sliding to the right, faster near the surface
        const t = T(env), u = G.u;
        c.strokeStyle = P.streak; c.lineWidth = 1.2 * u; c.lineCap = 'round'; c.beginPath();
        for (let i = 0; i < 12; i++) {
          const d = hash(i + 20) * .8, sp = (40 - d * 30) * u, len = (14 + hash(i) * 20) * u, x = fr(hash(i + 40) + t * sp / G.w) * (G.w + len) - len, p = (x - G.x0) / (G.x1 - G.x0);
          const y = G.surf + 4 * u + d * (by(G, bed, p) - G.surf - 8 * u);
          c.moveTo(x, y); c.lineTo(x + len, y);
        }
        c.stroke();
      },
      front(c, G, env, P) {
        const u = G.u, t = T(env), s = G.surf;
        surface(c, G, env, X(G, .015) + 6 * u, 1.3 * u, 18 * u, 2.2, P.w[0], P.line, 1.3 * u);
        glints(c, G, env, 8, P.line, X(G, .05));
        // quick water over the riffles: small ripple marks sliding with the current
        c.strokeStyle = P.line; c.lineWidth = .9 * u; c.beginPath();
        for (let i = 0; i < 10; i++) { const p = (i < 5 ? .18 : .64) + fr(hash(i) + t * .03) * .12, x = X(G, p), y = s + (2 + hash(i + 9) * 3) * u; c.moveTo(x - 3 * u, y - 1.2 * u); c.lineTo(x, y); c.lineTo(x + 3 * u, y - 1.2 * u); }
        c.stroke();
        // leaves riding the current to the right
        for (let i = 0; i < 6; i++) {
          const x = fr(hash(i + 3) + t * (.018 + hash(i) * .012)) * (G.w + 30 * u) - 15 * u, y = s + Math.sin(t * 1.6 + i * 2) * .8 * u - .5 * u;
          c.save(); c.translate(x, y); c.rotate(Math.sin(t * .7 + i) * .25);
          ell(c, 0, 0, 5 * u, 1.8 * u, P.leaf[i % 4]); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-4.5 * u, -.2 * u, 9 * u, .5 * u);
          c.restore();
        }
      },
    });
  }

  // =============== 3. Harbor Lights Pier: a lantern-lit pier at permanent dusk, the tide under the boards ===============
  {
    const bed = prof([[0, .5], [.15, .56], [.32, .62], [.42, .98], [.66, 1], [.76, .7], [1, .62]]);
    const feats = [
      { kind: 'dock', p0: 0, p1: .12, d0: 0, d1: 1 },     // the pilings under the pier
      { kind: 'beam', p0: .26, p1: .29, d0: .3, d1: 1 },  // an old broken piling
      { kind: 'drop', p0: .34, p1: .42, d0: 0, d1: 1 },   // the edge of the channel
      { kind: 'snag', p0: .8, p1: .85, d0: .5, d1: 1 },   // a sunken crab pot and its rope
    ];
    const H = 30;   // the boards are this high above the water (in sprite units)
    const pal = { dusk: { sky: ['#221f4a', '#7a3f6e', '#f39a5c'], sun: '#ffb36a', land: '#2a2342', land2: '#3a2c4e', win: '#ffd27a', sea: '#5a4a7a', w: ['#2c5272', '#15304a', '#06121f'], g: ['#5f5a4c', '#211f1c'], wood: ['#7a5232', '#45301e'], lamp: '#ffd27a', weed: '#3f6a4a', barn: '#d8d0b8', line: 'rgba(255,205,160,.8)', glint: '#ffcf8a' } };
    const piles = G => [-4 * G.u + X(G, .12), X(G, .06), G.x0 - 22 * G.u, G.x0 - 64 * G.u];
    const lamps = G => [[G.x0 - 40 * G.u, G.surf - (H + 30) * G.u], [X(G, .11), G.surf - (H + 30) * G.u]];
    let lastTide = -1, flow = 1;
    make('pier', {
      stand: G => [G.x0 - 10 * G.u, G.surf - H * G.u], bed, feats, pal,
      back(c, G, P) {
        const u = G.u, s = G.surf, w = G.w;
        sky(c, G, P.sky);
        glowAt(c, w * .8, s, s * .9, '255,150,90', .6);
        circ(c, w * .8, s - 3 * u, 22 * u, P.sun);
        for (let i = 0; i < 6; i++) streak(c, sr(w), s * sr(.15, .7), sr(40, 110) * u, sr(1.5, 3) * u, i % 2 ? 'rgba(255,160,140,.45)' : 'rgba(255,200,150,.35)');
        // the far shore: a hill town with lit windows and a lighthouse on the cape
        hills(c, G, s - 4 * u, 34 * u, 80 * u, 2.1, P.land2);
        for (let i = 0; i < 18; i++) {
          const x = w * .26 + i * w * .02 + sr(-3, 3) * u, hw = sr(6, 11) * u, hh = sr(7, 16) * u, y = s - 4 * u - sr(4, 20) * u;
          c.fillStyle = P.land; c.fillRect(x, y - hh, hw, hh + 20 * u); poly(c, [x - u, y - hh, x + hw / 2, y - hh - hw * .6, x + hw + u, y - hh], P.land);
          if (sr() < .7) { c.fillStyle = P.win; c.fillRect(x + hw * .3, y - hh * .7, 2 * u, 2.4 * u); }
        }
        const lx = w * .9;
        poly(c, [w * .78, s - 4 * u, w * .86, s - 16 * u, w * .96, s - 18 * u, w + 4, s - 12 * u, w + 4, s - 4 * u], P.land);
        c.fillStyle = '#e8e0d8'; c.fillRect(lx - 3 * u, s - 46 * u, 6 * u, 30 * u);
        c.fillStyle = '#c84a3a'; c.fillRect(lx - 3 * u, s - 38 * u, 6 * u, 4 * u); c.fillRect(lx - 3 * u, s - 28 * u, 6 * u, 4 * u);
        poly(c, [lx - 4 * u, s - 46 * u, lx, s - 52 * u, lx + 4 * u, s - 46 * u], '#c84a3a');
        // the far sea: a band with the sunset on it
        c.fillStyle = P.sea; c.fillRect(0, s - 5 * u, w, 7 * u);
        for (let i = 0; i < 12; i++) { c.fillStyle = 'rgba(255,190,120,.6)'; c.fillRect(w * .8 - sr(30, 60) * u + sr(0, 60) * u, s - sr(1, 4) * u, sr(6, 20) * u, .9 * u); }
        // the pier: pilings and braces under the boards, a railing, two lanterns
        const top = s - H * u, ps = piles(G);
        for (const x of ps) post(c, x, top, s + 2 * u, 6 * u, P.wood);
        c.strokeStyle = P.wood[1]; c.lineWidth = 2 * u;
        for (let i = 0; i < ps.length - 1; i++) { c.beginPath(); c.moveTo(ps[i], top + 4 * u); c.lineTo(ps[i + 1], s - 4 * u); c.moveTo(ps[i + 1], top + 4 * u); c.lineTo(ps[i], s - 4 * u); c.stroke(); }
        deck(c, -4, X(G, .12) + 4 * u, top, 6 * u, P.wood, u);
        for (let x = 6 * u; x < X(G, .12); x += 24 * u) post(c, x, top - 15 * u, top, 2.5 * u, P.wood);
        c.fillStyle = P.wood[0]; c.fillRect(-4, top - 16 * u, X(G, .12) + 4, 2.4 * u);
        for (const [x, y] of lamps(G)) {
          post(c, x, y, top, 3 * u, P.wood);
          glowAt(c, x, y, 34 * u, '255,200,110', .55);
          rr(c, x - 4 * u, y - 7 * u, 8 * u, 10 * u, 1.5 * u); c.fillStyle = P.lamp; c.fill(); c.lineWidth = 1.2 * u; c.strokeStyle = '#3a2a1a'; c.stroke();
          poly(c, [x - 5 * u, y - 7 * u, x, y - 11 * u, x + 5 * u, y - 7 * u], '#3a2a1a');
        }
        // a coil of rope and a bucket on the boards
        c.strokeStyle = '#c8a870'; c.lineWidth = 1.6 * u; c.beginPath(); c.ellipse(G.x0 - 52 * u, top - 2.5 * u, 7 * u, 2.5 * u, 0, 0, TAU); c.stroke();
        rr(c, G.x0 - 34 * u, top - 8 * u, 7 * u, 8 * u, 1.5 * u); c.fillStyle = '#5a7aa0'; c.fill();
      },
      water(c, G, P) {
        const u = G.u, s = G.surf;
        body(c, G, P.w);
        ground(c, G, bed, P.g, 1);
        pebbles(c, G, bed, 0, .34, 18, ['#c9b9a0', '#8a8070', '#e8dcc8'], 2.2);
        for (const x of piles(G)) {
          const yb = by(G, bed, (x - G.x0) / (G.x1 - G.x0)) + 4 * u;
          post(c, x, s, yb, 6 * u, P.wood);
          for (let k = 0; k < 7; k++) circ(c, x + sr(-2.5, 2.5) * u, s + sr(2, (yb - s) * .5 / u) * u, sr(.8, 1.6) * u, P.barn);
          for (let k = 0; k < 3; k++) weed(c, x + sr(-3, 3) * u, yb, sr(16, 36) * u, P.weed, 2 * u, sr(-8, 8) * u);
        }
        // the old broken piling, and the sunken crab pot with its rope in the channel
        const bx = X(G, .275), byy = by(G, bed, .275);
        post(c, bx, s + .3 * (byy - s), byy + 4 * u, 5 * u, P.wood);
        poly(c, [bx - 2.5 * u, s + .3 * (byy - s), bx + 2.5 * u, s + .3 * (byy - s) - 4 * u, bx + 2.5 * u, s + .3 * (byy - s) + 3 * u], P.wood[1]);
        const cx = X(G, .825), cyb = by(G, bed, .825);
        c.strokeStyle = '#8a7a5a'; c.lineWidth = 1.2 * u; rr(c, cx - 9 * u, cyb - 11 * u, 18 * u, 12 * u, 2 * u); c.stroke();
        c.beginPath(); for (let k = 1; k < 4; k++) { c.moveTo(cx - 9 * u + k * 4.5 * u, cyb - 11 * u); c.lineTo(cx - 9 * u + k * 4.5 * u, cyb + u); } c.stroke();
        c.strokeStyle = '#a89a72'; c.beginPath(); c.moveTo(cx, cyb - 11 * u); c.bezierCurveTo(cx + 20 * u, cyb - 40 * u, cx - 14 * u, cyb - 60 * u, cx + 6 * u, s + .45 * (cyb - s)); c.stroke();
        for (let i = 0; i < 6; i++) { const p = sr(.45, .95); ell(c, X(G, p), by(G, bed, p) + u, 2.2 * u, 1.2 * u, '#e8d8c0'); }
      },
      liveBack(c, G, env, P) {
        // lanterns breathe; a moth circles each one; the lighthouse turns
        const t = T(env), u = G.u, calmly = still();
        for (let i = 0; i < 2; i++) {
          const l = lamps(G)[i], f = calmly ? .3 : .25 + .12 * Math.sin(t * 7 + i * 3) * Math.sin(t * 2.3 + i);
          glowAt(c, l[0], l[1] - 2 * u, 22 * u, '255,220,140', f);
          const a = t * (2.2 + i * .5) + i * 2, mx = l[0] + Math.cos(a) * 11 * u, my = l[1] - 3 * u + Math.sin(a * 1.3) * 7 * u;
          c.fillStyle = '#f4ead0'; c.beginPath(); c.ellipse(mx, my, 1.8 * u, (calmly ? 1.2 : .6 + Math.abs(Math.sin(t * 30 + i)) * 1.2) * u, 0, 0, TAU); c.fill();
        }
        const lx = G.w * .9, ly = G.surf - 48 * G.u;
        glowAt(c, lx, ly, 14 * u, '255,240,180', .9);
        if (!calmly) { const k = Math.sin(t * 1.4); c.fillStyle = 'rgba(255,240,190,.12)'; c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx - 120 * u * k, ly - 8 * u); c.lineTo(lx - 120 * u * k, ly + 8 * u); c.fill(); }
      },
      liveWater(c, G, env, P) {
        // the tide runs under the boards: streaks drift in while it rises and out while it falls
        const t = T(env), u = G.u, tide = env.tide || 0;
        if (lastTide >= 0 && Math.abs(tide - lastTide) > 1e-5) flow = tide > lastTide ? -1 : 1;
        lastTide = tide;
        c.strokeStyle = 'rgba(200,220,255,.18)'; c.lineWidth = 1.1 * u; c.beginPath();
        for (let i = 0; i < 9; i++) {
          const len = (16 + hash(i) * 22) * u, x = fr(hash(i + 30) + flow * t * (20 + hash(i + 2) * 14) * u / G.w) * (G.w + len) - len, y = G.surf + (8 + hash(i + 8) * 80) * u;
          c.moveTo(x, y); c.lineTo(x + len, y);
        }
        c.stroke();
      },
      front(c, G, env, P) {
        const u = G.u, t = T(env), s = G.surf, tide = clamp(env.tide || 0, 0, 1);
        surface(c, G, env, 0, 1.4 * u, 26 * u, 1, P.w[0], P.line, 1.3 * u);
        // the wet, weedy band on each piling shows how far the tide has fallen from its high mark
        const wet = (1 - tide) * 16 * u;
        for (const x of piles(G)) { c.fillStyle = 'rgba(20,40,30,.55)'; c.fillRect(x - 3 * u, s - wet - 1, 6 * u, wet + 1); c.fillStyle = 'rgba(230,240,220,.7)'; c.fillRect(x - 3 * u, s - wet - 1 - 1.2 * u, 6 * u, 1.2 * u); }
        // the lanterns' light broken on the water
        c.fillStyle = 'rgba(255,214,140,.75)';
        for (const l of lamps(G)) for (let k = 0; k < 6; k++) { const wv = still() ? 0 : Math.sin(t * 2.5 + k * 1.7 + l[0]) * 3 * u, hw = (7 - k) * u; c.fillRect(l[0] - hw / 2 + wv, s + (2 + k * 4) * u, hw, 1.1 * u); }
        glints(c, G, env, 7, P.glint, X(G, .4));
        // a buoy rides the tide
        const bx = X(G, .58), bob = still() ? 0 : Math.sin(t * 1.3) * 1.2 * u;
        c.fillStyle = '#e8503a'; c.beginPath(); c.moveTo(bx - 4 * u, s + bob); c.lineTo(bx - 2.5 * u, s - 9 * u + bob); c.lineTo(bx + 2.5 * u, s - 9 * u + bob); c.lineTo(bx + 4 * u, s + bob); c.fill();
        c.fillStyle = '#fff3dc'; c.fillRect(bx - 3.3 * u, s - 5 * u + bob, 6.6 * u, 2 * u);
        circ(c, bx, s - 11 * u + bob, 1.6 * u, '#ffd27a');
      },
    });
  }

  // =============== 4. Rainveil Falls: a waterfall pool in gentle permanent rain ===============
  {
    const bed = prof([[0, .4], [.2, .48], [.42, .52], [.56, .66], [.66, .97], [.9, 1], [1, .8]]);
    const feats = [
      { kind: 'rock', p0: .12, p1: .18, d0: .72, d1: 1 },
      { kind: 'rock', p0: .46, p1: .52, d0: .68, d1: 1 },
      { kind: 'drop', p0: .56, p1: .66, d0: 0, d1: 1 },
      { kind: 'rock', p0: .94, p1: 1, d0: 0, d1: 1 },    // boulders at the foot of the falls
    ];
    const pal = { rain: { sky: ['#6c7f82', '#9cafab', '#c1cdc4'], cloud: 'rgba(120,138,140,.8)', hill1: '#93a8a2', hill2: '#6f8a7f', cliff: ['#5a685d', '#3a463e'], moss: '#5f8a4a', fern: '#4f7a3e', fall: ['rgba(240,250,255,.95)', 'rgba(190,226,240,.75)'], w: ['#4f8a8c', '#24585e', '#0e2e34'], g: ['#767c6c', '#30362e'], rock: ['#6f766a', '#a8b0a0'], rain: 'rgba(225,238,242,.5)', ring: 'rgba(232,246,250,.75)', line: 'rgba(225,245,248,.85)' } };
    const fall = G => [X(G, .84), X(G, .91)];   // where the curtain of water comes down
    const dash = [0, 0];
    make('falls', {
      stand: G => [G.x0 - 10 * G.u, G.surf - 12 * G.u], bed, feats, pal,
      back(c, G, P) {
        const u = G.u, s = G.surf, w = G.w, [f0, f1] = fall(G);
        sky(c, G, P.sky);
        for (let i = 0; i < 5; i++) cloud(c, sr(w), s * sr(.05, .3), sr(30, 50) * u, P.cloud);
        hills(c, G, s, 54 * u, 60 * u, .4, P.hill1);
        for (let i = 0; i < 14; i++) pine(c, sr(w * .15, w * .75), s - sr(18, 30) * u, sr(16, 26) * u, P.hill2);
        hills(c, G, s, 22 * u, 34 * u, 2.9, P.hill2);
        // the cliff on the far side, mossy, with ferns on its ledges
        const cx = X(G, .78), lip = s * .14;
        const g = c.createLinearGradient(cx, 0, w, 0); g.addColorStop(0, P.cliff[0]); g.addColorStop(1, P.cliff[1]);
        c.fillStyle = g; c.beginPath(); c.moveTo(cx, s + 2 * u);
        for (let y = s; y > lip; y -= 10 * u) c.lineTo(cx - 6 * u - (s - y) * .05 + sr(-5, 5) * u, y);
        c.lineTo(f0 - 4 * u, lip); c.lineTo(f0 - 6 * u, -4); c.lineTo(w + 4, -4); c.lineTo(w + 4, s + 2 * u); c.fill();
        for (let i = 0; i < 9; i++) { const y = lip + sr(10, s - lip - 6 * u); ell(c, cx + sr(-6, 6) * u, y, sr(8, 14) * u, 3 * u, P.moss); for (let k = -2; k <= 2; k++) weed(c, cx + sr(-4, 4) * u, y, 9 * u, P.fern, 1.2 * u, k * 5 * u); }
        for (let i = 0; i < 7; i++) ell(c, sr(f1 + 4 * u, w), sr(0, s), sr(8, 16) * u, 3 * u, P.moss);
        // the waterfall: a curtain widening as it falls into the pool
        const fg = c.createLinearGradient(f0, 0, f1, 0); fg.addColorStop(0, P.fall[1]); fg.addColorStop(.5, P.fall[0]); fg.addColorStop(1, P.fall[1]);
        c.fillStyle = fg; c.beginPath(); c.moveTo(f0, lip - 2 * u); c.lineTo(f1, lip - 2 * u); c.lineTo(f1 + 5 * u, s); c.lineTo(f0 - 5 * u, s); c.fill();
        c.fillStyle = P.fall[0]; c.beginPath(); c.ellipse((f0 + f1) / 2, lip - 2 * u, (f1 - f0) / 2 + 3 * u, 3 * u, 0, Math.PI, 0); c.fill();
        // the near ledge: a flat slab with moss and ferns
        const lx = X(G, .015);
        c.fillStyle = P.rock[0]; c.beginPath(); c.moveTo(-4, s - 12 * u); c.lineTo(lx - 6 * u, s - 13 * u); c.lineTo(lx + 3 * u, s - 8 * u); c.lineTo(lx + 5 * u, s + 3 * u); c.lineTo(-4, s + 3 * u); c.fill();
        c.fillStyle = P.rock[1]; c.fillRect(-4, s - 13 * u, lx - 2 * u, 1.4 * u);
        for (let i = 0; i < 4; i++) { const fx = sr(-4, lx - 40 * u); for (let k = -2; k <= 2; k++) weed(c, fx, s - 12 * u, sr(9, 15) * u, P.fern, 1.4 * u, k * 6 * u); }
      },
      water(c, G, P) {
        const u = G.u, s = G.surf, [f0, f1] = fall(G);
        body(c, G, P.w);
        ground(c, G, bed, P.g, 1.4);
        bankUnder(c, G, bed, X(G, .015) + 5 * u, P.g);
        pebbles(c, G, bed, 0, 1, 40, ['#8a8f80', '#6a7064', '#a4a898'], 3);
        stone(c, X(G, .15), by(G, bed, .15) - 3 * u, 11 * u, 7 * u, P.rock[0], P.rock[1]);
        stone(c, X(G, .49), by(G, bed, .49) - 4 * u, 13 * u, 9 * u, P.rock[0], P.rock[1]);
        for (let i = 0; i < 4; i++) stone(c, X(G, .95 + i * .02), s + (G.bed - s) * (.2 + i * .2), 14 * u, 16 * u, P.cliff[1], P.rock[0]);
        // white water churning under the falls
        const g = c.createLinearGradient(0, s, 0, s + 70 * u); g.addColorStop(0, 'rgba(235,248,252,.6)'); g.addColorStop(1, 'rgba(235,248,252,0)');
        c.fillStyle = g; c.beginPath(); c.ellipse((f0 + f1) / 2, s, (f1 - f0) * .9, 70 * u, 0, 0, Math.PI); c.fill();
        for (let i = 0; i < 10; i++) { const p = sr(.42, .8); weed(c, X(G, p), by(G, bed, p) + 2 * u, sr(12, 36) * u, '#3f6a4f', 2 * u, sr(-6, 6) * u); }
      },
      // rain dimples over the water: they hide the shallow shadows a little
      top(c, G, P) {
        const u = G.u, s = G.surf, d = (G.bed - G.surf) * .32, g = c.createLinearGradient(0, s, 0, s + d);
        g.addColorStop(0, 'rgba(210,228,232,.32)'); g.addColorStop(1, 'rgba(210,228,232,0)');
        c.fillStyle = g; c.fillRect(0, s, G.w, d);
        c.fillStyle = 'rgba(230,244,248,.35)';
        for (let i = 0; i < G.w * d / (60 * u * u); i++) c.fillRect(sr(G.w), s + Math.pow(sr(), 2) * d, sr(2, 5) * u, .8 * u);
      },
      liveBack(c, G, env, P) {
        // the falling water slides down; mist rises at its foot
        const t = T(env), u = G.u, s = G.surf, [f0, f1] = fall(G), lip = s * .14;
        dash[0] = 14 * u; dash[1] = 9 * u;
        c.save(); c.setLineDash(dash); c.lineDashOffset = -t * 160 * u;
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.4 * u; c.beginPath();
        for (let k = 1; k < 7; k++) { const x = f0 + (f1 - f0) * k / 7; c.moveTo(x, lip); c.lineTo(x + (x - (f0 + f1) / 2) * .15, s); }
        c.stroke(); c.restore();
        for (let i = 0; i < 4; i++) glowAt(c, (f0 + f1) / 2 + (i - 1.5) * 9 * u, s - 4 * u - (still() ? 4 : fr(t * .3 + i * .25) * 26) * u, 18 * u, '235,245,248', .45);
      },
      liveWater(c, G, env, P) {
        // bubbles rise in the plunge pool
        const t = T(env), u = G.u, s = G.surf, [f0, f1] = fall(G);
        c.strokeStyle = 'rgba(235,250,255,.6)'; c.lineWidth = .9 * u; c.beginPath();
        for (let i = 0; i < 12; i++) { const k = fr(hash(i) + t * (.25 + hash(i + 1) * .2)), x = lerp(f0 - 10 * u, f1 + 10 * u, hash(i + 5)) + Math.sin(t * 3 + i) * 2 * u, y = s + (1 - k) * 80 * u, r = (1 + hash(i + 2) * 1.5) * u; c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }
        c.stroke();
      },
      front(c, G, env, P, lay) {
        const u = G.u, [f0, f1] = fall(G);
        lay(c, G, env);
        surface(c, G, env, X(G, .015) + 5 * u, 1.2 * u, 14 * u, 2.6, P.w[0], P.line, 1.3 * u);
        rings(c, G, env, 16, P.ring, X(G, .02), G.w, 7);
        ell(c, (f0 + f1) / 2, G.surf, (f1 - f0) * .75, 3 * u, 'rgba(240,250,252,.85)');
        rain(c, G, env, 60, 12 * G.u, -.12, P.rain, .9 * G.u, G.surf);
      },
    });
  }

  // =============== 5. The Sunken Mill: a murky lake around a drowned mill, reeds, beams and snags ===============
  {
    const bed = prof([[0, .42], [.1, .52], [.18, .66], [.24, .95], [.3, .7], [.44, .74], [.52, 1], [.58, .76], [.78, .8], [.88, .6], [1, .5]]);
    const feats = [
      { kind: 'reeds', p0: .03, p1: .13, d0: 0, d1: 1 },
      { kind: 'snag', p0: .19, p1: .26, d0: .5, d1: 1 },   // roots and branches in the first hole
      { kind: 'beam', p0: .34, p1: .46, d0: .78, d1: 1 },  // a fallen beam
      { kind: 'snag', p0: .5, p1: .55, d0: .3, d1: 1 },    // a drowned tree reaching up
      { kind: 'beam', p0: .59, p1: .8, d0: 0, d1: 1 },     // the mill wheel and the mill's sunken walls
      { kind: 'reeds', p0: .88, p1: 1, d0: 0, d1: 1 },
    ];
    const base = { wood: ['#6a5040', '#43301f'], stone: ['#7f7d6e', '#56554a'], roof: '#4f4440', reed: '#6f7a3a', cat: '#5a3a22' };
    const pal = {
      day: Object.assign({ sky: ['#a7b5a1', '#cfd2b4', '#e2dcb8'], far: '#7f8c6e', trees: '#5d6b4c', w: ['#6d7a48', '#3b4626', '#1d2412'], g: ['#4f4a32', '#201e0f'], murk: 'rgba(96,100,58,.3)', line: 'rgba(225,228,195,.75)', sun: 1 }, base),
      dusk: Object.assign({ sky: ['#433a5c', '#a8706a', '#e3a066'], far: '#5a4f56', trees: '#3f3a40', w: ['#5f6a4a', '#30382a', '#151a10'], g: ['#3f3a2a', '#15140c'], murk: 'rgba(80,72,56,.32)', line: 'rgba(255,205,165,.7)', mist: '235,215,200' }, base),
      night: Object.assign({ sky: ['#0a1324', '#18263a', '#2c3a48'], far: '#1f2a34', trees: '#141c24', w: ['#2c3a34', '#151f1c', '#080d0b'], g: ['#1f2018', '#0a0a06'], murk: 'rgba(28,38,36,.38)', line: 'rgba(170,190,205,.55)', mist: '190,205,220', moon: 1 }, base),
    };
    const wheel = G => [X(G, .64), G.surf + 4 * G.u, 30 * G.u];
    // The mill wheel: rim, spokes and paddles, tilted where it sank.
    function millWheel(c, x, y, r, col, u) {
      c.save(); c.translate(x, y); c.rotate(.18);
      c.strokeStyle = col; c.lineWidth = 3 * u; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
      c.lineWidth = 2 * u; c.beginPath(); c.arc(0, 0, r * .3, 0, TAU);
      for (let i = 0; i < 8; i++) { const a = i * TAU / 8; c.moveTo(Math.cos(a) * r * .3, Math.sin(a) * r * .3); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      c.stroke();
      c.fillStyle = col; for (let i = 0; i < 16; i++) { c.save(); c.rotate(i * TAU / 16); c.fillRect(r - 1.5 * u, -1.6 * u, 7 * u, 3.2 * u); c.restore(); }
      c.restore();
    }
    make('mill', {
      stand: G => [G.x0 - 10 * G.u, G.surf - 11 * G.u], bed, feats, pal,
      back(c, G, P) {
        const u = G.u, s = G.surf, w = G.w;
        sky(c, G, P.sky);
        if (P.moon) { stars(c, G, 60, s * .8, '#e8eeff'); crescent(c, w * .78, s * .25, 13 * u, '#f2f0dc'); }
        if (P.sun) glowAt(c, w * .3, s * .3, s * .7, '255,250,220', .45);
        if (P.mist) glowAt(c, w * .7, s, s * .8, P.mist === '235,215,200' ? '255,170,110' : '120,140,170', .4);
        hills(c, G, s, 20 * u, 60 * u, 1.7, P.far);
        for (let i = 0; i < 14; i++) tree(c, sr(-10, w + 10), s - sr(2, 8) * u, sr(22, 40) * u, P.trees);
        hills(c, G, s, 8 * u, 30 * u, 4.4, P.trees);
        // the drowned mill: stone base, wooden upper floor, a sagging roof with a hole in it
        const m0 = X(G, .67), m1 = X(G, .8), fl = s - 18 * u, top = fl - 26 * u;
        c.fillStyle = P.stone[0]; c.fillRect(m0, fl, m1 - m0, s - fl + 2);
        c.fillStyle = 'rgba(0,0,0,.18)'; for (let y = fl + 5 * u; y < s; y += 6 * u) c.fillRect(m0, y, m1 - m0, .8 * u);
        c.fillStyle = P.wood[0]; c.fillRect(m0 + 3 * u, top, m1 - m0 - 6 * u, fl - top);
        c.fillStyle = 'rgba(0,0,0,.22)'; for (let x = m0 + 9 * u; x < m1 - 4 * u; x += 7 * u) c.fillRect(x, top, .9 * u, fl - top);
        c.fillStyle = '#1a1612'; rr(c, (m0 + m1) / 2 - 5 * u, top + 7 * u, 10 * u, 11 * u, 1.5 * u); c.fill();
        poly(c, [m0 - 4 * u, top + 2 * u, (m0 + m1) / 2 - 4 * u, top - 22 * u, (m0 + m1) / 2 + 2 * u, top - 16 * u, m1 + 5 * u, top + 3 * u], P.roof);
        c.strokeStyle = P.wood[1]; c.lineWidth = 1.4 * u; c.beginPath();
        for (let k = 0; k < 4; k++) { const x = lerp(m0 + 10 * u, m1 - 6 * u, k / 3); c.moveTo(x, top); c.lineTo(x - 3 * u, top - 10 * u + k * 2 * u); }
        c.stroke();
        c.fillStyle = P.sky[1]; c.beginPath(); c.moveTo(m0 + 22 * u, top - 4 * u); c.lineTo(m0 + 34 * u, top - 10 * u); c.lineTo(m0 + 32 * u, top + 1 * u); c.fill();   // the hole in the roof
        // the near landing: old cut stones with moss
        const lx = X(G, .02);
        c.fillStyle = P.stone[0]; c.fillRect(-4, s - 11 * u, lx + 4, 14 * u);
        c.fillStyle = P.stone[1]; for (let x = -4 + 14 * u; x < lx; x += 16 * u) c.fillRect(x, s - 11 * u, 1.2 * u, 14 * u);
        c.fillRect(-4, s - 4 * u, lx + 4, 1 * u);
        c.fillStyle = '#5f7a3a'; c.fillRect(-4, s - 12 * u, lx + 4, 1.8 * u);
      },
      water(c, G, P) {
        const u = G.u, s = G.surf, lx = X(G, .02);
        body(c, G, P.w);
        ground(c, G, bed, P.g, 2);
        bankUnder(c, G, bed, lx, P.g);
        c.fillStyle = P.stone[1]; c.fillRect(-4, s, lx + 4, 24 * u);
        c.fillStyle = 'rgba(0,0,0,.25)'; for (let y = s + 6 * u; y < s + 24 * u; y += 6 * u) c.fillRect(-4, y, lx + 4, .9 * u);
        // silt hanging in the water
        c.fillStyle = 'rgba(200,190,140,.16)'; for (let i = 0; i < 160; i++) c.fillRect(sr(G.w), sr(s, G.bed), sr(1, 2.4) * u, sr(1, 2.4) * u);
        // the fallen beam, the snags, the mill's sunken walls and the lower half of the wheel
        const b0 = X(G, .34), b1 = X(G, .46);
        c.save(); c.translate((b0 + b1) / 2, (by(G, bed, .34) + by(G, bed, .46)) / 2 - 4 * u); c.rotate(-.06);
        c.fillStyle = P.wood[1]; c.fillRect(-(b1 - b0) / 2, -4 * u, b1 - b0, 8 * u); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(-(b1 - b0) / 2, -4 * u, b1 - b0, 2 * u);
        c.restore();
        c.strokeStyle = '#2a2014'; c.lineCap = 'round';
        const branch = (x, y, h, lean) => { c.lineWidth = 3 * u; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + lean, y - h * .5, x + lean * 1.4, y - h); c.stroke(); c.lineWidth = 1.6 * u; c.beginPath(); c.moveTo(x + lean * .5, y - h * .45); c.lineTo(x + lean * .5 + 12 * u, y - h * .7); c.moveTo(x + lean, y - h * .7); c.lineTo(x + lean - 10 * u, y - h * .9); c.moveTo(x + lean * 1.2, y - h * .85); c.lineTo(x + lean * 1.2 + 8 * u, y - h * .98); c.stroke(); };
        branch(X(G, .21), by(G, bed, .21), (by(G, bed, .21) - s) * .5, 6 * u);
        branch(X(G, .235), by(G, bed, .235), (by(G, bed, .235) - s) * .35, -8 * u);
        branch(X(G, .525), by(G, bed, .525), (by(G, bed, .525) - s) * .7, 10 * u);
        const m0 = X(G, .67), m1 = X(G, .8), mb = by(G, bed, .74);
        c.fillStyle = P.stone[1]; c.fillRect(m0, s, m1 - m0, mb - s + 6 * u);
        c.fillStyle = 'rgba(0,0,0,.14)';
        for (let y = s + 5 * u, r = 0; y < mb; y += 6 * u, r++) { c.fillRect(m0, y, m1 - m0, .7 * u); for (let x = m0 + (r % 2 ? 5 : 10) * u; x < m1; x += 10 * u) c.fillRect(x, y - 6 * u, .7 * u, 6 * u); }
        c.fillStyle = '#12160c'; rr(c, m0 + (m1 - m0) * .2, s + 10 * u, 8 * u, 11 * u, 3 * u); c.fill(); rr(c, m1 - (m1 - m0) * .2 - 8 * u, s + 10 * u, 8 * u, 11 * u, 3 * u); c.fill();   // windows
        c.fillStyle = '#0f120a'; rr(c, (m0 + m1) / 2 - 7 * u, mb - 22 * u, 14 * u, 22 * u, 6 * u); c.fill();   // a dark doorway
        const [wx, wy, wr] = wheel(G);
        millWheel(c, wx, wy, wr, P.wood[0], u);
        reeds(c, G, bed, .03, .13, 9, 'rgba(70,80,40,.6)', '', true);
        reeds(c, G, bed, .88, 1, 10, 'rgba(70,80,40,.6)', '', true);
      },
      // murk over the fish: the shadows are harder to read, more so in the deep
      top(c, G, P) {
        const s = G.surf, g = c.createLinearGradient(0, s, 0, G.bed);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.25, P.murk); g.addColorStop(1, P.murk.replace(/[\d.]+\)$/, '.55)'));
        c.fillStyle = g; c.fillRect(0, s, G.w, G.h - s + 60 * G.u);
        reeds(c, G, bed, .03, .13, 9, P.reed, P.cat, false);
        reeds(c, G, bed, .88, 1, 10, P.reed, P.cat, false);
      },
      liveWater(c, G, env, P) {
        // bubbles from the mud in the holes
        const t = T(env), u = G.u;
        c.strokeStyle = 'rgba(220,225,180,.45)'; c.lineWidth = .9 * u; c.beginPath();
        for (let i = 0; i < 8; i++) { const p = i < 4 ? .24 : .52, k = fr(hash(i) + t * .12), x = X(G, p) + Math.sin(t * 2 + i) * 2 * u + (hash(i + 3) - .5) * 12 * u, y = lerp(by(G, bed, p), G.surf, k), r = (1 + hash(i + 7)) * u; c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }
        c.stroke();
      },
      front(c, G, env, P, lay) {
        const u = G.u, t = T(env), s = G.surf, calmly = still();
        surface(c, G, env, X(G, .02), .7 * u, 40 * u, .7, P.w[0], P.line, 1.2 * u);
        lay(c, G, env);
        // mist on the water at dusk and night; fireflies at night; water striders by day
        if (P.mist) for (let i = 0; i < 5; i++) glowAt(c, fr(hash(i) + t * .006) * (G.w + 160 * u) - 80 * u, s - 4 * u, 70 * u, P.mist, .22);
        if (P.moon) for (let i = 0; i < 7; i++) {
          const x = X(G, i < 4 ? .02 + i * .04 : .86 + (i - 4) * .05) + Math.sin(t * .7 + i * 2) * 14 * u, y = s - 20 * u - hash(i) * 30 * u + Math.sin(t * 1.1 + i) * 8 * u;
          glowAt(c, x, y, 8 * u, '200,255,120', calmly ? .7 : .35 + .4 * Math.abs(Math.sin(t * 1.7 + i * 1.3)));
          circ(c, x, y, 1.2 * u, '#f4ffc0');
        }
        if (P.sun) {
          c.strokeStyle = 'rgba(40,40,30,.8)'; c.lineWidth = .8 * u;
          for (let i = 0; i < 3; i++) {
            const x = X(G, .3 + i * .17) + (calmly ? 0 : Math.sin(t * .4 + i * 2) * 26 * u);
            c.beginPath(); c.moveTo(x - 4 * u, s - .3 * u); c.lineTo(x + 4 * u, s - .3 * u); c.moveTo(x - 2 * u, s - .3 * u); c.lineTo(x - 5 * u, s - 2 * u); c.moveTo(x + 2 * u, s - .3 * u); c.lineTo(x + 5 * u, s - 2 * u); c.stroke();
            c.strokeStyle = 'rgba(230,230,200,.35)'; c.beginPath(); c.ellipse(x - 4 * u, s + .6 * u, 2 * u, .6 * u, 0, 0, TAU); c.ellipse(x + 4 * u, s + .6 * u, 2 * u, .6 * u, 0, 0, TAU); c.stroke(); c.strokeStyle = 'rgba(40,40,30,.8)';
          }
        }
      },
    });
  }

  // =============== 6. The Frozen Reach: a silent white lake fished through three drilled holes ===============
  {
    const bed = p => clamp(1 - .55 * Math.pow((p - .55) / .55, 2), .3, 1);   // a bowl, deepest in the middle
    const feats = [
      { kind: 'hole', p0: .19, p1: .24, d0: 0, d1: 1 },
      { kind: 'hole', p0: .5, p1: .55, d0: 0, d1: 1 },
      { kind: 'hole', p0: .79, p1: .84, d0: 0, d1: 1 },
    ];
    const holes = feats.filter(f => f.kind === 'hole');
    const pal = {
      day: { sky: ['#b5cfe3', '#d9e7f0', '#f3f7fa'], far: '#c8d6e2', pines: '#4c676c', snow: '#f4f8fb', ice: ['#eef6fb', '#bcd9ea', '#8ebbd5'], w: ['#2d5a7a', '#163852', '#081c30'], g: ['#33424f', '#11171f'], dark: 'rgba(5,18,36,.84)', line: 'rgba(255,255,255,.9)', sun: 1 },
      night: { sky: ['#060d24', '#132049', '#2a3c66'], far: '#33456a', pines: '#121c2e', snow: '#c4d0e8', ice: ['#cfdcef', '#8ea8cc', '#5a7aa6'], w: ['#173452', '#0b1f36', '#040f1e'], g: ['#1a2230', '#070a10'], dark: 'rgba(2,8,22,.9)', line: 'rgba(210,225,255,.8)', stars: 1 },
      aurora: { sky: ['#040b1e', '#0c1c3c', '#1d3352'], far: '#2c4660', pines: '#0e1a28', snow: '#c4e6de', ice: ['#d4f0e8', '#90cac0', '#5a8ea8'], w: ['#163a4e', '#0a2232', '#03101c'], g: ['#16222a', '#06090c'], dark: 'rgba(2,10,20,.88)', line: 'rgba(200,255,230,.8)', stars: 1, aur: 1 },
    };
    const iceTop = G => G.surf - 3 * G.u, iceBot = G => G.surf + 9 * G.u;
    // The circles of sight under each hole: everything else under the ice is dark.
    const sightL = holes.map(() => ({ x: 0, y: 0, r: 0, ry: 0 }));
    function sight(G) {
      for (let i = 0; i < holes.length; i++) {
        const f = holes[i], l = sightL[i];
        l.r = clamp(.13 * (G.x1 - G.x0), 28 * G.u, 70 * G.u); l.ry = clamp(.42 * (G.bed - G.surf), l.r, l.r * 2.4);
        l.x = X(G, (f.p0 + f.p1) / 2); l.y = iceBot(G) + l.ry * .8;
      }
      return sightL;
    }
    make('ice', {
      stand: G => [G.x0 - 10 * G.u, G.surf - 3 * G.u], bed, feats, pal,
      back(c, G, P) {
        const u = G.u, s = G.surf, w = G.w;
        sky(c, G, P.sky);
        if (P.stars) { stars(c, G, 90, s * .85, '#eef4ff'); if (!P.aur) crescent(c, w * .72, s * .22, 12 * u, '#f4f2e0'); }
        if (P.sun) { glowAt(c, w * .7, s * .3, 70 * u, '255,255,245', .7); circ(c, w * .7, s * .3, 12 * u, 'rgba(255,255,250,.85)'); }
        if (P.aur) glowAt(c, w * .5, s * .5, s, '60,200,150', .18);
        hills(c, G, s - 3 * u, 40 * u, 90 * u, .8, P.far);
        for (let i = 0; i < 28; i++) pine(c, sr(-10, w + 10), s - sr(4, 12) * u, sr(14, 30) * u, P.pines);
        c.fillStyle = P.snow; c.fillRect(0, s - 6 * u, w, 4 * u);
        hills(c, G, s - 2 * u, 5 * u, 30 * u, 2.2, P.snow);
        // the near shore: a snowbank, a little sled with a bucket and the ice drill
        c.fillStyle = P.snow; c.beginPath(); c.moveTo(-4, s - 22 * u); c.quadraticCurveTo(G.x0 - 60 * u, s - 24 * u, G.x0 - 30 * u, s - 2 * u); c.lineTo(-4, s); c.fill();
        const sx = G.x0 - 52 * u;
        c.strokeStyle = '#8a5a34'; c.lineWidth = 1.6 * u; c.beginPath(); c.moveTo(sx - 14 * u, s - 4 * u); c.lineTo(sx + 12 * u, s - 4 * u); c.quadraticCurveTo(sx + 17 * u, s - 4 * u, sx + 16 * u, s - 8 * u); c.stroke();
        c.fillStyle = '#c8613a'; c.fillRect(sx - 12 * u, s - 10 * u, 22 * u, 5 * u);
        rr(c, sx - 6 * u, s - 18 * u, 9 * u, 8 * u, 1.5 * u); c.fillStyle = '#58a6ff'; c.fill();
        c.strokeStyle = '#9aa4b0'; c.lineWidth = 1.8 * u; c.beginPath(); c.moveTo(sx + 8 * u, s - 9 * u); c.lineTo(sx + 2 * u, s - 34 * u); c.moveTo(sx - 3 * u, s - 33 * u); c.lineTo(sx + 7 * u, s - 35 * u); c.stroke();
      },
      water(c, G, P) {
        const u = G.u;
        body(c, G, P.w);
        ground(c, G, bed, P.g, 1.5);
        pebbles(c, G, bed, 0, 1, 40, ['#3f4f5f', '#2a3644', '#56667a'], 3.5);
        for (let i = 0; i < 9; i++) { const p = sr(.1, .95); weed(c, X(G, p), by(G, bed, p) + 2 * u, sr(12, 30) * u, 'rgba(60,90,90,.6)', 1.6 * u, sr(-5, 5) * u); }
        // light falls through each hole into the water below it
        for (const f of holes) { const x = X(G, (f.p0 + f.p1) / 2), hw = (f.p1 - f.p0) * (G.x1 - G.x0) / 2, g = c.createLinearGradient(0, G.surf, 0, G.bed); g.addColorStop(0, 'rgba(200,235,255,.3)'); g.addColorStop(1, 'rgba(200,235,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - hw, G.surf); c.lineTo(x + hw, G.surf); c.lineTo(x + hw * 3, G.bed); c.lineTo(x - hw * 3, G.bed); c.fill(); }
      },
      // the ice sheet, cut open at the three holes, with cracks and snow on it
      top(c, G, P) {
        const u = G.u, t0 = iceTop(G), t1 = iceBot(G);
        const g = c.createLinearGradient(0, t0, 0, t1); g.addColorStop(0, P.ice[0]); g.addColorStop(.35, P.ice[1]); g.addColorStop(1, P.ice[2]);
        c.fillStyle = g; c.beginPath();
        let x = -4;
        for (const f of holes) { const a = X(G, f.p0), b = X(G, f.p1); c.rect(x, t0, a - x, t1 - t0); x = b; }
        c.rect(x, t0, G.w + 4 - x, t1 - t0); c.fill();
        c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(-4, t0, G.w + 8, 1.2 * u);
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .8 * u; c.beginPath();
        for (let i = 0; i < 14; i++) { const cx = sr(G.w), cy = sr(t0 + 2 * u, t1 - 2 * u); c.moveTo(cx, cy); c.lineTo(cx + sr(-14, 14) * u, cy + sr(-3, 3) * u); c.lineTo(cx + sr(-20, 20) * u, cy + sr(-3, 3) * u); }
        c.stroke();
        for (const f of holes) {
          const a = X(G, f.p0), b = X(G, f.p1);
          c.fillStyle = '#0c2238'; c.fillRect(a, t0 + 2 * u, b - a, t1 - t0 - 2 * u);          // the open water in the hole
          c.fillStyle = 'rgba(120,180,220,.35)'; c.fillRect(a, G.surf, b - a, 1.2 * u);
          ell(c, a - 4 * u, t0, 6 * u, 2.4 * u, P.snow); ell(c, b + 4 * u, t0, 6 * u, 2.4 * u, P.snow);   // shavings piled by the drill
        }
        for (let i = 0; i < 9; i++) ell(c, sr(G.w), t0, sr(10, 26) * u, sr(1, 2) * u, P.snow);
      },
      liveBack(c, G, env, P) {
        if (!P.aur) return;
        // the aurora: curtains of light swaying slowly across the sky
        const t = T(env), u = G.u, s = G.surf;
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let r = 0; r < 3; r++) {
          const img = raySprite(r === 1 ? '150,110,255' : '90,255,170'), y0 = s * (.3 + r * .12), hgt = s * (.32 - r * .05);
          for (let x = -10 * u; x < G.w + 10 * u; x += 5 * u) {
            const y = y0 + Math.sin(x / (80 * u) + t * .22 + r * 2) * 16 * u + Math.sin(x / (31 * u) - t * .35 + r) * 5 * u;
            c.globalAlpha = .18 + .14 * Math.sin(x / (47 * u) + t * .5 + r * 3);
            c.drawImage(img, x, y - hgt, 6 * u, hgt);
          }
        }
        c.restore();
      },
      front(c, G, env, P, lay) {
        const u = G.u, t = T(env);
        // the dark under the ice, open in a circle below each hole (and around any light the Engine adds)
        darkness(c, G, iceBot(G) - 1, P.dark, sight(G), env.light);
        lay(c, G, env);
        if (P.aur) { c.fillStyle = 'rgba(90,255,170,.08)'; c.fillRect(0, iceTop(G), G.w, 3 * u); }
        // snow drifting down, and a breath of wind carrying it over the ice
        snow(c, G, env, 46, G.surf, '#ffffff', 1);
        c.fillStyle = 'rgba(255,255,255,.5)';
        for (let i = 0; i < 4; i++) { const x = fr(hash(i) + t * .03) * (G.w + 80 * u) - 40 * u; c.beginPath(); c.ellipse(x, iceTop(G) - 1.5 * u, 22 * u, 1.3 * u, 0, 0, TAU); c.fill(); }
      },
    });
  }

  // =============== 7. Stormbreak Reef: open sea from a small boat; swells, gusts, squalls ===============
  {
    const bed = prof([[0, .62], [.1, .48], [.18, .36], [.3, .4], [.42, .34], [.5, .42], [.55, .6], [.6, 1], [1, 1]]);
    const feats = [
      { kind: 'rock', p0: .14, p1: .22, d0: .6, d1: 1 },   // reef heads
      { kind: 'snag', p0: .27, p1: .31, d0: .45, d1: 1 },  // branching coral that keeps a lure
      { kind: 'rock', p0: .36, p1: .44, d0: .55, d1: 1 },
      { kind: 'drop', p0: .52, p1: .6, d0: 0, d1: 1 },     // the wall into the deep
    ];
    const base = { coral: ['#ff8a7a', '#ffb35c', '#c77ad8', '#ffd86b', '#6fdc95'] };
    const pal = {
      day: Object.assign({ sky: ['#3f93d8', '#93cdee', '#d6eef7'], cloud: 'rgba(255,255,255,.92)', far: '#6a8eaa', farSea: '#3a8ab8', w: ['#2690bd', '#145f8c', '#082a4a'], g: ['#c8b48a', '#3a4650'], line: 'rgba(240,252,255,.9)', foam: '#ffffff', sun: [.8, .2, '#fffbe8', '255,250,220'], birds: 1 }, base),
      squall: Object.assign({ sky: ['#232c37', '#46525c', '#6c7880'], cloud: 'rgba(52,60,70,.95)', far: '#3a4650', farSea: '#3f5c6c', w: ['#355e70', '#173a4a', '#06161f'], g: ['#7a7468', '#232628'], line: 'rgba(220,232,236,.85)', foam: '#e8eef0', coral: ['#b07a72', '#b08a5c', '#8a6a92', '#b0a070', '#6a9a7a'], storm: 1 }, base),
      dusk: Object.assign({ sky: ['#2c2a5c', '#a85a76', '#f4a06a'], cloud: 'rgba(255,170,150,.7)', far: '#4a3f60', farSea: '#5a5a8a', w: ['#2f6090', '#163a62', '#081a33'], g: ['#8a7a6a', '#1f2430'], line: 'rgba(255,215,190,.85)', foam: '#ffe8dc', sun: [.76, .9, '#ffc27a', '255,160,100'], birds: 1 }, base),
    };
    const dip = 9;
    // The distant lightning: during a squall a flash every 7 to 13 s, a fixed pattern of the clock, so the fish can use it too.
    let lastBolt = -1;
    const bolt = env => {
      const sq = env.squall || 0;
      if (sq < .15) return 0;
      const n = Math.floor(env.t / 10), k = env.t - n * 10 - (1 + hash(n) * 6);
      return k >= 0 && k < .6 ? (k < .1 ? 1 : 1 - (k - .1) / .5) * sq : 0;
    };
    const W = make('reef', {
      stand: (G, env) => [G.x0 - 12 * G.u, G.surf + (env ? env.swell || 0 : 0) - 8 * G.u], bed, feats, pal,
      back(c, G, P) {
        const u = G.u, s = G.surf, w = G.w;
        sky(c, G, P.sky);
        if (P.sun) sun(c, w * P.sun[0], s * P.sun[1], 16 * u, P.sun[2], P.sun[3]);
        for (let i = 0; i < (P.storm ? 9 : 5); i++) cloud(c, sr(-20, w + 20), s * (P.storm ? sr(.02, .32) : sr(.1, .45)), sr(30, 60) * u * (P.storm ? 1.6 : 1), P.cloud);
        if (P.storm) { c.fillStyle = 'rgba(70,80,90,.35)'; for (let i = 0; i < 5; i++) { const x = sr(w * .3, w); c.beginPath(); c.moveTo(x, s * .3); c.lineTo(x + 30 * u, s * .3); c.lineTo(x + 14 * u, s); c.lineTo(x - 20 * u, s); c.fill(); } }
        // far sea stacks and the cape, then the far sea down to the water line
        poly(c, [w * .62, s - 4 * u, w * .64, s - 22 * u, w * .655, s - 26 * u, w * .67, s - 18 * u, w * .69, s - 4 * u], P.far);
        poly(c, [w * .74, s - 4 * u, w * .75, s - 14 * u, w * .765, s - 12 * u, w * .775, s - 4 * u], P.far);
        poly(c, [-4, s - 4 * u, -4, s - 30 * u, w * .1, s - 26 * u, w * .2, s - 12 * u, w * .28, s - 4 * u], P.far);
        c.fillStyle = P.farSea; c.fillRect(0, s - 5 * u, w, (5 + dip + 4) * u);
        c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 22; i++) c.fillRect(sr(w), s - sr(1, 4) * u, sr(4, 12) * u, .8 * u);
      },
      water(c, G, P) {
        const u = G.u, s = G.surf;
        body(c, G, P.w, s + dip * u);
        if (!P.storm) rays(c, G, G.w * .5, 5, '220,245,255', .12);
        ground(c, G, bed, P.g, 2.5);
        // the reef shelf: corals and sea fans; the wall drops into the blue
        for (let i = 0; i < 26; i++) {
          const p = sr(.08, .52), x = X(G, p), y = by(G, bed, p) + 2 * u, col = P.coral[i % 5], k = i % 4;
          if (k === 0) { for (let j = -2; j <= 2; j++) weed(c, x, y, sr(10, 18) * u, col, 2.2 * u, j * 5 * u); }
          else if (k === 1) { c.fillStyle = col; c.beginPath(); c.arc(x, y, sr(5, 9) * u, Math.PI, 0); c.fill(); }
          else if (k === 2) { c.strokeStyle = col; c.lineWidth = 1.2 * u; c.beginPath(); for (let j = 0; j < 7; j++) { c.moveTo(x, y); c.lineTo(x + (j - 3) * 3 * u, y - sr(10, 16) * u); } c.stroke(); }
          else { c.fillStyle = col; c.fillRect(x - 1.5 * u, y - 10 * u, 3 * u, 10 * u); c.fillRect(x + 2 * u, y - 6 * u, 3 * u, 6 * u); }
        }
        // the branching coral that catches lures, in white so it reads as a hazard
        const sx = X(G, .29), sy = by(G, bed, .29);
        c.strokeStyle = '#f2e8dc'; c.lineWidth = 2.2 * u; c.lineCap = 'round'; c.beginPath();
        c.moveTo(sx, sy); c.lineTo(sx, sy - 34 * u); c.moveTo(sx, sy - 14 * u); c.lineTo(sx - 10 * u, sy - 26 * u); c.moveTo(sx, sy - 22 * u); c.lineTo(sx + 9 * u, sy - 32 * u); c.moveTo(sx - 6 * u, sy - 20 * u); c.lineTo(sx - 12 * u, sy - 18 * u); c.stroke();
        for (let i = 0; i < 6; i++) { const p = sr(.6, 1); weed(c, X(G, p), G.bed + 10 * u, sr(60, 120) * u, 'rgba(40,90,70,.45)', 4 * u, sr(-20, 20) * u); }
      },
      liveBack(c, G, env, P) {
        const t = T(env), u = G.u, s = G.surf, sq = env.squall || 0, f = bolt(env);
        // the squall darkens the sky as it builds
        if (sq > 0) { c.fillStyle = `rgba(20,26,34,${(sq * .45).toFixed(3)})`; c.fillRect(0, 0, G.w, s); }
        // distant lightning: a soft flash and a bolt on the horizon (no flash with reduced motion), then thunder
        if (f > 0) {
          const n = Math.floor(env.t / 10), bx = G.w * (.45 + hash(n + 3) * .5);
          if (!still()) { c.fillStyle = `rgba(230,236,255,${(f * .22).toFixed(3)})`; c.fillRect(0, 0, G.w, s); }
          c.strokeStyle = `rgba(245,248,255,${still() ? .8 : f.toFixed(3)})`; c.lineWidth = 1.6 * u; c.beginPath(); c.moveTo(bx, s * .25);
          let x = bx; for (let i = 1; i <= 6; i++) { x += (hash(n * 7 + i) - .5) * 14 * u; c.lineTo(x, s * .25 + (s * .75 - 4 * u) * i / 6); }
          c.stroke();
          if (lastBolt !== n) { lastBolt = n; later(() => amb.hit('thunder'), 900 + hash(n + 1) * 1600); }
        }
        // sea birds far off, gliding
        if (P.birds && sq < .5) {
          c.strokeStyle = 'rgba(40,50,70,.7)'; c.lineWidth = 1.2 * u; c.beginPath();
          for (let i = 0; i < 3; i++) { const x = fr(hash(i) + t * .008) * (G.w + 40 * u) - 20 * u, y = s * (.25 + hash(i + 2) * .3) + Math.sin(t * .5 + i) * 6 * u, wv = still() ? 2 : Math.sin(t * 3 + i * 2) * 2.5; c.moveTo(x - 6 * u, y - wv * u); c.quadraticCurveTo(x - 3 * u, y - 3 * u, x, y); c.quadraticCurveTo(x + 3 * u, y - 3 * u, x + 6 * u, y - wv * u); }
          c.stroke();
        }
        // the boat rides the swell; its pennant points with the wind
        const sw = env.swell || 0, bx = G.x0 - 10 * u, by0 = s + sw, tilt = still() ? 0 : Math.sin(env.t * .9 + 1) * .05 * (1 + sq);
        const col = MAP_PAINT[S.look.boat] || MAP_PAINT[0];
        c.save(); c.translate(bx, by0); c.rotate(tilt);
        c.strokeStyle = '#4a3420'; c.lineWidth = 1.6 * u; c.beginPath(); c.moveTo(-26 * u, -9 * u); c.lineTo(-26 * u, -40 * u); c.stroke();
        const wd = env.wind || 0, fl = still() ? 0 : Math.sin(env.t * 8) * 1.5 * u;
        c.fillStyle = '#ffd24a'; c.beginPath(); c.moveTo(-26 * u, -40 * u); c.lineTo(-26 * u + (wd >= 0 ? 1 : -1) * (6 + 8 * Math.abs(wd)) * u, -37 * u + fl); c.lineTo(-26 * u, -33 * u); c.fill();
        c.beginPath(); c.moveTo(-36 * u, -10 * u); c.lineTo(32 * u, -12 * u); c.quadraticCurveTo(30 * u, 5 * u, 18 * u, 8 * u); c.lineTo(-24 * u, 8 * u); c.quadraticCurveTo(-35 * u, 4 * u, -36 * u, -10 * u); c.closePath();
        c.fillStyle = col; c.fill(); c.lineWidth = 1.4 * u; c.strokeStyle = 'rgba(0,0,0,.35)'; c.stroke();
        c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.moveTo(-34 * u, -5 * u); c.lineTo(31 * u, -7 * u); c.lineTo(30 * u, -4 * u); c.lineTo(-33 * u, -2 * u); c.fill();
        c.fillStyle = '#6a4428'; c.beginPath(); c.moveTo(-37 * u, -12 * u); c.lineTo(33 * u, -14 * u); c.lineTo(33 * u, -11 * u); c.lineTo(-37 * u, -9 * u); c.fill();
        c.restore();
      },
      liveWater(c, G, env, P) {
        if (P.storm) return;
        // sunlight rippling over the reef
        const t = T(env), u = G.u; c.fillStyle = 'rgba(220,250,255,.12)';
        for (let i = 0; i < 10; i++) { const p = .06 + i * .05 + Math.sin(t * .6 + i) * .01, x = X(G, p), y = by(G, bed, p) - 3 * u; c.beginPath(); c.ellipse(x, y, (8 + 4 * Math.sin(t + i)) * u, 1.6 * u, 0, 0, TAU); c.fill(); }
      },
      front(c, G, env, P) {
        const u = G.u, t = T(env), sq = env.squall || 0, wd = env.wind || 0, sw = env.swell || 0;
        const amp = (2.5 + 4.5 * sq + 1.5 * Math.abs(wd)) * u;
        surface(c, G, env, 0, Math.min(amp, (dip - 1) * u), (22 - 6 * sq) * u, 1.3 + sq, P.w[0], P.line, 1.5 * u);
        // whitecaps when the wind is up
        const caps = Math.round(4 + 10 * Math.max(sq, Math.abs(wd)));
        c.fillStyle = P.foam;
        for (let i = 0; i < caps; i++) { const x = fr(hash(i) + t * .02 * (wd || .3)) * G.w; c.globalAlpha = still() ? .6 : .3 + .5 * Math.abs(Math.sin(t * 1.2 + i * 1.9)); c.beginPath(); c.ellipse(x, G.surf + sw - amp * .6, (5 + hash(i + 4) * 8) * u, 1.3 * u, 0, 0, TAU); c.fill(); }
        c.globalAlpha = 1;
        // spray at the boat's bow
        if (sq > .3 && !still()) { c.fillStyle = 'rgba(240,248,250,.7)'; for (let i = 0; i < 6; i++) { const k = fr(t * 1.4 + i / 6); c.beginPath(); c.arc(G.x0 + 22 * u + k * 16 * u * (wd >= 0 ? 1 : -.5), G.surf + sw - 10 * u - Math.sin(k * Math.PI) * 14 * u, 1.3 * u, 0, TAU); c.fill(); } }
        // squall rain, slanted by the wind
        if (sq > .05) rain(c, G, env, Math.round(30 + 70 * sq), 16 * u, .15 + wd * .45, `rgba(220,230,236,${(.25 + .35 * sq).toFixed(2)})`, u, G.surf + sw);
      },
    });
    W.bolt = bolt;
  }

  // =============== 8. The Lantern Deep: a bottomless night trench, fished by lantern light from a raft ===============
  {
    const bed = prof([[0, .9], [.05, .97], [.1, 1], [1, 1]]);
    const feats = [
      { kind: 'rock', p0: 0, p1: .05, d0: .35, d1: 1 },   // the trench wall under the raft
      { kind: 'drop', p0: .03, p1: .1, d0: 0, d1: 1 },    // the edge: past it, the water has no bottom
    ];
    const pal = { night: { sky: ['#01030b', '#050c22', '#0c1838'], far: '#03070f', w: ['#06172a', '#020a14', '#000000'], line: 'rgba(150,190,255,.45)', lamp: '#ffd27a' } };
    const lamp = (G, env) => [G.x0 + 22 * G.u, G.surf + (env ? env.swell || 0 : 0) - 36 * G.u];
    const W = make('deep', {
      stand: (G, env) => [G.x0 - 16 * G.u, G.surf + (env ? env.swell || 0 : 0) - 5 * G.u], bed, feats, pal,
      back(c, G, P) {
        const u = G.u, s = G.surf, w = G.w;
        sky(c, G, P.sky);
        stars(c, G, 160, s * .95, '#e8eeff');
        // the milky way: a faint band of tiny stars from low left to high right
        c.fillStyle = '#dfe6ff';
        for (let i = 0; i < 260; i++) { const k = sr(); c.globalAlpha = sr(.15, .6); c.fillRect(k * w, s * (.62 - .5 * k) + (sr() + sr() + sr() - 1.5) * s * .1, .9 * u, .9 * u); }
        c.globalAlpha = 1;
        for (let i = 0; i < 6; i++) glowAt(c, w * (i + .5) / 6, s * (.62 - .5 * (i + .5) / 6), s * .16, '170,180,230', .1);
        crescent(c, w * .2, s * .28, 9 * u, '#f2ecd0');
        // the trench walls rise black on both sides
        poly(c, [-4, s, -4, s * .35, w * .08, s * .42, w * .16, s * .7, w * .24, s], P.far);
        poly(c, [w + 4, s, w + 4, s * .25, w * .9, s * .4, w * .84, s * .62, w * .78, s * .8, w * .72, s], P.far);
        c.fillStyle = 'rgba(160,190,255,.25)'; for (let i = 0; i < 16; i++) c.fillRect(sr(w * .25, w * .7), s - sr(.5, 3) * u, sr(3, 9) * u, .7 * u);
      },
      water(c, G, P) {
        const u = G.u, s = G.surf;
        body(c, G, P.w);
        // the trench wall under the raft, then nothing: the water simply goes black
        const wx = X(G, .05);
        c.fillStyle = '#0a1422'; c.beginPath(); c.moveTo(-4, s + 30 * u); c.lineTo(wx - 10 * u, s + 40 * u); c.lineTo(wx, s + 90 * u); c.lineTo(wx - 6 * u, s + 160 * u); c.lineTo(wx + 4 * u, G.h + 60 * u); c.lineTo(-4, G.h + 60 * u); c.fill();
        c.strokeStyle = 'rgba(120,150,190,.18)'; c.lineWidth = u; c.beginPath(); c.moveTo(-4, s + 30 * u); c.lineTo(wx - 10 * u, s + 40 * u); c.lineTo(wx, s + 90 * u); c.lineTo(wx - 6 * u, s + 160 * u); c.stroke();
        const g = c.createLinearGradient(0, s + (G.bed - s) * .4, 0, G.h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000');
        c.fillStyle = g; c.fillRect(0, s, G.w, G.h + 60 * u);
      },
      // the light warms the water it reaches, so the shadows inside it stand out against it
      liveWater(c, G, env) {
        const L = env.light;
        if (!L || !L.length) return;
        c.save(); c.beginPath(); c.rect(0, G.surf + (env.swell || 0), G.w, G.h); c.clip();
        for (let i = 0; i < L.length; i++) glowAt(c, L[i].x, L[i].y, L[i].r, '74,124,140', .6);
        c.restore();
      },
      liveBack(c, G, env, P) {
        // the raft rides the water; the lantern hangs over it and breathes; a moth keeps it company
        const t = T(env), u = G.u, sw = env.swell || 0, x = G.x0 - 14 * u, y = G.surf + sw;
        const col = MAP_PAINT[S.look.boat] || MAP_PAINT[0];
        rr(c, x - 38 * u, y - 7 * u, 76 * u, 9 * u, 4.5 * u); c.fillStyle = '#4a3420'; c.fill();
        rr(c, x - 36 * u, y - 10 * u, 72 * u, 6 * u, 3 * u); c.fillStyle = col; c.fill();
        c.fillStyle = 'rgba(0,0,0,.3)'; for (let k = -2; k <= 2; k++) c.fillRect(x + k * 14 * u, y - 10 * u, .8 * u, 6 * u);
        c.fillStyle = '#d8c090'; for (let k = -1; k <= 1; k++) c.fillRect(x + k * 26 * u - u, y - 10 * u, 2.2 * u, 12 * u);
        const [lx, ly] = lamp(G, env);
        c.strokeStyle = '#3a2a18'; c.lineWidth = 2.2 * u; c.beginPath(); c.moveTo(lx - 12 * u, y - 9 * u); c.lineTo(lx - 10 * u, ly - 12 * u); c.lineTo(lx, ly - 12 * u); c.lineTo(lx, ly - 6 * u); c.stroke();
        const f = still() ? .75 : .65 + .12 * Math.sin(t * 6) * Math.sin(t * 2.1);
        glowAt(c, lx, ly, 70 * u, '255,200,110', f * .6);
        rr(c, lx - 4 * u, ly - 6 * u, 8 * u, 11 * u, 2 * u); c.fillStyle = P.lamp; c.fill(); c.lineWidth = 1.2 * u; c.strokeStyle = '#2a1e10'; c.stroke();
        const a = t * 2.4, mx = lx + Math.cos(a) * 14 * u, my = ly + Math.sin(a * 1.4) * 8 * u;
        c.fillStyle = '#efe6cc'; c.beginPath(); c.ellipse(mx, my, 1.9 * u, (still() ? 1.2 : .6 + Math.abs(Math.sin(t * 28)) * 1.3) * u, 0, 0, TAU); c.fill();
      },
      front(c, G, env, P) {
        const u = G.u, t = T(env), calmly = still();
        surface(c, G, env, 0, .8 * u, 40 * u, .5, '', P.line, 1.1 * u);
        // everything under the surface is dark outside the circles of light
        darkness(c, G, G.surf + (env.swell || 0) - 1, 'rgba(0,2,8,.95)', env.light, null);
        // glowing plankton drifting up out of the black
        for (let i = 0; i < 26; i++) {
          const k = fr(hash(i) + t * (.006 + hash(i + 1) * .008)), x = G.w * (.1 + hash(i + 2) * .9) + Math.sin(t * .4 + i) * 8 * u, y = G.h - k * (G.h - G.surf - 10 * u);
          glowAt(c, x, y, 5 * u, i % 3 ? '80,220,255' : '150,255,200', calmly ? .55 : .3 + .35 * Math.sin(t * 1.3 + i * 2));
        }
      },
    });
    W.lamp = lamp;
  }

  // =============== 9. The Drowned Chapel: a bell tower in black, perfectly still water; fog over the far shore ===============
  {
    const bed = prof([[0, .46], [.14, .56], [.2, .66], [.27, .93], [.6, .95], [.74, .95], [.86, 1], [1, .92]]);
    const feats = [
      { kind: 'drop', p0: .18, p1: .27, d0: 0, d1: 1 },   // the drowned road falls away to the nave
      { kind: 'beam', p0: .32, p1: .42, d0: .82, d1: 1 }, // sunken pews
      { kind: 'rock', p0: .46, p1: .53, d0: .8, d1: 1 },  // the sunken bell
      { kind: 'rock', p0: .62, p1: .72, d0: 0, d1: 1 },   // the bell tower: its walls rise through the surface
      { kind: 'beam', p0: .8, p1: .88, d0: .75, d1: 1 },  // a fallen roof beam
    ];
    const pal = { fog: { sky: ['#9ea4a6', '#c3c7c4', '#d9dbd6'], far: '#b2b8b7', tree: '#8f9696', tower: ['#868c8e', '#5f6669'], roof: '#555c5f', w: ['#11161b', '#06080b', '#000000'], g: ['#24292d', '#0a0c0e'], fog: '216,219,214', line: 'rgba(225,230,230,.55)', stone: ['#8a8f8e', '#5f6564'] } };
    // The tower stands slim above the water; below it the walls widen to its whole footprint (the 'rock' at .62 to .72).
    const towerX = G => X(G, .67), baseW = G => X(G, .72) - X(G, .62), towerW = G => clamp(baseW(G), 16 * G.u, 30 * G.u);
    const towerTop = G => Math.max(towerW(G) * 1.2 + 8 * G.u, G.surf - 150 * G.u);
    const bell = G => [X(G, .495), by(G, bed, .495)];
    // A soft band of fog: painted once per size, slid across the scene a little every frame.
    function fogBand(c, G, h, rgb) {
      const u = G.u;
      for (let i = 0; i < 26; i++) { const fw = sr(140, 300) * u, fh = sr(.12, .3) * h; c.drawImage(sprite('fog' + rgb, rgb, .45, .55), sr(-.15, 1) * G.w - fw / 4, sr(.25, .85) * h - fh / 2, fw, fh); }
    }
    make('chapel', {
      stand: G => [G.x0 - 10 * G.u, G.surf - 10 * G.u], bed, feats, pal,
      back(c, G, P) {
        const u = G.u, s = G.surf, w = G.w;
        sky(c, G, P.sky);
        // the far shore: bare trees, half gone in the fog
        hills(c, G, s, 18 * u, 70 * u, 2.6, P.far);
        for (let i = 0; i < 16; i++) bare(c, sr(w * .05, w), s - sr(2, 10) * u, sr(26, 50) * u, P.tree, sr(1.4, 2.4) * u);
        c.fillStyle = 'rgba(216,219,214,.4)'; c.fillRect(0, s - 40 * u, w, 40 * u);
        // the bell tower: courses of stone, an empty belfry, a slate spire
        const x = towerX(G), tw = towerW(G), t0 = towerTop(G);
        c.fillStyle = P.tower[0]; c.fillRect(x - tw / 2, t0, tw, s - t0 + 2);
        c.fillStyle = 'rgba(0,0,0,.14)'; for (let y = t0 + 6 * u; y < s; y += 7 * u) c.fillRect(x - tw / 2, y, tw, .8 * u);
        c.fillStyle = 'rgba(0,0,0,.16)'; c.fillRect(x + tw * .16, t0, tw * .34, s - t0);
        c.fillStyle = P.tower[1]; c.fillRect(x - tw / 2 - 2 * u, t0 + 30 * u, tw + 4 * u, 3 * u); c.fillRect(x - tw / 2 - 2 * u, t0, tw + 4 * u, 3 * u);
        const aw = tw * .22, ay = t0 + 7 * u;
        c.fillStyle = '#2a2f33'; c.beginPath(); c.moveTo(x - aw, ay + 21 * u); c.lineTo(x - aw, ay + aw); c.arc(x, ay + aw, aw, Math.PI, 0); c.lineTo(x + aw, ay + 21 * u); c.fill();   // the empty belfry
        c.fillStyle = '#2a2f33'; c.fillRect(x - 2 * u, t0 + 46 * u, 4 * u, 10 * u);
        poly(c, [x - tw / 2 - 3 * u, t0, x + tw / 2 + 3 * u, t0, x, t0 - tw * 1.2], P.roof);
        // the fog thickens towards the top of the tower and the far shore
        const g = c.createLinearGradient(0, 0, 0, s); g.addColorStop(0, 'rgba(216,219,214,.55)'); g.addColorStop(.6, 'rgba(216,219,214,0)');
        c.fillStyle = g; c.fillRect(0, 0, w, s);
        // the near end: the old road's stones going down into the water, a post with a dark lantern
        const lx = X(G, .015);
        c.fillStyle = P.stone[0]; c.beginPath(); c.moveTo(-4, s - 10 * u); c.lineTo(lx - 4 * u, s - 10 * u); c.lineTo(lx + 2 * u, s - 5 * u); c.lineTo(lx + 6 * u, s + 3 * u); c.lineTo(-4, s + 3 * u); c.fill();
        c.fillStyle = P.stone[1]; for (let k = -4 + 12 * u; k < lx; k += 14 * u) c.fillRect(k, s - 10 * u, 1.2 * u, 13 * u);
        c.fillStyle = '#9a9a7a'; c.fillRect(-4, s - 11 * u, lx, 1.2 * u);
        const px = G.x0 - 46 * u;
        line(c, [px, s - 10 * u, px + 2 * u, s - 46 * u, px + 10 * u, s - 46 * u], '#3a3e40', 2 * u);
        rr(c, px + 7 * u, s - 45 * u, 7 * u, 9 * u, 1.5 * u); c.fillStyle = '#4a5052'; c.fill();
      },
      water(c, G, P) {
        const u = G.u, s = G.surf, x = towerX(G), tw = towerW(G);
        body(c, G, P.w);
        // the tower's faint reflection just under the still surface
        const g = c.createLinearGradient(0, s, 0, s + 60 * u); g.addColorStop(0, 'rgba(150,158,160,.2)'); g.addColorStop(1, 'rgba(150,158,160,0)');
        c.fillStyle = g; c.fillRect(x - tw / 2, s, tw, 60 * u);
        ground(c, G, bed, P.g, .6);
        bankUnder(c, G, bed, X(G, .015) + 6 * u, P.g);
        // the nave floor: flagstones; sunken pews; the fallen roof beam
        c.strokeStyle = 'rgba(160,170,170,.12)'; c.lineWidth = u; c.beginPath();
        for (let p = .28; p < 1; p += .025) { const xx = X(G, p); c.moveTo(xx, by(G, bed, p)); c.lineTo(xx + 2 * u, by(G, bed, p) + 8 * u); }
        c.stroke();
        for (let k = 0; k < 4; k++) { const p = .325 + k * .025, xx = X(G, p), yb = by(G, bed, p); c.fillStyle = '#1e1a16'; c.fillRect(xx - 4 * u, yb - 12 * u, 3 * u, 12 * u); c.fillRect(xx - 4 * u, yb - 8 * u, 10 * u, 2.5 * u); }
        c.save(); c.translate(X(G, .84), by(G, bed, .84) - 6 * u); c.rotate(-.35); c.fillStyle = '#1a1714'; c.fillRect(-26 * u, -3 * u, 52 * u, 6 * u); c.restore();
        // the tower's walls go down to the floor, widening into the old nave walls, darker under the water
        const fy = by(G, bed, .67), bw = baseW(G);
        c.fillStyle = '#2b3134'; c.beginPath(); c.moveTo(x - tw / 2, s); c.lineTo(x + tw / 2, s); c.lineTo(x + bw / 2, fy + 4 * u); c.lineTo(x - bw / 2, fy + 4 * u); c.fill();
        c.fillStyle = 'rgba(0,0,0,.25)'; for (let y = s + 7 * u; y < fy; y += 7 * u) { const k = (y - s) / (fy - s), hw = (tw + (bw - tw) * k) / 2; c.fillRect(x - hw, y, hw * 2, .8 * u); }
        c.fillStyle = '#0d1012'; c.beginPath(); c.moveTo(x - tw * .2, fy); c.lineTo(x - tw * .2, fy - 26 * u); c.arc(x, fy - 26 * u, tw * .2, Math.PI, 0); c.lineTo(x + tw * .2, fy); c.fill();
        for (let i = 0; i < 6; i++) stone(c, x + (i - 2.5) * bw * .2, fy + u, sr(3, 6) * u, sr(2, 4) * u, '#3a4044', '#7a8488');   // fallen stones
        // the sunken bell, on its side in the silt, pale with age
        const [bx, byy] = bell(G);
        c.save(); c.translate(bx, byy - 6 * u); c.rotate(-1.2);
        c.fillStyle = '#5f7a72'; c.beginPath(); c.moveTo(-6 * u, -10 * u); c.quadraticCurveTo(-7 * u, 4 * u, -12 * u, 9 * u); c.lineTo(12 * u, 9 * u); c.quadraticCurveTo(7 * u, 4 * u, 6 * u, -10 * u); c.quadraticCurveTo(0, -14 * u, -6 * u, -10 * u); c.fill();
        c.fillStyle = 'rgba(220,235,225,.25)'; c.fillRect(-11 * u, 6 * u, 22 * u, 1.6 * u);
        c.restore();
        for (let i = 0; i < 12; i++) { const p = sr(.25, 1); weed(c, X(G, p), by(G, bed, p) + 2 * u, sr(10, 30) * u, 'rgba(170,180,170,.16)', 1.2 * u, sr(-4, 4) * u); }
      },
      // a low fog lying on the water, thickest over the far shore
      top(c, G, P) {
        const s = G.surf, u = G.u, g = c.createLinearGradient(X(G, .45), 0, G.w, 0);
        g.addColorStop(0, 'rgba(216,219,214,0)'); g.addColorStop(1, 'rgba(216,219,214,.55)');
        c.fillStyle = g; c.fillRect(0, 0, G.w, s);
        const g2 = c.createLinearGradient(0, s - 18 * u, 0, s + 4 * u); g2.addColorStop(0, 'rgba(216,219,214,0)'); g2.addColorStop(1, 'rgba(216,219,214,.5)');
        c.fillStyle = g2; c.fillRect(0, s - 18 * u, G.w, 22 * u);
      },
      front(c, G, env, P, lay) {
        const u = G.u, t = T(env), s = G.surf, x = towerX(G), tw = towerW(G), calmly = still();
        // the surface does not move at all
        c.fillStyle = P.line; c.fillRect(X(G, .015) + 6 * u, s - .5 * u, G.w, 1 * u);
        // after the bell: rings spread from the tower over the still water, and a tremor around the sunken bell
        const k = env.toll;
        if (k >= 0 && k < 12) {
          const a = (1 - k / 12) * .6;
          c.strokeStyle = `rgba(230,235,235,${a.toFixed(3)})`; c.lineWidth = 1.3 * u;
          for (let i = 0; i < 3; i++) { const r = calmly ? (14 + i * 22) * u : (k - i * .7) * 34 * u; if (r <= 0) continue; c.beginPath(); c.ellipse(x, s + .5 * u, r + tw / 2, (r + tw / 2) * .16, 0, 0, TAU); c.stroke(); }
          const [bx, byy] = bell(G);
          c.strokeStyle = `rgba(200,225,215,${(a * .6).toFixed(3)})`;
          for (let i = 0; i < 2; i++) { const r = (16 + i * 9 + (calmly ? 0 : fr(k * .8) * 8)) * u; c.beginPath(); c.arc(bx, byy - 6 * u, r, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
        }
        // a drop falls from the tower's ledge now and then, and makes one small ring
        if (!calmly) {
          const dk = fr(env.t / 6.3), dx = x + tw / 2 + 2.5 * u, dy0 = towerTop(G) + 31 * u;
          if (dk < .12) circ(c, dx, lerp(dy0, s, dk / .12), 1.2 * u, 'rgba(225,232,235,.8)');
          else if (dk < .6) { const r = (dk - .12) * 40 * u; c.strokeStyle = `rgba(225,232,235,${(.6 - dk).toFixed(3)})`; c.lineWidth = .8 * u; c.beginPath(); c.ellipse(dx, s + .5 * u, r, r * .12, 0, 0, TAU); c.stroke(); }
        }
        lay(c, G, env);
        // slow fog drifting across, over the far half of the scene
        const fogH = s * .7, img = cached('chapel', 'fog', G, env.cond, 0, fogH, k2 => fogBand(k2, G, fogH, P.fog)), off = fr(t * .006) * G.w;
        c.globalAlpha = .4; c.drawImage(img, off, s - fogH * .75, G.w, fogH); c.drawImage(img, off - G.w, s - fogH * .75, G.w, fogH); c.globalAlpha = 1;
      },
    });
  }

  // =============== The living title picture: Sunnybrook Pond at first light ===============
  // The Chief sits on the dock with a rod; the bobber rocks; a dragonfly comes to rest on it; a big slow shadow
  // (Grandpa Biscuit) slides under the dock. With reduced motion everything rests in place.
  const HG = { w: 0, h: 0, surf: 0, bed: 0, x0: 0, x1: 0, u: 1, ax: 0, ay: 0 };
  const HE = { t: 0, cond: 'dawn', swell: 0, tide: 0, wind: 0, squall: 0, light: [], toll: 1e9, perch: [0, 0] };
  drawHome = (c, t) => {
    const w = V.w, h = V.h, land = wide(), pond = WATER.pond, calmly = still();
    HG.w = w; HG.h = h; HG.u = Math.min(w, h) / 360;
    HG.surf = Math.round(h * (land ? .6 : .48)); HG.bed = Math.round(h * .97);
    HG.x0 = Math.round(w * (land ? .16 : .3)); HG.x1 = Math.round(land ? w * .62 : w * 1.05);
    const u = HG.u, bp = .42, bx = X(HG, bp), bob = calmly ? 0 : Math.sin(t * 1.7) * 1.2 * u + Math.sin(t * .6) * .6 * u, byy = HG.surf + bob;
    HE.t = t; HE.perch[0] = bx; HE.perch[1] = byy - 9 * u;
    pond.back(c, HG, HE); pond.water(c, HG, HE);
    // the shadow under the dock
    const k = calmly ? .5 : (Math.sin(t * .13) + 1) / 2, sp = lerp(-.06, .2, k), sx = X(HG, sp), sy = HG.surf + .55 * pond.bed(clamp(sp, 0, 1)) * (HG.bed - HG.surf), dir = Math.cos(t * .13) >= 0 || calmly ? 1 : -1;
    if (typeof drawFish === 'function' && SPECIES.biscuit) drawFish(c, 'biscuit', sx, sy, 46 * u, { dir, t, mode: 'shadow', alpha: .5, wag: .3 });
    else {
      c.save(); c.translate(sx, sy); c.scale(dir, 1); c.fillStyle = 'rgba(12,34,44,.42)';
      c.beginPath(); c.ellipse(0, 0, 22 * u, 15 * u, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(-18 * u, 0); c.lineTo(-32 * u, -9 * u + (calmly ? 0 : Math.sin(t * 3) * 2 * u)); c.lineTo(-32 * u, 9 * u + (calmly ? 0 : Math.sin(t * 3) * 2 * u)); c.fill();
      c.restore();
    }
    pond.front(c, HG, HE);
    // the Chief with a rod, the line, the bobber
    const [ax, ay] = pond.stand(HG), [hx, hy] = chief(c, ax, ay, u * 1.1, t, { pose: 'sit' });
    const tx = hx + 34 * u, ty = hy - 40 * u;
    line(c, [hx - 6 * u, hy + 6 * u, tx, ty], '#7a4f2a', 2.2 * u);
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = .9 * u; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo((tx + bx) / 2, Math.max(ty, byy) - 4 * u, bx, byy - 6 * u); c.stroke();
    c.beginPath(); c.arc(bx, byy - 2 * u, 4 * u, Math.PI, 0); c.fillStyle = '#e8503a'; c.fill();
    c.beginPath(); c.arc(bx, byy - 2 * u, 4 * u, 0, Math.PI); c.fillStyle = '#fff6da'; c.fill();
    c.fillStyle = '#3a2a1a'; c.fillRect(bx - .6 * u, byy - 9 * u, 1.2 * u, 4 * u);
  };
}

// ---------- Ambience: looped, filtered noise beds and slow tones per water, crossfaded; small one-shots on top ----------
// Everything goes through the core's `master` gain, so mute and volume apply. Without a sound context nothing happens.
{
  let cur = null, curId = '', curCond = '', wantId = '', wantEnv = null, white = null, brown = null, lastUpd = 0, timer = 0;
  const live = () => !!(AC && master && !S.mute);
  // Three seconds of noise, white or brown (smoother, deeper), looped by the beds; the ends meet without a click.
  function noiseBuf(deep) {
    const n = AC.sampleRate * 3 | 0, b = AC.createBuffer(1, n, AC.sampleRate), ch = b.getChannelData(0);
    let v = 0;
    for (let i = 0; i < n; i++) { const r = Math.random() * 2 - 1; if (deep) { v = (v + .02 * r) / 1.02; ch[i] = v * 3.5; } else ch[i] = r; }
    if (deep) { const d = ch[n - 1] - ch[0]; for (let i = 0; i < n; i++) ch[i] -= d * i / n; }
    return b;
  }
  // Layers: noise ('w' or 'b') through a filter, or a tone (`f` with no `n`). lfo: [Hz, depth] on the loudness;
  // sweep: [Hz, depth in Hz] on the filter; key: a name for loudness that follows the weather.
  const lap = { n: 'b', type: 'lowpass', f: 420, vol: .13, lfo: [.27, .06] };
  const breeze = { n: 'w', type: 'bandpass', f: 1100, q: .5, vol: .018, lfo: [.07, .01] };
  const air = { n: 'b', type: 'lowpass', f: 150, vol: .05 };
  // What each water sounds like; `ev` is how many small sounds per second: birds thin out with the tier and stop at the chapel.
  function spec(id, cond) {
    const late = cond === 'dusk' || cond === 'night';
    switch (id) {
      case 'pond': return { L: [lap, breeze], ev: { bird: late ? .1 : .5, cricket: late ? .6 : 0 } };
      case 'creek': return { L: [{ n: 'w', type: 'bandpass', f: 1300, q: .6, vol: .06, sweep: [.5, 250] }, { n: 'w', type: 'bandpass', f: 2600, q: 1.4, vol: .03, lfo: [1.7, .02] }, { n: 'b', type: 'lowpass', f: 300, vol: .09 }], ev: { bird: late ? .08 : .32, cricket: late ? .35 : 0 } };
      case 'pier': return { L: [{ n: 'b', type: 'lowpass', f: 500, vol: .15, lfo: [.17, .09] }, air], ev: { gull: .05, bird: .03 } };
      case 'falls': return { L: [{ n: 'w', type: 'highpass', f: 3000, vol: .045 }, { n: 'w', type: 'bandpass', f: 6000, q: .7, vol: .025 }, { n: 'b', type: 'lowpass', f: 700, vol: .22 }, { n: 'w', type: 'bandpass', f: 500, q: .5, vol: .05 }], ev: { bird: .04, drip: .1 } };
      case 'mill': return { L: [{ n: 'b', type: 'lowpass', f: 300, vol: .1, lfo: [.12, .05] }, { n: 'w', type: 'bandpass', f: 500, q: .8, vol: .016, sweep: [.05, 200] }], ev: { bird: late ? 0 : .12, frog: late ? .3 : .05, cricket: cond === 'night' ? .4 : 0 } };
      case 'ice': return { L: [{ n: 'w', type: 'bandpass', f: 700, q: 1.2, vol: .04, sweep: [.06, 400], lfo: [.09, .03] }, air], ev: { creak: .07 } };
      case 'reef': return { L: [{ n: 'b', type: 'lowpass', f: 450, vol: .2, lfo: [.11, .14] }, { n: 'w', type: 'bandpass', f: 1800, q: .5, vol: .028, lfo: [.11, .02] }, { n: 'w', type: 'bandpass', f: 800, q: .7, vol: .02, key: 'wind' }, { n: 'w', type: 'highpass', f: 2500, vol: 0, key: 'rain' }], ev: { gull: cond === 'squall' ? 0 : .05 } };
      case 'deep': return { L: [{ f: 46, vol: .05 }, { f: 46.6, vol: .04 }, { f: 92.5, vol: .012 }, { n: 'b', type: 'lowpass', f: 250, vol: .07, lfo: [.2, .04] }], ev: { drip: .02 } };
      case 'chapel': return { L: [{ n: 'b', type: 'lowpass', f: 140, vol: .04 }], ev: { drip: .22 } };
      default: return { L: [breeze, { n: 'b', type: 'lowpass', f: 380, vol: .05, lfo: [.2, .03] }], ev: { bird: .5 } };   // the map and the treehouse
    }
  }
  function lfo(rate, depth, param) { const o = AC.createOscillator(), d = AC.createGain(); o.frequency.value = rate; d.gain.value = depth; o.connect(d); d.connect(param); o.start(); return o; }
  function build(sp) {
    if (!white) { white = noiseBuf(false); brown = noiseBuf(true); }
    const out = AC.createGain(), nodes = [], keys = {};
    out.gain.value = .0001; out.connect(master);
    for (const l of sp.L) {
      const g = AC.createGain(); g.gain.value = l.vol; g.connect(out);
      let src;
      if (!l.n) { src = AC.createOscillator(); src.frequency.value = l.f; src.connect(g); src.start(); }
      else {
        src = AC.createBufferSource(); src.buffer = l.n === 'w' ? white : brown; src.loop = true;
        const f = AC.createBiquadFilter(); f.type = l.type; f.frequency.value = l.f; f.Q.value = l.q || .7;
        src.connect(f); f.connect(g); src.start(0, Math.random() * 2.5);   // a random start, so two beds never sound alike
        if (l.sweep) nodes.push(lfo(l.sweep[0], l.sweep[1], f.frequency));
      }
      nodes.push(src);
      if (l.lfo) nodes.push(lfo(l.lfo[0], l.lfo[1], g.gain));
      if (l.key) keys[l.key] = g;
    }
    out.gain.setTargetAtTime(1, AC.currentTime, .7);
    return { out, nodes, keys, ev: sp.ev };
  }
  function fade(b) {
    if (!b) return;
    b.out.gain.setTargetAtTime(.0001, AC.currentTime, .6);
    setTimeout(() => { for (const n of b.nodes) try { n.stop(); } catch (e) { /* already stopped */ } b.out.disconnect(); }, 4000);
  }
  // Small sounds. Bed sounds (bird, cricket, frog, gull) come by chance; the rest are the one-shots of amb.hit.
  const ONE = {
    bird() { const f = rnd(1900, 3400), n = 2 + (Math.random() * 3 | 0), v = rnd(.016, .036), up = Math.random() < .5; for (let i = 0; i < n; i++) up ? tone(f * (1 + i * .06), .07, 'sine', v, i * .11, f * 1.25) : tone(f, .12, 'sine', v, i * .16, f * .72); },
    cricket() { for (let i = 0; i < 3; i++) tone(4400, .025, 'triangle', .007, i * .055); },
    frog() { tone(140, .1, 'sawtooth', .014, 0, 105); tone(150, .1, 'sawtooth', .011, .16, 110); },
    gull() { tone(1250, .3, 'triangle', .015, 0, 820); tone(1150, .22, 'triangle', .011, .34, 800); },
    drip() { tone(900, .07, 'sine', .055, 0, 1900); tone(900, .07, 'sine', .018, .22, 1900); tone(900, .07, 'sine', .007, .44, 1900); },
    creak() { tone(1700, .9, 'sine', .02, 0, 240); tone(2600, .6, 'sine', .011, .08, 420); tone(62, .7, 'sawtooth', .013, .05, 48); },
    gust() {
      const t0 = AC.currentTime, src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
      src.buffer = white; src.loop = true; f.type = 'bandpass'; f.Q.value = .8;
      f.frequency.setValueAtTime(350, t0); f.frequency.exponentialRampToValueAtTime(1100, t0 + .6); f.frequency.exponentialRampToValueAtTime(420, t0 + 1.6);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.09, t0 + .5); g.gain.exponentialRampToValueAtTime(.0001, t0 + 1.7);
      src.connect(f); f.connect(g); g.connect(master); src.start(t0, Math.random() * 2); src.stop(t0 + 1.8);
    },
    thunder() {
      const t0 = AC.currentTime, src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
      src.buffer = brown; src.loop = true; f.type = 'lowpass';
      f.frequency.setValueAtTime(260, t0); f.frequency.exponentialRampToValueAtTime(70, t0 + 4);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.3, t0 + .35); g.gain.exponentialRampToValueAtTime(.11, t0 + 1.2); g.gain.exponentialRampToValueAtTime(.0001, t0 + 4.5);
      src.connect(f); f.connect(g); g.connect(master); src.start(t0, Math.random() * 2); src.stop(t0 + 4.6);
    },
    // One toll of the drowned bell: a low, muffled bell with inharmonic partials and a long, quiet decay.
    toll() {
      const t0 = AC.currentTime + .05, lp = AC.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(master);
      for (const [r, a, d] of [[.5, .5, 9], [1, 1, 7], [1.19, .45, 5], [1.5, .35, 4.5], [2, .3, 3.5], [2.51, .14, 2.6], [2.66, .1, 2.2], [3.01, .08, 2]]) {
        const o = AC.createOscillator(), e = AC.createGain();
        o.frequency.value = 98 * r;
        e.gain.setValueAtTime(.0001, t0); e.gain.exponentialRampToValueAtTime(a * .05, t0 + .03); e.gain.exponentialRampToValueAtTime(.0001, t0 + d);
        o.connect(e); e.connect(lp); o.start(t0); o.stop(t0 + d + .1);
      }
    },
  };
  // Every quarter second the bed may add one of its small sounds; never while the context is paused (they would pile up).
  function tick() {
    if (!live() || AC.state !== 'running' || !cur) return;
    for (const k in cur.ev) if (Math.random() < cur.ev[k] * .25) ONE[k]();
  }
  Object.assign(amb, {
    // Keep the right ambience playing: a new water or condition crossfades; the reef's rain and wind follow the weather.
    set(id, env) {
      wantId = id || ''; wantEnv = env || null;
      if (!live() || !wantId) return;
      const cond = env && env.cond || '';
      if (wantId !== curId || cond !== curCond) {
        fade(cur); cur = build(spec(wantId, cond)); curId = wantId; curCond = cond;
        if (!timer) timer = setInterval(tick, 250);
      }
      if (cur.keys.rain && env && AC.currentTime - lastUpd > .3) {
        lastUpd = AC.currentTime;
        const sq = env.squall || 0, wd = Math.abs(env.wind || 0);
        cur.keys.rain.gain.setTargetAtTime(sq * .07, AC.currentTime, .5);
        cur.keys.wind.gain.setTargetAtTime(.015 + sq * .06 + wd * .02, AC.currentTime, .5);
      }
    },
    hit(name) { if (live() && ONE[name]) ONE[name](); },
    stop() { if (AC) fade(cur); cur = null; curId = curCond = wantId = ''; wantEnv = null; },
    tick,
  });
  // The sound context appears with the first tap: start whatever was asked for before it existed.
  on('audio', () => { if (wantId) amb.set(wantId, wantEnv); });
  // Sound back on: catch up with whatever water the Chief reached while it was off.
  on('mute', () => { if (!S.mute && wantId) amb.set(wantId, wantEnv); });
  // The title screen, the map and the waters announce where the Chief is.
  on('enter', d => {
    if (!d) return;
    // `home` comes from the title and the map; only at the treehouse and the pond does that mean morning birdsong.
    // On the map the sound follows the Chief: at the Chapel's gate the birds are silent.
    if (d.home && d.area === 'pond') amb.set('pond', { cond: 'dawn' });
    else amb.set(d.area || 'tree', { cond: AREA[d.area] ? AREA[d.area].conds[0] : '' });
  });
  on('cond', d => { if (d && d.area) amb.set(d.area, Object.assign({}, wantEnv, { cond: d.cond })); });
}
