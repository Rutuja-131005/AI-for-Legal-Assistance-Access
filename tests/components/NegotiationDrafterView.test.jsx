import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NegotiationDrafterView } from '../../src/components/NegotiationDrafterView.jsx';

const mockAnalysis = {
  documentTitle: 'Residential Lease Agreement',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease Agreement',
  executiveSummary: 'Executive Summary',
  keyEntities: {
    parties: [{ name: 'Skyline Holdings LLC', role: 'Landlord' }, { name: 'Riya Sharma', role: 'Tenant' }]
  },
  overallRiskScore: 35,
  riskScoreLabel: 'High-Risk Trap',
  riskBreakdown: { financial: 35, rightsProtection: 30, terminationFlexibility: 35, liabilityFairness: 40 },
  redFlags: [
    {
      id: 'flag-1',
      clauseId: 'clause-1',
      clauseTitle: 'Entry Notice',
      verbatimQuote: 'enter at any time without notice',
      riskLevel: 'critical',
      category: 'Unreasonable Entry Without Notice',
      issue: 'Invasion of privacy',
      counterProposal: 'Require 24 hours written notice',
      practicalImpact: 'Loss of privacy'
    }
  ],
  rightsAndObligations: [],
  clauses: [],
  missingStandardProtections: [],
  rawText: 'Raw contract text',
  wordCount: 10,
  processedAt: new Date().toISOString()
};

describe('NegotiationDrafterView Component', () => {
  it('renders drafter form controls and initial empty state prompt', () => {
    render(<NegotiationDrafterView analysis={mockAnalysis} />);

    expect(screen.getByText('Negotiation Email & Redline Letter Drafter')).toBeInTheDocument();
    expect(screen.getByText('Ready to Draft Your Counter-Offer')).toBeInTheDocument();
  });

  it('generates email draft when submission button is clicked', async () => {
    const mockDraftResponse = {
      success: true,
      draft: {
        subject: 'Requested Minor Adjustments - Residential Lease Agreement (Riya Sharma)',
        body: 'Dear Property Manager,\n\nI am writing to request minor adjustments regarding Entry Notice.',
        highlightedModifications: []
      }
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockDraftResponse)
    }));

    render(<NegotiationDrafterView analysis={mockAnalysis} />);

    const generateBtn = screen.getByRole('button', { name: /Generate Negotiation Email/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/I am writing to request minor adjustments regarding Entry Notice/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Copy Entire Email/i })).toBeInTheDocument();
  });
});
