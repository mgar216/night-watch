// ---------- Boot ----------
// A save that is damaged, old or edited by hand must not break the game or reach the page as HTML.
(() => {
  const int = (v, lo, hi) => clamp(v | 0, lo, hi);
  S.night = int(S.night, 1, 1e6); S.beams = int(S.beams, 0, 1e9); S.stars = int(S.stars, 0, 1e9); S.nest = int(S.nest, 0, 3);
  S.briefed = int(S.briefed, 0, S.night); S.testStar |= 0; S.gateStar |= 0; S.boss |= 0; S.fooled |= 0;
  S.name = String(S.name || '').slice(0, 16); S.mute = !!S.mute; S.promo = !!S.promo; S.voice = S.voice !== false;
  S.day = S.day < 0 ? +(S.night > 1) : S.day ? 1 : 0;   // a career from before there were days meets its first morning at once
  const str = (v, re) => typeof v === 'string' && re.test(v) ? v : '';
  for (const k of ['stk', 'own', 'gifts', 'bed', 'pals', 'visit', 'mem']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
  for (const k in S.gifts) if (GIFTS.includes(k)) S.gifts[k] = 1; else delete S.gifts[k];
  S.bedN = int(S.bedN, 0, 5); S.bed = { d: String(S.bed.d || '').slice(0, 10), n: int(S.bed.n, 0, 99), more: int(S.bed.more, 0, 99) };
  // the newer fields: counters in range, ids and dates in their plain shapes (they are used as keys and never shown as HTML)
  S.caught = int(S.caught, 0, 1e9); S.lit = int(S.lit, 0, 1e6); S.grow = int(S.grow, 0, 3); S.eye = int(S.eye, 0, 3); S.bdayY = int(S.bdayY, 0, 9999); S.saga = int(S.saga, 0, 3);
  for (const k in S.pals) if (/^[a-z0-9]{1,12}$/.test(k) && S.pals[k]) S.pals[k] = 1; else delete S.pals[k];
  S.helper = str(S.helper, /^[a-z0-9]{0,12}$/); S.flag = str(S.flag, /^[0-9a-z]{0,200}$/); S.bday = str(S.bday, /^\d{1,2}-\d{1,2}$/); S.memD = str(S.memD, /^[\d-]{0,10}$/); S.sup = str(S.sup, /^\d{0,24}$/);
  S.visit = { d: str(S.visit.d, /^[\d-]{0,10}$/), done: S.visit.done ? 1 : 0, n: int(S.visit.n, 0, 1e6) };
  S.mem = { d: str(S.mem.d, /^[\d-]{0,10}$/), k: str(S.mem.k, /^[a-z]{0,10}$/) };
  for (const k in S.stk) if (has(STK, k)) S.stk[k] = S.stk[k] === 2 ? 2 : 1; else delete S.stk[k];
  for (const k in S.own) if (has(WEAR, k)) S.own[k] = 1; else delete S.own[k];
  for (const k of ['hat', 'scarf', 'zhat', 'zscarf']) S[k] = has(WEAR, S[k]) && has(S.own, S[k]) && WEAR[S[k]].hat === k.endsWith('hat') ? S[k] : '';   // only things this player owns
  const st = S.st && typeof S.st === 'object' ? S.st : {};
  S.st = { cam: int(st.cam, 0, 3), gate: int(st.gate, 0, 3), forge: int(st.forge, 0, 3), extra: int(st.extra, 0, 3) };
  S.items = (Array.isArray(S.items) ? S.items : []).filter((it, i, all) => it && has(ITEMS, it.t) && Number.isInteger(it.m) && MOUNTS[it.m] &&
    (it.t === 'shield') === (it.m === VAULT) && all.findIndex(o => o && o.m === it.m) === i).map(it => ({ t: it.t, m: it.m }));
})();
resize();
// `#night` in the address: the Chief comes back from the day's fishing, straight to the Night (a first-time player still starts at home).
go(location.hash === '#night' && (S.name || S.night > 1 || S.briefed) ? 'hub' : 'home');
requestAnimationFrame(frame);
