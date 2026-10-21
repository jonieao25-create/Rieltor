// Cloudflare Worker: один сервис заявок на всех клиентов. Принимает заявку
// из мини-приложения и пересылает её риелтору сообщением от его бота.
// Секреты хранятся в настройках Worker, в репозитории их нет. На каждого
// клиента два секрета, id клиента — из его data.js (clientId), заглавными:
//   BOT_TOKEN_<ID>   — токен бота клиента от @BotFather
//   MANAGER_ID_<ID>  — числовой id чата риелтора (куда присылать заявки)
// Например, для clientId 'ivan': BOT_TOKEN_IVAN и MANAGER_ID_IVAN.
// Старые BOT_TOKEN и MANAGER_ID без суффикса работают для заявок без clientId.
//   ALLOWED_ORIGIN — адрес сайта, например https://jonieao25-create.github.io

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

// Бот и чат клиента по его clientId
function clientSecrets(env, clientId) {
  if (clientId) {
    if (!/^[a-z0-9_]{1,40}$/.test(clientId)) return null;
    const key = clientId.toUpperCase();
    const token = env[`BOT_TOKEN_${key}`];
    const chat = env[`MANAGER_ID_${key}`];
    return token && chat ? { token, chat } : null;
  }
  return env.BOT_TOKEN && env.MANAGER_ID ? { token: env.BOT_TOKEN, chat: env.MANAGER_ID } : null;
}

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

export default {
  async fetch(request, env) {
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

    const secrets = clientSecrets(env, clip(data.clientId, 40));
    if (!secrets) return reply(env, 404, { ok: false });

    const user = await verifyInitData(String(data.initData || ''), secrets.token);
    if (!user) return reply(env, 401, { ok: false });

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

    const tg = await fetch(`https://api.telegram.org/bot${secrets.token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: secrets.chat,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    return reply(env, tg.ok ? 200 : 502, { ok: tg.ok });
  },
};
