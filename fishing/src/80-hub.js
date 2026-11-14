// ---------- The treehouse: headquarters, the Market Perch, the logbook, the record boards and the Trophy Branch ----------
css(`
.hub-panel { display: flex; flex-direction: column; gap: .45em; width: min(30em, 100%); padding: .55em; border-radius: 1.2em;
  background: rgba(36, 20, 9, .86); border: 3px solid rgba(255, 216, 107, .4); box-shadow: 0 6px 0 rgba(0, 0, 0, .35); }
.hub-rank { display: flex; align-items: center; gap: .5em; line-height: 1.15; }
.hub-rank span { display: flex; flex-direction: column; } .hub-rank small { font-size: max(11px, .78em); font-weight: 700; opacity: .9; }
.hub-cards { grid-template-columns: repeat(2, 1fr); width: 100%; }
.hub-cards .card { min-height: 84px; color: var(--cream); justify-content: center; }
.hub-cards .card small { font-size: max(11px, .85em); font-weight: 700; opacity: .85; }
.hub-row { display: flex; gap: .35em; justify-content: center; flex-wrap: wrap; }
.hub-row .btn { font-size: .82em; padding: .25em .75em .25em .45em; }
.hub-lookbox { display: flex; flex-wrap: wrap; gap: .4em; justify-content: center; align-items: center; margin-top: .3em; }
.hub-me { width: 84px; height: 92px; flex: none; }
.hub-rows { display: flex; flex-direction: column; gap: .3em; }
.hub-lrow { display: grid; grid-template-columns: repeat(6, 48px); gap: .25em; justify-content: center; }
.hub-cap { font-size: max(11px, .7em); font-weight: 800; text-align: left; opacity: .85; }
.hub-lrow .pal { min-width: 48px; min-height: 48px; max-width: none; padding: 0; cursor: pointer; touch-action: manipulation; }
.hub-dot { width: 26px; height: 26px; border-radius: 50%; border: 3px solid #fff; }
textarea.hub-code { width: 100%; height: 5.2em; margin-top: .4em; padding: .4em; font: 600 max(12px, .72em)/1.25 ui-monospace, monospace; resize: none;
  border-radius: .8em; border: 3px solid var(--line); background: #fff; color: #2a1c05; user-select: text; -webkit-user-select: text; word-break: break-all; }
.hub-scroll { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; gap: .3em;
  padding: calc(3.75em + env(safe-area-inset-top)) .45em calc(.4em + env(safe-area-inset-bottom)); pointer-events: none; }
.hub-scroll > * { pointer-events: auto; }
.hud .hub-ttl { min-width: 0; overflow: hidden; text-overflow: ellipsis; }

.shop-wrap { position: absolute; inset: 0; display: flex; flex-direction: column; gap: .35em;
  padding: calc(3.75em + env(safe-area-inset-top)) .4em calc(.4em + env(safe-area-inset-bottom)); pointer-events: none; }
.shop-head { display: flex; align-items: center; gap: .4em; min-height: 88px; }
.shop-pie { width: 100px; height: 88px; flex: none; }
.shop-head .bubble { font-size: max(12px, .85em); padding: .45em .7em; }
.shop-main { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: .35em; pointer-events: auto; }
.shop-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: .25em; }
.shop-tabs .btn { min-width: 0; padding: .1em .3em; gap: .25em; font-size: max(11px, .78em); }
.shop-list { flex: 1; min-height: 0; overflow-y: auto; touch-action: pan-y; display: flex; flex-direction: column; gap: .35em; padding: 0 .1em .5em; }
.shop-list, .book-page, .rec-list, .tro-list { overflow-x: hidden; scrollbar-width: thin; scrollbar-color: rgba(255, 216, 107, .55) transparent; }
.shop-it { display: grid; grid-template-columns: 52px 1fr auto; gap: .2em .45em; align-items: center; padding: .35em .45em; border-radius: 1em;
  background: rgba(30, 18, 8, .92); border: 2px solid rgba(255, 216, 107, .35); }
.shop-ic { width: 52px; height: 52px; border-radius: .8em; background: rgba(255, 246, 218, .13); display: flex; align-items: center; justify-content: center; }
.shop-tx { display: flex; flex-direction: column; gap: .12em; min-width: 0; line-height: 1.15; }
.shop-tx b { font-size: .92em; } .shop-tx small { font-size: max(11px, .72em); font-weight: 600; opacity: .92; }
.shop-bars { display: flex; flex-wrap: wrap; gap: .2em .55em; }
.shop-bar { display: inline-flex; align-items: center; gap: .25em; font-size: max(11px, .68em); font-weight: 800; }
.shop-bar em { font-style: normal; opacity: .85; }
.shop-tr { position: relative; width: 4.2em; height: 10px; border-radius: 5px; background: rgba(0, 0, 0, .55); border: 1px solid rgba(255, 255, 255, .4); }
.shop-tr > span { display: block; height: 100%; border-radius: 4px; background: repeating-linear-gradient(90deg, #ffd86b 0 7px, #e8a33a 7px 9px); }
.shop-tr > i { position: absolute; top: -4px; bottom: -4px; width: 3px; margin-left: -1.5px; border-radius: 2px; background: #fff; box-shadow: 0 0 3px #000; }
.shop-tag { display: inline-flex; align-items: center; gap: .2em; padding: .05em .45em; border-radius: 999px; background: rgba(255, 255, 255, .13); font-size: max(11px, .68em); font-weight: 800; }
.shop-st { font-style: normal; font-size: max(11px, .7em); font-weight: 800; display: inline-flex; align-items: center; gap: .25em; color: #ffe9a3; }
.shop-act { display: flex; flex-direction: column; gap: .25em; align-items: stretch; }
.shop-act .btn { padding: .15em .65em; font-size: .85em; gap: .3em; }
.shop-using { display: inline-flex; align-items: center; justify-content: center; gap: .2em; min-height: 32px; padding: 0 .5em; border-radius: 999px;
  background: rgba(63, 174, 94, .35); border: 2px solid #8fe3a4; font-size: max(11px, .72em); font-weight: 900; }
.shop-it.lock { opacity: .8; } .shop-it.lock .shop-ic { filter: grayscale(.85) brightness(.8); }
.btn.shop-poor { background: #4a382a; color: #ffd2bf; border: 3px dashed rgba(255, 150, 120, .75); }
.shop-empty { text-align: center; font-weight: 800; margin: 1em 0; }

.book-page { width: min(46em, 100%); flex: 1; min-height: 0; display: flex; flex-direction: column; gap: .45em; padding: .5em .6em; overflow-y: auto; touch-action: pan-y;
  border-radius: 1.1em .5em .5em 1.1em; background: #f6ecd2; color: #3a2a14; border: 3px solid #c8a46a; box-shadow: 0 6px 0 rgba(0, 0, 0, .35), inset 0 0 34px rgba(160, 110, 40, .28); }
.book-page .btn:focus-visible, .book-tile:focus-visible { outline-color: #2b3f8f; }
.book-head { display: flex; align-items: center; gap: .4em; }
.book-ttl { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; line-height: 1.15; text-align: center; }
.book-ttl b { font-size: 1.1em; color: #5a2e0a; } .book-ttl small { font-size: max(11px, .78em); font-weight: 700; display: inline-flex; align-items: center; gap: .2em; }
.book-ttl .moonrow { margin: .15em 0; padding: 1px 6px; border-radius: 999px; background: #3a2a14; }
.book-head .btn.round { background: #f2b93b; border-color: #fff3c4; }
.book-opens { display: flex; flex-wrap: wrap; gap: .15em .7em; justify-content: center; align-items: center; font-size: max(11px, .76em); font-weight: 700; }
.book-opens em { font-style: normal; font-weight: 900; color: #7a4e22; } .book-opens span { display: inline-flex; align-items: center; gap: .2em; }
.book-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(5.6em, 1fr)); gap: .35em; }
.book-tile { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .1em; min-height: 84px; padding: .25em .15em;
  border-radius: .8em; border: 2px solid #c8a46a; background: #fff8e6; color: #3a2a14; font-weight: 800; font-size: max(11px, .7em); line-height: 1.05; cursor: pointer; text-align: center; }
.book-tile.seen { background: #ece0c0; } .book-tile.unseen { border-style: dashed; background: transparent; color: #8a7350; }
.book-tile i { position: absolute; top: 3px; right: 3px; }
.book-sp { display: flex; flex-wrap: wrap; gap: .6em; align-items: flex-start; justify-content: center; }
.book-pw { position: relative; flex: 0 1 300px; min-width: 200px; }
.book-por { display: block; width: 100%; aspect-ratio: 2 / 1; border-radius: .8em; border: 2px solid #c8a46a; }
.book-stamp { position: absolute; right: -4px; bottom: -8px; transform: rotate(-12deg); padding: .1em .5em; border: 3px double #b0302a; border-radius: .4em;
  color: #b0302a; font-weight: 900; font-size: max(11px, .8em); text-transform: uppercase; letter-spacing: .05em; background: rgba(246, 236, 210, .85); opacity: .45; }
.book-stamp.got { opacity: 1; }
.book-facts { flex: 1 1 15em; min-width: 0; display: flex; flex-direction: column; gap: .3em; font-size: max(12px, .86em); font-weight: 600; }
.book-facts p { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: .3em; } .book-facts em { font-style: normal; font-weight: 900; color: #7a4e22; }
.book-foot { display: flex; justify-content: center; }

.rec-list { width: min(62em, 100%); flex: 1; min-height: 0; overflow-y: auto; touch-action: pan-y; display: grid; grid-template-columns: repeat(auto-fill, minmax(16em, 1fr));
  gap: .5em; align-content: start; padding-bottom: .5em; }
.rec-board { border-radius: .8em; padding: .4em .55em .5em; background: repeating-linear-gradient(0deg, #8a5a34 0 22px, #7c5030 22px 24px);
  border: 3px solid rgba(0, 0, 0, .4); box-shadow: 0 4px 0 rgba(0, 0, 0, .35); }
.rec-board h3 { margin: 0 0 .25em; font-size: .95em; color: #fff6da; display: flex; align-items: center; justify-content: space-between; gap: .4em; text-shadow: 0 1px 2px #000; }
.rec-board ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .15em; }
.rec-board li { display: flex; align-items: center; gap: .4em; padding: .1em .35em; border-radius: .5em; background: rgba(0, 0, 0, .3); font-size: .85em; }
.rec-board li i { font-style: normal; min-width: 1.2em; color: var(--gold); } .rec-board li span { flex: 1; min-width: 0; } .rec-board li b { color: var(--gold); white-space: nowrap; }
.rec-board p { margin: .2em 0; font-size: max(11px, .8em); } .rec-board.none { opacity: .72; }

.tro-list { width: min(52em, 100%); flex: 1; min-height: 0; overflow-y: auto; touch-action: pan-y; display: flex; flex-direction: column; gap: .45em; padding-bottom: .5em; }
.tro-fam h3 { margin: 0 0 .15em .3em; font-size: .92em; color: #fff6da; text-shadow: 0 1px 3px #000; }
.tro-twig { position: relative; display: grid; grid-template-columns: repeat(auto-fill, minmax(5em, 1fr)); gap: .2em; padding: 13px .3em .3em; border-radius: .7em; background: rgba(8, 16, 30, .62); }
.tro-twig::before { content: ""; position: absolute; left: -.25em; right: -.25em; top: 0; height: 10px; border-radius: 6px; background: linear-gradient(#9a6a3c, #5a3a1a); box-shadow: 0 2px 0 rgba(0, 0, 0, .35); }
.tro-b { display: flex; flex-direction: column; align-items: center; gap: .1em; min-height: 86px; padding: 0 .1em .2em; border: 0; border-radius: .7em; background: none; color: var(--cream);
  font-weight: 800; font-size: max(11px, .66em); line-height: 1.05; cursor: pointer; text-align: center; }
.tro-b::before { content: ""; width: 2px; height: 8px; margin-top: -3px; background: #c9a06a; }
.tro-b:not(.got) span { opacity: .65; }
.tro-b:focus-visible { outline: 4px solid #fff; }
.tro-rw { margin: .4em 0 0; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: .3em; flex-wrap: wrap; }
.tro-toast { position: fixed; pointer-events: none; display: flex; align-items: center; gap: .5em; top: 13%; padding: .25em 1em .25em .35em; text-align: left; }
.tro-toast span { display: flex; flex-direction: column; line-height: 1.1; } .tro-toast small { font-size: .68em; color: #7a4c00; }

@media (min-aspect-ratio: 23/20) {
  .shop-wrap { flex-direction: row; }
  .shop-head { width: 32%; max-width: 22em; flex-direction: column-reverse; justify-content: flex-end; align-items: flex-start; }
  .shop-head .bubble { flex: none; }
  .shop-head .bubble::before { left: 34px; top: auto; bottom: -12px; margin: 0; border: 9px solid transparent; border-bottom: 0; border-top: 13px solid var(--cream); }
  .shop-pie { width: 100%; height: min(40vh, 220px); }
  .shop-tabs { grid-template-columns: repeat(6, 1fr); }
  .shop-tabs .btn { flex-direction: column; gap: 0; line-height: 1.05; }
}
@media (min-aspect-ratio: 23/20) and (max-height: 520px) {
  .hub-cards .card { min-height: 62px; flex-direction: row; gap: .35em; } .hub-cards .card canvas { width: 32px !important; height: 32px !important; }
  .hub-panel { gap: .3em; padding: .4em; }
  .hub-me { display: none; }
  .tro-toast { top: 4.2em; }
}
`);

Object.assign(L, {
  hub_sp: ['species|species', 'вид|вида|видов', 'specie|specie'],
  hub_next: ['{n} more for rank {r}', 'Ещё {n} до ранга «{r}»', 'Ancora {n} per il grado {r}'],
  hub_top: ['The highest rank of all!', 'Самый высокий ранг!', 'Il grado più alto di tutti!'],
  hub_look: ['Chief\'s look', 'Наряд', 'Look del Capo'],
  hub_lookAsk: ['How does the Chief look today?', 'Как сегодня выглядит командир?', 'Come si veste oggi il Capo?'],
  hub_feathers: ['Feathers', 'Перья', 'Piume'], hub_hats: ['Hats', 'Шляпы', 'Cappelli'], hub_paints: ['Boat paint', 'Краска лодки', 'Vernice della barca'],
  hub_col0: ['Orange', 'Оранжевый', 'Arancione'], hub_col1: ['Blue', 'Голубой', 'Azzurro'], hub_col2: ['Green', 'Зелёный', 'Verde'],
  hub_col3: ['Pink', 'Розовый', 'Rosa'], hub_col4: ['Violet', 'Фиолетовый', 'Viola'], hub_col5: ['Yellow', 'Жёлтый', 'Giallo'],
  hub_cap: ['Guard\'s cap', 'Кепка дозорного', 'Berretto da guardia'], hub_plain: ['Plain wood', 'Простое дерево', 'Legno semplice'],
  hub_copy: ['Copy save', 'Скопировать код', 'Copia codice'], hub_paste: ['Paste save', 'Вставить код', 'Incolla codice'],
  hub_copied: ['Save code copied!', 'Код игры скопирован!', 'Codice copiato!'],
  hub_copyHere: ['Here is your save code. Keep it somewhere safe.', 'Вот код твоей игры. Сохрани его в надёжном месте.', 'Ecco il codice della partita. Conservalo in un posto sicuro.'],
  hub_pasteAsk: ['Paste a save code here.', 'Вставь сюда код игры.', 'Incolla qui un codice di salvataggio.'],
  hub_load: ['Load', 'Загрузить', 'Carica'], hub_cancel: ['Cancel', 'Отмена', 'Annulla'],
  hub_bad: ['That code does not work.', 'Этот код не подходит.', 'Questo codice non funziona.'],
  hub_replace: ['Replace all progress on this device with this save?', 'Заменить весь прогресс на этом устройстве игрой из этого кода?', 'Sostituire tutti i progressi su questo dispositivo con questo salvataggio?'],
  hub_replaceGo: ['Replace', 'Заменить', 'Sostituisci'],
  hub_recNone: ['No fish here yet.', 'Здесь пока нет рыбы.', 'Ancora nessun pesce qui.'],
  hub_recLocked: ['This water is still locked.', 'Этот водоём пока закрыт.', 'Questa zona è ancora chiusa.'],

  shop_t_rod: ['Rods', 'Удочки', 'Canne'], shop_t_line: ['Lines', 'Лески', 'Lenze'], shop_t_reel: ['Reels', 'Катушки', 'Mulinelli'],
  shop_t_lure: ['Lures', 'Приманки', 'Esche'], shop_t_gear: ['Gear', 'В поход', 'Accessori'], shop_t_look: ['Style', 'Наряды', 'Stile'],
  shop_pow: ['Power', 'Сила', 'Potenza'], shop_fin: ['Finesse', 'Чуткость', 'Finezza'], shop_str: ['Strength', 'Прочность', 'Tenuta'],
  shop_thin: ['Fineness', 'Тонкость', 'Sottigliezza'], shop_drag: ['Smooth', 'Плавность', 'Morbidezza'], shop_spool: ['Spool', 'Шпуля', 'Bobina'], shop_m: ['m', 'м', 'm'],
  shop_d0: ['Surface', 'У поверхности', 'Superficie'], shop_d1: ['Mid water', 'В толще воды', 'Mezz\'acqua'], shop_d2: ['Deep', 'У дна', 'Fondo'],
  shop_a0: ['Still', 'Стоит', 'Ferma'], shop_a1: ['Twitching', 'Подёргивается', 'Guizzante'], shop_a2: ['Darting', 'Мечется', 'Scattante'],
  shop_f_worm: ['Worm', 'Червяк', 'Verme'], shop_f_bug: ['Bug', 'Жучок', 'Insetto'], shop_f_grain: ['Grain', 'Зерно', 'Granaglie'], shop_f_minnow: ['Little fish', 'Малёк', 'Pesciolino'],
  shop_f_shiny: ['Shiny', 'Блестяшка', 'Luccicante'], shop_f_shrimp: ['Shrimp', 'Креветка', 'Gamberetto'], shop_f_glow: ['Glow', 'Свечение', 'Luminosa'],
  shop_lit: ['Lit', 'С огоньком', 'Accesa'], shop_glow: ['Glows', 'Светится', 'Brilla'],
  shop_free: ['Free, never runs out', 'Бесплатно, не кончается', 'Gratis, non finisce mai'],
  shop_left: ['{n} left', 'Осталось: {n}', 'Rimaste: {n}'], shop_pack: ['pack of {n}', 'в наборе {n}', 'confezione da {n}'],
  shop_owned: ['Owned', 'Уже есть', 'Già tuo'],
  shop_dear: ['Too dear: need {n} more', 'Дорого: не хватает {n}', 'Troppo caro: ancora {n} da guadagnare'],
  shop_rank: ['Needs rank {r}', 'Нужен ранг «{r}»', 'Serve il grado {r}'],
  shop_craft: ['Earn the trophy "{a}" first', 'Сначала получи трофей «{a}»', 'Prima ottieni il trofeo «{a}»'],
  shop_buyA: ['Buy {x} for {n} moons', 'Купить «{x}» за {n} лун', 'Compra {x} per {n} lune'],
  shop_use: ['Use', 'Взять', 'Usa'], shop_using: ['In use', 'Выбрано', 'In uso'],
  shop_wear: ['Wear', 'Надеть', 'Indossa'], shop_worn: ['Wearing', 'Надето', 'Indossato'],
  shop_paint: ['Paint', 'Покрасить', 'Vernicia'], shop_painted: ['On the boat', 'На лодке', 'Sulla barca'],
  shop_ready: ['{x}: ready!', '{x}: готово!', '{x}: tutto pronto!'],
  shop_empty: ['Nothing here yet. Come back later!', 'Пока здесь пусто. Загляни позже!', 'Per ora niente. Torna più tardi!'],
  shop_intro: ['I used to steal shiny things. Now I sell them! Honestly. Have a look, Chief!', 'Раньше я воровал блестяшки. А теперь продаю! Честно-честно. Смотри, командир!',
    'Una volta rubavo le cose luccicanti. Ora le vendo! Davvero. Dai un\'occhiata, Capo!'],
  shop_hi1: ['Hello, Chief! Everything here is mine. Honestly. Mostly.', 'Привет, командир! Тут всё моё. Честно. Почти.', 'Ciao, Capo! Qui è tutto mio. Davvero. Quasi.'],
  shop_hi2: ['Shiny lures! Fair prices! I counted twice.', 'Блестящие приманки! Честные цены! Я дважды пересчитал.', 'Esche luccicanti! Prezzi onesti! Ho contato due volte.'],
  shop_hi3: ['The Chief is here again! Hooray!', 'Командир снова у меня! Ура!', 'Il Capo è di nuovo qui! Evviva!'],
  shop_hi4: ['No more stealing. Now I sell. Much better for my nerves.', 'Больше не ворую. Теперь продаю. Нервам гораздо спокойнее.', 'Niente più furti. Ora vendo. Molto meglio per i miei nervi.'],
  shop_hi5: ['Fish like shiny things. So do I. We understand each other.', 'Рыбы любят блестяшки. И я тоже. Мы друг друга понимаем.', 'Ai pesci piacciono le cose luccicanti. Anche a me. Ci capiamo.'],
  shop_poor: ['Not enough moons yet, Chief. Catch a few more fish!', 'Пока не хватает лун, командир. Поймай ещё немного рыбы!', 'Non bastano ancora le lune, Capo. Pesca ancora un po\'!'],
  shop_ty1: ['Pleasure doing honest business!', 'Приятно вести честные дела!', 'Un piacere fare affari onesti!'],
  shop_ty2: ['Good choice! I would buy it myself.', 'Отличный выбор! Я бы и сам купил.', 'Ottima scelta! La comprerei anch\'io.'],
  shop_ty3: ['Happy fishing, Chief!', 'Хорошего клёва, командир!', 'Buona pesca, Capo!'],

  book_logged: ['{n} of {m} logged', 'Записано: {n} из {m}', 'Registrate: {n} su {m}'],
  book_opens: ['Opens next:', 'Откроет:', 'Apre:'],
  book_openLog: ['Log {n}: {a}', 'Запиши {n}: {a}', 'Registra {n}: {a}'],
  book_openFish: ['Catch {f}: {a}', 'Поймай «{f}»: {a}', 'Cattura {f}: {a}'],
  book_legend: ['Legendary', 'Легенда', 'Leggendario'],
  book_unknown: ['Not seen yet', 'Ещё не встречалась', 'Non ancora visto'],
  book_shadow: ['Only its shadow so far. Catch it to fill this page!', 'Пока видна только тень. Поймай рыбу, чтобы заполнить страницу!', 'Finora solo la sua ombra. Pescalo per riempire la pagina!'],
  book_moves: ['Shadow', 'Тень', 'Ombra'],
  book_mv_cruise: ['cruises slowly', 'плывёт не спеша', 'nuota lenta'], book_mv_dart: ['darts about', 'носится туда-сюда', 'sfreccia qua e là'],
  book_mv_lurk: ['lurks in cover', 'прячется в укрытии', 'resta in agguato'], book_mv_school: ['swims in a school', 'плавает стайкой', 'nuota in branco'],
  book_lure: ['Favourite lure', 'Любимая приманка', 'Esca preferita'], book_depth: ['Favourite depth', 'Любимая глубина', 'Profondità preferita'],
  book_bite: ['How it bites', 'Как клюёт', 'Come abbocca'],
  book_slam: ['Slams the lure. Strike at once!', 'Хватает сразу. Подсекай немедленно!', 'Morde di colpo. Ferra subito!'],
  book_nibble: ['Nibbles first. Wait for the real pull.', 'Сначала пробует. Жди настоящего рывка.', 'Prima assaggia. Aspetta il vero strattone.'],
  book_fake: ['Fakes {n}, then bites. Do not strike too soon!', 'Обманывает {n}, потом клюёт. Не подсекай рано!', 'Finge {n}, poi abbocca. Non ferrare troppo presto!'],
  book_times: ['time|times', 'раз|раза|раз', 'volta|volte'],
  book_when: ['Only comes', 'Бывает только', 'Arriva solo'],
  book_c_dawn: ['at dawn', 'на рассвете', 'all\'alba'], book_c_day: ['by day', 'днём', 'di giorno'], book_c_dusk: ['at dusk', 'в сумерках', 'al tramonto'],
  book_c_night: ['at night', 'ночью', 'di notte'], book_c_rain: ['in the rain', 'в дождь', 'con la pioggia'], book_c_aurora: ['under the aurora', 'при северном сиянии', 'con l\'aurora'],
  book_c_squall: ['in a squall', 'в шквал', 'con la burrasca'], book_c_fog: ['in the fog', 'в тумане', 'con la nebbia'],
  book_best: ['Best', 'Рекорд', 'Record'], book_count: ['Caught', 'Поймано', 'Catturato'],
  book_prevW: ['Previous water', 'Предыдущий водоём', 'Zona precedente'], book_nextW: ['Next water', 'Следующий водоём', 'Zona successiva'],
  book_prev: ['Previous page', 'Предыдущая страница', 'Pagina precedente'], book_next: ['Next page', 'Следующая страница', 'Pagina successiva'],
});

// ----- Icons of the treehouse -----
// Page turns: dark triangles on gold buttons, so they never look like the blue "back" button of the top bar.
ICON.pgPrev = c => poly(c, [.45, -.7, -.6, 0, .45, .7], '#5a2e0a');
ICON.pgNext = c => poly(c, [-.45, -.7, .6, 0, -.45, .7], '#5a2e0a');
ICON.bookTick = c => line(c, [-.7, .05, -.2, .6, .75, -.6], '#2e8b3a', .3);
// A species never seen: an empty dashed outline with a question mark (it never gives the real shape away).
ICON.bookQ = c => {
  c.setLineDash([.14, .1]); c.beginPath(); c.ellipse(-.12, 0, .68, .42, 0, 0, TAU); c.moveTo(.52, 0); c.lineTo(.95, -.38); c.lineTo(.95, .38); c.closePath();
  c.lineWidth = .07; c.strokeStyle = '#8a7350'; c.stroke(); c.setLineDash([]);
  line(c, [-.3, -.14, -.24, -.26, -.1, -.3, .04, -.22, .04, -.08, -.12, .02, -.12, .1], '#8a7350', .09); circ(c, -.12, .24, .05, '#8a7350');
};
ICON.hubShop = c => {   // a market stall: striped awning, posts, a moon for the purse
  rr(c, -.8, -.05, 1.6, .85, .08); c.fillStyle = '#a8663a'; c.fill();
  for (let i = 0; i < 5; i++) { const x = -.95 + i * .38; c.beginPath(); c.moveTo(x, -.8); c.lineTo(x + .38, -.8); c.lineTo(x + .38, -.35); c.arc(x + .19, -.35, .19, 0, Math.PI); c.closePath(); c.fillStyle = i % 2 ? '#fff6da' : '#e8503a'; c.fill(); }
  c.save(); c.translate(0, .35); c.scale(.36, .36); ICON.moon(c); c.restore();
};
ICON.hubBranch = c => {
  c.beginPath(); c.moveTo(-1, -.55); c.quadraticCurveTo(0, -.9, 1, -.6); c.lineWidth = .2; c.strokeStyle = '#a8703c'; c.stroke(); ell(c, .6, -.86, .24, .11, '#62c26a', -.3);
  for (const [x, col] of [[-.45, '#ffd24a'], [.35, '#7fd0ff']]) { line(c, [x, -.68, x, -.25], '#e0c08a', .06); circ(c, x, .12, .36, col); circ(c, x, .12, .18, 'rgba(255,255,255,.6)'); }
};
ICON.hubBoard = c => {
  rr(c, -.9, -.72, 1.8, 1.44, .12); c.fillStyle = '#a8703c'; c.fill(); c.lineWidth = .07; c.strokeStyle = '#fff6da'; c.stroke();
  for (let i = 0; i < 3; i++) { line(c, [-.15, -.36 + i * .36, .66, -.36 + i * .36], '#fff6da', .1); ell(c, -.48, -.36 + i * .36, .2 - i * .03, .1, '#ffd86b'); }
};
ICON.hubCopy = c => { rr(c, -.75, -.85, 1.05, 1.3, .12); c.fillStyle = '#b9c4d8'; c.fill(); rr(c, -.3, -.4, 1.05, 1.3, .12); c.fillStyle = '#fff'; c.fill(); for (let i = 0; i < 3; i++) line(c, [-.12, -.12 + i * .3, .55, -.12 + i * .3], '#58a6ff', .09); };
ICON.hubPaste = c => {
  rr(c, -.7, -.75, 1.4, 1.65, .14); c.fillStyle = '#c8955a'; c.fill(); rr(c, -.5, -.5, 1, 1.25, .08); c.fillStyle = '#fff'; c.fill();
  rr(c, -.3, -.9, .6, .3, .08); c.fillStyle = '#8a94a8'; c.fill(); poly(c, [0, .6, -.32, .22, -.1, .22, -.1, -.3, .1, -.3, .1, .22, .32, .22], '#3fae5e');
};

// ----- Painting: the wooden walls are a static layer, cached per screen size; only living things are drawn each frame -----
const hubLayers = {};
function hubLayer(name, key, paint) {
  let l = hubLayers[name];
  if (!l || l.key !== key) {
    const d = Math.min(window.devicePixelRatio || 1, 2), el = document.createElement('canvas');
    el.width = Math.round(V.w * d); el.height = Math.round(V.h * d);
    const c = el.getContext('2d'); c.scale(d, d); paint(c);
    hubLayers[name] = l = { key, el };
  }
  ctx.drawImage(l.el, 0, 0, V.w, V.h);
}
// Plank walls with knots; `dim` darkens them under busy panels.
function hubWall(c, dim = 0) {
  const g = c.createLinearGradient(0, 0, 0, V.h); g.addColorStop(0, '#6b4226'); g.addColorStop(1, '#3a2212');
  c.fillStyle = g; c.fillRect(0, 0, V.w, V.h);
  const pw = clamp(V.w / 12, 34, 72);
  for (let i = 0, x = 0; x < V.w; i++, x += pw) {
    c.fillStyle = ['rgba(255,220,170,.06)', 'rgba(0,0,0,.08)', 'rgba(255,200,140,.03)', 'rgba(0,0,0,.03)'][i % 4]; c.fillRect(x, 0, pw, V.h);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x, 0, 2, V.h);
    for (let k = 0; k < 2; k++) ell(c, x + pw * (.3 + k * .4), ((i * 97 + k * 211) % 389) / 389 * V.h, 4, 7, 'rgba(40,20,8,.3)');
  }
  if (dim) { c.fillStyle = `rgba(6,10,32,${dim})`; c.fillRect(0, 0, V.w, V.h); }
}
// The part of the screen the panels leave free: the left half in landscape, the space above the panel in portrait.
function hubStage(panel) {
  if (wide()) return { x: 0, y: 0, w: V.w * .5, h: V.h };
  return { x: 0, y: 0, w: V.w, h: Math.max(140, panel ? panel.getBoundingClientRect().top : V.h * .5) };
}
// Fireflies that drift in a box; with reduced motion they simply glow in place.
function hubFlies(x, y, w, h, n) {
  const k = still() ? 0 : V.t;
  for (let i = 0; i < n; i++) {
    const fx0 = x + w * ((i * .37 + .1) % 1) + Math.sin(k * .7 + i * 2.1) * w * .08, fy0 = y + h * ((i * .53 + .2) % 1) + Math.cos(k * .9 + i) * h * .1;
    const a = .55 + .45 * Math.sin(k * 3 + i * 1.7);
    glow(ctx, fx0, fy0, 9, '255,230,120', .5 * a); circ(ctx, fx0, fy0, 1.8, `rgba(255,250,200,${a})`);
  }
}

// The treehouse room: a round window onto the dusk, a shelf, a rack of rods, a rug for the Chief.
function paintRoom(c, st) {
  hubWall(c);
  const fy = st.y + st.h * .86, top = 64;
  c.fillStyle = '#8a5a34'; c.fillRect(0, fy, V.w, V.h - fy);
  for (let y = fy + 12; y < V.h; y += 15) line(c, [0, y, V.w, y], 'rgba(0,0,0,.2)', 2);
  line(c, [0, fy, V.w, fy], '#4a2c18', 5);
  const R = Math.max(26, Math.min(st.w * .19, (fy - top) * .3)), wx = st.x + st.w * .76, wy = Math.max(top + R + 6, st.y + (fy - st.y) * .42);
  c.save(); c.beginPath(); c.arc(wx, wy, R, 0, TAU); c.clip();
  const g = c.createLinearGradient(0, wy - R, 0, wy + R); g.addColorStop(0, '#2c3a7a'); g.addColorStop(.6, '#f0905a'); g.addColorStop(1, '#ffd08a');
  c.fillStyle = g; c.fillRect(wx - R, wy - R, R * 2, R * 2);
  circ(c, wx + R * .35, wy - R * .3, R * .15, '#fff3c9');
  for (let i = 0; i < 7; i++) { const x = wx - R + i * R * .34; poly(c, [x - R * .2, wy + R, x, wy + R * (.15 + (i % 3) * .12), x + R * .2, wy + R], '#2a3a2a'); }
  c.restore();
  c.lineWidth = R * .16; c.strokeStyle = '#7a4e22'; c.beginPath(); c.arc(wx, wy, R, 0, TAU); c.stroke();
  line(c, [wx - R, wy, wx + R, wy], '#7a4e22', R * .08); line(c, [wx, wy - R, wx, wy + R], '#7a4e22', R * .08);
  // a shelf with jars and books
  const sw = Math.min(st.w * .3, 170), sx = st.x + st.w * .05, sy = Math.max(top + 46, st.y + (fy - st.y) * .45);
  rr(c, sx, sy, sw, 8, 3); c.fillStyle = '#4a2c18'; c.fill();
  line(c, [sx + 10, sy + 8, sx + 22, sy + 22], '#4a2c18', 4); line(c, [sx + sw - 10, sy + 8, sx + sw - 22, sy + 22], '#4a2c18', 4);
  [['#c0392b', 30], ['#2c6fbb', 26], ['#2e8b3a', 32]].forEach(([col, h], i) => { rr(c, sx + 8 + i * 13, sy - h, 11, h, 2); c.fillStyle = col; c.fill(); });
  jar(c, sx + sw * .62, sy - 14, 15, 1.3, .9); drawIcon(c, 'item:spinner', sx + sw * .86, sy - 14, 24);
  // the rack of rods on the wall
  for (let i = 0; i < 3; i++) drawIcon(c, ['item:rodp1', 'item:rodf2', 'item:rodp3'][i], st.x + st.w * (.1 + i * .07), fy - 40, 70);
  // the rug
  ell(c, st.x + st.w * .45, fy + 9, Math.min(st.w * .26, 120), 10, '#b0302a'); ell(c, st.x + st.w * .45, fy + 9, Math.min(st.w * .2, 92), 6, '#e8a33a');
}

// ----- The treehouse: the Chief at home, four places to go, the look and the save code -----
scenes.hub = {
  enter() {
    hud(() => go('map'), '', { book: false });
    const r = rank(), n = allLogged(), all = Object.keys(SPECIES).length, tro = Object.keys(S.ach).length;
    const next = r < 7 ? t('hub_next', { n: plural('hub_sp', RANKS[r + 1] - n), r: t('rank' + (r + 1)) }) : t('hub_top');
    const w = add(`<div class="hub"><div class="hub-panel">
      <div class="hub-rank">${ic('rank:' + r, 36)}<span><b>${esc(t('rankIs', { r: t('rank' + r) }))}</b><small>${esc(next)}</small></span></div>
      <div class="cards hub-cards">
        <button class="card" data-go="shop">${ic('hubShop', 40)}<span>${esc(t('shop'))}</span></button>
        <button class="card" data-go="book">${ic('bookI', 40)}<span>${esc(t('book'))}</span><small>${n}/${all}</small></button>
        <button class="card" data-go="trophies">${ic('hubBranch', 40)}<span>${esc(t('trophies'))}</span><small>${tro}/${Object.keys(ACHS).length}</small></button>
        <button class="card" data-go="records">${ic('hubBoard', 40)}<span>${esc(t('records'))}</span></button>
      </div>
      <div class="hub-row"><button class="btn" id="hLook">${ic('feather', 24)}${esc(t('hub_look'))}</button>
        <button class="btn" id="hCopy">${ic('hubCopy', 24)}${esc(t('hub_copy'))}</button><button class="btn" id="hPaste">${ic('hubPaste', 24)}${esc(t('hub_paste'))}</button></div>
    </div></div>`);
    this.panel = $('.hub-panel', w);
    w.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { sfx.pop(); const s = b.dataset.go; go(s, s === 'book' ? { back: () => go('hub') } : undefined); });
    $('#hLook', w).onclick = () => { sfx.click(); this.look(); };
    $('#hCopy', w).onclick = () => { sfx.click(); this.copy(); };
    $('#hPaste', w).onclick = () => { sfx.click(); this.paste(); };
    this.resize();
  },
  resize() { this.st = hubStage(this.panel); },
  draw() {
    const st = this.st, fy = st.y + st.h * .86;
    hubLayer('room', `${V.w}x${V.h}:${st.w | 0}x${st.h | 0}`, c => paintRoom(c, st));
    // the hanging lantern breathes; the Chief stands on the rug
    const lx = st.x + st.w * .3, ly = Math.max(96, st.y + (fy - st.y) * .2), k = still() ? 1 : .85 + .15 * Math.sin(V.t * 2.3) + .05 * Math.sin(V.t * 7.1);
    line(ctx, [lx, 0, lx, ly - 16], '#2a1a0c', 2); glow(ctx, lx, ly, 120 * k, '255,200,110', .32 * k); drawIcon(ctx, 'lamp', lx, ly, 40);
    hubFlies(st.x + st.w * .6, st.y + 70, st.w * .35, (fy - st.y) * .5, 5);
    chief(ctx, st.x + st.w * .45, fy + 6, clamp((fy - st.y) / 190, .9, 2.4), V.t, { pose: 'stand' });
  },
  key(e) { if (e.key === 'Escape') go('map'); },

  // The Chief's look: six feather colours, the hats and boat paints the Chief owns. Changes show at once.
  look() {
    const hats = [''].concat(Object.values(ITEMS).filter(i => i.kind === 'hat' && owns(i.id)).map(i => i.wear));
    const boats = owns('boat') ? [0].concat(Object.values(ITEMS).filter(i => i.kind === 'paint' && owns(i.id)).map(i => i.col)) : [];
    const sel = (on, html, data, label) => `<button class="pal${on ? ' sel' : ''}" ${data} aria-pressed="${on}" aria-label="${esc(label)}">${html}</button>`;
    const row = (cap, cells) => `<div class="hub-cap" aria-hidden="true">${esc(cap)}</div><div class="hub-lrow" role="group" aria-label="${esc(cap)}">${cells}</div>`;
    const html = () => `<div class="hub-lookbox"><canvas class="hub-me"></canvas><div class="hub-rows">
      ${row(t('hub_feathers'), CHIEF_COLS.map((cl, i) => sel(S.look.col === i, `<span class="hub-dot" style="background:${cl[0]}"></span>`, `data-col="${i}"`, t('hub_col' + i))).join(''))}
      ${row(t('hub_hats'), hats.map(h => sel(S.look.hat === h, h ? ic('item:hat_' + h, 34) : ic('hubCap', 34), `data-hat="${h}"`, h ? t('i_hat_' + h) : t('hub_cap'))).join(''))}
      ${boats.length ? row(t('hub_paints'), boats.map(b => sel(S.look.boat === b, ic(b ? 'item:paint' + b : 'hubHull', 34), `data-boat="${b}"`, b ? t('i_paint' + b) : t('hub_plain'))).join('')) : ''}
    </div></div>`;
    const v = talk(t('hub_lookAsk'), { who: '', html: `<div class="hub-lookw">${html()}</div>` }), box = $('.hub-lookw', v);
    const me = () => {   // a still portrait of the Chief in the dialog
      const el = $('.hub-me', box), d = Math.min(window.devicePixelRatio || 1, 2);
      el.width = 84 * d; el.height = 92 * d; const c = el.getContext('2d'); c.scale(d, d); chief(c, 40, 86, 1.45, 1, { pose: 'stand' });
    };
    me();
    box.onclick = e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.col !== undefined) S.look.col = +b.dataset.col;
      else if (b.dataset.hat !== undefined) S.look.hat = b.dataset.hat;
      else if (b.dataset.boat !== undefined) S.look.boat = +b.dataset.boat;
      save(); sfx.chirp();
      const at = [...box.querySelectorAll('button')].indexOf(b);
      box.innerHTML = html(); paintIcons(box); me();
      box.querySelectorAll('button')[at].focus({ preventScroll: true });
    };
  },
  // The save code: the whole career as one line of text, to copy somewhere safe or to carry to another device.
  copy() {
    const code = hubCode(), show = () => { const v = talk(t('hub_copyHere'), { who: '', html: `<textarea class="hub-code" readonly aria-label="${esc(t('hub_copy'))}">${esc(code)}</textarea>` }); const ta = $('textarea', v); ta.focus(); ta.select(); };
    try { navigator.clipboard.writeText(code).then(() => { sfx.yes(); toast(t('hub_copied')); }, show); } catch (e) { show(); }
  },
  paste() {
    let text = '';
    const v = talk(t('hub_pasteAsk'), { who: '', html: `<textarea class="hub-code" aria-label="${esc(t('hub_pasteAsk'))}" placeholder="FLF1-..."></textarea>`,
      acts: [{ label: t('hub_cancel'), icon: 'no' }, { label: t('hub_load'), cls: 'go', icon: 'yes', fn: () => this.load(text) }] });
    const ta = $('textarea', v);
    ta.oninput = () => { text = ta.value; };
    ta.focus();
  },
  load(text) {
    const o = hubRead(text);
    if (!o) { sfx.oops(); talk(t('hub_bad'), { who: '' }); return; }
    // Asked first, with "Cancel" as the safe default. The game reloads and its boot repairs anything odd in the save.
    talk(t('hub_replace'), { who: '', acts: [{ label: t('hub_cancel'), cls: 'go', icon: 'no' },
      { label: t('hub_replaceGo'), cls: 'no', icon: 'yes', fn: () => { for (const k in S) if (has(o, k)) S[k] = o[k]; save(); location.reload(); } }] });
  },
};
ICON.hubCap = c => { ell(c, .1, .25, .95, .26, '#2b3f8f'); rr(c, -.6, -.45, 1.25, .7, .26); c.fillStyle = '#3a52ad'; c.fill(); starPath(c, .05, -.12, .22, .09, 5); c.fillStyle = '#ffd24a'; c.fill(); };
ICON.hubHull = c => boatHull(c, MAP_PAINT[0], .2);
const hubCode = () => 'FLF1-' + btoa(unescape(encodeURIComponent(JSON.stringify(S))));
function hubRead(text) {
  try {
    const m = /FLF1-([A-Za-z0-9+/=\s]+)/.exec(text || '');
    const o = m && JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/\s+/g, '')))));
    return o && typeof o === 'object' && o.log && typeof o.log === 'object' && o.own && typeof o.own === 'object' ? o : null;
  } catch (e) { return null; }
}

// ----- The Market Perch -----
const SHOP_TABS = [['rod', 'item:rodp2'], ['line', 'item:lines2'], ['reel', 'item:reel3'], ['lure', 'item:spinner'], ['gear', 'item:lantern'], ['look', 'item:hat_wizard']];
let shopTab = 'rod';
// Never sell what cannot be used: the boat once Stormbreak is open, ice line once the Frozen Reach is, a sketch once its water is,
// a snag guard once the Sunken Mill is, the Owl Lantern once the Lantern Deep is (the only dark water), paint once there is a boat.
const shopOffered = it => it.kind === 'paint' ? owns('boat') > 0 : it.fx === 'boat' ? unlocked('reef') : it.fx === 'iceline' ? unlocked('ice')
  : it.fx === 'snagguard' ? unlocked('mill') : it.fx === 'lantern' ? unlocked('deep') : it.fx === 'sketch' ? unlocked(it.area) : true;
// Why a thing cannot be bought yet, in words (empty when it can).
const shopLock = it => it.craft && !S.ach[it.craft] ? t('shop_craft', { a: t('t_' + it.craft) }) : rank() < it.tier ? t('shop_rank', { r: t('rank' + it.tier) }) : '';
scenes.shop = {
  enter() {
    hud(() => go('hub'));
    const w = add(`<div class="shop-wrap"><div class="shop-head"><div class="shop-pie"></div><div class="bubble" id="shopSay"></div></div>
      <div class="shop-main"><div class="shop-tabs" role="group">${SHOP_TABS.map(([k, icon]) => `<button class="btn" data-tab="${k}" aria-pressed="${k === shopTab}">${ic(icon, 26)}<span>${esc(t('shop_t_' + k))}</span></button>`).join('')}</div>
      <div class="shop-list" id="shopList"></div></div></div>`);
    this.list = $('#shopList', w); this.pie = $('.shop-pie', w); this.bubble = $('#shopSay', w); this.joy = -9;
    w.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
      shopTab = b.dataset.tab; sfx.click();
      w.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-pressed', x === b));
      this.list.scrollTop = 0; this.render();
    });
    this.list.onclick = e => {
      const b = e.target.closest('button');
      if (b && b.dataset.buy) this.buy(b.dataset.buy, b);
      else if (b && b.dataset.use) this.use(b.dataset.use);
    };
    this.render();
    this.resize();
    // The magpie greets with a short line; now and then he says it in person (before any choice, so it never stands in the way of a purchase).
    const visits = bump('shopVisits'); save();
    const hi = t('shop_hi' + (1 + (Math.random() * 5 | 0)));
    this.say(hi);
    if (!S.tut.shop) { S.tut.shop = 1; save(); talk(t('shop_intro'), { who: 'pie' }); }
    else if (visits % 5 === 0) talk(hi, { who: 'pie' });
  },
  say(text) { this.bubble.textContent = text; say(text); },
  items() {
    // owned things always show; map sketches come after the real gear
    return Object.values(ITEMS).filter(i => (shopTab === 'look' ? i.kind === 'hat' || i.kind === 'paint' : i.kind === shopTab) && (shopOffered(i) || owns(i.id)))
      .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'hat' ? -1 : 1) || (a.fx === 'sketch') - (b.fx === 'sketch') || a.tier - b.tier || a.cost - b.cost);
  },
  render(focus) {
    const top = this.list.scrollTop, list = this.items();
    this.list.innerHTML = list.length ? list.map(it => this.row(it)).join('') : `<p class="shop-empty">${esc(t('shop_empty'))}</p>`;
    paintIcons(this.list);
    this.list.scrollTop = top;
    const f = focus && (this.list.querySelector(`[data-use="${focus}"]`) || this.list.querySelector(`[data-buy="${focus}"]`));
    if (f) f.focus({ preventScroll: true });
  },
  // One row: icon, name, what it does, its numbers as labelled bars (the white tick is what is tied on now), its state and its buttons.
  row(it) {
    const n = owns(it.id), lock = shopLock(it), lure = it.kind === 'lure', usable = it.free || n > 0, dear = S.moons < it.cost;
    const using = it.kind === 'hat' ? S.look.hat === it.wear : it.kind === 'paint' ? S.look.boat === it.col : it.kind === 'gear' ? false : S.rig[it.kind] === it.id;
    let st = '', act = '';
    if (lock) st = ic('lock', 16) + esc(lock);
    else if (it.free) st = esc(t('shop_free'));
    else if (lure) st = esc(t('shop_left', { n }) + ' · ' + t('shop_pack', { n: it.pack }));
    else if (n) st = esc(t('shop_owned'));
    else if (dear) st = esc(t('shop_dear', { n: it.cost - S.moons }));
    if (!it.free && (lure || !n)) act += `<button class="btn ${lock ? '' : dear ? 'shop-poor' : 'gold'}" data-buy="${it.id}"${lock ? ' disabled' : ''} aria-label="${esc(t('shop_buyA', { x: t('i_' + it.id), n: it.cost }))}">${ic(lock ? 'lock' : 'moon', 20)}${it.cost}</button>`;
    if (usable && it.kind !== 'gear') {
      const k = it.kind === 'hat' ? ['shop_wear', 'shop_worn'] : it.kind === 'paint' ? ['shop_paint', 'shop_painted'] : ['shop_use', 'shop_using'];
      act += using ? `<span class="shop-using">${ic('yes', 14)}${esc(t(k[1]))}</span>` : `<button class="btn go" data-use="${it.id}">${esc(t(k[0]))}</button>`;
    }
    return `<div class="shop-it${lock ? ' lock' : ''}"><span class="shop-ic">${ic('item:' + it.id, 46)}</span>
      <div class="shop-tx"><b>${esc(t('i_' + it.id))}</b><small>${esc(t('id_' + it.id))}</small><div class="shop-bars">${this.bars(it)}</div>${st ? `<i class="shop-st">${st}</i>` : ''}</div>
      <div class="shop-act">${act}</div></div>`;
  },
  bars(it) {
    const now = it.kind === 'rod' || it.kind === 'line' || it.kind === 'reel' ? rig()[it.kind] : null;
    const bar = (key, v, max, cur, txt = v) => `<span class="shop-bar" role="img" aria-label="${esc(t(key))}: ${esc(txt)}"><em>${esc(t(key))}</em><span class="shop-tr"><span style="width:${v / max * 100}%"></span>${cur !== undefined && cur !== v ? `<i style="left:${cur / max * 100}%"></i>` : ''}</span>${esc(txt)}</span>`;
    const tag = (text, icon) => `<span class="shop-tag">${icon ? ic(icon, 14) : ''}${esc(text)}</span>`;
    if (it.kind === 'rod') return bar('shop_pow', it.pow, 10, now.pow) + bar('shop_fin', it.fin, 10, now.fin);
    if (it.kind === 'line') return bar('shop_str', it.str, 10, now.str) + bar('shop_thin', it.thin, 10, now.thin);
    if (it.kind === 'reel') return bar('shop_drag', it.drag, 10, now.drag) + bar('shop_spool', it.spool, 500, now.spool, it.spool + ' ' + t('shop_m'));
    if (it.kind === 'lure') return tag(t('shop_d' + it.depth)) + tag(t('shop_a' + it.act)) + tag(t('shop_f_' + it.food)) + (it.lit ? tag(t('shop_lit'), 'lamp') : '') + (it.glow ? tag(t('shop_glow'), 'beam') : '');
    if (it.fx === 'sketch') return tag(t('a_' + it.area)) + moonRow(AREA[it.area].tier, 12);
    return '';
  },
  buy(id, btn) {
    const it = ITEMS[id];
    if (!it || it.free || shopLock(it) || (it.kind !== 'lure' && owns(id))) return;
    if (!spend(it.cost)) { sfx.empty(); nudge(btn); this.say(t('shop_poor')); this.joy = -9; return; }
    give(id, it.kind === 'lure' ? it.pack : 1);
    sfx.coin(); this.joy = V.t;
    const r = this.pie.getBoundingClientRect();
    burst(r.left + r.width * .7, r.top + r.height * .4, 14, { kind: 'star', colors: ['#ffd86b', '#fff6da'], up: 60 });
    this.say(t('shop_ty' + (1 + (Math.random() * 3 | 0))));
    emit('buy', { id });
    this.render(id);   // focus moves to "Use" / "Wear", so the new thing can be tied on at once
  },
  use(id) {
    const it = ITEMS[id];
    if (it.kind === 'hat') S.look.hat = it.wear; else if (it.kind === 'paint') S.look.boat = it.col; else S.rig[it.kind] = id;
    save(); rig(); sfx.pop();
    this.say(t('shop_ready', { x: t('i_' + id) }));
    this.render(id);
  },
  resize() { this.box = this.pie.getBoundingClientRect(); },
  draw() {
    hubLayer('stall', `${V.w}x${V.h}`, c => {
      hubWall(c, .1);
      // the striped awning along the top, with its scalloped edge
      const sw = clamp(V.w / 10, 36, 64);
      for (let i = 0, x = 0; x < V.w; i++, x += sw) {
        c.fillStyle = i % 2 ? '#fff6da' : '#d8443a'; c.fillRect(x, 0, sw, 54);
        c.beginPath(); c.arc(x + sw / 2, 54, sw / 2, 0, Math.PI); c.fill();
      }
      for (let i = 0; i < 8; i++) { const x = V.w * (.08 + i * .12), y = 90 + (i % 3) * 16; line(c, [x, 60, x, y - 12], 'rgba(255,246,218,.5)', 1.5); drawIcon(c, 'item:' + ['spinner', 'spoon', 'popper', 'minnow', 'jig', 'squid', 'cricket', 'shrimp'][i], x, y, 26); }
    });
    // the magpie on his perch: a post under him, a happy face just after a sale
    const b = this.box;
    if (!b) return;
    const s = Math.min(b.width / 125, b.height / 80, 2.2), x = b.left + 66 * s, y = b.top + b.height * .96;   // the tail reaches 64 units back
    rr(ctx, x - 22, y - 2, 44, 8, 3); ctx.fillStyle = '#5a3a1a'; ctx.fill(); line(ctx, [x, y + 6, x, Math.min(V.h, y + 60)], '#5a3a1a', 6);
    magpie(ctx, x, y, s, V.t, { face: V.t - this.joy < 1.6 ? 'joy' : 'puppy', disguise: 2 });
  },
  key(e) { if (e.key === 'Escape') go('hub'); },
};

// ----- The logbook: one chapter per water, one page per species -----
let bookArea = null;   // the water the book was last open at
// A water's species, Legendary last.
const bookFish = a => AREA[a].fish.slice().sort((x, y) => (SPECIES[x].legend ? 1 : 0) - (SPECIES[y].legend ? 1 : 0));
// What logging here opens: "Log 6: The Sunken Mill", with a tick once it is done.
function bookOpens(a) {
  const out = [];
  for (const b of AREAS) for (const c of b.need || []) {
    if (c.area === a) out.push({ text: t('book_openLog', { n: c.n, a: t('a_' + b.id) }), ok: logged(a) >= c.n });
    if (c.fish && SPECIES[c.fish] && SPECIES[c.fish].area === a) out.push({ text: t('book_openFish', { f: t('f_' + c.fish), a: t('a_' + b.id) }), ok: caught(c.fish) });
  }
  return out;
}
scenes.book = {
  enter(arg) {
    this.back = arg && arg.back || (() => go('hub'));
    const at = arg && arg.area || bookArea || (AREA[S.at] ? S.at : 'pond');
    this.ai = Math.max(0, AREAS.findIndex(a => a.id === at));
    hud(() => this.sp ? this.show(null) : this.back(), '', { book: false });
    const w = add(`<div class="hub-scroll"><div class="book-page"></div></div>`);
    this.page = $('.book-page', w);
    this.page.onclick = e => {
      const b = e.target.closest('button');
      if (!b) return;
      sfx.click();
      if (b.dataset.nav) this.flip(+b.dataset.nav);
      else if (b.dataset.sp) this.show(b.dataset.sp);
      else if (b.dataset.up) this.show(null);
    };
    this.show(arg && arg.sp || null);
  },
  show(sp) {
    const from = this.sp;
    this.sp = sp;
    sp ? this.speciesPage(sp) : this.waterPage();
    this.page.scrollTop = 0;
    // after closing a page, focus returns to its tile so leafing by keyboard keeps its place
    const f = !sp && from ? this.page.querySelector(`[data-sp="${from}"]`) : null;
    if (f) f.focus({ preventScroll: true });
  },
  // Arrows: the next water on a chapter page, the next species on a species page (both wrap around).
  flip(d) {
    if (this.sp) { const ids = bookFish(SPECIES[this.sp].area); this.show(ids[(ids.indexOf(this.sp) + d + ids.length) % ids.length]); }
    else { this.ai = (this.ai + d + AREAS.length) % AREAS.length; this.show(null); }
  },
  head(title, sub, prev, next) {
    return `<div class="book-head"><button class="btn round" data-nav="-1" aria-label="${esc(prev)}">${ic('pgPrev', 24)}</button>
      <div class="book-ttl">${title}<small>${sub}</small></div><button class="btn round" data-nav="1" aria-label="${esc(next)}">${ic('pgNext', 24)}</button></div>`;
  },
  waterPage() {
    const a = AREAS[this.ai], ids = bookFish(a.id), opens = bookOpens(a.id);
    bookArea = a.id;
    this.page.innerHTML = this.head(`<b>${esc(t('a_' + a.id))}</b>${moonRow(a.tier, 14)}`,
      esc(t('book_logged', { n: logged(a.id), m: ids.length })) + (unlocked(a.id) ? '' : ' · ' + ic('lock', 14) + esc(t('locked'))), t('book_prevW'), t('book_nextW')) +
      (opens.length ? `<div class="book-opens"><em>${esc(t('book_opens'))}</em>${opens.map(o => `<span>${ic(o.ok ? 'bookTick' : 'lock', 14)}${esc(o.text)}</span>`).join('')}</div>` : '') +
      `<div class="book-grid">${ids.map(id => {
        const e = S.log[id] || {}, got = e.n > 0, seen = got || e.seen || e.id, named = got || e.id, legend = SPECIES[id].legend;
        return `<button class="book-tile ${got ? 'got' : seen ? 'seen' : 'unseen'}" data-sp="${id}" aria-label="${esc(named ? t('f_' + id) : t('book_unknown'))}${legend ? ', ' + esc(t('book_legend')) : ''}">
          ${ic(got ? 'fishI:' + id : seen ? 'fishI:' + id + ':shadow' : 'bookQ', 54)}<span>${esc(named ? t('f_' + id) : '?')}</span>${legend ? `<i>${ic(got ? 'star' : 'star0', 16)}</i>` : ''}</button>`;
      }).join('')}</div>`;
    paintIcons(this.page);
  },
  // A species page: the portrait (painted after the first catch, a shadow before, an empty outline if never seen) and what experience taught.
  speciesPage(id) {
    const sp = SPECIES[id], e = S.log[id] || {}, got = e.n > 0, seen = got || e.seen || e.id, named = got || e.id, ids = bookFish(sp.area);
    const fact = (k, v) => `<p><em>${esc(t(k))}:</em> ${v}</p>`, facts = [];
    facts.push(`<p>${esc(got ? t('fn_' + id) : t(seen ? 'book_shadow' : 'book_unknown'))}</p>`);
    if (seen && sp.move) facts.push(fact('book_moves', esc(t('book_mv_' + sp.move))));
    if (e.fast) facts.push(`<p>${esc(t('spot_faster'))}</p>`);   // learned from one that got away
    if (e.lure && ITEMS[e.lure]) facts.push(fact('book_lure', ic('item:' + e.lure, 26) + esc(t('i_' + e.lure))));
    if (e.depth !== undefined) facts.push(fact('book_depth', esc(t('shop_d' + e.depth))));
    if (got) {
      facts.push(fact('book_bite', esc(sp.bite === 'fake' ? t('book_fake', { n: plural('book_times', sp.fakes || 1) }) : t(sp.bite === 'nibble' ? 'book_nibble' : 'book_slam'))));
      if (sp.when) facts.push(fact('book_when', esc(sp.when.map(c => t('book_c_' + c)).join(', '))));
      facts.push(fact('book_best', esc(fmtW(e.best))), fact('book_count', esc(plural('book_times', e.n))));
    }
    this.page.innerHTML = this.head(`<b>${esc(named ? t('f_' + id) : '?')}</b>`, `${esc(t('a_' + sp.area))} · ${ids.indexOf(id) + 1}/${ids.length}`, t('book_prev'), t('book_next')) +
      `<div class="book-sp"><div class="book-pw"><canvas class="book-por" role="img" aria-label="${esc(named ? t('f_' + id) : '?')}"></canvas>${sp.legend ? `<span class="book-stamp${got ? ' got' : ''}">${esc(t('book_legend'))}</span>` : ''}</div>
      <div class="book-facts">${facts.join('')}</div></div>
      <div class="book-foot"><button class="btn" data-up="1">${ic('bookI', 26)}${esc(t('a_' + sp.area))}</button></div>`;
    paintIcons(this.page);
    const el = $('.book-por', this.page), r = el.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2), w = r.width, h = r.height;
    el.width = Math.round(w * d); el.height = Math.round(h * d);
    const c = el.getContext('2d'); c.scale(d, d);
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, got ? '#cfe8f0' : '#b9c6c8'); g.addColorStop(1, got ? '#8fbcd0' : '#7d9099'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 1; i < 4; i++) line(c, [0, h * i / 4 + 4, w * .3, h * i / 4, w * .7, h * i / 4 + 6, w, h * i / 4 + 2], 'rgba(255,255,255,.25)', 1.5);
    if (seen) drawFish(c, id, w / 2, h / 2, Math.min(w * .66, h * .9), { dir: 1, t: 1, mode: got ? 'full' : 'shadow', alpha: 1, wag: .3, tilt: 0 });   // a deep-bodied fish is nearly as tall as it is long
    else drawIcon(c, 'bookQ', w / 2, h / 2, h * .9);
  },
  key(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') this.flip(e.key === 'ArrowLeft' ? -1 : 1);
    else if (e.key === 'Escape') this.sp ? this.show(null) : this.back();
  },
  draw() {
    hubLayer('desk', `${V.w}x${V.h}`, c => {
      const g = c.createLinearGradient(0, 0, 0, V.h); g.addColorStop(0, '#3a2414'); g.addColorStop(1, '#1e120a'); c.fillStyle = g; c.fillRect(0, 0, V.w, V.h);
      for (let y = 18; y < V.h; y += 26) line(c, [0, y, V.w, y + 6], 'rgba(255,210,150,.05)', 3);
      glow(c, V.w * .85, 30, Math.max(V.w, V.h) * .55, '255,200,120', .22);
    });
  },
};

// ----- The record boards: one carved board per water, the player's giants heaviest first -----
scenes.records = {
  enter() {
    hud(() => go('hub'), `<span class="pill hub-ttl">${ic('hubBoard', 22)}${esc(t('records'))}</span>`);
    const boards = AREAS.map(a => {
      const rows = a.fish.filter(caught).sort((x, y) => S.log[y].best - S.log[x].best);
      return `<section class="rec-board${rows.length ? '' : ' none'}"><h3><span>${esc(t('a_' + a.id))}</span>${moonRow(a.tier, 11)}</h3>${rows.length
        ? `<ol>${rows.map((id, i) => `<li><i>${i + 1}</i>${ic('fishI:' + id, 32)}<span>${esc(t('f_' + id))}${SPECIES[id].legend ? ' ' + ic('star', 14) : ''}</span><b>${esc(fmtW(S.log[id].best))}</b></li>`).join('')}</ol>`
        : `<p>${unlocked(a.id) ? '' : ic('lock', 14)}${esc(t(unlocked(a.id) ? 'hub_recNone' : 'hub_recLocked'))}</p>`}</section>`;
    }).join('');
    add(`<div class="hub-scroll"><div class="rec-list">${boards}</div></div>`);
  },
  draw() { hubLayer('wall', `${V.w}x${V.h}`, c => hubWall(c, .3)); },
  key(e) { if (e.key === 'Escape') go('hub'); },
};

// ----- The Trophy Branch: a twig per family, a carved badge per trophy; a tap tells how to earn it and what it gives -----
scenes.trophies = {
  enter() {
    const all = Object.keys(ACHS), n = all.filter(id => S.ach[id]).length;
    hud(() => go('hub'), `<span class="pill hub-ttl">${ic('hubBranch', 22)}${esc(t('tro_count', { n, m: all.length }))}</span>`);
    const w = add(`<div class="hub-scroll"><div class="tro-list">${TRO_FAMS.map(f => `<section class="tro-fam"><h3>${esc(t('tro_' + f))}</h3><div class="tro-twig">${all.filter(id => ACHS[id].fam === f).map(id => {
      const got = !!S.ach[id], hid = ACHS[id].secret && !got, name = hid ? '?' : t('t_' + id);
      return `<button class="tro-b${got ? ' got' : ''}" data-a="${id}" aria-label="${esc(name + ': ' + t(got ? 'tro_got' : 'tro_not'))}">${ic('ach:' + id, 50)}<span>${esc(name)}</span></button>`;
    }).join('')}</div></section>`).join('')}</div></div>`);
    $('.tro-list', w).onclick = e => { const b = e.target.closest('[data-a]'); if (b) { sfx.click(); this.open(b.dataset.a); } };
  },
  open(id) {
    const a = ACHS[id], got = !!S.ach[id], hid = a.secret && !got, it = a.item && ITEMS[a.item];
    const gift = [a.moons ? t('tro_moons', { n: a.moons }) : '', it ? t('i_' + it.id) + (it.pack ? ' ×' + it.pack : '') : ''].filter(Boolean).join(' + ');
    talk(hid ? t('tro_hid') : troDesc(id), { who: '', title: hid ? '?' : t('t_' + id),
      html: `<div class="pics">${ic('ach:' + id, 72)}${it && !hid ? ic('item:' + it.id, 44) : ''}</div><p class="tro-rw">${got ? ic('star', 18) : ''}${esc(t(got ? 'tro_got' : 'tro_not'))} · ${esc(t('tro_reward', { x: hid ? '?' : gift }))}</p>` });
  },
  draw() {
    hubLayer('branch', `${V.w}x${V.h}`, c => {
      const g = c.createLinearGradient(0, 0, 0, V.h); g.addColorStop(0, '#0e1a3a'); g.addColorStop(1, '#14301f'); c.fillStyle = g; c.fillRect(0, 0, V.w, V.h);
      for (let i = 0; i < 40; i++) circ(c, (i * 173 % 997) / 997 * V.w, (i * 311 % 613) / 613 * V.h * .5, 1 + i % 2, 'rgba(255,255,255,.5)');
      // the great branch the badges hang from
      c.beginPath(); c.moveTo(-20, V.h * .2); c.bezierCurveTo(V.w * .3, V.h * .05, V.w * .6, V.h * .32, V.w + 20, V.h * .12);
      c.lineWidth = Math.max(18, V.h * .04); c.strokeStyle = '#5a3a1a'; c.lineCap = 'round'; c.stroke(); c.lineWidth *= .4; c.strokeStyle = '#7a5230'; c.stroke();
      for (let i = 0; i < 14; i++) { const k = i / 13, x = k * V.w, y = V.h * (.2 - .1 * Math.sin(k * 3.1)) + (i % 2 ? -14 : 14); c.save(); c.translate(x, y); c.rotate(i % 2 ? -.6 : 2.4); c.scale(16, 9); c.beginPath(); SHAPES.leaf(c); c.fillStyle = i % 3 ? '#3d7a3a' : '#58a84f'; c.fill(); c.restore(); }
    });
    hubFlies(0, V.h * .3, V.w, V.h * .6, 7);
  },
  key(e) { if (e.key === 'Escape') go('hub'); },
};
