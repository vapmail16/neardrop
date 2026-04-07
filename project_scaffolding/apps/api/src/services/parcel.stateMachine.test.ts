import { describe, expect, it } from 'vitest';
import { canTransition, transitionDeniedReason } from './parcel.stateMachine.js';

const roles = ['carrier', 'customer', 'affiliate', 'ops'] as const;

describe('parcel state machine', () => {
  it('allows manifest_received → in_transit for carrier only', () => {
    expect(canTransition('manifest_received', 'in_transit', 'carrier')).toBe(true);
    expect(canTransition('manifest_received', 'in_transit', 'affiliate')).toBe(false);
    expect(canTransition('manifest_received', 'in_transit', 'ops')).toBe(false);
    expect(canTransition('manifest_received', 'in_transit', 'customer')).toBe(false);
  });

  it('allows in_transit → dropped_at_affiliate for carrier and affiliate', () => {
    expect(canTransition('in_transit', 'dropped_at_affiliate', 'carrier')).toBe(true);
    expect(canTransition('in_transit', 'dropped_at_affiliate', 'affiliate')).toBe(true);
    expect(canTransition('in_transit', 'dropped_at_affiliate', 'ops')).toBe(false);
  });

  it('allows dropped_at_affiliate → ready_to_collect for carrier, ops, system', () => {
    expect(canTransition('dropped_at_affiliate', 'ready_to_collect', 'carrier')).toBe(true);
    expect(canTransition('dropped_at_affiliate', 'ready_to_collect', 'ops')).toBe(true);
    expect(canTransition('dropped_at_affiliate', 'ready_to_collect', 'system')).toBe(true);
    expect(canTransition('dropped_at_affiliate', 'ready_to_collect', 'affiliate')).toBe(false);
  });

  it('allows ready_to_collect → collected for ops only (affiliate uses POST /collect)', () => {
    expect(canTransition('ready_to_collect', 'collected', 'affiliate')).toBe(false);
    expect(canTransition('ready_to_collect', 'collected', 'carrier')).toBe(false);
    expect(canTransition('ready_to_collect', 'collected', 'ops')).toBe(true);
  });

  it('allows any non-exception state → exception for affiliate and ops', () => {
    const states = [
      'manifest_received',
      'in_transit',
      'dropped_at_affiliate',
      'ready_to_collect',
      'collected',
    ] as const;
    for (const s of states) {
      expect(canTransition(s, 'exception', 'affiliate')).toBe(true);
      expect(canTransition(s, 'exception', 'ops')).toBe(true);
      expect(canTransition(s, 'exception', 'carrier')).toBe(false);
      expect(canTransition(s, 'exception', 'customer')).toBe(false);
    }
  });

  it('allows exception → ready_to_collect for ops only', () => {
    expect(canTransition('exception', 'ready_to_collect', 'ops')).toBe(true);
    expect(canTransition('exception', 'ready_to_collect', 'carrier')).toBe(false);
    expect(canTransition('exception', 'ready_to_collect', 'affiliate')).toBe(false);
  });

  it('rejects same-state transitions', () => {
    for (const s of [
      'manifest_received',
      'in_transit',
      'dropped_at_affiliate',
      'ready_to_collect',
      'collected',
      'exception',
    ] as const) {
      for (const a of roles) {
        expect(canTransition(s, s, a)).toBe(false);
      }
    }
  });

  it('rejects manifest_received → collected shortcut', () => {
    expect(canTransition('manifest_received', 'collected', 'carrier')).toBe(false);
    expect(canTransition('manifest_received', 'collected', 'ops')).toBe(false);
  });

  it('transitionDeniedReason returns null when allowed', () => {
    expect(transitionDeniedReason('in_transit', 'dropped_at_affiliate', 'carrier')).toBeNull();
  });

  it('transitionDeniedReason explains same status', () => {
    expect(transitionDeniedReason('in_transit', 'in_transit', 'carrier')).toContain('already');
  });

  it('rejects exception to in_transit', () => {
    expect(canTransition('exception', 'in_transit', 'ops')).toBe(false);
  });

  it('rejects manifest_received to dropped_at_affiliate shortcut', () => {
    expect(canTransition('manifest_received', 'dropped_at_affiliate', 'carrier')).toBe(false);
  });

  it('rejects ops moving manifest_received to in_transit', () => {
    expect(canTransition('manifest_received', 'in_transit', 'ops')).toBe(false);
  });

  it('rejects customer reporting exception', () => {
    expect(canTransition('ready_to_collect', 'exception', 'customer')).toBe(false);
  });
});
