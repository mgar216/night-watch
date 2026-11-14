// ---------- Test driver: appended inside the game's scope only for test builds ----------
// #smoke : play everything with simulated time and POST a report.  #shot,scene,night,lang,dlg : pose one screen for a screenshot.
(async () => {
  const out = { errors: [], notes: [] }, mode = location.hash.slice(1).split(',');
  window.onerror = (m, s, l, c, e) => { out.errors.push(`${m} @${l}:${c} ${e && e.stack || ''}`); };
  window.addEventListener('unhandledrejection', e => out.errors.push('rejection: ' + (e.reason && e.reason.stack || e.reason)));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const note = s => { fetch('/', { method: 'POST', body: JSON.stringify({ progress: s }) }); };
  const check = (ok, msg) => { if (!ok) out.errors.push('ASSERT ' + msg); };
  // Simulated time: logic every step, drawing every 12th step (drawing is the slow part in a headless browser).
  const sim = (sec, each) => { for (let i = 0; i < sec * 30; i++) { V.t += 1 / 30; if (scene.update) scene.update(1 / 30); if (i % 12 === 0 || mode[0] === 'shot') { scene.draw(1 / 30); drawFx(1 / 30); drawPortrait(); } if (each && each() === false) break; } };
  const clickDlg = (i = -1) => { const b = [...document.querySelectorAll('.veil .acts .btn')]; if (!b.length) return false; b[i < 0 ? b.length - 1 : i].click(); return true; };
  const waitDlg = async label => { for (let i = 0; i < 100; i++) { if ($('.veil')) return true; await sleep(50); } out.errors.push('no dialog: ' + label); return false; };
  const reset = n => { Object.assign(S, { night: n, st: { cam: 0, gate: 0, forge: 0 }, beams: 300, stars: 0, items: [{ t: 'cam', m: 1 }], nest: 0, testStar: 0, briefed: n, chief: false, tinkered: 1, name: 'Mia' }); };
  const tOrig = t;
  t = (k, v) => { if (!L[k]) out.errors.push('missing i18n key ' + k); return tOrig(k, v); };

  if (mode[0] === 'shot') {
    reset(+mode[2] || 1); setLang(+mode[3] || 0);
    if (mode[1] === 'hub' && mode[4] === '1') S.briefed = 0;
    if (mode[1] === 'tinker' || mode[1] === 'raid') S.items.push({ t: 'lamp', m: 4 }, { t: 'bell', m: 15 }, { t: 'shield', m: VAULT }, { t: 'banner', m: 18 }, { t: 'flowers', m: 20 }, { t: 'lights', m: 19 }, { t: 'scope', m: 21 });
    go(mode[1], mode[1] === 'badge' ? { promo: mode[4] === '1' } : mode[1] === 'raid' ? { test: true } : undefined);
    if (mode[4] !== '1') clickDlg();
    if (mode[1] === 'forge') [0, 1, 2, 6, 9].forEach(i => $('#fTray').children[i].click());
    if (mode[1] === 'tinker' && mode[4] === '2') { scene.hand = 'cam'; scene.marks(); }
    sim(+mode[5] || 4, mode[1] === 'gate' ? () => scene.state !== 'ask' : null);
    return;
  }
  if (mode[0] !== 'smoke') return;
  try {
    // --- sound code paths (the context may stay suspended without a real tap; node creation still runs) ---
    audioOn(); for (const k in sfx) sfx[k](1); musicTick(); setMute(true); setMute(false);
    // --- pure logic ---
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
    // a guarded design stops the Night 1 raid; an empty one loses jars
    reset(1); S.items = [{ t: 'cam', m: 1 }, { t: 'cam', m: 4 }, { t: 'bell', m: 15 }];
    let R = makeRaid(raidPlan(1, { cam: 1, gate: 1, forge: 1 }), 0); while (!R.done) stepRaid(R, 1 / 30);
    check(R.stolen === 0 && !Object.keys(R.reached).length, 'guarded raid should be clean: ' + JSON.stringify(R.reached));
    S.items = []; R = makeRaid(raidPlan(1, { cam: 1, gate: 1, forge: 1 }), 0); while (!R.done) stepRaid(R, 1 / 30);
    check(R.stolen > 0 && R.stolen <= 3, 'unguarded raid should lose 1-3 jars: ' + R.stolen);
    check(observe(R) === t('o_none'), 'observation for empty design');

    note('logic checks done, errors so far: ' + out.errors.length);
    // --- every screen in every language ---
    for (let l = 0; l < 3; l++) { setLang(l); for (const s of ['home', 'hub', 'badge']) { reset(1); S.briefed = 0; go(s); sim(1); clickDlg(); sim(.5); } }
    setLang(0); go('home'); scene.down(V.w / 2, V.h / 2); $('#bSnd').click(); $('#bSnd').click(); $('[data-l="2"]').click(); $('[data-l="0"]').click();
    // real hit-testing: overlays must not swallow taps meant for the canvas, and buttons must stay on top
    const hit = (x, y) => document.elementFromPoint(x, y), TA = treeArea();
    check(hit(TA.ox + 300 * TA.k, TA.oy + 868 * TA.k) === cv, 'home: big jar reaches the canvas');
    const pr = $('#bPlay').getBoundingClientRect(); check($('#bPlay').contains(hit(pr.left + pr.width / 2, pr.top + pr.height / 2)), 'home: play button on top');
    check(pr.height >= 48 && [...document.querySelectorAll('.btn')].every(b => b.getBoundingClientRect().height >= 48 && b.getBoundingClientRect().width >= 48), 'home: tap targets at least 48px');
    reset(1); go('hub'); check(hit(TA.ox + 500 * TA.k, TA.oy + 250 * TA.k) === cv, 'hub: tree reaches the canvas');
    check([...document.querySelectorAll('.card')].every(b => b.getBoundingClientRect().right <= V.w + 1 && b.getBoundingClientRect().bottom <= V.h + 1), 'hub: cards fit the screen');

    note('screens done');
    // --- full Nights 1..8 ---
    for (let n = 1; n <= 8; n++) {
      reset(n); setLang(n % 3);
      go('cam'); clickDlg();
      sim(400, () => { scene.feeds.forEach((f, i) => { const m = f.mag; if (m && m.state === 'walk' && !m.decoy && m.x > .1 && m.x < .9 && scene.batt >= 1) scene.flash(i); }); return scene.run; });
      await waitDlg('cam win ' + n); check(S.st.cam >= 2, `cam stars night ${n}: ${S.st.cam}`); clickDlg();
      go('cam'); clickDlg(); scene.key({ key: '1', target: document.body, preventDefault() {} }); scene.key({ key: 'ArrowRight', target: document.body, preventDefault() {} });
      sim(400, () => scene.run); await waitDlg('cam lose ' + n); check(scene.stolen === 3 || scene.time <= 0, 'cam soft fail'); clickDlg(0);

      go('gate'); clickDlg();
      sim(200, () => { if (scene.state === 'ask') scene.decide(scene.q[scene.i].friend); return scene.run; });
      await waitDlg('gate win ' + n); check(S.st.gate === 3, `gate stars night ${n}: ${S.st.gate}`); clickDlg();
      go('gate'); clickDlg(); sim(200, () => { if (scene.state === 'ask') scene.decide(true); return scene.run; });
      await waitDlg('gate lose ' + n); check(scene.let === 2, 'gate soft fail after two tricksters'); clickDlg(0);

      go('forge'); clickDlg();
      $('#fTray').children[0].click(); scene.tryIt(); sim(1); await sleep(2500); check(!!$('.veil') || n === 0, 'forge crack tip ' + n); clickDlg();
      $('#fSlots').children[0].click();
      const idx = k => scene.tray.map((x, i) => i).filter(i => scene.tray[i].k === k);
      [...idx('w').slice(0, 3), idx('n')[0], idx('s')[0], ...(n >= 7 ? [idx('w')[3]] : [])].forEach(i => $('#fTray').children[i].click());
      check(scene.sec >= scene.goal, `forge goal reachable night ${n}`); scene.tryIt(); sim(1);
      await waitDlg('forge win ' + n); check(S.st.forge === 3, `forge stars night ${n}: ${S.st.forge}`); clickDlg();

      go('tinker'); clickDlg(); sim(.5);
      check(document.elementFromPoint(scene.T().ox + MOUNTS[1][0] * scene.T().k, scene.T().oy + MOUNTS[1][1] * scene.T().k) === cv, 'tinker: mounts reach the canvas');
      check([...document.querySelectorAll('.pal')].every(b => b.getBoundingClientRect().height >= 48 && b.getBoundingClientRect().right <= V.w + 1), 'tinker: palette fits');
      const T = scene.T(), at = m => [T.ox + MOUNTS[m][0] * T.k, T.oy + (MOUNTS[m][1] - 20) * T.k];
      $('.pal[data-k="lamp"]').onpointerdown({ clientX: 30, clientY: V.h - 30 }); scene.move(...at(4)); sim(.2); scene.up(...at(4));
      check(S.items.some(i => i.t === 'lamp' && i.m === 4), 'drag-place lamp');
      $('.pal[data-k="cam"]').onpointerdown({ clientX: 30, clientY: V.h - 30 }); scene.up(30, V.h - 30); scene.down(...at(4 + 1)); scene.up(...at(5));
      check(S.items.some(i => i.t === 'cam' && i.m === 5), 'tap-place camera');
      scene.down(...at(5)); scene.move(...at(12)); sim(.2); scene.up(...at(12)); check(S.items.some(i => i.t === 'cam' && i.m === 12), 'drag-move camera');
      for (const k of PALETTE) { scene.hand = k; scene.place(k === 'shield' ? VAULT : scene.free(k)[0]); }
      scene.key({ key: 'ArrowRight', target: document.body, preventDefault() {} }); sim(.3);
      $('#tTest').click(); sim(300, () => !scene.endT); await waitDlg('test raid ' + n); clickDlg();
      check(scene.id === 'tinker', 'back in tinker after test raid'); $('#tDone').click();
      check(!$('#bRaid').disabled, 'raid button ready'); $('#bRaid').click();
      sim(300, () => !scene.endT); await waitDlg('night end ' + n); clickDlg();
      check(S.night === n + 1, 'night advanced');
      if (scene.id === 'badge') { sim(2); note(`night ${n}: promoted to rank ${rank()}${scene.party ? ' (finale)' : ''}`); $('.bar .btn').click(); }
      check(scene.id === 'tinker', 'tinker after night, got ' + scene.id);
      note(`night ${n} ok: stars ${S.stars}, beams ${S.beams}, nest ${S.nest}`);
    }
    check(rank() === 3, 'chief rank after night 7');
    S.chief = true; go('badge'); sim(2); check(scene.party, 'chief party on badge screen');
  } catch (e) { out.errors.push('driver: ' + (e.stack || e)); }
  fetch('/', { method: 'POST', body: JSON.stringify(out) });
})();
