import assert from 'node:assert/strict';
import test from 'node:test';
import * as worker from './index.js';

const DAY = 24 * 60 * 60;

class FakeKV {
  constructor(seed = {}) {
    this.values = new Map(Object.entries(seed));
    this.puts = [];
  }
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value, options = {}) {
    this.values.set(key, value);
    this.puts.push({ key, value, options });
  }
}

function businessMessage(overrides = {}) {
  return {
    business_connection_id: 'business-1',
    chat: { id: 700, type: 'private' },
    from: { id: 900, first_name: 'Иван', username: 'ivan', is_bot: false },
    ...overrides,
  };
}

function telegramFake(options = {}) {
  const calls = [];
  const api = async (_env, method, body) => {
    calls.push({ method, body });
    if (method === 'getBusinessConnection') {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          result: {
            id: 'business-1',
            user: { id: options.ownerId ?? 500 },
            user_chat_id: 500,
            date: 1,
            is_enabled: options.enabled ?? true,
            rights: { can_reply: options.canReply ?? true },
          },
        }),
      };
    }
    if (method === 'sendMessage' && body.business_connection_id) {
      return { ok: options.businessSendOk ?? true };
    }
    return { ok: true };
  };
  return { api, calls };
}

function envWith(kv = new FakeKV()) {
  return {
    REPLIES: kv,
    MANAGER_ID: '500',
    AGENT_NAME: 'Светлана',
    BOT_LINK: 'https://t.me/Svetlana_Rieltor_KLD_bot',
    BOT_TOKEN: 'not-a-real-token',
  };
}

async function signedInitData(botToken, user, authDate = Math.floor(Date.now() / 1000)) {
  const params = new URLSearchParams({ auth_date: String(authDate), user: JSON.stringify(user) });
  const check = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
  const enc = new TextEncoder();
  const importHmac = (key) => crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const webAppKey = await importHmac(enc.encode('WebAppData'));
  const secret = new Uint8Array(await crypto.subtle.sign('HMAC', webAppKey, enc.encode(botToken)));
  const secretKey = await importHmac(secret);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', secretKey, enc.encode(check)));
  params.set('hash', [...signature].map((b) => b.toString(16).padStart(2, '0')).join(''));
  return params.toString();
}

test('secretary decision prioritizes a new client and respects the daily limiter', () => {
  assert.equal(typeof worker.secretaryDecision, 'function');
  assert.equal(worker.secretaryDecision({ isNew: true, isNight: false, repliedRecently: false, fromOwner: false }), 'new');
  assert.equal(worker.secretaryDecision({ isNew: true, isNight: true, repliedRecently: true, fromOwner: false }), null);
  assert.equal(worker.secretaryDecision({ isNew: true, isNight: true, repliedRecently: false, fromOwner: true }), null);
});

test('secretary decision replies to a familiar client only at night', () => {
  assert.equal(worker.secretaryDecision({ isNew: false, isNight: true, repliedRecently: false, fromOwner: false }), 'night');
  assert.equal(worker.secretaryDecision({ isNew: false, isNight: false, repliedRecently: false, fromOwner: false }), null);
});

test('Kaliningrad night boundaries are 20:00 inclusive and 07:00 exclusive', () => {
  const atKld = (hour, minute) => Date.UTC(2026, 10, 5, hour - 2, minute);
  assert.equal(worker.isNightAt(atKld(19, 59), 2), false);
  assert.equal(worker.isNightAt(atKld(20, 0), 2), true);
  assert.equal(worker.isNightAt(atKld(6, 59), 2), true);
  assert.equal(worker.isNightAt(atKld(7, 0), 2), false);
});

test('unknown business chat replies, records 20 days and notifies the manager', async () => {
  const kv = new FakeKV();
  const telegram = telegramFake();
  await worker.handleBusinessMessage(businessMessage(), envWith(kv), {
    now: () => Date.UTC(2026, 10, 5, 10),
    tgApi: telegram.api,
  });

  assert.deepEqual(kv.puts.find((x) => x.key === 'seen:700')?.options, { expirationTtl: 20 * DAY });
  assert.deepEqual(kv.puts.find((x) => x.key === 'last:700')?.options, { expirationTtl: DAY });
  const reply = telegram.calls.find((x) => x.method === 'sendMessage' && x.body.business_connection_id);
  assert.match(reply.body.text, /Я Светлана/);
  assert.equal(reply.body.reply_markup.inline_keyboard[0][0].url, 'https://t.me/Svetlana_Rieltor_KLD_bot');
  const notice = telegram.calls.find((x) => x.method === 'sendMessage' && x.body.chat_id === '500');
  assert.match(notice.body.text, /Причина: новый клиент/);
});

test('owner outgoing message refreshes familiarity without replying', async () => {
  const kv = new FakeKV();
  const telegram = telegramFake();
  await worker.handleBusinessMessage(
    businessMessage({ from: { id: 500, first_name: 'Светлана', is_bot: false } }),
    envWith(kv),
    { now: () => Date.UTC(2026, 10, 5, 10), tgApi: telegram.api },
  );
  assert.ok(kv.puts.some((x) => x.key === 'seen:700'));
  assert.equal(telegram.calls.filter((x) => x.method === 'sendMessage').length, 0);
});

test('bots and non-private chats are ignored before connection lookup', async () => {
  for (const message of [
    businessMessage({ from: { id: 900, is_bot: true } }),
    businessMessage({ chat: { id: 700, type: 'group' } }),
  ]) {
    const telegram = telegramFake();
    await worker.handleBusinessMessage(message, envWith(), { now: Date.now, tgApi: telegram.api });
    assert.equal(telegram.calls.length, 0);
  }
});

test('recent daily reply prevents another business reply', async () => {
  const kv = new FakeKV({ 'seen:700': '1', 'last:700': '1' });
  const telegram = telegramFake();
  await worker.handleBusinessMessage(businessMessage(), envWith(kv), {
    now: () => Date.UTC(2026, 10, 5, 20),
    tgApi: telegram.api,
  });
  assert.equal(telegram.calls.filter((x) => x.method === 'sendMessage').length, 0);
});

test('wrong, disabled, or reply-forbidden business connection writes no chat state', async () => {
  for (const options of [
    { ownerId: 501 },
    { enabled: false },
    { canReply: false },
  ]) {
    const kv = new FakeKV();
    const telegram = telegramFake(options);
    await worker.handleBusinessMessage(businessMessage(), envWith(kv), { now: Date.now, tgApi: telegram.api });
    assert.equal(kv.puts.some((x) => x.key.startsWith('seen:') || x.key.startsWith('last:')), false);
    assert.equal(telegram.calls.filter((x) => x.method === 'sendMessage').length, 0);
  }
});

test('failed Telegram business send does not mark the daily limiter or notify manager', async () => {
  const kv = new FakeKV();
  const telegram = telegramFake({ businessSendOk: false });
  await worker.handleBusinessMessage(businessMessage(), envWith(kv), {
    now: () => Date.UTC(2026, 10, 5, 10),
    tgApi: telegram.api,
  });
  assert.equal(kv.puts.some((x) => x.key === 'last:700'), false);
  assert.equal(telegram.calls.filter((x) => x.method === 'sendMessage').length, 1);
});

test('stats records allowed events with a 40-day TTL and ignores invalid input and owner', async () => {
  assert.equal(typeof worker.handleStat, 'function');
  const kv = new FakeKV();
  const env = envWith(kv);
  const visitor = { id: 900, first_name: 'Иван', username: 'ivan' };
  const now = Date.UTC(2026, 10, 5, 10);

  await worker.handleStat({ ev: 'open', id: 'newbuilds', name: 'Новостройки' }, visitor, env, now);
  await worker.handleStat({ ev: 'section', id: 'coast', name: 'Побережье' }, visitor, env, now + 1);
  await worker.handleStat({ ev: 'view', id: 'bad id!', name: 'Нельзя' }, visitor, env, now + 2);
  await worker.handleStat({ ev: 'unknown', id: 'x', name: 'X' }, visitor, env, now + 3);
  await worker.handleStat({ ev: 'open', id: 'newbuilds', name: 'Новостройки' }, { id: 500 }, env, now + 4);

  const write = kv.puts.find((x) => x.key === 'stats:2026-11-05');
  assert.equal(write.options.expirationTtl, 40 * DAY);
  const day = JSON.parse(kv.values.get('stats:2026-11-05'));
  assert.equal(day.o, 1);
  assert.equal(day.s.newbuilds.k, 1);
  assert.equal(day.s.coast.k, 1);
  assert.deepEqual(day.c, {});
  assert.equal(day.p['900'].u, 'ivan');
  assert.equal(day.p['500'], undefined);
});

test('stats report reproduces Evgeniy totals, unique people, top five and recent visitors', async () => {
  assert.equal(typeof worker.statsReport, 'function');
  const today = {
    o: 3,
    s: { newbuilds: { n: 'Новостройки', k: 2 } },
    c: {
      a: { n: 'A', k: 6 }, b: { n: 'B', k: 5 }, c: { n: 'C', k: 4 },
      d: { n: 'D', k: 3 }, e: { n: 'E', k: 2 }, f: { n: 'F', k: 1 },
    },
    p: {
      1: { n: 'Анна', u: 'anna', t: Date.UTC(2026, 10, 5, 10), w: 'смотрел(а) «A»' },
      2: { n: 'Борис', u: '', t: Date.UTC(2026, 10, 5, 9), w: 'раздел «Новостройки»' },
    },
  };
  const yesterday = {
    o: 2,
    s: { coast: { n: 'Побережье', k: 1 } },
    c: { a: { n: 'A', k: 1 } },
    p: {
      1: { n: 'Анна', u: 'anna', t: Date.UTC(2026, 10, 4, 8), w: 'смотрел(а) «A»' },
      3: { n: 'Вера', u: 'vera', t: Date.UTC(2026, 10, 4, 7), w: 'раздел «Побережье»' },
    },
  };
  const kv = new FakeKV({
    'stats:2026-11-05': JSON.stringify(today),
    'stats:2026-11-04': JSON.stringify(yesterday),
  });
  const report = await worker.statsReport(envWith(kv), Date.UTC(2026, 10, 5, 12));
  assert.match(report, /Сегодня: 3 открытия · 2 человека/);
  assert.match(report, /За 7 дней: 5 открытий · 3 человека/);
  assert.match(report, /1\. A — 7/);
  assert.match(report, /5\. E — 2/);
  assert.doesNotMatch(report, /6\. F/);
  assert.match(report, /Новостройки 2/);
  assert.match(report, /Анна \(@anna\)/);
  assert.match(report, /Вера \(@vera\), вчера/);
});

test('stats report explains that collection is empty', async () => {
  const report = await worker.statsReport(envWith(), Date.UTC(2026, 10, 5, 12));
  assert.match(report, /Пока заходов нет/);
});

test('stats command is owner-only and accepts the bot suffix', async () => {
  assert.equal(typeof worker.handleBotUpdate, 'function');
  const kv = new FakeKV();
  const telegram = telegramFake();
  await worker.handleBotUpdate(
    { message: { chat: { id: 500, type: 'private' }, from: { id: 500 }, text: '/stats@Svetlana_Rieltor_KLD_bot' } },
    envWith(kv),
    { tgApi: telegram.api, now: () => Date.UTC(2026, 10, 5, 12) },
  );
  assert.match(telegram.calls[0].body.text, /Статистика приложения/);
  telegram.calls.length = 0;
  await worker.handleBotUpdate(
    { message: { chat: { id: 900, type: 'private' }, from: { id: 900 }, text: '/stats' } },
    envWith(kv),
    { tgApi: telegram.api, now: () => Date.UTC(2026, 10, 5, 12) },
  );
  assert.equal(telegram.calls.some((x) => /Статистика/.test(x.body.text || '')), false);
});

test('stats endpoint rejects malformed and expired initData while preserving lead delivery', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const telegramCalls = [];
  globalThis.fetch = async (url, options) => {
    telegramCalls.push({ url: String(url), body: JSON.parse(options.body) });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  try {
    const env = { ...envWith(), ALLOWED_ORIGIN: 'https://example.test' };
    const request = (body) => new Request('https://worker.test/', {
      method: 'POST',
      headers: { Origin: env.ALLOWED_ORIGIN, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const malformed = await worker.default.fetch(request({ action: 'stat', initData: 'bad' }), env);
    assert.equal(malformed.status, 401);
    const expiredData = await signedInitData(env.BOT_TOKEN, { id: 900 }, Math.floor(Date.now() / 1000) - DAY - 1);
    const expired = await worker.default.fetch(request({ action: 'stat', initData: expiredData }), env);
    assert.equal(expired.status, 401);

    const valid = await signedInitData(env.BOT_TOKEN, { id: 900, first_name: 'Иван', username: 'ivan' });
    const lead = await worker.default.fetch(request({
      initData: valid,
      complex: 'ЖК Тест',
      room: '2-комн.',
      name: 'Иван',
      phone: '+7 900 000-00-00',
    }), env);
    assert.equal(lead.status, 200);
    assert.match(telegramCalls.at(-1).body.text, /Новая заявка/);
    assert.match(telegramCalls.at(-1).body.text, /ЖК Тест/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('stats webhook setup subscribes to business updates', { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  let setupBody;
  globalThis.fetch = async (_url, options) => {
    setupBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  try {
    const env = { ...envWith(), WEBHOOK_SECRET: 'secret' };
    const response = await worker.default.fetch(new Request('https://worker.test/setup?key=secret'), env);
    assert.equal(response.status, 200);
    assert.deepEqual(setupBody.allowed_updates, ['message', 'business_message', 'business_connection']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
