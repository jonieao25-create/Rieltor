# Realtor Template Secretary and Stats Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the proven Evgeniy business-secretary and visitor statistics behavior to the shared Realtor template, then enable and verify it for Svetlana.

**Architecture:** Keep one deployable Cloudflare module in `worker/index.js`, exporting testable helpers alongside the default Worker handler. Add a small browser analytics module shared by every client and call it from the existing engine only on real user navigation. Configure each client with Cloudflare variables, a private KV binding, and Telegram Business permissions.

**Tech Stack:** JavaScript ES modules, Node.js built-in test runner, Telegram Bot API, Telegram Mini Apps initData, Cloudflare Workers KV, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-05-svetlana-secretary-stats-design.md`

## Global Constraints

- Match the behavior at repository `jonieao25-create/1` commit `97c81b4304f2ab09ce56b324362325f34b3a9e9c`.
- Kaliningrad timezone is UTC+2; night is `20:00 <= time < 07:00`.
- A chat is new when no activity has been recorded for 20 rolling days; an unknown chat is new immediately.
- Auto-reply at most once per rolling 24 hours, best-effort under Cloudflare KV consistency.
- Stats retain daily visitor data for 40 days and report at most 30 days.
- `BOT_TOKEN`, `MANAGER_ID`, and `WEBHOOK_SECRET` never enter Git or chat.
- Analytics failures must never break navigation, lead delivery, or fallback chat behavior.
- Do not add visitor analytics notice or change the privacy page in this task.

## Review Focus

- Boundary times `19:59/20:00/06:59/07:00` and `19d23h59m/20d` must select the correct reply reason.
- Outgoing owner messages refresh familiarity but never trigger an auto-reply loop.
- Wrong, disabled, or reply-forbidden Business Connections must not write KV or send messages.
- Duplicate/failed Telegram delivery must not mark a reply as successful.
- Initial render, explicit section switches, and object views must not double-count analytics.

---

### Task 1: Test harness and secretary decision logic

**Files:**
- Create: `package.json`
- Create: `worker/index.test.js`
- Modify: `worker/index.js`

**Interfaces:**
- Produces: `secretaryDecision({ isNew, isNight, repliedRecently, fromOwner }) -> "new" | "night" | null`
- Produces: `isNightAt(timestampMs, offsetHours) -> boolean`
- Produces: `handleBusinessMessage(message, env, deps) -> Promise<void>` where `deps` supplies `now` and `tgApi` for tests.

- [ ] **Step 1: Write failing secretary tests**

Test unknown chat, 20-day expiry, four night boundaries, owner outgoing activity, bots/groups ignored, daily limiter, wrong/disabled/no-reply Business Connection, Telegram send failure, and successful manager notification.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --test-name-pattern="secretary|business"`

Expected: FAIL because the exported secretary helpers and business-message handler do not exist.

- [ ] **Step 3: Implement the minimal secretary helpers and handler**

Export the interfaces above from `worker/index.js`. Use KV prefixes `conn:`, `seen:`, and `last:` with one-day connection cache, 20-day seen TTL, and one-day reply TTL. Build the default message from `AGENT_NAME`, allow `SECRETARY_TEXT` override, and use `BOT_LINK` for the inline button.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `npm test -- --test-name-pattern="secretary|business"`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add package.json worker/index.js worker/index.test.js && git commit -m "feat: add template business secretary"`

### Task 2: Worker statistics and webhook contract

**Files:**
- Modify: `worker/index.test.js`
- Modify: `worker/index.js`

**Interfaces:**
- Produces: `handleStat(data, telegramUser, env, nowMs) -> Promise<void>`
- Produces: `statsReport(env, nowMs) -> Promise<string>`
- Preserves: existing lead POST body and fallback behavior.

- [ ] **Step 1: Write failing statistics tests**

Test `open/section/view` allowlist, malformed IDs, owner exclusion, 40-day TTL, unique visitors, opening totals, top five objects, section summary, last five visitors, empty report, `/stats` owner-only access, `/stats@bot`, malformed/expired initData, and unchanged lead requests.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --test-name-pattern="stats|lead|initData"`

Expected: FAIL because statistics actions and report are absent.

- [ ] **Step 3: Implement statistics and route discrimination**

Accept `action: "stat"` separately from lead actions after Telegram initData verification. Store `stats:YYYY-MM-DD` with 40-day TTL, reproduce Evgeniy's 1/7/30-day HTML report, and subscribe `/setup` to `message`, `business_message`, and `business_connection` updates.

- [ ] **Step 4: Run focused and complete tests**

Run: `npm test`

Expected: all tests PASS with no unhandled rejection.

- [ ] **Step 5: Commit**

Run: `git add worker/index.js worker/index.test.js && git commit -m "feat: add template visitor statistics"`

### Task 3: Shared browser analytics without duplicate events

**Files:**
- Create: `engine/analytics.js`
- Create: `engine/analytics.test.js`
- Modify: `engine/app.js`
- Modify: `clients/_template/index.html`
- Modify: `clients/demo/index.html`
- Modify: `clients/evgeniy/index.html`
- Modify: `clients/svetlana/index.html`

**Interfaces:**
- Produces browser global: `RealtorAnalytics.create({ endpoint, initData, fetchImpl })`
- Tracker methods: `open(section)`, `section(section)`, `view(object)`; all return immediately and swallow network failures.
- Consumes POST contract: `{ action: "stat", initData, data: { ev, id, name } }`.

- [ ] **Step 1: Write failing browser analytics tests**

Test no request without endpoint/initData, one `open` per page load, explicit section events only, every explicit object view, payload clipping/IDs, `keepalive`, and swallowed fetch rejection.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --test-name-pattern="analytics"`

Expected: FAIL because `engine/analytics.js` does not exist.

- [ ] **Step 3: Implement analytics module and engine hooks**

Load `analytics.js` before `app.js` in all client indexes. Initialize from `SITE_DATA.settings.leadEndpoint` and Telegram `initData`; call `open` once after resolving the initial deep-link section, `section` only from a tab click, and `view` from explicit object opening.

- [ ] **Step 4: Bump client asset versions and run all tests**

Update `?v=` consistently in client index files, then run `npm test`.

Expected: all tests PASS.

- [ ] **Step 5: Commit**

Run: `git add engine clients package.json && git commit -m "feat: track template app visits"`

### Task 4: Reproducible template configuration and instructions

**Files:**
- Modify: `worker/wrangler.toml`
- Modify: `README.md`
- Modify: `Svetlana_K/Приложение Светланы.md` only if the external handoff document is intentionally synchronized; otherwise report it as a follow-up.

**Interfaces:**
- Documents variables: `AGENT_NAME`, `BOT_LINK`, optional `SECRETARY_TEXT`.
- Documents KV binding: `REPLIES` with a unique namespace per client.

- [ ] **Step 1: Write a failing configuration assertion test**

Add a Node test that reads `worker/wrangler.toml` and `README.md` and asserts the three variables, `REPLIES`, `/setup`, `/stats`, Telegram Business connection, and revoke/test steps are documented.

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- --test-name-pattern="configuration"`

Expected: FAIL on missing template variables and binding instructions.

- [ ] **Step 3: Update template configuration and README**

Keep placeholder namespace IDs out of executable configuration; document dashboard creation/binding and required rights clearly. Add the exact Svetlana text as an example, not a template default.

- [ ] **Step 4: Run all tests and static checks**

Run: `npm test`

Run: `git diff --check`

Expected: PASS and no whitespace errors.

- [ ] **Step 5: Commit**

Run: `git add worker/wrangler.toml README.md worker/index.test.js && git commit -m "docs: explain secretary and stats setup"`

### Task 5: Publish the shared template

**Files:** No new source files; publish tested commits.

**Interfaces:**
- Produces: reviewed GitHub branch/PR and updated GitHub Pages assets.

- [ ] **Step 1: Verify branch diff and full suite**

Run: `git status --short --branch`, `git diff origin/claude/project-thread-pyueyl...HEAD --check`, and `npm test`.

Expected: clean worktree and green suite.

- [ ] **Step 2: Push the branch and open a PR**

Use a feature branch; do not push secrets. Summarize Worker, engine, tests, and deployment requirements in the PR.

- [ ] **Step 3: Review and merge**

Verify the PR diff and GitHub Pages result. Merge only after checks and review pass.

### Task 6: Enable Svetlana in Cloudflare

**Files:** Cloudflare Worker `leads-svetlana` configuration only.

**Interfaces:**
- Consumes tested `worker/index.js`.
- Produces live `REPLIES` binding and variables `AGENT_NAME=Светлана`, `BOT_LINK=https://t.me/Svetlana_Rieltor_KLD_bot`, plus existing secrets.

- [ ] **Step 1: Inspect current Worker variables and preserve existing values**

Record variable names only; never reveal secret values.

- [ ] **Step 2: Create/bind a dedicated KV namespace**

Bind it as `REPLIES` to `leads-svetlana`.

- [ ] **Step 3: Add public variables and deploy tested Worker code**

Set `AGENT_NAME`, `BOT_LINK`, and optional `SECRETARY_TEXT`; preserve origin/app/manager settings and secrets.

- [ ] **Step 4: Run `/setup` and verify webhook response**

Expected: `Webhook was set`, with business updates enabled.

### Task 7: Connect Svetlana's Telegram Business account

**Files:** Telegram settings only.

**Interfaces:**
- Produces an enabled Business Connection owned by `MANAGER_ID` with permission to reply to personal chats.

- [ ] **Step 1: Prepare the correct bot and rights screen**

Stop immediately before saving the permission change.

- [ ] **Step 2: Obtain explicit action-time confirmation**

Explain that saving allows the bot to read eligible incoming business messages and send replies as Svetlana.

- [ ] **Step 3: Save the connection after confirmation**

Verify the bot is shown as connected and enabled.

### Task 8: Live verification and handoff

**Files:** No source changes unless a failing live test is reproduced with a failing automated test first.

**Interfaces:**
- Verifies secretary, manager notification, and `/stats` end-to-end.

- [ ] **Step 1: Send one message from an account not present in the new KV**

Expected: Svetlana's account sends the standard reply with the catalog button; Svetlana receives a service notification stating `новый клиент`.

- [ ] **Step 2: Verify the 24-hour limiter**

Send a second message from the same account; expected: no second auto-reply.

- [ ] **Step 3: Open Svetlana's Mini App and navigate**

Open one section and one object from a non-manager account.

- [ ] **Step 4: Run `/stats` as Svetlana and as a non-owner**

Expected: Svetlana receives the formatted report including the test visit; non-owner receives no statistics.

- [ ] **Step 5: Final verification report**

Report GitHub commit/PR, Cloudflare deployment, Telegram connection, test commands/results, and any manual follow-up without exposing secrets.
