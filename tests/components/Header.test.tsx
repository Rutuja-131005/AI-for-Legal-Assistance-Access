import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../../src/components/Header';
import { ContractAnalysis } from '../../src/types';

const dummyAnalysis: ContractAnalysis = {
  documentTitle: 'Test Agreement',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease Agreement',
  executiveSummary: 'Test executive summary.',
  keyEntities: { parties: [] },
  overallRiskScore: 80,
  riskScoreLabel: 'Safe & Balanced',
  riskBreakdown: { financial: 80, rightsProtection: 80, terminationFlexibility: 80, liabilityFairness: 80 },
  redFlags: [],
  rightsAndObligations: [],
  clauses: [],
  missingStandardProtections: [],
  rawText: 'Test text',
  wordCount: 2,
  processedAt: new Date().toISOString(),
};

describe('Header Component & Accessibility', () => {
  it('renders branding title and legal literacy notice', () => {
    render(
      <Header
        activeTab="overview"
        setActiveTab={vi.fn()}
        analysis={null}
        onOpenUpload={vi.fn()}
        onSelectSample={vi.fn()}
        onOpenGlossary={vi.fn()}
        onOpenExport={vi.fn()}
      />
    );

    expect(screen.getByText('ClariLex')).toBeInTheDocument();
    expect(screen.getByText(/Legal Literacy Notice/i)).toBeInTheDocument();
  });

  it('renders ARIA tablist and responds to tab click interactions', () => {
    const setActiveTabMock = vi.fn();
    render(
      <Header
        activeTab="overview"
        setActiveTab={setActiveTabMock}
        analysis={dummyAnalysis}
        onOpenUpload={vi.fn()}
        onSelectSample={vi.fn()}
        onOpenGlossary={vi.fn()}
        onOpenExport={vi.fn()}
      />
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const clauseTab = screen.getByRole('tab', { name: /Clause Explorer/i });
    expect(clauseTab).toBeInTheDocument();
    expect(clauseTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(clauseTab);
    expect(setActiveTabMock).toHaveBeenCalledWith('clauses');
  });
});
