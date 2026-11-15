// ---------- Test driver: appended inside the game's scope only for test builds ----------
// Modes, chosen by location.hash:
//   #smoke                           play Nights 1 to 8 with simulated time (win path and soft-fail path of every station)
//   #audit                           layout audit of every screen in three languages, plus real keyboard and pointer events
//   #shot,scene,night,lang,flag,sec,pose  pose one screen for a screenshot (see test/shots.sh); pose is optional:
//       gifts (every gift of the Legendary fish around the tree), tapgifts (the same, each one just tapped),
//       news (scene hub, flag 1: the owl tells of a gift), bedset (the grown-ups' bedtime setting; scene bed shows bedtime itself),
//       stolen (Camera Watch with two jars in the nest), costume (a costumed trickster at the gate), cut (the gate cutscene),
//       cap (a trickster in the too-big guard cap), oldest (the strongest password in the forge), win (station win dialog),
//       some (a part-filled album and wardrobe), silly (gadgets on the tree; in a raid: stop inside the replay),
//       page2 (the gadget page of the palette), cert, players (the two panels of the badge screen), wink (moon and rooms tapped),
//       p2, p3 (second and third panel of a story; flag is the rank), try (an unowned hat tried on in the wardrobe),
//       scene saga: flag is the chapter, p2 and p3 as for a story, sagaend (after chapter 3: the Baron's present),
//       flagdemo (a test pattern on the treehouse flag, items on spots 19 and 21), flagask (the owl asks before the flag starts again),
//       hello, bdayhello, supper (scene hub, flag 1: the day's first words, on a birthday, after a good day's fishing),
//       bdayset (the grown-ups' birthday setting), lit (the end of a Night without a lost jar: a lantern),
//       spring, summer, autumn, winter (that season, clear weather), rain, wind, snow (summer rain, autumn wind, winter snow),
//       wgifts (every gift, in winter with snow falling),
//       grow1, grow2, grow3 (the treehouse's additions), grownews (scene hub, flag 1: the owl tells of the swing),
//       growjoke (the additions' jokes, mid-way; with grow3), visit (today's visitor with an open wish), visitask (its dialog
//       open), visitno (a wrong gift chosen), visityes (the wish granted, the thank-you), visitdone (the visitor happy, wish
//       granted), visicons (every wish and gift picture), bday (the player's birthday, without the day's first words),
//       spots (items on spots 0, 3 and 6; the Tinker adds 4, 20 and 21). Poses may be joined with '+': gifts+grow3+visit
//       pals3 (three friends, the second helps), paltap (the same, the helper just tapped), pals6 (all six friends and the
//       Baron's card), palspots (items on the spots beside the friends' perches: 0, 3, 4, 6, 9, 10, 17, 18), palnews (30 kind
//       catches and no friend: scene hub, flag 1 shows the owl's news): gifts+pals6+palspots,
//       tricks (a raid with every trick of Nights 9 to 30, mid-way), gadgets (each trick as it meets its gadget), page3 (the
//       palette's third page), arcgifts (the new gadgets on the tree with every gift)
// smoke and audit POST progress lines and one final report to the server in test/smoke.js.
(async () => {
  const mode = location.hash.slice(1).split(','), run = +new URLSearchParams(location.search).get('run') || 0;
  const out = { run, errors: [] }, seen = new Set();
  seaForce = { m: 6, w: 'clear' };   // the tests run in a clear summer, whatever the calendar says, so that pictures and raids stay the same all year
  const bad = s => { if (!seen.has(s)) { seen.add(s); out.errors.push(s); } };
  let where = 'start';
  window.onerror = (m, s, l, c, e) => { bad(`SCRIPT ERROR at [${where}]: ${m} @${l}:${c} ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' < ') : ''}`); };
  window.addEventListener('unhandledrejection', e => bad('rejection: ' + (e.reason && e.reason.stack || e.reason)));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const post = o => fetch('/', { method: 'POST', body: JSON.stringify(Object.assign({ run }, o)) });
  const note = s => post({ progress: s });
  const check = (ok, msg) => { if (!ok) bad('ASSERT ' + msg); };
  // Simulated time: logic every step, drawing every 12th step (drawing is the slow part in a headless browser).
  const sim = (sec, each) => { for (let i = 0; i < sec * 30; i++) { V.t += 1 / 30; if (scene.update) scene.update(1 / 30); if (i % 12 === 0 || mode[0] === 'shot') { scene.draw(1 / 30); drawFx(1 / 30); drawPortrait(); } if (each && each() === false) break; } };
  const clickDlg = (i = -1) => { const b = [...document.querySelectorAll('.veil .acts .btn')]; if (!b.length) return false; b[i < 0 ? b.length - 1 : i].click(); return true; };
  const waitDlg = async label => { for (let i = 0; i < 100; i++) { if (scene.rp) scene.skip(); if ($('.veil')) return true; await sleep(50); } bad('no dialog: ' + label); return false; };   // a replay is skipped: tests do not wait in real time
  // The grown-up question ("6 + 7 = ?"): press the right answer, or a wrong one.
  const answer = right => { const [a, b] = $('#owlText').textContent.match(/\d+/g).map(Number); [...document.querySelectorAll('.veil .acts .btn')].find(x => (+x.textContent === a + b) === right).click(); };
  const reset = n => { Object.assign(S, { night: n, st: { cam: 0, gate: 0, forge: 0, extra: 0 }, beams: 300, stars: 0, items: [{ t: 'cam', m: 1 }], nest: 0, testStar: 0, gateStar: 0, briefed: n, promo: false, tinkered: 2, name: 'Mia',
    voice: true, stk: {}, own: {}, hat: '', scarf: '', zhat: '', zscarf: '', boss: 0, fooled: 0, day: 0, gifts: {}, bedN: 0, bed: { d: '', n: 0, more: 0 },
    // the newer things start quiet: no news of a friend (a Chief already has the guard), no visitor's wish today, the day's first words already said
    caught: 0, pals: n > 7 ? { guard: 1 } : {}, helper: '', lit: 0, grow: 0, visit: { d: today(), done: 1, n: 0 }, mem: { d: '', k: '' }, memD: today(), eye: 0, flag: '', bday: '', bdayY: 0, sup: '', saga: 0 });
    tryOn = null; scenes.tinker.page = 0; };
  const worth = () => S.beams + S.items.reduce((a, i) => a + ITEMS[i.t].cost, 0);   // moonbeams in hand plus moonbeams built into the tree
  const key = (k, target = document.body) => target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  const ptr = (type, x, y, target = cv) => target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true, pointerId: 1 }));
  const tOrig = t;
  t = (k, v) => { if (!L[k]) bad('missing i18n key ' + k); return tOrig(k, v); };
  // The owl's eye at the gate: no button without an eye; a look between visitors is free; a look at a visitor costs the
  // eye, rings the right check for every kind of trickster (the badge first) and takes the button away.
  const eyeChecks = () => {
    const other = (list, not) => list.find(x => !not.includes(x));
    const cases = { shape: v => { v.badge.shape = other(SHAPE_KEYS, [v.badge.shape]); }, style: v => { v.badge.style = (v.badge.style + 1) % 4; }, lost: v => { v.badge = null; },
      both: v => { v.badge.shape = other(SHAPE_KEYS, [v.badge.shape]); v.pass[1] = other(GSYM, v.pass); }, pic: v => { v.pass[2] = other(GSYM, v.pass); },
      order: v => { [v.pass[0], v.pass[1]] = [v.pass[1], v.pass[0]]; }, short: v => { v.pass.pop(); }, friend: () => {} };
    const want = { shape: 'badge', style: 'badge', lost: 'badge', both: 'badge', pic: 'pass', order: 'pass', short: 'pass', friend: 'ok' };
    reset(5); go('gate'); clickDlg(); check(!$('#bEye'), 'no eye button without an eye');
    for (const k in cases) {
      reset(5); S.eye = 1; go('gate'); clickDlg(); check(!!$('#bEye'), 'an eye brings its button');
      $('#bEye').click(); check(S.eye === 1 && !!$('#bEye'), 'a look between visitors does nothing and costs nothing');
      sim(2, () => scene.state !== 'ask');
      const v = scene.q[scene.i]; Object.assign(v, { friend: k === 'friend', pass: [...scene.pass], badge: { ...scene.badge } }); cases[k](v);
      $('#bEye').click();
      check(v.eye === want[k] && S.eye === 0 && !$('#bEye'), `the owl's eye on a ${k} visitor marks the ${want[k]}: got ${v.eye}, eyes left ${S.eye}`);
    }
  };
  // The treehouse's additions and today's visitor (src/46-life.js).
  const lifeChecks = () => {
    where = 'treehouse life';
    check([59, 60, 119, 120, 199, 200].map(n => { S.stars = n; return growLevel(); }).join() === '0,1,1,2,2,3', 'the treehouse grows at 60, 120 and 200 stars');
    reset(3); S.stars = 125; go('hub'); check(!!$('.veil.clear') && $('#owlText').textContent === t('grow_0') && S.grow === 1, 'the owl tells of the swing first');
    clickDlg(); go('hub'); check(!!$('.veil') && $('#owlText').textContent === t('grow_1') && S.grow === 2, 'then of the flower garden');
    clickDlg(); go('hub'); check(!$('.veil') && S.grow === 2, 'each addition is told once, and only when its stars are there');
    S.grow = 3; S.bday = today().split('-').slice(1).join('-'); go('home'); const TG = treeArea();
    [[785, 405], [400, 222], [155, 395]].forEach(([x, y], i) => check(growTap(x, y, TG) && V.t - lifeT[i] < .1, 'addition ' + i + ' answers a tap'));
    check(growTap(385, 290, { k: .39, ox: 0, oy: 0 }), 'on a phone the garden answers a tap within 24 px of a window box (a target of 48 px)');
    sim(3);   // the additions, their jokes and the birthday are drawn (a script error would be reported by the page)
    where = 'today\'s visitor';
    reset(1); S.visit = { d: '', done: 0, n: 0 }; go('hub'); check(!visitTap(500, 300, treeArea()) && !$('.veil'), 'no visitor on Night 1');
    const day = String(lifeDay(today())); check(String(lifeDay(today())) === day, 'the visitor of a day is the same on every call that day');
    let fewest = 99; for (let s = 1; s < 366; s++) fewest = Math.min(fewest, new Set([...Array(10)].map((_, i) => String(lifeDay('2026-1-' + (s + i))))).size);
    check(fewest >= 4, 'any ten days in a row bring at least four different visits (visitor and wish): ' + fewest);
    reset(3); S.visit = { d: '', done: 0, n: 0 }; go('hub'); const b0 = S.beams;
    check(visitTap(500, 300, treeArea()) && document.querySelectorAll('.veil .card').length === 3, 'a tap on the visitor opens its wish with three gifts');
    const right = LIFE_WISH[lifeDay(today())[1]][1], cards = [...document.querySelectorAll('.veil .card')], s0 = JSON.stringify(S);
    cards.find(b => b.dataset.k !== right).click();
    check(JSON.stringify(S) === s0 && $('#owlText').textContent === t('vis_no') && document.querySelectorAll('.veil .card').length === 3, 'a wrong gift changes nothing, and the wish stays open');
    const good = cards.find(b => b.dataset.k === right); good.click();
    check(S.beams === b0 + 5 && S.visit.d === today() && S.visit.done === 1 && S.visit.n === 1 && $('#pBeams b').textContent === String(b0 + 5), 'the right gift grants the wish: five moonbeams');
    good.click(); clickDlg(); check(S.beams === b0 + 5 && visitTap(500, 300, treeArea()) && !$('.veil'), 'a wish pays once; then the visitor only jumps for joy');
    S.visit.d = '2000-1-1'; check(lifeNow().open, 'a new day brings a new wish, and a missed day loses nothing');
    try { for (const g of [null, 'x', 7, [], { d: 5, done: 'yes', n: 'many' }, { d: today(), done: 1, n: -4 }]) { S.visit = g; visitTree(ctx, treeArea(), V.t); if (visitTap(500, 300, treeArea()) && closeDlg) closeDlg(); } }
    catch (e) { check(false, 'garbage in S.visit must not throw: ' + e); }
  };
  // Friends (src/57-pals.js): who comes when, who helps, the Friends page, and a save that holds nonsense.
  const palChecks = () => {
    reset(4); S.caught = 24; check(palDue() === '', 'no friend before 25 kind catches');
    PAL_AT.forEach((n, i) => { S.pals = Object.fromEntries(PALS.slice(0, i).map(id => [id, 1])); S.caught = n - 1; const a = palDue(); S.caught = n; check(a === '' && palDue() === PALS[i], `friend ${i + 1} comes at ${n} kind catches, got '${a}' then '${palDue()}'`); });
    S.pals = {}; S.caught = 999; const got = []; for (let id = palDue(); id && got.length < 9; id = palDue()) { got.push(id); S.pals[id] = 1; }
    check(got.join() === PALS.join(), 'friends come in their order: ' + got);
    reset(8); S.pals = {}; check(palDue() === 'guard', 'at the top rank the guard comes at once, without kind catches'); S.pals = { baker: 1 }; check(palDue() === '', 'only while there is no friend yet');
    reset(3); S.caught = 30; go('hub');
    check(!!$('.veil.clear') && S.pals.guard === 1 && S.helper === 'guard' && $('#owlText').textContent === t('pal_hi_guard') + ' ' + t('pal_do_guard'), 'a new friend is introduced at the Night menu and helps at once');
    clickDlg(); go('hub'); check(!$('.veil') && Object.keys(S.pals).join() === 'guard', 'a friend is introduced once');
    for (const h of ['', 'baron', 'constructor', 'baker', 7, null, {}]) { S.helper = h; check(palPerk() === '' && palPill() === '', 'no help from a helper who is not a friend: ' + JSON.stringify(h)); }
    S.pals.lamp = 1; S.helper = 'lamp'; check(palPerk() === 'lamp' && palPill().includes(t('pal_p_lamp')), 'the helper brings its help');
    for (const [p, h] of [[null, 'guard'], ['guard', 'lamp'], [[1, 2], {}], [{ constructor: 1, guard: 'yes', zz: 1 }, 'zz'], [7, 7], [{ guard: 1, music: 1 }, undefined]]) {
      Object.assign(S, { pals: p, helper: h }); let ok = '';
      try { const T = treeArea(); palsTree(ctx, T, 1); palPill(); palPerk(); palTap(745, 900, T); palDue(); go('pals', { from: 'album' }); sim(.2); go('home'); sim(.2); } catch (e) { ok = String(e); }
      check(!ok, 'nonsense in the friends\' save breaks nothing: ' + JSON.stringify([p, h]) + ' ' + ok);
    }
    reset(3); Object.assign(S, { pals: { guard: 1, baker: 1 }, helper: 'guard' }); go('pals', { from: 'album' });
    check(document.querySelectorAll('.stk.none').length === 4 && !$('[data-pal="baron"]') && $('[data-pal="guard"]').getAttribute('aria-pressed') === 'true', 'Friends page: two friends, four question marks, the helper marked, no Baron yet');
    $('[data-pal="baker"]').click(); check(S.helper === 'baker' && $('[data-pal="baker"]').getAttribute('aria-pressed') === 'true' && $('[data-pal="guard"]').getAttribute('aria-pressed') === 'false', 'a friend\'s card makes it the helper');
    $('.stk.none').click(); check(S.helper === 'baker', 'a question mark changes nothing');
    S.saga = 3; go('pals', { from: 'album' }); $('[data-pal="baron"]').click(); check(S.helper === 'baker' && !$('[data-pal="baron"]').hasAttribute('aria-pressed'), 'the Baron has a card but never helps');
    $('#palBack').click(); check(scene.id === 'album', 'the Friends page leads back to the album, got ' + scene.id);
    reset(8); go('pals', { from: 'album' });   // a Chief's guard came with the rank, without kind catches: the next friend still needs 60
    check($('.hud [role="img"]').getAttribute('aria-label') === t('pal_count', { n: 0, m: 60 }), 'the Friends page names the catches that bring the next friend: ' + $('.hud [role="img"]').getAttribute('aria-label'));
    reset(3); Object.assign(S, { pals: { guard: 1, baker: 1 }, helper: 'guard' }); go('home'); const TH = treeArea();
    scene.down(TH.ox + 745 * TH.k, TH.oy + 895 * TH.k); check(V.t - (palT.guard || -9) < .1, 'the helper answers a tap');
    for (const g of GIFTS) S.gifts[g] = 1; palT.guard = -9; scene.down(...giftAt('heron', TH)); check(V.t - (giftT.heron || -9) < .1 && palT.guard === -9, 'the heron beside the helper still answers its own tap');
    const TS = { k: .32, ox: 0, oy: 17 }; check(!palTap(690, 917, TS) && palTap(760, 905, TS), 'on a phone held sideways the heron keeps its taps and the helper its own');   // there the two tap circles overlap
  };

  if (mode[0] === 'shot') {
    // a screenshot shows the final state of dialogs and toasts, not the first frame of their pop-in
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '*, *::before { animation: none !important; transition: none !important; }' }));
    reset(+mode[2] || 1); setLang(+mode[3] || 0);
    const P = (mode[6] || '').split('+');   // poses may be joined: gifts+grow3+visit
    if (mode[1] === 'hub' && mode[4] === '1') S.briefed = 0;
    if (mode[1] === 'tinker' || mode[1] === 'raid') S.items.push({ t: 'lamp', m: 4 }, { t: 'bell', m: 15 }, { t: 'shield', m: VAULT }, { t: 'banner', m: 18 }, { t: 'flowers', m: 20 }, { t: 'lights', m: 19 }, { t: 'scope', m: 21 });
    if (mode[6] === 'silly' || mode[6] === 'replay') S.items = [{ t: 'peel', m: 0 }, { t: 'tramp', m: 2 }, { t: 'tickle', m: 1 }, { t: 'disco', m: 4 }, { t: 'bubbler', m: 5 }, { t: 'cannon', m: 3 }, { t: 'cam', m: 12 }];
    if (mode[6] === 'some') { for (const id of ['m1', 'm3', 'm6', 'd2', 'd4', 'd5', 't1', 't2', 't4', 't5', 't7', 't9', 't12']) S.stk[id] = id === 't4' || id === 'm6' ? 1 : 2; Object.assign(S.own, { wizard: 1, stripe: 1, party: 1 }); Object.assign(S, { hat: 'wizard', scarf: 'stripe', zhat: 'party' }); }
    if (P.includes('gifts') || P.includes('arcgifts') || mode[6] === 'tapgifts' || mode[6] === 'wgifts') { for (const id of GIFTS) S.gifts[id] = 1; S.items.push({ t: 'lamp', m: 15 }, { t: 'bell', m: 16 }); }   // with something on both ground spots, to see that nothing collides
    if (mode[6] === 'fewgifts') Object.assign(S.gifts, { heron: 1, lanternjaw: 1, bell: 1, wave: 1 });   // gifts come in any order: these four without the pond and the rest
    if (mode[6] === 'flagdemo') { S.flag = [...Array(96)].map((_, n) => (n % 12 + (n / 12 | 0)) % 8).join(''); if (!S.items.some(it => it.m === 19)) S.items.push({ t: 'lights', m: 19 }, { t: 'scope', m: 21 }); }   // a diagonal rainbow
    if (mode[6] === 'news') localStorage.setItem('firstlight.v1', JSON.stringify({ log: { biscuit: { n: 1 } } }));
    if (mode[6] === 'hello') { S.memD = ''; S.mem = { d: today(), k: 'laugh' }; }                                // the day's first words
    if (mode[6] === 'bdayhello') { S.memD = ''; S.bday = today().split('-').slice(1).join('-'); }                 // on the birthday
    if (mode[6] === 'supper') localStorage.setItem('firstlight.day', JSON.stringify({ id: 1, n: 4 }));            // after a good day's fishing
    const sea = { spring: { m: 3, w: 'clear' }, summer: { m: 6, w: 'clear' }, autumn: { m: 9, w: 'clear' }, winter: { m: 0, w: 'clear' }, rain: { m: 6, w: 'rain' }, wind: { m: 9, w: 'wind' }, snow: { m: 0, w: 'snow' }, wgifts: { m: 0, w: 'snow' } };
    for (const p of P) if (has(sea, p)) seaForce = sea[p];   // seasons and weather (src/47-season.js): a month and tonight's weather
    if (mode[6] === 'eye' || mode[6] === 'eyeuse') S.eye = 1;
    if (mode[6] === 'eyepass' || mode[6] === 'eyeok' || mode[6] === 'eyelost') S.eye = 2;   // two eyes: after one look the button is still there, beside the mark
    for (const p of P) if (/^grow[1-3]$/.test(p)) Object.assign(S, { grow: +p[4], stars: LIFE_AT[p[4] - 1] });   // the treehouse's additions (src/46-life.js)
    if (P.includes('growjoke')) Object.assign(S, { grow: 3, stars: 200 });
    if (P.includes('grownews')) Object.assign(S, { grow: 0, stars: 60 });
    if (P.some(p => p.startsWith('visit'))) Object.assign(S, { night: Math.max(2, S.night), briefed: Math.max(2, S.night), visit: { d: P.includes('visitdone') ? today() : '', done: +P.includes('visitdone'), n: 0 } });
    if (P.includes('bday')) S.bday = today().split('-').slice(1).join('-');
    if (P.includes('spots')) S.items.push({ t: 'lamp', m: 0 }, { t: 'cam', m: 3 }, { t: 'tramp', m: 6 });
    if (P.includes('pals3') || P.includes('paltap')) Object.assign(S, { pals: { guard: 1, baker: 1, lamp: 1 }, helper: 'baker', caught: 130 });   // friends (src/57-pals.js)
    if (P.includes('pals6')) Object.assign(S, { pals: Object.fromEntries(PALS.map(id => [id, 1])), helper: 'guard', caught: 333, saga: 3 });
    if (P.includes('palspots')) S.items.push({ t: 'cam', m: 0 }, { t: 'lamp', m: 3 }, { t: 'bell', m: 4 }, { t: 'flowers', m: 6 }, { t: 'cam', m: 9 }, { t: 'scope', m: 10 }, { t: 'banner', m: 17 }, { t: 'lights', m: 18 });
    if (P.includes('palnews')) Object.assign(S, { caught: 30, pals: {} });
    if (P.includes('tricks') || P.includes('page3')) Object.assign(S, { pals: { guard: 1, lamp: 1 }, helper: 'lamp' });   // the helper's pill is in the top bars
    go(mode[1], mode[1] === 'badge' ? { promo: mode[4] === '1', told: true } : mode[1] === 'raid' ? { test: true } : mode[1] === 'story' ? { rank: +mode[4] || 1, then: () => go('home') } : mode[1] === 'boss' ? { then: () => go('hub') } : mode[1] === 'saga' ? { ch: +mode[4] || 1, then: () => go('hub') } : undefined);
    localStorage.removeItem('firstlight.v1'); localStorage.removeItem('firstlight.day');
    if (mode[4] !== '1') clickDlg();
    if (mode[1] === 'forge') [0, 1, 2, 6, 9].forEach(i => $('#fTray').children[i].click());
    if (mode[1] === 'tinker' && mode[4] === '2') { scene.hand = 'cam'; scene.marks(); }
    sim(+mode[5] || 4, mode[1] === 'gate' ? () => scene.state !== 'ask' : mode[1] === 'raid' && mode[6] === 'silly' ? () => !scene.R.puffs.some(p => p.n > 1) : null);
    const pose = {
      stolen: () => { scene.stolen = 2; },
      cut: () => { const i = scene.q.findIndex(v => !v.friend); scene.i = i; scene.state = 'ask'; scene.let = 1; scene.decide(true); sim(2.3); },
      oldest: () => { scene.tiles = [...scene.tray.filter(x => x.k === 'w').slice(0, 5), scene.tray.find(x => x.k === 'n'), scene.tray.find(x => x.k === 's')]; scene.refresh(); },
      costume: () => { const i = scene.q.findIndex(v => v.costume !== undefined); if (i >= 0) { scene.i = i; scene.state = 'ask'; scene.at = V.t; } },
      cap: () => { const i = scene.q.findIndex(v => !v.friend && v.costume === undefined); scene.q[i].disguise = 4; scene.i = i; scene.state = 'ask'; scene.at = V.t; },
      win: () => { newStk = 't4'; S.stk.t4 = 1; stationWin(scene.id, 3, 3, mode[1] === 'forge' ? t('forgeWin') : '', mode[1] === 'forge' ? scene.goalsHtml([true, true, false]) : ''); },
      page2: () => $('#tPage').click(),
      cert: () => showCert(),
      players: () => showPlayers(),
      wink: () => { winkT = V.t - .3; roomT[1] = V.t - .9; roomT[2] = V.t - .6; roomT[3] = V.t - .7; scatterT = V.t - 1; },
      p2: () => { sim(.5); scene.next(); sim(1.5); },
      p3: () => { sim(.5); scene.next(); sim(.5); scene.next(); sim(1.5); },
      try: () => scene.tap('crown'),
      sagaend: () => { for (let i = 0; i < 3; i++) { sim(.5); scene.next(); } sim(.5); },
      replay: () => { sim(60, () => !scene.endT); scene.rewind(); sim(1.2); },
      tapgifts: () => { for (const id of GIFTS) giftT[id] = V.t - .35; },
      bedset: () => { showPlayers(); $('#wBed').click(); answer(true); },
      bdayset: () => { showPlayers(); $('#wBday').click(); answer(true); },
      flagask: () => $('#flagNew').click(),
      // the owl's eye at the gate: used on the first trickster; on one whose badge is right but whose pictures are swapped; on a friend; on a lost badge
      eyeuse: () => { scene.i = scene.q.findIndex(v => !v.friend); scene.state = 'ask'; scene.at = V.t; $('#bEye').click(); },
      eyepass: () => { const v = scene.q.find(q => !q.friend); Object.assign(v, { badge: { ...scene.badge }, pass: [scene.pass[1], scene.pass[0], scene.pass[2]] }); scene.i = scene.q.indexOf(v); scene.state = 'ask'; scene.at = V.t; $('#bEye').click(); },
      eyeok: () => { scene.i = scene.q.findIndex(v => v.friend); scene.state = 'ask'; scene.at = V.t; $('#bEye').click(); },
      eyelost: () => { const v = scene.q.find(q => !q.friend); v.badge = null; scene.i = scene.q.indexOf(v); scene.state = 'ask'; scene.at = V.t; $('#bEye').click(); },
      lit: () => { finishNight(0); },
      visitask: () => visitTap(500, 300, treeArea()),
      visitno: () => { visitTap(500, 300, treeArea()); [...document.querySelectorAll('.veil .card')].find(b => b.dataset.k !== LIFE_WISH[lifeNow().wish][1]).click(); },
      visityes: () => { visitTap(500, 300, treeArea()); [...document.querySelectorAll('.veil .card')].find(b => b.dataset.k === LIFE_WISH[lifeNow().wish][1]).click(); },
      growjoke: () => { lifeT.fill(V.t - 1); lifeWho = 2; },
      visicons: () => modal(LIFE_WISH.map(w => `<div class="pics">${w.map((id, j) => j ? `<span class="pill">${ic(lifeIc(id), 44)}${esc(t('vis_' + id))}</span>` : `<span class="pill" style="background:#fff6da">${ic(id, 44)}</span>`).join('')}</div>`).join(''), 'icons'),
      paltap: () => { const T = treeArea(); scene.down(T.ox + 745 * T.k, T.oy + 895 * T.k); sim(.2); },
      // tricks (src/91-arc.js): every trick at once, mid-way (a second digger already inside the trunk); each trick at the
      // moment it meets its gadget; the palette's third page; the new gadgets on the tree with every gift (collision test)
      tricks: () => { go('raid', { test: true }); scene.plan = [{ route: 'sky', at: 0, kind: 'balloon' }, { route: 'rb', at: 0, kind: 'stilts' }, { route: 'lb', at: 0, kind: 'twins' }, { route: 'lad', at: 0, kind: 'dig' }, { route: 'lad', at: 0, kind: 'dig' }]; scene.R = makeRaid(scene.plan, 1); scene.R.mags[4].d = 340; sim(1.6); },
      gadgets: () => { S.items = [{ t: 'fan', m: 20 }, { t: 'honey', m: 9 }, { t: 'seesaw', m: 6 }, { t: 'drum', m: 14 }]; go('raid', { test: true }); scene.plan = [{ route: 'sky', at: 1.23, kind: 'balloon' }, { route: 'rb', at: 1.98, kind: 'stilts' }, { route: 'lb', at: 2.07, kind: 'twins' }, { route: 'lad', at: .45, kind: 'dig' }]; scene.R = makeRaid(scene.plan, 1); sim(3.3); },
      page3: () => { go('tinker'); $('#tPage').click(); $('#tPage').click(); },
      arcgifts: () => S.items.push({ t: 'fan', m: 20 }, { t: 'honey', m: 2 }, { t: 'seesaw', m: 6 }, { t: 'drum', m: 14 }, { t: 'fan', m: 21 }),
    };
    for (const p of P) if (has(pose, p)) { pose[p](); sim(.1); }
    return;
  }

  async function smoke() {
    // --- sound code paths (the context may stay suspended without a real tap; node creation still runs) ---
    where = 'sound'; audioOn(); for (const k in sfx) sfx[k](1); musicTick(); setMute(true); setMute(false);
    // --- pure logic ---
    where = 'logic';
    for (const k in L) check(L[k].length === 3 && L[k].every(s => typeof s === 'string' && s.length), 'i18n row ' + k);
    setLang(1); check(plural('u_d', 1) === '1 день' && plural('u_d', 2) === '2 дня' && plural('u_d', 5) === '5 дней' && plural('u_d', 21) === '21 день', 'ru plurals ' + plural('u_d', 21));
    setLang(2); check(plural('u_d', 1) === '1 giorno' && plural('u_d', 3) === '3 giorni', 'it plurals');
    setLang(0); check(crackLabel(1) === '1 second' && crackLabel(3600) === '1 hour' && crackLabel(OLDEST + 1) === t('oldest'), 'crack labels');
    const W = v => ({ k: 'w', v }), N = { k: 'n', v: '7' }, Y = { k: 's', v: '!' };
    check(crackSeconds([W('a')]) === 1, 'one word = 1 second');
    check(crackSeconds([W('a'), W('b')]) > crackSeconds([N, Y, N, Y, N]), 'long beats complicated');
    check(crackSeconds([W('a'), W('a'), W('a')]) < crackSeconds([W('a'), W('b')]), 'repeats are weak');
    check(crackSeconds([W('a'), W('b'), W('c'), N, Y]) >= 100 * YEAR, 'recipe reaches centuries');
    FORGE_LV.forEach(([goal, few], i) => check(crackSeconds([W('a'), W('b'), W('c'), N, Y].concat(i === 6 ? [W('d')] : [])) >= goal && (i === 6 ? 6 : 5) <= few, 'forge level ' + i + ' allows 3 stars'));
    for (let n = 1; n <= 9; n++) for (let r = 0; r < 40; r++) {
      const pass = ['moon', 'berry', 'star'], badge = { shape: 'leaf', style: 0 };
      for (const v of gateQueue(n, pass, badge)) {
        const same = v.badge && v.badge.shape === 'leaf' && v.badge.style === 0 && v.pass.join() === pass.join();
        check(v.friend === !!same, `gate visitor consistency night ${n}: ${JSON.stringify(v)}`);
      }
    }
    // looks must not decide at the gate: from Night 4 some tricksters arrive inside an animal costume
    for (let n = 1; n <= 9; n++) check(gateQueue(n, ['moon', 'berry', 'star'], { shape: 'leaf', style: 0 }).some(v => !v.friend && v.costume !== undefined) === (n >= 4), 'costumed tricksters on night ' + n);
    // a guarded design stops the Night 1 raid; an empty one loses jars
    reset(1); S.items = [{ t: 'cam', m: 1 }, { t: 'cam', m: 4 }, { t: 'bell', m: 15 }];
    let R = makeRaid(raidPlan(1, { cam: 1, gate: 1, forge: 1 }), 0); while (!R.done) stepRaid(R, 1 / 30);
    check(R.stolen === 0 && !Object.keys(R.reached).length, 'guarded raid should be clean: ' + JSON.stringify(R.reached));
    S.items = []; R = makeRaid(raidPlan(1, { cam: 1, gate: 1, forge: 1 }), 0); while (!R.done) stepRaid(R, 1 / 30);
    check(R.stolen > 0 && R.stolen <= 3, 'unguarded raid should lose 1-3 jars: ' + R.stolen);
    check(observe(R) === t('o_none'), 'observation for empty design');
    reset(3); S.items = []; R = makeRaid(raidPlan(3, { cam: 1, gate: 1, forge: 1 }), 0); while (!R.done) stepRaid(R, 1 / 30);
    check(R.stolen === 3 && R.mags.every(m => !m.carry), `raid cap and jar count: stolen ${R.stolen}, still carrying ${R.mags.filter(m => m.carry).length}`);
    // the language birds differ in shape (cap, crest), not only in colour
    const dot = (i, x, y) => { const cnv = document.createElement('canvas'); cnv.width = cnv.height = 40; const g = cnv.getContext('2d'); drawIcon(g, 'bird:' + i, 20, 20, 40); return g.getImageData(x, y, 1, 1).data; };
    check(dot(1, 26, 8).join() !== dot(0, 26, 8).join() && dot(2, 24, 3)[3] > 0 && dot(0, 24, 3)[3] === 0, 'language birds have their own cap and crest');
    await note('logic checks done, problems so far: ' + out.errors.length);

    // --- every menu screen in every language ---
    for (let l = 0; l < 3; l++) { setLang(l); for (const s of ['home', 'hub', 'badge']) { where = s; reset(1); S.briefed = 0; go(s); sim(1); clickDlg(); sim(.5); } }
    setLang(0); go('home'); scene.down(V.w / 2, V.h / 2); $('#bSnd').click(); $('#bSnd').click(); $('[data-l="2"]').click(); $('[data-l="0"]').click();

    // --- silly gadgets: three antics send a magpie home, antics close together are a chain, and a raid is the same every time ---
    where = 'gadgets';
    reset(1); S.items = [{ t: 'peel', m: 0 }, { t: 'tickle', m: 1 }, { t: 'disco', m: 2 }, { t: 'peel', m: 3 }, { t: 'tickle', m: 4 }, { t: 'bubbler', m: 5 }];
    const prankRaid = () => { const q = makeRaid(raidPlan(1, { cam: 1, gate: 3, forge: 1 }), 0); while (!q.done) stepRaid(q, STEP); return q; };
    const g1 = prankRaid(), g2 = prankRaid();
    check(g1.fun.length >= 6 && g1.laughed === g1.mags.length && !Object.keys(g1.reached).length && g1.stolen === 0, `three gadgets on each branch send every magpie home laughing: ${JSON.stringify([g1.fun.length, g1.laughed, g1.reached])}`);
    check(g1.fun.some(f => f.w > 1), 'gadgets close together make a chain');
    check(JSON.stringify(g1.fun) === JSON.stringify(g2.fun), 'the same design gives the same raid twice (the replay relies on it)');
    check(observe(g1) === t('o_silly'), 'the owl praises a silly defence');
    const g3 = makeRaid([{ route: 'lt', at: 0 }], 0), m3 = g3.mags[0]; m3.state = 'back'; m3.carry = true; prank(g3, m3, { t: 'tickle', x: 0, y: 0, r: 50 }, 0, 0);
    check(!m3.carry && m3.state === 'sulk' && m3.fx.k === 'giggle', 'a magpie that is tricked drops the jar it carried');
    // --- Nights 9 to 30: tricksters and the gadgets that answer them (src/91-arc.js) ---
    where = 'tricks';
    const plan8 = (n, st) => {   // raidPlan as it was before version 3: Nights 1 to 8 must not change
      const routes = n <= 2 ? ['lt', 'rt'] : n <= 4 ? ['lt', 'rt', 'lb', 'rb'] : ['lt', 'rt', 'lb', 'rb', 'sky'];
      const branch = Math.min(Math.ceil(n / 2) + (3 - st.cam), 7), gate = Math.min(3 - st.gate + (n >= 4 ? 1 : 0), 3), list = [];
      let at = 1;
      for (let i = 0; i < branch; i++) { list.push({ route: routes[((n >= 6 ? i >> 1 : i) + n) % routes.length], at }); at += n >= 4 && i % 2 === 0 ? (n >= 6 ? .9 : .3) : 3.2; }
      for (let i = 0; i < gate; i++) list.push({ route: 'lad', at: 2 + i * 3.5 });
      return list.sort((a, b) => a.at - b.at);
    };
    for (let n = 1; n <= 8; n++) for (let i = 0; i < 64; i++) { const st = { cam: i & 3, gate: i >> 2 & 3, forge: i >> 4 }; check(JSON.stringify(raidPlan(n, st)) === JSON.stringify(plan8(n, st)), `the plan of Night ${n} is as before: ${JSON.stringify(st)}`); }
    const ST3 = { cam: 3, gate: 3, forge: 3 }, design = d => d.map(([t, m]) => ({ t, m }));
    const tricks = n => raidPlan(n, ST3).filter(p => p.kind).length;
    check([9, 10, 11, 12].every(n => tricks(n) >= 1 && tricks(n) <= 2) && [...Array(30)].every((x, i) => tricks(i + 1) <= 3 && (i < 8) === !tricks(i + 1)), 'tricksters: none before Night 9, one or two at first, never more than three');
    check(raidPlan(27, { cam: 0, gate: 0, forge: 0 }).length > raidPlan(27, ST3).length, 'better station results still mean fewer raiders');
    const raid = (n, items, st = ST3) => { reset(n); S.items = design(items); const q = makeRaid(raidPlan(n, st), st.forge - 1); while (!q.done) stepRaid(q, STEP); return q; };
    const P0 = palPerk, W0 = nightWeather, WX = [{ k: 'clear', slow: 0 }, { k: 'rain', slow: .15 }, { k: 'wind', slow: .1 }, { k: 'snow', slow: .2 }];
    const B1 = [['cam', 0], ['cam', 3], ['cam', 7], ['cam', 10], ['cam', 18], ['lamp', 1], ['lamp', 4], ['lamp', 8], ['lamp', 11], ['bell', 15], ['shield', 22]];
    const U = [['seesaw', 0], ['seesaw', 3], ['seesaw', 6], ['seesaw', 9], ['honey', 2], ['honey', 5], ['fan', 20], ['fan', 21], ['cam', 1], ['cam', 4], ['cam', 7], ['cam', 10], ['cam', 17],
      ['bell', 15], ['drum', 14], ['lamp', 8], ['lamp', 11], ['lamp', 12], ['lamp', 13], ['shield', 22]];
    for (const wx of WX) {   // in every weather (src/47-season.js)
      nightWeather = () => wx;
      // one sensible design without the new gadgets lets each new trick through on its first Night; its gadget stops it
      for (const [n, k, g] of [[9, 'balloon', ['fan', 20]], [13, 'stilts', ['honey', 9]], [17, 'twins', ['seesaw', 6]], [21, 'dig', ['drum', 14]]]) {
        const a = raid(n, B1), b = raid(n, B1.concat([g])), ta = a.mags.find(m => m.trick === k), tb = b.mags.find(m => m.trick === k);
        check(ta.reach && observe(a) === t('o_' + k), `Night ${n}, ${wx.k}: the ${k} gets in without a ${g[0]}, and the owl names it: ${observe(a)}`);
        check(!tb.reach && tb.home, `Night ${n}, ${wx.k}: a ${g[0]} sends the ${k} home`);
      }
      // three stars at every station and one design with every new gadget: Nights 9 to 30 are clean
      for (let n = 9; n <= 30; n++) { const q = raid(n, U); check(q.stolen === 0 && !Object.keys(q.reached).length, `Night ${n}, ${wx.k}: the full design keeps every jar: ${JSON.stringify(q.reached)}`); }
    }
    nightWeather = W0;
    // the same raid twice gives the same result (the replay relies on it), with twins that split and laugh
    const sum = q => JSON.stringify([q.t, q.stolen, q.laughed, q.fun, q.mags.map(m => [m.d, m.state, m.kind, m.n, m.home])]);
    check(sum(raid(17, B1)) === sum(raid(17, B1)) && sum(raid(27, U)) === sum(raid(27, U)) && raid(17, B1).mags.length > raidPlan(17, ST3).length, 'the same design gives the same raid twice');
    // the helper friend (src/57-pals.js) and the weather count in every raid
    const perk = p => { palPerk = () => p; reset(12); S.items = design([['cam', 1], ['bell', 15], ['lamp', 4], ['peel', 0], ['shield', VAULT]]); return makeRaid(raidPlan(12, ST3), 2); };
    const r0 = perk('');
    check(perk('guard').holds === 3 && perk('garden').shield === 2 && perk('baker').mags[0].at === r0.mags[0].at + 5 && perk('').holds === 2, 'helpers: the guard holds one more, the garden shields one more, the baker holds the first magpie back');
    check(perk('lamp').lamps[0].r === ITEMS.lamp.r * 1.2 && perk('music').toys[0].r === ITEMS.peel.r * 1.2 && perk('post').cams.every(d => Math.abs(d.cd0 - ITEMS[d.t].cd * .8) < 1e-9) && r0.cams.every(d => d.cd0 === ITEMS[d.t].cd), 'helpers: lantern, music and post');
    palPerk = P0; nightWeather = () => ({ k: 'wind', slow: .2 }); S.items = [];
    const w = makeRaid([{ route: 'lt', at: 0 }, { route: 'lt', at: 0, kind: 'balloon' }], 0);
    for (let i = 0; i <= 60; i++) stepRaid(w, i ? STEP : 0);
    check(Math.abs(w.mags[0].d - 136) < .5 && Math.abs(w.mags[1].d - 136 * .6) < .5, `weather: magpies slow down, a balloon drifts at 60% in the wind: ${w.mags[0].d}, ${w.mags[1].d}`);
    nightWeather = W0;
    // a real raid counts every magpie sent home kindly (both twins off the seesaw too); a test raid counts nothing
    reset(17); S.st = { cam: 3, gate: 3, forge: 3, extra: 0 }; S.items = design(U);
    go('raid', { test: true }); sim(60, () => !scene.endT); check(S.caught === 0, 'a test raid counts no catches');
    go('raid'); sim(60, () => !scene.endT);
    check(S.caught === scene.R.mags.length && scene.R.laughed === 2 && scene.R.mags.every(m => m.home), `a real raid counts the magpies sent home: ${S.caught} of ${scene.R.mags.length}`);
    // the raid scene itself on the first Night of the other tricks and on a mixed Night: played and drawn to its end, kept clean,
    // the Night counted and a lantern lit
    for (const n of [9, 13, 21, 30]) {
      reset(n); S.st = { cam: 3, gate: 3, forge: 3, extra: 0 }; S.items = design(U); go('raid'); sim(90, () => !scene.endT);
      check(!!scene.endT && scene.R.stolen === 0 && S.night === n + 1 && S.lit === 1 && S.caught > 0, `the raid of Night ${n} is played to its end and kept clean: stolen ${scene.R.stolen}, Night ${S.night}, caught ${S.caught}`);
    }
    // briefings, the palette's third page, and the drum only on the trunk or the ground
    check([1, 5, 8].every(n => arcBrief(n) === null) && [9, 13, 17, 21, 25].every(n => arcBrief(n).pics.length >= 2), 'briefings: none before Night 9, an introduction for every new trick');
    for (let n = 10; n <= 30; n++) check(/[.!?]$/.test(arcBrief(n).text) && arcBrief(n).pics.every(p => ICON[p.split(':')[0]]), 'a briefing line for Night ' + n);
    reset(8); check(!arcNew().length, 'no third page before Night 9'); reset(21); check(arcNew().length === 4 && scenes.tinker.free('drum').every(i => ITEMS.drum.at.includes(i)), 'all four gadgets by Night 21, the drum on the trunk or the ground');
    // every trick that a briefing names comes, on every Night and with every station result (also long after Night 30)
    for (let n = 9; n <= 120; n++) for (let i = 0; i < 16; i++) {
      const kinds = raidPlan(n, { cam: i & 3, gate: i >> 2, forge: 3 }).map(p => p.kind).filter(Boolean).sort().join();
      check(kinds === arcKinds(n).slice().sort().join(), `Night ${n} brings the tricks its briefing names: ${kinds}`);
    }
    // a real raid's replay is the same raid: it keeps its own Night's weather, although the Night has been counted by then
    seaForce = { m: 6 }; const wn = [...Array(40).keys()].find(n => n > 8 && nightWeather(n).k !== 'clear' && nightWeather(n + 1).k === 'clear');
    reset(wn); S.st = { cam: 3, gate: 3, forge: 3, extra: 0 }; S.items = design([['peel', 0], ['tramp', 2], ['tickle', 1], ['disco', 4], ['bubbler', 5], ['cannon', 3], ['cam', 12]]);
    go('raid'); sim(120, () => !scene.endT); const real = sum(scene.R);
    check(S.night === wn + 1 && scene.rewind() === true, `the raid of Night ${wn} (${nightWeather(wn).k}) has a replay`);
    const rq = scene.rp.R; while (!rq.done) stepRaid(rq, STEP);
    check(sum(rq) === real && rq.spd === scene.R.spd && rq.spd < 1, `the replay runs in the weather of its own Night: speed ${rq.spd} against ${scene.R.spd}`);
    scene.skip(); clickDlg(); seaForce = { m: 6, w: 'clear' };
    // --- album and wardrobe ---
    where = 'album and wardrobe';
    check(STK_SETS.flat().length === 24 && STK_SETS.flat().every(id => STK[id] && L['k_' + id]), 'every sticker has a picture and a name');
    reset(3); S.stk = { m1: 1, t3: 2 }; go('album'); check(document.querySelectorAll('.stk.new').length === 1, 'a new sticker is marked in the album');
    $('.stk[data-id="m1"]').click(); $('.stk.none').click(); $('[data-p="2"]').click(); check(scene.page === 2 && !!$('.stk[data-id="t3"]'), 'album tabs turn the page');
    go('home'); check(S.stk.m1 === 2 && !$('#bAlbum .dot'), 'a sticker is no longer new after the album was opened');
    for (const id of STK_SETS.flat()) S.stk[id] = 2; check(stickAny() === '', 'a full album gives no more stickers');
    go('wear'); const b0 = S.beams; scene.tap('crown'); check(tryOn && tryOn.hat === 'crown' && !S.own.crown, 'a hat can be tried on before buying');
    $('#wBuy').click(); check(S.own.crown === 1 && S.hat === 'crown' && S.beams === b0 - WEAR.crown.cost && !tryOn, 'buying a hat pays moonbeams and puts it on');
    scene.tap('crown'); check(S.hat === '', 'a worn hat comes off with a tap'); $('[data-w="zip"]').click(); scene.tap('crown'); check(S.zhat === 'crown' && S.hat === '', 'Zip can wear the same hat');
    S.beams = 0; scene.tap('rainbow'); $('#wBuy').click(); check(!S.own.rainbow, 'no moonbeams, no scarf'); go('home'); check(tryOn === null, 'leaving the wardrobe ends the trying-on');
    // --- certificate, players, secrets, speech ---
    where = 'certificate and players';
    const cc = certCanvas(); check(cc.width === 1400 && cc.getContext('2d').getImageData(40, 500, 1, 1).data[2] > 80, 'the certificate is painted');
    reset(3); go('badge'); $('#bCert').click(); check(!!$('.veil img.cert') && $('#cSave').download.endsWith('.png'), 'the certificate opens with a picture to save'); $('#cOk').click();
    $('#bWho').click(); check(document.querySelectorAll('.who').length === SLOTS && !!$('.who.me'), 'the players panel lists every slot and marks the current player');
    $('[data-del]').click(); check(document.querySelectorAll('.veil .acts .btn').length === 3, 'erasing a player asks a grown-up first');
    check(!document.activeElement || !document.activeElement.closest('.acts'), 'no answer of the grown-up question is in focus');
    answer(false); check(!!$('.who.me') && S.name === 'Mia', 'a wrong answer erases nothing and shows the players again');
    localStorage.setItem(slotKey(1), JSON.stringify({ name: 'Leo<b>', night: 4, stars: 9 })); localStorage.setItem('firstlight.v1.2', '{}'); showPlayers();
    check($('[data-go="1"]').textContent.includes('Leo<b>') && !$('[data-go="1"] b b'), 'another player is listed by name, as text');
    $('[data-del="1"]').click(); answer(true); check(!localStorage.getItem(slotKey(1)) && !!$('[data-new="1"]') && S.name === 'Mia', 'the right answer erases only that player');
    check(!localStorage.getItem('firstlight.v1.2'), 'an erased player\'s fishing career is erased too'); $('#wOk').click();
    reset(3); S.day = 1; go('home'); $('#bFish').onclick();
    check(S.day === 0 && $('#bFish').getAttribute('href') === 'fishing/index.html#day', 'the fishing button on the home screen is the day as well, and uses the pending day up');
    where = 'gifts, moon and bedtime';
    const newMoon = moonPhase(Date.UTC(2024, 0, 11, 11, 57)), fullMoon = moonPhase(Date.UTC(2024, 0, 25, 17, 54));
    check(Math.min(newMoon, 1 - newMoon) < .03 && Math.abs(fullMoon - .5) < .03, `the moon's phase matches a known new moon and a known full moon: ${newMoon.toFixed(3)}, ${fullMoon.toFixed(3)}`);
    check(moonWord(fullMoon).startsWith(t('moon2')) && moonWord(newMoon).startsWith(t('moon0')) && moonWord(.2).startsWith(t('moon1')) && moonWord(.8).startsWith(t('moon3')), 'the owl names the new, growing, full and shrinking moon');
    reset(3); go('home'); scene.down(...moonAt()); check([...document.querySelectorAll('.toast')].some(n => n.textContent === moonWord()), 'a tapped moon is named by tonight\'s real phase');
    // a Legendary caught by day: the owl tells the news once at the Night menu, then the gift belongs to the night
    reset(3); localStorage.setItem('firstlight.v1', JSON.stringify({ log: { aurora: { n: 1 }, perch: { n: 4 }, bell: { n: 0 } } }));
    go('hub'); check(!!$('.veil') && $('#owlText').textContent === t('gift_aurora') && S.gifts.aurora === 1, 'a Legendary caught by day brings its news to the Night menu');
    clickDlg(); go('hub'); check(!$('.veil') && Object.keys(S.gifts).join() === 'aurora', 'the news is told once, and only for a Legendary that was caught');
    localStorage.removeItem('firstlight.v1');
    for (const id of GIFTS) { S.gifts[id] = 1; const [gx, gy] = giftAt(id, treeArea()); check(gx >= 0 && gx <= V.w && gy >= 0 && gy <= V.h, `the gift ${id} is on the screen: ${gx | 0}, ${gy | 0}`); }
    go('home'); sim(2); go('hub'); sim(2); go('home');   // every gift is drawn (a script error would be reported by the page)
    const TG = treeArea(); scene.down(TG.ox + 752 * TG.k, TG.oy + 946 * TG.k); check(V.t - giftT.biscuit < .1, 'the pond answers a tap');
    // bedtime: after the last Night of the day the Night menu leads to bed; a grown-up can allow one more Night
    reset(3); S.bedN = 1; closeNight(0); S.promo = false; S.day = 0;
    go('hub'); check(scene.id === 'bed' && !!$('.veil'), 'after the last Night of the day the Night menu leads to bed, got ' + scene.id);
    check(JSON.parse(localStorage.getItem(SAVE)).mem.k === 'bed', 'bedtime is remembered in the save, for tomorrow\'s first words');
    clickDlg(); check(scene.id === 'home', 'good night leads home, got ' + scene.id); $('#bPlay').click(); check(scene.id === 'bed', 'Play at bedtime meets the sleepy owl again, got ' + scene.id);
    clickDlg(); let kept = 0; $('#bFish').onclick({ preventDefault() { kept = 1; } }); check(kept === 1 && scene.id === 'bed', 'the fishing sleeps at bedtime too');
    clickDlg(0); answer(false); check(scene.id === 'bed' && !!$('.veil'), 'a wrong answer to the sum keeps bedtime');
    clickDlg(0); answer(true); check(scene.id === 'hub' && !asleep(), 'a grown-up can allow one more Night, got ' + scene.id);
    closeNight(0); S.promo = false; check(asleep(), 'after that Night it is bedtime again'); S.bed.d = '2000-1-1'; check(!asleep(), 'a new day starts awake');
    reset(3); go('badge'); $('#bWho').click(); $('#wBed').click(); answer(true);
    check(document.querySelectorAll('.veil .acts .btn').length === 6, 'the bedtime setting offers off and one to five Nights');
    document.querySelectorAll('.veil .acts .btn')[2].click(); check(S.bedN === 2 && $('#wBed').textContent.includes('2'), 'the chosen number of Nights is kept and shown'); $('#wOk').click(); S.bedN = 0;
    where = 'first words, supper, birthday, lanterns';
    // the day's first words: what happened last time; once a day
    reset(3); S.memD = ''; S.mem = { d: today(), k: 'perfect' }; go('hub');
    check(!!$('.veil') && $('#owlText').textContent === t('mem_perfect') && S.memD === today(), 'the day begins with a memory: ' + ($('#owlText') || {}).textContent);
    clickDlg(); go('hub'); check(!$('.veil'), 'the first words are said once a day');
    const yd = new Date(Date.now() - 144e5 - 864e5), yesterday = yd.getFullYear() + '-' + (yd.getMonth() + 1) + '-' + yd.getDate();
    reset(3); S.memD = '2020-1-1'; S.mem = { d: today(), k: 'lost' }; go('hub');
    check(!!$('.veil') && $('#owlText').textContent === t('mem_away'), 'after a week without a visit the owl is glad'); clickDlg();
    reset(3); S.memD = yesterday; S.mem = { d: '2020-1-1', k: 'lost' }; go('hub');
    check(!!$('.veil') && $('#owlText').textContent === t('mem_lost'), 'a visit yesterday is no time away, however old the last Night is'); clickDlg();
    reset(3); S.memD = ''; S.mem = { d: today(), k: 'zzz' }; go('hub'); check(!$('.veil') && S.memD === today(), 'an unknown memory says nothing');
    // what a Night's end leaves to remember, and the lantern of a Night without a lost jar
    reset(3); closeNight(0); check(S.mem.k === 'perfect' && S.mem.d === today() && S.lit === 1, 'a Night without a lost jar is remembered and lights a lantern: ' + S.mem.k + ' ' + S.lit);
    reset(5); closeNight(3); check(S.mem.k === 'hard' && S.lit === 0, 'a hard Night is remembered kindly and lights nothing: ' + S.mem.k);
    closeNight(1); check(S.mem.k === 'lost' && !S.promo, 'a lost jar is remembered: ' + S.mem.k);
    reset(5); closeNight(1, 2); check(S.mem.k === 'laugh', 'laughing magpies are remembered: ' + S.mem.k);
    reset(2); closeNight(1); check(S.promo && S.mem.k === 'promo', 'a promotion is remembered: ' + S.mem.k);
    reset(5); S.boss = 5; closeNight(0); check(S.mem.k === 'boss', 'the Baron is remembered: ' + S.mem.k);
    for (const k of ['perfect', 'lost', 'hard', 'promo', 'boss', 'laugh', 'fish', 'bed', 'away']) check(!!L['mem_' + k], 'the memory ' + k + ' has its line');
    reset(3); finishNight(0); check($('.veil .pics').textContent.includes(t('litNew')) && $('#owlText').textContent.endsWith(t('lit1')), 'the first lantern comes with a word about it'); clickDlg();
    reset(3); S.lit = 4; finishNight(0); check($('.veil .pics').textContent.includes(t('litNew')) && !$('#owlText').textContent.includes(t('lit1')), 'later lanterns come without the explanation'); clickDlg();
    reset(3); finishNight(2); check(!$('.veil .pics').textContent.includes(t('litNew')) && S.lit === 0, 'a Night with lost jars lights no lantern'); clickDlg();
    // fish for supper: three fish or more of a day's fishing sharpen the owl's eyes, once
    reset(3); localStorage.setItem('firstlight.day', JSON.stringify({ id: 77, n: 3 })); go('hub');
    check(!!$('.veil') && $('#owlText').textContent === t('eye1') && S.eye === 1 && S.sup === '77' && S.mem.k === 'fish', 'three fish are supper: ' + S.eye + ' ' + S.sup);
    clickDlg(); S.eye = 0; go('hub'); check(!$('.veil') && S.eye === 0, 'one day of fishing is one supper');
    localStorage.setItem('firstlight.day', JSON.stringify({ id: 78, n: 2 })); go('hub'); check(!$('.veil') && S.eye === 0 && S.sup === '78' && S.mem.k === 'fish', 'two fish are remembered, but are no supper');
    localStorage.setItem('firstlight.day', '{"id":{"a":1},"n":"x"}'); go('hub'); check(!$('.veil') && S.sup === '78', 'a broken note from the fishing game is ignored'); localStorage.removeItem('firstlight.day');
    // the birthday: the greeting, the party hat and a few moonbeams, once a year
    reset(3); S.memD = ''; S.bday = today().split('-').slice(1).join('-'); go('hub');
    check(isBirthday() && $('#owlText').textContent === t('bday1') + ' ' + t('bday2') && S.own.party === 1 && S.beams === 330 && S.bdayY === +today().split('-')[0], 'the owl keeps the birthday: ' + $('#owlText').textContent);
    clickDlg(); S.memD = ''; go('hub'); check(!$('.veil') && S.beams === 330, 'the birthday is kept once a year');
    reset(3); go('hub'); S.bday = today().split('-').slice(1).join('-'); go('hub');   // the date is set after today's first visit
    check(!!$('.veil') && $('#owlText').textContent === t('bday1') + ' ' + t('bday2') && S.own.party === 1 && S.beams === 330, 'a birthday set later on the day itself is still kept'); clickDlg();
    reset(3); go('badge'); $('#bWho').click(); $('#wBday').click(); answer(false); check(!!$('#wBday') && S.bday === '', 'a wrong sum sets no birthday');
    $('#wBday').click(); answer(true); $('#bdD').value = '14'; $('#bdM').value = '3'; $('#bdOk').click();
    check(S.bday === '3-14' && $('#wBday').textContent.includes('14.3'), 'a grown-up sets the birthday: ' + S.bday);
    $('#wBday').click(); answer(true); check($('#bdD').value === '14' && $('#bdM').value === '3', 'the setting shows the date that is set'); $('#bdD').value = '0'; $('#bdOk').click();
    check(S.bday === '', 'the birthday can be taken away again');
    $('#wBday').click(); answer(true); check(document.activeElement === $('#bdOk'), 'the birthday setting opens with the focus on its button');
    $('#bdD').value = '31'; $('#bdM').value = '2'; $('#bdOk').click(); check(S.bday === '2-29', 'a day the month does not have becomes its last day: ' + S.bday);
    S.bday = ''; $('#wOk').click();
    where = 'seasons and weather';
    seaForce = { m: 6 }; check(seasonLeaf().join() === '#1a4c33,#1f5a3c,#246a45,#2b7a50' && seasonGround().join() === '#0c1740,#13235a', 'summer keeps the tree as it always was');
    for (const m of [0, 3, 6, 9]) {   // a winter, spring, summer and autumn month; Nights 1 to 60
      seaForce = { m }; const wx = []; for (let n = 1; n <= 60; n++) wx.push(nightWeather(n));
      check(wx.every((w, i) => w.k === nightWeather(i + 1).k && w.slow === nightWeather(i + 1).slow), 'the weather of a Night is always the same, month ' + m);
      check(wx.slice(0, 3).every(w => w.k === 'clear'), 'Nights 1 to 3 are clear, month ' + m);
      check(wx.every((w, i) => !i || w.k === 'clear' || wx[i - 1].k === 'clear'), 'never two Nights with weather in a row, month ' + m);
      check(wx.every(w => w.slow >= 0 && w.slow <= .25), 'weather slows the magpies by a quarter at most, month ' + m);
      check(wx.every((w, i) => w.k === 'clear' ? weatherLine(i + 1) === '' : has(L, weatherLine(i + 1))), 'every weather has its line for the briefing, month ' + m);
      const wet = wx.filter(w => w.k !== 'clear').length; check(wet >= 15 && wet <= 25, `about one Night in three has weather, month ${m}: ${wet}`);
      check(m ? wx.some(w => w.k === 'rain') && !wx.some(w => w.k === 'snow') : wx.some(w => w.k === 'snow') && !wx.some(w => w.k === 'rain'), 'rain falls as snow in winter only, month ' + m);
    }
    seaForce = { w: 'wind' }; check(nightWeather(1).k === 'wind' && weatherLine(1) === 'wx_wind', 'a test can force the weather');
    reset(9); go('home'); for (const m of [0, 3, 6, 9]) for (const w of ['clear', 'rain', 'wind', 'snow']) { seaForce = { m, w }; sim(.5); }   // every season with every weather is drawn
    seaForce = { m: 6, w: 'clear' };
    where = 'secrets';
    reset(8); go('home'); const TS = treeArea(), [mx, my] = moonAt();
    scene.down(mx, my); check(V.t - winkT < .1, 'a tapped moon winks');
    for (const [r, x, y] of [[1, ...slideAt(.5)], [2, 380, 520], [3, 320, 140]]) { scene.down(TS.ox + x * TS.k, TS.oy + y * TS.k); check(V.t - roomT[r] < .1, 'room ' + r + ' answers a tap'); }
    reset(1); roomT[1] = -9; scene.down(TS.ox + slideAt(.5)[0] * TS.k, TS.oy + slideAt(.5)[1] * TS.k); check(roomT[1] === -9, 'a cadet has no slide yet');
    lastTouch = V.t - 30; sim(1); check(dozing(), 'the owl dozes off when nobody plays');
    ptr('pointerdown', 5, 5, $('#bPlay')); check(!dozing(), 'a tap on a button counts as playing: the owl wakes');
    scatterT = -9; scatter(); check(V.t - scatterT < .1, 'fireflies scatter on the menu'); go('cam'); clickDlg(); scatterT = -9; scatter(); check(scatterT === -9, 'no scattering inside a station');
    lifeChecks();
    where = 'speech';
    speak(t('b1')); speak(t('please'), 'pie'); speak('Mia!'); hush(); S.voice = false; go('home'); owlSay(t('win')); clickDlg(); S.voice = true; toast(t('poor'));
    check(sentences(t('b1')).length === 2 && sentences('One. Two! Three').length === 3, 'a line is split into sentences for the voice clips');
    await note('gadgets, album, wardrobe, certificate, players, secrets and speech checked, problems so far: ' + out.errors.length);

    where = 'owl\'s eye'; eyeChecks();
    where = 'friends'; palChecks();
    // --- full Nights 1..8 ---
    for (let n = 1; n <= 8; n++) {
      reset(n); setLang(n % 3);
      where = `cam night ${n}`; go('cam'); clickDlg();
      sim(400, () => { scene.feeds.forEach((f, i) => { const m = f.mag; if (m && m.state === 'walk' && !m.decoy && m.x > .1 && m.x < .9 && scene.batt >= 1) scene.flash(i); }); return scene.run; });
      check(S.st.cam >= 2, `cam win is saved at once, before the dialog (night ${n}): ${S.st.cam}`); await waitDlg('cam win ' + n); clickDlg();
      go('cam'); clickDlg(); sim(600, () => scene.run); await waitDlg('cam lose ' + n); check(scene.stolen === 3 || scene.time <= 0, 'cam soft fail'); clickDlg(0);

      where = `gate night ${n}`; go('gate'); clickDlg();
      sim(200, () => { if (scene.state === 'ask') scene.decide(scene.q[scene.i].friend); return scene.run; });
      check(S.st.gate === 3 && S.gateStar === n, `gate win and streak star are saved at once (night ${n}): ${S.st.gate}, ${S.gateStar}`); await waitDlg('gate win ' + n); clickDlg();
      go('gate'); clickDlg(); sim(200, () => { if (scene.state === 'ask') scene.decide(true); return scene.run; });
      await waitDlg('gate lose ' + n); check(scene.let === 2, 'gate soft fail after two tricksters'); clickDlg(0);

      where = `forge night ${n}`; go('forge'); clickDlg();
      $('#fTray').children[0].click(); scene.tryIt(); $('#fTray').children[1].click(); check(scene.tiles.length === 1, 'tiles are locked while the hacker works');
      sim(1); await sleep(2500); check(!!$('.veil'), 'forge crack tip ' + n); clickDlg();
      $('#fSlots').children[0].click();
      const idx = k => scene.tray.map((x, i) => i).filter(i => scene.tray[i].k === k);
      [...idx('w').slice(0, 3), idx('n')[0], idx('s')[0], ...(n >= 7 ? [idx('w')[3]] : [])].forEach(i => $('#fTray').children[i].click());
      check(scene.sec >= scene.goal, `forge goal reachable night ${n}`); scene.tryIt(); check(S.st.forge === 3, 'forge win is saved at once'); sim(1);
      await waitDlg('forge win ' + n); check(S.st.forge === 3, `forge stars night ${n}: ${S.st.forge}`); clickDlg();

      // from Night 2 one extra station takes turns: Firefly Round-up, Mailbox Check, Secret Code
      const ex = extraOf(n), had = Object.keys(S.stk).length, left = STK_SETS.flat().filter(id => !S.stk[id] && !STK_OWN.includes(id)).length;
      check(!!ex === n >= 2, 'an extra station from Night 2 on');
      if (ex) {
        where = `${ex} night ${n}`; go('hub'); check(document.querySelectorAll('.card').length === 4, 'the hub shows the extra station'); $('.card.bonus').click(); check(scene.id === ex, 'the extra card opens ' + ex); clickDlg();
        if (ex === 'flies') sim(50, () => { let f = null, bd = 1e9; for (const q of scene.flies) { const d = Math.hypot(q.x - scene.jx, q.y - scene.jy); if (d < bd) { bd = d; f = q; } } if (f) scene.aim(f.x, f.y); return scene.run; });
        if (ex === 'mail') sim(240, () => { if (scene.state === 'ask') scene.decide(scene.q[scene.i].friend); return scene.run; });
        if (ex === 'code') for (let i = 0; i < 3000 && scene.state !== 'end'; i++) { if (scene.state === 'ask') scene.pick(scene.want()); sim(.1); }
        check(S.st.extra === 3, `${ex}: a perfect run is saved at once with three stars (night ${n}): ${S.st.extra}`);
        check(Object.keys(S.stk).length === had + (left ? 1 : 0), `${ex}: the first win of a Night brings a sticker while the album has room`);
        await waitDlg(`${ex} win ${n}`); check(!left || !!$('.veil .got'), 'the win dialog shows the new sticker'); clickDlg();
        if (ex === 'mail') { go('mail'); clickDlg(); sim(240, () => { if (scene.state === 'ask') scene.decide(true); return scene.run; }); await waitDlg('mail soft fail ' + n); check(scene.kept === 2, 'mail soft fail after two kept tricks'); clickDlg(0); }
        if (ex === 'code') { go('code'); clickDlg(); for (let i = 0; i < 3000 && scene.state !== 'end'; i++) { if (scene.state === 'ask') scene.pick(i < 40 ? (scene.want() + 1) % scene.keys : scene.want()); sim(.1); } await waitDlg('code second run ' + n); check(S.st.extra === 3, 'a weaker second run keeps the stars'); clickDlg(); }
      }

      where = `tinker night ${n}`; go('tinker'); clickDlg(); sim(.5);
      const T = scene.T(), at = m => [T.ox + MOUNTS[m][0] * T.k, T.oy + (MOUNTS[m][1] - 20) * T.k], w0 = worth();
      $('.pal[data-k="lamp"]').onpointerdown({ clientX: 30, clientY: V.h - 30 }); scene.move(...at(4)); sim(.2); scene.up(...at(4));
      check(S.items.some(i => i.t === 'lamp' && i.m === 4), 'drag-place lamp');
      $('.pal[data-k="cam"]').onpointerdown({ clientX: 30, clientY: V.h - 30 }); scene.up(30, V.h - 30); scene.down(...at(5)); scene.up(...at(5));
      check(S.items.some(i => i.t === 'cam' && i.m === 5), 'tap-place camera');
      scene.down(...at(5)); scene.move(...at(12)); sim(.2); scene.up(...at(12)); check(S.items.some(i => i.t === 'cam' && i.m === 12), 'drag-move camera');
      for (const k of PALETTE) { scene.hand = k; scene.place(k === 'shield' ? VAULT : scene.free(k)[0]); }
      check(worth() === w0, `moonbeams are conserved while building: ${w0} -> ${worth()}`);
      sim(.3);
      $('#tTest').click(); where = `test raid night ${n}`; sim(300, () => !scene.endT); await waitDlg('test raid ' + n); clickDlg();
      check(scene.id === 'tinker', 'back in tinker after test raid'); $('#tDone').click();
      check(!$('#bRaid').disabled, 'raid button ready'); $('#bRaid').click();
      if (isBoss(n)) { check(scene.id === 'boss', 'every fifth Night starts with the Baron, got ' + scene.id); await playBoss(n); }
      where = `raid night ${n}`; check(scene.id === 'raid', 'the raid follows, got ' + scene.id); sim(300, () => !scene.endT); await waitDlg('night end ' + n);
      // A promotion comes with its story strip and its ceremony. On Night 2 leave without pressing OK, as a reload would: both must still come.
      const up = S.promo;
      if (n === 2) { check(up === true, 'a promotion is remembered in the save'); go('hub'); } else clickDlg();
      check(S.night === n + 1, 'night advanced');
      if (up) {
        check(scene.id === 'story', 'a promotion starts with its story strip, got ' + scene.id);
        for (let i = 0; i < 3; i++) { sim(.5); scene.next(); }
        check(scene.id === 'badge' && !!$('.badgebar .got'), 'the ceremony follows the story and shows the new room, got ' + scene.id);
        sim(2); await note(`night ${n}: promoted to rank ${rank()}${scene.party ? ' (finale)' : ''}`); $('#bOk').click();
      }
      check(scene.id === 'tinker', 'tinker after night, got ' + scene.id);
      // The day between two Nights: leaving the Tinker Treehouse meets first light once; then the next Night begins.
      if (n === 1 || n === 3) {
        where = `first light after night ${n}`;
        let out = ''; scenes.dawn.leave = url => { out = url; };
        if ($('.veil')) clickDlg();
        check(S.day === 1, 'a finished Night leaves a day pending'); $('#tDone').click();
        check(scene.id === 'dawn' && document.querySelectorAll('.veil .acts .btn').length === 2, 'first light comes before the next Night, got ' + scene.id);
        if (n === 1) { clickDlg(0); check(scene.id === 'hub' && S.day === 0 && !!$('.veil'), 'resting leads to the next Night and its briefing, got ' + scene.id); clickDlg(); }
        else { clickDlg(); check(out === 'fishing/index.html#day' && S.day === 0, 'going fishing uses the day up and leaves for the fishing game: ' + out); go('hub'); check(scene.id === 'hub', 'after the day the Night begins, got ' + scene.id); }
      }
      await note(`night ${n} played: stars ${S.stars}, moonbeams ${S.beams}, jars in nest ${S.nest}, stickers ${Object.keys(S.stk).length}`);
    }
    check(rank() === 3, 'chief rank after night 7');
    go('badge'); sim(2); check(scene.party && $('#fin').textContent.includes(playerName()), 'chief party on the badge screen greets the player by name');
    // --- the Baron's Night with one mistake in every act: no failure, one star, the same sticker ---
    where = 'boss with mistakes'; reset(10); let after = 0; go('boss', { then: () => { after = 1; go('hub'); } }); clickDlg(); sim(2.5);
    scene.cake(true); sim(4.3); check(scene.ph === 'ask1' && scene.miss === 1, 'a cake let in is only a mistake: the act starts again, got ' + scene.ph); scene.cake(false); sim(8.7);
    scene.open(scene.parcels.findIndex(p => !p.pie)); sim(1.7); scene.parcels.forEach((p, i) => { if (p.pie) scene.open(i); }); sim(5.2);
    scene.lock(scene.locks.findIndex(l => l.length === 1)); sim(3.6); check(scene.ph === 'ask3' && scene.miss === 3, 'a weak lock is only a mistake, got ' + scene.ph + ' ' + scene.miss);
    scene.lock(scene.locks.findIndex(l => l.length === 4)); check(S.boss === 10 && scene.stars === 1 && S.stk.m6 === 1, 'three mistakes still beat the Baron, with one star: ' + scene.stars);
    sim(13.9); await waitDlg('boss result with mistakes'); clickDlg();
    // --- the Baron's story: from Night 10 a chapter comes between his Night and the raid, one per Night; after the third he comes no more ---
    where = 'the Baron\'s story';
    check(scene.id === 'saga' && scene.ch === 1 && after === 0, 'on Night 10 the first chapter of the Baron\'s story follows his Night, got ' + scene.id);
    for (let i = 0; i < 3; i++) { sim(.5); scene.next(); }
    check(S.saga === 1 && after === 1, `the chapter is saved and the Night goes on to the raid: saga ${S.saga}, then ${after}`);
    for (const [n, sg, ch] of [[5, 0, 0], [10, 0, 1], [15, 1, 0], [20, 1, 2], [25, 2, 0], [30, 2, 3], [45, 0, 1]]) {
      reset(n); S.saga = sg; go('home'); let went = 0; sagaAfter(() => { went = 1; });
      check(ch ? scene.id === 'saga' && scene.ch === ch && !went : went && scene.id === 'home', `after the Baron's Night ${n} with ${sg} chapters seen: ${scene.id} ${scene.ch || ''}`);
    }
    reset(30); S.saga = 2; go('saga', { ch: 3, then: () => { after = 2; } }); for (let i = 0; i < 3; i++) { sim(.5); scene.next(); }
    check(S.saga === 3 && S.beams === 350 && S.own.crown === 1 && !!$('.veil') && after === 1, 'the last chapter ends with the Baron\'s present, saved at once');
    clickDlg(); check(after === 2 && !isBoss(35) && !isBoss(40), 'after his museum opens the Baron comes no more');
    reset(30); S.saga = 3; S.boss = 30; closeNight(0); check(S.mem.k === 'perfect', 'once the museum is open the Baron is not remembered as a grumbler: ' + S.mem.k);
    reset(10); S.boss = 10; go('hub'); check(scene.id === 'saga' && scene.ch === 1, 'a chapter that was cut short comes back at the Night menu, got ' + scene.id);
    for (let i = 0; i < 3; i++) { sim(.5); scene.next(); }
    check(scene.id === 'hub' && S.saga === 1, `after it the Night goes on: ${scene.id}, chapters seen ${S.saga}`);
    // --- Be the Magpie: a perfect fake fools the owl once (and brings the sticker), a wrong one is named ---
    where = 'be the magpie'; reset(3); go('pie'); clickDlg(); sim(7); check(scene.ph === 'spied', 'the spy phase ends, got ' + scene.ph);
    scene.shop(); Object.assign(scene.fake, { dis: 2, shape: scene.badge.shape, style: scene.badge.style, pass: [...scene.pass] }); scene.marks(); scene.said = true; scene.check('owl');
    sim(8, () => scene.ph !== 'owlFool'); check(scene.ph === 'owlFool' && S.fooled === 1 && S.stk.d6 === 1, `a perfect copy fools the owl and brings the sticker: ${scene.ph}`);
    sim(5); check(!!$('.veil .got'), 'the result shows the new sticker'); clickDlg(0); check(scene.id === 'home', 'home after the magpie game');
    go('pie'); clickDlg(); sim(7); scene.shop(); Object.assign(scene.fake, { dis: 0, shape: scene.badge.shape, style: (scene.badge.style + 1) % 4, pass: [...scene.pass] }); scene.marks(); scene.said = true; scene.check('owl');
    sim(8, () => scene.ph !== 'owlNo'); check(scene.ph === 'owlNo', 'a wrong pattern is caught: ' + scene.ph);
  }
  // The Baron's Night as a perfect run: shoo the cake, open the three magpie parcels, pick the longest lock.
  async function playBoss(n) {
    where = 'boss night ' + n;
    const s0 = S.stars;
    clickDlg(); sim(2.5); check(scene.ph === 'ask1', 'the cake act waits for the player, got ' + scene.ph);
    scene.cake(false); sim(8.7); check(scene.ph === 'ask2', 'the parcel act waits for the player, got ' + scene.ph);
    scene.parcels.forEach((p, i) => { if (p.pie) scene.open(i); }); sim(5.2); check(scene.ph === 'ask3', 'the lock act waits for the player, got ' + scene.ph);
    scene.lock(scene.locks.findIndex(l => l.length === 4));
    check(S.boss === n && S.stars === s0 + 3 && S.stk.m6 === 1, `beating the Baron is saved at once: ${S.boss}, ${S.stars - s0} stars`);
    sim(13.9); check(scene.ph === 'end', 'the finale ends, got ' + scene.ph); await waitDlg('boss result ' + n); check(!!$('.veil .got'), 'the Baron\'s sticker is shown'); clickDlg();
  }

  async function audit() {
    await note(`viewport ${innerWidth}x${innerHeight}, reduced motion ${calm.matches ? 'on' : 'off'}`);
    if (calm.matches) { go('home'); toast('test'); await sleep(150); check(+getComputedStyle($('.toast')).opacity > .9, 'toasts stay visible when motion is reduced'); }
    // measure final layouts, not the first frame of a pop-in animation
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '*, *::before { animation: none !important; transition: none !important; }' }));
    const W = innerWidth, H = innerHeight, found = new Map();
    const name = el => el.id ? '#' + el.id : '.' + String(el.className).trim().split(/\s+/).join('.');
    // one line per problem; languages and Nights that share it are collected behind it
    const flag = (screen, el, what) => {
      const k = `${screen.replace(/ n\d+$/, '')}: ${name(el)} ${what.replace(/[-\d.]+/g, '#')}`;
      if (!found.has(k)) found.set(k, { text: `${screen}: ${name(el)} "${(el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24)}" ${what}`, langs: new Set() });
      found.get(k).langs.add(LANGS[lang]);
    };
    const look = screen => {
      where = screen;
      if (document.documentElement.scrollWidth > W + 1) flag(screen, document.documentElement, 'page scrolls sideways');
      // every button that is not under a dialog takes a tap at its middle (the overlay lets taps through to the canvas, so
      // a button outside the containers that take them back would be dead to a finger and alive to a test's click()).
      // A tile that a scrolling row has scrolled out of view is not judged.
      const veil = $('#ui .veil');
      const scrolledOut = (el, x, y) => { for (let p = el.parentElement; p && p !== ui; p = p.parentElement) { const o = getComputedStyle(p), q = p.getBoundingClientRect(); if ((o.overflowX !== 'visible' || o.overflowY !== 'visible') && (x < q.left || x > q.right || y < q.top || y > q.bottom)) return true; } return false; };
      for (const el of document.querySelectorAll('#ui button, #ui a.btn')) {
        const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (!r.width || el.disabled || veil && !veil.contains(el) || r.left < 0 || r.right > W || r.top < 0 || r.bottom > H || scrolledOut(el, x, y)) continue;
        const hit = document.elementFromPoint(x, y);
        if (hit !== el && !el.contains(hit)) flag(screen, el, 'cannot be tapped: ' + (hit ? name(hit) : 'nothing') + ' takes the tap');
      }
      for (const el of document.querySelectorAll('#ui .btn, #ui .card, #ui .tile, #ui .pal, #ui .pill, #ui .dlg, #ui .ref, #ui .slots, #ui .meter, #ui input, #ui .title, #ui .foot, #ui .bubble, #ui .toast, #ui .goals, #ui .stk, #ui img.cert, #ui .who')) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (r.left < -1 || r.right > W + 1) flag(screen, el, `leaves the screen sideways (${Math.round(r.left)}..${Math.round(r.right)} of ${W})`);
        if (r.top < -1 || r.bottom > H + 1) flag(screen, el, `leaves the screen vertically (${Math.round(r.top)}..${Math.round(r.bottom)} of ${H})`);
        if (el.matches('.btn, .card, .tile, .pal, .stk') && (r.width < 47.5 || r.height < 47.5)) flag(screen, el, `tap target is only ${Math.round(r.width)}x${Math.round(r.height)}`);
        if (el.matches('.btn, .pill, .tile, .pal, .card') && el.scrollWidth > el.clientWidth + 2) flag(screen, el, `text is clipped (${el.scrollWidth} > ${el.clientWidth})`);
      }
      const d = $('#ui .dlg');
      if (d && d.scrollHeight > d.clientHeight + 2) flag(screen, d, `dialog needs scrolling (${d.scrollHeight} > ${d.clientHeight})`);
      const blocks = [...document.querySelectorAll('#ui .hud > *:not(.sp), #ui .ref, #ui #bEye, #ui .hub .cards, #ui .hub .row, #ui .gatebtns .btn, #ui .forge > *, #ui .palette, #ui .home > .title, #ui .home > .row, #ui .home > .foot, #ui .album > *, #ui .side > *, #ui .replay')].filter(e => e.getBoundingClientRect().width);
      for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
        const a = blocks[i].getBoundingClientRect(), b = blocks[j].getBoundingClientRect();
        const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (ox > 2 && oy > 2) flag(screen, blocks[i], `overlaps ${name(blocks[j])} by ${ox | 0}x${oy | 0}`);
      }
    };
    for (let l = 0; l < 3; l++) {
      setLang(l); reset(1);
      go('home'); sim(.5); look('home');
      askName(() => {}); look('name dialog'); clickDlg();
      S.briefed = 0; go('hub'); look('hub with briefing'); clickDlg(); sim(.3); look('hub');
      S.st = { cam: 3, gate: 2, forge: 1, extra: 0 }; go('hub'); look('hub ready for raid');
      reset(2); S.st = { cam: 3, gate: 3, forge: 3, extra: 2 }; go('hub'); look('hub with the extra station');
      reset(5); S.st = { cam: 1, gate: 1, forge: 1, extra: 0 }; S.briefed = 0; go('hub'); look('briefing on the Baron\'s Night'); clickDlg(); look('hub on the Baron\'s Night');
      reset(3); S.day = 1; go('hub'); look('first light'); clickDlg(0);
      reset(3); S.bedN = 1; S.bed = { d: today(), n: 1, more: 0 }; go('hub'); look('bedtime'); clickDlg(0); look('the grown-up sum at bedtime'); answer(false); clickDlg();
      reset(3); localStorage.setItem('firstlight.v1', JSON.stringify({ log: { biscuit: { n: 1 } } })); go('hub'); look('news of a gift'); clickDlg(); localStorage.removeItem('firstlight.v1');
      reset(3); go('badge'); $('#bWho').click(); look('players with the bedtime setting'); $('#wBed').click(); answer(true); look('the bedtime setting'); clickDlg(0); $('#wOk').click();
      // album (every sticker owned: the longest names), wardrobe, certificate, players
      reset(8); for (const id in STK) S.stk[id] = 1;
      for (let p = 0; p < 3; p++) { go('album', { page: p }); look('album page ' + p); }
      S.stk = {}; go('album'); look('empty album');
      go('wear'); sim(.2); look('wardrobe'); scene.tap('wizard'); look('wardrobe, trying on');
      // the flag's painting screen: the grid keeps clear of the bar and of the palette (beside it in landscape, above it in portrait)
      go('flag', { from: 'wear' }); look('flag, the owl\'s first word'); clickDlg(); sim(.2); look('flag painting');
      const FG = scene.G, FP = $('#flagPal').getBoundingClientRect(), FB = $('#ui .hud').getBoundingClientRect(), FR = [FG.x - 6, FG.y - 6, FG.x + 12 * FG.c + 6, FG.y + 8 * FG.c + 6];
      check(FG.c >= 22 && FR[0] >= 0 && FR[2] <= W && FR[3] <= H && FR[1] >= FB.bottom - 1 && (wide() ? FP.left >= FR[2] : FP.top >= FR[3]), `flag: the grid (cells of ${FG.c} px) keeps clear of the bar and the palette: ${FR.join()}`);
      $('#flagNew').click(); look('flag, start again?'); clickDlg(1);
      go('home'); sim(.2); look('home of a Chief');
      go('badge', { from: 'home' }); showCert(); look('certificate'); closeDlg(); showPlayers(); look('players'); $('[data-del]').click(); look('grown-up question'); answer(false); closeDlg();
      // story strips
      for (let r = 1; r <= 3; r++) { go('story', { rank: r, then: () => {} }); for (let i = 0; i < 3; i++) { sim(.6); look(`story ${r}, panel ${i + 1}`); if (i < 2) scene.next(); } }
      // the Baron's story, and his present after the last chapter
      for (let ch = 1; ch <= 3; ch++) { go('saga', { ch, then: () => {} }); for (let i = 0; i < 3; i++) { sim(.6); look(`the Baron's story ${ch}, panel ${i + 1}`); scene.next(); } }
      look('the Baron\'s present'); clickDlg();
      // the extra stations, early and late
      for (const ex of EXTRAS) for (const n of [2, 8]) {
        reset(n); go(ex); look(`${ex} intro n${n}`); clickDlg(); sim(3); look(`${ex} n${n}`);
        newStk = 'm3'; S.stk.m3 = 1; stationWin(ex, 3, 3); look(`${ex} win with a sticker n${n}`); clickDlg();
      }
      // gadget page, replay banner, the owl's word on a silly defence
      reset(3); go('tinker'); $('#tPage').click(); sim(.2); look('tinker, gadget page');
      S.items = [{ t: 'peel', m: 0 }, { t: 'tickle', m: 1 }, { t: 'disco', m: 2 }, { t: 'peel', m: 3 }, { t: 'tickle', m: 4 }, { t: 'bubbler', m: 5 }, { t: 'bell', m: 15 }];
      go('raid', { test: true }); sim(200, () => !scene.endT); check(scene.rewind() === true && !!scene.rp, 'a raid with antics has a replay'); sim(.3); look('replay'); scene.skip(); look('result of a silly raid'); clickDlg();
      // tricks of Nights 9 to 30 (src/91-arc.js): the palette's third page and a raid with every trick, with the helper's pill
      // in both top bars (src/57-pals.js), and the briefing of a trick's first Night and of a mixed Night
      reset(21); Object.assign(S, { pals: { guard: 1, lamp: 1 }, helper: 'lamp' }); go('tinker'); $('#tPage').click(); $('#tPage').click(); sim(.2); look('tinker, new gadgets page');
      check(document.querySelectorAll('.pal[data-k]').length === 4 && !!$('.pal[data-k="drum"]'), 'the third page holds the four new gadgets');
      go('raid', { test: true }); scene.plan = [{ route: 'sky', at: 0, kind: 'balloon' }, { route: 'rb', at: 0, kind: 'stilts' }, { route: 'lb', at: 0, kind: 'twins' }, { route: 'lad', at: 0, kind: 'dig' }]; scene.R = makeRaid(scene.plan, 1); sim(1.6); look('raid with every trick');
      check(!!$('.hud canvas[data-i^="pal:"]'), 'the raid\'s bar names the helper');
      reset(17); S.briefed = 0; go('hub'); look('briefing of a new trick'); clickDlg(); reset(25); S.briefed = 0; go('hub'); look('briefing of a mixed Night'); clickDlg();
      // friends (src/57-pals.js): the owl's news of the first friend, and the Friends page with all six and the Baron
      reset(3); S.caught = 30; go('hub'); look('news of a friend'); clickDlg();
      reset(9); Object.assign(S, { pals: Object.fromEntries(PALS.map(id => [id, 1])), helper: 'guard', caught: 333, saga: 3 }); go('pals', { from: 'album' }); sim(.2); look('friends page');
      // life at the treehouse (src/46-life.js): news of the swing, a visitor's wish, a wrong answer, the thank-you
      reset(3); S.stars = 60; go('hub'); look('news of the swing'); clickDlg();
      reset(3); S.visit = { d: '', done: 0, n: 0 }; go('hub'); visitTap(500, 300, treeArea()); look('a visitor\'s wish');
      const wish = LIFE_WISH[lifeNow().wish][1], wcards = [...document.querySelectorAll('.veil .card')];
      wcards.find(b => b.dataset.k !== wish).click(); look('a visitor\'s wish, not quite'); wcards.find(b => b.dataset.k === wish).click(); look('a visitor\'s thanks'); clickDlg();
      // the day's first words, on a birthday, after a good day's fishing; the birthday setting; a Night's end with its lantern
      reset(3); S.memD = ''; S.mem = { d: today(), k: 'laugh' }; go('hub'); look('first words of the day'); clickDlg();
      reset(3); S.memD = ''; S.bday = today().split('-').slice(1).join('-'); go('hub'); look('birthday greeting'); clickDlg();
      reset(3); localStorage.setItem('firstlight.day', JSON.stringify({ id: 5, n: 4 })); go('hub'); localStorage.removeItem('firstlight.day'); look('fish for supper'); clickDlg();
      reset(3); go('badge', { from: 'home' }); showPlayers(); $('#wBday').click(); answer(true); look('birthday setting'); $('#bdOk').click(); closeDlg();
      reset(3); go('hub'); finishNight(0); look('a Night\'s end with the first lantern'); clickDlg();
      // Be the Magpie
      go('pie'); look('magpie intro'); clickDlg(); sim(7); look('magpie, after spying'); scene.shop(); sim(.3); look('magpie workshop');
      Object.assign(scene.fake, { dis: 5, pass: [...scene.pass] }); scene.marks(); look('magpie workshop, ready'); $('#pieReady').click(); look('magpie, who checks');
      clickDlg(1); look('magpie, grown-up dialog'); clickDlg(); sim(1.5); look('magpie, grown-up checks'); scene.decide(false); sim(3.5); await sleep(300); look('magpie result');
      // the Baron's Night
      reset(5); go('boss', { then: () => {} }); look('boss intro'); clickDlg(); sim(2.5); look('boss, the cake'); scene.cake(false); sim(8.7); look('boss, the parcels');
      scene.parcels.forEach((p, i) => { if (p.pie) scene.open(i); }); sim(5.2); look('boss, the locks'); scene.lock(scene.locks.findIndex(q => q.length === 4)); sim(13.9); await sleep(300); look('boss result'); clickDlg();
      for (const n of [1, 4, 8]) {
        reset(n);
        go('cam'); look(`cam intro n${n}`); clickDlg(); sim(3); look(`cam n${n}`);
        scene.stolen = 3; scene.finish(false); await sleep(750); look(`cam soft fail n${n}`); clickDlg(0);
        go('cam'); clickDlg(); stationWin('cam', 3, 3); look(`station win n${n}`); clickDlg();
        S.eye = 1; go('gate'); look(`gate intro n${n}`); clickDlg(); sim(1.2); look(`gate n${n}`);   // with the owl's eye: its button is on screen too
        // the password bubble is drawn on the canvas: no part of the overlay may cover it
        scene.draw();
        for (const el of document.querySelectorAll('#ui .ref, #ui #bEye, #ui .hud > *:not(.sp)')) {
          const r = el.getBoundingClientRect(), [bx, by, bw, bh] = scene.bubble;
          if (Math.min(r.right, bx + bw) - Math.max(r.left, bx) > 2 && Math.min(r.bottom, by + bh) - Math.max(r.top, by) > 2) flag(`gate n${n}`, el, 'covers the visitor\'s password bubble');
        }
        toast(t('gateOops')); look(`gate toast n${n}`);
        stationFail('gate', t('soft') + ' ' + t('gateTip')); look(`gate soft fail n${n}`); clickDlg(0);
        go('forge'); look(`forge intro n${n}`); clickDlg();
        // worst case for width: the eight longest words of this language
        scene.tiles = [...FWORDS].sort((a, b) => t(b).length - t(a).length).slice(0, 8).map(v => ({ k: 'w', v })); scene.refresh();
        look(`forge with 8 tiles n${n}`);
        owlSay(t('forgeTipSame')); look(`forge tip n${n}`); clickDlg();
        stationWin('forge', 3, 3, t('forgeWin'), scene.goalsHtml([true, true, false])); look(`forge win n${n}`); clickDlg();
        S.tinkered = 0; go('tinker'); look(`tinker intro n${n}`); clickDlg(); sim(.3); look(`tinker n${n}`);
        toast(t('poor')); look(`tinker toast n${n}`);
        go('raid', { test: true }); sim(200, () => !scene.endT); await sleep(1100); look(`test raid result n${n}`); clickDlg();
        S.items = [{ t: 'cam', m: 1 }, { t: 'cam', m: 4 }, { t: 'cam', m: 7 }, { t: 'cam', m: 10 }, { t: 'cam', m: 17 }, { t: 'bell', m: 15 }, { t: 'lamp', m: 12 }];
        go('raid', { test: true }); sim(200, () => !scene.endT); await sleep(1100); look(`clean test raid result n${n}`); clickDlg();
        go('hub'); finishNight(2); look(`night result n${n}`);
      }
      reset(3); go('badge', { from: 'home' }); sim(.5); look('badge');
      go('badge', { promo: true, told: true }); sim(.5); look('badge promotion');
      reset(8); go('badge', { promo: true, told: true }); sim(.5); look('badge finale');
      await note(`layout in ${LANGS[l]} checked, problems so far: ${found.size + out.errors.length}`);
    }
    for (const f of found.values()) bad(`${f.text} [${[...f.langs].join(' ')}]`);

    // ----- real keyboard and pointer events (the smoke run calls scene functions directly) -----
    setLang(0); reset(1); where = 'keys in Camera Watch with 4 feeds';
    go('cam'); clickDlg();
    for (const k of ['9', '5', '0', 'a', '1', '4', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', ' ', 'Enter', 'Escape', 'Tab']) key(k);
    const [fx0, fy0, fw, fh] = scene.rect(2);
    scene.batt = 5; ptr('pointerdown', fx0 + fw / 2, fy0 + fh / 2); ptr('pointerup', fx0 + fw / 2, fy0 + fh / 2, window);
    check(scene.batt < 5, 'a real tap on a camera feed flashes the light');
    scene.feeds[0].mag = { x: .5, dir: 1, phase: 'in', state: 'walk', hideT: 0, stops: [], decoy: false, carry: false }; scene.batt = 5; scene.flash(0); scene.flash(0);
    check(scene.batt === 4 && scene.feeds[0].mag.state === 'caught', 'a second tap on a caught magpie costs nothing');
    where = 'keys at the gate'; go('gate'); clickDlg(); sim(1.2); key('ArrowLeft'); check(scene.state === 'out', 'ArrowLeft decides at the gate'); key('ArrowRight'); key('Enter');
    where = 'tap on the big jar'; go('home'); const TA = treeArea(); ptr('pointerdown', TA.ox + 300 * TA.k, TA.oy + 868 * TA.k); check(scene.jarT, 'a real tap on the big jar sparkles');
    check(document.elementFromPoint(TA.ox + 300 * TA.k, TA.oy + 868 * TA.k) === cv, 'home: the overlay lets taps on the jar through');
    where = 'real drag in the Tinker Treehouse'; reset(2); go('tinker'); sim(.2);
    const T = scene.T(), at = m => [T.ox + MOUNTS[m][0] * T.k, T.oy + (MOUNTS[m][1] - 20) * T.k], w0 = worth();
    check(document.elementFromPoint(...at(1)) === cv, 'tinker: the overlay lets taps on the tree through');
    const pb = $('.pal[data-k="lamp"]'), pr = pb.getBoundingClientRect();
    ptr('pointerdown', pr.left + 10, pr.top + 10, pb); ptr('pointermove', ...at(4), window); sim(.1); ptr('pointerup', ...at(4), window);
    check(S.items.some(i => i.t === 'lamp' && i.m === 4), 'a real drag from the palette places the lantern');
    ptr('pointerdown', ...at(4)); ptr('pointermove', ...at(8), window); ptr('pointercancel', ...at(8), window);
    check(!scene.hand && worth() === w0 && !S.items.some(i => i.t === 'lamp'), `a cancelled drag puts the item back in the palette and loses no moonbeams (${w0} -> ${worth()}, hand ${scene.hand})`);
    where = 'keyboard-only placing in the Tinker Treehouse'; reset(2); go('tinker'); sim(.2);
    const cb = $('.pal[data-k="cam"]'); cb.focus(); key('Enter', cb);
    key('ArrowRight', document.activeElement); key('ArrowRight', document.activeElement);
    const spot = scene.kb; key('Enter', document.activeElement);
    check(S.items.some(i => i.t === 'cam' && i.m === spot), 'a keyboard-only player can place a camera (Enter on palette, arrows, Enter)');
    where = 'the treehouse flag'; reset(1); go('home'); sim(.2);
    const TF = treeArea(), fs = Math.max(1, .5 / TF.k), fpx = TF.ox + (614 + 45 * fs) * TF.k, fpy = TF.oy + (83 + 30 * fs) * TF.k;
    ptr('pointerdown', fpx, fpy); ptr('pointerup', fpx, fpy, window);
    check(scene.id === 'flag' && !!$('.veil'), 'a real tap on the flag opens the painting screen, and the owl says the first word');
    clickDlg(); key('3');
    const FC = (i, j) => [scene.G.x + (i + .5) * scene.G.c, scene.G.y + (j + .5) * scene.G.c];
    ptr('pointerdown', ...FC(2, 3)); ptr('pointermove', ...FC(3, 3), window); ptr('pointermove', ...FC(4, 3), window); ptr('pointerup', ...FC(4, 3), window);
    check(S.flag === FLAG_OWN.slice(0, 38) + '222' + FLAG_OWN.slice(41) && JSON.parse(localStorage.getItem(SAVE)).flag === S.flag && $('[data-c="2"]').getAttribute('aria-pressed') === 'true', 'a drag across three cells paints those three red and saves 96 digits: ' + S.flag);
    ptr('pointerdown', ...FC(6, 6)); window.dispatchEvent(new PointerEvent('pointermove', { clientX: FC(9, 1)[0], clientY: FC(9, 1)[1], bubbles: true, pointerId: 2 })); ptr('pointerup', ...FC(6, 6), window);
    check(S.flag[6 * 12 + 6] === '2' && S.flag[1 * 12 + 9] === FLAG_OWN[1 * 12 + 9], 'a second finger on the screen paints nothing: ' + S.flag);
    key('8'); key('ArrowDown'); key('Enter');
    check(S.flag[12] === '7' && JSON.parse(localStorage.getItem(SAVE)).flag === S.flag, 'flag keys: 8 picks white, an arrow moves the cursor, Enter paints and saves');
    $('#flagNew').click(); clickDlg(0);
    check(S.flag === '' && JSON.parse(localStorage.getItem(SAVE)).flag === '', '"Start again" puts back the Night Watch\'s own flag');
    $('#flagBack').click(); check(scene.id === 'home', 'the back button of the painting screen returns home');
    const flagPic = f => { S.flag = f; const cn = document.createElement('canvas'); cn.width = 110; cn.height = 80; const g = cn.getContext('2d'); g.translate(-605, -70); flagDraw(g, 0, 1); return g.getImageData(0, 0, 110, 80).data.join(); }, ownPic = flagPic('');
    check(['x'.repeat(96), '8'.repeat(96), '0'.repeat(95), '<b>', 7, null].every(f => flagPic(f) === ownPic) && flagPic('2'.repeat(96)) !== ownPic, 'damaged values in S.flag fly as the Night Watch\'s own flag');
    S.flag = '';
  }

  if (mode[0] !== 'smoke' && mode[0] !== 'audit') return;
  try { await (mode[0] === 'smoke' ? smoke() : audit()); } catch (e) { bad(`driver crashed at [${where}]: ${e.stack || e}`); }
  await post(out);
  if (parent !== window) parent.postMessage('nw-done', '*');
})();
