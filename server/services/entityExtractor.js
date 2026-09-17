function cleanPartyName(raw) {
  return raw
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*"[^"]*"/g, '')
    .replace(/[.,]\s*$/, '')
    .trim();
}

/**
 * Extract parties and key entities from document text.
 * NEVER returns hardcoded sample-specific names — only data found in the document or "Not detected".
 */
export function extractEntities(text, category) {
  const parties = [];

  // Look for "by and between Party A ("Landlord") and Party B ("Tenant")"
  const partyRegex = /by\s+and\s+between\s+([^(,\n]+)\s*(?:\((?:the\s+)?"?([^"]+)"?\))?,?\s*and\s+([^(,\n]+)\s*(?:\((?:the\s+)?"?([^"]+)"?\))?/i;
  const match = (text || '').match(partyRegex);

  if (match) {
    parties.push({
      name: cleanPartyName(match[1]),
      role: match[2]?.trim() || getRoleLabel(category, 0)
    });
    parties.push({
      name: cleanPartyName(match[3]),
      role: match[4]?.trim() || getRoleLabel(category, 1)
    });
  } else {
    // Try alternative patterns: "entered into by X ("Role") and Y ("Role")"
    const altRegex = /entered\s+into\s+(?:on\s+[^,]+,\s*)?by\s+and\s+between\s+([^(]+)\(?"?([^")]*)"?\)?\s*and\s+([^(]+)\(?"?([^")]*)"?\)?/i;
    const altMatch = (text || '').match(altRegex);

    if (altMatch) {
      parties.push({
        name: cleanPartyName(altMatch[1]),
        role: altMatch[2]?.trim() || getRoleLabel(category, 0)
      });
      parties.push({
        name: cleanPartyName(altMatch[3]),
        role: altMatch[4]?.trim() || getRoleLabel(category, 1)
      });
    } else {
      // Try "entered into ... by ... ("Role") and ... ("Role")"
      const simpleRegex = /(?:by|between)\s+([A-Z][A-Za-z\s.]+(?:LLC|Inc|Corp|Ltd)?)\s+.*?and\s+([A-Z][A-Za-z\s.]+)/i;
      const simpleMatch = (text || '').match(simpleRegex);

      if (simpleMatch) {
        parties.push({ name: cleanPartyName(simpleMatch[1]), role: getRoleLabel(category, 0) });
        parties.push({ name: cleanPartyName(simpleMatch[2]), role: getRoleLabel(category, 1) });
      } else {
        // Genuinely could not extract — use generic labels, NEVER hardcoded sample names
        parties.push({ name: 'Not detected', role: getRoleLabel(category, 0) });
        parties.push({ name: 'Not detected', role: getRoleLabel(category, 1) });
      }
    }
  }

  // Extract dates
  let effectiveDate = 'Not specified';
  const dateMatch = (text || '').match(/(?:dated|commencing|entered\s+into\s+as\s+of|effective\s+as\s+of|on)\s+this\s+([0-9a-z\s,]+(?:202\d|203\d))/i);
  if (dateMatch) {
    effectiveDate = dateMatch[1].trim();
  }

  let expiryDate = 'Not specified';
  const expiryMatch = (text || '').match(/(?:expir(?:es|ing)|terminat(?:es|ing)|ending)\s+(?:on|as\s+of)\s+([0-9a-z\s,]+(?:202\d|203\d))/i);
  if (expiryMatch) {
    expiryDate = expiryMatch[1].trim();
  }

  const importantDates = [];
  if (effectiveDate !== 'Not specified') importantDates.push({ label: 'Effective Date', date: effectiveDate });
  if (expiryDate !== 'Not specified') importantDates.push({ label: 'Expiry Date', date: expiryDate });

  const moneyMatches = (text || '').match(/\$[\d,]+(?:\.\d{2})?/g);
  const totalFinancialCommitment = moneyMatches && moneyMatches.length > 0 ? moneyMatches.slice(0, 3).join(', ') : 'Not specified';

  return {
    parties,
    agreementTitle: extractTitle(text),
    effectiveDate,
    expiryDate,
    renewalPeriod: /automatic(?:ally)?\s+renew/i.test(text || '') ? 'Automatic Renewal (Evergreen)' : 'Standard Expiration / Manual',
    paymentTerms: totalFinancialCommitment,
    terminationConditions: extractTermination(text),
    noticePeriod: extractNoticePeriod(text || ''),
    obligations: extractObligations(text),
    penalties: extractPenalties(text),
    liability: extractLiability(text),
    confidentiality: /confidential/i.test(text || '') ? 'Binding Confidentiality Requirements' : 'Standard / None Explicit',
    intellectualProperty: /intellectual\s+property|invention|work\s+product|patent|copyright/i.test(text || '') ? 'IP Assignment / Work Product Clause' : 'Not specified',
    disputeResolution: /arbitrat|mediation|court/i.test(text || '') ? 'Mandatory Arbitration / Dispute Clause' : 'Standard Judicial Remedies',
    governingLaw: extractJurisdiction(text || '') || 'State Law',
    jurisdiction: extractJurisdiction(text || '') || 'Not specified',
    importantDates,
    restrictionsAndExceptions: extractRestrictions(text)
  };
}

function extractTitle(text = '') {
  const line = text.split('\n')[0]?.trim();
  if (line && line.length < 60) return line;
  return 'Legal Agreement';
}

function extractTermination(text = '') {
  if (/written\s+notice/i.test(text)) return 'Requires written notice prior to termination.';
  if (/at\s+will/i.test(text)) return 'At-will termination by either party.';
  return 'Standard expiration at end of term.';
}

function extractObligations(text = '') {
  const obligations = [];
  if (/shall\s+pay/i.test(text)) obligations.push('Timely financial payments as stipulated.');
  if (/shall\s+maintain/i.test(text)) obligations.push('Maintenance of premises or property.');
  if (/shall\s+not\s+disclose/i.test(text)) obligations.push('Strict non-disclosure of confidential data.');
  return obligations.length > 0 ? obligations : ['Standard contractual performance obligations.'];
}

function extractPenalties(text = '') {
  if (/late\s+fee|interest\s+rate|penalty/i.test(text)) return 'Late fees or penalty interest on default.';
  return 'Standard contractual remedies for breach.';
}

function extractLiability(text = '') {
  if (/indemnif|hold\s+harmless/i.test(text)) return 'Includes broad indemnity / hold harmless provisions.';
  return 'Standard mutual liability bounds.';
}

function extractRestrictions(text = '') {
  const restrictions = [];
  if (/no\s+pets/i.test(text)) restrictions.push('No pets or animals allowed.');
  if (/non-compete/i.test(text)) restrictions.push('Non-compete covenant.');
  if (/sublet/i.test(text)) restrictions.push('Subletting requires prior written consent.');
  return restrictions.length > 0 ? restrictions : ['Standard usage restrictions.'];
}

function getRoleLabel(category, index) {
  const roleMap = {
    residential_lease: ['Landlord / Property Owner', 'Tenant / Renter'],
    independent_contractor: ['Company / Client', 'Contractor'],
    employment_agreement: ['Employer', 'Employee'],
    nda_confidentiality: ['Disclosing Party', 'Receiving Party'],
    terms_of_service: ['Service Provider', 'User / Consumer'],
    loan_debt: ['Lender', 'Borrower'],
    general_contract: ['First Party', 'Second Party']
  };
  return roleMap[category]?.[index] || (index === 0 ? 'First Party' : 'Second Party');
}

function extractNoticePeriod(text) {
  if (/90\s+days/i.test(text)) return '90 Days Notice';
  if (/60\s+days/i.test(text)) return '60 Days Notice';
  if (/30\s+days/i.test(text)) return '30 Days Notice';
  return 'Not specified';
}

function extractJurisdiction(text) {
  const jMatch = text.match(/governed\s+by\s+the\s+laws\s+of\s+(?:the\s+)?(?:State\s+of\s+)?([^,.\n]+)/i);
  return jMatch ? jMatch[1].trim() : undefined;
}
