export const DIGITAL_ANSWER_OPTIONS = [
  { value: 0, label: "Belum ada", hint: "Belum tersedia atau belum pernah dilakukan." },
  { value: 1, label: "Ada, tetapi belum teratur", hint: "Sudah pernah dilakukan, tetapi masih sporadis dan bergantung pada satu orang." },
  { value: 2, label: "Sudah berjalan", hint: "Sudah digunakan rutin, tetapi hasilnya belum selalu diukur." },
  { value: 3, label: "Terukur dan konsisten", hint: "Berjalan rutin, punya penanggung jawab, dan hasilnya dapat dibuktikan." },
];

export const DIGITAL_PROFILE_OPTIONS = {
  stages: [
    { value: "idea", label: "Masih berupa ide" }, { value: "starting", label: "Menyiapkan peluncuran" },
    { value: "running", label: "Sudah berjalan" }, { value: "growing", label: "Sedang bertumbuh" },
  ],
  models: [
    { value: "local", label: "Usaha lokal / toko fisik" }, { value: "online", label: "Penjualan online" },
    { value: "service", label: "Jasa / keahlian" }, { value: "project", label: "Proyek / kontrak" },
    { value: "subscription", label: "Langganan" }, { value: "hybrid", label: "Gabungan online dan offline" },
  ],
  goals: [
    { value: "awareness", label: "Lebih dikenal" }, { value: "leads", label: "Mendapatkan calon pelanggan" },
    { value: "sales", label: "Meningkatkan penjualan" }, { value: "repeat", label: "Meningkatkan pembelian ulang" },
    { value: "efficiency", label: "Merapikan proses bisnis" },
  ],
  audiences: [
    { value: "b2c", label: "Konsumen langsung (B2C)" }, { value: "b2b", label: "Perusahaan / organisasi (B2B)" }, { value: "both", label: "B2C dan B2B" },
  ],
  channels: [
    { value: "none", label: "Belum ada kanal utama" }, { value: "whatsapp", label: "WhatsApp / pesan langsung" },
    { value: "social", label: "Instagram / Facebook / TikTok" }, { value: "marketplace", label: "Marketplace / delivery platform" },
    { value: "website", label: "Website / landing page" }, { value: "offline", label: "Toko / jaringan offline" }, { value: "multi", label: "Beberapa kanal sekaligus" },
  ],
  teams: [
    { value: "solo", label: "Dikerjakan sendiri" }, { value: "small", label: "Tim 2–5 orang" }, { value: "team", label: "Tim khusus / lebih dari 5 orang" },
  ],
  budgets: [
    { value: "none", label: "Belum ada anggaran", maximum: 0 }, { value: "under500", label: "Di bawah Rp500 ribu/bulan", maximum: 500000 },
    { value: "500to2", label: "Rp500 ribu–Rp2 juta/bulan", maximum: 2000000 }, { value: "2to5", label: "Rp2–Rp5 juta/bulan", maximum: 5000000 },
    { value: "above5", label: "Di atas Rp5 juta/bulan", maximum: 10000000 },
  ],
};

export const DEFAULT_DIGITAL_PROFILE = {
  completed: false, stage: "running", model: "local", goal: "sales", audience: "b2c", channel: "whatsapp", team: "solo", budgetBand: "under500",
  metrics: { monthlyLeads: null, conversionPercent: null, repeatPercent: null, contentPerWeek: null, responseMinutes: null, adSpend: null },
};

const categories = [
  { id: "strategy", title: "Strategi & Penawaran", description: "Sasaran, pelanggan, penawaran, dan alasan pelanggan memilih usaha.", objective: "Memastikan aktivitas digital berangkat dari sasaran dan penawaran yang jelas.", successMetric: "Tujuan 90 hari, pelanggan utama, pesan, dan ukuran keberhasilan tertulis.", selfBudgetMin: 0, selfBudgetMax: 300000, helpBudgetMin: 750000, helpBudgetMax: 3000000 },
  { id: "presence", title: "Kehadiran & Kepercayaan", description: "Kemudahan ditemukan, memahami penawaran, dan mempercayai usaha.", objective: "Membuat usaha mudah ditemukan, dipahami, dan dihubungi dari ponsel.", successMetric: "Informasi utama lengkap, bukti kepercayaan tersedia, dan jalur kontak berfungsi.", selfBudgetMin: 0, selfBudgetMax: 750000, helpBudgetMin: 1500000, helpBudgetMax: 7000000 },
  { id: "brand", title: "Merek & Konten", description: "Konsistensi pesan, produksi konten, dan pembelajaran dari respons audiens.", objective: "Membangun komunikasi yang konsisten dan sanggup diproduksi secara rutin.", successMetric: "Pesan merek, tema konten, kalender, dan evaluasi kinerja konten tersedia.", selfBudgetMin: 0, selfBudgetMax: 1000000, helpBudgetMin: 1000000, helpBudgetMax: 6000000 },
  { id: "conversion", title: "Konversi & Penjualan", description: "Perjalanan dari perhatian menjadi percakapan, pesanan, dan pembayaran.", objective: "Mengurangi hambatan dari calon pelanggan sampai transaksi.", successMetric: "CTA, waktu respons, tindak lanjut, dan tahapan penjualan dapat dipantau.", selfBudgetMin: 0, selfBudgetMax: 750000, helpBudgetMin: 1000000, helpBudgetMax: 6000000 },
  { id: "growth", title: "Pertumbuhan & Iklan", description: "Pemilihan kanal, eksperimen, biaya akuisisi, dan pengukuran kampanye.", objective: "Menumbuhkan permintaan melalui kanal dan promosi yang dapat diukur.", successMetric: "Sumber lead, biaya, konversi, omzet, dan hasil eksperimen tercatat.", selfBudgetMin: 500000, selfBudgetMax: 2500000, helpBudgetMin: 1500000, helpBudgetMax: 9000000 },
  { id: "system", title: "Sistem & Data Pelanggan", description: "Pencatatan pesanan, pelanggan, izin komunikasi, evaluasi, dan otomatisasi.", objective: "Membuat proses digital tetap rapi ketika volume usaha bertambah.", successMetric: "Status pesanan, data pelanggan, tindak lanjut, dan evaluasi bulanan berjalan.", selfBudgetMin: 0, selfBudgetMax: 1500000, helpBudgetMin: 1500000, helpBudgetMax: 9000000 },
];

const q = (id, category, text, evidence, checklist, weight = 2, extra = {}) => ({ id, category, text, evidence, checklist, weight, ...extra });
const questions = [
  q("strategy-customer", "strategy", "Apakah kelompok pelanggan utama sudah ditentukan secara spesifik—bukan hanya ‘semua orang’?", "Ada deskripsi pelanggan, masalah, situasi pembelian, dan alasan mereka membutuhkan solusi.", "Tuliskan satu profil pelanggan utama beserta masalah, pemicu membeli, dan keberatan terbesarnya.", 3, { blocker: true }),
  q("strategy-offer", "strategy", "Apakah penawaran utama menjelaskan hasil yang diterima pelanggan dan alasan memilih usahamu?", "Ada satu kalimat penawaran, manfaat, pembeda, harga atau cara meminta penawaran.", "Rapikan satu penawaran utama: untuk siapa, masalah apa, hasil apa, pembeda, dan tindakan berikutnya.", 3, { blocker: true }),
  q("strategy-goal", "strategy", "Apakah tujuan digital 90 hari memiliki angka sasaran dan tenggat yang jelas?", "Contoh: jumlah lead, transaksi, pembelian ulang, atau waktu respons dengan angka awal dan target.", "Tetapkan satu tujuan 90 hari dengan angka awal, angka target, tenggat, dan penanggung jawab.", 3, { blocker: true }),
  q("strategy-economics", "strategy", "Apakah nilai transaksi, margin, dan batas biaya mendapatkan pelanggan sudah diketahui?", "Ada nilai transaksi rata-rata, margin kontribusi, dan batas biaya akuisisi yang masih aman.", "Hitung nilai transaksi, margin kontribusi, dan batas biaya mendapatkan satu pelanggan.", 2, { when: { stages: ["running", "growing"] } }),
  q("presence-find", "presence", "Jika pelanggan mencari nama atau kategori usahamu, apakah informasi yang benar mudah ditemukan?", "Nama, lokasi/area layanan, jam, kontak, dan tautan utama konsisten di kanal penting.", "Samakan nama, lokasi/area layanan, jam, kontak, dan tautan utama di semua kanal.", 2),
  q("presence-offer", "presence", "Dapatkah pelanggan memahami produk, harga, syarat, dan cara memesan tanpa harus bertanya dari awal?", "Katalog atau halaman menjawab manfaat, harga, variasi, syarat, dan langkah pemesanan.", "Buat katalog atau halaman penawaran yang menjawab manfaat, harga, syarat, dan cara memesan.", 3, { blocker: true }),
  q("presence-mobile", "presence", "Apakah pengalaman dari ponsel cepat, nyaman dibaca, dan memiliki tombol tindakan yang jelas?", "Halaman diuji di ponsel; teks terbaca, gambar ringan, tombol dapat ditekan.", "Uji kanal utama dari ponsel dan perbaiki kecepatan, keterbacaan, serta tombol tindakan.", 2),
  q("presence-proof", "presence", "Apakah bukti kepercayaan tersedia dan relevan dengan calon pelanggan yang dituju?", "Ada testimoni, portofolio, ulasan, sertifikasi, studi kasus, atau kebijakan layanan.", "Kumpulkan dan tampilkan minimal tiga bukti kepercayaan yang relevan.", 2),
  q("presence-local", "presence", "Untuk usaha lokal, apakah profil lokasi dan petunjuk kunjungan sudah lengkap serta aktif?", "Profil lokasi memiliki pin, foto, jam, kategori, ulasan, dan nomor aktif.", "Lengkapi profil lokasi: pin, kategori, jam, foto, nomor aktif, dan proses meminta ulasan.", 2, { when: { models: ["local", "hybrid"] } }),
  q("presence-website", "presence", "Apakah usaha memiliki halaman milik sendiri untuk kampanye, penawaran, atau pengumpulan lead?", "Ada website/landing page dengan CTA, kebijakan dasar, dan pengukuran kunjungan.", "Siapkan satu landing page milik sendiri untuk penawaran prioritas dan pasang pengukuran dasar.", 2, { whenAny: [{ goals: ["leads", "sales"] }, { channels: ["website", "multi"] }] }),
  q("brand-identity", "brand", "Apakah identitas visual dan gaya bahasa digunakan konsisten di seluruh titik kontak?", "Logo, warna, tipografi, contoh penggunaan, dan gaya bahasa terdokumentasi.", "Susun panduan satu halaman untuk logo, warna, tipografi, gaya bahasa, dan contoh penerapan.", 1),
  q("brand-message", "brand", "Apakah pesan utama menyesuaikan kebutuhan pelanggan, bukan hanya menjelaskan fitur usaha?", "Konten menggunakan masalah, hasil, bukti, dan bahasa yang dipahami pelanggan.", "Ubah pesan utama menjadi masalah, hasil, bukti, dan ajakan bertindak.", 2),
  q("brand-content", "brand", "Apakah konten diterbitkan dengan tema dan frekuensi yang realistis untuk kapasitas tim?", "Ada tema konten, kalender, format berulang, dan jadwal yang benar-benar dijalankan.", "Tetapkan tema, format berulang, dan jadwal konten yang sesuai kapasitas tim.", 2),
  q("brand-performance", "brand", "Apakah keputusan konten didasarkan pada respons yang menghasilkan tindakan bisnis?", "Topik dinilai dari klik, percakapan, lead, atau penjualan—bukan hanya tayangan.", "Tinjau konten berdasarkan klik, percakapan, lead, dan penjualan.", 2, { when: { stages: ["running", "growing"] } }),
  q("conversion-cta", "conversion", "Apakah setiap kanal utama memiliki satu tindakan berikutnya yang jelas bagi pelanggan?", "CTA menuju WhatsApp, formulir, checkout, pemesanan, atau konsultasi berfungsi.", "Tetapkan satu CTA utama pada setiap kanal dan uji tautan sampai proses selesai.", 3, { blocker: true }),
  q("conversion-response", "conversion", "Apakah pertanyaan dan lead ditanggapi dalam waktu yang ditetapkan dengan jawaban konsisten?", "Ada target waktu respons, template jawaban, pembagian tanggung jawab, dan pemantauan lead terlewat.", "Tetapkan SLA respons, template jawaban, dan daftar lead yang harus ditindaklanjuti.", 2),
  q("conversion-followup", "conversion", "Apakah calon pelanggan yang belum membeli memiliki proses tindak lanjut yang sopan dan terjadwal?", "Ada status lead, alasan belum membeli, jadwal follow-up, dan batas frekuensi komunikasi.", "Buat tiga tahap tindak lanjut untuk lead hangat dengan jadwal dan batas komunikasi.", 2, { when: { stages: ["running", "growing"] } }),
  q("conversion-funnel", "conversion", "Apakah jumlah orang pada setiap tahap—datang, bertanya, ditawari, membeli—dapat dihitung?", "Ada volume dan rasio perpindahan pada minimal tiga tahap perjalanan pelanggan.", "Catat kunjungan/lead, percakapan, penawaran, dan transaksi untuk menemukan kebocoran.", 3, { when: { stages: ["running", "growing"] } }),
  q("conversion-payment", "conversion", "Apakah pemesanan dan pembayaran dapat diselesaikan dengan sedikit hambatan?", "Harga/syarat jelas, metode pembayaran sesuai, dan pelanggan tahu statusnya.", "Uji pemesanan sebagai pelanggan dan hilangkan langkah yang menimbulkan keraguan.", 2),
  q("growth-goal", "growth", "Apakah setiap kampanye memiliki satu sasaran, audiens, penawaran, dan ukuran hasil?", "Brief kampanye mencantumkan sasaran, audiens, pesan, CTA, periode, anggaran, dan KPI.", "Gunakan brief kampanye satu halaman sebelum membuat promosi.", 2),
  q("growth-organic", "growth", "Apakah usaha mengetahui kanal organik yang menghasilkan calon pelanggan berkualitas?", "Sumber percakapan dan transaksi dicatat sehingga kanal dapat dibandingkan.", "Tambahkan pertanyaan sumber pelanggan dan rangkum lead serta transaksi per kanal.", 2),
  q("growth-measure", "growth", "Apakah biaya promosi dapat dibandingkan dengan lead, transaksi, omzet, dan margin?", "Ada biaya per lead, biaya per pelanggan, omzet, margin, dan periode pengembalian.", "Buat rekap kampanye berisi biaya, lead, transaksi, omzet, margin, dan biaya per pelanggan.", 3, { when: { stages: ["running", "growing"] } }),
  q("growth-ads", "growth", "Sebelum beriklan, apakah pelacakan, halaman tujuan, dan proses respons siap diuji?", "Tautan/UTM, halaman tujuan, CTA, pencatatan lead, dan SLA respons berfungsi.", "Jangan menaikkan anggaran sebelum pelacakan, landing page, CTA, dan tindak lanjut lolos uji.", 3, { blocker: true, when: { budgetBands: ["under500", "500to2", "2to5", "above5"] } }),
  q("system-orders", "system", "Apakah pesanan atau proyek memiliki status, pemilik tugas, tenggat, dan status pembayaran?", "Semua pekerjaan berada dalam satu daftar dengan status kerja dan pembayaran.", "Satukan pesanan/proyek dalam satu daftar dengan pemilik tugas, tenggat, dan pembayaran.", 3, { blocker: true, when: { stages: ["running", "growing"] } }),
  q("system-customers", "system", "Apakah data pelanggan, riwayat transaksi, dan izin komunikasi tercatat secara aman?", "Data minimum relevan tersimpan, akses dibatasi, persetujuan jelas, dan pelanggan dapat berhenti menerima pesan.", "Rapikan data pelanggan minimum beserta sumber, riwayat, izin, dan mekanisme berhenti.", 2, { when: { stages: ["running", "growing"] } }),
  q("system-retention", "system", "Apakah pelanggan lama memiliki program tindak lanjut berdasarkan waktu atau perilaku pembelian?", "Ada segmen pelanggan, pemicu follow-up, penawaran relevan, dan pengukuran pembelian ulang.", "Buat satu alur pembelian ulang berdasarkan waktu atau perilaku pelanggan.", 3, { whenAny: [{ goals: ["repeat"] }, { stages: ["growing"] }] }),
  q("system-review", "system", "Apakah kinerja digital ditinjau rutin dan menghasilkan keputusan yang ditugaskan?", "Tinjauan bulanan mencatat angka, penyebab, keputusan, penanggung jawab, dan tenggat.", "Adakan tinjauan bulanan dengan format angka–penyebab–keputusan–penanggung jawab–tenggat.", 2, { when: { stages: ["running", "growing"] } }),
  q("system-automation", "system", "Apakah otomatisasi hanya dipasang pada proses yang sudah jelas dan berulang?", "Proses manual terdokumentasi, pengecualian diketahui, dan kesalahan dipantau.", "Pilih satu proses stabil untuk diotomatisasi dan dokumentasikan pengecualiannya.", 1, { whenAny: [{ goals: ["efficiency"] }, { stages: ["growing"] }] }),
];

export const DEFAULT_DIGITAL_CONFIG = {
  localNote: "Jawaban dan hasil hanya tersimpan di perangkat ini.", startLabel: "Berikutnya", resultTitle: "Diagnosis digital usahamu", checklistTitle: "Prioritas tindakan berdasarkan jawabanmu", consultationLabel: "Konsultasikan kebutuhan", whatsappNumber: "",
  whatsappMessage: "Halo SBB, saya ingin mendiskusikan kebutuhan SBB Digital untuk {business}. Prioritas saya saat ini: {priority}.", categories, questions,
};

const cleanText = (value, fallback, max = 1000) => typeof value === "string" && value.trim() ? value.trim().slice(0, max) : fallback;
const cleanBudget = (value, fallback) => Math.min(Math.max(Number(value) || Number(fallback) || 0, 0), 1000000000);
const cleanOption = (value, options, fallback) => options.some(item => item.value === value) ? value : fallback;
const nullableNumber = (value, maximum = 1000000000) => value === "" || value === null || value === undefined ? null : Math.min(Math.max(Number(value) || 0, 0), maximum);
const roundBudget = value => Math.round(Math.max(value, 0) / 100000) * 100000;

export function sanitizeDigitalProfile(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const metrics = source.metrics && typeof source.metrics === "object" ? source.metrics : {};
  return {
    completed: source.completed === true, stage: cleanOption(source.stage, DIGITAL_PROFILE_OPTIONS.stages, DEFAULT_DIGITAL_PROFILE.stage), model: cleanOption(source.model, DIGITAL_PROFILE_OPTIONS.models, DEFAULT_DIGITAL_PROFILE.model),
    goal: cleanOption(source.goal, DIGITAL_PROFILE_OPTIONS.goals, DEFAULT_DIGITAL_PROFILE.goal), audience: cleanOption(source.audience, DIGITAL_PROFILE_OPTIONS.audiences, DEFAULT_DIGITAL_PROFILE.audience), channel: cleanOption(source.channel, DIGITAL_PROFILE_OPTIONS.channels, DEFAULT_DIGITAL_PROFILE.channel),
    team: cleanOption(source.team, DIGITAL_PROFILE_OPTIONS.teams, DEFAULT_DIGITAL_PROFILE.team), budgetBand: cleanOption(source.budgetBand, DIGITAL_PROFILE_OPTIONS.budgets, DEFAULT_DIGITAL_PROFILE.budgetBand),
    metrics: { monthlyLeads: nullableNumber(metrics.monthlyLeads), conversionPercent: nullableNumber(metrics.conversionPercent, 100), repeatPercent: nullableNumber(metrics.repeatPercent, 100), contentPerWeek: nullableNumber(metrics.contentPerWeek, 100), responseMinutes: nullableNumber(metrics.responseMinutes), adSpend: nullableNumber(metrics.adSpend) },
  };
}

export function sanitizeDigitalConfig(value) {
  const source = value && typeof value === "object" ? value : {}; const categorySource = Array.isArray(source.categories) ? source.categories : []; const questionSource = Array.isArray(source.questions) ? source.questions : [];
  return {
    ...DEFAULT_DIGITAL_CONFIG,
    ...Object.fromEntries(["localNote", "startLabel", "resultTitle", "checklistTitle", "consultationLabel", "whatsappNumber", "whatsappMessage"].map(key => [key, cleanText(source[key], DEFAULT_DIGITAL_CONFIG[key], key === "whatsappMessage" ? 500 : 160)])),
    whatsappNumber: String(source.whatsappNumber || "").replace(/\D/g, "").slice(0, 20),
    categories: DEFAULT_DIGITAL_CONFIG.categories.map(item => { const saved = categorySource.find(candidate => candidate?.id === item.id) || {}; const selfMin = cleanBudget(saved.selfBudgetMin, item.selfBudgetMin); const helpMin = cleanBudget(saved.helpBudgetMin, item.helpBudgetMin); return { ...item, title: cleanText(saved.title, item.title, 100), description: cleanText(saved.description, item.description, 400), objective: cleanText(saved.objective, item.objective, 300), successMetric: cleanText(saved.successMetric, item.successMetric, 400), selfBudgetMin: selfMin, selfBudgetMax: Math.max(cleanBudget(saved.selfBudgetMax, item.selfBudgetMax), selfMin), helpBudgetMin: helpMin, helpBudgetMax: Math.max(cleanBudget(saved.helpBudgetMax, item.helpBudgetMax), helpMin) }; }),
    questions: DEFAULT_DIGITAL_CONFIG.questions.map(item => { const saved = questionSource.find(candidate => candidate?.id === item.id) || {}; return { ...item, text: cleanText(saved.text, item.text, 400), evidence: cleanText(saved.evidence, item.evidence, 500), checklist: cleanText(saved.checklist, item.checklist, 600) }; }),
  };
}

function matchesCondition(condition = {}, profile) {
  for (const key of ["stages", "models", "goals", "audiences", "channels", "teams", "budgetBands"]) if (condition[key] && !condition[key].includes(profile[key === "budgetBands" ? "budgetBand" : key.slice(0, -1) || key])) return false;
  return true;
}

export function getDigitalQuestions(configValue, profileValue) {
  const config = sanitizeDigitalConfig(configValue); const profile = sanitizeDigitalProfile(profileValue);
  return config.questions.filter(question => (!question.when || matchesCondition(question.when, profile)) && (!question.whenAny || question.whenAny.some(condition => matchesCondition(condition, profile))));
}

export function sanitizeDigitalState(value, configValue = DEFAULT_DIGITAL_CONFIG) {
  const config = sanitizeDigitalConfig(configValue); const source = value && typeof value === "object" ? value : {}; const profile = sanitizeDigitalProfile(source.profile || {}); const allowed = new Set(config.questions.map(item => item.id)); const answers = {};
  for (const [id, answer] of Object.entries(source.answers || {})) if (allowed.has(id) && [0, 1, 2, 3].includes(Number(answer))) answers[id] = Number(answer);
  const active = getDigitalQuestions(config, profile); const complete = profile.completed && active.length > 0 && active.every(item => Object.hasOwn(answers, item.id));
  return { version: 2, profile, answers, completed: source.completed === true && complete };
}

const GOAL_MULTIPLIERS = { awareness: { strategy: 1.15, presence: 1.25, brand: 1.3 }, leads: { strategy: 1.15, presence: 1.25, conversion: 1.3, growth: 1.2 }, sales: { strategy: 1.1, presence: 1.15, conversion: 1.35, growth: 1.2 }, repeat: { brand: 1.1, conversion: 1.15, system: 1.4 }, efficiency: { conversion: 1.2, system: 1.45 } };
function buildSignals(profile) {
  const m = profile.metrics; const signals = [];
  if (m.monthlyLeads !== null && m.monthlyLeads < 5 && ["leads", "sales"].includes(profile.goal)) signals.push({ tone: "danger", text: "Lead bulanan masih sangat rendah untuk sasaran pertumbuhan." });
  if (m.conversionPercent !== null && m.conversionPercent < 3) signals.push({ tone: "danger", text: "Konversi di bawah 3%; perbaiki penawaran dan tindak lanjut sebelum menambah traffic." });
  if (m.responseMinutes !== null && m.responseMinutes > 60) signals.push({ tone: "warning", text: "Waktu respons di atas satu jam berisiko membuat lead berpindah." });
  if (m.contentPerWeek !== null && m.contentPerWeek < 2 && profile.goal === "awareness") signals.push({ tone: "warning", text: "Frekuensi konten belum mendukung sasaran awareness." });
  if (m.adSpend > 0 && m.conversionPercent === null) signals.push({ tone: "warning", text: "Ada belanja iklan, tetapi tingkat konversi belum dicatat." });
  if (m.repeatPercent !== null && m.repeatPercent < 20 && profile.goal === "repeat") signals.push({ tone: "danger", text: "Pembelian ulang di bawah 20%; prioritaskan retensi." });
  return signals.slice(0, 4);
}

export function calculateDigitalAssessment(configValue, stateValue) {
  const config = sanitizeDigitalConfig(configValue); const state = sanitizeDigitalState(stateValue, config); const profile = state.profile; const activeQuestions = getDigitalQuestions(config, profile); const multipliers = GOAL_MULTIPLIERS[profile.goal] || {};
  const categoryResults = config.categories.map(category => { const categoryQuestions = activeQuestions.filter(item => item.category === category.id); const maximum = categoryQuestions.reduce((sum, item) => sum + (item.weight || 1) * 3, 0); const earned = categoryQuestions.reduce((sum, item) => sum + (item.weight || 1) * (state.answers[item.id] ?? 0), 0); const readiness = maximum ? Math.round(earned / maximum * 100) : 100; return { ...category, questions: categoryQuestions, answered: categoryQuestions.filter(item => Object.hasOwn(state.answers, item.id)).length, gap: maximum - earned, maximum, readiness, urgency: (maximum - earned) * (multipliers[category.id] || 1) }; }).filter(item => item.questions.length).sort((a, b) => b.urgency - a.urgency || a.title.localeCompare(b.title));
  const unfinished = categoryResults.filter(item => item.gap > 0); categoryResults.forEach((item, index) => { item.level = item.gap === 0 ? "maintain" : index === 0 ? "now" : "next"; item.levelLabel = item.level === "now" ? "Prioritas sekarang" : item.level === "next" ? "Langkah berikutnya" : "Pertahankan"; });
  const checklist = activeQuestions.filter(item => (state.answers[item.id] ?? 0) < 3).map(item => { const answer = state.answers[item.id] ?? 0; const gap = 3 - answer; return { ...item, answer, gap, urgency: gap * (item.weight || 1) * (multipliers[item.category] || 1) + (item.blocker && answer <= 1 ? 4 : 0), categoryTitle: config.categories.find(category => category.id === item.category)?.title || item.category }; }).sort((a, b) => b.urgency - a.urgency || b.gap - a.gap);
  const blockers = checklist.filter(item => item.blocker && item.answer <= 1).slice(0, 4); const totalMaximum = categoryResults.reduce((sum, item) => sum + item.maximum, 0); const totalEarned = categoryResults.reduce((sum, item) => sum + item.maximum * item.readiness / 100, 0); const overallReadiness = totalMaximum ? Math.round(totalEarned / totalMaximum * 100) : 0;
  const maturity = overallReadiness >= 85 ? { level: 5, label: "Siap ditingkatkan", summary: "Fondasi utama sudah terukur. Fokus pada eksperimen dan efisiensi." } : overallReadiness >= 70 ? { level: 4, label: "Terukur, perlu dioptimalkan", summary: "Sebagian besar sistem berjalan, tetapi masih ada kebocoran hasil." } : overallReadiness >= 50 ? { level: 3, label: "Berjalan, belum terhubung", summary: "Aktivitas digital sudah ada, tetapi belum menjadi satu perjalanan pelanggan." } : overallReadiness >= 25 ? { level: 2, label: "Fondasi masih terpisah", summary: "Beberapa aset tersedia, namun proses dan pengukurannya belum konsisten." } : { level: 1, label: "Fondasi belum terbentuk", summary: "Mulai dari pelanggan, penawaran, kehadiran, dan jalur pemesanan." };
  const taskLimit = profile.team === "solo" ? 3 : 6; const planItems = checklist.slice(0, taskLimit); const perPhase = profile.team === "solo" ? 1 : 2; const phases = [{ days: 30, label: "0–30 hari", focus: "Perbaiki penghambat utama", items: planItems.slice(0, perPhase) }, { days: 60, label: "31–60 hari", focus: "Jalankan dan ukur", items: planItems.slice(perPhase, perPhase * 2) }, { days: 90, label: "61–90 hari", focus: "Rapikan dan tingkatkan", items: planItems.slice(perPhase * 2, perPhase * 3) }]; const fallback = ["Validasi kembali pelanggan, penawaran, dan jalur pemesanan dari ponsel.", "Jalankan perbaikan dan catat dampaknya pada lead, transaksi, atau waktu kerja.", "Tinjau hasil 60 hari dan hentikan aktivitas tanpa dampak."]; phases.forEach((phase, index) => { if (!phase.items.length) phase.items = [{ checklist: fallback[index], categoryTitle: index === 0 ? "Validasi" : index === 1 ? "Pengukuran" : "Optimalisasi" }]; });
  const budget = categoryResults.filter(item => item.gap > 0).reduce((total, item) => { const ratio = item.maximum ? item.gap / item.maximum : 0; total.selfMin += item.selfBudgetMin * ratio; total.selfMax += item.selfBudgetMax * ratio; total.helpMin += item.helpBudgetMin * ratio; total.helpMax += item.helpBudgetMax * ratio; return total; }, { selfMin: 0, selfMax: 0, helpMin: 0, helpMax: 0 }); Object.keys(budget).forEach(key => { budget[key] = roundBudget(budget[key]); }); const budgetOption = DIGITAL_PROFILE_OPTIONS.budgets.find(item => item.value === profile.budgetBand) || DIGITAL_PROFILE_OPTIONS.budgets[0]; budget.availableMax = budgetOption.maximum; budget.fit = budget.availableMax === 0 ? "Mulai dari langkah tanpa biaya dan jangan beriklan sebelum fondasi siap." : budget.selfMax <= budget.availableMax ? "Anggaran yang dipilih cukup untuk memulai prioritas secara mandiri." : "Anggaran belum cukup untuk seluruh kebutuhan; kerjakan satu penghambat terpenting lebih dahulu.";
  const priority = unfinished[0] || categoryResults[0]; const signals = buildSignals(profile); const brief = { objective: priority?.objective || "Menjaga fondasi digital tetap efektif.", currentCondition: `${maturity.label} (${overallReadiness}/100). ${blockers.length ? `${blockers.length} penghambat utama perlu diselesaikan.` : "Tidak ada penghambat kritis dari jawaban yang diberikan."}`, scope: planItems.map(item => item.checklist), successMetric: priority?.successMetric || "Perkembangan dapat dibuktikan dengan catatan hasil bulanan." };
  return { complete: profile.completed && activeQuestions.length > 0 && activeQuestions.every(item => Object.hasOwn(state.answers, item.id)), answered: activeQuestions.filter(item => Object.hasOwn(state.answers, item.id)).length, total: activeQuestions.length, profile, activeQuestions, categoryResults, checklist, blockers, signals, priority, overallReadiness, maturity, phases, budget, brief };
}

const optionLabel = (options, value) => options.find(item => item.value === value)?.label || value;
export function buildDigitalBrief(assessmentValue, businessName = "Usaha saya") {
  const assessment = assessmentValue && typeof assessmentValue === "object" ? assessmentValue : {}; const brief = assessment.brief || {}; const profile = sanitizeDigitalProfile(assessment.profile || {}); const phases = Array.isArray(assessment.phases) ? assessment.phases : []; const formatMoney = value => `Rp ${Math.round(Number(value) || 0).toLocaleString("id-ID")}`; const phaseLines = phases.map(phase => `${phase.label}: ${(phase.items || []).map(item => item.checklist).join("; ") || "Belum ada tindakan"}`).join("\n"); const metricLines = Object.entries(profile.metrics).filter(([, value]) => value !== null).map(([key, value]) => `${key}: ${value}`).join("; ") || "Belum diisi";
  return [`BRIEF SBB DIGITAL — ${cleanText(businessName, "Usaha saya", 80)}`, `Profil: ${optionLabel(DIGITAL_PROFILE_OPTIONS.stages, profile.stage)} · ${optionLabel(DIGITAL_PROFILE_OPTIONS.models, profile.model)} · ${optionLabel(DIGITAL_PROFILE_OPTIONS.audiences, profile.audience)}`, `Tujuan utama: ${optionLabel(DIGITAL_PROFILE_OPTIONS.goals, profile.goal)} melalui ${optionLabel(DIGITAL_PROFILE_OPTIONS.channels, profile.channel)}`, `Kematangan digital: ${assessment.maturity?.label || "Belum dinilai"} (${assessment.overallReadiness ?? 0}/100)`, `Prioritas: ${assessment.priority?.title || "Fondasi digital"}`, `Tujuan pekerjaan: ${brief.objective || "Meningkatkan kesiapan digital secara bertahap."}`, `Kondisi saat ini: ${brief.currentCondition || "Belum dinilai."}`, `Sinyal angka: ${metricLines}`, `Penghambat utama: ${(assessment.blockers || []).map(item => item.text).join("; ") || "Tidak ada penghambat kritis"}`, `Ruang lingkup: ${(brief.scope || []).join("; ") || "Pemeliharaan fondasi digital"}`, `Ukuran keberhasilan: ${brief.successMetric || "Hasil dapat diukur dan ditinjau setiap bulan."}`, `Rencana kerja:\n${phaseLines}`, `Estimasi dikerjakan sendiri: ${formatMoney(assessment.budget?.selfMin)}–${formatMoney(assessment.budget?.selfMax)}`, `Estimasi dengan bantuan: ${formatMoney(assessment.budget?.helpMin)}–${formatMoney(assessment.budget?.helpMax)}`, `Kesesuaian anggaran: ${assessment.budget?.fit || "Belum dinilai"}`, "Catatan: diagnosis berasal dari jawaban pengguna. Estimasi bukan penawaran harga dan belum termasuk media iklan, domain/hosting khusus, perangkat, pajak, atau pekerjaan di luar ruang lingkup."].join("\n\n");
}

export function buildDigitalWhatsappMessage(template, businessName, priorityTitle) { return cleanText(template, DEFAULT_DIGITAL_CONFIG.whatsappMessage, 500).replaceAll("{business}", cleanText(businessName, "usaha saya", 80)).replaceAll("{priority}", cleanText(priorityTitle, "fondasi digital", 100)); }
