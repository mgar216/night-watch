// ---------- Extra station: Mailbox Check (trick messages: keep a letter only with tonight's seal AND kind words) ----------
// Message pictures. The three trick pictures can carry a small red cross (`:1`) for the reference card.
const mailNo = (c, on) => { if (on === '1') { circ(c, .64, .64, .34, '#e0553f'); line(c, [.5, .5, .78, .78], '#fff', .1); line(c, [.78, .5, .5, .78], '#fff', .1); } };
ICON.mailKey = (c, no) => {   // a golden key and a big question mark: "tell me the password"
  c.save(); c.translate(-.22, .3); c.rotate(-.55); c.lineWidth = .06; c.strokeStyle = '#8a5a00';
  rr(c, -.16, -.08, .82, .16, .05); c.fillStyle = '#ffcf4a'; c.fill(); c.stroke();
  rr(c, .36, .04, .1, .22, .03); c.fill(); rr(c, .52, .04, .1, .3, .03); c.fill();
  c.beginPath(); c.arc(-.42, 0, .3, 0, TAU); c.fill(); c.stroke(); circ(c, -.42, 0, .11, '#8a5a00');
  c.restore();
  c.beginPath(); c.arc(.5, -.5, .24, Math.PI, Math.PI * 2.5); c.lineTo(.5, -.1); c.lineWidth = .15; c.strokeStyle = '#e0553f'; c.lineCap = 'round'; c.stroke();
  circ(c, .5, .14, .09, '#e0553f');
  mailNo(c, no);
};
ICON.mailClock = (c, no) => {   // an alarm clock and two exclamation marks: "hurry!"
  const x = -.24, y = .14;
  ell(c, x - .4, y - .52, .2, .14, '#ffcf4a', -.6); ell(c, x + .4, y - .52, .2, .14, '#ffcf4a', .6);
  line(c, [x - .32, y + .48, x - .46, y + .72], '#7a4c00', .1); line(c, [x + .32, y + .48, x + .46, y + .72], '#7a4c00', .1);
  circ(c, x, y, .6, '#e0553f'); circ(c, x, y, .47, '#fff');
  line(c, [x, y, x, y - .32], '#2a1c05', .09); line(c, [x, y, x + .22, y + .1], '#2a1c05', .09);
  for (const ex of [.56, .84]) { rr(c, ex - .07, -.8, .14, .62, .07); c.fillStyle = '#e0553f'; c.fill(); circ(c, ex, .04, .08, '#e0553f'); }
  mailNo(c, no);
};
ICON.mailGift = (c, no) => {   // a gift with sparkles: a prize that is too good to be true
  rr(c, -.62, -.2, 1.24, .95, .08); c.fillStyle = '#ff6b8a'; c.fill();
  rr(c, -.72, -.42, 1.44, .3, .08); c.fillStyle = '#ff9ab0'; c.fill();
  rr(c, -.1, -.42, .2, 1.17, .03); c.fillStyle = '#ffd24a'; c.fill();
  ell(c, -.2, -.55, .22, .13, '#ffd24a', .5); ell(c, .2, -.55, .22, .13, '#ffd24a', -.5);
  for (const [sx, sy, r] of [[-.8, -.76, .2], [.78, -.8, .22], [.88, .1, .15], [-.88, .25, .13]]) {
    starPath(c, sx, sy, r, r * .35, 4); c.fillStyle = '#ffd24a'; c.fill(); c.lineWidth = .04; c.strokeStyle = '#b07a00'; c.stroke();
  }
  mailNo(c, no);
};
ICON.mailHeart = c => {
  c.beginPath(); c.moveTo(0, .8); c.bezierCurveTo(-1.1, 0, -.6, -.95, 0, -.4); c.bezierCurveTo(.6, -.95, 1.1, 0, 0, .8);
  c.fillStyle = '#ff6b8a'; c.fill(); c.lineWidth = .08; c.strokeStyle = '#c23a5a'; c.stroke(); circ(c, -.35, -.3, .1, 'rgba(255,255,255,.7)');
};
// The seal: the gate's badge art on a scalloped wax disc. `ok` adds a green tick (reference card and intro).
ICON.mailSeal = (c, shape, style, ok) => {
  starPath(c, 0, 0, 1, .87, 16); c.fillStyle = '#e9d6a6'; c.fill(); c.lineWidth = .05; c.strokeStyle = '#a8864a'; c.stroke();
  c.save(); c.scale(.7, .7); badgeArt(c, shape, +style); c.restore();
  if (ok === '1') { circ(c, .64, .64, .34, '#3fae5e'); line(c, [.46, .64, .6, .78, .84, .5], '#fff', .1); }
};
ICON.mailBox = c => mailBoxArt(c, 0, 1, .019, { flag: 1 });   // for a menu card

// Message pictures that turn a letter into a trick.
const mailBad = { mailKey: 'key', mailClock: 'hurry', mailGift: 'prize' };
// Kind letters [line, pictures]; trick letters by kind. Every trick line carries its trick picture.
const mailFriends = [['mail_f1', ['jar', 'mailHeart']], ['mail_f2', ['moon', 'star']], ['mail_f3', ['feather', 'mailHeart']], ['mail_f4', ['flower', 'leaf']],
  ['mail_f5', ['star', 'moon', 'mailHeart']], ['mail_f6', ['frog', 'fish']], ['mail_f7', ['berry', 'acorn']], ['mail_f8', ['boat', 'sun']]];
const mailTricks = {
  key: [['mail_k1', ['mailKey', 'jar']], ['mail_k2', ['mailKey', 'lock']]],
  hurry: [['mail_h1', ['mailClock', 'gateI']], ['mail_h2', ['mailClock', 'jar']]],
  prize: [['mail_p1', ['mailGift', 'cake']], ['mail_p2', ['mailGift', 'rocket']]],
  combo: [['mail_c1', ['mailKey', 'mailGift']], ['mail_c2', ['mailClock', 'mailGift']], ['mail_c3', ['mailClock', 'mailKey']]],
  sweet: [['mail_s1', ['mailHeart', 'mailKey', 'flower']], ['mail_s2', ['cake', 'mailClock', 'flower']], ['mail_s3', ['berry', 'mailGift', 'mailHeart']]],
};
// Tonight's letters. A friend letter has tonight's seal and kind words; every trick letter has at least one thing wrong.
function mailQueue(n, seal) {
  const total = Math.min(5 + n, 10), bad = Math.max(2, Math.round(total * .45));
  // later Nights bring quieter tricks: a seal with the wrong pattern, two tricks at once, sweet words around a trick, no seal
  const sealErr = ['shape'].concat(n >= 3 ? ['style'] : [], n >= 5 ? ['none'] : []);
  const textErr = ['key', 'hurry', 'prize'].concat(n >= 2 ? ['combo'] : [], n >= 4 ? ['sweet'] : []);
  // from Night 3 some magpies sign with a friend's picture, so the sender never decides
  const masks = shuffle([...Array(bad).keys()]).slice(0, n < 3 ? 0 : Math.min(bad - 1, n - 2));
  const decks = {}, take = (k, src) => { if (!decks[k] || !decks[k].length) decks[k] = shuffle([...src]); return decks[k].pop(); };
  const q = [];
  for (let i = 0; i < total; i++) {
    const friend = i >= bad;
    // the first trick of a Night is a wrong seal on kind words, the second a trick message under the right seal
    const what = friend ? '' : i === 0 ? 'seal' : i === 1 ? 'text' : pick(['seal', 'text', 'both']);
    const se = what === 'seal' ? (i === 0 ? sealErr[sealErr.length - 1] : pick(sealErr)) : what === 'both' ? 'shape' : '';
    const te = what === 'text' ? (i === 1 && n > 1 ? textErr[textErr.length - 1] : pick(textErr)) : what === 'both' ? pick(textErr.slice(0, 3)) : '';
    const [line, pics] = te ? take(te, mailTricks[te]) : take('kind', mailFriends);
    const m = { friend, line, pics, bad: pics.filter(p => mailBad[p]).map(p => mailBad[p]), seal: { ...seal },
      from: friend || masks.includes(i) ? { kind: Math.random() * 5 | 0 } : { pie: n === 1 ? 0 : 1 + (Math.random() * 2 | 0) } };
    if (se === 'shape') m.seal.shape = pick(SHAPE_KEYS.filter(s => s !== seal.shape));
    if (se === 'style') m.seal.style = (seal.style + 1 + (Math.random() * 3 | 0)) % 4;
    if (se === 'none') m.seal = null;
    q.push(m);
  }
  shuffle(q);
  if (n === 1) q.unshift(...q.splice(q.findIndex(m => m.friend), 1));   // the first Night opens with a friend
  return q;
}
// What the owl says after a trick letter was kept: the first thing that was wrong with it.
function mailWhy(m, seal) {
  if (!m.seal) return 'mail_wNone';
  if (m.seal.shape !== seal.shape || m.seal.style !== seal.style) return 'mail_wSeal';
  return { key: 'mail_wKey', hurry: 'mail_wHurry', prize: 'mail_wPrize' }[m.bad[0]];
}
// The mailbox from the side: post foot at (x, y), door facing right. o.flag 0..1 raises the flag, o.open drops the door into a ledge.
function mailBoxArt(c, x, y, s, o = {}) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ell(c, 0, 0, 18, 4, 'rgba(0,0,0,.3)');
  rr(c, -6, -60, 12, 60, 3); c.fillStyle = '#7a4e28'; c.fill();
  rr(c, -38, -94, 76, 38, 18); c.fillStyle = '#4f7ae8'; c.fill(); c.fillRect(-38, -76, 76, 20);
  line(c, [-36, -58, 36, -58], '#2b4fb0', 4);
  if (o.open) { rr(c, 31, -92, 7, 34, 3); c.fillStyle = '#16224f'; c.fill(); line(c, [36, -57, 68, -57], '#9ab4ff', 5); }
  else { rr(c, 31, -92, 7, 34, 3.5); c.fillStyle = '#9ab4ff'; c.fill(); circ(c, 34.5, -75, 2.2, '#16224f'); }
  circ(c, 12, -76, 11, '#3fae5e'); drawIcon(c, 'yes', 12, -76, 13);   // the keep mark: a tick on a green disc
  // the flag lies along the box and stands up once a letter is inside
  c.save(); c.translate(-30, -68); c.rotate(-Math.PI / 2 * (o.flag || 0));
  line(c, [0, 0, 32, 0], '#dfe6f5', 3); poly(c, [20, -1, 33, -1, 33, -12, 20, -12], '#e0553f');
  c.restore();
  c.restore();
}
// A wicker basket with crumpled paper at (x, y); `bump` 0..1 makes the paper jump.
function mailBinArt(c, x, y, s, bump = 0) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ell(c, 0, 0, 30, 5, 'rgba(0,0,0,.3)');
  for (const [px, py, r] of [[-14, -66, 11], [6, -71, 12], [18, -64, 9]]) {
    const yy = py - bump * 9;
    circ(c, px, yy, r, '#fff6da'); line(c, [px - r * .5, yy, px + r * .3, yy - r * .4], '#c9b48a', 1.4);
  }
  poly(c, [-32, -62, 32, -62, 25, 0, -25, 0], '#b07a3a');
  for (let i = 0; i < 4; i++) { const yy = -50 + i * 13, d = (yy + 62) * .11; line(c, [-31 + d, yy, 31 - d, yy], '#8a5a2a', 3); }
  for (let j = -2; j <= 2; j++) line(c, [j * 12, -60, j * 9.5, -2], '#c98a45', 2);
  rr(c, -36, -67, 72, 9, 4); c.fillStyle = '#d29a55'; c.fill();
  circ(c, 0, -30, 12, '#e0553f'); drawIcon(c, 'no', 0, -30, 14);   // the toss mark: a cross on a red disc
  c.restore();
}
// The sender's picture on a perforated stamp. `from` is a forest friend { kind } or a magpie { pie: disguise }.
function mailStamp(c, from, x, y, size) {
  const h = size / 2, inner = size - 12, sc = inner / 84;
  c.save();
  rr(c, x - h, y - h, size, size, 2); c.fillStyle = '#fff'; c.fill();
  for (let i = 0; i <= 6; i++) { const p = -h + i * size / 6; for (const [a, b] of [[p, -h], [p, h], [-h, p], [h, p]]) circ(c, x + a, y + b, 3, '#fff6da'); }
  rr(c, x - h + 6, y - h + 6, inner, inner, 3); c.fillStyle = '#bfe3ff'; c.fill(); c.clip();
  if (from.pie !== undefined) magpie(c, x - 10 * sc, y + h + 2 * sc, sc * 1.1, 0, { face: 'sly', disguise: from.pie });
  else critter(c, x, y + h + 8 * sc, sc * .95, 0, from.kind);
  c.restore();
}
// Split a line into one or two rows that fit `max` (the font is already set): the most even split wins.
function mailWrap(c, text, max) {
  if (c.measureText(text).width <= max) return [text];
  const w = text.split(' ');
  let best = [text], bw = Infinity;
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(' '), b = w.slice(i).join(' '), x = Math.max(c.measureText(a).width, c.measureText(b).width);
    if (x < bw) { bw = x; best = [a, b]; }
  }
  return best;
}
// Font size and rows for a letter line: one row, or two when the language needs more room; never below 12 px on screen.
function mailFit(c, text, rest) {
  const lo = Math.max(16, 12 / rest);
  for (let fs = Math.max(20, lo); ; fs = Math.max(lo, fs - 1)) {
    c.font = `800 ${fs}px ui-rounded, "Segoe UI", Roboto, sans-serif`;
    const rows = mailWrap(c, text, 280);
    if (fs <= lo || Math.max(...rows.map(r => c.measureText(r).width)) <= 280) return { fs, rows };
  }
}
// One letter: a 300 x 210 sheet centred at (x, y), scaled by s. Sender stamp top left, seal top right,
// then 2 or 3 pictures and one short line of words. `rest` is the scale when the letter lies still (sets the font floor).
function mailLetterArt(c, m, x, y, s, rot = 0, rest = s) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  c.save(); c.translate(5, 7); rr(c, -150, -105, 300, 210, 16); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); c.restore();
  rr(c, -150, -105, 300, 210, 16); c.fillStyle = '#fff6da'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#d9c18a'; c.stroke();
  line(c, [-48, -76, 40, -76], '#eadbb4', 4); line(c, [-48, -58, 18, -58], '#eadbb4', 4);   // address lines
  mailStamp(c, m.from, -106, -60, 68);
  if (m.seal) drawIcon(c, `mailSeal:${m.seal.shape}:${m.seal.style}`, 104, -58, 80);
  else { c.setLineDash([7, 6]); c.lineWidth = 3; c.strokeStyle = '#b89a5e'; c.beginPath(); c.arc(104, -58, 32, 0, TAU); c.stroke(); c.setLineDash([]); }   // where the seal should be
  const n = m.pics.length;
  m.pics.forEach((p, i) => { const px = (i - (n - 1) / 2) * 82; rr(c, px - 35, -24, 70, 64, 12); c.fillStyle = '#f3e6c4'; c.fill(); drawIcon(c, p, px, 8, 52); });
  const { fs, rows } = mailFit(c, t(m.line), rest);
  c.fillStyle = '#2a1c05'; c.textAlign = 'center';
  rows.forEach((r, i) => c.fillText(r, 0, rows.length === 1 ? 76 : 64 + i * (fs + 3), 284));
  c.restore();
}
// A folded paper hat (made from one of our letters) sitting on a head whose top is at (x, y).
function mailHat(c, x, y, s) {
  c.save(); c.translate(x, y); c.rotate(-.15); c.scale(s, s);
  poly(c, [-18, -4, 18, -4, 2, -32], '#fff6da'); line(c, [-18, -4, 18, -4, 2, -32, -18, -4], '#b89a5e', 1.6);
  rr(c, -20, -8, 40, 8, 2); c.fillStyle = '#f0e2bd'; c.fill();
  line(c, [-5, -16, 8, -16], '#c9b48a', 1.4); line(c, [-2, -22, 6, -22], '#c9b48a', 1.4);
  c.restore();
}

scenes.mail = {
  enter() {
    const n = S.night;
    // tonight's seal stays the same for the whole Night, also after "try again"
    this.seal = { shape: SHAPE_KEYS[(n * 2 + 1) % SHAPE_KEYS.length], style: n * 3 % 4 };
    this.q = mailQueue(n, this.seal);
    Object.assign(this, { i: 0, state: 'wait', at: V.t, right: 0, kept: 0, tossed: 0, run: false, done: false, outFor: 1,
      noT: 0, gigT: -9, sadT: -9, sadKind: 0, cutT: 0, wonT: 0, landT: -9, landKeep: true, flagT: 0, showFor: 1, card: null });
    const seal = `mailSeal:${this.seal.shape}:${this.seal.style}:1`, lab = (i, k, px = 34) => `<span class="lab">${ic(i, px)}${esc(t(k))}</span>`;
    this.hudEl = hud(() => go('hub'), `<span class="pill" id="pMail">${ic('yes', 20)}<span><b>0</b>/${this.q.length}</span></span>`);
    this.ref = add(`<div class="ref">${lab(seal, 'mail_seal', 40)}<span class="sep"></span>${lab('mailKey:1', 'mail_rKey')}${lab('mailClock:1', 'mail_rHurry')}${lab('mailGift:1', 'mail_rPrize')}</div>`);
    const b = add(`<div class="bar gatebtns"><button class="btn go" id="mailKeep">${ic('yes', 30)}${esc(t('mail_keep'))}</button>
      <button class="btn no" id="mailToss">${ic('no', 30)}${esc(t('mail_toss'))}</button></div>`);
    $('#mailKeep', b).onclick = () => this.decide(true);
    $('#mailToss', b).onclick = () => this.decide(false);
    owlSay(t('mail_intro'), { html: picsHtml([seal, 'mailKey:1', 'mailClock:1', 'mailGift:1']),
      acts: [{ label: t('go'), cls: 'go', icon: 'play', fn: () => { this.run = true; this.state = 'in'; this.at = V.t; } }] });
  },
  key(e) { if (e.repeat) return; if (e.key === 'ArrowLeft') this.decide(true); if (e.key === 'ArrowRight') this.decide(false); },
  // Screen layout from the viewport and the overlay: ground line, mailbox (left), bin (right), and the biggest letter that fits.
  lay() {
    const k = clamp(Math.min(V.w / 400, V.h / 500), .8, 1.6), gy = V.h - Math.max(118, V.h * .2), land = wide();
    const hb = this.hudEl.getBoundingClientRect().bottom, rf = this.ref.getBoundingClientRect();
    const mx = Math.max(46 * k, V.w * (land ? .13 : .16));
    let bx = Math.min(V.w - 40 * k, V.w * (land ? .87 : .84));
    if (rf.bottom > gy - 80 * k && rf.left < bx + 40 * k) bx = rf.left - 42 * k;   // a reference column at the right edge: the bin stands left of it
    let top, bot, lft, rgt;
    if (land) { top = hb + 6; bot = gy - 8; lft = mx + 76 * k; rgt = Math.min(bx - 40 * k, rf.left - 8); }
    else { top = Math.max(hb, rf.bottom) + 8; bot = gy - 142 * k; lft = 8; rgt = V.w - 8; }
    const half = Math.min(V.w / 2 - lft, rgt - V.w / 2), mid = half > 110, cx = mid ? V.w / 2 : (lft + rgt) / 2;
    const w = Math.min(mid ? half * 2 : rgt - lft, (bot - top) / .7, 560), h = w * .7;
    return { k, gy, mx, bx, card: [cx - w / 2, (top + bot - h) / 2, w, h],
      mbHit: [mx - 44 * k, gy - 100 * k, 88 * k, 100 * k], binHit: [bx - 40 * k, gy - 84 * k, 80 * k, 84 * k] };
  },
  decide(keep) {
    if (!this.run || this.state !== 'ask') return;
    const m = this.q[this.i], ok = keep === m.friend, N = this.q.length;
    m.keep = keep; this.state = 'out'; this.at = V.t; this.outFor = ok ? 1 : 2.4;   // after a slip there is time to see and hear why
    this.landT = V.t + (still() ? 0 : .7); this.landKeep = keep; this.showFor = this.outFor - (this.landT - V.t);   // reactions last until the next letter
    if (keep && !this.flagT) this.flagT = this.landT;
    if (ok) {
      // a happy pop, and sparkles (mailbox) or feathers (bin) where the letter lands
      this.right++; sfx.pop();
      later(() => { const g = this.lay(); burst(keep ? g.mx + 38 * g.k : g.bx, g.gy - (keep ? 75 : 66) * g.k, 14, keep ? { speed: 150, colors: ['#ffd86b', '#fff', '#8fe3a4'] } : { kind: 'feather', colors: ['#1a1a22', '#dfe6f5'], speed: 150 }); sfx.yes(); }, still() ? 0 : 650);
    } else if (keep) {
      // a trick letter in the mailbox: a magpie pops out and giggles; the second one ends the shift
      this.kept++; this.noT = V.t + 1.8;
      if (this.kept < 2) {
        this.gigT = this.landT;
        later(() => speak(t('mail_hehe'), 'pie'), 750);   // magpie chatter, as in the sticker album
        if (this.i < N - 1) later(() => toast(t(mailWhy(m, this.seal))), 1100);
      }
    } else {
      // a friend's letter in the bin: the friend looks sad (never angry) and the owl says so kindly
      this.tossed++; this.noT = V.t + 1.4; this.sadT = this.landT; this.sadKind = m.from.kind; sfx.oops();
      later(() => toast(t('mail_oops')), 450);
    }
    $('#pMail b').textContent = this.right;
    if (this.kept >= 2) {
      // cutscene: the magpie hops out of the mailbox in a paper hat and throws the letters about
      this.run = false; this.done = true; this.cutT = this.landT;
      later(() => { const g = this.lay(); sfx.boing(); burst(g.mx + 50 * g.k, g.gy - 80 * g.k, 18, { kind: 'feather', colors: ['#fff6da', '#f0e2bd', '#dfe6f5'], speed: 210, g: 110, life: 1.6, size: 9 }); }, 900);
      later(() => speak(t('mail_hehe'), 'pie'), 1150);
      later(() => stationFail('mail', t('soft') + ' ' + t('mail_tip')), 3300);
    } else if (this.i === N - 1) {
      // the result is settled and saved with the last letter; the owl's dialog follows when it has landed
      this.run = false; this.done = true;
      const wrong = N - this.right;
      if (this.right >= Math.ceil(N * .8)) {
        const stars = wrong === 0 ? 3 : wrong === 1 ? 2 : 1, gain = award('mail', stars);
        this.wonT = V.t;
        later(() => stationWin('mail', stars, gain), 900);
      } else later(() => stationFail('mail', t('soft') + ' ' + t(this.tossed > this.kept ? 'mail_tipFriend' : 'mail_tip')), 1500);
    }
  },
  update() {
    const dt = V.t - this.at;
    if (this.state === 'in' && dt > (still() ? .3 : .8)) {
      this.state = 'ask'; this.at = V.t;
      const words = t(this.q[this.i].line); speak(words); say(words);   // the owl reads every letter aloud for young readers
    } else if (this.state === 'out' && !this.done && dt > this.outFor) { this.i++; this.state = 'in'; this.at = V.t; }   // the last letter sets `done`, so a next one exists
  },
  down(x, y) {
    if (this.state !== 'ask') return;
    const g = this.lay(), hit = ([rx, ry, rw, rh]) => x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    if (hit(g.mbHit)) this.decide(true);
    else if (hit(g.binHit)) this.decide(false);
    else if (hit(g.card)) speak(t(this.q[this.i].line));   // tap the letter to hear it again
  },
  draw() {
    const t0 = V.t, g = this.lay(), { k, gy, mx, bx } = g, [lx, ly, cw, ch] = g.card, s = cw / 300, cx = lx + cw / 2, cy = ly + ch / 2;
    const dt = t0 - this.at, m = this.q[this.i], quiet = still();
    this.card = g.card;   // read by a layout audit: the overlay must not cover the letter
    drawSky(ctx, t0);
    ctx.fillStyle = '#0c1740'; ctx.fillRect(0, gy, V.w, V.h);
    ell(ctx, V.w / 2, gy + 6, V.w * .6, 12, '#13235a');
    fireflies(ctx, t0, 6);
    // where a letter lands glows for a moment: a cue that also works without motion
    const lk = t0 - this.landT;
    if (lk > 0 && lk < .8) glow(ctx, this.landKeep ? mx + 30 * k : bx, gy - 70 * k, 75 * k, this.landKeep ? '150,255,190' : '255,216,107', .7 * (1 - lk / .8));
    mailBinArt(ctx, bx, gy, k, quiet || this.landKeep || lk < 0 ? 0 : Math.max(0, Math.sin(Math.min(1, lk * 3) * Math.PI)));
    // a friend whose letter went into the bin: sad, never angry, with one small tear (gone before the next letter comes)
    const sk = t0 - this.sadT;
    if (sk > 0 && sk < this.showFor) {
      const fx = bx - 62 * k, fs = .72 * k;
      critter(ctx, fx, gy, fs, t0, this.sadKind, true);
      ell(ctx, fx - 9 * fs, gy - 54 * fs + (quiet ? 0 : t0 * 16 % 8) * fs, 1.8 * fs, 2.8 * fs, '#7fd0ff');
    }
    // the mailbox, its flag, the owl on the roof, and a giggling magpie when a trick letter got in
    // (the magpie is drawn first, so its tail stays inside the box and it seems to climb out of the door)
    const gk = t0 - this.gigT, ck = this.cutT ? t0 - this.cutT - .2 : -1, pop = gk > 0 && gk < this.showFor || ck > 0;
    const flag = this.flagT && t0 > this.flagT ? (quiet ? 1 : Math.min(1, (t0 - this.flagT) * 4)) : 0;
    const ms = .8 * k, px = mx + 52 * k, py = gy - 59 * k - (quiet || !pop ? 0 : Math.abs(Math.sin((ck > 0 ? ck : gk) * 8)) * 5 * k);
    if (pop) magpie(ctx, px, py, ms, t0, { face: 'smug' });
    mailBoxArt(ctx, mx, gy, k, { open: pop, flag });
    if (ck > 0) mailHat(ctx, px + 20 * ms, py - 64 * ms, ms);
    const mood = this.wonT || ck > 0 ? 'cheer' : t0 < this.noT ? 'no' : 'idle', jump = ck > 0 && ck < .5 && !quiet ? Math.sin(ck * TAU) * 10 * k : 0;
    owl(ctx, mx - 14 * k, gy - 94 * k - jump, .42 * k, t0, mood, false);
    const bub = pop ? [px + 20 * ms, py - (ck > 0 ? 98 : 70) * ms] : null;
    // the letter: Zip brings it in, it waits for the Chief, then it flies into the mailbox or crumples into the bin
    if (m && this.state !== 'wait') {
      let x = cx, y = cy, sc = s, rot = 0, show = true, ball = 0;
      if (this.state === 'in' && !quiet) { const f = ease(Math.min(1, dt / .8)); x = lerp(V.w + cw * .5, cx, f); y = lerp(ly - ch * .3, cy, f); sc = lerp(s * .35, s, f); rot = (1 - f) * .3; }
      if (this.state === 'ask') glow(ctx, cx, cy, cw * .66, '255,216,107', .16);
      if (this.state === 'out') {
        const f = ease(Math.min(1, dt / .7));
        show = !quiet && f < 1;
        if (m.keep) { x = lerp(cx, mx + 38 * k, f); y = lerp(cy, gy - 75 * k, f); sc = lerp(s, s * .08, f); }
        else { x = lerp(cx, bx, f); y = lerp(cy, gy - 66 * k, f) - Math.sin(f * Math.PI) * 60 * k; sc = lerp(s, s * .08, f); rot = f * 4; ball = f > .35 ? lerp(24, 10, f) * k : 0; }
      }
      if (show && ball) {   // a crumpled paper ball
        circ(ctx, x, y, ball, '#fff6da'); line(ctx, [x - ball * .6, y - ball * .2, x + ball * .1, y + ball * .3, x + ball * .5, y - ball * .4], '#c9b48a', 2);
      } else if (show) mailLetterArt(ctx, m, x, y, sc, rot, s);
      const zs = Math.max(.6, k * .9);
      if (this.state === 'in') zip(ctx, x + 132 * sc, y - 112 * sc, zs, t0, -1);
      else if (this.state === 'ask' && dt < .8 && !quiet) zip(ctx, cx + 132 * s - dt * V.w * .8, ly - 8 - dt * 140, zs, t0, -1);
    }
    // the magpie's "hee hee" bubble goes on top of everything
    if (bub) {
      const txt = t('mail_hehe'), fs = Math.max(12, Math.round(14 * k));
      ctx.font = `800 ${fs}px ui-rounded, "Segoe UI", Roboto, sans-serif`;
      const w = ctx.measureText(txt).width + 18, h = fs + 14, x0 = clamp(bub[0] - w * .3, 6, V.w - w - 6), y0 = bub[1] - h - 8;
      rr(ctx, x0, y0, w, h, 10); ctx.fillStyle = '#fff6da'; ctx.fill();
      poly(ctx, [bub[0] - 6, y0 + h - 1, bub[0] + 6, y0 + h - 1, bub[0], y0 + h + 8], '#fff6da');
      ctx.fillStyle = '#2a1c05'; ctx.textAlign = 'left'; ctx.fillText(txt, x0 + 9, y0 + fs + 4);
    }
  },
};
