/**
 * Phase 1 password policy — reject weak / fair per MVP plan (MASTER_CHECKLIST).
 */
export type PasswordTier = 'reject' | 'good' | 'strong';

const BLOCKLIST = new Set(
  [
    'password',
    'password123',
    'qwerty',
    '12345678',
    '123456789',
    'changeme',
    'letmein',
    'welcome',
    'admin',
    'neardrop',
  ].map((s) => s.toLowerCase()),
);

function charClasses(password: string): { upper: boolean; lower: boolean; digit: boolean; special: boolean } {
  let upper = false;
  let lower = false;
  let digit = false;
  let special = false;
  for (const ch of password) {
    if (ch >= 'A' && ch <= 'Z') upper = true;
    else if (ch >= 'a' && ch <= 'z') lower = true;
    else if (ch >= '0' && ch <= '9') digit = true;
    else special = true;
  }
  return { upper, lower, digit, special };
}

/**
 * Classify password strength. WEAK/FAIR from the plan map to `reject`.
 */
export function classifyPassword(password: string): PasswordTier {
  if (password.length < 12 || password.length > 128) return 'reject';
  const normalized = password.trim().toLowerCase();
  for (const weak of BLOCKLIST) {
    if (normalized.includes(weak)) return 'reject';
  }
  const { upper, lower, digit, special } = charClasses(password);
  const classes = [upper, lower, digit, special].filter(Boolean).length;
  if (classes < 3) return 'reject';

  const hasAllFour = upper && lower && digit && special;
  if (!hasAllFour) return 'reject';

  if (password.length >= 16) return 'strong';
  return 'good';
}

export function isPasswordAcceptableForAuth(password: string): boolean {
  const tier = classifyPassword(password);
  return tier === 'good' || tier === 'strong';
}
