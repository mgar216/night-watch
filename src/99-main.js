// ---------- Boot ----------
// A save that is damaged, old or edited by hand must not break the game or reach the page as HTML.
(() => {
  const int = (v, lo, hi) => clamp(v | 0, lo, hi);
  S.night = int(S.night, 1, 1e6); S.beams = int(S.beams, 0, 1e9); S.stars = int(S.stars, 0, 1e9); S.nest = int(S.nest, 0, 3);
  S.briefed = int(S.briefed, 0, S.night); S.testStar |= 0; S.gateStar |= 0;
  S.name = String(S.name || '').slice(0, 16); S.mute = !!S.mute; S.promo = !!S.promo;
  const st = S.st && typeof S.st === 'object' ? S.st : {};
  S.st = { cam: int(st.cam, 0, 3), gate: int(st.gate, 0, 3), forge: int(st.forge, 0, 3) };
  S.items = (Array.isArray(S.items) ? S.items : []).filter((it, i, all) => it && ITEMS[it.t] && Number.isInteger(it.m) && MOUNTS[it.m] &&
    (it.t === 'shield') === (it.m === VAULT) && all.findIndex(o => o && o.m === it.m) === i).map(it => ({ t: it.t, m: it.m }));
})();
resize();
go('home');
requestAnimationFrame(frame);
