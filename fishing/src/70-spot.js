// ---------- The fishing spot: the five beats (read the water, tackle, cast, bite, fight) for all nine waters ----------
// Entered with go('spot', { area }), left with go('map'). Everything comes from the shared tables:
// AREA[id] (tier, conds, twist, fish), TIER[tier], SPECIES, ITEMS through rig(), owns(), WATER[id] painters and amb.
Object.assign(L, {
  spot_cast: ['Cast', 'Заброс', 'Lancia'],
  spot_castHint: ['Hold, let go on the gold line', 'Держи и отпусти на золотой черте', 'Tieni premuto, rilascia sulla linea d\'oro'],
  spot_tackle: ['Tackle', 'Снасти', 'Attrezzi'],
  spot_tackleT: ['Tackle box', 'Ящик со снастями', 'Cassetta da pesca'],
  spot_reelIn: ['Reel in', 'Смотать', 'Recupera'],
  spot_drag: ['Drag {n}/5', 'Тормоз {n}/5', 'Frizione {n}/5'],
  spot_dragL: ['Looser drag', 'Ослабить тормоз', 'Frizione più lenta'],
  spot_dragT: ['Tighter drag', 'Затянуть тормоз', 'Frizione più stretta'],
  spot_dragW: ['Drag', 'Тормоз', 'Frizione'],
  spot_net: ['Net it!', 'Подсак!', 'Guadino!'],
  spot_netHint: ['Tap when the ring is gold', 'Жми, когда круг золотой', 'Tocca quando il cerchio è d\'oro'],
  spot_release: ['Release it', 'Отпустить', 'Liberalo'],
  spot_first: ['First catch!', 'Первый улов!', 'Prima cattura!'],
  spot_record: ['New record!', 'Новый рекорд!', 'Nuovo record!'],
  spot_gift: ['A gift for the treehouse!', 'Подарок для домика на дереве!', 'Un dono per la casa sull\'albero!'],
  spot_paid: ['moon|moons', 'луна|луны|лун', 'luna|lune'],
  spot_tied: ['Tied on', 'Выбрано', 'Montato'],
  spot_c_dawn: ['Dawn', 'Рассвет', 'Alba'], spot_c_day: ['Day', 'День', 'Giorno'], spot_c_dusk: ['Dusk', 'Сумерки', 'Tramonto'],
  spot_c_night: ['Night', 'Ночь', 'Notte'], spot_c_rain: ['Rain', 'Дождь', 'Pioggia'], spot_c_aurora: ['Aurora', 'Сияние', 'Aurora'],
  spot_c_squall: ['Squall', 'Шквал', 'Burrasca'], spot_c_fog: ['Fog', 'Туман', 'Nebbia'],
  // the shadow card: what the eye can tell about a fish nobody has named yet
  spot_unknown: ['A shadow you do not know', 'Незнакомая тень', 'Un\'ombra sconosciuta'],
  spot_szL: ['Size', 'Размер', 'Taglia'], spot_dpL: ['Depth', 'Глубина', 'Profondità'], spot_mvL: ['Moves', 'Плавает', 'Si muove'],
  spot_sz0: ['tiny', 'крошечный', 'minuscola'], spot_sz1: ['small', 'небольшой', 'piccola'], spot_sz2: ['big', 'крупный', 'grande'], spot_sz3: ['huge', 'огромный', 'enorme'],
  spot_d0: ['near the top', 'у поверхности', 'in superficie'], spot_d1: ['in the middle', 'в толще воды', 'a mezz\'acqua'], spot_d2: ['near the bottom', 'у дна', 'sul fondo'],
  spot_m_cruise: ['in slow, steady laps', 'медленно, кругами', 'a giri lenti'], spot_m_dart: ['in quick dashes', 'быстрыми рывками', 'a scatti veloci'],
  spot_m_lurk: ['waits under cover', 'ждёт в укрытии', 'aspetta al riparo'], spot_m_school: ['in a little group', 'стайкой', 'in gruppetto'],
  spot_which: ['Which fish is this?', 'Что это за рыба?', 'Che pesce è?'],
  spot_right: ['Yes! Now you know its shadow.', 'Верно! Теперь ты знаешь её тень.', 'Sì! Ora conosci la sua ombra.'],
  spot_wrong: ['Not this one. Look again later.', 'Не она. Присмотрись в другой раз.', 'Non è lui. Riprova più tardi.'],
  spot_likes: ['It took: {l}', 'Взяла: {l}', 'Ha preso: {l}'],
  spot_likesD: ['It bit: {d}', 'Клевала: {d}', 'Ha abboccato: {d}'],
  spot_close: ['Close', 'Закрыть', 'Chiudi'],
  // what the water says
  spot_fake: ['Only a bump. Wait for the real bite.', 'Только толчок. Жди настоящей поклёвки.', 'Solo una toccata. Aspetta l\'abboccata vera.'],
  spot_spook: ['Too early. It is gone.', 'Рано. Рыба ушла.', 'Troppo presto. Se n\'è andato.'],
  spot_late: ['Too late. It let go.', 'Поздно. Рыба бросила приманку.', 'Troppo tardi. Ha mollato.'],
  spot_refuse: ['It looked, and turned away.', 'Посмотрела и отвернулась.', 'Ha guardato e si è girato.'],
  spot_bite: ['Bite! Tap!', 'Клюёт! Жми!', 'Abbocca! Tocca!'],
  spot_hooked: ['Hooked!', 'Попалась!', 'Preso!'],
  spot_snapped: ['Snap! The line broke.', 'Щёлк! Леска лопнула.', 'Crac! La lenza si è spezzata.'],
  spot_weakLine: ['This fish is stronger than your line. Loosen the drag, or tie on a stronger line.', 'Эта рыба сильнее твоей лески. Ослабь тормоз или привяжи леску покрепче.', 'Questo pesce è più forte della tua lenza. Allenta la frizione o monta una lenza più robusta.'],
  spot_netLost: ['It slipped out of the net and swam away.', 'Рыба выскользнула из подсака и уплыла.', 'È scivolato fuori dal guadino ed è nuotato via.'],
  spot_slack: ['The line went slack. The hook slipped out.', 'Леска провисла, крючок выскочил.', 'La lenza si è allentata: l\'amo è scivolato via.'],
  spot_jumpLost: ['It threw the hook in the air.', 'Рыба сбросила крючок в прыжке.', 'Ha sputato l\'amo in aria.'],
  spot_spool: ['The spool ran empty.', 'Леска на катушке кончилась.', 'La bobina è vuota.'],
  spot_netMiss: ['Missed! It pulls again.', 'Мимо! Рыба снова тянет.', 'Mancato! Tira di nuovo.'],
  spot_faster: ['Faster than it looked.', 'Быстрее, чем казалось.', 'Più veloce di quanto sembrava.'],
  spot_snag: ['Snag! The lure is stuck there.', 'Зацеп! Приманка застряла.', 'Incaglio! L\'esca è rimasta lì.'],
  spot_snagFree: ['Snag guard! It pulled free.', 'Защита от коряг! Приманка свободна.', 'Paraincagli! L\'esca si è liberata.'],
  spot_jump: ['Jump! Let go!', 'Прыжок! Отпусти!', 'Salta! Molla!'],
  spot_descend: ['It goes down. Let it.', 'Уходит вниз. Не тяни, пусть уходит.', 'Scende. Lascialo scendere.'],
  spot_still: ['It went still...', 'Затихла...', 'Si è fermato...'],
  spot_lily: ['Right on a lily pad!', 'Прямо на кувшинку!', 'Proprio su una ninfea!'],
  spot_hide: ['The squall! The fish hide.', 'Шквал! Рыба прячется.', 'La burrasca! I pesci si nascondono.'],
  spot_hole: ['Only through a hole in the ice.', 'Только через лунку во льду.', 'Solo da un buco nel ghiaccio.'],
  spot_drift: ['The current took the lure away.', 'Течение унесло приманку.', 'La corrente ha portato via l\'esca.'],
  spot_silence: ['Hush. Let it be still.', 'Тише. Не шевели приманку.', 'Shh. Lascia ferma l\'esca.'],
  spot_toll: ['Far away, the drowned bell rings.', 'Где-то далеко звонит затонувший колокол.', 'Lontano suona la campana sommersa.'],
  // the tackle box
  spot_k_rod: ['Rods', 'Удочки', 'Canne'], spot_k_line: ['Lines', 'Лески', 'Lenze'], spot_k_reel: ['Reels', 'Катушки', 'Mulinelli'], spot_k_lure: ['Lures', 'Приманки', 'Esche'],
  spot_pow: ['Power', 'Сила', 'Potenza'], spot_fin: ['Finesse', 'Чуткость', 'Finezza'], spot_str: ['Strength', 'Прочность', 'Tenuta'], spot_thin: ['Fineness', 'Тонкость', 'Sottigliezza'],
  spot_drg: ['Smooth', 'Плавность', 'Morbidezza'], spot_spl: ['Spool {n} m', 'Шпуля {n} м', 'Bobina {n} m'], spot_left: ['{n} left', 'осталось: {n}', 'rimaste: {n}'],
  spot_free: ['never runs out', 'не кончается', 'non finisce mai'],
  spot_a0: ['still', 'стоит', 'ferma'], spot_a1: ['twitching', 'подёргивается', 'guizzante'], spot_a2: ['darting', 'мечется', 'scattante'],
  spot_f_worm: ['worm', 'червяк', 'verme'], spot_f_bug: ['bug', 'жучок', 'insetto'], spot_f_grain: ['grain', 'зерно', 'granaglia'], spot_f_minnow: ['minnow', 'малёк', 'pesciolino'],
  spot_f_shiny: ['shiny', 'блестяшка', 'luccicante'], spot_f_shrimp: ['shrimp', 'креветка', 'gamberetto'], spot_f_glow: ['glow', 'свечение', 'luminosa'],
  spot_glow: ['glows', 'светится', 'brilla'], spot_lit: ['lit', 'с огоньком', 'accesa'],
  // the owl teaches the five beats on the first visit to the pond, one at a time
  spot_t1: ['Look at the water, Chief. The dark shapes are fish! Tap one to look closer.', 'Посмотри на воду, командир. Тёмные тени — это рыбы! Нажми на одну, чтобы рассмотреть.', 'Guarda l\'acqua, Capo. Le ombre scure sono pesci! Toccane una per guardarla meglio.'],
  spot_t2: ['Your tackle box holds rods, lines and lures. Each fish likes its own lure. Tap one to tie it on.', 'В ящике со снастями — удочки, лески и приманки. Каждая рыба любит свою приманку. Нажми на приманку, чтобы привязать её.', 'Nella cassetta ci sono canne, lenze ed esche. Ogni pesce ha la sua esca preferita. Toccane una per montarla.'],
  spot_t3: ['Tap the water where the lure should land. Then hold Cast and let go on the gold line.', 'Нажми на воду там, куда должна упасть приманка. Потом держи «Заброс» и отпусти на золотой черте.', 'Tocca l\'acqua dove deve cadere l\'esca. Poi tieni premuto «Lancia» e rilascia sulla linea d\'oro.'],
  spot_t4: ['Now wait. Little bumps are not the bite. When the line pulls hard, tap!', 'Теперь жди. Лёгкие толчки — ещё не поклёвка. Когда леска сильно дёрнется, жми!', 'Ora aspetta. Le piccole toccate non sono ancora l\'abboccata. Quando la lenza tira forte, tocca!'],
  spot_t5: ['Hold to reel, let go to give line. Keep the needle in the striped band. When the fish is tired, net it!', 'Держи, чтобы тянуть, отпусти, чтобы отдать леску. Держи стрелку в полосатой зоне. Устанет — лови подсаком!', 'Tieni premuto per recuperare, rilascia per dare lenza. Tieni la lancetta nella fascia a righe. Quando è stanco, prendilo col guadino!'],
});

css(`
.spot-top { flex-wrap: wrap; row-gap: .3em; }
.spot-top .spot-chips { order: 5; flex: 1 1 100%; justify-content: center; }
@media (min-width: 600px) { .spot-top { flex-wrap: nowrap; } .spot-top .spot-chips { order: 0; flex: 0 1 auto; justify-content: flex-start; } }
.spot-chips { display: flex; gap: .3em; flex-wrap: wrap; align-items: center; pointer-events: none; min-width: 0; }
.spot-chip { display: inline-flex; align-items: center; gap: .25em; min-height: 34px; padding: .1em .55em; border-radius: 999px; background: var(--panel);
  border: 2px solid var(--line); font-weight: 800; font-size: max(11px, .78em); white-space: nowrap; pointer-events: none; }
.spot-chip .moonrow canvas { width: 11px !important; height: 11px !important; }
.spot-bar { gap: .4em; }
.spot-bar .btn { min-height: 52px; }
.spot-bar .btn.go { min-width: 7.5em; touch-action: none; }
.spot-drag { display: inline-flex; align-items: center; gap: .2em; padding: .15em; border-radius: 999px; background: var(--panel); border: 2px solid var(--line); }
.spot-drag .btn { box-shadow: none; }
.spot-pips { display: inline-flex; gap: 3px; padding: 0 .2em; } .spot-pips i { width: 9px; height: 20px; border-radius: 3px; background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.45); }
.spot-pips i.on { background: var(--gold); } .spot-pips i:nth-child(n+4).on { background: #ff9a6a; }
.spot-box { position: absolute; left: 0; right: 0; bottom: 0; max-height: 62%; display: flex; flex-direction: column; gap: .3em; padding: .5em .5em calc(.5em + env(safe-area-inset-bottom));
  background: rgba(6, 10, 32, .94); border-top: 3px solid var(--line); border-radius: 1.2em 1.2em 0 0; pointer-events: auto; }
.spot-box h2 { margin: 0; font-size: 1.1em; color: var(--gold); display: flex; align-items: center; gap: .4em; }
.spot-box h2 .sp { flex: 1; }
.spot-list { overflow-y: auto; touch-action: pan-y; display: flex; flex-direction: column; gap: .3em; min-height: 0; }
.spot-kind { font-size: max(11px, .75em); opacity: .85; margin: .2em 0 0; }
.spot-row { display: flex; gap: .35em; flex-wrap: wrap; }
.spot-it { display: flex; align-items: center; gap: .4em; min-height: 52px; padding: .25em .6em .25em .3em; border-radius: .9em; border: 3px solid var(--line); background: #22327a;
  color: #fff; font-weight: 800; font-size: max(11px, .78em); cursor: pointer; text-align: left; line-height: 1.15; }
.spot-it[aria-pressed=true] { background: #f2b93b; color: #3a2400; border-color: #fff; }
.spot-it small { display: block; font-weight: 700; font-size: max(11px, .85em); opacity: .9; }
.spot-stat { display: inline-flex; align-items: center; gap: .2em; margin-right: .5em; }
.spot-stat b { display: inline-flex; gap: 1px; } .spot-stat b i { width: 6px; height: 10px; border-radius: 2px; background: currentColor; opacity: .25; } .spot-stat b i.on { opacity: 1; }
.spot-card { position: absolute; width: min(18em, 92%); padding: .5em .6em; border-radius: 1em; background: var(--panel); border: 3px solid var(--line); pointer-events: auto; font-size: .9em; }
.spot-card h3 { margin: 0 0 .2em; padding-right: 50px; min-height: 44px; font-size: 1.05em; color: var(--gold); display: flex; align-items: center; gap: .3em; }
.spot-card .spot-x { position: absolute; top: .25em; right: .25em; width: 48px; height: 48px; box-shadow: none; }
.spot-card p { margin: .1em 0; font-weight: 700; }
.spot-card .acts { margin-top: .4em; gap: .35em; }
.spot-card .acts .btn { padding: .3em .7em; font-size: .95em; }
.spot-catch .pics canvas { max-width: 100%; }
.spot-drag .lab { font-size: max(11px, .7em); font-weight: 800; padding: 0 .1em; }
.spot-catch .marks { display: flex; gap: .4em; justify-content: center; flex-wrap: wrap; margin-top: .3em; }
@media (max-height: 520px) {
  .spot-box { max-height: 82%; } .spot-it { min-height: 48px; } .spot-chip { min-height: 30px; }
  .spot-card { width: min(28em, 78%); font-size: .8em; } .spot-card p { display: inline-block; margin: 0 .8em 0 0; } .spot-card .acts { margin-top: .2em; }
  .spot-catch .pics canvas { width: 96px !important; height: 96px !important; }
  .spot-bar .btn { min-height: 48px; padding-top: .2em; padding-bottom: .2em; }
}
@media (min-aspect-ratio: 23/20) { .spot-box { left: auto; width: min(26em, 60%); top: 0; max-height: none; border-radius: 1.2em 0 0 1.2em; border-top: 0; border-left: 3px solid var(--line); } }
`);

// Fixed numbers of the water: depth bands, an icon for each condition (shape and word, never colour alone), how often each rarity shows.
const SPOT_BANDS = [[.04, .3], [.36, .62], [.7, .95]];        // the depth bands as parts of the local depth
const SPOT_COND_IC = { dawn: 'sun', day: 'sun', dusk: 'moon', night: 'moon', rain: 'leaf', aurora: 'star', squall: 'bell', fog: 'feather' };
const SPOT_RAR = [0, 10, 5, 2.2, 1, .3];                         // how often each rarity shows up
// minus and plus for the drag buttons (a looser or a tighter drag)
ICON.spotLess = c => line(c, [-.6, 0, .6, 0], '#fff', .3);
ICON.spotMore = c => { line(c, [-.6, 0, .6, 0], '#fff', .3); line(c, [0, -.6, 0, .6], '#fff', .3); };

scenes.spot = {
  // ----- entering and leaving -----
  enter(arg) {
    const id = (arg && arg.area) || 'pond', A = AREA[id];
    Object.assign(this, {
      id, A, tier: A.tier, T: TIER[A.tier], tw: A.twist || {}, W: WATER[id],
      ci: 0, cond: A.conds[0], condT: 0, condLen: 50,
      pop: [], st: 'read', mark: .45, markD: 0, pow: 0, powDir: 1, sel: -1,
      lure: null, fish: null, bite: null, msg: null, gone: [],
      catches: 0, snaps: 0, guard: 1, lesson: 0, lessonT: 0, silent: 0, tollT: 999, bellSeen: 0, tolls: [],
      env: { t: 0, cond: A.conds[0], swell: 0, tide: .5, wind: 0, squall: 0, light: [], toll: 999 },
      G: { w: 0, h: 0, surf: 0, bed: 0, x0: 0, x1: 0, ax: 0, ay: 0, u: 1 },
      drag: 3, dragChanged: 0, flash: 0, flashT: 4, boxOpen: false, boxEl: null, cardEl: null, F: null, left: false, time: 0, spawnT: 6,
      fakeTold: 0, hushTold: 0, hideTold: 0, refusals: 0, lost: 0, cardsSeen: 0, aiming: false, taut: 0, shake: 0, dip: 0, hand: null, lastCatch: null, sqShown: 0,
    });
    S.at = id; save();
    this.ui();
    this.geo();
    for (let i = 0; i < this.popSize(); i++) this.spawn(true);
    emit('enter', { area: id });
    emit('cond', { area: id, cond: this.cond });
    if (typeof amb !== 'undefined') amb.set(id, this.env);
    if (this.tw.bell) this.tollT = rnd(40, 80);
    if (id === 'pond' && !S.tut.b1) later(() => this.teach(1), 600);
  },
  exit() { this.leaveData(); },
  leaveData() {
    if (this.left) return;
    this.left = true;
    emit('leave', { area: this.id, catches: this.catches, snaps: this.snaps });
  },
  back() {
    if (this.boxOpen) return this.box(false);
    this.F = null;                                             // retreat is always free: a hooked fish simply swims away
    sfx.click(); go('map');
  },

  // ----- the overlay: top bar, chips, the action bar -----
  ui() {
    ui.innerHTML = '';
    const A = this.A;
    hud(() => this.back(), `<span class="spot-chips"><span class="spot-chip" id="spPlaque">${esc(t('a_' + this.id))} ${moonRow(A.tier, 11)}</span>
      <span class="spot-chip" id="spCond"></span><span class="spot-chip" id="spRig"></span></span>`);
    $('.hud').classList.add('spot-top');
    this.bar = add(`<div class="bar spot-bar"></div>`);
    this.chips();
    this.buttons();
  },
  chips() {
    const c = $('#spCond'), r = $('#spRig'), lu = rig().lure;
    if (c) { c.innerHTML = `${ic(SPOT_COND_IC[this.cond] || 'sun', 20)}${esc(t('spot_c_' + this.cond))}${this.cond === 'squall' ? ` <b id="spSq"></b>` : ''}`; paintIcons(c); }
    if (r) { r.innerHTML = `${ic('item:' + lu.id, 22)}${esc(t('i_' + lu.id))}`; r.setAttribute('aria-label', t('spot_tied') + ': ' + t('i_' + lu.id)); paintIcons(r); }
  },
  // The action bar changes with the beat. Every action is a real button; the keys do the same things.
  buttons() {
    const b = this.bar, st = this.st;
    // the logbook is a trip away from the water, so it opens only between casts: never in the middle of a bite or a fight
    const bk = $('#hBook'); if (bk) bk.disabled = st !== 'read' && st !== 'power';
    b.innerHTML = '';
    if (st === 'read' || st === 'power') {
      b.innerHTML = `<button class="btn" id="spBox" aria-keyshortcuts="T">${ic('item:' + rig().lure.id, 26)}${esc(t('spot_tackle'))}</button>
        <button class="btn go" id="spCast" aria-keyshortcuts="Space">${ic('play', 24)}${esc(t('spot_cast'))}</button>`;
      $('#spBox', b).onclick = () => { sfx.click(); this.box(!this.boxOpen); };
      const c = $('#spCast', b);
      // hold the button to fill the power bar, let go to cast: the same as holding the space bar
      c.onpointerdown = e => { e.preventDefault(); c.setPointerCapture && c.setPointerCapture(e.pointerId); this.charge(); };
      c.onpointerup = () => this.release();
      c.onpointercancel = () => this.release(true);
      c.onkeydown = e => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); e.stopPropagation(); this.charge(); } };
      c.onkeyup = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); this.release(); } };
    } else if (st === 'wait' || st === 'bite') {
      b.innerHTML = `<button class="btn" id="spIn">${ic('retry', 24)}${esc(t('spot_reelIn'))}</button>`;
      $('#spIn', b).onclick = () => { sfx.reel(); this.reelIn(); };
    } else if (st === 'fight' || st === 'net') {
      b.innerHTML = `<span class="spot-drag" role="group" aria-label="${esc(t('spot_drag', { n: this.drag }))}">
        <button class="btn round" id="spDl" aria-label="${esc(t('spot_dragL'))}" aria-keyshortcuts="ArrowDown">${ic('spotLess', 20)}</button>
        <span class="lab" aria-hidden="true">${esc(t('spot_dragW'))}</span><span class="spot-pips" id="spPips" role="img"></span>
        <button class="btn round" id="spDt" aria-label="${esc(t('spot_dragT'))}" aria-keyshortcuts="ArrowUp">${ic('spotMore', 20)}</button></span>
        ${st === 'net' ? `<button class="btn gold" id="spNet" aria-keyshortcuts="Enter">${ic('star', 24)}${esc(t('spot_net'))}</button>` : ''}`;
      // after a tap the focus leaves the button, so the space bar goes on reeling
      $('#spDl', b).onclick = e => { this.setDrag(-1); if (e.detail) e.currentTarget.blur(); };
      $('#spDt', b).onclick = e => { this.setDrag(1); if (e.detail) e.currentTarget.blur(); };
      if ($('#spNet', b)) $('#spNet', b).onclick = () => this.netTry();
      this.pips();
    }
    paintIcons(b);
  },
  pips() {
    const p = $('#spPips');
    if (!p) return;
    p.innerHTML = [1, 2, 3, 4, 5].map(i => `<i class="${i <= this.drag ? 'on' : ''}"></i>`).join('');
    p.setAttribute('aria-label', t('spot_drag', { n: this.drag }));
    p.parentNode.setAttribute('aria-label', t('spot_drag', { n: this.drag }));
  },
  setDrag(k) {
    const d = clamp(this.drag + k, 1, 5);
    if (d === this.drag) { sfx.empty(); return; }
    this.drag = d; sfx.reel(); sfx.click();
    if (this.st === 'fight' || this.st === 'net') this.dragChanged = 1;
    this.pips();
    say(t('spot_drag', { n: d }));
  },

  // ----- geometry: where the water is on this screen -----
  geo() {
    const G = this.G, hudEl = $('.hud'), barEl = this.bar;
    const top = hudEl ? hudEl.getBoundingClientRect().bottom : 56;
    const bot = barEl ? barEl.getBoundingClientRect().top : V.h - 64;
    G.w = V.w; G.h = V.h; G.u = clamp(Math.min(V.w / 400, V.h / 640), .75, 2);
    this.meterY = bot - 34;                                         // the tension meter has its own strip above the bar
    G.bed = this.meterY - 6;
    G.surf = Math.round(lerp(top, G.bed, wide() ? .36 : .33));
    G.x0 = V.w * (wide() ? .2 : .24); G.x1 = V.w - 6;
    this.stand();
    this.top = top;
  },
  resize() { this.geo(); },
  // screen position of a water point
  px(p) { return lerp(this.G.x0, this.G.x1, p); },
  py(p, d) { const G = this.G; return G.surf + this.env.swell + d * this.W.bed(clamp(p, 0, 1)) * (G.bed - G.surf); },
  feat(kind, p) { for (const f of this.W.feats || []) if (f.kind === kind && p >= f.p0 && p <= f.p1) return f; return null; },
  feats(kind) { return (this.W.feats || []).filter(f => f.kind === kind); },
};

// ----- Beat 1: the living water. Shadows of the species that fit the condition, each moving by its own signature. -----
Object.assign(scenes.spot, {
  stand() { const G = this.G, s = this.W.stand ? this.W.stand(G, this.env) : [G.x0 - 20, G.surf]; G.ax = s[0]; G.ay = s[1]; },
  popSize() { return 4 + Math.min(3, this.tier >> 1); },
  legendId() { return LEGENDS[AREAS.indexOf(this.A)]; },
  // The species that can be here now: not the Legendary (it comes by its own rule), and only those whose condition it is.
  pool() {
    const c = this.cond, sq = this.env.squall > .85;
    return this.A.fish.filter(id => { const s = SPECIES[id]; return s && !s.legend && (!s.when || s.when.includes(c)) && (!sq || this.brave(s)); });
  },
  brave(s) { return (s.when && s.when.includes('squall')) || (s.tricks || []).includes('squallonly'); },
  zone(s) { return s.zone || [.06, .97]; },
  spawn(init) {
    const pool = this.pool();
    if (!pool.length) return;
    let tot = 0;
    for (const id of pool) tot += SPOT_RAR[SPECIES[id].rar] || 1;
    let r = rnd(tot), id = pool[0];
    for (const k of pool) { r -= SPOT_RAR[SPECIES[k].rar] || 1; if (r <= 0) { id = k; break; } }
    const lead = this.add(id, init);
    if (SPECIES[id].move === 'school') for (let i = 0; i < 2; i++) this.add(id, init, lead);
    // the Chapel: some shadows have no fish behind them at all
    if (this.tw.decoys && Math.random() < .5) this.add(pick(pool), init, null, true);
  },
  // One shadow. p and d are where it is (d: part of the local depth); its weight is chosen now, so a big shadow is a heavy fish.
  add(id, init, lead, decoy) {
    const s = SPECIES[id], z = this.zone(s), k = Math.pow(Math.random(), 1.6), b = SPOT_BANDS[s.depth | 0];
    const f = { id, s, lead, decoy: !!decoy, k, g: lerp(s.w[0], s.w[1], k), p: init ? rnd(z[0], z[1]) : (Math.random() < .5 ? z[0] : z[1]),
      d: rnd(b[0], b[1]), tp: 0, td: 0, v: 0, dir: Math.random() < .5 ? -1 : 1, wait: rnd(.5, 2), st: 'swim', a: init ? 1 : 0, ph: rnd(TAU),
      no: 0, look: 0, wrong: this.tw.still && Math.random() < .5, home: null, asked: 0, wag: 0 };
    if (s.move === 'lurk') {
      // a lurker keeps to cover: reeds, beams, the dock, a snag or a rock inside its zone
      const cover = (this.W.feats || []).filter(c => /reeds|dock|beam|snag|rock|lily/.test(c.kind) && c.p1 >= z[0] && c.p0 <= z[1]);
      if (cover.length) { const c = pick(cover); f.home = (c.p0 + c.p1) / 2; f.p = f.home; if (c.d1 !== undefined) f.d = clamp((c.d0 + c.d1) / 2, .05, .95); }
    }
    this.target(f);
    this.pop.push(f);
    return f;
  },
  // The next place a shadow swims to, by its signature.
  target(f) {
    const s = f.s, z = this.zone(s), b = SPOT_BANDS[s.depth | 0], tide = this.tw.tide ? (this.env.tide - .5) * -.16 : 0;
    let lo = z[0], hi = z[1];
    const drop = this.feats('drop')[0];
    if (drop && s.size >= 1.6) lo = Math.max(lo, drop.p0);       // big shadows keep below the drop-off
    if (f.lead) { f.tp = f.lead.p + rnd(-.04, .04); f.td = f.lead.d + rnd(-.05, .05); return; }
    if (s.move === 'lurk' && f.home !== null) { f.tp = f.home + rnd(-.03, .03); f.td = clamp(f.d + rnd(-.04, .04), b[0], b[1]); f.wait = rnd(2, 5); return; }
    if (s.move === 'cruise') f.tp = f.tp > (lo + hi) / 2 ? lo + rnd(.05) : hi - rnd(.05);   // steady laps end to end
    else if (s.move === 'dart') f.tp = clamp(f.p + rnd(-.25, .25), lo, hi);                 // a quick dash nearby
    else f.tp = rnd(lo, hi);
    f.tp = clamp(f.tp + tide, .03, .98);
    f.td = rnd(b[0], b[1]);
    f.wait = s.move === 'dart' ? rnd(.6, 1.8) : s.move === 'cruise' ? rnd(.2, .8) : rnd(1, 3);
  },
  // Speed in p per second: darts dash, cruisers glide, a fish going for the lure keeps its own pace.
  swimSpeed(f) {
    const sp = f.s.speed || 4;
    if (f.st === 'flee') return .18 + sp * .012;
    if (f.s.move === 'dart' && f.st === 'swim') return .1 + sp * .02;
    return (.025 + sp * .005) * (f.s.move === 'lurk' && f.st === 'swim' ? .5 : 1);
  },
  movePop(dt) {
    const env = this.env;
    for (let i = this.pop.length - 1; i >= 0; i--) {
      const f = this.pop[i];
      f.a = f.st === 'flee' || f.st === 'hide' ? f.a - dt * .8 : Math.min(1, f.a + dt * .5);
      if (f.a <= 0 && (f.st === 'flee' || f.st === 'hide')) { this.pop.splice(i, 1); if (this.sel >= this.pop.length) this.sel = -1; continue; }
      if (f.no > 0) f.no -= dt;
      if (f.st === 'swim' || f.st === 'flee' || f.st === 'hide') {
        if (f.st === 'swim' && f.wait > 0) { f.wait -= dt; f.v *= .9; }
        else {
          const dp = f.tp - f.p, sp = this.swimSpeed(f);
          if (Math.abs(dp) < .01 && f.st === 'swim') this.target(f);
          else { f.v = lerp(f.v, Math.sign(dp) * sp, Math.min(1, dt * 3)); f.p += f.v * dt; if (Math.abs(f.v) > .005) f.dir = f.v > 0 ? 1 : -1; }
          f.d = lerp(f.d, f.td, Math.min(1, dt * .8));
        }
      } else if (f.st === 'go' || f.st === 'look') this.approach(f, dt);
      f.wag = Math.min(1, Math.abs(f.v) * 12 + .25);
      // the squall's peak: all but the bravest go down and hide
      if (env.squall > .85 && f.st === 'swim' && !this.brave(f.s)) { f.st = 'hide'; f.tp = f.p; f.td = .98; }
      f.p = clamp(f.p, -.05, 1.05);
    }
    // keep the water alive: a new shadow now and then, and the Legendary by its own rule
    this.spawnT = (this.spawnT || 0) - dt;
    if (this.spawnT <= 0) {
      this.spawnT = rnd(5, 9);
      if (this.pop.filter(f => f.st !== 'flee' && f.st !== 'hide').length < this.popSize()) this.spawn(false);
      this.legendTry();
    }
  },
  // The Legendary shows seldom, only under its own rule, and more often once the rest of this water is in the logbook.
  legendTry() {
    const id = this.legendId(), s = SPECIES[id];
    if (!s || this.pop.some(f => f.id === id) || (this.F && this.F.id === id)) return;
    const tr = s.tricks || [];
    if (s.when && !s.when.includes(this.cond)) return;
    if (tr.includes('squallonly') && this.cond !== 'squall') return;
    if (tr.includes('dawnonly') && this.cond !== 'dawn') return;
    const others = this.A.fish.filter(k => k !== id), got = others.filter(caught).length / Math.max(1, others.length);
    let k = .01 + .12 * got * got;                            // per check (every 5 to 9 s): about once in ten minutes, once a minute with a full log
    if (tr.includes('light') && this.lure0().lit) k *= 2;   // drawn to a lit lure
    if (Math.random() < k) { this.add(id, false); if (this.tw.bell) this.toll(2); }
  },
  lure0() { return rig().lure; },
  // How visible a shadow is here and now: rain makes it flicker, murk hides it away from the lure, decoys waver.
  seeAlpha(f) {
    let a = f.a * (this.F ? .55 : 1);
    if (this.tw.rain) a *= .3 + .7 * Math.max(0, Math.sin(V.t * 1.7 + f.ph * 5));
    if (this.tw.murk) {
      const L = this.lure, near = L ? 1 - Math.hypot((f.p - L.p) * 1.4, f.d - L.d) / .3 : 0;
      a *= Math.max(f.d < .3 ? .85 : .12, clamp(near, 0, 1));
    }
    if (f.decoy) a *= .45 + .35 * Math.sin(V.t * .9 + f.ph);
    return clamp(a, 0, 1);
  },
  // shadow length in px: the species' size, a little more for a heavy one
  flen(f) { return (30 + 26 * (f.s.size || 1) * (.85 + .3 * f.k)) * this.G.u; },
  hitShadow(x, y) {
    let best = -1, bd = 1e9;
    this.pop.forEach((f, i) => {
      if (f.st === 'flee' || f.st === 'hide' || this.seeAlpha(f) < .15) return;
      const fx = this.px(f.p), fy = this.py(f.p, f.d), r = Math.max(28, this.flen(f) * .6), d = Math.hypot(x - fx, y - fy);
      if (d < r && d < bd) { bd = d; best = i; }
    });
    return best;
  },

  // ----- the shadow card: what the eye can tell, then a name once the fish has been caught -----
  card(i) {
    this.closeCard();
    const f = this.pop[i];
    if (!f) return;
    this.sel = i;
    if (f.decoy) { f.st = 'flee'; f.tp = f.p; sfx.empty(); floatText(this.px(f.p), this.py(f.p, f.d), '?', '#cfd8ff', 20); return; }   // nothing behind it
    const s = f.s, e = S.log[f.id] || (S.log[f.id] = { n: 0, best: 0 }), sz = s.size < .7 ? 0 : s.size < 1.2 ? 1 : s.size < 2 ? 2 : 3;
    if (!e.seen) { e.seen = 1; save(); }
    const known = e.n && e.id, facts = `<p>${esc(t('spot_szL'))}: ${esc(t('spot_sz' + sz))}</p><p>${esc(t('spot_dpL'))}: ${esc(t('spot_d' + (s.depth | 0)))}</p><p>${esc(t('spot_mvL'))}: ${esc(t('spot_m_' + s.move))}</p>`;
    let html = '';
    if (known) {
      html = `<h3>${ic('fishI:' + f.id + ':shadow', 26)}${esc(t('f_' + f.id))}</h3>${facts}` +
        (e.lure ? `<p>${ic('item:' + e.lure, 20)} ${esc(t('spot_likes', { l: t('i_' + e.lure) }))}</p>` : '') +
        (e.depth !== undefined ? `<p>${esc(t('spot_likesD', { d: t('spot_d' + e.depth) }))}</p>` : '');
    } else if (e.n && !f.asked) {
      // caught before but never named from its shadow: three names, one is right
      const others = shuffle(this.A.fish.filter(k => k !== f.id && SPECIES[k] && !SPECIES[k].legend)).slice(0, 2);
      const opts = shuffle([f.id, ...others]);
      html = `<h3>${esc(t('spot_which'))}</h3>${facts}<div class="acts">${opts.map(k => `<button class="btn" data-k="${k}">${esc(t('f_' + k))}</button>`).join('')}</div>`;
    } else html = `<h3>${ic('fishI:' + f.id + ':shadow', 26)}${esc(t('spot_unknown'))}</h3>${facts}`;
    const c = add(`<div class="spot-card pop" role="dialog" aria-label="${esc(t('spot_which'))}"><button class="btn round no spot-x" id="spCardX" aria-label="${esc(t('spot_close'))}">${ic('no', 18)}</button>${html}</div>`);
    c.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
      f.asked = 1;
      if (b.dataset.k === f.id) { e.id = 1; save(); sfx.yes(); emit('identify', { id: f.id }); toast(t('spot_right')); this.card(this.pop.indexOf(f)); }
      else { sfx.oops(); nudge(b); toast(t('spot_wrong')); this.closeCard(); }
    });
    $('#spCardX', c).onclick = () => { sfx.click(); this.closeCard(); };
    const x = this.px(f.p), r = c.getBoundingClientRect(), uiR = ui.getBoundingClientRect();
    // to the right of the Chief whenever the screen is wide enough, so the card never hides the bird
    const maxL = uiR.width - r.width - 6;
    c.style.left = clamp(x - uiR.left - r.width / 2, Math.min(this.G.ax - uiR.left + 34 * this.G.u, maxL), maxL) + 'px';
    // the card sits in the sky above the shadow; when the shadow is near the top, it goes below the shadow instead
    const fy = this.py(f.p, f.d), up = Math.max(this.top + 4, Math.min(this.G.surf - r.height - 4, V.h - r.height - 70));
    c.style.top = clamp(up + r.height > fy - 24 && fy + 30 + r.height < this.meterY ? fy + 30 : up, this.top + 4, Math.max(this.top + 4, this.meterY + 30 - r.height)) + 'px';
    ($('[data-k]', c) || $('#spCardX', c)).focus({ preventScroll: true });
    this.cardEl = c;
    this.cardsSeen = (this.cardsSeen || 0) + 1;
    sfx.pop();
  },
  closeCard() { if (this.cardEl) { this.cardEl.remove(); this.cardEl = null; } },

  // ----- Beat 2: the tackle box. What the player owns, by kind, with the numbers that matter; one tap ties it on. -----
  box(open) {
    if (this.boxEl) { this.boxEl.remove(); this.boxEl = null; }
    this.boxOpen = open && (this.st === 'read');
    if (!this.boxOpen) { if (this.lesson === 2) this.lessonT = 99; $('#spBox') && $('#spBox').focus({ preventScroll: true }); return; }
    this.closeCard();
    const R = rig(), pips = (lab, v) => `<span class="spot-stat">${esc(lab)} <b>${[2, 4, 6, 8, 10].map(k => `<i class="${v >= k - 1 ? 'on' : ''}"></i>`).join('')}</b></span>`;
    const info = it => it.kind === 'rod' ? pips(t('spot_pow'), it.pow) + pips(t('spot_fin'), it.fin)
      : it.kind === 'line' ? pips(t('spot_str'), it.str) + pips(t('spot_thin'), it.thin)
      : it.kind === 'reel' ? pips(t('spot_drg'), it.drag) + `<span class="spot-stat">${esc(t('spot_spl', { n: it.spool }))}</span>`
      : `${esc(t('spot_d' + (it.depth | 0)))}, ${esc(t('spot_a' + (it.act | 0)))}, ${esc(t('spot_f_' + it.food))}${it.glow && it.food !== 'glow' ? ', ' + esc(t('spot_glow')) : ''}${it.lit ? ', ' + esc(t('spot_lit')) : ''} · ${esc(it.free ? t('spot_free') : t('spot_left', { n: owns(it.id) }))}`;
    const kinds = ['lure', 'rod', 'line', 'reel'].map(k => {
      const its = Object.values(ITEMS).filter(it => it.kind === k && (it.free || owns(it.id) > 0));
      return `<p class="spot-kind">${esc(t('spot_k_' + k))}</p><div class="spot-row">${its.map(it => `<button class="spot-it" data-id="${it.id}" aria-pressed="${R[k].id === it.id}">${ic('item:' + it.id, 34)}<span>${esc(t('i_' + it.id))}<small>${info(it)}</small></span></button>`).join('')}</div>`;
    }).join('');
    const b = add(`<div class="spot-box" role="dialog" aria-label="${esc(t('spot_tackleT'))}"><h2>${ic('item:' + R.lure.id, 26)}${esc(t('spot_tackleT'))}<span class="sp"></span>
      <button class="btn round" id="spBoxX" aria-label="${esc(t('spot_close'))}" aria-keyshortcuts="Escape">${ic('no', 22)}</button></h2><div class="spot-list">${kinds}</div></div>`);
    b.querySelectorAll('[data-id]').forEach(el => el.onclick = () => {
      const it = ITEMS[el.dataset.id];
      S.rig[it.kind] = it.id; save(); sfx.click(); sfx.reel();
      b.querySelectorAll('.spot-it').forEach(o => { if (ITEMS[o.dataset.id].kind === it.kind) o.setAttribute('aria-pressed', o === el); });
      this.chips(); this.buttons();
      say(t('spot_tied') + ': ' + t('i_' + it.id));
    });
    $('#spBoxX', b).onclick = () => { sfx.click(); this.box(false); };
    this.boxEl = b;
    ($('[aria-pressed=true]', b) || $('#spBoxX', b)).focus({ preventScroll: true });
  },

  // ----- Beat 3: the cast. Placement first (the gold mark on the water), then power (hold, let go on the gold line). -----
  reach() { return clamp(.42 + rig().rod.pow * .058, .45, .99); },
  setMark(p) {
    p = clamp(p, .05, this.reach());
    if (this.tw.ice) {   // the line can only go down through a hole: the mark jumps to the nearest one
      let best = p, bd = 9;
      for (const h of this.feats('hole')) { const c = (h.p0 + h.p1) / 2; if (Math.abs(c - p) < bd && c <= this.reach() + .02) { bd = Math.abs(c - p); best = c; } }
      p = best;
    }
    this.mark = p;
    // keyboard and screen readers follow the highlight: the shadow nearest to the mark
    let bi = -1, bd = .12;
    this.pop.forEach((f, i) => { if (!f.decoy && f.st === 'swim' && Math.abs(f.p - p) < bd && this.seeAlpha(f) > .2) { bd = Math.abs(f.p - p); bi = i; } });
    if (bi >= 0) this.sel = bi;
  },
  charge() {
    if (this.st !== 'read' || this.boxOpen || closeDlg) return;
    this.closeCard();
    this.st = 'power'; this.pow = 0; this.powT = 0;
    sfx.click();
  },
  // Let go: on the gold line lands on the mark; early lands short, late lands long. Wind pushes it sideways.
  release(cancel) {
    if (this.st !== 'power') return;
    const pw = this.pow;
    if (cancel || pw < .1) { this.st = 'read'; if (!cancel) this.note(t('spot_castHint')); return; }
    const miss = pw - SPOT_GOLD, perfect = Math.abs(miss) < .05;
    let p = this.mark + (perfect ? 0 : miss * .6) + this.env.wind * (this.tw.gust ? .14 : 0);
    p = clamp(p, .03, Math.min(1, this.reach() + .08));
    if (this.tw.ice) {   // on the ice a lure that misses a hole slides back to the nearest hole only on a good cast
      const h = this.feat('hole', p);
      if (!h && Math.abs(p - this.mark) < .04) p = this.mark;
    }
    this.castTo(p, perfect);
  },
  // The lure flies (a test can call this directly: castTo(0.5)).
  castTo(p, perfect = true) {
    this.closeCard(); this.box(false);
    const lu = rig().lure;
    this.lure = { p, d: 0, td: 0, x: 0, y: 0, fly: 0, it: lu, tw: 0, still: 0, perfect: !!perfect, clean: true };
    this.st = 'fly'; this.flyT = 0;
    sfx.whoosh();
    this.buttons();
  },
  land() {
    const L = this.lure, p = L.p, lily = this.feat('lily', p), lilyHit = !!lily && Math.abs(p - (lily.p0 + lily.p1) / 2) < (lily.p1 - lily.p0) * .3;
    const x = this.px(p), y = this.py(p, 0);
    emit('cast', { area: this.id, p, perfect: L.perfect, lily: lilyHit });
    if (lilyHit) { floatText(x, y - 24, t('spot_lily'), '#c8ffb0', 16); burst(x, y, 8, { kind: 'star', colors: ['#c8ffb0', '#ffd86b'], size: 7, up: 60 }); }
    if (this.tw.ice && !this.feat('hole', p)) {   // the lure skids on the ice: no harm, cast again
      sfx.empty(); this.note(t('spot_hole')); this.reset(); return;
    }
    sfx.plop(); burst(x, y, 6, { kind: 'drop', color: '#cfe8ff', size: 5, arc: .8, up: 80 }); burst(x, y, 2, { kind: 'ring', color: 'rgba(255,255,255,.8)', size: 9, g: 0, speed: 1 });
    if (this.feat('snag', p) && !this.tw.ice && this.snag()) return;   // the snag guard pulled it free: the lure fishes on
    const b = SPOT_BANDS[L.it.depth | 0];
    L.td = (b[0] + b[1]) / 2;
    this.st = 'wait'; this.buttons();
    if (this.id === 'pond') this.teach(4);
  },
  // A snag keeps the lure, unless the snag guard pulls it free (once per visit).
  snag() {
    const L = this.lure;
    if (owns('snagguard') && this.guard) {
      this.guard = 0; L.clean = false;
      emit('snag', { area: this.id, lost: false }); sfx.pop(); this.note(t('spot_snagFree'));
      return false;
    }
    emit('snag', { area: this.id, lost: true });
    sfx.snap(); this.note(t('spot_snag'));
    this.useLure();
    this.reset();
    return true;
  },
  // a lure that is not free is used up (snapped off or kept by a snag); the worm never runs out
  useLure() {
    const it = this.lure && this.lure.it;
    if (it && !it.free && owns(it.id) > 0) { S.own[it.id] = owns(it.id) - 1; save(); }
    rig(); this.chips();
  },
  // back to reading the water
  reset() {
    this.lure = null; this.F = null; this.bite = null; this.st = 'read';
    for (const f of this.pop) if (f.st === 'go' || f.st === 'look') { f.st = 'swim'; this.target(f); }
    this.buttons(); this.chips();
  },
  reelIn() {
    if (this.st !== 'wait' && this.st !== 'bite') return;
    if (this.bite) this.bite.f.no = 4;
    this.reset();
  },
});
const SPOT_GOLD = .8;   // where the gold line sits on the power bar

// ----- Beat 4: the bite. The lure sinks to its band and moves by its action; fish notice it, come close, look, and decide. -----
Object.assign(scenes.spot, {
  // How well this lure suits this fish: depth band, action, food; 1 is a perfect match.
  match(s, it) {
    let m = (((s.depth | 0) === (it.depth | 0)) + ((s.act | 0) === (it.act | 0)) + (s.food === it.food) * 1.2) / 3.2;
    if (it.glow && this.tw.dark) m = Math.min(1, m + .25);
    if ((s.tricks || []).includes('light') && it.lit) m = 1;
    return m;
  },
  // The lure in the water: sinking, its own action, the current, the swell, and fish taking notice.
  lureUpdate(dt) {
    const L = this.lure, it = L.it, act = it.act | 0;
    L.d = lerp(L.d, L.td + (this.tw.swell ? Math.sin(this.time * .9) * .07 : 0), Math.min(1, dt * 1.2));
    L.tw = Math.max(0, L.tw - dt);
    L.still += dt;
    L.at = (L.at || 0) + dt;
    if (act === 1 && L.at > 1.4) { L.at = 0; L.d -= .03; L.tw = .25; }              // twitching: a small hop now and then
    if (act === 2 && L.at > .9) { L.at = 0; L.p += rnd(-.02, .02); L.tw = .3; }     // darting: a quick sideways dash
    if (this.tw.current) {                                                           // the creek carries the lure downstream (+p)
      L.p += .016 * dt;
      if (L.p > .99) { this.note(t('spot_drift')); this.reset(); return; }
    }
    // a drift into a snag
    const sn = this.feat('snag', L.p);
    if (sn && !this.tw.ice && (sn.d0 === undefined || (L.d >= sn.d0 && L.d <= sn.d1)) && !L.snagOk) { if (!this.snag()) L.snagOk = 1; return; }
    if (this.bite) return this.biteUpdate(dt);
    if (this.tw.still && L.still < 4) return;                                        // the Chapel: nothing comes until the lure has been still
    const R = .26 * (this.tw.dark && !it.glow ? .6 : 1) * (this.tw.murk ? .8 : 1);
    for (const f of this.pop) {
      if (f.decoy || f.st !== 'swim' || f.no > 0 || f.a < .6) continue;
      const dist = Math.hypot((f.p - L.p) * 1.4, f.d - L.d), r = R * (f.s.move === 'lurk' ? 1.4 : 1) * ((f.s.tricks || []).includes('light') && it.lit ? 2 : 1);
      if (dist < r && Math.random() < dt * (this.tw.rain ? 1.6 : .9)) {
        f.st = 'go'; f.look = 0;
        this.bite = { f, stage: 'go', t: 0, touch: 0, fakes: 0, nib: 0 };
        break;
      }
    }
    // decoys fade when the lure comes near: there was never a fish there
    for (const f of this.pop) if (f.decoy && f.st === 'swim' && Math.abs(f.p - L.p) < .08) { f.st = 'flee'; f.tp = f.p; }
  },
  // A fish swims to the lure (a lurker ambushes from cover), looks at it, and decides.
  approach(f, dt) {
    const L = this.lure;
    if (!L) { f.st = 'swim'; this.target(f); return; }
    const tp = L.p - f.dir * .025, dp = tp - f.p, dd = L.d - f.d;
    if (f.st === 'go') {
      const sp = this.swimSpeed(f) * (f.s.move === 'lurk' ? 3 : 1.3) * (this.tw.still ? .4 : 1);
      f.v = Math.sign(dp) * sp; f.p += f.v * dt; f.d += clamp(dd, -1, 1) * dt * 1.4;
      if (Math.abs(dp) > .02) f.dir = dp > 0 ? 1 : -1;
      if (Math.abs(dp) < .02 && Math.abs(dd) < .07) { f.st = 'look'; f.look = this.tw.still ? rnd(3, 6) : rnd(.5, 1.4) * (1 + this.T.wary); f.v = 0; }
    } else {
      f.p = lerp(f.p, tp, Math.min(1, dt * 3)); f.d = lerp(f.d, L.d, Math.min(1, dt * 3)); f.dir = L.p >= f.p ? 1 : -1;
    }
  },
  biteUpdate(dt) {
    const b = this.bite, f = b.f, L = this.lure;
    b.touch = Math.max(0, b.touch - dt);
    if (!this.pop.includes(f) || f.st === 'flee') { this.bite = null; return; }
    if (b.stage === 'go') {
      if (f.st !== 'look') return;
      f.look -= dt;
      if (f.look > 0) return;
      // the decision: in easy water anything is taken; in hard water a wrong choice is refused, and the fish shows it
      const s = f.s, wary = this.T.wary * (this.tw.rain ? .5 : 1), fine = (rig().line.thin - 4) * .05 * wary;
      const chance = clamp(1 - wary * (1 - this.match(s, L.it)) + fine, 0, 1);
      if (Math.random() > chance) return this.refuse(f);
      b.stage = 'take'; b.t = s.bite === 'slam' ? .05 : rnd(.4, .9);
      for (let i = 0; i < (s.fakes | 0); i++) if (Math.random() < this.T.fakes) b.fakes++;
      b.nib = s.bite === 'nibble' ? 2 + (Math.random() < .5) : 0;
      if (s.bite !== 'fake') b.fakes = 0;
      return;
    }
    if (this.st === 'bite') {
      b.win -= dt;
      if (b.win <= 0) { this.note(t('spot_late')); f.st = 'swim'; f.no = 8; this.target(f); this.bite = null; this.st = 'wait'; this.taut = 0; }
      return;
    }
    b.t -= dt;
    if (b.t > 0) return;
    if (b.fakes > 0) {                         // a fake: a bump, then it lets go and comes back
      b.fakes--; b.touch = .4; b.t = rnd(.9, 1.7);
      this.cue('bump');
      emit('bite', { id: f.id, fake: true });
      if (this.tier <= 3 && !this.fakeTold) { this.fakeTold = 1; this.note(t('spot_fake')); }
      f.p -= f.dir * .02;
    } else if (b.nib > 0) {                    // a nibble: small touches in a pattern before the pull
      b.nib--; b.touch = .3; b.t = rnd(.45, .8);
      this.cue('nibble');
    } else {                                   // the real bite: the strike window opens
      this.st = 'bite';
      b.win = (this.T.win + rig().rod.fin * 12) / 1000; b.win0 = b.win;
      b.first = bump('bite_' + f.id) === 1;
      this.cue('bite');
      emit('bite', { id: f.id, fake: false });
      if (f.id === 'bell' || (this.tw.bell && f.s.legend)) this.toll(1);    // the Bellwether rings the bell as it takes
    }
  },
  // The visible refusal: the fish noses the lure, flicks round and swims off; a crossed ring hangs over it while it goes.
  refuse(f) {
    f.dir = -f.dir; f.st = 'flee'; f.tp = clamp(f.p + f.dir * .5, -.1, 1.1); f.no = 20; f.a = 1.4; f.refused = V.t;
    this.bite = null;
    this.refusals = (this.refusals || 0) + 1;
    if (this.refusals <= 3 || this.tier >= 3) this.note(t('spot_refuse'));
    burst(this.px(f.p), this.py(f.p, f.d), 3, { kind: 'ring', color: 'rgba(255,255,255,.7)', size: 6, g: 0, speed: 1 });
  },
  // Every cue is double (or triple): the line and the rod tip move, a sound plays, the phone buzzes.
  cue(kind) {
    const quiet = this.tw.still && kind === 'bite';   // in the Chapel the real bite is one gentle touch: only the line stays taut
    this.shake = kind === 'bite' ? (quiet ? .2 : .7) : kind === 'bump' ? .45 : .22;
    this.dip = kind === 'bite' ? (quiet ? .35 : 1) : kind === 'bump' ? .45 : .2;
    this.taut = kind === 'bite' ? 1 : 0;
    this.cueKind = kind; this.cueAt = V.t;
    if (kind === 'bite') { quiet ? sfx.nibble() : sfx.bite(); buzz(quiet ? 25 : 90); }
    else { sfx.nibble(); buzz(kind === 'bump' ? 30 : 12); }
    const L = this.lure, x = this.px(L.p), y = this.py(L.p, 0);
    burst(x, y, kind === 'bite' && !quiet ? 3 : 1, { kind: 'ring', color: 'rgba(255,255,255,.85)', size: kind === 'bite' ? 8 : 5, g: 0, speed: 1 });
    say(kind === 'bite' ? t('spot_bite') : '');
  },
  twitch() {
    const L = this.lure;
    if (!L) return;
    L.d = Math.max(0, L.d - .06); L.p = Math.max(.02, L.p - .008); L.tw = .3; L.still = 0;
    sfx.reel();
    if (this.tw.still && this.bite) {          // the Chapel: moving the lure breaks the silence, and the fish loses interest
      const f = this.bite.f; f.st = 'swim'; f.no = 6; this.target(f); this.bite = null;
      if (!this.hushTold) { this.hushTold = 1; this.note(t('spot_silence')); }
    }
  },
  // One tap, click or Space: inside the window it hooks; on a bump it spooks the fish; otherwise it twitches the lure.
  strike() {
    const b = this.bite;
    if (this.st === 'bite' && b) {
      emit('strike', { id: b.f.id, ok: true, early: false });
      return this.hook(b);
    }
    if (this.st === 'wait' && b && b.touch > 0) {
      const f = b.f;
      emit('strike', { id: f.id, ok: false, early: true });
      emit('escape', { id: f.id, why: 'spook' });
      f.st = 'flee'; f.tp = clamp(f.p + f.dir * .7, -.1, 1.1); f.no = 99;
      this.bite = null; sfx.oops(); this.note(t('spot_spook'));
      this.lost = (this.lost || 0) + 1;
      return;
    }
    if (this.st === 'wait') this.twitch();
  },
  // A test can make a fish bite now: forceBite('id') puts it at the lure and starts its bite pattern.
  forceBite(id) {
    if (this.st !== 'wait') return null;
    const f = this.add(id, true), L = this.lure;
    f.p = L.p - .02; f.d = L.d; f.dir = 1; f.st = 'look'; f.look = 0; f.a = 1;
    this.bite = { f, stage: 'go', t: 0, touch: 0, fakes: 0, nib: 0 };
    return f;
  },

  // ----- Beat 5: the fight. Line tension against fish stamina. -----
  hook(b) {
    const f = b.f, s = f.s, L = this.lure, R = rig(), per = this.tw.dark ? 4 : 1;
    const total = Math.max(4, (s.stam || 10) * (.75 + .5 * f.k)), phases = 1 + (s.stam >= 40) + (s.stam >= 140) + !!s.legend;
    this.F = { id: f.id, s, g: f.g, total, phases, ph: total / phases, k: 0, sta: total / phases, T: .25, over: 0, slackT: 0,
      run: { kind: 'rest', dir: 0, pow: .15 }, runT: .6, jumps: 0, clean: L.clean, descend: false, firstBite: !!b.first,
      Lm: Math.min(R.reel.spool * .6, 3 + L.p * 42 * per), per, p: L.p, d: L.d, t: 0, air: 0, misses: 0, queue: null, tired: false, netT: 0, k0: f.k };
    this.pop.splice(this.pop.indexOf(f), 1);
    this.bite = null; this.taut = 0; this.sel = -1;
    this.st = 'fight'; this.dragChanged = 0;
    sfx.reel(); buzz(40);
    this.note(t('spot_hooked'));
    this.buttons();
    this.teach(5);
  },
  // The fish's next move: a run left or right, a dive, coming up, a jump, a rest; tricks come in at their moment.
  nextRun(F) {
    const s = F.s;
    let kind = 'rest', dir = 0, pow = .15, dur = rnd(1, 2.4) * (12 - (s.speed || 4)) / 8;
    if (F.tired) { kind = 'tired'; pow = .03; dur = 99; }
    else if (F.queue) ({ kind, dir, pow, dur } = F.queue), F.queue = null;
    else {
      const r = Math.random(), dv = .08 * (s.dive || 0), jp = .07 * (s.jump || 0);
      if (r < .45) { kind = 'run'; dir = Math.random() < .72 ? 1 : -1; pow = rnd(.6, 1); dur = rnd(1.2, 2.8); }
      else if (r < .45 + dv) { kind = 'dive'; pow = rnd(.55, .85); dur = rnd(1.4, 2.8); }
      else if (r < .52 + dv) { kind = 'up'; pow = .2; dur = rnd(1, 1.8); }
      else if (r < .52 + dv + jp && F.d < .7) { kind = 'jump'; pow = .4; dur = .95 + .15 * (s.size || 1); }
    }
    F.run = { kind, dir, pow }; F.runT = dur; F.run0 = dur;
    if (kind === 'jump') { F.jumps++; emit('jump', { id: F.id }); sfx.splash(); this.note(t('spot_jump')); buzz(50); }
    if (kind === 'descend') this.note(t('spot_descend'));
    if (kind === 'still') this.note(t('spot_still'));
  },
  fightUpdate(dt) {
    const F = this.F, s = F.s, R = rig(), tier = this.tier, reel = hold.on ? 1 : 0;
    F.t += dt; F.runT -= dt;
    if (F.runT <= 0) {
      if (F.run.kind === 'descend') { F.descend = true; F.sta -= F.ph * .25; }   // it went down, was let go, and is tired from it
      if (F.run.kind === 'still') F.queue = { kind: 'run', dir: 1, pow: 1.15, dur: 2.6 };
      this.nextRun(F);
    }
    const run = F.run, dragK = .35 + .17 * this.drag;
    // how hard the fish loads the line right now
    let load = run.pow * (.35 + .065 * (s.pull || 3));
    if (run.kind === 'run' && run.dir < 0) load *= .2;      // a run toward the Chief makes slack
    if (run.kind === 'up' || run.kind === 'still' || run.kind === 'tired') load *= .3;
    if (run.kind === 'jump') load *= .4;
    // hold raises the tension, letting go lowers it; the fish adds its pull through the drag; the reel's drag stat smooths it
    let target = load * dragK * .8 + reel * (.5 + .05 * tier);
    if (run.kind === 'descend' && reel) target += .55;       // reeling against the descent overloads the line
    const k = clamp(1.7 - R.reel.drag * .09, .7, 1.7);
    F.T += (target - F.T) * Math.min(1, k * dt);
    // the safe band moves; its width comes from the tier, the rod's finesse and the water
    const bw = clamp(this.T.band * (1 + R.rod.fin * .03) * (this.tw.ice && !owns('iceline') ? .75 : 1), .08, .7);
    // From the pier on, a fish stronger than the line brings the red line down: every point of pull above the line's strength
    // costs a slice. The meter shows it, a looser drag answers it, and a stronger line cures it.
    F.weak = Math.max(0, (s.pull || 3) - R.line.str) * .05 * clamp((tier - 2) / 3, 0, 1);
    const red = clamp(.84 + R.line.str * .013 - R.line.thin * .007 - F.weak, .5, .97);
    const wob = Math.sin(F.t * (.3 + tier * .05)) * .13 + Math.sin(F.t * 1.3 + 1) * .03 * tier / 7;
    F.bc = clamp(.46 + wob, bw / 2 + .05, red - .03 - bw / 2); F.b0 = F.bc - bw / 2; F.b1 = F.bc + bw / 2; F.red = red;
    // stamina: in the band the fish tires; leaning against its run tires it faster
    const inBand = F.T >= F.b0 && F.T <= F.b1;
    let drain = run.kind === 'descend' || run.kind === 'still' ? 0 : inBand ? 1 : F.T > F.b1 ? 1.15 : .15;
    F.against = run.kind === 'run' ? (hold.dir === -run.dir ? 1 : hold.dir === run.dir ? -1 : 0) : 0;
    if (F.against > 0) drain *= 1.6; else if (F.against < 0) drain *= .8;
    drain *= (1 + R.rod.pow * .06) * (1 + (this.drag - 3) * .12);
    if (!F.tired) F.sta -= drain * dt * SPOT_TIRE;
    // where the fish is: line out (metres) gives its distance, the run gives its depth
    const spd = .6 + (s.speed || 4) * .28;
    if (run.kind === 'run' && run.dir > 0 || run.kind === 'dive') F.Lm += spd * dt * clamp(1.15 - dragK * .55 + (reel ? -.25 : .15), .05, 1);
    else if (run.kind === 'run' && run.dir < 0) F.Lm -= spd * dt * .6;
    else if (run.kind === 'descend') F.Lm = Math.min(R.reel.spool - 2, F.Lm + (reel ? 0 : .5 * dt));
    if (reel && F.T > .15 && run.kind !== 'descend') F.Lm -= (1.4 + R.rod.pow * .15) * dt * (1 - load * .6);
    F.Lm = Math.max(1.2, F.Lm);
    F.p = clamp((F.Lm - 1) / (42 * F.per), .02, 1);
    const b = SPOT_BANDS[s.depth | 0];
    F.d = clamp(F.d + dt * (run.kind === 'dive' ? .22 : run.kind === 'up' ? -.25 : run.kind === 'descend' ? .06 : (b[0] + .1 - F.d) * .5), .03, 1);
    F.air = run.kind === 'jump' ? clamp(1 - F.runT / F.run0, 0, 1) : 0;
    // losing it: the spool runs out, slack lets the hook slip, the red line snaps, a held jump throws the hook
    if (F.Lm >= R.reel.spool) return this.lose('spool');
    if (((run.kind === 'run' && run.dir < 0) || run.kind === 'up') && F.T < .08) F.slackT += dt; else F.slackT = Math.max(0, F.slackT - dt * 2);
    if (F.slackT > .9 + (8 - tier) * .2 + R.rod.fin * .03) return this.lose('slack');
    if (F.T > red) { F.over += dt; F.clean = false; } else F.over = Math.max(0, F.over - dt);
    // the two gentle waters forgive a child who only holds: the line bears the red longer, and a held jump seldom throws the hook
    if (F.over > .45 + (8 - tier) * .15 + Math.max(0, 3 - tier) * .45 + R.rod.fin * .02) return this.lose('snap');
    if (run.kind === 'jump' && F.air > .15 && F.air < .85 && reel && F.T > .4 && Math.random() < dt * (tier <= 2 ? .15 + tier * .1 : .4 + tier * .35)) return this.lose('jump');
    if (reel && Math.random() < dt * 9) sfx.reel();
    if (F.T > F.b1 && Math.random() < dt * 3) sfx.strain(clamp(F.T, 0, 1));
    // the trick 'descend' comes once, in the second half of the fight
    if ((s.tricks || []).includes('descend') && !F.dscUsed && (F.k >= 1 || F.sta < F.ph * .5) && run.kind !== 'jump') {
      F.dscUsed = 1; F.queue = { kind: 'descend', dir: 0, pow: .6, dur: s.legend ? rnd(18, 28) : rnd(8, 12) }; F.runT = 0;
    }
    // a phase ends: more phases mean a new burst; 'still' plays beaten first
    if (F.sta <= 0 && !F.tired) {
      if (F.k < F.phases - 1) {
        F.k++; F.sta = F.ph;
        if ((s.tricks || []).includes('still') && !F.stillUsed) { F.stillUsed = 1; F.queue = { kind: 'still', dir: 0, pow: 0, dur: 3.2 }; }
        else F.queue = { kind: 'run', dir: 1, pow: 1, dur: 2.2 };
        F.runT = 0;
      } else { F.tired = true; F.runT = 0; }
    }
    // a tired fish comes in as the Chief reels; close to the Chief the net comes out (unless it has a last run left)
    if (F.tired && F.Lm <= 3) {
      if ((s.tricks || []).includes('lastrun') && !F.lastUsed) { F.lastUsed = 1; F.tired = false; F.sta = F.ph * .3; F.queue = { kind: 'run', dir: 1, pow: 1.1, dur: 2.4 }; F.runT = 0; }
      else { this.st = 'net'; F.netT = 0; this.buttons(); this.note(t('spot_netHint')); }
    }
  },
  // The net: one timing window, a ring closing on the fish. Wider with the big net.
  netWin() { return clamp(.36 - this.tier * .025 + (owns('bignet') ? .12 : 0), .12, .5); },
  netIn() { const q = (this.F.netT * .8) % 1; return Math.abs(q - .5) < this.netWin() / 2; },
  netUpdate(dt) {
    const F = this.F;
    F.netT += dt; F.T = lerp(F.T, .3, dt); F.d = lerp(F.d, .08, dt * 2);
    if (F.netT > 12) { F.tired = false; F.sta = F.ph * .15; F.queue = { kind: 'run', dir: 1, pow: .8, dur: 2 }; F.runT = 0; F.Lm += 2; this.st = 'fight'; this.buttons(); }
  },
  netTry() {
    const F = this.F;
    if (this.st !== 'net' || !F) return;
    if (this.netIn()) return this.landFish();
    F.misses++; sfx.oops(); nudge($('#spNet') || this.bar);
    if (F.misses >= 3) return this.lose('net');
    F.tired = false; F.sta = F.ph * .15; F.queue = { kind: 'run', dir: 1, pow: .8, dur: 2 }; F.runT = 0; F.Lm += 2;   // a little strength back
    this.st = 'fight'; this.buttons(); this.note(t('spot_netMiss'));
  },
  lose(why) {
    const F = this.F, s = F.s, x = this.px(F.p), y = this.py(F.p, 0);
    if (why === 'snap') {
      this.snaps++; sfx.snap(); buzz(120);
      emit('snap', { id: F.id, area: this.id });
      this.note(t('spot_snapped'), F.weak > .04 ? t('spot_weakLine') : '');
      this.useLure();
    } else {
      emit('escape', { id: F.id, why });
      // an escaped fish teaches the logbook: its shadow is known now, and a fast one is remembered as fast
      const e = S.log[F.id] || (S.log[F.id] = { n: 0, best: 0 });
      e.seen = 1; if ((s.speed || 0) >= 6) e.fast = 1;
      save();
      sfx.splash();
      this.note(t(why === 'slack' ? 'spot_slack' : why === 'jump' ? 'spot_jumpLost' : why === 'spool' ? 'spot_spool' : why === 'net' ? 'spot_netLost' : 'spot_netMiss'), (s.speed || 0) >= 6 ? t('spot_faster') : '');
      if ((s.tricks || []).includes('light') && this.lure.it.lit) this.useLure();   // it steals lit lures
    }
    burst(x, y, 6, { kind: 'drop', color: '#cfe8ff', size: 5, arc: .9, up: 90 });
    this.lost = (this.lost || 0) + 1;
    this.reset();
  },
  // ----- the catch card: weighed, photographed into the logbook, paid, released -----
  landFish() {
    const F = this.F, it = this.lure.it, g = Math.round(F.g);
    const res = logCatch(F.id, g, { clean: F.clean, lure: it.id, depth: it.depth | 0, cond: this.cond, jumps: F.jumps, dragChanged: !!this.dragChanged,
      firstBite: F.firstBite, descend: F.descend, tier: this.tier });
    this.catches++;
    this.st = 'card'; this.buttons();
    sfx.net(); F.s.legend || res.first ? sfx.fanfare() : sfx.win(); buzz(60);
    const x = this.px(.06), y = this.G.surf;
    burst(x, y - 20, 18, { kind: 'star', colors: ['#ffd86b', '#fff6da', '#8fe3a4'], up: 120 });
    // a Legendary leaves a gift at the Night Watch treehouse (that game reads this logbook); the card says so the first time
    const marks = (res.first ? `<span class="pill">${ic('star', 22)}${esc(t('spot_first'))}</span>` : '') + (res.record ? `<span class="pill">${ic('star', 22)}${esc(t('spot_record'))}</span>` : '') +
      `<span class="pill">${ic('moon', 22)}+${esc(plural('spot_paid', res.moons))}</span>` + (F.s.legend && res.first ? `<span class="pill">${ic('jar', 22)}${esc(t('spot_gift'))}</span>` : '');
    const v = talk(fmtW(g), { who: '', title: t('f_' + F.id),
      html: `<div class="spot-catch"><div class="pics">${ic('fishI:' + F.id, 170)}</div><div class="marks">${marks}</div></div>`,
      acts: [{ label: t('spot_release'), cls: 'go', icon: 'fish', fn: () => this.releaseFish() }] });
    v.querySelector('.dlg').classList.add('spot-catch');
    this.lastCatch = { id: F.id, g, res };
  },
  // Always released, with a splash, back to reading the water.
  releaseFish() {
    const x = this.px(.08), y = this.py(.08, 0);
    sfx.splash(); burst(x, y, 14, { kind: 'drop', color: '#cfe8ff', size: 6, arc: .9, up: 140 }); burst(x, y, 2, { kind: 'ring', color: '#fff', size: 10, g: 0, speed: 1 });
    this.reset();
  },

  // ----- the visit: conditions, weather, the bell, lessons -----
  update(dt) {
    if (closeDlg) return;   // the owl or the catch card is speaking: the water waits
    this.time = (this.time || 0) + dt;
    const env = this.env, A = this.A;
    this.condT += dt;
    if (this.condT >= this.condLen && A.conds.length > 1) {
      this.condT = 0; this.ci = (this.ci + 1) % A.conds.length;
      const c = A.conds[this.ci];
      if (c !== this.cond) {
        this.cond = env.cond = c; this.chips();
        emit('cond', { area: this.id, cond: c });
        // fish that do not belong to the new condition leave
        for (const f of this.pop) if (f.st === 'swim' && f.s.when && !f.s.when.includes(c)) { f.st = 'flee'; f.tp = f.p; }
        if (typeof amb !== 'undefined') amb.set(this.id, env);
      }
    }
    // the squall builds to its peak (counted down by the lightning), then passes
    const sq = this.cond === 'squall' ? (this.condT < this.condLen * .7 ? this.condT / (this.condLen * .7) : (this.condLen - this.condT) / (this.condLen * .3)) : 0;
    if (Math.abs(sq - this.sqShown) > .1 || (sq === 0) !== (this.sqShown === 0)) { this.sqShown = sq; env.squall = sq; if (typeof amb !== 'undefined') amb.set(this.id, env); const q = $('#spSq'); if (q) q.textContent = '▮'.repeat(Math.ceil(sq * 5)); }
    env.squall = sq;
    if (sq > .85 && !this.hideTold) { this.hideTold = 1; this.note(t('spot_hide')); }
    if (sq < .5) this.hideTold = 0;
    if (sq > 0 && !this.W.bolt) {   // our own distant lightning, when the water does not draw it
      this.flashT = (this.flashT || 4) - dt;
      if (this.flashT <= 0) { this.flash = 1; this.flashT = lerp(9, 1.5, sq); }
    }
    this.flash = Math.max(0, (this.flash || 0) - dt * 2.5);
    env.t = V.t;
    env.tide = this.tw.tide ? .5 + .5 * Math.sin(this.time * TAU / 70) : .5;
    env.wind = this.tw.gust ? clamp(Math.sin(this.time * .23) * .65 + Math.sin(this.time * .61 + 1) * .35 * (1 + sq), -1, 1) : 0;
    env.swell = (this.tw.swell ? (Math.sin(this.time * .9) * 8 + Math.sin(this.time * .37) * 5) * (1 + sq) * this.G.u : 0) + (this.tw.tide ? -(env.tide - .5) * 16 * this.G.u : 0);
    this.lights();
    env.toll += dt;
    if (this.tw.bell) { this.tollT -= dt; if (this.tollT <= 0) { this.toll(1); this.tollT = rnd(90, 200); } }
    this.stand();
    this.movePop(dt);
    this.shake = Math.max(0, (this.shake || 0) - dt * 1.6); this.dip = Math.max(0, (this.dip || 0) - dt * 2.2);
    // the beats
    const st = this.st;
    if (st === 'power') { this.pow = Math.min(1.15, this.pow + dt / 1.15); }
    else if (st === 'fly') { this.flyT += dt / .6; if (this.flyT >= 1) this.land(); }
    else if (st === 'wait' || st === 'bite') this.lureUpdate(dt);
    else if (st === 'fight') this.fightUpdate(dt);
    else if (st === 'net') this.netUpdate(dt);
    if (this.msg) { this.msg.t -= dt; if (this.msg.t <= 0) this.msg = null; }
    // the owl's lessons on the first visit to the pond, one beat at a time
    if (this.id === 'pond' && st === 'read' && !this.boxOpen) {
      this.lessonT += dt;
      if (S.tut.b1 && !S.tut.b2 && (this.cardsSeen || this.lessonT > 9)) this.teach(2);
      else if (S.tut.b2 && !S.tut.b3 && this.lessonT > 3) this.teach(3);
    }
  },
  // circles of light: the raft's lantern in the Deep (wider with the Owl Lantern), and a glowing lure in dark or frozen water
  lights() {
    const env = this.env, G = this.G, L = this.lure || (this.F && { p: this.F.p, d: this.F.d, it: this.lure && this.lure.it });
    const pool = this.lightPool || (this.lightPool = [{ x: 0, y: 0, r: 0 }, { x: 0, y: 0, r: 0 }]);
    env.light.length = 0;
    if (this.tw.dark) {
      const lp = this.W.lamp ? this.W.lamp(G, env) : [G.ax + 26 * G.u, G.surf - 20 * G.u];
      pool[0].x = lp[0]; pool[0].y = lp[1] + 30 * G.u; pool[0].r = (owns('lantern') ? 175 : 105) * G.u;
      env.light.push(pool[0]);
    }
    const lu = this.lure;
    if ((this.tw.dark || this.tw.ice) && lu && lu.it.glow) {
      const p = this.F ? this.F.p : lu.p, d = this.F ? this.F.d : lu.d;
      pool[1].x = this.px(p); pool[1].y = this.py(p, d); pool[1].r = 70 * G.u;
      env.light.push(pool[1]);
    }
  },
  // The drowned bell: one toll, very seldom; two close together when the Bellwether has noticed the Chief.
  toll(n) {
    for (let i = 0; i < n; i++) later(() => {
      if (typeof amb !== 'undefined') amb.hit('toll');
      this.env.toll = 0; this.tolls.push(0);
      say(t('spot_toll'));
    }, i * 1100);
  },
  teach(k) {
    if (this.id !== 'pond' || S.tut['b' + k] || closeDlg) return false;
    S.tut['b' + k] = 1; save();
    this.lesson = k; this.lessonT = 0;
    talk(t('spot_t' + k), { acts: [{ label: t('ok'), cls: 'go', icon: 'yes', fn: k === 2 ? () => this.box(true) : null }] });
    return true;
  },
  note(text, text2 = '') { this.msg = { text, text2, t: 2.8 }; say(text + (text2 ? ' ' + text2 : '')); },
});
const SPOT_TIRE = 2.2;   // stamina points a fish loses per second while the needle stays in the band

// ----- Drawing: back, water, shadows, lure and line below, front, then the Chief, the rod, the line above, the meters -----
const SPOT_FOOD = { worm: '#ff8fa8', bug: '#a0703a', grain: '#f2d16b', minnow: '#d8e6ee', shiny: '#ffd24a', shrimp: '#ff9a7a', glow: '#8ff7ff' };
Object.assign(scenes.spot, {
  draw(dt) {
    const c = ctx, G = this.G, env = this.env, W = this.W, u = G.u, st = this.st, now = V.t, F = this.F, L = this.lure, calmly = still();
    for (let i = this.tolls.length - 1; i >= 0; i--) { this.tolls[i] += dt || 0; if (this.tolls[i] > 3.5) this.tolls.splice(i, 1); }
    W.back(c, G, env);
    W.water(c, G, env);
    // the shadows
    for (let i = 0; i < this.pop.length; i++) {
      const f = this.pop[i], a = this.seeAlpha(f);
      if (a < .02) continue;
      const x = this.px(f.p), y = this.py(f.p, f.d), len = this.flen(f);
      drawFish(c, f.id, x, y, len, { dir: f.wrong ? -f.dir : f.dir, t: now + f.ph, mode: 'shadow', alpha: a, wag: calmly ? 0 : f.wag, tilt: f.st === 'look' ? -.12 : 0 });
      if (f.refused && now - f.refused < 1.8) this.noMark(c, x, y - len * .35 - 10 * u);
      if (i === this.sel && st === 'read') {
        c.save(); c.setLineDash([5, 4]); c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.9)';
        c.beginPath(); c.ellipse(x, y, len * .62, len * .32, 0, 0, TAU); c.stroke(); c.restore();
      }
    }
    // the hooked fish, under water
    let fx = 0, fy = 0, flen = 0;
    if (F) {
      flen = (30 + 26 * (F.s.size || 1) * (.85 + .3 * F.k0)) * u;
      fx = this.px(F.p); fy = this.py(F.p, F.d);
      // a jump arcs above the water, never higher than the sky between the water and the top bar
      if (F.air > 0) fy = G.surf + env.swell - Math.sin(Math.PI * F.air) * Math.min((40 + 22 * (F.s.size || 1)) * u, G.surf - this.top - flen * .35 - 4);
      else drawFish(c, F.id, fx, fy, flen, { dir: F.run.kind === 'run' ? (F.run.dir < 0 ? -1 : 1) : 1, t: now, mode: 'shadow', alpha: .92,
        wag: F.run.kind === 'still' || F.run.kind === 'tired' ? .1 : 1, tilt: F.run.kind === 'dive' || F.run.kind === 'descend' ? .7 : F.run.kind === 'up' ? -.5 : 0 });
    }
    // the rod and where the line meets the water
    const pose = st === 'power' ? 'cast' : st === 'fight' || st === 'net' ? 'reel' : st === 'card' ? 'cheer' : 'stand';
    const tens = F ? F.T : 0, lean = (st === 'fight' || st === 'net') && hold.on ? hold.dir : 0;
    let ang = st === 'power' ? -1.05 - this.pow * 1.1 : st === 'fly' ? -.55 : st === 'wait' || st === 'bite' ? -.8 + (this.dip || 0) * .45 : F ? -.75 + tens * .4 + lean * .18 : -1.0;
    const cs = 1.05 * u;
    // the Chief is drawn later (over the water's front); the rod tip comes from the wing the Chief returns now
    const hand = this.hand || [G.ax + 8 * cs, G.ay - 22 * cs], rl = 64 * u;
    const bend = (F ? tens : (this.dip || 0) * .6) * 16 * u;
    const tx = hand[0] + Math.cos(ang) * rl, ty = hand[1] + Math.sin(ang) * rl + bend * .6;
    let ex = 0, ey = 0, lx = 0, ly = 0;
    if (L && (st === 'wait' || st === 'bite')) {
      lx = this.px(L.p) + (L.tw > 0 && !calmly ? Math.sin(L.tw * 40) * 3 * u : 0); ly = this.py(L.p, L.d);
      const hole = this.tw.ice && this.feat('hole', L.p);
      ex = hole ? this.px((hole.p0 + hole.p1) / 2) : lerp(tx, lx, .78); ey = G.surf + env.swell;
    } else if (F) { lx = fx; ly = fy; ex = F.air > 0 ? fx : lerp(tx, fx, .8); ey = G.surf + env.swell; }
    // line under the water, and the lure
    if (L && (st === 'wait' || st === 'bite') || (F && F.air <= 0)) {
      line(c, [ex, ey, lx, ly], 'rgba(235,245,255,.55)', 1.2);
      if (L && !F) this.drawLure(c, lx, ly, L.it, u);
    }
    W.front(c, G, env);
    // the Chief and the rod
    this.hand = chief(c, G.ax, G.ay, cs, now, { dir: 1, pose, lean });
    const rx = hand[0] + Math.cos(ang) * rl * .5 - Math.sin(ang) * bend, ry = hand[1] + Math.sin(ang) * rl * .5 + Math.cos(ang) * bend * .3;
    c.save(); c.lineCap = 'round';
    c.strokeStyle = '#5a3a1e'; c.lineWidth = 3.4 * u; c.beginPath(); c.moveTo(hand[0], hand[1]); c.quadraticCurveTo(rx, ry, tx, ty); c.stroke();
    c.strokeStyle = '#c8955a'; c.lineWidth = 1.6 * u; c.beginPath(); c.moveTo(hand[0], hand[1]); c.quadraticCurveTo(rx, ry, tx, ty); c.stroke();
    c.restore();
    // the line above the water: it sags when slack, goes straight and shakes on a bite (a still mark instead of shaking)
    const shk = calmly ? 0 : Math.sin(now * 55) * (this.shake || 0) * 5 * u;
    if (st === 'fly') {
      const k = clamp(this.flyT, 0, 1), px = lerp(tx, this.px(L.p), k), py = lerp(ty, G.surf + env.swell, k) - Math.sin(Math.PI * k) * 70 * u;
      line(c, [tx, ty, px, py], 'rgba(255,255,255,.8)', 1.2); this.drawLure(c, px, py, L.it, u);
    } else if (ex) {
      const sag = F ? (1 - clamp(tens, 0, 1)) * 34 * u : this.taut ? 2 : 20 * u;
      c.save(); c.strokeStyle = F && F.T > F.red ? '#ff8a7a' : this.taut ? '#fff' : 'rgba(255,255,255,.85)'; c.lineWidth = this.taut || (F && F.T > (F.b1 || 1)) ? 2 : 1.3;
      c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo((tx + ex) / 2 + shk, (ty + ey) / 2 + sag + shk, ex, ey); c.stroke(); c.restore();
      if ((this.shake || 0) > .05 || (calmly && this.cueKind && now - (this.cueAt || 0) < .6)) { c.save(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(ex, ey, 9 * u, 3 * u, 0, 0, TAU); c.stroke(); c.restore(); }
    } else if (st === 'read' || st === 'power' || st === 'card') {
      line(c, [tx, ty, tx, ty + 18 * u], 'rgba(255,255,255,.8)', 1); this.drawLure(c, tx, ty + 20 * u, rig().lure, u);
    }
    // the jumping fish, in full colour above the water
    if (F && F.air > 0) {
      line(c, [tx, ty, fx, fy], hold.on ? '#ff8a7a' : 'rgba(255,255,255,.85)', 1.3);
      drawFish(c, F.id, fx, fy, flen, { dir: 1, t: now, mode: 'full', alpha: 1, wag: 1, tilt: (F.air - .5) * 1.6 });
      if (!this.splashed) { this.splashed = 1; burst(fx, G.surf, 8, { kind: 'drop', color: '#cfe8ff', size: 5, arc: .8, up: 100 }); }
    } else this.splashed = 0;
    // the bite: a gold "!" over the line, and in the easy waters a ring that shows the window closing
    if (st === 'bite' && this.bite && !(this.tw.still)) {
      const b = this.bite;
      if (this.tier <= 3) { c.save(); c.strokeStyle = '#ffd86b'; c.lineWidth = 3; c.beginPath(); c.arc(ex, ey - 26 * u, (11 + 22 * b.win / b.win0) * u, 0, TAU); c.stroke(); c.restore(); }
      circ(c, ex, ey - 26 * u, 11 * u, '#ffd86b'); this.text(c, '!', ex, ey - 26 * u + 6 * u, 16 * u, '#3a2400', 'center');
    }
    // the net: a ring closing on the fish, gold when it is time
    if (st === 'net' && F) {
      const q = (F.netT * .8) % 1, r = lerp(flen * 1.5, flen * .55, 1 - Math.abs(q - .5) * 2), ok = this.netIn();
      c.save(); c.lineWidth = ok ? 5 : 2; c.strokeStyle = ok ? '#ffd86b' : 'rgba(255,255,255,.7)'; if (!ok) c.setLineDash([6, 5]);
      c.beginPath(); c.ellipse(fx, fy, r, r * .55, 0, 0, TAU); c.stroke(); c.restore();
      if (ok) starPath(c, fx, fy - r * .55 - 10, 7, 3, 5), c.fillStyle = '#ffd86b', c.fill();
    }
    // the landing mark, the reach of the rod, the wind
    if (st === 'read' || st === 'power') this.drawMark(c, G, env, u);
    // the drowned bell's rings, far out on the still water
    for (const a of this.tolls) { c.save(); c.globalAlpha = Math.max(0, 1 - a / 3.5); c.strokeStyle = '#dfe6f5'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(this.px(.9), G.surf, (8 + a * 40) * u, (2 + a * 9) * u, 0, 0, TAU); c.stroke(); c.restore(); }
    // distant lightning (only when the water does not draw its own)
    if (this.flash > 0) {
      if (!calmly) { c.fillStyle = `rgba(255,255,255,${this.flash * .25})`; c.fillRect(0, 0, G.w, G.surf); }
      const bx = G.w * .82; line(c, [bx, this.top + 8, bx - 8 * u, this.top + 30 * u, bx + 4 * u, this.top + 34 * u, bx - 6 * u, this.top + 60 * u], `rgba(255,250,210,${Math.min(1, this.flash * 1.5)})`, 2.5 * u);
    }
    this.drawMeters(c, G, u);
    if (this.msg) this.drawNote(c, G);
  },
  drawLure(c, x, y, it, u) {
    const col = SPOT_FOOD[it.food] || '#ff8fa8';
    if (it.glow || it.lit) glow(c, x, y, 16 * u, it.lit ? '255,216,107' : '143,247,255', .55);
    circ(c, x, y, 4.2 * u, col); c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,.45)'; c.stroke();
    circ(c, x - 1.3 * u, y - 1.3 * u, 1.3 * u, 'rgba(255,255,255,.75)');
  },
  // a crossed ring: "no, thank you" from a fish that refused the lure (shape, not colour alone)
  noMark(c, x, y) {
    c.save(); c.lineWidth = 2.5; c.strokeStyle = '#fff6da'; c.fillStyle = 'rgba(224,85,63,.85)';
    c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x - 4, y - 4); c.lineTo(x + 4, y + 4); c.moveTo(x + 4, y - 4); c.lineTo(x - 4, y + 4); c.stroke(); c.restore();
  },
  drawMark(c, G, env, u) {
    const x = this.px(this.mark), y = G.surf + env.swell, rx = this.px(this.reach());
    // where the rod can reach: a small post with a dotted line
    c.save(); c.setLineDash([3, 4]); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(rx, y - 16 * u); c.lineTo(rx, y + 10 * u); c.stroke(); c.restore();
    c.save(); c.lineWidth = 3; c.strokeStyle = '#ffd86b'; c.beginPath(); c.ellipse(x, y, 14 * u, 5 * u, 0, 0, TAU); c.stroke();
    poly(c, [x - 7 * u, y - 18 * u, x + 7 * u, y - 18 * u, x, y - 8 * u], '#ffd86b'); c.restore();
    // A map sketch of this water (from the Market Perch): double chevrons over the drop-offs, stars over the corners big fish keep to.
    if (owns('sk_' + this.id)) {
      for (const f of this.W.feats) if (f.kind === 'drop') { const fx = this.px((f.p0 + f.p1) / 2); for (const dy of [14, 21]) line(c, [fx - 6 * u, y - dy * u, fx, y - (dy - 7) * u, fx + 6 * u, y - dy * u], '#fff6da', 2.5); }
      for (const id of this.A.fish) { const z = SPECIES[id].zone; if (z && SPECIES[id].rar >= 3) { starPath(c, this.px((z[0] + z[1]) / 2), y - 16 * u, 7 * u, 3 * u, 5); c.fillStyle = '#ffd86b'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#7a4c00'; c.stroke(); } }
    }
    if (this.tw.gust) {   // the wind: an arrow over the mark, as long as the push
      const w = env.wind * 40 * u, ay = y - 30 * u;
      if (Math.abs(w) > 3) { line(c, [x, ay, x + w, ay], '#e8f4ff', 3); poly(c, [x + w + Math.sign(w) * 8 * u, ay, x + w, ay - 6 * u, x + w, ay + 6 * u], '#e8f4ff'); }
    }
  },
  // The strip above the action bar: the power bar while casting, the tension meter while fighting.
  drawMeters(c, G, u) {
    const st = this.st, y = this.meterY + 6, h = 20, x0 = Math.max(10, G.w / 2 - 260), x1 = Math.min(G.w - 10, G.w / 2 + 260), F = this.F;
    if (st === 'read' || st === 'power') {
      rr(c, x0, y, x1 - x0, h, 10); c.fillStyle = 'rgba(0,0,0,.5)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(255,216,107,.5)'; c.stroke();
      if (st === 'power') {
        const k = clamp(this.pow / 1.15, 0, 1);
        rr(c, x0 + 2, y + 2, Math.max(16, (x1 - x0 - 4) * k), h - 4, 8); c.fillStyle = this.pow > SPOT_GOLD + .05 ? '#ff9a6a' : '#8fe3a4'; c.fill();
      } else this.text(c, t('spot_castHint'), (x0 + x1) / 2, y + 15, 12, 'rgba(255,246,218,.9)', 'center');
      const gx = x0 + (x1 - x0) * SPOT_GOLD / 1.15;
      c.fillStyle = '#ffd86b'; c.fillRect(gx - 2, y - 4, 4, h + 8); poly(c, [gx - 6, y - 7, gx + 6, y - 7, gx, y - 1], '#ffd86b');
      return;
    }
    if (!F) return;
    const sx = x1 - 84, tx1 = sx - 8, w = tx1 - x0, X = v => x0 + w * clamp(v, 0, 1);
    rr(c, x0, y, w, h, 10); c.fillStyle = 'rgba(0,0,0,.55)'; c.fill();
    // the safe band: hatched and bracketed, so it reads without colour
    const b0 = X(F.b0), b1 = X(F.b1);
    c.save(); rr(c, x0, y, w, h, 10); c.clip();
    c.fillStyle = 'rgba(143,227,164,.55)'; c.fillRect(b0, y, b1 - b0, h);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.beginPath();
    for (let x = b0 - h; x < b1; x += 8) { c.moveTo(Math.max(b0, x), y + h - Math.max(0, b0 - x)); c.lineTo(Math.min(b1, x + h), y + Math.max(0, x + h - b1)); }
    c.stroke();
    // the red zone: cross-hatched
    const r0 = X(F.red);
    c.fillStyle = 'rgba(224,85,63,.75)'; c.fillRect(r0, y, x0 + w - r0, h);
    c.strokeStyle = 'rgba(255,255,255,.4)'; c.beginPath(); for (let x = r0; x < x0 + w + h; x += 7) { c.moveTo(x, y); c.lineTo(x - h, y + h); c.moveTo(x - h, y); c.lineTo(x, y + h); } c.stroke();
    c.restore();
    line(c, [b0, y - 3, b0, y + h + 3], '#fff', 2.5); line(c, [b1, y - 3, b1, y + h + 3], '#fff', 2.5);
    // the needle
    const nx = X(F.T);
    poly(c, [nx - 7, y - 8, nx + 7, y - 8, nx, y + 4], F.T > F.red ? '#ff8a7a' : '#fff'); c.lineWidth = 1.5; c.strokeStyle = '#000'; c.stroke();
    c.fillStyle = '#fff'; c.fillRect(nx - 1.5, y, 3, h);
    // the fish's strength: a bar, and a pip for every phase still to come
    const sk = F.tired ? 0 : clamp(F.sta / F.ph, 0, 1);
    drawIcon(c, 'fish', sx + 9, y + 6, 16);
    rr(c, sx + 20, y, 62, 10, 5); c.fillStyle = 'rgba(0,0,0,.55)'; c.fill();
    if (sk > 0) { rr(c, sx + 21, y + 1, 60 * sk, 8, 4); c.fillStyle = '#ffd86b'; c.fill(); }
    for (let i = 0; i < F.phases - 1 - F.k; i++) circ(c, sx + 26 + i * 9, y + 16, 3, '#ffd86b');
    this.text(c, Math.max(0, Math.round(rig().reel.spool - F.Lm)) + ' m', sx + 82, y + h + 1, 11, '#cfe8ff', 'right');
    // leaning against a run: an arrow beside the Chief shows which way the fish pulls
    if (F.run.kind === 'run') {
      const ax = G.ax, ay = G.ay - 70 * u, d = F.run.dir, good = F.against > 0;
      line(c, [ax - 16 * d, ay, ax + 16 * d, ay], good ? '#8fe3a4' : '#fff6da', 3);
      poly(c, [ax + 22 * d, ay, ax + 14 * d, ay - 6, ax + 14 * d, ay + 6], good ? '#8fe3a4' : '#fff6da');
    }
  },
  drawNote(c, G) {
    // the note sits in the sky right of the Chief, so it never covers the bird; a long line breaks in two
    const m = this.msg, y = Math.max(this.top + 22, Math.min(G.surf - 46, this.top + 40)), a = clamp(m.t / .4, 0, 1), left = G.ax + 46 * G.u;
    c.save(); c.globalAlpha = a;
    c.font = '800 15px ui-rounded, "Segoe UI", Roboto, sans-serif';
    const room = G.w - left - 8, rows = [m.text];
    if (c.measureText(m.text).width + 28 > room) { const i = m.text.lastIndexOf(' ', m.text.length / 2 + 6); if (i > 0) rows.splice(0, 1, m.text.slice(0, i), m.text.slice(i + 1)); }
    if (m.text2) rows.push(m.text2);
    let tw = 0;
    for (const r of rows) tw = Math.max(tw, c.measureText(r).width);
    const w = Math.min(room, tw + 28), h = 8 + rows.length * 18, cx = clamp(G.w / 2, left + w / 2, G.w - 8 - w / 2);
    rr(c, cx - w / 2, y - 18, w, h, 13); c.fillStyle = 'rgba(13,22,60,.82)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(255,216,107,.45)'; c.stroke();
    rows.forEach((r, i) => this.text(c, r, cx, y + i * 18, m.text2 && i === rows.length - 1 ? 13 : 15, m.text2 && i === rows.length - 1 ? '#cfe8ff' : '#fff6da', 'center', w - 12));
    c.restore();
  },
  text(c, s, x, y, px, col, align = 'left', max) {
    c.font = `800 ${Math.max(11, px)}px ui-rounded, "Segoe UI", Roboto, sans-serif`; c.textAlign = align; c.fillStyle = col;
    max ? c.fillText(s, x, y, max) : c.fillText(s, x, y);
    c.textAlign = 'left';
  },

  // ----- input: the same actions by touch, mouse and keys -----
  toP(x) { return (x - this.G.x0) / (this.G.x1 - this.G.x0); },
  down(x, y) {
    const st = this.st;
    if (st === 'read') {
      if (this.boxOpen) return this.box(false);
      const i = this.hitShadow(x, y);
      if (i >= 0) return this.card(i);
      this.closeCard();
      if (y > this.G.surf - 40 * this.G.u) { this.aiming = true; this.setMark(this.toP(x)); sfx.click(); }
    } else if (st === 'wait' || st === 'bite') this.strike();
    else if (st === 'net') this.netTry();
  },
  move(x) { if (this.aiming && hold.on) this.setMark(this.toP(x)); },
  up() { this.aiming = false; },
  key(e) {
    const k = e.key, st = this.st, onBody = !e.target || e.target === document.body || e.target === cv;
    if (k === ' ') { e.preventDefault(); hold.on = true; }     // Space is always the scene's, even with a button focused
    if (k === 'Escape') { e.preventDefault(); if (this.cardEl) return this.closeCard(); return this.back(); }
    if (this.boxOpen) { if (k === 't' || k === 'T') this.box(false); return; }
    if (k === 't' || k === 'T') { if (st === 'read') this.box(true); return; }
    if (st === 'read') {
      if (k === 'ArrowLeft' || k === 'ArrowDown') { e.preventDefault(); this.setMark(this.mark - .03); }
      else if (k === 'ArrowRight' || k === 'ArrowUp') { e.preventDefault(); this.setMark(this.mark + .03); }
      else if (k === ' ') this.charge();
      else if (k === 'Tab' && onBody) {      // Tab walks the highlight over the shadows (and the mark follows)
        const vis = this.pop.map((f, i) => i).filter(i => !this.pop[i].decoy && this.pop[i].st === 'swim' && this.seeAlpha(this.pop[i]) > .2);
        if (!vis.length) return;
        e.preventDefault();
        const j = vis.indexOf(this.sel), n = vis[(j + (e.shiftKey ? vis.length - 1 : 1)) % vis.length];
        this.setMark(this.pop[n].p); this.sel = n;
      } else if (k === 'Enter' && onBody && this.sel >= 0) { e.preventDefault(); this.card(this.sel); }
    } else if (st === 'wait' || st === 'bite') {
      if (k === ' ' || (k === 'Enter' && onBody)) { e.preventDefault(); this.strike(); }
    } else if (st === 'fight' || st === 'net') {
      if (k === 'ArrowUp') { e.preventDefault(); this.setDrag(1); }
      else if (k === 'ArrowDown') { e.preventDefault(); this.setDrag(-1); }
      else if (st === 'net' && (k === ' ' || k === 'Enter')) { e.preventDefault(); this.netTry(); }
    }
  },
  keyup(e) {
    if (e.key === ' ') { e.preventDefault(); if (this.st === 'power') this.release(); }
  },
});
