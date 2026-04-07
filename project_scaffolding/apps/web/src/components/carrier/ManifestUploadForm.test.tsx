import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ManifestUploadForm } from './ManifestUploadForm';

const uploadManifest = vi.fn();

vi.mock('@/lib/api/parcels', () => ({
  uploadManifest: (...a: unknown[]) => uploadManifest(...a),
}));

afterEach(() => {
  uploadManifest.mockReset();
});

describe('ManifestUploadForm', () => {
  it('disables submit when empty', () => {
    render(<ManifestUploadForm />);
    expect(screen.getByRole('button', { name: /upload manifest/i })).toBeDisabled();
  });

  it('submits CSV and shows summary', async () => {
    const user = userEvent.setup();
    uploadManifest.mockResolvedValue({
      total: 2,
      matchedAffiliate: 2,
      unmatched: 0,
      parcelIds: ['a', 'b'],
    });
    render(<ManifestUploadForm />);
    await user.type(screen.getByTestId('manifest-csv-input'), 'carrier_ref,x,y\nr1,A,SW1A1AA');
    await user.click(screen.getByRole('button', { name: /upload manifest/i }));
    expect(uploadManifest).toHaveBeenCalledWith({
      format: 'csv',
      content: 'carrier_ref,x,y\nr1,A,SW1A1AA',
    });
    expect(await screen.findByTestId('manifest-summary')).toBeInTheDocument();
  });

  it('shows error when upload fails', async () => {
    const user = userEvent.setup();
    uploadManifest.mockRejectedValue(new Error('bad csv'));
    render(<ManifestUploadForm />);
    await user.type(screen.getByTestId('manifest-csv-input'), 'x');
    await user.click(screen.getByRole('button', { name: /upload manifest/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('bad csv');
  });
});
