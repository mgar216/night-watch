// ---------- Test driver: appended inside the game's scope only for test builds ----------
// Modes, chosen by location.hash:
//   #smoke     data checks, the unlock graph, travel on the map, the shop and the trophies, a whole visit with rod and line,
//              one landed fish in every water, and a balance table (three scripted anglers against every species)
//   #audit     layout audit of every screen in three languages
//   #shot,<scene>,<lang 0-2>,<seconds to simulate>,<area id>,<pose>[+<pose>...]
//              poses a screen for a screenshot (see test/shots.sh). Save poses (PRE) run before the scene starts, screen poses after.
// smoke and audit POST progress lines and one final report to the server in test/smoke.js.
const POSES = {}, PRE = {};
const sim = (sec, each) => { for (let i = 0; i < sec * 30; i++) { V.t += 1 / 30; if (scene.update) scene.update(1 / 30); if (i % 6 === 0 || sim.draw) { scene.draw(1 / 30); drawFx(1 / 30); drawPortrait(); } if (each && each() === false) break; } };
const clickDlg = (i = -1) => { const b = [...document.querySelectorAll('.veil .acts .btn')]; if (!b.length) return false; b[i < 0 ? b.length - 1 : i].click(); return true; };
const SP = scenes.spot;
const until = (fn, sec = 20) => { sim(sec, () => !fn()); return fn(); };
// test/cycle.js (the day cycle across both games, with real page changes) lands a fish and reads the lent lures through this
window.flfTest = { land: id => emit('catch', { id: id || 'bluegill' }), lures: () => Object.keys(ITEMS).filter(id => id.startsWith('nwl_')) };

// ----- Saves -----
const LESSONS = { map: 1, shop: 1, b1: 1, b2: 1, b3: 1, b4: 1, b5: 1 };
const fresh = (o = {}) => Object.assign(S, { name: 'Mia', look: { col: 0, hat: '', boat: 0 }, moons: 0, earned: 0, log: {}, own: { rod0: 1, line0: 1, reel0: 1 },
  rig: { rod: 'rod0', line: 'line0', reel: 'reel0', lure: 'worm' }, ach: {}, stat: {}, at: 'tree', gate: 0, tut: Object.assign({}, LESSONS) }, o);
const logArea = (id, n) => AREA[id].fish.filter(f => !SPECIES[f].legend).slice(0, n).forEach((f, i) => { S.log[f] = { n: 1 + i % 3, best: Math.round(SPECIES[f].w[0] * 1.3), seen: 1, id: i % 2, lure: 'worm', depth: SPECIES[f].depth }; });
const logLeg = id => { S.log[id] = { n: 1, best: SPECIES[id].w[1], seen: 1, id: 1 }; };
Object.assign(PRE, {
  fresh() { fresh(); },
  // the pond finished, creek, pier and mill open, the reef open but no boat, the rest shut
  mid() { fresh({ moons: 640 }); logArea('pond', 99); logLeg('biscuit'); logArea('creek', 4); logArea('pier', 6); logArea('mill', 3); logLeg('millstone'); give('cricket', 8); give('spinner', 4); give('rodp1'); give('lines1'); S.ach.firstLight = S.ach.firstCast = S.ach.lilyCast = S.ach.firstBuy = 1; },
  // every water open, the Chapel's gate not answered yet
  open() { fresh({ moons: 3000 }); AREAS.forEach(a => logArea(a.id, 8)); logLeg('biscuit'); logLeg('postman'); give('boat'); give('glowworm', 5); give('lampspin', 3); },
  // everything caught, everything owned
  all() { fresh({ moons: 99999, earned: 99999, gate: 1 }); AREAS.forEach((a, i) => { logArea(a.id, 99); logLeg(LEGENDS[i]); }); for (const id in ITEMS) give(id, ITEMS[id].kind === 'lure' ? 9 : 1); for (const id in ACHS) S.ach[id] = 1; },
  paint() { S.look.boat = 2; S.look.col = 3; S.look.hat = 'wizard'; },
  still() { Object.defineProperty(calm, 'matches', { value: true }); },
  learn() { S.tut = {}; },
  // the Night Watch's save: how many Nights went by without a lost jar (one lantern each)
  lit0() { nwSave = { ...nwSave, lit: 0 }; },
  lit9() { nwSave = { ...nwSave, lit: 9 }; },
  lit24() { nwSave = { ...nwSave, lit: 24 }; },
  // all six silly gadgets stand on the Night Watch's tree: their six lures are in the tackle box
  nwlures() { nwSave.items = ['peel', 'tramp', 'tickle', 'bubbler', 'cannon', 'disco'].map((g, m) => ({ t: g, m })); nwlSync(); },
});
// Lures from the Night Watch: exactly one per silly gadget on its tree, nothing from a damaged save, free and never for sale,
// and gone with the gadget (the worm is tied on again).
const nwlChecks = check => {
  const got = () => Object.values(ITEMS).filter(it => it.nw).map(it => it.nw).sort().join(), all = ['peel', 'tramp', 'tickle', 'bubbler', 'cannon', 'disco'], bought = [];
  on('buy', d => bought.push(d.id));
  nwSave.items = [{ t: 'peel', m: 0 }, { t: 'disco', m: 4 }]; nwlSync(); check(got() === 'disco,peel', 'the peel and the disco ball give exactly their two lures: ' + got());
  for (const g of ['x', [null, { t: 'zzz' }], null, 7]) { nwSave.items = g; nwlSync(); check(got() === '', 'no gadget lures from ' + JSON.stringify(g) + ': ' + got()); }
  nwSave.items = [{ t: 'peel', m: 0 }]; nwlSync(); S.rig.lure = 'nwl_peel'; check(rig().lure.id === 'nwl_peel', 'a gadget lure can be tied on');
  nwSave.items = []; nwlSync(); check(rig().lure.id === 'worm' && S.rig.lure === 'worm', 'without its gadget the lure goes and the worm is tied on again');
  nwSave.items = all.map((g, m) => ({ t: g, m })); nwlSync(); check(got() === [...all].sort().join(), 'six gadgets give six lures: ' + got());
  shopTab = 'lure'; if (scene === scenes.shop) scenes.shop.render(); else go('shop'); const m0 = S.moons; for (const g of all) scenes.shop.buy('nwl_' + g);
  check(all.every(g => ITEMS['nwl_' + g].free && !owns('nwl_' + g) && !$(`[data-buy="nwl_${g}"]`) && !!$(`[data-use="nwl_${g}"]`)) && S.moons === m0 && !bought.length, 'gadget lures are free, have no price button and cannot be bought');
  // lent lures do not fill the trophy of ten lures of one's own; each one names the shop lure it copies (the logbook falls back on it)
  const own0 = S.own; S.own = { rod0: 1, line0: 1, reel0: 1, dough: 1, cricket: 1, corn: 1 };
  check(!ACHS.lureLibrary.ok() && NWL.every(it => has(ITEMS, it.like) && !ITEMS[it.like].nw), 'lures lent by the Night do not fill the Lure Library, and each knows the shop lure it copies');
  S.own = own0;
  nwSave.items = []; nwlSync(); for (const g of all) scenes.shop.buy('nwl_' + g); check(S.moons === m0 && !bought.length && all.every(g => !owns('nwl_' + g)), 'nor once their gadget is gone');
};

// ----- Screen poses -----
const tapAt = (x, y) => { hold.on = true; scene.down(x, y); hold.on = false; scene.up(x, y); };
const tapPlace = id => { const [x, y] = mapScreen(id); tapAt(x, y - 12); };
const arrive = (id, sec = 12) => sim(sec, () => !(S.at === id && !mapRt));
// A place for the lure that is open water: the middle ice hole, or the first spot clear of every snag.
const castSpot = area => { const f = WATER[area].feats, hole = f.filter(q => q.kind === 'hole')[1]; if (hole) return (hole.p0 + hole.p1) / 2; for (let p = .3; p < .8; p += .02) if (!f.some(q => q.kind === 'snag' && p > q.p0 - .04 && p < q.p1 + .04)) return p; return .5; };
// A cast into open water and a bite from the wanted species. A fish that refuses the lure (a thick line shows in hard water) is offered it again.
const toBite = id => {
  SP.castTo(castSpot(SP.A.id)); until(() => SP.st === 'wait', 3);
  for (let i = 0; i < 8 && SP.st === 'wait'; i++) { SP.forceBite(id || SP.A.fish[0]); until(() => SP.st === 'bite' || !SP.bite, 15); }
  return SP.st === 'bite';
};
Object.assign(POSES, {
  // map
  whole() { mapToggle(); sim(1.5); },
  card() { mapAct(); },
  gate() { S.at = 'falls'; go('map'); sim(.3); tapPlace('chapel'); arrive('chapel'); },
  byday() { day = true; go(scene.name, scene.arg); if (scene.name === 'map') toast(t('day_start'), 60000); },   // the screen as it is on a day between two Nights
  locked() { tapPlace('creek'); },
  lantap() { const q = LAN[0]; tapAt(mapSX(q.x), mapSY(q.y - 20)); },    // the first post's word
  lancheck() { const out = []; let n = 0; lanChecks((ok, msg) => { n++; if (!ok || msg.includes('frames')) out.push((ok ? 'ok   ' : 'FAIL ') + msg); }); document.body.insertAdjacentHTML('beforeend', `<pre style="position:fixed;inset:0;z-index:99;margin:0;background:#fff;color:#000;font:12px monospace;white-space:pre-wrap">lantern checks: ${n}, failed: ${out.filter(s => s[0] === 'F').length}\n${out.join('\n')}</pre>`); },
  // the tackle box scrolled to the gadget lures
  nwlbox() { SP.box(true); $('[data-id="nwl_peel"]').scrollIntoView({ block: 'start' }); },
  // fishing
  shadow() { SP.card(SP.pop.findIndex(f => !f.decoy)); },
  known() { const f = SP.pop.find(q => !q.decoy); S.log[f.id] = { n: 1, best: 200, seen: 1 }; SP.card(SP.pop.indexOf(f)); },
  lesson() { SP.teach(1); },
  box() { give('spinner', 3); give('cricket', 8); give('rodp1'); give('linef1'); give('reel1'); SP.box(true); },
  power() { SP.mark = .6; SP.charge(); sim(.75); },
  wait() { SP.castTo(.55); sim(2); },
  bite() { toBite(); },
  fight() { toBite(); SP.strike(); hold.on = true; hold.dir = -1; sim(1.2); },
  jump() { toBite(); SP.strike(); SP.F.queue = { kind: 'jump', dir: 0, pow: .4, dur: 1.4 }; SP.F.runT = 0; hold.on = false; sim(.6); },
  net() { toBite(); SP.strike(); const F = SP.F; F.tired = true; F.Lm = 2.5; F.runT = 0; sim(.4); },
  caught() { toBite(SP.A.fish[SP.A.fish.length - 1]); SP.strike(); const F = SP.F; F.tired = true; F.lastUsed = 1; F.Lm = 2.5; F.runT = 0; sim(.3); F.netT = .625; SP.netTry(); },   // lastUsed: a Legendary may keep one more run for the net
  lost() { toBite(); SP.strike(); if (SP.F) SP.lose('slack'); sim(.3); },
  weak() { SP.T = Object.assign({}, SP.T, { wary: 0 }); toBite(SP.A.fish.find(f => SPECIES[f].pull >= 9 && !SPECIES[f].legend)); SP.strike(); hold.on = false; sim(1.2); },   // a strong fish on the line that is tied on: the red line comes down
  toll() { SP.toll(2); sim(1); },
  squall() { SP.ci = SP.A.conds.indexOf('squall'); SP.cond = SP.env.cond = 'squall'; SP.condT = SP.condLen * .62; SP.chips(); sim(1.5); },   // the reef near the peak of a squall
  // treehouse
  buy() { shopTab = 'lure'; scenes.shop.render(); },
  gear() { shopTab = 'gear'; scenes.shop.render(); },
  badge() { scenes.trophies.open('softHands'); },
  secret() { scenes.trophies.open('magpieFriend'); },
  page() { go('book', { back: () => go('hub'), area: 'pond', sp: 'biscuit' }); },
  blank() { go('book', { back: () => go('hub'), area: 'chapel', sp: 'bell' }); },
});
// Lanterns on the map: as many posts lit as Nights without a lost jar (at most 24; garbage counts as none), a lit stretch walked
// faster, a tap on a post that tells and a tap on a place that still walks, every post beside its way, inside the map and clear
// of the places, and every water with a post nearest to it.
const lanChecks = check => {
  const lanAt = v => { nwSave = { ...nwSave, lit: v }; fresh(); go('map'); return LAN.filter(lanLit).length; };
  for (const [v, n] of [[0, 0], [9, 9], [24, 24], [999, 24], ['x', 0], [-5, 0], [undefined, 0]]) { const got = lanAt(v); check(got === n && $('#lanPill b').textContent === n + '/24', `lit ${v}: ${n} posts lit, got ${got}`); }
  const walk = v => { lanAt(v); mapGo('pond'); let f = 0; while (mapRt && f < 900) { scene.update(1 / 30); f++; } return S.at === 'pond' ? f : 1e9; };
  const slow = walk(0), fast = walk(1);
  check(fast < slow && slow / fast > 1.25 && slow / fast < 1.55, `the way to the pond lit takes ${fast} frames, unlit ${slow}`);
  const told = k => [...document.querySelectorAll('.toast')].filter(n => n.textContent === t(k)).length, q0 = LAN[0];
  for (const [v, k] of [[1, 'lan_on'], [0, 'lan_off']]) { lanAt(v); tapAt(mapSX(q0.x), mapSY(q0.y - 20)); tapAt(mapSX(q0.x), mapSY(q0.y - 20)); check(!mapRt && told(k) === 1 && !$('.veil'), `a tap on the first post says ${k} once, and nobody walks`); }
  tapPlace('pond'); check(!!mapRt, 'a tap on the pond beside the first post still walks there');
  const near = q => MAP_PLACES.reduce((b, n) => Math.hypot(q.x - MAP_NODE[n][0], q.y - MAP_NODE[n][1]) < Math.hypot(q.x - MAP_NODE[b][0], q.y - MAP_NODE[b][1]) ? n : b);
  for (const q of LAN) check(mapDistPoly(q.x, q.y, q.e.pts) <= 13 && q.x > 20 && q.x < MAP_W - 20 && q.y > 50 && q.y < MAP_H - 10, `post ${q.i} stands beside its way, inside the map`);
  for (const q of LAN) check(MAP_PLACES.every(n => Math.hypot(q.x - MAP_NODE[n][0], q.y - MAP_NODE[n][1]) > 44), `post ${q.i} keeps clear of the places (their marks and the Chief)`);
  check(AREAS.every(a => LAN.some(q => near(q) === a.id)), 'every water has a post nearest to it');
  nwSave = { ...nwSave, lit: 0 };
  // The last tap left the Chief walking to the pond. The game's own frames go on while the suite waits for the server, so
  // on a busy machine the walk would arrive and open the pond's dialog in the middle of later checks: stop it here.
  mapRt = null; if (closeDlg) closeDlg();
};

(async () => {
  const mode = location.hash.slice(1).split(','), run = +new URLSearchParams(location.search).get('run') || 0;
  const out = { run, errors: [] }, seen = new Set();
  const bad = s => { if (!seen.has(s)) { seen.add(s); out.errors.push(s); } };
  let where = 'start';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const post = o => fetch('/', { method: 'POST', body: JSON.stringify(Object.assign({ run }, o)) });
  const note = s => post({ progress: s });
  const check = (ok, msg) => { if (!ok) bad('ASSERT ' + msg); };

  if (mode[0] === 'shot') {
    // a script error is written onto the page, so that it shows in the screenshot
    window.onerror = (m, src, l, c, e) => { document.body.insertAdjacentHTML('beforeend', `<pre style="position:fixed;left:0;top:0;right:0;z-index:99;margin:0;background:#fff;color:#c00;font:12px monospace;white-space:pre-wrap">${m} @${l}:${c}\n${e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n') : ''}</pre>`); };
    // a screenshot shows the final state of dialogs and toasts, not the first frame of their pop-in
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '*, *::before { animation: none !important; transition: none !important; }' }));
    sim.draw = true;
    setLang(+mode[2] || 0);
    const poses = (mode[5] || '').split('+');
    fresh();
    for (const p of poses) if (PRE[p]) PRE[p]();
    go(mode[1] || 'home', mode[4] ? { area: mode[4] } : undefined);
    sim(+mode[3] || 2);
    for (const p of poses) if (POSES[p]) { POSES[p](); sim(.1); }
    return;
  }
  window.onerror = (m, s, l, c, e) => { bad(`SCRIPT ERROR at [${where}]: ${m} @${l}:${c} ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' < ') : ''}`); };
  window.addEventListener('unhandledrejection', e => bad('rejection: ' + (e.reason && e.reason.stack || e.reason)));
  const tOrig = t;
  t = (k, v) => { if (!L[k]) bad('missing text key ' + k); return tOrig(k, v); };
  const ev = {};
  for (const e of ['travel', 'enter', 'gate', 'cast', 'bite', 'strike', 'snap', 'escape', 'catch', 'leave', 'jump', 'cond', 'buy', 'identify', 'snag']) on(e, d => (ev[e] = ev[e] || []).push(d));
  const got = (e, f) => (ev[e] || []).some(f || (() => true));

  // The best tackle an angler of rank r can buy, and the lure of the shop that suits a species best.
  const best = (kind, r, score) => Object.values(ITEMS).filter(it => it.kind === kind && it.tier <= r && !it.craft).sort((a, b) => score(b) - score(a))[0];
  // the line is chosen for strength first: from the pier on, a fish stronger than the line lowers the red line
  const kit = r => ({ rod: best('rod', r, it => it.pow + it.fin).id, line: best('line', r, it => it.str * 3 + it.thin).id, reel: best('reel', r, it => it.drag).id });
  const lureFor = (id, r) => { const s = SPECIES[id]; return best('lure', r, it => (it.depth === s.depth) + (it.act === s.act) + (it.food === s.food) * 1.5 + (it.free ? .1 : 0)).id; };
  // starter: true = the first rod, line and reel with the worm; 'rig' = the same three with the lure that suits the fish
  const equip = (id, r, starter) => { const k = starter ? { rod: 'rod0', line: 'line0', reel: 'reel0' } : kit(r), lure = starter === true ? 'worm' : lureFor(id, r); for (const x of [k.rod, k.line, k.reel]) S.own[x] = 1; S.own[lure] = 99; S.rig = Object.assign({ lure }, k); };
  // Four scripted anglers. adult: feathers the hold on the band, gives slack in jumps and descents, leans against runs.
  // child: holds all the time. greedy: like the adult, but never gives slack.
  // human: the adult's plan with a real hand: it sees the needle a quarter of a second late and never leans.
  const bots = {
    adult: F => { const k = F.run.kind; hold.on = k === 'jump' || k === 'descend' ? false : F.T < F.bc; hold.dir = k === 'run' ? -F.run.dir : 1; },
    child: () => { hold.on = true; hold.dir = 1; },
    greedy: F => { hold.on = F.T < F.bc + .05 || F.run.kind === 'jump' || F.run.kind === 'descend'; hold.dir = 1; },
    human: F => { const q = F.seen || (F.seen = []); q.push([F.T, F.bc, F.run.kind]); const [T, bc, k] = q.length > 8 ? q.shift() : q[0]; hold.on = k === 'jump' || k === 'descend' ? false : T < bc; hold.dir = 0; },
  };
  // One fight to its end, without drawing. Returns [landed, seconds, why it was lost].
  const fight = (area, id, bot, r, starter) => {
    let why = '';
    equip(id, r, starter);
    go('spot', { area }); SP.pop.length = 0;
    if (!toBite(id)) return [false, 0, 'no bite (' + SP.st + ')'];
    const n0 = (ev.escape || []).length, s0 = (ev.snap || []).length;
    SP.strike();
    let n = 0, nt = 0;
    for (; n < 900 * 30; n++) {
      V.t += 1 / 30; SP.update(1 / 30);
      if (SP.F) bots[bot](SP.F);
      if (SP.st === 'net' && (bot === 'child' ? ++nt % 20 === 0 : SP.netIn())) SP.netTry();
      if (SP.st !== 'fight' && SP.st !== 'net') break;
    }
    hold.on = false;
    if ((ev.snap || []).length > s0) why = 'snap'; else if ((ev.escape || []).length > n0) why = ev.escape[ev.escape.length - 1].why;
    const landed = SP.st === 'card';
    if (closeDlg) closeDlg();
    return [landed, n / 30, landed ? '' : why || SP.st];
  };

  async function smoke() {
    // --- sound code paths (the context may stay suspended without a real tap; node creation still runs) ---
    where = 'sound'; audioOn(); for (const k in sfx) sfx[k](.5); for (const a of AREAS) for (const c of a.conds) amb.set(a.id, { t: 0, cond: c, swell: 0, tide: .5, wind: .3, squall: c === 'squall' ? 1 : 0, light: [], toll: 99 });
    for (const h of ['thunder', 'creak', 'drip', 'toll', 'gust']) amb.hit(h);
    amb.stop(); setVol(.3); setMute(true); setMute(false);

    // --- the tables ---
    where = 'tables';
    for (const k in L) check(Array.isArray(L[k]) && L[k].length === 3 && L[k].every(s => typeof s === 'string' && s.trim().length), 'text row ' + k);
    const ids = Object.keys(SPECIES);
    check(ids.length === 85, 'there are 85 species, got ' + ids.length);
    const fc = fishCheck(); check(!fc.length, 'fishCheck: ' + fc.slice(0, 5).join(' | '));
    AREAS.forEach((a, i) => check(a.fish.includes(LEGENDS[i]) && SPECIES[LEGENDS[i]].legend && a.fish.filter(f => SPECIES[f].legend).length === 1 && a.fish.length >= 8 && a.fish.length <= 12, `${a.id} has 8 to 12 species and one Legendary`));
    for (const id of ['rod0', 'line0', 'reel0', 'worm', 'boat', 'iceline', 'lantern', 'snagguard', 'bignet']) check(!!ITEMS[id], 'goods: ' + id);
    check(ITEMS.worm.free && ITEMS.worm.kind === 'lure', 'the worm is the free lure');
    check(Object.keys(ACHS).length >= 30, 'at least 30 trophies, got ' + Object.keys(ACHS).length);
    for (const id in ITEMS) { const it = ITEMS[id]; check(['rod', 'line', 'reel', 'lure', 'gear', 'hat', 'paint'].includes(it.kind) && it.tier >= 0 && it.tier <= 7 && (it.free || it.cost > 0 || id.endsWith('0')), 'goods row ' + id); }
    // every species can be offered a lure of its water's tier that suits all three of its tastes
    for (const id of ids) { const s = SPECIES[id], lu = ITEMS[lureFor(id, AREA[s.area].tier)]; check(lu.depth === s.depth && lu.act === s.act && lu.food === s.food, `${id} (${s.area}) has no fitting lure by rank ${AREA[s.area].tier}: nearest is ${lu.id}`); }
    // every water can be painted in every one of its conditions; its features lie inside the water
    const G = { w: 400, h: 700, surf: 240, bed: 660, x0: 80, x1: 385, ax: 60, ay: 240, u: 1 };
    for (const a of AREAS) {
      const W = WATER[a.id];
      check(W && ['stand', 'back', 'water', 'front', 'bed'].every(f => typeof W[f] === 'function') && Array.isArray(W.feats), 'painter of ' + a.id);
      for (const c of a.conds) { const env = { t: 3, cond: c, swell: 4, tide: .5, wind: .4, squall: c === 'squall' ? 1 : 0, light: a.twist.dark ? [{ x: 100, y: 300, r: 90 }] : [], toll: 2 }; W.stand(G, env); W.back(ctx, G, env); W.water(ctx, G, env); W.front(ctx, G, env); }
      for (let p = 0; p <= 1; p += .05) check(W.bed(p) > 0 && W.bed(p) <= 1, `bed of ${a.id} at ${p.toFixed(2)}: ${W.bed(p)}`);
      for (const f of W.feats) check(f.p0 >= 0 && f.p1 <= 1 && f.p0 < f.p1, `feature ${f.kind} of ${a.id}`);
      if (a.twist.ice) check(W.feats.filter(f => f.kind === 'hole').length === 3, 'three ice holes');
    }
    for (const id of ids) { drawFish(ctx, id, 100, 100, 60, { dir: 1, t: 1, mode: 'shadow', wag: 1 }); drawFish(ctx, id, 200, 200, 120, { dir: -1, t: 1, mode: 'full' }); }

    // --- the unlock graph of the specification, step by step ---
    where = 'unlock graph';
    const open = () => AREAS.filter(a => unlocked(a.id)).map(a => a.id).join(' ');
    fresh(); check(open() === 'pond', 'a new save opens only the pond: ' + open());
    logArea('pond', 4); check(open() === 'pond', '4 pond species open nothing');
    logArea('pond', 5); check(open() === 'pond creek pier', '5 pond species open the creek and the pier: ' + open());
    logArea('creek', 6); check(open() === 'pond creek pier falls', '6 creek species open the falls: ' + open());
    logArea('falls', 6); check(open() === 'pond creek pier falls ice', '6 falls species open the Frozen Reach: ' + open());
    logArea('ice', 6); check(open() === 'pond creek pier falls ice reef', '6 ice species open the reef (second way in): ' + open());
    fresh(); logArea('pond', 5); logArea('pier', 6); check(open() === 'pond creek pier mill', '6 pier species open the mill: ' + open());
    logArea('mill', 6); check(open() === 'pond creek pier mill ice', '6 mill species also open the Frozen Reach: ' + open());
    logLeg('millstone'); check(unlocked('reef'), 'the Millstone opens the reef');
    delete S.log.millstone; logArea('mill', 8); check(unlocked('reef'), '8 mill species open the reef');
    check(!canReach('reef'), 'the reef needs the boat'); give('boat'); check(canReach('reef'), 'with the boat the reef can be reached');
    logArea('reef', 6); check(!unlocked('deep'), '6 reef species are not enough for the deep'); logArea('reef', 7); check(unlocked('deep') && !unlocked('chapel'), '7 reef species open the Lantern Deep');
    logArea('deep', 99); check(!unlocked('chapel'), 'only the Abyssal Postman opens the Chapel'); logLeg('postman'); check(unlocked('chapel'), 'the Abyssal Postman opens the Chapel');
    fresh(); check(rank() === 0, 'a new angler is a Reed'); AREAS.forEach((a, i) => { logArea(a.id, 99); logLeg(LEGENDS[i]); }); check(rank() === 7 && allLogged() === 85, 'everything logged is rank Bell');
    for (let r = 2; r <= 7; r++) { const before = AREAS.filter(a => a.tier < r).reduce((n, a) => n + a.fish.length, 0); check(RANKS[r] <= before, `rank ${r} (tackle of tier ${r}) can be reached in gentler waters: needs ${RANKS[r]}, they hold ${before}`); }
    await note('tables and unlock graph checked, problems so far: ' + out.errors.length);
    // a browser that refuses to save (private mode, storage full, storage switched off): the game goes on, nothing throws
    where = 'a browser that refuses to save'; fresh();
    const setItem0 = Storage.prototype.setItem, getItem0 = Storage.prototype.getItem, errs0 = out.errors.length;
    Storage.prototype.setItem = Storage.prototype.getItem = () => { throw new DOMException('refused', 'QuotaExceededError'); };
    try { go('map'); sim(.3); if (closeDlg) closeDlg(); go('hub'); sim(.3); go('shop'); sim(.3); emit('catch', { id: 'bluegill' }); save(); go('spot', { area: 'pond' }); sim(.5); if (closeDlg) closeDlg(); go('home'); sim(.3); }
    catch (e) { bad('a browser that refuses to save breaks the game: ' + (e.stack || e)); } finally { Storage.prototype.setItem = setItem0; Storage.prototype.getItem = getItem0; mapRt = null; }
    check(out.errors.length === errs0, `a browser that refuses to save does not stop the game (${out.errors.length - errs0} errors)`);

    // --- travel on the map: taps, keys, the boat, the Chapel's gate ---
    where = 'map';
    fresh(); go('map'); sim(.5);
    tapPlace('creek'); check(!!$('.veil') && !mapRt && S.at === 'tree' && $('#dlgText').textContent.includes(t('a_pond')), 'a tap on a shut water shows what it wants, and nobody walks');
    clickDlg(0);
    tapPlace('pond'); check(!!mapRt, 'a tap on the pond sets off'); arrive('pond');
    check(S.at === 'pond' && got('travel', d => d.from === 'tree' && d.to === 'pond' && !d.boat) && got('enter', d => d.area === 'pond' && !d.home), 'arriving at the pond: saved, travel and enter sent');
    check(!!$('.veil .btn.go'), 'arrival opens the card with the fish button'); clickDlg(0);
    scene.key({ key: 'ArrowLeft', target: document.body }); arrive('tree'); check(S.at === 'tree', 'ArrowLeft walks back to the treehouse');
    scene.key({ key: 'd', target: document.body }); arrive('pond'); check(S.at === 'pond', 'D walks to the pond again'); clickDlg(0);
    scene.key({ key: 'Enter', target: document.body }); check(!!$('.veil .btn.go'), 'Enter at a water opens its card'); clickDlg(-1);
    check(scene.name === 'spot' && scene.arg.area === 'pond', 'the card\'s big button goes fishing there, got ' + scene.name);
    PRE.mid(); go('map'); sim(.3);
    tapPlace('reef'); check($('#dlgText').textContent.includes(t('needBoat')) && !mapRt, 'the reef without the boat says so'); clickDlg(0);
    give('boat'); go('map'); sim(.3); tapPlace('reef'); arrive('reef', 20); check(S.at === 'reef' && got('travel', d => d.to === 'reef' && d.boat), 'with the boat the Chief paddles to the reef'); clickDlg(0);
    PRE.open(); S.at = 'falls'; go('map'); sim(.3); ev.gate = []; ev.enter = [];
    tapPlace('chapel'); arrive('chapel', 20);
    check($('#dlgText').textContent.includes(t('gate3')) && !got('enter', d => d.area === 'chapel'), 'the Chapel asks first, in the owl\'s words');
    clickDlg(1); check(S.gate === 0 && got('gate', d => d.entered === false) && !!mapRt, 'turning back is free: nothing is set, the Chief walks back'); arrive('falls', 20); clickDlg(0);
    tapPlace('chapel'); arrive('chapel', 20); check($('#dlgText').textContent.includes(t('gate1')), 'after a no the gate asks again');
    clickDlg(0); check(S.gate === 1 && got('gate', d => d.entered === true) && got('enter', d => d.area === 'chapel'), 'a yes opens the Chapel for good'); clickDlg(0);
    go('map'); sim(.2); mapAct(); check(!!$('.veil .btn.go') && !$('#dlgText').textContent.includes(t('gate1')), 'after a yes it never asks again'); clickDlg(0);
    mapToggle(); sim(1.5); mapToggle(); sim(1.5);
    S.at = 'tree'; go('map'); sim(.2); scene.key({ key: 'Enter', target: document.body }); check(scene.name === 'hub', 'Enter at the treehouse goes in, got ' + scene.name);
    where = 'lanterns'; lanChecks(check);
    await note('map checked, problems so far: ' + out.errors.length);

    // --- the treehouse: shop, logbook, trophies, records, the save code ---
    where = 'shop';
    PRE.mid(); S.moons = 20; shopTab = 'rod'; go('shop'); sim(.3);
    check(rank() === 3, 'the mid save is rank Lake, got ' + rank());
    const dear = $('[data-buy="rodf1"]'); check(!!dear && !dear.disabled, 'a rod of the angler\'s rank is offered'); dear.click();
    check(!owns('rodf1') && S.moons === 20, 'too dear: nothing is bought, nothing is paid');
    S.moons = 640; scenes.shop.render(); ev.buy = []; $('[data-buy="rodf1"]').click();
    check(S.moons === 640 - ITEMS.rodf1.cost && owns('rodf1') === 1 && got('buy', d => d.id === 'rodf1'), 'buying a rod: paid, owned, event sent');
    $('[data-use="rodf1"]').click(); check(S.rig.rod === 'rodf1' && rig().rod.id === 'rodf1', 'the new rod is tied on');
    const lock = $('[data-buy="rodp3"]'); check(!!lock && lock.disabled, 'a rod above the angler\'s rank is locked'); lock.click(); check(!owns('rodp3'), 'a locked rod cannot be bought');
    shopTab = 'lure'; scenes.shop.render(); const c0 = owns('cricket'); $('[data-buy="cricket"]').click(); check(owns('cricket') === c0 + ITEMS.cricket.pack, 'lures come in packs');
    check(!!shopLock(ITEMS.aurorajig), 'a top lure waits for its trophy');
    where = 'gadget lures'; nwlChecks(check);
    where = 'trophies';
    const m1 = S.moons; emit('catch', { id: 'roach', area: 'pond', grams: 140, first: false, record: false, moons: 3, clean: true, jumps: 3, firstBite: false, tier: 1 });
    check(!!S.ach.softHands, 'Soft Hands for a fish that jumped three times'); const had = JSON.stringify(S.own);
    emit('catch', { id: 'roach', area: 'pond', grams: 140, jumps: 3, tier: 1 }); check(JSON.stringify(S.own) === had, 'a trophy is given once');
    emit('leave', { area: 'pond', catches: 6, snaps: 0 }); check(!!S.ach.unsnapped, 'Unsnapped for a visit without a broken line');
    emit('gate', { entered: false }); check(!S.ach.bellTolls, 'turning back at the Chapel earns nothing'); emit('enter', { area: 'chapel' }); check(!!S.ach.bellTolls, 'Bell Tolls for entering the Chapel');
    S.earned = 9990; pay(20); check(!!S.ach.mogul, 'Market Mogul at 10,000 moons earned');
    for (const need of ['firstLight', 'shadowReader', 'fullOfFish', 'unsnapped', 'softHands', 'firstTry', 'dragArtist', 'halfWater', 'everyShadow', 'legendHunter', 'wholeSky', 'bellTolls', 'letDescend', 'mercy', 'stormKeeper', 'mogul', 'fullyRigged', 'oldBiscuit']) check(!!ACHS[need], 'the trophy named in the specification exists: ' + need);
    check(Object.values(ACHS).filter(a => a.secret).length >= 3, 'a few secret trophies');
    const code = hubCode(), back = hubRead(code); check(!!back && back.moons === S.moons && back.name === 'Mia' && hubRead('hello') === null, 'the save code goes round and a bad one is refused');
    for (const sc of ['hub', 'shop', 'trophies', 'records']) { go(sc); sim(.3); }
    go('book', { back: () => go('hub') }); sim(.3); go('book', { back: () => go('hub'), area: 'pond', sp: 'biscuit' }); sim(.3); go('book', { back: () => go('hub'), area: 'chapel', sp: 'bell' }); sim(.3);
    // --- the day between two Nights of the Night Watch: the treehouse leads back in the evening, and the map says when evening is near ---
    where = 'day';
    let went = ''; scenes.hub.leave = url => { went = url; };
    fresh(); go('hub'); check(!$('#hNight'), 'on a visit of its own the treehouse has no way to the Night Watch');
    day = true; go('hub'); $('#hNight').click(); check(went === '../index.html#night', 'by day the treehouse leads back to the Night Watch: ' + went);
    const low = () => [...document.querySelectorAll('.toast')].filter(n => n.textContent === t('day_low')).length;
    dayCatch = 4; dayTold = false; go('map'); check(low() === 0, 'four catches are not a full day yet');
    emit('catch', { id: 'perch' }); go('map'); check(low() === 1, 'after five catches the map says once that the sun is getting low');
    // the day's note for the owl of the Night Watch: the fish so far; at the third fish it becomes a new note (supper)
    const dayKey = 'firstlight.day' + (nwSlot ? '.' + (nwSlot + 1) : ''), dayNote = () => JSON.parse(localStorage.getItem(dayKey) || '{}');
    dayCatch = 1; emit('catch', { id: 'perch' }); const n2 = dayNote(); emit('catch', { id: 'perch' }); const n3 = dayNote();
    check(n2.n === 2 && n3.n === 3 && Number.isSafeInteger(n2.id) && n3.id === n2.id + 1, 'the note counts the day\'s fish and is a new note from the third on: ' + JSON.stringify([n2, n3]));
    // a page loaded again in the middle of the day (a phone drops a background tab) goes on from the note: two fish before
    // and one after are supper; a supper that was earned stays earned and is the same note; another day starts at nothing
    const night0 = nwSave.night; nwSave = { ...nwSave, night: 7 };
    localStorage.removeItem(dayKey); dayBegin(); emit('catch', { id: 'perch' }); emit('catch', { id: 'perch' }); const before = dayNote();
    dayBegin(); const kept = dayCatch; emit('catch', { id: 'perch' }); const after = dayNote();
    check(kept === 2 && after.n === 3 && after.id === before.id + 1 && after.k === 7, 'a reload after two fish keeps them, and the third is supper: ' + JSON.stringify([before, kept, after]));
    dayBegin(); emit('catch', { id: 'perch' }); const more = dayNote();
    check(dayCatch === 4 && more.id === after.id, 'a reload after supper keeps the same note, so supper does not come twice: ' + JSON.stringify(more));
    const now1 = Date.now; Date.now = () => now1() + 60000;   // the next day begins later, not in the same millisecond
    nwSave = { ...nwSave, night: 8 }; dayBegin(); Date.now = now1; const fresh8 = dayCatch; emit('catch', { id: 'perch' }); const next = dayNote();
    check(fresh8 === 0 && next.n === 1 && next.k === 8 && next.id !== more.id, 'the day before another Night starts its own count: ' + JSON.stringify(next));
    for (const junk of ['{{{', 'null', '[3]', JSON.stringify({ id: 'x', n: 5, k: 8 }), JSON.stringify({ id: 5, n: 1e300, k: 8 }), JSON.stringify({ id: 5, n: -2, k: 8 }), JSON.stringify({ id: 5, n: 2.5, k: 8 })]) { localStorage.setItem(dayKey, junk); dayBegin(); check(dayCatch === 0, 'a damaged note starts the day at nothing: ' + junk); }
    day = false; localStorage.setItem(dayKey, JSON.stringify({ id: 5, n: 2, k: 8 })); dayBegin(); check(dayCatch === 0, 'a visit of its own does not read the note'); day = true;
    nwSave = { ...nwSave, night: night0 }; localStorage.removeItem(dayKey); dayBegin();
    go('map'); check(low() === 0, 'and it does not say so again');
    go('home'); check($('#bSister').getAttribute('href') === '../index.html#night', 'the title leads back to the Night as well'); day = false;
    await note('shop, trophies and logbook checked, problems so far: ' + out.errors.length);

    // --- one whole visit at the pond: land a fish, snap a line, spook a faker ---
    where = 'visit';
    fresh(); for (const k in ev) ev[k] = []; go('spot', { area: 'pond' }); sim(.5);
    check(got('enter', d => d.area === 'pond') && SP.pop.length > 2, 'the pond has shadows to read: ' + SP.pop.length);
    SP.castTo(castSpot('pond')); until(() => SP.st === 'wait', 3); check(SP.st === 'wait' && got('cast'), 'a cast lands and the lure waits, got ' + SP.st);
    SP.forceBite('perch'); until(() => SP.st === 'bite', 8); check(SP.st === 'bite' && got('bite', d => d.id === 'perch'), 'a perch bites');
    SP.strike(); check(SP.st === 'fight' && !!SP.F && got('strike', d => d.ok), 'the strike hooks it');
    sim(120, () => { if (SP.F) hold.on = SP.F.T < SP.F.bc; if (SP.st === 'net' && SP.netIn()) SP.netTry(); return SP.st === 'fight' || SP.st === 'net'; }); hold.on = false;
    check(SP.st === 'card' && S.log.perch && S.log.perch.n === 1 && S.moons > 0 && got('catch', d => d.id === 'perch' && d.first && d.area === 'pond'), `the perch is landed, logged and paid for: ${SP.st}, ${S.moons} moons`);
    const firstPay = S.moons; clickDlg(); check(SP.st === 'read', 'releasing it returns to reading the water, got ' + SP.st);
    SP.castTo(.5); until(() => SP.st === 'wait', 3); SP.forceBite('koi'); until(() => SP.st === 'bite', 8); SP.strike();
    SP.drag = 5; SP.F.queue = { kind: 'run', dir: 1, pow: 1, dur: 30 }; SP.F.runT = 0; SP.F.s = Object.assign({}, SP.F.s, { pull: 10 });
    sim(40, () => { hold.on = true; return SP.st === 'fight'; }); hold.on = false;
    check(SP.snaps === 1 && got('snap') && S.moons === firstPay, 'holding against a strong run snaps the line, and costs no moons');
    go('spot', { area: 'creek' }); sim(.3); SP.castTo(.5); until(() => SP.st === 'wait', 3); SP.T = Object.assign({}, SP.T, { fakes: 1, wary: 0 }); const faker = SP.forceBite('grayling');
    until(() => SP.bite && SP.bite.touch > 0, 10); SP.strike();
    check(got('escape', d => d.why === 'spook') && got('strike', d => d.early) && faker.st === 'flee', 'a strike on a fake spooks the fish for good');
    go('map'); check(got('leave', d => d.area === 'pond' && d.catches === 1 && d.snaps === 1), 'leaving reports the visit: ' + JSON.stringify(ev.leave));
    // the conditions of a water take turns
    go('spot', { area: 'mill' }); ev.cond = []; sim(130); check((ev.cond || []).length >= 2, 'the conditions of a water take turns: ' + JSON.stringify(ev.cond));
    // --- found by the review: the logbook button, a trophy on the way out, the snag guard, the squall chip, a weak line ---
    where = 'review';
    fresh({ gate: 1 }); go('spot', { area: 'pond' }); sim(.3); check(!$('#hBook').disabled, 'the logbook opens while reading the water');
    toBite('perch'); SP.strike(); check(SP.st === 'fight' && $('#hBook').disabled, 'the logbook stays shut in the middle of a fight');
    SP.catches = 5; go('map');
    check(!!S.ach.unsnapped && !!document.querySelector('.tro-toast'), 'a trophy earned on the way out of a water is still shown on the map');
    fresh({ gate: 1 }); S.own.snagguard = 1; S.own.spinner = 5; S.rig.lure = 'spinner'; ev.snag = [];
    go('spot', { area: 'mill' }); sim(.3);
    const sn = WATER.mill.feats.find(q => q.kind === 'snag'), snP = (sn.p0 + sn.p1) / 2;
    SP.castTo(snP); until(() => SP.st !== 'fly', 3);
    check(SP.st === 'wait' && owns('spinner') === 5 && got('snag', d => d.lost === false) && !got('snag', d => d.lost), `the snag guard pulls the lure free and it fishes on: ${SP.st}, ${owns('spinner')} lures left`);
    SP.reelIn(); SP.castTo(snP); until(() => SP.st !== 'fly', 3);
    check(SP.st === 'read' && owns('spinner') === 4, `the second snag of the visit keeps the lure: ${SP.st}, ${owns('spinner')} lures left`);
    go('spot', { area: 'reef' }); sim(.3); SP.ci = SP.A.conds.indexOf('squall'); SP.cond = SP.env.cond = 'squall'; SP.condT = 0; SP.chips();
    let bars = 0; sim(SP.condLen * .69, () => { const q = $('#spSq'); if (q) bars = Math.max(bars, q.textContent.length); });
    check(bars >= 4, 'the squall chip fills as the squall builds: ' + bars + ' of 5 bars');
    const redOf = starter => { fresh({ gate: 1 }); equip('grouper', 5, starter); go('spot', { area: 'reef' }); SP.pop.length = 0; toBite('grouper'); SP.strike(); sim(.2); return SP.F.red; };
    const redWeak = redOf('rig'), redStrong = redOf();
    check(redWeak < redStrong - .15, `a line too weak for the fish brings the red line down: ${redWeak.toFixed(2)} against ${redStrong.toFixed(2)}`);
    // the first catch of a Legendary says that a gift goes to the Night Watch treehouse; an ordinary fish says nothing of the kind
    fresh(); go('spot', { area: 'pond' }); sim(.3);
    for (const id of ['perch', 'biscuit']) {
      toBite(id); SP.strike(); const F = SP.F; F.tired = true; F.lastUsed = 1; F.Lm = 2.5; F.runT = 0; sim(.3); F.netT = .625; SP.netTry();
      check(SP.st === 'card' && $('.veil .marks').textContent.includes(t('spot_gift')) === (id === 'biscuit'), `the catch card of ${id} ${id === 'biscuit' ? 'tells of' : 'has no'} gift for the treehouse`); clickDlg();
    }
    await note('visit checked, problems so far: ' + out.errors.length);

    // --- every water: its first ordinary fish landed by a careful angler with the tackle of that water ---
    where = 'nine waters';
    fresh({ gate: 1 });
    for (const a of AREAS) {
      const id = a.fish.find(f => !SPECIES[f].legend), [ok, sec, why] = fight(a.id, id, 'adult', a.tier);
      check(ok && S.log[id] && S.log[id].n >= 1, `${a.id}: ${id} landed with tier ${a.tier} tackle (${sec.toFixed(0)} s) ${why}`);
    }
    // the Bellwether goes down, and the only right play is to let it
    const [bell, bellSec] = fight('chapel', 'bell', 'adult', 7), [greedy] = fight('chapel', 'bell', 'greedy', 7);
    check(bell && !greedy, `the Bellwether is landed by letting it descend (${bellSec.toFixed(0)} s), and lost by reeling against it`);
    check(got('catch', d => d.id === 'bell' && d.descend), 'the catch says the descent was survived');
    await note('nine waters checked, problems so far: ' + out.errors.length);

    // --- balance: three anglers against every species, with the tackle of the water and with the starting tackle ---
    where = 'balance';
    const rows = [];
    for (const a of AREAS) {
      // each cell: landed, tried, seconds per landed fish, and why the others were lost ("snap 2, jump 1")
      const cell = (bot, starter) => { let n = 0, tot = 0, secs = 0; const lost = {}; for (const id of a.fish.filter(f => !SPECIES[f].legend)) { fresh({ gate: 1 }); const [ok, s, why] = fight(a.id, id, bot, a.tier, starter); tot++; if (ok) { n++; secs += s; } else lost[why] = (lost[why] || 0) + 1; } return [n, tot, n ? secs / n : 0, Object.keys(lost).map(k => ` ${k} ${lost[k]}`).join(',')]; };
      const ad = cell('adult'), ch = cell('child'), gr = cell('greedy'), st = cell('adult', true), hu = cell('human'), hs = cell('human', 'rig'), tell = c => `${c[0]}/${c[1]}${c[3] ? ' (lost:' + c[3] + ')' : ''}`;
      fresh({ gate: 1 }); const leg = fight(a.id, LEGENDS[AREAS.indexOf(a)], 'adult', a.tier);
      rows.push({ a, ad, ch, gr, st, hu, hs, leg });
      await note(`balance ${a.id.padEnd(6)} tier ${a.tier}: careful ${tell(ad)} (${ad[2].toFixed(0)} s each)  holds-always ${tell(ch)}  no-slack ${tell(gr)}  careful with starting tackle ${tell(st)}  slow hand ${tell(hu)} (${hu[2].toFixed(0)} s each)  slow hand, first rod line and reel ${tell(hs)}  Legendary ${leg[0] ? 'landed in ' + leg[1].toFixed(0) + ' s' : 'lost: ' + leg[2]}`);
    }
    for (const r of rows) {
      check(r.ad[0] >= r.ad[1] * (r.a.tier >= 5 ? .6 : .85), `${r.a.id}: a careful angler with the water's tackle lands most ordinary fish: ${r.ad[0]}/${r.ad[1]}`);
      check(r.leg[0], `${r.a.id}: a careful angler with the water's tackle can land the Legendary: ${r.leg[2]}`);
      if (r.a.tier <= 2) check(r.ch[0] >= r.ch[1] - 1, `${r.a.id}: a child who only holds lands the ordinary fish of the gentle waters: ${r.ch[0]}/${r.ch[1]}`);
      if (r.a.tier >= 5) check(r.ch[0] === 0, `${r.a.id}: hard water is never won by holding alone: ${r.ch[0]}/${r.ch[1]}`);   // the starting tackle column is reported, not asserted: chance moves it
    }
    // --- economy: how many ordinary catches of the water before pay for the tackle of a water ---
    where = 'economy';
    const pay1 = a => { const f = a.fish.filter(id => !SPECIES[id].legend); return f.reduce((n, id) => n + SPECIES[id].pay, 0) / f.length; };
    for (let r = 1; r <= 7; r++) {
      const k = kit(r), cost = ITEMS[k.rod].cost + ITEMS[k.line].cost + ITEMS[k.reel].cost, prev = AREAS.filter(a => a.tier === Math.max(1, r - 1)), avg = prev.reduce((n, a) => n + pay1(a), 0) / prev.length, n = cost / avg;
      await note(`economy: tackle of tier ${r} costs ${cost} moons = ${n.toFixed(0)} ordinary catches in tier ${Math.max(1, r - 1)} water (${avg.toFixed(0)} moons each)`);
      check(n >= 6 && n <= 45, `tackle of tier ${r} is neither a gift nor a wall: ${n.toFixed(0)} catches`);
    }
    const first = AREAS.reduce((n, a) => n + a.fish.reduce((m, id) => m + SPECIES[id].pay * 3, 0), 0);
    await note(`economy: the first catches of all 85 species pay about ${Math.round(first)} moons; every shop item together costs ${Object.values(ITEMS).reduce((n, it) => n + (it.cost || 0), 0)}`);
  }

  async function audit() {
    await note(`viewport ${innerWidth}x${innerHeight}, reduced motion ${calm.matches ? 'on' : 'off'}`);
    // measure final layouts, not the first frame of a pop-in animation
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '*, *::before { animation: none !important; transition: none !important; }' }));
    const W = innerWidth, H = innerHeight, found = new Map();
    const name = el => el.id ? '#' + el.id : el.tagName.toLowerCase() + '.' + String(el.className).trim().split(/\s+/).join('.');
    // one line per problem; the languages that share it are collected behind it
    const flag = (screen, el, what) => {
      const k = `${screen}: ${name(el)} ${what.replace(/[-\d.]+/g, '#')}`;
      if (!found.has(k)) found.set(k, { text: `${screen}: ${name(el)} "${(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28)}" ${what}`, langs: new Set() });
      found.get(k).langs.add(LANGS[lang]);
    };
    // a list inside its own scrolling panel may run out of sight; then only the panel itself must fit
    const scrolls = el => { for (let p = el.parentElement; p && p !== ui; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight + 2) return p; } return null; };
    const look = screen => {
      where = screen;
      if (document.documentElement.scrollWidth > W + 1) flag(screen, document.documentElement, 'page scrolls sideways');
      // every button that is not under a dialog takes a tap at its middle (a test's click() would press a covered button too);
      // a button that a scrolling panel has scrolled out of view is not judged. The open tackle box is a dialog too: it
      // covers the buttons under it on purpose.
      const veil = $('#ui .veil') || $('#ui .spot-box');
      const scrolledOut = (el, x, y) => { for (let p = el.parentElement; p && p !== ui; p = p.parentElement) { const o = getComputedStyle(p), q = p.getBoundingClientRect(), l = q.left + p.clientLeft, u = q.top + p.clientTop; if ((o.overflowX !== 'visible' || o.overflowY !== 'visible') && (x < l + 1 || x > l + p.clientWidth - 1 || y < u + 1 || y > u + p.clientHeight - 1)) return true; } return false; };
      for (const el of document.querySelectorAll('#ui button, #ui a.btn')) {
        const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (!r.width || el.disabled || veil && !veil.contains(el) || r.left < 0 || r.right > W || r.top < 0 || r.bottom > H || scrolledOut(el, x, y)) continue;
        const hit = document.elementFromPoint(x, y);
        if (hit !== el && !el.contains(hit)) flag(screen, el, 'cannot be tapped: ' + (hit ? name(hit) : 'nothing') + ' takes the tap');
      }
      // every control and every picture with a meaning has a name for a screen reader: its text, a label, or the dialog's text
      for (const el of document.querySelectorAll('#ui button, #ui a.btn, #ui input, #ui select, #ui textarea, #ui [role="img"], #ui [role="dialog"], #ui [role="group"]')) {
        const by = el.getAttribute('aria-labelledby');
        if (el.getBoundingClientRect().width && !((el.getAttribute('aria-label') || '').trim() || el.textContent.trim() && !el.matches('select') || el.closest('label') || by && document.getElementById(by))) flag(screen, el, 'has no name for a screen reader');
      }
      for (const el of document.querySelectorAll('#ui button, #ui a.btn, #ui .pill, #ui .dlg, #ui .plaque, #ui .toast, #ui input, #ui .title, #ui .bubble, #ui .card')) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        const box = scrolls(el);
        if (r.left < -1 || r.right > W + 1) flag(screen, el, `leaves the screen sideways (${Math.round(r.left)}..${Math.round(r.right)} of ${W})`);
        if (!box && (r.top < -1 || r.bottom > H + 1)) flag(screen, el, `leaves the screen vertically (${Math.round(r.top)}..${Math.round(r.bottom)} of ${H})`);
        if (el.matches('button, a.btn') && !el.disabled && (r.width < 47.5 || r.height < 47.5)) flag(screen, el, `tap target is only ${Math.round(r.width)}x${Math.round(r.height)}`);
        if (el.matches('button, .pill') && el.scrollWidth > el.clientWidth + 2) flag(screen, el, `text is clipped (${el.scrollWidth} > ${el.clientWidth})`);
      }
      const d = $('#ui .veil .dlg');
      if (d && d.scrollHeight > d.clientHeight + 2) flag(screen, d, `dialog needs scrolling (${d.scrollHeight} > ${d.clientHeight})`);
      const bar = [...document.querySelectorAll('#ui .hud > *:not(.sp)')].filter(e => e.getBoundingClientRect().width);
      for (let i = 0; i < bar.length; i++) for (let j = i + 1; j < bar.length; j++) {
        const a = bar[i].getBoundingClientRect(), b = bar[j].getBoundingClientRect();
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2) flag(screen, bar[i], `overlaps ${name(bar[j])} in the top bar`);
      }
    };
    for (let l = 0; l < 3; l++) {
      setLang(l);
      fresh(); go('home'); sim(.5); look('home'); askName(() => {}); look('name dialog'); clickDlg();
      if (!l) {   // the keyboard's own "done" key presses OK: on a phone the keyboard covers the button (seen on a real phone)
        let named = 0; S.name = ''; askName(() => named++); const ni = $('.veil input'); ni.focus(); ni.value = ' Mia '; ni.dispatchEvent(new Event('input', { bubbles: true }));
        ni.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        check(named === 1 && !$('.veil') && S.name === 'Mia' && ni.getAttribute('enterkeyhint') === 'done', `Enter in the name field presses OK (${named} times, name "${S.name}")`);
      }
      // "Lessons again" on the title: every lesson of the owl is given once more, and the first one comes at the pond
      fresh(); go('home'); sim(.2); $('#bLessons').click(); look('home, lessons asked again');
      // (a trophy banner of an earlier step may still stand beside the owl's line)
      const again = JSON.parse(localStorage.getItem(SAVE)).tut, said = [...document.querySelectorAll('.toast')].map(n => n.textContent);
      check(Object.keys(S.tut).length === 0 && !!again && Object.keys(again).length === 0 && said.includes(t('lessonsSay')),
        `the lessons button asks for every lesson again, saves it and says so (lessons kept: ${Object.keys(S.tut)}; stored: ${JSON.stringify(again)}; said: ${JSON.stringify(said)})`);
      go('spot', { area: 'pond' }); await sleep(750); check(!!$('.veil') && S.tut.b1 === 1, 'and the first lesson comes again at the pond'); if (closeDlg) closeDlg(); S.tut = Object.assign({}, LESSONS);
      // the map: followed, whole, the cards, the gate
      PRE.mid(); S.tut = {}; go('map'); sim(.5); look('map, first time'); S.tut = Object.assign({}, LESSONS);
      go('map'); sim(.3); look('map');
      tapPlace('pond'); arrive('pond'); look('map, water card'); clickDlg(0);
      tapPlace('falls'); look('map, shut water'); if (closeDlg) closeDlg();
      mapToggle(); sim(1.5); look('map, whole'); mapToggle(); sim(1.5);
      PRE.open(); S.at = 'falls'; go('map'); sim(.3); tapPlace('chapel'); arrive('chapel', 20); look('the Chapel\'s gate'); clickDlg(0); look('map, Chapel card'); clickDlg(0);
      // the treehouse
      PRE.mid(); go('hub'); sim(.3); look('treehouse');
      day = true; go('hub'); sim(.3); look('treehouse by day'); day = false;
      for (const tab of ['rod', 'line', 'reel', 'lure', 'gear', 'style']) { shopTab = tab; go('shop'); sim(.2); look('shop, ' + tab); }
      PRE.all(); for (const tab of ['rod', 'lure', 'gear', 'style']) { shopTab = tab; go('shop'); sim(.2); look('shop with everything owned, ' + tab); }
      S.tut = {}; go('shop'); sim(.2); look('shop, first visit'); if (closeDlg) closeDlg(); S.tut = Object.assign({}, LESSONS);
      PRE.mid(); PRE.nwlures(); shopTab = 'lure'; go('shop'); sim(.2); look('shop, lures from the Night'); go('spot', { area: 'pond' }); sim(.5); POSES.box(); look('tackle box with lures from the Night'); nwSave.items = []; nwlSync();
      for (const [pre, tag] of [[PRE.mid, 'some'], [PRE.all, 'all'], [PRE.fresh, 'none']]) {
        pre(); go('book', { back: () => go('hub') }); sim(.2); look(`logbook (${tag})`);
        for (const [area, sp] of [['pond', 'biscuit'], ['pier', 'lanternjaw'], ['chapel', 'bell'], ['deep', 'postman']]) { go('book', { back: () => go('hub'), area, sp }); sim(.2); look(`logbook page (${tag})`); }
        go('records'); sim(.2); look(`records (${tag})`);
        go('trophies'); sim(.2); look(`trophies (${tag})`); scenes.trophies.open('softHands'); look(`trophy card (${tag})`); if (closeDlg) closeDlg(); scenes.trophies.open('magpieFriend'); look(`secret trophy card (${tag})`); if (closeDlg) closeDlg();
      }
      // fishing, in a gentle, a murky, a frozen, a dark and the last water
      for (const area of ['pond', 'mill', 'ice', 'deep', 'chapel']) {
        PRE.open(); S.gate = 1; go('spot', { area }); sim(1); look(`${area}: reading the water`);
        POSES.shadow(); look(`${area}: shadow card`); if (closeDlg) closeDlg();
        POSES.known(); look(`${area}: which fish is this`); if (closeDlg) closeDlg();
        POSES.box(); look(`${area}: tackle box`); SP.box(false);
        POSES.power(); look(`${area}: cast power`); SP.release(); until(() => SP.st === 'wait' || SP.st === 'read', 4); look(`${area}: waiting`);
        go('spot', { area }); sim(.3); toBite(); look(`${area}: bite`); SP.strike(); hold.on = true; sim(1); look(`${area}: fight`); hold.on = false;
        const F = SP.F; if (F) { F.tired = true; F.Lm = 2.5; F.runT = 0; sim(.4); look(`${area}: net`); F.netT = .625; SP.netTry(); await sleep(60); look(`${area}: catch card`); clickDlg(); }
        go('spot', { area }); sim(.3); toBite(); SP.strike(); if (SP.F) SP.lose('slack'); sim(.3); look(`${area}: lost fish`);
      }
      S.tut = {}; go('spot', { area: 'pond' }); sim(.5); look('first lesson'); if (closeDlg) closeDlg(); for (let k = 2; k <= 5; k++) { SP.teach(k); look('lesson ' + k); if (closeDlg) closeDlg(); }
      await note(`layout in ${LANGS[l]} checked, problems so far: ${found.size + out.errors.length}`);
    }
    for (const f of found.values()) bad(`${f.text} [${[...f.langs].join(' ')}]`);
  }

  // #tour: the game has started on a prepared browser storage (../../test/saves.js: its own save and the Night Watch's,
  // old, damaged, hand-edited or randomly broken). Whatever they were: the repaired career is sound, every screen opens,
  // every dialog can be answered, a fish can be landed, nothing throws, and no text of a save reaches the page as markup.
  async function tour() {
    scenes.hub.leave = () => {};                      // the way back to the Night Watch must not leave the test page
    const int = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi, str = (v, n) => typeof v === 'string' && v.length <= n;
    const sound = at => {
      const wrong = [], want = (ok, what) => { if (!ok) wrong.push(what); };
      want(int(S.lang, 0, 2) && S.lang === lang && typeof S.mute === 'boolean' && S.vol >= 0 && S.vol <= 1 && str(S.name, 16), 'lang, mute, vol, name');
      want(int(S.moons, 0, 2e9) && int(S.earned, 0, 2e9) && (S.gate === 0 || S.gate === 1) && (S.at === 'tree' || has(AREA, S.at)), 'moons, earned, gate, at');
      want(int(S.look.col, 0, 5) && int(S.look.boat, 0, 5) && (S.look.hat === '' || has(WEAR, S.look.hat)), 'look');
      want(Object.keys(S.log).every(id => has(SPECIES, id) && int(S.log[id].n, 0, 2e6) && int(S.log[id].best, 0, 2e7)), 'log');
      want(Object.keys(S.own).every(id => (has(ITEMS, id) || NWL.some(it => it.id === id)) && int(S.own[id], 0, 2000)), 'own');
      want(Object.keys(S.ach).every(id => has(ACHS, id)) && Object.values(S.stat).every(v => int(v, 0, 2e9)) && Object.values(S.tut).every(v => v === 1), 'ach, stat, tut');
      want(['rod', 'line', 'reel', 'lure'].every(k => has(ITEMS, S.rig[k])), 'rig: ' + JSON.stringify(S.rig));
      want(JSON.stringify(S).length < 30000, 'the save is small (' + JSON.stringify(S).length + ' characters)');
      want(Object.getPrototypeOf(S) === Object.prototype && !Object.keys(S).some(k => k === 'constructor' || k === '__proto__' || k.startsWith('extra') || k.includes('<') || /^\d+$/.test(k)), 'only the fields the game knows: ' + Object.keys(S).filter(k => !/^[a-zA-Z]+$/.test(k) || k.startsWith('extra')).join());
      want(({}).polluted === undefined && !window.xss && !document.getElementById('xss'), 'nothing of a save ran or reached the page');
      check(!wrong.length, `tour, ${at}: not sound: ${wrong.join('; ')} in ${JSON.stringify(S).slice(0, 400)}`);
    };
    const markup = at => check(!window.xss && !document.getElementById('xss'), 'text of a save reached the page as markup: ' + at);
    const answerAll = async () => { for (let i = 0; i < 12 && $('.veil'); i++) { clickDlg(); sim(.4); await sleep(40); } };
    const open = async (name, arg, label = name) => {
      where = 'tour: ' + label;
      try { go(name, arg); sim(.7); markup(label); await answerAll(); sim(1.2); markup(label + ', after its dialogs'); } catch (e) { bad(`tour: ${label} threw ${e.stack || e}`); }
    };
    sound('after the repair');
    await open('home'); await open('map'); await open('hub');
    for (const [tab] of SHOP_TABS) { shopTab = tab; await open('shop', undefined, 'shop, ' + tab); }
    await open('book', { back: () => go('hub') });
    for (const a of AREAS) await open('book', { back: () => go('hub'), area: a.id, sp: a.fish[0] }, 'logbook page of ' + a.id);
    await open('records'); await open('trophies');
    for (const a of AREAS) await open('spot', { area: a.id }, 'water ' + a.id);
    // one fish landed in the pond, with whatever tackle the save left
    where = 'tour: a catch'; S.tut = Object.assign({}, LESSONS); go('spot', { area: 'pond' }); sim(.3); SP.pop.length = 0;
    if (toBite()) { SP.strike(); hold.on = true; sim(1); hold.on = false; const F = SP.F; if (F) { F.tired = true; F.Lm = 2.5; F.runT = 0; sim(.4); F.netT = .625; SP.netTry(); await sleep(60); } }
    check(SP.st === 'card', 'tour: a fish can be landed, got to ' + SP.st); markup('the catch card'); await answerAll();
    go('map'); sim(.5); await answerAll(); mapRt = null;
    markup('the end'); sound('after a catch');
    check(JSON.stringify(JSON.parse(localStorage.getItem(SAVE))) === JSON.stringify(S), 'tour: what is stored is the repaired career');
  }

  // #perf: the frame rate of the heaviest screens, measured with the browser's own animation frames (numbers to read)
  async function perf() {
    const raf = () => new Promise(r => requestAnimationFrame(r));
    const measure = async label => {
      where = 'perf ' + label; await sleep(500);
      const ts = []; for (let i = 0; i <= 120; i++) ts.push(await raf());
      const d = ts.slice(1).map((x, i) => x - ts[i]).sort((a, b) => a - b), t0 = performance.now();
      for (let i = 0; i < 40; i++) { if (scene.update) scene.update(1 / 60); scene.draw(1 / 60); drawFx(1 / 60); drawPortrait(); }
      await note(`${label}: a frame every ${d[60].toFixed(1)} ms (95th ${d[113].toFixed(1)}, worst ${d[119].toFixed(1)}); update and draw cost ${((performance.now() - t0) / 40).toFixed(2)} ms`);
    };
    await note(`viewport ${innerWidth}x${innerHeight}, pixel ratio ${devicePixelRatio}, reduced motion ${calm.matches ? 'on' : 'off'}`);
    PRE.all(); nwSave = { ...nwSave, lit: 24 }; go('home'); await measure('title');
    go('map'); if (closeDlg) closeDlg(); await measure('map with 24 lit lanterns'); mapToggle(); await measure('whole map'); mapRt = null;
    go('hub'); await measure('treehouse'); go('shop'); await measure('shop'); go('book', { back: () => go('hub') }); await measure('logbook'); go('trophies'); await measure('trophies');
    for (const area of ['pond', 'reef', 'deep', 'chapel']) {
      go('spot', { area }); if (closeDlg) closeDlg(); await measure(`${area}, reading the water`);
      if (toBite()) { SP.strike(); hold.on = true; await measure(`${area}, a fight`); hold.on = false; }
    }
    go('home');
  }

  const modes = { smoke, audit, tour, perf };
  if (!has(modes, mode[0])) return;
  try { await modes[mode[0]](); } catch (e) { bad(`driver crashed at [${where}]: ${e.stack || e}`); }
  await post(out);
  if (parent !== window) parent.postMessage('flf-done', '*');
})();
