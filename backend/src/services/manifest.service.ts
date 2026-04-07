import type { ManifestRowParsed } from '@neardrop/shared';
import { manifestRowSchema } from '@neardrop/shared';

export type CsvParseError = { row: number; message: string };

/**
 * Parses NearDrop manifest CSV (header row required).
 * Columns: carrier_ref, recipient_name, recipient_postcode, recipient_email (optional), estimated_drop_time (optional).
 * Does not support commas inside quoted fields (keep names comma-free for MVP).
 */
export function parseManifestCsv(content: string): {
  rows: ManifestRowParsed[];
  errors: CsvParseError[];
} {
  const errors: CsvParseError[] = [];
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) {
    errors.push({
      row: 0,
      message: 'CSV must include a header row and at least one data row',
    });
    return { rows: [], errors };
  }

  const firstLine = lines[0];
  if (!firstLine) {
    errors.push({ row: 0, message: 'CSV must include a header row' });
    return { rows: [], errors };
  }
  const header = firstLine.split(',').map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);

  const iRef = col('carrier_ref');
  const iName = col('recipient_name');
  const iPc = col('recipient_postcode');
  const iEmail = col('recipient_email');
  const iEst = col('estimated_drop_time');

  if (iRef < 0 || iName < 0 || iPc < 0) {
    errors.push({
      row: 1,
      message: 'Missing required columns: carrier_ref, recipient_name, recipient_postcode',
    });
    return { rows: [], errors };
  }

  const rows: ManifestRowParsed[] = [];
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li];
    if (!line) continue;
    const cells = line.split(',').map((c) => c.trim());
    const carrierRef = cells[iRef] ?? '';
    const recipientName = cells[iName] ?? '';
    const recipientPostcode = cells[iPc] ?? '';
    const recipientEmail = iEmail >= 0 ? (cells[iEmail] ?? '') : '';
    const estimatedDropTime = iEst >= 0 ? (cells[iEst] ?? '') : '';

    const raw = {
      carrierRef,
      recipientName,
      recipientPostcode,
      recipientEmail: recipientEmail || undefined,
      estimatedDropTime: estimatedDropTime || undefined,
    };

    const parsed = manifestRowSchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join('; ');
      errors.push({ row: li + 1, message: msg });
      continue;
    }
    rows.push(parsed.data);
  }

  return { rows, errors };
}
