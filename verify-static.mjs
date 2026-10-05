import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve("dist");
const html = await fs.readFile(path.join(root, "index.html"), "utf8");
const appSource = await fs.readFile(path.join(root, "app.mjs"), "utf8");
const businessHtml = await fs.readFile(path.join(root, "business", "index.html"), "utf8");
const markup = `${html}\n${appSource}`;

for (const block of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
  new Function(block[1]);
}
for (const block of businessHtml.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
  new Function(block[1]);
}

for (const moduleImport of appSource.matchAll(/import\s*{([\s\S]*?)}\s*from\s*"(\.\/[^\"]+)";/g)) {
  const importedNames = moduleImport[1]
    .split(",")
    .map((name) => name.trim().split(/\s+as\s+/)[0])
    .filter(Boolean);
  const modulePath = path.join(root, moduleImport[2].slice(2));
  const moduleExports = await import(pathToFileURL(modulePath).href);
  for (const importedName of importedNames) {
    assert.ok(importedName in moduleExports, `${moduleImport[2]} tidak mengekspor ${importedName}`);
  }
}

const moneyLogic = await import(pathToFileURL(path.join(root, "money-logic.mjs")).href);
const categoryNames = Array.from({ length: 22 }, (_, index) => `Kategori ${index + 1}`);
const customSettings = moneyLogic.sanitizeSettings({
  expenseCategories: ["Makan khusus", "Kebutuhan anak", "Makan khusus", ...categoryNames],
  budgets: { "Makan khusus": 12, "Kebutuhan anak": 8 },
});
assert.equal(customSettings.expenseCategories.length, 20, "Kategori pengeluaran harus dibatasi maksimal 20");
assert.deepEqual(customSettings.expenseCategories.slice(0, 2), ["Makan khusus", "Kebutuhan anak"], "Kategori custom harus dipertahankan");
assert.equal(customSettings.budgets["Makan khusus"], 12, "Batas kategori custom harus tersimpan");
const customMonth = moneyLogic.calculateMonth([
  { id: "test-1", type: "expense", category: "Kebutuhan anak", amount: 125000, date: "2026-09-12", createdAt: 1 },
], customSettings, "2026-09");
assert.equal(customMonth.budgetRows.find((row) => row.name === "Kebutuhan anak")?.used, 125000, "Kategori custom harus masuk ke ringkasan");
const calendar = moneyLogic.buildGregorianCalendar("2026-09", [
  { id: "test-2", type: "income", category: "Gaji", amount: 5000000, date: "2026-09-12", createdAt: 2 },
  { id: "test-3", type: "expense", category: "Makan khusus", amount: 50000, date: "2026-09-12", createdAt: 3 },
]);
assert.equal(calendar.daysInMonth, 30, "Kalender Masehi September 2026 harus memiliki 30 hari");
assert.equal(calendar.leadingEmptyDays, 1, "Kalender harus dimulai dari hari Senin");
assert.equal(calendar.cells.find((cell) => cell?.date === "2026-09-12")?.count, 2, "Kalender harus merangkum transaksi per tanggal");

const literalIds = [...markup.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]).filter(id => !id.includes("${"));
const generatedIds = [...appSource.matchAll(/healthMoneyField\("([^"]+)"/g)].map(match => match[1]);
const ids = [...literalIds, ...generatedIds];
assert.equal(ids.length, new Set(ids).size, "ID antarmuka harus unik");

const idSet = new Set(ids);
const referencedIds = [...appSource.matchAll(/\$\("#([^"]+)"\)/g)].map(match => match[1]);
for (const referencedId of new Set(referencedIds)) {
  assert.ok(idSet.has(referencedId), `JavaScript mengarah ke ID yang tidak ada: ${referencedId}`);
}
for (const target of [...markup.matchAll(/\sfor="([^"]+)"/g)].map(match => match[1]).filter(id => !id.includes("${"))) {
  assert.ok(idSet.has(target), `Label mengarah ke ID yang tidak ada: ${target}`);
}

const refs = [...markup.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)]
  .map(match => match[1])
  .filter(ref => !ref.startsWith("./#"));
for (const ref of new Set(refs)) {
  await fs.access(path.join(root, ref.slice(2).split(/[?#]/, 1)[0]));
}

const manifest = JSON.parse(await fs.readFile(path.join(root, "manifest.webmanifest"), "utf8"));
assert.equal(manifest.lang, "id-ID");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.name, "SBB - Siap Buka Bisnis");
assert.equal(manifest.short_name, "SBB");
assert.ok(manifest.icons.some(icon => icon.sizes === "192x192" && icon.purpose === "any"));
assert.ok(manifest.icons.some(icon => icon.sizes === "512x512" && icon.purpose === "maskable"));

const sourceFiles = ["app.mjs", "logic.mjs", "money-logic.mjs", "export-logic.mjs", "backup-logic.mjs", "health-logic.mjs", "digital-logic.mjs", "suite-logic.mjs", "catalog.mjs", "sw.js"];
for (const file of sourceFiles) {
  const source = await fs.readFile(path.join(root, file), "utf8");
  assert.ok(!source.includes("TODO"), `${file} masih memiliki TODO`);
}

for (const toolName of [
  "get_financial_overview",
  "add_money_transaction",
  "get_readiness_summary",
  "set_financial_profile",
  "generate_demo_license_codes",
]) {
  assert.ok(appSource.includes(toolName), `WebMCP tool hilang: ${toolName}`);
}

for (const moduleName of ["Atur Uang", "SBB Start", "Admin SBB", "Google OAuth", "Database D1", "GitHub"]) {
  assert.ok(appSource.includes(moduleName), `Bagian prototipe hilang: ${moduleName}`);
}

for (const navigationFeature of ["NAV_ICON_PATHS", 'navIcon("overview")', 'navIcon("start")', 'navIcon("business")', 'navIcon("health")', 'navIcon("policies")', 'navIcon("admin")']) {
  assert.ok(appSource.includes(navigationFeature), `Ikon navigasi baru hilang: ${navigationFeature}`);
}
assert.ok(!appSource.includes('id="admin-preview"'), "Jalur preview Admin terbuka harus dihapus");
assert.ok(appSource.includes("normalized === ADMIN_ACCESS_CODE"), "Akses akun admin tidak ditemukan");
assert.ok(appSource.includes('session?.role !== "admin"'), "Pembatasan rute Admin tidak ditemukan");

for (const adminSetting of [
  'data-admin-tab="visual"',
  'id="visual-primary"',
  'id="visual-sidebar"',
  'id="visual-accent"',
  'id="visual-canvas"',
  'id="visual-density"',
  'id="visual-radius"',
  'id="visual-logo-size"',
  'id="visual-gate-logo-size"',
  'id="visual-logo-treatment"',
  'id="visual-icon-size"',
  'id="visual-icon-stroke"',
  'id="visual-font-scale"',
  'visualAssetCardMarkup("mainLogo"',
  'visualAssetCardMarkup("gateLogo"',
  'visualAssetCardMarkup("sidebarLogo"',
  'visualAssetCardMarkup("favicon"',
  'visualAssetCardMarkup("appIcon"',
  'NAV_ICON_LABELS',
  'data-visual-icon="${slot}"',
  'applyVisualManifest',
  'readVisualAsset',
  'id="cloudflare-account-id"',
  'id="cloudflare-worker-url"',
  'id="cloudflare-d1-name"',
  'id="cloudflare-r2-bucket"',
  'id="github-workflow"',
  'id="google-allowed-domain"',
  'id="google-scopes"',
  'id="analytics-id"',
  'id="webhook-url"',
  'id="business-feature"',
]) {
  assert.ok(appSource.includes(adminSetting), `Pengaturan Admin belum lengkap: ${adminSetting}`);
}

for (const categoryFeature of ["Rekomendasi dan arahan", "add-expense-category", "data-category-name", "data-delete-category"]) {
  assert.ok(appSource.includes(categoryFeature), `Fitur kategori custom hilang: ${categoryFeature}`);
}

for (const calendarFeature of ["KALENDER MASEHI", "finance-calendar", "data-calendar-date", "openRecordForDate"]) {
  assert.ok(appSource.includes(calendarFeature), `Fitur kalender hilang: ${calendarFeature}`);
}

for (const localSaveFeature of [
  'id="money-local-save-title"',
  'id="money-local-save-note"',
  'id="readiness-local-save-title"',
  'id="readiness-local-save-note"',
  'localSaveTitle: "Tersimpan otomatis"',
  'localSaveNote: "di perangkat ini"',
]) {
  assert.ok(appSource.includes(localSaveFeature), `Informasi penyimpanan lokal hilang: ${localSaveFeature}`);
}

for (const exportFeature of ["export-excel", "export-csv", "buildTransactionXLSX", "buildTransactionCSV", "Maks. 1.000 baris", "Maks. 10.000 baris"]) {
  assert.ok(appSource.includes(exportFeature), `Fitur ekspor transaksi hilang: ${exportFeature}`);
}

for (const businessFeature of [
  'data-route="business"',
  'data-page="business"',
  './business/index.html?embed=1',
]) {
  assert.ok(appSource.includes(businessFeature), `Integrasi SBB Business hilang: ${businessFeature}`);
}

for (const digitalFeature of [
  'data-route="digital"',
  'data-page="digital"',
  'data-admin-tab="digital-content"',
  'id="digital-feature"',
  'id="digital-profile-setup"',
  'id="digital-profile-form"',
  'id="digital-edit-profile"',
  'id="digital-answer-options"',
  'id="digital-question-evidence"',
  'id="digital-checklist"',
  'id="digital-90-day-plan"',
  'id="digital-budget-self"',
  'id="digital-copy-brief"',
  'id="digital-whatsapp"',
  'id="digital-overall-readiness"',
  'id="digital-signal-list"',
  'sanitizeDigitalState',
  'getDigitalQuestions',
  'DIGITAL_PROFILE_OPTIONS',
  'calculateDigitalAssessment',
]) {
  assert.ok(appSource.includes(digitalFeature), `Integrasi SBB Digital hilang: ${digitalFeature}`);
}
assert.ok(!/spreadsheet|docs\.google/i.test(await fs.readFile(path.join(root, "digital-logic.mjs"), "utf8")), "SBB Digital tidak boleh bergantung pada spreadsheet");
for (const calculatorFeature of [
  "editableCostField",
  "cost-label-input",
  'data-add-cost="directCosts"',
  'data-add-cost="additionalSupportCosts"',
  "additionalSupportCosts",
  "Maksimal 20 komponen",
  "12 pilihan umum, atau cari dari semua 51 kalkulator.",
  "Rumus dan asumsi",
  "renderMethod",
  "8 pemeriksaan finansial dan pasar",
  "Validasi harga lokal",
  "marketCheck",
  "CALCULATOR_PROFILES",
]) {
  assert.ok(businessHtml.includes(calculatorFeature), `Fitur biaya fleksibel hilang: ${calculatorFeature}`);
}
assert.ok(!/spreadsheet|docs\.google|sourceUrl|spreadsheetId/i.test(businessHtml), "SBB Business tidak boleh bergantung pada spreadsheet");
assert.ok(!/class="info-button"[^>]*>i<\/button>/.test(businessHtml), "Ikon informasi pada input harus memakai tanda tanya");
assert.ok(/class="info-button"[^>]*>\?<\/button>/.test(businessHtml), "Tanda tanya bantuan input tidak ditemukan");

const calculatorSection = businessHtml.match(/\/\* calculator-data\.mjs \*\/([\s\S]*?)\/\* calculator\.mjs \*\//)?.[1];
assert.ok(calculatorSection, "Data dan logika SBB Business tidak ditemukan");
const calculatorApi = new Function(`${calculatorSection}; return { CALCULATOR_TEMPLATES, calculateBusiness, cloneTemplateInput, calculatorPlaybook, CALCULATOR_PROFILE_BY_ID, CALCULATOR_UNIT_BY_ID };`)();
assert.equal(calculatorApi.CALCULATOR_TEMPLATES.length, 51, "Harus tersedia 50 kalkulator dan 1 kalkulator fleksibel");
assert.equal(new Set(calculatorApi.CALCULATOR_TEMPLATES.map(item => item.id)).size, 51, "ID seluruh kalkulator harus unik");
assert.equal(Object.keys(calculatorApi.CALCULATOR_PROFILE_BY_ID).length, 51, "Setiap kalkulator harus memiliki profil perhitungan");
assert.equal(Object.keys(calculatorApi.CALCULATOR_UNIT_BY_ID).length, 51, "Setiap kalkulator harus memiliki satuan hasil");
const sampleTemplate = calculatorApi.CALCULATOR_TEMPLATES[0];
const sampleInput = calculatorApi.cloneTemplateInput(sampleTemplate);
assert.equal(typeof sampleInput.directCosts[0].label, "string", "Nama biaya harus tersimpan bersama nominal");
const beforeAdditionalCost = calculatorApi.calculateBusiness(sampleTemplate, sampleInput).allocatedCost;
sampleInput.directCosts.push({ id: "test-extra", label: "Biaya uji tambahan", value: 12500 });
assert.equal(calculatorApi.calculateBusiness(sampleTemplate, sampleInput).allocatedCost, beforeAdditionalCost + 12500, "Biaya tambahan harus masuk ke perhitungan");

for (const calculator of calculatorApi.CALCULATOR_TEMPLATES) {
  const id = calculator.id;
  const input = calculatorApi.cloneTemplateInput(calculator);
  const result = calculatorApi.calculateBusiness(calculator, input);
  const playbook = calculatorApi.calculatorPlaybook(calculator);
  assert.ok(playbook.key && playbook.unit && playbook.method && playbook.focus, `${id}: profil kalkulator harus lengkap`);
  assert.equal(result.checks.length, 8, `${id}: harus memiliki delapan pemeriksaan finansial dan pasar`);
  assert.ok(["good", "warning", "danger"].includes(result.assessment.tone), `${id}: status pemeriksaan harus valid`);
  if (id !== "bisnis-lainnya") assert.equal(result.valid, true, `${id}: angka contoh harus dapat dihitung`);
  for (const metric of ["allocatedCost", "suggestedPrice", "contribution", "bep", "costCompleteness"]) {
    assert.ok(Number.isFinite(result[metric]) && result[metric] >= 0, `${id}: ${metric} harus valid`);
  }
  for (const metric of ["monthlyProfit", "safetyMargin"]) assert.ok(Number.isFinite(result[metric]), `${id}: ${metric} harus berupa angka`);
  assert.ok(Math.abs(result.reconciliationDifference) < 0.01, `${id}: omzet, biaya, dan laba harus tereksiliasi`);
  assert.ok(Math.abs((result.revenue - result.variableTotal - result.fixedTotal) - result.monthlyProfit) < 0.01, `${id}: persamaan laba harus presisi`);
  assert.ok(result.suggestedPrice >= result.allocatedCost, `${id}: harga rekomendasi tidak boleh di bawah biaya`);
  const raisedCost = structuredClone(input);
  raisedCost.directCosts.push({ id: "maturity-test", label: "Biaya uji", value: 10000 });
  const raisedResult = calculatorApi.calculateBusiness(calculator, raisedCost);
  assert.ok(raisedResult.allocatedCost >= result.allocatedCost + 10000, `${id}: biaya tambahan harus menaikkan biaya teralokasi`);
  assert.ok(raisedResult.suggestedPrice >= result.suggestedPrice, `${id}: biaya tambahan tidak boleh menurunkan harga rekomendasi`);
  const higherMargin = calculatorApi.calculateBusiness(calculator, { ...structuredClone(input), targetMargin: Math.min(input.targetMargin + 0.05, 0.8) });
  assert.ok(higherMargin.suggestedPrice >= result.suggestedPrice, `${id}: margin lebih tinggi tidak boleh menurunkan harga atau tarif`);
  assert.ok(result.marginScenarios[0].price <= result.marginScenarios[1].price && result.marginScenarios[1].price <= result.marginScenarios[2].price, `${id}: skenario margin harus berurutan`);
  assert.ok(result.volumeScenarios[0].profit <= result.volumeScenarios[1].profit && result.volumeScenarios[1].profit <= result.volumeScenarios[2].profit, `${id}: laba skenario volume harus berurutan`);
  const invalidRatio = calculatorApi.calculateBusiness(calculator, { ...structuredClone(input), targetMargin: 0.9, fee: 0.2 });
  assert.equal(invalidRatio.valid, false, `${id}: total margin dan fee di atas 100% harus ditolak`);
  if (calculator.costModel !== "time") {
    const invalidCapacity = structuredClone(input);
    invalidCapacity.supportInputs[4].value = 0;
    assert.equal(calculatorApi.calculateBusiness(calculator, invalidCapacity).valid, false, `${id}: kapasitas nol harus ditolak`);
  }
}
for (const correctedTimeLabel of ["Biaya pascaproduksi lain", "Cadangan waktu / layanan ulang", "Administrasi / cadangan sesi"]) {
  assert.ok(businessHtml.includes(correctedTimeLabel), `Koreksi biaya berbasis waktu hilang: ${correctedTimeLabel}`);
}

for (const healthFeature of [
  'data-route="health"',
  'data-page="health"',
  "Kesehatan usaha",
  "6 AREA UTAMA",
  "SIMULASI PERBAIKAN",
  "RIWAYAT LOKAL",
  "Tersimpan di perangkat ini",
  "calculateHealth",
  "healthScenarios",
  "HEALTH_SECTOR_OPTIONS",
  "health-sector",
  "PERBANDINGAN BULANAN",
  "buildHealthTrend",
  "HEALTH_EVIDENCE_ITEMS",
  "KEYAKINAN DATA",
  "health-confidence-score",
  '["health", "SBB Health"',
]) {
  assert.ok(appSource.includes(healthFeature), `Fitur SBB Health hilang: ${healthFeature}`);
}

for (const benefitFeature of [
  'data-route="benefits"',
  'data-page="benefits"',
  "About Us",
  "SBB Start",
  "SBB Business",
  "SBB Health",
  "SBB Digital",
  "Perjalanan yang alami",
  "Kalkulator sebagai alat bantu keputusan",
  "ABOUT US",
  'data-admin-tab="sbb-content"',
  'id="sbb-content-form"',
  "data-benefits-field",
  "saveBenefitsContent",
]) {
  assert.ok(appSource.includes(benefitFeature), `Bagian manfaat SBB hilang: ${benefitFeature}`);
}

assert.ok(html.includes("<title>SBB - Siap Buka Bisnis</title>"), "Judul tab browser harus memakai nama SBB");
assert.ok(!appSource.includes("Money & Business OS"), "Subjudul merek lama harus dihapus");
assert.ok(!appSource.includes("SBB FINANCE /"), "Nama SBB Finance di header setiap halaman harus dihapus");
assert.ok(appSource.includes('class="nav-item admin-only"'), "Menu Admin harus tetap dibatasi untuk akun Admin");
for (const policyFeature of [
  'data-route="policies"',
  'data-page="policies"',
  "Ketentuan & Privasi",
  "Privasi data",
  "Login Google",
  "Disclaimer perhitungan",
  "tidak terhubung ke bank",
  "UU 27/2022",
  "PP 71/2019",
  "UU 8/1999",
  "download-local-backup",
  "import-local-backup",
  "Pindahkan data antarperangkat",
]) {
  assert.ok(appSource.includes(policyFeature), `Bagian kebijakan hilang: ${policyFeature}`);
}

const benefitsSection = appSource.match(/function benefitsMarkup\(\) \{([\s\S]*?)\n\}\n\nfunction adminMarkup/)?.[1] || "";
assert.ok(benefitsSection, "Markup Manfaat SBB tidak ditemukan");
for (const internalTerm of ["funnel", "monetisasi", "cross-selling", "lead generation", "recurring revenue"]) {
  assert.ok(!benefitsSection.toLowerCase().includes(internalTerm), `Istilah internal tidak boleh tampil di Manfaat SBB: ${internalTerm}`);
}

assert.ok(appSource.includes("belum tersambung") || appSource.includes("Belum"), "Status integrasi prototipe harus transparan");
console.log(`Validasi statis lulus: ${ids.length} ID unik, ${new Set(refs).size} aset, dan 5 WebMCP tool.`);
