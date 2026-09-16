import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RedFlagsList } from '../../src/components/RedFlagsList';
import { RedFlag } from '../../src/types';

const sampleFlags: RedFlag[] = [
  {
    id: 'flag-1',
    clauseId: 'clause-1',
    clauseTitle: 'Landlord Entry',
    verbatimQuote: 'Landlord may enter without prior notice at any time.',
    riskLevel: 'critical',
    category: 'Privacy Invasion',
    issue: 'Landlord can enter without prior notice.',
    practicalImpact: 'Severe privacy invasion.',
    counterProposal: 'Require 24 hours advance written notice.',
  },
];

describe('RedFlagsList Component', () => {
  it('renders red flags with issue details and counter-proposals', () => {
    render(
      <RedFlagsList
        redFlags={sampleFlags}
        onSelectFlag={vi.fn()}
      />
    );

    expect(screen.getAllByText(/Privacy Invasion/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Landlord can enter without prior notice/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Require 24 hours advance written notice/i)).toBeInTheDocument();
  });

  it('handles empty red flags list gracefully', () => {
    render(<RedFlagsList redFlags={[]} onSelectFlag={vi.fn()} />);
    expect(screen.getByText(/No red flags in this severity tier/i)).toBeInTheDocument();
  });
});
