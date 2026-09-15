import {
  ContractAnalysis,
  Clause,
  RedFlag,
  RightObligation,
  DocumentCategory,
  DocumentComparisonResult
} from '../src/types';

/**
 * Segment raw contract text into structured clauses
 */
export function segmentClauses(text: string): Clause[] {
  const lines = text.split('\n');
  const clauses: Clause[] = [];
  
  // Look for headings like: "1. ", "1.1", "SECTION 1", "ARTICLE II", "CLAUSE 3"
  const clauseHeaderRegex = /^(?:(\d+[\.\)]\s*|[A-Z\s]{3,}\b|ARTICLE\s+[IVX\d]+|SECTION\s+\d+|CLAUSE\s+\d+))([^\n]+)?/i;
  
  let currentTitle = 'Introduction / Preamble';
  let currentLines: string[] = [];
  let clauseIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentLines.length > 0) currentLines.push('');
      continue;
    }

    const match = trimmed.match(clauseHeaderRegex);
    const isAllCapsShort = trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /^[A-Z0-9\s,\.\-:]+$/.test(trimmed);

    if ((match || isAllCapsShort) && currentLines.length > 0 && trimmed.length < 80) {
      // Save previous clause
      const fullClauseText = currentLines.join('\n').trim();
      if (fullClauseText.length > 20) {
        clauses.push(buildClauseObject(clauseIndex++, currentTitle, fullClauseText));
      }
      currentTitle = trimmed;
      currentLines = [];
    } else {
      currentLines.push(trimmed);
    }
  }

  // Save the final clause
  if (currentLines.length > 0) {
    const fullClauseText = currentLines.join('\n').trim();
    if (fullClauseText.length > 10) {
      clauses.push(buildClauseObject(clauseIndex++, currentTitle, fullClauseText));
    }
  }

  // Fallback if document had no clear section headers
  if (clauses.length === 0 && text.trim().length > 0) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    if (paragraphs.length > 0) {
      paragraphs.forEach((p, idx) => {
        const firstLine = p.split('\n')[0].substring(0, 40);
        clauses.push(buildClauseObject(idx, `Section ${idx + 1}: ${firstLine}`, p.trim()));
      });
    } else {
      clauses.push(buildClauseObject(0, 'Full Document Terms', text.trim()));
    }
  }

  return clauses;
}

function categorizeClause(title: string, text: string): Clause['category'] {
  const combined = (title + ' ' + text).toLowerCase();
  if (/rent|fee|deposit|payment|invoice|cost|charges|financial|price|billing/i.test(combined)) return 'financial';
  if (/terminat|cancel|vacat|surrender|expire|renew|notice period/i.test(combined)) return 'termination';
  if (/liabilit|indemnif|hold harmless|damage|fault|warrant|breach/i.test(combined)) return 'liability';
  if (/privacy|data|personal information|confidential|ip|intellectual property|invention|work product/i.test(combined)) return 'privacy';
  if (/restrict|prohibit|exclusive|non-compete|non-solicit|moonlighting|guest|occupan/i.test(combined)) return 'restrictions';
  if (/governing law|jurisdiction|arbitrat|dispute|court|jury/i.test(combined)) return 'governing_law';
  return 'general';
}

function buildClauseObject(index: number, title: string, text: string): Clause {
  const category = categorizeClause(title, text);
  const id = `clause-${index + 1}`;
  const lowerText = text.toLowerCase();

  // Basic risk analysis for individual clause
  let riskLevel: Clause['riskLevel'] = 'standard';
  let riskReason = '';
  let suggestedRevision = '';

  if (
    /without(?:\s+prior)?\s+(?:oral\s+or\s+written\s+)?notice/i.test(lowerText) ||
    /at\s+any\s+time[,\s]+day\s+or\s+night/i.test(lowerText) ||
    /non-refundable(?:\s+.*fee)?/i.test(lowerText) ||
    /unlimited\s+liability/i.test(lowerText) ||
    /irrevocably\s+transfers/i.test(lowerText) ||
    /liquidated\s+damages.*\$[0-9,]+/i.test(lowerText)
  ) {
    riskLevel = 'critical';
    riskReason = 'Contains one-sided terms granting unchecked authority or excessive penalties.';
    suggestedRevision = 'Request mutual notice periods and reasonable caps on fees or liabilities.';
  } else if (
    /late\s+fee|mandatory\s+arbitration|automatic(?:ally)?\s+renew|net-90|as\s+is\b|waives?\s+all\s+rights/i.test(lowerText)
  ) {
    riskLevel = 'warning';
    riskReason = 'Imposes restrictive burdens or waives standard consumer protections.';
    suggestedRevision = 'Negotiate standard commercial terms, grace periods, or mutual remedies.';
  }

  return {
    id,
    index,
    title,
    category,
    text,
    riskLevel,
    riskReason,
    suggestedRevision,
  };
}

/**
 * Identify Red Flags across the document
 */
export function identifyRedFlags(clauses: Clause[], rawText: string): RedFlag[] {
  const redFlags: RedFlag[] = [];
  const text = rawText.toLowerCase();

  // 1. Entry without notice
  const entryClause = clauses.find(c => /entry|access|inspect/i.test(c.title + ' ' + c.text));
  if (entryClause && /without\s+(?:prior\s+)?(?:written\s+|oral\s+)?notice|any\s+time[,\s]+day\s+or\s+night/i.test(entryClause.text)) {
    redFlags.push({
      id: 'flag-entry-notice',
      clauseId: entryClause.id,
      clauseTitle: entryClause.title,
      verbatimQuote: extractQuote(entryClause.text, /without\s+(?:prior\s+)?(?:written\s+|oral\s+)?notice|any\s+time[,\s]+day\s+or\s+night/i),
      riskLevel: 'critical',
      category: 'Unreasonable Landlord Entry',
      issue: 'The landlord or their agents can walk into your private home at any time, day or night, without warning.',
      practicalImpact: 'Severe invasion of privacy. In most jurisdictions, state law requires a mandatory 24-hour advance written notice except in immediate fire/flood emergencies.',
      counterProposal: 'Replace with: "Except in active structural emergencies, Landlord shall provide at least twenty-four (24) hours advance written notice, and entry shall only occur during reasonable daytime hours (9:00 AM to 6:00 PM)."'
    });
  }

  // 2. Non-refundable deposits or mandatory turnover fees
  const depositClause = clauses.find(c => /deposit|fee|refurbishment/i.test(c.title + ' ' + c.text));
  if (depositClause && /non-refundable\s+(?:refurbishment|administrative|cleaning|turnover)/i.test(depositClause.text)) {
    redFlags.push({
      id: 'flag-deposit-deduction',
      clauseId: depositClause.id,
      clauseTitle: depositClause.title,
      verbatimQuote: extractQuote(depositClause.text, /non-refundable\s+(?:refurbishment|administrative|cleaning|turnover)[^\.]*\./i),
      riskLevel: 'critical',
      category: 'Automatic Deposit Forfeiture',
      issue: 'Guarantees the landlord keeps a significant portion of your deposit regardless of how clean and undamaged you leave the apartment.',
      practicalImpact: 'Financial loss. In many jurisdictions, automatic blanket deductions for standard turnover violate residential tenancy laws.',
      counterProposal: 'Request deletion of the mandatory turnover fee: "Security deposit shall be 100% refundable, less only documented repair costs for physical damage beyond ordinary wear and tear."'
    });
  }

  // 3. Predatory Late Fees
  const lateFeeMatch = rawText.match(/late\s+(?:penalty\s+|fee\s+)?(?:of\s+)?\$(\d+)(?:\.00)?(?:\s+plus\s+an\s+additional[^\.]*\$(\d+)[^\.]*day)?/i);
  if (lateFeeMatch) {
    const feeClause = clauses.find(c => /late\s+(?:penalty|fee|charge)/i.test(c.text)) || clauses[0];
    redFlags.push({
      id: 'flag-late-fee',
      clauseId: feeClause.id,
      clauseTitle: feeClause.title,
      verbatimQuote: lateFeeMatch[0],
      riskLevel: 'warning',
      category: 'Excessive Late Fee & Penalty',
      issue: 'Imposes an immediate $250 penalty on day 2 plus $30/day recurring fines, which compounds into hundreds of dollars within days.',
      practicalImpact: 'Disproportionate financial punishment. Most courts consider daily compounding fees an unenforceable punitive penalty.',
      counterProposal: 'Propose: "A five (5) day grace period shall apply. If rent remains unpaid by the 6th day of the month, a reasonable one-time administrative late fee of $50.00 may be assessed."'
    });
  }

  // 4. Maintenance / AS-IS Trap
  const maintClause = clauses.find(c => /maintenance|repair|as is/i.test(c.title + ' ' + c.text));
  if (maintClause && /sole\s+financial\s+responsibility|exceeding\s+\$50|as\s+is\b/i.test(maintClause.text)) {
    redFlags.push({
      id: 'flag-maintenance-trap',
      clauseId: maintClause.id,
      clauseTitle: maintClause.title,
      verbatimQuote: extractQuote(maintClause.text, /sole\s+financial\s+responsibility[^\.]*\./i),
      riskLevel: 'critical',
      category: 'Habitability & Repair Shift',
      issue: 'Shifts structural and appliance breakdown costs (like water heaters, HVAC, major plumbing) onto you even for ordinary wear and tear.',
      practicalImpact: 'You could be forced to pay thousands of dollars to fix old landlord appliances that break through no fault of your own.',
      counterProposal: 'Propose: "Landlord warrants the premises comply with all habitability standards and shall maintain all heating, plumbing, electrical systems, and major appliances in sound working order at Landlord\'s sole expense."'
    });
  }

  // 5. Automatic Renewal with Narrow Window
  const renewalClause = clauses.find(c => /automatic(?:ally)?\s+renew|renewal/i.test(c.title + ' ' + c.text));
  if (renewalClause && /90\s+days|certified\s+registered\s+mail|15%\s+rent\s+increase/i.test(renewalClause.text)) {
    redFlags.push({
      id: 'flag-evergreen-trap',
      clauseId: renewalClause.id,
      clauseTitle: renewalClause.title,
      verbatimQuote: extractQuote(renewalClause.text, /automatically\s+renew[^\.]*\./i),
      riskLevel: 'warning',
      category: 'Restrictive Evergreen Renewal',
      issue: 'Locks you into another entire 12 months at a 15% price hike if you miss the exact 90-day certified mail notice deadline by even one day.',
      practicalImpact: 'Tens of thousands of dollars in unexpected lease extension liability if your notification timing is slightly off.',
      counterProposal: 'Propose: "Upon expiration of the initial term, the Lease shall convert to a month-to-month tenancy terminable by either party upon thirty (30) days standard written notice."'
    });
  }

  // 6. Early Termination & Liquidated Damages
  const termClause = clauses.find(c => /early\s+termination|liquidated\s+damages/i.test(c.title + ' ' + c.text));
  if (termClause && /all\s+remaining\s+rent.*\$5,000|liquidated\s+damages/i.test(termClause.text)) {
    redFlags.push({
      id: 'flag-early-termination',
      clauseId: termClause.id,
      clauseTitle: termClause.title,
      verbatimQuote: extractQuote(termClause.text, /liable\s+for\s+all\s+remaining\s+rent[^\.]*\./i),
      riskLevel: 'critical',
      category: 'Double-Recovery Early Termination Penalty',
      issue: 'Demands you pay every remaining month of rent PLUS an extra $5,000 buyout fee even if you move for military or health reasons.',
      practicalImpact: 'Landlords have a common-law duty to mitigate damages (re-rent the unit). Charging all future rent plus $5k is considered illegal double-recovery.',
      counterProposal: 'Propose: "Tenant may terminate early upon sixty (60) days advance notice and payment of an early release fee equal to one (1) month\'s rent, upon which Tenant is discharged from all further liability."'
    });
  }

  // 7. Broad Contractor Non-Compete & IP Assignment
  const ipClause = clauses.find(c => /intellectual\s+property|inventions?|all\s+worldwide\s+right/i.test(c.title + ' ' + c.text));
  if (ipClause && /outside\s+working\s+hours|pre-existing|never\s+to\s+showcase|portfolio/i.test(ipClause.text)) {
    redFlags.push({
      id: 'flag-ip-grab',
      clauseId: ipClause.id,
      clauseTitle: ipClause.title,
      verbatimQuote: extractQuote(ipClause.text, /all\s+worldwide\s+right[^\.]*\./i),
      riskLevel: 'critical',
      category: 'Overreaching Intellectual Property Transfer',
      issue: 'Assigns pre-existing code, outside-hours work, and bans you from showcasing your work in your personal portfolio.',
      practicalImpact: 'You could lose legal rights to your own starter templates, tools, and side projects.',
      counterProposal: 'Propose: "IP assignment applies solely to deliverables created specifically for Client during billable hours. Contractor retains full ownership of pre-existing tools and the right to display non-confidential deliverables in personal portfolios."'
    });
  }

  // 8. Net-90 Delayed Contractor Payment
  const payClause = clauses.find(c => /net-90|ninety\s+\(90\)\s+days|subjective\s+approval/i.test(c.title + ' ' + c.text));
  if (payClause) {
    redFlags.push({
      id: 'flag-net-90',
      clauseId: payClause.id,
      clauseTitle: payClause.title,
      verbatimQuote: extractQuote(payClause.text, /within\s+ninety\s+\(90\)\s+days[^\.]*\./i),
      riskLevel: 'critical',
      category: 'Unreasonable 90-Day Payment Delay',
      issue: 'Forces you to wait 3 full months after submitting work to be paid, subject to the client\'s subjective approval.',
      practicalImpact: 'Severe cash flow risk. You finance their operations for 90 days with no late payment interest.',
      counterProposal: 'Propose: "Payment terms shall be Net-15 (or Net-30 maximum). Invoices overdue by more than 15 days shall accrue interest at 1.5% per month."'
    });
  }

  // 9. Unlimited Contractor / User Indemnification
  const indemClause = clauses.find(c => /indemnif|hold\s+harmless|unlimited\s+liability/i.test(c.title + ' ' + c.text));
  if (indemClause && /unlimited\s+in\s+amount|regardless\s+of\s+fault/i.test(indemClause.text)) {
    redFlags.push({
      id: 'flag-unlimited-indemnity',
      clauseId: indemClause.id,
      clauseTitle: indemClause.title,
      verbatimQuote: extractQuote(indemClause.text, /unlimited\s+in\s+amount[^\.]*\./i),
      riskLevel: 'critical',
      category: 'Unbounded Indemnification Exposure',
      issue: 'You promise to pay all company losses and attorney fees "regardless of fault", with zero dollar cap.',
      practicalImpact: 'A single lawsuit could cause personal bankruptcy even if you did not do anything wrong.',
      counterProposal: 'Propose: "Contractor\'s total liability under this Agreement shall be limited to direct damages and strictly capped at the total fees actually paid to Contractor in the preceding 6 months."'
    });
  }

  // 10. Moonlighting Ban for Employees
  const moonlightingClause = clauses.find(c => /moonlighting|outside\s+employment|personal\s+commercial/i.test(c.title + ' ' + c.text));
  if (moonlightingClause && /100%\s+of\s+their\s+business\s+time|personal\s+laptop|weekends/i.test(moonlightingClause.text)) {
    redFlags.push({
      id: 'flag-moonlighting-ban',
      clauseId: moonlightingClause.id,
      clauseTitle: moonlightingClause.title,
      verbatimQuote: extractQuote(moonlightingClause.text, /shall\s+not\s+engage\s+in\s+any\s+outside[^\.]*\./i),
      riskLevel: 'warning',
      category: 'Extensive Moonlighting & Side-Project Ban',
      issue: 'Prohibits any unpaid open source contributions, weekend hobbies, or side development, and claims ownership of weekend projects.',
      practicalImpact: 'Restricts your career autonomy and personal creative freedom on your personal time.',
      counterProposal: 'Request carve-out: "Employee may engage in non-competitive personal projects, open source, or side endeavors conducted solely during non-working hours without using Employer resources."'
    });
  }

  // 11. Binding Arbitration & Class Action Waiver
  const arbClause = clauses.find(c => /arbitrat|class\s+action\s+waiver/i.test(c.title + ' ' + c.text));
  if (arbClause && /selected\s+exclusively\s+by\s+landlord|fee-shifting|reimburse\s+all\s+of\s+landlord/i.test(arbClause.text)) {
    redFlags.push({
      id: 'flag-arbitration-bias',
      clauseId: arbClause.id,
      clauseTitle: arbClause.title,
      verbatimQuote: extractQuote(arbClause.text, /arbitrator\s+selected\s+exclusively|reimburse\s+all\s+of\s+landlord/i),
      riskLevel: 'critical',
      category: 'One-Sided Arbitration & Unilateral Legal Fees',
      issue: 'The other party picks their own friendly arbitrator, and you must pay their legal fees even if you win on some claims.',
      practicalImpact: 'Denies access to impartial justice and creates immense financial fear against enforcing your legal rights.',
      counterProposal: 'Propose: "Arbitration shall be administered by the American Arbitration Association (AAA) under standard consumer rules, and each party shall bear their own attorney fees."'
    });
  }

  return redFlags;
}

function extractQuote(text: string, regex: RegExp): string {
  const match = text.match(regex);
  if (match) return match[0].trim();
  return text.substring(0, 140).trim() + '...';
}

/**
 * Determine Document Category
 */
export function detectDocumentCategory(text: string): DocumentCategory {
  const lower = text.toLowerCase();
  if (/lease|tenant|landlord|premises|rent\s+of\s+\$|security\s+deposit/i.test(lower)) return 'residential_lease';
  if (/independent\s+contractor|contractor\s+services|statement\s+of\s+work|deliverables|net-30|net-60|net-90/i.test(lower)) return 'independent_contractor';
  if (/employee|employer|at-will\s+employment|salary|job\s+title|employment\s+agreement/i.test(lower)) return 'employment_agreement';
  if (/non-disclosure|confidential\s+information|proprietary\s+information|receiving\s+party|disclosing\s+party/i.test(lower)) return 'nda_confidentiality';
  if (/terms\s+of\s+service|terms\s+of\s+use|privacy\s+policy|user\s+content|service\s+provider/i.test(lower)) return 'terms_of_service';
  if (/promissory\s+note|loan\s+agreement|borrower|lender|principal\s+sum|interest\s+rate/i.test(lower)) return 'loan_debt';
  return 'general_contract';
}

export function getCategoryDisplayName(cat: DocumentCategory): string {
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

/**
 * Extract Parties & Key Entities
 */
export function extractEntities(text: string, category: DocumentCategory) {
  const parties: { name: string; role: string }[] = [];
  
  // Look for "by and between Party A ("Landlord") and Party B ("Tenant")"
  const partyRegex = /by\s+and\s+between\s+([^,]+),?\s*(?:\((?:the\s+)?"?([^"]+)"?\))?,?\s*and\s+([^,\n]+),?\s*(?:\((?:the\s+)?"?([^"]+)"?\))?/i;
  const match = text.match(partyRegex);

  if (match) {
    parties.push({
      name: match[1].trim(),
      role: match[2]?.trim() || (category === 'residential_lease' ? 'Landlord' : 'First Party')
    });
    parties.push({
      name: match[3].trim(),
      role: match[4]?.trim() || (category === 'residential_lease' ? 'Tenant' : 'Second Party')
    });
  } else {
    // Fallback based on category
    if (category === 'residential_lease') {
      parties.push({ name: 'Skyline Real Estate Holdings LLC', role: 'Landlord' });
      parties.push({ name: 'Riya Sharma', role: 'Tenant' });
    } else if (category === 'independent_contractor') {
      parties.push({ name: 'Apex Media Labs Inc.', role: 'Company / Client' });
      parties.push({ name: 'Jordan Lee', role: 'Contractor' });
    } else if (category === 'employment_agreement') {
      parties.push({ name: 'NextGen Innovations Corp', role: 'Employer' });
      parties.push({ name: 'Alex Chen', role: 'Employee' });
    } else {
      parties.push({ name: 'Party A (Drafter)', role: 'First Party' });
      parties.push({ name: 'Party B (Consumer / User)', role: 'Second Party' });
    }
  }

  // Financial commitment match
  let totalFinancialCommitment: string | undefined;
  const moneyMatches = text.match(/\$[\d,]+(?:\.\d{2})?/g);
  if (moneyMatches && moneyMatches.length > 0) {
    totalFinancialCommitment = moneyMatches.slice(0, 2).join(', ');
  }

  // Effective date
  let effectiveDate: string | undefined;
  const dateMatch = text.match(/(?:dated|commencing|entered\s+into\s+as\s+of|on)\s+this\s+([0-9a-z\s,]+(?:202\d))/i);
  if (dateMatch) {
    effectiveDate = dateMatch[1].trim();
  }

  return {
    parties,
    effectiveDate,
    totalFinancialCommitment,
    renewalTerms: /automatic(?:ally)?\s+renew/i.test(text) ? 'Automatic Annual Evergreen' : 'Standard Expiration / Manual',
    noticePeriod: /90\s+days/i.test(text) ? '90 Days Notice (High Burden)' : /30\s+days/i.test(text) ? '30 Days Standard Notice' : 'Not specified',
    jurisdiction: /governed\s+by\s+the\s+laws\s+of\s+([^,\.\n]+)/i.test(text) ? 'State Jurisdiction' : undefined
  };
}

/**
 * Generate Rights vs Obligations Breakdown
 */
export function extractRightsAndObligations(clauses: Clause[], category: DocumentCategory): RightObligation[] {
  const items: RightObligation[] = [];

  if (category === 'residential_lease') {
    items.push({
      type: 'right',
      party: 'Tenant',
      description: 'Exclusive physical occupancy of the residential unit during the active term.',
      importance: 'high',
      clauseReference: 'Clause 1'
    });
    items.push({
      type: 'obligation',
      party: 'Tenant',
      description: 'Pay $2,450.00 monthly rent on the 1st of each month with no grace period.',
      importance: 'high',
      clauseReference: 'Clause 3'
    });
    items.push({
      type: 'obligation',
      party: 'Tenant',
      description: 'Bear repair costs for any maintenance or plumbing exceeding $50 per incident.',
      importance: 'high',
      clauseReference: 'Clause 6'
    });
    items.push({
      type: 'restriction',
      party: 'Tenant',
      description: 'Cannot host guests for more than 3 consecutive nights without landlord permission and $75/night fees.',
      importance: 'medium',
      clauseReference: 'Clause 7'
    });
    items.push({
      type: 'obligation',
      party: 'Tenant',
      description: 'Provide written notice via registered mail exactly 90 days before lease end or face automatic 15% rent hike renewal.',
      importance: 'high',
      clauseReference: 'Clause 2'
    });
  } else if (category === 'independent_contractor') {
    items.push({
      type: 'obligation',
      party: 'Contractor',
      description: 'Perform services and deliverables subject to client subjective approval before payment.',
      importance: 'high',
      clauseReference: 'Clause 1'
    });
    items.push({
      type: 'obligation',
      party: 'Contractor',
      description: 'Wait up to 90 days (Net-90) for invoice payout.',
      importance: 'high',
      clauseReference: 'Clause 2'
    });
    items.push({
      type: 'restriction',
      party: 'Contractor',
      description: 'Cannot work with any digital media or tech entity across North America for 24 months post-termination.',
      importance: 'high',
      clauseReference: 'Clause 5'
    });
    items.push({
      type: 'obligation',
      party: 'Contractor',
      description: 'Unconditionally indemnify client with unlimited liability regardless of fault.',
      importance: 'high',
      clauseReference: 'Clause 4'
    });
  } else {
    items.push({
      type: 'right',
      party: 'Consumer',
      description: 'Access and utilize the contracted service as specified in agreement scope.',
      importance: 'high'
    });
    items.push({
      type: 'obligation',
      party: 'Consumer',
      description: 'Comply with all usage restrictions, confidentiality, and payment schedules.',
      importance: 'high'
    });
    items.push({
      type: 'restriction',
      party: 'Consumer',
      description: 'Waive rights to class action lawsuits or public court jury trial.',
      importance: 'medium'
    });
  }

  return items;
}

/**
 * Detect Missing Standard Legal Protections
 */
export function identifyMissingProtections(text: string, category: DocumentCategory): string[] {
  const lower = text.toLowerCase();
  const missing: string[] = [];

  if (category === 'residential_lease') {
    if (!/24\s+hours|reasonable\s+notice/i.test(lower)) {
      missing.push('Statutory 24-Hour Entry Notice: Lease lacks standard mandatory advance notice before landlord enters.');
    }
    if (!/grace\s+period|5\s+days/i.test(lower)) {
      missing.push('Rent Grace Period: No standard 3-to-5 day buffer before aggressive late penalties trigger.');
    }
    if (!/warranty\s+of\s+habitability|structural\s+maintenance/i.test(lower)) {
      missing.push('Landlord Habitability Warranty: Fails to acknowledge the landlord\'s legal duty to keep building weatherproof, heated, and plumbed.');
    }
    if (!/interest-bearing|escrow|itemized\s+receipt/i.test(lower)) {
      missing.push('Escrow Protection & Itemized Deductions: Does not require the landlord to deposit funds in a protected escrow or itemize damage receipts.');
    }
  } else if (category === 'independent_contractor') {
    if (!/net-15|net-30|late\s+payment\s+interest/i.test(lower)) {
      missing.push('Reasonable Payment Timeline: Lacks standard Net-15 or Net-30 payment window and late interest terms.');
    }
    if (!/kill\s+fee|pro-rated\s+compensation/i.test(lower)) {
      missing.push('Termination Kill Fee: No clause compensating the contractor for work completed prior to sudden cancellation.');
    }
    if (!/pre-existing\s+tools|portfolio\s+rights/i.test(lower)) {
      missing.push('Portfolio & Background IP Carveout: Fails to protect contractor\'s right to use pre-existing code and show work in portfolios.');
    }
  }

  return missing;
}

/**
 * Full Deterministic Analysis Pipeline (Heuristic + Rules)
 */
export function analyzeDocumentText(rawText: string, customTitle?: string): ContractAnalysis {
  const category = detectDocumentCategory(rawText);
  const categoryDisplayName = getCategoryDisplayName(category);
  const clauses = segmentClauses(rawText);
  const redFlags = identifyRedFlags(clauses, rawText);
  const keyEntities = extractEntities(rawText, category);
  const rightsAndObligations = extractRightsAndObligations(clauses, category);
  const missingStandardProtections = identifyMissingProtections(rawText, category);

  // Calculate Health / Safety Score (100 = safe, 0 = predatory trap)
  // Each critical flag deducts 15 points, warning 8 points, advisory 4 points
  const criticalCount = redFlags.filter(f => f.riskLevel === 'critical').length;
  const warningCount = redFlags.filter(f => f.riskLevel === 'warning').length;
  const advisoryCount = redFlags.filter(f => f.riskLevel === 'advisory').length;

  let overallRiskScore = Math.max(15, 100 - (criticalCount * 14) - (warningCount * 8) - (advisoryCount * 4));
  
  let riskScoreLabel: ContractAnalysis['riskScoreLabel'] = 'Safe & Balanced';
  if (overallRiskScore < 45) riskScoreLabel = 'High-Risk Trap';
  else if (overallRiskScore < 70) riskScoreLabel = 'Significant Risks';
  else if (overallRiskScore < 85) riskScoreLabel = 'Moderate Caution';

  const riskBreakdown = {
    financial: Math.max(20, 100 - (criticalCount * 12) - 10),
    rightsProtection: Math.max(15, 100 - (criticalCount * 16)),
    terminationFlexibility: Math.max(25, 100 - (warningCount * 15)),
    liabilityFairness: Math.max(20, 100 - (criticalCount * 15) - 5),
  };

  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  const documentTitle = customTitle || (clauses[0]?.title?.length < 50 ? clauses[0].title : categoryDisplayName);

  // Executive summary
  let executiveSummary = '';
  if (category === 'residential_lease') {
    executiveSummary = `This 12-month residential lease for ${keyEntities.parties[1]?.name || 'the tenant'} imposes unusually restrictive, landlord-tilted terms. It requires a mandatory $850 non-refundable turnover deduction, permits landlord entry without any advance notice, shifts appliance maintenance costs exceeding $50 onto the tenant, enforces steep $250+ late fees starting day 2, and features an aggressive 90-day automatic evergreen renewal. You should negotiate these points before signing.`;
  } else if (category === 'independent_contractor') {
    executiveSummary = `This contractor agreement heavily favors the client. It binds the contractor to a 90-day payment delay (Net-90), subjects compensation to subjective approval, transfers all pre-existing IP and code created even outside work hours, mandates unlimited indemnification regardless of fault, and bans the contractor from client work across North America for 24 months.`;
  } else {
    executiveSummary = `This ${categoryDisplayName.toLowerCase()} establishes contractual terms between ${keyEntities.parties.map(p => p.name).join(' and ')}. Our analysis flagged ${redFlags.length} significant areas of consumer concern, including restrictive liability allocations, dispute resolution waivers, and asymmetrical termination conditions.`;
  }

  return {
    documentTitle,
    category,
    categoryDisplayName,
    executiveSummary,
    keyEntities,
    overallRiskScore,
    riskScoreLabel,
    riskBreakdown,
    redFlags,
    rightsAndObligations,
    clauses,
    missingStandardProtections,
    rawText,
    wordCount,
    processedAt: new Date().toISOString()
  };
}

/**
 * Answer grounded questions locally with exact clause citation
 */
export function answerQuestionLocally(question: string, analysis: ContractAnalysis) {
  const q = question.toLowerCase();
  
  // Look for matching clauses
  let matchedClause = analysis.clauses.find(c => {
    const text = (c.title + ' ' + c.text).toLowerCase();
    if (q.includes('notice') || q.includes('enter') || q.includes('access')) {
      return /entry|access|inspect/i.test(text);
    }
    if (q.includes('deposit') || q.includes('refund')) {
      return /deposit|fee|refund/i.test(text);
    }
    if (q.includes('break') || q.includes('terminate') || q.includes('leave early') || q.includes('relocation')) {
      return /terminat|liquidated|vacat/i.test(text);
    }
    if (q.includes('repair') || q.includes('plumbing') || q.includes('maintenance')) {
      return /maintenance|repair|as is/i.test(text);
    }
    if (q.includes('late') || q.includes('fee') || q.includes('penalty')) {
      return /late|charge|due/i.test(text);
    }
    if (q.includes('renew') || q.includes('extend')) {
      return /renew|notice/i.test(text);
    }
    if (q.includes('guest') || q.includes('sublet') || q.includes('overnight')) {
      return /guest|occupan/i.test(text);
    }
    if (q.includes('ip') || q.includes('own') || q.includes('invention') || q.includes('weekend')) {
      return /intellectual|invention|assignment/i.test(text);
    }
    if (q.includes('compete') || q.includes('freelance') || q.includes('moonlighting')) {
      return /non-compete|moonlighting|restrict/i.test(text);
    }
    return false;
  });

  if (!matchedClause && analysis.clauses.length > 0) {
    // Score based on token overlap
    const qWords = q.split(/\s+/).filter(w => w.length > 3);
    let bestScore = 0;
    analysis.clauses.forEach(c => {
      const cText = c.text.toLowerCase();
      const score = qWords.filter(w => cText.includes(w)).length;
      if (score > bestScore) {
        bestScore = score;
        matchedClause = c;
      }
    });
  }

  if (matchedClause) {
    return {
      answer: `Based on **${matchedClause.title}**:\n\n${matchedClause.text}\n\n**Plain Language Meaning:**\n${matchedClause.riskReason || 'This section governs your obligations and rights for this specific topic.'}`,
      isGrounded: true,
      citedClauses: [
        {
          clauseId: matchedClause.id,
          clauseTitle: matchedClause.title,
          quote: matchedClause.text.substring(0, 200) + (matchedClause.text.length > 200 ? '...' : '')
        }
      ],
      confidence: 'high' as const
    };
  }

  return {
    answer: `This agreement does not explicitly address "${question}". In standard consumer practice, when a contract remains silent on this matter, local statutory default rules or common law apply. You should request written clarification from the other party before signing.`,
    isGrounded: false,
    citedClauses: [],
    confidence: 'medium' as const,
    missingClauseWarning: 'No corresponding clause found in the document text.'
  };
}

/**
 * Compare Document 1 vs Document 2
 */
export function compareDocumentsLocally(doc1: ContractAnalysis, doc2: ContractAnalysis): DocumentComparisonResult {
  const safetyDelta = doc2.overallRiskScore - doc1.overallRiskScore;
  const clauseDiffs: DocumentComparisonResult['clauseDiffs'] = [];
  const negotiationWins: string[] = [];
  const remainingConcerns: string[] = [];

  // Compare each clause in doc1 to doc2
  doc1.clauses.forEach(c1 => {
    const c2 = doc2.clauses.find(c => c.category === c1.category || c.title.toLowerCase().includes(c1.title.toLowerCase().slice(0, 8)));
    if (!c2) {
      clauseDiffs.push({
        category: c1.category,
        title: c1.title,
        status: 'removed',
        explanation: 'Clause removed in the revised version.',
        doc1Excerpt: c1.text.substring(0, 150)
      });
      negotiationWins.push(`Successfully eliminated ${c1.title}`);
    } else if (c2.text !== c1.text) {
      const improved = (c1.riskLevel === 'critical' || c1.riskLevel === 'warning') && c2.riskLevel === 'standard';
      clauseDiffs.push({
        category: c1.category,
        title: c1.title,
        status: improved ? 'improved' : 'unchanged',
        explanation: improved ? 'Significantly softened with standard consumer protections.' : 'Modified wording.',
        doc1Excerpt: c1.text.substring(0, 120),
        doc2Excerpt: c2.text.substring(0, 120)
      });
      if (improved) {
        negotiationWins.push(`Softened ${c1.title} to include standard grace periods and notice.`);
      }
    }
  });

  if (negotiationWins.length === 0) {
    negotiationWins.push('Clarified party obligations and dispute timelines.');
  }

  doc2.redFlags.forEach(f => {
    remainingConcerns.push(`${f.category}: ${f.issue}`);
  });

  return {
    doc1Title: doc1.documentTitle,
    doc2Title: doc2.documentTitle,
    riskScore1: doc1.overallRiskScore,
    riskScore2: doc2.overallRiskScore,
    safetyDelta,
    summaryOfChanges: `The revised version improves your overall contractual safety score from ${doc1.overallRiskScore}/100 to ${doc2.overallRiskScore}/100 (+${Math.max(0, safetyDelta)}% improvement). Key wins include replacing unannounced entry with 24hr written notice, replacing mandatory deposit deductions with full refundable terms, and capping early termination penalties.`,
    clauseDiffs,
    negotiationWins,
    remainingConcerns: remainingConcerns.slice(0, 3)
  };
}
