// ---------- Sound: effects and music are synthesized with the Web Audio API; spoken lines are recorded clips ----------
// ---------- with two fallbacks. Sound is never needed to play.
let AC = null, master = null;
let quiet = false;   // true while a raid is run again without sound, to find the place where its replay starts
function audioOn() {
  if (S.mute) return null;
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain(); master.gain.value = .5; master.connect(AC.destination);
      setInterval(musicTick, 200);
    }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) { AC = null; }
  return AC;
}
function setMute(m) {
  S.mute = m; save();
  if (m) hush();
  if (AC) m ? AC.suspend() : AC.resume();
  if (!m) audioOn();
}
// No lullaby and no talking from a tab or an app in the background.
document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); if (AC && !S.mute) document.hidden ? AC.suspend() : AC.resume(); });
// One enveloped oscillator note; `to` glides the pitch.
function tone(f, d = .15, type = 'sine', vol = .2, when = 0, to = 0, attack = .01) {
  if (S.mute || !AC || quiet) return;
  const t0 = AC.currentTime + when, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + d);
  g.gain.setValueAtTime(.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + d + .05);
}
function noise(d = .2, vol = .15, freq = 1800, when = 0) {
  if (S.mute || !AC || quiet) return;
  const n = AC.sampleRate * d | 0, buf = AC.createBuffer(1, n, AC.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(master); src.start(AC.currentTime + when);
}
const sfx = {
  click: () => tone(520, .06, 'triangle', .15),
  pop: () => tone(420, .12, 'sine', .25, 0, 900),
  sparkle: () => [1320, 1760, 2090, 2640].forEach((f, i) => tone(f, .25, 'sine', .09, i * .06)),
  chirp: () => { tone(2100, .07, 'sine', .12, 0, 2900); tone(2500, .07, 'sine', .12, .09, 3300); },
  hoot: () => { tone(330, .22, 'sine', .22, 0, 290); tone(300, .35, 'sine', .22, .28, 250); },
  flash: () => { tone(900, .08, 'square', .06); noise(.08, .1, 3000); },
  empty: () => tone(160, .12, 'square', .07),
  squawk: () => { tone(700, .14, 'sawtooth', .1, 0, 380); tone(620, .16, 'sawtooth', .1, .13, 300); buzz(25); },   // a caught magpie: the phone buzzes too
  bonk: () => { tone(190, .18, 'sine', .3, 0, 90); noise(.06, .12, 500); buzz(40); },
  boing: () => tone(180, .35, 'sine', .25, 0, 520),
  ding: () => { tone(1568, .5, 'sine', .2); tone(2093, .6, 'sine', .12, .12); },
  yes: () => { tone(660, .1, 'triangle', .18); tone(880, .16, 'triangle', .18, .09); },
  oops: () => { tone(330, .16, 'triangle', .16, 0, 260); tone(250, .24, 'triangle', .16, .15, 200); },
  tile: i => tone(392 * Math.pow(1.122, i % 8), .12, 'triangle', .18),
  type: () => noise(.03, .08, 2500),
  puff: () => noise(.35, .2, 700),
  slam: () => { tone(110, .4, 'sine', .35, 0, 50); noise(.15, .2, 300); },
  alarm: () => [0, .18, .36].forEach(w => sfx.chirpAt(w)),
  chirpAt: w => tone(2300, .09, 'sine', .12, w, 3100),
  coin: () => { tone(988, .08, 'square', .07); tone(1319, .2, 'square', .07, .07); },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .3, 'triangle', .16, i * .11)),
  fanfare: () => [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i === 6 ? .8 : .22, 'triangle', .18, i * .16)),
  // secrets and the growing treehouse
  snore: () => { tone(95, .9, 'sine', .1, 0, 70, .4); tone(190, .5, 'sine', .04, 1, 260, .2); },
  whee: () => { tone(1250, 1.1, 'sine', .1, 0, 320, .05); tone(330, .25, 'sine', .2, 1.1, 660); },
  sizzle: () => { noise(.5, .08, 5200); tone(520, .1, 'sine', .14, .45, 880); },
  wish: () => [2637, 2349, 2093, 1760, 1568].forEach((f, i) => tone(f, .3, 'sine', .07, i * .09)),
  // silly gadgets
  slip: () => tone(900, .3, 'sine', .14, 0, 220),
  giggle: () => [0, 1, 2, 3, 4].forEach(i => tone(1150 + (i % 2) * 260, .06, 'square', .05, i * .08)),
  bubble: () => { tone(380, .12, 'sine', .14, 0, 900); tone(520, .1, 'sine', .1, .09, 1200); },
  bang: () => { noise(.25, .28, 900); tone(150, .2, 'sine', .3, 0, 60); buzz(60); },
  disco: () => [0, 1, 2, 3].forEach(i => { tone(110, .1, 'sine', .22, i * .22, 70); tone([659, 784, 880, 784][i], .1, 'square', .05, i * .22 + .11); }),
  rewind: () => tone(300, .45, 'sawtooth', .06, 0, 1400),
};
// Speech. The owl says its lines aloud; magpies only babble, in every language.
// `speak(text)` goes sentence by sentence and uses the first thing that works:
// 1. a recorded clip, voice/<lang>/<hash>.mp3 (VOICE lists the hashes that exist; tools/voice.js records them),
// 2. the device's own voice for the language, 3. a few soft hoots. `strict` leaves step 3 out: a toast is better silent.
// Clips play through the same audio context as the effects: one tap unlocks all sound (also on iOS), and mute and
// background rules hold for speech too. Speech is never needed to play: every line is also on the screen.
function vhash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
const sentences = text => (String(text).match(/[^.!?…]+[.!?…]*/g) || [String(text)]).map(s => s.trim()).filter(Boolean);
const clipOf = s => { const k = vhash(LANGS[lang] + ':' + s); return VOICE.has(k) ? `voice/${LANGS[lang]}/${k}.mp3` : ''; };
let talk = null, talkId = 0, clipFails = 0;   // the clip that is playing; a counter that cancels older lines; clips that did not load
let ahead = ['', null], vox = null;           // the next sentence, fetched while this one plays; the owl's own volume
const clip = url => ahead[0] === url ? ahead[1] : fetch(url).then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status)).then(b => new Promise((ok, no) => AC.decodeAudioData(b, ok, no)));
try { speechSynthesis.getVoices(); } catch (e) { /* no speech engine */ }   // some browsers only start loading their voices when asked
function hush() {
  talkId++;
  if (talk) { talk.onended = null; try { talk.stop(); } catch (e) { /* it had ended */ } talk = null; }
  try { speechSynthesis.cancel(); } catch (e) { /* no speech engine */ }
}
// A string of short notes whose pitch follows the letters: hoots for the owl, squeaky chatter for a magpie. Returns its length in seconds.
function babble(s, who) {
  const pie = who === 'pie', n = Math.min(pie ? 14 : 10, Math.ceil(s.length / 3)), gap = pie ? .075 : .13;
  for (let i = 0; i < n; i++) {
    const c = s.charCodeAt(i * 3 % s.length);
    pie ? tone(700 + c % 9 * 110, .055, 'square', .05, i * gap, 500 + c % 5 * 160) : tone(250 + c % 5 * 28, .1, 'sine', .12, i * gap, 220);
  }
  return n * gap;
}
function speak(text, who = 'owl', strict = false) {
  if (who === 'pie') { if (!S.mute && !document.hidden) babble(String(text), who); return; }   // chatter never cuts the owl off
  hush();
  if (S.mute || document.hidden) return;   // a line that comes from a timer must not wake the sound of a hidden page
  if (!S.voice) return;
  // No clips beside the page (one loose file) or no network: after two that did not load, the device's voice takes over.
  const id = talkId, parts = sentences(text), clips = !!audioOn() && clipFails < 2;
  const next = i => {
    if (id !== talkId || i >= parts.length) return;
    let moved = false;
    const step = f => () => { if (!moved && id === talkId) { moved = true; f(); } };
    const on = step(() => next(i + 1)), other = step(() => sayOther(parts[i], strict, () => next(i + 1)));
    const url = clips && clipOf(parts[i]);
    if (!url) return clips && VOICE.size ? on() : other();   // the owl keeps one voice: a sentence without a clip (a name, a number) stays silent
    clip(url).then(buf => {
      clipFails = 0;
      if (id !== talkId) return;
      if (!vox) { vox = AC.createGain(); vox.gain.value = 1.5; vox.connect(master); }
      talk = AC.createBufferSource(); talk.buffer = buf; talk.connect(vox); talk.onended = on; talk.start();
    }, () => { clipFails++; other(); });
    const after = parts[i + 1] && clipOf(parts[i + 1]);
    ahead = after ? [after, clip(after)] : ['', null];
    if (after) ahead[1].catch(() => { /* reported when its turn comes */ });
  };
  next(0);
}
function sayOther(s, strict, done) {
  let voices = [];
  try { voices = speechSynthesis.getVoices().filter(v => v.lang.slice(0, 2) === LANGS[lang]); } catch (e) { /* no speech engine */ }
  if (voices.length) {
    const u = new SpeechSynthesisUtterance(s);
    u.lang = voices[0].lang; u.voice = voices[0]; u.rate = .95; u.pitch = .9; u.onend = u.onerror = done;
    return speechSynthesis.speak(u);
  }
  if (strict) return done();
  setTimeout(done, babble(s, 'owl') * 1000 + 150);   // `next` checks talkId, so a late call after hush() does nothing
}
// A short buzz of the phone for a catch or a bonk, where the device can do it. Silent mode switches it off too.
function buzz(ms) { try { if (!S.mute && !quiet && navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* not allowed */ } }
