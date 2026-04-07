#!/usr/bin/env node
/**
 * Fail-fast env check for local/CI (aligns with apps/api config schema).
 * Usage: node scripts/verify-env.mjs
 * Loads `.env` if present via manual read — keeps Phase 0 dependency-free.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');

if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

const required = ['JWT_SECRET', 'DATABASE_URL'];
const missing = required.filter((k) => !process.env[k] || process.env[k] === '');
if (missing.length) {
  console.error(`verify-env: missing: ${missing.join(', ')}`);
  process.exit(1);
}

if ((process.env.JWT_SECRET ?? '').length < 32) {
  console.error('verify-env: JWT_SECRET must be at least 32 characters');
  process.exit(1);
}

console.log('verify-env: ok');
