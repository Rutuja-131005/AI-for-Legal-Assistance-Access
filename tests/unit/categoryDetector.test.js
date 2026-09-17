import { describe, it, expect } from 'vitest';
import { detectDocumentCategory, getCategoryDisplayName } from '../../server/services/categoryDetector.js';

describe('categoryDetector Service', () => {
  it('detects residential lease category correctly', () => {
    const text = 'This residential lease agreement is between Landlord and Tenant for premises rent of $2,000 and security deposit.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('residential_lease');
    expect(getCategoryDisplayName(category)).toBe('Residential Lease Agreement');
  });

  it('detects independent contractor category correctly', () => {
    const text = 'Independent contractor services agreement with statement of work and net-30 payment terms.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('independent_contractor');
    expect(getCategoryDisplayName(category)).toBe('Freelance / Contractor Services Agreement');
  });

  it('detects employment agreement category correctly', () => {
    const text = 'Employment agreement for salary, at-will employment, and job title Senior Developer.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('employment_agreement');
    expect(getCategoryDisplayName(category)).toBe('Employment Offer & Confidentiality Terms');
  });

  it('detects NDA category correctly', () => {
    const text = 'Non-disclosure agreement for confidential information received by receiving party from disclosing party.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('nda_confidentiality');
    expect(getCategoryDisplayName(category)).toBe('Non-Disclosure Agreement (NDA)');
  });

  it('detects terms of service category correctly', () => {
    const text = 'Terms of service and privacy policy for user content provided by service provider.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('terms_of_service');
    expect(getCategoryDisplayName(category)).toBe('Consumer Terms of Service & Privacy Policy');
  });

  it('detects loan debt category correctly', () => {
    const text = 'Promissory note loan agreement between borrower and lender for principal sum with interest rate.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('loan_debt');
    expect(getCategoryDisplayName(category)).toBe('Promissory Note & Loan Agreement');
  });

  it('defaults to general contract for uncategorized text', () => {
    const text = 'Some generic legal document text without specific keywords.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('general_contract');
    expect(getCategoryDisplayName(category)).toBe('General Legal Agreement');
  });
});
