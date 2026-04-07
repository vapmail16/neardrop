import { describe, expect, it } from 'vitest';
import { parseManifestCsv } from './manifest.service.js';

describe('parseManifestCsv', () => {
  it('parses header and one valid row', () => {
    const csv =
      'carrier_ref,recipient_name,recipient_postcode,recipient_email,estimated_drop_time\n' +
      'R1,Alice,SW1A1AA,cust@example.com,';
    const { rows, errors } = parseManifestCsv(csv);
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.carrierRef).toBe('R1');
    expect(rows[0]?.recipientPostcode).toBe('SW1A 1AA');
  });

  it('rejects when required columns missing', () => {
    const { rows, errors } = parseManifestCsv('a,b\n1,2');
    expect(rows).toHaveLength(0);
    expect(errors.some((e) => e.message.includes('Missing required'))).toBe(true);
  });

  it('rejects empty file', () => {
    const { rows, errors } = parseManifestCsv('');
    expect(rows).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects header-only csv', () => {
    const { rows, errors } = parseManifestCsv(
      'carrier_ref,recipient_name,recipient_postcode',
    );
    expect(rows).toHaveLength(0);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('records row number for invalid data line', () => {
    const csv =
      'carrier_ref,recipient_name,recipient_postcode\n' + 'R1,Name,NOT_A_POSTCODE';
    const { rows, errors } = parseManifestCsv(csv);
    expect(rows).toHaveLength(0);
    expect(errors.some((e) => e.row === 2)).toBe(true);
  });
});
