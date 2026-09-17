import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentUploadModal } from '../../src/components/DocumentUploadModal.jsx';

describe('DocumentUploadModal Component', () => {
  it('renders modal when isOpen is true and shows samples by default', () => {
    render(
      <DocumentUploadModal
        isOpen={true}
        onClose={() => {}}
        onAnalyzeText={async () => {}}
        onAnalyzeFile={async () => {}}
        isLoading={false}
        onSelectSample={() => {}}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Pre-Loaded Samples')).toBeInTheDocument();
  });

  it('switches tabs when clicking Paste Contract Text tab', () => {
    render(
      <DocumentUploadModal
        isOpen={true}
        onClose={() => {}}
        onAnalyzeText={async () => {}}
        onAnalyzeFile={async () => {}}
        isLoading={false}
        onSelectSample={() => {}}
      />
    );

    const pasteTab = screen.getByRole('button', { name: /Paste Contract Text/i });
    fireEvent.click(pasteTab);

    expect(screen.getByPlaceholderText(/Paste clauses, lease text/i)).toBeInTheDocument();
  });

  it('selects sample when clicking a sample card', () => {
    const handleSelectSample = vi.fn();
    render(
      <DocumentUploadModal
        isOpen={true}
        onClose={() => {}}
        onAnalyzeText={async () => {}}
        onAnalyzeFile={async () => {}}
        isLoading={false}
        onSelectSample={handleSelectSample}
      />
    );

    const sampleTitle = screen.getByText(/Residential Lease Agreement \(Landlord-Biased\)/i);
    fireEvent.click(sampleTitle);

    expect(handleSelectSample).toHaveBeenCalledWith('residential-lease-trap');
  });
});
