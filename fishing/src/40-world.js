// ---------- The world's tables and the rules that join them: waters, fish, goods, trophies ----------
// Nine waters on seven tiers of difficulty. `need` lists the ways in: any ONE of them opens the water.
// `conds` is the round of conditions (light and weather) a visit moves through; `twist` is what makes the water its own.
const AREAS = [
  { id: 'pond', tier: 1, need: null, conds: ['day', 'dusk', 'dawn'], twist: {} },
  { id: 'creek', tier: 2, need: [{ area: 'pond', n: 5 }], conds: ['dawn', 'day', 'dusk'], twist: { current: 1 } },
  { id: 'pier', tier: 3, need: [{ area: 'pond', n: 5 }], conds: ['dusk'], twist: { tide: 1 } },
  { id: 'falls', tier: 3, need: [{ area: 'creek', n: 6 }], conds: ['rain'], twist: { rain: 1 } },
  { id: 'mill', tier: 4, need: [{ area: 'pier', n: 6 }], conds: ['day', 'dusk', 'night'], twist: { snags: 1, murk: 1 } },
  { id: 'ice', tier: 4, need: [{ area: 'falls', n: 6 }, { area: 'mill', n: 6 }], conds: ['day', 'night', 'aurora'], twist: { ice: 1 } },
  { id: 'reef', tier: 5, boat: true, need: [{ fish: 'millstone' }, { area: 'mill', n: 8 }, { area: 'ice', n: 6 }], conds: ['day', 'squall', 'dusk', 'squall'], twist: { swell: 1, gust: 1 } },
  { id: 'deep', tier: 6, boat: true, need: [{ area: 'reef', n: 7 }], conds: ['night'], twist: { dark: 1 } },
  { id: 'chapel', tier: 7, need: [{ fish: 'postman' }], conds: ['fog'], twist: { still: 1, decoys: 1, bell: 1 } },
];
const AREA = {};
for (const a of AREAS) { AREA[a.id] = a; a.fish = []; }
// The Legendary of each water, in the order of AREAS.
const LEGENDS = ['biscuit', 'heron', 'lanternjaw', 'noise', 'millstone', 'aurora', 'wave', 'postman', 'bell'];

// Registries. Each part of the game fills its own table and puts its names into the one text table L:
//   f_<id> fish name, fn_<id> logbook note; i_<id> goods name, id_<id> what it does; t_<id> trophy name, td_<id> how to earn it.
const SPECIES = {}, ITEMS = {}, ACHS = {};
function defFish(area, id, names, notes, p) { SPECIES[id] = Object.assign({ id, area }, p); AREA[area].fish.push(id); L['f_' + id] = names; L['fn_' + id] = notes; }
function defItem(id, names, descs, p) { ITEMS[id] = Object.assign({ id }, p); L['i_' + id] = names; L['id_' + id] = descs; }
function defAch(id, names, descs, p) { ACHS[id] = Object.assign({ id }, p); L['t_' + id] = names; L['td_' + id] = descs; }

// ----- The logbook decides what is open -----
const caught = id => !!(S.log[id] && S.log[id].n);
const logged = area => AREA[area].fish.filter(caught).length;
const allLogged = () => Object.keys(SPECIES).filter(caught).length;
const meets = c => c.fish ? caught(c.fish) : logged(c.area) >= c.n;
const unlocked = id => !AREA[id].need || AREA[id].need.some(meets);
const canReach = id => unlocked(id) && (!AREA[id].boat || owns('boat'));
// What a locked gate asks for, in words: "Log 6 species in Harbor Lights Pier or Catch The Millstone".
const needText = id => (AREA[id].need || []).map(c => c.fish ? t('needFish', { f: t('f_' + c.fish) }) : t('needLog', { n: c.n, a: t('a_' + c.area) })).join(` ${t('orWord')} `);
// What a tier means in numbers. win: the strike window in milliseconds; band: the width of the safe tension band (0..1);
// fakes: how often a faking fish really fakes; wary: how firmly a wrong lure, depth or action turns a fish away
// (0 = it bites anything, 1 = it refuses, and shows that it does).
const TIER = [null,
  { win: 700, band: .5, fakes: 0, wary: 0 }, { win: 580, band: .44, fakes: .3, wary: .2 }, { win: 460, band: .38, fakes: .6, wary: .5 },
  { win: 370, band: .32, fakes: .8, wary: .7 }, { win: 300, band: .27, fakes: 1, wary: .85 }, { win: 240, band: .22, fakes: 1, wary: .95 },
  { win: 180, band: .18, fakes: 1, wary: 1 }];
// Angler rank: Reed, Brook, River, Lake, Sea, Storm, Abyss, Bell. Rank r opens tackle of tier r in the shop,
// and each rank can be reached in the waters gentler than the ones that tackle is meant for.
const RANKS = [0, 4, 9, 18, 28, 40, 52, 64];
const rank = () => { const n = allLogged(); let r = 0; while (r < 7 && n >= RANKS[r + 1]) r++; return r; };

// ----- Purse and tackle box -----
const owns = id => S.own[id] | 0;
function give(id, n = 1) { S.own[id] = owns(id) + n; save(); }
function pay(n) { S.moons += n; S.earned += n; save(); refreshHud(); emit('moons', { n }); }
function spend(n) {
  if (S.moons < n) return false;
  S.moons -= n; save(); refreshHud();
  return true;
}
function bump(stat, n = 1) { S.stat[stat] = (S.stat[stat] | 0) + n; return S.stat[stat]; }
// What is tied on right now. A lure that ran out falls back to the worm, which never runs out.
function rig() {
  for (const [slot, base] of [['rod', 'rod0'], ['line', 'line0'], ['reel', 'reel0'], ['lure', 'worm']]) {
    const it = ITEMS[S.rig[slot]];
    if (!it || it.kind !== slot || !(it.free || owns(it.id))) S.rig[slot] = base;
  }
  return { rod: ITEMS[S.rig.rod], line: ITEMS[S.rig.line], reel: ITEMS[S.rig.reel], lure: ITEMS[S.rig.lure] };
}

// ----- A landed fish: weighed, written into the logbook, paid for, released -----
// o: { clean (line never in the red, no snag), lure, depth, and anything the trophies want to know }. Returns { first, record, moons }.
function logCatch(id, grams, o = {}) {
  const sp = SPECIES[id], e = S.log[id] || (S.log[id] = { n: 0, best: 0 });
  const first = !e.n, record = !first && grams > e.best;
  e.n++; e.seen = 1;
  if (grams > e.best) e.best = Math.round(grams);
  if (o.lure) e.lure = o.lure;
  if (o.depth !== undefined) e.depth = o.depth;
  const span = Math.max(1, sp.w[1] - sp.w[0]);
  let moons = Math.max(1, Math.round(sp.pay * (.6 + .8 * clamp((grams - sp.w[0]) / span, 0, 1)) * (o.clean ? 1 : .8)));
  if (first) moons *= 3; else if (record) moons = Math.round(moons * 1.25);   // a first catch pays triple, a record pays a bonus
  bump('catches');
  pay(moons);
  emit('catch', Object.assign({ id, area: sp.area, grams, first, record, moons }, o));
  return { first, record, moons };
}
