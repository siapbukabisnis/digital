export const HEALTH_NUMBER_FIELDS = [
  "revenue",
  "previousRevenue",
  "cogs",
  "operatingExpenses",
  "cashBalance",
  "receivables",
  "inventory",
  "debtPayments",
  "ownerWithdrawals",
  "repeatCustomerPercent",
  "topCustomerPercent",
  "recordCompletenessPercent",
];

export const HEALTH_SECTORS = {
  general: {
    label: "Umum / belum ditentukan",
    note: "Pembanding umum untuk usaha yang belum memilih sektor khusus.",
    grossMargin: 0.3,
    operatingMargin: 0.1,
    receivableDays: 45,
    inventoryDays: 60,
    repeatCustomer: 0.3,
    topCustomer: 0.4,
  },
  food: {
    label: "Kuliner & F&B",
    note: "Lebih menekankan margin kotor, kecepatan stok, dan pembelian ulang.",
    grossMargin: 0.5,
    operatingMargin: 0.12,
    receivableDays: 14,
    inventoryDays: 20,
    repeatCustomer: 0.35,
    topCustomer: 0.3,
  },
  retail: {
    label: "Retail & perdagangan",
    note: "Menilai perputaran stok, margin perdagangan, dan konsentrasi pelanggan.",
    grossMargin: 0.3,
    operatingMargin: 0.08,
    receivableDays: 21,
    inventoryDays: 45,
    repeatCustomer: 0.3,
    topCustomer: 0.25,
  },
  services: {
    label: "Jasa profesional & layanan",
    note: "Lebih menekankan margin jasa, penagihan, pelanggan berulang, dan disiplin kas.",
    grossMargin: 0.6,
    operatingMargin: 0.15,
    receivableDays: 45,
    inventoryDays: null,
    repeatCustomer: 0.35,
    topCustomer: 0.35,
  },
  digital: {
    label: "Kreatif & digital",
    note: "Pembanding untuk usaha bermodal aset ringan dengan margin dan arus kas sebagai fokus.",
    grossMargin: 0.7,
    operatingMargin: 0.2,
    receivableDays: 35,
    inventoryDays: null,
    repeatCustomer: 0.3,
    topCustomer: 0.35,
  },
  production: {
    label: "Produksi & manufaktur kecil",
    note: "Memberi ruang perputaran stok lebih panjang dan menilai efisiensi biaya produksi.",
    grossMargin: 0.35,
    operatingMargin: 0.1,
    receivableDays: 45,
    inventoryDays: 75,
    repeatCustomer: 0.3,
    topCustomer: 0.35,
  },
  property: {
    label: "Properti, sewa & konstruksi",
    note: "Mengakomodasi siklus transaksi lebih panjang dan pelanggan berulang yang lebih rendah.",
    grossMargin: 0.3,
    operatingMargin: 0.12,
    receivableDays: 90,
    inventoryDays: null,
    repeatCustomer: 0.15,
    topCustomer: 0.45,
  },
};

export const HEALTH_SECTOR_OPTIONS = Object.entries(HEALTH_SECTORS).map(([value, item]) => ({ value, label: item.label }));

export const HEALTH_EVIDENCE_ITEMS = [
  { id: "salesRecords", label: "Catatan penjualan lengkap", note: "Omzet dapat ditelusuri ke transaksi, invoice, POS, atau rekap penjualan." },
  { id: "expenseReceipts", label: "Bukti biaya tersimpan", note: "Biaya memiliki nota, invoice, tagihan, atau catatan pembayaran." },
  { id: "cashReconciled", label: "Kas dan bank sudah dicocokkan", note: "Saldo catatan sesuai dengan uang tunai dan rekening pada akhir periode." },
  { id: "receivablesPayablesList", label: "Daftar piutang dan utang tersedia", note: "Nilai, pihak, tanggal, dan status pembayaran dapat diperiksa." },
  { id: "inventoryCount", label: "Stok fisik sudah dihitung", note: "Jumlah dan nilai stok diperiksa pada akhir periode; abaikan bila sektor tidak memakai persediaan." },
  { id: "ownerWithdrawalsRecorded", label: "Pengambilan pemilik tercatat", note: "Prive atau pengambilan pribadi dapat dibedakan dari biaya usaha." },
  { id: "profitLossPrepared", label: "Laba rugi periode tersedia", note: "Omzet, HPP, biaya, dan laba periode telah diringkas." },
  { id: "taxReviewed", label: "Kewajiban pajak ditinjau", note: "Status, dasar perhitungan, dan tenggat diperiksa sesuai kondisi usaha." },
];

export const DEFAULT_HEALTH_PROFILE = {
  businessName: "Usaha Saya",
  sector: "general",
  period: "",
  revenue: 50000000,
  previousRevenue: 45000000,
  cogs: 25000000,
  operatingExpenses: 15000000,
  cashBalance: 30000000,
  receivables: 10000000,
  inventory: 8000000,
  debtPayments: 3000000,
  ownerWithdrawals: 4000000,
  repeatCustomerPercent: 35,
  topCustomerPercent: 25,
  recordCompletenessPercent: 80,
  separateFinances: true,
  cashPlan: true,
  evidence: {
    salesRecords: true,
    expenseReceipts: true,
    cashReconciled: false,
    receivablesPayablesList: false,
    inventoryCount: false,
    ownerWithdrawalsRecorded: true,
    profitLossPrepared: false,
    taxReviewed: false,
  },
};

const clamp = (value, minimum = 0, maximum = 100) => Math.min(Math.max(Number(value) || 0, minimum), maximum);
const average = values => values.reduce((total, value) => total + value, 0) / values.length;
const rounded = value => Math.round(clamp(value));
const isValidPeriod = value => {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value || ""));
  return Boolean(match && Number(match[2]) >= 1 && Number(match[2]) <= 12);
};

export function sanitizeHealthProfile(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const profile = { ...DEFAULT_HEALTH_PROFILE, ...source };
  profile.businessName = String(profile.businessName || "Usaha Saya").trim().slice(0, 80) || "Usaha Saya";
  profile.sector = HEALTH_SECTORS[profile.sector] ? profile.sector : "general";
  profile.period = isValidPeriod(profile.period) ? String(profile.period) : "";
  for (const field of HEALTH_NUMBER_FIELDS) profile[field] = Number.isFinite(Number(profile[field])) ? Math.min(Math.max(Number(profile[field]) || 0, 0), 100_000_000_000_000) : 0;
  for (const field of ["repeatCustomerPercent", "topCustomerPercent", "recordCompletenessPercent"]) profile[field] = clamp(profile[field]);
  profile.separateFinances = Boolean(profile.separateFinances);
  profile.cashPlan = Boolean(profile.cashPlan);
  const evidenceSource = source.evidence && typeof source.evidence === "object" ? source.evidence : {};
  profile.evidence = Object.fromEntries(HEALTH_EVIDENCE_ITEMS.map(item => [item.id, Boolean(evidenceSource[item.id] ?? DEFAULT_HEALTH_PROFILE.evidence[item.id])]));
  return profile;
}

function benchmarkHigher(value, target) {
  const safeTarget = Math.max(Number(target) || 0, 0.01);
  const ratio = value / safeTarget;
  return higherIsBetter(ratio, [[1.2, 100], [1, 85], [0.7, 62], [0.4, 35]]);
}

function benchmarkLower(value, target) {
  const safeTarget = Math.max(Number(target) || 0, 1);
  const ratio = value / safeTarget;
  return lowerIsBetter(ratio, [[1, 100], [1.5, 80], [2, 58], [3, 32]]);
}

function higherIsBetter(value, levels) {
  for (const [minimum, score] of levels) if (value >= minimum) return score;
  return 10;
}

function lowerIsBetter(value, levels) {
  for (const [maximum, score] of levels) if (value <= maximum) return score;
  return 15;
}

export function calculateHealth(value = {}) {
  const profile = sanitizeHealthProfile(value);
  const benchmark = HEALTH_SECTORS[profile.sector];
  const revenue = profile.revenue;
  const grossProfit = revenue - profile.cogs;
  const operatingProfit = grossProfit - profile.operatingExpenses;
  const netCash = operatingProfit - profile.debtPayments - profile.ownerWithdrawals;
  const grossMargin = revenue ? grossProfit / revenue : 0;
  const operatingMargin = revenue ? operatingProfit / revenue : 0;
  const monthlyOutflow = profile.cogs + profile.operatingExpenses + profile.debtPayments + profile.ownerWithdrawals;
  const cashRunway = monthlyOutflow ? profile.cashBalance / monthlyOutflow : profile.cashBalance ? 12 : 0;
  const receivableDays = revenue ? profile.receivables / revenue * 30 : profile.receivables ? Number.POSITIVE_INFINITY : 0;
  const inventoryDays = profile.cogs ? profile.inventory / profile.cogs * 30 : profile.inventory ? Number.POSITIVE_INFINITY : 0;
  const debtCoverage = profile.debtPayments ? operatingProfit / profile.debtPayments : null;
  const revenueGrowth = profile.previousRevenue ? (revenue - profile.previousRevenue) / profile.previousRevenue : null;
  const dataWarnings = [];
  if (revenue === 0) dataWarnings.push("Omzet periode ini nol; rasio berbasis omzet tidak dapat dinilai penuh.");
  if (profile.cogs > revenue && revenue > 0) dataWarnings.push("HPP melebihi omzet; periksa periode dan klasifikasi biaya.");
  if (profile.receivables > 0 && revenue === 0) dataWarnings.push("Piutang terisi tetapi omzet nol; pastikan keduanya memakai periode yang sama.");
  if (profile.inventory > 0 && profile.cogs === 0) dataWarnings.push("Stok terisi tetapi HPP nol; hari persediaan belum dapat dihitung.");
  const applicableEvidence = HEALTH_EVIDENCE_ITEMS.filter(item => item.id !== "inventoryCount" || benchmark.inventoryDays !== null);
  const completedEvidence = applicableEvidence.filter(item => profile.evidence[item.id]);
  const confidencePercent = rounded(completedEvidence.length / applicableEvidence.length * 100);
  const confidence = confidencePercent >= 85
    ? { label: "Data kuat", tone: "good", summary: "Sebagian besar angka mempunyai catatan atau bukti pendukung." }
    : confidencePercent >= 60
      ? { label: "Data cukup", tone: "warning", summary: "Hasil dapat dipakai untuk evaluasi awal, tetapi beberapa angka masih perlu dibuktikan." }
      : { label: "Data terbatas", tone: "danger", summary: "Skor kesehatan berisiko menyesatkan karena bukti pendukung masih kurang." };

  const pillars = [
    {
      key: "profitability",
      label: "Profitabilitas",
      score: rounded(average([
        benchmarkHigher(grossMargin, benchmark.grossMargin),
        benchmarkHigher(operatingMargin, benchmark.operatingMargin),
      ])),
      action: "Tinjau harga jual, HPP, dan biaya operasional. Utamakan produk dengan margin kontribusi paling sehat.",
    },
    {
      key: "cashflow",
      label: "Arus kas & likuiditas",
      score: rounded(average([
        higherIsBetter(cashRunway, [[3, 100], [2, 84], [1, 60], [0.5, 35]]),
        netCash > 0 ? 100 : netCash >= -revenue * 0.05 ? 45 : 15,
      ])),
      action: "Bangun cadangan kas, percepat penagihan, dan kendalikan pengambilan pribadi sampai arus kas kembali positif.",
    },
    {
      key: "efficiency",
      label: "Efisiensi modal kerja",
      score: rounded(average([
        benchmarkLower(receivableDays, benchmark.receivableDays),
        ...(benchmark.inventoryDays ? [benchmarkLower(inventoryDays, benchmark.inventoryDays)] : []),
      ])),
      action: "Kurangi piutang terlambat dan stok lambat bergerak agar uang lebih cepat kembali menjadi kas.",
    },
    {
      key: "debt",
      label: "Beban kewajiban",
      score: profile.debtPayments === 0 ? 100 : rounded(average([
        higherIsBetter(debtCoverage, [[2, 100], [1.5, 82], [1.2, 62], [1, 42]]),
        lowerIsBetter(revenue ? profile.debtPayments / revenue : 1, [[0.1, 100], [0.2, 75], [0.3, 48], [0.4, 28]]),
      ])),
      action: "Pastikan laba operasi mampu menutup cicilan. Hindari kewajiban baru sebelum rasio pembayaran lebih aman.",
    },
    {
      key: "resilience",
      label: "Ketahanan penjualan",
      score: rounded(average([
        revenueGrowth === null ? 50 : higherIsBetter(revenueGrowth, [[0.1, 100], [0, 75], [-0.1, 45], [-0.2, 25]]),
        benchmarkHigher(profile.repeatCustomerPercent / 100, benchmark.repeatCustomer),
        benchmarkLower(profile.topCustomerPercent / 100, benchmark.topCustomer),
      ])),
      action: "Naikkan pembelian ulang dan kurangi ketergantungan pada satu pelanggan atau satu sumber omzet.",
    },
    {
      key: "discipline",
      label: "Disiplin pengelolaan",
      score: rounded(average([
        profile.recordCompletenessPercent,
        profile.separateFinances ? 100 : 35,
        profile.cashPlan ? 100 : 35,
        confidencePercent,
      ])),
      action: "Lengkapi pencatatan, pisahkan uang pribadi dan usaha, lalu buat rencana kas bulanan yang diperbarui rutin.",
    },
  ];

  const weights = { profitability: 0.25, cashflow: 0.25, efficiency: 0.15, debt: 0.1, resilience: 0.15, discipline: 0.1 };
  const score = rounded(pillars.reduce((total, pillar) => total + pillar.score * weights[pillar.key], 0));
  const status = score >= 80
    ? { label: "Sehat", tone: "good", summary: "Fondasi utama cukup kuat. Pertahankan disiplin dan fokus pada peningkatan yang paling berdampak." }
    : score >= 65
      ? { label: "Cukup sehat", tone: "good", summary: "Usaha berjalan cukup baik, tetapi beberapa area perlu diperkuat agar lebih tahan terhadap perubahan." }
      : score >= 50
        ? { label: "Waspada", tone: "warning", summary: "Ada kelemahan yang dapat menekan kas atau laba. Dahulukan tiga prioritas terendah." }
        : { label: "Perlu tindakan", tone: "danger", summary: "Fondasi usaha sedang rapuh. Tahan ekspansi dan perbaiki arus kas serta laba lebih dahulu." };

  const evidencePriority = {
    key: "evidence",
    label: "Keandalan data",
    score: confidencePercent,
    action: `Lengkapi bukti periode ini: ${applicableEvidence.filter(item => !profile.evidence[item.id]).slice(0, 3).map(item => item.label.toLocaleLowerCase("id-ID")).join(", ") || "pertahankan rekonsiliasi dan arsip bukti"}.`,
  };
  const priorities = confidencePercent < 75
    ? [evidencePriority, ...[...pillars].sort((a, b) => a.score - b.score)].slice(0, 3)
    : [...pillars].sort((a, b) => a.score - b.score).slice(0, 3);

  return {
    profile,
    benchmark: { key: profile.sector, ...benchmark },
    score,
    status,
    pillars,
    priorities,
    confidence: {
      ...confidence,
      percent: confidencePercent,
      completed: completedEvidence.length,
      total: applicableEvidence.length,
      missing: applicableEvidence.filter(item => !profile.evidence[item.id]),
    },
    dataWarnings,
    metrics: { grossProfit, operatingProfit, netCash, grossMargin, operatingMargin, cashRunway, receivableDays, inventoryDays, debtCoverage, revenueGrowth },
  };
}

export function buildHealthTrend(history = [], businessName = "", sector = "") {
  const targetName = String(businessName || "").trim().toLocaleLowerCase("id-ID");
  const targetSector = String(sector || "").trim();
  const valid = (Array.isArray(history) ? history : [])
    .filter(item => item && /^\d{4}-\d{2}$/.test(String(item.period || "")) && Number.isFinite(Number(item.score)))
    .filter(item => !targetName || String(item.businessName || "").trim().toLocaleLowerCase("id-ID") === targetName)
    .filter(item => !targetSector || String(item.sector || item.profile?.sector || "general") === targetSector)
    .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  const latestByPeriod = new Map();
  for (const item of valid) {
    if (latestByPeriod.has(item.period)) continue;
    latestByPeriod.set(item.period, {
      period: item.period,
      score: rounded(item.score),
      status: String(item.status || ""),
    });
  }
  const points = [...latestByPeriod.values()].sort((a, b) => a.period.localeCompare(b.period)).slice(-12);
  return points.map((point, index) => ({
    ...point,
    changeFromPrevious: index ? point.score - points[index - 1].score : null,
  }));
}

export function healthScenarios(value = {}) {
  const profile = sanitizeHealthProfile(value);
  return [
    {
      label: "Omzet naik 10%",
      note: "Biaya pokok ikut naik 10%.",
      result: calculateHealth({ ...profile, revenue: profile.revenue * 1.1, cogs: profile.cogs * 1.1 }),
    },
    {
      label: "Biaya operasi turun 10%",
      note: "Kualitas layanan diasumsikan tetap.",
      result: calculateHealth({ ...profile, operatingExpenses: profile.operatingExpenses * 0.9 }),
    },
    {
      label: "Piutang tertagih 30%",
      note: "Kas bertambah dari piutang yang tertagih.",
      result: calculateHealth({ ...profile, receivables: profile.receivables * 0.7, cashBalance: profile.cashBalance + profile.receivables * 0.3 }),
    },
  ];
}
