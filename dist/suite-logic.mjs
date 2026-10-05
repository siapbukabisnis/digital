import { isValidISODate } from "./money-logic.mjs";

const PLAN_PREFIX = { Basic: "BSC", Pro: "PRO", Lifetime: "LFT", Trial: "TRY" };

export function sanitizeLocalSession(value, settings = {}, codes = [], now = new Date()) {
  if (!value || typeof value !== "object" || !["user", "admin"].includes(value.role)) return null;
  if (value.role === "admin" && value.provider !== "admin-code") return null;
  if (value.role === "user" && !["code", "google-demo"].includes(value.provider)) return null;
  const signedInAt = new Date(value.signedInAt || "");
  const age = now.getTime() - signedInAt.getTime();
  const days = Math.min(Math.max(Number(settings.sessionDays) || 30, 1), 90);
  if (!Number.isFinite(age) || age < -60_000 || age > days * 86400_000) return null;
  if (value.provider === "code") {
    const code = codes.find(item => item?.id === value.codeId);
    if (!code || ["revoked", "expired"].includes(licenseState(code, now))) return null;
  }
  const name = typeof value.name === "string" ? value.name.trim().slice(0, 80) : "";
  return { ...value, name: name || (value.role === "admin" ? "Admin SBB" : "Pengguna SBB"), plan: value.role === "admin" ? "Admin" : Object.hasOwn(PLAN_PREFIX, value.plan) ? value.plan : "Pro" };
}

export function normalizeAccessCode(value) {
  return String(value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function licenseState(license, now = new Date()) {
  if (!license || license.status === "revoked") return "revoked";
  if (license.expiresAt && (!isValidISODate(license.expiresAt) || new Date(`${license.expiresAt}T23:59:59`) < now)) return "expired";
  if (Number(license.activations) >= Number(license.maxActivations)) return "used";
  return "active";
}

export function canRedeemLicense(license, now = new Date()) {
  const state = licenseState(license, now);
  return { ok: state === "active", state };
}

export function generateLicenseCode(plan = "Pro", random = Math.random) {
  const prefix = PLAN_PREFIX[plan] || "PRO";
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () => Array.from({ length: 4 }, () => alphabet[Math.floor(random() * alphabet.length)]).join("");
  return `SBB-${prefix}-${block()}-${block()}`;
}

export function licenseMetrics(codes, users, now = new Date()) {
  const states = codes.map(code => licenseState(code, now));
  return {
    total: codes.length,
    available: states.filter(state => state === "active").length,
    used: states.filter(state => state === "used").length,
    revokedOrExpired: states.filter(state => state === "revoked" || state === "expired").length,
    activeUsers: users.filter(user => user.status === "active").length,
  };
}
