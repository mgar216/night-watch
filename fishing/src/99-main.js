// ---------- Boot ----------
// A save that is damaged, old or edited by hand must not break the game or reach the page as HTML.
(() => {
  const int = (v, lo, hi) => clamp(v | 0, lo, hi), obj = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  S.mute = !!S.mute; S.vol = clamp(+S.vol || 0, 0, 1); S.name = String(S.name || '').slice(0, 16);
  S.moons = int(S.moons, 0, 1e9); S.earned = int(S.earned, 0, 1e9); S.gate = S.gate ? 1 : 0;
  const look = obj(S.look);
  S.look = { col: int(look.col, 0, 5), hat: has(WEAR, look.hat) && WEAR[look.hat].hat ? look.hat : '', boat: int(look.boat, 0, 5) };
  const log = obj(S.log); S.log = {};
  // (a favourite lure that was lent by a gadget of the Night Watch and has gone with it becomes the shop lure it copied)
  for (const id in log) if (has(SPECIES, id)) { const e = obj(log[id]); S.log[id] = { n: int(e.n, 0, 1e6), best: int(e.best, 0, 1e7), seen: e.seen ? 1 : 0, id: e.id ? 1 : 0, fast: e.fast ? 1 : 0, lure: has(ITEMS, e.lure) ? e.lure : (NWL.find(it => it.id === e.lure) || {}).like, depth: e.depth === undefined ? undefined : int(e.depth, 0, 2) }; }
  const own = obj(S.own); S.own = { rod0: 1, line0: 1, reel0: 1 };
  for (const id in own) if (has(ITEMS, id)) S.own[id] = int(own[id], 0, 999);
  const ach = obj(S.ach); S.ach = {};
  for (const id in ach) if (has(ACHS, id) && ach[id]) S.ach[id] = 1;
  const stat = obj(S.stat); S.stat = {};
  for (const k in stat) if (/^[a-z0-9_]{1,24}$/i.test(k)) S.stat[k] = int(stat[k], 0, 1e9);
  const tut = obj(S.tut); S.tut = {};
  for (const k in tut) if (/^[a-z0-9_]{1,24}$/i.test(k)) S.tut[k] = 1;
  S.rig = Object.assign({ rod: 'rod0', line: 'line0', reel: 'reel0', lure: 'worm' }, obj(S.rig));
  for (const k in S.rig) S.rig[k] = String(S.rig[k]);
  rig();                                            // puts back the basic tackle for anything unknown or not owned
  S.at = S.at === 'tree' || has(AREA, S.at) && canReach(S.at) ? S.at : 'tree';
})();
resize();
// After a good day's fishing the map says, once, that evening is near; the treehouse then leads back to the Night Watch.
// The day leaves a note for the owl in the shared storage (how many fish, and which day it was): three fish or more are
// supper, and supper sharpens the owl's eyes for tonight's Gate Check. At the third fish the note's id moves on by one, so
// that a note the owl read too early (a look at the Night Watch and back) still becomes supper.
// The note also names its day: the number of the Night that follows (from the Night Watch's save). The page can be loaded
// again in the middle of a day (a phone drops a background tab, or the child comes back for more before the same Night):
// the count then goes on from the note, so the fish already landed still count, and a supper that the owl has read
// does not come a second time.
const NOTE = 'firstlight.day' + (nwSlot ? '.' + (nwSlot + 1) : '');
let dayId = 0, dayOf = 0;
function dayBegin() {
  dayId = Date.now(); dayCatch = 0; dayOf = Number.isInteger(nwSave.night) ? nwSave.night : 0;
  if (day) try {
    const r = JSON.parse(localStorage.getItem(NOTE) || 'null');
    if (r && r.k === dayOf && Number.isSafeInteger(r.id) && Number.isInteger(r.n) && r.n > 0 && r.n < 1e6) { dayCatch = r.n; dayId = r.id - (r.n >= 3); }
  } catch (e) { /* no note, or nothing can be read here */ }
}
dayBegin();
on('catch', () => {
  dayCatch++;
  if (day) try { localStorage.setItem(NOTE, JSON.stringify({ id: dayId + (dayCatch >= 3), n: dayCatch, k: dayOf })); } catch (e) { /* nothing can be saved here */ }
});
on('enter', d => { if (day && d && d.home && dayCatch >= 5 && !dayTold) { dayTold = true; toast(t('day_low'), 3200); } });
// By day (from the Night Watch) the Chief is already on the way: no title screen, straight to the map.
go(day ? 'map' : 'home');
if (day) toast(t('day_start'), 2600);
requestAnimationFrame(frame);
