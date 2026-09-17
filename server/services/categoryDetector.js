/**
 * Determine the document category from raw text using keyword heuristics.
 */
export function detectDocumentCategory(text) {
  const lower = (text || '').toLowerCase();
  if (/lease|tenant|landlord|premises|rent\s+of\s+\$|security\s+deposit/i.test(lower)) return 'residential_lease';
  if (/independent\s+contractor|contractor\s+services|statement\s+of\s+work|deliverables|net-30|net-60|net-90/i.test(lower)) return 'independent_contractor';
  if (/employee|employer|at-will\s+employment|salary|job\s+title|employment\s+agreement/i.test(lower)) return 'employment_agreement';
  if (/non-disclosure|confidential\s+information|proprietary\s+information|receiving\s+party|disclosing\s+party/i.test(lower)) return 'nda_confidentiality';
  if (/terms\s+of\s+service|terms\s+of\s+use|privacy\s+policy|user\s+content|service\s+provider/i.test(lower)) return 'terms_of_service';
  if (/promissory\s+note|loan\s+agreement|borrower|lender|principal\s+sum|interest\s+rate/i.test(lower)) return 'loan_debt';
  return 'general_contract';
}

/**
 * Human-readable display name for each document category.
 */
export function getCategoryDisplayName(cat) {
  switch (cat) {
    case 'residential_lease': return 'Residential Lease Agreement';
    case 'independent_contractor': return 'Freelance / Contractor Services Agreement';
    case 'employment_agreement': return 'Employment Offer & Confidentiality Terms';
    case 'nda_confidentiality': return 'Non-Disclosure Agreement (NDA)';
    case 'terms_of_service': return 'Consumer Terms of Service & Privacy Policy';
    case 'loan_debt': return 'Promissory Note & Loan Agreement';
    default: return 'General Legal Agreement';
  }
}
