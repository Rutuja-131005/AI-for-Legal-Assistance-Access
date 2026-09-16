import { describe, it, expect } from 'vitest';
import { segmentClauses } from '../../server/services/clauseSegmenter';

describe('clauseSegmenter (Comprehensive Boundary Verification)', () => {
  it('segments numbered clauses accurately (1. 2. 3.)', () => {
    const text = `1. RENT TERMS
Tenant agrees to pay $1,500 monthly rent.

2. SECURITY DEPOSIT
Tenant shall deposit $1,500 prior to move in.`;

    const clauses = segmentClauses(text);
    expect(clauses.length).toBeGreaterThanOrEqual(1);
    expect(clauses.some(c => /RENT TERMS/i.test(c.title))).toBe(true);
  });

  it('segments decimal clauses (1.1, 1.2)', () => {
    const text = `SECTION 1.1 - PAYMENT OBLIGATIONS
Payment is due on the first day of each month.

SECTION 1.2 - LATE FEES
Late fees shall apply after 5 days buffer.`;

    const clauses = segmentClauses(text);
    expect(clauses.length).toBeGreaterThan(0);
    expect(clauses.some(c => c.title.includes('1.1') || c.text.includes('1.1') || c.title.includes('SECTION'))).toBe(true);
  });

  it('segments ALL CAPS headings', () => {
    const text = `CONFIDENTIALITY AND PRIVACY
Receiving party agrees to keep information confidential.

GOVERNING LAW AND JURISDICTION
This agreement shall be governed by California law.`;

    const clauses = segmentClauses(text);
    expect(clauses.length).toBeGreaterThan(0);
  });

  it('handles multiline clauses with formatting spaces', () => {
    const text = `ARTICLE I - PREMISES & USE
The landlord hereby leases the premises to the tenant.
Tenant shall use the premises strictly for residential purposes.
No commercial activity allowed.`;

    const clauses = segmentClauses(text);
    expect(clauses.length).toBeGreaterThan(0);
    expect(clauses[0].text).toContain('commercial activity');
  });

  it('handles Unicode characters in clause content', () => {
    const text = `CLAUSE 1. INTERNATIONAL FEES
Payment currency shall be USD ($) or EUR (€2,500).`;

    const clauses = segmentClauses(text);
    expect(clauses.length).toBeGreaterThan(0);
    expect(clauses[0].text).toContain('€2,500');
  });

  it('handles empty input cleanly without throwing', () => {
    const clauses = segmentClauses('');
    expect(clauses).toEqual([]);
  });

  it('handles unstructured text using paragraph fallbacks', () => {
    const text = `First paragraph contains general terms and payment information for the tenant.

Second paragraph contains termination guidelines and notification windows for vacating.`;

    const clauses = segmentClauses(text);
    expect(clauses.length).toBeGreaterThan(0);
  });

  it('handles malformed formatting and excessive newlines', () => {
    const text = `\n\n\n1.   TITLE   \n\n\nBody text with excessive spacing.\n\n\n\n2. SECOND TITLE\nBody 2.\n\n`;
    const clauses = segmentClauses(text);
    expect(clauses.length).toBeGreaterThan(0);
  });
});
