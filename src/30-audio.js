// ---------- Sound: everything synthesized with the Web Audio API; never needed to play ----------
let AC = null, master = null;
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
  if (AC) m ? AC.suspend() : AC.resume();
  if (!m) audioOn();
}
// No lullaby from a tab or an app in the background.
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
function noise(d = .2, vol = .15, freq = 1800, when = 0) {
  if (S.mute || !AC) return;
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
  squawk: () => { tone(700, .14, 'sawtooth', .1, 0, 380); tone(620, .16, 'sawtooth', .1, .13, 300); },
  bonk: () => { tone(190, .18, 'sine', .3, 0, 90); noise(.06, .12, 500); },
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
};
// Gentle generative lullaby: slow bass notes under a wandering pentatonic melody.
const PENTA = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3], BASS = [130.8, 110, 87.3, 98];
let mNext = 0, mStep = 0, mIdx = 3;
function musicTick() {
  if (S.mute || !AC || AC.state !== 'running') return;
  if (mNext < AC.currentTime) mNext = AC.currentTime + .1;
  while (mNext < AC.currentTime + .6) {
    const w = mNext - AC.currentTime, st = mStep % 8;
    if (st === 0) {
      const b = BASS[(mStep / 8 | 0) % 4];
      tone(b, 3.3, 'sine', .1, w, 0, .5); tone(b * 1.5, 3.3, 'sine', .05, w, 0, .7);
    }
    if (Math.random() < (st % 2 ? .25 : .8)) {
      mIdx = clamp(mIdx + pick([-2, -1, -1, 0, 1, 1, 2]), 0, 7);
      tone(PENTA[mIdx], 1.2, 'sine', .045, w, 0, .03);
    }
    mNext += .42; mStep++;
  }
}
