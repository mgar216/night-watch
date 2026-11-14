// ---------- The Trophy Branch: every trophy, the rule that earns it, and the logic that hands it out ----------
// Each trophy keeps its rule beside it: `on` names the event(s) it listens to (section 5 of the contract) and
// `ok(e)` gets that event's data. Counters it needs live in S.stat (see the counting block below the table).
// fam: the family (first, mastery, collect, courage, wealth, secret); sym: the icon carved into the badge;
// reward: `moons` and/or `item` (a lure gives one pack; a hat or paint already owned pays its price instead).
Object.assign(L, {
  tro_first: ['First steps', 'Первые шаги', 'Primi passi'], tro_mastery: ['Mastery', 'Мастерство', 'Maestria'],
  tro_collect: ['Collection', 'Коллекция', 'Collezione'], tro_courage: ['Courage', 'Смелость', 'Coraggio'],
  tro_wealth: ['Wealth and craft', 'Богатство и ремесло', 'Ricchezza e mestiere'], tro_secret: ['Secrets', 'Секреты', 'Segreti'],
  tro_new: ['New trophy!', 'Новый трофей!', 'Nuovo trofeo!'],
  tro_count: ['{n} of {m} trophies', 'Трофеев: {n} из {m}', 'Trofei: {n} su {m}'],
  tro_got: ['Earned!', 'Получен!', 'Ottenuto!'], tro_not: ['Not earned yet', 'Ещё не получен', 'Non ancora ottenuto'],
  tro_hid: ['A secret trophy. Keep fishing!', 'Секретный трофей. Рыбачь дальше!', 'Un trofeo segreto. Continua a pescare!'],
  tro_reward: ['Reward: {x}', 'Награда: {x}', 'Premio: {x}'], tro_moons: ['{n} moons', 'луны: {n}', '{n} lune'],
});

const defTro = (fam, sym, id, names, descs, p) => defAch(id, names, descs, Object.assign({ fam, sym, secret: false }, p));
const troLegends = () => LEGENDS.filter(caught).length;
const troFishCount = () => Object.keys(SPECIES).length;
// How to earn a trophy, in words. Legendary names come from the fish table, so they always match the logbook.
const troDesc = id => t('td_' + id, { bell: t('f_bell'), biscuit: t('f_biscuit') });

// First steps
defTro('first', 'item:rod0', 'firstCast', ['First Cast', 'Первый заброс', 'Primo lancio'], ['Cast your line for the first time.', 'Забрось удочку в первый раз.', 'Lancia la lenza per la prima volta.'],
  { moons: 5, on: 'cast', ok: () => true });
defTro('first', 'sun', 'firstLight', ['First Light', 'Первые лучи', 'Prima luce'], ['Catch your first fish.', 'Поймай свою первую рыбу.', 'Cattura il tuo primo pesce.'],
  { moons: 10, on: 'catch', ok: () => true });
defTro('first', 'flower', 'pondFriends', ['Pond Friends', 'Друзья пруда', 'Amici dello stagno'], ['Log 5 kinds of fish in Sunnybrook Pond.', 'Запиши 5 видов рыб в Солнечном пруду.', 'Registra 5 specie nello Stagno Soleggiato.'],
  { item: 'cricket', on: 'catch', ok: () => logged('pond') >= 5 });
defTro('first', 'eyeI', 'shadowReader', ['Shadow Reader', 'Знаток теней', 'Lettore di ombre'], ['Name 10 kinds of fish from their shadows alone.', 'Узнай 10 видов рыб только по тени.', 'Riconosci 10 specie dalla sola ombra.'],
  { moons: 60, on: 'identify', ok: () => Object.values(S.log).filter(e => e.id).length >= 10 });
defTro('first', 'star', 'firstRecord', ['Bigger Than Before', 'Больше, чем раньше', 'Più grande di prima'], ['Beat your own record for a kind of fish.', 'Побей свой рекорд по любой рыбе.', 'Batti il tuo record per una specie.'],
  { moons: 25, on: 'catch', ok: e => e.record });
defTro('first', 'fish', 'fullOfFish', ['Full of Fish', 'Полно рыбы', 'Pieno di pesci'], ['Catch 50 fish.', 'Поймай 50 рыб.', 'Cattura 50 pesci.'],
  { moons: 100, on: 'catch', ok: () => (S.stat.catches | 0) >= 50 });
// Mastery
defTro('mastery', 'item:line0', 'unsnapped', ['Unsnapped', 'Без обрывов', 'Lenza intatta'], ['Finish a visit with 5 catches or more and no broken line.', 'Закончи рыбалку: 5 рыб или больше и ни одного обрыва.', 'Finisci una visita con 5 catture o più e nessuna lenza spezzata.'],
  { moons: 80, on: 'leave', ok: e => e.catches >= 5 && !e.snaps });
defTro('mastery', 'feather', 'softHands', ['Soft Hands', 'Мягкие руки', 'Mani di velluto'], ['Land a fish that jumped three times.', 'Вытащи рыбу, которая прыгнула три раза.', 'Porta a riva un pesce che ha saltato tre volte.'],
  { item: 'nymph', on: 'catch', ok: e => e.jumps >= 3 });
defTro('mastery', 'yes', 'firstTry', ['First Try', 'С первой попытки', 'Al primo colpo'], ['Hook a kind of fish on its very first bite.', 'Подсеки рыбу нового вида на самой первой поклёвке.', 'Aggancia una specie alla sua primissima abboccata.'],
  { moons: 40, on: 'catch', ok: e => e.firstBite });
defTro('mastery', 'item:rodf1', 'steadyArm', ['Steady Arm', 'Твёрдая рука', 'Braccio fermo'], ['Make 10 perfect casts.', 'Сделай 10 идеальных забросов.', 'Fai 10 lanci perfetti.'],
  { item: 'spinner', on: 'cast', ok: () => (S.stat.perfect | 0) >= 10 });
defTro('mastery', 'shield', 'notFooled', ['Not Fooled', 'Не проведёшь', 'Non ci casco'], ['Land a fish that fakes its bite.', 'Вытащи рыбу, которая обманывает поклёвкой.', 'Porta a riva un pesce che finge di abboccare.'],
  { moons: 50, on: 'catch', ok: e => !!SPECIES[e.id] && SPECIES[e.id].bite === 'fake' });
defTro('mastery', 'item:lines2', 'cleanRun', ['Clean Run', 'Чистая серия', 'Serie pulita'], ['Land 10 fish in a row without a broken line.', 'Вытащи 10 рыб подряд без единого обрыва.', 'Porta a riva 10 pesci di fila senza spezzare la lenza.'],
  { moons: 120, on: 'catch', ok: () => (S.stat.streak | 0) >= 10 });
defTro('mastery', 'item:bignet', 'heavy', ['Heavy Hands', 'Тяжёлый улов', 'Peso massimo'], ['Land a fish of 10 kg or more.', 'Вытащи рыбу весом 10 кг или больше.', 'Porta a riva un pesce di 10 kg o più.'],
  { moons: 150, on: 'catch', ok: e => e.grams >= 10000 });
defTro('mastery', 'item:reel5', 'dragArtist', ['Drag Artist', 'Мастер тормоза', 'Artista della frizione'], ['Win a Very Hard fight or harder after changing the drag mid-fight.', 'Победи в очень трудной борьбе или труднее, подкрутив тормоз прямо во время борьбы.', 'Vinci una lotta molto difficile o peggio regolando la frizione durante la lotta.'],
  { moons: 300, on: 'catch', ok: e => e.tier >= 5 && e.dragChanged });
// Collection
defTro('collect', 'bookI', 'waterKeeper', ['Water Keeper', 'Хранитель воды', 'Custode dell\'acqua'], ['Log every kind of fish in one water.', 'Запиши все виды рыб одного водоёма.', 'Registra tutte le specie di una zona.'],
  { item: 'hat_wizard', on: 'catch', ok: () => AREAS.some(a => a.fish.length && logged(a.id) === a.fish.length) });
defTro('collect', 'star', 'firstLegend', ['Legend', 'Легенда', 'Leggenda'], ['Catch your first Legendary fish.', 'Поймай свою первую легендарную рыбу.', 'Cattura il tuo primo pesce leggendario.'],
  { moons: 100, on: 'catch', ok: e => !!SPECIES[e.id] && !!SPECIES[e.id].legend });
defTro('collect', 'rank:4', 'legendHunter', ['Legend Hunter', 'Охотник за легендами', 'Cacciatore di leggende'], ['Catch 3 Legendary fish.', 'Поймай 3 легендарные рыбы.', 'Cattura 3 pesci leggendari.'],
  { moons: 400, on: 'catch', ok: () => troLegends() >= 3 });
defTro('collect', 'moon', 'halfWater', ['Half the Water', 'Половина пути', 'A metà strada'], ['Log 42 kinds of fish.', 'Запиши 42 вида рыб.', 'Registra 42 specie.'],
  { moons: 500, on: 'catch', ok: () => allLogged() >= 42 });
defTro('collect', 'item:sk_pond', 'nineWaters', ['Nine Waters', 'Девять вод', 'Nove acque'], ['Catch a fish in every water.', 'Поймай рыбу в каждом водоёме.', 'Cattura un pesce in ogni zona.'],
  { moons: 1000, on: 'catch', ok: () => AREAS.every(a => logged(a.id) > 0) });
defTro('collect', 'jar', 'everyShadow', ['Every Shadow Known', 'Все тени известны', 'Ogni ombra conosciuta'], ['Log every kind of fish in the Watchwood.', 'Запиши все виды рыб Дозорного леса.', 'Registra tutte le specie del Bosco di Guardia.'],
  { item: 'hat_crown', on: 'catch', ok: () => troFishCount() > 0 && allLogged() >= troFishCount() });
defTro('collect', 'beam', 'wholeSky', ['The Whole Sky', 'Всё небо', 'Tutto il cielo'], ['Catch and release every Legendary fish.', 'Поймай и отпусти всех легендарных рыб.', 'Cattura e libera tutti i pesci leggendari.'],
  { moons: 5000, on: 'catch', ok: () => LEGENDS.every(caught) });
// Courage
defTro('courage', 'boat', 'setSail', ['Set Sail', 'Поднять паруса', 'Salpare'], ['Take the boat out to sea.', 'Выйди на лодке в море.', 'Porta la barca in mare.'],
  { moons: 50, on: 'travel', ok: e => e.boat });
defTro('courage', 'moon', 'nightOwl', ['Night Owl', 'Ночная сова', 'Gufo notturno'], ['Catch a fish at night.', 'Поймай рыбу ночью.', 'Cattura un pesce di notte.'],
  { moons: 40, on: 'catch', ok: e => e.cond === 'night' });
defTro('courage', 'waveI', 'stormKeeper', ['Storm Keeper', 'Хранитель бури', 'Custode della tempesta'], ['Catch a fish during a Stormbreak squall.', 'Поймай рыбу во время шквала на Штормовом рифе.', 'Cattura un pesce durante una burrasca alla Scogliera delle Tempeste.'],
  { moons: 300, on: 'catch', ok: e => e.cond === 'squall' });
defTro('courage', 'lamp', 'intoDark', ['Into the Dark', 'Во тьму', 'Nel buio'], ['Catch a fish in the Lantern Deep.', 'Поймай рыбу в Фонарной бездне.', 'Cattura un pesce nell\'Abisso delle Lanterne.'],
  { moons: 300, on: 'catch', ok: e => e.area === 'deep' });
defTro('courage', 'bell', 'bellTolls', ['Bell Tolls', 'Звон колокола', 'Suona la campana'], ['Enter the Drowned Chapel.', 'Войди в Затопленную часовню.', 'Entra nella Cappella Sommersa.'],
  { moons: 200, on: ['enter', 'gate'], ok: e => e.entered === true || (e.area === 'chapel' && !e.home) });
defTro('courage', 'item:abyss', 'letDescend', ['Let It Descend', 'Пусть уходит вниз', 'Lascialo scendere'], ['Let a diving giant go down, and still land it.', 'Дай нырнувшему великану уйти вниз и всё равно вытащи его.', 'Lascia scendere un gigante che si tuffa, e portalo a riva lo stesso.'],
  { moons: 600, on: 'catch', ok: e => e.descend });
defTro('courage', 'heartI', 'mercy', ['Mercy of the Deep', 'Милость глубин', 'Clemenza degli abissi'], ['Catch and release {bell}.', 'Поймай и отпусти: {bell}.', 'Cattura e libera: {bell}.'],
  { moons: 3000, on: 'catch', ok: e => e.id === 'bell' });
// Wealth and craft
defTro('wealth', 'item:spinner', 'firstBuy', ['Good Customer', 'Хороший покупатель', 'Buon cliente'], ['Buy something at the Market Perch.', 'Купи что-нибудь в лавке «Жёрдочка».', 'Compra qualcosa alla Bottega del Trespolo.'],
  { moons: 5, on: 'buy', ok: () => true });
defTro('wealth', 'moon', 'fullPurse', ['Full Purse', 'Полный кошелёк', 'Borsellino pieno'], ['Have 1000 moons in your purse at once.', 'Накопи в кошельке 1000 лун.', 'Metti insieme 1000 lune nel borsellino.'],
  { moons: 50, on: 'moons', ok: () => S.moons >= 1000 });
defTro('wealth', 'item:minnow', 'lureLibrary', ['Lure Library', 'Библиотека приманок', 'Biblioteca di esche'], ['Own 10 different lures.', 'Собери 10 разных приманок.', 'Colleziona 10 esche diverse.'],
  { item: 'minnow', on: ['buy', 'catch'], ok: () => Object.values(ITEMS).filter(i => i.kind === 'lure' && (i.free || owns(i.id))).length >= 10 });   // 'catch': a lure may arrive as a trophy's reward
defTro('wealth', 'item:rodp4', 'fullyRigged', ['Fully Rigged', 'Полный арсенал', 'Attrezzatura completa'], ['Own every rod.', 'Собери все удочки.', 'Colleziona tutte le canne.'],
  { moons: 1000, on: 'buy', ok: () => Object.values(ITEMS).every(i => i.kind !== 'rod' || owns(i.id)) });
defTro('wealth', 'cake', 'oldBiscuit', ['Old Biscuit', 'Старый Сухарик', 'Vecchio Biscotto'], ['Beat your own record with {biscuit}.', 'Побей свой рекорд: {biscuit}.', 'Batti il tuo record: {biscuit}.'],
  { moons: 200, on: 'catch', ok: e => e.id === 'biscuit' && e.record });
defTro('wealth', 'rank:7', 'mogul', ['Market Mogul', 'Магнат рынка', 'Magnate del mercato'], ['Earn 10000 moons in all.', 'Заработай 10000 лун за всё время.', 'Guadagna 10000 lune in tutto.'],
  { moons: 500, on: 'moons', ok: () => S.earned >= 10000 });
// Secrets: their name and rule read "?" until earned
defTro('secret', 'item:aurorajig', 'auroraCatch', ['Sky Fish', 'Небесная рыба', 'Pesce del cielo'], ['Catch a fish while the aurora shines.', 'Поймай рыбу, пока горит северное сияние.', 'Cattura un pesce mentre brilla l\'aurora.'],
  { secret: true, item: 'paint5', on: 'catch', ok: e => e.cond === 'aurora' });
defTro('secret', 'leaf', 'lilyCast', ['Lily Landing', 'Точно на лист', 'Atterraggio sulla ninfea'], ['Land a cast right on a lily pad.', 'Попади забросом точно на лист кувшинки.', 'Fai cadere l\'esca proprio su una ninfea.'],
  { secret: true, moons: 30, on: 'cast', ok: e => e.lily });
defTro('secret', 'bird:0', 'magpieFriend', ['The Magpie\'s Friend', 'Дружба с сорокой', 'Amicizia con la gazza'], ['Shop at the Market Perch 20 times.', 'Сделай 20 покупок в лавке «Жёрдочка».', 'Fai 20 acquisti alla Bottega del Trespolo.'],
  { secret: true, item: 'hat_party', on: 'buy', ok: () => (S.stat.buys | 0) >= 20 });
defTro('secret', 'retry', 'oldFriends', ['Old Friends', 'Старые друзья', 'Vecchi amici'], ['Catch the same kind of fish 25 times.', 'Поймай рыбу одного вида 25 раз.', 'Cattura la stessa specie 25 volte.'],
  { secret: true, moons: 100, on: 'catch', ok: e => !!S.log[e.id] && S.log[e.id].n >= 25 });
const TRO_FAMS = ['first', 'mastery', 'collect', 'courage', 'wealth', 'secret'];

// ----- Counters the rules read. Registered before the rules, so a count is up to date when its rule looks. -----
on('cast', e => { if (e.perfect) { bump('perfect'); save(); } });
on('catch', () => { bump('streak'); save(); });                  // fish in a row without a broken line
on('snap', () => { S.stat.streak = 0; save(); });
on('buy', () => { bump('buys'); save(); });
// The logbook remembers a shadow named correctly, even before the first catch.
on('identify', e => { if (!SPECIES[e.id]) return; const r = S.log[e.id] || (S.log[e.id] = { n: 0, best: 0 }); r.id = 1; r.seen = 1; save(); });

// ----- Awarding: once only, saved at once, reward paid, a toast with the badge -----
const troQueue = [];
function troAward(id) {
  const a = ACHS[id];
  if (!a || S.ach[id]) return false;
  S.ach[id] = 1; save();
  troQueue.push(id); if (troQueue.length === 1) troShow();
  if (a.moons) pay(a.moons);                                         // may earn another trophy (purse, lifetime moons): it queues behind
  const it = a.item && ITEMS[a.item];
  if (it) { if (it.kind !== 'lure' && owns(it.id)) pay(it.cost); else give(it.id, it.pack || 1); }
  return true;
}
// One badge toast at a time. It sits on the page itself, not in the scene's overlay, so it outlives a scene change:
// a trophy earned while leaving a water is still shown on the map.
function troShow() {
  const id = troQueue[0];
  if (!id) return;
  const n = add(`<div class="toast tro-toast" role="status">${ic('ach:' + id, 46)}<span><small>${esc(t('tro_new'))}</small><b>${esc(t('t_' + id))}</b></span></div>`, document.body);
  n.style.animationDuration = '2600ms';
  say(t('tro_new') + ' ' + t('t_' + id));
  sfx.sparkle();
  setTimeout(() => { n.remove(); troQueue.shift(); troShow(); }, 2700);
}
// Each rule listens to its own events.
{
  const by = {};
  for (const id in ACHS) for (const evt of [].concat(ACHS[id].on)) (by[evt] || (by[evt] = [])).push(ACHS[id]);
  for (const evt in by) on(evt, e => { for (const a of by[evt]) if (!S.ach[a.id] && a.ok(e || {})) troAward(a.id); });
}

// ----- The badge icon: ic('ach:' + id, px). A carved wooden shape per family, the trophy's sign in the middle. -----
// Earned: warm wood and a coloured rim; not yet: dark and dashed. A secret not yet earned shows only a question mark.
const TRO_SHAPE = {
  first: c => SHAPES.leaf(c),
  mastery: c => c.arc(0, 0, .92, 0, TAU),
  collect: c => SHAPES.drop(c),
  courage: c => { c.moveTo(0, -.95); c.lineTo(.82, -.62); c.quadraticCurveTo(.82, .5, 0, .97); c.quadraticCurveTo(-.82, .5, -.82, -.62); c.closePath(); },
  wealth: c => { for (let i = 0; i < 8; i++) { const g = Math.PI / 8 + i * Math.PI / 4; c.lineTo(Math.cos(g) * .95, Math.sin(g) * .95); } c.closePath(); },
  secret: c => SHAPES.acorn(c),
};
const TRO_RIM = { first: '#6fdc95', mastery: '#ffd24a', collect: '#7fd0ff', courage: '#ff8a7a', wealth: '#f2b93b', secret: '#c9a8ff' };
ICON.eyeI = c => { c.beginPath(); c.moveTo(-.9, 0); c.quadraticCurveTo(0, -.75, .9, 0); c.quadraticCurveTo(0, .75, -.9, 0); c.fillStyle = '#fff6da'; c.fill(); circ(c, 0, 0, .36, '#3a7fd0'); circ(c, 0, 0, .17, '#111'); circ(c, -.1, -.1, .07, '#fff'); };
ICON.waveI = c => { c.beginPath(); c.moveTo(-.95, .6); c.quadraticCurveTo(-.5, -.9, .3, -.5); c.quadraticCurveTo(-.1, -.3, .1, .05); c.quadraticCurveTo(.5, -.1, .95, .6); c.closePath(); c.fillStyle = '#58a6ff'; c.fill(); line(c, [-.5, -.2, -.1, -.55], '#dff0ff', .1); };
ICON.heartI = c => { c.beginPath(); c.moveTo(0, .85); c.bezierCurveTo(-1.1, 0, -.6, -.95, 0, -.4); c.bezierCurveTo(.6, -.95, 1.1, 0, 0, .85); c.fillStyle = '#ff8ab0'; c.fill(); c.lineWidth = .08; c.strokeStyle = '#fff'; c.stroke(); };
ICON.ach = (c, id) => {
  const a = ACHS[id];
  if (!a) return;
  const got = !!S.ach[id], path = TRO_SHAPE[a.fam] || TRO_SHAPE.mastery;
  c.beginPath(); path(c); c.fillStyle = got ? '#b77b45' : '#2a3158'; c.fill();
  c.save(); c.clip();                                                  // wood grain and a carved inner edge
  for (let i = -3; i <= 3; i++) { c.beginPath(); c.ellipse(.2, i * .32, 1.4, .14, .1, 0, TAU); c.lineWidth = .05; c.strokeStyle = got ? 'rgba(90,50,20,.45)' : 'rgba(255,255,255,.06)'; c.stroke(); }
  c.beginPath(); path(c); c.lineWidth = .3; c.strokeStyle = got ? 'rgba(60,30,10,.35)' : 'rgba(0,0,0,.3)'; c.stroke();
  c.restore();
  c.beginPath(); path(c); c.lineWidth = .11; c.strokeStyle = got ? TRO_RIM[a.fam] : 'rgba(255,255,255,.45)';
  if (!got) c.setLineDash([.16, .12]);
  c.stroke(); c.setLineDash([]);
  circ(c, 0, .04, .5, got ? '#5a3418' : 'rgba(0,0,0,.25)');
  if (a.secret && !got) { line(c, [-.2, -.2, -.12, -.36, .05, -.4, .2, -.3, .2, -.14, .02, -.02, 0, .12], 'rgba(255,255,255,.8)', .11); circ(c, 0, .3, .07, 'rgba(255,255,255,.8)'); return; }
  if (!ICON[a.sym.split(':')[0]]) return;
  c.globalAlpha = got ? 1 : .4; drawIcon(c, a.sym, 0, .04, .8); c.globalAlpha = 1;
};
