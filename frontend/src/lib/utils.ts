/** Minimal class name helper (expand with clsx/tailwind-merge in UI phases). */
export function cn(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(' ');
}
