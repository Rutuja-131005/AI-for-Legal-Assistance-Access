import { describe, it, expect } from 'vitest';
import { identifyRedFlags } from '../../server/services/redFlagDetector.js';

describe('redFlagDetector Service', () => {
  it('detects unannounced landlord entry red flag', () => {
    const clauses = [
      {
        id: 'clause-1',
        index: 0,
        title: '5. LANDLORD RIGHT OF ENTRY',
        category: 'privacy',
        text: 'Landlord may enter premises at any time day or night without prior notice.',
        riskLevel: 'critical'
      }
    ];

    const flags = identifyRedFlags(clauses, clauses[0].text);
    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0].category).toBe('Unreasonable Entry Without Notice');
    expect(flags[0].riskLevel).toBe('critical');
    expect(flags[0].counterProposal).toContain('twenty-four (24) hours');
  });

  it('detects non-refundable deposit deduction red flag', () => {
    const clauses = [
      {
        id: 'clause-2',
        index: 1,
        title: '4. SECURITY DEPOSIT',
        category: 'financial',
        text: 'A non-refundable refurbishment and administrative turnover fee of $850 shall be deducted automatically.',
        riskLevel: 'critical'
      }
    ];

    const flags = identifyRedFlags(clauses, clauses[0].text);
    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0].category).toBe('Automatic Deposit Forfeiture');
    expect(flags[0].riskLevel).toBe('critical');
  });

  it('detects Net-90 delayed payment red flag', () => {
    const clauses = [
      {
        id: 'clause-3',
        index: 2,
        title: '2. PAYMENT TERMS',
        category: 'financial',
        text: 'Company shall remit payment within ninety (90) days of receiving an invoice ("Net-90").',
        riskLevel: 'critical'
      }
    ];

    const flags = identifyRedFlags(clauses, clauses[0].text);
    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0].category).toBe('Unreasonable 90-Day Payment Delay');
  });
});
