import { describe, it, expect } from 'vitest';
import { detectDocumentCategory, getCategoryDisplayName } from '../../server/services/categoryDetector';

describe('categoryDetector (Comprehensive 10 Cases)', () => {
  // Case 1: Residential lease
  it('1. detects residential lease agreement', () => {
    const text = 'RESIDENTIAL LEASE AGREEMENT. Landlord leases to Tenant premises at 456 Oak St for monthly rent $1800 and security deposit.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('residential_lease');
    expect(getCategoryDisplayName(category)).toBe('Residential Lease Agreement');
  });

  // Case 2: Employment agreement
  it('2. detects employment agreement', () => {
    const text = 'EMPLOYMENT AGREEMENT. Employer hereby hires Employee at an annual salary of $120,000 at-will employment.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('employment_agreement');
    expect(getCategoryDisplayName(category)).toBe('Employment Offer & Confidentiality Terms');
  });

  // Case 3: Contractor agreement
  it('3. detects independent contractor agreement', () => {
    const text = 'INDEPENDENT CONTRACTOR SERVICES AGREEMENT. Contractor shall provide deliverables subject to statement of work and Net-30 payment schedule.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('independent_contractor');
    expect(getCategoryDisplayName(category)).toBe('Freelance / Contractor Services Agreement');
  });

  // Case 4: Terms of service
  it('4. detects terms of service / privacy policy', () => {
    const text = 'TERMS OF SERVICE AND PRIVACY POLICY. By using this service provider platform, user content must comply with rules.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('terms_of_service');
    expect(getCategoryDisplayName(category)).toBe('Consumer Terms of Service & Privacy Policy');
  });

  // Case 5: General contract
  it('5. detects general contract', () => {
    const text = 'GENERAL COOPERATION AGREEMENT. Parties agree to collaborate on research project scope.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('general_contract');
    expect(getCategoryDisplayName(category)).toBe('General Legal Agreement');
  });

  // Case 6: Ambiguous document
  it('6. handles ambiguous document text gracefully', () => {
    const text = 'This document sets forth mutual understandings between both parties for future endeavors without standard keywords.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('general_contract');
  });

  // Case 7: Empty string
  it('7. handles empty string without throwing', () => {
    const category = detectDocumentCategory('');
    expect(category).toBe('general_contract');
  });

  // Case 8: Very short text
  it('8. handles very short text', () => {
    const category = detectDocumentCategory('Rent lease');
    expect(category).toBe('residential_lease');
  });

  // Case 9: Unicode text
  it('9. handles Unicode and international characters', () => {
    const text = 'RESIDENTIAL LEASE AGREEMENT — 租赁合同 — Landlord & Tenant monthly rent $1500 €2000 ¥100000.';
    const category = detectDocumentCategory(text);
    expect(category).toBe('residential_lease');
  });

  // Case 10: Mixed formatting
  it('10. handles mixed formatting, linebreaks, and special symbols', () => {
    const text = `=== INDEPENDENT CONTRACTOR AGREEMENT ===\n\n* Scope of Work: Web Dev\n* Payment: Net-30 Invoices\n* Deliverables: @app/core`;
    const category = detectDocumentCategory(text);
    expect(category).toBe('independent_contractor');
  });
});
