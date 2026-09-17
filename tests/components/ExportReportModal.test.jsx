import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExportReportModal } from '../../src/components/ExportReportModal.jsx';

const mockAnalysis = {
  documentTitle: 'Sample Apartment Lease',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease Agreement',
  executiveSummary: 'This lease contains multiple critical red flags regarding entry and deposit retention.',
  keyEntities: {
    parties: [{ name: 'Skyline LLC', role: 'Landlord' }, { name: 'Riya Sharma', role: 'Tenant' }],
    totalFinancialCommitment: '$2,450 / month',
    renewalTerms: 'Automatic Renewal',
    noticePeriod: '90 Days Notice'
  },
  overallRiskScore: 35,
  riskScoreLabel: 'High-Risk Trap',
  riskBreakdown: { financial: 30, rightsProtection: 25, terminationFlexibility: 40, liabilityFairness: 45 },
  redFlags: [
    {
      id: 'flag-1',
      clauseId: 'clause-1',
      clauseTitle: 'Landlord Entry',
      verbatimQuote: 'enter at any time without notice',
      riskLevel: 'critical',
      category: 'Unreasonable Entry Without Notice',
      issue: 'Severe invasion of privacy.',
      counterProposal: 'Require 24 hours advance notice.',
      practicalImpact: 'Loss of privacy.'
    }
  ],
  rightsAndObligations: [],
  clauses: [],
  missingStandardProtections: ['Statutory 24-Hour Entry Notice'],
  rawText: 'Full raw text of lease',
  wordCount: 100,
  processedAt: new Date().toISOString()
};

describe('ExportReportModal Component', () => {
  it('renders report header, overall risk score, and summary when opened', () => {
    render(
      <ExportReportModal
        isOpen={true}
        onClose={() => {}}
        analysis={mockAnalysis}
      />
    );

    expect(screen.getByText(/Export & Share Contract Audit Report/i)).toBeInTheDocument();
    expect(screen.getByText('Sample Apartment Lease')).toBeInTheDocument();
    expect(screen.getByText('35/100')).toBeInTheDocument();
  });

  it('triggers window.print when Print / Save PDF is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <ExportReportModal
        isOpen={true}
        onClose={() => {}}
        analysis={mockAnalysis}
      />
    );

    const printBtn = screen.getByRole('button', { name: /Print \/ Save PDF/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('copies markdown report when Copy Markdown is clicked', () => {
    render(
      <ExportReportModal
        isOpen={true}
        onClose={() => {}}
        analysis={mockAnalysis}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Copy Markdown/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('# ClariLex Document Analysis Report'));
  });
});
