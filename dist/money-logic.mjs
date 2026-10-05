export const DEFAULT_SAVING_TARGET = 20;
export const MAX_EXPENSE_CATEGORIES = 20;
export const MAX_TRANSACTION_COUNT = 10_000;
export const MAX_TRANSACTION_AMOUNT = 900_000_000_000;

export const EXPENSE_CATEGORIES = [
  { name: "Makan & minum", percent: 10 },
  { name: "Transportasi", percent: 5 },
  { name: "Belanja harian", percent: 5 },
  { name: "Sewa / KPR", percent: 11 },
  { name: "Listrik", percent: 3 },
  { name: "Air", percent: 1 },
  { name: "Internet", percent: 2 },
  { name: "Pulsa", percent: 1 },
  { name: "Cicilan", percent: 20 },
  { name: "Kesehatan", percent: 3 },
  { name: "Pendidikan", percent: 3 },
  { name: "Keluarga & anak", percent: 2 },
  { name: "Asuransi", percent: 2 },
  { name: "Hiburan", percent: 1.5 },
  { name: "Langganan aplikasi", percent: 0.5 },
  { name: "Pakaian", percent: 1 },
  { name: "Perawatan diri", percent: 1 },
  { name: "Sosial & sedekah", percent: 1 },
  { name: "Pajak & administrasi", percent: 0.5 },
  { name: "Lainnya", percent: 0.5 },
];

export const INCOME_CATEGORIES = [
  "Gaji",
  "Bonus",
  "Freelance",
  "Usaha",
  "Komisi",
  "Penjualan",
  "Hasil investasi",
  "Sewa",
  "Hadiah",
  "Lainnya",
];

export const SAVING_CATEGORIES = [
  "Dana darurat",
  "Tabungan umum",
  "Investasi",
  "Pendidikan",
  "Rumah",
  "Kendaraan",
  "Liburan",
  "Lainnya",
];

export const TYPE_LABELS = {
  income: "Masuk",
  expense: "Keluar",
  saving: "Ditabung",
};

export function defaultBudgets() {
  return Object.fromEntries(EXPENSE_CATEGORIES.map((item) => [item.name, item.percent]));
}

function cleanCategoryName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
}

function sanitizeExpenseCategories(categories) {
  const source = Array.isArray(categories) ? categories : EXPENSE_CATEGORIES.map((item) => item.name);
  const unique = [];
  const seen = new Set();
  for (const value of source) {
    const name = cleanCategoryName(value);
    const key = name.toLocaleLowerCase("id-ID");
    if (!name || seen.has(key)) continue;
    unique.push(name);
    seen.add(key);
    if (unique.length === MAX_EXPENSE_CATEGORIES) break;
  }
  return unique.length ? unique : ["Lainnya"];
}

export function categoriesForType(type, expenseCategories) {
  if (type === "income") return INCOME_CATEGORIES;
  if (type === "saving") return SAVING_CATEGORIES;
  return sanitizeExpenseCategories(expenseCategories);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

export function numericValue(value) {
  const digits = String(value ?? "").replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

export function isValidISODate(value) {
  const text = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function formatNumericInput(value) {
  const number = numericValue(value);
  return number ? new Intl.NumberFormat("id-ID").format(number) : "";
}

export function formatRupiah(value) {
  const amount = Math.round(Number(value) || 0);
  const sign = amount < 0 ? "-" : "";
  return `${sign}Rp ${new Intl.NumberFormat("id-ID").format(Math.abs(amount))}`;
}

export function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function monthKeyFromDate(dateValue = todayISO()) {
  return String(dateValue).slice(0, 7);
}

export function getCurrentMonthKey() {
  return monthKeyFromDate(todayISO());
}

export function shiftMonth(monthKey, amount) {
  const [year, month] = monthKey.split("-").map(Number);
  const result = new Date(year, month - 1 + amount, 1);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(monthKey, style = "long") {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: style, year: "numeric" }).format(new Date(year, month - 1, 1));
}

export function buildGregorianCalendar(monthKey, transactions = []) {
  const safeMonthKey = /^\d{4}-\d{2}$/.test(monthKey) ? monthKey : getCurrentMonthKey();
  const [year, month] = safeMonthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
  const monthTransactions = sanitizeTransactions(transactions).filter((item) => monthKeyFromDate(item.date) === safeMonthKey);
  const byDate = new Map();
  for (const item of monthTransactions) {
    const current = byDate.get(item.date) || { count: 0, income: 0, expense: 0, saving: 0, types: new Set() };
    current.count += 1;
    current[item.type] += item.amount;
    current.types.add(item.type);
    byDate.set(item.date, current);
  }
  const cells = Array.from({ length: leadingEmptyDays }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${safeMonthKey}-${String(day).padStart(2, "0")}`;
    const summary = byDate.get(date) || { count: 0, income: 0, expense: 0, saving: 0, types: new Set() };
    cells.push({ ...summary, types: [...summary.types], day, date });
  }
  return { monthKey: safeMonthKey, year, month, daysInMonth, leadingEmptyDays, cells };
}

export function dateLabel(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function sum(items) {
  return items.reduce((total, value) => total + (Number(value) || 0), 0);
}

export function sanitizeSettings(settings = {}) {
  settings = settings && typeof settings === "object" && !Array.isArray(settings) ? settings : {};
  const defaults = defaultBudgets();
  const suppliedBudgets = settings.budgets && typeof settings.budgets === "object" ? settings.budgets : {};
  const expenseCategories = sanitizeExpenseCategories(settings.expenseCategories);
  const budgets = Object.fromEntries(
    expenseCategories.map((name) => [name, clamp(suppliedBudgets[name] ?? defaults[name] ?? 0, 0, 100)]),
  );
  const suppliedAmounts = settings.budgetAmounts && typeof settings.budgetAmounts === "object" ? settings.budgetAmounts : {};
  const budgetAmounts = Object.fromEntries(expenseCategories.filter(name => Object.hasOwn(suppliedAmounts, name) && Number.isFinite(Number(suppliedAmounts[name]))).map(name => [name, Math.round(clamp(suppliedAmounts[name], 0, MAX_TRANSACTION_AMOUNT))]));

  return {
    budgets,
    budgetAmounts,
    expenseCategories,
    savingTargetPercent: clamp(settings.savingTargetPercent ?? DEFAULT_SAVING_TARGET, 0, 100),
    ...(settings.savingTargetAmount != null && Number.isFinite(Number(settings.savingTargetAmount)) ? { savingTargetAmount: Math.round(clamp(settings.savingTargetAmount, 0, MAX_TRANSACTION_AMOUNT)) } : {}),
    onboardingComplete: Boolean(settings.onboardingComplete),
  };
}

export function sanitizeTransactions(transactions) {
  if (!Array.isArray(transactions)) return [];

  const cleaned = transactions
    .filter((item) => item && ["income", "expense", "saving"].includes(item.type))
    .map((item) => ({
      id: String(item.id || "").trim().slice(0, 120),
      type: item.type,
      category: String(item.category || "Lainnya").trim().replace(/\s+/g, " ").slice(0, 40) || "Lainnya",
      amount: Number.isFinite(Number(item.amount)) ? Math.min(Math.max(0, Math.round(Number(item.amount) || 0)), MAX_TRANSACTION_AMOUNT) : 0,
      date: String(item.date || ""),
      note: String(item.note || "").trim().replace(/\s+/g, " ").slice(0, 80),
      createdAt: Number.isFinite(Number(item.createdAt)) ? Math.max(0, Math.trunc(Number(item.createdAt) || 0)) : 0,
    }))
    .filter((item) => item.amount > 0 && item.id && isValidISODate(item.date));

  // Backup lama atau impor berulang dapat membawa ID yang sama. Gunakan versi
  // terbaru agar satu transaksi tidak pernah dihitung dua kali.
  const byId = new Map();
  for (const item of cleaned) {
    const previous = byId.get(item.id);
    if (!previous || item.createdAt >= previous.createdAt) byId.set(item.id, item);
  }
  return [...byId.values()]
    .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
}

export function transactionValidationError(input, today = todayISO()) {
  if (!input || !["income", "expense", "saving"].includes(input.type)) return "Jenis transaksi tidak valid.";
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0 || input.amount > MAX_TRANSACTION_AMOUNT) return `Gunakan nominal rupiah bulat antara Rp 1 dan ${formatRupiah(MAX_TRANSACTION_AMOUNT)}.`;
  if (!isValidISODate(input.date) || input.date > today) return "Pilih tanggal yang valid dan tidak melebihi hari ini.";
  if (!String(input.category ?? "").trim()) return "Pilih kategori transaksi.";
  return "";
}

export function calculateMonth(transactions, settings, monthKey) {
  const safeSettings = sanitizeSettings(settings);
  const monthTransactions = sanitizeTransactions(transactions).filter((item) => monthKeyFromDate(item.date) === monthKey);
  const incomeItems = monthTransactions.filter((item) => item.type === "income");
  const expenseItems = monthTransactions.filter((item) => item.type === "expense");
  const savingItems = monthTransactions.filter((item) => item.type === "saving");

  const income = sum(incomeItems.map((item) => item.amount));
  const expense = sum(expenseItems.map((item) => item.amount));
  const saved = sum(savingItems.map((item) => item.amount));
  const balance = income - expense - saved;
  const savingTarget = safeSettings.savingTargetAmount ?? income * (safeSettings.savingTargetPercent / 100);
  const savingSuccess = savingTarget > 0 ? (saved / savingTarget) * 100 : saved > 0 ? 100 : null;

  const spentByCategory = Object.fromEntries(safeSettings.expenseCategories.map((name) => [name, 0]));
  const fallbackCategory = safeSettings.expenseCategories.find((name) => name.toLocaleLowerCase("id-ID") === "lainnya") || safeSettings.expenseCategories[0];
  expenseItems.forEach((item) => {
    const category = Object.hasOwn(spentByCategory, item.category) ? item.category : fallbackCategory;
    spentByCategory[category] += item.amount;
  });

  const budgetRows = safeSettings.expenseCategories.map((name) => {
    const percent = safeSettings.budgets[name];
    const cap = safeSettings.budgetAmounts[name] ?? income * (percent / 100);
    const used = spentByCategory[name] || 0;
    const over = Math.max(used - cap, 0);
    return { name, percent, cap, used, over, isOver: over > 0 };
  });

  const usedRows = budgetRows.filter((row) => row.used > 0);
  const compliantRows = usedRows.filter((row) => !row.isOver);
  const discipline = usedRows.length ? (compliantRows.length / usedRows.length) * 100 : null;
  const overspentRows = budgetRows.filter((row) => row.isOver).sort((a, b) => b.over - a.over);
  const expenseBudget = sum(budgetRows.map(row => row.cap));
  const totalBudget = expenseBudget + savingTarget;
  const expenseAllocation = income > 0 ? expenseBudget / income * 100 : 0;
  const totalAllocation = income > 0 ? totalBudget / income * 100 : 0;

  let status = "Belum ada data";
  let statusTone = "empty";
  if (totalAllocation > 100) {
    status = "Atur ulang anggaran";
    statusTone = "danger";
  } else if (income <= 0) {
    status = "Masukkan pendapatan";
    statusTone = "empty";
  } else if (balance < 0) {
    status = "Uang bulan ini minus";
    statusTone = "danger";
  } else if (overspentRows.length) {
    status = "Ada batas terlewati";
    statusTone = "warning";
  } else if (usedRows.length === 0) {
    status = "Siap mulai mencatat";
    statusTone = "empty";
  } else {
    status = "Keuangan terkendali";
    statusTone = "good";
  }

  return {
    monthKey,
    transactions: monthTransactions,
    income,
    expense,
    saved,
    balance,
    savingTarget,
    savingSuccess,
    discipline,
    usedCategoryCount: usedRows.length,
    compliantCategoryCount: compliantRows.length,
    overspentRows,
    budgetRows,
    expenseAllocation,
    totalAllocation,
    expenseBudget,
    totalBudget,
    unallocatedAmount: income - totalBudget,
    unallocated: 100 - totalAllocation,
    status,
    statusTone,
  };
}

export function calculateYear(transactions, settings, year = Number(getCurrentMonthKey().slice(0, 4))) {
  const safeYear = Number.isInteger(Number(year)) ? Number(year) : Number(getCurrentMonthKey().slice(0, 4));
  const months = Array.from({ length: 12 }, (_, index) =>
    calculateMonth(transactions, settings, `${safeYear}-${String(index + 1).padStart(2, "0")}`),
  );
  const evaluatedMonths = months.filter((month) => month.discipline !== null);
  const income = sum(months.map((month) => month.income));
  const expense = sum(months.map((month) => month.expense));
  const saved = sum(months.map((month) => month.saved));
  const savingTarget = sum(months.map((month) => month.savingTarget));
  const discipline = evaluatedMonths.length
    ? sum(evaluatedMonths.map((month) => month.discipline)) / evaluatedMonths.length
    : null;
  const savingSuccess = savingTarget > 0 ? (saved / savingTarget) * 100 : saved > 0 ? 100 : null;

  return {
    year: safeYear,
    months,
    income,
    expense,
    saved,
    balance: income - expense - saved,
    savingTarget,
    savingSuccess,
    discipline,
    evaluatedMonthCount: evaluatedMonths.length,
  };
}

export function nextStep(result) {
  if (result.totalAllocation > 100) {
    return `Kurangi pembagian anggaran sebesar ${formatPercent(result.totalAllocation - 100)} agar tidak lebih dari 100%.`;
  }
  if (result.income <= 0) {
    return "Catat pendapatan bulan ini terlebih dahulu.";
  }
  if (result.balance < 0) {
    return `Kurangi pengeluaran sedikitnya ${formatRupiah(Math.abs(result.balance))} agar uang tidak minus.`;
  }
  if (result.overspentRows.length) {
    const biggest = result.overspentRows[0];
    return `Kurangi ${biggest.name} sebesar ${formatRupiah(biggest.over)} agar kembali sesuai batas.`;
  }
  if (result.savingTarget > result.saved) {
    const shortage = result.savingTarget - result.saved;
    const possible = Math.min(shortage, Math.max(result.balance, 0));
    if (possible > 0) return `Sisihkan ${formatRupiah(possible)} lagi untuk mendekati target menabung.`;
    return `Target tabungan masih kurang ${formatRupiah(shortage)}. Mulai dari nominal kecil saat ada uang masuk.`;
  }
  if (result.transactions.length === 0) {
    return "Catat satu transaksi pertama agar hasil mulai terbaca.";
  }
  return "Bagus. Pertahankan batas pengeluaran dan kebiasaan menabung bulan ini.";
}

export function formatPercent(value, maximumFractionDigits = 1) {
  const number = Number(value) || 0;
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits }).format(number)}%`;
}

export function projectedBudgetImpact(result, category, amount, previousAmount = 0, previousCategory = "") {
  const row = result.budgetRows.find((item) => item.name === category);
  if (!row) return null;
  let used = row.used + Math.max(0, Number(amount) || 0);
  if (previousCategory === category) used -= Math.max(0, Number(previousAmount) || 0);
  const over = Math.max(used - row.cap, 0);
  return { ...row, projectedUsed: used, projectedOver: over, willBeOver: over > 0 };
}
