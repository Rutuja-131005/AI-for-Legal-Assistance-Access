import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '../../src/components/Header.jsx';
import { GlossaryModal } from '../../src/components/GlossaryModal.jsx';

describe('Accessibility & WAI-ARIA Verification', () => {
  it('Header navigation implements correct WAI-ARIA tab roles and aria-selected states', () => {
    render(
      <Header
        activeTab="overview"
        setActiveTab={() => {}}
        analysis={{
          documentTitle: 'Contract',
          category: 'residential_lease',
          categoryDisplayName: 'Lease',
          executiveSummary: 'Summary',
          keyEntities: { parties: [] },
          overallRiskScore: 75,
          riskScoreLabel: 'Moderate Caution',
          riskBreakdown: { financial: 75, rightsProtection: 75, terminationFlexibility: 75, liabilityFairness: 75 },
          redFlags: [],
          rightsAndObligations: [],
          clauses: [],
          missingStandardProtections: [],
          rawText: 'text',
          wordCount: 1,
          processedAt: new Date().toISOString(),
        }}
        onOpenUpload={() => {}}
        onSelectSample={() => {}}
        onOpenGlossary={() => {}}
        onOpenExport={() => {}}
      />
    );

    const navTablist = screen.getByRole('tablist', { name: /Analysis Sections/i });
    expect(navTablist).toBeInTheDocument();

    const overviewTab = screen.getByRole('tab', { name: /Overview & Red Flags/i });
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });

  it('GlossaryModal renders accessible dialog role and close button with accessible name', () => {
    render(<GlossaryModal isOpen={true} onClose={() => {}} />);

    const dialog = screen.getByRole('dialog', { name: /Legal Glossary & Jargon Explainer/i });
    expect(dialog).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /Close glossary/i });
    expect(closeButton).toBeInTheDocument();
  });
});
