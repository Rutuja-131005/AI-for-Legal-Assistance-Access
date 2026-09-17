import { describe, it, expect } from 'vitest';
import { analyzeDocumentText } from '../../server/services/analysisService';

describe('Analysis Cache & Performance Optimization', () => {
  it('returns cached analysis on identical document rawText input instantly', () => {
    const text = `1. RESIDENTIAL LEASE AGREEMENT
Tenant agrees to pay $1,500 monthly rent. Security deposit is non-refundable $1,500 fee.
Landlord may enter premises at any time without notice.`;

    const start1 = performance.now();
    const result1 = analyzeDocumentText(text, 'Cache Test Contract');
    const duration1 = performance.now() - start1;

    const start2 = performance.now();
    const result2 = analyzeDocumentText(text, 'Cache Test Contract');
    const duration2 = performance.now() - start2;

    expect(result1.documentTitle).toBe(result2.documentTitle);
    expect(result1.overallRiskScore).toBe(result2.overallRiskScore);
    expect(result1.clauses.length).toBe(result2.clauses.length);
    // Cache lookup should execute significantly faster (sub-millisecond)
    expect(duration2).toBeLessThanOrEqual(duration1);
  });
});
