import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { randomUUID } from "node:crypto";
import * as money from "./dist/money-logic.mjs";
import * as health from "./dist/health-logic.mjs";
import * as backup from "./dist/backup-logic.mjs";
import * as suite from "./dist/suite-logic.mjs";
import * as digital from "./dist/digital-logic.mjs";

// Exercise the real application controllers in an isolated storage environment.
// The tiny DOM adapter supplies controls only; browser layout is checked separately.
const appSource = await fs.readFile(new URL("./dist/app.mjs", import.meta.url), "utf8");
const startup = appSource.indexOf('$("#app").innerHTML = appMarkup();');
assert.ok(startup > 0);
const controllerSource = appSource.slice(0, startup).replace(/import\s*{[\s\S]*?}\s*from\s*"\.\/[^\"]+";/g, "");
const imports = {};
for (const match of appSource.matchAll(/import\s*{[\s\S]*?}\s*from\s*"(\.\/[^\"]+)";/g)) {
  Object.assign(imports, await import(new URL(`./dist/${match[1].slice(2)}`, import.meta.url)));
}
let scenarios = 0;
const test = async (label, run) => {
  try { await run(); scenarios += 1; }
  catch (error) { error.message = `${label}: ${error.message}`; throw error; }
};
const transaction = (overrides = {}) => ({ id: "old", type: "income", amount: 5_000_000, category: "Gaji", date: "2026-09-01", note: "", createdAt: 1, ...overrides });

function harness(initial = {}) {
  const raw = new Map(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)]));
  const nodes = new Map();
  const messages = [];
  const controls = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      value: "", textContent: "", innerHTML: "", hidden: false, disabled: false,
      returnValue: "", dataset: {}, style: {}, listeners: new Map(),
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      addEventListener(event, handler) { this.listeners.set(event, handler); },
      querySelector() { return null; }, querySelectorAll() { return []; },
      setAttribute() {}, removeAttribute() {}, showModal() {}, focus() {}, select() {}, scrollIntoView() {},
    });
    return nodes.get(selector);
  };
  let failKey = "";
  const localStorage = {
    getItem: key => raw.get(key) ?? null,
    setItem(key, value) { if (key === failKey) throw new Error("QuotaExceededError"); raw.set(key, String(value)); },
    removeItem(key) { if (key === failKey) throw new Error("StorageBlocked"); raw.delete(key); },
  };
  const document = { querySelector: selector => nodes.get(selector) ?? null, querySelectorAll: () => [], addEventListener() {} };
  const context = vm.createContext({ ...imports, document, localStorage, navigator: {},
    window: { addEventListener() {}, scrollTo() {} }, location: { hash: "", protocol: "http:" },
    Date, Intl, URL, URLSearchParams, Blob, TextEncoder, crypto: { randomUUID }, setTimeout, clearTimeout,
    requestAnimationFrame: fn => fn(), messages,
  });
  vm.runInContext(controllerSource, context);
  vm.runInContext('showToast = message => messages.push(message); renderAll = () => {}; renderAdmin = () => {}; renderDigital = () => {}; resetTransactionForm = () => {}; selectMoneyTab = () => {}; fillReadinessForm = () => {}; fillHealthForm = () => {}; showApplication = () => {}; showGate = () => {};', context);
  return { context, raw, nodes, controls, messages, fail: key => { failKey = key; },
    run: source => vm.runInContext(source, context),
    plain: source => JSON.parse(vm.runInContext(`JSON.stringify(${source})`, context)),
    wire() { document.querySelector = controls; vm.runInContext("wireEvents()", context); },
  };
}

await test("Corrupt settings and session do not prevent startup", () => {
  const h = harness({ "atur-uang-settings-v1": null, "sbb-suite-demo-session-v1": { role: "user" }, "sbb-suite-admin-v1": { codes: [null, 3], users: [null], plans: [null], audit: [null] } });
  assert.equal(h.run("session"), null);
  assert.ok(h.plain("moneySettings").expenseCategories.length > 0);
  assert.equal(h.run('dateText("not-a-date")'), "Tanggal tidak valid");
  assert.equal(h.run('dateTimeText("not-a-date")'), "Tanggal tidak valid");
});

await test("Nominal budgets stay fixed while legacy percentage budgets still work", () => {
  const settings = money.sanitizeSettings({ expenseCategories: ["Makan"], budgets: { Makan: 20 }, budgetAmounts: { Makan: 750_000 }, savingTargetAmount: 500_000 });
  for (const income of [5_000_000, 9_000_000]) {
    const month = money.calculateMonth([transaction({ amount: income })], settings, "2026-09");
    assert.equal(month.budgetRows[0].cap, 750_000);
    assert.equal(month.savingTarget, 500_000);
    assert.equal(month.unallocatedAmount, income - 1_250_000);
  }
  const legacy = money.sanitizeSettings({ expenseCategories: ["Makan"], budgets: { Makan: 20 }, savingTargetAmount: null });
  assert.equal(money.calculateMonth([transaction()], legacy, "2026-09").budgetRows[0].cap, 1_000_000);
  assert.equal(money.calculateMonth([transaction()], legacy, "2026-09").savingTarget, 1_000_000);
});

await test("Invalid dates, fractions, infinity and future transactions are rejected", () => {
  const base = transaction();
  for (const overrides of [{ date: "2026-02-30" }, { date: "2999-01-01" }, { amount: 0.4 }, { amount: Infinity }, { amount: money.MAX_TRANSACTION_AMOUNT + 1 }, { type: "other" }, { category: "" }]) {
    assert.ok(money.transactionValidationError({ ...base, ...overrides }, "2026-10-05"));
  }
  assert.equal(money.transactionValidationError(base, "2026-10-05"), "");
  assert.equal(money.sanitizeTransactions([transaction({ amount: Infinity })]).length, 0);
});

await test("Failed multi-key save restores both storage and displayed totals", () => {
  const h = harness({ "atur-uang-transactions-v1": [transaction()], "atur-uang-settings-v1": { savingTargetPercent: 20 } });
  const before = [...h.raw];
  h.fail("atur-uang-settings-v1");
  assert.equal(h.run('commitTransaction({ type: "expense", amount: 250000, category: "Makan", date: "2026-09-02" })'), null);
  assert.deepEqual([...h.raw], before);
  assert.equal(h.run("calculateMonth(transactions, moneySettings, '2026-09').balance"), 5_000_000);
  assert.match(h.messages.at(-1), /belum tersimpan/);
  h.fail("");
  assert.ok(h.run('commitTransaction({ type: "expense", amount: 250000, category: "Makan", date: "2026-09-02" })'));
  assert.equal(h.run("calculateMonth(transactions, moneySettings, '2026-09').balance"), 4_750_000);
});

await test("The transaction limit preserves all legacy records and allows editing", () => {
  const rows = Array.from({ length: money.MAX_TRANSACTION_COUNT + 1 }, (_, index) => transaction({ id: `legacy-${index}`, createdAt: index }));
  assert.equal(money.sanitizeTransactions(rows).length, rows.length);
  const h = harness({ "atur-uang-transactions-v1": rows });
  assert.equal(h.run('commitTransaction({ id: "unknown", type: "expense", amount: 1000, category: "Makan", date: "2026-09-02" })'), null);
  assert.equal(h.run("transactions.length"), rows.length);
  assert.ok(h.run('commitTransaction({ id: "legacy-0", type: "income", amount: 1000, category: "Gaji", date: "2026-09-01" })'));
  assert.equal(h.run("transactions.length"), rows.length);
});

await test("Loading examples twice does not double count or overwrite an edited example", () => {
  const h = harness();
  h.run('selectedMonth = getCurrentMonthKey(); loadSampleTransactions(); transactions[0].amount = 123456; persistMoney(); loadSampleTransactions();');
  assert.equal(h.run("transactions.length"), 5);
  assert.equal(h.run("transactions[0].amount"), 123456);
  assert.ok(h.run("transactions.every(item => item.date <= todayISO())"));
});

await test("Renaming a budget category retains nominal cap and connected records", () => {
  const h = harness({ "atur-uang-settings-v1": { expenseCategories: ["Makan", "Lainnya"], budgetAmounts: { Makan: 400_000 } }, "atur-uang-transactions-v1": [transaction({ type: "expense", category: "Makan" })] });
  h.run('renameExpenseCategory(0, "Belanja makan")');
  assert.equal(h.run('moneySettings.budgetAmounts["Belanja makan"]'), 400_000);
  assert.equal(h.run('transactions[0].category'), "Belanja makan");
  assert.equal(h.run('Object.hasOwn(moneySettings.budgetAmounts, "Makan")'), false);
});

await test("Examples in a future month never add records to the current month", () => {
  const h = harness({ "atur-uang-transactions-v1": [transaction()] });
  const before = [...h.raw];
  h.run('selectedMonth = "2999-01"; loadSampleTransactions();');
  assert.deepEqual([...h.raw], before);
  assert.equal(h.run("transactions.length"), 1);
  assert.match(h.messages.at(-1), /bulan berjalan/);
});

await test("Editing the digital profile and reloading preserves answers and next question", () => {
  const profile = { ...digital.DEFAULT_DIGITAL_PROFILE, completed: true };
  const questions = digital.getDigitalQuestions(digital.DEFAULT_DIGITAL_CONFIG, profile);
  const state = digital.sanitizeDigitalState({ profile, answers: { [questions[0].id]: 2 } });
  const h = harness({ "sbb-digital-assessment-v1": state });
  assert.equal(h.run("digitalQuestionIndex"), 1);
  h.context.editedProfile = { ...profile, goal: "repeat" };
  h.run('readDigitalProfileForm = () => editedProfile; submitDigitalProfile();');
  assert.equal(h.plain("digitalState.answers")[questions[0].id], 2);
  const reloaded = harness(Object.fromEntries([...h.raw].map(([key, value]) => [key, JSON.parse(value)])));
  assert.equal(reloaded.plain("digitalState.answers")[questions[0].id], 2);
  assert.equal(reloaded.run("digitalQuestionIndex"), 1);
});

await test("Empty-profile backups remain empty and v1/v2 backups stay compatible", () => {
  const data = backup.parseBackupText(JSON.stringify(backup.createBackupPayload({ profileStatus: { readiness: false, health: false } })));
  const h = harness();
  h.controls("#backup-status");
  h.context.imported = data;
  h.run("applyLocalBackup(imported)");
  assert.equal(h.run("hasStoredProfile(STORAGE.readiness)"), false);
  assert.equal(h.run("hasStoredProfile(STORAGE.health)"), false);
  const oldV2 = backup.createBackupPayload({ transactions: [transaction()] });
  assert.ok(!Object.hasOwn(oldV2.data, "profileStatus"));
  assert.equal(backup.parseBackupText(JSON.stringify(oldV2)).transactions.length, 1);
  assert.equal(backup.parseBackupText(JSON.stringify({ ...oldV2, version: 1 })).transactions.length, 1);
  const tampered = structuredClone(oldV2); tampered.data.transactions[0].amount += 1;
  assert.throws(() => backup.parseBackupText(JSON.stringify(tampered)), /berubah atau rusak/);
});

await test("Failed backup import rolls back every module and retains the admin session", () => {
  const initial = { "atur-uang-transactions-v1": [transaction()], "sbb-kalkulator-usaha-v1": { activeId: "old-business", values: {} } };
  const h = harness(initial); h.controls("#backup-status");
  const before = [...h.raw];
  h.fail("sbb-kalkulator-usaha-v1");
  h.context.imported = backup.createBackupPayload({ transactions: [transaction({ amount: 100 })], businessCalculators: { values: {} } }).data;
  h.run("applyLocalBackup(imported)");
  assert.deepEqual([...h.raw], before);
  assert.equal(h.run("transactions[0].amount"), 5_000_000);
  assert.match(h.controls("#backup-status").textContent, /gagal.*lama dipertahankan/);
});

await test("Cancel after a previous confirmation does not invoke the next delete action", () => {
  const h = harness(); h.wire();
  h.run('confirmed = 0; confirmAction("First", "", () => confirmed++);');
  const dialog = h.controls("#confirm-dialog");
  dialog.returnValue = "confirm"; dialog.listeners.get("close")();
  assert.equal(h.run("confirmed"), 1);
  h.run('confirmAction("Second", "", () => confirmed++);');
  assert.equal(dialog.returnValue, "");
  dialog.listeners.get("close")();
  assert.equal(h.run("confirmed"), 1);
  assert.equal(h.run("pendingConfirmation"), null);
});

await test("Untrusted imported IDs and text are escaped in transaction HTML", () => {
  const malicious = '\" onclick=\"alert(1)';
  const h = harness({ "atur-uang-transactions-v1": [transaction({ id: malicious, note: '<img src=x onerror=alert(1)>' })] });
  for (const id of ["history-title", "history-summary", "transaction-empty", "export-excel", "export-csv", "transaction-list"]) h.controls(`#${id}`);
  h.run('selectedMonth = "2026-09"; renderHistory(calculateMonth(transactions, moneySettings, selectedMonth));');
  const html = h.controls("#transaction-list").innerHTML;
  assert.ok(!html.includes(`data-edit-transaction="${malicious}"`));
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&quot; onclick=&quot;"));
});

await test("Session expiry, malformed sessions and revoked codes are respected", () => {
  const now = new Date("2026-10-05T12:00:00Z");
  const session = { role: "user", provider: "google-demo", signedInAt: "2026-10-05T11:00:00Z" };
  assert.equal(suite.sanitizeLocalSession(session, {}, [], now).name, "Pengguna SBB");
  assert.equal(suite.sanitizeLocalSession({ ...session, signedInAt: "2025-01-01" }, {}, [], now), null);
  assert.equal(suite.sanitizeLocalSession({ ...session, role: "admin" }, {}, [], now), null);
  assert.equal(suite.sanitizeLocalSession({ ...session, provider: "code", codeId: "revoked" }, {}, [{ id: "revoked", status: "revoked" }], now), null);
  assert.equal(suite.licenseState({ status: "active", expiresAt: "2026-02-30", maxActivations: 1, activations: 0 }, now), "expired");
});

await test("Invalid health numbers never produce invalid scores", () => {
  const profile = health.sanitizeHealthProfile({ revenue: Infinity, cogs: -20, cashBalance: "Infinity", topCustomerPercent: "bad" });
  assert.equal(profile.revenue, 0);
  assert.equal(profile.cashBalance, 0);
  assert.equal(profile.cogs, 0);
  assert.ok(Number.isFinite(health.calculateHealth(profile).score));
});

await test("WebMCP reads require a session and failed writes are not reported as success", () => {
  const h = harness(); const registered = new Map();
  h.context.document.modelContext = { registerTool: tool => registered.set(tool.name, tool) };
  h.run("registerWebMCP()");
  assert.throws(() => registered.get("get_financial_overview").execute(), /Masuk/);
  h.run('session = { role: "user" };');
  assert.throws(() => registered.get("set_financial_profile").execute({ income: NaN }), /angka yang valid/);
  assert.throws(() => registered.get("get_financial_overview").execute({ month: "2026-13" }), /Bulan tidak valid/);
  h.fail("sbb-kesiapan-bisnis-v1");
  assert.throws(() => registered.get("set_financial_profile").execute({ income: 3_000_000 }), /belum tersimpan/);
});

await test("Business autosave failure keeps stored data and shows an unsaved draft", async () => {
  const html = await fs.readFile(new URL("./dist/business/index.html", import.meta.url), "utf8");
  const calculatorSource = html.slice(html.indexOf("/* calculator-data.mjs */"), html.indexOf("/* calculator-only.mjs */"));
  const h = harness({ "sbb-kalkulator-usaha-v1": { activeCategory: "Semua", values: {} } });
  const badge = h.controls(".autosave-pill");
  vm.runInContext(calculatorSource, h.context);
  h.run("notify = message => messages.push(message); loadSaved();");
  assert.equal(h.run("activeCategory"), "Semua");
  const before = [...h.raw]; h.fail("sbb-kalkulator-usaha-v1");
  assert.equal(h.run("persist()"), false);
  assert.deepEqual([...h.raw], before);
  assert.match(badge.innerHTML, /Belum tersimpan/);
});

// Test the actual worker under a GitHub-style subdirectory, with real Response objects.
await test("Offline navigation keeps the calculator and caching never clears another app", async () => {
  const worker = await fs.readFile(new URL("./dist/sw.js", import.meta.url), "utf8");
  const scope = "https://example.test/sbb/";
  const current = `sbb-finance-suite:${scope}:v25`;
  const old = `sbb-finance-suite:${scope}:v24`;
  const stores = new Map([[current, new Map()], [old, new Map()], ["another-app-v1", new Map()], ["sbb-finance-suite:https://example.test/other/:v24", new Map()]]);
  const handlers = new Map();
  const keyFor = input => typeof input === "string" ? input : input.url;
  const caches = { keys: async () => [...stores.keys()], delete: async key => stores.delete(key), open: async name => {
    if (!stores.has(name)) stores.set(name, new Map()); const store = stores.get(name);
    return { addAll: async () => {}, put: async (input, response) => store.set(keyFor(input), response), match: async (input, options = {}) => {
      const requested = new URL(keyFor(input));
      for (const [url, response] of store) {
        const candidate = new URL(url);
        if (candidate.href === requested.href || options.ignoreSearch && candidate.origin + candidate.pathname === requested.origin + requested.pathname) return response.clone();
      }
    } };
  } };
  const context = vm.createContext({ URL, Response, caches, fetch: async () => { throw new Error("Offline"); }, self: { registration: { scope }, location: { origin: "https://example.test" }, addEventListener: (name, handler) => handlers.set(name, handler), skipWaiting() {}, clients: { claim() {} } } });
  vm.runInContext(worker, context);
  let promise; handlers.get("activate")({ waitUntil: value => { promise = value; } }); await promise;
  assert.ok(!stores.has(old)); assert.ok(stores.has("another-app-v1")); assert.ok(stores.has("sbb-finance-suite:https://example.test/other/:v24"));
  stores.get(current).set(`${scope}index.html`, new Response("MAIN"));
  stores.get(current).set(`${scope}business/index.html`, new Response("BUSINESS"));
  const request = (url, destination = "document", mode = "navigate", method = "GET") => {
    let response; handlers.get("fetch")({ request: { url, destination, mode, method }, respondWith: value => { response = value; } }); return response;
  };
  assert.equal(await (await request(`${scope}business/?embed=1`)).text(), "BUSINESS");
  assert.equal(await (await request(`${scope}business/index.html?embed=1`)).text(), "BUSINESS");
  assert.equal(await (await request(`${scope}index.html`)).text(), "MAIN");
  assert.equal(request("https://example.test/unrelated/"), undefined);
  assert.equal(request(`${scope}index.html`, "document", "navigate", "POST"), undefined);
  stores.get(current).set(`${scope}styles.css?v=25`, new Response("VALID CSS"));
  context.fetch = async () => new Response("NOT FOUND", { status: 404 });
  assert.equal(await (await request(`${scope}styles.css?v=26`, "style", "cors")).text(), "VALID CSS");
  assert.equal(await stores.get(current).get(`${scope}styles.css?v=25`).clone().text(), "VALID CSS");
});

console.log(`${scenarios} skenario regresi SBB lulus.`);
