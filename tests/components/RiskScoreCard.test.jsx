import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RiskScoreCard } from '../../src/components/RiskScoreCard.jsx';

const mockAnalysis = {
  documentTitle: 'Contract',
  category: 'residential_lease',
  categoryDisplayName: 'Lease',
  executiveSummary: 'Summary',
  keyEntities: { parties: [] },
  overallRiskScore: 85,
  riskScoreLabel: 'Safe & Balanced',
  riskBreakdown: { financial: 90, rightsProtection: 85, terminationFlexibility: 80, liabilityFairness: 85 },
  redFlags: [],
  rightsAndObligations: [],
  clauses: [],
  missingStandardProtections: [],
  rawText: 'text',
  wordCount: 1,
  processedAt: new Date().toISOString()
};

describe('RiskScoreCard Component', () => {
  it('renders overall score and risk label badge', () => {
    render(<RiskScoreCard analysis={mockAnalysis} />);

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Safe & Balanced')).toBeInTheDocument();
  });
});
