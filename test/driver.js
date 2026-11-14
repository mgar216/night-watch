// ---------- Test driver: appended inside the game's scope only for test builds ----------
// Modes, chosen by location.hash:
//   #smoke                           play Nights 1 to 8 with simulated time (win path and soft-fail path of every station)
//   #audit                           layout audit of every screen in three languages, plus real keyboard and pointer events
//   #shot,scene,night,lang,flag,sec,pose  pose one screen for a screenshot (see test/shots.sh); pose is optional:
//       stolen (Camera Watch with two jars in the nest), costume (a costumed trickster at the gate), cut (the gate cutscene),
//       cap (a trickster in the too-big guard cap), oldest (the strongest password in the forge), win (station win dialog)
// smoke and audit POST progress lines and one final report to the server in test/smoke.js.
(async () => {
  const mode = location.hash.slice(1).split(','), run = +new URLSearchParams(location.search).get('run') || 0;
  const out = { run, errors: [] }, seen = new Set();
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
  const waitDlg = async label => { for (let i = 0; i < 100; i++) { if ($('.veil')) return true; await sleep(50); } bad('no dialog: ' + label); return false; };
  const reset = n => { Object.assign(S, { night: n, st: { cam: 0, gate: 0, forge: 0 }, beams: 300, stars: 0, items: [{ t: 'cam', m: 1 }], nest: 0, testStar: 0, gateStar: 0, briefed: n, promo: false, tinkered: 1, name: 'Mia' }); };
  const worth = () => S.beams + S.items.reduce((a, i) => a + ITEMS[i.t].cost, 0);   // moonbeams in hand plus moonbeams built into the tree
  const key = (k, target = document.body) => target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  const ptr = (type, x, y, target = cv) => target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true, pointerId: 1 }));
  const tOrig = t;
  t = (k, v) => { if (!L[k]) bad('missing i18n key ' + k); return tOrig(k, v); };

  if (mode[0] === 'shot') {
    // a screenshot shows the final state of dialogs and toasts, not the first frame of their pop-in
    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '*, *::before { animation: none !important; transition: none !important; }' }));
    reset(+mode[2] || 1); setLang(+mode[3] || 0);
    if (mode[1] === 'hub' && mode[4] === '1') S.briefed = 0;
    if (mode[1] === 'tinker' || mode[1] === 'raid') S.items.push({ t: 'lamp', m: 4 }, { t: 'bell', m: 15 }, { t: 'shield', m: VAULT }, { t: 'banner', m: 18 }, { t: 'flowers', m: 20 }, { t: 'lights', m: 19 }, { t: 'scope', m: 21 });
    go(mode[1], mode[1] === 'badge' ? { promo: mode[4] === '1' } : mode[1] === 'raid' ? { test: true } : undefined);
    if (mode[4] !== '1') clickDlg();
    if (mode[1] === 'forge') [0, 1, 2, 6, 9].forEach(i => $('#fTray').children[i].click());
    if (mode[1] === 'tinker' && mode[4] === '2') { scene.hand = 'cam'; scene.marks(); }
    sim(+mode[5] || 4, mode[1] === 'gate' ? () => scene.state !== 'ask' : null);
    const pose = {
      stolen: () => { scene.stolen = 2; },
      cut: () => { const i = scene.q.findIndex(v => !v.friend); scene.i = i; scene.state = 'ask'; scene.let = 1; scene.decide(true); sim(2.3); },
      oldest: () => { scene.tiles = [...scene.tray.filter(x => x.k === 'w').slice(0, 5), scene.tray.find(x => x.k === 'n'), scene.tray.find(x => x.k === 's')]; scene.refresh(); },
      costume: () => { const i = scene.q.findIndex(v => v.costume !== undefined); if (i >= 0) { scene.i = i; scene.state = 'ask'; scene.at = V.t; } },
      cap: () => { const i = scene.q.findIndex(v => !v.friend && v.costume === undefined); scene.q[i].disguise = 4; scene.i = i; scene.state = 'ask'; scene.at = V.t; },
      win: () => stationWin(scene.id, 3, 3, mode[1] === 'forge' ? t('forgeWin') : '', mode[1] === 'forge' ? scene.goalsHtml([true, true, false]) : ''),
    }[mode[6]];
    if (pose) { pose(); sim(.1); }
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
      where = `raid night ${n}`; sim(300, () => !scene.endT); await waitDlg('night end ' + n);
      // Night 2 brings a promotion: leave without pressing OK, as a reload would, and the ceremony must still come
      if (n === 2) { check(S.promo === true, 'a promotion is remembered in the save'); go('hub'); check(scene.id === 'badge', 'an interrupted ceremony still takes place, got ' + scene.id); } else clickDlg();
      check(S.night === n + 1, 'night advanced');
      if (scene.id === 'badge') { sim(2); await note(`night ${n}: promoted to rank ${rank()}${scene.party ? ' (finale)' : ''}`); $('.bar .btn').click(); }
      check(scene.id === 'tinker', 'tinker after night, got ' + scene.id);
      await note(`night ${n} played: stars ${S.stars}, moonbeams ${S.beams}, jars in nest ${S.nest}`);
    }
    check(rank() === 3, 'chief rank after night 7');
    go('badge'); sim(2); check(scene.party && $('#fin').textContent.includes(playerName()), 'chief party on the badge screen greets the player by name');
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
      for (const el of document.querySelectorAll('#ui .btn, #ui .card, #ui .tile, #ui .pal, #ui .pill, #ui .dlg, #ui .ref, #ui .slots, #ui .meter, #ui input, #ui .title, #ui .foot, #ui .bubble, #ui .toast, #ui .goals')) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (r.left < -1 || r.right > W + 1) flag(screen, el, `leaves the screen sideways (${Math.round(r.left)}..${Math.round(r.right)} of ${W})`);
        if (r.top < -1 || r.bottom > H + 1) flag(screen, el, `leaves the screen vertically (${Math.round(r.top)}..${Math.round(r.bottom)} of ${H})`);
        if (el.matches('.btn, .card, .tile, .pal') && (r.width < 47.5 || r.height < 47.5)) flag(screen, el, `tap target is only ${Math.round(r.width)}x${Math.round(r.height)}`);
        if (el.matches('.btn, .pill, .tile, .pal, .card') && el.scrollWidth > el.clientWidth + 2) flag(screen, el, `text is clipped (${el.scrollWidth} > ${el.clientWidth})`);
      }
      const d = $('#ui .dlg');
      if (d && d.scrollHeight > d.clientHeight + 2) flag(screen, d, `dialog needs scrolling (${d.scrollHeight} > ${d.clientHeight})`);
      const blocks = [...document.querySelectorAll('#ui .hud > *:not(.sp), #ui .ref, #ui .hub .cards, #ui .hub .row, #ui .gatebtns .btn, #ui .forge > *, #ui .palette, #ui .home > .title, #ui .home > .row, #ui .home > .foot')].filter(e => e.getBoundingClientRect().width);
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
      S.st = { cam: 3, gate: 2, forge: 1 }; go('hub'); look('hub ready for raid');
      for (const n of [1, 4, 8]) {
        reset(n);
        go('cam'); look(`cam intro n${n}`); clickDlg(); sim(3); look(`cam n${n}`);
        scene.stolen = 3; scene.finish(false); await sleep(750); look(`cam soft fail n${n}`); clickDlg(0);
        go('cam'); clickDlg(); stationWin('cam', 3, 3); look(`station win n${n}`); clickDlg();
        go('gate'); look(`gate intro n${n}`); clickDlg(); sim(1.2); look(`gate n${n}`);
        // the password bubble is drawn on the canvas: no part of the overlay may cover it
        scene.draw();
        for (const el of document.querySelectorAll('#ui .ref, #ui .hud > *:not(.sp)')) {
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
      go('badge', { promo: true }); sim(.5); look('badge promotion');
      reset(8); go('badge', { promo: true }); sim(.5); look('badge finale');
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
  }

  if (mode[0] !== 'smoke' && mode[0] !== 'audit') return;
  try { await (mode[0] === 'smoke' ? smoke() : audit()); } catch (e) { bad(`driver crashed at [${where}]: ${e.stack || e}`); }
  await post(out);
  if (parent !== window) parent.postMessage('nw-done', '*');
})();
