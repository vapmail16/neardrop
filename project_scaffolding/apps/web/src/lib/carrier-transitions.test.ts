import { describe, expect, it } from 'vitest';
import { carrierActionLabel, carrierAllowedNextStatuses } from './carrier-transitions';

describe('carrierAllowedNextStatuses', () => {
  it('allows in_transit from manifest_received', () => {
    expect(carrierAllowedNextStatuses('manifest_received')).toEqual(['in_transit']);
  });

  it('allows dropped_at_affiliate from in_transit', () => {
    expect(carrierAllowedNextStatuses('in_transit')).toEqual(['dropped_at_affiliate']);
  });

  it('allows ready_to_collect from dropped_at_affiliate', () => {
    expect(carrierAllowedNextStatuses('dropped_at_affiliate')).toEqual(['ready_to_collect']);
  });

  it('returns empty for terminal or non-carrier statuses', () => {
    expect(carrierAllowedNextStatuses('collected')).toEqual([]);
    expect(carrierAllowedNextStatuses('exception')).toEqual([]);
    expect(carrierAllowedNextStatuses('ready_to_collect')).toEqual([]);
  });
});

describe('carrierActionLabel', () => {
  it('labels known transitions', () => {
    expect(carrierActionLabel('in_transit')).toBe('Mark in transit');
    expect(carrierActionLabel('dropped_at_affiliate')).toBe('Confirm drop at affiliate');
    expect(carrierActionLabel('ready_to_collect')).toBe('Mark ready to collect');
  });

  it('falls back to status string for unknown', () => {
    expect(carrierActionLabel('collected')).toBe('collected');
  });
});
