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

  // Financial commitment match
  let totalFinancialCommitment;
  const moneyMatches = (text || '').match(/\$[\d,]+(?:\.\d{2})?/g);
  if (moneyMatches && moneyMatches.length > 0) {
    totalFinancialCommitment = moneyMatches.slice(0, 2).join(', ');
  }

  // Effective date
  let effectiveDate;
  const dateMatch = (text || '').match(/(?:dated|commencing|entered\s+into\s+as\s+of|on)\s+this\s+([0-9a-z\s,]+(?:202\d))/i);
  if (dateMatch) {
    effectiveDate = dateMatch[1].trim();
  }

  return {
    parties,
    effectiveDate,
    totalFinancialCommitment,
    renewalTerms: /automatic(?:ally)?\s+renew/i.test(text || '') ? 'Automatic Renewal (Evergreen)' : 'Standard Expiration / Manual',
    noticePeriod: extractNoticePeriod(text || ''),
    jurisdiction: extractJurisdiction(text || '')
  };
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
