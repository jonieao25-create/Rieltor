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
