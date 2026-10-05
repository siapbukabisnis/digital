import {
  MAX_EXPENSE_CATEGORIES,
  MAX_TRANSACTION_AMOUNT,
  MAX_TRANSACTION_COUNT,
  TYPE_LABELS,
  buildGregorianCalendar,
  calculateMonth,
  calculateYear,
  categoriesForType,
  formatNumericInput,
  formatPercent,
  formatRupiah,
  getCurrentMonthKey,
  isValidISODate,
  monthLabel,
  nextStep,
  numericValue,
  sanitizeSettings,
  sanitizeTransactions,
  transactionValidationError,
  shiftMonth,
  todayISO,
} from "./money-logic.mjs";
import {
  DEFAULT_PROFILE,
  MONEY_FIELDS,
  SKILLS,
  calculateReadiness,
  readinessSummary,
  recommendIdeas,
  uniqueSkills,
} from "./logic.mjs";
import { BUSINESS_IDEAS } from "./catalog.mjs";
import {
  canRedeemLicense,
  generateLicenseCode,
  licenseMetrics,
  licenseState,
  normalizeAccessCode,
  sanitizeLocalSession,
} from "./suite-logic.mjs";
import {
  CSV_TRANSACTION_LIMIT,
  EXCEL_TRANSACTION_LIMIT,
  buildTransactionCSV,
  buildTransactionXLSX,
} from "./export-logic.mjs";
import {
  DEFAULT_HEALTH_PROFILE,
  HEALTH_EVIDENCE_ITEMS,
  HEALTH_NUMBER_FIELDS,
  HEALTH_SECTOR_OPTIONS,
  buildHealthTrend,
  calculateHealth,
  healthScenarios,
  sanitizeHealthProfile,
} from "./health-logic.mjs";
import {
  SBB_BACKUP_MAX_BYTES,
  createBackupPayload,
  parseBackupText,
} from "./backup-logic.mjs";
import {
  DEFAULT_DIGITAL_CONFIG,
  DEFAULT_DIGITAL_PROFILE,
  DIGITAL_ANSWER_OPTIONS,
  DIGITAL_PROFILE_OPTIONS,
  buildDigitalBrief,
  buildDigitalWhatsappMessage,
  calculateDigitalAssessment,
  getDigitalQuestions,
  sanitizeDigitalConfig,
  sanitizeDigitalProfile,
  sanitizeDigitalState,
} from "./digital-logic.mjs";

const STORAGE = {
  transactions: "atur-uang-transactions-v1",
  moneySettings: "atur-uang-settings-v1",
  readiness: "sbb-kesiapan-bisnis-v1",
  health: "sbb-health-profile-v1",
  healthHistory: "sbb-health-history-v1",
  business: "sbb-kalkulator-usaha-v1",
  digital: "sbb-digital-assessment-v1",
  backupMeta: "sbb-local-backup-meta-v1",
  session: "sbb-suite-demo-session-v1",
  admin: "sbb-suite-admin-v1",
};

const ADMIN_ACCESS_CODE = "SBB-ADMIN-OWNER-2026";

const DEFAULT_NAV_ICONS = {
  overview: "overview",
  money: "money",
  start: "start",
  business: "business",
  health: "heart",
  digital: "globe",
  about: "about",
  policies: "policies",
  admin: "admin",
  logout: "logout",
  menu: "menu",
  close: "chevronLeft",
};

const DEFAULT_VISUAL_ASSETS = {
  mainLogo: "",
  gateLogo: "",
  sidebarLogo: "",
  favicon: "",
  appIcon: "",
};

const DEFAULT_PAGE_CONTENT = {
  overview: {
    label: "BERANDA",
    title: "Ruang usahamu",
    headline: "Apa kabar keuanganmu hari ini?",
    subheadline: "Lihat kondisi uangmu, lalu pilih langkah berikutnya.",
  },
  money: {
    label: "ATUR UANG",
    title: "Keuangan pribadi",
    headline: "Atur Uang",
    subheadline: "Catat uangmu, atur anggaran, dan lihat perkembangannya.",
    localSaveTitle: "Tersimpan otomatis",
    localSaveNote: "di perangkat ini",
  },
  readiness: {
    label: "SBB START",
    title: "Siapkan usaha",
    headline: "Kesiapan keuangan dan modal",
    subheadline: "Isi tiga langkah singkat untuk melihat kebutuhan modal dan ide usaha yang cocok.",
    syncButton: "Ambil data Atur Uang",
    localSaveTitle: "Tersimpan otomatis",
    localSaveNote: "di perangkat ini",
  },
  business: {
    label: "SBB BUSINESS",
    title: "Hitung usaha",
    headline: "Hitung usahamu, lebih tenang.",
    subheadline: "Pilih usahamu, sesuaikan angka, lalu lihat hasilnya langsung.",
  },
  health: {
    label: "SBB HEALTH",
    title: "Kesehatan usaha",
    headline: "Kenali kondisi usahamu.",
    subheadline: "Isi kondisi satu bulan untuk menemukan prioritas perbaikan usahamu.",
  },
  digital: {
    label: "SBB DIGITAL",
    title: "Langkah digital",
    headline: "Langkah digital yang pas untuk usahamu.",
    subheadline: "Periksa fondasi digitalmu, lihat prioritas yang paling relevan, lalu kerjakan langkahnya secara bertahap.",
  },
  benefits: {
    label: "TENTANG SBB",
    title: "Tentang SBB",
    headline: "Lebih siap mengatur uang, menilai rencana, dan menjalankan bisnis.",
    subheadline: "SBB membantu kamu memahami kondisi hari ini dan mengambil langkah berikutnya secara bertahap.",
  },
  policies: {
    label: "KETENTUAN & PRIVASI",
    title: "Syarat, privasi, dan disclaimer",
    headline: "Ketentuan yang ringkas dan transparan",
    subheadline: "Pahami cara simulasi bekerja, batas hasil perhitungan, dan perlakuan data pada perangkatmu.",
  },
  admin: {
    label: "ADMIN",
    title: "Control center",
    headline: "Admin SBB",
    subheadline: "Kelola kode, pelanggan, paket, konten, tampilan, integrasi, dan kebijakan akses.",
  },
};

const DEFAULT_BENEFITS_CONTENT = {
  hero: {
    eyebrow: "ABOUT US",
    title: "Lebih siap mengatur uang, menilai rencana, dan menjalankan bisnis.",
    intro: "SBB membantu kamu melihat kondisi hari ini, memahami angka penting, lalu mengambil langkah berikutnya secara bertahap. Kamu tidak perlu mengerjakan semuanya sekaligus.",
    primaryCta: "Mulai dari Atur Uang",
    secondaryCta: "Buka SBB Start",
    principleLabel: "PRINSIP SBB",
    principleTitle: "Mulai dari fondasi yang aman.",
    principleBody: "Rapikan keuangan pribadi, siapkan modal tanpa mengganggu kebutuhan utama, lalu gunakan hasil perhitungan sebagai bahan pertimbangan.",
  },
  benefits: [
    { title: "Keuangan lebih terarah", body: "Catat pemasukan dan pengeluaran, atur kategori sesuai kebutuhan, dan pantau batas anggaran." },
    { title: "Modal lebih aman", body: "Lihat kesiapan dana darurat, dana usaha, dan perkiraan waktu untuk mencapai kebutuhan modal." },
    { title: "Perhitungan lebih jelas", body: "Uji skenario sederhana agar keputusan tidak hanya berdasarkan perkiraan atau perasaan." },
    { title: "Langkah lebih mudah dipahami", body: "Temukan prioritas yang perlu diselesaikan sebelum melanjutkan ke tahap berikutnya." },
    { title: "Usaha lebih siap dijalankan", body: "Gunakan hasil perhitungan untuk melengkapi persiapan pasar, lokasi, operasional, dan pelaksanaan." },
    { title: "Bisnis tetap terpantau", body: "Evaluasi kondisi bisnis dan pilih dukungan digital ketika memang dibutuhkan." },
  ],
  ecosystem: {
    eyebrow: "EKOSISTEM SBB",
    title: "Satu payung, manfaat sesuai tahapmu",
    intro: "Setiap bagian SBB memiliki peran yang berbeda agar kamu bisa fokus pada kebutuhan yang paling relevan saat ini.",
    badge: "Hadir bertahap",
    nameHeader: "Bagian SBB",
    roleHeader: "Peran untuk kamu",
    rows: [
      { name: "SBB — Siap Buka Bisnis", role: "Merek dan ekosistem utama yang menemani perjalanan dari persiapan sampai pengembangan usaha." },
      { name: "SBB Start", role: "Keuangan pribadi dan kesiapan modal." },
      { name: "SBB Business", role: "Kalkulator kelayakan dan simulasi bisnis." },
      { name: "SBB Health", role: "Pemeriksaan kesehatan bisnis yang sudah berjalan." },
      { name: "SBB Digital", role: "Website, konten, iklan, dan sistem bisnis." },
    ],
  },
  journey: {
    eyebrow: "PERJALANAN PRODUK",
    title: "Perjalanan yang alami, dari fondasi sampai berkembang",
    intro: "Kamu dapat bergerak sesuai kondisi dan kebutuhan. Satu tahap membantu menyiapkan tahap berikutnya tanpa memaksakan bisnis dimulai terlalu cepat.",
    steps: [
      { label: "SBB START", title: "Rapikan keuangan", body: "Catat arus uang dan jaga anggaran." },
      { label: "SBB START", title: "Ukur kesiapan modal", body: "Pastikan dana pribadi dan usaha tidak saling mengganggu." },
      { label: "SBB BUSINESS", title: "Simulasikan angka bisnis", body: "Hitung HPP, harga, margin, BEP, modal kerja, dan target penjualan." },
      { label: "PERSIAPAN USAHA", title: "Lengkapi rencana", body: "Pertimbangkan pasar, lokasi, persaingan, perizinan, dan operasional." },
      { label: "SBB HEALTH", title: "Periksa kesehatan bisnis", body: "Evaluasi kondisi usaha yang sudah berjalan." },
      { label: "SBB DIGITAL", title: "Kembangkan secara bertahap", body: "Gunakan website, konten, iklan, dan sistem sesuai kebutuhan." },
    ],
  },
  scope: {
    eyebrow: "BATAS PENGGUNAAN",
    title: "Kalkulator sebagai alat bantu keputusan",
    body: "Kalkulator SBB memberikan estimasi berdasarkan angka yang kamu masukkan. Hasilnya membantu membandingkan skenario, tetapi bukan penilaian bisnis secara menyeluruh dan tidak menggantikan pemeriksaan target pasar, lokasi, persaingan, perizinan, kondisi lapangan, maupun kemampuan menjalankan usaha.",
  },
  about: {
    eyebrow: "ABOUT US",
    title: "Kami membantu langkah bisnis dimulai dari fondasi yang lebih sehat.",
    body: "SBB — Siap Buka Bisnis hadir untuk membantu kamu merapikan keuangan pribadi, memahami kesiapan modal, melakukan simulasi angka sederhana, dan menjaga bisnis tetap terarah setelah berjalan.",
    beliefTitle: "Yang kami percaya",
    beliefBody: "Keputusan bisnis yang baik tidak harus dimulai dari istilah rumit. Kamu berhak mendapatkan alat yang mudah dipahami, arahan yang jujur, dan ruang untuk bertumbuh sesuai kemampuan.",
    approachTitle: "Cara SBB mendampingi",
    approachBody: "Kami menyajikan angka sebagai bahan pertimbangan, menjelaskan keterbatasannya, dan membantu kamu menghubungkan hasilnya dengan tindakan nyata.",
  },
};

const DEFAULT_ADMIN = {
  codes: [
    { id: "code-demo-pro", code: "SBB-DEMO-PRO-2026", plan: "Pro", status: "active", activations: 0, maxActivations: 50, expiresAt: "2027-12-31", createdAt: "2026-09-01T08:00:00.000Z" },
    { id: "code-basic-used", code: "SBB-BSC-P7KM-9TQW", plan: "Basic", status: "active", activations: 1, maxActivations: 1, expiresAt: "2027-06-30", createdAt: "2026-08-20T08:00:00.000Z" },
    { id: "code-life-active", code: "SBB-LFT-8HNX-4QPK", plan: "Lifetime", status: "active", activations: 1, maxActivations: 3, expiresAt: "", createdAt: "2026-08-11T08:00:00.000Z" },
    { id: "code-expired", code: "SBB-TRY-2MKW-6ZQH", plan: "Trial", status: "active", activations: 0, maxActivations: 1, expiresAt: "2025-12-31", createdAt: "2025-12-15T08:00:00.000Z" },
    { id: "code-revoked", code: "SBB-PRO-3DXP-7KLN", plan: "Pro", status: "revoked", activations: 1, maxActivations: 2, expiresAt: "2027-01-31", createdAt: "2026-07-01T08:00:00.000Z" },
  ],
  users: [
    { id: "usr-1", name: "Nadia Putri", email: "nadia@example.com", plan: "Pro", status: "active", code: "SBB-DEMO-PRO-2026", lastSeen: "2026-09-11" },
    { id: "usr-2", name: "Arif Setiawan", email: "arif@example.com", plan: "Basic", status: "active", code: "SBB-BSC-P7KM-9TQW", lastSeen: "2026-09-10" },
    { id: "usr-3", name: "Sinta Rahma", email: "sinta@example.com", plan: "Lifetime", status: "active", code: "SBB-LFT-8HNX-4QPK", lastSeen: "2026-09-08" },
    { id: "usr-4", name: "Raka Demo", email: "raka@example.com", plan: "Trial", status: "suspended", code: "SBB-TRY-2MKW-6ZQH", lastSeen: "2026-08-28" },
  ],
  plans: [
    { name: "Basic", price: 49000, duration: "30 hari", description: "Pencatatan uang dan ringkasan dasar.", money: true, readiness: false, devices: 1 },
    { name: "Pro", price: 99000, duration: "30 hari", description: "Dua modul lengkap dan rekomendasi bisnis.", money: true, readiness: true, devices: 3 },
    { name: "Lifetime", price: 499000, duration: "Selamanya", description: "Akses dua modul tanpa perpanjangan.", money: true, readiness: true, devices: 5 },
    { name: "Trial", price: 0, duration: "7 hari", description: "Mencoba alur utama sebelum membeli.", money: true, readiness: true, devices: 1 },
  ],
  settings: {
    maintenance: false,
    maxDevices: 3,
    sessionDays: 30,
    features: { money: true, readiness: true, business: true, health: true, digital: true },
    visuals: {
      primaryColor: "#0255a5",
      sidebarColor: "#073e74",
      accentColor: "#277557",
      canvasColor: "#f4f7fa",
      radius: 20,
      density: "comfortable",
      logoSize: 118,
      gateLogoSize: 120,
      logoTreatment: "original",
      iconSize: 24,
      iconStroke: 1.8,
      fontScale: 100,
      showPrototypeBadge: true,
      assets: DEFAULT_VISUAL_ASSETS,
      navIcons: DEFAULT_NAV_ICONS,
    },
  },
  integrations: {
    cloudflareAccountId: "",
    cloudflareProjectName: "sbb-finance",
    cloudflareEnvironment: "production",
    cloudflareWorkerUrl: "",
    cloudflareD1Name: "",
    cloudflareR2Bucket: "",
    githubRepo: "",
    githubBranch: "main",
    githubWorkflow: ".github/workflows/deploy.yml",
    googleClientId: "",
    googleAllowedDomain: "",
    googleScopes: "openid email profile",
    analyticsId: "",
    webhookUrl: "",
  },
  benefitsContent: DEFAULT_BENEFITS_CONTENT,
  pageContent: DEFAULT_PAGE_CONTENT,
  digitalConfig: DEFAULT_DIGITAL_CONFIG,
  audit: [
    { id: "audit-1", action: "Paket Pro diperbarui", actor: "Admin Demo", at: "2026-09-11T09:30:00.000Z" },
    { id: "audit-2", action: "Kode SBB-LFT-8HNX-4QPK dibuat", actor: "Admin Demo", at: "2026-09-10T07:15:00.000Z" },
  ],
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clone = value => JSON.parse(JSON.stringify(value));
const escapeHTML = value => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const newId = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const NAV_ICON_PATHS = {
  overview: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  money: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  start: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="m14.5 9.5 5-5M16 4.5h3.5V8"/>',
  business: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8v4H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  about: '<path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z"/><path d="m4 12 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5"/>',
  policies: '<path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
  admin: '<path d="M4 6h7M15 6h5M4 12h3M11 12h9M4 18h9M17 18h3"/><circle cx="13" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="18" r="2"/>',
  logout: '<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M14 8l4 4-4 4M18 12H8"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  wallet: '<path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12"/><path d="M16 11h6v4h-6a2 2 0 0 1 0-4Z"/>',
  storefront: '<path d="M4 10v10h16V10M3 10l2-6h14l2 6"/><path d="M8 20v-6h5v6M3 10c1.5 2 3.5 2 5 0 1.5 2 3.5 2 5 0 1.5 2 3.5 2 5 0 1 1.3 2 1.3 3 0"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
};
const ICON_PRESETS = [
  ["overview", "Kotak ringkasan"], ["money", "Struk transaksi"], ["start", "Target"], ["business", "Kalkulator"],
  ["about", "Lapisan"], ["policies", "Perisai"], ["admin", "Pengaturan"], ["logout", "Keluar"], ["menu", "Menu"],
  ["chart", "Grafik"], ["calendar", "Kalender"], ["wallet", "Dompet"], ["storefront", "Toko"], ["heart", "Kesehatan"],
  ["globe", "Digital"], ["user", "Pengguna"], ["file", "Dokumen"],
  ["chevronLeft", "Panah kiri"],
];
const NAV_ICON_LABELS = {
  overview: "Ringkasan", money: "Atur Uang", start: "SBB Start", business: "SBB Business", health: "SBB Health", digital: "SBB Digital", about: "About Us",
  policies: "Ketentuan & Privasi", admin: "Admin", logout: "Keluar", menu: "Tombol menu", close: "Tutup sidebar",
};
const activeIconName = slot => {
  const selected = adminState?.settings?.visuals?.navIcons?.[slot];
  return NAV_ICON_PATHS[selected] ? selected : DEFAULT_NAV_ICONS[slot] || slot;
};
const navIcon = (slot, selected) => `<svg class="nav-icon" data-nav-icon="${slot}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${NAV_ICON_PATHS[selected || activeIconName(slot)] || ""}</svg>`;

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function hasStoredProfile(key) {
  const value = readStorage(key, null);
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const fields = key === STORAGE.readiness ? MONEY_FIELDS : HEALTH_NUMBER_FIELDS;
  return fields.some(field => Object.hasOwn(value, field) && Number.isFinite(Number(value[field])));
}

function persistEntries(entries, { notify = true } = {}) {
  const previous = [];
  try {
    const encoded = entries.map(([key, value]) => [key, value === null ? null : JSON.stringify(value)]);
    for (const [key, value] of encoded) {
      previous.push([key, localStorage.getItem(key)]);
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    }
    for (const [key, value] of encoded) committedState.set(key, value === null ? null : JSON.parse(value));
    return true;
  } catch {
    for (const [key, value] of previous.reverse()) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        // Upaya pemulihan terbaik ketika penyimpanan perangkat sudah penuh/diblokir.
      }
    }
    restoreCommittedState(entries.map(([key]) => key));
    if (notify) showToast("Data belum tersimpan. Data sebelumnya dipertahankan. Periksa ruang penyimpanan atau izin browser.");
    return false;
  }
}

function mergeEditableContent(defaults, value) {
  if (Array.isArray(defaults)) {
    const source = Array.isArray(value) ? value : [];
    return defaults.map((item, index) => mergeEditableContent(item, source[index]));
  }
  if (defaults && typeof defaults === "object") {
    const source = value && typeof value === "object" ? value : {};
    return Object.fromEntries(Object.entries(defaults).map(([key, item]) => [key, mergeEditableContent(item, source[key])]));
  }
  return typeof value === "string" ? value.slice(0, 4000) : defaults;
}

function mergedAdmin(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const rows = key => (Array.isArray(source[key]) ? source[key] : clone(DEFAULT_ADMIN[key])).filter(item => item && typeof item === "object" && !Array.isArray(item));
  const benefitsContent = mergeEditableContent(DEFAULT_BENEFITS_CONTENT, source.benefitsContent);
  const pageContent = mergeEditableContent(DEFAULT_PAGE_CONTENT, source.pageContent);
  // Refresh only untouched copy from older releases; keep custom Admin content.
  const previousCopy = {
    overview: { label: "RINGKASAN", title: "Ringkasan keuangan", headline: "Keputusan uang hari ini, arah bisnis berikutnya.", subheadline: "Angka di dua modul saling terhubung, tetapi data tetap berada di perangkat ini." },
    money: { subheadline: "Catat arus kas, jaga batas kategori, dan lihat pola tahunan." },
    readiness: { title: "Kesiapan keuangan dan modal", subheadline: "Hitung fondasi keuangan, waktu kesiapan, dan tiga ide yang paling cocok tanpa mengandalkan utang." },
    business: { title: "Kalkulator dan simulasi bisnis", headline: "Kalkulator Usaha", subheadline: "Pilih jenis bisnis, ganti angka contoh, lalu lihat harga, laba, dan BEP secara langsung." },
    health: { title: "Pemeriksaan kesehatan bisnis", headline: "Audit sederhana untuk usaha yang sudah berjalan", subheadline: "Masukkan angka satu periode untuk melihat skor, risiko utama, dan prioritas perbaikan bisnis." },
    digital: { title: "Kesiapan digital usaha", headline: "Gunakan digital sesuai kebutuhan usaha" },
    benefits: { label: "ABOUT US", title: "About Us" },
  };
  for (const [page, fields] of Object.entries(previousCopy)) {
    for (const [field, previous] of Object.entries(fields)) {
      if (pageContent[page][field] === previous) pageContent[page][field] = DEFAULT_PAGE_CONTENT[page][field];
    }
  }
  const digitalConfig = sanitizeDigitalConfig(source.digitalConfig);
  const storedVisuals = source.settings?.visuals && typeof source.settings.visuals === "object" ? source.settings.visuals : {};
  if (["SBB | SIAP BUKA BISNIS", "SBB | Siap Buka Bisnis"].includes(benefitsContent.hero.eyebrow)) benefitsContent.hero.eyebrow = "ABOUT US";
  if (benefitsContent.hero.secondaryCta === "Cek kesiapan bisnis") benefitsContent.hero.secondaryCta = "Buka SBB Start";
  if (!source.pageContent) {
    pageContent.benefits.headline = benefitsContent.hero.title;
    pageContent.benefits.subheadline = benefitsContent.hero.intro;
  }
  return {
    ...clone(DEFAULT_ADMIN),
    ...source,
    codes: rows("codes").filter(item => typeof item.id === "string" && typeof item.code === "string").map(item => ({ ...item, plan: typeof item.plan === "string" ? item.plan : "Pro", activations: Math.max(0, Math.trunc(Number(item.activations) || 0)), maxActivations: Math.max(1, Math.trunc(Number(item.maxActivations) || 1)) })),
    users: rows("users").filter(item => typeof item.id === "string").map(item => ({ ...item, name: String(item.name || "Pengguna SBB"), email: String(item.email || ""), plan: String(item.plan || "Pro") })),
    plans: rows("plans").filter(item => typeof item.name === "string").map(item => ({ ...item, description: String(item.description || ""), duration: String(item.duration || ""), price: Math.max(0, Number(item.price) || 0) })),
    audit: rows("audit").map(item => ({ ...item, action: String(item.action || "Aktivitas"), actor: String(item.actor || "Admin SBB") })),
    settings: {
      ...DEFAULT_ADMIN.settings,
      ...(source.settings || {}),
      features: { ...DEFAULT_ADMIN.settings.features, ...(source.settings?.features || {}) },
      visuals: {
        ...DEFAULT_ADMIN.settings.visuals,
        ...storedVisuals,
        assets: Object.fromEntries(Object.keys(DEFAULT_VISUAL_ASSETS).map(key => [key, safeImageData(storedVisuals.assets?.[key])])),
        navIcons: Object.fromEntries(Object.keys(DEFAULT_NAV_ICONS).map(key => {
          const selected = storedVisuals.navIcons?.[key];
          return [key, NAV_ICON_PATHS[selected] ? selected : DEFAULT_NAV_ICONS[key]];
        })),
      },
    },
    integrations: { ...DEFAULT_ADMIN.integrations, ...(source.integrations || {}) },
    benefitsContent,
    pageContent,
    digitalConfig,
  };
}

function normalizedProfile(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const profile = { ...DEFAULT_PROFILE, ...source };
  for (const field of MONEY_FIELDS) profile[field] = Number(profile[field]) || 0;
  profile.weeklyHours = Number(profile.weeklyHours) || 0;
  profile.emergencyMonths = Number(profile.emergencyMonths) || 6;
  profile.skills = uniqueSkills(Array.isArray(profile.skills) ? profile.skills : DEFAULT_PROFILE.skills);
  return profile;
}

let transactions = sanitizeTransactions(readStorage(STORAGE.transactions, []));
let moneySettings = sanitizeSettings(readStorage(STORAGE.moneySettings, {}));
let readinessProfile = normalizedProfile(readStorage(STORAGE.readiness, DEFAULT_PROFILE));
let healthProfile = sanitizeHealthProfile(readStorage(STORAGE.health, DEFAULT_HEALTH_PROFILE));
let healthHistory = sanitizeHealthHistoryData(readStorage(STORAGE.healthHistory, []));
if (!healthProfile.period) healthProfile.period = getCurrentMonthKey();
let adminState = mergedAdmin(readStorage(STORAGE.admin, null));
let digitalState = sanitizeDigitalState(readStorage(STORAGE.digital, {}), adminState.digitalConfig);
let digitalProfileEditing = !digitalState.profile.completed;
let session = sanitizeLocalSession(readStorage(STORAGE.session, null), adminState.settings, adminState.codes);
let selectedMonth = getCurrentMonthKey();
let moneyTab = "summary";
let adminTab = "dashboard";
let historyFilter = "all";
let historySearch = "";
let toastTimer;
let pendingConfirmation = null;
let pendingVisualAssets = null;
let dynamicManifestUrl = "";
let businessResizeObserver = null;
let digitalQuestionIndex = firstUnansweredDigitalIndex();
const guidedForms = new WeakMap();
const committedState = new Map([
  [STORAGE.transactions, clone(transactions)], [STORAGE.moneySettings, clone(moneySettings)],
  [STORAGE.readiness, clone(readinessProfile)], [STORAGE.health, clone(healthProfile)],
  [STORAGE.healthHistory, clone(healthHistory)], [STORAGE.admin, clone(adminState)],
  [STORAGE.digital, clone(digitalState)], [STORAGE.session, clone(session)],
]);

function restoreCommittedState(keys) {
  for (const key of keys) {
    if (!committedState.has(key)) continue;
    const value = clone(committedState.get(key));
    if (key === STORAGE.transactions) transactions = value || [];
    if (key === STORAGE.moneySettings) moneySettings = sanitizeSettings(value);
    if (key === STORAGE.readiness) readinessProfile = normalizedProfile(value);
    if (key === STORAGE.health) healthProfile = sanitizeHealthProfile(value);
    if (key === STORAGE.healthHistory) healthHistory = value || [];
    if (key === STORAGE.admin) { adminState = mergedAdmin(value); pendingVisualAssets = null; }
    if (key === STORAGE.digital) { digitalState = sanitizeDigitalState(value, adminState.digitalConfig); digitalQuestionIndex = firstUnansweredDigitalIndex(); digitalProfileEditing = !digitalState.profile.completed; }
    if (key === STORAGE.session) session = value;
  }
  if (document.querySelector("#overview-chart")) renderAll();
}

function persistMoney() {
  return persistEntries([
    [STORAGE.transactions, transactions],
    [STORAGE.moneySettings, moneySettings],
  ]);
}

function persistReadiness() {
  return persistEntries([[STORAGE.readiness, readinessProfile]]);
}

function persistHealth() {
  return persistEntries([
    [STORAGE.health, healthProfile],
    [STORAGE.healthHistory, healthHistory.slice(0, 24)],
  ]);
}

function persistDigital() {
  return persistEntries([[STORAGE.digital, digitalState]]);
}

function activeDigitalQuestions() {
  return getDigitalQuestions(adminState.digitalConfig, digitalState.profile);
}

function firstUnansweredDigitalIndex() {
  const questions = activeDigitalQuestions();
  const index = questions.findIndex(question => !Object.hasOwn(digitalState.answers, question.id));
  return index < 0 ? Math.max(questions.length - 1, 0) : index;
}

function digitalProfileSelect(id, label, options, value) {
  return '<label for="' + id + '"><span>' + escapeHTML(label) + '</span><select id="' + id + '">' + options.map(option => '<option value="' + escapeHTML(option.value) + '"' + (option.value === value ? ' selected' : '') + '>' + escapeHTML(option.label) + '</option>').join('') + '</select></label>';
}

function fillDigitalProfileForm() {
  const profile = digitalState.profile;
  const values = { stage: profile.stage, model: profile.model, goal: profile.goal, audience: profile.audience, channel: profile.channel, team: profile.team, budgetBand: profile.budgetBand };
  Object.entries(values).forEach(([key, value]) => { const node = document.querySelector('#digital-profile-' + key); if (node) node.value = value; });
  const metrics = profile.metrics || {};
  [["monthlyLeads", "digital-monthly-leads"], ["conversionPercent", "digital-conversion"], ["repeatPercent", "digital-repeat"], ["contentPerWeek", "digital-content-week"], ["responseMinutes", "digital-response-minutes"], ["adSpend", "digital-ad-spend"]].forEach(([key, id]) => { const node = document.querySelector('#' + id); if (node) node.value = metrics[key] ?? ""; });
}

function readDigitalProfileForm() {
  const number = id => document.querySelector('#' + id)?.value ?? "";
  return sanitizeDigitalProfile({
    ...digitalState.profile,
    completed: true,
    stage: document.querySelector("#digital-profile-stage")?.value,
    model: document.querySelector("#digital-profile-model")?.value,
    goal: document.querySelector("#digital-profile-goal")?.value,
    audience: document.querySelector("#digital-profile-audience")?.value,
    channel: document.querySelector("#digital-profile-channel")?.value,
    team: document.querySelector("#digital-profile-team")?.value,
    budgetBand: document.querySelector("#digital-profile-budgetBand")?.value,
    metrics: { monthlyLeads: number("digital-monthly-leads"), conversionPercent: number("digital-conversion"), repeatPercent: number("digital-repeat"), contentPerWeek: number("digital-content-week"), responseMinutes: number("digital-response-minutes"), adSpend: number("digital-ad-spend") },
  });
}

function persistAdmin() {
  return persistEntries([[STORAGE.admin, adminState]]);
}

function persistSession() {
  return persistEntries([[STORAGE.session, session || null]]);
}

function safeHex(value, fallback) {
  const normalized = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized.toLowerCase() : fallback;
}

function safeImageData(value) {
  if (typeof value !== "string" || value.length > 600000) return "";
  return /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value) ? value : "";
}

function currentVisuals(previewValues = {}) {
  const stored = adminState?.settings?.visuals || {};
  return {
    ...DEFAULT_ADMIN.settings.visuals,
    ...stored,
    ...previewValues,
    assets: { ...DEFAULT_VISUAL_ASSETS, ...(stored.assets || {}), ...(previewValues.assets || {}) },
    navIcons: { ...DEFAULT_NAV_ICONS, ...(stored.navIcons || {}), ...(previewValues.navIcons || {}) },
  };
}

function shadeHex(value, amount = -26) {
  const hex = safeHex(value, "#073e74").slice(1);
  const channels = [0, 2, 4].map(index => Math.min(255, Math.max(0, Number.parseInt(hex.slice(index, index + 2), 16) + amount)));
  return `#${channels.map(channel => channel.toString(16).padStart(2, "0")).join("")}`;
}

function applyVisualSettings(previewValues) {
  const visuals = currentVisuals(previewValues);
  const primary = safeHex(visuals.primaryColor, DEFAULT_ADMIN.settings.visuals.primaryColor);
  const sidebar = safeHex(visuals.sidebarColor, DEFAULT_ADMIN.settings.visuals.sidebarColor);
  const accent = safeHex(visuals.accentColor, DEFAULT_ADMIN.settings.visuals.accentColor);
  const canvas = safeHex(visuals.canvasColor, DEFAULT_ADMIN.settings.visuals.canvasColor);
  const radius = Math.min(Math.max(Number(visuals.radius) || 10, 4), 24);
  const logoSize = Math.min(Math.max(Number(visuals.logoSize) || 88, 64), 150);
  const gateLogoSize = Math.min(Math.max(Number(visuals.gateLogoSize) || 82, 56), 150);
  const iconSize = Math.min(Math.max(Number(visuals.iconSize) || 24, 18), 32);
  const iconStroke = Math.min(Math.max(Number(visuals.iconStroke) || 1.8, 1.2), 2.8);
  const fontScale = Math.min(Math.max(Number(visuals.fontScale) || 100, 90), 115);
  const root = document.documentElement;
  root.style.setProperty("--blue", primary);
  root.style.setProperty("--sidebar-color", sidebar);
  root.style.setProperty("--sidebar-color-end", shadeHex(sidebar));
  root.style.setProperty("--green", accent);
  root.style.setProperty("--canvas", canvas);
  root.style.setProperty("--ui-radius", `${radius}px`);
  root.style.setProperty("--brand-logo-width", `${logoSize}px`);
  root.style.setProperty("--gate-logo-width", `${gateLogoSize}px`);
  root.style.setProperty("--nav-icon-size", `${iconSize}px`);
  root.style.setProperty("--base-font-size", `${16 * fontScale / 100}px`);
  document.body.classList.toggle("density-compact", visuals.density === "compact");
  $(".brand")?.classList.toggle("preserve-logo-color", visuals.logoTreatment === "original");
  $$(".prototype-badge").forEach(badge => { badge.hidden = visuals.showPrototypeBadge === false; });
  const mainLogo = safeImageData(visuals.assets.mainLogo) || "./sbb-logo.png";
  const gateLogo = safeImageData(visuals.assets.gateLogo) || mainLogo;
  const sidebarLogo = safeImageData(visuals.assets.sidebarLogo) || mainLogo;
  const favicon = safeImageData(visuals.assets.favicon) || "./icon-192.png";
  const appIcon = safeImageData(visuals.assets.appIcon) || favicon || "./apple-touch-icon.png";
  if ($("#gate-brand-logo")) $("#gate-brand-logo").src = gateLogo;
  if ($("#sidebar-brand-logo")) $("#sidebar-brand-logo").src = sidebarLogo;
  if ($("#site-favicon")) $("#site-favicon").href = favicon;
  if ($("#site-apple-icon")) $("#site-apple-icon").href = appIcon;
  if ($("#site-theme-color")) $("#site-theme-color").content = sidebar;
  applyVisualManifest(visuals, appIcon, primary, sidebar, canvas);
  $$('[data-nav-icon]').forEach(icon => {
    const slot = icon.dataset.navIcon;
    const selected = NAV_ICON_PATHS[visuals.navIcons[slot]] ? visuals.navIcons[slot] : DEFAULT_NAV_ICONS[slot] || slot;
    icon.innerHTML = NAV_ICON_PATHS[selected] || "";
    icon.setAttribute("stroke-width", String(iconStroke));
  });
  try {
    const businessDocument = $(".business-frame")?.contentDocument;
    if (businessDocument) {
      businessDocument.documentElement.style.setProperty("--blue", primary);
      businessDocument.documentElement.style.setProperty("--navy", sidebar);
      businessDocument.documentElement.style.setProperty("--green", accent);
      businessDocument.documentElement.style.setProperty("--canvas", canvas);
      businessDocument.body.style.fontSize = `${16 * fontScale / 100}px`;
    }
  } catch {}
}

function applyVisualManifest(visuals, appIcon, primary, sidebar, canvas) {
  const link = $("#site-manifest");
  if (!link) return;
  const hasCustomIcon = Boolean(safeImageData(visuals.assets?.appIcon) || safeImageData(visuals.assets?.favicon));
  if (dynamicManifestUrl) URL.revokeObjectURL(dynamicManifestUrl);
  dynamicManifestUrl = "";
  if (!hasCustomIcon) {
    link.href = "./manifest.webmanifest";
    return;
  }
  const type = appIcon.slice(5, appIcon.indexOf(";"));
  const rootUrl = new URL("./", location.href).href;
  const manifest = {
    name: "SBB - Siap Buka Bisnis",
    short_name: "SBB",
    lang: "id-ID",
    start_url: rootUrl,
    scope: rootUrl,
    display: "standalone",
    background_color: canvas,
    theme_color: sidebar || primary,
    icons: [{ src: appIcon, sizes: "any", type, purpose: "any maskable" }],
  };
  dynamicManifestUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" }));
  link.href = dynamicManifestUrl;
}

function showToast(message) {
  const toast = $("#toast");
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
}

function dateText(value) {
  if (!value) return "Tanpa batas";
  if (!isValidISODate(value)) return "Tanggal tidak valid";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function dateTimeText(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Tanggal tidak valid";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function statusLabel(value) {
  return ({ active: "Tersedia", used: "Terpakai", expired: "Kedaluwarsa", revoked: "Dicabut", suspended: "Ditangguhkan" })[value] || value;
}

function statusClass(value) {
  if (value === "active") return "good";
  if (value === "used") return "neutral";
  return "danger";
}

function appMarkup() {
  return `
    <section class="access-gate" id="access-gate" aria-labelledby="gate-title">
      <div class="gate-brand"><img id="gate-brand-logo" src="./sbb-logo.png" alt="SBB — Siap Buka Bisnis"></div>
      <div class="gate-layout">
        <div class="gate-story">
          <span class="soft-label">SIAP BUKA BISNIS</span>
          <h2>Usaha besar.<br>Mulai dari langkah<br><span>yang terasa dekat.</span></h2>
          <p>Kenali uangmu, siapkan modal, dan tumbuhkan usaha. Satu ruang untuk bergerak sesuai ritmemu.</p>
          <div class="gate-feature-list">
            <div>${navIcon("wallet")}<span><strong>Rapikan keuangan</strong><small>Catat dan pahami arus uangmu.</small></span></div>
            <div>${navIcon("start")}<span><strong>Siapkan langkah pertama</strong><small>Hitung modal dan temukan ide usaha.</small></span></div>
            <div>${navIcon("storefront")}<span><strong>Tumbuh lebih terarah</strong><small>Uji hitungan, kesehatan, dan kebutuhan digital.</small></span></div>
          </div>
          <div class="gate-note">${navIcon("policies")}<span>Data tersimpan di perangkatmu.<br>Kamu yang memegang kendalinya.</span></div>
        </div>
        <div class="gate-card">
          <div class="gate-card-heading"><span class="gate-greeting">Halo, selamat datang</span><span class="tag neutral">Demo</span></div>
          <h1 id="gate-title">Ruang untuk<br>rencana usahamu.</h1>
          <p class="gate-copy">Punya kode akses? Masukkan di bawah ini untuk melanjutkan.</p>
          <form id="access-form" novalidate>
            <label for="access-code">Kode akses</label>
            <div class="code-field"><input id="access-code" autocomplete="one-time-code" placeholder="Masukkan kode aksesmu" spellcheck="false"><button class="btn primary" type="submit">Masuk ke SBB</button></div>
            <p class="field-error" id="access-error" aria-live="polite"></p>
          </form>
          <div class="demo-code"><div><strong>Kenalan dulu dengan SBB</strong><small>Jelajahi semua modul dengan akses demo.</small></div><button class="btn secondary" id="use-demo-code" type="button">Coba demo</button></div>
          <div class="divider"><span>Pilihan masuk lainnya</span></div>
          <button class="btn google-btn" id="demo-google" type="button"><span class="google-mark">G</span> Masuk dengan Google <em>Demo</em></button>
          <p class="prototype-note">Login Google masih berupa simulasi. Tidak ada akun Google yang dihubungkan.</p>
          <details class="gate-admin-help"><summary>Masuk sebagai Admin</summary><p>Gunakan kode khusus Admin pada kolom kode akses di atas.</p></details>
        </div>
      </div>
      <p class="gate-footer">SBB · Siap Buka Bisnis <span>Satu langkah, setiap hari.</span></p>
    </section>

    <div class="app-shell" id="app-shell" hidden>
      <aside class="sidebar" id="sidebar">
        <div class="brand"><span class="brand-logo-surface"><img id="sidebar-brand-logo" src="./sbb-logo.png" alt="SBB"></span><button class="sidebar-close" id="sidebar-close" type="button" aria-label="Tutup menu">${navIcon("close")}</button></div>
        <nav class="main-nav" aria-label="Navigasi utama"><span class="nav-section-label">RUANG KERJAMU</span>
          <button data-route="overview" class="nav-item is-active">${navIcon("overview")}<span>Beranda</span></button>
          <button data-route="money" class="nav-item">${navIcon("money")}<span>Atur Uang</span></button>
          <button data-route="readiness" class="nav-item">${navIcon("start")}<span><strong>Siapkan usaha</strong><small>SBB Start</small></span></button>
          <button data-route="business" class="nav-item">${navIcon("business")}<span><strong>Hitung usaha</strong><small>SBB Business</small></span></button>
          <button data-route="health" class="nav-item">${navIcon("health")}<span><strong>Kesehatan usaha</strong><small>SBB Health</small></span></button>
          <button data-route="digital" class="nav-item">${navIcon("digital")}<span><strong>Langkah digital</strong><small>SBB Digital</small></span></button>
          <span class="nav-section-label secondary-label">TENTANG SBB</span><button data-route="benefits" class="nav-item">${navIcon("about")}<span>Tentang SBB</span></button>
          <button data-route="policies" class="nav-item">${navIcon("policies")}<span>Ketentuan & Privasi</span></button>
          <button data-route="admin" class="nav-item admin-only">${navIcon("admin")}<span>Admin</span></button>
        </nav>
        <div class="sidebar-bottom">
          <div class="license-card"><small>PAKET AKTIF</small><div><i class="status-dot"></i><strong id="sidebar-plan">Pro · Demo</strong></div><span id="license-expiry">Prototipe perangkat lokal</span></div>
          <button class="nav-item" id="logout-button">${navIcon("logout")}<span>Keluar</span></button>
        </div>
      </aside>
      <button class="sidebar-scrim" id="sidebar-scrim" type="button" aria-label="Tutup menu" hidden></button>

      <div class="workspace">
        <header class="topbar">
          <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="Buka menu" aria-expanded="false">${navIcon("menu")}</button>
          <div class="title-stack"><p class="breadcrumb" id="breadcrumb">RINGKASAN</p><h1 id="page-title">Ringkasan keuangan</h1></div>
          <div class="topbar-actions"><button class="btn ghost topbar-backup" id="quick-backup" type="button">${navIcon("file")}<span>Backup data</span></button><span class="prototype-badge">Demo</span><div class="user-chip"><span class="avatar" id="user-avatar">DP</span><div><strong id="user-name">Dina Pratama</strong><small id="user-role">Pengguna · Pro</small></div></div></div>
        </header>
        <main>
          ${overviewMarkup()}
          ${moneyMarkup()}
          ${readinessMarkup()}
          ${businessMarkup()}
          ${healthMarkup()}
          ${digitalMarkup()}
          ${benefitsMarkup()}
          ${policiesMarkup()}
          ${adminMarkup()}
        </main>
      </div>
      <nav class="mobile-dock" aria-label="Navigasi cepat">
        <button data-route="overview" class="is-active">${navIcon("overview")}<span>Beranda</span></button>
        <button data-route="money">${navIcon("wallet")}<span>Uang</span></button>
        <button data-route="business">${navIcon("business")}<span>Hitung</span></button>
        <button id="mobile-more" type="button" aria-expanded="false" aria-controls="sidebar">${navIcon("menu")}<span>Lainnya</span></button>
      </nav>
    </div>`;
}

function overviewMarkup() {
  const content = adminState.pageContent.overview;
  const modules = [
    ["money", "wallet", "Atur Uang", "Uang pribadi lebih tertata", "Catat pemasukan, pengeluaran, dan tabungan."],
    ["readiness", "start", "SBB Start", "Siapkan modal pertamamu", "Lihat kesiapan dana dan ide yang cocok."],
    ["business", "business", "SBB Business", "Uji hitungan usahamu", "51 kalkulator untuk harga, laba, dan titik impas."],
    ["health", "heart", "SBB Health", "Kenali kesehatan usaha", "Temukan risiko dan prioritas perbaikan."],
    ["digital", "globe", "SBB Digital", "Tentukan langkah digital", "Susun rencana sesuai kebutuhan usahamu."],
  ];
  return `
  <section class="page is-active" data-page="overview">
    <div class="welcome-row"><div><p class="welcome-greeting" id="overview-greeting">Selamat datang kembali</p><h2 id="overview-context-headline">${escapeHTML(content.headline)}</h2><p id="overview-context-copy">${escapeHTML(content.subheadline)}</p></div><button class="btn primary" data-route="money" data-money-tab="record"><b>＋</b> Catat transaksi</button></div>
    <div class="metric-grid overview-metrics">
      <article class="metric-card emphasis"><div class="metric-top"><span>Saldo bulan ini</span>${navIcon("wallet")}</div><strong id="overview-balance">Rp 0</strong><small id="overview-month">—</small></article>
      <article class="metric-card"><div class="metric-top"><span>Pendapatan</span><span class="metric-symbol income">＋</span></div><strong id="overview-income">Rp 0</strong><small>Uang masuk bulan ini</small></article>
      <article class="metric-card"><div class="metric-top"><span>Sudah ditabung</span>${navIcon("start")}</div><strong id="overview-saved">Rp 0</strong><small id="overview-saving-target">Target —</small></article>
      <article class="metric-card readiness-metric"><div class="metric-top"><span>Kesiapan usaha</span>${navIcon("storefront")}</div><strong id="overview-ready">—</strong><small id="overview-ready-time">Hitung profil pertama</small></article>
    </div>
    <div class="overview-core">
      <article class="panel cashflow-panel"><div class="panel-head"><div><p class="eyebrow">CERITA UANGMU</p><h3>Ke mana uangmu pergi?</h3></div><button class="text-button" data-route="money">Lihat detail</button></div>
        <div class="cashflow-body"><div class="cashflow-chart-wrap"><div class="cashflow-chart" id="overview-chart" role="img" aria-label="Belum ada arus kas"><div><small>Uang tercatat</small><strong id="overview-chart-total">Rp 0</strong></div></div></div><div class="cashflow-legend" id="overview-chart-legend"></div></div>
        <p class="chart-caption" id="overview-chart-caption">Catat transaksi pertama untuk melihat pembagian uangmu.</p>
      </article>
      <article class="panel action-panel"><div class="panel-head"><div><p class="eyebrow">LANGKAH HARI INI</p><h3 id="overview-action-title">Mulai dengan catatan pertama</h3></div></div><span class="signal" id="overview-signal">Belum ada data</span><p id="overview-action-copy">Catat pemasukan dan pengeluaran agar saran berikutnya dapat dihitung.</p><div class="action-links"><button data-route="money" data-money-tab="record">${navIcon("money")} Catat uang</button><button data-route="readiness">${navIcon("start")} Siapkan usaha</button></div>
        <div class="overview-monthly-controls"><div class="progress-item"><div><span>Anggaran terjaga</span><strong id="overview-discipline">—</strong></div><div class="progress"><i id="overview-discipline-bar"></i></div></div><div class="progress-item"><div><span>Target tabungan</span><strong id="overview-saving">—</strong></div><div class="progress green"><i id="overview-saving-bar"></i></div></div></div>
      </article>
    </div>
    <div class="section-heading"><div><p class="eyebrow">DARI RENCANA KE LANGKAH NYATA</p><h3>Mau mulai dari mana?</h3></div><span>Pilih sesuai kebutuhanmu</span></div>
    <div class="module-launcher">${modules.map(([route, icon, name, title, copy], index) => `<button class="module-card" data-route="${route}"><span class="module-icon">${navIcon(icon)}</span><small>${name}</small><strong>${title}</strong><p>${copy}</p><span class="module-card-index">0${index + 1}</span></button>`).join("")}</div>
    <div class="home-footer-note">${navIcon("policies")}<span>Data tersimpan di perangkat ini. Backup secara berkala agar mudah dipindahkan.</span><button class="text-button" data-route="policies">Kelola data</button></div>
  </section>`;
}

function renderCashflow(month) {
  // Negative balances are debts/shortfalls, not positive slices of a donut.
  const parts = [
    { name: "Pengeluaran", amount: month.expense, color: "var(--blue)", className: "expense" },
    { name: "Tabungan", amount: month.saved, color: "var(--green)", className: "saving" },
    { name: "Saldo tersedia", amount: Math.max(month.balance, 0), color: "var(--navy)", className: "balance" },
  ];
  const total = parts.reduce((sum, part) => sum + part.amount, 0);
  let cursor = 0;
  const slices = parts.filter(part => part.amount > 0).map(part => {
    const start = cursor;
    cursor += part.amount / total * 100;
    return `${part.color} ${start}% ${cursor}%`;
  });
  const chart = $("#overview-chart");
  chart.style.background = total ? `conic-gradient(${slices.join(", ")})` : "var(--line)";
  chart.setAttribute("aria-label", total ? parts.map(part => `${part.name}: ${formatRupiah(part.amount)}`).join(". ") : "Belum ada transaksi bulan ini");
  $("#overview-chart-total").textContent = formatRupiah(total);
  $("#overview-chart-legend").innerHTML = parts.map(part => `<div><i class="legend-dot ${part.className}"></i><span>${part.name}</span><strong>${formatRupiah(part.amount)}</strong></div>`).join("");
  $("#overview-chart-caption").textContent = !total ? "Catat transaksi pertama untuk melihat pembagian uangmu." : month.balance < 0 ? `Pengeluaran dan tabungan melebihi pemasukan sebesar ${formatRupiah(-month.balance)}. Diagram menunjukkan jumlah uang yang digunakan.` : `Pembagian uang tercatat untuk ${monthLabel(month.monthKey).toLowerCase()}.`;
}

function revealFormResults(selector) {
  if (window.innerWidth <= 1080) requestAnimationFrame(() => $(selector)?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function initializeRedesign() {
  setupGuidedForm($("#readiness-form"), ["Arus kas", "Dana & modal", "Ide usaha"]);
  setupGuidedForm($("#health-form"), ["Profil", "Arus kas", "Kewajiban", "Disiplin", "Bukti"]);
  setupTabNavigation("money", selectMoneyTab);
  setupTabNavigation("admin", selectAdminTab);
}

function setupTabNavigation(kind, selectTab) {
  const tabs = $$(`.tab-bar [data-${kind}-tab]`);
  tabs.forEach((tab, index) => {
    const key = tab.getAttribute(`data-${kind}-tab`);
    const panel = $(`[data-${kind}-panel="${key}"]`);
    tab.id = `${kind}-tab-${key}`;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", String(index === 0));
    if (panel) {
      panel.id = `${kind}-panel-${key}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      tab.setAttribute("aria-controls", panel.id);
    }
    tab.tabIndex = index === 0 ? 0 : -1;
    tab.addEventListener("keydown", event => {
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next].getAttribute(`data-${kind}-tab`));
      tabs[next].focus();
    });
  });
}

function setupGuidedForm(form, labels) {
  if (!form) return;
  const original = [...form.children];
  const sections = [];
  let current;
  original.forEach(node => {
    if (node.classList.contains("form-section")) {
      current = document.createElement("section");
      current.className = "guided-step";
      sections.push(current);
      form.append(current);
    }
    if (current) current.append(node);
  });
  if (!sections.length) return;
  form.classList.add("guided-form");
  const nav = document.createElement("nav");
  nav.className = "step-track";
  nav.setAttribute("aria-label", "Langkah pengisian");
  nav.innerHTML = sections.map((_, index) => `<button type="button" data-form-step="${index}" aria-label="Langkah ${index + 1}: ${escapeHTML(labels[index])}"><span>${index + 1}</span><strong>${escapeHTML(labels[index])}</strong></button>`).join("");
  const progress = document.createElement("div");
  progress.className = "guided-progress-caption";
  form.prepend(nav, progress);
  let active = 0;
  const showStep = (index, focus = false) => {
    active = Math.min(Math.max(index, 0), sections.length - 1);
    sections.forEach((section, position) => { section.hidden = position !== active; });
    [...nav.children].forEach((button, position) => {
      button.classList.toggle("is-active", position === active);
      button.classList.toggle("is-previous", position < active);
      if (position === active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    progress.textContent = `Langkah ${active + 1} dari ${sections.length} · ${labels[active]}`;
    if (focus) {
      const title = sections[active].querySelector("h3");
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  sections.forEach((section, index) => {
    const controls = document.createElement("div");
    controls.className = "guided-actions";
    if (index > 0) {
      const back = document.createElement("button");
      back.type = "button"; back.className = "btn ghost"; back.textContent = "Kembali";
      back.addEventListener("click", () => showStep(index - 1, true)); controls.append(back);
    }
    if (index < sections.length - 1) {
      const next = document.createElement("button");
      next.type = "button"; next.className = "btn primary"; next.textContent = "Lanjutkan";
      next.addEventListener("click", () => showStep(index + 1, true)); controls.append(next);
    } else {
      const existingActions = section.querySelector(".form-actions");
      if (existingActions) controls.append(...existingActions.children);
      else {
        const submit = section.querySelector('button[type="submit"]');
        if (submit) controls.append(submit);
      }
      existingActions?.remove();
    }
    section.append(controls);
  });
  nav.addEventListener("click", event => {
    const target = event.target.closest("[data-form-step]");
    if (target) showStep(Number(target.dataset.formStep), true);
  });
  form.addEventListener("keydown", event => {
    if (event.key === "Enter" && !["TEXTAREA", "BUTTON", "SELECT"].includes(event.target.tagName) && active < sections.length - 1) {
      event.preventDefault(); showStep(active + 1, true);
    }
  });
  guidedForms.set(form, { sections, showStep });
  const errors = form.querySelector("#readiness-errors");
  if (errors) { errors.setAttribute("role", "alert"); progress.after(errors); }
  showStep(0);
}

function moneyMarkup() {
  const content = adminState.pageContent.money;
  return `
  <section class="page" data-page="money" hidden>
    <div class="module-header page-context-intro"><p id="money-context-copy">${escapeHTML(content.subheadline)}</p><div class="module-header-actions"><span class="local-save-badge"><i></i><span><strong id="money-local-save-title">${escapeHTML(content.localSaveTitle)}</strong><small id="money-local-save-note">${escapeHTML(content.localSaveNote)}</small></span></span><div class="month-control"><button id="money-prev" aria-label="Bulan sebelumnya">‹</button><strong id="money-month">—</strong><button id="money-next" aria-label="Bulan berikutnya">›</button></div></div></div>
    <div class="tab-bar" role="tablist" aria-label="Bagian Atur Uang"><button data-money-tab="summary" class="is-active">Ringkasan</button><button data-money-tab="record">Catat</button><button data-money-tab="budget">Anggaran</button><button data-money-tab="history">Riwayat</button><button data-money-tab="year">Tahunan</button></div>
    <div class="module-tab is-active" data-money-panel="summary">
      <div class="metric-grid"><article class="metric-card emphasis"><span>Saldo tersisa</span><strong id="money-balance">Rp 0</strong><small id="money-status">Belum ada data</small></article><article class="metric-card"><span>Uang masuk</span><strong id="money-income">Rp 0</strong><small>Bulan terpilih</small></article><article class="metric-card"><span>Uang keluar</span><strong id="money-expense">Rp 0</strong><small>Di luar tabungan</small></article><article class="metric-card"><span>Ditabung</span><strong id="money-saved">Rp 0</strong><small id="money-target">Target —</small></article></div>
      <article class="panel finance-calendar-card"><div class="panel-head calendar-head"><div><p class="eyebrow">KALENDER MASEHI</p><h3 id="calendar-title">Pencatatan bulanan</h3></div><span class="calendar-shortcut">Klik tanggal untuk mencatat</span></div><div class="calendar-weekdays" aria-hidden="true"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div><div class="finance-calendar" id="finance-calendar" role="grid" aria-labelledby="calendar-title"></div><p class="calendar-note">Setiap tanggal mengikuti kalender Masehi. Tanda warna menunjukkan jenis transaksi yang sudah dicatat.</p></article>
      <div class="two-column"><article class="panel"><div class="panel-head"><div><p class="eyebrow">LANGKAH BERIKUTNYA</p><h3 id="money-next-title">Mulai mencatat</h3></div><span class="signal" id="money-signal">Belum ada data</span></div><p id="money-next-step">Catat pendapatan bulan ini terlebih dahulu.</p><button class="btn primary" data-money-tab="record">Catat sekarang</button></article><article class="panel"><div class="panel-head"><div><p class="eyebrow">BATAS TERLEWATI</p><h3>Kontrol kategori</h3></div><span class="count-badge" id="overspent-count">0</span></div><div id="overspent-list" class="empty-state compact">Belum ada kategori melewati batas.</div></article></div>
    </div>
    <div class="module-tab" data-money-panel="record" hidden>
      <article class="panel form-panel narrow transaction-composer"><div class="panel-head"><div><p class="eyebrow">TRANSAKSI</p><h3 id="transaction-heading">Catat uang</h3></div><button class="btn ghost" id="load-sample" type="button">Muat contoh data</button></div><form id="transaction-form" novalidate><input type="hidden" id="transaction-id"><fieldset class="type-switch"><legend>Mau mencatat apa?</legend><label><input type="radio" name="transaction-type" value="income"><span>＋ Uang masuk</span></label><label><input type="radio" name="transaction-type" value="expense" checked><span>− Uang keluar</span></label><label><input type="radio" name="transaction-type" value="saving"><span>Tabungan</span></label></fieldset><div class="form-grid"><label>Nominal <small>Rp</small><input id="transaction-amount" inputmode="numeric" placeholder="0" required><i class="field-error" id="transaction-error"></i></label><label>Kategori<select id="transaction-category" required></select></label><label>Tanggal<input id="transaction-date" type="date" required></label><label>Catatan <small>opsional</small><input id="transaction-note" maxlength="80" placeholder="Contoh: belanja mingguan"></label></div><div class="form-actions"><button class="btn ghost" id="cancel-edit" type="button" hidden>Batal ubah</button><button class="btn primary" type="submit">Simpan transaksi</button></div></form></article>
    </div>
    <div class="module-tab" data-money-panel="budget" hidden>
      <div class="two-column budget-layout"><article class="panel"><div class="panel-head"><div><p class="eyebrow">ALOKASI</p><h3>Batas pengeluaran</h3></div><button class="btn ghost" id="reset-budget">Reset</button></div><div class="allocation-summary"><div><span>Total pengeluaran</span><strong id="expense-allocation">Rp 0</strong></div><div><span>Target menabung</span><label class="inline-number nominal-number"><span>Rp</span><input type="text" inputmode="numeric" id="saving-target" aria-label="Target menabung dalam rupiah"></label></div><div><span>Sisa belum dialokasikan</span><strong id="unallocated">Rp 0</strong></div></div><div class="allocation-track"><i id="allocation-bar"></i></div><p class="allocation-warning" id="allocation-warning"></p></article><article class="panel budget-list-panel"><div class="panel-head category-panel-head"><div><p class="eyebrow">PER KATEGORI</p><h3>Atur kategori pengeluaran</h3></div><span class="category-count" id="category-count">20/20 kategori</span></div><div class="category-guidance"><strong>Rekomendasi dan arahan</strong><p>Isi kategori sesuai kebutuhan pengeluaran kamu. Gunakan nama yang mudah dikenali, lalu tentukan batas nominal rupiahnya. Anggaran lama tetap terbaca; nominal yang kamu ubah menjadi batas tetap.</p></div><div id="budget-list" class="budget-list"></div><button class="btn secondary add-category-button" id="add-expense-category" type="button">＋ Tambah kategori</button></article></div>
    </div>
    <div class="module-tab" data-money-panel="history" hidden>
      <article class="panel"><div class="panel-head"><div><p class="eyebrow">RIWAYAT</p><h3 id="history-title">Transaksi bulan ini</h3><small id="history-summary">0 transaksi</small></div><div class="history-tools"><label class="history-search"><span class="sr-only">Cari transaksi</span><input id="history-search" type="search" placeholder="Cari kategori atau catatan…" autocomplete="off"></label><div class="filter-group" aria-label="Filter transaksi"><button data-history-filter="all" class="is-active">Semua</button><button data-history-filter="income">Masuk</button><button data-history-filter="expense">Keluar</button><button data-history-filter="saving">Tabungan</button></div></div></div><div class="export-strip"><div><strong>Unduh semua transaksi</strong><small>Satu sheet Transaksi dengan 5 kolom. Excel siap difilter; CSV memakai susunan yang sama.</small></div><div class="export-actions"><button class="btn secondary" id="export-excel" type="button"><span>Excel</span><small>Maks. 1.000 baris</small></button><button class="btn secondary" id="export-csv" type="button"><span>CSV</span><small>Maks. 10.000 baris</small></button></div></div><div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Catatan</th><th class="number">Nominal</th><th><span class="sr-only">Aksi</span></th></tr></thead><tbody id="transaction-list"></tbody></table><div class="empty-state" id="transaction-empty" hidden>Belum ada transaksi yang sesuai.</div></div></article>
    </div>
    <div class="module-tab" data-money-panel="year" hidden>
      <div class="metric-grid three"><article class="metric-card"><span>Total masuk</span><strong id="year-income">Rp 0</strong><small id="year-label">—</small></article><article class="metric-card"><span>Total keluar</span><strong id="year-expense">Rp 0</strong><small>12 bulan</small></article><article class="metric-card"><span>Total ditabung</span><strong id="year-saved">Rp 0</strong><small id="year-discipline">Disiplin —</small></article></div><article class="panel"><div class="panel-head"><div><p class="eyebrow">12 BULAN</p><h3>Ringkasan tahunan</h3></div></div><div class="year-grid" id="year-grid"></div></article>
    </div>
  </section>`;
}

function readinessMarkup() {
  const content = adminState.pageContent.readiness;
  return `
  <section class="page" data-page="readiness" hidden>
    <div class="readiness-intro"><p id="readiness-context-copy">${escapeHTML(content.subheadline)}</p><div class="readiness-intro-actions"><span class="local-save-badge"><i></i><span><strong id="readiness-local-save-title">${escapeHTML(content.localSaveTitle)}</strong><small id="readiness-local-save-note">${escapeHTML(content.localSaveNote)}</small></span></span><button class="btn secondary" id="sync-money">${escapeHTML(content.syncButton)}</button></div></div>
    <div class="readiness-layout">
      <article class="panel readiness-form-panel"><form id="readiness-form" novalidate>
        <p class="example-data-note" id="readiness-example-note">Angka awal adalah contoh. Sesuaikan dengan kondisi keuanganmu.</p>
        <div class="form-section"><div class="section-number">01</div><div><h3>Arus kas bulanan</h3><p>Gunakan angka rata-rata yang realistis.</p></div></div>
        <div class="form-grid"><label>Pendapatan bulanan <small>Rp</small><input data-profile="income" inputmode="numeric"></label><label>Pengeluaran wajib <small>Rp</small><input data-profile="mandatoryExpenses" inputmode="numeric"></label><label>Pengeluaran lain <small>Rp</small><input data-profile="otherExpenses" inputmode="numeric"></label><label>Target tabungan <small>Rp</small><input data-profile="savingsGoal" inputmode="numeric"></label></div>
        <div class="form-section"><div class="section-number">02</div><div><h3>Dana pelindung & usaha</h3><p>Anggaran uji dianggap bagian modal awal, bukan ditambah dua kali.</p></div></div>
        <div class="form-grid"><label>Dana darurat saat ini <small>Rp</small><input data-profile="emergencyFundBalance" inputmode="numeric"></label><label>Target dana darurat<select data-profile="emergencyMonths"><option value="3">3 bulan</option><option value="6">6 bulan</option><option value="9">9 bulan</option><option value="12">12 bulan</option></select></label><label>Dana usaha saat ini <small>Rp</small><input data-profile="businessFundBalance" inputmode="numeric"></label><label>Perkiraan modal awal <small>Rp</small><input data-profile="startupCapital" inputmode="numeric"></label><label>Anggaran uji <small>Rp</small><input data-profile="testBudget" inputmode="numeric"></label><label>Cadangan usaha <small>Rp</small><input data-profile="businessReserve" inputmode="numeric"></label></div>
        <div class="form-section"><div class="section-number">03</div><div><h3>Kecocokan ide</h3><p>Pilih kemampuan dan sumber daya yang sudah ada.</p></div></div>
        <div class="form-grid"><label>Waktu per minggu <small>jam</small><input data-profile="weeklyHours" type="number" min="0" max="80"></label><label>Cara kerja<select data-profile="workMode"><option>Online</option><option>Offline</option><option>Fleksibel</option></select></label><label>Peralatan<select data-profile="equipment"><option>Belum tahu</option><option>Ponsel</option><option>Ponsel + laptop</option><option>Alat produksi</option><option>Laptop + alat</option></select></label></div>
        <fieldset class="skills-field"><legend>Keterampilan yang sudah dimiliki</legend><div id="skills-grid" class="skills-grid"></div></fieldset><div id="readiness-errors" class="form-errors" aria-live="polite"></div><button class="btn primary wide" type="submit">Hitung dengan SBB Start</button>
      </form></article>
      <aside class="result-column"><article class="result-hero" id="readiness-result"><span class="result-status" id="readiness-status">Belum dihitung</span><h3 id="readiness-title">Isi profil untuk melihat hasil</h3><p id="readiness-action">Hasil mengurutkan prioritas tanpa menyarankan utang.</p><div class="result-number"><span>Total dana yang perlu dilengkapi</span><strong id="readiness-gap">—</strong></div></article><div class="result-metrics"><article><span>Sisa kas/bulan</span><strong id="result-surplus">—</strong></article><article><span>Waktu kesiapan</span><strong id="result-months">—</strong></article><article><span>Kekurangan darurat</span><strong id="result-emergency">—</strong></article><article><span>Kekurangan usaha</span><strong id="result-business">—</strong></article></div><article class="panel"><div class="panel-head"><div><p class="eyebrow">3 REKOMENDASI</p><h3>Ide paling sesuai</h3></div><span class="count-badge">3</span></div><div id="idea-list" class="idea-list"><div class="empty-state compact">Hitung profil untuk melihat rekomendasi.</div></div></article></aside>
    </div>
  </section>`;
}

function businessMarkup() {
  return `
  <section class="page business-page" data-page="business" hidden>
    <div class="business-frame-shell">
      <iframe class="business-frame" src="./business/index.html?embed=1" title="SBB Business — 50 kalkulator usaha dan satu kalkulator fleksibel" loading="lazy"></iframe>
    </div>
  </section>`;
}

function healthMoneyField(id, label, description) {
  return `<label for="${id}"><span>${escapeHTML(label)}</span><small>${escapeHTML(description)}</small><div class="health-money-input"><b>Rp</b><input id="${id}" data-health-number data-health-money inputmode="numeric" value="0"></div></label>`;
}

function healthMarkup() {
  const content = adminState.pageContent.health;
  return `
  <section class="page health-page" data-page="health" hidden>
    <div class="health-intro"><div><h2 id="health-context-headline">${escapeHTML(content.headline)}</h2><p id="health-context-copy">${escapeHTML(content.subheadline)}</p></div><span class="health-local-badge">Tersimpan di perangkat ini</span></div>
    <div class="health-layout">
      <article class="panel health-form-panel">
        <form id="health-form" novalidate>
          <p class="example-data-note" id="health-example-note">Angka awal adalah contoh. Ganti dengan catatan usahamu sebelum memeriksa.</p>
          <div class="form-section"><div class="section-number">01</div><div><h3>Profil pemeriksaan</h3><p>Gunakan satu periode bulanan yang sama.</p></div></div>
          <div class="form-grid"><label for="health-business-name">Nama usaha<input id="health-business-name" maxlength="80" placeholder="Nama usaha"></label><label for="health-period">Periode<input id="health-period" type="month"></label><label for="health-sector">Sektor usaha<select id="health-sector">${HEALTH_SECTOR_OPTIONS.map(item => `<option value="${escapeHTML(item.value)}">${escapeHTML(item.label)}</option>`).join("")}</select><small>Standar pembanding menyesuaikan karakter umum sektor.</small></label></div>

          <div class="form-section"><div class="section-number">02</div><div><h3>Laba dan arus kas</h3><p>Isi berdasarkan catatan usaha, bukan perkiraan terbaik.</p></div></div>
          <div class="health-field-grid">
            ${healthMoneyField("health-revenue", "Omzet periode ini", "Total penjualan sebelum dikurangi biaya.")}
            ${healthMoneyField("health-previous-revenue", "Omzet periode sebelumnya", "Dipakai untuk membaca pertumbuhan.")}
            ${healthMoneyField("health-cogs", "Harga pokok penjualan", "Bahan, produk, atau biaya langsung penjualan.")}
            ${healthMoneyField("health-operating-expenses", "Biaya operasional", "Gaji, sewa, listrik, pemasaran, dan biaya rutin.")}
            ${healthMoneyField("health-cash-balance", "Kas tersedia", "Kas usaha yang benar-benar dapat digunakan.")}
            ${healthMoneyField("health-owner-withdrawals", "Pengambilan pemilik", "Uang usaha yang diambil untuk kebutuhan pemilik.")}
          </div>

          <div class="form-section"><div class="section-number">03</div><div><h3>Modal kerja dan kewajiban</h3><p>Nilai posisi akhir pada periode yang diperiksa.</p></div></div>
          <div class="health-field-grid">
            ${healthMoneyField("health-receivables", "Piutang pelanggan", "Penjualan yang belum diterima menjadi kas.")}
            ${healthMoneyField("health-inventory", "Nilai persediaan", "Nilai modal yang masih tertahan di stok.")}
            ${healthMoneyField("health-debt-payments", "Pembayaran utang bulanan", "Cicilan pokok dan bunga pada periode ini.")}
          </div>

          <div class="form-section"><div class="section-number">04</div><div><h3>Ketahanan dan disiplin</h3><p>Gunakan persentase yang paling mendekati kondisi nyata.</p></div></div>
          <div class="health-field-grid health-percent-grid">
            <label for="health-repeat-customer"><span>Pelanggan membeli ulang</span><small>Persentase pelanggan yang kembali.</small><div class="health-percent-input"><input id="health-repeat-customer" data-health-number type="number" min="0" max="100"><b>%</b></div></label>
            <label for="health-top-customer"><span>Kontribusi pelanggan terbesar</span><small>Bagian omzet dari satu pelanggan terbesar.</small><div class="health-percent-input"><input id="health-top-customer" data-health-number type="number" min="0" max="100"><b>%</b></div></label>
            <label for="health-record-completeness"><span>Kelengkapan pencatatan</span><small>Seberapa lengkap transaksi periode ini.</small><div class="health-percent-input"><input id="health-record-completeness" data-health-number type="number" min="0" max="100"><b>%</b></div></label>
          </div>
          <div class="health-check-grid"><label><input id="health-separate-finances" type="checkbox"><span><strong>Uang pribadi dan usaha terpisah</strong><small>Rekening atau pencatatannya dapat dibedakan.</small></span></label><label><input id="health-cash-plan" type="checkbox"><span><strong>Ada rencana kas bulanan</strong><small>Pemasukan dan pembayaran mendatang dipantau.</small></span></label></div>

          <div class="form-section"><div class="section-number">05</div><div><h3>Bukti pendukung periode</h3><p>Centang hanya bila angka dapat ditelusuri. Bukti tidak diunggah dan tetap berada di tempat penyimpananmu sendiri.</p></div></div>
          <div class="health-evidence-grid">${HEALTH_EVIDENCE_ITEMS.map(item => `<label><input type="checkbox" data-health-evidence="${escapeHTML(item.id)}"><span><strong>${escapeHTML(item.label)}</strong><small>${escapeHTML(item.note)}</small></span></label>`).join("")}</div>
          <div class="form-actions"><button class="btn ghost" id="reset-health" type="button">Reset contoh</button><button class="btn primary" type="submit">Periksa kesehatan bisnis</button></div>
        </form>
      </article>

      <aside class="panel health-empty-panel" id="health-empty-panel">${navIcon("heart")}<p class="eyebrow">KENALI KONDISI USAHAMU</p><h3>Hasil yang bisa ditindaklanjuti.</h3><p>Isi lima langkah singkat, lalu lihat skor kesehatan, kondisi kas, dan tiga prioritas perbaikan.</p><div><span>01</span> Gunakan satu periode yang sama</div><div><span>02</span> Isi berdasarkan catatan usaha</div><div><span>03</span> Periksa dan simpan hasilnya</div></aside>
      <aside class="health-results" aria-live="polite">
        <article class="health-score-card" id="health-score-card"><div class="health-score-ring" id="health-score-ring"><strong id="health-score">0</strong><span>/100</span></div><div><span class="result-status" id="health-status">Belum dihitung</span><h3 id="health-result-title">Kesehatan usaha</h3><p id="health-summary">Isi data untuk melihat hasil pemeriksaan.</p><small id="health-benchmark-note">Pembanding sektor belum dipilih.</small><small class="health-data-warning" id="health-data-warning" hidden></small></div></article>
        <div class="health-metric-grid"><article><span>Margin kotor</span><strong id="health-gross-margin">—</strong></article><article><span>Laba operasi</span><strong id="health-operating-profit">—</strong></article><article><span>Arus kas bersih</span><strong id="health-net-cash">—</strong></article><article><span>Ketahanan kas</span><strong id="health-runway">—</strong></article></div>
        <article class="panel health-confidence-card" id="health-confidence-card"><div><p class="eyebrow">KEYAKINAN DATA</p><h3 id="health-confidence-label">Belum dinilai</h3><p id="health-confidence-summary">Lengkapi bukti pendukung untuk menilai keandalan hasil.</p></div><strong id="health-confidence-score">0%</strong><div class="progress"><i id="health-confidence-bar"></i></div><small id="health-confidence-missing">Belum ada bukti yang diperiksa.</small></article>
        <article class="panel"><div class="panel-head"><div><p class="eyebrow">6 AREA UTAMA</p><h3>Skor per area</h3></div></div><div class="health-pillars" id="health-pillars"></div></article>
        <article class="panel"><div class="panel-head"><div><p class="eyebrow">PRIORITAS</p><h3>Tiga tindakan terpenting</h3></div></div><ol class="health-priorities" id="health-priorities"></ol></article>
      </aside>
    </div>
    <div class="health-bottom-grid">
      <article class="panel"><div class="panel-head"><div><p class="eyebrow">SIMULASI PERBAIKAN</p><h3>Jika satu kondisi diperbaiki</h3></div></div><div class="health-scenarios" id="health-scenarios"></div></article>
      <article class="panel"><div class="panel-head"><div><p class="eyebrow">RIWAYAT LOKAL</p><h3>Pemeriksaan tersimpan</h3></div><button class="btn secondary" id="save-health-audit" type="button">Simpan hasil</button></div><div class="health-history" id="health-history"></div></article>
      <article class="panel health-trend-panel"><div class="panel-head"><div><p class="eyebrow">PERBANDINGAN BULANAN</p><h3>Perubahan kesehatan usaha</h3><p id="health-trend-summary">Simpan minimal dua periode untuk melihat perubahan.</p></div><span class="health-trend-change" id="health-trend-change">—</span></div><div class="health-trend" id="health-trend"></div></article>
    </div>
    <p class="health-disclaimer"><strong>Catatan:</strong> SBB Health adalah pemeriksaan mandiri berbasis angka dan konfirmasi bukti oleh pengguna, bukan audit akuntansi, pemeriksaan pajak, verifikasi stok, atau pendapat hukum. SBB tidak melihat dokumenmu dan hasil tidak menjamin kondisi maupun kelangsungan usaha.</p>
  </section>`;
}

function digitalMarkup() {
  const content = adminState.pageContent.digital;
  return `
  <section class="page digital-page" data-page="digital" hidden>
    <div class="digital-intro">
      <div><h2 id="digital-context-headline">${escapeHTML(content.headline)}</h2><p id="digital-context-copy">${escapeHTML(content.subheadline)}</p></div>
      <span class="digital-local-badge">${escapeHTML(adminState.digitalConfig.localNote)}</span>
    </div>
    <article class="panel digital-profile-setup" id="digital-profile-setup">
      <div class="panel-head"><div><p class="eyebrow">PROFIL DIAGNOSIS</p><h3>Sesuaikan pemeriksaan dengan usahamu</h3><p>Jawaban berikutnya akan bercabang sesuai tahap, model usaha, sasaran, kanal, tim, dan anggaranmu.</p></div></div>
      <form id="digital-profile-form">
        <div class="digital-profile-grid">
          ${digitalProfileSelect("digital-profile-stage", "Tahap usaha", DIGITAL_PROFILE_OPTIONS.stages, digitalState.profile.stage)}
          ${digitalProfileSelect("digital-profile-model", "Model usaha", DIGITAL_PROFILE_OPTIONS.models, digitalState.profile.model)}
          ${digitalProfileSelect("digital-profile-goal", "Sasaran 90 hari", DIGITAL_PROFILE_OPTIONS.goals, digitalState.profile.goal)}
          ${digitalProfileSelect("digital-profile-audience", "Pelanggan utama", DIGITAL_PROFILE_OPTIONS.audiences, digitalState.profile.audience)}
          ${digitalProfileSelect("digital-profile-channel", "Kanal utama saat ini", DIGITAL_PROFILE_OPTIONS.channels, digitalState.profile.channel)}
          ${digitalProfileSelect("digital-profile-team", "Kapasitas tim", DIGITAL_PROFILE_OPTIONS.teams, digitalState.profile.team)}
          ${digitalProfileSelect("digital-profile-budgetBand", "Anggaran digital per bulan", DIGITAL_PROFILE_OPTIONS.budgets, digitalState.profile.budgetBand)}
        </div>
        <details class="digital-metrics"><summary>Tambahkan angka aktual (opsional, tetapi membuat diagnosis lebih tajam)</summary><div class="digital-profile-grid metrics">
          <label><span>Lead per bulan</span><input id="digital-monthly-leads" type="number" min="0" max="1000000000" inputmode="numeric" placeholder="mis. 25"></label>
          <label><span>Konversi ke transaksi (%)</span><input id="digital-conversion" type="number" min="0" max="100" step="0.1" placeholder="mis. 4"></label>
          <label><span>Pembelian ulang (%)</span><input id="digital-repeat" type="number" min="0" max="100" step="0.1" placeholder="mis. 20"></label>
          <label><span>Konten per minggu</span><input id="digital-content-week" type="number" min="0" max="100" step="1" placeholder="mis. 3"></label>
          <label><span>Waktu respons (menit)</span><input id="digital-response-minutes" type="number" min="0" max="1000000000" step="1" placeholder="mis. 30"></label>
          <label><span>Belanja iklan per bulan</span><input id="digital-ad-spend" type="number" min="0" max="1000000000" step="10000" placeholder="mis. 500000"></label>
        </div></details>
        <div class="form-actions"><button class="btn primary" id="digital-profile-submit" type="submit">Mulai pemeriksaan</button></div>
      </form>
    </article>
    <div class="digital-layout">
      <aside class="panel digital-map-panel">
        <div class="panel-head"><div><p class="eyebrow">6 AREA DIGITAL</p><h3>Fondasi yang diperiksa</h3></div></div>
        <div id="digital-category-map" class="digital-category-map"></div>
        <p class="digital-privacy-note"><strong>Tanpa spreadsheet dan tanpa koneksi bank.</strong> Pemeriksaan dihitung langsung di browser.</p>
      </aside>
      <div class="digital-main">
        <article class="panel digital-assessment" id="digital-assessment">
          <div class="digital-progress-head"><span id="digital-step-label">Lengkapi profil untuk mulai</span><button class="btn ghost compact" id="digital-edit-profile" type="button">Ubah profil</button><strong id="digital-progress-value">0%</strong></div>
          <div class="progress digital-progress"><i id="digital-progress-bar"></i></div>
          <div id="digital-assessment-context" class="digital-context-tags"></div>
          <div class="digital-question-block">
            <span class="digital-question-category" id="digital-question-category">Website & Kehadiran Digital</span>
            <h3 id="digital-question-text">Mulai pemeriksaan untuk melihat pertanyaan.</h3>
            <p id="digital-question-evidence" class="digital-question-evidence">Pilih jawaban berdasarkan bukti yang benar-benar tersedia.</p>
            <div id="digital-answer-options" class="digital-answer-options"></div>
          </div>
          <div class="digital-assessment-actions">
            <button class="btn ghost" id="digital-prev" type="button">Sebelumnya</button>
            <button class="btn primary" id="digital-next" type="button">Berikutnya</button>
          </div>
        </article>
        <section id="digital-results" class="digital-results" hidden>
          <article class="digital-result-hero"><span>HASIL PEMERIKSAAN</span><h3 id="digital-result-title">${escapeHTML(adminState.digitalConfig.resultTitle)}</h3><div class="digital-maturity"><strong id="digital-overall-readiness">0/100</strong><div><b id="digital-maturity-label">Belum dinilai</b><p id="digital-maturity-summary"></p></div></div><p id="digital-result-summary"></p><ul id="digital-signal-list" class="digital-signal-list"></ul><button class="btn ghost" id="digital-restart" type="button">Ulangi pemeriksaan</button></article>
          <div id="digital-result-cards" class="digital-result-cards"></div>
          <article class="panel digital-checklist-panel"><div class="panel-head"><div><p class="eyebrow">KERJAKAN BERTAHAP</p><h3 id="digital-checklist-title">${escapeHTML(adminState.digitalConfig.checklistTitle)}</h3></div><span id="digital-checklist-count" class="count-badge">0</span></div><div id="digital-checklist" class="digital-checklist"></div></article>
          <article class="panel digital-plan-panel"><div class="panel-head"><div><p class="eyebrow">RENCANA 90 HARI</p><h3>Urutan kerja 30 / 60 / 90 hari</h3></div></div><div id="digital-90-day-plan" class="digital-90-day-plan"></div></article>
          <article class="panel digital-budget-panel"><div class="panel-head"><div><p class="eyebrow">ESTIMASI AWAL</p><h3>Kisaran anggaran pelaksanaan</h3></div></div><div class="digital-budget-grid"><div><span>Dikerjakan sendiri</span><strong id="digital-budget-self">—</strong><small>Alat dasar, aset, dan kebutuhan implementasi mandiri.</small></div><div><span>Dengan bantuan</span><strong id="digital-budget-help">—</strong><small>Kisaran jasa awal berdasarkan celah kebutuhan.</small></div></div><p>Estimasi bukan penawaran harga dan belum termasuk media iklan, perangkat, domain/hosting khusus, pajak, maupun perubahan ruang lingkup.</p></article>
          <article class="panel digital-brief-panel"><div class="panel-head"><div><p class="eyebrow">BRIEF OTOMATIS</p><h3>Ringkasan siap dibagikan</h3></div><button class="btn secondary" id="digital-copy-brief" type="button">Salin brief</button></div><div id="digital-brief" class="digital-brief"></div></article>
          <article class="panel digital-consultation"><div><p class="eyebrow">BUTUH PENDAMPINGAN?</p><h3>Bahas prioritas, bukan membeli semua layanan.</h3><p>Konsultasi dibuka hanya saat kamu memilih tombol ini. Jawaban pemeriksaan tidak dikirim otomatis.</p></div><button class="btn primary" id="digital-whatsapp" type="button">${escapeHTML(adminState.digitalConfig.consultationLabel)}</button></article>
        </section>
      </div>
    </div>
  </section>`;
}

function benefitsMarkup() {
  const content = adminState.benefitsContent;
  const pageContent = adminState.pageContent.benefits;
  return `
  <section class="page benefits-page" data-page="benefits" hidden>
    <div class="benefits-hero">
      <div class="benefits-hero-copy">
        <h2>${escapeHTML(pageContent.headline)}</h2>
        <p>${escapeHTML(pageContent.subheadline)}</p>
        <div class="benefits-actions"><button class="btn primary" data-route="money">${escapeHTML(content.hero.primaryCta)}</button><button class="btn benefits-secondary" data-route="readiness">${escapeHTML(content.hero.secondaryCta)}</button></div>
      </div>
      <aside class="benefits-hero-note" aria-label="Prinsip pendampingan SBB"><span>${escapeHTML(content.hero.principleLabel)}</span><strong>${escapeHTML(content.hero.principleTitle)}</strong><p>${escapeHTML(content.hero.principleBody)}</p></aside>
    </div>

    <div class="benefit-grid" aria-label="Manfaat utama SBB">
      ${content.benefits.map((item, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.body)}</p></article>`).join("")}
    </div>

    <article class="panel ecosystem-panel">
      <div class="panel-head"><div><p class="eyebrow">${escapeHTML(content.ecosystem.eyebrow)}</p><h3>${escapeHTML(content.ecosystem.title)}</h3><p>${escapeHTML(content.ecosystem.intro)}</p></div><span class="ecosystem-badge">${escapeHTML(content.ecosystem.badge)}</span></div>
      <div class="ecosystem-table" role="table" aria-label="Bagian dan manfaat ekosistem SBB">
        <div class="ecosystem-row ecosystem-heading" role="row"><span role="columnheader">${escapeHTML(content.ecosystem.nameHeader)}</span><span role="columnheader">${escapeHTML(content.ecosystem.roleHeader)}</span></div>
        ${content.ecosystem.rows.map((item, index) => `<div class="ecosystem-row${index === 0 ? " ecosystem-main" : ""}" role="row"><strong role="cell">${escapeHTML(item.name)}</strong><span role="cell">${escapeHTML(item.role)}</span></div>`).join("")}
      </div>
    </article>

    <article class="panel journey-panel">
      <div class="journey-intro"><p class="eyebrow">${escapeHTML(content.journey.eyebrow)}</p><h3>${escapeHTML(content.journey.title)}</h3><p>${escapeHTML(content.journey.intro)}</p></div>
      <ol class="journey-flow">
        ${content.journey.steps.map((item, index) => `<li><span>${index + 1}</span><div><small>${escapeHTML(item.label)}</small><strong>${escapeHTML(item.title)}</strong><p>${escapeHTML(item.body)}</p></div></li>`).join("")}
      </ol>
    </article>

    <article class="panel calculator-scope">
      <div class="scope-icon" aria-hidden="true">i</div>
      <div><p class="eyebrow">${escapeHTML(content.scope.eyebrow)}</p><h3>${escapeHTML(content.scope.title)}</h3><p>${escapeHTML(content.scope.body)}</p></div>
    </article>

    <article class="panel about-sbb">
      <div class="about-heading"><p class="eyebrow">${escapeHTML(content.about.eyebrow)}</p><h3>${escapeHTML(content.about.title)}</h3><p>${escapeHTML(content.about.body)}</p></div>
      <div class="about-points"><div><span>01</span><strong>${escapeHTML(content.about.beliefTitle)}</strong><p>${escapeHTML(content.about.beliefBody)}</p></div><div><span>02</span><strong>${escapeHTML(content.about.approachTitle)}</strong><p>${escapeHTML(content.about.approachBody)}</p></div></div>
    </article>
  </section>`;
}

function policiesMarkup() {
  const content = adminState.pageContent.policies;
  const backupMeta = readStorage(STORAGE.backupMeta, null);
  const backupStatus = backupMeta?.exportedAt
    ? `Backup terakhir dibuat ${dateTimeText(backupMeta.exportedAt)}. Integritas file akan diperiksa saat impor.`
    : "Belum ada backup yang dibuat di perangkat ini. Integritas file akan diperiksa saat impor.";
  return `
  <section class="page policies-page" data-page="policies" hidden>
    <div class="policy-header"><div><h2 id="policies-context-headline">${escapeHTML(content.headline)}</h2><p id="policies-context-copy">${escapeHTML(content.subheadline)}</p></div><span class="policy-status"><i></i> Data keuangan tetap di perangkat</span></div>

    <div class="policy-highlight" role="note"><strong>Intinya:</strong><span>SBB tidak terhubung ke bank, dompet digital, kartu, atau layanan keuangan lain. Semua angka yang kamu masukkan hanya dipakai untuk simulasi di browser pada perangkat ini.</span></div>

    <article class="panel data-backup-panel">
      <div><p class="eyebrow">DATA SAYA</p><h3>Pindahkan data antarperangkat</h3><p>Unduh satu file terverifikasi yang berisi Atur Uang, SBB Start, SBB Business, SBB Health, dan SBB Digital. File hanya diproses pada perangkatmu dan tidak dikirim ke SBB.</p><small id="backup-status" role="status">${escapeHTML(backupStatus)} Admin dan sesi masuk tidak disertakan.</small></div>
      <div class="data-backup-actions"><button class="btn primary" id="download-local-backup" type="button">Unduh backup</button><label class="btn secondary" for="import-local-backup">Impor backup</label><input id="import-local-backup" type="file" accept="application/json,.json" hidden></div>
    </article>

    <div class="policy-grid">
      <article class="panel policy-card"><span>01</span><div><h3>Privasi data</h3><ul><li>Data transaksi dan perhitungan disimpan secara lokal di browser perangkatmu.</li><li>SBB tidak menerima, membaca, atau menyimpan isi data keuangan tersebut pada server SBB.</li><li>Tidak ada penarikan data rekening, mutasi bank, saldo, kartu, atau dompet digital.</li></ul></div></article>
      <article class="panel policy-card"><span>02</span><div><h3>Login Google</h3><ul><li>Tombol Google pada prototipe ini hanya simulasi dan belum terhubung dengan Google OAuth.</li><li>Aplikasi SBB tidak meminta atau menyalin nama, email, kontak, maupun isi akun Google.</li><li>Penyedia browser atau hosting dapat mencatat data teknis dasar menurut kebijakannya sendiri; data tersebut bukan isi catatan keuangan SBB.</li></ul></div></article>
      <article class="panel policy-card"><span>03</span><div><h3>Disclaimer perhitungan</h3><ul><li>Hasil adalah estimasi dari angka yang kamu masukkan, bukan jaminan kelayakan atau keuntungan bisnis.</li><li>SBB bukan pengganti nasihat keuangan, akuntansi, pajak, hukum, investasi, atau pemeriksaan lapangan.</li><li>Keputusan dan risiko penggunaan hasil tetap menjadi tanggung jawab pengguna.</li></ul></div></article>
      <article class="panel policy-card"><span>04</span><div><h3>Penyimpanan & penghapusan</h3><ul><li>Data tidak disinkronkan dan tidak memiliki cadangan awan otomatis.</li><li>Pengguna dapat membuat dan memindahkan backup lokal secara manual.</li><li>Keluar dari aplikasi tidak otomatis menghapus data lokal.</li><li>Untuk menghapusnya, bersihkan data situs SBB melalui pengaturan browser pada perangkatmu.</li></ul></div></article>
      <article class="panel policy-card"><span>05</span><div><h3>Ketentuan penggunaan</h3><ul><li>Gunakan SBB secara wajar, sah, dan hanya untuk tujuan perencanaan.</li><li>Pengguna bertanggung jawab atas ketepatan data yang dimasukkan.</li><li>Fitur, rumus, dan tampilan prototipe dapat diperbaiki atau diperbarui sewaktu-waktu.</li></ul></div></article>
      <article class="panel policy-card"><span>06</span><div><h3>Hukum & hak pengguna</h3><ul><li>Prinsip privasi mengacu pada peraturan pelindungan data dan sistem elektronik Indonesia.</li><li>Pengguna berhak mengetahui cara data diperlakukan dan menghapus data lokalnya.</li><li>Pertanyaan atau keberatan dapat disampaikan melalui kanal resmi pengelola SBB.</li></ul></div></article>
    </div>

    <article class="panel legal-reference"><div><p class="eyebrow">ACUAN RINGKAS</p><h3>Dasar yang digunakan</h3></div><div class="legal-links"><a href="https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022" target="_blank" rel="noopener noreferrer">UU 27/2022 · Pelindungan Data Pribadi</a><a href="https://peraturan.bpk.go.id/Details/122030/pp-no-71-tahun-2019" target="_blank" rel="noopener noreferrer">PP 71/2019 · Sistem Elektronik</a><a href="https://peraturan.bpk.go.id/Details/45288/uu-no-8-tahun-1999" target="_blank" rel="noopener noreferrer">UU 8/1999 · Perlindungan Konsumen</a></div></article>
  </section>`;
}

function visualAssetCardMarkup(key, title, description, shape = "logo") {
  return `<article class="visual-asset-card" data-visual-asset-card="${key}">
    <div class="visual-asset-thumb ${shape}"><img id="visual-preview-${key}" alt="Pratinjau ${escapeHTML(title)}"></div>
    <div class="visual-asset-copy"><strong>${escapeHTML(title)}</strong><small>${escapeHTML(description)}</small><span id="visual-status-${key}">Menggunakan bawaan</span></div>
    <div class="visual-asset-actions"><label class="btn ghost visual-upload-button">Pilih file<input type="file" data-visual-asset-input="${key}" accept="image/png,image/jpeg,image/webp" hidden></label><button class="btn subtle" data-clear-visual-asset="${key}" type="button">Gunakan bawaan</button></div>
  </article>`;
}

function iconPresetOptions() {
  return ICON_PRESETS.map(([value, label]) => `<option value="${value}">${escapeHTML(label)}</option>`).join("");
}

function adminMarkup() {
  const content = adminState.pageContent.admin;
  return `
  <section class="page admin-page" data-page="admin" hidden>
    <div class="module-header page-context-intro"><p id="admin-context-copy">${escapeHTML(content.subheadline)}</p><button class="btn secondary" id="export-admin">Unduh backup demo</button></div>
    <div class="admin-notice"><strong>Lingkungan prototipe.</strong> Perubahan tersimpan lokal. Versi produksi memindahkan validasi kode, peran admin, sesi, dan audit log ke Cloudflare Worker + D1.</div>
    <div class="tab-bar admin-tabs" role="tablist" aria-label="Bagian Admin"><button data-admin-tab="dashboard" class="is-active">Dashboard</button><button data-admin-tab="codes">Kode akses</button><button data-admin-tab="users">Pengguna</button><button data-admin-tab="plans">Paket</button><button data-admin-tab="page-content">Konten Halaman</button><button data-admin-tab="sbb-content">About Us</button><button data-admin-tab="digital-content">SBB Digital</button><button data-admin-tab="visual">Visual</button><button data-admin-tab="integrations">Integrasi</button><button data-admin-tab="settings">Pengaturan</button><button data-admin-tab="audit">Audit</button></div>
    <div class="admin-panel is-active" data-admin-panel="dashboard"><div class="metric-grid"><article class="metric-card emphasis"><span>Kode tersedia</span><strong id="admin-available">0</strong><small>Siap dijual/diaktifkan</small></article><article class="metric-card"><span>Kode terpakai</span><strong id="admin-used">0</strong><small>Mencapai batas aktivasi</small></article><article class="metric-card"><span>Pengguna aktif</span><strong id="admin-active-users">0</strong><small>Akses belum kedaluwarsa</small></article><article class="metric-card"><span>Perlu perhatian</span><strong id="admin-attention">0</strong><small>Kedaluwarsa atau dicabut</small></article></div><div class="two-column"><article class="panel"><div class="panel-head"><div><p class="eyebrow">RINGKASAN LISENSI</p><h3>Distribusi paket</h3></div></div><div id="plan-distribution" class="distribution"></div></article><article class="panel"><div class="panel-head"><div><p class="eyebrow">AKTIVITAS TERBARU</p><h3>Jejak admin</h3></div></div><div id="recent-audit" class="audit-list"></div></article></div></div>
    <div class="admin-panel" data-admin-panel="codes" hidden><div class="admin-split"><article class="panel generator-panel"><div class="panel-head"><div><p class="eyebrow">GENERATOR</p><h3>Buat kode akses</h3></div></div><form id="code-form"><label>Paket<select id="code-plan"><option>Basic</option><option selected>Pro</option><option>Lifetime</option><option>Trial</option></select></label><label>Jumlah<input id="code-quantity" type="number" min="1" max="20" value="3"></label><label>Berlaku sampai<input id="code-expiry" type="date"></label><label>Maksimal aktivasi<input id="code-max-activation" type="number" min="1" max="100" value="1"></label><button class="btn primary wide" type="submit">Buat kode demo</button></form><p class="prototype-note">Produksi: server menyimpan hash kode, bukan kode asli.</p></article><article class="panel table-panel"><div class="panel-head"><div><p class="eyebrow">INVENTORI</p><h3>Semua kode akses</h3></div><input class="search-input" id="code-search" type="search" placeholder="Cari kode atau paket"></div><div class="table-wrap"><table><thead><tr><th>Kode</th><th>Paket</th><th>Status</th><th>Aktivasi</th><th>Berlaku</th><th>Aksi</th></tr></thead><tbody id="code-list"></tbody></table></div></article></div></div>
    <div class="admin-panel" data-admin-panel="users" hidden><article class="panel"><div class="panel-head"><div><p class="eyebrow">PELANGGAN</p><h3>Akses pengguna</h3></div><input class="search-input" id="user-search" type="search" placeholder="Cari nama atau email"></div><div class="privacy-callout">Admin melihat status lisensi, bukan detail transaksi keuangan pengguna.</div><div class="table-wrap"><table><thead><tr><th>Pengguna</th><th>Paket</th><th>Status</th><th>Kode</th><th>Terakhir aktif</th><th>Aksi</th></tr></thead><tbody id="user-list"></tbody></table></div></article></div>
    <div class="admin-panel" data-admin-panel="plans" hidden><div id="plan-cards" class="plan-cards"></div></div>
    <div class="admin-panel content-admin-panel" data-admin-panel="page-content" hidden><form id="page-content-form"><div class="content-editor-header"><div><p class="eyebrow">KONTEKS HALAMAN</p><h3>Headline dan subheadline</h3><p>Atur label header, judul, headline, subheadline, dan teks tombol yang relevan untuk semua halaman.</p></div><div><button class="btn ghost" id="reset-page-content" type="button">Kembalikan teks awal</button><button class="btn primary" type="submit">Simpan konten</button></div></div><div id="page-content-editor" class="content-editor"></div></form></div>
    <div class="admin-panel content-admin-panel" data-admin-panel="sbb-content" hidden><form id="sbb-content-form"><div class="content-editor-header"><div><p class="eyebrow">KONTEN PENGGUNA</p><h3>Edit About Us</h3><p>Semua teks pada halaman About Us dapat diubah di sini. Simpan untuk langsung menerapkan perubahan pada perangkat ini.</p></div><div><button class="btn ghost" id="reset-sbb-content" type="button">Kembalikan teks awal</button><button class="btn primary" type="submit">Simpan halaman</button></div></div><div id="sbb-content-editor" class="content-editor"></div><div class="content-savebar"><span>Periksa kembali ejaan dan kejelasan informasi sebelum menyimpan.</span><button class="btn primary" type="submit">Simpan semua perubahan</button></div></form></div>
    <div class="admin-panel content-admin-panel" data-admin-panel="digital-content" hidden><form id="digital-content-form"><div class="content-editor-header"><div><p class="eyebrow">SBB DIGITAL</p><h3>Konten pemeriksaan digital</h3><p>Edit empat area, sepuluh pertanyaan, checklist, serta jalur konsultasi. Headline halaman tetap dikelola dari tab Konten Halaman.</p></div><div><button class="btn ghost" id="reset-digital-content" type="button">Kembalikan teks awal</button><button class="btn primary" type="submit">Simpan konten</button></div></div><div id="digital-content-editor" class="content-editor"></div><div class="content-savebar"><span>Nomor WhatsApp tidak wajib. Kosongkan bila konsultasi belum dibuka.</span><button class="btn primary" type="submit">Simpan SBB Digital</button></div></form></div>
    <div class="admin-panel" data-admin-panel="visual" hidden>
      <div class="visual-settings-grid">
        <article class="panel visual-controls"><div class="panel-head"><div><p class="eyebrow">IDENTITAS VISUAL</p><h3>Tampilan aplikasi</h3></div><button class="btn ghost" id="reset-visuals" type="button">Kembalikan bawaan</button></div>
          <section class="visual-section"><div class="visual-section-heading"><div><h4>Warna dan tata letak</h4><p>Atur warna, kepadatan, sudut, dan ukuran teks seluruh aplikasi.</p></div></div>
            <div class="visual-color-grid"><label>Warna utama<input id="visual-primary" type="color" data-visual-preview></label><label>Warna sidebar<input id="visual-sidebar" type="color" data-visual-preview></label><label>Warna aksen<input id="visual-accent" type="color" data-visual-preview></label><label>Warna latar<input id="visual-canvas" type="color" data-visual-preview></label></div>
            <div class="form-grid visual-detail-grid"><label>Kepadatan tampilan<select id="visual-density" data-visual-preview><option value="comfortable">Nyaman</option><option value="compact">Ringkas</option></select></label><label>Sudut kartu <small>px</small><input id="visual-radius" type="number" min="4" max="24" data-visual-preview></label><label>Skala teks <small>%</small><input id="visual-font-scale" type="number" min="90" max="115" data-visual-preview></label></div>
          </section>
          <section class="visual-section"><div class="visual-section-heading"><div><h4>Logo dan ikon aplikasi</h4><p>PNG, JPG, atau WebP maksimal 400 KB per file. Logo khusus yang kosong akan mengikuti Logo Utama.</p></div></div>
            <div class="visual-logo-controls form-grid"><label>Ukuran logo sidebar <small>px</small><input id="visual-logo-size" type="number" min="64" max="150" data-visual-preview></label><label>Ukuran logo halaman masuk <small>px</small><input id="visual-gate-logo-size" type="number" min="56" max="150" data-visual-preview></label><label>Tampilan logo sidebar<select id="visual-logo-treatment" data-visual-preview><option value="white">Putih</option><option value="original">Warna asli</option></select></label></div>
            <div class="visual-asset-grid">
              ${visualAssetCardMarkup("mainLogo", "Logo utama", "Bawaan untuk seluruh aplikasi jika tidak ada logo khusus.")}
              ${visualAssetCardMarkup("gateLogo", "Logo halaman masuk", "Tampil di kiri atas halaman kode akses.")}
              ${visualAssetCardMarkup("sidebarLogo", "Logo sidebar", "Tampil di bagian atas menu utama.")}
              ${visualAssetCardMarkup("favicon", "Ikon tab browser", "Ikon kecil pada tab dan bookmark browser.", "square")}
              ${visualAssetCardMarkup("appIcon", "Ikon pintasan perangkat", "Ikon saat halaman disimpan sebagai pintasan.", "square")}
            </div>
          </section>
          <section class="visual-section"><div class="visual-section-heading"><div><h4>Ikon menu</h4><p>Pilih simbol setiap menu serta atur ukuran dan ketebalan garisnya.</p></div></div>
            <div class="visual-icon-style form-grid"><label>Ukuran ikon <small>px</small><input id="visual-icon-size" type="number" min="18" max="32" data-visual-preview></label><label>Ketebalan garis<input id="visual-icon-stroke" type="number" min="1.2" max="2.8" step="0.1" data-visual-preview></label></div>
            <div class="visual-icon-grid">${Object.entries(NAV_ICON_LABELS).map(([slot, label]) => `<label class="visual-icon-row"><span>${navIcon(slot)}<strong>${escapeHTML(label)}</strong></span><select data-visual-icon="${slot}" data-visual-preview>${iconPresetOptions()}</select></label>`).join("")}</div>
          </section>
          <label class="setting-row"><span><strong>Tampilkan penanda prototipe</strong><small>Sembunyikan ketika aplikasi sudah produksi.</small></span><input id="visual-prototype-badge" type="checkbox" role="switch" data-visual-preview></label>
          <div class="visual-save-row"><small>Perubahan pratinjau belum permanen sebelum disimpan.</small><button class="btn primary" id="save-visuals" type="button">Simpan semua pengaturan visual</button></div>
        </article>
        <article class="panel visual-preview-card"><p class="eyebrow">PRATINJAU</p><h3>Identitas SBB aktif</h3><div class="visual-preview-brand"><img id="visual-preview-effective-logo" alt="Logo SBB aktif"><div><strong>Logo aktif</strong><small>Logo sidebar dan halaman masuk mengikuti pengaturan di samping.</small></div></div><div class="visual-preview-sidebar">${navIcon("start")}<span>SBB Start</span></div><div class="visual-preview-content"><strong>Kartu ringkasan</strong><p>Warna, logo, ikon, kepadatan, sudut, dan teks diterapkan ke seluruh aplikasi.</p><button class="btn primary" type="button">Tombol utama</button></div><div class="visual-preview-icons"><span><img id="visual-preview-effective-favicon" alt="Ikon tab"><small>Tab browser</small></span><span><img id="visual-preview-effective-app-icon" alt="Ikon pintasan"><small>Pintasan</small></span></div></article>
      </div>
    </div>
    <div class="admin-panel" data-admin-panel="integrations" hidden>
      <div class="integration-summary"><div><p class="eyebrow">KONEKSI SISTEM</p><h3>Integrasi aplikasi</h3><p>Kolom ini menyimpan konfigurasi publik saja. Token, client secret, dan API secret harus tetap berada di server.</p></div><span class="tag warning">Konfigurasi prototipe</span></div>
      <div class="integration-cards expanded">
        <article class="panel integration-detail"><div class="integration-title"><span class="connection-icon cloudflare">CF</span><div><h3>Cloudflare</h3><p>Hosting, Worker, database, dan penyimpanan.</p></div><span class="tag warning" id="cloudflare-status">Sebagian</span></div><label>Account ID<input id="cloudflare-account-id" placeholder="ID akun Cloudflare"></label><label>Nama proyek<input id="cloudflare-project-name" placeholder="sbb-finance"></label><label>Lingkungan<select id="cloudflare-environment"><option value="production">Production</option><option value="staging">Staging</option><option value="development">Development</option></select></label><label>Worker API URL<input id="cloudflare-worker-url" type="url" placeholder="https://api.example.workers.dev"></label><label>Database D1<input id="cloudflare-d1-name" placeholder="sbb-production"></label><label>Bucket R2<input id="cloudflare-r2-bucket" placeholder="sbb-assets"></label></article>
        <article class="panel integration-detail"><div class="integration-title"><span class="connection-icon">GH</span><div><h3>GitHub</h3><p>Sumber kode dan deployment otomatis.</p></div><span class="tag warning" id="github-status">Belum</span></div><label>Repository<input id="github-repo" placeholder="organisasi/sbb-finance"></label><label>Branch produksi<input id="github-branch" placeholder="main"></label><label>Workflow deployment<input id="github-workflow" placeholder=".github/workflows/deploy.yml"></label><p class="prototype-note">Gunakan GitHub App atau secret server. Jangan masukkan personal access token di sini.</p></article>
        <article class="panel integration-detail"><div class="integration-title"><span class="connection-icon">G</span><div><h3>Google OAuth</h3><p>Login pengguna dan identitas terverifikasi.</p></div><span class="tag warning" id="google-status">Belum</span></div><label>Client ID publik<input id="google-client-id" placeholder="xxxxx.apps.googleusercontent.com"></label><label>Domain yang diizinkan<input id="google-allowed-domain" placeholder="contoh: siapbukabisnis.com"></label><label>OAuth scopes<input id="google-scopes" placeholder="openid email profile"></label><label>Redirect origin<input id="google-origin" readonly></label><p class="prototype-note">Client secret hanya boleh disimpan sebagai secret pada backend.</p></article>
        <article class="panel integration-detail"><div class="integration-title"><span class="connection-icon">OP</span><div><h3>Operasional</h3><p>Analitik dan notifikasi sistem.</p></div><span class="tag neutral" id="operations-status">Opsional</span></div><label>Analytics ID<input id="analytics-id" placeholder="Contoh: G-XXXXXXXXXX"></label><label>Webhook notifikasi<input id="webhook-url" type="url" placeholder="https://hooks.example.com/sbb"></label><p class="prototype-note">Webhook pada halaman ini hanya menyimpan alamat publik. Autentikasi webhook harus dilakukan dari server.</p></article>
      </div><button class="btn primary" id="save-integrations" type="button">Simpan konfigurasi integrasi</button>
    </div>
    <div class="admin-panel" data-admin-panel="settings" hidden><div class="two-column"><article class="panel settings-panel"><div class="panel-head"><div><p class="eyebrow">AKSES & KEAMANAN</p><h3>Kebijakan aplikasi</h3></div></div><label class="setting-row"><span><strong>Mode pemeliharaan</strong><small>Blokir akses pelanggan sementara.</small></span><input id="maintenance-setting" type="checkbox" role="switch"></label><label class="setting-row"><span><strong>Maksimal perangkat</strong><small>Per akun aktif.</small></span><input id="device-setting" type="number" min="1" max="10"></label><label class="setting-row"><span><strong>Durasi sesi</strong><small>Hari sebelum login ulang.</small></span><input id="session-setting" type="number" min="1" max="90"></label><div class="admin-security-note"><strong>Admin hanya untuk akun berperan admin.</strong><span>Pengguna biasa tidak melihat tab Admin dan tidak dapat membuka rute Admin.</span></div></article><article class="panel settings-panel"><div class="panel-head"><div><p class="eyebrow">FITUR</p><h3>Modul pelanggan</h3></div></div><label class="setting-row"><span><strong>Atur Uang</strong><small>Pencatatan dan anggaran.</small></span><input id="money-feature" type="checkbox" role="switch"></label><label class="setting-row"><span><strong>SBB Start</strong><small>Kesiapan keuangan dan modal.</small></span><input id="readiness-feature" type="checkbox" role="switch"></label><label class="setting-row"><span><strong>SBB Business</strong><small>Kalkulator dan simulasi bisnis.</small></span><input id="business-feature" type="checkbox" role="switch"></label><label class="setting-row"><span><strong>SBB Health</strong><small>Pemeriksaan bisnis yang sudah berjalan.</small></span><input id="health-feature" type="checkbox" role="switch"></label><label class="setting-row"><span><strong>SBB Digital</strong><small>Pemeriksaan dan rekomendasi kebutuhan digital.</small></span><input id="digital-feature" type="checkbox" role="switch"></label><button class="btn primary" id="save-settings">Simpan pengaturan</button></article></div></div>
    <div class="admin-panel" data-admin-panel="audit" hidden><article class="panel"><div class="panel-head"><div><p class="eyebrow">AUDIT LOG</p><h3>Riwayat perubahan admin</h3></div><button class="btn ghost" id="clear-audit">Bersihkan log demo</button></div><div id="audit-list" class="audit-table"></div></article></div>
  </section>`;
}

function setSession(next) {
  session = next;
  if (!persistSession()) return;
  if (session) showApplication();
  else showGate();
}

function showGate() {
  applyVisualSettings();
  $("#access-gate").hidden = false;
  $("#app-shell").hidden = true;
  $("#access-code").value = "";
  $("#access-error").textContent = "";
}

function showApplication() {
  if (adminState.settings.maintenance && session?.role !== "admin") {
    session = null;
    if (!persistSession()) return;
    showGate();
    $("#access-error").textContent = "Aplikasi sedang dalam mode pemeliharaan. Coba kembali setelah admin mengaktifkan akses.";
    return;
  }
  $("#access-gate").hidden = true;
  $("#app-shell").hidden = false;
  const isAdmin = session?.role === "admin";
  $$(".admin-only").forEach(element => { element.hidden = !isAdmin; });
  $("#user-name").textContent = session.name;
  $("#user-role").textContent = isAdmin ? "Administrator · Demo" : `Pengguna · ${session.plan || "Pro"}`;
  $("#user-avatar").textContent = session.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
  $("#sidebar-plan").textContent = isAdmin ? "Admin · Demo" : `${session.plan || "Pro"} · Demo`;
  const activeLicense = adminState.codes.find(code => code.id === session.codeId);
  $("#license-expiry").textContent = activeLicense ? `Berlaku: ${dateText(activeLicense.expiresAt)}` : "Prototipe perangkat lokal";
  renderAll();
  const requested = location.hash.replace("#/", "") || "overview";
  navigate(requested);
}

function activateCode(rawCode) {
  const normalized = normalizeAccessCode(rawCode);
  if (normalized === ADMIN_ACCESS_CODE) {
    setSession({ role: "admin", name: "Admin SBB", plan: "Admin", provider: "admin-code", signedInAt: new Date().toISOString() });
    return;
  }
  const license = adminState.codes.find(item => normalizeAccessCode(item.code) === normalized);
  const result = canRedeemLicense(license);
  if (!result.ok) {
    const messages = { expired: "Kode sudah kedaluwarsa.", revoked: "Kode sudah dicabut.", used: "Batas aktivasi kode sudah tercapai." };
    $("#access-error").textContent = license ? messages[result.state] : "Kode tidak ditemukan. Periksa kembali penulisannya.";
    return;
  }
  license.activations += 1;
  addAudit(`Kode ${license.code} diaktifkan pada perangkat demo`, "Sistem Demo");
  session = { role: "user", name: "Pengguna SBB", plan: license.plan, codeId: license.id, provider: "code", signedInAt: new Date().toISOString() };
  if (!persistEntries([[STORAGE.admin, adminState], [STORAGE.session, session]])) return;
  showApplication();
}

let menuFocusReturn = null;
function setSidebarOpen(open) {
  const sidebar = $("#sidebar");
  const scrim = $("#sidebar-scrim");
  if (!sidebar || !scrim) return;
  const wasOpen = sidebar.classList.contains("is-open");
  if (open && !wasOpen) menuFocusReturn = document.activeElement;
  const modal = Boolean(open) && window.innerWidth <= 960;
  $(".workspace").inert = modal;
  $(".mobile-dock").inert = modal;
  if (modal) { sidebar.setAttribute("role", "dialog"); sidebar.setAttribute("aria-modal", "true"); sidebar.setAttribute("aria-label", "Menu SBB"); }
  else { sidebar.removeAttribute("role"); sidebar.removeAttribute("aria-modal"); sidebar.removeAttribute("aria-label"); }
  sidebar.classList.toggle("is-open", Boolean(open));
  scrim.hidden = !open;
  $("#menu-toggle")?.setAttribute("aria-expanded", String(Boolean(open)));
  $("#mobile-more")?.setAttribute("aria-expanded", String(Boolean(open)));
  document.body.classList.toggle("menu-is-open", Boolean(open));
  if (open) requestAnimationFrame(() => {
    if (sidebar.classList.contains("is-open")) $("#sidebar-close")?.focus({ preventScroll: true });
  });
  else if (wasOpen && menuFocusReturn instanceof HTMLElement) menuFocusReturn.focus({ preventScroll: true });
}

function navigate(route) {
  const allowed = ["overview", "money", "readiness", "business", "health", "digital", "benefits", "policies", "admin"];
  if (!allowed.includes(route)) route = "overview";
  if (route === "admin" && session?.role !== "admin") {
    route = "overview";
    queueMicrotask(() => showToast("Admin hanya untuk akun Admin. Klik Keluar, lalu masuk dengan kode khusus Admin."));
  }
  const plan = adminState.plans.find(item => item.name === session?.plan);
  if (route === "money" && session?.role !== "admin" && (!adminState.settings.features.money || plan?.money === false)) return showToast("Paket atau pengaturan admin tidak membuka modul Atur Uang.");
  if (route === "readiness" && session?.role !== "admin" && (!adminState.settings.features.readiness || plan?.readiness === false)) return showToast("Paket atau pengaturan admin tidak membuka modul SBB Start.");
  if (route === "business" && session?.role !== "admin" && adminState.settings.features.business === false) return showToast("Pengaturan admin tidak membuka modul SBB Business.");
  if (route === "health" && session?.role !== "admin" && adminState.settings.features.health === false) return showToast("Pengaturan admin tidak membuka modul SBB Health.");
  if (route === "digital" && session?.role !== "admin" && adminState.settings.features.digital === false) return showToast("Pengaturan admin tidak membuka modul SBB Digital.");
  $$(".page").forEach(page => {
    const active = page.dataset.page === route;
    page.hidden = !active;
    page.classList.toggle("is-active", active);
  });
  $$(".main-nav [data-route], .mobile-dock [data-route]").forEach(button => {
    const active = button.dataset.route === route;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  $("#mobile-more").classList.toggle("is-active", !["overview", "money", "business"].includes(route));
  const content = adminState.pageContent[route] || DEFAULT_PAGE_CONTENT[route];
  $("#breadcrumb").textContent = content.label;
  $("#page-title").textContent = content.title;
  setSidebarOpen(false);
  if (location.hash !== `#/${route}`) history.replaceState(null, "", `#/${route}`);
  if (route === "money") renderMoney();
  if (route === "readiness") renderReadiness();
  if (route === "health") renderHealth();
  if (route === "digital") renderDigital();
  if (route === "admin") renderAdmin();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectMoneyTab(tab) {
  moneyTab = tab;
  $$("[data-money-panel]").forEach(panel => { panel.hidden = panel.dataset.moneyPanel !== tab; panel.classList.toggle("is-active", panel.dataset.moneyPanel === tab); });
  $$(".tab-bar [data-money-tab]").forEach(button => {
    const active = button.dataset.moneyTab === tab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  if (tab === "record" && !$("#transaction-date").value) resetTransactionForm();
  renderMoney();
}

function selectAdminTab(tab) {
  if (session?.role !== "admin") return;
  adminTab = tab;
  $$("[data-admin-panel]").forEach(panel => { panel.hidden = panel.dataset.adminPanel !== tab; panel.classList.toggle("is-active", panel.dataset.adminPanel === tab); });
  $$("[data-admin-tab]").forEach(button => {
    const active = button.dataset.adminTab === tab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  renderAdmin();
}

function renderAll() {
  applyVisualSettings();
  applyPageContent();
  renderOverview();
  renderMoney();
  renderReadiness();
  renderHealth();
  renderDigital();
  renderAdmin();
}

function renderOverview() {
  const month = calculateMonth(transactions, moneySettings, getCurrentMonthKey());
  const readiness = calculateReadiness(readinessProfile);
  const hasReadinessProfile = hasStoredProfile(STORAGE.readiness);
  $("#overview-greeting").textContent = session?.name && !["Pengguna SBB", "Admin SBB"].includes(session.name) ? `Halo, ${session.name.split(" ")[0]}. Selamat datang kembali.` : "Selamat datang di ruang usahamu";
  renderCashflow(month);
  $("#overview-balance").textContent = formatRupiah(month.balance);
  $("#overview-income").textContent = formatRupiah(month.income);
  $("#overview-saved").textContent = formatRupiah(month.saved);
  $("#overview-month").textContent = monthLabel(month.monthKey);
  $("#overview-saving-target").textContent = `Target ${formatRupiah(month.savingTarget)}`;
  $("#overview-ready").textContent = hasReadinessProfile ? readiness.status.label : "Mulai dari rencana";
  $("#overview-ready-time").textContent = !hasReadinessProfile ? "Isi profil di SBB Start" : readiness.status.key === "warning" && readiness.businessNeed === 0
    ? "Lengkapi kebutuhan usaha"
    : readiness.monthsToReady === null
      ? "Arus kas belum positif"
      : readiness.monthsToReady === 0
        ? "Fondasi memenuhi rencana"
        : `Perkiraan ${readiness.monthsToReady} bulan`;
  $("#overview-action-title").textContent = month.status;
  $("#overview-signal").textContent = month.status;
  $("#overview-signal").className = `signal ${month.statusTone}`;
  $("#overview-action-copy").textContent = nextStep(month);
  const discipline = month.discipline;
  const saving = month.savingSuccess;
  $("#overview-discipline").textContent = discipline === null ? "—" : formatPercent(discipline);
  $("#overview-saving").textContent = saving === null ? "—" : formatPercent(saving);
  $("#overview-discipline-bar").style.width = `${Math.min(discipline || 0, 100)}%`;
  $("#overview-saving-bar").style.width = `${Math.min(saving || 0, 100)}%`;
}

function renderMoney() {
  const result = calculateMonth(transactions, moneySettings, selectedMonth);
  $("#money-next").disabled = selectedMonth >= getCurrentMonthKey();
  $("#money-month").textContent = monthLabel(selectedMonth);
  $("#money-balance").textContent = formatRupiah(result.balance);
  $("#money-income").textContent = formatRupiah(result.income);
  $("#money-expense").textContent = formatRupiah(result.expense);
  $("#money-saved").textContent = formatRupiah(result.saved);
  $("#money-status").textContent = result.status;
  $("#money-target").textContent = `Target ${formatRupiah(result.savingTarget)}`;
  $("#money-next-title").textContent = result.status;
  $("#money-signal").textContent = result.status;
  $("#money-signal").className = `signal ${result.statusTone}`;
  $("#money-next-step").textContent = nextStep(result);
  $("#overspent-count").textContent = result.overspentRows.length;
  $("#overspent-list").innerHTML = result.overspentRows.length ? result.overspentRows.slice(0, 4).map(row => `<div class="overspent-row"><div><strong>${escapeHTML(row.name)}</strong><small>${formatRupiah(row.used)} dari batas ${formatRupiah(row.cap)}</small></div><span>+${formatRupiah(row.over)}</span></div>`).join("") : '<div class="empty-state compact">Belum ada kategori melewati batas.</div>';
  renderCalendar(result);
  renderBudget(result);
  renderHistory(result);
  renderYear();
}

function renderCalendar(result) {
  const calendar = buildGregorianCalendar(result.monthKey, result.transactions);
  const today = todayISO();
  $("#calendar-title").textContent = monthLabel(calendar.monthKey);
  $("#finance-calendar").innerHTML = calendar.cells.map((cell) => {
    if (!cell) return '<span class="calendar-empty" aria-hidden="true"></span>';
    const classes = ["calendar-day"];
    if (cell.date === today) classes.push("is-today");
    if (cell.date > today) classes.push("is-future");
    if (cell.count) classes.push("has-records");
    const dots = cell.types.map((type) => `<i class="calendar-dot ${type}" aria-hidden="true"></i>`).join("");
    const status = cell.count ? `${cell.count} catatan` : "Catat";
    return `<button class="${classes.join(" ")}" type="button" role="gridcell" data-calendar-date="${cell.date}" ${cell.date > today ? "disabled" : ""} aria-label="${dateText(cell.date)}, ${cell.date > today ? "tanggal mendatang" : `${status}. Klik untuk mencatat transaksi`}"><span class="calendar-day-number">${cell.day}</span><span class="calendar-day-status">${cell.date > today ? "Mendatang" : status}</span><span class="calendar-dots">${dots}</span></button>`;
  }).join("");
}

function openRecordForDate(date) {
  if (!isValidISODate(date) || date > todayISO()) return;
  resetTransactionForm();
  $("#transaction-date").value = date;
  selectMoneyTab("record");
  requestAnimationFrame(() => $("#transaction-amount")?.focus());
  showToast(`Tanggal ${dateText(date)} dipilih.`);
}

function renderBudget(result) {
  $("#expense-allocation").textContent = formatRupiah(result.expenseBudget);
  $("#saving-target").value = formatNumericInput(result.savingTarget);
  $("#unallocated").textContent = formatRupiah(result.unallocatedAmount);
  $("#unallocated").classList.toggle("danger-text", result.unallocatedAmount < 0);
  $("#allocation-bar").style.width = `${Math.min(result.totalAllocation, 100)}%`;
  $("#allocation-bar").classList.toggle("is-over", result.unallocatedAmount < 0);
  $("#allocation-warning").textContent = result.income <= 0 ? "Catat pendapatan bulan ini untuk membandingkan anggaran." : result.unallocatedAmount < 0 ? `Alokasi melebihi pendapatan sebesar ${formatRupiah(-result.unallocatedAmount)}.` : `Total alokasi ${formatRupiah(result.totalBudget)} dari pendapatan ${formatRupiah(result.income)}.`;
  $("#category-count").textContent = `${result.budgetRows.length}/${MAX_EXPENSE_CATEGORIES} kategori`;
  $("#add-expense-category").disabled = result.budgetRows.length >= MAX_EXPENSE_CATEGORIES;
  $("#budget-list").innerHTML = result.budgetRows.map((row, index) => `<div class="budget-row"><span class="budget-name-wrap"><input class="budget-name-input" type="text" value="${escapeHTML(row.name)}" maxlength="40" data-category-name="${index}" aria-label="Nama kategori ${index + 1}"><small>${formatRupiah(row.used)} / ${formatRupiah(row.cap)}</small></span><span class="budget-controls"><span class="inline-number nominal-number"><span>Rp</span><input type="text" inputmode="numeric" value="${formatNumericInput(row.cap)}" data-budget="${escapeHTML(row.name)}" aria-label="Batas ${escapeHTML(row.name)} dalam rupiah"></span><button class="delete-category" type="button" data-delete-category="${index}" aria-label="Hapus kategori ${escapeHTML(row.name)}">Hapus</button></span></div>`).join("");
  if ($('input[name="transaction-type"]:checked')?.value === "expense") fillCategoryOptions($("#transaction-category").value);
}

function renderHistory(result) {
  const query = historySearch.trim().toLocaleLowerCase("id-ID");
  const items = result.transactions
    .filter(item => historyFilter === "all" || item.type === historyFilter)
    .filter(item => !query || `${item.category} ${item.note}`.toLocaleLowerCase("id-ID").includes(query))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  $("#history-title").textContent = `Transaksi ${monthLabel(selectedMonth)}`;
  const visibleTotal = items.reduce((total, item) => total + item.amount, 0);
  $("#history-summary").textContent = `${items.length} transaksi${items.length ? ` · total ${formatRupiah(visibleTotal)}` : ""}`;
  $("#transaction-empty").hidden = items.length > 0;
  $("#export-excel").disabled = transactions.length === 0;
  $("#export-csv").disabled = transactions.length === 0;
  $("#transaction-list").innerHTML = items.map(item => `<tr><td>${dateText(item.date)}</td><td><span class="type-label ${item.type}">${TYPE_LABELS[item.type]}</span></td><td><strong>${escapeHTML(item.category)}</strong></td><td class="muted">${escapeHTML(item.note || "—")}</td><td class="number amount ${item.type}">${formatRupiah(item.amount)}</td><td><div class="row-actions"><button data-edit-transaction="${escapeHTML(item.id)}" aria-label="Ubah transaksi">Ubah</button><button data-delete-transaction="${escapeHTML(item.id)}" aria-label="Hapus transaksi">Hapus</button></div></td></tr>`).join("");
}

function renderYear() {
  const year = Number(selectedMonth.slice(0, 4));
  const result = calculateYear(transactions, moneySettings, year);
  $("#year-income").textContent = formatRupiah(result.income);
  $("#year-expense").textContent = formatRupiah(result.expense);
  $("#year-saved").textContent = formatRupiah(result.saved);
  $("#year-label").textContent = String(year);
  $("#year-discipline").textContent = result.discipline === null ? "Disiplin —" : `Disiplin ${formatPercent(result.discipline)}`;
  $("#year-grid").innerHTML = result.months.map(month => `<article class="${month.monthKey === getCurrentMonthKey() ? "is-current" : ""}"><span>${monthLabel(month.monthKey, "short").replace(String(year), "").trim()}</span><strong>${formatRupiah(month.balance)}</strong><small>Masuk ${formatRupiah(month.income)}</small></article>`).join("");
}

function fillCategoryOptions(preferred = "") {
  const type = $('input[name="transaction-type"]:checked')?.value || "expense";
  const categories = categoriesForType(type, moneySettings.expenseCategories);
  $("#transaction-category").innerHTML = categories.map(category => `<option>${escapeHTML(category)}</option>`).join("");
  if (categories.includes(preferred)) $("#transaction-category").value = preferred;
}

function uniqueCategoryName(base = "Kategori baru") {
  const existing = new Set(moneySettings.expenseCategories.map((name) => name.toLocaleLowerCase("id-ID")));
  if (!existing.has(base.toLocaleLowerCase("id-ID"))) return base;
  let number = 2;
  while (existing.has(`${base} ${number}`.toLocaleLowerCase("id-ID"))) number += 1;
  return `${base} ${number}`;
}

function addExpenseCategory() {
  if (moneySettings.expenseCategories.length >= MAX_EXPENSE_CATEGORIES) return showToast(`Maksimal ${MAX_EXPENSE_CATEGORIES} kategori pengeluaran.`);
  const name = uniqueCategoryName();
  moneySettings.expenseCategories.push(name);
  moneySettings.budgets[name] = 0;
  moneySettings.budgetAmounts[name] = 0;
  if (!persistMoney()) return;
  renderAll();
  requestAnimationFrame(() => {
    const input = $(`[data-category-name="${moneySettings.expenseCategories.length - 1}"]`);
    input?.focus();
    input?.select();
  });
}

function renameExpenseCategory(index, rawName) {
  const oldName = moneySettings.expenseCategories[index];
  if (!oldName) return;
  const newName = String(rawName ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
  if (!newName) {
    showToast("Nama kategori tidak boleh kosong.");
    renderMoney();
    return;
  }
  const duplicate = moneySettings.expenseCategories.some((name, itemIndex) => itemIndex !== index && name.toLocaleLowerCase("id-ID") === newName.toLocaleLowerCase("id-ID"));
  if (duplicate) {
    showToast("Nama kategori sudah digunakan.");
    renderMoney();
    return;
  }
  if (newName === oldName) return;
  const percent = moneySettings.budgets[oldName] || 0;
  const amount = moneySettings.budgetAmounts[oldName];
  delete moneySettings.budgetAmounts[oldName];
  moneySettings.expenseCategories[index] = newName;
  delete moneySettings.budgets[oldName];
  moneySettings.budgets[newName] = percent;
  if (amount !== undefined) moneySettings.budgetAmounts[newName] = amount;
  transactions = transactions.map((item) => item.type === "expense" && item.category === oldName ? { ...item, category: newName } : item);
  if (!persistMoney()) return;
  renderAll();
  showToast("Kategori diperbarui dan tersambung ke ringkasan.");
}

function deleteExpenseCategory(index) {
  const name = moneySettings.expenseCategories[index];
  if (!name) return;
  if (moneySettings.expenseCategories.length === 1) return showToast("Minimal harus ada satu kategori pengeluaran.");
  const remaining = moneySettings.expenseCategories.filter((_, itemIndex) => itemIndex !== index);
  const fallback = remaining.find((item) => item.toLocaleLowerCase("id-ID") === "lainnya") || remaining[0];
  const affected = transactions.filter((item) => item.type === "expense" && item.category === name).length;
  const copy = affected ? `${affected} transaksi lama akan dipindahkan ke kategori ${fallback}.` : "Kategori ini akan dihapus dari pilihan transaksi.";
  confirmAction(`Hapus kategori ${name}?`, copy, () => {
    moneySettings.expenseCategories = remaining;
    delete moneySettings.budgets[name];
    delete moneySettings.budgetAmounts[name];
    transactions = transactions.map((item) => item.type === "expense" && item.category === name ? { ...item, category: fallback } : item);
    if (!persistMoney()) return;
    renderAll();
    showToast("Kategori dihapus. Ringkasan sudah diperbarui.");
  });
}

function resetTransactionForm() {
  $("#transaction-id").value = "";
  $("#transaction-heading").textContent = "Catat uang";
  $('input[name="transaction-type"][value="expense"]').checked = true;
  $("#transaction-amount").value = "";
  $("#transaction-date").value = todayISO();
  $("#transaction-date").max = todayISO();
  $("#transaction-note").value = "";
  $("#transaction-error").textContent = "";
  $("#cancel-edit").hidden = true;
  fillCategoryOptions();
}

function editTransaction(id) {
  const item = transactions.find(entry => entry.id === id);
  if (!item) return;
  $("#transaction-id").value = item.id;
  $("#transaction-heading").textContent = "Ubah transaksi";
  $(`input[name="transaction-type"][value="${item.type}"]`).checked = true;
  fillCategoryOptions(item.category);
  $("#transaction-amount").value = formatNumericInput(item.amount);
  $("#transaction-date").value = item.date;
  $("#transaction-note").value = item.note;
  $("#cancel-edit").hidden = false;
  selectMoneyTab("record");
}

function commitTransaction(input) {
  const error = transactionValidationError(input);
  if (error) { showToast(error); return null; }
  if (!transactions.some(item => item.id === input.id) && transactions.length >= MAX_TRANSACTION_COUNT) {
    showToast(`Batas ${MAX_TRANSACTION_COUNT.toLocaleString("id-ID")} transaksi baru tercapai. Data lama tetap dipertahankan.`);
    return null;
  }
  const item = {
    id: input.id || newId("trx"),
    type: input.type,
    category: input.category,
    amount: Math.min(Math.round(Number(input.amount)), MAX_TRANSACTION_AMOUNT),
    date: input.date,
    note: String(input.note || "").slice(0, 80),
    createdAt: input.createdAt || Date.now(),
  };
  const index = transactions.findIndex(entry => entry.id === item.id);
  if (index >= 0) transactions[index] = item;
  else transactions.push(item);
  transactions = sanitizeTransactions(transactions);
  if (!persistMoney()) return null;
  renderAll();
  return item;
}

function renderReadiness() {
  const result = calculateReadiness(readinessProfile);
  const hasProfile = hasStoredProfile(STORAGE.readiness);
  $("#readiness-example-note").hidden = hasProfile;
  if (!hasProfile) {
    $("#readiness-result").dataset.tone = "neutral";
    $("#readiness-status").textContent = "Belum dihitung";
    $("#readiness-title").textContent = "Mulai dari gambaran yang jelas.";
    $("#readiness-action").textContent = "Lengkapi tiga langkah di samping. Hasilmu akan membantu menentukan kebutuhan modal dan pilihan usaha.";
    $("#readiness-gap").textContent = "—";
    $$(".result-metrics strong").forEach(node => { node.textContent = "—"; });
    $("#idea-list").innerHTML = '<div class="empty-state compact">Ide usaha akan menyesuaikan kemampuan, waktu, dan modalmu.</div>';
    return;
  }
  if (!result.valid) return;
  $("#readiness-result").dataset.tone = result.status.key;
  $("#readiness-status").textContent = result.status.label;
  $("#readiness-title").textContent = result.status.title;
  $("#readiness-action").textContent = result.status.action;
  $("#readiness-gap").textContent = formatRupiah(result.totalGap);
  $("#result-surplus").textContent = formatRupiah(result.cashSurplus);
  $("#result-months").textContent = result.monthsToReady === null ? "Belum dapat dihitung" : result.monthsToReady === 0 ? "Siap sekarang" : `${result.monthsToReady} bulan`;
  $("#result-emergency").textContent = formatRupiah(result.emergencyGap);
  $("#result-business").textContent = formatRupiah(result.businessGap);
  const ideas = recommendIdeas(readinessProfile, BUSINESS_IDEAS, 3);
  $("#idea-list").innerHTML = ideas.map((idea, index) => `<article class="idea-card"><span class="idea-rank">0${index + 1}</span><div><h4>${escapeHTML(idea.name)}</h4><p>${escapeHTML(idea.offer)}</p><div class="idea-tags"><span>${escapeHTML(idea.workMode)}</span><span>Min. ${idea.minHours} jam/minggu</span><span>${idea.feasible ? "Cocok dijalankan" : "Perlu dilengkapi"}</span></div><small><strong>Langkah awal:</strong> ${escapeHTML(idea.firstStep)}</small></div></article>`).join("");
}

function fillReadinessForm() {
  $$("[data-profile]").forEach(input => {
    const field = input.dataset.profile;
    input.value = MONEY_FIELDS.includes(field) ? formatNumericInput(readinessProfile[field]) : readinessProfile[field];
  });
  $("#skills-grid").innerHTML = SKILLS.filter(skill => skill !== "Belum tahu").map(skill => `<label><input type="checkbox" name="skills" value="${escapeHTML(skill)}" ${readinessProfile.skills.includes(skill) ? "checked" : ""}><span>${escapeHTML(skill)}</span></label>`).join("");
}

function readReadinessForm() {
  const next = { ...readinessProfile };
  $$("[data-profile]").forEach(input => {
    const field = input.dataset.profile;
    next[field] = MONEY_FIELDS.includes(field) ? numericValue(input.value) : ["weeklyHours", "emergencyMonths"].includes(field) ? Number(input.value) : input.value;
  });
  next.skills = $$('input[name="skills"]:checked').map(input => input.value);
  if (!next.skills.length) next.skills = ["Belum tahu"];
  return next;
}

const HEALTH_FIELD_MAP = {
  "health-revenue": "revenue",
  "health-previous-revenue": "previousRevenue",
  "health-cogs": "cogs",
  "health-operating-expenses": "operatingExpenses",
  "health-cash-balance": "cashBalance",
  "health-receivables": "receivables",
  "health-inventory": "inventory",
  "health-debt-payments": "debtPayments",
  "health-owner-withdrawals": "ownerWithdrawals",
  "health-repeat-customer": "repeatCustomerPercent",
  "health-top-customer": "topCustomerPercent",
  "health-record-completeness": "recordCompletenessPercent",
};

function fillHealthForm() {
  $("#health-business-name").value = healthProfile.businessName;
  $("#health-period").value = healthProfile.period || getCurrentMonthKey();
  $("#health-sector").value = healthProfile.sector;
  for (const [id, field] of Object.entries(HEALTH_FIELD_MAP)) {
    const input = $(`#${id}`);
    input.value = HEALTH_NUMBER_FIELDS.includes(field) && !field.endsWith("Percent")
      ? formatNumericInput(healthProfile[field])
      : healthProfile[field];
  }
  $("#health-separate-finances").checked = healthProfile.separateFinances;
  $("#health-cash-plan").checked = healthProfile.cashPlan;
  $$('[data-health-evidence]').forEach(input => { input.checked = Boolean(healthProfile.evidence?.[input.dataset.healthEvidence]); });
}

function readHealthForm() {
  const next = { ...healthProfile };
  next.businessName = $("#health-business-name").value.trim() || "Usaha Saya";
  next.period = $("#health-period").value || getCurrentMonthKey();
  next.sector = $("#health-sector").value;
  for (const [id, field] of Object.entries(HEALTH_FIELD_MAP)) {
    const input = $(`#${id}`);
    next[field] = input.hasAttribute("data-health-money") ? numericValue(input.value) : Number(input.value) || 0;
  }
  next.separateFinances = $("#health-separate-finances").checked;
  next.cashPlan = $("#health-cash-plan").checked;
  next.evidence = Object.fromEntries($$('[data-health-evidence]').map(input => [input.dataset.healthEvidence, input.checked]));
  return sanitizeHealthProfile(next);
}

function renderHealth() {
  const hasProfile = hasStoredProfile(STORAGE.health);
  $("#health-example-note").hidden = hasProfile;
  $("#health-empty-panel").hidden = hasProfile;
  $(".health-results").hidden = !hasProfile;
  $(".health-bottom-grid").hidden = !hasProfile;
  const result = calculateHealth(healthProfile);
  const scoreCard = $("#health-score-card");
  scoreCard.className = `health-score-card ${result.status.tone}`;
  $("#health-score-ring").style.setProperty("--health-score", `${result.score * 3.6}deg`);
  $("#health-score").textContent = result.score;
  $("#health-status").textContent = result.status.label;
  $("#health-status").className = `result-status ${result.status.tone}`;
  $("#health-result-title").textContent = healthProfile.businessName;
  $("#health-summary").textContent = result.status.summary;
  $("#health-benchmark-note").textContent = `${result.benchmark.label}: ${result.benchmark.note}`;
  $("#health-data-warning").hidden = result.dataWarnings.length === 0;
  $("#health-data-warning").textContent = result.dataWarnings.slice(0, 2).join(" ");
  $("#health-gross-margin").textContent = formatPercent(result.metrics.grossMargin * 100);
  $("#health-operating-profit").textContent = formatRupiah(result.metrics.operatingProfit);
  $("#health-net-cash").textContent = formatRupiah(result.metrics.netCash);
  $("#health-net-cash").className = result.metrics.netCash < 0 ? "is-negative" : "";
  $("#health-runway").textContent = `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(result.metrics.cashRunway)} bulan`;
  const confidenceCard = $("#health-confidence-card");
  confidenceCard.className = `panel health-confidence-card ${result.confidence.tone}`;
  $("#health-confidence-label").textContent = result.confidence.label;
  $("#health-confidence-summary").textContent = result.confidence.summary;
  $("#health-confidence-score").textContent = `${result.confidence.percent}%`;
  $("#health-confidence-bar").style.width = `${result.confidence.percent}%`;
  $("#health-confidence-missing").textContent = result.confidence.missing.length
    ? `Belum didukung: ${result.confidence.missing.slice(0, 3).map(item => item.label).join(", ")}${result.confidence.missing.length > 3 ? `, dan ${result.confidence.missing.length - 3} lainnya` : ""}.`
    : "Semua bukti yang relevan sudah dikonfirmasi pengguna.";
  $("#health-pillars").innerHTML = result.pillars.map(pillar => `<div><span><strong>${escapeHTML(pillar.label)}</strong><b>${pillar.score}</b></span><div class="progress"><i class="${pillar.score < 50 ? "danger" : pillar.score < 65 ? "warning" : ""}" style="width:${pillar.score}%"></i></div></div>`).join("");
  $("#health-priorities").innerHTML = result.priorities.map((pillar, index) => `<li><span>0${index + 1}</span><div><strong>${escapeHTML(pillar.label)} · ${pillar.score}/100</strong><p>${escapeHTML(pillar.action)}</p></div></li>`).join("");
  $("#health-scenarios").innerHTML = healthScenarios(healthProfile).map(scenario => {
    const difference = scenario.result.score - result.score;
    return `<article><div><strong>${escapeHTML(scenario.label)}</strong><small>${escapeHTML(scenario.note)}</small></div><span><b>${scenario.result.score}</b><small>${difference > 0 ? `+${difference}` : difference} poin</small></span></article>`;
  }).join("");
  renderHealthHistory();
  renderHealthTrend();
}

function renderHealthHistory() {
  $("#health-history").innerHTML = healthHistory.length ? healthHistory.slice(0, 12).map(item => { const savedResult = item.profile ? calculateHealth(item.profile) : null; return `<article><div><strong>${escapeHTML(item.businessName)}</strong><small>${escapeHTML(item.period || "Tanpa periode")} · ${escapeHTML(savedResult?.benchmark.label || "Umum")} · keyakinan ${savedResult?.confidence.percent ?? 0}% · ${dateTimeText(item.at)}</small></div><span><b>${item.score}</b><small>${escapeHTML(item.status)}</small></span><button class="btn subtle" type="button" data-load-health="${escapeHTML(item.id)}">Buka</button></article>`; }).join("") : '<div class="empty-state compact">Belum ada hasil yang disimpan.</div>';
}

function renderHealthTrend() {
  const points = buildHealthTrend(healthHistory, healthProfile.businessName, healthProfile.sector);
  const trend = $("#health-trend");
  const summary = $("#health-trend-summary");
  const changeNode = $("#health-trend-change");
  if (!points.length) {
    trend.innerHTML = '<div class="empty-state compact">Belum ada periode tersimpan untuk usaha ini.</div>';
    summary.textContent = "Simpan minimal dua periode untuk melihat perubahan.";
    changeNode.textContent = "—";
    changeNode.className = "health-trend-change";
    return;
  }
  const latest = points.at(-1);
  const first = points[0];
  const totalChange = points.length > 1 ? latest.score - first.score : null;
  summary.textContent = points.length > 1
    ? `${points.length} periode dibandingkan, dari ${monthLabel(first.period, "short")} sampai ${monthLabel(latest.period, "short")}.`
    : "Simpan satu periode lain untuk mulai membandingkan perubahan.";
  changeNode.textContent = totalChange === null ? "1 periode" : `${totalChange > 0 ? "+" : ""}${totalChange} poin`;
  changeNode.className = `health-trend-change ${totalChange === null ? "" : totalChange > 0 ? "good" : totalChange < 0 ? "danger" : "neutral"}`;
  trend.innerHTML = points.map(point => `<article><div class="health-trend-bar" style="--score:${Math.max(point.score, 4)}%"><i style="height:${Math.max(point.score, 4)}%"></i><b>${point.score}</b></div><span>${escapeHTML(monthLabel(point.period, "short").replace(/\s\d{4}$/, ""))}</span><small>${escapeHTML(point.period.slice(0, 4))}</small></article>`).join("");
}

function saveHealthAudit() {
  const result = calculateHealth(healthProfile);
  healthHistory.unshift({ id: newId("health"), businessName: healthProfile.businessName, sector: healthProfile.sector, period: healthProfile.period, score: result.score, status: result.status.label, at: new Date().toISOString(), profile: clone(healthProfile) });
  healthHistory = healthHistory.slice(0, 24);
  if (!persistHealth()) return;
  renderHealthHistory();
  renderHealthTrend();
  showToast("Hasil SBB Health disimpan di perangkat ini.");
}

function renderDigital() {
  const config = adminState.digitalConfig;
  const assessment = calculateDigitalAssessment(config, digitalState);
  const questions = assessment.activeQuestions;
  digitalQuestionIndex = Math.min(Math.max(digitalQuestionIndex, 0), Math.max(questions.length - 1, 0));
  const question = questions[digitalQuestionIndex] || questions[0];
  const category = config.categories.find(item => item.id === question?.category);
  const answeredCount = assessment.answered;
  const progress = assessment.total ? Math.round((answeredCount / assessment.total) * 100) : 0;
  $("#digital-category-map").innerHTML = config.categories.map((item, index) => {
    const result = assessment.categoryResults.find(resultItem => resultItem.id === item.id);
    return '<article class="' + (item.id === question?.category && digitalState.profile.completed && !digitalState.completed ? "is-current" : "") + '"><span>' + String(index + 1).padStart(2, "0") + '</span><div><strong>' + escapeHTML(item.title) + '</strong><p>' + escapeHTML(item.description) + '</p>' + (digitalState.completed && result ? '<small>Kesiapan ' + result.readiness + '%</small>' : "") + '</div></article>';
  }).join("");
  const profileComplete = digitalState.profile.completed;
  $(".digital-map-panel").hidden = !profileComplete || digitalProfileEditing;
  $("#digital-profile-setup").hidden = profileComplete && !digitalProfileEditing;
  $("#digital-assessment").hidden = !profileComplete || digitalState.completed || digitalProfileEditing;
  $("#digital-results").hidden = !digitalState.completed || digitalProfileEditing;
  fillDigitalProfileForm();
  if (!profileComplete || digitalProfileEditing) {
    $("#digital-step-label").textContent = "Lengkapi profil untuk mulai";
    $("#digital-progress-value").textContent = "0%";
    $("#digital-progress-bar").style.width = "4%";
    $("#digital-assessment-context").innerHTML = "";
    return;
  }
  $("#digital-assessment-context").innerHTML = [
    [DIGITAL_PROFILE_OPTIONS.stages, digitalState.profile.stage],
    [DIGITAL_PROFILE_OPTIONS.models, digitalState.profile.model],
    [DIGITAL_PROFILE_OPTIONS.goals, digitalState.profile.goal],
    [DIGITAL_PROFILE_OPTIONS.channels, digitalState.profile.channel],
  ].map(([options, value]) => '<span>' + escapeHTML(options.find(item => item.value === value)?.label || value) + '</span>').join("");
  if (!digitalState.completed) {
    $("#digital-step-label").textContent = "Pertanyaan " + (digitalQuestionIndex + 1) + " dari " + questions.length;
    $("#digital-progress-value").textContent = progress + "% terjawab";
    $("#digital-progress-bar").style.width = Math.max(progress, 4) + "%";
    $("#digital-question-category").textContent = category?.title || "SBB Digital";
    $("#digital-question-text").textContent = question?.text || "Belum ada pertanyaan yang cocok dengan profil ini.";
    $("#digital-question-evidence").textContent = question?.evidence || "Pilih jawaban berdasarkan bukti yang benar-benar tersedia.";
    $("#digital-answer-options").innerHTML = question ? DIGITAL_ANSWER_OPTIONS.map(option => '<button type="button" data-digital-answer="' + option.value + '" class="' + (digitalState.answers[question.id] === option.value ? "is-selected" : "") + '"><span>' + (option.value === 0 ? "○" : option.value === 1 ? "◐" : option.value === 2 ? "●" : "◆") + '</span><div><strong>' + escapeHTML(option.label) + '</strong><small>' + escapeHTML(option.hint) + '</small></div></button>').join("") : "";
    $("#digital-prev").disabled = digitalQuestionIndex === 0;
    $("#digital-next").textContent = digitalQuestionIndex === questions.length - 1 ? "Lihat hasil" : config.startLabel;
    $("#digital-next").disabled = !question || !Object.hasOwn(digitalState.answers, question.id);
    return;
  }
  const priority = assessment.priority;
  $("#digital-result-title").textContent = config.resultTitle;
  $("#digital-overall-readiness").textContent = assessment.overallReadiness + "/100";
  $("#digital-maturity-label").textContent = assessment.maturity.label;
  $("#digital-maturity-summary").textContent = assessment.maturity.summary;
  $("#digital-result-summary").textContent = assessment.checklist.length
    ? "Fokus utama saat ini adalah " + priority.title + ". Selesaikan kebutuhan terpenting terlebih dahulu sebelum menambah kanal atau alat baru."
    : "Fondasi digital utama sudah berjalan baik. Pertahankan konsistensi dan tinjau kembali secara berkala.";
  $("#digital-signal-list").innerHTML = assessment.signals.length ? assessment.signals.map(signal => '<li class="' + signal.tone + '">' + escapeHTML(signal.text) + '</li>').join("") : '<li class="neutral">Belum ada sinyal angka yang perlu diwaspadai.</li>';
  $("#digital-result-cards").innerHTML = assessment.categoryResults.map(item => `<article class="digital-result-card ${item.level}"><div><span>${escapeHTML(item.levelLabel)}</span><b>${item.readiness}%</b></div><h4>${escapeHTML(item.title)}</h4><p>${escapeHTML(item.description)}</p><div class="progress"><i style="width:${item.readiness}%"></i></div></article>`).join("");
  $("#digital-checklist-title").textContent = config.checklistTitle;
  $("#digital-checklist-count").textContent = assessment.checklist.length;
  $("#digital-checklist").innerHTML = assessment.checklist.length ? assessment.checklist.map((item, index) => `<label><input type="checkbox"><span><small>${escapeHTML(item.categoryTitle)}</small><strong>${escapeHTML(item.checklist)}</strong></span><b>${String(index + 1).padStart(2, "0")}</b></label>`).join("") : '<div class="empty-state compact">Tidak ada langkah mendesak. Jadwalkan pemeriksaan ulang bulan depan.</div>';
  $("#digital-90-day-plan").innerHTML = assessment.phases.map(phase => `<article><div><span>${escapeHTML(phase.label)}</span><strong>${escapeHTML(phase.focus)}</strong></div><ol>${phase.items.map(item => `<li><small>${escapeHTML(item.categoryTitle || "Fondasi digital")}</small>${escapeHTML(item.checklist)}</li>`).join("") || "<li>Tidak ada tindakan tambahan.</li>"}</ol></article>`).join("");
  const budgetText = (minimum, maximum) => `${formatRupiah(minimum)}–${formatRupiah(Math.max(maximum, minimum))}`;
  $("#digital-budget-self").textContent = budgetText(assessment.budget.selfMin, assessment.budget.selfMax);
  $("#digital-budget-help").textContent = budgetText(assessment.budget.helpMin, assessment.budget.helpMax);
  $("#digital-brief").innerHTML = `<dl><div><dt>Usaha</dt><dd>${escapeHTML(healthProfile.businessName || "Usaha saya")}</dd></div><div><dt>Prioritas</dt><dd>${escapeHTML(priority?.title || "Fondasi digital")}</dd></div><div><dt>Tujuan</dt><dd>${escapeHTML(assessment.brief.objective)}</dd></div><div><dt>Kondisi saat ini</dt><dd>${escapeHTML(assessment.brief.currentCondition)}</dd></div><div><dt>Ukuran keberhasilan</dt><dd>${escapeHTML(assessment.brief.successMetric)}</dd></div></dl>`;
  $("#digital-whatsapp").textContent = config.consultationLabel;
  $("#digital-whatsapp").title = config.whatsappNumber ? "Buka percakapan WhatsApp" : "Nomor konsultasi belum diatur Admin";
}

function selectDigitalAnswer(value) {
  const question = activeDigitalQuestions()[digitalQuestionIndex];
  if (!question) return;
  digitalState.answers[question.id] = Number(value);
  digitalState.completed = false;
  if (!persistDigital()) return;
  renderDigital();
}

function moveDigitalQuestion(direction) {
  const questions = activeDigitalQuestions();
  const current = questions[digitalQuestionIndex];
  if (!current) return;
  if (direction > 0 && !Object.hasOwn(digitalState.answers, current.id)) return showToast("Pilih satu jawaban terlebih dahulu.");
  if (direction > 0 && digitalQuestionIndex === questions.length - 1) {
    digitalState.completed = questions.length > 0 && questions.every(item => Object.hasOwn(digitalState.answers, item.id));
    if (!persistDigital()) return;
    renderDigital();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  digitalQuestionIndex = Math.min(Math.max(digitalQuestionIndex + direction, 0), questions.length - 1);
  renderDigital();
}

function restartDigitalAssessment() {
  digitalState = sanitizeDigitalState({ profile: digitalState.profile }, adminState.digitalConfig);
  digitalQuestionIndex = 0;
  digitalProfileEditing = false;
  if (!persistDigital()) return;
  renderDigital();
}

function submitDigitalProfile() {
  digitalState = sanitizeDigitalState({ profile: readDigitalProfileForm(), answers: digitalState.answers, completed: false }, adminState.digitalConfig);
  digitalQuestionIndex = firstUnansweredDigitalIndex();
  digitalProfileEditing = false;
  if (!persistDigital()) return;
  renderDigital();
  document.querySelector("#digital-assessment")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openDigitalConsultation() {
  const config = adminState.digitalConfig;
  if (!config.whatsappNumber) return showToast("Nomor konsultasi belum diatur oleh Admin.");
  const result = calculateDigitalAssessment(config, digitalState);
  const message = buildDigitalWhatsappMessage(config.whatsappMessage, healthProfile.businessName, result.priority?.title);
  window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

async function copyDigitalBrief() {
  if (!digitalState.completed) return showToast("Selesaikan pemeriksaan digital terlebih dahulu.");
  const assessment = calculateDigitalAssessment(adminState.digitalConfig, digitalState);
  const brief = buildDigitalBrief(assessment, healthProfile.businessName);
  try {
    await navigator.clipboard.writeText(brief);
    showToast("Brief SBB Digital berhasil disalin.");
  } catch {
    showToast("Brief belum dapat disalin. Coba lagi melalui browser utama.");
  }
}

function renderAdmin() {
  if (session?.role !== "admin") return;
  const metrics = licenseMetrics(adminState.codes, adminState.users);
  $("#admin-available").textContent = metrics.available;
  $("#admin-used").textContent = metrics.used;
  $("#admin-active-users").textContent = metrics.activeUsers;
  $("#admin-attention").textContent = metrics.revokedOrExpired;
  $("#plan-distribution").innerHTML = adminState.plans.map(plan => {
    const count = adminState.codes.filter(code => code.plan === plan.name).length;
    const width = adminState.codes.length ? count / adminState.codes.length * 100 : 0;
    return `<div><span><strong>${escapeHTML(plan.name)}</strong><small>${count} kode</small></span><div class="progress"><i style="width:${width}%"></i></div></div>`;
  }).join("");
  $("#recent-audit").innerHTML = adminState.audit.slice(0, 4).map(log => `<div><i></i><span><strong>${escapeHTML(log.action)}</strong><small>${dateTimeText(log.at)} · ${escapeHTML(log.actor)}</small></span></div>`).join("") || '<div class="empty-state compact">Belum ada aktivitas.</div>';
  renderCodes();
  renderUsers();
  renderPlans();
  renderPageContentEditor();
  renderBenefitsEditor();
  renderDigitalAdmin();
  renderVisualSettings();
  renderIntegrationSettings();
  renderAppSettings();
  renderAudit();
}

function renderCodes() {
  const query = ($("#code-search")?.value || "").toLowerCase();
  const codes = adminState.codes.filter(item => `${item.code} ${item.plan}`.toLowerCase().includes(query));
  $("#code-list").innerHTML = codes.map(item => {
    const state = licenseState(item);
    return `<tr><td><button class="code-copy" data-copy-code="${escapeHTML(item.code)}"><code>${escapeHTML(item.code)}</code><small>Salin</small></button></td><td><strong>${escapeHTML(item.plan)}</strong></td><td><span class="tag ${statusClass(state)}">${statusLabel(state)}</span></td><td>${item.activations}/${item.maxActivations}</td><td>${dateText(item.expiresAt)}</td><td><button class="table-action" data-toggle-code="${escapeHTML(item.id)}">${state === "revoked" ? "Aktifkan" : "Cabut"}</button></td></tr>`;
  }).join("") || '<tr><td colspan="6"><div class="empty-state">Kode tidak ditemukan.</div></td></tr>';
}

function renderUsers() {
  const query = ($("#user-search")?.value || "").toLowerCase();
  const users = adminState.users.filter(item => `${item.name} ${item.email}`.toLowerCase().includes(query));
  $("#user-list").innerHTML = users.map(user => `<tr><td><div class="person"><span>${user.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("")}</span><div><strong>${escapeHTML(user.name)}</strong><small>${escapeHTML(user.email)}</small></div></div></td><td>${escapeHTML(user.plan)}</td><td><span class="tag ${user.status === "active" ? "good" : "danger"}">${user.status === "active" ? "Aktif" : "Ditangguhkan"}</span></td><td><code>${escapeHTML(user.code)}</code></td><td>${dateText(user.lastSeen)}</td><td><button class="table-action" data-toggle-user="${escapeHTML(user.id)}">${user.status === "active" ? "Tangguhkan" : "Aktifkan"}</button></td></tr>`).join("");
}

function renderPlans() {
  $("#plan-cards").innerHTML = adminState.plans.map((plan, index) => `<article class="panel plan-card"><div class="plan-card-head"><span class="plan-icon">${escapeHTML(plan.name.slice(0, 1))}</span><span class="tag ${plan.name === "Pro" ? "good" : "neutral"}">${plan.name === "Pro" ? "Terpopuler" : plan.duration}</span></div><h3>${escapeHTML(plan.name)}</h3><label>Harga <small>Rp</small><input data-plan-price="${index}" inputmode="numeric" value="${formatNumericInput(plan.price)}"></label><label>Durasi<input data-plan-duration="${index}" value="${escapeHTML(plan.duration)}"></label><label>Deskripsi<textarea data-plan-description="${index}" rows="3">${escapeHTML(plan.description)}</textarea></label><div class="feature-list"><span>✓ Atur Uang</span><span>${plan.readiness ? "✓" : "—"} SBB Start</span><span>✓ ${plan.devices} perangkat</span></div><button class="btn secondary wide" data-save-plan="${index}">Simpan paket</button></article>`).join("");
}

function contentEditorField(path, label, value, rows = 2) {
  const id = `content-${path.replaceAll(".", "-")}`;
  return `<label for="${id}"><span>${escapeHTML(label)}</span><textarea id="${id}" data-benefits-field="${escapeHTML(path)}" rows="${rows}" maxlength="4000">${escapeHTML(value)}</textarea></label>`;
}

function pageContentField(path, label, value, rows = 2) {
  const fieldId = `page-content-${path.replaceAll(".", "-")}`;
  return `<label for="${fieldId}"><span>${escapeHTML(label)}</span><textarea id="${fieldId}" data-page-content-field="${escapeHTML(path)}" rows="${rows}" maxlength="4000">${escapeHTML(value)}</textarea></label>`;
}

function renderPageContentEditor() {
  const pages = adminState.pageContent;
  const groups = [
    ["overview", "Ringkasan", "Headline pembuka dan arahan singkat halaman ringkasan.", [
      ["label", "Label atas"], ["title", "Headline header"], ["headline", "Judul pembuka"], ["subheadline", "Subheadline", 3],
    ]],
    ["money", "Atur Uang", "Judul utama hanya tampil di header agar tidak berulang di isi halaman.", [
      ["label", "Label atas"], ["title", "Headline header"], ["subheadline", "Subheadline", 3], ["localSaveTitle", "Judul status penyimpanan"], ["localSaveNote", "Keterangan status penyimpanan"],
    ]],
    ["readiness", "SBB Start", "Headline tampil di header; badan halaman langsung berisi arahan dan formulir.", [
      ["label", "Label atas"], ["title", "Headline header"], ["subheadline", "Subheadline", 3], ["syncButton", "Teks tombol ambil data"], ["localSaveTitle", "Judul status penyimpanan"], ["localSaveNote", "Keterangan status penyimpanan"],
    ]],
    ["business", "SBB Business", "Headline dan subheadline diterapkan juga ke halaman kalkulator di dalam aplikasi.", [
      ["label", "Label atas"], ["title", "Headline header"], ["headline", "Judul kalkulator"], ["subheadline", "Subheadline", 3],
    ]],
    ["health", "SBB Health", "Pembuka pemeriksaan kesehatan untuk bisnis yang sudah berjalan.", [
      ["label", "Label atas"], ["title", "Headline header"], ["headline", "Judul pembuka"], ["subheadline", "Subheadline", 3],
    ]],
    ["digital", "SBB Digital", "Pembuka pemeriksaan kebutuhan digital yang dilihat pengguna.", [
      ["label", "Label atas"], ["title", "Headline header"], ["headline", "Judul pembuka"], ["subheadline", "Subheadline", 3],
    ]],
    ["benefits", "About Us", "Judul pembuka halaman manfaat; rincian bagian lain tetap ada di tab About Us.", [
      ["label", "Label atas"], ["title", "Headline header"], ["headline", "Judul pembuka"], ["subheadline", "Subheadline", 3],
    ]],
    ["policies", "Ketentuan & Privasi", "Judul dan penjelasan pembuka ketentuan pengguna.", [
      ["label", "Label atas"], ["title", "Headline header"], ["headline", "Judul pembuka"], ["subheadline", "Subheadline", 3],
    ]],
    ["admin", "Admin", "Konteks pembuka yang hanya terlihat oleh akun Admin.", [
      ["label", "Label atas"], ["title", "Headline header"], ["subheadline", "Subheadline", 3],
    ]],
  ];
  $("#page-content-editor").innerHTML = groups.map(([key, title, description, fields], index) => `
    <section class="panel content-editor-section"><div class="content-section-title"><span>${String(index + 1).padStart(2, "0")}</span><div><h4>${escapeHTML(title)}</h4><p>${escapeHTML(description)}</p></div></div><div class="content-fields two">
      ${fields.map(([field, label, rows]) => pageContentField(`${key}.${field}`, label, pages[key][field], rows || 2)).join("")}
    </div></section>`).join("");
}

function applyBusinessContent() {
  const frame = $(".business-frame");
  const documentRoot = frame?.contentDocument;
  if (!documentRoot) return;
  const content = adminState.pageContent.business;
  const headline = documentRoot.querySelector(".calculator-header h1");
  const subheadline = documentRoot.querySelector(".calculator-header p:last-child");
  if (headline) headline.textContent = content.headline;
  if (subheadline) subheadline.textContent = content.subheadline;
}

function resizeBusinessFrame() {
  const frame = $(".business-frame");
  const documentRoot = frame?.contentDocument;
  if (!frame || !documentRoot) return;
  const calculatorPage = documentRoot.querySelector(".calculator-page");
  const height = Math.max(calculatorPage?.scrollHeight || 0, 720);
  frame.style.height = `${height}px`;
}

function observeBusinessFrame() {
  const frame = $(".business-frame");
  const documentRoot = frame?.contentDocument;
  if (!frame || !documentRoot) return;
  businessResizeObserver?.disconnect();
  businessResizeObserver = new ResizeObserver(() => resizeBusinessFrame());
  businessResizeObserver.observe(documentRoot.querySelector(".calculator-page") || documentRoot.body);
  applyBusinessContent();
  resizeBusinessFrame();
}

function applyPageContent() {
  const activeRoute = $(".page.is-active")?.dataset.page || "overview";
  const activeContent = adminState.pageContent[activeRoute] || DEFAULT_PAGE_CONTENT[activeRoute];
  if (activeContent) {
    $("#breadcrumb").textContent = activeContent.label;
    $("#page-title").textContent = activeContent.title;
  }
  const mappings = [
    ["#overview-context-headline", "overview", "headline"],
    ["#overview-context-copy", "overview", "subheadline"],
    ["#money-context-copy", "money", "subheadline"],
    ["#money-local-save-title", "money", "localSaveTitle"],
    ["#money-local-save-note", "money", "localSaveNote"],
    ["#readiness-context-copy", "readiness", "subheadline"],
    ["#readiness-local-save-title", "readiness", "localSaveTitle"],
    ["#readiness-local-save-note", "readiness", "localSaveNote"],
    ["#sync-money", "readiness", "syncButton"],
    ["#health-context-headline", "health", "headline"],
    ["#health-context-copy", "health", "subheadline"],
    ["#digital-context-headline", "digital", "headline"],
    ["#digital-context-copy", "digital", "subheadline"],
    ["#policies-context-headline", "policies", "headline"],
    ["#policies-context-copy", "policies", "subheadline"],
    ["#admin-context-copy", "admin", "subheadline"],
  ];
  for (const [selector, page, field] of mappings) {
    const node = $(selector);
    if (node) node.textContent = adminState.pageContent[page][field];
  }
  applyBusinessContent();
  const localBadge = $(".digital-local-badge");
  if (localBadge) localBadge.textContent = adminState.digitalConfig.localNote;
}

function savePageContent() {
  const next = clone(DEFAULT_PAGE_CONTENT);
  $$('[data-page-content-field]').forEach(field => setEditableContentValue(next, field.dataset.pageContentField, field.value.trim()));
  adminState.pageContent = mergeEditableContent(DEFAULT_PAGE_CONTENT, next);
  adminState.benefitsContent.hero.title = adminState.pageContent.benefits.headline;
  adminState.benefitsContent.hero.intro = adminState.pageContent.benefits.subheadline;
  addAudit("Konteks semua halaman diperbarui");
  if (!persistAdmin()) return;
  applyPageContent();
  renderBenefits();
  renderAdmin();
  showToast("Headline dan subheadline semua halaman berhasil diperbarui.");
}

function renderBenefitsEditor() {
  const content = adminState.benefitsContent;
  $("#sbb-content-editor").innerHTML = `
    <section class="panel content-editor-section"><div class="content-section-title"><span>01</span><div><h4>Pembuka halaman</h4><p>Judul utama, pengantar, tombol, dan prinsip SBB.</p></div></div><div class="content-fields two">
      ${contentEditorField("hero.eyebrow", "Label atas", content.hero.eyebrow, 1)}
      ${contentEditorField("hero.title", "Judul utama", content.hero.title)}
      ${contentEditorField("hero.intro", "Pengantar", content.hero.intro, 3)}
      ${contentEditorField("hero.primaryCta", "Teks tombol Atur Uang", content.hero.primaryCta, 1)}
      ${contentEditorField("hero.secondaryCta", "Teks tombol SBB Start", content.hero.secondaryCta, 1)}
      ${contentEditorField("hero.principleLabel", "Label prinsip", content.hero.principleLabel, 1)}
      ${contentEditorField("hero.principleTitle", "Judul prinsip", content.hero.principleTitle)}
      ${contentEditorField("hero.principleBody", "Penjelasan prinsip", content.hero.principleBody, 3)}
    </div></section>
    <section class="panel content-editor-section"><div class="content-section-title"><span>02</span><div><h4>Manfaat utama</h4><p>Enam manfaat yang langsung dilihat pengguna.</p></div></div><div class="content-card-editor">
      ${content.benefits.map((item, index) => `<fieldset><legend>Manfaat ${index + 1}</legend>${contentEditorField(`benefits.${index}.title`, "Judul", item.title)}${contentEditorField(`benefits.${index}.body`, "Penjelasan", item.body, 3)}</fieldset>`).join("")}
    </div></section>
    <section class="panel content-editor-section"><div class="content-section-title"><span>03</span><div><h4>Ekosistem SBB</h4><p>Payung merek dan peran setiap bagian untuk pengguna.</p></div></div><div class="content-fields two">
      ${contentEditorField("ecosystem.eyebrow", "Label atas", content.ecosystem.eyebrow, 1)}
      ${contentEditorField("ecosystem.badge", "Label status", content.ecosystem.badge, 1)}
      ${contentEditorField("ecosystem.nameHeader", "Judul kolom nama", content.ecosystem.nameHeader, 1)}
      ${contentEditorField("ecosystem.roleHeader", "Judul kolom peran", content.ecosystem.roleHeader, 1)}
      ${contentEditorField("ecosystem.title", "Judul", content.ecosystem.title)}
      ${contentEditorField("ecosystem.intro", "Pengantar", content.ecosystem.intro, 3)}
    </div><div class="content-card-editor ecosystem-editors">
      ${content.ecosystem.rows.map((item, index) => `<fieldset><legend>Bagian ${index + 1}</legend>${contentEditorField(`ecosystem.rows.${index}.name`, "Nama", item.name)}${contentEditorField(`ecosystem.rows.${index}.role`, "Peran untuk pengguna", item.role, 3)}</fieldset>`).join("")}
    </div></section>
    <section class="panel content-editor-section"><div class="content-section-title"><span>04</span><div><h4>Perjalanan pengguna</h4><p>Alur dari merapikan keuangan sampai mengembangkan bisnis.</p></div></div><div class="content-fields two">
      ${contentEditorField("journey.eyebrow", "Label atas", content.journey.eyebrow, 1)}
      ${contentEditorField("journey.title", "Judul", content.journey.title)}
      ${contentEditorField("journey.intro", "Pengantar", content.journey.intro, 3)}
    </div><div class="content-card-editor">
      ${content.journey.steps.map((item, index) => `<fieldset><legend>Tahap ${index + 1}</legend>${contentEditorField(`journey.steps.${index}.label`, "Label", item.label, 1)}${contentEditorField(`journey.steps.${index}.title`, "Judul", item.title)}${contentEditorField(`journey.steps.${index}.body`, "Penjelasan", item.body, 3)}</fieldset>`).join("")}
    </div></section>
    <section class="panel content-editor-section"><div class="content-section-title"><span>05</span><div><h4>Batas kalkulator</h4><p>Penjelasan agar pengguna memahami fungsi hasil perhitungan.</p></div></div><div class="content-fields two">
      ${contentEditorField("scope.eyebrow", "Label atas", content.scope.eyebrow, 1)}
      ${contentEditorField("scope.title", "Judul", content.scope.title)}
      ${contentEditorField("scope.body", "Penjelasan", content.scope.body, 4)}
    </div></section>
    <section class="panel content-editor-section"><div class="content-section-title"><span>06</span><div><h4>About Us</h4><p>Penjelasan singkat tentang SBB dari sudut pandang pengguna.</p></div></div><div class="content-fields two">
      ${contentEditorField("about.eyebrow", "Label atas", content.about.eyebrow, 1)}
      ${contentEditorField("about.title", "Judul", content.about.title)}
      ${contentEditorField("about.body", "Tentang SBB", content.about.body, 4)}
      ${contentEditorField("about.beliefTitle", "Judul keyakinan", content.about.beliefTitle)}
      ${contentEditorField("about.beliefBody", "Penjelasan keyakinan", content.about.beliefBody, 4)}
      ${contentEditorField("about.approachTitle", "Judul cara mendampingi", content.about.approachTitle)}
      ${contentEditorField("about.approachBody", "Penjelasan cara mendampingi", content.about.approachBody, 4)}
    </div></section>`;
}

function digitalContentField(path, label, value, rows = 2, type = "textarea") {
  const id = `digital-content-${path.replaceAll(".", "-")}`;
  if (type === "tel") return `<label for="${id}"><span>${escapeHTML(label)}</span><input id="${id}" data-digital-content-field="${escapeHTML(path)}" type="tel" inputmode="numeric" value="${escapeHTML(value)}" maxlength="20"></label>`;
  if (type === "number") return `<label for="${id}"><span>${escapeHTML(label)}</span><input id="${id}" data-digital-content-field="${escapeHTML(path)}" type="number" min="0" max="1000000000" step="100000" value="${escapeHTML(value)}"></label>`;
  return `<label for="${id}"><span>${escapeHTML(label)}</span><textarea id="${id}" data-digital-content-field="${escapeHTML(path)}" rows="${rows}" maxlength="1000">${escapeHTML(value)}</textarea></label>`;
}

function renderDigitalAdmin() {
  const content = adminState.digitalConfig;
  $("#digital-content-editor").innerHTML = `
    <section class="panel content-editor-section"><div class="content-section-title"><span>01</span><div><h4>Tampilan dan konsultasi</h4><p>Atur teks hasil, catatan lokal, dan WhatsApp. Gunakan format internasional tanpa tanda +, misalnya 62812...</p></div></div><div class="content-fields two">
      ${digitalContentField("localNote", "Catatan penyimpanan lokal", content.localNote)}
      ${digitalContentField("startLabel", "Teks tombol berikutnya", content.startLabel)}
      ${digitalContentField("resultTitle", "Judul hasil", content.resultTitle)}
      ${digitalContentField("checklistTitle", "Judul checklist", content.checklistTitle)}
      ${digitalContentField("consultationLabel", "Teks tombol konsultasi", content.consultationLabel)}
      ${digitalContentField("whatsappNumber", "Nomor WhatsApp", content.whatsappNumber, 1, "tel")}
      ${digitalContentField("whatsappMessage", "Pesan WhatsApp", content.whatsappMessage, 4)}
    </div></section>
    <section class="panel content-editor-section"><div class="content-section-title"><span>02</span><div><h4>Enam area digital</h4><p>Nama, tujuan, ukuran keberhasilan, dan kisaran anggaran tiap area dapat disesuaikan.</p></div></div><div class="content-card-editor">
      ${content.categories.map((item, index) => `<fieldset><legend>Area ${index + 1}</legend>${digitalContentField(`categories.${index}.title`, "Nama area", item.title)}${digitalContentField(`categories.${index}.description`, "Penjelasan", item.description, 3)}${digitalContentField(`categories.${index}.objective`, "Tujuan rencana", item.objective, 3)}${digitalContentField(`categories.${index}.successMetric`, "Ukuran keberhasilan", item.successMetric, 3)}${digitalContentField(`categories.${index}.selfBudgetMin`, "Anggaran mandiri minimum", item.selfBudgetMin, 1, "number")}${digitalContentField(`categories.${index}.selfBudgetMax`, "Anggaran mandiri maksimum", item.selfBudgetMax, 1, "number")}${digitalContentField(`categories.${index}.helpBudgetMin`, "Anggaran bantuan minimum", item.helpBudgetMin, 1, "number")}${digitalContentField(`categories.${index}.helpBudgetMax`, "Anggaran bantuan maksimum", item.helpBudgetMax, 1, "number")}</fieldset>`).join("")}
    </div></section>
    <section class="panel content-editor-section"><div class="content-section-title"><span>03</span><div><h4>Pertanyaan adaptif dan arahan</h4><p>Edit pertanyaan, bukti jawaban, serta checklist. Sebagian pertanyaan muncul hanya bila sesuai profil usaha.</p></div></div><div class="content-card-editor digital-question-editors">
      ${content.questions.map((item, index) => `<fieldset><legend>Pertanyaan ${index + 1} · ${escapeHTML(content.categories.find(category => category.id === item.category)?.title || item.category)}</legend>${digitalContentField(`questions.${index}.text`, "Pertanyaan", item.text, 3)}${digitalContentField(`questions.${index}.evidence`, "Bukti jawaban kuat", item.evidence, 3)}${digitalContentField(`questions.${index}.checklist`, "Arahan checklist", item.checklist, 4)}</fieldset>`).join("")}
    </div></section>`;
}

function saveDigitalContent() {
  const next = clone(adminState.digitalConfig);
  $$('[data-digital-content-field]').forEach(field => setEditableContentValue(next, field.dataset.digitalContentField, field.value.trim()));
  adminState.digitalConfig = sanitizeDigitalConfig(next);
  digitalState = sanitizeDigitalState(digitalState, adminState.digitalConfig);
  digitalQuestionIndex = firstUnansweredDigitalIndex();
  digitalProfileEditing = !digitalState.profile.completed;
  addAudit("Konten SBB Digital diperbarui");
  if (!persistEntries([[STORAGE.admin, adminState], [STORAGE.digital, digitalState]])) return;
  renderDigital();
  renderAdmin();
  showToast("Konten SBB Digital berhasil diperbarui.");
}

function setEditableContentValue(target, path, value) {
  const parts = path.split(".");
  const finalKey = parts.pop();
  let cursor = target;
  for (const part of parts) cursor = cursor[Number.isInteger(Number(part)) && part !== "" ? Number(part) : part];
  cursor[Number.isInteger(Number(finalKey)) && finalKey !== "" ? Number(finalKey) : finalKey] = value;
}

function renderBenefits() {
  const current = $('[data-page="benefits"]');
  if (!current) return;
  const active = !current.hidden;
  const template = document.createElement("template");
  template.innerHTML = benefitsMarkup().trim();
  const next = template.content.firstElementChild;
  next.hidden = !active;
  next.classList.toggle("is-active", active);
  current.replaceWith(next);
}

function saveBenefitsContent() {
  const next = clone(DEFAULT_BENEFITS_CONTENT);
  $$('[data-benefits-field]').forEach(field => setEditableContentValue(next, field.dataset.benefitsField, field.value.trim()));
  adminState.benefitsContent = mergeEditableContent(DEFAULT_BENEFITS_CONTENT, next);
  adminState.pageContent.benefits.headline = adminState.benefitsContent.hero.title;
  adminState.pageContent.benefits.subheadline = adminState.benefitsContent.hero.intro;
  addAudit("Konten halaman About Us diperbarui");
  if (!persistAdmin()) return;
  renderBenefits();
  renderAdmin();
  showToast("Halaman About Us berhasil diperbarui.");
}

function renderVisualSettings() {
  applyVisualSettings();
  const visuals = currentVisuals();
  pendingVisualAssets = { ...DEFAULT_VISUAL_ASSETS, ...(visuals.assets || {}) };
  $("#visual-primary").value = safeHex(visuals.primaryColor, DEFAULT_ADMIN.settings.visuals.primaryColor);
  $("#visual-sidebar").value = safeHex(visuals.sidebarColor, DEFAULT_ADMIN.settings.visuals.sidebarColor);
  $("#visual-accent").value = safeHex(visuals.accentColor, DEFAULT_ADMIN.settings.visuals.accentColor);
  $("#visual-canvas").value = safeHex(visuals.canvasColor, DEFAULT_ADMIN.settings.visuals.canvasColor);
  $("#visual-density").value = visuals.density === "compact" ? "compact" : "comfortable";
  $("#visual-radius").value = visuals.radius;
  $("#visual-logo-size").value = visuals.logoSize;
  $("#visual-gate-logo-size").value = visuals.gateLogoSize;
  $("#visual-logo-treatment").value = visuals.logoTreatment === "original" ? "original" : "white";
  $("#visual-icon-size").value = visuals.iconSize;
  $("#visual-icon-stroke").value = visuals.iconStroke;
  $("#visual-font-scale").value = visuals.fontScale;
  $("#visual-prototype-badge").checked = visuals.showPrototypeBadge !== false;
  $$('[data-visual-icon]').forEach(select => {
    const selected = visuals.navIcons[select.dataset.visualIcon];
    select.value = NAV_ICON_PATHS[selected] ? selected : DEFAULT_NAV_ICONS[select.dataset.visualIcon];
  });
  renderVisualAssetPreviews(visuals);
}

function visualAssetSources(visuals) {
  const assets = { ...DEFAULT_VISUAL_ASSETS, ...(visuals.assets || {}) };
  const mainLogo = safeImageData(assets.mainLogo) || "./sbb-logo.png";
  const favicon = safeImageData(assets.favicon) || "./icon-192.png";
  return {
    mainLogo,
    gateLogo: safeImageData(assets.gateLogo) || mainLogo,
    sidebarLogo: safeImageData(assets.sidebarLogo) || mainLogo,
    favicon,
    appIcon: safeImageData(assets.appIcon) || favicon,
  };
}

function renderVisualAssetPreviews(visuals = visualSettingsFromForm()) {
  const sources = visualAssetSources(visuals);
  for (const key of Object.keys(DEFAULT_VISUAL_ASSETS)) {
    const preview = $(`#visual-preview-${key}`);
    if (preview) preview.src = sources[key];
    const isCustom = Boolean(safeImageData(visuals.assets?.[key]));
    const status = $(`#visual-status-${key}`);
    if (status) status.textContent = isCustom
      ? "File khusus dipilih"
      : ["gateLogo", "sidebarLogo"].includes(key)
        ? "Mengikuti Logo Utama"
        : key === "appIcon"
          ? "Mengikuti ikon tab browser"
          : "Menggunakan bawaan";
    const clear = $(`[data-clear-visual-asset="${key}"]`);
    if (clear) clear.disabled = !isCustom;
  }
  if ($("#visual-preview-effective-logo")) $("#visual-preview-effective-logo").src = sources.mainLogo;
  if ($("#visual-preview-effective-favicon")) $("#visual-preview-effective-favicon").src = sources.favicon;
  if ($("#visual-preview-effective-app-icon")) $("#visual-preview-effective-app-icon").src = sources.appIcon;
}

function visualSettingsFromForm() {
  const navIcons = Object.fromEntries($$('[data-visual-icon]').map(select => {
    const value = NAV_ICON_PATHS[select.value] ? select.value : DEFAULT_NAV_ICONS[select.dataset.visualIcon];
    return [select.dataset.visualIcon, value];
  }));
  return {
    primaryColor: safeHex($("#visual-primary").value, DEFAULT_ADMIN.settings.visuals.primaryColor),
    sidebarColor: safeHex($("#visual-sidebar").value, DEFAULT_ADMIN.settings.visuals.sidebarColor),
    accentColor: safeHex($("#visual-accent").value, DEFAULT_ADMIN.settings.visuals.accentColor),
    canvasColor: safeHex($("#visual-canvas").value, DEFAULT_ADMIN.settings.visuals.canvasColor),
    density: $("#visual-density").value === "compact" ? "compact" : "comfortable",
    radius: Math.min(Math.max(Number($("#visual-radius").value) || 10, 4), 24),
    logoSize: Math.min(Math.max(Number($("#visual-logo-size").value) || 88, 64), 150),
    gateLogoSize: Math.min(Math.max(Number($("#visual-gate-logo-size").value) || 82, 56), 150),
    logoTreatment: $("#visual-logo-treatment").value === "original" ? "original" : "white",
    iconSize: Math.min(Math.max(Number($("#visual-icon-size").value) || 24, 18), 32),
    iconStroke: Math.min(Math.max(Number($("#visual-icon-stroke").value) || 1.8, 1.2), 2.8),
    fontScale: Math.min(Math.max(Number($("#visual-font-scale").value) || 100, 90), 115),
    showPrototypeBadge: $("#visual-prototype-badge").checked,
    assets: Object.fromEntries(Object.keys(DEFAULT_VISUAL_ASSETS).map(key => [key, safeImageData(pendingVisualAssets?.[key])])),
    navIcons,
  };
}

function readVisualAsset(input) {
  const file = input.files?.[0];
  if (!file) return;
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    input.value = "";
    return showToast("Gunakan file PNG, JPG, atau WebP.");
  }
  if (file.size > 400 * 1024) {
    input.value = "";
    return showToast("Ukuran gambar maksimal 400 KB.");
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const value = safeImageData(reader.result);
    if (!value) return showToast("File gambar tidak dapat dipakai.");
    pendingVisualAssets ||= { ...DEFAULT_VISUAL_ASSETS };
    pendingVisualAssets[input.dataset.visualAssetInput] = value;
    const visuals = visualSettingsFromForm();
    renderVisualAssetPreviews(visuals);
    applyVisualSettings(visuals);
    input.value = "";
    showToast("Gambar siap dipratinjau. Klik Simpan untuk menerapkan permanen.");
  });
  reader.readAsDataURL(file);
}

function saveVisualSettings() {
  adminState.settings.visuals = visualSettingsFromForm();
  addAudit("Pengaturan visual aplikasi diperbarui");
  if (!persistAdmin()) return;
  applyVisualSettings();
  renderVisualSettings();
  showToast("Warna, logo, dan ikon aplikasi berhasil diterapkan.");
}

function renderIntegrationSettings() {
  const fields = {
    "cloudflare-account-id": "cloudflareAccountId",
    "cloudflare-project-name": "cloudflareProjectName",
    "cloudflare-environment": "cloudflareEnvironment",
    "cloudflare-worker-url": "cloudflareWorkerUrl",
    "cloudflare-d1-name": "cloudflareD1Name",
    "cloudflare-r2-bucket": "cloudflareR2Bucket",
    "github-repo": "githubRepo",
    "github-branch": "githubBranch",
    "github-workflow": "githubWorkflow",
    "google-client-id": "googleClientId",
    "google-allowed-domain": "googleAllowedDomain",
    "google-scopes": "googleScopes",
    "analytics-id": "analyticsId",
    "webhook-url": "webhookUrl",
  };
  for (const [id, key] of Object.entries(fields)) $(`#${id}`).value = adminState.integrations[key] || "";
  $("#google-origin").value = location.origin;
  const setConnectionStatus = (selector, configured, configuredLabel = "Siap dikonfigurasi") => {
    const node = $(selector);
    node.textContent = configured ? configuredLabel : "Belum";
    node.className = `tag ${configured ? "good" : "warning"}`;
  };
  setConnectionStatus("#cloudflare-status", Boolean(adminState.integrations.cloudflareAccountId && adminState.integrations.cloudflareWorkerUrl));
  setConnectionStatus("#github-status", Boolean(adminState.integrations.githubRepo), "Terisi");
  setConnectionStatus("#google-status", Boolean(adminState.integrations.googleClientId), "Terisi");
  setConnectionStatus("#operations-status", Boolean(adminState.integrations.analyticsId || adminState.integrations.webhookUrl), "Terisi");
}

function renderAppSettings() {
  $("#maintenance-setting").checked = adminState.settings.maintenance;
  $("#device-setting").value = adminState.settings.maxDevices;
  $("#session-setting").value = adminState.settings.sessionDays;
  $("#money-feature").checked = adminState.settings.features.money;
  $("#readiness-feature").checked = adminState.settings.features.readiness;
  $("#business-feature").checked = adminState.settings.features.business !== false;
  $("#health-feature").checked = adminState.settings.features.health !== false;
  $("#digital-feature").checked = adminState.settings.features.digital !== false;
}

function renderAudit() {
  $("#audit-list").innerHTML = adminState.audit.map(log => `<div><time>${dateTimeText(log.at)}</time><span><strong>${escapeHTML(log.action)}</strong><small>${escapeHTML(log.actor)}</small></span></div>`).join("") || '<div class="empty-state">Audit log demo kosong.</div>';
}

function addAudit(action, actor = "Admin SBB") {
  adminState.audit.unshift({ id: newId("audit"), action, actor, at: new Date().toISOString() });
  adminState.audit = adminState.audit.slice(0, 100);
}

function confirmAction(title, copy, action) {
  pendingConfirmation = action;
  $("#confirm-dialog").returnValue = "";
  $("#confirm-title").textContent = title;
  $("#confirm-copy").textContent = copy;
  $("#confirm-dialog").showModal();
}

function downloadJSON(filename, value) {
  downloadBlob(filename, new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
}

function sanitizeHealthHistoryData(value) {
  return (Array.isArray(value) ? value : []).slice(0, 24).map(item => {
    const profile = sanitizeHealthProfile(item?.profile || item || {});
    const result = calculateHealth(profile);
    const parsedDate = new Date(item?.at || "");
    return {
      id: String(item?.id || newId("health")).slice(0, 100),
      businessName: profile.businessName,
      sector: profile.sector,
      period: profile.period,
      score: result.score,
      status: result.status.label,
      at: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
      profile,
    };
  }).sort((a, b) => b.at.localeCompare(a.at));
}

function downloadLocalBackup() {
  const businessCalculators = readStorage(STORAGE.business, null);
  const payload = createBackupPayload({
    transactions,
    moneySettings,
    readinessProfile,
    healthProfile,
    healthHistory,
    businessCalculators,
    digitalState,
    profileStatus: { readiness: hasStoredProfile(STORAGE.readiness), health: hasStoredProfile(STORAGE.health) },
  });
  if (new TextEncoder().encode(JSON.stringify(payload)).length > SBB_BACKUP_MAX_BYTES) return showToast("Backup melebihi batas 5 MB. Ekspor transaksi juga untuk menyimpan salinan catatan.");
  downloadJSON(`sbb-backup-${todayISO()}.json`, payload);
  persistEntries([[STORAGE.backupMeta, { exportedAt: payload.exportedAt }]], { notify: false });
  $("#backup-status").textContent = `Backup dibuat ${dateTimeText(payload.exportedAt)}. Simpan file ini di tempat yang aman.`;
  showToast("Satu file backup SBB berhasil diunduh.");
}

function applyLocalBackup(data) {
  const previousState = {
    transactions,
    moneySettings,
    readinessProfile,
    healthProfile,
    healthHistory,
    digitalState,
    digitalQuestionIndex,
    digitalProfileEditing,
  };
  transactions = sanitizeTransactions(data.transactions);
  moneySettings = sanitizeSettings(data.moneySettings);
  readinessProfile = normalizedProfile(data.readinessProfile);
  healthProfile = sanitizeHealthProfile(data.healthProfile);
  healthHistory = sanitizeHealthHistoryData(data.healthHistory);
  digitalState = sanitizeDigitalState(data.digitalState, adminState.digitalConfig);
  digitalQuestionIndex = firstUnansweredDigitalIndex();
  digitalProfileEditing = !digitalState.profile.completed;
  const saved = persistEntries([
    [STORAGE.transactions, transactions],
    [STORAGE.moneySettings, moneySettings],
    [STORAGE.readiness, data.profileStatus?.readiness === false || !Object.keys(data.readinessProfile).length ? null : readinessProfile],
    [STORAGE.health, data.profileStatus?.health === false || !Object.keys(data.healthProfile).length ? null : healthProfile],
    [STORAGE.healthHistory, healthHistory.slice(0, 24)],
    [STORAGE.digital, digitalState],
    [STORAGE.business, data.businessCalculators || null],
  ]);
  if (!saved) {
    ({
      transactions,
      moneySettings,
      readinessProfile,
      healthProfile,
      healthHistory,
      digitalState,
      digitalQuestionIndex,
      digitalProfileEditing,
    } = previousState);
    $("#backup-status").textContent = "Backup valid, tetapi penyimpanan perangkat gagal. Data lama dipertahankan.";
    return;
  }
  fillReadinessForm();
  fillHealthForm();
  resetTransactionForm();
  renderAll();
  const frame = $(".business-frame");
  if (frame?.contentWindow) frame.contentWindow.location.reload();
  $("#backup-status").textContent = "Backup berhasil diimpor. Semua modul sudah memakai data dari file tersebut.";
  showToast("Backup SBB berhasil dipulihkan.");
}

async function prepareLocalBackupImport(file) {
  if (!file) return;
  $("#import-local-backup").value = "";
  try {
    if (file.size > SBB_BACKUP_MAX_BYTES) throw new Error("File backup melebihi batas 5 MB.");
    const data = parseBackupText(await file.text());
    confirmAction("Impor backup SBB?", "Data pengguna pada perangkat ini akan diganti dengan isi file backup. Admin dan sesi masuk tidak berubah.", () => applyLocalBackup(data));
  } catch (error) {
    $("#backup-status").textContent = error instanceof Error ? error.message : "Backup tidak dapat dibaca.";
    showToast("File backup tidak dapat diimpor.");
  }
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportTransactions(format) {
  if (!transactions.length) return showToast("Belum ada transaksi untuk diunduh.");
  const stamp = todayISO();
  if (format === "xlsx") {
    const bytes = buildTransactionXLSX(transactions, EXCEL_TRANSACTION_LIMIT);
    downloadBlob(`sbb-transaksi-${stamp}.xlsx`, new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const count = Math.min(transactions.length, EXCEL_TRANSACTION_LIMIT);
    const suffix = transactions.length > count ? ` ${transactions.length - count} transaksi lama tidak disertakan.` : "";
    return showToast(`File Excel berisi ${count} transaksi terbaru.${suffix}`);
  }
  const csv = buildTransactionCSV(transactions, CSV_TRANSACTION_LIMIT);
  downloadBlob(`sbb-transaksi-${stamp}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const count = Math.min(transactions.length, CSV_TRANSACTION_LIMIT);
  const suffix = transactions.length > count ? ` ${transactions.length - count} transaksi lama tidak disertakan.` : "";
  showToast(`File CSV berisi ${count} transaksi terbaru.${suffix}`);
}

function wireEvents() {
  $("#access-form").addEventListener("submit", event => { event.preventDefault(); activateCode($("#access-code").value); });
  $("#use-demo-code").addEventListener("click", () => { $("#access-code").value = "SBB-DEMO-PRO-2026"; activateCode($("#access-code").value); });
  $("#demo-google").addEventListener("click", () => setSession({ role: "user", name: "Dina Pratama", plan: "Pro", provider: "google-demo", signedInAt: new Date().toISOString() }));
  $("#logout-button").addEventListener("click", () => setSession(null));
  $("#menu-toggle").addEventListener("click", () => setSidebarOpen(!$("#sidebar").classList.contains("is-open")));
  $("#sidebar-close").addEventListener("click", () => setSidebarOpen(false));
  $("#sidebar-scrim").addEventListener("click", () => setSidebarOpen(false));
  $("#mobile-more").addEventListener("click", () => setSidebarOpen(!$("#sidebar").classList.contains("is-open")));
  $("#quick-backup").addEventListener("click", downloadLocalBackup);
  $(".business-frame").addEventListener("load", () => { applyVisualSettings(); observeBusinessFrame(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 960) setSidebarOpen(false); resizeBusinessFrame(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setSidebarOpen(false);
    if (event.key === "Tab" && $("#sidebar").getAttribute("aria-modal") === "true") {
      const focusable = $$("button:not([disabled])", $("#sidebar")).filter(node => node.getClientRects().length && !node.hidden);
      const first = focusable[0], last = focusable.at(-1);
      if (!$("#sidebar").contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });

  document.addEventListener("click", event => {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      navigate(routeButton.dataset.route);
      if (routeButton.dataset.moneyTab) selectMoneyTab(routeButton.dataset.moneyTab);
    }
    const moneyButton = event.target.closest("[data-money-tab]");
    if (moneyButton && !moneyButton.dataset.route) selectMoneyTab(moneyButton.dataset.moneyTab);
    const calendarButton = event.target.closest("[data-calendar-date]");
    if (calendarButton) openRecordForDate(calendarButton.dataset.calendarDate);
    const adminButton = event.target.closest("[data-admin-tab]");
    if (adminButton) selectAdminTab(adminButton.dataset.adminTab);
    const digitalAnswer = event.target.closest("[data-digital-answer]");
    if (digitalAnswer) selectDigitalAnswer(digitalAnswer.dataset.digitalAnswer);
    const editButton = event.target.closest("[data-edit-transaction]");
    if (editButton) editTransaction(editButton.dataset.editTransaction);
    const deleteButton = event.target.closest("[data-delete-transaction]");
    if (deleteButton) {
      const item = transactions.find(entry => entry.id === deleteButton.dataset.deleteTransaction);
      if (item) confirmAction("Hapus transaksi?", `${item.category} sebesar ${formatRupiah(item.amount)} akan dihapus dari perangkat ini.`, () => {
        transactions = transactions.filter(entry => entry.id !== item.id);
        if (!persistMoney()) return;
        renderAll();
        showToast("Transaksi dihapus.");
      });
    }
    const deleteCategoryButton = event.target.closest("[data-delete-category]");
    if (deleteCategoryButton) deleteExpenseCategory(Number(deleteCategoryButton.dataset.deleteCategory));
    const copyButton = event.target.closest("[data-copy-code]");
    if (copyButton) {
      if (!navigator.clipboard?.writeText) showToast("Pilih dan salin kode secara manual.");
      else navigator.clipboard.writeText(copyButton.dataset.copyCode).then(() => showToast("Kode disalin.")).catch(() => showToast("Pilih dan salin kode secara manual."));
    }
    const codeButton = event.target.closest("[data-toggle-code]");
    if (codeButton) toggleCode(codeButton.dataset.toggleCode);
    const userButton = event.target.closest("[data-toggle-user]");
    if (userButton) toggleUser(userButton.dataset.toggleUser);
    const planButton = event.target.closest("[data-save-plan]");
    if (planButton) savePlan(Number(planButton.dataset.savePlan));
    const healthHistoryButton = event.target.closest("[data-load-health]");
    if (healthHistoryButton) {
      const savedHealth = healthHistory.find(item => item.id === healthHistoryButton.dataset.loadHealth);
      if (savedHealth?.profile) {
        healthProfile = sanitizeHealthProfile(savedHealth.profile);
        if (!persistHealth()) return;
        fillHealthForm();
        renderHealth();
        window.scrollTo({ top: 0, behavior: "smooth" });
        showToast("Pemeriksaan tersimpan dibuka.");
      }
    }
  });

  $("#money-prev").addEventListener("click", () => { selectedMonth = shiftMonth(selectedMonth, -1); renderMoney(); });
  $("#money-next").addEventListener("click", () => { selectedMonth = shiftMonth(selectedMonth, 1); renderMoney(); });
  $$('input[name="transaction-type"]').forEach(input => input.addEventListener("change", () => fillCategoryOptions()));
  $("#transaction-amount").addEventListener("input", event => { event.target.value = formatNumericInput(event.target.value); $("#transaction-error").textContent = ""; });
  $("#history-search").addEventListener("input", event => {
    historySearch = event.target.value;
    renderHistory(calculateMonth(transactions, moneySettings, selectedMonth));
  });
  $("#transaction-form").addEventListener("submit", event => {
    event.preventDefault();
    const amount = numericValue($("#transaction-amount").value);
    if (!amount) return void ($("#transaction-error").textContent = "Masukkan nominal lebih dari Rp 0.");
    if (amount > MAX_TRANSACTION_AMOUNT) return void ($("#transaction-error").textContent = `Nominal maksimal ${formatRupiah(MAX_TRANSACTION_AMOUNT)} per transaksi.`);
    const transactionDate = $("#transaction-date").value;
    if (!isValidISODate(transactionDate) || transactionDate > todayISO()) return void ($("#transaction-error").textContent = "Pilih tanggal yang valid dan tidak melebihi hari ini.");
    const existing = transactions.find(entry => entry.id === $("#transaction-id").value);
    const savedTransaction = commitTransaction({ id: $("#transaction-id").value, type: $('input[name="transaction-type"]:checked').value, category: $("#transaction-category").value, amount, date: transactionDate, note: $("#transaction-note").value, createdAt: existing?.createdAt });
    if (!savedTransaction) return;
    resetTransactionForm();
    selectMoneyTab("summary");
    showToast(existing ? "Transaksi diperbarui." : "Transaksi disimpan.");
  });
  $("#cancel-edit").addEventListener("click", resetTransactionForm);
  $("#load-sample").addEventListener("click", loadSampleTransactions);
  $("#export-excel").addEventListener("click", () => exportTransactions("xlsx"));
  $("#export-csv").addEventListener("click", () => exportTransactions("csv"));
  $("#add-expense-category").addEventListener("click", addExpenseCategory);
  $("#saving-target").addEventListener("input", event => { event.target.value = formatNumericInput(event.target.value); });
  $("#budget-list").addEventListener("input", event => { if (event.target.matches("[data-budget]")) event.target.value = formatNumericInput(event.target.value); });
  $("#saving-target").addEventListener("change", event => { moneySettings.savingTargetAmount = Math.min(numericValue(event.target.value), MAX_TRANSACTION_AMOUNT); if (!persistMoney()) return; renderAll(); });
  $("#budget-list").addEventListener("change", event => {
    const nameInput = event.target.closest("[data-category-name]");
    if (nameInput) {
      renameExpenseCategory(Number(nameInput.dataset.categoryName), nameInput.value);
      return;
    }
    const input = event.target.closest("[data-budget]");
    if (!input) return;
    moneySettings.budgetAmounts[input.dataset.budget] = Math.min(numericValue(input.value), MAX_TRANSACTION_AMOUNT);
    if (!persistMoney()) return;
    renderAll();
  });
  $("#reset-budget").addEventListener("click", () => confirmAction("Reset semua anggaran?", "Batas kategori dan target tabungan kembali ke nilai awal.", () => {
    moneySettings = sanitizeSettings({ onboardingComplete: moneySettings.onboardingComplete });
    if (!persistMoney()) return;
    renderAll();
    showToast("Anggaran kembali ke pengaturan awal.");
  }));
  $$("[data-history-filter]").forEach(button => button.addEventListener("click", () => {
    historyFilter = button.dataset.historyFilter;
    $$("[data-history-filter]").forEach(item => item.classList.toggle("is-active", item === button));
    renderMoney();
  }));

  $$("[data-profile]").filter(input => MONEY_FIELDS.includes(input.dataset.profile)).forEach(input => input.addEventListener("input", event => { event.target.value = formatNumericInput(event.target.value); }));
  $("#readiness-form").addEventListener("submit", event => {
    event.preventDefault();
    const next = readReadinessForm();
    const result = calculateReadiness(next);
    if (!result.valid) {
      $("#readiness-errors").innerHTML = result.errors.map(error => `<p>• ${escapeHTML(error.message)}</p>`).join("");
      const input = $(`[data-profile="${result.errors[0].field}"]`);
      const guide = guidedForms.get($("#readiness-form"));
      const index = guide?.sections.indexOf(input?.closest(".guided-step"));
      if (index >= 0) guide.showStep(index, true);
      input?.focus({ preventScroll: true });
      return;
    }
    $("#readiness-errors").textContent = "";
    readinessProfile = next;
    if (!persistReadiness()) return;
    renderAll();
    showToast("Perhitungan kesiapan diperbarui.");
    revealFormResults(".result-column");
  });
  $("#sync-money").addEventListener("click", () => {
    const month = calculateMonth(transactions, moneySettings, selectedMonth);
    if (!month.income && !month.expense) return showToast("Belum ada data Atur Uang pada bulan terpilih.");
    readinessProfile.income = month.income;
    readinessProfile.mandatoryExpenses = month.expense;
    readinessProfile.otherExpenses = 0;
    readinessProfile.savingsGoal = Math.round(month.savingTarget);
    if (!persistReadiness()) return;
    fillReadinessForm();
    renderReadiness();
    showToast("Pendapatan, pengeluaran, dan target tabungan sudah disalin.");
  });

  $$('[data-health-money]').forEach(input => input.addEventListener("input", event => { event.target.value = formatNumericInput(event.target.value); }));
  $("#health-form").addEventListener("submit", event => {
    event.preventDefault();
    healthProfile = readHealthForm();
    if (!persistHealth()) return;
    fillHealthForm();
    renderHealth();
    showToast("Pemeriksaan kesehatan bisnis diperbarui.");
    revealFormResults(".health-results");
  });
  $("#reset-health").addEventListener("click", () => {
    healthProfile = sanitizeHealthProfile({ ...DEFAULT_HEALTH_PROFILE, period: getCurrentMonthKey() });
    if (!persistEntries([[STORAGE.health, null]])) return;
    fillHealthForm();
    renderHealth();
    showToast("Contoh SBB Health dikembalikan. Periksa kembali untuk melihat hasil.");
  });
  $("#save-health-audit").addEventListener("click", () => {
    healthProfile = readHealthForm();
    if (!persistHealth()) return;
    renderHealth();
    saveHealthAudit();
  });
  $("#digital-prev").addEventListener("click", () => moveDigitalQuestion(-1));
  $("#digital-next").addEventListener("click", () => moveDigitalQuestion(1));
  $("#digital-profile-form").addEventListener("submit", event => { event.preventDefault(); submitDigitalProfile(); });
  $("#digital-edit-profile").addEventListener("click", () => { digitalProfileEditing = true; renderDigital(); });
  $("#digital-restart").addEventListener("click", () => confirmAction("Ulangi pemeriksaan digital?", "Jawaban SBB Digital pada perangkat ini akan dikosongkan.", restartDigitalAssessment));
  $("#digital-whatsapp").addEventListener("click", openDigitalConsultation);
  $("#digital-copy-brief").addEventListener("click", copyDigitalBrief);
  $("#download-local-backup").addEventListener("click", downloadLocalBackup);
  $("#import-local-backup").addEventListener("change", event => prepareLocalBackupImport(event.target.files?.[0]));

  $("#code-form").addEventListener("submit", event => { event.preventDefault(); createCodes(); });
  $("#code-search").addEventListener("input", renderCodes);
  $("#user-search").addEventListener("input", renderUsers);
  $("#save-integrations").addEventListener("click", () => {
    adminState.integrations = {
      cloudflareAccountId: $("#cloudflare-account-id").value.trim(),
      cloudflareProjectName: $("#cloudflare-project-name").value.trim() || "sbb-finance",
      cloudflareEnvironment: $("#cloudflare-environment").value,
      cloudflareWorkerUrl: $("#cloudflare-worker-url").value.trim(),
      cloudflareD1Name: $("#cloudflare-d1-name").value.trim(),
      cloudflareR2Bucket: $("#cloudflare-r2-bucket").value.trim(),
      githubRepo: $("#github-repo").value.trim(),
      githubBranch: $("#github-branch").value.trim() || "main",
      githubWorkflow: $("#github-workflow").value.trim() || ".github/workflows/deploy.yml",
      googleClientId: $("#google-client-id").value.trim(),
      googleAllowedDomain: $("#google-allowed-domain").value.trim(),
      googleScopes: $("#google-scopes").value.trim() || "openid email profile",
      analyticsId: $("#analytics-id").value.trim(),
      webhookUrl: $("#webhook-url").value.trim(),
    };
    addAudit("Konfigurasi integrasi diperbarui");
    if (!persistAdmin()) return;
    renderAdmin();
    showToast("Konfigurasi publik disimpan. Secret tetap harus dipasang di server.");
  });
  $("#save-visuals").addEventListener("click", saveVisualSettings);
  $$("[data-visual-preview]").forEach(control => control.addEventListener("input", () => applyVisualSettings(visualSettingsFromForm())));
  $$('[data-visual-asset-input]').forEach(input => input.addEventListener("change", () => readVisualAsset(input)));
  $$('[data-clear-visual-asset]').forEach(button => button.addEventListener("click", () => {
    pendingVisualAssets ||= { ...DEFAULT_VISUAL_ASSETS };
    pendingVisualAssets[button.dataset.clearVisualAsset] = "";
    const visuals = visualSettingsFromForm();
    renderVisualAssetPreviews(visuals);
    applyVisualSettings(visuals);
    showToast("Gambar khusus dilepas. Klik Simpan untuk menerapkan permanen.");
  }));
  $("#reset-visuals").addEventListener("click", () => confirmAction("Kembalikan tampilan bawaan?", "Warna, tata letak, seluruh logo, ikon aplikasi, dan ikon menu akan kembali ke pengaturan awal.", () => {
    adminState.settings.visuals = clone(DEFAULT_ADMIN.settings.visuals);
    pendingVisualAssets = { ...DEFAULT_VISUAL_ASSETS };
    addAudit("Pengaturan visual dikembalikan ke bawaan");
    if (!persistAdmin()) return;
    applyVisualSettings();
    renderVisualSettings();
    showToast("Tampilan bawaan dipulihkan.");
  }));
  $("#save-settings").addEventListener("click", saveAppSettings);
  $("#page-content-form").addEventListener("submit", event => { event.preventDefault(); savePageContent(); });
  $("#reset-page-content").addEventListener("click", () => confirmAction("Kembalikan konteks semua halaman?", "Label, headline, subheadline, dan teks tombol halaman akan kembali ke teks awal.", () => {
    adminState.pageContent = clone(DEFAULT_PAGE_CONTENT);
    adminState.benefitsContent.hero.title = adminState.pageContent.benefits.headline;
    adminState.benefitsContent.hero.intro = adminState.pageContent.benefits.subheadline;
    addAudit("Konteks semua halaman dikembalikan ke teks awal");
    if (!persistAdmin()) return;
    applyPageContent();
    renderBenefits();
    renderAdmin();
    showToast("Konteks halaman kembali ke teks awal.");
  }));
  $("#sbb-content-form").addEventListener("submit", event => { event.preventDefault(); saveBenefitsContent(); });
  $("#digital-content-form").addEventListener("submit", event => { event.preventDefault(); saveDigitalContent(); });
  $("#reset-digital-content").addEventListener("click", () => confirmAction("Kembalikan konten SBB Digital?", "Enam area, pertanyaan adaptif, checklist, dan pengaturan konsultasi kembali ke teks awal.", () => {
    adminState.digitalConfig = clone(DEFAULT_DIGITAL_CONFIG);
    digitalState = sanitizeDigitalState(digitalState, adminState.digitalConfig);
    digitalQuestionIndex = firstUnansweredDigitalIndex();
    digitalProfileEditing = !digitalState.profile.completed;
    addAudit("Konten SBB Digital dikembalikan ke bawaan");
    if (!persistEntries([[STORAGE.admin, adminState], [STORAGE.digital, digitalState]])) return;
    renderDigital();
    renderAdmin();
    showToast("Konten awal SBB Digital dipulihkan.");
  }));
  $("#reset-sbb-content").addEventListener("click", () => confirmAction("Kembalikan seluruh teks awal?", "Semua perubahan konten halaman About Us pada perangkat ini akan diganti dengan teks bawaan.", () => {
    adminState.benefitsContent = clone(DEFAULT_BENEFITS_CONTENT);
    adminState.pageContent.benefits.headline = DEFAULT_PAGE_CONTENT.benefits.headline;
    adminState.pageContent.benefits.subheadline = DEFAULT_PAGE_CONTENT.benefits.subheadline;
    addAudit("Konten halaman About Us dikembalikan ke teks awal");
    if (!persistAdmin()) return;
    renderBenefits();
    renderAdmin();
    showToast("Teks awal halaman About Us dipulihkan.");
  }));
  $("#export-admin").addEventListener("click", () => { addAudit("Backup data admin demo diunduh"); persistAdmin(); downloadJSON(`sbb-finance-admin-${todayISO()}.json`, adminState); renderAdmin(); });
  $("#clear-audit").addEventListener("click", () => confirmAction("Bersihkan audit log demo?", "Riwayat tindakan lokal akan dihapus. Ini tidak memengaruhi data pengguna.", () => {
    adminState.audit = [];
    if (!persistAdmin()) return;
    renderAdmin();
    showToast("Audit log demo dibersihkan.");
  }));
  $("#confirm-dialog").addEventListener("close", () => {
    const action = pendingConfirmation;
    pendingConfirmation = null;
    if ($("#confirm-dialog").returnValue === "confirm") action?.();
  });
  window.addEventListener("hashchange", () => session && navigate(location.hash.replace("#/", "") || "overview"));
}

function loadSampleTransactions() {
  if (selectedMonth > getCurrentMonthKey()) return showToast("Pilih bulan berjalan atau sebelumnya untuk memuat contoh transaksi.");
  const [year, month] = selectedMonth.split("-");
  const sample = [
    ["income", "Gaji", 5_500_000, `${year}-${month}-01`, "Pendapatan bulanan"],
    ["expense", "Sewa / KPR", 1_200_000, `${year}-${month}-03`, "Sewa tempat tinggal"],
    ["expense", "Makan & minum", 450_000, `${year}-${month}-06`, "Belanja kebutuhan makan"],
    ["expense", "Transportasi", 220_000, `${year}-${month}-08`, "Transport mingguan"],
    ["saving", "Dana darurat", 750_000, `${year}-${month}-10`, "Setoran dana darurat"],
  ];
  const added = sample.map(([type, category, amount, date, note], index) => ({ id: `sample-${selectedMonth}-${index}`, type, category, amount, date: date > todayISO() ? todayISO() : date, note, createdAt: Date.now() })).filter(item => !transactions.some(previous => previous.id === item.id));
  if (!added.length) return showToast("Contoh untuk bulan ini sudah dimuat. Catatan yang sudah kamu ubah tetap dipertahankan.");
  if (transactions.length + added.length > MAX_TRANSACTION_COUNT) return showToast("Batas transaksi baru tercapai. Data lama tetap dipertahankan.");
  transactions = sanitizeTransactions([...transactions, ...added]);
  if (!persistMoney()) return;
  resetTransactionForm();
  selectMoneyTab("summary");
  showToast("Contoh data dimuat. Semua bisa diubah atau dihapus.");
}

function createCodes(quantityOverride) {
  const quantity = Math.min(Math.max(Math.trunc(Number(quantityOverride ?? $("#code-quantity").value)) || 1, 1), 20);
  const plan = $("#code-plan").value;
  const expiresAt = $("#code-expiry").value;
  const maxActivations = Math.min(Math.max(Math.trunc(Number($("#code-max-activation").value)) || 1, 1), 100);
  const existing = new Set(adminState.codes.map(item => item.code));
  const created = [];
  while (created.length < quantity) {
    const code = generateLicenseCode(plan);
    if (existing.has(code)) continue;
    existing.add(code);
    created.push({ id: newId("code"), code, plan, status: "active", activations: 0, maxActivations, expiresAt: plan === "Lifetime" ? "" : expiresAt, createdAt: new Date().toISOString() });
  }
  adminState.codes.unshift(...created);
  addAudit(`${quantity} kode ${plan} dibuat`);
  if (!persistAdmin()) return;
  renderAdmin();
  showToast(`${quantity} kode demo berhasil dibuat.`);
  return created;
}

function toggleCode(id) {
  const item = adminState.codes.find(code => code.id === id);
  if (!item) return;
  const willRevoke = item.status !== "revoked";
  confirmAction(willRevoke ? "Cabut kode akses?" : "Aktifkan kembali kode?", willRevoke ? `${item.code} tidak dapat dipakai untuk aktivasi baru.` : `${item.code} dapat dipakai kembali jika belum kedaluwarsa atau mencapai batas.`, () => {
    item.status = willRevoke ? "revoked" : "active";
    addAudit(`Kode ${item.code} ${willRevoke ? "dicabut" : "diaktifkan kembali"}`);
    if (!persistAdmin()) return;
    renderAdmin();
    showToast(willRevoke ? "Kode dicabut." : "Kode diaktifkan kembali.");
  });
}

function toggleUser(id) {
  const user = adminState.users.find(item => item.id === id);
  if (!user) return;
  const suspend = user.status === "active";
  confirmAction(suspend ? "Tangguhkan pengguna?" : "Aktifkan pengguna?", `Akses ${user.name} akan ${suspend ? "dihentikan sementara" : "dipulihkan"}.`, () => {
    user.status = suspend ? "suspended" : "active";
    addAudit(`Pengguna ${user.email} ${suspend ? "ditangguhkan" : "diaktifkan"}`);
    if (!persistAdmin()) return;
    renderAdmin();
    showToast("Status pengguna diperbarui.");
  });
}

function savePlan(index) {
  const plan = adminState.plans[index];
  if (!plan) return;
  plan.price = numericValue($(`[data-plan-price="${index}"]`).value);
  plan.duration = $(`[data-plan-duration="${index}"]`).value.trim() || plan.duration;
  plan.description = $(`[data-plan-description="${index}"]`).value.trim();
  addAudit(`Paket ${plan.name} diperbarui`);
  if (!persistAdmin()) return;
  renderAdmin();
  showToast(`Paket ${plan.name} disimpan.`);
}

function saveAppSettings() {
  adminState.settings = {
    ...adminState.settings,
    maintenance: $("#maintenance-setting").checked,
    maxDevices: Math.min(Math.max(Number($("#device-setting").value) || 1, 1), 10),
    sessionDays: Math.min(Math.max(Number($("#session-setting").value) || 1, 1), 90),
    features: { money: $("#money-feature").checked, readiness: $("#readiness-feature").checked, business: $("#business-feature").checked, health: $("#health-feature").checked, digital: $("#digital-feature").checked },
  };
  addAudit("Kebijakan akses aplikasi diperbarui");
  if (!persistAdmin()) return;
  renderAdmin();
  showToast("Pengaturan aplikasi disimpan.");
}

function registerWebMCP() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const tools = [
    {
      name: "get_financial_overview",
      title: "Baca ringkasan keuangan",
      description: "Mengembalikan ringkasan Atur Uang untuk bulan YYYY-MM tanpa mengubah data.",
      inputSchema: { type: "object", properties: { month: { type: "string", pattern: "^\\d{4}-\\d{2}$" } }, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input = {}) {
        if (!session) throw new Error("Masuk ke aplikasi terlebih dahulu.");
        if (input.month && !isValidISODate(`${input.month}-01`)) throw new Error("Bulan tidak valid. Gunakan YYYY-MM.");
        const result = calculateMonth(transactions, moneySettings, input.month || getCurrentMonthKey());
        return { month: result.monthKey, income: result.income, expense: result.expense, saved: result.saved, balance: result.balance, status: result.status };
      },
    },
    {
      name: "add_money_transaction",
      title: "Tambah transaksi",
      description: "Menyimpan satu transaksi Atur Uang dan memperbarui tampilan.",
      inputSchema: { type: "object", properties: { type: { type: "string", enum: ["income", "expense", "saving"] }, category: { type: "string", minLength: 1 }, amount: { type: "number", exclusiveMinimum: 0 }, date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" }, note: { type: "string", maxLength: 80 } }, required: ["type", "category", "amount", "date"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!session) throw new Error("Masuk ke aplikasi sebelum menambah transaksi.");
        if (!["income", "expense", "saving"].includes(input?.type) || !Number.isFinite(input?.amount) || input.amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(input?.date || "")) throw new Error("Data transaksi tidak valid.");
        const item = commitTransaction(input);
        if (!item) throw new Error("Transaksi tidak tersimpan. Periksa input dan penyimpanan perangkat.");
        return { id: item.id, status: "saved", balance: calculateMonth(transactions, moneySettings, item.date.slice(0, 7)).balance };
      },
    },
    {
      name: "get_readiness_summary",
      title: "Baca hasil SBB Start",
      description: "Mengembalikan hasil kesiapan keuangan dan modal dari SBB Start tanpa mengubah data.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() { if (!session) throw new Error("Masuk ke aplikasi terlebih dahulu."); return readinessSummary(readinessProfile); },
    },
    {
      name: "set_financial_profile",
      title: "Perbarui profil kesiapan",
      description: "Memperbarui profil SBB Start dan menghitung ulang kesiapan keuangan serta modal.",
      inputSchema: { type: "object", properties: Object.fromEntries([...MONEY_FIELDS, "weeklyHours", "emergencyMonths"].map(field => [field, { type: "number", minimum: 0 }])), additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input = {}) {
        if (!session) throw new Error("Masuk ke aplikasi terlebih dahulu.");
        if (!input || typeof input !== "object" || Array.isArray(input) || Object.values(input).some(value => typeof value !== "number" || !Number.isFinite(value))) throw new Error("Gunakan angka yang valid untuk profil kesiapan.");
        const next = normalizedProfile({ ...readinessProfile, ...input });
        const result = calculateReadiness(next);
        if (!result.valid) throw new Error(result.errors[0]?.message || "Profil tidak valid.");
        readinessProfile = next;
        if (!persistReadiness()) throw new Error("Profil belum tersimpan pada perangkat.");
        fillReadinessForm();
        renderAll();
        return readinessSummary(readinessProfile);
      },
    },
    {
      name: "generate_demo_license_codes",
      title: "Buat kode lisensi demo",
      description: "Membuat 1–20 kode akses prototipe. Hanya tersedia untuk akun admin.",
      inputSchema: { type: "object", properties: { quantity: { type: "integer", minimum: 1, maximum: 20 }, plan: { type: "string", enum: ["Basic", "Pro", "Lifetime", "Trial"] } }, required: ["quantity", "plan"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (session?.role !== "admin") throw new Error("Aksi ini memerlukan akun admin.");
        $("#code-plan").value = input.plan;
        const created = createCodes(input.quantity);
        if (!created) throw new Error("Kode tidak tersimpan pada perangkat.");
        return { created: created.map(item => item.code), plan: input.plan, storage: "local-demo" };
      },
    },
  ];
  for (const tool of tools) {
    try { void Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch {}
  }
}

$("#app").innerHTML = appMarkup();
initializeRedesign();
const defaultCodeExpiry = new Date();
defaultCodeExpiry.setFullYear(defaultCodeExpiry.getFullYear() + 1);
$("#code-expiry").value = new Date(defaultCodeExpiry.getTime() - defaultCodeExpiry.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
fillReadinessForm();
fillHealthForm();
resetTransactionForm();
wireEvents();
if (session) showApplication();
else showGate();
registerWebMCP();

if ("serviceWorker" in navigator) {
  const register = () => navigator.serviceWorker.register("./sw.js?v=25").catch(() => {});
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
