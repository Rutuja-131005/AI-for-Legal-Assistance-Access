import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentComparisonView } from '../../src/components/DocumentComparisonView';
import { ContractAnalysis } from '../../src/types';

const mockAnalysis: ContractAnalysis = {
  documentTitle: 'Original Lease Agreement',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease',
  executiveSummary: 'Original lease draft with critical entry terms.',
  overallRiskScore: 55,
  riskScoreLabel: 'Significant Risks',
  wordCount: 600,
  processedAt: new Date().toISOString(),
  rawText: 'Landlord may enter at any time without notice.',
  keyEntities: { parties: [] },
  riskBreakdown: { financial: 50, rightsProtection: 50, terminationFlexibility: 40, liabilityFairness: 60 },
  redFlags: [],
  rightsAndObligations: [],
  clauses: [
    {
      id: 'c1',
      index: 1,
      category: 'privacy',
      title: 'Landlord Entry',
      text: 'Landlord may enter at any time without notice.',
      riskLevel: 'critical'
    }
  ],
  missingStandardProtections: []
};

describe('DocumentComparisonView Component', () => {
  it('renders side-by-side comparison view and run comparison button', () => {
    render(<DocumentComparisonView currentAnalysis={mockAnalysis} />);
    expect(screen.getByText('Side-by-Side Contract Comparison & Diff')).toBeInTheDocument();
    expect(screen.getByText(/Original Document/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze Differences/i })).toBeInTheDocument();
  });

  it('runs version comparison API when compare button is clicked', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        comparison: {
          doc1Title: 'Original Lease Agreement',
          doc2Title: 'Revised Counter-Proposal',
          riskScore1: 55,
          riskScore2: 85,
          safetyDelta: 30,
          summaryOfChanges: 'Risk improved by 30 points.',
          clauseDiffs: [
            {
              category: 'privacy',
              title: 'Landlord Entry',
              status: 'improved',
              explanation: 'Softened with 24h notice.',
              doc1Excerpt: 'No notice',
              doc2Excerpt: '24h notice'
            }
          ],
          negotiationWins: ['Added 24h entry notice'],
          remainingConcerns: []
        }
      })
    } as Response);

    render(<DocumentComparisonView currentAnalysis={mockAnalysis} />);
    const compareBtn = screen.getByRole('button', { name: /Analyze Differences/i });
    fireEvent.click(compareBtn);

    await waitFor(() => {
      expect(screen.getByText(/Risk improved by 30 points/i)).toBeInTheDocument();
    });
  });
});
