import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

async function loadAnalytics() {
  const source = await readFile(new URL('./analytics.js', import.meta.url), 'utf8');
  const window = {};
  vm.runInNewContext(source, { window, Promise, JSON, String });
  return window.RealtorAnalytics;
}

test('analytics sends nothing without endpoint or Telegram initData', async () => {
  const analytics = await loadAnalytics();
  const calls = [];
  analytics.create({ endpoint: '', initData: 'signed', fetchImpl: (...args) => calls.push(args) })
    .open({ id: 'newbuilds', name: 'Новостройки' });
  analytics.create({ endpoint: 'https://worker.test', initData: '', fetchImpl: (...args) => calls.push(args) })
    .view({ id: 'house', name: 'Дом' });
  assert.equal(calls.length, 0);
});

test('analytics records page open once and explicit section and view events', async () => {
  const analytics = await loadAnalytics();
  const calls = [];
  const tracker = analytics.create({
    endpoint: 'https://worker.test',
    initData: 'signed-data',
    fetchImpl: async (...args) => { calls.push(args); return { ok: true }; },
  });
  tracker.open({ id: 'newbuilds', name: 'Новостройки' });
  tracker.open({ id: 'coast', name: 'Побережье' });
  tracker.section({ id: 'coast', name: 'Побережье' });
  tracker.view({ id: 'moris', name: 'ЖК Морис' });
  tracker.view({ id: 'moris', name: 'ЖК Морис' });

  assert.equal(calls.length, 4);
  assert.deepEqual(calls.map(([, options]) => JSON.parse(options.body).data.ev), ['open', 'section', 'view', 'view']);
  assert.equal(calls[0][0], 'https://worker.test');
  assert.equal(calls[0][1].keepalive, true);
  assert.equal(calls[0][1].headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    action: 'stat',
    initData: 'signed-data',
    data: { ev: 'open', id: 'newbuilds', name: 'Новостройки' },
  });
});

test('analytics rejects malformed ids, clips names and swallows fetch rejection', async () => {
  const analytics = await loadAnalytics();
  const calls = [];
  const tracker = analytics.create({
    endpoint: 'https://worker.test',
    initData: 'signed-data',
    fetchImpl: async (...args) => {
      calls.push(args);
      throw new Error('offline');
    },
  });
  assert.doesNotThrow(() => tracker.view({ id: 'bad id!', name: 'Не отправлять' }));
  assert.doesNotThrow(() => tracker.section({ id: 'coast', name: 'X'.repeat(100) }));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls.length, 1);
  assert.equal(JSON.parse(calls[0][1].body).data.name.length, 80);
});
