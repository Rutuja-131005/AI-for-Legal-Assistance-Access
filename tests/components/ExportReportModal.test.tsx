import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExportReportModal } from '../../src/components/ExportReportModal';
import { ContractAnalysis } from '../../src/types';

const mockAnalysis: ContractAnalysis = {
  documentTitle: 'Sample Apartment Lease Agreement',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease Agreement',
  executiveSummary: 'Contains strict entry and exit terms.',
  overallRiskScore: 72,
  riskScoreLabel: 'Moderate Caution',
  wordCount: 850,
  processedAt: new Date().toISOString(),
  rawText: 'Sample contract text...',
  keyEntities: {
    parties: [{ name: 'Landlord Inc', role: 'Landlord' }, { name: 'Jane Doe', role: 'Tenant' }]
  },
  riskBreakdown: {
    financial: 80,
    rightsProtection: 70,
    terminationFlexibility: 65,
    liabilityFairness: 75
  },
  redFlags: [
    {
      id: 'rf-1',
      clauseId: 'clause-5',
      category: 'Privacy',
      clauseTitle: 'Landlord Entry',
      verbatimQuote: 'Landlord may enter at any time.',
      issue: 'Zero advance notice required.',
      practicalImpact: 'Loss of privacy.',
      counterProposal: 'Require 24 hours written notice.',
      riskLevel: 'critical'
    }
  ],
  rightsAndObligations: [],
  clauses: [],
  missingStandardProtections: ['24-hour notice before landlord entry']
};

describe('ExportReportModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(<ExportReportModal isOpen={false} onClose={vi.fn()} analysis={mockAnalysis} />);
    expect(screen.queryByText('Export & Share Contract Audit Report')).not.toBeInTheDocument();
  });

  it('renders printable summary report when isOpen is true', () => {
    render(<ExportReportModal isOpen={true} onClose={vi.fn()} analysis={mockAnalysis} />);
    expect(screen.getByText('Export & Share Contract Audit Report')).toBeInTheDocument();
    expect(screen.getByText('Sample Apartment Lease Agreement')).toBeInTheDocument();
    expect(screen.getByText('72/100')).toBeInTheDocument();
  });

  it('copies markdown report when Copy Markdown is clicked', () => {
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');
    render(<ExportReportModal isOpen={true} onClose={vi.fn()} analysis={mockAnalysis} />);

    const copyBtn = screen.getByRole('button', { name: /Copy Markdown/i });
    fireEvent.click(copyBtn);

    expect(writeTextSpy).toHaveBeenCalled();
  });
});
