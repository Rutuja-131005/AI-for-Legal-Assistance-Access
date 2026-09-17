import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../../src/components/Header.jsx';

describe('Header Component & Accessibility', () => {
  it('renders logo, brand name, and action buttons', () => {
    render(
      <Header
        activeTab="overview"
        setActiveTab={() => {}}
        analysis={null}
        onOpenUpload={() => {}}
        onSelectSample={() => {}}
        onOpenGlossary={() => {}}
        onOpenExport={() => {}}
      />
    );

    expect(screen.getByText('ClariLex')).toBeInTheDocument();
    expect(screen.getByText('Consumer Navigator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Document/i })).toBeInTheDocument();
  });

  it('renders ARIA tablist and responds to tab click interactions', () => {
    const setActiveTab = vi.fn();
    render(
      <Header
        activeTab="overview"
        setActiveTab={setActiveTab}
        analysis={{
          documentTitle: 'Sample Lease',
          category: 'residential_lease',
          categoryDisplayName: 'Residential Lease',
          executiveSummary: 'Summary',
          keyEntities: { parties: [] },
          overallRiskScore: 70,
          riskScoreLabel: 'Moderate Caution',
          riskBreakdown: { financial: 70, rightsProtection: 70, terminationFlexibility: 70, liabilityFairness: 70 },
          redFlags: [],
          rightsAndObligations: [],
          clauses: [],
          missingStandardProtections: [],
          rawText: 'Text',
          wordCount: 1,
          processedAt: new Date().toISOString()
        }}
        onOpenUpload={() => {}}
        onSelectSample={() => {}}
        onOpenGlossary={() => {}}
        onOpenExport={() => {}}
      />
    );

    const qaTab = screen.getByRole('tab', { name: /Grounded Q&A/i });
    fireEvent.click(qaTab);

    expect(setActiveTab).toHaveBeenCalledWith('qa');
  });
});
