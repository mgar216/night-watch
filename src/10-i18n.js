// ---------- Localization: every UI string, [English, Russian, Italian] side by side ----------
const LANGS = ['en', 'ru', 'it'];
const L = {
  title: ['The Night Watch', 'Ночной патруль', 'La Guardia Notturna'],
  lang: ['Language', 'Язык', 'Lingua'],
  langName: ['English', 'Русский', 'Italiano'],   // each language under its own name, whatever the current language is
  foot: ['A game about watching carefully, checking kindly, and building cleverly.',
    'Игра о том, как смотреть внимательно, проверять по-доброму и строить с умом.',
    'Un gioco per osservare con attenzione, controllare con gentilezza e costruire con ingegno.'],
  play: ['Play', 'Играть', 'Gioca'],
  ok: ['OK', 'Хорошо', 'OK'],
  go: ['Go!', 'Вперёд!', 'Via!'],
  retry: ['Try again', 'Ещё раз', 'Riprova'],
  home: ['Home', 'Домой', 'Casa'],
  sound: ['Sound', 'Звук', 'Suono'],
  done: ['Done', 'Готово', 'Fatto'],
  night: ['Night {n}', 'Ночь {n}', 'Notte {n}'],
  nameAsk: ['What is your name, Chief?', 'Как тебя зовут, командир?', 'Come ti chiami, Capo?'],
  nameDef: ['Chief', 'Командир', 'Capo'],
  win: ['Well done, Chief!', 'Молодец, командир!', 'Ottimo lavoro, Capo!'],
  bonus: ['Bonus star!', 'Звезда в подарок!', 'Stella bonus!'],
  soft: ['The magpies were extra sneaky tonight.', 'Этой ночью сороки были особенно хитрыми.', 'Stanotte le gazze erano furbissime.'],

  rank0: ['Cadet', 'Кадет', 'Recluta'],
  rank1: ['Guard', 'Страж', 'Guardia'],
  rank2: ['Senior Guard', 'Старший страж', 'Guardia Scelta'],
  rank3: ['Night Watch Chief', 'Командир Ночного патруля', 'Capo della Guardia Notturna'],
  promo: ['You are now: {r}!', 'Теперь ты — {r}!', 'Ora sei {r}!'],
  finale: ['The whole forest cheers for you, {n}!', 'Весь лес радуется за тебя, {n}!', 'Tutto il bosco fa festa per te, {n}!'],
  badgeTitle: ['Night Watch Badge', 'Значок Ночного патруля', 'Distintivo della Guardia Notturna'],
  nights: ['Nights', 'Ночи', 'Notti'],

  b1: ['Welcome, Chief! Keep our firefly jars safe.', 'Привет, командир! Береги наши банки со светлячками.', 'Ciao, Capo! Proteggi i nostri barattoli di lucciole.'],
  b2: ['Friends are not thieves. Look twice.', 'Друзья — не воришки. Смотри внимательно.', 'Gli amici non sono ladri. Guarda bene.'],
  b3: ['More cameras tonight. Watch them all.', 'Этой ночью камер больше. Следи за всеми.', 'Stanotte ci sono più telecamere. Guardale tutte.'],
  b4: ['Tricksters wear disguises. Check both things!', 'Хитрецы переодеваются. Проверяй и то, и другое!', 'I furbetti si travestono. Controlla tutte e due le cose!'],
  b5: ['Two magpies may come together.', 'Сороки могут прийти вдвоём.', 'Le gazze possono arrivare in due.'],
  b6: ['Nine cameras now. Stay calm, Chief.', 'Теперь девять камер. Спокойно, командир.', 'Ora ci sono nove telecamere. Calma, Capo.'],
  b7: ['The big night. You can do it!', 'Главная ночь. У тебя всё получится!', 'La grande notte. Ce la farai!'],
  b8: ['Another night. The forest trusts you.', 'Новая ночь. Лес верит в тебя.', 'Un\'altra notte. Il bosco si fida di te.'],
  jarsBack: ['Zip brought the jars home!', 'Зип вернул банки домой!', 'Zip ha riportato i barattoli a casa!'],

  s_cam: ['Camera Watch', 'Камеры', 'Telecamere'],
  s_gate: ['Gate Check', 'Ворота', 'Cancello'],
  s_forge: ['Password Forge', 'Кузница паролей', 'Fucina delle password'],
  s_tinker: ['Tinker Treehouse', 'Мастерская', 'Officina'],
  raidGo: ['The magpies are coming!', 'Сороки летят!', 'Arrivano le gazze!'],
  raid0: ['All jars are safe. Wonderful, Chief!', 'Все банки на месте. Чудесно, командир!', 'Tutti i barattoli sono al sicuro. Che meraviglia, Capo!'],
  raid1: ['The magpies took a jar or two. Zip will bring them back.', 'Сороки утащили банку-другую. Зип их вернёт.', 'Le gazze hanno preso qualche barattolo. Zip li riporterà.'],
  raid2: ['Let\'s build better defenses!', 'Давай укрепим наш домик!', 'Rinforziamo la casa sull\'albero!'],

  camIntro: ['Tap a magpie to shine your light.', 'Нажми на сороку — посвети фонариком.', 'Tocca una gazza per illuminarla.'],
  camTipFriend: ['Zip and fireflies are friends. Look for the white belly.', 'Зип и светлячки — друзья. Ищи белое брюшко.', 'Zip e le lucciole sono amici. Cerca la pancia bianca.'],
  camTipBatt: ['Let the flashlight rest. Tap only magpies.', 'Дай фонарику отдохнуть. Свети только на сороку.', 'Fai riposare la torcia. Tocca solo le gazze.'],
  camTipSlow: ['Watch the leaves shake. Tap when it steps out.', 'Смотри, где шевелятся листья. Жми, когда сорока выйдет.', 'Guarda le foglie che si muovono. Tocca quando la gazza esce.'],
  camTipDecoy: ['A shadow has no eyes. Magpies do!', 'У тени нет глаз. А у сороки есть!', 'Un\'ombra non ha occhi. Le gazze sì!'],
  camTipTime: ['Stay with the cameras, Chief. You can do it.', 'Не отходи от камер, командир. Ты справишься.', 'Tieni d\'occhio le telecamere, Capo. Ce la fai.'],
  nestOk: ['The jars are safe in the nest. We will get them back.', 'Банки целы — они в сорочьем гнезде. Мы их вернём.', 'I barattoli sono al sicuro nel nido. Li riprenderemo.'],

  gateIntro: ['Friends have the badge AND the password.', 'У друзей есть и значок, И пароль.', 'Gli amici hanno il distintivo E la parola segreta.'],
  letIn: ['LET IN', 'ВПУСТИТЬ', 'ENTRA'],
  shoo: ['SHOO', 'КЫШ', 'SCIÒ'],
  pass: ['Password', 'Пароль', 'Parola segreta'],
  badge: ['Badge', 'Значок', 'Distintivo'],
  gateTip: ['Check the badge AND the password, Chief.', 'Проверяй и значок, И пароль, командир.', 'Controlla il distintivo E la parola segreta, Capo.'],
  gateTipFriend: ['Friends have both. Let them in, Chief.', 'У друзей есть и то, и другое. Впускай их, командир.', 'Gli amici hanno tutte e due le cose. Falli entrare, Capo.'],
  gateOops: ['That was a friend. Look again next time.', 'Это был друг. В следующий раз смотри внимательнее.', 'Era un amico. La prossima volta guarda meglio.'],
  please: ['Pleeease?', 'Ну пожааалуйста!', 'Per favoreee!'],
  lost: ['I lost my badge!', 'Мой значок потерялся!', 'Ho perso il distintivo!'],
  streak: ['{n} in a row!', '{n} подряд!', '{n} di fila!'],
  alarm: ['Zip rings the alarm!', 'Зип поднял тревогу!', 'Zip dà l\'allarme!'],

  moon: ['moon', 'луна', 'luna'], berry: ['berry', 'ягода', 'bacca'], star: ['star', 'звезда', 'stella'], leaf: ['leaf', 'лист', 'foglia'],
  acorn: ['acorn', 'жёлудь', 'ghianda'], mushroom: ['mushroom', 'гриб', 'fungo'], feather: ['feather', 'перо', 'piuma'], flower: ['flower', 'цветок', 'fiore'],
  sun: ['sun', 'солнце', 'sole'], pizza: ['pizza', 'пицца', 'pizza'], dragon: ['dragon', 'дракон', 'drago'], banana: ['banana', 'банан', 'banana'],
  rocket: ['rocket', 'ракета', 'razzo'], cat: ['cat', 'кот', 'gatto'], fish: ['fish', 'рыба', 'pesce'], cake: ['cake', 'торт', 'torta'],
  robot: ['robot', 'робот', 'robot'], frog: ['frog', 'лягушка', 'rana'], boat: ['boat', 'лодка', 'barca'], drum: ['drum', 'барабан', 'tamburo'],

  forgeIntro: ['Build a long password. Words are bricks!', 'Собери длинный пароль. Слова — это кирпичики!', 'Costruisci una password lunga. Le parole sono mattoni!'],
  tryIt: ['Try it', 'Проверить', 'Prova'],
  goal: ['Goal', 'Цель', 'Obiettivo'],
  forgeTipWord: ['Add one more word, Chief. Words are bricks.', 'Добавь ещё слово, командир. Слова — это кирпичики.', 'Aggiungi un\'altra parola, Capo. Le parole sono mattoni.'],
  forgeTipSame: ['Use different words. Twins are easy to guess.', 'Бери разные слова. Одинаковые легко угадать.', 'Usa parole diverse. Quelle uguali si indovinano subito.'],
  forgeTipMix: ['Mix in a number and a symbol.', 'Добавь число и знак.', 'Aggiungi un numero e un simbolo.'],
  forgeTipFull: ['No room left! Swap small tiles for words.', 'Места больше нет! Замени мелкие кирпичики словами.', 'Non c\'è più posto! Cambia le tessere piccole con parole.'],
  forgeWin: ['The vault is locked tight!', 'Хранилище заперто крепко-накрепко!', 'La cassaforte è chiusa a doppia mandata!'],
  cracked: ['Cracked! Time: {t}', 'Взломано! Время: {t}', 'Scoperta! Tempo: {t}'],
  g_target: ['Reach the goal', 'Дойди до цели', 'Raggiungi l\'obiettivo'],
  g_few: ['{n} tiles or fewer', 'Не больше {n} кирпичиков', 'Al massimo {n} tessere'],
  g_mix: ['3 words + number + symbol', '3 слова + число + знак', '3 parole + numero + simbolo'],
  // plural forms: en/it "one|other", ru "one|few|many"
  u_s: ['second|seconds', 'секунда|секунды|секунд', 'secondo|secondi'],
  u_m: ['minute|minutes', 'минута|минуты|минут', 'minuto|minuti'],
  u_h: ['hour|hours', 'час|часа|часов', 'ora|ore'],
  u_d: ['day|days', 'день|дня|дней', 'giorno|giorni'],
  u_y: ['year|years', 'год|года|лет', 'anno|anni'],
  u_c: ['century|centuries', 'век|века|веков', 'secolo|secoli'],
  oldest: ['longer than the oldest tree', 'дольше самого старого дерева', 'più a lungo dell\'albero più vecchio'],

  i_cam: ['Camera', 'Камера', 'Telecamera'], i_lamp: ['Lantern', 'Фонарь', 'Lanterna'],
  i_bell: ['Gate bell', 'Колокольчик', 'Campanella'], i_shield: ['Vault shield', 'Щит', 'Scudo'],
  i_banner: ['Flags', 'Флажки', 'Bandierine'], i_flowers: ['Flower box', 'Цветы', 'Fiori'],
  i_scope: ['Telescope', 'Телескоп', 'Telescopio'], i_lights: ['String lights', 'Гирлянда', 'Lucine'],
  testRaid: ['TEST RAID', 'ПРОБНЫЙ НАЛЁТ', 'FINTO ASSALTO'],
  tinkerIntro: ['Place cameras. Then test your idea!', 'Расставь камеры. Потом проверь свою идею!', 'Metti le telecamere. Poi prova la tua idea!'],
  poor: ['Not enough moonbeams', 'Не хватает лунных лучиков', 'Non bastano i raggi di luna'],
  o_none: ['No cameras yet. Try one on a branch, Chief.', 'Камер пока нет. Поставь одну на ветку, командир.', 'Ancora nessuna telecamera. Mettine una su un ramo, Capo.'],
  o_route: ['{r} had no camera, Chief.', '{r} — там не было камеры, командир.', '{r}: lì non c\'era una telecamera, Capo.'],
  o_busy: ['{r} was too busy for one camera. A lantern slows magpies down.', '{r} — одна камера не успела. Фонарь задержит воришек.', '{r}: una telecamera non bastava. Una lanterna rallenta le gazze.'],
  o_bell: ['The bell works best by the ladder, Chief.', 'Колокольчик лучше всего работает у лестницы, командир.', 'La campanella funziona meglio vicino alla scala, Capo.'],
  o_great: ['Not one magpie got close. Great design, Chief!', 'Ни одна сорока не подобралась. Отличный план, командир!', 'Nessuna gazza si è avvicinata. Ottimo progetto, Capo!'],
  giveUp: ['The magpies give up!', 'Сороки сдаются!', 'Le gazze si arrendono!'],
  r_lt: ['The top left branch', 'Левая верхняя ветка', 'Il ramo in alto a sinistra'],
  r_rt: ['The top right branch', 'Правая верхняя ветка', 'Il ramo in alto a destra'],
  r_lb: ['The low left branch', 'Левая нижняя ветка', 'Il ramo in basso a sinistra'],
  r_rb: ['The low right branch', 'Правая нижняя ветка', 'Il ramo in basso a destra'],
  r_lad: ['The ladder', 'Лестница', 'La scala'],
  r_sky: ['The roof', 'Крыша', 'Il tetto'],
};

let lang = 0;
function t(key, vars) {
  const row = L[key];
  let s = row ? row[lang] : key;
  if (vars) for (const k in vars) s = s.replace('{' + k + '}', () => vars[k]);   // a function, so a name like "$&" is inserted as typed
  return s;
}
// "3 days", "5 дней": Intl.PluralRules picks the form (one / few / many).
function plural(key, n) {
  const forms = L[key][lang].split('|');
  const cat = new Intl.PluralRules(LANGS[lang]).select(n);
  const i = cat === 'one' ? 0 : forms.length === 3 && cat !== 'few' ? 2 : 1;
  return n + ' ' + forms[i];
}
