import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ClauseExplorer } from '../../src/components/ClauseExplorer';
import { Clause } from '../../src/types';

const mockClauses: Clause[] = [
  {
    id: 'clause-1',
    index: 1,
    category: 'financial',
    title: '1. RENT & LATE FEES',
    text: 'Tenant agrees to pay $2,000 monthly on the 1st. Late fee of $100 after 5 days.',
    riskLevel: 'warning',
    riskReason: 'Late fee is above standard threshold.'
  },
  {
    id: 'clause-2',
    index: 2,
    category: 'termination',
    title: '2. AUTOMATIC RENEWAL',
    text: 'Agreement automatically renews for 12 months unless notice is given 90 days prior.',
    riskLevel: 'critical',
    riskReason: '90-day exit notice window is excessive.'
  }
];

describe('ClauseExplorer Component', () => {
  it('renders interactive clause explorer heading and clauses list', () => {
    render(<ClauseExplorer clauses={mockClauses} />);
    expect(screen.getByText('Interactive Clause Explorer')).toBeInTheDocument();
    expect(screen.getAllByText('1. RENT & LATE FEES').length).toBeGreaterThan(0);
    expect(screen.getByText('2. AUTOMATIC RENEWAL')).toBeInTheDocument();
  });

  it('filters clauses when typing in search input', () => {
    render(<ClauseExplorer clauses={mockClauses} />);
    const searchInput = screen.getByLabelText('Search clauses or keywords');
    fireEvent.change(searchInput, { target: { value: 'RENEWAL' } });

    expect(screen.getAllByText('2. AUTOMATIC RENEWAL').length).toBeGreaterThan(0);
  });

  it('selects a clause when clicked', () => {
    const handleSelect = vi.fn();
    render(<ClauseExplorer clauses={mockClauses} onSelectClause={handleSelect} />);

    const secondClause = screen.getByText('2. AUTOMATIC RENEWAL').closest('[role="option"]');
    expect(secondClause).toBeInTheDocument();
    
    if (secondClause) {
      fireEvent.click(secondClause);
      expect(handleSelect).toHaveBeenCalledWith('clause-2');
    }
  });
});
