import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroundedQA } from '../../src/components/GroundedQA';
import { ContractAnalysis } from '../../src/types';

const mockAnalysis: ContractAnalysis = {
  documentTitle: 'Sample Residential Lease',
  category: 'residential_lease',
  categoryDisplayName: 'Residential Lease Agreement',
  executiveSummary: 'Standard lease with some strict entry provisions.',
  overallRiskScore: 75,
  riskScoreLabel: 'Moderate Caution',
  wordCount: 500,
  processedAt: new Date().toISOString(),
  rawText: 'Tenant agrees to pay $2,000 monthly. Landlord right of entry requires 24 hours notice.',
  keyEntities: {
    parties: [{ name: 'Landlord Co', role: 'Landlord' }]
  },
  riskBreakdown: {
    financial: 80,
    rightsProtection: 70,
    terminationFlexibility: 60,
    liabilityFairness: 90
  },
  redFlags: [],
  rightsAndObligations: [],
  clauses: [
    {
      id: 'clause-1',
      index: 1,
      category: 'financial',
      title: '1. RENT',
      text: 'Tenant agrees to pay $2,000 monthly.',
      riskLevel: 'standard'
    }
  ],
  missingStandardProtections: []
};

describe('GroundedQA Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Q&A heading and initial suggested questions', () => {
    render(<GroundedQA analysis={mockAnalysis} />);
    expect(screen.getByText('Grounded Document Question & Answering (RAG)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask anything/i)).toBeInTheDocument();
  });

  it('allows typing a question and submitting form', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        answer: 'Yes, rent is due on the 1st of every month.',
        isGrounded: true,
        citedClauses: [
          { clauseId: 'clause-1', clauseTitle: '1. RENT', quote: 'Tenant agrees to pay $2,000 monthly.' }
        ]
      })
    } as Response);

    render(<GroundedQA analysis={mockAnalysis} />);
    const input = screen.getByLabelText(/Ask a grounded question/i);
    fireEvent.change(input, { target: { value: 'When is rent due?' } });

    const submitBtn = screen.getByRole('button', { name: /Submit question/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('When is rent due?')).toBeInTheDocument();
      expect(screen.getByText(/Yes, rent is due on the 1st/i)).toBeInTheDocument();
    });
  });
});
