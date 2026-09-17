import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentUploadModal } from '../../src/components/DocumentUploadModal';

describe('DocumentUploadModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <DocumentUploadModal
        isOpen={false}
        onClose={vi.fn()}
        onAnalyzeText={vi.fn()}
        onAnalyzeFile={vi.fn()}
        isLoading={false}
        onSelectSample={vi.fn()}
      />
    );
    expect(screen.queryByText('Analyze a Legal Document')).not.toBeInTheDocument();
  });

  it('renders pre-loaded samples tab when isOpen is true', () => {
    render(
      <DocumentUploadModal
        isOpen={true}
        onClose={vi.fn()}
        onAnalyzeText={vi.fn()}
        onAnalyzeFile={vi.fn()}
        isLoading={false}
        onSelectSample={vi.fn()}
      />
    );
    expect(screen.getByText('Analyze a Legal Document')).toBeInTheDocument();
    expect(screen.getByText('Pre-Loaded Samples')).toBeInTheDocument();
  });

  it('selects sample when clicking a sample card', () => {
    const handleSelectSample = vi.fn();
    const handleClose = vi.fn();
    render(
      <DocumentUploadModal
        isOpen={true}
        onClose={handleClose}
        onAnalyzeText={vi.fn()}
        onAnalyzeFile={vi.fn()}
        isLoading={false}
        onSelectSample={handleSelectSample}
      />
    );

    const sampleCard = screen.getAllByRole('button', { name: /Load Contract/i })[0];
    fireEvent.click(sampleCard);

    expect(handleSelectSample).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
