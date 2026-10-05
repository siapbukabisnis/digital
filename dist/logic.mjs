export const SKILLS = [
  "Belum tahu",
  "Administrasi",
  "AI / otomasi",
  "Bahasa asing",
  "Berkebun",
  "Bersih-bersih",
  "Bicara / suara",
  "Desain",
  "Edit video",
  "Fotografi",
  "Jualan",
  "Kerajinan tangan",
  "Media sosial",
  "Memasak",
  "Mengajar",
  "Mengatur acara",
  "Menggambar",
  "Menjahit",
  "Menulis",
  "Musik",
  "Pembukuan",
  "Rawat hewan",
  "Tata rias",
  "Teknis",
  "Website / no-code",
];

export const WORK_MODES = ["Online", "Offline", "Fleksibel"];
export const EQUIPMENT_OPTIONS = [
  "Belum tahu",
  "Ponsel",
  "Ponsel + laptop",
  "Alat produksi",
  "Laptop + alat",
];

export const DEFAULT_PROFILE = Object.freeze({
  income: 2_400_000,
  mandatoryExpenses: 2_000_000,
  otherExpenses: 200_000,
  savingsGoal: 1_000_000,
  emergencyFundBalance: 0,
  businessFundBalance: 0,
  startupCapital: 0,
  weeklyHours: 8,
  skills: ["Berkebun", "Bersih-bersih", "Belum tahu"],
  emergencyMonths: 12,
  testBudget: 10_000_000,
  workMode: "Online",
  equipment: "Ponsel + laptop",
  businessReserve: 0,
});

export const MONEY_FIELDS = [
  "income",
  "mandatoryExpenses",
  "otherExpenses",
  "savingsGoal",
  "emergencyFundBalance",
  "businessFundBalance",
  "startupCapital",
  "testBudget",
  "businessReserve",
];
export const MAX_READINESS_MONEY = 100_000_000_000_000;

const REQUIRED_NUMBERS = [...MONEY_FIELDS, "weeklyHours", "emergencyMonths"];

export function uniqueSkills(values = []) {
  const valid = values.filter(value => SKILLS.includes(value));
  const withoutPlaceholder = valid.filter(value => value !== "Belum tahu");
  return [...new Set(withoutPlaceholder.length ? withoutPlaceholder : ["Belum tahu"] )];
}

export function validateProfile(profile) {
  const errors = [];
  for (const field of REQUIRED_NUMBERS) {
    const value = profile[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push({ field, message: "Wajib diisi dengan angka." });
    } else if (value < 0) {
      errors.push({ field, message: "Tidak boleh negatif." });
    } else if (MONEY_FIELDS.includes(field) && (!Number.isSafeInteger(value) || value > MAX_READINESS_MONEY)) {
      errors.push({ field, message: "Gunakan nominal rupiah bulat yang berada dalam batas perhitungan." });
    }
  }

  if (Number.isFinite(profile.emergencyMonths) &&
      (!Number.isInteger(profile.emergencyMonths) || profile.emergencyMonths < 3 || profile.emergencyMonths > 12)) {
    errors.push({ field: "emergencyMonths", message: "Pilih bilangan bulat antara 3 dan 12 bulan." });
  }
  if (Number.isFinite(profile.weeklyHours) && profile.weeklyHours > 80) {
    errors.push({ field: "weeklyHours", message: "Maksimal 80 jam per minggu." });
  }
  if (!Array.isArray(profile.skills) || !uniqueSkills(profile.skills).length) {
    errors.push({ field: "skills", message: "Pilih sedikitnya satu keterampilan." });
  }
  if (!WORK_MODES.includes(profile.workMode)) {
    errors.push({ field: "workMode", message: "Pilih cara kerja yang tersedia." });
  }
  if (!EQUIPMENT_OPTIONS.includes(profile.equipment)) {
    errors.push({ field: "equipment", message: "Pilih peralatan yang tersedia." });
  }
  return errors;
}

function statusFor(result) {
  if (!result.valid) {
    return {
      key: "invalid",
      label: "Lengkapi data",
      title: "Ada data yang perlu diperiksa",
      action: "Lengkapi kolom yang ditandai agar hasil tidak menyesatkan.",
    };
  }
  if (result.cashSurplus <= 0) {
    return {
      key: "danger",
      label: "Perbaiki arus kas",
      title: "Belum aman menambah biaya usaha",
      action: "Buat arus kas bulanan positif terlebih dahulu. Kurangi pengeluaran yang bisa ditunda atau tambah pemasukan tanpa berutang.",
    };
  }
  if (result.emergencyGap > 0) {
    return {
      key: "warning",
      label: "Bangun dana darurat",
      title: "Lindungi kebutuhan wajib lebih dulu",
      action: `Arahkan sisa kas bulanan ke dana darurat sampai kekurangannya tertutup. Sambil menunggu, validasi minat pembeli tanpa belanja.`,
    };
  }
  if (result.businessNeed === 0) {
    return {
      key: "warning",
      label: "Isi rencana usaha",
      title: "Kebutuhan usaha belum ditentukan",
      action: "Isi perkiraan modal awal atau anggaran uji agar kesiapan usaha dapat dihitung.",
    };
  }
  if (result.businessGap > 0) {
    if (result.safeTestAmount > 0) {
      return {
        key: "progress",
        label: "Siap uji kecil",
        title: "Ada dana aman untuk satu uji terbatas",
        action: "Gunakan hanya bagian dana uji yang diperlukan sambil tetap melengkapi kebutuhan usaha. Cari bukti minat atau pesanan sebelum menambah biaya.",
      };
    }
    return {
      key: "progress",
      label: "Lengkapi dana usaha",
      title: "Dana darurat aman, dana usaha belum cukup",
      action: "Sesudah dana darurat aman, arahkan tabungan bulanan ke kekurangan dana usaha. Tetap uji permintaan dengan cara gratis.",
    };
  }
  if (result.testBudget === 0) {
    return {
      key: "ready",
      label: "Siap validasi",
      title: "Fondasi keuangan sudah memenuhi rencana",
      action: "Mulai dari validasi tanpa biaya: ajukan penawaran kepada calon pembeli dan catat responsnya.",
    };
  }
  return {
    key: "ready",
    label: "Siap uji bertahap",
    title: "Fondasi keuangan memenuhi rencana",
    action: "Gunakan hanya biaya uji yang benar-benar diperlukan. Cari bukti minat atau pesanan sebelum menambah pengeluaran.",
  };
}

export function calculateReadiness(profile) {
  const errors = validateProfile(profile);
  if (errors.length) {
    const invalid = {
      valid: false,
      errors,
      cashSurplus: null,
      monthlySaving: null,
      emergencyTarget: null,
      emergencyGap: null,
      businessNeed: null,
      businessGap: null,
      totalGap: null,
      safeTestAmount: null,
      monthsToReady: null,
      savingsGoalMonths: null,
      emergencyMonthsToFund: null,
      businessMonthsToFund: null,
      testBudget: null,
    };
    return { ...invalid, status: statusFor(invalid) };
  }

  const cashSurplus = profile.income - profile.mandatoryExpenses - profile.otherExpenses;
  const monthlySaving = Math.max(cashSurplus, 0);
  const emergencyTarget = profile.mandatoryExpenses * profile.emergencyMonths;
  const emergencyGap = Math.max(emergencyTarget - profile.emergencyFundBalance, 0);

  // Modal awal dan anggaran uji tidak dijumlahkan karena anggaran uji biasanya
  // merupakan bagian dari modal awal. Nilai terbesar mencegah kebutuhan terlewat.
  const businessNeed = Math.max(profile.startupCapital, profile.testBudget) + profile.businessReserve;
  const businessGap = Math.max(businessNeed - profile.businessFundBalance, 0);
  const totalGap = emergencyGap + businessGap;
  const safeTestAmount = emergencyGap === 0 && cashSurplus > 0
    ? Math.min(profile.testBudget, Math.max(profile.businessFundBalance - profile.businessReserve, 0))
    : 0;

  const monthsFor = amount => amount === 0 ? 0 : monthlySaving === 0 ? null : Math.ceil(amount / monthlySaving);
  const result = {
    valid: true,
    errors: [],
    cashSurplus,
    monthlySaving,
    emergencyTarget,
    emergencyGap,
    businessNeed,
    businessGap,
    totalGap,
    safeTestAmount,
    monthsToReady: monthsFor(totalGap),
    savingsGoalMonths: monthsFor(profile.savingsGoal),
    emergencyMonthsToFund: monthsFor(emergencyGap),
    businessMonthsToFund: monthsFor(businessGap),
    testBudget: profile.testBudget,
  };
  return { ...result, status: statusFor(result) };
}

function equipmentCapabilities(equipment) {
  return {
    laptop: equipment === "Ponsel + laptop" || equipment === "Laptop + alat",
    productionTools: equipment === "Alat produksi" || equipment === "Laptop + alat",
  };
}

export function recommendIdeas(profile, ideas, limit = 3) {
  const selected = uniqueSkills(profile.skills);
  const selectedSet = new Set(selected);
  const capabilities = equipmentCapabilities(profile.equipment);
  const weeklyHours = typeof profile.weeklyHours === "number" && Number.isFinite(profile.weeklyHours)
    ? profile.weeklyHours
    : 0;

  return ideas.map(idea => {
    const allSkills = [...new Set([...idea.coreSkills, ...idea.supportSkills])];
    const matchedSkills = allSkills.filter(skill => selectedSet.has(skill));
    const missingCore = idea.coreSkills.filter(skill => !selectedSet.has(skill));
    const coreMatched = idea.coreSkills.length - missingCore.length;
    const coreFit = missingCore.length === 0;
    const timeOk = weeklyHours >= idea.minHours;
    const laptopOk = !idea.laptopRequired || capabilities.laptop;
    const productionToolsOk = !idea.productionToolsRequired || capabilities.productionTools;
    const equipmentOk = laptopOk && productionToolsOk;
    const modeOk = idea.workMode === "Fleksibel" || profile.workMode === "Fleksibel" || idea.workMode === profile.workMode;
    const feasible = coreFit && timeOk && equipmentOk && modeOk;
    const gaps = [];
    if (missingCore.length) gaps.push(`keterampilan inti: ${missingCore.join(", ")}`);
    if (!timeOk) gaps.push(`waktu minimum ${idea.minHours} jam/minggu`);
    if (!laptopOk) gaps.push("laptop");
    if (!productionToolsOk) gaps.push("alat produksi");
    if (!modeOk) gaps.push(`cara kerja ${idea.workMode.toLowerCase()}`);

    const score =
      (coreFit ? 1_000_000 : 0) +
      (feasible ? 100_000 : 0) +
      coreMatched * 10_000 +
      matchedSkills.length * 1_000 +
      (timeOk ? 100 : 0) +
      (equipmentOk ? 50 : 0) +
      (modeOk ? 25 : 0) +
      idea.packagePriority * 10 -
      idea.id / 1_000;

    return {
      ...idea,
      matchedSkills,
      missingCore,
      coreFit,
      timeOk,
      equipmentOk,
      modeOk,
      feasible,
      gaps,
      score,
    };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
}

export function readinessSummary(profile) {
  const result = calculateReadiness(profile);
  if (!result.valid) {
    return { valid: false, errors: result.errors };
  }
  return {
    valid: true,
    status: result.status.label,
    monthlySaving: result.monthlySaving,
    emergencyGap: result.emergencyGap,
    businessGap: result.businessGap,
    totalGap: result.totalGap,
    safeTestAmount: result.safeTestAmount,
    monthsToReady: result.monthsToReady,
  };
}
