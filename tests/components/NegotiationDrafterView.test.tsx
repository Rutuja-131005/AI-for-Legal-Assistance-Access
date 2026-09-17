import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NegotiationDrafterView } from '../../src/components/NegotiationDrafterView';
import { ContractAnalysis } from '../../src/types';

const mockAnalysis: ContractAnalysis = {
  documentTitle: 'Residential Lease Contract',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease',
  executiveSummary: 'Lease with 2 critical red flags.',
  overallRiskScore: 60,
  riskScoreLabel: 'Moderate Caution',
  wordCount: 700,
  processedAt: new Date().toISOString(),
  rawText: 'Full contract text...',
  keyEntities: {
    parties: [
      { name: 'Apex Leasing LLC', role: 'Landlord' },
      { name: 'Alex Johnson', role: 'Tenant' }
    ]
  },
  riskBreakdown: { financial: 60, rightsProtection: 50, terminationFlexibility: 50, liabilityFairness: 70 },
  redFlags: [
    {
      id: 'rf-1',
      clauseId: 'c1',
      category: 'Privacy',
      clauseTitle: 'Entry Clause',
      verbatimQuote: 'Entry without notice.',
      issue: 'No notice required.',
      practicalImpact: 'Loss of privacy.',
      counterProposal: 'Require 24 hours written notice.',
      riskLevel: 'critical'
    }
  ],
  rightsAndObligations: [],
  clauses: [],
  missingStandardProtections: []
};

describe('NegotiationDrafterView Component', () => {
  it('renders counter-proposal generator heading and input fields', () => {
    render(<NegotiationDrafterView analysis={mockAnalysis} />);
    expect(screen.getByText('Negotiation Email & Redline Letter Drafter')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Apex Leasing LLC')).toBeInTheDocument();
  });

  it('generates email draft when submission button is clicked', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        draft: {
          subject: 'Requested Minor Adjustments - Residential Lease Contract',
          body: 'Dear Apex Leasing LLC,\n\nThank you for sending over the agreement. I would appreciate minor adjustments regarding Entry Clause.\n\nBest regards,\nAlex Johnson',
          highlightedModifications: [
            {
              clauseTitle: 'Entry Clause',
              originalQuote: 'Entry without notice.',
              proposedRedline: 'Require 24 hours written notice.',
              justification: 'No notice required.'
            }
          ]
        }
      })
    } as Response);

    render(<NegotiationDrafterView analysis={mockAnalysis} />);
    const generateBtn = screen.getByRole('button', { name: /Generate Negotiation Email/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Requested Minor Adjustments/i)).toBeInTheDocument();
      expect(screen.getByText(/Dear Apex Leasing LLC/i)).toBeInTheDocument();
    });
  });
});
