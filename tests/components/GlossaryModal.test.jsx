import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GlossaryModal } from '../../src/components/GlossaryModal.jsx';

describe('GlossaryModal Component', () => {
  it('renders modal when open', () => {
    render(<GlossaryModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Consumer Legal Glossary & Jargon Explainer')).toBeInTheDocument();
  });

  it('filters terms based on search input', () => {
    render(<GlossaryModal isOpen={true} onClose={() => {}} />);

    const searchInput = screen.getByLabelText(/Search legal term or phrase/i);
    fireEvent.change(searchInput, { target: { value: 'Indemnity' } });

    expect(screen.getByText('Indemnity / Hold Harmless')).toBeInTheDocument();
  });

  it('filters terms by category chip selection', () => {
    render(<GlossaryModal isOpen={true} onClose={() => {}} />);

    const financialTab = screen.getByRole('tab', { name: 'Financial' });
    fireEvent.click(financialTab);

    expect(screen.getByText('Liquidated Damages')).toBeInTheDocument();
  });
});
