import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GroundedQA } from '../../src/components/GroundedQA.jsx';

const mockAnalysis = {
  documentTitle: 'Residential Lease Agreement',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease Agreement',
  executiveSummary: 'Summary of lease',
  keyEntities: { parties: [] },
  overallRiskScore: 65,
  riskScoreLabel: 'Moderate Caution',
  riskBreakdown: { financial: 65, rightsProtection: 60, terminationFlexibility: 70, liabilityFairness: 65 },
  redFlags: [],
  rightsAndObligations: [],
  clauses: [
    {
      id: 'clause-1',
      index: 0,
      title: '1. PET POLICY',
      category: 'restrictions',
      text: 'No pets or animals of any kind are allowed on the premises.',
      riskLevel: 'standard'
    }
  ],
  missingStandardProtections: [],
  rawText: 'No pets or animals of any kind are allowed on the premises.',
  wordCount: 11,
  processedAt: new Date().toISOString()
};

describe('GroundedQA Component', () => {
  it('renders input field and default initial question', () => {
    render(<GroundedQA analysis={mockAnalysis} />);

    expect(screen.getByText('Grounded Document Question & Answering (RAG)')).toBeInTheDocument();
    expect(screen.getByText(/Can the landlord enter my apartment without giving me notice\?/i)).toBeInTheDocument();
  });

  it('allows typing a question and submitting form', async () => {
    const mockAnswerResponse = {
      success: true,
      answer: 'Pets are strictly prohibited under Clause 1.',
      isGrounded: true,
      citedClauses: [{ clauseId: 'clause-1', clauseTitle: '1. PET POLICY', quote: 'No pets' }],
      confidence: 'high'
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockAnswerResponse)
    }));

    render(<GroundedQA analysis={mockAnalysis} />);

    const input = screen.getByLabelText(/Ask a grounded question about this contract/i);
    fireEvent.change(input, { target: { value: 'Are pets allowed?' } });

    const submitBtn = screen.getByRole('button', { name: /Submit question/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Pets are strictly prohibited under Clause 1.')).toBeInTheDocument();
    });

    expect(screen.getByText('1. PET POLICY:')).toBeInTheDocument();
  });
});
