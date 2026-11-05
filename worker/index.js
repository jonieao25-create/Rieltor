// Cloudflare Worker: принимает заявку из мини-приложения и пересылает её
// риелтору сообщением от бота. Для каждого клиента — свой Worker с этим
// же кодом и своими секретами (имя, например, leads-ivan). Секреты (токен бота, chat id) хранятся
// в настройках Worker, в репозитории их нет:
//   BOT_TOKEN   — токен бота от @BotFather
//   MANAGER_ID  — числовой id чата риелтора (куда присылать заявки)
//   ALLOWED_ORIGIN — адрес сайта, например https://jonieao25-create.github.io
//
// Второе дело Worker — отвечать боту (адрес /tg). На /start бот присылает
// кнопки под полем ввода, каждая открывает свой раздел мини-приложения.
//   WEBHOOK_SECRET — придуманный вами пароль (латиница и цифры), по нему
//                    Worker узнаёт, что сообщение пришло именно от Telegram
//   APP_URL        — адрес мини-приложения
//   MANAGER        — ник риелтора в Telegram без @ (для кнопки «Связаться»)
//
// Как узнать MANAGER_ID риелтора: он открывает бота, нажимает «Запустить»
// и отправляет команду /myid. Бот отвечает числом — его и вписываем.

const MAX_AGE_SEC = 24 * 60 * 60;

const enc = new TextEncoder();

async function hmac(key, data) {
  const k = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}

const toHex = (buf) => [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');

// Проверка подписи initData: подтверждает, что запрос пришёл из Telegram
async function verifyInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const check = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');
  const secret = await hmac(enc.encode('WebAppData'), botToken);
  const calc = toHex(await hmac(secret, check));
  if (calc !== hash) return null;
  const age = Math.floor(Date.now() / 1000) - Number(params.get('auth_date') || 0);
  if (!(age >= 0 && age <= MAX_AGE_SEC)) return null;
  try {
    return JSON.parse(params.get('user') || 'null');
  } catch {
    return null;
  }
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const clip = (s, n) => String(s == null ? '' : s).trim().slice(0, n);

function cors(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function reply(env, status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(env) },
  });
}

// ---------- бот: кнопки под полем ввода ----------

function tgApi(env, method, body) {
  return fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const CONTACT_BTN = '📞 Связаться';

// Клавиатура 2×2. Кнопка с web_app открывает мини-приложение
// сразу на нужном разделе (?section=... — id раздела из data.js).
function mainKeyboard(env) {
  const app = (section) => ({ web_app: { url: `${env.APP_URL}?section=${section}` } });
  return {
    keyboard: [
      [{ text: '🏢 Новостройки', ...app('newbuilds') }, { text: '🏡 Коттеджные посёлки', ...app('cottages') }],
      [{ text: '🌊 ЖК на Побережье', ...app('coast') }, { text: CONTACT_BTN }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

export async function handleBotUpdate(update, env, deps = {}) {
  const msg = update.message;
  if (!msg || !msg.chat) return;
  const text = msg.text || '';
  const api = deps.tgApi || tgApi;

  if (/^\/stats(?:@[A-Za-z0-9_]+)?(?:\s|$)/.test(text) &&
      msg.from && msg.chat.type === 'private' &&
      String(msg.from.id) === String(env.MANAGER_ID)) {
    await api(env, 'sendMessage', {
      chat_id: msg.chat.id,
      text: await statsReport(env, (deps.now || Date.now)()),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
    return;
  }

  // /myid — бот присылает номер чата. Нужен один раз, чтобы вписать
  // номер риелтора в секрет MANAGER_ID. Свой номер видит только сам человек.
  if (text.trim() === '/myid') {
    await api(env, 'sendMessage', {
      chat_id: msg.chat.id,
      text: `Ваш ID: ${msg.chat.id}\nПерешлите это число тому, кто настраивает бота.`,
      reply_markup: mainKeyboard(env),
    });
    return;
  }

  if (text === CONTACT_BTN) {
    await api(env, 'sendMessage', {
      chat_id: msg.chat.id,
      text: `Напишите мне в Telegram: @${env.MANAGER}\nОтвечу и подберу варианты.`,
      reply_markup: mainKeyboard(env),
    });
    return;
  }

  // /start и любое другое сообщение — приветствие с кнопками
  await api(env, 'sendMessage', {
    chat_id: msg.chat.id,
    text: 'Здравствуйте! Выберите, что вас интересует, кнопкой ниже 👇',
    reply_markup: mainKeyboard(env),
  });
}

// ---------- бот-секретарь Telegram Business ----------

const DAY_SEC = 24 * 60 * 60;
const NEW_AFTER_SEC = 20 * DAY_SEC;
const TZ_OFFSET = 2;

export function isNightAt(timestampMs, offsetHours = TZ_OFFSET) {
  const hour = new Date(timestampMs + offsetHours * 60 * 60 * 1000).getUTCHours();
  return hour >= 20 || hour < 7;
}

export function secretaryDecision({ isNew, isNight, repliedRecently, fromOwner }) {
  if (fromOwner || repliedRecently) return null;
  if (isNew) return 'new';
  return isNight ? 'night' : null;
}

async function businessConnectionCanReply(connectionId, env, api) {
  const key = `conn:${connectionId}`;
  const cached = await env.REPLIES.get(key);
  if (cached) return cached === '1';

  const response = await api(env, 'getBusinessConnection', {
    business_connection_id: connectionId,
  });
  const data = await response.json().catch(() => ({}));
  const connection = data.result || {};
  const allowed = Boolean(
    response.ok &&
    data.ok &&
    connection.is_enabled !== false &&
    connection.rights?.can_reply !== false &&
    String(connection.user?.id) === String(env.MANAGER_ID),
  );
  await env.REPLIES.put(key, allowed ? '1' : '0', { expirationTtl: DAY_SEC });
  return allowed;
}

export async function handleBusinessMessage(message, env, deps = {}) {
  if (!env.REPLIES || !message?.chat || !message?.from || message.from.is_bot) return;
  if (message.chat.type !== 'private' || !message.business_connection_id) return;

  const api = deps.tgApi || tgApi;
  const now = deps.now || Date.now;
  if (!(await businessConnectionCanReply(message.business_connection_id, env, api))) return;

  const seenKey = `seen:${message.chat.id}`;
  const lastKey = `last:${message.chat.id}`;
  const isNew = !(await env.REPLIES.get(seenKey));
  await env.REPLIES.put(seenKey, '1', { expirationTtl: NEW_AFTER_SEC });

  const fromOwner = String(message.from.id) === String(env.MANAGER_ID);
  const repliedRecently = Boolean(await env.REPLIES.get(lastKey));
  const reason = secretaryDecision({
    isNew,
    isNight: isNightAt(now(), TZ_OFFSET),
    repliedRecently,
    fromOwner,
  });
  if (!reason) return;

  const agentName = clip(env.AGENT_NAME || 'Ваш риелтор', 80);
  const text = env.SECRETARY_TEXT ||
    `Здравствуйте! Я ${agentName}, риелтор по недвижимости Калининграда. ` +
    'Сейчас не могу ответить, напишу вам в ближайшее время. ' +
    'А пока можете посмотреть каталог недвижимости 👇';
  const sent = await api(env, 'sendMessage', {
    business_connection_id: message.business_connection_id,
    chat_id: message.chat.id,
    text,
    reply_markup: {
      inline_keyboard: [[{ text: '🏠 Открыть каталог', url: env.BOT_LINK }]],
    },
  });
  if (!sent.ok) return;

  await env.REPLIES.put(lastKey, '1', { expirationTtl: DAY_SEC });
  const user = message.from;
  const name = esc([user.first_name, user.last_name].filter(Boolean).join(' ') || 'клиент');
  const who = user.username
    ? `${name} (@${esc(user.username)})`
    : `<a href="tg://user?id=${user.id}">${name}</a>`;
  await api(env, 'sendMessage', {
    chat_id: env.MANAGER_ID,
    text: `🤖 Бот-секретарь ответил: ${who}\n` +
      (reason === 'new'
        ? 'Причина: новый клиент'
        : 'Причина: нерабочее время (20:00–7:00)'),
    parse_mode: 'HTML',
  });
}

// ---------- статистика приложения ----------

const STAT_TTL = 40 * DAY_SEC;
const MAX_NAMES = 100;

function kldDate(timestampMs) {
  return new Date(timestampMs + TZ_OFFSET * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function kldTime(timestampMs) {
  return new Date(timestampMs + TZ_OFFSET * 60 * 60 * 1000).toISOString().slice(11, 16);
}

async function loadDay(env, date) {
  const raw = await env.REPLIES.get(`stats:${date}`);
  try {
    return raw ? JSON.parse(raw) : { o: 0, s: {}, c: {}, p: {} };
  } catch {
    return { o: 0, s: {}, c: {}, p: {} };
  }
}

function bump(map, id, name) {
  if (!map[id] && Object.keys(map).length >= MAX_NAMES) return;
  const item = map[id] || (map[id] = { n: name, k: 0 });
  item.n = name || item.n;
  item.k += 1;
}

export async function handleStat(data, user, env, nowMs = Date.now()) {
  if (!env.REPLIES || !user || String(user.id) === String(env.MANAGER_ID)) return;
  const event = data?.ev;
  const rawId = clip(data?.id, 40);
  const id = /^[A-Za-z0-9_-]+$/.test(rawId) ? rawId : '';
  const name = clip(data?.name, 80);
  if (!['open', 'section', 'view'].includes(event)) return;

  const date = kldDate(nowMs);
  const day = await loadDay(env, date);
  let what = '';
  if (event === 'open') day.o += 1;
  if (id && name && (event === 'open' || event === 'section')) {
    bump(day.s, id, name);
    what = `раздел «${name}»`;
  }
  if (id && name && event === 'view') {
    bump(day.c, id, name);
    what = `смотрел(а) «${name}»`;
  }

  const person = day.p[user.id] || (day.p[user.id] = {});
  person.n = clip([user.first_name, user.last_name].filter(Boolean).join(' '), 60);
  person.u = clip(user.username, 40);
  person.t = nowMs;
  if (what) person.w = what;
  await env.REPLIES.put(`stats:${date}`, JSON.stringify(day), { expirationTtl: STAT_TTL });
}

function plural(number, one, few, many) {
  const last = number % 10;
  const lastTwo = number % 100;
  if (last === 1 && lastTwo !== 11) return one;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}

function top(maps, count) {
  const totals = {};
  for (const map of maps) {
    for (const [id, item] of Object.entries(map)) {
      const total = totals[id] || (totals[id] = { n: item.n, k: 0 });
      total.k += item.k;
    }
  }
  return Object.values(totals).sort((a, b) => b.k - a.k).slice(0, count);
}

export async function statsReport(env, nowMs = Date.now()) {
  if (!env.REPLIES) return 'Статистика не подключена: нет хранилища REPLIES.';
  const days = await Promise.all(
    [...Array(30).keys()].map((index) => loadDay(env, kldDate(nowMs - index * DAY_SEC * 1000))),
  );
  const period = (count) => {
    const selected = days.slice(0, count);
    const opens = selected.reduce((sum, day) => sum + day.o, 0);
    const people = new Set(selected.flatMap((day) => Object.keys(day.p))).size;
    return `${opens} ${plural(opens, 'открытие', 'открытия', 'открытий')} · ` +
      `${people} ${plural(people, 'человек', 'человека', 'человек')}`;
  };
  const lines = [
    '📊 <b>Статистика приложения</b>',
    '',
    `Сегодня: ${period(1)}`,
    `За 7 дней: ${period(7)}`,
    `За 30 дней: ${period(30)}`,
  ];

  const complexes = top(days.map((day) => day.c), 5);
  if (complexes.length) {
    lines.push('', '🏆 <b>Чаще смотрели (30 дней):</b>');
    complexes.forEach((item, index) => lines.push(`${index + 1}. ${esc(item.n)} — ${item.k}`));
  }
  const sections = top(days.map((day) => day.s), 10);
  if (sections.length) {
    lines.push('', '📂 Разделы: ' + sections.map((item) => `${esc(item.n)} ${item.k}`).join(' · '));
  }

  const recentById = {};
  for (const day of days.slice(0, 2)) {
    for (const [id, person] of Object.entries(day.p)) {
      if (!recentById[id] || recentById[id].t < person.t) recentById[id] = { ...person, id };
    }
  }
  const recent = Object.values(recentById).sort((a, b) => b.t - a.t).slice(0, 5);
  if (recent.length) {
    lines.push('', '👤 <b>Последние посетители:</b>');
    const today = kldDate(nowMs);
    for (const person of recent) {
      const name = esc(person.n || 'клиент');
      const who = person.u
        ? `${name} (@${esc(person.u)})`
        : `<a href="tg://user?id=${person.id}">${name}</a>`;
      const when = (kldDate(person.t) === today ? '' : 'вчера ') + kldTime(person.t);
      lines.push(`• ${who}, ${when}${person.w ? ', ' + esc(person.w) : ''}`);
    }
  }
  if (!days.some((day) => day.o || Object.keys(day.p).length)) {
    lines.push('', 'Пока заходов нет: счёт идёт с момента включения статистики.');
  }
  return lines.join('\n');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Сообщения от Telegram для бота
    if (url.pathname === '/tg') {
      if (request.method !== 'POST' ||
          request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) {
        return new Response('forbidden', { status: 403 });
      }
      try {
        const update = await request.json();
        if (update.business_message) await handleBusinessMessage(update.business_message, env);
        else await handleBotUpdate(update, env);
      } catch (e) {
        // отвечаем 200 в любом случае, иначе Telegram будет слать то же сообщение снова
      }
      return new Response('ok');
    }

    // Один раз подключить бота к Worker: открыть в браузере
    //   https://<адрес worker>/setup?key=<WEBHOOK_SECRET>
    if (url.pathname === '/setup') {
      if (!env.WEBHOOK_SECRET || url.searchParams.get('key') !== env.WEBHOOK_SECRET) {
        return new Response('wrong key', { status: 403 });
      }
      const r = await tgApi(env, 'setWebhook', {
        url: `${url.origin}/tg`,
        secret_token: env.WEBHOOK_SECRET,
        allowed_updates: ['message', 'business_message', 'business_connection'],
      });
      return new Response(await r.text(), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(env) });
    }
    if (request.method !== 'POST') return reply(env, 405, { ok: false });
    if (request.headers.get('Origin') !== env.ALLOWED_ORIGIN) {
      return reply(env, 403, { ok: false });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return reply(env, 400, { ok: false });
    }

    const user = await verifyInitData(String(data.initData || ''), env.BOT_TOKEN);
    if (!user) return reply(env, 401, { ok: false });

    if (data.action === 'stat') {
      await handleStat(data.data || {}, user, env);
      return reply(env, 200, { ok: true });
    }

    const complex = clip(data.complex, 80);
    const room = clip(data.room, 60);
    const name = clip(data.name, 80);
    const phone = clip(data.phone, 30);
    if (!complex) return reply(env, 400, { ok: false });

    const who = user.username
      ? `@${esc(user.username)}`
      : `<a href="tg://user?id=${user.id}">${esc(user.first_name || 'клиент')}</a>`;

    const text = [
      '🏠 <b>Новая заявка</b>',
      `ЖК: <b>${esc(complex)}</b>`,
      room ? `Квартира: ${esc(room)}` : '',
      name ? `Имя: ${esc(name)}` : '',
      phone ? `Телефон: ${esc(phone)}` : 'Телефон: не указан',
      `Telegram: ${who}`,
    ]
      .filter(Boolean)
      .join('\n');

    const tg = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.MANAGER_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    return reply(env, tg.ok ? 200 : 502, { ok: tg.ok });
  },
};
