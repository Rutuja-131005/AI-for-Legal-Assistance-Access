import { DocumentCategory } from '../../src/types';

/**
 * Detect Missing Standard Legal Protections based on Document Category and Content.
 * Dynamically checks document text without hardcoding specific tenant/party names.
 */
export function identifyMissingProtections(text: string, category: DocumentCategory): string[] {
  const lower = text.toLowerCase();
  const missing: string[] = [];

  if (category === 'residential_lease') {
    if (!/24\s+hours|twenty-four\s+hours|reasonable\s+notice/i.test(lower)) {
      missing.push('Statutory 24-Hour Entry Notice: Lease lacks standard mandatory advance notice before landlord entry.');
    }
    if (!/grace\s+period|5\s+days|five\s+days/i.test(lower)) {
      missing.push('Rent Grace Period: No standard 3-to-5 day buffer before aggressive late penalties trigger.');
    }
    if (!/warranty\s+of\s+habitability|structural\s+maintenance/i.test(lower)) {
      missing.push('Landlord Habitability Warranty: Fails to acknowledge the landlord\'s legal duty to keep building weatherproof, heated, and plumbed.');
    }
    if (!/escrow|itemized\s+receipt|itemized\s+deduction/i.test(lower)) {
      missing.push('Escrow Protection & Itemized Deductions: Does not require the landlord to deposit funds in a protected escrow or itemize damage receipts.');
    }
  } else if (category === 'independent_contractor') {
    if (!/net-15|net-30|late\s+payment\s+interest/i.test(lower)) {
      missing.push('Reasonable Payment Timeline: Lacks standard Net-15 or Net-30 payment window and late interest terms.');
    }
    if (!/kill\s+fee|pro-rated\s+compensation|work\s+completed/i.test(lower)) {
      missing.push('Termination Kill Fee: No clause compensating the contractor for work completed prior to sudden cancellation.');
    }
    if (!/pre-existing\s+tools|portfolio\s+rights|background\s+ip/i.test(lower)) {
      missing.push('Portfolio & Background IP Carveout: Fails to protect contractor\'s right to use pre-existing code and show work in portfolios.');
    }
  } else if (category === 'employment_agreement') {
    if (!/severance|notice\s+period/i.test(lower)) {
      missing.push('Severance & Termination Notice: No provision for advance notice or severance pay in case of termination without cause.');
    }
    if (!/personal\s+projects|open\s+source|side\s+endeavors/i.test(lower)) {
      missing.push('Personal Side-Project & IP Carveout: Missing clear exclusion for non-competitive projects developed on personal time.');
    }
  } else if (category === 'nda_confidentiality') {
    if (!/mutual|both\s+parties/i.test(lower)) {
      missing.push('Mutuality of Non-Disclosure: Agreement is one-sided, protecting only one party\'s confidential information.');
    }
    if (!/standard\s+exceptions|public\s+domain|prior\s+knowledge/i.test(lower)) {
      missing.push('Standard Information Exceptions: Lacks standard exclusions for public domain information, independent discovery, or legally compelled disclosure.');
    }
  }

  return missing;
}
