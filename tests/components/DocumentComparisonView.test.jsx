import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentComparisonView } from '../../src/components/DocumentComparisonView.jsx';

const mockAnalysis = {
  documentTitle: 'Original Lease Agreement',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease Agreement',
  executiveSummary: 'Summary of original lease',
  keyEntities: { parties: [] },
  overallRiskScore: 35,
  riskScoreLabel: 'High-Risk Trap',
  riskBreakdown: { financial: 35, rightsProtection: 30, terminationFlexibility: 35, liabilityFairness: 40 },
  redFlags: [
    {
      id: 'flag-1',
      clauseId: 'clause-1',
      clauseTitle: 'Entry Clause',
      verbatimQuote: 'enter without notice',
      riskLevel: 'critical',
      category: 'Unreasonable Entry Without Notice',
      issue: 'Invasion of privacy',
      counterProposal: 'Require 24 hours written notice',
      practicalImpact: 'Severe invasion of privacy'
    }
  ],
  rightsAndObligations: [],
  clauses: [],
  missingStandardProtections: [],
  rawText: 'Original contract raw text content.',
  wordCount: 5,
  processedAt: new Date().toISOString()
};

describe('DocumentComparisonView Component', () => {
  it('renders side-by-side comparison view and run comparison button', () => {
    render(<DocumentComparisonView currentAnalysis={mockAnalysis} />);

    expect(screen.getByText(/Side-by-Side Contract Comparison & Diff/i)).toBeInTheDocument();
    expect(screen.getByText(/Version 1: Original Document \(Active\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze Differences/i })).toBeInTheDocument();
  });

  it('triggers API call and renders comparison diff results when button clicked', async () => {
    const mockComparisonResponse = {
      success: true,
      comparison: {
        doc1Title: 'Original Lease Agreement',
        doc2Title: 'Revised Counter-Proposal',
        riskScore1: 35,
        riskScore2: 85,
        safetyDelta: 50,
        summaryOfChanges: 'Significantly improved safety across entry notice and deposit refund terms.',
        clauseDiffs: [
          {
            category: 'privacy',
            title: 'Entry Notice',
            status: 'improved',
            explanation: 'Requiring 24 hour notice.',
            doc1Excerpt: 'enter without notice',
            doc2Excerpt: '24 hours notice required'
          }
        ],
        negotiationWins: ['Added 24h entry notice requirement'],
        remainingConcerns: []
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockComparisonResponse)
    });

    render(<DocumentComparisonView currentAnalysis={mockAnalysis} />);

    const analyzeBtn = screen.getByRole('button', { name: /Analyze Differences/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Significantly improved safety across entry notice/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/\+50% Safer/i)).toBeInTheDocument();
    expect(screen.getByText(/Added 24h entry notice requirement/i)).toBeInTheDocument();
  });
});
