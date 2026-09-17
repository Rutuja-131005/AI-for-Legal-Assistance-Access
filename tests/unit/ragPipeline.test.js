import { describe, it, expect } from 'vitest';
import { executeGroundedRAGQuery, validateEvidenceSufficiency } from '../../server/services/ragPipeline.js';
import { getSystemMetrics } from '../../server/services/metricsTracker.js';
import { detectLanguageIntent } from '../../server/services/multilingualService.js';

describe('Advanced RAG Pipeline & Evidence Validation Layer', () => {
  const mockAnalysis = {
    documentTitle: 'Residential Lease Agreement',
    clauses: [
      {
        id: 'clause-1',
        chunk_id: 'clause-1',
        title: '1. SECURITY DEPOSIT AND REFUNDS',
        category: 'financial',
        text: 'Tenant shall deposit $2,500 as security. Deposit shall be refunded within 30 days after move out.',
        pageNumber: 1,
      },
      {
        id: 'clause-2',
        chunk_id: 'clause-2',
        title: '2. PET RESTRICTIONS',
        category: 'restrictions',
        text: 'No pets, dogs, or animals of any kind are permitted on the premises without prior written landlord consent.',
        pageNumber: 2,
      },
    ],
  };

  it('validates evidence sufficiency correctly when strong evidence exists', () => {
    const validation = validateEvidenceSufficiency('What is the pet policy?', mockAnalysis.clauses);
    expect(validation.isSufficient).toBe(true);
    expect(validation.confidence).toBe('HIGH');
  });

  it('detects insufficient evidence and refuses to force answer when topic is absent', () => {
    const validation = validateEvidenceSufficiency('What is the parking space allocation?', mockAnalysis.clauses);
    expect(validation.isSufficient).toBe(false);
    expect(validation.confidence).toBe('LOW');
  });

  it('returns explicit missing information message when evidence is insufficient', async () => {
    const result = await executeGroundedRAGQuery('What is the subletting fee?', 'Raw text', mockAnalysis);
    expect(result.isGrounded).toBe(false);
    expect(result.confidence).toBe('LOW');
    expect(result.answer).toContain("couldn't find sufficient information");
  });

  it('detects multilingual intent for Hindi and Marathi queries', () => {
    expect(detectLanguageIntent('हा agreement सोप्या मराठीत समजावून सांगा')).toBe('mr');
    expect(detectLanguageIntent('इस contract को हिंदी में समझाइए')).toBe('hi');
    expect(detectLanguageIntent('What is the notice period?')).toBe('en');
  });

  it('tracks system metrics for queries and operational latency', () => {
    const metrics = getSystemMetrics();
    expect(metrics).toHaveProperty('documentsProcessed');
    expect(metrics).toHaveProperty('cacheHitRatePct');
    expect(metrics).toHaveProperty('confidenceDistribution');
  });
});
