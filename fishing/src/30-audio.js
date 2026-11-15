// ---------- Sound: everything is made with the Web Audio API; no sound is ever needed to play ----------
// This file holds the context, the volume, and the short effects. The waters' ambience lives with the waters.
let AC = null, master = null;
function audioOn() {
  if (S.mute) return null;
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain(); master.gain.value = S.vol * .6; master.connect(AC.destination);
      emit('audio');   // the ambience starts as soon as there is a context
      setInterval(musicTick, 200);   // and the day's tune (../src/33-music.js, shared with The Night Watch)
    }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) { AC = null; }
  return AC;
}
function setMute(m) {
  S.mute = m; save();
  if (AC) m ? AC.suspend() : AC.resume();
  if (!m) audioOn();
  emit('mute');
}
function setVol(v) {
  S.vol = clamp(v, 0, 1); save();
  if (master) master.gain.value = S.vol * .6;
}
// No sound from a tab or an app in the background.
document.addEventListener('visibilitychange', () => { if (AC && !S.mute) document.hidden ? AC.suspend() : AC.resume(); });
// One enveloped oscillator note; `to` glides the pitch.
function tone(f, d = .15, type = 'sine', vol = .2, when = 0, to = 0, attack = .01) {
  if (S.mute || !AC) return;
  const t0 = AC.currentTime + when, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + d);
  g.gain.setValueAtTime(.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + d + .05);
}
// A burst of filtered noise: splashes, reel clicks, wind puffs.
function noise(d = .2, vol = .15, freq = 1800, when = 0, q = 1) {
  if (S.mute || !AC) return;
  const n = AC.sampleRate * d | 0, buf = AC.createBuffer(1, n, AC.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(master); src.start(AC.currentTime + when);
}
const sfx = {
  click: () => tone(520, .06, 'triangle', .15),
  pop: () => tone(420, .12, 'sine', .25, 0, 900),
  yes: () => { tone(660, .1, 'triangle', .18); tone(880, .16, 'triangle', .18, .09); },
  oops: () => { tone(330, .16, 'triangle', .16, 0, 260); tone(250, .24, 'triangle', .16, .15, 200); },
  empty: () => tone(160, .12, 'square', .07),
  coin: () => { tone(988, .08, 'square', .07); tone(1319, .2, 'square', .07, .07); },
  sparkle: () => [1320, 1760, 2090, 2640].forEach((f, i) => tone(f, .25, 'sine', .09, i * .06)),
  chirp: () => { tone(2100, .07, 'sine', .12, 0, 2900); tone(2500, .07, 'sine', .12, .09, 3300); },
  whoosh: () => noise(.3, .12, 900, 0, .6),                                        // the cast
  plop: () => { tone(300, .12, 'sine', .22, 0, 120); noise(.12, .1, 1400); },      // the lure lands
  splash: () => { noise(.45, .22, 800, 0, .5); noise(.3, .12, 2400, .05); },       // a jump, a landed fish
  nibble: () => tone(880, .04, 'sine', .1),                                        // a small touch on the line
  bite: () => { tone(220, .14, 'sine', .3, 0, 110); noise(.1, .14, 600); },        // the real pull
  reel: () => noise(.025, .07, 3200, 0, 3),                                        // one click of the reel
  strain: k => tone(180 + k * 520, .09, 'sawtooth', .03 + k * .05),                // the line sings as tension rises
  snap: () => { noise(.09, .3, 2600, 0, 2); tone(900, .2, 'square', .1, 0, 90); }, // the line breaks
  net: () => { noise(.25, .16, 1100); tone(520, .12, 'triangle', .16, .1, 780); },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .3, 'triangle', .16, i * .11)),
  fanfare: () => [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i === 6 ? .8 : .22, 'triangle', .18, i * .16)),
  step: () => noise(.04, .05, 500),
  paddle: () => noise(.18, .08, 700, 0, .7),
};
// A short buzz of the phone: the same cue as the line shaking on the screen. Silent mode switches it off too.
function buzz(ms) { try { if (!S.mute && navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* not allowed */ } }
