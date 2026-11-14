// Smoke test: plays every station and screen in headless Firefox and reports script errors.
// Run: node test/smoke.js            (needs firefox; exits 1 on any error)
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync, spawn } = require('child_process');
const root = path.join(__dirname, '..'), page = path.join(os.tmpdir(), 'nw-test.html');
execFileSync(path.join(root, 'build.sh'), [page, path.join(__dirname, 'driver.js')]);

// Static check: every literal t('key') in the sources exists in the localization table.
const src = fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.js')).map(f => fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('\n');
const L = new Function(fs.readFileSync(path.join(root, 'src', '10-i18n.js'), 'utf8') + '; return L;')();
const missing = [...new Set([...src.matchAll(/\bt\('([A-Za-z0-9_]+)'\s*[,)]/g)].map(m => m[1]))].filter(k => !L[k]);
if (missing.length) { console.error('missing i18n keys:', missing); process.exit(1); }

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'nw-ff-'));
let ff;
const finish = code => { if (ff) ff.kill('SIGKILL'); fs.rmSync(profile, { recursive: true, force: true }); fs.rmSync(page, { force: true }); process.exit(code); };
const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      res.end('ok');
      const r = JSON.parse(body);
      if (r.progress) return console.log(r.progress);
      if (r.errors.length) console.error('ERRORS:\n' + r.errors.join('\n'));
      else console.log('SMOKE OK');
      finish(r.errors.length ? 1 : 0);
    });
  } else { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fs.readFileSync(page)); }
}).listen(0, '127.0.0.1', () => {
  ff = spawn('firefox', ['--headless', '--no-remote', '--profile', profile, '--window-size=412,800', `http://127.0.0.1:${server.address().port}/#smoke`], { stdio: 'ignore' });
  setTimeout(() => { console.error('TIMEOUT: no report from the browser'); finish(1); }, 280000);
});
