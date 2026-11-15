// The day cycle across the two games, in headless Firefox with real page changes. Exits 1 on any problem.
//   node test/cycle.js
// Night Watch (night) -> first light -> First Light Fishing (day) -> the treehouse in the evening -> Night Watch (night).
// The in-page drivers cannot check this: each of them lives in one page. Here a wrapper page holds the games in an
// <iframe> of phone size, prepares a save, and presses the real buttons.
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync, spawn } = require('child_process');
const root = path.join(__dirname, '..'), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nw-cycle-'));
const pages = { '/index.html': path.join(tmp, 'nw.html'), '/fishing/index.html': path.join(tmp, 'flf.html') };
execFileSync(path.join(root, 'build.sh'), [pages['/index.html']]);
// the fishing page carries its test driver, which does nothing by day except offer `flfTest` (a fish landed, the lent lures)
execFileSync(path.join(root, 'fishing', 'build.sh'), [pages['/fishing/index.html'], path.join(root, 'fishing', 'test', 'driver.js')]);
const L = new Function(fs.readFileSync(path.join(root, 'src', '10-i18n.js'), 'utf8') + '; return L;')();

// This function runs in the wrapper page. step(label, fn) waits until fn() is truthy: the games answer in their own time.
const wrapper = async T => {
  const f = document.querySelector('iframe'), doc = () => f.contentDocument, win = () => f.contentWindow, log = [], errors = [];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const step = async (label, fn) => { for (let i = 0; i < 150; i++) { try { const v = fn(); if (v) return v; } catch (e) { /* the page is changing */ } await sleep(100); } throw new Error('never happened: ' + label); };
  const check = (ok, text) => { log.push((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) errors.push(text); };
  const at = file => win().location.pathname === file && doc().readyState === 'complete';
  const key = k => JSON.parse(localStorage.getItem(k) || 'null');
  try {
    // the second player of the Night Watch: Russian, sound off, in the middle of Night 3, with a day pending, five
    // lanterns earned and a banana peel on the tree
    localStorage.clear();
    localStorage.setItem('nightwatch.slot', '1');
    localStorage.setItem('nightwatch.v1.2', JSON.stringify({ lang: 1, mute: true, voice: false, name: 'Лео', night: 3, briefed: 3, day: 1, lit: 5, items: [{ t: 'cam', m: 1 }, { t: 'peel', m: 0 }] }));
    f.src = '/index.html';
    (await step('the home screen', () => at('/index.html') && doc().querySelector('#bPlay'))).click();
    const fish = await step('first light', () => doc().querySelector('.veil .acts .btn.go'));
    check(doc().querySelectorAll('.veil .acts .btn').length === 2 && doc().documentElement.lang === 'ru', 'Play meets first light, in the player\'s language, with two answers');
    fish.click();
    await step('the fishing map', () => at('/fishing/index.html') && doc().querySelector('#mapGo'));
    check(win().location.hash === '#day' && !doc().querySelector('#bPlay'), 'going fishing opens the fishing game on its map, not on its title');
    check(doc().documentElement.lang === 'ru', 'the fishing game speaks the player\'s language: ' + doc().documentElement.lang);
    const mine = key('firstlight.v1.2');
    check(key('nightwatch.v1.2').day === 0, 'the day is used up in the Night Watch save');
    check(!!mine && mine.name === 'Лео' && mine.mute === true && !localStorage.getItem('firstlight.v1'), 'the second player has a fishing career of their own, with their name and sound switch');
    // what the Night Watch earned shows by day: its lanterns on the map, its gadget's lure in the tackle box
    check(doc().querySelector('#lanPill b').textContent === '5/24', 'five Nights without a lost jar are five lit lanterns on the map: ' + doc().querySelector('#lanPill b').textContent);
    check(win().flfTest.lures().join() === 'nwl_peel', 'the banana peel on the treehouse lends its lure, and only that one: ' + win().flfTest.lures());
    await sleep(1200);                                 // the owl's first words about the map, if any, are answered
    for (let i = 0; i < 5 && doc().querySelector('.veil .acts .btn'); i++) { const b = doc().querySelectorAll('.veil .acts .btn'); b[b.length - 1].click(); await sleep(300); }
    (await step('the way into the treehouse', () => !doc().querySelector('.veil') && doc().querySelector('#mapGo'))).click();
    // Three fish landed by day leave a note for this player's owl. The page is loaded again after the second one (a
    // phone drops a background tab): the two still count. A Legendary landed that day goes into the player's logbook
    // just before the evening: its gift must arrive with the Night.
    await step('the treehouse by day', () => doc().querySelector('#hNight'));
    win().flfTest.land(); win().flfTest.land();
    f.contentWindow.location.reload();
    await step('the map again, after the reload', () => at('/fishing/index.html') && win().flfTest && doc().querySelector('#mapGo') && !doc().querySelector('#hNight'));
    check(win().location.hash === '#day' && key('firstlight.day.2').n === 2, 'a reload by day stays in the day, with the note of two fish: ' + JSON.stringify(key('firstlight.day.2')));
    await sleep(600);
    for (let i = 0; i < 5 && doc().querySelector('.veil .acts .btn'); i++) { const b = doc().querySelectorAll('.veil .acts .btn'); b[b.length - 1].click(); await sleep(300); }
    (await step('the way into the treehouse again', () => !doc().querySelector('.veil') && doc().querySelector('#mapGo'))).click();
    const night = await step('the evening button', () => doc().querySelector('#hNight'));
    win().flfTest.land();
    const left = key('firstlight.day.2'), career = key('firstlight.v1.2');
    check(!!left && left.n === 3 && left.k === 3 && !localStorage.getItem('firstlight.day'), 'two fish before the reload and one after are three for the second player\'s owl: ' + JSON.stringify(left));
    career.log.aurora = { n: 1, best: 4200, seen: 1 }; localStorage.setItem('firstlight.v1.2', JSON.stringify(career));
    night.click();
    await step('the Night Watch again', () => at('/index.html') && win().location.hash === '#night' && doc().querySelector('.hub'));
    check(!doc().querySelector('#bPlay'), 'the evening leads straight to the Night, not to the home screen');
    // news first (the gift), then the day's first words (supper)
    const news = await step('the news of the gift', () => doc().querySelector('.veil.clear #owlText'));
    check(news.textContent.includes('Аврора') && key('nightwatch.v1.2').gifts.aurora === 1, 'the Legendary caught by day brings its gift to the Night: ' + news.textContent);
    doc().querySelector('.veil .acts .btn').click();
    const sup = await step('fish for supper', () => doc().querySelector('.veil:not(.clear) #owlText'));
    check(sup.textContent.includes(T.eye) && key('nightwatch.v1.2').eye === 1, 'the day\'s fish are supper, and supper brings an owl\'s eye: ' + sup.textContent);
    doc().querySelector('.veil .acts .btn').click(); await sleep(1800);
    check(doc().querySelector('.hud .pill.extra').textContent.includes('3') && !doc().querySelector('.veil'), 'it is still Night 3, and first light does not come twice: ' + doc().querySelector('.hud .pill.extra').textContent);
    doc().querySelector('.card[data-s="gate"]').click();
    (await step('the first word at the gate', () => doc().querySelector('.veil .acts .btn'))).click();
    check(!!(await step('the owl\'s eye button', () => doc().querySelector('#bEye'))), 'at tonight\'s Gate Check the owl has its eye ready');
    // a visit of its own (no #day in the address) starts at the title, and the title leads to the Night Watch home
    f.src = '/fishing/index.html';
    await step('the fishing title', () => at('/fishing/index.html') && win().location.hash === '' && doc().querySelector('#bPlay'));
    check(doc().querySelector('#bSister').getAttribute('href') === '../index.html', 'a visit of its own starts at the title, which leads to the Night Watch home');
  } catch (e) { check(false, String(e.message || e)); }
  await fetch('/report', { method: 'POST', body: JSON.stringify({ log, errors }) });
};

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'nw-ff-'));
let ff;
const finish = code => { if (ff) ff.kill('SIGKILL'); fs.rmSync(profile, { recursive: true, force: true }); fs.rmSync(tmp, { recursive: true, force: true }); process.exit(code); };
const watchdog = setTimeout(() => { console.error('TIMEOUT: the browser went silent'); finish(1); }, 180000);
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      res.end('ok');
      clearTimeout(watchdog);
      const r = JSON.parse(body);
      console.log(r.log.join('\n'));
      console.log(r.errors.length ? `FAILED: ${r.errors.length} problems` : 'CYCLE OK');
      finish(r.errors.length ? 1 : 0);
    });
  } else if (pages[url]) { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fs.readFileSync(pages[url])); }
  else if (url === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!DOCTYPE html><meta name="viewport" content="width=device-width, initial-scale=1"><body style="margin:0;background:#333"><iframe style="border:0;display:block;width:412px;height:800px"></iframe><script>(${wrapper})(${JSON.stringify({ eye: L.eye1[1] })});</script></body>`);
  } else { res.statusCode = 404; res.end(); }   // the owl's voice clips are not needed: the sound is off in this save
}).listen(0, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${server.address().port}/`;   // NW_OPEN: another browser, as in test/smoke.js
  if (process.env.NW_OPEN) spawn('sh', ['-c', process.env.NW_OPEN.replace('{url}', url)], { stdio: 'inherit' });
  else ff = spawn('firefox', ['--headless', '--no-remote', '--profile', profile, url], { stdio: 'ignore' });
});
