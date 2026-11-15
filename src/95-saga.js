// ---------- The Baron's story: three chapters after his Nights, ending with his Museum of Shiny Things ----------
// go('saga', { ch: 1 | 2 | 3, then }) shows that chapter's three panels one at a time, like the story strips of
// src/88-story.js, whose page turning, keys, taps and layout it borrows. After the last panel the chapter is saved in
// S.saga and then() is called; chapter 3 first gives the Baron's present. At S.saga = 3 isBoss() is false for good.

// After a won Baron's Night the next chapter comes once its Night is reached (10, 20, 30), one per Night; otherwise the
// Night simply goes on.
function sagaAfter(then) { if (S.saga < 3 && S.night >= 10 * (S.saga + 1)) go('saga', { ch: S.saga + 1, then }); else then(); }

// ----- Panel pieces, drawn in the story strips' 360 x 300 box with the ground at y = 255 -----
// The Baron's collection, one thing each, drawn around (0, 0) about 2 across: a spoon, a button, a key, a marble,
// a hand mirror, a bell, a foil star, a ring.
const SAGA_THINGS = [
  c => { line(c, [0, -.1, .05, 1], '#c9d2e6', .24); ell(c, 0, -.42, .4, .56, '#e4eaf6'); ell(c, -.13, -.52, .1, .24, '#fff'); },
  c => { circ(c, 0, 0, .82, '#ffcf4a'); circ(c, 0, 0, .6, '#f2b93b'); for (const [x, y] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]]) circ(c, x, y, .11, '#7a4c00'); },
  c => { c.beginPath(); c.arc(-.55, 0, .34, 0, TAU); c.lineWidth = .22; c.strokeStyle = '#ffcf4a'; c.stroke(); line(c, [-.21, 0, .95, 0, .95, .34], '#ffcf4a', .22); line(c, [.62, 0, .62, .28], '#ffcf4a', .2); },
  c => { circ(c, 0, 0, .72, '#3f8fe8'); c.beginPath(); c.arc(0, 0, .42, .3, 2.7); c.lineWidth = .18; c.strokeStyle = '#9fe0ff'; c.stroke(); circ(c, -.26, -.28, .16, '#fff'); },
  c => { line(c, [0, .45, 0, 1.15], '#c9a25a', .28); ell(c, 0, -.15, .66, .76, '#e0b85a'); ell(c, 0, -.15, .5, .6, '#bfe6ff'); line(c, [-.26, 0, .12, -.46], '#fff', .12); },
  c => drawIcon(c, 'bell', 0, 0, 1.9),
  c => { starPath(c, 0, 0, .95, .42, 5); c.fillStyle = '#e4eaf6'; c.fill(); c.lineWidth = .1; c.strokeStyle = '#8f9ab8'; c.stroke(); },
  c => { c.beginPath(); c.arc(0, .18, .55, 0, TAU); c.lineWidth = .22; c.strokeStyle = '#ffd24a'; c.stroke(); circ(c, 0, -.42, .27, '#e8436a'); circ(c, -.07, -.5, .08, '#fff'); },
];
function sagaThing(c, kind, x, y, s, r = 0) { c.save(); c.translate(x, y); c.rotate(r); c.scale(s, s); SAGA_THINGS[kind % 8](c); c.restore(); }
// A four-point glint that comes and goes; with reduced motion it simply stays lit.
function sagaGlint(c, x, y, r, T, i) {
  const a = still() ? .8 : Math.max(0, Math.sin(T * 2.3 + i * 2.1));
  if (a < .05) return;
  starPath(c, x, y, r * (.4 + .6 * a), r * .16, 4); c.fillStyle = `rgba(255,255,240,${.35 + .65 * a})`; c.fill();
}
// A heap of shiny things, bottom centre at (x, y), w wide and h high. The same things lie in the same places every time
// (hash, shifted by `seed`); the ones further back are drawn first, and every third one glints.
function sagaHeap(c, x, y, w, h, T, n, seed = 0) {
  c.beginPath(); c.ellipse(x, y, w / 2, h * .85, 0, Math.PI, TAU); c.fillStyle = '#4a3c28'; c.fill();
  const s = w / 14, at = [...Array(n)].map((_, i) => { const u = hash(seed + i * 3 + 1) * 1.7 - .85; return [x + u * w / 2, y - h * Math.sqrt(1 - u * u) * (.92 - .8 * hash(seed + i * 3 + 2)), i]; }).sort((a, b) => a[1] - b[1]);
  for (const [px, py, i] of at) sagaThing(c, i + seed, px, py, s * (.8 + .4 * hash(seed + i * 3 + 3)), hash(seed + i) * 3 - 1.5);
  for (const [px, py, i] of at) if (i % 3 === 0) sagaGlint(c, px + s * .5, py - s * .5, s * 1.3, T, i + seed);
}
// The Baron's nest from close by, rim centre at (x, y), w wide: the back of the bowl, what is in it (`inner`), the woven front.
function sagaNest(c, x, y, w, inner) {
  ell(c, x, y, w / 2, w * .1, '#3e2a18');
  inner();
  c.beginPath(); c.ellipse(x, y, w / 2 + 6, w * .22, 0, 0, Math.PI); c.fillStyle = '#6b4a2e'; c.fill();
  for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) { const tx = x + (i - 4) * w * .1, ty = y + 5 + r * w * .07; line(c, [tx - w * .05, ty + (i % 2) * 6, tx + w * .05, ty + 6 - (i % 2) * 6], '#8a6a44', 3); }
}
// Something held in the beak of a standing magpie whose feet are at (x, y) (scale s, facing dir): thing() draws around
// (0, 0), the tip of the beak, in the bird's units and the right way round.
function sagaBeak(c, x, y, s, dir, thing) { c.save(); c.translate(x + dir * 47 * s, y - 51 * s); c.scale(s, s); thing(c); c.restore(); }
// A tear by the eye of a standing magpie whose feet are at (x, y), on the side away from the Baron's monocle.
function sagaTear(c, x, y, s, dir) { c.save(); c.translate(x + dir * 14 * s, y - 44 * s); c.scale(3.6 * s, 3.6 * s); c.beginPath(); SHAPES.drop(c); c.fillStyle = '#7fd0ff'; c.fill(); c.restore(); }
// The lost cog from the Guess-o-Matic, polished: gold, with a red bow and a glint, centre at (x, y), radius r.
function sagaCog(c, x, y, r, T) {
  glow(c, x, y, r * 2.6, '255,216,107', .4);
  bossCog(c, x, y, r, 0, '#ffd24a');
  ell(c, x - r * .42, y - r * 1.02, r * .42, r * .26, '#e8436a', -.45); ell(c, x + r * .42, y - r * 1.02, r * .42, r * .26, '#e8436a', .45); circ(c, x, y - r * .98, r * .17, '#c0392b');
  sagaGlint(c, x + r * .45, y - r * .3, r, T, 4);
}
// An idea: a light bulb with rays, centre at (x, y), grown by p (0..1) as it pops up.
function sagaIdea(c, x, y, p, T) {
  c.save(); c.translate(x, y); c.scale(p, p);
  glow(c, 0, 0, 64, '255,230,140', .6);
  for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6, r = 31 + (still() ? 0 : Math.sin(T * 6 + i) * 2); line(c, [Math.cos(a) * r, Math.sin(a) * r, Math.cos(a) * (r + 11), Math.sin(a) * (r + 11)], '#ffe9a3', 4); }
  circ(c, 0, -4, 20, '#ffe27a'); c.beginPath(); c.arc(0, -4, 13, -2.7, -1.7); c.lineWidth = 3.5; c.lineCap = 'round'; c.strokeStyle = '#fff'; c.stroke();
  rr(c, -9, 14, 18, 13, 3); c.fillStyle = '#aeb9d0'; c.fill(); line(c, [-9, 19, 9, 19], '#7d879c', 2); line(c, [-9, 23, 9, 23], '#7d879c', 2);
  c.restore();
}
// The secret building site (bottom centre at x, y): a frame of posts and beams with a lantern, a sheet over the front,
// and a magpie on the top beam who hammers.
function sagaSite(c, x, y, T) {
  for (const px of [-46, 0, 46]) line(c, [x + px, y, x + px, y - 116], '#a8703f', 8);
  line(c, [x - 54, y - 114, x + 54, y - 114], '#a8703f', 8); line(c, [x - 52, y - 62, x + 52, y - 62], '#a8703f', 7);
  line(c, [x - 58, y - 114, x, y - 152, x + 58, y - 114], '#a8703f', 7);
  drawIcon(c, 'lamp', x - 23, y - 90, 26);
  poly(c, [x - 50, y - 60, x + 50, y - 60, x + 57, y, x - 57, y], '#dfe6f5');
  for (const fx of [-32, -8, 16, 38]) line(c, [x + fx, y - 56, x + fx + 4, y - 3], '#b9c4d8', 2);
  magpie(c, x + 8, y - 118, .62, T, { face: 'smug' });
  c.save(); c.translate(x + 40, y - 152); c.rotate(still() ? .4 : .2 + Math.max(0, Math.sin(T * 9)) * .7); drawIcon(c, 'hammer', 0, 0, 22); c.restore();
}
// An invitation: an envelope whose wax seal shows who it is for (an icon), centre at (x, y), scaled by s, turned by r.
function sagaLetter(c, x, y, s, seal, r = 0) {
  c.save(); c.translate(x, y); c.rotate(r); c.scale(s, s);
  rr(c, -32, -21, 64, 42, 5); c.fillStyle = '#fff6da'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#c9a25a'; c.stroke();
  line(c, [-30, -19, 0, 4, 30, -19], '#c9a25a', 2.5);
  circ(c, 0, 5, 14, '#e8503a'); circ(c, 0, 5, 11, '#fff6da'); drawIcon(c, seal, 0, 5, 19);
  c.restore();
}
// The Museum of Shiny Things (bottom centre at x, y): steps, a hall with columns, a roof with a big glinting star, and
// the cut ribbon by the door. `lit` 0..1: the fireflies have lit the windows and the open door.
function sagaMuseum(c, x, y, lit, T) {
  c.save(); c.translate(x, y);
  glow(c, 0, -70, 170, '255,216,107', .4 * lit);
  rr(c, -100, -12, 200, 12, 3); c.fillStyle = '#7d879c'; c.fill(); rr(c, -92, -22, 184, 12, 3); c.fillStyle = '#aeb9d0'; c.fill();
  rr(c, -84, -128, 168, 108, 4); c.fillStyle = '#5a4685'; c.fill();
  const win = `rgba(255,216,107,${.3 + .7 * lit})`;
  for (const wx of [-52, 52]) { rr(c, wx - 13, -104, 26, 46, 13); c.fillStyle = win; c.fill(); }
  rr(c, -20, -84, 40, 62, 20); c.fillStyle = win; c.fill();
  for (const cx of [-74, -30, 30, 74]) { rr(c, cx - 6, -122, 12, 100, 3); c.fillStyle = '#e4dcf5'; c.fill(); rr(c, cx - 9, -130, 18, 8, 2); c.fill(); }
  poly(c, [-106, -126, 0, -178, 106, -126], '#4a3470'); line(c, [-106, -126, 0, -178, 106, -126, -106, -126], '#ffd24a', 3);
  starPath(c, 0, -146, 17, 6, 4); c.fillStyle = '#ffd24a'; c.fill(); sagaGlint(c, 9, -156, 13, T, 5);
  line(c, [-20, -50, -30, -36, -25, -24], '#e8436a', 4); line(c, [20, -50, 30, -36, 25, -24], '#e8436a', 4);
  c.restore();
}

// The nine panels: [chapter][panel](c, T, k), like storyPanels. T is the clock (frozen with reduced motion), k the
// seconds since the panel appeared. SAGA_DARK: panels without the story strips' moon (a darker sky).
const SAGA_DARK = [[0, 1, 1], [0, 0, 1], [0, 0, 0]];
const SAGA_PANELS = [
  [ // 1. The Baron's Nest
    (c, T, k) => {   // his patched balloon drifts home past the warm treehouse; he looks back at it, all alone
      storyHouse(c, 52, 255, .75);
      storyNest(c, 314, 255, 1.05, T, 0, () => sagaHeap(c, 0, -128, 96, 26, T, 10, 7));
      const q = still() ? 1 : ease(clamp(k / 4, 0, 1));
      bossBalloon(c, lerp(118, 184, q), 210 + (still() ? 0 : Math.sin(T * 1.4) * 4), .92, T, { baron: true, face: 'sad' });
    },
    (c, T) => {   // his nest from close by: heaps of shiny things, and the Baron alone among them
      sagaNest(c, 180, 228, 340, () => {
        sagaHeap(c, 92, 232, 150, 84, T, 18, 20); sagaHeap(c, 272, 232, 160, 104, T, 20, 60);
        bossBaron(c, 182, 238, 1, T, { face: 'worry' });
      });
    },
    (c, T) => {   // under a big moon he holds a spoon up to the light in his beak; a tear: there is nobody to show it to
      glow(c, 292, 62, 130, '255,240,200', .3); circ(c, 292, 62, 34, '#fff3c4'); circ(c, 280, 52, 6, '#f2e3a6'); circ(c, 302, 76, 4.5, '#f2e3a6');
      storyHouse(c, 36, 255, .5);
      sagaNest(c, 200, 240, 330, () => {
        sagaHeap(c, 106, 242, 150, 64, T, 16, 80);
        bossBaron(c, 226, 246, 1.15, T, { face: 'sad' }); sagaTear(c, 226, 246, 1.15, 1);
        sagaBeak(c, 226, 246, 1.15, 1, () => { c.rotate(.5 + (still() ? 0 : Math.sin(T * 1.3) * .15)); sagaThing(c, 0, 0, -13, 13); sagaGlint(c, -1, -20, 15, T, 2); });
      });
    },
  ],
  [ // 2. A Secret Plan
    (c, T, k) => {   // Zip flies in with the lost cog, polished and tied with a bow; the Baron peeks out of his nest
      line(c, [420, 120, 250, 188], '#3a2716', 16); line(c, [330, 156, 356, 92], '#3a2716', 8); circ(c, 360, 82, 30, '#1f5a3c'); circ(c, 326, 104, 18, '#1a4c33');
      sagaNest(c, 262, 182, 140, () => { sagaHeap(c, 290, 184, 72, 30, T, 8, 100); bossBaron(c, 236, 206, .9, T, { dir: -1, face: 'puppy' }); });
      const q = still() ? 1 : ease(clamp(k / 2.2, 0, 1)), zx = lerp(-40, 92, q), zy = 92 + (still() ? 0 : Math.sin(T * 3) * 4);
      zip(c, zx, zy, 1.5, T, 1);
      line(c, [zx + 44, zy - 10, zx + 50, zy + 22], '#e8436a', 2);
      sagaCog(c, zx + 50, zy + 40, 17, T);
    },
    (c, T, k) => {   // the Baron holds the shining cog up high, and an idea lights up over his head
      sagaHeap(c, 72, 256, 150, 60, T, 14, 120);
      zip(c, 122 + (still() ? 0 : Math.sin(T * 1.7) * 10), 128, 1.3, T, 1);
      bossBaron(c, 250, 255, 1.2, T, { dir: -1, face: 'joy' });
      sagaBeak(c, 250, 255, 1.2, -1, () => { line(c, [0, 0, -2, 14], '#e8436a', 2); sagaCog(c, -2, 30, 13, T); });
      const p = still() ? 1 : ease(clamp((k - .5) / .45, 0, 1));
      if (p > 0) sagaIdea(c, 226, 76, p, T);
    },
    (c, T, k) => {   // at night two magpies carry a long plank to a secret building site; the owl raises an eyebrow
      sagaSite(c, 296, 255, T);
      const q = still() ? 1 : ease(clamp(k / 2.6, 0, 1)), dx = lerp(-70, 0, q), walk = !still() && k < 2.6;
      for (const [x, i] of [[132, 0], [196, 1]]) magpie(c, x + dx, 255, .78, T + i, { pose: walk ? 'walk' : 'stand', face: 'smug' });
      rr(c, 102 + dx, 204, 128, 9, 2); c.fillStyle = '#c8935a'; c.fill();
      owl(c, 40, 255, .72, T, 'idle', false); storyBrow(c, 40, 255, .72, T);
      circ(c, 64, 172, 4, '#fff6da'); circ(c, 74, 160, 6, '#fff6da'); ell(c, 94, 134, 20, 17, '#fff6da');
      c.font = '900 26px ui-rounded, "Segoe UI", Roboto, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#4a3470'; c.fillText('?', 94, 143);
    },
  ],
  [ // 3. The Grand Opening
    (c, T, k) => {   // the Baron raises his hat; Zip carries an invitation to the owl, and one comes straight to you
      storyGate(c, 62, 255); owl(c, 62, 255, .8, T, 'cheer');
      bossBaron(c, 306, 255, 1, T, { dir: -1, face: 'joy', tip: still() ? 1 : Math.sin(Math.PI * clamp(k / 1.6, 0, 1)) });
      const q = still() ? 1 : ease(clamp(k / 2, 0, 1)), zx = lerp(250, 150, q);
      zip(c, zx, 92, 1.2, T, -1); line(c, [zx - 36, 84, zx - 36, 98], '#e8436a', 2); sagaLetter(c, zx - 36, 112, .62, 'owlI', .1);
      const g = still() ? 1 : ease(clamp((k - .6) / .9, 0, 1));
      sagaLetter(c, 196, 214 - 22 * g, .7 + .5 * g, 'rank:3', -.06);
    },
    (c, T, k) => {   // the museum opens: friends of the Watchwood arrive, and the fireflies stream in to light the hall
      sagaMuseum(c, 256, 255, still() ? 1 : clamp(k / 2.4, 0, 1), T);
      [[40, 0, .5], [92, 1, .48], [140, 2, .44]].forEach(([x, kind, s], i) => critter(c, x, 256, s, T + i, kind));
      for (let i = 0; i < 16; i++) {
        const u = still() ? (i + .5) / 16 : (T * .18 + i / 16) % 1, v = 1 - u, x = -10 * v * v + 240 * v * u + 256 * u * u, y = 6 * v * v - 40 * v * u + 206 * u * u;
        glow(c, x, y, 12, '255,216,107', .55); circ(c, x, y, 2.6, '#fff3a0');
      }
    },
    (c, T, k) => {   // inside: the cog has the place of honour, friends admire, and the Baron raises his hat to them
      c.fillStyle = '#35295a'; c.fillRect(-300, -300, 960, 556);
      c.fillStyle = '#7a5434'; c.fillRect(-300, 255, 960, 400);
      for (let x = -290; x < 660; x += 36) line(c, [x, 256, x - 24, 400], '#68462a', 2);
      // a garland of fireflies under the ceiling lights the hall
      c.beginPath(); for (let i = 0; i <= 12; i++) c.lineTo(-20 + i * 33.3, 22 + 26 * Math.sin(i / 12 * Math.PI)); c.lineWidth = 1.5; c.strokeStyle = '#8a7ab0'; c.stroke();
      for (let i = 0; i <= 12; i++) { const x = -20 + i * 33.3, y = 26 + 26 * Math.sin(i / 12 * Math.PI); glow(c, x, y, 22, '255,216,107', still() ? .5 : .4 + .15 * Math.sin(T * 2 + i)); circ(c, x, y, 3, '#fff3a0'); }
      // three plinths: the hand mirror, the cog on the tallest one, the bell
      for (const [px, ph, kind] of [[100, 50, 4], [182, 72, -1], [264, 50, 5]]) {
        rr(c, px - 21, 255 - ph, 42, ph, 3); c.fillStyle = '#cfc3ea'; c.fill(); rr(c, px - 26, 249 - ph, 52, 9, 3); c.fillStyle = '#efe8fa'; c.fill();
        if (kind < 0) sagaCog(c, px, 230 - ph, 18, T); else { sagaThing(c, kind, px, 228 - ph, 16); sagaGlint(c, px + 8, 218 - ph, 13, T, kind); }
      }
      owl(c, 38, 266, .72, T, 'cheer');
      zip(c, 226 + (still() ? 0 : Math.sin(T * 1.2) * 16), 104, 1.1, T, -1);
      critter(c, 144, 298, .44, T, 1); critter(c, 222, 298, .4, T + 1, 3);
      bossBaron(c, 318, 268, .9, T, { dir: -1, face: 'joy', tip: still() ? 1 : ease(clamp(k / .9, 0, 1)) });
    },
  ],
];

scenes.saga = {
  // the story strip's page turning (Next after the third panel calls then), keys, sparkles on a tap, and panel layout
  next: scenes.story.next, key: scenes.story.key, down: scenes.story.down, rect: scenes.story.rect,
  enter(o = {}) {
    const ch = this.ch = clamp(o.ch | 0, 1, 3), then = o.then || (() => go('hub'));
    this.i = 0;
    music.mood(ch === 3 ? 'party' : 'night');
    this.then = () => {
      S.saga = Math.max(S.saga, ch);
      if (ch < 3) { save(); return then(); }
      // The Baron's present comes with the last chapter and is saved at once: moonbeams, and the crown when the
      // wardrobe does not have it yet.
      const crown = has(WEAR, 'crown') && !S.own.crown;
      S.beams += 50; if (crown) S.own.crown = 1;
      save(); refreshHud(); sfx.fanfare();
      burst(V.w / 2, V.h * .35, 40, { colors: ['#ffd86b', '#fff', '#c9a0ff', '#7fd0ff'], speed: 320, life: 1.4, kind: 'star', size: 9 });
      owlSay(t('saga_gift'), { title: t('s_boss'), mood: 'cheer', quiet: true,
        html: `<div class="pics">${crown ? `<span class="pill pop">${ic('wear:crown', 30)}<b>${esc(t('w_crown'))}</b></span>` : ''}<span class="pill pop">${ic('beam', 22)}<b>+50</b></span></div>`,
        acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: then }] });
    };
    this.hud = hud(() => go('home'), '', true);   // to the title: the Night menu would bring a chapter that was cut short straight back
    // The caption card is the story strip's; three caption lines are reserved, so the panel keeps its size.
    this.box = $('.dlg', add(`<div class="bar badgebar"><div class="dlg" style="width:min(26em,100%)"><h2>${esc(t('saga_t' + ch))}</h2>
      <p id="sgCap" style="margin:.2em 0;font-size:1.15em;font-weight:800;min-height:3.9em;display:flex;align-items:center;justify-content:center"></p>
      <div class="pics" id="sgDots" aria-hidden="true"></div>
      <div class="acts"><button class="btn go big" id="sgNext">${ic('play', 30)}${esc(t('st_next'))}</button></div></div></div>`));
    $('#sgNext').onclick = () => this.next();
    $('#sgNext').focus({ preventScroll: true });
    this.show();
  },
  show() {
    this.at = V.t;
    const cap = t(`saga_c${this.ch}${this.i + 1}`);
    $('#sgCap').textContent = cap;
    // page dots as in the story strips: pages seen are filled, the current one is bigger
    $('#sgDots').innerHTML = [0, 1, 2].map(j => { const z = j === this.i ? 20 : 14; return `<span style="width:${z}px;height:${z}px;border-radius:50%;border:3px solid var(--gold);background:${j <= this.i ? 'var(--gold)' : 'none'}"></span>`; }).join('');
    say(cap); speak(cap);
    if (this.i < 2) return sfx.pop();
    // each chapter's last panel lands with its own sound: a wistful one, hammer taps, a sparkle
    const p = this.rect();
    [() => sfx.wish(), () => [0, .24, .48].forEach(w => tone(250, .07, 'square', .08, w, 170)), () => sfx.sparkle()][this.ch - 1]();
    burst(p.x + p.w / 2, p.y + p.h * .5, 24, [{ colors: ['#fff6da', '#ffe9a3'], speed: 110, g: 20, life: 1.4, size: 6 },
      { colors: ['#e8c984', '#c8935a'], speed: 160, size: 5 }, { kind: 'star', colors: ['#ffd86b', '#fff', '#c9a0ff', '#7fd0ff'], speed: 240, size: 8 }][this.ch - 1]);
  },
  // the story strip's frame and box, with this chapter's panels
  draw() {
    const T = still() ? 1 : V.t, k = still() ? 99 : V.t - this.at, p = this.rect(), pop = still() ? 1 : ease(clamp(k / .35, 0, 1)), i = Math.min(this.i, 2);
    this.panel = [p.x, p.y, p.w, p.h];
    drawSky(ctx, T); fireflies(ctx, T, 8);
    ctx.save(); ctx.translate(p.x + p.w / 2, p.y + p.h / 2); ctx.scale(.94 + .06 * pop, .94 + .06 * pop); ctx.translate(-p.w / 2, -p.h / 2);
    rr(ctx, 0, 7, p.w, p.h, 18); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
    rr(ctx, 0, 0, p.w, p.h, 18); ctx.fillStyle = '#fff6da'; ctx.fill();
    ctx.save(); rr(ctx, 6, 6, p.w - 12, p.h - 12, 13); ctx.clip();
    const u = Math.min((p.w - 12) / 360, (p.h - 12) / 300);
    ctx.translate(p.w / 2 - 180 * u, p.h - 6 - 300 * u); ctx.scale(u, u);
    storyBg(ctx, T, SAGA_DARK[this.ch - 1][i]);
    SAGA_PANELS[this.ch - 1][i](ctx, T, k);
    ctx.restore();
    if (pop < 1) { rr(ctx, 6, 6, p.w - 12, p.h - 12, 13); ctx.fillStyle = `rgba(255,246,218,${1 - pop})`; ctx.fill(); }
    ctx.restore();
  },
};
