#!/usr/bin/env node
// Records the owl's spoken lines with ElevenLabs. Run from the repository root.
//
//   node tools/voice.js plan [-v]                what would be recorded (sentences, characters per language); nothing is sent
//   node tools/voice.js voices                   the account's remaining characters and its voices, to choose the owl's voice below
//   node tools/voice.js sample [dir]             one test line per language into dir (default /tmp/nw-voice-sample)
//   node tools/voice.js make [en ru it] [--max N]  record the missing clips (at most N characters), then rewrite src/31-voices.js
//   node tools/voice.js list                     only rewrite src/31-voices.js from the clips that exist
//   node tools/voice.js prune                    delete clips that no sentence uses any more, then rewrite the list
//
// The API key is read from ~/.config/elevenlabs/api_key (or the variable ELEVENLABS_API_KEY). It is never printed.
// A clip is voice/<lang>/<hash>.mp3 with hash = vhash(lang + ':' + sentence); the game computes the same hash at run time
// (src/30-audio.js), so a changed sentence simply gets a new clip and the old one can be pruned.
// Magpies are not recorded: in the game they only babble.
const fs = require('fs'), os = require('os'), path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

// The owl's voice. To change it: put another id here (or in NW_OWL_VOICE), delete the voice folder, run `make` again.
const OWL = { id: process.env.NW_OWL_VOICE || 'JBFqnCBsd6RMkjVDRZzb', settings: { stability: .5, similarity_boost: .75, style: .3, use_speaker_boost: true } };   // George: warm storyteller
const MODEL = 'eleven_multilingual_v2', FORMAT = 'mp3_22050_32';

// The text table, and the two functions that must match the game exactly: they are taken from the game's own source.
const { L, LANGS } = new Function(read('src/10-i18n.js') + '; return { L, LANGS };')();
const audio = read('src/30-audio.js');
const vhash = new Function(audio.match(/function vhash[^\n]+/)[0] + '; return vhash;')();
const sentences = new Function(audio.match(/const sentences = [^\n]+/)[0] + '; return sentences;')();

// Which rows are spoken: every row whose English text ends like a sentence, the rows in ALSO, and every name (k_ rows),
// but not the rows in SKIP (labels, lines of the magpies, lines that carry a free value such as the player's name).
const SKIP = new Set(['foot', 'go', 'cracked', 'finale', 'eraseAsk', 'bedAsk', 'giveUp', 'roomNew', 'stkNew', 'bossGo', 'code_done', 'pie_ready',   // labels, titles, questions for grown-ups
  'please', 'lost', 'mail_hehe', 'pie_mIn', 'pie_mSulk', 'boss_say1', 'boss_say2', 'boss_say3', 'boss_say4']);                             // magpies and the Baron: bubbles and babble
const ALSO = new Set(['poor']);
// Rows with a placeholder that only takes a few known values are recorded once for each value.
const ROUTES = ['r_lt', 'r_rt', 'r_lb', 'r_rb', 'r_lad', 'r_sky'];
const FILL = { o_route: ['r', ROUTES], o_busy: ['r', ROUTES], promo: ['r', ['rank1', 'rank2', 'rank3']], streak: ['n', [3, 5, 8]] };
// What the voice is given can differ from what the screen shows (a clip is named after the shown sentence):
// - a number is written out: "3 di fila!" was read in another language;
// - the Russian word for magpie carries a stress mark: without it some lines sounded like the number forty;
// - a sentence in SAY is given as written there (a stress mark where the voice put the stress on the wrong syllable);
// - a sentence in AROUND stands alone in its row and came out wrong that way: the voice is told what is said before and
//   after it (two of five takes of "Сороки летят!" were heard right by both recognisers, both with neighbours).
// Found by transcribing every clip with whisper.cpp (small and large-v3-turbo) and comparing (2026-11-15).
const NUM = { en: { 3: 'Three', 5: 'Five', 8: 'Eight' }, ru: { 3: 'Три', 5: 'Пять', 8: 'Восемь' }, it: { 3: 'Tre', 5: 'Cinque', 8: 'Otto' } };
const SAY = { 'ru:У тени нет глаз.': 'У те\u0301ни нет глаз.' };
const AROUND = { 'ru:Сороки летят!': ['Тревога!', 'Все по местам!'], 'en:Leaf hat': ['This disguise is called:', 'A magpie hides under it.'] };
function spoken(lang, s) {
  const out = SAY[lang + ':' + s] || String(s || '').replace(/\d+/g, d => NUM[lang][d] || d);
  return lang === 'ru' ? out.replace(/(соро)(?=к[а-яё])/gi, '$1\u0301') : out;   // (no pattern trick for the other languages: /$^/ matched an empty neighbour and sent "$1" as context)
}

function plan() {
  const clips = new Map(), odd = [];
  for (const key of Object.keys(L)) {
    if (SKIP.has(key) || !(/[.!?…]$/.test(L[key][0]) || ALSO.has(key) || key.startsWith('k_'))) continue;
    LANGS.forEach((lang, li) => {
      const fill = FILL[key];
      const texts = fill ? fill[1].map(v => L[key][li].replace(`{${fill[0]}}`, () => L[v] ? L[v][li] : v)) : [L[key][li]];
      for (const text of texts) {
        if (/[{}]/.test(text)) { odd.push(`${key} [${lang}]: ${text}`); continue; }
        const parts = sentences(text);
        parts.forEach((s, i) => {
          const hash = vhash(lang + ':' + s);
          if (!clips.has(hash)) clips.set(hash, { hash, lang, text: s, before: parts.slice(0, i).join(' '), after: parts.slice(i + 1).join(' '), key });
        });
      }
    });
  }
  return { clips: [...clips.values()], odd };
}
const file = c => path.join(root, 'voice', c.lang, c.hash + '.mp3');
const missing = clips => clips.filter(c => !fs.existsSync(file(c)));
function writeList() {
  const have = LANGS.flatMap(l => fs.existsSync(path.join(root, 'voice', l)) ? fs.readdirSync(path.join(root, 'voice', l)).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)) : []).sort();
  fs.writeFileSync(path.join(root, 'src/31-voices.js'), '// Generated by tools/voice.js. Do not edit by hand.\n// Hashes of the sentences that have a recorded clip in voice/<lang>/<hash>.mp3.\n' +
    `const VOICE = new Set(${JSON.stringify(have)});\n`);
  return have.length;
}
function apiKey() {
  let k = process.env.ELEVENLABS_API_KEY || '';
  try { k = k || fs.readFileSync(path.join(os.homedir(), '.config/elevenlabs/api_key'), 'utf8'); } catch (e) { /* no file */ }
  k = k.trim();
  if (!k) { console.error('No ElevenLabs API key. Put it in ~/.config/elevenlabs/api_key'); process.exit(2); }
  return k;
}
async function api(url, init = {}) {
  const res = await fetch('https://api.elevenlabs.io' + url, { ...init, headers: { 'xi-api-key': apiKey(), ...(init.headers || {}) } });
  if (!res.ok) { const e = new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`); e.status = res.status; throw e; }
  return res;
}
const left = async () => { const s = (await (await api('/v1/user')).json()).subscription; return { tier: s.tier, left: s.character_limit - s.character_count }; };
// One sentence to one mp3. The sentences around it are sent as context, so the voice keeps its flow across a dialog.
async function tts(text, before, after) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await api(`/v1/text-to-speech/${OWL.id}?output_format=${FORMAT}`, { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, model_id: MODEL, voice_settings: OWL.settings, previous_text: before || undefined, next_text: after || undefined }) });
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (!(e.status === 429 || e.status >= 500) || attempt >= 4) throw e;   // only "too many requests" and server trouble are worth waiting for
      await new Promise(r => setTimeout(r, 4000 * attempt));
    }
  }
}

(async () => {
  const [cmd = 'plan', ...rest] = process.argv.slice(2), { clips, odd } = plan();
  // `--max 500` or `--max=500` limits the characters to record; anything else after --max is a mistake, not "no limit"
  const mi = rest.findIndex(a => a === '--max' || a.startsWith('--max=')), max = mi < 0 ? Infinity : Number(rest[mi].includes('=') ? rest[mi].split('=')[1] : rest[mi + 1]);
  if (!(max >= 0)) { console.error('--max needs a number of characters'); process.exit(1); }
  const langs = rest.filter(a => LANGS.includes(a));
  const chars = list => list.reduce((n, c) => n + c.text.length, 0);
  if (cmd === 'plan') {
    for (const l of LANGS) { const all = clips.filter(c => c.lang === l), todo = missing(all); console.log(`${l}: ${all.length} sentences, ${chars(all)} characters; still to record: ${todo.length} sentences, ${chars(todo)} characters`); }
    console.log(`total still to record: ${chars(missing(clips))} characters`);
    if (odd.length) console.log('not recorded (free values):\n  ' + odd.join('\n  '));
    if (rest.includes('-v')) for (const c of clips) console.log(`${c.lang} ${c.hash}  ${c.text}`);
  } else if (cmd === 'voices') {
    const a = await left();
    console.log(`plan: ${a.tier}; characters left: ${a.left}`);
    const { voices } = await (await api('/v1/voices')).json();
    for (const v of voices) console.log(`${v.voice_id}  ${v.name}  [${v.category}] ${Object.values(v.labels || {}).join(', ')}`);
    console.log(`owl: ${OWL.id} ${voices.some(x => x.voice_id === OWL.id) ? 'is in this account' : 'is NOT in this account'}`);
  } else if (cmd === 'sample') {
    const dir = rest[0] || '/tmp/nw-voice-sample';
    fs.mkdirSync(dir, { recursive: true });
    for (const [li, lang] of LANGS.entries()) {
      const parts = sentences(L.b1[li]);
      for (const [i, s] of parts.entries()) fs.writeFileSync(path.join(dir, `${lang}-${i}.mp3`), await tts(s, parts.slice(0, i).join(' '), parts.slice(i + 1).join(' ')));
    }
    console.log('samples in ' + dir);
  } else if (cmd === 'make') {
    const todo = missing(clips).filter(c => !langs.length || langs.includes(c.lang)), a = await left();
    console.log(`to record: ${todo.length} sentences, ${chars(todo)} characters; the account has ${a.left} characters left (plan: ${a.tier})`);
    let used = 0, done = 0;
    for (const c of todo) {
      const say = spoken(c.lang, c.text);   // what is sent, and what the account is charged for
      if (used + say.length > Math.min(max, a.left)) { console.log('stopped at the character limit'); break; }
      const [before, after] = AROUND[c.lang + ':' + c.text] || [c.before, c.after];
      const mp3 = await tts(say, spoken(c.lang, before), spoken(c.lang, after));
      fs.mkdirSync(path.dirname(file(c)), { recursive: true });
      fs.writeFileSync(file(c), mp3);
      used += say.length; done++;
      if (done % 25 === 0) console.log(`  ${done} of ${todo.length} recorded`);
    }
    console.log(`recorded ${done} clips, ${used} characters; ${writeList()} clips listed in src/31-voices.js`);
  } else if (cmd === 'list') console.log(`${writeList()} clips listed in src/31-voices.js`);
  else if (cmd === 'prune') {
    const keep = new Set(clips.map(file)); let gone = 0;
    for (const l of LANGS) for (const f of fs.existsSync(path.join(root, 'voice', l)) ? fs.readdirSync(path.join(root, 'voice', l)) : []) { const p = path.join(root, 'voice', l, f); if (!keep.has(p)) { fs.rmSync(p); gone++; } }
    console.log(`deleted ${gone} unused clips; ${writeList()} clips listed`);
  } else { console.error('unknown command: ' + cmd); process.exit(1); }
})().catch(e => { console.error(String(e.message || e)); process.exit(1); });
