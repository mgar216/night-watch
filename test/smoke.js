// Automated checks in headless Firefox. Exits 1 on any problem.
//   node test/smoke.js                 full play-through at phone size, then the layout and input audit at several screen sizes
//   node test/smoke.js calm            the same with "reduce motion" switched on
//   node test/smoke.js audit 360,640   only the audit, only at that size (any number of W,H sizes)
//   node test/smoke.js perf            frame rate of the heaviest screens (numbers to read, nothing is asserted)
//   node test/smoke.js tour            the game started on each old, damaged and randomly broken save of test/saves.js
//   node test/smoke.js round2          only the checks of the second QA list; every check is printed with its numbers
// Headless Firefox keeps a 1366 x 682 window unless it is taking a screenshot, so every run happens
// inside an <iframe> of the wanted size; the game sees the iframe as its window.
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync, spawn } = require('child_process');
// each run has a page file of its own, so several runs (from copies of the repository) do not get in each other's way
const root = path.join(__dirname, '..'), page = path.join(os.tmpdir(), `nw-test-${process.pid}.html`);
const args = process.argv.slice(2), calm = args.includes('calm'), sizes = args.filter(a => /^\d+,\d+$/.test(a));
const AUDIT = ['360,640', '640,360', '768,1024', '1280,720'];
const only = ['audit', 'perf', 'round2'].find(m => args.includes(m));
// `tour`: the game starts once on each prepared save of test/saves.js (`tour only=seed` runs the saves whose name holds "seed")
const part = (args.find(a => a.startsWith('only=')) || '').slice(5);
const saves = args.includes('tour') ? require('./saves.js').nw.filter(([name]) => name.includes(part)) : [];
const runs = saves.length ? saves.map(([name]) => ['tour', '412,800', name]) : only ? (sizes.length ? sizes : only === 'audit' ? AUDIT : ['412,800']).map(s => [only, s]) : [['smoke', '412,800'], ...AUDIT.map(s => ['audit', s])];
execFileSync(path.join(root, 'build.sh'), [page, path.join(__dirname, 'driver.js')]);

// Static check: every literal t('key') in the sources exists in the localization table.
const src = fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('\n');
const L = new Function(fs.readFileSync(path.join(root, 'src', '10-i18n.js'), 'utf8') + '; return L;')();
const missing = [...new Set([...src.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)].map(m => m[1]))].filter(k => !L[k]);
if (missing.length) { console.error('missing i18n keys:', missing); process.exit(1); }

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'nw-ff-'));
// the owl's recorded clips may play without a tap in the test browser
fs.writeFileSync(path.join(profile, 'user.js'), 'user_pref("media.autoplay.default", 0);\n' + (calm ? 'user_pref("ui.prefersReducedMotion", 1);\n' : ''));
let ff, failed = 0, done = 0, watchdog;
const finish = code => { if (ff) ff.kill('SIGKILL'); fs.rmSync(profile, { recursive: true, force: true }); fs.rmSync(page, { force: true }); process.exit(code); };
const alive = () => { clearTimeout(watchdog); watchdog = setTimeout(() => { console.error('TIMEOUT: the browser went silent'); finish(1); }, 240000); };
const server = http.createServer((req, res) => {
  alive();
  if (req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      res.end('ok');
      const r = JSON.parse(body), tag = `[${runs[r.run] ? runs[r.run].join(' ') : '?'}${calm ? ' calm' : ''}]`;
      if (r.progress) return console.log(`${tag} ${r.progress}`);
      if (r.errors.length) { failed += r.errors.length; console.error(`${tag} ${r.errors.length} PROBLEMS:\n` + r.errors.join('\n')); } else console.log(`${tag} ok`);
      if (++done === runs.length) { console.log(failed ? `FAILED: ${failed} problems` : 'SMOKE OK'); finish(failed ? 1 : 0); }
    });
  } else if (req.url.startsWith('/game')) { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fs.readFileSync(page)); }
  else if (req.url.startsWith('/voice/')) {
    const file = path.join(root, path.normalize(req.url.split('?')[0]));
    if (!file.startsWith(path.join(root, 'voice')) || !fs.existsSync(file)) { res.statusCode = 404; return res.end(); }
    res.setHeader('Content-Type', 'audio/mpeg'); res.end(fs.readFileSync(file));
  }
  else {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!DOCTYPE html><meta name="viewport" content="width=device-width, initial-scale=1"><body style="margin:0;background:#333"><script>
      const runs = ${JSON.stringify(runs)}, stores = ${JSON.stringify(saves.map(s => s[1])).replace(/</g, '\\u003c')}; let i = 0;
      function next() {
        if (i >= runs.length) return;
        const [mode, size] = runs[i], [w, h] = size.split(','), f = document.createElement('iframe');
        if (stores[i]) { localStorage.clear(); for (const k in stores[i]) localStorage.setItem(k, stores[i][k]); }   // a tour starts on a prepared storage
        f.style.cssText = 'border:0;display:block;width:' + w + 'px;height:' + h + 'px';
        f.src = '/game?run=' + i++ + '#' + mode;
        document.body.replaceChildren(f);          // one run at a time
      }
      addEventListener('message', e => { if (e.data === 'nw-done') next(); });
      next();
    </script></body>`);
  }
}).listen(0, '127.0.0.1', () => {
  // NW_OPEN='command with {url}' opens the suite in another browser instead of headless Firefox, for example real Chrome on
  // the phone through Shizuku: NW_OPEN='rish -c "am start -a android.intent.action.VIEW -d {url} com.android.chrome"'
  const url = `http://127.0.0.1:${server.address().port}/`;
  if (process.env.NW_OPEN) spawn('sh', ['-c', process.env.NW_OPEN.replace('{url}', url)], { stdio: 'inherit' });
  else ff = spawn('firefox', ['--headless', '--no-remote', '--profile', profile, url], { stdio: 'ignore' });
  alive();
});
