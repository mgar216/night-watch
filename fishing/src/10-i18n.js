// ---------- Localization: every UI string, [English, Russian, Italian] side by side ----------
// This file holds the shared strings. Each part of the game adds its own rows to the same table L
// (fish names and notes through defFish, shop goods through defItem, trophies through defAch).
const LANGS = ['en', 'ru', 'it'];
const L = {
  title: ['First Light Fishing', 'Рыбалка на рассвете', 'Pesca alle prime luci'],
  sub: ['A Night Watch Expedition', 'Экспедиция Ночного патруля', 'Una spedizione della Guardia Notturna'],
  lang: ['Language', 'Язык', 'Lingua'],
  langName: ['English', 'Русский', 'Italiano'],
  play: ['Set out', 'В путь', 'Si parte'],
  ok: ['OK', 'Хорошо', 'OK'],
  yes: ['Yes', 'Да', 'Sì'],
  no: ['No', 'Нет', 'No'],
  back: ['Back', 'Назад', 'Indietro'],
  home: ['Home', 'Домой', 'Casa'],
  sound: ['Sound', 'Звук', 'Suono'],
  volume: ['Volume', 'Громкость', 'Volume'],
  sister: ['The Night Watch', 'Ночной патруль', 'La Guardia Notturna'],
  day_start: ['First light. The day is yours, Chief!', 'Рассвет. Весь день твой, командир!', 'Prime luci. La giornata è tua, Capo!'],
  day_low: ['The sun is getting low. The treehouse is waiting.', 'Солнце клонится к закату. Домик на дереве ждёт.', 'Il sole sta calando. La casa sull\'albero ti aspetta.'],
  day_back: ['Night Watch', 'Ночной патруль', 'Guardia Notturna'],   // short: four buttons share two rows of the treehouse panel on a phone held sideways
  nameAsk: ['What is your name, Chief?', 'Как тебя зовут, командир?', 'Come ti chiami, Capo?'],
  nameDef: ['Chief', 'Командир', 'Capo'],
  moons: ['Moons', 'Луны', 'Lune'],
  map: ['The Watchwood', 'Дозорный лес', 'Il Bosco di Guardia'],
  tree: ['Treehouse', 'Домик на дереве', 'Casa sull\'albero'],
  book: ['Logbook', 'Журнал', 'Diario di pesca'],
  shop: ['The Market Perch', 'Лавка «Жёрдочка»', 'La Bottega del Trespolo'],
  trophies: ['The Trophy Branch', 'Ветка трофеев', 'Il Ramo dei Trofei'],
  records: ['Record boards', 'Доска рекордов', 'Bacheca dei record'],

  // difficulty tiers: the number of moons on a plaque
  tier1: ['Very easy', 'Очень легко', 'Molto facile'], tier2: ['Easy', 'Легко', 'Facile'], tier3: ['Medium', 'Средне', 'Medio'],
  tier4: ['Hard', 'Трудно', 'Difficile'], tier5: ['Very hard', 'Очень трудно', 'Molto difficile'], tier6: ['Extreme', 'Запредельно', 'Estremo'],
  tier7: ['Nightmare', 'Кошмар', 'Incubo'],
  tackleLv: ['Tackle level {n}', 'Снасти: уровень {n}', 'Attrezzatura: livello {n}'],

  // the nine waters, and the plain warning on each plaque
  a_pond: ['Sunnybrook Pond', 'Солнечный пруд', 'Stagno Soleggiato'],
  a_creek: ['Willow Creek', 'Ивовый ручей', 'Ruscello dei Salici'],
  a_pier: ['Harbor Lights Pier', 'Причал Огоньков', 'Molo delle Lanterne'],
  a_falls: ['Rainveil Falls', 'Водопад Дождевая Вуаль', 'Cascata Velo di Pioggia'],
  a_mill: ['The Sunken Mill', 'Затонувшая мельница', 'Il Mulino Sommerso'],
  a_ice: ['The Frozen Reach', 'Ледяной плёс', 'La Distesa Ghiacciata'],
  a_reef: ['Stormbreak Reef', 'Штормовой риф', 'Scogliera delle Tempeste'],
  a_deep: ['The Lantern Deep', 'Фонарная бездна', 'L\'Abisso delle Lanterne'],
  a_chapel: ['The Drowned Chapel', 'Затопленная часовня', 'La Cappella Sommersa'],
  w_pond: ['Sleepy water. Fish bite anything.', 'Сонная вода. Рыба клюёт на всё.', 'Acqua sonnolenta. I pesci abboccano a tutto.'],
  w_creek: ['A light current carries your lure.', 'Лёгкое течение уносит приманку.', 'Una corrente leggera porta via l\'esca.'],
  w_pier: ['Wary fish. They choose their food.', 'Осторожная рыба. Она разборчива в еде.', 'Pesci guardinghi. Scelgono cosa mangiare.'],
  w_falls: ['Rain hides the shadows.', 'Дождь прячет тени.', 'La pioggia nasconde le ombre.'],
  w_mill: ['Snags everywhere. Mind your cast.', 'Кругом коряги. Бросай аккуратно.', 'Rami sommersi ovunque. Lancia con cura.'],
  w_ice: ['Stiff line on the ice. Go gently.', 'На льду леска жёсткая. Тяни мягко.', 'Lenza rigida sul ghiaccio. Vai piano.'],
  w_reef: ['Open sea. Swells, gusts and squalls.', 'Открытое море. Волны, порывы ветра и шквалы.', 'Mare aperto. Onde, raffiche e burrasche.'],
  w_deep: ['Black water. Fights last for minutes.', 'Чёрная вода. Борьба длится минуты.', 'Acqua nera. Le lotte durano minuti.'],
  w_chapel: ['The water is wrong here.', 'Здесь с водой что-то не так.', 'Qui l\'acqua non è come dovrebbe.'],

  // gates on the map
  locked: ['Locked', 'Закрыто', 'Chiuso'],
  needLog: ['Log {n} species in {a}', 'Запиши {n} видов: {a}', 'Registra {n} specie: {a}'],
  needFish: ['Catch {f}', 'Поймай: {f}', 'Cattura: {f}'],
  needBoat: ['You need the boat', 'Нужна лодка', 'Serve la barca'],
  orWord: ['or', 'или', 'o'],
  // the Drowned Chapel is opt-in: the owl asks first, in the kindest voice
  gate1: ['The water is wrong here, Chief.', 'Здесь с водой что-то не так, командир.', 'Qui l\'acqua non è come dovrebbe, Capo.'],
  gate2: ['Grown-ups have turned back.', 'Даже взрослые поворачивали назад.', 'Anche i grandi sono tornati indietro.'],
  gate3: ['You do not have to fish this water. It will wait.', 'Тебе не обязательно здесь рыбачить. Вода подождёт.', 'Non c\'è bisogno di pescare in quest\'acqua. Saprà aspettare.'],
  gateGo: ['I will go in', 'Я войду', 'Entro'],
  gateNo: ['Turn back', 'Вернуться', 'Torno indietro'],

  // angler ranks, by the number of species in the logbook
  rank0: ['Reed', 'Тростинка', 'Giunco'], rank1: ['Brook', 'Ручей', 'Ruscello'], rank2: ['River', 'Река', 'Fiume'], rank3: ['Lake', 'Озеро', 'Lago'],
  rank4: ['Sea', 'Море', 'Mare'], rank5: ['Storm', 'Шторм', 'Tempesta'], rank6: ['Abyss', 'Бездна', 'Abisso'], rank7: ['Bell', 'Колокол', 'Campana'],
  rankIs: ['Angler rank: {r}', 'Твой ранг: {r}', 'Il tuo grado: {r}'],

  u_g: ['g', 'г', 'g'], u_kg: ['kg', 'кг', 'kg'],
};

let lang = 0;
function t(key, vars) {
  const row = L[key];
  let s = row ? row[lang] : key;
  if (vars) for (const k in vars) s = s.replace('{' + k + '}', () => vars[k]);   // a function, so a name like "$&" is inserted as typed
  return s;
}
// "3 days", "5 дней": forms are "one|other" (en, it) or "one|few|many" (ru); Intl.PluralRules picks one.
function plural(key, n) {
  const forms = L[key][lang].split('|');
  const cat = new Intl.PluralRules(LANGS[lang]).select(n);
  const i = cat === 'one' ? 0 : forms.length === 3 && cat !== 'few' ? 2 : 1;
  return n + ' ' + forms[i];
}
// A weight in grams as "350 g" or "1.25 kg".
const fmtW = g => g < 1000 ? `${Math.round(g)} ${t('u_g')}` : `${(g / 1000).toFixed(g < 10000 ? 2 : 1).replace('.', lang ? ',' : '.')} ${t('u_kg')}`;
