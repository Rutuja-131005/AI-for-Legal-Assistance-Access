import { describe, it, expect } from 'vitest';
import { segmentClauses } from '../../server/services/clauseSegmenter';
import { identifyRedFlags } from '../../server/services/redFlagDetector';

describe('redFlagDetector (Pattern Thoroughness)', () => {
  // Pattern 1: Unannounced Entry
  it('detects unannounced entry positive, case, and whitespace variations', () => {
    const textPositive = '1. LANDLORD ACCESS\nLandlord may enter premises WITHOUT PRIOR NOTICE at any time day or night.';
    const textNegative = '1. LANDLORD ACCESS\nLandlord shall provide 24 hours advance written notice prior to entering.';

    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    const flagsNeg = identifyRedFlags(segmentClauses(textNegative), textNegative);

    expect(flagsPos.some(f => f.id === 'flag-entry-notice')).toBe(true);
    expect(flagsNeg.some(f => f.id === 'flag-entry-notice')).toBe(false);
  });

  // Pattern 2: Deposit Forfeiture
  it('detects non-refundable turnover deposit fees', () => {
    const textPositive = '2. DEPOSIT\nA non-refundable refurbishment cleaning fee of $500 shall be deducted automatically.';
    const textNegative = '2. DEPOSIT\nSecurity deposit is 100% refundable less documented damage beyond normal wear.';

    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    const flagsNeg = identifyRedFlags(segmentClauses(textNegative), textNegative);

    expect(flagsPos.some(f => f.id === 'flag-deposit-deduction')).toBe(true);
    expect(flagsNeg.some(f => f.id === 'flag-deposit-deduction')).toBe(false);
  });

  // Pattern 3: Late Fees
  it('detects excessive late penalties', () => {
    const textPositive = '3. LATE FEE\nA late fee of $250 plus an additional $30 per day shall apply immediately.';
    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    expect(flagsPos.some(f => f.id === 'flag-late-fee')).toBe(true);
  });

  // Pattern 4: Maintenance Trap
  it('detects habitability and repair shift onto consumer', () => {
    const textPositive = '4. MAINTENANCE\nTenant bears sole financial responsibility for all repairs exceeding $50 as is.';
    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    expect(flagsPos.some(f => f.id === 'flag-maintenance-trap')).toBe(true);
  });

  // Pattern 5: Evergreen Renewal
  it('detects 90-day automatic evergreen renewal traps', () => {
    const textPositive = '5. RENEWAL\nAgreement will automatically renew for 12 months with 15% rent increase unless 90 days certified registered mail notice is received.';
    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    expect(flagsPos.some(f => f.id === 'flag-evergreen-trap')).toBe(true);
  });

  // Pattern 6: Early Termination Double Recovery
  it('detects early termination liquidated damages penalties', () => {
    const textPositive = '6. EARLY TERMINATION\nTenant remains liable for all remaining rent plus $5,000 liquidated damages.';
    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    expect(flagsPos.some(f => f.id === 'flag-early-termination')).toBe(true);
  });

  // Pattern 7: IP Grab
  it('detects overreaching IP assignment of outside-hours work', () => {
    const textPositive = '7. INTELLECTUAL PROPERTY\nAll worldwide right and inventions created even outside working hours on personal laptops irrevocably belong to Client. Never to showcase in portfolio.';
    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    expect(flagsPos.some(f => f.id === 'flag-ip-grab')).toBe(true);
  });

  // Pattern 8: Net-90 Payment Delay
  it('detects unreasonable Net-90 payment terms', () => {
    const textPositive = '8. INVOICING\nPayment shall be processed within ninety (90) days Net-90 subject to subjective approval.';
    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    expect(flagsPos.some(f => f.id === 'flag-net-90')).toBe(true);
  });

  // Pattern 9: Unlimited Indemnification
  it('detects unlimited indemnification exposure', () => {
    const textPositive = '9. INDEMNITY\nContractor shall indemnify and hold harmless Client with unlimited in amount liability regardless of fault.';
    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    expect(flagsPos.some(f => f.id === 'flag-unlimited-indemnity')).toBe(true);
  });

  // Pattern 10: Moonlighting Ban
  it('detects extensive side-project and moonlighting bans', () => {
    const textPositive = '10. MOONLIGHTING\nEmployee shall devote 100% of their business time and shall not engage in any outside endeavors or personal commercial side projects on weekends.';
    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    expect(flagsPos.some(f => f.id === 'flag-moonlighting-ban')).toBe(true);
  });

  // Pattern 11: One-sided Arbitration
  it('detects biased arbitration clauses', () => {
    const textPositive = '11. ARBITRATION\nDisputes settled by arbitrator selected exclusively by landlord and tenant shall reimburse all of landlord legal fees.';
    const flagsPos = identifyRedFlags(segmentClauses(textPositive), textPositive);
    expect(flagsPos.some(f => f.id === 'flag-arbitration-bias')).toBe(true);
  });

  // Test multiple flags & Unicode
  it('handles documents with multiple overlapping red flags and Unicode symbols', () => {
    const multiText = `1. ENTRY
Landlord may enter without prior notice.

2. DEPOSIT
$500 non-refundable administrative refurbishment cleaning fee.

3. FEES
Late fee of $250 plus an additional $30 per day €100.`;

    const clauses = segmentClauses(multiText);
    const flags = identifyRedFlags(clauses, multiText);
    expect(flags.length).toBeGreaterThanOrEqual(2);
  });
});
