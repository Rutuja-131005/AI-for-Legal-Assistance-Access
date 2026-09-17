import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GlossaryModal } from '../../src/components/GlossaryModal';

describe('GlossaryModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(<GlossaryModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Consumer Legal Glossary & Jargon Explainer')).not.toBeInTheDocument();
  });

  it('renders modal dialog when isOpen is true and traps focus', () => {
    render(<GlossaryModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Consumer Legal Glossary & Jargon Explainer')).toBeInTheDocument();
    expect(screen.getByLabelText('Search legal term or phrase')).toBeInTheDocument();
  });

  it('filters terms when typing in search input', () => {
    render(<GlossaryModal isOpen={true} onClose={vi.fn()} />);
    const searchInput = screen.getByLabelText('Search legal term or phrase');
    fireEvent.change(searchInput, { target: { value: 'Indemnity' } });

    expect(screen.getByText('Indemnity / Hold Harmless')).toBeInTheDocument();
  });

  it('calls onClose when pressing Escape key', () => {
    const handleClose = vi.fn();
    render(<GlossaryModal isOpen={true} onClose={handleClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
