import { describe, it, expect } from 'vitest';
import { extractEntities } from '../../server/services/entityExtractor';

describe('entityExtractor (Strict No-Sample-Fabrication Verification)', () => {
  it('extracts named parties accurately from preamble', () => {
    const text = 'This agreement is entered into by and between Global Tech Systems Inc ("Employer") and David Smith ("Employee").';
    const entities = extractEntities(text, 'employment_agreement');

    expect(entities.parties.length).toBe(2);
    expect(entities.parties[0].name).toBe('Global Tech Systems Inc');
    expect(entities.parties[1].name).toBe('David Smith');
  });

  it('CRITICAL: Never returns sample names (Skyline Real Estate, Riya Sharma) for unrelated documents', () => {
    const unrelatedText = `EQUIPMENT LEASE AGREEMENT
This agreement governs the lease of industrial machinery.
Monthly payment: $4,500.`;

    const entities = extractEntities(unrelatedText, 'residential_lease');

    // Assert that sample names from initial codebase NEVER leak into unrelated analyses
    expect(entities.parties[0].name).not.toBe('Skyline Real Estate Holdings LLC');
    expect(entities.parties[1].name).not.toBe('Riya Sharma');
    expect(entities.parties[0].name).not.toBe('Apex Media Labs Inc.');
    expect(entities.parties[1].name).not.toBe('Jordan Lee');
  });

  it('extracts financial commitments and notice periods accurately', () => {
    const text = 'Contract total is $12,500 with a mandatory 60 days notice requirement for termination.';
    const entities = extractEntities(text, 'independent_contractor');

    expect(entities.totalFinancialCommitment).toContain('$12,500');
    expect(entities.noticePeriod).toBe('60 Days Notice');
  });

  it('extracts effective date from document preamble', () => {
    const text = 'This lease agreement is entered into as of this 1st day of October 2025.';
    const entities = extractEntities(text, 'residential_lease');

    expect(entities.effectiveDate).toBeDefined();
  });
});
