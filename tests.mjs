import assert from "node:assert/strict";
import { BUSINESS_IDEAS } from "./dist/catalog.mjs";
import { DEFAULT_PROFILE, calculateReadiness, recommendIdeas } from "./dist/logic.mjs";
import { MAX_TRANSACTION_AMOUNT, calculateMonth, calculateYear, defaultBudgets, isValidISODate, sanitizeSettings, sanitizeTransactions } from "./dist/money-logic.mjs";
import { canRedeemLicense, generateLicenseCode, licenseMetrics, licenseState, normalizeAccessCode } from "./dist/suite-logic.mjs";
import { CSV_TRANSACTION_LIMIT, EXCEL_TRANSACTION_LIMIT, buildTransactionCSV, buildTransactionXLSX, transactionExportRows } from "./dist/export-logic.mjs";
import { DEFAULT_HEALTH_PROFILE, buildHealthTrend, calculateHealth, healthScenarios, sanitizeHealthProfile } from "./dist/health-logic.mjs";
import { createBackupPayload, parseBackupText } from "./dist/backup-logic.mjs";
import { DEFAULT_DIGITAL_CONFIG, DEFAULT_DIGITAL_PROFILE, buildDigitalBrief, buildDigitalWhatsappMessage, calculateDigitalAssessment, getDigitalQuestions, sanitizeDigitalConfig, sanitizeDigitalProfile, sanitizeDigitalState } from "./dist/digital-logic.mjs";

const profile = overrides => ({ ...DEFAULT_PROFILE, skills: [...DEFAULT_PROFILE.skills], ...overrides });

{
  const result = calculateReadiness(profile());
  assert.equal(result.valid, true);
  assert.equal(result.cashSurplus, 200_000);
  assert.equal(result.emergencyTarget, 24_000_000);
  assert.equal(result.emergencyGap, 24_000_000);
  assert.equal(result.businessNeed, 10_000_000);
  assert.equal(result.businessGap, 10_000_000);
  assert.equal(result.totalGap, 34_000_000);
  assert.equal(result.monthsToReady, 170);
  assert.equal(result.savingsGoalMonths, 5);
  assert.equal(result.safeTestAmount, 0);
  assert.equal(result.status.key, "warning");
}

{
  const result = calculateReadiness(profile({
    income: 2_000_000,
    mandatoryExpenses: 0,
    otherExpenses: 500_000,
    emergencyFundBalance: 0,
    startupCapital: 0,
    testBudget: 1_000_000,
    businessFundBalance: 0,
    businessReserve: 0,
  }));
  assert.equal(result.emergencyTarget, 0, "pengeluaran wajib Rp0 harus valid");
  assert.equal(result.businessGap, 1_000_000);
  assert.equal(result.monthsToReady, 1);
}

{
  const result = calculateReadiness(profile({
    income: 5_000_000,
    mandatoryExpenses: 2_000_000,
    otherExpenses: 1_000_000,
    emergencyMonths: 6,
    emergencyFundBalance: 12_000_000,
    startupCapital: 5_000_000,
    testBudget: 4_000_000,
    businessReserve: 2_000_000,
    businessFundBalance: 7_000_000,
  }));
  assert.equal(result.businessNeed, 7_000_000);
  assert.equal(result.totalGap, 0);
  assert.equal(result.safeTestAmount, 4_000_000);
  assert.equal(result.status.key, "ready");
}

{
  const result = calculateReadiness(profile({ income: 2_000_000, mandatoryExpenses: 2_000_000, otherExpenses: 0 }));
  assert.equal(result.monthlySaving, 0);
  assert.equal(result.monthsToReady, null);
  assert.equal(result.status.key, "danger");
}

{
  const result = calculateReadiness(profile({ income: -1 }));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.field === "income"));
  assert.equal(result.totalGap, null);
}

{
  const result = calculateReadiness(profile({ startupCapital: 15_000_000, testBudget: 10_000_000, businessReserve: 2_000_000 }));
  assert.equal(result.businessNeed, 17_000_000, "modal dan anggaran uji tidak boleh dihitung ganda");
}

{
  const settings = sanitizeSettings({ budgets: defaultBudgets(), savingTargetPercent: 20 });
  const transactions = [
    { id: "1", type: "income", category: "Gaji", amount: 5_000_000, date: "2026-09-01" },
    { id: "2", type: "expense", category: "Sewa / KPR", amount: 1_200_000, date: "2026-09-03" },
    { id: "3", type: "expense", category: "Makan & minum", amount: 800_000, date: "2026-09-08" },
    { id: "4", type: "saving", category: "Dana darurat", amount: 1_000_000, date: "2026-09-10" },
  ];
  const month = calculateMonth(transactions, settings, "2026-09");
  assert.equal(month.income, 5_000_000);
  assert.equal(month.expense, 2_000_000);
  assert.equal(month.saved, 1_000_000);
  assert.equal(month.balance, 2_000_000);
  assert.equal(month.savingSuccess, 100);
  assert.ok(month.overspentRows.some(row => row.name === "Sewa / KPR"));
  const year = calculateYear(transactions, settings, 2026);
  assert.equal(year.income, 5_000_000);
  assert.equal(year.balance, 2_000_000);
}

{
  assert.equal(isValidISODate("2024-02-29"), true);
  assert.equal(isValidISODate("2026-02-29"), false);
  assert.equal(isValidISODate("2026-13-01"), false);
  const cleaned = sanitizeTransactions([
    { id: "same", type: "expense", category: " Makan  siang ", amount: 10_000, date: "2026-09-01", createdAt: 1 },
    { id: "same", type: "expense", category: "Makan siang", amount: 12_000, date: "2026-09-02", createdAt: 2 },
    { id: "bad-date", type: "income", category: "Gaji", amount: 1_000, date: "2026-02-30", createdAt: 3 },
    { id: "cap", type: "income", category: "Gaji", amount: MAX_TRANSACTION_AMOUNT + 1, date: "2026-09-03", createdAt: 4 },
  ]);
  assert.equal(cleaned.length, 2, "Tanggal tidak valid dibuang dan ID ganda tidak dihitung dua kali");
  assert.equal(cleaned.find(item => item.id === "same").amount, 12_000, "Versi transaksi terbaru dipertahankan");
  assert.equal(cleaned.find(item => item.id === "cap").amount, MAX_TRANSACTION_AMOUNT, "Nominal dibatasi agar penjumlahan tetap presisi");
}

{
  assert.equal(normalizeAccessCode(" sbb-demo-pro-2026 "), "SBB-DEMO-PRO-2026");
  const code = generateLicenseCode("Pro", () => 0);
  assert.equal(code, "SBB-PRO-AAAA-AAAA");
  const now = new Date("2026-09-12T12:00:00Z");
  const active = { status: "active", activations: 0, maxActivations: 1, expiresAt: "2027-01-01" };
  const used = { ...active, activations: 1 };
  const expired = { ...active, expiresAt: "2025-01-01" };
  assert.equal(licenseState(active, now), "active");
  assert.equal(licenseState(used, now), "used");
  assert.equal(licenseState(expired, now), "expired");
  assert.deepEqual(canRedeemLicense(active, now), { ok: true, state: "active" });
  assert.deepEqual(licenseMetrics([active, used, expired], [{ status: "active" }, { status: "suspended" }], now), {
    total: 3,
    available: 1,
    used: 1,
    revokedOrExpired: 1,
    activeUsers: 1,
  });
}

assert.equal(BUSINESS_IDEAS.length, 115);
assert.equal(new Set(BUSINESS_IDEAS.map(idea => idea.id)).size, 115);
assert.equal(new Set(BUSINESS_IDEAS.map(idea => idea.name)).size, 115);
assert.ok(BUSINESS_IDEAS.every(idea => idea.name && idea.offer && idea.firstStep && idea.coreSkills.length));

{
  const ideas = recommendIdeas(profile(), BUSINESS_IDEAS, 3);
  assert.equal(ideas.length, 3);
  assert.ok(ideas.every(idea => idea.coreFit));
  assert.ok(ideas.every(idea => idea.coreSkills.every(skill => ["Berkebun", "Bersih-bersih"].includes(skill))));
}

{
  const exportItems = [
    { id: "export-1", type: "expense", category: "Makan", note: "Makan siang", amount: 25000, date: "2026-09-12", createdAt: 1 },
    { id: "export-2", type: "income", category: "Gaji", note: "=SUM(A1:A2)", amount: 5000000, date: "2026-09-13", createdAt: 2 },
  ];
  const rows = transactionExportRows(exportItems, EXCEL_TRANSACTION_LIMIT);
  assert.equal(rows.length, 2);
  assert.equal(rows[0][0], "2026-09-13", "Ekspor menampilkan transaksi terbaru lebih dahulu");
  const csv = buildTransactionCSV(exportItems);
  assert.ok(csv.startsWith('\uFEFF"Tanggal","Jenis","Kategori","Catatan","Nominal (Rp)"'));
  assert.ok(csv.includes("'=SUM(A1:A2)"), "CSV harus mencegah formula injection dari catatan pengguna");
  const xlsx = buildTransactionXLSX(exportItems);
  assert.deepEqual([...xlsx.slice(0, 4)], [80, 75, 3, 4], "Excel harus berupa arsip XLSX yang valid");
  const xlsxText = new TextDecoder().decode(xlsx);
  assert.ok(xlsxText.includes('sheet name="Transaksi"'));
  assert.ok(xlsxText.includes('<autoFilter ref="A1:E3"/>'));
  assert.ok(xlsxText.includes('state="frozen"'), "Baris judul Excel harus dibekukan");
  assert.equal(transactionExportRows(Array.from({ length: 1005 }, (_, index) => ({ ...exportItems[0], id: String(index), createdAt: index })), EXCEL_TRANSACTION_LIMIT).length, 1000);
  assert.equal(transactionExportRows(Array.from({ length: 10005 }, (_, index) => ({ ...exportItems[0], id: String(index), createdAt: index })), CSV_TRANSACTION_LIMIT).length, 10000);
}

{
  const safeProfile = sanitizeHealthProfile({ ...DEFAULT_HEALTH_PROFILE, repeatCustomerPercent: 140, topCustomerPercent: -12 });
  assert.equal(safeProfile.repeatCustomerPercent, 100, "Persentase SBB Health harus dibatasi hingga 100");
  assert.equal(safeProfile.topCustomerPercent, 0, "Persentase SBB Health tidak boleh negatif");

  const healthy = calculateHealth({
    ...DEFAULT_HEALTH_PROFILE,
    revenue: 100_000_000,
    previousRevenue: 85_000_000,
    cogs: 35_000_000,
    operatingExpenses: 25_000_000,
    cashBalance: 120_000_000,
    receivables: 10_000_000,
    inventory: 12_000_000,
    debtPayments: 3_000_000,
    repeatCustomerPercent: 55,
    topCustomerPercent: 18,
    recordCompletenessPercent: 100,
  });
  const weak = calculateHealth({
    ...DEFAULT_HEALTH_PROFILE,
    revenue: 30_000_000,
    previousRevenue: 50_000_000,
    cogs: 24_000_000,
    operatingExpenses: 12_000_000,
    cashBalance: 2_000_000,
    receivables: 45_000_000,
    inventory: 35_000_000,
    debtPayments: 8_000_000,
    repeatCustomerPercent: 5,
    topCustomerPercent: 85,
    recordCompletenessPercent: 20,
    separateFinances: false,
    cashPlan: false,
  });
  assert.ok(healthy.score > weak.score, "Skor harus membedakan usaha sehat dan usaha berisiko");
  assert.equal(healthy.pillars.length, 6, "SBB Health harus menilai enam area utama");
  assert.equal(weak.priorities.length, 3, "SBB Health harus memberi tiga prioritas tindakan");
  assert.ok(healthy.confidence.percent >= weak.confidence.percent, "Kelengkapan bukti harus menghasilkan tingkat keyakinan data");
  assert.equal(healthy.confidence.total > 0, true, "SBB Health harus memeriksa bukti yang relevan");
  assert.equal(healthScenarios(safeProfile).length, 3, "SBB Health harus menyediakan tiga simulasi perbaikan");
  assert.equal(sanitizeHealthProfile({ period: "2026-13" }).period, "", "Periode yang tidak ada harus ditolak");
  const inconsistent = calculateHealth({ ...DEFAULT_HEALTH_PROFILE, revenue: 0, previousRevenue: 0, cogs: 0, receivables: 5_000_000, inventory: 2_000_000 });
  assert.ok(inconsistent.dataWarnings.length >= 3, "Ketidakkonsistenan data harus dijelaskan kepada pengguna");
  assert.equal(inconsistent.metrics.revenueGrowth, null, "Pertumbuhan tanpa omzet pembanding tidak boleh dianggap nol persen");

  const foodScore = calculateHealth({ ...safeProfile, sector: "food" });
  const digitalScore = calculateHealth({ ...safeProfile, sector: "digital" });
  assert.equal(foodScore.benchmark.label, "Kuliner & F&B");
  assert.notEqual(foodScore.score, digitalScore.score, "Standar sektor harus memengaruhi skor kesehatan");

  const trend = buildHealthTrend([
    { businessName: "Usaha Saya", period: "2026-07", score: 58, at: "2026-07-31T00:00:00Z" },
    { businessName: "Usaha Saya", period: "2026-08", score: 63, at: "2026-08-20T00:00:00Z" },
    { businessName: "Usaha Saya", period: "2026-08", score: 66, at: "2026-08-31T00:00:00Z" },
    { businessName: "Usaha Lain", period: "2026-09", score: 90, at: "2026-09-30T00:00:00Z" },
  ], "Usaha Saya");
  assert.deepEqual(trend.map(item => item.score), [58, 66], "Tren memakai hasil terbaru pada setiap bulan untuk usaha yang sama");
  assert.equal(trend[1].changeFromPrevious, 8);
}

{
  const config = sanitizeDigitalConfig(DEFAULT_DIGITAL_CONFIG);
  const profile = sanitizeDigitalProfile({ ...DEFAULT_DIGITAL_PROFILE, completed: true, stage: "growing", goal: "sales", budgetBand: "500to2" });
  const activeQuestions = getDigitalQuestions(config, profile);
  const answers = Object.fromEntries(activeQuestions.map((item, index) => [item.id, item.category === "presence" ? 0 : index % 4]));
  const state = sanitizeDigitalState({ profile, answers, completed: true }, config);
  const result = calculateDigitalAssessment(config, state);
  assert.equal(result.complete, true);
  assert.equal(result.categoryResults.length, 6);
  assert.ok(result.priority?.id, "Diagnosis harus menghasilkan prioritas");
  assert.ok(result.checklist.length > 0);
  assert.equal(result.categoryResults.filter(item => item.level === "now").length, 1);
  assert.equal(result.phases.length, 3, "SBB Digital harus menghasilkan rencana 30/60/90 hari");
  assert.ok(result.budget.helpMax >= result.budget.helpMin, "Estimasi bantuan harus memiliki rentang yang valid");
  assert.ok(buildDigitalBrief(result, "Toko Uji").includes("BRIEF SBB DIGITAL"), "SBB Digital harus menghasilkan brief otomatis");
  assert.ok(buildDigitalWhatsappMessage("{business}: {priority}", "Toko Uji", result.priority.title).includes("Toko Uji"));
  const unsafe = sanitizeDigitalState({ answers: { "presence-find": 9, palsu: 1 }, completed: true }, config);
  assert.equal(Object.keys(unsafe.answers).length, 0, "Jawaban digital di luar pilihan harus dibuang");
}

{
  const payload = createBackupPayload({
    transactions: [{ id: "1" }],
    moneySettings: { savingTargetPercent: 20 },
    readinessProfile: { income: 5000000 },
    healthProfile: { businessName: "Toko Uji" },
    healthHistory: [],
    businessCalculators: { activeId: "makanan-umkm", values: {} },
    digitalState: { answers: { "presence-find": 1 }, completed: false },
  }, "2026-09-15T00:00:00.000Z");
  const restored = parseBackupText(JSON.stringify(payload));
  assert.equal(restored.transactions.length, 1);
  assert.equal(restored.healthProfile.businessName, "Toko Uji");
  assert.equal(restored.businessCalculators.activeId, "makanan-umkm");
  assert.equal(restored.digitalState.answers["presence-find"], 1);
  const damaged = structuredClone(payload);
  damaged.data.transactions[0].id = "berubah";
  assert.throws(() => parseBackupText(JSON.stringify(damaged)), /berubah atau rusak/, "Backup yang berubah harus ditolak");
  const legacy = { ...payload, version: 1 };
  delete legacy.checksum;
  assert.equal(parseBackupText(JSON.stringify(legacy)).transactions.length, 1, "Backup versi lama tetap dapat diimpor");
  assert.throws(() => parseBackupText('{"format":"lain"}'), /Format file/);
}

console.log("Semua uji logika SBB lulus.");
