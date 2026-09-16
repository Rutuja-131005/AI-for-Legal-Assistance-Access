import { describe, it, expect } from 'vitest';
import { segmentClauses } from '../../server/services/clauseSegmenter';
import { extractRightsAndObligations } from '../../server/services/rightsObligationsExtractor';

describe('rightsObligationsExtractor (Actual Data Grounding)', () => {
  it('extracts obligations matching actual document amounts ($1,000 rent)', () => {
    const text = `1. RENT OBLIGATION
Tenant agrees to pay $1,000.00 monthly rent on the 1st day of each month.

2. SECURITY DEPOSIT
Tenant shall deposit $1,000.00 security deposit.`;

    const clauses = segmentClauses(text);
    const matrix = extractRightsAndObligations(clauses, 'residential_lease');

    expect(matrix.length).toBeGreaterThan(0);
    const rentItem = matrix.find(m => m.description.includes('$1,000'));
    expect(rentItem).toBeDefined();

    // CRITICAL Negative test: Ensure $2,450 from initial hardcoded sample data does NOT appear
    const fakeSampleRent = matrix.find(m => m.description.includes('$2,450'));
    expect(fakeSampleRent).toBeUndefined();
  });

  it('extracts contractor payment timelines dynamically', () => {
    const text = `1. PAYMENT
Client shall process payments on a Net-30 basis following invoice receipt.

2. TERMINATION
Either party may terminate upon 14 days written notice.`;

    const clauses = segmentClauses(text);
    const matrix = extractRightsAndObligations(clauses, 'independent_contractor');

    const paymentItem = matrix.find(m => m.description.includes('Net-30') || m.description.includes('payment'));
    expect(paymentItem).toBeDefined();
  });
});
