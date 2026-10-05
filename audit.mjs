import assert from "node:assert/strict";
import fs from "node:fs/promises";

const html = await fs.readFile("dist/business/index.html", "utf8");
const section = html.match(/\/\* calculator-data\.mjs \*\/([\s\S]*?)\/\* calculator\.mjs \*\//)?.[1];
assert.ok(section, "Logika kalkulator tidak ditemukan");
const api = new Function(`${section}; return { CALCULATOR_TEMPLATES, calculateBusiness, cloneTemplateInput };`)();

let seed = 0x5bb2026;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
};
const close = (actual, expected, message) => {
  const tolerance = Math.max(0.01, Math.abs(expected) * 1e-10);
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} ≠ ${expected}`);
};

let scenarios = 0;
for (const template of api.CALCULATOR_TEMPLATES) {
  for (let index = 0; index < 250; index += 1) {
    const input = api.cloneTemplateInput(template);
    input.targetMargin = 0.2 + random() * 0.35;
    input.fee = random() * 0.18;
    input.tax = random() * 0.11;
    input.discount = random() * Math.min(0.1, input.targetMargin / 2);
    input.fixedCost = Math.round(random() * 50_000_000);
    input.targetProfit = Math.round(random() * 30_000_000);
    input.targetVolume = 1 + Math.round(random() * 2_000);
    input.rounding = [1, 100, 500, 1_000, 5_000, 10_000][Math.floor(random() * 6)];
    input.directCosts.forEach(item => { item.value = Math.round(random() * 5_000_000); });
    input.supportInputs.forEach((item, supportIndex) => {
      if (template.costModel === "time") {
        item.value = supportIndex < 2
          ? Math.round(random() * 100 * 10) / 10
          : supportIndex === 2
            ? Math.round(random() * 1_000_000)
            : Math.round(random() * 10_000_000);
      } else {
        item.value = supportIndex === 4 ? 1 + Math.round(random() * 500) : Math.round(random() * 10_000_000);
      }
    });

    const result = api.calculateBusiness(template, input);
    assert.equal(result.valid, true, `${template.id}: skenario valid harus dapat dihitung`);
    for (const key of ["allocatedCost", "suggestedPrice", "promoPrice", "contribution", "fixedTotal", "revenue", "variableTotal", "monthlyProfit", "bep", "volumeForTarget"]) {
      assert.ok(Number.isFinite(result[key]), `${template.id}: ${key} harus finite`);
    }
    assert.ok(result.suggestedPrice >= result.allocatedCost, `${template.id}: harga tidak boleh di bawah biaya teralokasi`);
    close(result.unitProfit, result.suggestedPrice * (1 - input.fee - input.tax) - result.allocatedCost, `${template.id}: laba unit`);
    close(result.monthlyProfit, result.contribution * input.targetVolume - result.fixedTotal, `${template.id}: laba periode`);
    close(result.revenue - result.variableTotal - result.fixedTotal, result.monthlyProfit, `${template.id}: rekonsiliasi`);
    close(result.reconciliationDifference, 0, `${template.id}: selisih rekonsiliasi`);
    assert.equal(result.bep, result.contribution > 0 ? Math.ceil(result.fixedTotal / result.contribution) : 0, `${template.id}: BEP`);
    assert.equal(result.volumeForTarget, result.contribution > 0 ? Math.ceil((result.fixedTotal + input.targetProfit) / result.contribution) : 0, `${template.id}: volume target laba`);
    assert.ok(result.marginScenarios[0].price <= result.marginScenarios[1].price && result.marginScenarios[1].price <= result.marginScenarios[2].price, `${template.id}: urutan skenario margin`);
    assert.ok(result.volumeScenarios[0].profit <= result.volumeScenarios[1].profit && result.volumeScenarios[1].profit <= result.volumeScenarios[2].profit, `${template.id}: urutan skenario volume`);
    scenarios += 1;
  }
}

console.log(`Audit numerik lulus: ${api.CALCULATOR_TEMPLATES.length} kalkulator × 250 skenario = ${scenarios.toLocaleString("id-ID")} skenario.`);
