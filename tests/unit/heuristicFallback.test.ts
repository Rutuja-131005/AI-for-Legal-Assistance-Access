import { describe, it, expect } from 'vitest';
import {
  analyzeDocumentText,
  answerQuestionLocally,
  compareDocumentsLocally
} from '../../server/services/analysisService';
import { ContractAnalysis } from '../../src/types';

describe('Local Heuristic Legal Fallback Engine', () => {
  const sampleLease = `
    RESIDENTIAL LEASE AGREEMENT
    1. RENT AND LATE FEES
    Tenant agrees to pay $2,500 on the 1st of every month. Late fee of $150 after 3 days.
    2. LANDLORD RIGHT OF ENTRY
    Landlord may enter premises at any time day or night without prior written notice.
    3. SECURITY DEPOSIT
    Tenant shall pay a non-refundable cleaning fee of $500 from the deposit.
  `;

  it('performs full heuristic rule screening without external AI service', () => {
    const analysis = analyzeDocumentText(sampleLease, 'Test Lease');

    expect(analysis.documentTitle).toBe('Test Lease');
    expect(analysis.category).toBe('residential_lease');
    expect(analysis.clauses.length).toBeGreaterThan(0);
    expect(analysis.redFlags.length).toBeGreaterThan(0);
    expect(analysis.overallRiskScore).toBeGreaterThanOrEqual(0);
    expect(analysis.overallRiskScore).toBeLessThanOrEqual(100);
  });

  it('answers grounded questions using local keyword & heuristic clause matching', () => {
    const analysis = analyzeDocumentText(sampleLease, 'Test Lease');
    const answer = answerQuestionLocally('Can landlord enter without notice?', analysis);

    expect(answer.isGrounded).toBe(true);
    expect(answer.citedClauses.length).toBeGreaterThan(0);
    expect(answer.answer).toContain('LANDLORD RIGHT OF ENTRY');
  });

  it('returns graceful default response when question is missing from contract text', () => {
    const analysis = analyzeDocumentText(sampleLease, 'Test Lease');
    const answer = answerQuestionLocally('Are pets like iguanas allowed?', analysis);

    expect(answer.isGrounded).toBe(false);
    expect(answer.answer).toContain('does not explicitly address');
  });

  it('compares two document versions locally and calculates risk delta', () => {
    const doc1 = analyzeDocumentText(sampleLease, 'Original Draft');
    const revisedLease = `
      RESIDENTIAL LEASE AGREEMENT
      1. RENT AND LATE FEES
      Tenant agrees to pay $2,500 on the 1st.
      2. LANDLORD RIGHT OF ENTRY
      Landlord must provide 24 hours written notice before entry.
    `;
    const doc2 = analyzeDocumentText(revisedLease, 'Revised Draft');

    const comparison = compareDocumentsLocally(doc1, doc2);

    expect(comparison.doc1Title).toBe('Original Draft');
    expect(comparison.doc2Title).toBe('Revised Draft');
    expect(typeof comparison.safetyDelta).toBe('number');
    expect(comparison.clauseDiffs.length).toBeGreaterThan(0);
  });
});
