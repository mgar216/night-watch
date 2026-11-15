// The generated music (src/33-music.js, shared by both games), checked in node with a stand-in for the sound engine.
//   node test/music.js
// It cannot say whether the music is pleasant. It says that every mood plays, stays quiet and inside the hearing range,
// never floods the engine, falls silent when it must, changes mood within four seconds, and does not catch up after a pause.
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'src', '33-music.js'), 'utf8');
const problems = [], check = (ok, text) => { if (!ok) problems.push(text); };
function band() {
  const notes = [], AC = { state: 'running', currentTime: 0 }, S = { mute: false };
  const tone = (f, d, type, vol, w = 0, to = 0) => notes.push({ f, d, type, vol, w, to, at: AC.currentTime + w });
  const api = new Function('AC', 'S', 'tone', 'noise', 'clamp', 'pick', src + '; return { music, musicTick, MUS };')(
    AC, S, tone, () => {}, (v, a, b) => v < a ? a : v > b ? b : v, a => a[Math.random() * a.length | 0]);
  const play = sec => { for (let t = 0; t < sec; t += .2) { AC.currentTime += .2; api.musicTick(); } };
  return { ...api, AC, S, notes, play };
}

const moods = Object.keys(band().MUS);
check(moods.join() === 'night,watch,raid,dawn,bed,party,day,water', 'the eight moods are there: ' + moods);
for (const mood of moods) {
  const b = band(); b.music.mood(mood); b.play(120);
  const n = b.notes, where = `${mood}: `;
  check(n.length >= (mood === 'water' ? 8 : 40), where + 'it plays (' + n.length + ' notes in two minutes)');
  check(n.length <= 120 * 12, where + 'it never floods the sound engine (' + n.length + ' notes in two minutes)');
  check(n.every(x => x.f >= 60 && x.f <= 1500 && (!x.to || x.to >= 60 && x.to <= 1500)), where + 'every note is between 60 and 1500 Hz');
  check(n.every(x => x.vol > 0 && x.vol <= .1001), where + 'no note is louder than .1');
  check(n.every(x => x.d > 0 && x.d <= 3.4), where + 'no note is longer than 3.4 seconds');
  check(n.every(x => x.w >= 0 && x.w <= .81), where + 'notes are scheduled at most .8 seconds ahead, never in the past');
  // loudness that can pile up: the notes sounding at one moment never add up to more than .5
  let worst = 0; for (let t = 5; t < 115; t += .1) worst = Math.max(worst, n.filter(x => x.at <= t && x.at + x.d > t).reduce((a, x) => a + x.vol, 0));
  check(worst <= .5, where + 'the notes sounding together stay under .5 in sum (' + worst.toFixed(2) + ')');
}
{ // silence: the sound switch, and a sound engine that is not running
  const b = band(); b.play(5); b.S.mute = true; const n0 = b.notes.length; b.play(20);
  check(b.notes.length === n0, 'the sound switch stops the music');
  b.S.mute = false; b.AC.state = 'suspended'; b.play(20);
  check(b.notes.length === n0, 'a sound engine that is not running gets no notes');
  b.AC.state = 'running'; b.AC.currentTime += 600; const n1 = b.notes.length; b.musicTick();
  check(b.notes.length > n1 && b.notes.length - n1 <= 8 && b.notes.slice(n1).every(x => x.w >= 0), 'after a long pause the music goes on from now and does not catch up (' + (b.notes.length - n1) + ' notes at once)');
}
{ // a new mood is heard within four seconds; a name nobody knows plays the night
  const b = band(); b.play(10); b.music.mood('raid'); const t0 = b.AC.currentTime; b.play(30);
  const first = b.notes.find(x => x.at > t0 && x.type === 'triangle' && x.d === .2);   // the raid's tiptoe bass
  check(!!first && first.at - t0 <= 4, 'the raid music starts within four seconds: ' + (first ? (first.at - t0).toFixed(1) : 'never'));
  check(!b.notes.some(x => x.at > t0 + 4 && x.d === 3.3), 'and the lullaby does not go on under it');
  b.music.mood('no such mood'); const t1 = b.AC.currentTime; b.play(30);
  check(b.notes.some(x => x.at > t1 && x.d === 3.3), 'a mood nobody knows plays the night');
}
console.log(problems.length ? 'FAILED:\n' + problems.join('\n') : 'MUSIC OK');
process.exit(problems.length ? 1 : 0);
