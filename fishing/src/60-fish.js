// ---------- The fish: 85 species in nine waters, each water a small world of its own ----------
// Every species is written with `fishDef(area, id, names, notes, stats, extra)`, which hands the contract's props to defFish.
// stats, in this order: [rar, minGrams, maxGrams, size, depth, act, food, move, bite, fakes, stam, pull, speed, jump, dive, pay]
// extra: { when, zone, tricks, art }. `rar` 5 is a Legendary.
// Each species wants one (depth, act, food) setting that a lure in the shop really has, at a shop tier the water allows.
// `art` is read only by drawFish (62-fishart.js):
//   b: body 'oval' | 'long' | 'deep' | 'round' | 'flat' (flatfish) | 'ray' | 'eel' | 'whisk' (catfish) | 'torpedo' | 'pike'
//   h: body height / length (each body has its own default), tl: tail 'fork' | 'round' | 'fan' | 'moon' | 'square' | 'point' | 'whip'
//   df: dorsal fin 'low' | 'high' | 'round' | 'spiny' | 'sail' | 'long' | 'none'
//   c: [back, belly, fins], pat: 'spots' | 'bars' | 'stripe' | 'mottle' | 'dots' | 'patch' | 'none', pc: pattern colour, ec: eye colour
//   mk: marks, any of 'eye' (big eye) 'whisk' 'beard' 'crown' 'jaw' (under-bite) 'snout' (a beak) 'lantern' 'lures' (stolen lit lures)
//       'glow' 'jewel' 'blind' 'glass' (a clear head) 'veil' (long trailing fins) 'pearl' (shining dots) 'finlets' 'stripe2' (side stripe) 'scars'
//   gl: glow colour as 'r,g,b'
function fishDef(area, id, names, notes, s, x = {}) {
  const [rar, w0, w1, size, depth, act, food, move, bite, fakes, stam, pull, speed, jump, dive, pay] = s;
  defFish(area, id, names, notes, Object.assign({ legend: rar === 5, rar, w: [w0, w1], size, depth, act, food, move, bite, fakes,
    when: null, zone: null, stam, pull, speed, jump, dive, tricks: [], pay }, x));
}

// ----- Tier 1: Sunnybrook Pond. Golden, sleepy, every fish takes a worm. -----
fishDef('pond', 'sunny', ['Buttercup Sunfish', 'Солнечник-лютик', 'Pesce sole Ranuncolo'],
  ['It naps under the lily pads and bites anything that wiggles.', 'Дремлет под кувшинками и хватает всё, что шевелится.', 'Sonnecchia sotto le ninfee e morde tutto ciò che si muove.'],
  [1, 80, 260, .6, 1, 0, 'worm', 'school', 'nibble', 0, 5, 1, 2, 0, 0, 4], { zone: [0, .5],
    art: { b: 'deep', tl: 'round', df: 'spiny', c: ['#e0a03a', '#ffe28a', '#d07a2a'], pat: 'bars', pc: '#c47a22', mk: ['eye'] } });
fishDef('pond', 'perch', ['Pocket Perch', 'Карманный окунёк', 'Persico Tascabile'],
  ['A striped little bandit that patrols the reeds in gangs of five.', 'Полосатый разбойник: обходит камыши бандами по пять.', 'Un piccolo bandito a strisce che pattuglia il canneto in bande da cinque.'],
  [1, 100, 340, .7, 1, 0, 'worm', 'school', 'slam', 0, 6, 2, 3, 0, 1, 5], {
    art: { b: 'oval', tl: 'fork', df: 'spiny', c: ['#6f8f3a', '#f2e6a8', '#e8603a'], pat: 'bars', pc: '#33421c' } });
fishDef('pond', 'roach', ['Ruby-Eye Roach', 'Плотва Рубиновый Глазок', 'Triotto Occhio di Rubino'],
  ['A silver roach with red eyes that sips bread crumbs right at the top.', 'Серебристая плотва с красными глазами: подбирает крошки прямо с поверхности.', 'Un triotto d’argento con gli occhi rossi che succhia briciole a pelo d’acqua.'],
  [1, 90, 300, .65, 0, 0, 'grain', 'school', 'nibble', 0, 6, 1, 3, 0, 0, 5], { zone: [0, .4],
    art: { b: 'oval', tl: 'fork', df: 'high', c: ['#8aa0a8', '#eef4f2', '#e04a3a'], ec: '#e03a3a', mk: ['eye'] } });
fishDef('pond', 'bullhead', ['Bubbletop Bullhead', 'Сомик-пузырёк', 'Pesce gatto Bollicina'],
  ['A round little catfish that snores on the muddy bottom all afternoon.', 'Круглый сомик, который весь день храпит на илистом дне.', 'Un pesce gatto tondo che russa sul fondo fangoso tutto il pomeriggio.'],
  [1, 150, 500, .7, 2, 0, 'worm', 'lurk', 'nibble', 0, 8, 2, 1, 0, 1, 6], { zone: [.3, 1],
    art: { b: 'whisk', tl: 'round', df: 'low', c: ['#6a5638', '#d8c79a', '#4e3f28'], pat: 'mottle', pc: '#4a3a22', mk: ['whisk'] } });
fishDef('pond', 'gudgeon', ['Puddle Gudgeon', 'Пескарь-лужица', 'Gobione Pozzanghera'],
  ['It noses along the sandy bottom like a tiny vacuum cleaner.', 'Ползает по песчаному дну, как маленький пылесос.', 'Fruga sul fondo sabbioso come un piccolo aspirapolvere.'],
  [1, 40, 150, .5, 2, 0, 'worm', 'dart', 'nibble', 0, 5, 1, 4, 0, 0, 4], { zone: [0, .6],
    art: { b: 'long', h: .24, tl: 'fork', df: 'low', c: ['#9a8a6a', '#efe6cc', '#8a7a5a'], pat: 'spots', pc: '#5a4a32', mk: ['whisk'] } });
fishDef('pond', 'rudd', ['Goldfin Rudd', 'Краснопёрка Золотинка', 'Scardola Pinnadoro'],
  ['A golden fish with red fins that snaps up bugs at the surface on warm days.', 'Золотая рыбка с красными плавниками ловит жучков на поверхности в тёплые дни.', 'Un pesce dorato con le pinne rosse che acchiappa insetti in superficie nei giorni caldi.'],
  [2, 150, 500, .8, 0, 1, 'bug', 'cruise', 'slam', 0, 9, 3, 4, 1, 0, 7], { when: ['day', 'dusk'],
    art: { b: 'oval', h: .42, tl: 'fork', df: 'high', dp: .56, c: ['#c8a040', '#fff0b0', '#e8402a'] } });
fishDef('pond', 'tench', ['Doctor Tench', 'Доктор Линь', 'Dottor Tinca'],
  ['The pond’s slippery green doctor; it likes a slow worm on the bottom by the reeds.', 'Скользкий зелёный доктор пруда любит медленного червяка на дне у камышей.', 'Il dottore verde e scivoloso dello stagno ama un verme lento sul fondo vicino al canneto.'],
  [2, 400, 1400, 1, 2, 0, 'worm', 'lurk', 'nibble', 0, 11, 4, 2, 0, 2, 8], { zone: [.2, .7],
    art: { b: 'oval', h: .36, tl: 'square', df: 'round', c: ['#3e6a32', '#c8c070', '#2e4e26'], ec: '#e86a2a', mk: ['eye'] } });
fishDef('pond', 'koi', ['Picnic Koi', 'Кои-пикник', 'Carpa Pic-nic'],
  ['Somebody let it go here long ago; now it begs for crumbs at the dock at dawn and dusk.', 'Кто-то выпустил его давным-давно; теперь он выпрашивает крошки у мостков на рассвете и в сумерках.', 'Qualcuno l’ha liberata tanto tempo fa; ora chiede briciole al pontile all’alba e al tramonto.'],
  [3, 800, 2600, 1.2, 0, 0, 'grain', 'cruise', 'nibble', 0, 14, 5, 3, 0, 1, 11], { when: ['dusk', 'dawn'], zone: [0, .35],
    art: { b: 'long', h: .32, tl: 'fan', df: 'long', c: ['#fff4e6', '#fffaf0', '#ff9a5a'], pat: 'patch', pc: '#ff6a2a', mk: ['whisk', 'veil'] } });
fishDef('pond', 'biscuit', ['Grandpa Biscuit', 'Дедушка Сухарик', 'Nonno Biscotto'],
  ['An ancient sunfish as big as a tea tray dozes under the dock; he wakes for a worm held still, and he is in no hurry at all.', 'Древний солнечник размером с поднос дремлет под мостками; он просыпается ради неподвижного червяка и никуда не спешит.', 'Un antico pesce sole grande come un vassoio sonnecchia sotto il pontile; si sveglia per un verme fermo e non ha nessuna fretta.'],
  [5, 5000, 9000, 2.2, 1, 0, 'worm', 'lurk', 'nibble', 0, 38, 5, 2, 1, 1, 100], { zone: [0, .3], tricks: ['still'],
    art: { b: 'deep', h: .78, tl: 'round', df: 'spiny', c: ['#c88a3a', '#ffe0a0', '#b0682a'], pat: 'bars', pc: '#a8682a', mk: ['eye', 'beard', 'crown', 'scars'] } });

// ----- Tier 2: Willow Creek. A light current carries the lure; speckled trout country. -----
fishDef('creek', 'minnow', ['Pebble Minnow', 'Гольян-камушек', 'Sanguinerola Sassolino'],
  ['Hundreds of them flicker over the stones where the water runs fast.', 'Сотни гольянов мелькают над камнями там, где вода бежит быстро.', 'Centinaia di sanguinerole guizzano sopra i sassi dove l’acqua corre.'],
  [1, 20, 80, .45, 1, 0, 'worm', 'school', 'nibble', 0, 8, 1, 5, 0, 0, 8], { zone: [0, .5],
    art: { b: 'long', h: .22, tl: 'fork', df: 'low', c: ['#7a8a5a', '#f2eed0', '#6a7a4a'], pat: 'stripe', pc: '#3a4a2a' } });
fishDef('creek', 'dace', ['Willow Dace', 'Ивовый елец', 'Leucisco dei Salici'],
  ['A slim silver fish that catches the bugs falling from the willow leaves.', 'Тонкая серебристая рыбка ловит жучков, что падают с ивовых листьев.', 'Un pesce sottile e argentato che acchiappa gli insetti che cadono dalle foglie dei salici.'],
  [1, 80, 250, .6, 0, 1, 'bug', 'school', 'slam', 0, 9, 2, 5, 1, 0, 9], {
    art: { b: 'long', h: .26, tl: 'fork', df: 'high', c: ['#8a9aa8', '#f4f8fa', '#b0b8c0'] } });
fishDef('creek', 'speck', ['Freckle Trout', 'Форель-веснушка', 'Trota Lentiggine'],
  ['A freckled brown trout that waits behind a stone for whatever the current brings.', 'Форель в веснушках ждёт за камнем, что принесёт течение.', 'Una trota piena di lentiggini che aspetta dietro un sasso quello che porta la corrente.'],
  [1, 200, 700, .85, 1, 0, 'worm', 'lurk', 'slam', 0, 11, 3, 5, 1, 1, 10], { zone: [.2, .8],
    art: { b: 'long', h: .28, tl: 'square', df: 'high', c: ['#8a6a3a', '#f4e2b0', '#7a5a30'], pat: 'spots', pc: '#c0402a' } });
fishDef('creek', 'chub', ['Big-Cheek Chub', 'Голавль-щекастик', 'Cavedano Guanciapiena'],
  ['It eats almost anything, and it blushes when it gets caught.', 'Ест почти всё и краснеет, когда его ловят.', 'Mangia quasi tutto e arrossisce quando viene preso.'],
  [1, 250, 900, .9, 1, 0, 'worm', 'cruise', 'slam', 0, 12, 3, 4, 0, 1, 10], {
    art: { b: 'oval', h: .32, tl: 'fork', df: 'high', c: ['#6a7a6a', '#f0ead0', '#d06040'], mk: ['jaw'] } });
fishDef('creek', 'loach', ['Stone Loach', 'Голец-камешник', 'Cobite Ciottolo'],
  ['A whiskery little fish that hides under flat stones and comes out for worms.', 'Усатая рыбка прячется под плоскими камнями и выползает за червяками.', 'Un pesciolino coi baffi che si nasconde sotto i sassi piatti ed esce per i vermi.'],
  [1, 30, 120, .5, 2, 0, 'worm', 'lurk', 'nibble', 0, 8, 1, 3, 0, 1, 8], { zone: [0, .5],
    art: { b: 'eel', h: .17, tl: 'round', df: 'low', c: ['#8a7a4a', '#e8dcb0', '#6a5a3a'], pat: 'mottle', pc: '#4a3a1a', mk: ['whisk'] } });
fishDef('creek', 'grayling', ['Flag Grayling', 'Хариус-флажок', 'Temolo Bandiera'],
  ['It raises its big fin like a flag and rises to little flies, but only from morning to afternoon.', 'Поднимает большой плавник, как флаг, и выходит к мошкам, но только утром и днём.', 'Alza la grande pinna come una bandiera e sale ai moscerini, ma solo dal mattino al pomeriggio.'],
  [2, 300, 1100, .9, 0, 1, 'bug', 'cruise', 'fake', 1, 14, 4, 5, 2, 0, 13], { when: ['dawn', 'day'], zone: [.3, 1],
    art: { b: 'long', h: .27, tl: 'fork', df: 'sail', c: ['#7a8a9a', '#e6eef2', '#9a5aa0'], pat: 'dots', pc: '#2a3040' } });
fishDef('creek', 'sculpin', ['Grumpy Sculpin', 'Подкаменщик-ворчун', 'Scazzone Brontolone'],
  ['A flat-headed grump that guards its rock on the bottom and bites whatever sits too close.', 'Плоскоголовый ворчун сторожит свой камень на дне и кусает всё, что лежит слишком близко.', 'Un brontolone dalla testa piatta che fa la guardia al suo sasso e morde tutto ciò che gli sta troppo vicino.'],
  [2, 60, 200, .55, 2, 0, 'worm', 'lurk', 'slam', 0, 10, 2, 3, 0, 1, 12], { zone: [.4, .9],
    art: { b: 'whisk', h: .3, tl: 'round', df: 'spiny', c: ['#6a6040', '#c8b888', '#5a5030'], pat: 'mottle', pc: '#3a3020', mk: ['jaw'] } });
fishDef('creek', 'rainbow', ['Puddle-Rainbow Trout', 'Форель-радуга', 'Trota Arcobaleno'],
  ['A pink stripe glows along its side; it chases a quick shiny lure across the deep run.', 'По её боку светится розовая полоса; она гонится за быстрой блестящей приманкой по глубокой струе.', 'Una striscia rosa le brilla sul fianco; insegue un’esca lucente e veloce lungo la corrente profonda.'],
  [3, 600, 2200, 1.1, 1, 2, 'shiny', 'dart', 'slam', 0, 18, 5, 7, 3, 1, 19], { zone: [.4, 1],
    art: { b: 'long', h: .27, tl: 'square', df: 'high', c: ['#7a9a7a', '#f4f0e0', '#9aa08a'], pat: 'spots', pc: '#2a3a2a', mk: ['stripe2'], gl: '255,110,150' } });
fishDef('creek', 'heron', ['The Heron’s Shadow', 'Тень Цапли', 'L’Ombra dell’Airone'],
  ['A long grey trout that shows only at dawn, where the heron stands; it takes a worm held still in the willow’s shade.', 'Длинная серая форель появляется только на рассвете, там, где стоит цапля; берёт неподвижного червяка в тени ивы.', 'Una lunga trota grigia che si mostra solo all’alba, dove sta l’airone; prende un verme fermo all’ombra del salice.'],
  [5, 4000, 7500, 2.3, 1, 0, 'worm', 'lurk', 'fake', 1, 45, 6, 7, 2, 1, 180], { when: ['dawn'], zone: [.5, .9], tricks: ['dawnonly', 'lastrun'],
    art: { b: 'long', h: .25, tl: 'square', df: 'high', c: ['#5a6a78', '#d8e0e6', '#4a5866'], pat: 'spots', pc: '#2a3440', mk: ['eye', 'crown', 'veil'] } });

// ----- Tier 3: Harbor Lights Pier. Permanent dusk, a tide under the boards, the first real tastes. -----
fishDef('pier', 'mullet', ['Bread-Crust Mullet', 'Кефаль-корочка', 'Cefalo Crosticina'],
  ['It cruises under the boards sucking crumbs off the top, and it can tell bread from a trick.', 'Ходит под досками и собирает крошки с поверхности; хлеб от обмана отличает сразу.', 'Passa sotto le assi succhiando briciole in superficie, e il pane vero lo riconosce subito.'],
  [1, 300, 1200, .9, 0, 0, 'grain', 'school', 'nibble', 0, 20, 3, 4, 1, 0, 15], { zone: [0, .5],
    art: { b: 'torpedo', h: .25, tl: 'fork', df: 'low', c: ['#6a7a8a', '#eef0f0', '#7a8a96'], pat: 'stripe', pc: '#4a5866' } });
fishDef('pier', 'smelt', ['Lamp Smelt', 'Корюшка-фонарик', 'Sperlano Lampionaio'],
  ['Little smelts gather under every lantern and grab bugs hopping on the water.', 'Корюшки собираются под каждым фонарём и хватают прыгающих по воде жучков.', 'I piccoli sperlani si radunano sotto ogni lanterna e acchiappano gli insetti che saltellano sull’acqua.'],
  [1, 40, 160, .5, 0, 1, 'bug', 'school', 'nibble', 0, 21, 2, 6, 1, 0, 16], {
    art: { b: 'long', h: .2, tl: 'fork', df: 'low', c: ['#9ab0b8', '#f6fbfc', '#a8bcc4'], mk: ['stripe2', 'eye'], gl: '200,230,255' } });
fishDef('pier', 'goby', ['Rope Goby', 'Бычок-канатик', 'Ghiozzo Cimetta'],
  ['It lives in the barnacles on the pilings and pokes out for a worm lying still.', 'Живёт среди ракушек на сваях и высовывается к лежащему червяку.', 'Vive tra i denti di cane dei pali e sbuca fuori per un verme fermo.'],
  [1, 60, 250, .55, 2, 0, 'worm', 'lurk', 'slam', 0, 22, 3, 3, 0, 1, 17], { zone: [0, .3],
    art: { b: 'whisk', h: .3, tl: 'round', df: 'round', c: ['#7a6a4a', '#e0d0a8', '#6a5a3a'], pat: 'mottle', pc: '#4a3a20', mk: ['eye'] } });
fishDef('pier', 'flounder', ['Doormat Flounder', 'Камбала-коврик', 'Passera Zerbino'],
  ['A flat fish that lies on the sand like a lost doormat and waits for a shrimp to land on it.', 'Плоская рыба лежит на песке, как потерянный коврик, и ждёт, когда на неё упадёт креветка.', 'Un pesce piatto che sta sulla sabbia come uno zerbino perso e aspetta che gli cada addosso un gamberetto.'],
  [2, 300, 1500, .9, 2, 0, 'shrimp', 'lurk', 'nibble', 0, 28, 4, 3, 0, 2, 22], { zone: [.3, .8],
    art: { b: 'flat', tl: 'round', df: 'none', c: ['#8a7a5a', '#f0e8d8', '#7a6a4a'], pat: 'dots', pc: '#c87a3a' } });
fishDef('pier', 'bass', ['Lamplight Bass', 'Окунь-фонарщик', 'Spigola dei Lampioni'],
  ['It hunts at the edge of the lantern light and hits a spinner that flashes past.', 'Охотится на краю света фонаря и бьёт по вертушке, что сверкнёт мимо.', 'Caccia al bordo della luce delle lanterne e colpisce un cucchiaino che le passa davanti luccicando.'],
  [2, 500, 2500, 1, 1, 2, 'shiny', 'dart', 'slam', 0, 30, 5, 6, 2, 1, 25], {
    art: { b: 'oval', h: .33, tl: 'square', df: 'spiny', c: ['#5a6a7a', '#e8eef2', '#6a7a88'], pat: 'none', mk: ['jaw'] } });
fishDef('pier', 'mackerel', ['Tide Mackerel', 'Приливная скумбрия', 'Sgombro di Marea'],
  ['Mackerel race in with the tide far off the end of the pier and chase little fish.', 'Скумбрия приходит с приливом далеко за концом причала и гоняет мелкую рыбу.', 'Gli sgombri arrivano con la marea lontano dalla punta del molo e inseguono i pesciolini.'],
  [2, 300, 1100, .85, 1, 1, 'minnow', 'school', 'slam', 0, 27, 4, 8, 1, 0, 24], { zone: [.55, 1],
    art: { b: 'torpedo', h: .22, tl: 'fork', df: 'low', c: ['#2a6a7a', '#f2f6f6', '#3a5a6a'], pat: 'bars', pc: '#123a48', mk: ['finlets'] } });
fishDef('pier', 'conger', ['Piling Conger', 'Угорь-свайщик', 'Grongo dei Pali'],
  ['A long dark eel that lives between the oldest pilings; a shrimp hopped slowly brings it out.', 'Длинный тёмный угорь живёт между самыми старыми сваями; выманит его креветка, что подпрыгивает медленно.', 'Un lungo grongo scuro che vive tra i pali più vecchi; lo fa uscire un gamberetto fatto saltellare piano.'],
  [3, 1000, 4500, 1.4, 2, 1, 'shrimp', 'lurk', 'fake', 1, 40, 7, 4, 0, 3, 33], { zone: [0, .4],
    art: { b: 'eel', tl: 'point', df: 'long', c: ['#3a3e44', '#a8a8a0', '#2e3238'], mk: ['eye'] } });
fishDef('pier', 'gurnard', ['Tiptoe Gurnard', 'Морской петушок', 'Gallinella in Punta di Piedi'],
  ['It walks on the sand on its finger-fins and only chases a spoon that flutters fast down deep.', 'Ходит по песку на пальцах-плавниках и гонится только за блесной, что быстро порхает у дна.', 'Cammina sulla sabbia sulle pinne a dita e insegue solo un ondulante che svolazza veloce sul fondo.'],
  [4, 400, 1800, 1, 2, 2, 'shiny', 'cruise', 'slam', 0, 44, 6, 5, 0, 2, 40], { zone: [.6, 1],
    art: { b: 'pike', h: .27, tl: 'square', df: 'spiny', c: ['#c0503a', '#ffd8c0', '#4a8ac0'], pat: 'dots', pc: '#ffd0a0', mk: ['veil', 'eye'] } });
fishDef('pier', 'lanternjaw', ['Old Lanternjaw', 'Старый Фонарник', 'Vecchio Mascellone'],
  ['An old sea-bass the size of a rowboat whose lip glitters with the lit lures he stole; he comes to light and to a flashing spinner.', 'Старый окунь размером с лодку; на его губе блестят украденные светящиеся приманки, он плывёт на свет и на сверкающую вертушку.', 'Una vecchia spigola grande come una barca a remi, col labbro pieno di esche luminose rubate; si avvicina alla luce e a un cucchiaino che lampeggia.'],
  [5, 12000, 25000, 2.5, 1, 2, 'shiny', 'lurk', 'fake', 2, 110, 8, 5, 1, 2, 360], { zone: [.3, .9], tricks: ['light', 'still'],
    art: { b: 'oval', h: .4, tl: 'square', df: 'spiny', c: ['#4a5664', '#d8d0b8', '#3a4450'], pat: 'mottle', pc: '#2c343e', mk: ['jaw', 'lures', 'scars', 'eye'], gl: '255,200,90' } });

// ----- Tier 3: Rainveil Falls. Gentle rain forever; rings hide the shadows, but the fish feed boldly. -----
fishDef('falls', 'shiner', ['Raindrop Shiner', 'Дождевая уклейка', 'Alborella Goccia'],
  ['It thinks every raindrop is a bug and rushes up to check, so a hopping bug lure does well.', 'Каждую каплю дождя она принимает за жучка и бросается проверить, так что прыгающий жучок работает отлично.', 'Crede che ogni goccia sia un insetto e corre a controllare, quindi un insetto saltellante funziona bene.'],
  [1, 30, 120, .45, 0, 1, 'bug', 'school', 'nibble', 0, 20, 2, 6, 1, 0, 15], {
    art: { b: 'long', h: .23, tl: 'fork', df: 'low', c: ['#8aa6b8', '#f4fafc', '#9ab6c4'], mk: ['stripe2'], gl: '150,200,255' } });
fishDef('falls', 'bleak', ['Splash Bleak', 'Уклейка-плюх', 'Alborella Spruzzo'],
  ['It loves a noisy popper skipping over the rain rings.', 'Обожает шумный поппер, что скачет по дождевым кругам.', 'Adora un popper rumoroso che saltella sopra i cerchi della pioggia.'],
  [1, 50, 180, .5, 0, 2, 'bug', 'dart', 'slam', 0, 21, 2, 7, 2, 0, 16], { zone: [.2, .7],
    art: { b: 'long', h: .25, tl: 'fork', df: 'high', c: ['#6a8aa0', '#eef6fa', '#7a9ab0'], pat: 'dots', pc: '#2a4a60' } });
fishDef('falls', 'barbel', ['Mossy Barbel', 'Мшистый усач', 'Barbo Muschioso'],
  ['A whiskered bottom fish that sweeps the gravel at the foot of the pool for worms.', 'Усатая донная рыба подметает гальку у подножия омута в поисках червей.', 'Un pesce baffuto di fondo che spazza la ghiaia ai piedi della pozza in cerca di vermi.'],
  [1, 400, 1800, .95, 2, 0, 'worm', 'lurk', 'nibble', 0, 24, 4, 3, 0, 2, 17], { zone: [.3, .8],
    art: { b: 'whisk', h: .26, tl: 'fork', df: 'high', c: ['#5a6a3a', '#e0dcb0', '#c08a4a'], pat: 'mottle', pc: '#3a4a20', mk: ['whisk'] } });
fishDef('falls', 'char', ['Ember Char', 'Голец-уголёк', 'Salmerino Brace'],
  ['Its belly glows orange like a coal; it picks drifting nymphs from the middle of the pool.', 'Брюшко у него светится, как уголёк; он ловит плывущих нимф посреди омута.', 'Ha la pancia arancione come una brace; prende le ninfe che vanno alla deriva a mezz’acqua.'],
  [2, 400, 1600, .9, 1, 1, 'bug', 'cruise', 'fake', 1, 28, 5, 5, 1, 1, 22], {
    art: { b: 'long', h: .28, tl: 'square', df: 'high', c: ['#4a6a5a', '#ff8a3a', '#e85a2a'], pat: 'dots', pc: '#ffd0a0', mk: ['stripe2'], gl: '255,140,60' } });
fishDef('falls', 'sucker', ['Humming Sucker', 'Чукучан-напевала', 'Succhione Canterino'],
  ['It hums along the bottom with its round mouth and slurps up sweet corn left by the current.', 'Напевает вдоль дна и круглым ртом всасывает сладкую кукурузу, что принесло течение.', 'Canticchia lungo il fondo e con la bocca tonda succhia il mais dolce portato dalla corrente.'],
  [2, 600, 2400, 1, 2, 0, 'grain', 'cruise', 'nibble', 0, 30, 5, 3, 0, 2, 23], {
    art: { b: 'long', h: .27, tl: 'fork', df: 'round', c: ['#6a6058', '#e8e0d4', '#a87a6a'], mk: ['beard'] } });
fishDef('falls', 'spray', ['Spray Trout', 'Форель-брызга', 'Trota Spruzzo'],
  ['It patrols the edge of the white water and chases little fish swept down by the fall.', 'Сторожит край белой воды и гоняется за мальками, которых сносит водопадом.', 'Pattuglia il bordo dell’acqua bianca e insegue i pesciolini trascinati giù dalla cascata.'],
  [2, 500, 2000, 1, 1, 1, 'minnow', 'cruise', 'slam', 0, 32, 5, 7, 2, 1, 26], { zone: [.5, .9],
    art: { b: 'long', h: .27, tl: 'square', df: 'round', c: ['#6a7a8a', '#f2f4f2', '#8a96a0'], pat: 'spots', pc: '#1e2a36', mk: ['jaw'] } });
fishDef('falls', 'salmon', ['Ladder Salmon', 'Лосось-лесенка', 'Salmone Scaletta'],
  ['It practises jumping the fall all day; a fast spinner makes it leap at once.', 'Целый день тренируется прыгать через водопад; быстрая вертушка заставляет его сразу взлететь.', 'Si allena tutto il giorno a saltare la cascata; un cucchiaino veloce lo fa balzare subito.'],
  [3, 2000, 7000, 1.3, 1, 2, 'shiny', 'dart', 'slam', 0, 40, 7, 8, 3, 1, 34], { zone: [.6, 1],
    art: { b: 'torpedo', h: .27, tl: 'square', df: 'high', c: ['#6a7a90', '#f4f2ee', '#8a5a6a'], pat: 'spots', pc: '#2a3446', mk: ['jaw'] } });
fishDef('falls', 'pikeling', ['Curtain Pike', 'Щука-занавеска', 'Luccio Sipario'],
  ['It hides behind the curtain of rain and grabs a spoon flashing low past its cave.', 'Прячется за завесой дождя и хватает блесну, что сверкнёт низко мимо её пещеры.', 'Si nasconde dietro la tenda di pioggia e afferra un ondulante che passa basso davanti alla sua grotta.'],
  [4, 1500, 6000, 1.35, 2, 2, 'shiny', 'lurk', 'fake', 2, 45, 7, 7, 1, 2, 40], { zone: [.4, .9],
    art: { b: 'pike', tl: 'fork', df: 'low', c: ['#4a6040', '#e6e8c8', '#5a6a40'], pat: 'spots', pc: '#c8d090', mk: ['jaw'] } });
fishDef('falls', 'noise', ['The White Noise', 'Белый Шум', 'Il Rumore Bianco'],
  ['A pale trout that lives inside the roar right under the fall and takes a shrimp hopped down deep.', 'Бледная форель живёт внутри рёва, прямо под водопадом, и берёт креветку, что прыгает у самого дна.', 'Una trota pallida che vive dentro il fragore, proprio sotto la cascata, e prende un gamberetto fatto saltellare sul fondo.'],
  [5, 9000, 16000, 2.4, 2, 1, 'shrimp', 'dart', 'fake', 2, 115, 7, 9, 3, 2, 370], { zone: [.8, 1], tricks: ['lastrun'],
    art: { b: 'long', h: .27, tl: 'square', df: 'high', c: ['#d8e2ea', '#ffffff', '#c0ccd8'], pat: 'dots', pc: '#9aaab8', mk: ['crown', 'veil', 'glow'], gl: '230,245,255' } });

// ----- Tier 4: The Sunken Mill. Murky water, beams and snags; big shadows ambush from cover. -----
fishDef('mill', 'bream', ['Flour Bream', 'Мучной лещ', 'Abramide Farinoso'],
  ['A tall flat bream that feeds in floury clouds on the bottom and loves sweet corn.', 'Высокий плоский лещ кормится в мучных облаках на дне и обожает сладкую кукурузу.', 'Un abramide alto e piatto che mangia sul fondo in nuvole di farina e adora il mais dolce.'],
  [1, 500, 2500, 1, 2, 0, 'grain', 'school', 'nibble', 0, 36, 4, 3, 0, 1, 30], { zone: [.3, .9],
    art: { b: 'deep', h: .5, tl: 'fork', df: 'high', c: ['#8a8070', '#ece4d0', '#7a7060'] } });
fishDef('mill', 'carp', ['Sack Carp', 'Карп-мешок', 'Carpa Sacco'],
  ['A fat carp that sips floating bread among the reeds, and gets suspicious if it moves.', 'Толстый карп собирает плавающий хлеб в камышах и сразу настораживается, если хлеб двигается.', 'Una carpa grassa che succhia il pane galleggiante nel canneto e si insospettisce se si muove.'],
  [1, 2000, 8000, 1.3, 0, 0, 'grain', 'cruise', 'fake', 1, 45, 6, 3, 0, 2, 34], { zone: [0, .35],
    art: { b: 'oval', h: .38, tl: 'fork', df: 'long', c: ['#8a6a3a', '#f0d890', '#7a5a2a'], mk: ['whisk'] } });
fishDef('mill', 'cogperch', ['Cog Perch', 'Окунь-шестерёнка', 'Persico Ingranaggio'],
  ['Gangs of perch hang around the old cogwheel and chase a twitching little fish.', 'Стаи окуней держатся у старой шестерни и гоняются за дёргающейся рыбкой.', 'Bande di persici stanno vicino al vecchio ingranaggio e inseguono un pesciolino che guizza.'],
  [1, 300, 1500, .85, 1, 1, 'minnow', 'school', 'slam', 0, 38, 5, 5, 1, 1, 32], {
    art: { b: 'oval', h: .36, tl: 'fork', df: 'spiny', c: ['#5a6a3a', '#e8dca0', '#d85a2a'], pat: 'bars', pc: '#2a3418' } });
fishDef('mill', 'cellarcat', ['Cellar Catfish', 'Подвальный сомик', 'Pesce gatto Cantina'],
  ['It lives in the drowned cellar and sniffs out a worm lying still in the dark.', 'Живёт в затопленном подвале и в темноте чует лежащего червяка.', 'Vive nella cantina sommersa e nel buio fiuta un verme fermo.'],
  [1, 800, 3000, 1, 2, 0, 'worm', 'lurk', 'nibble', 0, 40, 5, 3, 0, 2, 35], { zone: [.5, 1],
    art: { b: 'whisk', tl: 'round', df: 'low', c: ['#4a4038', '#b8aa90', '#3a3028'], mk: ['whisk'] } });
fishDef('mill', 'eel', ['Spindle Eel', 'Угорь-веретено', 'Anguilla Fuso'],
  ['It winds through the beams and mouths a shrimp twice before it really takes it.', 'Вьётся между балками и дважды пробует креветку, прежде чем взять по-настоящему.', 'Si attorciglia tra le travi e assaggia due volte un gamberetto prima di prenderlo davvero.'],
  [2, 600, 2500, 1.2, 2, 0, 'shrimp', 'lurk', 'fake', 2, 50, 6, 5, 0, 3, 45], { zone: [.2, .7],
    art: { b: 'eel', tl: 'point', df: 'long', c: ['#4a4a2a', '#c8c090', '#3a3a20'], mk: ['eye'] } });
fishDef('mill', 'pike', ['Reed Pike', 'Камышовая щука', 'Luccio del Canneto'],
  ['It waits in the reeds like a log, then strikes a spinner flashing past.', 'Ждёт в камышах, как бревно, а потом бьёт по вертушке, что сверкнёт мимо.', 'Aspetta nel canneto come un tronco, poi colpisce un cucchiaino che passa luccicando.'],
  [2, 2000, 9000, 1.45, 1, 2, 'shiny', 'lurk', 'slam', 0, 55, 7, 7, 2, 1, 50], { zone: [0, .3],
    art: { b: 'pike', tl: 'fork', df: 'low', c: ['#4a5a30', '#e8e4b8', '#6a6a30'], pat: 'spots', pc: '#d8d890', mk: ['jaw'] } });
fishDef('mill', 'zander', ['Glass-Eye Zander', 'Судак-стекляшка', 'Lucioperca Occhio di Vetro'],
  ['Its glassy eyes see in the murk at dusk and night, when it hunts hopping shrimp along the bottom.', 'Его стеклянные глаза видят в мутной воде в сумерках и ночью, когда он охотится на прыгающих креветок у дна.', 'I suoi occhi di vetro vedono nel torbido al tramonto e di notte, quando caccia gamberetti saltellanti sul fondo.'],
  [2, 1000, 5000, 1.2, 2, 1, 'shrimp', 'cruise', 'fake', 1, 52, 6, 6, 0, 2, 48], { when: ['dusk', 'night'],
    art: { b: 'pike', h: .23, tl: 'fork', df: 'spiny', c: ['#6a7060', '#e4e4d4', '#7a8070'], pat: 'bars', pc: '#3a4030', mk: ['eye'], ec: '#d8f0e0' } });
fishDef('mill', 'gar', ['Plank Gar', 'Панцирник-доска', 'Luccio Alligatore'],
  ['A long-nosed gar that floats like a plank in the sun and snaps at bugs on the top.', 'Длинноносый панцирник лежит на солнце, как доска, и хватает жучков на поверхности.', 'Un pesce col muso lungo che galleggia al sole come un’asse e azzanna gli insetti in superficie.'],
  [3, 2000, 7000, 1.5, 0, 1, 'bug', 'cruise', 'slam', 0, 65, 7, 6, 3, 0, 62], { when: ['day'], zone: [.3, .8],
    art: { b: 'pike', h: .16, tl: 'round', df: 'low', c: ['#5a6040', '#d8d4a8', '#4a5030'], pat: 'spots', pc: '#2a2e18', mk: ['snout', 'scars'] } });
fishDef('mill', 'bowfin', ['Millrace Bowfin', 'Ильная амия', 'Amia del Canale'],
  ['A very old kind of fish with a ribbon fin along its back; at night it chases a crank bait down deep.', 'Очень древняя рыба с плавником-лентой вдоль спины; ночью гонится за воблером у дна.', 'Un pesce antichissimo con una pinna a nastro lungo il dorso; di notte insegue un’esca a paletta sul fondo.'],
  [4, 3000, 9000, 1.5, 2, 2, 'minnow', 'dart', 'slam', 0, 78, 8, 7, 1, 2, 78], { when: ['night'], zone: [.4, 1],
    art: { b: 'long', h: .27, tl: 'round', df: 'long', c: ['#4a5440', '#c8c8a0', '#3a6a40'], pat: 'mottle', pc: '#2e3626', mk: ['eye', 'pearl'], gl: '255,210,90' } });
fishDef('mill', 'millstone', ['The Millstone', 'Жёрнов', 'La Macina'],
  ['A catfish as big as the story about it; on dark nights it leaves the millpond floor for a worm lying still.', 'Сом размером с легенду о нём; тёмными ночами он поднимается со дна к неподвижному червяку.', 'Un pesce gatto grande quanto la leggenda che lo racconta; nelle notti buie lascia il fondo per un verme fermo.'],
  [5, 40000, 90000, 2.8, 2, 0, 'worm', 'lurk', 'nibble', 0, 200, 9, 3, 0, 3, 720], { when: ['night'], zone: [.5, 1], tricks: ['still', 'lastrun'],
    art: { b: 'whisk', h: .3, tl: 'round', df: 'low', c: ['#3e3a34', '#a89c88', '#2e2a24'], pat: 'mottle', pc: '#24201c', mk: ['whisk', 'beard', 'scars', 'eye'] } });

// ----- Tier 4: The Frozen Reach. Holes in the ice, a stiff line, a dark circle of sight, the aurora overhead. -----
fishDef('ice', 'frostsmelt', ['Frost Smelt', 'Морозная корюшка', 'Sperlano di Brina'],
  ['Clouds of tiny smelts drift under the holes and nibble a bug jigged gently in the middle.', 'Облака крошечных корюшек плывут под лунками и щиплют жучка, которого мягко подёргивают в толще.', 'Nuvole di sperlani minuscoli passano sotto i buchi e mordicchiano un insetto mosso piano a mezz’acqua.'],
  [1, 20, 90, .45, 1, 1, 'bug', 'school', 'nibble', 0, 35, 2, 6, 0, 0, 30], {
    art: { b: 'long', h: .2, tl: 'fork', df: 'low', c: ['#a8c0d0', '#fafcff', '#b8cad8'], mk: ['stripe2', 'eye'] } });
fishDef('ice', 'mitten', ['Mitten Perch', 'Окунь-варежка', 'Persico Muffola'],
  ['A fat winter perch, striped like a mitten, that grabs a twitching little fish.', 'Толстый зимний окунь, полосатый, как варежка, хватает дёргающуюся рыбку.', 'Un grasso persico d’inverno, a righe come una muffola, che afferra un pesciolino che guizza.'],
  [1, 200, 900, .8, 1, 1, 'minnow', 'school', 'slam', 0, 38, 4, 5, 0, 1, 32], {
    art: { b: 'oval', h: .38, tl: 'fork', df: 'spiny', c: ['#5a7050', '#f0ecd0', '#e86a3a'], pat: 'bars', pc: '#2a3420' } });
fishDef('ice', 'whitefish', ['Snowcap Whitefish', 'Сиг-снежок', 'Coregone Cappuccio di Neve'],
  ['A silver whitefish that feeds near the floor and sips a shrimp lying very still.', 'Серебристый сиг кормится у дна и тихо берёт неподвижную креветку.', 'Un coregone d’argento che mangia vicino al fondo e succhia un gamberetto fermissimo.'],
  [1, 500, 2000, 1, 2, 0, 'shrimp', 'school', 'nibble', 0, 40, 4, 4, 0, 1, 34], {
    art: { b: 'oval', h: .3, tl: 'fork', df: 'high', c: ['#9aa6b0', '#f8fafc', '#aab4be'] } });
fishDef('ice', 'ruffe', ['Icicle Ruffe', 'Ёрш-сосулька', 'Acerina Ghiacciolo'],
  ['A prickly little ruffe that pecks a hopping shrimp on the bottom and fakes first.', 'Колючий ёршик клюёт прыгающую креветку у дна и сначала обманывает.', 'Un’acerina spinosa che becca un gamberetto saltellante sul fondo e prima finge.'],
  [2, 60, 250, .55, 2, 1, 'shrimp', 'dart', 'fake', 1, 42, 3, 6, 0, 1, 40], {
    art: { b: 'oval', h: .32, tl: 'round', df: 'spiny', c: ['#7a7a5a', '#e8e4c8', '#6a6a4a'], pat: 'spots', pc: '#2a2a1a', mk: ['eye'] } });
fishDef('ice', 'burbot', ['Grumble Burbot', 'Налим-бурчун', 'Bottatrice Brontolona'],
  ['It only wakes up in the dark and under the aurora, and slurps a worm off the bottom.', 'Просыпается только в темноте и под сиянием и всасывает червяка со дна.', 'Si sveglia solo al buio e sotto l’aurora, e risucchia un verme dal fondo.'],
  [2, 1000, 5000, 1.2, 2, 0, 'worm', 'lurk', 'nibble', 0, 55, 6, 3, 0, 3, 50], { when: ['night', 'aurora'], zone: [.3, 1],
    art: { b: 'eel', h: .17, tl: 'round', df: 'long', c: ['#5a5034', '#d8cca0', '#4a4028'], pat: 'mottle', pc: '#2e2818', mk: ['whisk', 'beard'] } });
fishDef('ice', 'arctic', ['Lantern Char', 'Голец-фонарик', 'Salmerino Lanterna'],
  ['Its red belly shows in the dark circle under the hole; it chases a spoon fluttering fast and deep.', 'Его красное брюшко видно в тёмном круге под лункой; он гонится за блесной, что быстро порхает в глубине.', 'La sua pancia rossa si vede nel cerchio scuro sotto il buco; insegue un ondulante che svolazza veloce e profondo.'],
  [2, 800, 3500, 1.1, 2, 2, 'shiny', 'dart', 'slam', 0, 58, 6, 7, 1, 2, 52], { zone: [.4, .9],
    art: { b: 'long', h: .28, tl: 'fork', df: 'high', c: ['#3a5a6a', '#ff6a4a', '#ff8a5a'], pat: 'dots', pc: '#ffd6b0', mk: ['stripe2'], gl: '255,110,80' } });
fishDef('ice', 'snowpike', ['Snow Pike', 'Снежная щука', 'Luccio di Neve'],
  ['A pale pike that hangs just under the ice and strikes a spinner flashing across the hole.', 'Бледная щука висит прямо подо льдом и бьёт по вертушке, что сверкнёт поперёк лунки.', 'Un luccio pallido che sta appena sotto il ghiaccio e colpisce un cucchiaino che lampeggia davanti al buco.'],
  [3, 3000, 10000, 1.5, 1, 2, 'shiny', 'lurk', 'slam', 0, 66, 7, 7, 0, 1, 64], { zone: [.2, .7],
    art: { b: 'pike', tl: 'fork', df: 'low', c: ['#8a9aa0', '#f4f8f8', '#9aa8ae'], pat: 'spots', pc: '#e8f0f4', mk: ['jaw'] } });
fishDef('ice', 'laker', ['Glacier Laker', 'Ледниковая палия', 'Trota di Ghiacciaio'],
  ['A great lake trout that cruises the deep cold and only chases a crank bait diving fast.', 'Большая озёрная форель ходит в глубоком холоде и гонится только за быстро ныряющим воблером.', 'Una grande trota di lago che gira nel freddo profondo e insegue solo un’esca a paletta che scende veloce.'],
  [4, 4000, 14000, 1.6, 2, 2, 'minnow', 'cruise', 'fake', 1, 80, 8, 5, 0, 3, 80], { when: ['night', 'aurora'], zone: [.5, 1],
    art: { b: 'long', h: .27, tl: 'fork', df: 'high', c: ['#4a5a5a', '#e8ece8', '#5a6a6a'], pat: 'dots', pc: '#d8e4dc', mk: ['jaw'] } });
fishDef('ice', 'aurora', ['Sister Aurora', 'Сестрица Аврора', 'Sorella Aurora'],
  ['Her jewel scales carry the sky’s colours; she rises only under the aurora, to a shiny jig lifted and dropped.', 'Её чешуя-самоцветы несёт цвета неба; она поднимается только под северным сиянием, к блестящей мормышке, которую поднимают и роняют.', 'Le sue squame di gemma portano i colori del cielo; sale solo sotto l’aurora, verso un jig lucente sollevato e lasciato cadere.'],
  [5, 8000, 15000, 2.4, 2, 1, 'shiny', 'cruise', 'fake', 2, 190, 8, 7, 2, 2, 720], { when: ['aurora'], zone: [.3, .8], tricks: ['still'],
    art: { b: 'long', h: .3, tl: 'fork', df: 'sail', c: ['#3a8a9a', '#f0fff8', '#8a6ad0'], pat: 'none', mk: ['jewel', 'glow', 'veil', 'crown'], gl: '120,255,200' } });

// ----- Tier 5: Stormbreak Reef. Open sea from a boat: swells, gusts, squalls. Everything is bigger and faster. -----
fishDef('reef', 'herring', ['Gull Herring', 'Чаечья сельдь', 'Aringa dei Gabbiani'],
  ['Silver herring pour past in rivers, and the gulls follow them; a twitching little fish fools them.', 'Серебристая сельдь течёт мимо рекой, а за ней летят чайки; её обманет дёргающаяся рыбка.', 'Le aringhe d’argento passano come un fiume, seguite dai gabbiani; le inganna un pesciolino che guizza.'],
  [1, 150, 600, .7, 1, 1, 'minnow', 'school', 'nibble', 0, 62, 4, 7, 0, 0, 60], {
    art: { b: 'torpedo', h: .24, tl: 'fork', df: 'low', c: ['#3a6a8a', '#f4f8fa', '#5a7a90'], mk: ['eye'] } });
fishDef('reef', 'pollock', ['Spray Pollock', 'Сайда-брызга', 'Merluzzo Spruzzo'],
  ['Pollock hunt in packs in the middle water and smash a spinner pulled fast.', 'Сайда охотится стаями в толще воды и бьёт по вертушке, которую тянут быстро.', 'I merluzzi cacciano in branco a mezz’acqua e si avventano su un cucchiaino tirato veloce.'],
  [1, 800, 4000, 1, 1, 2, 'shiny', 'school', 'slam', 0, 66, 6, 7, 0, 1, 64], {
    art: { b: 'torpedo', h: .25, tl: 'square', df: 'long', c: ['#4a6a4a', '#f0f0e0', '#5a7a5a'], mk: ['stripe2', 'jaw'] } });
fishDef('reef', 'wrasse', ['Kelp Wrasse', 'Ламинарный губан', 'Labro delle Alghe'],
  ['A painted wrasse that stays close to the boat in the kelp and picks a shrimp lying still.', 'Расписной губан держится в водорослях у самой лодки и берёт неподвижную креветку.', 'Un labro dipinto che sta tra le alghe vicino alla barca e prende un gamberetto fermo.'],
  [1, 400, 2000, .85, 2, 0, 'shrimp', 'lurk', 'nibble', 0, 64, 5, 4, 0, 2, 62], { zone: [0, .4],
    art: { b: 'oval', h: .34, tl: 'round', df: 'long', c: ['#3a8a6a', '#f8e8a0', '#e8603a'], pat: 'dots', pc: '#ff9a4a', mk: ['jaw'] } });
fishDef('reef', 'garfish', ['Needle Garfish', 'Сарган-иголка', 'Aguglia Ago'],
  ['It skips across the wave tops after blown-down bugs and leaps again and again when hooked.', 'Скачет по гребням волн за сдутыми жучками и, попавшись, прыгает снова и снова.', 'Salta sulle creste delle onde dietro agli insetti portati dal vento, e quando abbocca salta ancora e ancora.'],
  [2, 400, 1500, 1.1, 0, 2, 'bug', 'dart', 'slam', 0, 75, 5, 9, 3, 0, 85], {
    art: { b: 'pike', h: .12, tl: 'fork', df: 'low', c: ['#2a7a6a', '#eef8f4', '#3a8a7a'], mk: ['snout'] } });
fishDef('reef', 'ray', ['Kite Ray', 'Скат-змей', 'Razza Aquilone'],
  ['A ray that glides over the sand like a kite and pins a jig hopped along the floor.', 'Скат скользит над песком, как воздушный змей, и прижимает ко дну подпрыгивающую мормышку.', 'Una razza che plana sulla sabbia come un aquilone e blocca un jig fatto saltellare sul fondo.'],
  [2, 3000, 12000, 1.4, 2, 1, 'shiny', 'cruise', 'nibble', 0, 90, 8, 4, 0, 3, 90], { zone: [.3, .9],
    art: { b: 'ray', tl: 'whip', df: 'none', c: ['#6a6050', '#efe8dc', '#5a5040'], pat: 'dots', pc: '#3a3428' } });
fishDef('reef', 'grouper', ['Barnacle Grouper', 'Ракушечный групер', 'Cernia Conchiglia'],
  ['A heavy grouper that lives in a reef cave, mouths a hopping shrimp and then bolts for home.', 'Тяжёлый групер живёт в пещере рифа: пробует прыгающую креветку, а потом рвётся домой.', 'Una cernia pesante che vive in una grotta della scogliera: assaggia un gamberetto saltellante e poi scappa a casa.'],
  [2, 5000, 20000, 1.5, 2, 1, 'shrimp', 'lurk', 'fake', 1, 95, 9, 4, 0, 3, 95], { zone: [.2, .7],
    art: { b: 'deep', h: .44, tl: 'round', df: 'spiny', c: ['#6a5a40', '#e8dcc0', '#5a4a30'], pat: 'mottle', pc: '#3a3020', mk: ['jaw', 'scars'] } });
fishDef('reef', 'bonito', ['Thunder Bonito', 'Громовая пеламида', 'Palamita del Tuono'],
  ['It races in with the bad weather and only chases a fast little fish in the middle water.', 'Приносится вместе с непогодой и гонится только за быстрой рыбкой в толще воды.', 'Arriva di corsa col brutto tempo e insegue solo un pesciolino veloce a mezz’acqua.'],
  [3, 2000, 8000, 1.3, 1, 2, 'minnow', 'dart', 'slam', 0, 100, 8, 9, 1, 1, 120], { when: ['squall', 'dusk'], zone: [.5, 1],
    art: { b: 'torpedo', tl: 'moon', df: 'high', c: ['#2a4a7a', '#eef2f6', '#3a5a8a'], pat: 'stripe', pc: '#1a2a4a', mk: ['finlets'] } });
fishDef('reef', 'dorado', ['Sun Dorado', 'Корифена-солнце', 'Lampuga del Sole'],
  ['A golden-green fish with a forehead like a cliff that hunts deep in bright weather and hits a diving crank bait.', 'Золотисто-зелёная рыба с лбом, как утёс, охотится глубоко в ясную погоду и бьёт по ныряющему воблеру.', 'Un pesce verde e oro con una fronte a strapiombo che caccia in profondità col bel tempo e colpisce un’esca a paletta.'],
  [3, 4000, 15000, 1.5, 2, 2, 'minnow', 'cruise', 'slam', 0, 105, 8, 8, 3, 1, 125], { when: ['day', 'dusk'], zone: [.4, 1],
    art: { b: 'long', h: .3, tl: 'fork', df: 'long', c: ['#3a9a5a', '#ffe060', '#4ab0d0'], pat: 'dots', pc: '#2a6aa0', mk: ['crown'] } });
fishDef('reef', 'sailfish', ['Storm Sailfish', 'Штормовой парусник', 'Pesce Vela della Tempesta'],
  ['It raises its blue sail only in a squall and chases a squid lure sinking fast.', 'Поднимает синий парус только в шквал и гонится за быстро тонущим кальмаром.', 'Alza la sua vela blu solo durante la burrasca e insegue un calamaro finto che affonda veloce.'],
  [4, 15000, 40000, 1.9, 2, 2, 'shrimp', 'dart', 'slam', 0, 120, 9, 10, 3, 2, 160], { when: ['squall'],
    art: { b: 'torpedo', h: .2, tl: 'moon', df: 'sail', c: ['#2a3a6a', '#e8eef4', '#3a6ad0'], pat: 'bars', pc: '#7ab0ff', mk: ['snout'] } });
fishDef('reef', 'wave', ['The Ninth Wave', 'Девятый Вал', 'La Nona Onda'],
  ['A silver giant that runs only inside a squall, under the biggest wave, after a shiny spinner pulled fast.', 'Серебряный великан выходит только в шквал, под самой большой волной, за блестящей вертушкой, которую тянут быстро.', 'Un gigante d’argento che corre solo dentro la burrasca, sotto l’onda più grande, dietro a un cucchiaino lucente tirato veloce.'],
  [5, 60000, 140000, 3, 1, 2, 'shiny', 'cruise', 'slam', 0, 300, 10, 9, 2, 2, 1450], { when: ['squall'], zone: [.5, 1], tricks: ['squallonly', 'lastrun'],
    art: { b: 'torpedo', h: .28, tl: 'moon', df: 'high', c: ['#8aa0b8', '#ffffff', '#b8c8d8'], pat: 'none', mk: ['finlets', 'crown', 'glow', 'scars'], gl: '220,240,255' } });

// ----- Tier 6: The Lantern Deep. A bottomless trench at night; glowing lures, enormous slow shadows, fights of minutes. -----
fishDef('deep', 'lampfish', ['Lamp Minnow', 'Фонарный малёк', 'Pesce Lanterna'],
  ['Little lamps along its belly blink in rows as the school rises to a twitching little fish.', 'Огоньки на брюшке мигают рядами, когда стайка поднимается к дёргающейся рыбке.', 'Le lucine sulla pancia lampeggiano in fila quando il branco sale verso un pesciolino che guizza.'],
  [1, 30, 150, .5, 1, 1, 'minnow', 'school', 'nibble', 0, 100, 5, 5, 0, 1, 120], {
    art: { b: 'oval', h: .3, tl: 'fork', df: 'low', c: ['#2a3040', '#6a7890', '#3a4458'], mk: ['eye', 'pearl', 'glow'], gl: '120,220,255' } });
fishDef('deep', 'hatchet', ['Silver Hatchet', 'Серебряный топорик', 'Pesce Accetta d’Argento'],
  ['A thin silver fish shaped like a little axe that turns toward any jig that flashes as it hops.', 'Тонкая серебряная рыбка в форме топорика поворачивает к любой мормышке, что сверкает на прыжке.', 'Un pesce sottile d’argento a forma di piccola accetta che si gira verso ogni jig che luccica saltellando.'],
  [1, 50, 200, .5, 2, 1, 'shiny', 'school', 'nibble', 0, 105, 5, 6, 0, 2, 125], {
    art: { b: 'deep', h: .62, tl: 'fork', df: 'low', c: ['#8a96a8', '#eef2f8', '#a8b4c4'], mk: ['eye', 'pearl'], gl: '150,200,255' } });
fishDef('deep', 'dragonet', ['Velvet Dragonet', 'Бархатный дракончик', 'Draghetto di Velluto'],
  ['It lies on the trench wall and bumps a still glowing worm a few times before it bites.', 'Лежит на стене впадины и несколько раз толкает неподвижного светящегося червяка, прежде чем клюнуть.', 'Sta sulla parete della fossa e urta qualche volta un verme luminoso fermo prima di mordere.'],
  [1, 200, 900, .7, 2, 0, 'glow', 'lurk', 'fake', 1, 110, 6, 4, 0, 2, 130], { zone: [0, .5],
    art: { b: 'eel', h: .15, tl: 'round', df: 'long', c: ['#3a2a4a', '#7a6a90', '#5a3a7a'], pat: 'dots', pc: '#b08aff', mk: ['glow', 'veil'], gl: '180,140,255' } });
fishDef('deep', 'stardragon', ['Star Dragonfish', 'Звёздный дракон', 'Drago Stellato'],
  ['Freckled with tiny stars, it streaks up from below to catch a crank bait diving fast.', 'Усыпанный крошечными звёздами, он стремительно поднимается снизу за быстро ныряющим воблером.', 'Coperto di stelline, sfreccia dal basso per prendere un’esca a paletta che scende veloce.'],
  [2, 500, 2500, 1, 2, 2, 'minnow', 'dart', 'slam', 0, 125, 7, 8, 0, 2, 165], {
    art: { b: 'eel', h: .14, tl: 'fork', df: 'low', c: ['#141820', '#2a3040', '#1a2030'], pat: 'dots', pc: '#9ae8ff', mk: ['whisk', 'glow', 'jaw'], gl: '140,230,255' } });
fishDef('deep', 'gulper', ['Pelican Gulper', 'Большерот-пеликан', 'Ingoiatore Pellicano'],
  ['Mostly mouth and tail, it opens wide for a squid lure dancing fast through the dark.', 'Почти весь из рта и хвоста, он широко раскрывается навстречу кальмару, что быстро пляшет в темноте.', 'Quasi tutto bocca e coda, spalanca le fauci per un calamaro finto che balla veloce nel buio.'],
  [2, 1000, 4000, 1.3, 2, 2, 'shrimp', 'cruise', 'slam', 0, 130, 7, 5, 0, 3, 170], {
    art: { b: 'eel', h: .13, tl: 'whip', df: 'none', c: ['#1a1a24', '#3a3a48', '#24242e'], mk: ['jaw', 'glow'], gl: '255,120,160' } });
fishDef('deep', 'lobefin', ['Old Lobefin', 'Старый Кистепёр', 'Vecchio Pinnalobata'],
  ['A fish older than dinosaurs that walks on its fleshy fins along the ledge and takes a shrimp lying still.', 'Рыба старше динозавров ходит по уступу на мясистых плавниках и берёт неподвижную креветку.', 'Un pesce più antico dei dinosauri che cammina sulla cengia con le pinne carnose e prende un gamberetto fermo.'],
  [2, 20000, 60000, 1.7, 2, 0, 'shrimp', 'lurk', 'nibble', 0, 150, 9, 3, 0, 3, 190], { zone: [.2, .6],
    art: { b: 'long', h: .32, tl: 'fan', df: 'round', c: ['#2a3a5a', '#7a8aa0', '#24324a'], pat: 'dots', pc: '#e8f0ff', mk: ['veil', 'scars'] } });
fishDef('deep', 'oarfish', ['Ribbon King', 'Сельдяной король', 'Re delle Aringhe'],
  ['A silver ribbon with a red crest, as long as a boat, that drifts upright and chases a fast little fish.', 'Серебряная лента с красным гребнем, длиной с лодку, дрейфует стоя и гонится за быстрой рыбкой.', 'Un nastro d’argento con la cresta rossa, lungo come una barca, che fluttua in piedi e insegue un pesciolino veloce.'],
  [3, 30000, 90000, 2, 1, 2, 'minnow', 'cruise', 'fake', 1, 165, 8, 4, 0, 2, 240], { zone: [.4, 1],
    art: { b: 'eel', h: .1, tl: 'point', df: 'long', c: ['#a8b4c4', '#e8eef4', '#e84a4a'], mk: ['crown', 'glow'], gl: '210,230,255' } });
fishDef('deep', 'angler', ['Lantern Angler', 'Удильщик-фонарщик', 'Pescatore con la Lanterna'],
  ['It dangles its own lantern and waits; it bumps a still glow lure twice to see if the light is real.', 'Свешивает свой фонарик и ждёт; дважды толкает неподвижную светящуюся приманку, проверяя, настоящий ли свет.', 'Fa penzolare la sua lanterna e aspetta; urta due volte un’esca luminosa ferma per vedere se la luce è vera.'],
  [3, 3000, 15000, 1.4, 1, 0, 'glow', 'lurk', 'fake', 2, 160, 8, 3, 0, 3, 250], { zone: [.3, .8],
    art: { b: 'round', h: .62, tl: 'round', df: 'none', c: ['#2a2420', '#4a4038', '#3a3028'], mk: ['lantern', 'jaw'], gl: '160,255,220' } });
fishDef('deep', 'barreleye', ['Glass-Head Barreleye', 'Стеклоголовый бочкоглаз', 'Testa di Vetro'],
  ['Its head is clear as a jar and its green eyes look straight up; it rises to a glow lure jigged gently.', 'Голова у него прозрачная, как банка, а зелёные глаза смотрят вверх; он поднимается к светящейся приманке, которую мягко подёргивают.', 'Ha la testa trasparente come un barattolo e gli occhi verdi che guardano in su; sale verso un’esca luminosa mossa piano.'],
  [4, 300, 1200, .8, 2, 1, 'glow', 'lurk', 'nibble', 0, 185, 7, 5, 0, 2, 310], { zone: [.5, 1],
    art: { b: 'oval', h: .34, tl: 'fork', df: 'high', c: ['#4a3a30', '#8a7a6a', '#6a5a48'], mk: ['glow', 'glass'], ec: '#7aff9a', gl: '140,255,160' } });
fishDef('deep', 'postman', ['The Abyssal Postman', 'Почтальон Бездны', 'Il Postino degli Abissi'],
  ['A vast glowing fish that has never once been in a hurry; it comes up for a glowing worm lying still, and never quickly.', 'Огромная светящаяся рыба, которая ни разу никуда не спешила; поднимается к неподвижному светящемуся червяку, и всегда не спеша.', 'Un pesce immenso e luminoso che non ha mai avuto fretta; sale verso un verme luminoso fermo, e mai in fretta.'],
  [5, 300000, 600000, 3, 2, 0, 'glow', 'cruise', 'nibble', 0, 380, 9, 2, 0, 3, 2900], { zone: [.4, 1], tricks: ['still', 'lastrun'],
    art: { b: 'round', h: .58, tl: 'fan', df: 'high', c: ['#1e2a3e', '#4a6a8a', '#2a3a58'], pat: 'dots', pc: '#bff4ff', mk: ['glow', 'pearl', 'veil', 'crown', 'scars'], gl: '150,240,255' } });

// ----- Tier 7: The Drowned Chapel. Black still water and fog. Pale, blind-looking fish; one gentle touch on the line. -----
fishDef('chapel', 'pew', ['Pew Minnow', 'Пескарь-скамейка', 'Vairone dei Banchi'],
  ['Pale minnows sit in rows between the drowned pews and want only what the first fish wanted: a worm, held still.', 'Бледные пескари сидят рядами между затопленными скамьями и хотят того же, что и самая первая рыба: неподвижного червяка.', 'Pallidi vaironi stanno in fila tra i banchi sommersi e vogliono solo quello che voleva il primo pesce: un verme, fermo.'],
  [1, 100, 400, .55, 1, 0, 'worm', 'school', 'nibble', 0, 150, 7, 2, 0, 1, 250], {
    art: { b: 'long', h: .24, tl: 'fork', df: 'low', c: ['#c8c8c0', '#f4f4ee', '#b8b8b0'], mk: ['blind'] } });
fishDef('chapel', 'candleloach', ['Candle Loach', 'Голец-свечка', 'Cobite Candela'],
  ['It lies on the drowned altar steps and taps a glowing worm lying still, once, twice, before it takes.', 'Лежит на затопленных ступенях и стучит по неподвижному светящемуся червяку раз, другой, прежде чем взять.', 'Sta sui gradini sommersi e tocca un verme luminoso fermo, una, due volte, prima di prenderlo.'],
  [1, 300, 1200, .7, 2, 0, 'glow', 'lurk', 'fake', 2, 155, 7, 2, 0, 2, 260], { zone: [.2, .6],
    art: { b: 'eel', h: .17, tl: 'round', df: 'low', c: ['#d8d4c4', '#f8f6ee', '#c8c4b0'], mk: ['whisk', 'blind', 'glow'], gl: '255,230,170' } });
fishDef('chapel', 'hymn', ['Hymn Carp', 'Карп-псалом', 'Carpa dell’Inno'],
  ['A great pale carp that turns slow circles in the nave and sips sweet corn from the floor.', 'Большой бледный карп медленно кружит в зале и всасывает сладкую кукурузу со дна.', 'Una grande carpa pallida che gira piano nella navata e succhia mais dolce dal pavimento.'],
  [1, 4000, 12000, 1.5, 2, 0, 'grain', 'cruise', 'nibble', 0, 160, 8, 1, 0, 2, 270], {
    art: { b: 'oval', h: .4, tl: 'fork', df: 'long', c: ['#d0ccc0', '#f4f2ea', '#bcb8aa'], mk: ['whisk', 'blind', 'scars'] } });
fishDef('chapel', 'moth', ['Moth Bleak', 'Мотыльковая уклейка', 'Alborella delle Falene'],
  ['The only fish here that looks up: in the fog it rises to a moth twitching on the surface.', 'Единственная рыба здесь, что смотрит вверх: в тумане она поднимается к мотыльку, что дёргается на поверхности.', 'L’unico pesce qui che guarda in alto: nella nebbia sale verso una falena che si agita in superficie.'],
  [2, 200, 700, .6, 0, 1, 'bug', 'cruise', 'fake', 1, 165, 7, 3, 1, 0, 330], { zone: [.3, .9],
    art: { b: 'long', h: .25, tl: 'fork', df: 'high', c: ['#c4c8cc', '#f4f6f8', '#a8acb4'], mk: ['eye', 'veil'], ec: '#e8ecf0' } });
fishDef('chapel', 'lace', ['Lace Ray', 'Кружевной скат', 'Razza di Pizzo'],
  ['A white ray with edges like old lace that lies over the flagstones and covers a still shrimp.', 'Белый скат с краями, как старое кружево, лежит на плитах и накрывает неподвижную креветку.', 'Una razza bianca dai bordi come pizzo antico che sta sulle lastre e copre un gamberetto fermo.'],
  [2, 3000, 10000, 1.4, 2, 0, 'shrimp', 'lurk', 'nibble', 0, 170, 9, 2, 0, 3, 340], { zone: [0, .5],
    art: { b: 'ray', tl: 'whip', df: 'none', c: ['#d8d4cc', '#f8f6f0', '#c4c0b6'], pat: 'dots', pc: '#b0aca0', mk: ['veil', 'blind'] } });
fishDef('chapel', 'choir', ['Choir Dace', 'Хоровой елец', 'Leucisco del Coro'],
  ['A school that swims against the current in perfect step, and touches a twitching little fish once before it bites.', 'Стая плывёт против течения в ногу и один раз касается дёргающейся рыбки, прежде чем клюнуть.', 'Un branco che nuota controcorrente perfettamente al passo, e tocca una volta un pesciolino che guizza prima di mordere.'],
  [2, 300, 1000, .65, 1, 1, 'minnow', 'school', 'fake', 1, 168, 7, 3, 0, 1, 360], {
    art: { b: 'long', h: .26, tl: 'fork', df: 'high', c: ['#b8bcc0', '#eef0f2', '#a0a4aa'], mk: ['blind', 'stripe2'], gl: '200,210,230' } });
fishDef('chapel', 'verger', ['The Verger', 'Пономарь', 'Il Sagrestano'],
  ['A long pale eel that keeps the dark corners and taps a hopping shrimp twice before it takes it.', 'Длинный бледный угорь хранит тёмные углы и дважды стучит по прыгающей креветке, прежде чем взять.', 'Una lunga anguilla pallida che custodisce gli angoli bui e tocca due volte un gamberetto saltellante prima di prenderlo.'],
  [2, 2000, 7000, 1.4, 2, 1, 'shrimp', 'lurk', 'fake', 2, 175, 8, 2, 0, 3, 350], { zone: [.5, 1],
    art: { b: 'eel', h: .11, tl: 'point', df: 'long', c: ['#c8c4b8', '#f0eee6', '#b0aca0'], mk: ['blind'] } });
fishDef('chapel', 'bellrope', ['Bellrope Eel', 'Угорь-верёвка', 'Anguilla Campanaria'],
  ['It hangs in the tower like the old bell rope and lunges, slowly, at a spinner pulled fast past it.', 'Висит в башне, как старая верёвка колокола, и медленно бросается к вертушке, которую быстро протянули мимо.', 'Pende nella torre come la vecchia corda della campana e si slancia, piano, verso un cucchiaino tirato veloce.'],
  [3, 5000, 15000, 1.8, 1, 2, 'shiny', 'cruise', 'nibble', 0, 185, 9, 3, 0, 2, 450], { zone: [.6, 1],
    art: { b: 'eel', h: .09, tl: 'point', df: 'none', c: ['#bcae94', '#e8dcc4', '#a89a80'], pat: 'bars', pc: '#8a7c64', mk: ['blind', 'scars'] } });
fishDef('chapel', 'sexton', ['The Sexton', 'Сторож', 'Il Custode'],
  ['A blind white catfish that keeps the bell tower, and taps a glow lure jigged gently three times before it takes.', 'Слепой белый сом сторожит колокольню и трижды стучит по мягко подёргиваемой светящейся приманке, прежде чем взять.', 'Un pesce gatto bianco e cieco che custodisce il campanile e tocca tre volte un’esca luminosa mossa piano prima di prenderla.'],
  [4, 15000, 40000, 1.9, 2, 1, 'glow', 'lurk', 'fake', 3, 195, 10, 2, 0, 3, 600], { zone: [.6, 1],
    art: { b: 'whisk', h: .28, tl: 'round', df: 'low', c: ['#dcd8cc', '#f8f6f0', '#c8c4b8'], mk: ['whisk', 'beard', 'blind'] } });
fishDef('chapel', 'bell', ['The Bellwether', 'Колокольный Вожак', 'Il Campanaccio'],
  ['A leviathan that rings the drowned bell with its tail when it takes a still glowing lure; when it goes down, let it go down.', 'Левиафан звонит в затонувший колокол хвостом, когда берёт неподвижную светящуюся приманку; когда он уходит вниз, не тяни: пусть уходит.', 'Un leviatano che suona la campana sommersa con la coda quando prende un’esca luminosa ferma; quando scende, lascialo scendere.'],
  [5, 800000, 1500000, 3, 2, 0, 'glow', 'lurk', 'nibble', 0, 400, 10, 2, 0, 3, 5400], { zone: [.5, 1], tricks: ['descend', 'still', 'lastrun'],
    art: { b: 'long', h: .3, tl: 'fan', df: 'sail', c: ['#d6d2c6', '#f6f4ec', '#beb8aa'], pat: 'none', mk: ['blind', 'veil', 'crown', 'scars', 'beard'], gl: '240,236,220' } });

// ----- Self-check of the whole table, for the tests: returns a list of problems in plain words (empty when all is well) -----
const FISH_COUNT = { pond: 9, creek: 9, pier: 9, falls: 9, mill: 10, ice: 9, reef: 10, deep: 10, chapel: 10 };
// The contract's ranges by tier: stamina and base pay of an ordinary species (tiers 2, 4 and 6 lie between their neighbours).
const FISH_STAM = [null, [5, 15], [8, 20], [20, 45], [35, 80], [60, 120], [100, 200], [150, 400]];
const FISH_PAY = [null, [4, 12], [8, 20], [15, 40], [30, 80], [60, 160], [120, 320], [250, 600]];
function fishCheck() {
  const bad = [], isNum = (v, lo, hi) => typeof v === 'number' && v >= lo && v <= hi, isInt = (v, lo, hi) => Number.isInteger(v) && isNum(v, lo, hi);
  const FOODS = ['worm', 'bug', 'grain', 'minnow', 'shiny', 'shrimp', 'glow'], MOVES = ['cruise', 'dart', 'lurk', 'school'], BITES = ['slam', 'nibble', 'fake'];
  const TRICKS = ['still', 'lastrun', 'descend', 'light', 'dawnonly', 'squallonly'];
  const lures = Object.values(ITEMS).filter(it => it.kind === 'lure');
  AREAS.forEach((a, ai) => {
    const sp = a.fish.map(id => SPECIES[id]), reg = sp.filter(s => !s.legend), T = a.tier;
    if (sp.length !== FISH_COUNT[a.id]) bad.push(`${a.id}: ${sp.length} species, wants ${FISH_COUNT[a.id]}`);
    const lg = SPECIES[LEGENDS[ai]];
    if (!lg || lg.area !== a.id || !lg.legend) bad.push(`${a.id}: the Legendary ${LEGENDS[ai]} is missing`);
    if (sp.length - reg.length !== 1) bad.push(`${a.id}: ${sp.length - reg.length} Legendaries, wants 1`);
    const topStam = Math.max(...reg.map(s => s.stam)), topPay = Math.max(...reg.map(s => s.pay));
    for (const s of sp) {
      const p = `${a.id}/${s.id}`, no = what => bad.push(`${p}: ${what}`);
      for (const k of ['f_', 'fn_']) for (let i = 0; i < LANGS.length; i++) {
        const v = L[k + s.id] && L[k + s.id][i];
        if (typeof v !== 'string' || !v.trim()) no(`${k === 'f_' ? 'name' : 'note'} missing in ${LANGS[i]}`);
      }
      if (!Array.isArray(s.w) || !(s.w[0] > 0 && s.w[1] > s.w[0])) no('weights');
      if (!isInt(s.depth, 0, 2) || !isInt(s.act, 0, 2)) no('depth or action');
      if (!FOODS.includes(s.food) || !MOVES.includes(s.move) || !BITES.includes(s.bite)) no('food, move or bite');
      if (!isInt(s.fakes, 0, 3) || (s.bite === 'fake') !== (s.fakes > 0)) no('fakes must be 1..3 for a faker and 0 for the rest');
      for (const k of ['pull', 'speed']) if (!isNum(s[k], 1, 10)) no(k);
      for (const k of ['jump', 'dive']) if (!isNum(s[k], 0, 3)) no(k);
      if (!Array.isArray(s.tricks) || s.tricks.some(k => !TRICKS.includes(k))) no('tricks');
      if (s.when !== null && !(Array.isArray(s.when) && s.when.length && s.when.every(k => a.conds.includes(k)))) no('a condition its water never has');
      if (s.zone !== null && !(Array.isArray(s.zone) && isNum(s.zone[0], 0, 1) && isNum(s.zone[1], 0, 1) && s.zone[0] < s.zone[1])) no('zone');
      if (!s.art || !s.art.b || !Array.isArray(s.art.c)) no('art');
      if (s.legend) {
        if (s.rar !== 5 || !isNum(s.size, 2, 3)) no('a Legendary has rarity 5 and size 2..3');
        if (!isNum(s.stam, Math.min(400, 2 * topStam), Math.min(400, 3 * topStam))) no(`stamina ${s.stam}, wants 2-3 times ${topStam}`);
        if (!isNum(s.pay, 8 * topPay, 10 * topPay)) no(`pay ${s.pay}, wants 8-10 times ${topPay}`);
      } else {
        if (!isInt(s.rar, 1, 4) || !isNum(s.size, .4, 2)) no('rarity or size');
        if (!isNum(s.stam, ...FISH_STAM[T])) no(`stamina ${s.stam} outside ${FISH_STAM[T]}`);
        if (!isNum(s.pay, ...FISH_PAY[T])) no(`pay ${s.pay} outside ${FISH_PAY[T]}`);
      }
      // the shop must sell a lure for this exact taste, at a shop tier the water allows
      if (lures.length && !lures.some(l => l.depth === s.depth && l.act === s.act && l.food === s.food && (l.tier | 0) <= T)) no(`no lure in the shop for depth ${s.depth}, action ${s.act}, ${s.food}`);
    }
    // pay rises with rarity: no common fish pays more than a rarer one
    for (const x of reg) for (const y of reg) if (x.rar < y.rar && x.pay > y.pay) bad.push(`${a.id}: ${x.id} (rarity ${x.rar}) pays more than ${y.id} (rarity ${y.rar})`);
    // under every condition of the round there is still a full water to read
    for (const cd of a.conds) { const n = sp.filter(s => !s.when || s.when.includes(cd)).length; if (n < 5) bad.push(`${a.id}: only ${n} species at ${cd}`); }
    // from tier 3 on, no one lure setting suits every species, not even one with a single thing wrong
    if (T >= 3) for (let d = 0; d < 3; d++) for (let ac = 0; ac < 3; ac++) for (const fd of FOODS)
      if (sp.every(s => (s.depth !== d) + (s.act !== ac) + (s.food !== fd) <= 1)) bad.push(`${a.id}: depth ${d}, action ${ac}, ${fd} nearly suits every species`);
  });
  return bad;
}
