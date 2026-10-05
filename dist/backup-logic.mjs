export const SBB_BACKUP_FORMAT = "sbb-local-backup";
export const SBB_BACKUP_VERSION = 2;
export const SBB_BACKUP_MAX_BYTES = 5 * 1024 * 1024;

const isObject = value => Boolean(value) && typeof value === "object" && !Array.isArray(value);

function checksumFor(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let hash = 2166136261;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createBackupPayload(data, exportedAt = new Date().toISOString()) {
  const source = isObject(data) ? data : {};
  const normalizedData = {
    transactions: Array.isArray(source.transactions) ? source.transactions : [],
    moneySettings: isObject(source.moneySettings) ? source.moneySettings : {},
    readinessProfile: isObject(source.readinessProfile) ? source.readinessProfile : {},
    healthProfile: isObject(source.healthProfile) ? source.healthProfile : {},
    healthHistory: Array.isArray(source.healthHistory) ? source.healthHistory : [],
    businessCalculators: isObject(source.businessCalculators) ? source.businessCalculators : null,
    digitalState: isObject(source.digitalState) ? source.digitalState : {},
    ...(isObject(source.profileStatus) ? { profileStatus: { readiness: Boolean(source.profileStatus.readiness), health: Boolean(source.profileStatus.health) } } : {}),
  };
  return {
    format: SBB_BACKUP_FORMAT,
    version: SBB_BACKUP_VERSION,
    exportedAt,
    checksum: checksumFor(normalizedData),
    data: normalizedData,
  };
}

export function parseBackupText(text) {
  const source = String(text || "");
  if (!source.trim()) throw new Error("File backup kosong.");
  if (new TextEncoder().encode(source).length > SBB_BACKUP_MAX_BYTES) throw new Error("File backup melebihi batas 5 MB.");

  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error("File bukan backup JSON SBB yang valid.");
  }
  if (!isObject(parsed) || parsed.format !== SBB_BACKUP_FORMAT) throw new Error("Format file tidak dikenali sebagai backup SBB.");
  if (![1, SBB_BACKUP_VERSION].includes(parsed.version)) throw new Error("Versi backup belum didukung oleh aplikasi ini.");
  if (!isObject(parsed.data)) throw new Error("Isi backup SBB tidak lengkap.");

  const data = parsed.data;
  if (!Array.isArray(data.transactions)) throw new Error("Data transaksi dalam backup tidak valid.");
  if (!isObject(data.moneySettings) || !isObject(data.readinessProfile) || !isObject(data.healthProfile)) throw new Error("Data pengaturan dalam backup tidak valid.");
  if (!Array.isArray(data.healthHistory)) throw new Error("Riwayat SBB Health dalam backup tidak valid.");
  if (data.businessCalculators !== null && !isObject(data.businessCalculators)) throw new Error("Data SBB Business dalam backup tidak valid.");
  if (data.digitalState !== undefined && !isObject(data.digitalState)) throw new Error("Data SBB Digital dalam backup tidak valid.");
  if (data.profileStatus !== undefined && (!isObject(data.profileStatus) || typeof data.profileStatus.readiness !== "boolean" || typeof data.profileStatus.health !== "boolean")) throw new Error("Status pemeriksaan dalam backup tidak valid.");

  const normalizedData = createBackupPayload(data, parsed.exportedAt).data;
  if (parsed.version === SBB_BACKUP_VERSION && parsed.checksum !== checksumFor(normalizedData)) {
    throw new Error("Isi backup berubah atau rusak. Gunakan file backup asli yang belum diedit.");
  }
  return normalizedData;
}
