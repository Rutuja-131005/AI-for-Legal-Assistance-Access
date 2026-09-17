import { describe, it, expect } from 'vitest';
import { segmentClauses } from '../../server/services/clauseSegmenter.js';

describe('clauseSegmenter Service', () => {
  it('segments text into numbered clauses correctly', () => {
    const text = `1. PREMISES AND TERM
Landlord leases to Tenant the premises for 12 months.

2. RENT AND LATE FEES
Tenant agrees to pay monthly rent of $2,000. Late fee is $100.`;

    const clauses = segmentClauses(text);
    expect(clauses.length).toBe(2);
    expect(clauses[0].title).toBe('1. PREMISES AND TERM');
    expect(clauses[0].category).toBe('general');
    expect(clauses[1].title).toBe('2. RENT AND LATE FEES');
    expect(clauses[1].category).toBe('financial');
  });

  it('assigns critical risk level to predatory clause text', () => {
    const text = `SECTION 1. LANDLORD RIGHT OF ENTRY
Landlord may enter premises at any time day or night without prior notice.`;

    const clauses = segmentClauses(text);
    expect(clauses.length).toBe(1);
    expect(clauses[0].riskLevel).toBe('critical');
    expect(clauses[0].riskReason).toBeDefined();
    expect(clauses[0].suggestedRevision).toBeDefined();
  });

  it('handles unstructured unformatted text fallback gracefully', () => {
    const text = `This is a simple single-paragraph document text that does not have numbered headings or capitalized sections. It should be parsed as a fallback single clause.`;

    const clauses = segmentClauses(text);
    expect(clauses.length).toBe(1);
    expect(clauses[0].id).toBe('clause-1');
  });
});
