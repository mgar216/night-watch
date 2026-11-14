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
execFileSync(path.join(root, 'fishing', 'build.sh'), [pages['/fishing/index.html']]);

// This function runs in the wrapper page. step(label, fn) waits until fn() is truthy: the games answer in their own time.
const wrapper = async () => {
  const f = document.querySelector('iframe'), doc = () => f.contentDocument, win = () => f.contentWindow, log = [], errors = [];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const step = async (label, fn) => { for (let i = 0; i < 150; i++) { try { const v = fn(); if (v) return v; } catch (e) { /* the page is changing */ } await sleep(100); } throw new Error('never happened: ' + label); };
  const check = (ok, text) => { log.push((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) errors.push(text); };
  const at = file => win().location.pathname === file && doc().readyState === 'complete';
  const key = k => JSON.parse(localStorage.getItem(k) || 'null');
  try {
    // the second player of the Night Watch: Russian, sound off, in the middle of Night 3, with a day pending
    localStorage.clear();
    localStorage.setItem('nightwatch.slot', '1');
    localStorage.setItem('nightwatch.v1.2', JSON.stringify({ lang: 1, mute: true, voice: false, name: 'Лео', night: 3, briefed: 3, day: 1 }));
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
    await sleep(1200);                                 // the owl's first words about the map, if any, are answered
    for (let i = 0; i < 5 && doc().querySelector('.veil .acts .btn'); i++) { const b = doc().querySelectorAll('.veil .acts .btn'); b[b.length - 1].click(); await sleep(300); }
    (await step('the way into the treehouse', () => !doc().querySelector('.veil') && doc().querySelector('#mapGo'))).click();
    (await step('the evening button', () => doc().querySelector('#hNight'))).click();
    await step('the Night Watch again', () => at('/index.html') && win().location.hash === '#night' && doc().querySelector('.hub'));
    check(!doc().querySelector('#bPlay'), 'the evening leads straight to the Night, not to the home screen');
    check(doc().querySelector('.hud .pill.extra').textContent.includes('3') && !doc().querySelector('.veil'), 'it is still Night 3, and first light does not come twice: ' + doc().querySelector('.hud .pill.extra').textContent);
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
    res.end(`<!DOCTYPE html><body style="margin:0;background:#333"><iframe style="border:0;display:block;width:412px;height:800px"></iframe><script>(${wrapper})();</script></body>`);
  } else { res.statusCode = 404; res.end(); }   // the owl's voice clips are not needed: the sound is off in this save
}).listen(0, '127.0.0.1', () => {
  ff = spawn('firefox', ['--headless', '--no-remote', '--profile', profile, `http://127.0.0.1:${server.address().port}/`], { stdio: 'ignore' });
});
