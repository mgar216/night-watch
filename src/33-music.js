// ---------- Music: generated in the browser, quiet, never needed to play. Shared with First Light Fishing. ----------
// Both games call musicTick() five times a second once their sound has started (it schedules the next notes with tone(),
// never more than about .6 seconds ahead), and music.mood(name) whenever the scene changes:
//   night  the menus of the Night Watch (lullaby)      watch  inside a station (the same, thinner)
//   raid   magpies are coming                           dawn   first light
//   bed    bedtime                                      party  a birthday, a finale
//   day    the fishing map, title and treehouse         water  at a fishing spot (the water's own sounds lead)
// A new mood starts with the next bar: the notes already played ring out, and two moods never play at once. A name
// that is not listed plays the night. It uses only what both games have (AC, tone(), noise(), S.mute, clamp, pick), and
// only inside functions, because the fishing game loads this file before its own sound.
// Every tune keeps to a five-note scale with no half steps in it, over one soft chord per bar, and stays quiet (bass up
// to .1, tunes up to .05), so the music sits under the effects and the owl.
const PENTA = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];   // C major pentatonic (the code station and the spy game play it too)
const musBass = [130.8, 110, 87.3, 98];                                // C A F G, one per bar: the lullaby's chords
let musNext = 0, musSt = 0, musBar = 0, musIdx = 3, musCur = 'night', musWant = 'night', musWait = 0;
// The next note of a wandering tune: a step or two up or down the scale, kept between the indexes lo and hi.
const musWalk = (lo = 0, hi = 7) => PENTA[musIdx = clamp(musIdx + pick([-2, -1, -1, 0, 1, 1, 2]), lo, hi)];
// A mood is [seconds per step, steps per bar, play(step in the bar, seconds from now)]. No bar is longer than 3.4 seconds,
// so a new mood is heard within four.
const MUS = {
  // the lullaby: a bass note and its fifth swell each bar under a slow tune that wanders on most steps
  night: [.42, 8, (st, w) => {
    if (!st) { const b = musBass[musBar % 4]; tone(b, 3.3, 'sine', .1, w, 0, .5); tone(b * 1.5, 3.3, 'sine', .05, w, 0, .7); }
    if (Math.random() < (st % 2 ? .25 : .8)) tone(musWalk(), 1.2, 'sine', .045, w, 0, .03);
  }],
  // a station: the same, thinner, so that it does not distract: no fifth, half the tune, nothing high
  watch: [.42, 8, (st, w) => {
    if (!st) tone(musBass[musBar % 4], 3.3, 'sine', .09, w, 0, .5);
    if (Math.random() < (st % 2 ? .1 : .4)) tone(musWalk(0, 5), 1.2, 'sine', .04, w, 0, .05);
  }],
  // magpies are coming: a tiptoe bass (root, fifth, octave, fifth, all short) under plucked notes that land mostly
  // between its steps; in every fourth bar the tune stops and peeks with a little slide up. The chords go Am Dm G C, so
  // each round ends in a major key: cheeky, never dark.
  raid: [.32, 8, (st, w) => {
    if (!(st % 2)) tone([110, 73.4, 98, 130.8][musBar % 4] * [1, 1.5, 2, 1.5][st / 2], .2, 'triangle', .1, w, 0, .005);
    if (musBar % 4 === 3) { if (st === 5) tone(440, .4, 'sine', .05, w, 523.3, .03); }
    else if (Math.random() < (st % 2 ? .6 : .35)) tone(musWalk(), .3, 'triangle', .05, w, 0, .005);
  }],
  // first light: over a soft bass and its octave, four notes climb in each bar (C Am F G), and a round later an octave
  // higher, as the sun gets up; now and then a bird chirps
  dawn: [.4, 8, (st, w) => {
    const k = musBar % 4;
    if (!st) { tone(musBass[k], 3.1, 'sine', .08, w, 0, .6); tone(musBass[k] * 2, 3.1, 'sine', .03, w, 0, .9); }
    if (!(st % 2)) tone(PENTA[[0, 2, 3, 1][k] + st / 2] * (musBar & 4 ? 2 : 1), 1.6, 'triangle', .032, w, 0, .08);
    if (st === 5 && Math.random() < .4) { tone(1046.5, .06, 'sine', .03, w, 1318.5, .005); tone(1174.7, .07, 'sine', .03, w + .1, 1396.9, .005); }
  }],
  // bedtime: very slow and quieter; every other bar three long notes fall down the scale
  bed: [.8, 4, (st, w) => {
    if (!st) { tone(musBass[musBar % 4], 3.1, 'sine', .06, w, 0, .9); musIdx = pick([4, 5, 6, 7]); }
    if (!(musBar % 2) && st < 3) tone(PENTA[musIdx - st], 2, 'sine', .028, w, 0, .15);
  }],
  // a birthday or a finale: oom-pah (C F G C) under a bouncy tune in a skipping rhythm; every fourth bar ends with a whee
  party: [.25, 8, (st, w) => {
    const k = musBar % 4;
    if (!(st % 4)) tone([130.8, 87.3, 98, 130.8][k], .3, 'triangle', .1, w, 0, .01);
    else if (st % 4 === 2) for (const f of [[261.6, 329.6], [220, 261.6], [196, 293.7], [261.6, 329.6]][k]) tone(f, .15, 'triangle', .03, w, 0, .01);
    if ('x.xx.xx.'[st] === 'x') tone(musWalk(2, 7), .25, 'triangle', .045, w, 0, .01);
    if (k === 3 && st === 6) tone(523.3, .5, 'sine', .045, w, 1046.5, .02);
  }],
  // the fishing day: a light morning tune in G major pentatonic at a walking pace; the bass steps from root to fifth
  day: [.34, 8, (st, w) => {
    const r = [98, 82.4, 110, 146.8][musBar % 4];   // G Em Am D
    if (!(st % 4)) tone(st ? r * 1.5 : r, .9, 'sine', .08, w, 0, .05);
    if (Math.random() < (st % 2 ? .3 : .7)) tone(musWalk() * 1.5, .5, 'triangle', .04, w, 0, .02);
  }],
  // at a fishing spot the water's own sounds lead: one soft low note, six to ten seconds apart
  water: [.5, 6, (st, w) => {
    if (--musWait > 0) return;
    musWait = 12 + (Math.random() * 9 | 0);   // in half-second steps
    tone(pick([146.8, 164.8, 196, 220]), 3, 'sine', .05, w, 0, .8);   // D E G A, from the day's scale, below its tune
  }],
};
const music = { mood(name) { musWant = Object.prototype.hasOwnProperty.call(MUS, name) ? name : 'night'; } };
function musicTick() {
  if (S.mute || !AC || AC.state !== 'running') return;
  const now = AC.currentTime;
  if (musNext < now) musNext = now + .1;   // after a pause the music goes on from now; it never catches up
  while (musNext < now + .6) {
    if (!musSt && musCur !== musWant) { musCur = musWant; musBar = musWait = 0; }
    const [step, steps, play] = MUS[musCur];
    play(musSt, musNext - now);
    musNext += step;
    if (++musSt >= steps) { musSt = 0; musBar++; }
  }
}
