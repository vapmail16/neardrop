import { describe, expect, it } from 'vitest';
import { affiliateActionLabel, affiliateAllowedNextStatuses } from './affiliate-transitions';

describe('affiliateAllowedNextStatuses', () => {
  it('allows drop only from in_transit', () => {
    expect(affiliateAllowedNextStatuses('in_transit')).toEqual(['dropped_at_affiliate']);
    expect(affiliateAllowedNextStatuses('manifest_received')).toEqual([]);
    expect(affiliateAllowedNextStatuses('ready_to_collect')).toEqual([]);
  });
});

describe('affiliateActionLabel', () => {
  it('labels confirm receipt', () => {
    expect(affiliateActionLabel('dropped_at_affiliate')).toBe('Confirm parcel received');
  });
});
