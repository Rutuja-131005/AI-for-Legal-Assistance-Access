import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RiskScoreCard } from '../../src/components/RiskScoreCard';
import { ContractAnalysis } from '../../src/types';

const dummyHighAnalysis: ContractAnalysis = {
  documentTitle: 'Test Lease',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease Agreement',
  executiveSummary: 'Summary text',
  keyEntities: { parties: [] },
  overallRiskScore: 85,
  riskScoreLabel: 'Safe & Balanced',
  riskBreakdown: {
    financial: 90,
    rightsProtection: 85,
    terminationFlexibility: 80,
    liabilityFairness: 85,
  },
  redFlags: [],
  rightsAndObligations: [],
  clauses: [],
  missingStandardProtections: [],
  rawText: 'text',
  wordCount: 1,
  processedAt: new Date().toISOString(),
};

const dummyLowAnalysis: ContractAnalysis = {
  ...dummyHighAnalysis,
  overallRiskScore: 35,
  riskScoreLabel: 'High-Risk Trap',
};

describe('RiskScoreCard Component', () => {
  it('renders overall risk score and label accurately', () => {
    render(<RiskScoreCard analysis={dummyHighAnalysis} />);

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Safe & Balanced')).toBeInTheDocument();
    expect(screen.getByText('Financial Terms')).toBeInTheDocument();
  });

  it('renders high-risk label for low scores', () => {
    render(<RiskScoreCard analysis={dummyLowAnalysis} />);

    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('High-Risk Trap')).toBeInTheDocument();
  });
});
