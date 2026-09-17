/**
 * Dynamically extract rights, obligations, and restrictions from clause text.
 * NEVER returns hardcoded sample-specific values — all results derived from actual document content.
 */
export function extractRightsAndObligations(clauses, category) {
  const items = [];
  const consumerRole = getConsumerRole(category);

  for (const clause of clauses) {
    const lowerText = clause.text.toLowerCase();

    // Detect RIGHTS — things the consumer is entitled to
    if (/shall\s+have\s+the\s+right|entitled\s+to|leases?\s+to\s+(?:tenant|employee|contractor)/i.test(clause.text)) {
      const description = summarizeRight(clause, category);
      if (description) {
        items.push({
          type: 'right',
          party: consumerRole,
          description,
          importance: 'high',
          clauseReference: clause.title
        });
      }
    }

    // Detect OBLIGATIONS — things the consumer/party must do or payment schedules
    if (/(?:tenant|employee|contractor|borrower|user|client|party)\s+(?:agrees?\s+to|shall)\s+(?:pay|provide|maintain|comply|bear|submit|deliver|process)|payment|net-\d+|invoice/i.test(clause.text)) {
      const description = summarizeObligation(clause, category);
      if (description) {
        items.push({
          type: 'obligation',
          party: consumerRole,
          description,
          importance: clause.riskLevel === 'critical' ? 'high' : 'medium',
          clauseReference: clause.title
        });
      }
    }

    // Detect RESTRICTIONS — things the consumer cannot do
    if (/shall\s+not|prohibited|may\s+not|waives?\s+(?:all\s+)?rights?|no\s+(?:overnight|guest)|restrict/i.test(lowerText)) {
      const description = summarizeRestriction(clause, category);
      if (description) {
        items.push({
          type: 'restriction',
          party: consumerRole,
          description,
          importance: clause.riskLevel === 'critical' ? 'high' : 'medium',
          clauseReference: clause.title
        });
      }
    }
  }

  // If we couldn't extract anything, provide a generic placeholder
  if (items.length === 0) {
    items.push({
      type: 'obligation',
      party: consumerRole,
      description: 'Comply with all terms and conditions specified in this agreement.',
      importance: 'medium'
    });
  }

  return items;
}

function getConsumerRole(category) {
  switch (category) {
    case 'residential_lease': return 'Tenant';
    case 'independent_contractor': return 'Contractor';
    case 'employment_agreement': return 'Employee';
    case 'loan_debt': return 'Borrower';
    case 'terms_of_service': return 'User';
    default: return 'Consumer';
  }
}

function summarizeRight(clause, _category) {
  const text = clause.text;
  if (/lease[sd]?\s+to\s+/i.test(text)) {
    return `Occupancy or use of the subject matter as specified in "${clause.title}".`;
  }
  if (/entitled\s+to\s+/i.test(text)) {
    const match = text.match(/entitled\s+to\s+([^.]{10,80})/i);
    return match ? match[1].trim() + '.' : `Rights specified under "${clause.title}".`;
  }
  return `Rights as outlined in "${clause.title}".`;
}

function summarizeObligation(clause, _category) {
  const text = clause.text;

  // Extract payment obligations with actual amounts from the text
  const payMatch = text.match(/pay\s+(?:monthly\s+)?(?:rent\s+)?(?:of\s+)?\$([\d,]+(?:\.\d{2})?)/i);
  if (payMatch) {
    return `Pay $${payMatch[1]} as specified in "${clause.title}".`;
  }

  // Extract deposit amounts
  const depositMatch = text.match(/deposit\s+(?:with\s+\w+\s+)?(?:the\s+sum\s+of\s+)?\$([\d,]+(?:\.\d{2})?)/i);
  if (depositMatch) {
    return `Provide a deposit of $${depositMatch[1]} as specified in "${clause.title}".`;
  }

  if (/net-\d+/i.test(text)) {
    const netMatch = text.match(/net-\d+/i);
    return `Payment schedule: ${netMatch ? netMatch[0] : 'Net terms'} per "${clause.title}".`;
  }

  // Generic obligation summary
  if (/maintain|repair|bear\s+.*responsibility/i.test(text)) {
    return `Maintenance and repair responsibilities as described in "${clause.title}".`;
  }

  if (/notice|notify|inform/i.test(text)) {
    return `Provide notice as required under "${clause.title}".`;
  }

  return `Fulfill obligations specified in "${clause.title}".`;
}

function summarizeRestriction(clause, _category) {
  const text = clause.text;

  if (/waives?\s+(?:all\s+)?rights?\s+to\s+(?:a\s+)?(?:trial|jury|class)/i.test(text)) {
    return `Waiver of jury trial or class action rights as stated in "${clause.title}".`;
  }

  if (/shall\s+not\s+(?:engage|provide|work|perform)/i.test(text)) {
    return `Activity restrictions as specified in "${clause.title}".`;
  }

  if (/guest|overnight|occupan/i.test(text)) {
    return `Guest or occupancy limitations as described in "${clause.title}".`;
  }

  if (/non-compete|non-solicitat/i.test(text)) {
    return `Non-competition or non-solicitation restrictions per "${clause.title}".`;
  }

  return `Restrictions outlined in "${clause.title}".`;
}
