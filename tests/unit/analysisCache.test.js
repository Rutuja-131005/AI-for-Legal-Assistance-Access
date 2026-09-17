import { describe, it, expect } from 'vitest';
import { analyzeDocumentText } from '../../server/services/analysisService.js';

describe('analysisCache Service', () => {
  it('returns cached analysis object for identical document input', () => {
    const rawText = 'RESIDENTIAL LEASE AGREEMENT\n1. PREMISES\nLandlord leases Apt 4B to Tenant.';
    const title = 'Cache Test Document';

    const firstRun = analyzeDocumentText(rawText, title);
    const secondRun = analyzeDocumentText(rawText, title);

    expect(firstRun).toBe(secondRun); // Reference identity equality check
    expect(secondRun.documentTitle).toBe('Cache Test Document');
  });
});
