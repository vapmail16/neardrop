import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QRDisplay } from './QRDisplay';

describe('QRDisplay', () => {
  it('renders QR container and expiry text', () => {
    render(<QRDisplay token="test-jwt-value" expiresAt="2026-12-01T12:00:00.000Z" />);
    expect(screen.getByTestId('customer-qr-display')).toBeInTheDocument();
    expect(screen.getByText(/collection code/i)).toBeInTheDocument();
  });
});
