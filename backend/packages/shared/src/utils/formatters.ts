export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const keep = Math.min(2, local.length);
  return `${local.slice(0, keep)}***@${domain}`;
}
