// ---------- Boot ----------
// A save that is damaged, old or edited by hand must not break the game or reach the page as HTML.
(() => {
  const int = (v, lo, hi) => clamp(v | 0, lo, hi);
  S.night = int(S.night, 1, 1e6); S.beams = int(S.beams, 0, 1e9); S.stars = int(S.stars, 0, 1e9); S.nest = int(S.nest, 0, 3);
  S.briefed = int(S.briefed, 0, S.night); S.testStar |= 0; S.gateStar |= 0; S.boss |= 0; S.fooled |= 0;
  S.name = String(S.name || '').slice(0, 16); S.mute = !!S.mute; S.promo = !!S.promo; S.voice = S.voice !== false;
  for (const k of ['stk', 'own']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {};
  for (const k in S.stk) if (has(STK, k)) S.stk[k] = S.stk[k] === 2 ? 2 : 1; else delete S.stk[k];
  for (const k in S.own) if (has(WEAR, k)) S.own[k] = 1; else delete S.own[k];
  for (const k of ['hat', 'scarf', 'zhat', 'zscarf']) S[k] = has(WEAR, S[k]) && has(S.own, S[k]) && WEAR[S[k]].hat === k.endsWith('hat') ? S[k] : '';   // only things this player owns
  const st = S.st && typeof S.st === 'object' ? S.st : {};
  S.st = { cam: int(st.cam, 0, 3), gate: int(st.gate, 0, 3), forge: int(st.forge, 0, 3), extra: int(st.extra, 0, 3) };
  S.items = (Array.isArray(S.items) ? S.items : []).filter((it, i, all) => it && has(ITEMS, it.t) && Number.isInteger(it.m) && MOUNTS[it.m] &&
    (it.t === 'shield') === (it.m === VAULT) && all.findIndex(o => o && o.m === it.m) === i).map(it => ({ t: it.t, m: it.m }));
})();
resize();
go('home');
requestAnimationFrame(frame);
