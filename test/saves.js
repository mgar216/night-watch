// Prepared browser storage for `node test/smoke.js tour` and `node fishing/test/smoke.js tour`: saves of earlier versions,
// damaged and hand-edited saves, damaged notes between the two games, and seeded random damage. Each entry is
// [name, { storage key: string value }]. The tour (in the drivers) starts the game on each of them, opens every screen
// and answers every dialog: nothing may throw, the repaired save must be sound, and no text of a save may reach the
// page as markup (X below would set window.xss and leave an element with the id "xss").
const X = '<img id="xss" src="x" onerror="window.xss=1"><script>window.xss=1</scr' + 'ipt>';
const j = JSON.stringify;
const NW = 'nightwatch.v1', FL = 'firstlight.v1';

// ----- The Night Watch as earlier versions saved it -----
const first = (night, more) => Object.assign({ lang: 0, mute: false, name: 'Mia', night, st: { cam: 3, gate: 2, forge: 0 }, beams: 85, stars: night * 6,
  items: [{ t: 'cam', m: 1 }, { t: 'lamp', m: 4 }, { t: 'bell', m: 15 }], nest: 1, testStar: 2, briefed: night, chief: night > 7 }, more);
const second = (night, more) => Object.assign(first(night), { st: { cam: 3, gate: 3, forge: 2, extra: 1 }, gateStar: 2, tinkered: 2, promo: false, voice: true,
  stk: { m1: 1, m3: 2, d2: 1, t1: 1, t4: 2 }, own: { wizard: 1, stripe: 1 }, hat: 'wizard', scarf: 'stripe', zhat: '', zscarf: '', boss: night > 5 ? 5 : 0, fooled: 3,
  day: 0, gifts: {}, bedN: 3, bed: { d: '2026-11-14', n: 2, more: 0 } }, more);
const third = (night, more) => Object.assign(second(night), { caught: 140, pals: { guard: 1, baker: 1, lamp: 1 }, helper: 'baker', lit: 7, grow: 1,
  visit: { d: '2026-11-14', done: 1, n: 4 }, mem: { d: '2026-11-14', k: 'laugh' }, memD: '2026-11-14', eye: 0, flag: '', bday: '3-14', bdayY: 2026, sup: '', saga: 0 }, more);
const largest = third(31, { stars: 99999, beams: 99999, caught: 99999, lit: 500, grow: 3, saga: 3, eye: 3, boss: 30, fooled: 999,
  pals: { guard: 1, baker: 1, lamp: 1, post: 1, garden: 1, music: 1 }, helper: 'music', flag: '01234567'.repeat(12),
  items: [...Array(22)].map((_, m) => ({ t: ['cam', 'lamp', 'bell', 'peel', 'tramp', 'tickle', 'disco', 'bubbler', 'cannon', 'fan', 'honey', 'seesaw', 'drum'][m % 13], m })) });
const career = { name: 'Mia', moons: 900, earned: 2400, log: { biscuit: { n: 1, best: 900, seen: 1, id: 1 }, aurora: { n: 2, best: 4200, seen: 1, id: 1 }, bluegill: { n: 6, best: 210, seen: 1, id: 1, lure: 'worm' } },
  own: { rod0: 1, line0: 1, reel0: 1, cricket: 5, boat: 1 }, rig: { rod: 'rod0', line: 'line0', reel: 'reel0', lure: 'cricket' }, ach: {}, stat: {}, at: 'pond', gate: 0, tut: { map: 1, shop: 1 } };

// ----- Damage -----
const every = (keys, v) => Object.fromEntries(keys.map(k => [k, v]));
const NWK = Object.keys(third(3)), FLK = ['lang', 'mute', 'vol', 'name', 'look', 'moons', 'earned', 'log', 'own', 'rig', 'ach', 'stat', 'at', 'gate', 'tut'];
const JUNK = [null, -1, 0, 1e21, 1.5, '', 'x', X, 'constructor', '__proto__', 'length', '1', true, false, [], [X], {}, { a: X }, { [X]: X }, 'x'.repeat(3000)];
// a small seeded generator, so that a failing seed can be run again
const rng = seed => () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
function damage(o, r, depth = 0) {
  if (!o || typeof o !== 'object') return r() < .3 ? JUNK[r() * JUNK.length | 0] : o;
  const out = Array.isArray(o) ? [] : {};
  for (const k of Object.keys(o)) {
    const p = r();
    if (p < .12) continue;                                             // the field is missing
    const v = p < .4 ? JUNK[r() * JUNK.length | 0] : depth < 3 ? damage(o[k], r, depth + 1) : o[k];
    Array.isArray(out) ? out.push(v) : out[k] = v;
  }
  if (!Array.isArray(out) && r() < .3) out[r() < .5 ? X : 'extra' + (r() * 99 | 0)] = JUNK[r() * JUNK.length | 0];   // and a field nobody knows
  return out;
}
const nested = { name: X, lang: 'length', st: { cam: X, gate: -5, forge: 99, extra: null }, beams: X, stars: [X],
  items: [{ t: X, m: X }, { t: 'cam', m: 1.5 }, { t: 'cam', m: -1 }, { t: 'shield', m: 0 }, { t: 'cam', m: 2 }, { t: 'lamp', m: 2 }, null, X, 5, [], { t: 'constructor', m: 3 }],
  stk: { [X]: X, m1: X, constructor: 1 }, own: { [X]: 1, wizard: X, __proto__: 1 }, hat: 'crown', scarf: X, zhat: 'wizard', gifts: { [X]: 1, biscuit: X },
  bed: { d: X, n: X, more: X }, bedN: X, pals: { [X]: 1, guard: X, nobody: 1 }, helper: X, visit: { d: X, done: X, n: X }, mem: { d: X, k: X }, memD: X,
  flag: X, bday: X, bdayY: X, sup: X, saga: X, eye: X, grow: X, lit: X, caught: X, night: 6, briefed: X, day: X, promo: X, tinkered: X, boss: X, fooled: X };

const nw = [
  ['no save at all', {}],
  ['the first version, Night 4', { [NW]: j(first(4)) }],
  ['the first version, a Chief on Night 12', { [NW]: j(first(12, { stars: 180, beams: 400 })) }],
  ['version 2, Night 3 with a day pending', { [NW]: j(second(3, { day: 1, st: { cam: 2, gate: 0, forge: 0, extra: 0 } })) }],
  ['version 2, a Chief on Night 14 with a promotion pending and gifts waiting', { [NW]: j(second(14, { promo: true, stars: 260, boss: 10, bedN: 0 })), [FL]: j(career) }],
  ['version 2 from before there were days, with the bedtime reached long ago', { [NW]: j(second(9, { day: -1, bed: { d: '2026-01-01', n: 9, more: 0 } })) }],
  ['version 3, Night 3', { [NW]: j(third(3)) }],
  ['version 3, everything at its largest', { [NW]: j(largest), [FL]: j(career), 'firstlight.day': j({ id: 123456, n: 9 }) }],
  ['a save that is not JSON', { [NW]: '{{{' }],
  ['a save that is the word null', { [NW]: 'null' }],
  ['a save that is a list', { [NW]: '[1,2,3]' }],
  ['a save that is a text', { [NW]: j(X) }],
  ['a save that is a number', { [NW]: '42' }],
  ...[['markup', X], ['a box of markup', { a: X }], ['a list of markup', [X, X]], ['nothing', null], ['a huge number', 1e300], ['minus one', -1], ['true', true], ['an empty text', '']]
    .map(([what, v]) => [`every field is ${what}`, { [NW]: j(every(NWK, v)) }]),
  ['fields within fields are damaged', { [NW]: j(nested) }],
  ['a language that is the text "1"', { [NW]: j(third(5, { lang: '1' })) }],
  ['a language that does not exist', { [NW]: j(third(5, { lang: 7 })) }],
  ['keys that reach for the prototype', { [NW]: '{"__proto__":{"polluted":1,"night":5},"constructor":{"prototype":{"polluted":1}},"night":3,"name":"Mia","lang":0}' }],
  ['a player slot that does not exist', { 'nightwatch.slot': '7', [NW + '.4']: j(third(6)), [NW]: j(third(2)) }],
  ['a player slot that is markup', { 'nightwatch.slot': X, [NW]: j(third(4)) }],
  ['the fourth player beside damaged neighbours', { 'nightwatch.slot': '3', [NW + '.4']: j(third(8, { name: 'Leo' })), [NW]: X, [NW + '.2']: '[]', [NW + '.3']: j(every(NWK, X)) }],
  ['the notes of the fishing game are not JSON', { [NW]: j(third(4)), [FL]: X, 'firstlight.day': X }],
  ['the notes of the fishing game hold markup', { [NW]: j(third(4)), [FL]: j({ log: { [X]: { n: 1 }, biscuit: { n: X }, aurora: X, heron: null } }), 'firstlight.day': j({ id: X, n: X }) }],
  ['the notes of the fishing game hold huge numbers', { [NW]: j(third(4)), [FL]: j({ log: { biscuit: { n: 1e300 } } }), 'firstlight.day': j({ id: 1e300, n: 1e300 }) }],
  ['the notes of the fishing game are lists', { [NW]: j(third(4)), [FL]: '[[]]', 'firstlight.day': '[3]' }],
  ...[...Array(14)].map((_, i) => { const r = rng(1000 + i); return [`random damage, seed ${1000 + i}`, { [NW]: j(damage(i % 2 ? largest : third(4 + i), r)), [FL]: j(damage(career, r)), 'firstlight.day': j(damage({ id: 5, n: 4 }, r)) }]; }),
];

// ----- First Light Fishing: its own save, and the Night Watch's save that it reads (name, language, lanterns, gadgets) -----
const flf = [
  ['no save at all', {}],
  ['a career of its own', { [FL]: j(career) }],
  ['a career beside a Night Watch career', { [FL]: j(career), [NW]: j(largest) }],
  ['the second player', { 'nightwatch.slot': '1', [FL + '.2']: j(career), [NW + '.2']: j(third(9, { lang: 1, name: 'Лео' })) }],
  ['a save that is not JSON', { [FL]: '{{{', [NW]: '{{{' }],
  ['a save that is the word null', { [FL]: 'null', [NW]: 'null' }],
  ['a save that is a list', { [FL]: '[1,2,3]', [NW]: '[1,2,3]' }],
  ['a save that is a text', { [FL]: j(X), [NW]: j(X) }],
  ...[['markup', X], ['a box of markup', { a: X }], ['a list of markup', [X, X]], ['nothing', null], ['a huge number', 1e300], ['minus one', -1], ['true', true]]
    .map(([what, v]) => [`every field is ${what}`, { [FL]: j(every(FLK, v)), [NW]: j(every(NWK, v)) }]),
  ['fields within fields are damaged', { [FL]: j({ name: X, lang: 'length', vol: X, look: { col: X, hat: X, boat: X }, moons: X, earned: [X], log: { [X]: { n: 1 }, bluegill: { n: X, best: X, lure: X, depth: X }, biscuit: X, constructor: { n: 1 } },
    own: { [X]: 5, cricket: X, boat: -3, nwl_peel: 1, constructor: 1 }, rig: { rod: X, line: 'constructor', reel: null, lure: 'nwl_peel' }, ach: { [X]: 1 }, stat: { [X]: X, casts: X }, at: X, gate: X, tut: { [X]: 1 } }),
    [NW]: j({ name: X, lang: X, mute: X, lit: X, items: [{ t: X, m: X }, { t: 'peel', m: X }, X, null] }) }],
  ['a tackle box that points at tackle nobody owns', { [FL]: j(Object.assign({}, career, { rig: { rod: 'rodp3', line: 'lines3', reel: 'reelp3', lure: 'lampspin' }, at: 'chapel' })) }],
  ['keys that reach for the prototype', { [FL]: '{"__proto__":{"polluted":1,"moons":5},"constructor":{"prototype":{"polluted":1}},"moons":30,"name":"Mia","lang":0}', [NW]: '{"__proto__":{"polluted":1}}' }],
  ['a player slot that is markup', { 'nightwatch.slot': X, [FL]: j(career) }],
  ['a Night Watch save with lanterns beyond counting and gadgets that do not exist', { [FL]: j(career), [NW]: j(third(9, { lit: 1e300, items: [{ t: 'peel', m: 0 }, { t: 'nothing', m: 1 }, { t: 'disco', m: 'x' }, { t: 'tramp' }] })) }],
  ...[...Array(14)].map((_, i) => { const r = rng(2000 + i); return [`random damage, seed ${2000 + i}`, { [FL]: j(damage(career, r)), [NW]: j(damage(i % 2 ? largest : third(4 + i), r)) }]; }),
];

module.exports = { nw, flf };
