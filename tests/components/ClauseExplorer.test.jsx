import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClauseExplorer } from '../../src/components/ClauseExplorer.jsx';

const mockClauses = [
  {
    id: 'clause-1',
    index: 0,
    title: '1. PREMISES AND TERM',
    category: 'general',
    text: 'Landlord leases to tenant Apt 4B for twelve months.',
    riskLevel: 'standard'
  },
  {
    id: 'clause-2',
    index: 1,
    title: '2. LANDLORD RIGHT OF ENTRY',
    category: 'privacy',
    text: 'Landlord may enter without prior notice at any time day or night.',
    riskLevel: 'critical',
    riskReason: 'Allows entry without prior notice.',
    suggestedRevision: 'Require 24 hours advance notice.'
  }
];

describe('ClauseExplorer Component', () => {
  it('renders interactive clause list and detail view', () => {
    render(<ClauseExplorer clauses={mockClauses} />);

    const titles = screen.getAllByText('1. PREMISES AND TERM');
    const textElements = screen.getAllByText('Landlord leases to tenant Apt 4B for twelve months.');
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('filters clauses when typing in the search box', () => {
    render(<ClauseExplorer clauses={mockClauses} />);

    const searchInput = screen.getByLabelText(/Search clauses or keywords/i);
    fireEvent.change(searchInput, { target: { value: 'ENTRY' } });

    expect(screen.getByText('2. LANDLORD RIGHT OF ENTRY')).toBeInTheDocument();
  });

  it('calls onSelectClause when a clause card is clicked', () => {
    const handleSelect = vi.fn();
    render(<ClauseExplorer clauses={mockClauses} onSelectClause={handleSelect} />);

    const clauseCards = screen.getAllByRole('option');
    fireEvent.click(clauseCards[1]);

    expect(handleSelect).toHaveBeenCalledWith('clause-2');
  });
});
