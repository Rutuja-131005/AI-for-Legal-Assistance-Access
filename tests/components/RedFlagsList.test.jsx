import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RedFlagsList } from '../../src/components/RedFlagsList.jsx';

const mockRedFlags = [
  {
    id: 'flag-1',
    clauseId: 'clause-1',
    clauseTitle: 'Entry Notice',
    verbatimQuote: 'enter at any time without notice',
    riskLevel: 'critical',
    category: 'Unreasonable Entry Without Notice',
    issue: 'Allows entry into premises without advance warning.',
    counterProposal: 'Require 24 hours advance notice.',
    practicalImpact: 'Severe invasion of privacy.'
  }
];

describe('RedFlagsList Component', () => {
  it('renders red flags header and flag items', () => {
    render(<RedFlagsList redFlags={mockRedFlags} />);

    expect(screen.getByText('Risk & Red Flag Detector')).toBeInTheDocument();
    expect(screen.getByText('Unreasonable Entry Without Notice')).toBeInTheDocument();
  });

  it('expands red flag details on click', () => {
    render(<RedFlagsList redFlags={mockRedFlags} />);

    const header = screen.getByText('Unreasonable Entry Without Notice');
    fireEvent.click(header);

    expect(screen.getByText(/Allows entry into premises without advance warning/i)).toBeInTheDocument();
  });
});
