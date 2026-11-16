// ---------- The badge certificate (to save or print) and the players who share this device ----------
// The certificate is painted on its own canvas, 1400 x 990 (the shape of a sheet of paper on its side), on light paper so it prints well.
function certCanvas() {
  const W = 1400, H = 990, el = document.createElement('canvas'), r = rank(), font = (w, px) => `${w} ${px}px ui-rounded, "Segoe UI", Roboto, "Noto Sans", sans-serif`;
  el.width = W; el.height = H;
  const c = el.getContext('2d'), text = (s, x, y, f, col, max) => { c.font = f; c.fillStyle = col; c.fillText(s, x, y, max); };
  c.fillStyle = '#fff8e6'; c.fillRect(0, 0, W, H);
  c.lineJoin = 'round';
  rr(c, 34, 34, W - 68, H - 68, 30); c.lineWidth = 12; c.strokeStyle = '#22306e'; c.stroke();
  rr(c, 58, 58, W - 116, H - 116, 20); c.lineWidth = 4; c.strokeStyle = '#c79a2e'; c.stroke();
  for (const [x, y] of [[104, 104], [W - 104, 104], [104, H - 104], [W - 104, H - 104]]) { starPath(c, x, y, 24, 10, 5); c.fillStyle = '#f2b93b'; c.fill(); }
  c.textAlign = 'center';
  text(t('certTitle'), W / 2, 178, font(900, 66), '#22306e', W - 300);
  glow(c, 310, 520, 250, '255,207,74', .5); drawIcon(c, 'rank:' + r, 310, 520, 330);
  text(playerName(), 860, 400, font(900, 92), '#2a1c05', 660);
  line(c, [560, 430, 1160, 430], '#c79a2e', 4);
  text(t('certText'), 860, 496, font(600, 34), '#4a3a1a', 700);
  text(t('rank' + r), 860, 584, font(900, 62), '#b07a00', 700);
  drawIcon(c, 'star', 700, 668, 60); c.textAlign = 'left'; text(String(S.stars), 742, 686, font(800, 50), '#2a1c05');
  drawIcon(c, 'moon', 900, 668, 56); text(`${t('nights')}: ${nightsDone()}`, 940, 686, font(800, 44), '#2a1c05', 230);
  c.textAlign = 'center';
  line(c, [520, 850, 1010, 850], '#8a7a5a', 3);
  text(t('certSign'), 765, 894, font(600, 28), '#4a3a1a', 520);
  text(new Date().toLocaleDateString(LANGS[lang], { year: 'numeric', month: 'long', day: 'numeric' }), 300, 894, font(600, 28), '#4a3a1a', 300);
  owl(c, 1215, 912, 2, 1, 'idle', false);   // (time 1: at time 0 the owl is in the middle of a blink, and a certificate is kept)
  zip(c, 1085, 770, 2.4, 0, -1);
  return el;
}
function showCert() {
  const url = certCanvas().toDataURL('image/png');
  const v = modal(`<img class="cert" alt="${esc(t('certTitle'))}: ${esc(playerName())}, ${esc(t('rank' + rank()))}, ${esc(t('nights'))}: ${nightsDone()}" src="${url}">
    <div class="acts"><a class="btn" id="cSave" download="night-watch-certificate.png" href="${url}">${ic('saveI', 26)}${esc(t('saveImg'))}</a>
    <button class="btn" id="cPrint">${ic('printI', 26)}${esc(t('print'))}</button>
    <button class="btn go" id="cOk">${ic('yes', 26)}${esc(t('ok'))}</button></div>`, t('cert'), 'certdlg');
  $('#cSave', v).onclick = () => sfx.pop();
  // Printing: the picture goes into a page-only box; the print stylesheet hides the game and shows the box.
  $('#cPrint', v).onclick = () => {
    sfx.click();
    let box = $('#print');
    if (!box) { box = document.createElement('div'); box.id = 'print'; document.body.appendChild(box); }
    box.innerHTML = ''; box.appendChild(Object.assign(new Image(), { src: url, alt: '' }));
    setTimeout(() => window.print(), 60);   // give the picture a moment to appear in the box
  };
  $('#cOk', v).onclick = () => { sfx.click(); closeDlg(); };
  $('#cOk', v).focus({ preventScroll: true });
}

// ----- Players: up to four save slots on one device (brothers and sisters each keep their own career) -----
function slotInfo(i) {
  if (i === slot) return { name: S.name, night: S.night, stars: S.stars };
  try {
    const d = JSON.parse(localStorage.getItem(slotKey(i)) || 'null');
    return d && typeof d === 'object' ? { name: String(d.name || '').slice(0, 16), night: clamp(d.night | 0, 1, 1e6), stars: clamp(d.stars | 0, 0, 1e9) } : null;
  } catch (e) { return null; }
}
// Changing the player reloads the page, so nothing of the old career stays in memory.
function playAs(i, start) {
  save();
  try { if (start) localStorage.setItem(slotKey(i), JSON.stringify(start)); localStorage.setItem('nightwatch.slot', i); } catch (e) { return; }   // nothing can be saved here: the one player stays
  location.reload();
}
// Erasing a career and setting bedtime are for grown-ups: a small sum stands in front of them. A wrong answer simply closes
// the question (`wrong` says where to: the players panel unless told otherwise).
function askGrownUp(then, wrong = () => showPlayers()) {
  const a = 3 + (Math.random() * 6 | 0), b = 4 + (Math.random() * 5 | 0);
  owlSay(t('eraseAsk', { a, b }), { quiet: true, mood: 'idle', acts: shuffle([a + b, a + b + 1, a + b - 2]).map(n => ({ label: String(n), fn: n === a + b ? then : wrong })) });
  if (document.activeElement) document.activeElement.blur();   // no answer is in focus: a key held or mashed cannot pick one
}
function showPlayers() {
  const rows = [...Array(SLOTS).keys()].map(i => {
    const d = slotInfo(i);
    return d ? `<div class="who${i === slot ? ' me' : ''}"><button class="btn" data-go="${i}" aria-pressed="${i === slot}">${ic('rank:' + rankAt(d.night), 30)}<span>${esc(d.name || t('nameDef'))}</span>${ic('star', 18)}<b>${d.stars}</b></button>
      <button class="btn round" data-del="${i}" aria-label="${esc(t('erase'))}: ${esc(d.name || t('nameDef'))}">${ic('bin', 24)}</button></div>`
      : `<div class="who"><button class="btn" data-new="${i}">${ic('plus', 24)}<span>${esc(t('newPlayer'))}</span></button></div>`;
  }).join('');
  const [bm, bd] = S.bday.split('-');
  const v = modal(`<h2>${esc(t('players'))}</h2><div class="whos">${rows}</div><div class="acts"><button class="btn" id="wBed">${ic('moon', 24)}${esc(t('bedSet'))}: ${S.bedN || esc(t('bedOff'))}</button>
    <button class="btn" id="wBday">${ic('wear:party', 24)}${esc(t('bdaySet'))}: ${S.bday ? bd + '.' + bm : '?'}</button>
    <button class="btn go" id="wOk">${ic('yes', 26)}${esc(t('ok'))}</button></div>`, t('players'));
  // Bedtime: the sum first, then after how many Nights a day the owl says good night (off, or one to five).
  $('#wBed', v).onclick = () => { sfx.click(); askGrownUp(() => owlSay(t('bedAsk'), { quiet: true, mood: 'idle',
    acts: [0, 1, 2, 3, 4, 5].map(n => ({ label: n ? String(n) : t('bedOff'), cls: n === S.bedN ? 'go' : '', fn: () => { S.bedN = n; save(); showPlayers(); } })) })); };
  // The birthday of this player: the sum first, then the day and the month (no year). On that day the owl keeps it.
  $('#wBday', v).onclick = () => { sfx.click(); askGrownUp(() => {
    const opts = (n, sel) => `<option value="0">?</option>` + [...Array(n).keys()].map(i => `<option value="${i + 1}"${i + 1 === +sel ? ' selected' : ''}>${i + 1}</option>`).join('');
    const w = modal(`<h2>${esc(t('bdaySet'))}</h2><div class="pics bday"><label>${esc(t('bdayDay'))} <select id="bdD">${opts(31, bd)}</select></label>
      <label>${esc(t('bdayMon'))} <select id="bdM">${opts(12, bm)}</select></label></div>
      <div class="acts"><button class="btn go" id="bdOk">${ic('yes', 26)}${esc(t('ok'))}</button></div>`, t('bdaySet'));
    // a day the month does not have becomes its last day (the 31st of a short month would never come)
    $('#bdOk', w).onclick = () => { sfx.click(); const m = +$('#bdM', w).value, d = Math.min(+$('#bdD', w).value, [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] || 0); S.bday = d && m ? m + '-' + d : ''; save(); showPlayers(); };
    $('#bdOk', w).focus({ preventScroll: true });
  }); };
  v.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { sfx.click(); +b.dataset.go === slot ? closeDlg() : playAs(+b.dataset.go); });
  v.querySelectorAll('[data-new]').forEach(b => b.onclick = () => { sfx.pop(); playAs(+b.dataset.new, { lang: S.lang, mute: S.mute, voice: S.voice }); });
  v.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    sfx.click();
    const i = +b.dataset.del;
    askGrownUp(() => {
      // The current player starts afresh in the same language; another player's row becomes free. The player's fishing career goes too.
      try {
        i === slot ? localStorage.setItem(slotKey(i), JSON.stringify({ lang: S.lang, mute: S.mute, voice: S.voice })) : localStorage.removeItem(slotKey(i));
        for (const k of ['firstlight.v1', 'firstlight.day']) localStorage.removeItem(k + (i ? '.' + (i + 1) : ''));
      } catch (e) { /* nothing was saved */ }
      i === slot ? location.reload() : showPlayers();
    });
  });
  $('#wOk', v).onclick = () => { sfx.click(); closeDlg(); };
  $('#wOk', v).focus({ preventScroll: true });
}
