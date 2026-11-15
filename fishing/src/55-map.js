// ---------- The Watchwood: the world map, travelled on foot and by boat ----------
// One hand-drawn world, larger than the screen, with the treehouse at its heart. The land is painted once
// into an offscreen canvas (again only when progress opens something); each frame draws just what moves:
// water, fog, fireflies, birds, the Chief, and the difficulty plaques, which stay the same size at every zoom.
css(`
.map-bar { justify-content: flex-end; }
.map-bar .btn { min-height: 56px; }
.map-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 1px; margin-top: .3em; }
.map-leg { display: inline-flex; align-items: center; justify-content: center; gap: .3em; margin-top: .2em; font-size: max(11px, .85em); }
#mapAll[aria-pressed=true] { background: #f2b93b; border-color: #fff3c4; }
.pill.lan-all { background: #f2b93b; border-color: #fff3c4; color: #2a1c05; }
`);

Object.assign(L, {
  map_fish: ['Fish here', 'Рыбачить здесь', 'Pesca qui'],
  map_in: ['Go in', 'В домик', 'Entra'],
  map_not: ['Not now', 'Не сейчас', 'Non ora'],
  map_all: ['Whole map', 'Вся карта', 'Tutta la mappa'],
  map_me: ['Back to the Chief', 'Назад к командиру', 'Torna dal Capo'],
  map_got: ['{n} of {m} species are in your logbook.', 'В журнале {n} из {m} видов.', 'Specie nel diario: {n} su {m}.'],
  map_done: ['Every species here is in your logbook!', 'Все здешние виды уже в журнале!', 'Tutte le specie di qui sono nel diario!'],
  map_leg: ['Legendary caught', 'Легенда поймана', 'Leggenda catturata'],
  map_shut: ['The way is closed for now.', 'Путь пока закрыт.', 'Per ora la strada è chiusa.'],
  map_boat: ['The Market Perch at the treehouse sells one.', 'Её продают в лавке «Жёрдочка» у домика.', 'La vende la Bottega del Trespolo, alla casa sull\'albero.'],
  map_home: ['Home, Chief! The treehouse is right here.', 'Мы дома, командир! Вот наш домик.', 'Siamo a casa, Capo! Ecco la casa sull\'albero.'],
  map_here: ['You are at {p}.', 'Ты здесь: {p}.', 'Sei qui: {p}.'],
  map_hint: ['Tap a place to walk there.', 'Нажми на место, и пойдём туда.', 'Tocca un posto per andarci.'],
  map_new: ['A new way is open: {a}!', 'Открылся новый путь: {a}!', 'Si è aperta una nuova strada: {a}!'],
  // lanterns: one lights up for every Night of the Night Watch without a lost jar
  lan_pill: ['Lanterns lit', 'Горят фонари', 'Lanterne accese'],
  lan_on: ['This lantern lit up on a Night when no jar was lost!', 'Этот фонарь зажёгся в ночь, когда не пропала ни одна банка!', 'Questa lanterna si è accesa in una Notte senza barattoli persi!'],
  lan_off: ['Keep every jar safe one Night, and a lantern lights up here!', 'Сбереги ночью все банки — и здесь загорится фонарь!', 'Tieni al sicuro tutti i barattoli per una Notte, e qui si accende una lanterna!'],
});

// Boat paints (S.look.boat, the paint goods' `col`): plain wood, red, blue, green, yellow, violet. Shared with the shop and the waters.
const MAP_PAINT = ['#c8813a', '#e8503a', '#58a6ff', '#57c785', '#f2c94c', '#a98be8'];

// ----- The world in world units. Places are where the Chief stands; junctions only bend the ways. -----
const MAP_W = 1500, MAP_H = 1200;
const MAP_NODE = {
  tree: [700, 560], pond: [848, 655], creek: [480, 548], pier: [796, 1040], falls: [245, 302], mill: [1188, 492],
  ice: [762, 205], reef: [1190, 1085], deep: [1400, 1140], chapel: [180, 945],
  jw: [580, 500], jh: [335, 452], jn: [745, 405], je: [1040, 572], js: [722, 790], jsh: [796, 958], land: [888, 1004],
};
const MAP_PLACES = ['tree', ...AREAS.map(a => a.id)];
// Water bodies [x, y, rx, ry]: where a water glows, fogs over when locked, or sparkles.
const MAP_POOL = { pond: [915, 668, 68, 44], creek: [442, 560, 40, 52], pier: [796, 1046, 52, 34], falls: [290, 276, 42, 40], mill: [1290, 470, 100, 65],
  ice: [800, 165, 105, 55], reef: [1205, 1082, 70, 48], deep: [1420, 1150, 140, 70], chapel: [140, 1050, 120, 80] };
const MAP_STREAM = [290, 276, 322, 318, 380, 380, 420, 440, 445, 500, 441, 560, 462, 650, 508, 760, 556, 870, 598, 975, 622, 1090, 632, 1200];
const MAP_SEA = [600, 1200, 616, 1098, 662, 1040, 722, 1000, 800, 978, 900, 990, 1000, 986, 1090, 962, 1160, 926, 1205, 966, 1238, 1046,
  1276, 1000, 1302, 936, 1382, 886, 1500, 862, 1500, 1200];
// Ways: [from, to, kind, opened by (the waters they lead to; 'boat' once the boat is owned; '' always), the bends between].
// A way opens when any water beyond it can be reached, so a far water never depends on a nearer one that is still shut.
const MAP_EDGES = [
  ['tree', 'pond', 'land', '', [772, 622]],
  ['tree', 'jw', 'land', 'creek falls chapel', [640, 532]],
  ['jw', 'creek', 'land', 'creek', [525, 522]],
  ['jw', 'jh', 'bridge', 'falls chapel', [505, 458, 446, 434, 392, 430]],
  ['jh', 'falls', 'land', 'falls', [300, 402, 262, 350]],
  ['jh', 'chapel', 'land', 'chapel', [300, 545, 252, 650, 216, 760, 195, 862]],
  ['tree', 'jn', 'land', 'ice', [765, 525, 790, 452]],
  ['jn', 'ice', 'land', 'ice', [792, 360, 700, 318, 792, 275, 722, 240]],
  ['pond', 'je', 'land', 'mill', [890, 612, 965, 600]],
  ['je', 'mill', 'land', 'mill', [1110, 530]],
  ['tree', 'js', 'land', 'pier reef deep', [688, 650, 738, 722]],
  ['js', 'jsh', 'land', 'pier reef deep', [762, 880]],
  ['jsh', 'pier', 'plank', 'pier', []],
  ['jsh', 'land', 'land', 'boat', [846, 972]],
  ['land', 'reef', 'water', 'reef deep', [985, 1060, 1092, 1096]],
  ['reef', 'deep', 'water', 'deep', [1272, 1116, 1338, 1142]],
].map(([a, b, kind, need, mid]) => {
  const pts = [...MAP_NODE[a], ...mid, ...MAP_NODE[b]];
  let len = 0; for (let i = 2; i < pts.length; i += 2) len += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
  return { a, b, kind, need: need ? need.split(' ') : [], pts, len };
});
const MAP_ADJ = {};
for (const e of MAP_EDGES) for (const n of [e.a, e.b]) (MAP_ADJ[n] || (MAP_ADJ[n] = [])).push(e);
// Which side of its place a plaque prefers: u above, b below, l left, r right.
const MAP_SIDE = { tree: 'blr', pond: 'rbu', creek: 'lub', pier: 'lrb', falls: 'lub', mill: 'urb', ice: 'rlb', reef: 'lub', deep: 'ulb', chapel: 'rul' };
for (const id in MAP_SIDE) MAP_SIDE[id] += 'ubrl';   // then any side that is free
const MAP_CLOUD = [1206, 978, 22, 1236, 966, 28, 1268, 980, 21, 1236, 990, 20];   // the squall over the cape

const mapHash = i => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
const mapState = id => !unlocked(id) ? 'lock' : !canReach(id) ? 'boat' : AREA[id].fish.length && logged(id) >= AREA[id].fish.length ? 'done' : 'open';
const mapOpenEdge = e => !e.need.length || (e.need[0] === 'boat' ? owns('boat') > 0 : e.need.some(canReach));
const mapName = id => t(id === 'tree' ? 'tree' : 'a_' + id);
function mapDistPoly(x, y, p) {
  let best = 1e9;
  for (let i = 0; i < p.length - 2; i += 2) {
    const ax = p[i], ay = p[i + 1], dx = p[i + 2] - ax, dy = p[i + 3] - ay, l = dx * dx + dy * dy;
    const k = l ? clamp(((x - ax) * dx + (y - ay) * dy) / l, 0, 1) : 0;
    best = Math.min(best, Math.hypot(x - ax - dx * k, y - ay - dy * k));
  }
  return best;
}
function mapInPoly(x, y, p) {
  let ins = false;
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}

// ----- Live state of the scene (not saved: only S.at is) -----
const mapCam = { x: 700, y: 560, k: 1, ay: 0, all: false, free: false, kf: 1, ko: .3 };
const mapMe = { x: 700, y: 560, dir: 1, boat: false, idle: 3, step: 0 }, mapBtn = { x: 0, y: 0, w: 0, h: 0 };
let mapRt = null, mapDrag = null, mapLayer = null, mapSmall = null, mapSeen = null, mapNew = [], mapChirp = 3;
const mapSt = {}, mapPlq = {}, mapHits = MAP_PLACES.map(() => ({ id: '', x: 0, y: 0, w: 0, h: 0 }));
const mapDeco = { trees: null };
let mapMeasure = null, mapSpr = null;

// ----- Routes: the shortest open way, leg by leg -----
function mapPath(from, to) {
  const dist = { [from]: 0 }, prev = {}, todo = new Set([from]);
  while (todo.size) {
    let u = null;
    for (const n of todo) if (u === null || dist[n] < dist[u]) u = n;
    todo.delete(u);
    if (u === to) break;
    for (const e of MAP_ADJ[u]) {
      if (!mapOpenEdge(e)) continue;
      const v = e.a === u ? e.b : e.a, nd = dist[u] + e.len;
      if (dist[v] === undefined || nd < dist[v]) { dist[v] = nd; prev[v] = [u, e]; todo.add(v); }
    }
  }
  if (dist[to] === undefined) return null;
  const legs = [];
  for (let v = to; v !== from; v = prev[v][0]) legs.unshift(mapLeg(prev[v][1].a === prev[v][0] ? prev[v][1].pts : mapRev(prev[v][1].pts), prev[v][1].kind === 'water', prev[v][0], v));
  return legs;
}
const mapRev = p => { const r = []; for (let i = p.length - 2; i >= 0; i -= 2) r.push(p[i], p[i + 1]); return r; };
function mapLeg(pts, water, from, to) {
  const cum = [0];
  for (let i = 2; i < pts.length; i += 2) cum.push(cum[cum.length - 1] + Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]));
  return { pts, cum, len: cum[cum.length - 1], water, from, to };
}
const mapSum = legs => legs.reduce((s, l) => s + l.len, 0);
// The part of a leg from distance d to its end (fwd) or back to its start.
function mapPart(leg, d, fwd) {
  let i = 0;
  while (i < leg.cum.length - 2 && leg.cum[i + 1] <= d) i++;
  const p = [mapMe.x, mapMe.y];
  if (fwd) { for (let j = i + 1; j < leg.cum.length; j++) p.push(leg.pts[j * 2], leg.pts[j * 2 + 1]); return mapLeg(p, leg.water, leg.from, leg.to); }
  for (let j = i; j >= 0; j--) p.push(leg.pts[j * 2], leg.pts[j * 2 + 1]);
  return mapLeg(p, leg.water, leg.to, leg.from);
}
// Set off for a place. While walking, a new goal turns the Chief round or carries on, whichever is shorter.
function mapGo(id) {
  let legs, from = S.at;
  if (mapRt) {
    const leg = mapRt.legs[mapRt.li], a = mapPath(leg.to, id), b = mapPath(leg.from, id);
    const la = a ? leg.len - mapRt.d + mapSum(a) : 1e9, lb = b ? mapRt.d + mapSum(b) : 1e9;
    if (!a && !b) return false;
    legs = la <= lb ? [mapPart(leg, mapRt.d, true), ...a] : [mapPart(leg, mapRt.d, false), ...b];
    from = mapRt.from;
  } else {
    if (id === S.at) return false;
    legs = mapPath(S.at, id);
    if (!legs || !legs.length) return false;
  }
  const len = mapSum(legs);
  mapRt = { legs, li: 0, d: 0, from, dest: id, boat: legs.some(l => l.water), speed: Math.max(190, len / 5) };   // no trip lasts much over 5 s
  mapCam.free = false;
  mapBar();
  return true;
}
function mapUpdateTrip(dt) {
  const rt = mapRt;
  rt.d += rt.speed * (rt.legs[rt.li].water ? 1.15 : 1) * (lanFast(rt.legs[rt.li]) ? 1.4 : 1) * dt;
  while (rt.d >= rt.legs[rt.li].len) {
    rt.d -= rt.legs[rt.li].len;
    if (++rt.li >= rt.legs.length) return mapArrive();
  }
  const leg = rt.legs[rt.li];
  let i = 0;
  while (i < leg.cum.length - 2 && leg.cum[i + 1] <= rt.d) i++;
  const k = (rt.d - leg.cum[i]) / Math.max(1e-6, leg.cum[i + 1] - leg.cum[i]), ax = leg.pts[i * 2], ay = leg.pts[i * 2 + 1], bx = leg.pts[i * 2 + 2], by = leg.pts[i * 2 + 3];
  mapMe.x = lerp(ax, bx, k); mapMe.y = lerp(ay, by, k);
  if (Math.abs(bx - ax) > 2) mapMe.dir = bx > ax ? 1 : -1;
  mapMe.boat = leg.water;
  // footsteps on land, paddle strokes on water
  if ((mapMe.step -= dt) <= 0) { if (leg.water) { sfx.paddle(); mapMe.step = .7; } else { sfx.step(); mapMe.step = .34; } }
}
function mapArrive() {
  const rt = mapRt, id = rt.dest;
  mapRt = null;
  [mapMe.x, mapMe.y] = MAP_NODE[id];
  mapMe.boat = !!(AREA[id] && AREA[id].boat);
  S.at = id; save();
  emit('travel', { from: rt.from, to: id, boat: rt.boat });
  mapBar();
  if (id === 'tree') { emit('enter', { area: 'pond', home: true }); toast(t('map_home'), 2200); return; }
  say(t('map_here', { p: mapName(id) }));
  if (id === 'chapel' && !S.gate) return mapGate(rt.from);
  emit('enter', { area: id });
  mapCard(id);
}

// ----- What a place does: cards, the Chapel's gate, the treehouse door -----
function mapFish(id) {
  if (id === 'chapel' && !S.gate) return mapGate(null);
  sfx.pop();
  go('spot', { area: id });
}
function mapAct() {
  if (mapRt) return;
  if (S.at === 'tree') { sfx.pop(); go('hub'); }
  else if (S.at === 'chapel' && !S.gate) mapGate(null);
  else mapCard(S.at);
}
function mapCard(id) {
  const a = AREA[id], n = logged(id), m = a.fish.length, leg = LEGENDS[AREAS.indexOf(a)], won = caught(leg);
  const row = a.fish.map(f => ic(f === leg ? (won ? 'star' : 'star0') : caught(f) ? 'fish' : 'mapFish0', 20)).join('');
  const extra = `<span class="map-row" role="img" aria-label="${n}/${m}">${row}</span>` +
    (won ? `<span class="map-leg">${ic('star', 20)}${esc(t('map_leg'))}: ${esc(t('f_' + leg))}</span>` : '');
  talk(m && n >= m ? t('map_done') : t('map_got', { n, m }), { who: '', html: plaqueHtml(id, extra), acts: [
    { label: t('map_not'), icon: 'backI' },
    { label: t('map_fish'), cls: 'go big', icon: 'fish', fn: () => mapFish(id) }] });
}
// A water that is shut: the owl says what it wants, in plain words.
function mapInfo(id) {
  sfx.empty();
  const boat = unlocked(id);
  talk(boat ? `${t('needBoat')}. ${t('map_boat')}` : `${t('map_shut')} ${needText(id)}.`, { who: 'owl',
    html: plaqueHtml(id, `<span class="map-leg">${ic(boat ? 'boat' : 'lock', 22)}${esc(boat ? t('needBoat') : t('locked'))}</span>`) });
}
// The Drowned Chapel asks first, in the owl's kindest voice. "Turn back" is the default; a no asks again next time.
function mapGate(from) {
  talk(`${t('gate1')} ${t('gate2')} ${t('gate3')}`, { who: 'owl', title: t('a_chapel'), acts: [
    { label: t('gateGo'), icon: 'bell', fn: () => { S.gate = 1; save(); emit('gate', { entered: true }); emit('enter', { area: 'chapel' }); mapCard('chapel'); } },
    { label: t('gateNo'), cls: 'go', icon: 'backI', fn: () => { emit('gate', { entered: false }); if (S.at === 'chapel') mapGo(from && from !== 'chapel' && MAP_NODE[from] ? from : 'tree'); } }] });
}
function mapTap(id) {
  if (!mapRt && id === S.at) return mapAct();
  if (id !== 'tree' && !canReach(id)) return mapInfo(id);
  if (mapGo(id)) sfx.click();
}
// Arrow keys: the neighbouring place that lies most in that direction (near places win over far ones).
function mapNear(from) {
  const out = [], seen = { [from]: 1 }, q = [from];
  while (q.length) {
    const u = q.shift();
    for (const e of MAP_ADJ[u]) {
      const v = e.a === u ? e.b : e.a;
      if (seen[v]) continue;
      seen[v] = 1;
      if (MAP_PLACES.includes(v)) out.push(v); else q.push(v);
    }
  }
  return out;
}
function mapStep(dx, dy) {
  if (mapRt) return;
  const [x0, y0] = MAP_NODE[S.at];
  let best = null, bs = .3;
  for (const id of mapNear(S.at)) {
    const vx = MAP_NODE[id][0] - x0, vy = MAP_NODE[id][1] - y0, l = Math.hypot(vx, vy) || 1, s = (vx * dx + vy * dy) / l - .25 * l / 500;
    if (s > bs) { bs = s; best = id; }
  }
  if (best) mapTap(best); else sfx.empty();
}
function mapToggle() {
  mapCam.all = !mapCam.all; mapCam.free = false;
  const b = $('#mapAll');
  if (b) { b.setAttribute('aria-pressed', mapCam.all); b.setAttribute('aria-label', t(mapCam.all ? 'map_me' : 'map_all')); }
  sfx.click();
}
// The one button at the bottom: go into the treehouse, or fish where the Chief stands.
function mapBar() {
  const b = $('#mapGo');
  if (!b) return;
  b.style.display = mapRt ? 'none' : '';
  const home = S.at === 'tree';
  b.innerHTML = ic(home ? 'home' : 'fish', 26) + esc(t(home ? 'map_in' : 'map_fish'));
  b.setAttribute('aria-label', `${t(home ? 'map_in' : 'map_fish')}: ${mapName(S.at)}`);
  b.classList.toggle('pulse', home);   // the treehouse offers to go in
  paintIcons(b);
  const r = b.getBoundingClientRect();   // plaques keep clear of it
  Object.assign(mapBtn, { x: r.left, y: r.top, w: r.width, h: mapRt ? 0 : r.height });
}

// ----- Camera -----
function mapFit() {
  mapCam.kf = clamp(Math.min(V.w / 520, V.h / 400), .62, 1.5);   // a phone sees the treehouse and its nearest waters at once
  mapCam.ko = Math.min((V.w - 16) / MAP_W, (V.h - 76) / MAP_H);
  const R = clamp(Math.min(window.devicePixelRatio || 1, 2) * mapCam.kf, 1, 1.75);
  if (mapLayer && mapLayer.R !== R) mapLayer = null;
  mapSmall = null;
}
function mapAim(dt) {
  const c = mapCam, all = c.all, k = all ? c.ko : c.kf;
  const tx = all ? MAP_W / 2 : c.free ? c.x : mapMe.x, ty = all ? MAP_H / 2 : c.free ? c.y : mapMe.y - 20, tay = all ? 32 : 10;
  const f = dt < 0 || still() ? 1 : 1 - Math.exp(-dt * 7);
  c.k += (k - c.k) * f; c.x += (tx - c.x) * f; c.y += (ty - c.y) * f; c.ay += (tay - c.ay) * f;
  if (Math.abs(k - c.k) < 1e-3) c.k = k;
  if (!all) {   // keep the view on the map (a little of the dark rim may show)
    const hw = V.w / 2 / c.k, hh = V.h / 2 / c.k;
    c.x = MAP_W + 120 > hw * 2 ? clamp(c.x, hw - 60, MAP_W - hw + 60) : MAP_W / 2;
    c.y = MAP_H + 120 > hh * 2 ? clamp(c.y, hh - 60, MAP_H - hh + 60) : MAP_H / 2;
  }
}
const mapSX = x => (x - mapCam.x) * mapCam.k + V.w / 2, mapSY = y => (y - mapCam.y) * mapCam.k + V.h / 2 + mapCam.ay;
// Where a place is on the screen now (for tests and for anything that points at the map).
const mapScreen = id => [mapSX(MAP_NODE[id][0]), mapSY(MAP_NODE[id][1])];

// ----- Sprites made once: soft glows and fog -----
function mapSprites() {
  if (mapSpr) return mapSpr;
  const make = rgb => {
    const o = document.createElement('canvas'), g = o.getContext('2d');
    o.width = o.height = 64;
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.45, `rgba(${rgb},.45)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return o;
  };
  return (mapSpr = { gold: make('255,205,70'), warm: make('255,233,163'), lamp: make('255,190,90'), fly: make('255,240,150'), mist: make('150,158,178'),
    storm: make('74,82,102'), deep: make('120,200,255') });
}
const mapGlow = (c, s, x, y, r, a) => { c.globalAlpha = a; c.drawImage(s, x - r, y - r, r * 2, r * 2); c.globalAlpha = 1; };
// A small animal hops now and then: its own bounce only runs while the time it is given moves.
const mapHop = (t, o) => still() || (t + o) % 7 > 1.2 ? 0 : t;

// ----- The land: painted once per size (and when progress opens a way) -----
function mapFree(x, y) {
  for (const id in MAP_POOL) {
    if (id === 'creek' || id === 'pier' || id === 'reef' || id === 'deep') continue;
    const [cx, cy, rx, ry] = MAP_POOL[id];
    if (((x - cx) / (rx + 16)) ** 2 + ((y - cy) / (ry + 16)) ** 2 < 1) return false;
  }
  if (mapDistPoly(x, y, MAP_STREAM) < 27) return false;
  for (const e of MAP_EDGES) if (mapDistPoly(x, y, e.pts) < 17) return false;
  for (const n in MAP_NODE) if (Math.hypot(x - MAP_NODE[n][0], y - MAP_NODE[n][1]) < (n === 'tree' ? 100 : 44)) return false;
  return !(x > 680 && x < 920 && y < 230) && !(y < 175 && x > 380);   // the ice valley and the bare peaks
}
// Trees, flowers, grass and waves, scattered the same way every time.
function mapScatter() {
  if (mapDeco.trees) return;
  const trees = [], flowers = [], tufts = [], waves = [], flies = [];
  let i = 0;
  for (let y = 8; y < MAP_H + 10; y += 30) for (let x = 8; x < MAP_W + 10; x += 30) {
    i++;
    const px = x + (mapHash(i) - .5) * 26, py = y + (mapHash(i + 9e3) - .5) * 26, p = mapHash(i + 5e3), home = Math.hypot(px - 700, py - 580);
    if (mapInPoly(px, py, MAP_SEA)) { if (p < .09 && Math.hypot(px - 1420, py - 1150) > 150) waves.push(px, py); continue; }
    if (mapDistPoly(px, py, MAP_SEA) < 12 || !mapFree(px, py)) continue;
    const chapel = Math.hypot(px - 150, py - 1040) < 380 || px < 300 && py > 680;
    const kind = chapel ? 3 : py < 330 && px > 360 ? 2 : (px < 390 && py < 560) || px > 1040 ? 1 : mapDistPoly(px, py, MAP_STREAM) < 80 && py > 420 && py < 900 ? 4 : 0;
    if (home < 290) {   // the sunny meadows: grass, flowers, a few trees
      if (p < .06 && home > 140) trees.push(px, py, 0, home);
      else if (p < .4) tufts.push(px, py);
      else if (p < .62) flowers.push(px, py, mapHash(i + 7e3) * 3 | 0);
    } else if (p < (kind === 3 ? .5 : kind === 2 ? .55 : home < 420 ? .42 : .78)) trees.push(px, py, kind, home);
    else if (home < 420 && p < .9) tufts.push(px, py);
  }
  for (let j = 0; j < 18; j++) { const a = mapHash(j + 40) * TAU, r = 60 + mapHash(j + 80) * 240; flies.push(700 + Math.cos(a) * r, 590 + Math.sin(a) * r * .75); }
  Object.assign(mapDeco, { trees, flowers, tufts, waves, flies });
}
function mapPaint(R) {
  mapScatter();
  const cv = document.createElement('canvas');
  cv.width = Math.round(MAP_W * R); cv.height = Math.round(MAP_H * R);
  const g = cv.getContext('2d');
  g.scale(R, R); g.lineCap = g.lineJoin = 'round';
  const rad = (x, y, r, stops) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); stops.forEach(([k, col]) => gr.addColorStop(k, col)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  const ring = (x, y, rx, ry, fill, edge, w) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); if (edge) { g.lineWidth = w; g.strokeStyle = edge; g.stroke(); } g.fillStyle = fill; g.fill(); };
  // ground: meadow green; warm light around home, golden grass by the pond, highland in the north, grey dead grass at the chapel
  g.fillStyle = '#76b257'; g.fillRect(0, 0, MAP_W, MAP_H);
  rad(700, 590, 380, [[0, 'rgba(255,238,150,.55)'], [.6, 'rgba(220,235,140,.25)'], [1, 'rgba(220,235,140,0)']]);
  rad(915, 668, 150, [[0, 'rgba(255,214,90,.45)'], [1, 'rgba(255,214,90,0)']]);
  const hi = g.createLinearGradient(0, 0, 0, 360); hi.addColorStop(0, '#8e9a86'); hi.addColorStop(.55, 'rgba(110,140,100,.6)'); hi.addColorStop(1, 'rgba(110,140,100,0)');
  g.fillStyle = hi; g.fillRect(0, 0, MAP_W, 360);
  rad(1290, 470, 340, [[0, 'rgba(48,92,58,.55)'], [1, 'rgba(48,92,58,0)']]);
  rad(150, 1050, 470, [[0, 'rgba(46,52,50,.95)'], [.6, 'rgba(52,60,56,.7)'], [1, 'rgba(52,60,56,0)']]);
  for (let j = 0; j < 9; j++) ell(g, 560 + mapHash(j + 300) * 300, 470 + mapHash(j + 310) * 230, 40 + mapHash(j + 320) * 40, 18 + mapHash(j + 330) * 12, 'rgba(160,210,110,.35)');
  // snow around the frozen lake, and the mountains behind it
  ring(800, 175, 175, 105, '#e8f0f6');
  for (const [x, y, w, h] of [[470, 160, 90, 110], [600, 130, 100, 120], [700, 100, 80, 90], [905, 100, 90, 100], [1030, 140, 100, 125], [1160, 115, 95, 115],
    [1290, 160, 110, 135], [1420, 125, 100, 120], [550, 235, 70, 70], [1100, 240, 70, 72], [1235, 265, 80, 80], [1405, 280, 90, 90], [380, 120, 70, 90]]) {
    poly(g, [x - w, y, x, y - h, x + w, y], '#8b909b');
    poly(g, [x, y - h, x + w, y, x + w * .1, y], '#6f7482');
    poly(g, [x - w * .34, y - h * .66, x, y - h, x + w * .34, y - h * .66, x + w * .12, y - h * .58, x - w * .06, y - h * .64], '#f4f8ff');
  }
  // the falls: a rocky cliff, the waterfall and its pool
  poly(g, [130, 222, 170, 178, 240, 166, 300, 172, 352, 186, 372, 222, 336, 238, 262, 232, 196, 240], '#7b7266');
  for (let j = 0; j < 6; j++) line(g, [150 + j * 36, 200 + (j % 2) * 8, 175 + j * 36, 214 + (j % 2) * 6], '#625a50', 3);
  ring(290, 276, 42, 40, '#5aaee0', '#d9cfa0', 6);
  rr(g, 281, 180, 18, 74, 6); g.fillStyle = '#e4f5ff'; g.fill();
  ell(g, 290, 252, 24, 9, 'rgba(255,255,255,.8)');
  // the stream from the falls down to the sea, with grassy banks
  line(g, MAP_STREAM, '#5f9a48', 40); line(g, MAP_STREAM, '#4f9fd6', 26); line(g, MAP_STREAM, 'rgba(160,214,245,.6)', 9);
  // the sea: a sandy beach, the water darkening to the night trench at the rim
  g.beginPath(); for (let j = 0; j < MAP_SEA.length; j += 2) g.lineTo(MAP_SEA[j], MAP_SEA[j + 1]); g.closePath();
  g.lineWidth = 26; g.strokeStyle = '#e6d49a'; g.stroke();
  const sea = g.createLinearGradient(700, 980, 1500, 1200); sea.addColorStop(0, '#4aa0d2'); sea.addColorStop(.5, '#2a64a2'); sea.addColorStop(1, '#0b1a3c');
  g.fillStyle = sea; g.fill();
  ring(1420, 1150, 140, 70, 'rgba(2,6,22,.85)', 'rgba(60,110,170,.35)', 3);
  ring(1425, 1155, 95, 42, 'rgba(0,0,8,.7)');
  // the stormy cape: rocks, surf and a low grey cloud
  ell(g, 1236, 1000, 34, 46, '#8d887b');
  for (const [x, y, r] of [[1150, 1112, 9], [1236, 1104, 11], [1258, 1062, 8], [1172, 1050, 7], [1214, 1126, 6], [1240, 1040, 10]]) {
    circ(g, x, y, r + 3, 'rgba(255,255,255,.55)'); circ(g, x, y, r, '#4f5560'); circ(g, x - r * .3, y - r * .3, r * .4, '#6c7380');
  }
  // the harbour pier with its lantern posts
  rr(g, 785, 966, 22, 88, 3); g.fillStyle = '#9b6a40'; g.fill();
  for (let y = 972; y < 1052; y += 8) line(g, [786, y, 806, y], '#7d5230', 1.5);
  for (const [x, y] of [[781, 995], [811, 995], [781, 1030], [811, 1030]]) { line(g, [x, y + 6, x, y - 8], '#4a3020', 2.5); rr(g, x - 3, y - 13, 6, 7, 1.5); g.fillStyle = '#ffd98a'; g.fill(); }
  rr(g, 732, 940, 34, 24, 3); g.fillStyle = '#a8703f'; g.fill(); poly(g, [728, 942, 749, 926, 770, 942], '#5d7aa8');
  // Sunnybrook Pond: golden rim, lily pads, the dock
  ring(915, 668, 68, 44, '#62b6d9', '#e6cf7a', 8);
  ell(g, 900, 660, 40, 20, 'rgba(255,255,255,.18)');
  for (const [x, y, r] of [[942, 650, 7], [958, 688, 6], [902, 694, 5], [972, 666, 5], [925, 640, 4]]) { g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, .5, TAU - .1); g.closePath(); g.fillStyle = '#4fa04a'; g.fill(); }
  circ(g, 958, 684, 2.4, '#ff9ecb');
  rr(g, 846, 652, 44, 10, 2); g.fillStyle = '#a8703f'; g.fill();
  for (let x = 852; x < 890; x += 7) line(g, [x, 653, x, 661], '#7d5230', 1.2);
  for (let j = 0; j < 8; j++) { const a = 1.9 + j * .2, x = 915 + Math.cos(a) * 72, y = 668 + Math.sin(a) * 47; line(g, [x, y, x + 2, y - 12], '#5a8a3a', 2); }
  // Willow Creek: a willow tunnel over the stream
  for (const [x, y] of [[418, 520], [470, 600], [430, 610], [492, 498]]) {
    circ(g, x, y, 22, '#8cc46a'); for (let j = -3; j <= 3; j++) line(g, [x + j * 6, y, x + j * 7, y + 18], '#79b85a', 3);
  }
  // the Sunken Mill: murky lake, reeds, the drowned mill and its wheel
  ring(1290, 470, 100, 65, '#4a6650', '#3a4f3d', 5);
  rr(g, 1316, 418, 44, 40, 3); g.fillStyle = '#8a8278'; g.fill(); poly(g, [1310, 422, 1338, 398, 1366, 422], '#5b4636');
  rr(g, 1330, 430, 10, 10, 2); g.fillStyle = '#2a2a26'; g.fill();
  g.fillStyle = 'rgba(74,102,80,.82)'; g.fillRect(1306, 444, 64, 18);
  g.beginPath(); g.arc(1306, 452, 17, 0, TAU); g.lineWidth = 3; g.strokeStyle = '#6b4a2e'; g.stroke();
  for (let j = 0; j < 6; j++) { const a = j * Math.PI / 3; line(g, [1306, 452, 1306 + Math.cos(a) * 17, 452 + Math.sin(a) * 17], '#6b4a2e', 2); }
  for (let j = 0; j < 14; j++) { const a = j * TAU / 14, x = 1290 + Math.cos(a) * 103, y = 470 + Math.sin(a) * 68; line(g, [x, y, x - 2, y - 12], '#6b7a3a', 2); }
  // the Frozen Reach: ice, cracks, drilled holes
  ring(800, 165, 105, 55, '#d8eefa', '#a9d3ec', 4);
  line(g, [720, 160, 760, 170, 790, 150, 840, 165, 870, 150], 'rgba(255,255,255,.9)', 2);
  line(g, [790, 150, 805, 128], 'rgba(150,200,230,.8)', 1.5);
  for (const [x, y] of [[782, 194], [832, 150], [862, 182]]) { circ(g, x, y, 7, '#2a5a8a'); circ(g, x, y, 4, '#173a62'); }
  // the Drowned Chapel: black, perfectly still water; a crooked bell tower and its reflection
  ring(140, 1050, 120, 80, '#0b0f17', '#262b34', 4);
  g.save(); g.translate(150, 1056); g.rotate(.07);
  g.globalAlpha = .28; g.scale(1, -.7); rr(g, -13, -70, 26, 70, 2); g.fillStyle = '#3d4048'; g.fill(); poly(g, [-17, -68, 0, -104, 17, -68], '#2c2e35');
  g.restore();
  g.save(); g.translate(150, 1056); g.rotate(.07);
  rr(g, -13, -70, 26, 70, 2); g.fillStyle = '#4a4d55'; g.fill(); g.fillStyle = '#3a3c43'; g.fillRect(2, -70, 11, 70);
  poly(g, [-17, -68, 0, -104, 17, -68], '#2c2e35');
  rr(g, -6, -60, 12, 15, 5); g.fillStyle = '#121318'; g.fill();
  drawIcon(g, 'bell', 0, -51, 9);
  g.restore();
  ell(g, 150, 1058, 22, 4, 'rgba(160,170,190,.25)');
  // trees, from the back to the front: round ones near home, pines in the hills, willows by the stream, dead ones at the rim
  const T = mapDeco.trees;
  for (let j = 0; j < T.length; j += 4) {
    const x = T[j], y = T[j + 1], kind = T[j + 2], far = clamp((T[j + 3] - 250) / 650, 0, 1), r = 13 + mapHash(j) * 6;
    if (kind === 3) {   // dead tree: grey, bare, crooked
      line(g, [x, y + 8, x + 1, y - 16], '#4a4844', 3.5);
      line(g, [x + 1, y - 6, x - 9, y - 15, x - 12, y - 22], '#5a5853', 2); line(g, [x + 1, y - 10, x + 9, y - 19], '#5a5853', 2); line(g, [x, y - 16, x - 3, y - 26], '#5a5853', 1.6);
    } else if (kind === 1 || kind === 2) {   // pine (with snow in the high hills)
      ell(g, x + 4, y + 9, 10, 4, 'rgba(0,0,0,.2)'); line(g, [x, y + 9, x, y + 2], '#4a3020', 3);
      const col = kind === 2 ? '#3d6b52' : far > .5 ? '#24493a' : '#2f5e45';
      poly(g, [x - 12, y + 3, x, y - 18, x + 12, y + 3], col); poly(g, [x - 9, y - 6, x, y - 26, x + 9, y - 6], col);
      if (kind === 2) poly(g, [x - 5, y - 15, x, y - 26, x + 5, y - 15], '#f4f8ff');
    } else if (kind === 4) {   // willow
      circ(g, x, y - 6, r * .9, '#7fbc5e');
      for (let s = -2; s <= 2; s++) line(g, [x + s * 5, y - 6, x + s * 6, y + 9], '#6aa84c', 2.5);
    } else {   // round leafy tree, darker the further from home
      const a = ['#55a043', '#4a8f3c', '#70b552'], b = ['#2f6a3a', '#295c34', '#3b7a43'];
      ell(g, x + r * .3, y + r * .55, r, r * .42, 'rgba(0,0,0,.2)');
      line(g, [x, y + r * .4, x, y + r * .85], '#5a3a22', r * .26);
      for (let s = 0; s < 3; s++) circ(g, x + [0, -.38, .3][s] * r, y + [0, .15, -.3][s] * r, r * [1, .62, .5][s], far > .45 ? b[s] : a[s]);
    }
  }
  const F = mapDeco.flowers;
  for (let j = 0; j < F.length; j += 3) circ(g, F[j], F[j + 1], 2.2, ['#ffd24a', '#ff9ecb', '#ffffff'][F[j + 2]]);
  // the treehouse at the heart of it all
  ell(g, 706, 558, 52, 12, 'rgba(0,0,0,.2)');
  poly(g, [682, 558, 718, 558, 709, 470, 691, 470], '#6b4426'); line(g, [690, 556, 676, 562], '#6b4426', 5); line(g, [710, 556, 726, 562], '#6b4426', 5);
  circ(g, 700, 448, 60, '#2f7d47'); circ(g, 655, 470, 40, '#2a6e3f'); circ(g, 745, 466, 42, '#36894f'); circ(g, 700, 415, 42, '#3f9a5a'); circ(g, 728, 430, 22, '#4aa864');
  rr(g, 660, 472, 80, 8, 3); g.fillStyle = '#8a5a34'; g.fill();
  rr(g, 676, 436, 48, 38, 4); g.fillStyle = '#a8703f'; g.fill();
  for (let y = 444; y < 472; y += 7) line(g, [678, y, 722, y], '#8f5c30', 1.2);
  poly(g, [668, 440, 700, 408, 732, 440], '#c2503c'); line(g, [668, 440, 700, 408, 732, 440], '#e06a54', 3);
  rr(g, 684, 446, 13, 12, 2); g.fillStyle = '#ffd86b'; g.fill(); rr(g, 704, 448, 12, 24, 4); g.fillStyle = '#6b462a'; g.fill();
  line(g, [700, 408, 700, 392], '#5a3a22', 2); poly(g, [700, 392, 714, 397, 700, 402], '#ffd24a');
  line(g, [724, 480, 724, 554], '#d9b77a', 2); line(g, [732, 480, 732, 554], '#d9b77a', 2);
  for (let y = 488; y < 552; y += 10) line(g, [724, y, 732, y], '#d9b77a', 2);
  // the ways: open ones are trodden sand (or a dashed sea route), shut ones a faint overgrown trace
  for (const e of MAP_EDGES) {
    const open = mapOpenEdge(e);
    if (e.kind === 'plank') continue;
    if (e.kind === 'water') {
      g.setLineDash(open ? [10, 9] : [2, 11]); line(g, e.pts, open ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.22)', open ? 3 : 2.5); g.setLineDash([]);
    } else if (open) { line(g, e.pts, '#b8945c', 11); line(g, e.pts, '#ecd6a0', 6.5); }
    else { g.setLineDash([2, 10]); line(g, e.pts, 'rgba(250,240,210,.4)', 4); g.setLineDash([]); }
    if (e.kind === 'bridge') {   // the footbridge over the stream, or the two stumps where it will be
      g.save(); g.translate(418, 432); g.rotate(-.08);
      if (open) {
        rr(g, -26, -8, 52, 16, 3); g.fillStyle = '#9b6a40'; g.fill();
        for (let x = -22; x < 26; x += 7) line(g, [x, -7, x, 7], '#7d5230', 1.5);
        line(g, [-26, -9, 26, -9], '#5a3a22', 2.5); line(g, [-26, 9, 26, 9], '#5a3a22', 2.5);
      } else for (const x of [-24, 24]) { circ(g, x, -6, 3.5, '#5a3a22'); circ(g, x, 6, 3.5, '#5a3a22'); }
      g.restore();
    }
  }
  if (owns('boat')) {   // the boat's landing
    rr(g, 879, 980, 16, 34, 2); g.fillStyle = '#9b6a40'; g.fill();
    for (let y = 985; y < 1012; y += 6) line(g, [880, y, 894, y], '#7d5230', 1.2);
    circ(g, 897, 1012, 3, '#4a3020');
  }
  // light near home, darkness and strangeness at the edges
  rad(700, 580, 1050, [[0, 'rgba(6,10,30,0)'], [.32, 'rgba(6,10,30,0)'], [.75, 'rgba(6,10,30,.42)'], [1, 'rgba(6,10,30,.62)']]);
  rad(140, 1060, 460, [[0, 'rgba(4,4,10,.62)'], [.55, 'rgba(10,8,22,.4)'], [1, 'rgba(10,8,22,0)']]);
  rad(1440, 1160, 320, [[0, 'rgba(0,3,14,.55)'], [1, 'rgba(0,3,14,0)']]);
  // gates on shut waters, a mark on the reef while the boat is missing, a gold star by each finished water
  for (const a of AREAS) {
    const st = mapSt[a.id], [x, y] = MAP_NODE[a.id], [px, py, prx, pry] = MAP_POOL[a.id];
    if (st === 'lock') {
      if (a.id !== 'creek' && a.id !== 'pier' && a.id !== 'reef' && a.id !== 'deep') ring(px, py, prx, pry, 'rgba(26,30,46,.5)');
      mapGatePaint(g, x, y, !!a.boat);
    } else if (st === 'boat') {
      g.setLineDash([4, 4]); g.beginPath(); g.arc(x, y, 16, 0, TAU); g.lineWidth = 2.5; g.strokeStyle = 'rgba(255,233,163,.9)'; g.stroke(); g.setLineDash([]);
      drawIcon(g, 'boat', x, y, 20);
    } else if (st === 'done') drawIcon(g, 'star', px + prx * .75, py - pry * .9, 18);
  }
  return { R, cv };
}
// A shut gate: two posts, rails, a sagging chain and a padlock. On the sea: a line of buoys on a chain.
function mapGatePaint(g, x, y, sea) {
  if (sea) {
    line(g, [x - 30, y - 4, x - 15, y + 2, x, y + 4, x + 15, y + 2, x + 30, y - 4], '#c9ced8', 2);
    for (let j = -2; j <= 2; j++) { circ(g, x + j * 15, y - 2 + Math.abs(j) * -1, 5, j % 2 ? '#fff' : '#e0553f'); }
  } else {
    for (const sx of [-17, 17]) line(g, [x + sx, y + 6, x + sx, y - 24], '#4a2e1a', 4.5);
    line(g, [x - 17, y - 17, x + 17, y - 17], '#8a5a34', 4); line(g, [x - 17, y - 6, x + 17, y - 6], '#8a5a34', 4);
    line(g, [x - 15, y - 6, x + 15, y - 17], '#7a4c2c', 3);
    g.beginPath(); g.moveTo(x - 17, y - 14); g.quadraticCurveTo(x, y - 2, x + 17, y - 14); g.setLineDash([3, 2]); g.lineWidth = 2.5; g.strokeStyle = '#c9ced8'; g.stroke(); g.setLineDash([]);
  }
  drawIcon(g, 'lock', x, y - 7, 15);
}
// A copy of the land at whole-map size, shrunk in halves so it stays smooth.
function mapSmallLayer() {
  const d = Math.min(window.devicePixelRatio || 1, 2), w = Math.ceil(MAP_W * mapCam.ko * d), h = Math.ceil(MAP_H * mapCam.ko * d);
  if (mapSmall && mapSmall.width === w && mapSmall.height === h) return mapSmall;
  let src = mapLayer.cv;
  while (src.width / 2 > w) {
    const o = document.createElement('canvas');
    o.width = Math.ceil(src.width / 2); o.height = Math.ceil(src.height / 2);
    o.getContext('2d').drawImage(src, 0, 0, o.width, o.height);
    src = o;
  }
  const o = document.createElement('canvas');
  o.width = w; o.height = h;
  o.getContext('2d').drawImage(src, 0, 0, w, h);
  return (mapSmall = o);
}

// ----- Plaques: carved wood near home, then stone, iron and bone; the same size at every zoom -----
const MAP_MAT = { wood: ['#8a5a34', '#6f4527', '#fff6da'], stone: ['#7d8595', '#646b7a', '#fff6da'], iron: ['#3b414e', '#8a94a8', '#eef2ff'], bone: ['#e4ddca', '#6a6355', '#2a2520'] };
const mapFont = (w, px) => `${w} ${px}px ui-rounded, "SF Pro Rounded", "Segoe UI", Roboto, "Noto Sans", sans-serif`;
function mapWrap(c, s, maxW, max) {
  const out = [];
  let cur = '';
  for (const w of s.split(' ')) { const n = cur ? cur + ' ' + w : w; if (!cur || c.measureText(n).width <= maxW) cur = n; else { out.push(cur); cur = w; } }
  out.push(cur);
  if (out.length > max) { out.length = max; out[max - 1] += '…'; }
  return out;
}
function mapInk(c, s, x, y, ink, outline) {
  if (outline) { c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineJoin = 'round'; c.strokeText(s, x, y); }
  c.fillStyle = ink; c.fillText(s, x, y);
}
// Returns { cv, w, h, m }: the plate is w x h CSS px, drawn with a margin m around it for the glow and the chain.
function mapPlaque(id, mini) {
  const tree = id === 'tree', st = tree ? 'tree' : mapSt[id], key = `${id}|${st}|${mini}|${lang}|${tree ? '' : mapSt[id + 'N']}`;
  if (mapPlq[key]) return mapPlq[key];
  const mc = mapMeasure || (mapMeasure = document.createElement('canvas').getContext('2d'));
  const tier = tree ? 0 : AREA[id].tier, mat = tree ? 'wood' : PLAQUE[tier - 1], [base, dark, ink] = MAP_MAT[mat], outline = mat !== 'bone';
  const fN = mapFont(900, mini ? 11 : 13), fS = mapFont(800, 11), lh = mini ? 12 : 15, ms = mini ? 8 : 12, pad = mini ? 4 : 7, M = 7;
  const icon = st === 'lock' ? 'lock' : st === 'boat' ? 'boat' : st === 'done' ? 'star' : '';
  mc.font = fN;
  const name = mapWrap(mc, mapName(id), mini ? 92 : 150, mini ? 3 : 2);
  let w = 0;
  for (const s of name) w = Math.max(w, mc.measureText(s).width);
  let h = name.length * lh;
  const moonW = tree ? 0 : 7 * (ms + 1) + (mini && icon ? ms + 5 : 0);
  if (!tree) { w = Math.max(w, moonW); h += ms + 4; }
  let info = [];
  if (!tree && !mini) {
    mc.font = fS;
    info = st === 'lock' ? mapWrap(mc, needText(id), 150, 5) : st === 'boat' ? mapWrap(mc, t('needBoat'), 150, 2) : [`${logged(id)} / ${AREA[id].fish.length}`];
    info.forEach((s, i) => { w = Math.max(w, mc.measureText(s).width + (i ? 0 : 17)); });
    h += info.length * 13 + 3;
  }
  const W = Math.ceil(w + pad * 2), H = Math.ceil(h + pad * 2), d = Math.min(window.devicePixelRatio || 1, 2), cv = document.createElement('canvas');
  cv.width = (W + M * 2) * d; cv.height = (H + M * 2) * d;
  const c = cv.getContext('2d');
  c.scale(d, d); c.translate(M, M);
  // the plate (a finished water's plate glows gold)
  if (st === 'done') { c.shadowColor = '#ffd24a'; c.shadowBlur = 9; }
  rr(c, 0, 0, W, H, mini ? 5 : 8); c.fillStyle = base; c.fill(); c.shadowBlur = 0;
  c.save(); c.clip();
  if (mat === 'wood') for (let y = 3; y < H; y += 5) { c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * .3, y + 2, W * .6, y - 2, W, y + 1); c.lineWidth = 1; c.strokeStyle = 'rgba(70,40,20,.35)'; c.stroke(); }
  if (mat === 'stone') for (let j = 0; j < W * H / 60; j++) circ(c, mapHash(j + tier) * W, mapHash(j + 50 + tier) * H, .5 + mapHash(j + 99) * 1.2, j % 2 ? 'rgba(255,255,255,.18)' : 'rgba(40,44,56,.3)');
  if (mat === 'bone') { line(c, [W * .2, 0, W * .26, H * .3, W * .22, H * .5], 'rgba(90,80,60,.35)', 1); line(c, [W * .8, H, W * .74, H * .6], 'rgba(90,80,60,.35)', 1); }
  if (st === 'lock') { c.fillStyle = 'rgba(12,14,26,.4)'; c.fillRect(0, 0, W, H); }
  c.restore();
  rr(c, 1, 1, W - 2, H - 2, mini ? 5 : 7);
  c.lineWidth = st === 'done' ? 3 : 2;
  c.strokeStyle = st === 'done' ? '#ffd24a' : st === 'lock' ? '#1c1f28' : mat === 'bone' ? dark : 'rgba(255,233,163,.85)';
  if (mat === 'bone' || st === 'boat') c.setLineDash([5, 3]);
  c.stroke(); c.setLineDash([]);
  if (mat === 'iron') for (const [x, y] of [[4, 4], [W - 4, 4], [4, H - 4], [W - 4, H - 4]]) circ(c, x, y, 1.6, dark);
  if (st === 'lock') for (let x = 5, j = 0; x < W - 3; x += 6, j++) { c.beginPath(); c.ellipse(x, 0, j % 2 ? 3.2 : 1.6, j % 2 ? 1.8 : 3, 0, 0, TAU); c.lineWidth = 1.3; c.strokeStyle = '#aab1bf'; c.stroke(); }
  // name, the row of moons, then what it wants or how far the logbook is
  c.textAlign = 'center'; c.textBaseline = 'middle';
  let y = pad + lh / 2;
  c.font = fN;
  for (const s of name) { mapInk(c, s, W / 2, y, ink, outline); y += lh; }
  if (!tree) {
    let x = W / 2 - moonW / 2;
    if (mini && icon) { drawIcon(c, icon, x + ms / 2 + 1, y + ms / 2 + 1, ms + 3); x += ms + 5; }
    if (mat === 'bone') { rr(c, x - 2, y - 1, 7 * (ms + 1) + 3, ms + 4, 4); c.fillStyle = '#4a4336'; c.fill(); }   // pale moons need a dark inlay on bone
    for (let i = 0; i < 7; i++) drawIcon(c, i < tier ? 'moon' : 'moon0', x + i * (ms + 1) + ms / 2, y + ms / 2 + 1, ms);
    y += ms + 4;
  }
  c.font = fS;
  info.forEach((s, i) => {
    const tw = mc.measureText(s).width, x = W / 2 + (i ? 0 : 8.5);
    if (!i) drawIcon(c, icon || 'fish', x - tw / 2 - 9, y + 6, 13);
    mapInk(c, s, x, y + 6.5, st === 'done' ? (mat === 'bone' ? '#7a5200' : '#ffe08a') : ink, outline);
    y += 13;
  });
  return (mapPlq[key] = { cv, w: W, h: H, m: M });
}
// Place each plaque beside its place where it covers no other plaque, no place (or what a tap there would hit),
// and not the button at the bottom. A plaque whose place is on the screen slides fully onto it, so it can always be read.
// When every side is taken, the side that hides the least wins: the button and the places matter more than another plaque.
const mapRects = new Float64Array(MAP_PLACES.length * 4), mapPts = new Float64Array(MAP_PLACES.length * 2);
function mapCost(x, y, w, h, n) {
  let cost = 0;
  for (let j = 0; j < n; j++) if (x < mapRects[j * 4] + mapRects[j * 4 + 2] + 4 && x + w + 4 > mapRects[j * 4] && y < mapRects[j * 4 + 1] + mapRects[j * 4 + 3] + 4 && y + h + 4 > mapRects[j * 4 + 1]) cost += 1;
  const rx = mapCam.all ? 7 : 18 * mapCam.k, ry = mapCam.all ? 12 : 48 * mapCam.k;
  for (let p = 0; p < MAP_PLACES.length; p++) { const px = mapPts[p * 2], py = mapPts[p * 2 + 1]; if (x < px + rx && x + w > px - rx && y < py + 4 && y + h > py - ry) cost += 2; }
  const B = mapBtn;
  return cost + (B.h > 0 && x < B.x + B.w && x + w > B.x && y < B.y + B.h && y + h > B.y ? 4 : 0);
}
function mapPlaques(c) {
  const mini = mapCam.all, k = mapCam.k;
  for (let p = 0; p < MAP_PLACES.length; p++) { mapPts[p * 2] = mapSX(MAP_NODE[MAP_PLACES[p]][0]); mapPts[p * 2 + 1] = mapSY(MAP_NODE[MAP_PLACES[p]][1]); }
  let n = 0;
  for (let p = 0; p < MAP_PLACES.length; p++) {
    const id = MAP_PLACES[p], P = mapPlaque(id, mini), sx = mapPts[p * 2], sy = mapPts[p * 2 + 1], on = sx > 0 && sx < V.w && sy > 0 && sy < V.h;
    const up = mini ? 14 : Math.max(30, 50 * k), side = mini ? 9 : 18 * k + 6, gap = mini ? 7 : 12, order = MAP_SIDE[id];
    let bx = 0, by = 0, best = 1e9;
    for (let s = 0; s < order.length && best > 0; s++) {
      const o = order[s];
      let x = o === 'u' || o === 'b' ? sx - P.w / 2 : o === 'r' ? sx + side : sx - side - P.w;
      let y = o === 'u' ? sy - up - P.h : o === 'b' ? sy + gap : sy - P.h / 2 - (mini ? 0 : 14 * k);
      if (on) { x = clamp(x, 4, Math.max(4, V.w - P.w - 4)); y = clamp(y, 62, Math.max(62, V.h - P.h - 4)); }
      const cost = mapCost(x, y, P.w, P.h, n);
      if (cost < best) { bx = x; by = y; best = cost; }
    }
    const ok = best === 0;
    if (mini && !ok && id === 'tree') { mapHits[p].id = ''; continue; }   // on a crowded whole map the treehouse speaks for itself
    mapRects[n * 4] = bx; mapRects[n * 4 + 1] = by; mapRects[n * 4 + 2] = P.w; mapRects[n * 4 + 3] = P.h; n++;
    const hp = mapHits[p]; hp.id = id; hp.x = bx; hp.y = by; hp.w = P.w; hp.h = P.h;
    if (bx > V.w || by > V.h || bx + P.w < 0 || by + P.h < 0) continue;
    // a little signpost from the place to its plaque
    c.beginPath(); c.moveTo(sx, sy - (mini ? 2 : 8)); c.lineTo(clamp(sx, bx + 6, bx + P.w - 6), clamp(sy, by + 4, by + P.h - 4));
    c.lineWidth = mini ? 1.5 : 2.5; c.strokeStyle = 'rgba(40,24,12,.7)'; c.stroke();
    c.drawImage(P.cv, bx - P.m, by - P.m, P.w + P.m * 2, P.h + P.m * 2);
  }
}

// ----- What moves: water, light, fog, small lives near home; drawn in world units each frame -----
function mapLife(c, t) {
  const S2 = mapSprites(), calmly = still(), T = calmly ? 0 : t;
  c.save(); c.beginPath(); c.rect(0, 0, MAP_W, MAP_H); c.clip();   // nothing spills over the rim of the map
  // warm light on open waters, a slow gold glow on finished ones
  for (const a of AREAS) {
    const st = mapSt[a.id], [x, y, rx] = MAP_POOL[a.id];
    if (st === 'done') mapGlow(c, S2.gold, x, y, rx * 1.7, calmly ? .55 : .48 + .14 * Math.sin(t * 1.8));
    else if (st === 'open' || st === 'boat') mapGlow(c, S2.warm, x, y, rx * 1.5, .3);
  }
  c.lineCap = 'round';
  // the pond glitters; the stream runs; small waves on the sea
  c.strokeStyle = '#fffbe8'; c.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) {
    const a = calmly ? .5 : Math.max(0, Math.sin(t * 1.3 + i * 1.7)), x = 885 + mapHash(i + 1) * 60, y = 650 + mapHash(i + 2) * 34;
    if (a < .05) continue;
    c.globalAlpha = a; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x + 4, y); c.stroke();
  }
  c.globalAlpha = .65; c.strokeStyle = '#d6f0ff'; c.lineWidth = 2;
  const L0 = MAP_STREAM.length / 2 - 1;
  for (let i = 0; i < 26; i++) {
    const u = ((i / 26 + T * .018) % 1) * L0, s = u | 0, k = u - s, j = s * 2;
    const x = lerp(MAP_STREAM[j], MAP_STREAM[j + 2], k), y = lerp(MAP_STREAM[j + 1], MAP_STREAM[j + 3], k), dx = MAP_STREAM[j + 2] - MAP_STREAM[j], dy = MAP_STREAM[j + 3] - MAP_STREAM[j + 1], l = Math.hypot(dx, dy);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + dx / l * 6, y + dy / l * 6); c.stroke();
  }
  c.strokeStyle = '#e8f6ff'; c.lineWidth = 1.6;
  const W2 = mapDeco.waves;
  for (let i = 0; i < W2.length; i += 2) {
    const x = W2[i] + (calmly ? 0 : Math.sin(t * .6 + i) * 3), y = W2[i + 1], dark = clamp((x + y - 1900) / 700, 0, 1);
    c.globalAlpha = (calmly ? .5 : .35 + .3 * Math.sin(t * 1.1 + i)) * (1 - dark * .7);
    c.beginPath(); c.moveTo(x - 7, y); c.quadraticCurveTo(x - 3.5, y - 3, x, y); c.quadraticCurveTo(x + 3.5, y - 3, x + 7, y); c.stroke();
  }
  c.globalAlpha = 1;
  // the falls: white water and gentle rain
  c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2;
  for (let i = 0; i < 5; i++) { const y = 184 + (T * 70 + i * 15) % 64; c.beginPath(); c.moveTo(284 + i * 3, y); c.lineTo(284 + i * 3, y + 8); c.stroke(); }
  c.strokeStyle = 'rgba(200,225,255,.45)'; c.lineWidth = 1;
  for (let i = 0; i < 14; i++) { const x = 225 + mapHash(i + 400) * 130, y = 220 + (mapHash(i + 410) * 110 + T * 90) % 110; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 9); c.stroke(); }
  // squall over the cape
  c.strokeStyle = 'rgba(190,205,230,.5)';
  for (let i = 0; i < 16; i++) { const x = 1182 + mapHash(i + 500) * 110, y = 990 + (mapHash(i + 510) * 80 + T * 120) % 80; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 11); c.stroke(); }
  for (let i = 0; i < MAP_CLOUD.length; i += 3) mapGlow(c, S2.storm, MAP_CLOUD[i] + (calmly ? 0 : Math.sin(t * .3) * 4), MAP_CLOUD[i + 1], MAP_CLOUD[i + 2] * 1.6, .8);
  // lanterns on the pier, the treehouse window
  const pierLit = mapSt.pier !== 'lock';
  for (let i = 0; i < 4; i++) mapGlow(c, S2.lamp, i % 2 ? 811 : 781, i < 2 ? 986 : 1021, 16, pierLit ? (calmly ? .7 : .62 + .1 * Math.sin(t * 3 + i * 2)) : .15);
  mapGlow(c, S2.warm, 690, 452, 24, .55);
  // the night trench: slow lights far down
  for (let i = 0; i < 7; i++) mapGlow(c, S2.deep, 1340 + mapHash(i + 600) * 160, 1115 + mapHash(i + 610) * 70, 7 + mapHash(i + 620) * 6, calmly ? .4 : .25 + .2 * Math.sin(t * .5 + i * 1.3));
  // the aurora over the frozen lake
  c.lineWidth = 9;
  for (let j = 0; j < 2; j++) {
    c.strokeStyle = j ? 'rgba(150,140,255,.16)' : 'rgba(120,255,200,.2)'; c.beginPath();
    for (let x = 650; x <= 960; x += 15) c.lineTo(x, 62 + j * 16 + Math.sin(x * .02 + T * .4 + j * 2) * 9);
    c.stroke();
  }
  // standing fog: heavy on shut waters, always over the chapel
  for (const a of AREAS) {
    if (mapSt[a.id] !== 'lock' || a.id === 'chapel') continue;
    const [x, y, rx, ry] = MAP_POOL[a.id];
    for (let i = 0; i < 3; i++) mapGlow(c, S2.mist, x + (i - 1) * rx * .55 + (calmly ? 0 : Math.sin(t * .25 + i * 2) * 8), y + (i % 2 ? ry * .3 : -ry * .2), Math.max(rx, ry) * .9, .6);
  }
  // the chapel's fog never lifts; while the water is shut it hides the tower too
  const shut = mapSt.chapel === 'lock';
  for (let i = 0; i < 18; i++) {
    const x = 40 + mapHash(i + 700) * 330, y = 860 + mapHash(i + 710) * 330;
    if (!shut && Math.hypot(x - 150, y - 1030) < 75) continue;
    mapGlow(c, S2.mist, x + (calmly ? 0 : Math.sin(t * .07 + i) * 18), y, 60 + mapHash(i + 720) * 50, shut ? .5 : .34);
  }
  mapGlow(c, S2.deep, 151, 1001, 9, shut ? .2 : .45);   // a pale glimmer in the drowned bell's window
  // near home: grass in the wind, fireflies, small animals, birds
  c.strokeStyle = '#4f8a36'; c.lineWidth = 1.3; c.beginPath();
  const G = mapDeco.tufts;
  for (let i = 0; i < G.length; i += 2) {
    const x = G[i], y = G[i + 1], sw = calmly ? 0 : Math.sin(t * 1.7 + x * .04) * 2.2;
    for (let b = -1; b <= 1; b++) { c.moveTo(x + b * 2.5, y); c.lineTo(x + b * 3.5 + sw, y - 7 + Math.abs(b)); }
  }
  c.stroke();
  const Fl = mapDeco.flies;
  for (let i = 0; i < Fl.length; i += 2) {
    const x = Fl[i] + (calmly ? 0 : Math.sin(t * .5 + i) * 14), y = Fl[i + 1] + (calmly ? 0 : Math.cos(t * .7 + i * 2) * 10), a = calmly ? .7 : .35 + .4 * Math.sin(t * 2.3 + i);
    mapGlow(c, S2.fly, x, y, 9, a * .8); circ(c, x, y, 1.4, '#fffbe0');
  }
  critter(c, 612, 652, .17, mapHop(t, 0), 1); critter(c, 640, 590, .14, mapHop(t, 2.3), 0); critter(c, 985, 726, .15, mapHop(t, 4.6), 2);
  c.strokeStyle = '#2a2a36'; c.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const a = T * .22 + i * 2.1, r = 150 + i * 45, x = 720 + Math.cos(a) * r, y = 500 + Math.sin(a) * r * .55, f = calmly ? 2 : Math.sin(t * 9 + i) * 3;
    c.beginPath(); c.moveTo(x - 6, y - f); c.quadraticCurveTo(x - 3, y - 3, x, y); c.quadraticCurveTo(x + 3, y - 3, x + 6, y - f); c.stroke();
  }
  // the boat waits at its landing while the Chief is ashore
  if (owns('boat') && !mapMe.boat) mapBoat(c, 906, 1022, .5, t, -1, false, false);
  c.restore();
}
// The little boat, painted with S.look.boat. With `me` the Chief sits in it and paddles.
function mapBoat(c, x, y, s, t, dir, me, moving) {
  const bob = still() ? 0 : Math.sin(t * 2.4) * 1.5, col = MAP_PAINT[S.look.boat] || MAP_PAINT[0];
  c.save(); c.translate(x, y + bob * s); c.scale(s * dir, s);
  c.globalAlpha = .35; ell(c, 0, 3, 36, 6, '#e8f6ff'); c.globalAlpha = 1;
  if (moving && !still()) { line(c, [-34, 2, -50, 0], 'rgba(255,255,255,.6)', 2); line(c, [-34, 6, -46, 9], 'rgba(255,255,255,.45)', 2); }
  if (me) {
    const [hx, hy] = chief(c, -2, -2, 1, t, { dir: 1, pose: 'sit' }), a = moving && !still() ? Math.sin(t * 6) * .7 : .25;
    const ex = hx + Math.sin(a) * 12, ey = hy + 24;
    line(c, [hx, hy, ex, ey], '#7a4e22', 2.6); ell(c, ex, ey + 3, 3, 6, '#9b6a40', a);
  }
  poly(c, [-30, -10, 26, -10, 34, -17, 22, 4, -22, 4, -32, -6], col);
  line(c, [-30, -10, 26, -10, 34, -17], 'rgba(0,0,0,.35)', 2);
  line(c, [-26, -4, 24, -4], 'rgba(255,255,255,.55)', 2);
  c.restore();
}
function mapDrawMe(c, t) {
  const k = mapCam.k, x = mapSX(mapMe.x), y = mapSY(mapMe.y), s = clamp(k * .95, .42, 1.1), moving = !!mapRt;
  if (mapCam.all) {   // on the whole map a ring shows where the Chief is
    c.beginPath(); c.arc(x, y - 10 * s, 16 + (still() ? 0 : Math.sin(t * 3) * 2), 0, TAU); c.lineWidth = 3; c.strokeStyle = '#ffd24a'; c.stroke();
  }
  if (mapMe.boat) return mapBoat(c, x, y, s, t, mapMe.dir, true, moving);
  ell(c, x, y, 12 * s, 3.6 * s, 'rgba(0,0,0,.28)');
  chief(c, x, y, s, t, { dir: mapMe.dir, pose: moving ? 'walk' : 'stand' });
}

// ----- Lanterns on the ways: every Night of The Night Watch without a lost jar lights one (that game's save, `lit`) -----
// 24 posts stand beside the ways: the way to the pond first, then outward ring by ring, so the light spreads to every water.
// A post stands 12 units to one side of its way, at a share of its length ([from, to, share, side]: side 1 is on the right
// going from `from` to `to`). Each post lights its own stretch: the part of its way that is nearer to it than to any other
// post of that way. The Chief walks (or paddles) a lit stretch 1.4 times as fast.
const LAN = [['tree', 'pond', .75, 1], ['tree', 'js', .45, -1], ['tree', 'jw', .7, -1], ['tree', 'jn', .8, 1], ['jw', 'creek', .5, 1],
  ['tree', 'js', .8, 1], ['jw', 'jh', .25, 1], ['pond', 'je', .4, -1], ['jn', 'ice', .15, 1], ['js', 'jsh', .35, 1], ['pond', 'je', .8, -1],
  ['jw', 'jh', .85, 1], ['js', 'jsh', .8, -1], ['jn', 'ice', .45, 1], ['je', 'mill', .45, 1], ['jh', 'falls', .45, 1], ['jsh', 'land', .5, -1],
  ['jn', 'ice', .68, 1], ['jh', 'chapel', .2, 1], ['land', 'reef', .3, 1], ['jh', 'chapel', .5, 1], ['land', 'reef', .65, 1],
  ['jh', 'chapel', .8, 1], ['reef', 'deep', .7, 1]].map(([a, b, f, side], i) => {
  const e = MAP_EDGES.find(q => q.a === a && q.b === b), g = mapLeg(e.pts), d = f * g.len, p = e.pts;
  let j = 0;
  while (j < g.cum.length - 2 && g.cum[j + 1] <= d) j++;
  const dx = p[j * 2 + 2] - p[j * 2], dy = p[j * 2 + 3] - p[j * 2 + 1], l = Math.hypot(dx, dy), k = (d - g.cum[j]) / l;
  return { i, e, x: p[j * 2] + dx * k - dy / l * side * 12, y: p[j * 2 + 1] + dy * k + dx / l * side * 12 };
});
const LAN_WAY = {};   // 'from|to' -> the posts of that way, either way round
for (const q of LAN) for (const k of [q.e.a + '|' + q.e.b, q.e.b + '|' + q.e.a]) (LAN_WAY[k] || (LAN_WAY[k] = [])).push(q);
let lanOn = 0, lanMsg = null;   // how many posts are lit (read each time the map opens); the last toast a post showed
const lanLit = q => q.i < lanOn;
// The stretch under the Chief is lit when the nearest post of the way being walked is lit.
function lanFast(leg) {
  let best = null, bd = 1e9;
  for (const q of LAN_WAY[leg.from + '|' + leg.to] || []) { const d = Math.hypot(q.x - mapMe.x, q.y - mapMe.y); if (d < bd) { bd = d; best = q; } }
  return !!best && lanLit(best);
}
// A post: pole, roof and lantern. Lit: a flame, short rays and a soft glow; unlit: an empty grey lantern with a crossbar.
// With every post lit each one sparkles now and then (a still star with reduced motion). Larger on the whole map, so it shows.
// The posts are drawn in every frame of the map, so nothing here makes an array: the rays' directions are a table.
const LAN_RAY = new Float64Array([-2.3, -.84, -3, -.14, 2.6, .54].flatMap(a => [Math.cos(a), Math.sin(a)]));
function lanDraw(c, t) {
  const S2 = mapSprites(), calmly = still(), s = Math.max(1, .5 / mapCam.k), all = lanOn >= LAN.length;
  c.lineCap = c.lineJoin = 'round';
  for (const q of LAN) {
    const x = q.x, y = q.y, ly = y - 25 * s, on = lanLit(q);
    if (on) mapGlow(c, S2.lamp, x, ly, 36 * s, calmly ? .62 : .56 + .08 * Math.sin(t * 2 + q.i));
    ell(c, x, y, 7 * s, 2.4 * s, q.e.kind === 'water' ? 'rgba(232,246,255,.6)' : 'rgba(0,0,0,.25)');   // a shadow, or a ring of water round a post in the sea
    c.beginPath(); c.moveTo(x, y); c.lineTo(x, ly + 6 * s); c.lineWidth = 2.8 * s; c.strokeStyle = '#4a3020'; c.stroke();
    rr(c, x - 5 * s, ly - 6 * s, 10 * s, 12 * s, 2 * s); c.fillStyle = on ? '#ffe9a3' : '#6b717d'; c.fill();
    c.lineWidth = 1.6 * s; c.strokeStyle = on ? '#7a4e22' : '#2f333c'; c.stroke();
    c.beginPath(); c.moveTo(x - 7.5 * s, ly - 5 * s); c.lineTo(x, ly - 12 * s); c.lineTo(x + 7.5 * s, ly - 5 * s); c.closePath(); c.fillStyle = on ? '#7a4e22' : '#3d424c'; c.fill();
    if (!on) { c.beginPath(); c.moveTo(x - 5 * s, ly); c.lineTo(x + 5 * s, ly); c.lineWidth = 1.2 * s; c.strokeStyle = '#2f333c'; c.stroke(); continue; }
    ell(c, x, ly + 1.5 * s, 2.6 * s, 4 * s, '#ff9a3a'); ell(c, x, ly + 2.5 * s, 1.2 * s, 2 * s, '#fff3c4');
    c.beginPath();
    for (let r = 0; r < 12; r += 2) { const cx = LAN_RAY[r], cy = LAN_RAY[r + 1]; c.moveTo(x + cx * 11 * s, ly + cy * 11 * s); c.lineTo(x + cx * 16 * s, ly + cy * 16 * s); }
    c.lineWidth = 1.8 * s; c.strokeStyle = '#ffe9a3'; c.stroke();
    if (!all) continue;
    const k = (t * .25 + mapHash(q.i + 900)) % 1, a = calmly ? 1 : k < .16 ? Math.sin(k / .16 * Math.PI) : 0;
    if (a > .02) { c.globalAlpha = a; starPath(c, x + 11 * s, ly - 13 * s, 5.5 * s, 1.6 * s, 4); c.fillStyle = '#fffbe8'; c.fill(); c.globalAlpha = 1; }
  }
}
// A tap on a post that is nearer than `beat` (the nearest place's distance): what lit it, or what would. True when it took
// the tap. A new word replaces the last one.
function lanTap(x, y, beat) {
  const s = Math.max(1, .5 / mapCam.k);
  let best = null, bd = Math.min(beat, Math.max(26, 16 * s * mapCam.k));
  for (const q of LAN) { const d = Math.hypot(mapSX(q.x) - x, mapSY(q.y - 20 * s) - y); if (d < bd) { bd = d; best = q; } }
  if (!best) return false;
  const on = lanLit(best);
  if (on) sfx.sparkle(); else sfx.click();
  if (lanMsg) lanMsg.remove();
  toast(t(on ? 'lan_on' : 'lan_off'), 3000);
  lanMsg = ui.lastElementChild;
  return true;
}

// ----- The scene -----
scenes.map = {
  enter() {
    if (!MAP_NODE[S.at] || S.at !== 'tree' && !(has(AREA, S.at) && canReach(S.at))) S.at = 'tree';
    mapRt = null; mapDrag = null; mapCam.free = false;
    [mapMe.x, mapMe.y] = MAP_NODE[S.at];
    mapMe.boat = !!(AREA[S.at] && AREA[S.at].boat);
    // what changed since the last visit: new ways get a sparkle and a word
    let sig = '';
    for (const a of AREAS) { mapSt[a.id] = mapState(a.id); mapSt[a.id + 'N'] = logged(a.id); sig += mapSt[a.id][0]; }
    sig += owns('boat') > 0;
    mapNew = mapSeen ? AREAS.filter(a => (mapSeen[a.id] === 'lock' || mapSeen[a.id] === 'boat') && (mapSt[a.id] === 'open' || mapSt[a.id] === 'done')).map(a => a.id) : [];
    mapSeen = Object.assign({}, mapSt);
    if (mapLayer && mapLayer.sig !== sig) { mapLayer = null; mapSmall = null; }
    this.sig = sig;
    mapFit();
    mapAim(-1);
    lanOn = Math.min(LAN.length, clamp(nwSave.lit | 0, 0, 999));
    const lanAll = lanOn >= LAN.length;
    hud(() => go('home'), `<button class="btn round" id="mapAll" aria-pressed="${mapCam.all}" aria-label="${esc(t(mapCam.all ? 'map_me' : 'map_all'))}">${ic('mapI', 30)}</button>` +
      `<span class="pill${lanAll ? ' lan-all' : ''}" id="lanPill" role="img" aria-label="${esc(t('lan_pill'))}: ${lanOn}/${LAN.length}">${ic(lanAll ? 'lanAll' : 'lamp', 22)}<b>${lanOn}/${LAN.length}</b></span>`, { home: true });
    $('#mapAll').onclick = mapToggle;
    add(`<div class="bar map-bar"><button class="btn go" id="mapGo"></button></div>`);
    $('#mapGo').onclick = () => { if (S.at === 'tree') { sfx.pop(); go('hub'); } else mapFish(S.at); };
    mapBar();
    // the ambience follows the Chief (`home: true`: being on the map is not a visit; the Chapel waits for its answer)
    if (S.at !== 'chapel' || S.gate) emit('enter', { area: S.at === 'tree' ? 'pond' : S.at, home: true });
    say(t('map_here', { p: mapName(S.at) }));
    if (mapNew.length) { toast(t('map_new', { a: mapName(mapNew[0]) }), 2600); sfx.sparkle(); }
    else if (!S.tut.map) { S.tut.map = 1; save(); toast(t('map_hint'), 3200); }
  },
  update(dt) {
    if (mapRt) mapUpdateTrip(dt);
    else if ((mapMe.idle -= dt) <= 0) { mapMe.idle = 2.5 + rnd(4); if (!mapMe.boat) mapMe.dir = -mapMe.dir; }   // the Chief looks around
    mapAim(dt);
    // birdsong: now and then near home, thinning out with distance, silent near the chapel
    if ((mapChirp -= dt) <= 0) {
      mapChirp = 3 + rnd(5);
      const home = Math.hypot(mapMe.x - 700, mapMe.y - 560), chapel = Math.hypot(mapMe.x - 150, mapMe.y - 1040);
      if (chapel > 420 && rnd() < clamp(1 - home / 650, 0, 1)) sfx.chirp();
    }
    if (mapNew.length) {   // sparkles over a water that just opened
      const [x, y] = mapScreen(mapNew[0]);
      if (x > 0 && x < V.w && y > 0 && y < V.h) burst(x, y, 24, { kind: 'star', colors: ['#ffd86b', '#fff6da'], speed: 140 });
      mapNew.shift();
    }
  },
  draw() {
    const c = ctx, k = mapCam.k, ox = V.w / 2 - mapCam.x * k, oy = V.h / 2 + mapCam.ay - mapCam.y * k;
    if (!mapLayer) { mapLayer = mapPaint(clamp(Math.min(window.devicePixelRatio || 1, 2) * mapCam.kf, 1, 1.75)); mapLayer.sig = this.sig; }
    c.fillStyle = '#060b1f'; c.fillRect(0, 0, V.w, V.h);
    if (mapCam.all && k === mapCam.ko) c.drawImage(mapSmallLayer(), ox, oy, MAP_W * k, MAP_H * k);
    else {   // only the visible part of the big layer
      const R = mapLayer.R, x0 = clamp(-ox / k, 0, MAP_W), y0 = clamp(-oy / k, 0, MAP_H), x1 = clamp((V.w - ox) / k, 0, MAP_W), y1 = clamp((V.h - oy) / k, 0, MAP_H);
      if (x1 > x0 && y1 > y0) c.drawImage(mapLayer.cv, x0 * R, y0 * R, (x1 - x0) * R, (y1 - y0) * R, ox + x0 * k, oy + y0 * k, (x1 - x0) * k, (y1 - y0) * k);
    }
    c.save(); c.translate(ox, oy); c.scale(k, k);
    mapLife(c, V.t);
    lanDraw(c, V.t);
    c.restore();
    mapPlaques(c);
    mapDrawMe(c, V.t);
  },
  down(x, y) { mapDrag = { x, y, x0: x, y0: y, moved: false }; },
  move(x, y) {
    if (!mapDrag || !hold.on) return;
    if (!mapDrag.moved && Math.hypot(x - mapDrag.x0, y - mapDrag.y0) > 10) mapDrag.moved = true;
    if (mapDrag.moved) { mapCam.x -= (x - mapDrag.x) / mapCam.k; mapCam.y -= (y - mapDrag.y) / mapCam.k; mapCam.free = true; }
    mapDrag.x = x; mapDrag.y = y;
  },
  up(x, y, cancelled) {
    const d = mapDrag;
    mapDrag = null;
    if (!d || d.moved || cancelled) return;
    // a plaque, or what is nearest under the finger: a place within reach, or a lantern post nearer still
    let id = '';
    for (let i = mapHits.length - 1; i >= 0 && !id; i--) { const h = mapHits[i]; if (h.id && x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) id = h.id; }
    if (!id) {
      let best = mapCam.all ? 30 : 46;
      for (const p of MAP_PLACES) { const [sx, sy] = mapScreen(p), dd = Math.hypot(sx - x, sy - 12 - y); if (dd < best) { best = dd; id = p; } }
      if (lanTap(x, y, id ? best : 1e9)) return;
    }
    if (id) mapTap(id);
  },
  key(e) {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const dir = { ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0], ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1] }[k];
    if (dir) { if (e.preventDefault) e.preventDefault(); mapStep(dir[0], dir[1]); }
    else if (k === 'Enter' && !(e.target && e.target.tagName === 'BUTTON')) mapAct();   // a focused button handles its own Enter
    else if (k === 'm') mapToggle();
  },
  resize() { mapFit(); mapBar(); },
};

// Icons for the map: the folded map (whole map / back to the Chief) and a fish not yet in the logbook.
ICON.mapI = c => {
  poly(c, [-.9, -.6, -.3, -.8, -.3, .75, -.9, .95], '#fff3dc'); poly(c, [-.3, -.8, .3, -.6, .3, .95, -.3, .75], '#e8d3a8'); poly(c, [.3, -.6, .9, -.8, .9, .75, .3, .95], '#fff3dc');
  c.setLineDash([.12, .12]); line(c, [-.7, .55, -.35, .1, .1, .3, .55, -.3], '#e0553f', .1); c.setLineDash([]);
  circ(c, .55, -.32, .14, '#e0553f');
};
ICON.mapFish0 = c => {
  c.beginPath(); c.moveTo(.4, 0); c.lineTo(.95, -.5); c.lineTo(.95, .5); c.closePath(); c.ellipse(-.15, 0, .75, .5, 0, 0, TAU);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); c.setLineDash([.16, .12]); c.lineWidth = .1; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke(); c.setLineDash([]);
};
// The lantern pill once every post is lit: the lamp with a star.
ICON.lanAll = c => { ICON.lamp(c); starPath(c, .6, -.62, .42, .16, 4); c.fillStyle = '#fff'; c.fill(); c.lineWidth = .07; c.strokeStyle = '#b07a00'; c.stroke(); };
