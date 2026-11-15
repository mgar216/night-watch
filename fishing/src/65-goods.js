// ---------- Goods: everything the Market Perch sells, and the icon that draws any of it ----------
// Prices follow the fish: the ordinary catches of one water pay for the next water's kit (a rod, a line, a reel)
// in roughly 15 to 25 catches. `tier` is the angler rank that opens a thing in the shop.
// `art` is only read by the icon below.
Object.assign(L, {
  // lures from the Night Watch: one for each silly gadget that stands on the treehouse (nwlSync below); names, then where they come from
  nwl_peel: ['Banana-peel spinner', 'Банановая вертушка', 'Rotante buccia di banana'],
  nwl_peelD: ['A gift from the banana peel on the treehouse. Yours while it stays there.', 'Подарок от банановой кожуры на домике. Твоя, пока кожура на месте.', 'Un regalo della buccia di banana sulla casa sull\'albero. È tuo finché la buccia resta lì.'],
  nwl_tramp: ['Springy hopper', 'Прыгунок на пружинке', 'Saltarello a molla'],
  nwl_trampD: ['A gift from the trampoline on the treehouse. Yours while it stays there.', 'Подарок от батута на домике. Твой, пока батут на месте.', 'Un regalo del tappeto elastico sulla casa sull\'albero. È tuo finché il tappeto resta lì.'],
  nwl_tickle: ['Tickle-feather fly', 'Муха-щекоталка', 'Mosca solletico'],
  nwl_tickleD: ['A gift from the tickle feather on the treehouse. Yours while it stays there.', 'Подарок от пера-щекоталки на домике. Твоя, пока перо на месте.', 'Un regalo della piuma del solletico sulla casa sull\'albero. È tua finché la piuma resta lì.'],
  nwl_bubbler: ['Bubble popper', 'Пузырьковый поппер', 'Popper a bolle'],
  nwl_bubblerD: ['A gift from the bubble machine on the treehouse. Yours while it stays there.', 'Подарок от машинки для пузырей на домике. Твой, пока машинка на месте.', 'Un regalo della macchina delle bolle sulla casa sull\'albero. È tuo finché la macchina resta lì.'],
  nwl_cannon: ['Confetti spoon', 'Блесна-конфетти', 'Ondulante a coriandoli'],
  nwl_cannonD: ['A gift from the confetti cannon on the treehouse. Yours while it stays there.', 'Подарок от пушки с конфетти на домике. Твоя, пока пушка на месте.', 'Un regalo del cannone di coriandoli sulla casa sull\'albero. È tuo finché il cannone resta lì.'],
  nwl_disco: ['Disco spinner', 'Диско-вертушка', 'Rotante da discoteca'],
  nwl_discoD: ['A gift from the disco ball on the treehouse. Yours while it stays there.', 'Подарок от диско-шара на домике. Твоя, пока шар на месте.', 'Un regalo della palla da discoteca sulla casa sull\'albero. È tuo finché la palla resta lì.'],
});

// Rods: a power line (reach, and tiring a fish) and a finesse line (a wider safe band, a better hook hold).
defItem('rod0', ['Hazel rod', 'Ореховая удочка', 'Canna di nocciolo'], ['Your first rod. Bends nicely, forgives a lot.', 'Твоя первая удочка. Гнётся мягко, прощает многое.', 'La tua prima canna. Si piega bene e perdona molto.'],
  { kind: 'rod', tier: 0, cost: 0, pow: 2, fin: 2, art: { col: '#a4773f', w: .08, n: 0 } });
defItem('rodp1', ['Ash rod', 'Ясеневая удочка', 'Canna di frassino'], ['Casts further and tires a fish sooner.', 'Бросает дальше и быстрее утомляет рыбу.', 'Lancia più lontano e stanca prima il pesce.'],
  { kind: 'rod', tier: 1, cost: 60, pow: 4, fin: 2, art: { col: '#7a4e22', w: .1, n: 1 } });
defItem('rodf1', ['Reed wand', 'Камышовая удочка', 'Bacchetta di canna'], ['Light and soft: the hook holds better.', 'Лёгкая и мягкая: крючок держит лучше.', 'Leggera e morbida: l\'amo tiene meglio.'],
  { kind: 'rod', tier: 2, cost: 110, pow: 3, fin: 4, art: { col: '#7fc06a', w: .06, n: 1 } });
defItem('rodp2', ['Oak rod', 'Дубовая удочка', 'Canna di quercia'], ['Strong enough to pull a big fish out of the weeds.', 'У неё хватит сил вытащить большую рыбу из травы.', 'Abbastanza forte da tirare un pesce grosso fuori dalle alghe.'],
  { kind: 'rod', tier: 3, cost: 180, pow: 6, fin: 3, art: { col: '#5a3a1a', w: .11, n: 2 } });
defItem('rodf2', ['Heron wand', 'Цаплина удочка', 'Bacchetta dell\'airone'], ['Feels every touch. Wide striped band for tense fights.', 'Чувствует каждое касание. Широкая полосатая зона в трудной борьбе.', 'Sente ogni tocco. Ampia fascia a righe nelle lotte tese.'],
  { kind: 'rod', tier: 4, cost: 260, pow: 4, fin: 6, art: { col: '#9fb4c8', w: .06, n: 2 } });
defItem('rodp3', ['Storm rod', 'Штормовая удочка', 'Canna della tempesta'], ['Long casts into the wind. Made for the open sea.', 'Дальний заброс против ветра. Создана для моря.', 'Lanci lunghi contro vento. Fatta per il mare aperto.'],
  { kind: 'rod', tier: 5, cost: 500, pow: 8, fin: 4, art: { col: '#2c4a7a', w: .12, n: 3 } });
defItem('rodf3', ['Moth wand', 'Мотыльковая удочка', 'Bacchetta della falena'], ['Whisper-light. Hooks the shyest mouths.', 'Легче шёпота. Цепляет самых пугливых.', 'Leggera come un sussurro. Aggancia le bocche più timide.'],
  { kind: 'rod', tier: 6, cost: 1000, pow: 5, fin: 8, art: { col: '#d8d2f0', w: .055, n: 3 } });
defItem('rodp4', ['Abyss rod', 'Удочка бездны', 'Canna dell\'abisso'], ['The strongest rod there is. For fights that last minutes.', 'Самая сильная удочка. Для борьбы длиной в минуты.', 'La canna più forte che esista. Per lotte che durano minuti.'],
  { kind: 'rod', tier: 6, cost: 1000, pow: 10, fin: 5, art: { col: '#16323a', w: .13, n: 4 } });
defItem('rodf4', ['Bell wand', 'Колокольная удочка', 'Bacchetta della campana'], ['Feels a single finger-tap on the line.', 'Чувствует одно лёгкое касание лески.', 'Sente un solo tocco di dito sulla lenza.'],
  { kind: 'rod', tier: 7, cost: 2000, pow: 6, fin: 10, art: { col: '#efe6cf', w: .055, n: 4 } });

// Lines: thick and strong, or fine and weak. A fine line fools wary fish in clear water, and snaps sooner.
defItem('line0', ['Cotton line', 'Хлопковая леска', 'Lenza di cotone'], ['Plain and honest. Fine for sleepy water.', 'Простая и надёжная. Для сонной воды.', 'Semplice e onesta. Va bene per l\'acqua sonnolenta.'],
  { kind: 'line', tier: 0, cost: 0, str: 3, thin: 3, art: { col: '#f3ead2', w: .1 } });
defItem('lines1', ['Twine', 'Бечёвка', 'Spago'], ['Thick and strong. Fish can see it.', 'Толстая и крепкая. Рыба её видит.', 'Spesso e forte. I pesci lo vedono.'],
  { kind: 'line', tier: 1, cost: 35, str: 5, thin: 1, art: { col: '#c8a46a', w: .16 } });
defItem('linef1', ['Silk line', 'Шёлковая леска', 'Lenza di seta'], ['Fine and hard to see. Snaps sooner.', 'Тонкая и почти незаметная. Рвётся раньше.', 'Sottile e difficile da vedere. Si spezza prima.'],
  { kind: 'line', tier: 2, cost: 60, str: 3, thin: 5, art: { col: '#ffd9ec', w: .06 } });
defItem('lines2', ['Harbor braid', 'Портовая плетёнка', 'Treccia del porto'], ['Braided for big fish and rough boards.', 'Плетёная для крупной рыбы и шершавых досок.', 'Intrecciata per pesci grossi e assi ruvide.'],
  { kind: 'line', tier: 3, cost: 90, str: 6, thin: 2, art: { col: '#e8853a', w: .15 } });
defItem('linef2', ['Clear line', 'Прозрачная леска', 'Lenza trasparente'], ['Almost invisible in clear water.', 'В чистой воде её почти не видно.', 'Quasi invisibile nell\'acqua limpida.'],
  { kind: 'line', tier: 4, cost: 120, str: 4, thin: 7, art: { col: '#bfe9ff', w: .05 } });
defItem('lines3', ['Storm braid', 'Штормовая плетёнка', 'Treccia della tempesta'], ['Holds a sea fish in a gale.', 'Удержит морскую рыбу в шторм.', 'Tiene un pesce di mare nella burrasca.'],
  { kind: 'line', tier: 5, cost: 220, str: 8, thin: 3, art: { col: '#3a6fd0', w: .15 } });
defItem('linef3', ['Ghost line', 'Леска-призрак', 'Lenza fantasma'], ['So fine the wariest fish never see it.', 'Такая тонкая, что её не видит даже самая осторожная рыба.', 'Così sottile che i pesci più guardinghi non la vedono mai.'],
  { kind: 'line', tier: 6, cost: 450, str: 5, thin: 9, art: { col: '#e8f4f8', w: .04 } });
defItem('lines4', ['Sea cable', 'Морской трос', 'Cavo marino'], ['The strongest line. Thick as a bootlace.', 'Самая крепкая леска. Толстая, как шнурок.', 'La lenza più forte. Spessa come un laccio.'],
  { kind: 'line', tier: 6, cost: 450, str: 10, thin: 2, art: { col: '#2a2f3a', w: .19 } });
defItem('linef4', ['Spider silk', 'Паучий шёлк', 'Seta di ragno'], ['Fine as a whisper, and still surprisingly tough.', 'Тонкий, как шёпот, и всё же удивительно прочный.', 'Sottile come un sussurro, eppure sorprendentemente robusta.'],
  { kind: 'line', tier: 7, cost: 900, str: 6, thin: 10, art: { col: '#f6f1ff', w: .035 } });

// Reels: smoother drag (tension changes more slowly) and longer spools (metres of line a running fish can take).
defItem('reel0', ['Old reel', 'Старая катушка', 'Mulinello vecchio'], ['It clicks and it turns. That is enough for now.', 'Щёлкает и крутится. Пока этого хватит.', 'Fa clic e gira. Per ora basta.'],
  { kind: 'reel', tier: 0, cost: 0, drag: 2, spool: 60, art: { col: '#8a94a8' } });
defItem('reel1', ['Tin reel', 'Жестяная катушка', 'Mulinello di latta'], ['A little smoother, a little more line.', 'Чуть плавнее, чуть больше лески.', 'Un po\' più fluido, un po\' più di lenza.'],
  { kind: 'reel', tier: 1, cost: 45, drag: 3, spool: 80, art: { col: '#b9c4d8' } });
defItem('reel2', ['Brass reel', 'Латунная катушка', 'Mulinello d\'ottone'], ['Gives line gently when a fish runs.', 'Мягко отдаёт леску, когда рыба уходит.', 'Cede lenza con dolcezza quando il pesce scappa.'],
  { kind: 'reel', tier: 2, cost: 80, drag: 4, spool: 100, art: { col: '#d9a441' } });
defItem('reel3', ['Harbor reel', 'Портовая катушка', 'Mulinello del porto'], ['Holds enough line for a long run.', 'Хватит лески на долгий рывок.', 'Tiene abbastanza lenza per una lunga fuga.'],
  { kind: 'reel', tier: 3, cost: 120, drag: 5, spool: 140, art: { col: '#e8503a' } });
defItem('reel4', ['Frost reel', 'Морозная катушка', 'Mulinello del gelo'], ['Never sticks, not even on the ice.', 'Не заедает даже на льду.', 'Non si inceppa mai, nemmeno sul ghiaccio.'],
  { kind: 'reel', tier: 4, cost: 160, drag: 6, spool: 180, art: { col: '#7fd0ff' } });
defItem('reel5', ['Storm reel', 'Штормовая катушка', 'Mulinello della tempesta'], ['A deep spool and a drag like a sea anchor.', 'Глубокая шпуля и тормоз, как морской якорь.', 'Bobina profonda e frizione come un\'ancora.'],
  { kind: 'reel', tier: 5, cost: 300, drag: 8, spool: 260, art: { col: '#2c4a7a' } });
defItem('reel6', ['Deep reel', 'Глубинная катушка', 'Mulinello degli abissi'], ['So much line, a fish can swim for minutes.', 'Столько лески, что рыба может плыть минутами.', 'Così tanta lenza che un pesce può nuotare per minuti.'],
  { kind: 'reel', tier: 6, cost: 600, drag: 9, spool: 400, art: { col: '#16323a' } });
defItem('reel7', ['Bell reel', 'Колокольная катушка', 'Mulinello della campana'], ['Silent, smooth and endless.', 'Тихая, плавная и бесконечная.', 'Silenzioso, fluido e senza fine.'],
  { kind: 'reel', tier: 7, cost: 1200, drag: 10, spool: 500, art: { col: '#efe6cf' } });

// Lures: depth band, action and food decide who bites. Lit lures shine in dark water (some fish come to the light);
// glowing ones can be seen in black water. Packs give `pack` lures; a snapped line or a snag takes one.
function defLure(id, names, descs, tier, cost, pack, depth, act, food, art, more) {
  defItem(id, names, descs, Object.assign({ kind: 'lure', tier, cost, pack, depth, act, food, glow: false, lit: false, free: false, art }, more));
}
defLure('worm', ['Worm', 'Червяк', 'Verme'], ['Hangs still in mid water. Free, and never runs out.', 'Висит в толще воды. Бесплатный и никогда не кончается.', 'Resta fermo a mezz\'acqua. Gratis, e non finisce mai.'],
  0, 0, 0, 1, 0, 'worm', { s: 'worm', col: '#ff8fa3' }, { free: true });
defLure('dough', ['Dough ball', 'Хлебный шарик', 'Pallina di pane'], ['Floats on top. Sunfish adore it.', 'Плавает сверху. Солнечники его обожают.', 'Galleggia in superficie. I pesci sole la adorano.'],
  0, 6, 10, 0, 0, 'grain', { s: 'ball', col: '#f3d9a0' });
defLure('cricket', ['Cricket', 'Сверчок', 'Grillo'], ['Kicks on the surface. Hungry fish look up.', 'Дёргается на поверхности. Голодная рыба смотрит вверх.', 'Scalcia in superficie. I pesci affamati guardano in su.'],
  0, 10, 8, 0, 1, 'bug', { s: 'bug', col: '#5a7a2a' });
defLure('corn', ['Sweet corn', 'Сладкая кукуруза', 'Mais dolce'], ['Sinks and sits on the bottom. Carp come to graze.', 'Тонет и лежит на дне. Карпы приплывают пастись.', 'Affonda e resta sul fondo. Le carpe vengono a brucare.'],
  1, 12, 10, 2, 0, 'grain', { s: 'corn', col: '#ffd24a' });
defLure('crawler', ['Nightcrawler', 'Выползок', 'Lombricone'], ['A fat worm that lies deep and still.', 'Толстый червь лежит глубоко и тихо.', 'Un grosso verme che resta fermo sul fondo.'],
  1, 15, 8, 2, 0, 'worm', { s: 'worm', col: '#b0526a' });
defLure('nymph', ['Nymph', 'Нимфа', 'Ninfa'], ['A little bug that twitches in mid water. Trout love it.', 'Маленький жучок, дёргается в толще воды. Форель его любит.', 'Un insettino che guizza a mezz\'acqua. Le trote lo amano.'],
  1, 20, 6, 1, 1, 'bug', { s: 'nymph', col: '#8a6a3a' });
defLure('popper', ['Frog popper', 'Поппер-лягушка', 'Popper a rana'], ['Darts and splashes on top. Wakes up lazy fish.', 'Скачет и плещет сверху. Будит ленивую рыбу.', 'Scatta e schizza in superficie. Sveglia i pesci pigri.'],
  1, 30, 4, 0, 2, 'bug', { s: 'popper', col: '#5cc46e' });
defLure('spinner', ['Spinner', 'Вертушка', 'Cucchiaino rotante'], ['A spinning blade flashes as it darts by.', 'Крутящийся лепесток блестит на бегу.', 'Una paletta che gira e luccica mentre sfreccia.'],
  1, 30, 4, 1, 2, 'shiny', { s: 'spinner', col: '#dfe6f5' });
defLure('minnow', ['Minnow plug', 'Воблер-малёк', 'Minnow'], ['Wobbles like a little fish. Hunters follow.', 'Виляет, как малёк. Хищники плывут следом.', 'Ondeggia come un pesciolino. I predatori lo seguono.'],
  2, 45, 4, 1, 1, 'minnow', { s: 'plug', col: '#7fb6f5' });
defLure('spoon', ['Silver spoon', 'Серебряная блесна', 'Ondulante d\'argento'], ['Flutters and darts down deep.', 'Порхает и мечется в глубине.', 'Sfarfalla e scatta in profondità.'],
  2, 50, 4, 2, 2, 'shiny', { s: 'spoon', col: '#dfe6f5' });
defLure('shrimp', ['Shrimp', 'Креветка', 'Gamberetto'], ['Rests on the bottom. Pier fish cannot resist.', 'Лежит на дне. Рыба у причала не устоит.', 'Riposa sul fondo. I pesci del molo non resistono.'],
  2, 35, 6, 2, 0, 'shrimp', { s: 'shrimp', col: '#ff9a7a' });
defLure('firefly', ['Firefly fly', 'Муха-светлячок', 'Mosca lucciola'], ['A lit fly that twitches on dark water.', 'Светящаяся муха, дёргается на тёмной воде.', 'Una mosca accesa che guizza sull\'acqua scura.'],
  3, 70, 4, 0, 1, 'bug', { s: 'bug', col: '#3a3a2a' }, { lit: true });
defLure('jig', ['Crayfish jig', 'Джиг-рак', 'Jig gambero'], ['Hops along the bottom like a crayfish.', 'Прыгает по дну, как рак.', 'Saltella sul fondo come un gambero di fiume.'],
  3, 75, 4, 2, 1, 'shrimp', { s: 'jig', col: '#c8613a' });
defLure('lampspin', ['Lantern spinner', 'Вертушка-фонарик', 'Rotante lanterna'], ['A spinner with a tiny lamp. Bright and fast.', 'Вертушка с крошечным фонариком. Яркая и быстрая.', 'Un rotante con una lanternina. Luminoso e veloce.'],
  3, 90, 3, 1, 2, 'shiny', { s: 'spinner', col: '#ffd86b' }, { lit: true });
defLure('glowworm', ['Glow worm', 'Светящийся червяк', 'Verme luminoso'], ['Glows softly in deep, dark water.', 'Мягко светится в тёмной глубине.', 'Brilla piano nell\'acqua scura e profonda.'],
  4, 110, 5, 2, 0, 'glow', { s: 'worm', col: '#9dffb0' }, { glow: true });
defLure('icejig', ['Ice jig', 'Ледяная мормышка', 'Jig da ghiaccio'], ['Jiggle it under the ice. Flashes like frost.', 'Покачивай подо льдом. Блестит, как иней.', 'Fallo saltellare sotto il ghiaccio. Luccica come brina.'],
  4, 130, 3, 2, 1, 'shiny', { s: 'jig', col: '#bfe9ff' });
defLure('crank', ['Deep diver', 'Глубинный воблер', 'Minnow da fondo'], ['A plug with a big lip that dives and darts.', 'Воблер с большой лопаткой: ныряет и мечется.', 'Un minnow con la paletta grande che si tuffa e scatta.'],
  4, 140, 3, 2, 2, 'minnow', { s: 'plug', col: '#e8503a' });
defLure('stormmin', ['Storm minnow', 'Штормовой малёк', 'Pesciolino della tempesta'], ['Darts through rough sea like a frightened fish.', 'Мчится сквозь волны, как испуганная рыбка.', 'Sfreccia nel mare mosso come un pesce spaventato.'],
  5, 220, 3, 1, 2, 'minnow', { s: 'plug', col: '#c9d6ea' });
defLure('squid', ['Squid', 'Кальмар', 'Calamaro'], ['Jets about in the deep. Big sea fish hunt it.', 'Носится в глубине. Большая морская рыба на него охотится.', 'Schizza qua e là nel profondo. I grandi pesci di mare gli danno la caccia.'],
  5, 240, 3, 2, 2, 'shrimp', { s: 'squid', col: '#ffb8c8' });
defLure('jelly', ['Moon jelly', 'Лунная медуза', 'Medusa lunare'], ['Pulses and glows in black water.', 'Пульсирует и светится в чёрной воде.', 'Pulsa e brilla nell\'acqua nera.'],
  6, 400, 3, 2, 1, 'glow', { s: 'jelly', col: '#b8c8ff' }, { glow: true });
defLure('abyss', ['Abyss lantern', 'Фонарь бездны', 'Lanterna dell\'abisso'], ['A lit, glowing bulb that hangs still in the dark.', 'Светящийся фонарик неподвижно висит в темноте.', 'Un bulbo acceso e luminoso che resta fermo nel buio.'],
  6, 480, 3, 1, 0, 'glow', { s: 'lantern', col: '#7fffd4' }, { glow: true, lit: true });
// The three top lures: the magpie only makes them for a Chief who has earned the trophy named in `craft`.
defLure('aurorajig', ['Aurora jig', 'Мормышка «Сияние»', 'Jig dell\'aurora'], ['Carries all the colours of the northern sky.', 'Несёт все цвета северного неба.', 'Porta tutti i colori del cielo del nord.'],
  4, 300, 3, 2, 1, 'shiny', { s: 'jig', col: '#a98be8', rainbow: true }, { glow: true, craft: 'firstLegend' });
defLure('squallspoon', ['Squall spoon', 'Шквальная блесна', 'Ondulante della burrasca'], ['A lit spoon that flashes like lightning.', 'Светящаяся блесна сверкает, как молния.', 'Un ondulante acceso che lampeggia come un fulmine.'],
  5, 500, 3, 1, 2, 'shiny', { s: 'spoon', col: '#ffe36b' }, { lit: true, craft: 'stormKeeper' });
defLure('candle', ['Chapel candle', 'Свеча часовни', 'Candela della cappella'], ['A small light that sinks and waits. Patience.', 'Маленький огонёк тонет и ждёт. Терпение.', 'Una piccola luce che affonda e aspetta. Pazienza.'],
  7, 900, 2, 2, 0, 'glow', { s: 'candle', col: '#fff3c4' }, { glow: true, lit: true, craft: 'bellTolls' });
// Lures from the Night: every silly gadget that stands on the Night Watch's treehouse (nwSave.items) puts its own novelty lure
// in the tackle box, free and never used up, for as long as it stands there. Each fishes exactly like the shop lure it copies
// (`like`), at tier 0 and without a price: free things never get a buy button, so none of them is for sale.
const NWL = [['peel', 'spinner', '#ffd93b'], ['tramp', 'jig', '#58a6ff'], ['tickle', 'nymph', '#ff9ecb'], ['bubbler', 'popper', '#7fc8ff'], ['cannon', 'spoon', '#a47be8'], ['disco', 'lampspin', '#dfe6f5']]
  .map(([g, like, col]) => { const o = ITEMS[like]; defLure('nwl_' + g, L['nwl_' + g], L['nwl_' + g + 'D'], 0, 0, 0, o.depth, o.act, o.food, { s: o.art.s, col }, { free: true, glow: o.glow, lit: o.lit, nw: g, like }); return ITEMS['nwl_' + g]; });
// Puts in the lures whose gadget is on the tree and takes out the others: once at load, before the boot repair (which ties the
// worm back on when the rig's lure has gone), and again by a test. The other game's save may hold anything: only `t` is read.
function nwlSync() {
  const on = new Set((Array.isArray(nwSave && nwSave.items) ? nwSave.items : []).map(x => x && x.t));
  for (const it of NWL) if (on.has(it.nw)) ITEMS[it.id] = it; else delete ITEMS[it.id];
}
nwlSync();

// Expedition gear. The shop only offers a thing once it can be used (see `offered` in 80-hub.js).
defItem('boat', ['The boat', 'Лодка', 'La barca'], ['Takes you out to Stormbreak Reef and the Lantern Deep.', 'Отвезёт тебя к Штормовому рифу и в Фонарную бездну.', 'Ti porta alla Scogliera delle Tempeste e all\'Abisso delle Lanterne.'],
  { kind: 'gear', fx: 'boat', tier: 2, cost: 750 });
defItem('iceline', ['Insulated line', 'Утеплённая леска', 'Lenza antigelo'], ['Stays soft on the ice: a wider striped band at the Frozen Reach.', 'На льду остаётся мягкой: шире полосатая зона на Ледяном плёсе.', 'Resta morbida sul ghiaccio: fascia a righe più ampia alla Distesa Ghiacciata.'],
  { kind: 'gear', fx: 'iceline', tier: 3, cost: 180 });
defItem('lantern', ['Owl Lantern', 'Совиный фонарь', 'Lanterna del Gufo'], ['Shows the outlines of shadows in dark water.', 'Показывает очертания теней в тёмной воде.', 'Mostra i contorni delle ombre nell\'acqua scura.'],
  { kind: 'gear', fx: 'lantern', tier: 2, cost: 150 });
defItem('snagguard', ['Snag guard', 'Защита от коряг', 'Paraincagli'], ['A wire guard: snags keep your lure less often.', 'Проволочная защита: коряги реже забирают приманку.', 'Una protezione di filo: l\'esca si incaglia meno spesso.'],
  { kind: 'gear', fx: 'snagguard', tier: 3, cost: 200 });
defItem('bignet', ['Big net', 'Большой подсак', 'Guadino grande'], ['A wider hoop: more time to net your fish.', 'Обруч шире: больше времени, чтобы подсачить рыбу.', 'Un cerchio più largo: più tempo per guadinare il pesce.'],
  { kind: 'gear', fx: 'bignet', tier: 2, cost: 120 });
// One map sketch per water: it marks the drop-offs and the hot spots there.
[25, 45, 80, 80, 150, 150, 300, 600, 1200].forEach((cost, i) => {
  const a = AREAS[i].id;
  defItem('sk_' + a, [0, 1, 2].map(l => [`Map sketch: ${L['a_' + a][l]}`, `Набросок карты: ${L['a_' + a][l]}`, `Mappa: ${L['a_' + a][l]}`][l]),
    ['Marks the drop-offs and the hot spots in this water.', 'Показывает, где дно уходит вглубь и где лучше клюёт.', 'Mostra dove il fondo scende e dove si pesca meglio.'],
    { kind: 'gear', fx: 'sketch', area: a, tier: 0, cost });
});

// Comfort goods: the five hats of WEAR, and five boat paints (colour 0 is the plain wooden boat).
[['party', 0, 40, 'Party hat', 'Праздничный колпак', 'Cappello da festa'], ['knit', 0, 70, 'Knitted hat', 'Вязаная шапка', 'Berretto di lana'],
  ['chef', 1, 120, 'Chef\'s hat', 'Поварской колпак', 'Cappello da cuoco'], ['wizard', 2, 250, 'Wizard hat', 'Шляпа волшебника', 'Cappello da mago'],
  ['crown', 4, 900, 'Crown', 'Корона', 'Corona']].forEach(([w, tier, cost, ...names]) =>
  defItem('hat_' + w, names, ['A hat for the Chief. Looks grand on the water.', 'Шляпа для командира. На воде смотрится отлично.', 'Un cappello per il Capo. Sull\'acqua fa un figurone.'],
    { kind: 'hat', wear: w, tier, cost }));
// Boat paints: the hull colours are MAP_PAINT[col] (55-map.js); colour 0 is the free plain wooden hull.
// The name in the shop row is the second cue beside the colour.
[['Lighthouse red', 'Маячный красный', 'Rosso faro', 80], ['Harbor blue', 'Портовый синий', 'Blu porto', 100], ['Moss green', 'Моховой зелёный', 'Verde muschio', 120],
  ['Sunrise yellow', 'Рассветный жёлтый', 'Giallo alba', 160], ['Night violet', 'Ночной фиолетовый', 'Viola notte', 250]].forEach(([en, ru, it, cost], i) =>
  defItem('paint' + (i + 1), [en, ru, it], ['A fresh coat of paint for your boat.', 'Свежая краска для твоей лодки.', 'Una mano di vernice fresca per la tua barca.'],
    { kind: 'paint', col: i + 1, tier: 0, cost }));

// ----- The icon `item`: ic('item:' + id, px) draws any good, recognisable at 36 px -----
// A small boat hull in a MAP_PAINT colour, with a pale rim so a dark hull still shows on a dark panel.
const boatHull = (c, col, y = 0) => { poly(c, [-.95, y - .3, .95, y - .3, .62, y + .32, -.62, y + .32], col); line(c, [-.95, y - .3, .95, y - .3], 'rgba(255,255,255,.7)', .08); };
// A small hook under a lure: shank down from (x, y), bend, point.
const lureHook = (c, x, y, s = 1) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + .32 * s); c.arc(x - .13 * s, y + .32 * s, .13 * s, 0, Math.PI * .95); c.strokeStyle = '#8a94a8'; c.lineWidth = .07; c.stroke(); };
const LURE_SHAPE = {
  worm: (c, a) => { c.beginPath(); for (let i = 0; i <= 12; i++) { const k = i / 12; c.lineTo(-.75 + k * 1.5, Math.sin(k * 7) * .28 - .1); } c.strokeStyle = a.col; c.lineWidth = .3; c.stroke(); for (let i = 1; i < 6; i++) { const k = i / 6; circ(c, -.75 + k * 1.5, Math.sin(k * 7) * .28 - .1, .06, 'rgba(0,0,0,.25)'); } lureHook(c, .1, .05); },
  ball: (c, a) => { circ(c, 0, -.1, .55, a.col); circ(c, -.18, -.3, .14, 'rgba(255,255,255,.6)'); circ(c, .2, .05, .07, '#c99a50'); circ(c, -.1, .15, .06, '#c99a50'); lureHook(c, 0, .4); },
  corn: (c, a) => { for (const [x, y] of [[-.35, -.15], [.3, -.25], [0, .2]]) { ell(c, x, y, .3, .36, a.col); ell(c, x - .08, y - .1, .08, .12, 'rgba(255,255,255,.7)'); } lureHook(c, 0, .5); },
  bug: (c, a) => { ell(c, .15, 0, .55, .3, a.col); circ(c, -.45, -.05, .22, a.col); line(c, [-.6, -.15, -.95, -.6], a.col, .06); line(c, [-.55, -.2, -.75, -.75], a.col, .06); for (const x of [-.1, .2, .45]) line(c, [x, .2, x - .2, .55], '#2a2a1a', .06); line(c, [.3, -.1, .9, -.55, .7, .15], '#2a2a1a', .07); ell(c, .15, -.28, .35, .1, 'rgba(255,255,255,.45)', -.2); },
  nymph: (c, a) => { for (let i = 0; i < 4; i++) ell(c, -.45 + i * .3, 0, .2, .25 - i * .02, i % 2 ? a.col : '#6a4a2a'); line(c, [.5, 0, .9, -.15], a.col, .07); line(c, [.5, 0, .9, .15], a.col, .07); line(c, [-.6, 0, -.95, -.3], '#d9c48f', .08); lureHook(c, -.2, .2); },
  popper: (c, a) => { poly(c, [-.75, -.35, .45, -.25, .65, 0, .45, .25, -.75, .35], a.col); ell(c, -.75, 0, .12, .35, '#2e7a3a'); circ(c, .2, -.08, .1, '#fff'); circ(c, .22, -.08, .05, '#222'); for (const x of [-.35, .05]) circ(c, x, .05, .07, '#2e7a3a'); lureHook(c, -.2, .32); line(c, [.65, 0, .9, 0], '#8a94a8', .06); },
  spinner: (c, a) => { line(c, [-.9, 0, .9, 0], '#8a94a8', .06); ell(c, -.25, -.28, .32, .2, a.col, -.5); c.lineWidth = .05; c.strokeStyle = '#8a94a8'; c.stroke(); for (let i = 0; i < 3; i++) circ(c, .1 + i * .18, 0, .1, i === 1 ? '#e8503a' : '#ffd24a'); poly(c, [.55, -.2, .9, 0, .55, .2], '#e8503a'); lureHook(c, .7, .1, .9); },
  plug: (c, a) => { ell(c, 0, 0, .7, .3, a.col); ell(c, 0, .1, .6, .16, 'rgba(255,255,255,.45)'); poly(c, [-.68, .05, -.95, .35, -.8, .45, -.55, .2], 'rgba(220,240,255,.8)'); circ(c, -.4, -.06, .09, '#fff'); circ(c, -.42, -.06, .045, '#222'); poly(c, [.62, 0, .9, -.22, .9, .22], a.col); line(c, [-.2, -.15, .4, -.15], 'rgba(0,0,0,.25)', .05); lureHook(c, -.1, .28, .8); lureHook(c, .4, .28, .8); },
  spoon: (c, a) => { c.save(); c.rotate(-.4); ell(c, .1, 0, .75, .38, a.col); ell(c, .2, -.1, .4, .14, 'rgba(255,255,255,.8)'); c.lineWidth = .06; c.strokeStyle = '#8a94a8'; c.beginPath(); c.ellipse(.1, 0, .75, .38, 0, 0, TAU); c.stroke(); line(c, [-.6, 0, -.75, 0], '#8a94a8', .06); c.restore(); lureHook(c, .62, .02, .9); },
  shrimp: (c, a) => { c.beginPath(); c.arc(0, 0, .55, Math.PI * .9, Math.PI * 2.1); c.strokeStyle = a.col; c.lineWidth = .32; c.stroke(); for (let i = 0; i < 4; i++) { const g = Math.PI * (1 + i * .25); line(c, [Math.cos(g) * .4, Math.sin(g) * .4, Math.cos(g) * .7, Math.sin(g) * .7], 'rgba(150,40,20,.6)', .05); } line(c, [.5, -.15, .95, -.55], a.col, .05); line(c, [.5, -.1, .95, -.35], a.col, .05); circ(c, .55, -.1, .06, '#222'); poly(c, [-.6, .1, -.95, .3, -.85, -.05], a.col); lureHook(c, 0, .3); },
  jig: (c, a) => { circ(c, -.45, -.15, .3, a.rainbow ? '#ffd24a' : '#9aa0aa'); circ(c, -.5, -.2, .08, '#fff'); circ(c, -.5, -.2, .04, '#222'); const cols = a.rainbow ? ['#e8503a', '#ffd24a', '#6fdc95', '#58a6ff', '#a98be8'] : [a.col, a.col, a.col]; cols.forEach((col, i) => line(c, [-.2, -.15 + (i - cols.length / 2) * .06, .9, -.25 + (i - cols.length / 2) * .18], col, .12)); lureHook(c, -.45, .1); },
  squid: (c, a) => { poly(c, [.95, 0, .3, -.3, .3, .3], a.col); ell(c, .05, 0, .5, .26, a.col); for (let i = 0; i < 4; i++) line(c, [-.4, -.12 + i * .08, -.95, -.35 + i * .23], a.col, .07); circ(c, -.2, -.06, .07, '#222'); lureHook(c, -.1, .22); },
  jelly: (c, a) => { c.beginPath(); c.arc(0, -.1, .6, Math.PI, 0); c.quadraticCurveTo(0, .1, -.6, -.1); c.fillStyle = a.col; c.fill(); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-.4 + i * .27, 0); c.quadraticCurveTo(-.5 + i * .27, .4, -.35 + i * .27, .85); c.strokeStyle = a.col; c.lineWidth = .06; c.stroke(); } circ(c, -.15, -.35, .1, 'rgba(255,255,255,.8)'); },
  lantern: (c, a) => { line(c, [0, -.95, 0, -.55], '#8a94a8', .06); ell(c, 0, -.05, .42, .5, a.col); ell(c, 0, -.05, .2, .26, '#fff'); rr(c, -.25, .42, .5, .14, .05); c.fillStyle = '#16323a'; c.fill(); lureHook(c, 0, .56, .9); },
  candle: (c, a) => { rr(c, -.25, -.25, .5, .9, .08); c.fillStyle = a.col; c.fill(); ell(c, 0, -.48, .13, .22, '#ff9a3a'); ell(c, 0, -.44, .06, .11, '#fff3c4'); line(c, [-.35, .65, .35, .65], '#8a94a8', .08); lureHook(c, 0, .65, .8); },
};
// What each gadget adds to its lure's picture, then the sticker every lure from the Night carries: a gold treehouse on a night-blue dot.
const NWL_ART = {
  peel: c => { ell(c, -.25, -.28, .2, .07, '#fff3a8', -.5); line(c, [.03, -.43, .13, -.56], '#8a6a1a', .09); },
  tramp: c => line(c, [-.24, .06, -.1, .4, .04, .12, .18, .44, .32, .16, .46, .48], '#dfe6f5', .07),
  tickle: c => { c.save(); c.translate(.62, -.48); c.rotate(.9); ell(c, 0, 0, .15, .42, '#ff9ecb'); line(c, [0, -.4, 0, .5], '#d8508a', .05); c.restore(); },
  bubbler: c => { c.lineWidth = .06; c.strokeStyle = '#fff'; for (const [x, y, r] of [[.45, -.6, .16], [.8, -.82, .1], [.12, -.8, .08]]) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); } },
  cannon: c => [['#ff8a7a', .45, -.72], ['#ffd24a', .85, -.62], ['#6fdc95', .1, -.85], ['#58a6ff', -.3, .7], ['#ff9ecb', .9, .6]].forEach(([col, x, y], i) => { c.save(); c.translate(x, y); c.rotate(i); c.fillStyle = col; c.fillRect(-.08, -.08, .16, .16); c.restore(); }),
  disco: c => { for (const [x, y, col] of [[-.38, -.2, '#ff8a7a'], [-.25, -.28, '#ffd24a'], [-.12, -.36, '#58a6ff']]) circ(c, x, y, .05, col); for (const [x, y, r] of [[-.05, -.72, .17], [-.6, .5, .13]]) { starPath(c, x, y, r, r * .3, 4); c.fillStyle = '#fff'; c.fill(); } },
};
function nwlArt(c, g) {
  NWL_ART[g](c);
  circ(c, -.72, -.72, .27, '#1b2a6b'); c.lineWidth = .06; c.strokeStyle = '#ffd86b'; c.stroke();
  poly(c, [-.85, -.6, -.85, -.73, -.72, -.86, -.59, -.73, -.59, -.6], '#ffd86b');
}
const GOODS_ART = {
  rod: (c, it) => {
    const a = it.art;
    c.save(); c.rotate(-Math.PI / 4);
    poly(c, [-.55, -a.w, 1.25, -.02, 1.25, .02, -.55, a.w], a.col);                  // the blank: thick for power, thin for finesse
    line(c, [-.55, -a.w * .4, 1.2, -.01], 'rgba(255,255,255,.35)', .03);
    rr(c, -1.25, -.13, .72, .26, .11); c.fillStyle = '#c8955a'; c.fill();            // cork grip
    line(c, [-1.1, -.13, -1.1, .13], '#9a6a3a', .04); line(c, [-.85, -.13, -.85, .13], '#9a6a3a', .04);
    rr(c, -.62, -.16, .14, .32, .04); c.fillStyle = '#5a6478'; c.fill();             // reel seat
    for (let i = 0; i < a.n; i++) rr(c, .05 + i * .26, -.075, .08, .15, .02), c.fillStyle = '#ffd24a', c.fill();   // gold wraps: one per step
    for (const x of [.3, .75, 1.15]) { c.beginPath(); c.arc(x, -.09, .06, 0, TAU); c.lineWidth = .035; c.strokeStyle = '#dfe6f5'; c.stroke(); }
    c.restore();
  },
  line: (c, it) => {
    const a = it.art;
    rr(c, -.75, -.7, .2, 1.4, .06); c.fillStyle = '#7a4e22'; c.fill(); rr(c, .55, -.7, .2, 1.4, .06); c.fill();   // spool flanges
    rr(c, -.56, -.48, 1.12, .96, .1); c.fillStyle = '#3a2a1a'; c.fill();
    const n = Math.max(3, Math.round(.9 / (a.w * 1.15)));
    for (let i = 0; i < n; i++) line(c, [-.52, -.42 + (i + .5) * .84 / n, .52, -.42 + (i + .5) * .84 / n], a.col, a.w);   // wound line: the thickness shows
    c.beginPath(); c.moveTo(.5, .4); c.quadraticCurveTo(.95, .55, .7, .95); c.strokeStyle = a.col; c.lineWidth = a.w; c.stroke();
  },
  reel: (c, it) => {
    const a = it.art, r = .45 + clamp(it.spool / 500, 0, 1) * .4;                         // a longer spool is a bigger reel
    rr(c, -.25, r - .05, .5, .22, .06); c.fillStyle = '#5a6478'; c.fill();              // foot
    circ(c, -.05, 0, r, a.col); circ(c, -.05, 0, r * .62, 'rgba(0,0,0,.28)'); circ(c, -.05, 0, r * .25, '#dfe6f5');
    for (let i = 0; i < Math.round(it.drag / 2); i++) { const g = -Math.PI / 2 + i * .45; circ(c, -.05 + Math.cos(g) * r * .82, Math.sin(g) * r * .82, .05, '#fff'); }   // drag dots
    line(c, [-.05, 0, .55, -.45], '#dfe6f5', .1); ell(c, .62, -.5, .12, .18, '#c8955a');   // handle and knob
  },
  lure: (c, it) => {
    const a = it.art;
    if (it.glow) glow(c, 0, 0, 1, '170,255,220', .55);
    if (it.lit) glow(c, 0, 0, 1, '255,216,107', .6);
    (LURE_SHAPE[a.s] || LURE_SHAPE.ball)(c, a);
    if (it.lit && a.s !== 'candle' && a.s !== 'lantern') { circ(c, .62, -.62, .2, '#fff3c4'); circ(c, .62, -.62, .1, '#ffb02e'); }   // the little lamp of a lit lure
    if (it.nw) nwlArt(c, it.nw);
  },
  gear: (c, it) => {
    const fx = it.fx;
    if (fx === 'boat') {
      line(c, [0, .3, 0, -.9], '#7a4e22', .1); poly(c, [.08, -.85, .08, .15, .75, .15], '#fff3dc'); poly(c, [-.08, -.6, -.08, .15, -.6, .15], '#ff8a7a');
      boatHull(c, MAP_PAINT[S.look.boat] || MAP_PAINT[0], .6);
    } else if (fx === 'iceline') {
      GOODS_ART.line(c, { art: { col: '#bfe9ff', w: .1 } });
      c.save(); c.translate(.55, -.55); for (let i = 0; i < 3; i++) { c.rotate(Math.PI / 3); line(c, [-.32, 0, .32, 0], '#fff', .09); } circ(c, 0, 0, .08, '#7fd0ff'); c.restore();
    } else if (fx === 'lantern') {
      glow(c, 0, .1, 1, '255,216,107', .7);
      rr(c, -.45, -.45, .9, 1.1, .2); c.fillStyle = '#7a4e28'; c.fill();                     // the owl-shaped lantern: ears, eyes and a warm window
      poly(c, [-.45, -.4, -.4, -.8, -.15, -.45], '#7a4e28'); poly(c, [.45, -.4, .4, -.8, .15, -.45], '#7a4e28');
      circ(c, -.2, -.2, .15, '#ffe9a3'); circ(c, .2, -.2, .15, '#ffe9a3'); circ(c, -.2, -.2, .06, '#2a1c05'); circ(c, .2, -.2, .06, '#2a1c05');
      rr(c, -.25, .05, .5, .45, .08); c.fillStyle = '#ffd86b'; c.fill(); ell(c, 0, .3, .08, .13, '#ff9a3a');
      poly(c, [-.08, -.05, .08, -.05, 0, .06], '#ffb02e');
    } else if (fx === 'snagguard') {
      c.beginPath(); c.moveTo(-.2, -.85); c.lineTo(-.2, .35); c.arc(.15, .35, .35, Math.PI, 0, true); c.lineTo(.5, .05); c.strokeStyle = '#b9c4d8'; c.lineWidth = .14; c.stroke();
      poly(c, [.5, -.05, .62, .2, .38, .2], '#b9c4d8');
      c.beginPath(); c.moveTo(-.2, -.6); c.quadraticCurveTo(.9, -.5, .55, .1); c.strokeStyle = '#ffd24a'; c.lineWidth = .08; c.stroke();   // the wire guard over the point
      c.beginPath(); c.moveTo(-.95, .6); c.quadraticCurveTo(-.6, .2, -.35, .75); c.quadraticCurveTo(-.1, .3, .1, .85); c.strokeStyle = '#7a4e22'; c.lineWidth = .1; c.stroke();
    } else if (fx === 'bignet') {
      line(c, [.35, .35, .95, .95], '#c8955a', .14);
      c.save(); c.beginPath(); c.ellipse(-.2, -.2, .7, .62, -.6, 0, TAU); c.clip();
      for (let i = -6; i <= 6; i++) { line(c, [-1, i * .17 - .2, 1, i * .17 + .4], 'rgba(255,255,255,.7)', .04); line(c, [-1, i * .17 + .4, 1, i * .17 - .4], 'rgba(255,255,255,.7)', .04); }
      c.restore(); c.beginPath(); c.ellipse(-.2, -.2, .7, .62, -.6, 0, TAU); c.strokeStyle = '#8a94a8'; c.lineWidth = .12; c.stroke();
    } else {   // a map sketch: rolled paper, a dashed path and a cross on the hot spot, tinted by the water's tier
      const tier = AREA[it.area] ? AREA[it.area].tier : 1;
      rr(c, -.85, -.65, 1.7, 1.3, .1); c.fillStyle = '#fff3d6'; c.fill(); c.lineWidth = .06; c.strokeStyle = '#b98a4a'; c.stroke();
      ell(c, .15, .1, .5, .35, ['#7fd0ff', '#7fd0ff', '#58a6ff', '#58a6ff', '#4a7aa0', '#4a7aa0', '#2c4a7a', '#16323a', '#3a3a4a'][tier]);
      c.setLineDash([.12, .1]); line(c, [-.7, .45, -.4, .1, -.5, -.3, -.2, -.45], '#7a4e22', .07); c.setLineDash([]);
      line(c, [.05, -.05, .3, .2], '#e8503a', .1); line(c, [.3, -.05, .05, .2], '#e8503a', .1);
      ell(c, -.85, 0, .12, .66, '#e8d2a4'); ell(c, .85, 0, .12, .66, '#e8d2a4');
    }
  },
  hat: (c, it) => { if (WEAR[it.wear]) wearOn(c, it.wear, 0, it.wear === 'knit' ? .4 : .62, it.wear === 'crown' ? .75 : .62); },
  paint: (c, it) => {
    boatHull(c, MAP_PAINT[it.col] || MAP_PAINT[0], .3);
    rr(c, .2, -.95, .55, .6, .08); c.fillStyle = '#dfe6f5'; c.fill(); rr(c, .2, -.95, .55, .22, .06); c.fillStyle = MAP_PAINT[it.col] || MAP_PAINT[0]; c.fill();   // the paint pot
    c.beginPath(); c.arc(.475, -.95, .2, Math.PI, 0); c.strokeStyle = '#8a94a8'; c.lineWidth = .06; c.stroke();
    c.save(); c.translate(-.4, -.55); c.rotate(-.7); rr(c, -.05, -.4, .1, .5, .03); c.fillStyle = '#c8955a'; c.fill(); rr(c, -.09, .05, .18, .25, .05); c.fillStyle = MAP_PAINT[it.col] || MAP_PAINT[0]; c.fill(); c.restore();   // a brush
  },
};
ICON.item = (c, id) => { const it = ITEMS[id]; if (it && GOODS_ART[it.kind]) GOODS_ART[it.kind](c, it); };
