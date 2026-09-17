import { Clause, RedFlag } from '../../src/types';

/**
 * Evaluates segmented clauses against rule-based legal screening patterns to detect predatory terms,
 * unilateral waivers, unreasonable fee traps, and exit restrictions.
 * 
 * @param clauses Array of segmented contract clauses
 * @param rawText Full un-segmented text for global pattern checks
 * @returns Array of identified RedFlag objects containing verbatim quotes, issues, and counter-proposals
 */
export function identifyRedFlags(clauses: Clause[], rawText: string): RedFlag[] {
  const redFlags: RedFlag[] = [];

  // 1. Entry without notice
  const entryClause = clauses.find(c => /entry|access|inspect/i.test(c.title + ' ' + c.text));
  if (entryClause && /without\s+(?:prior\s+)?(?:written\s+|oral\s+)?notice|any\s+time[,\s]+day\s+or\s+night/i.test(entryClause.text)) {
    redFlags.push({
      id: 'flag-entry-notice',
      clauseId: entryClause.id,
      clauseTitle: entryClause.title,
      verbatimQuote: extractQuote(entryClause.text, /without\s+(?:prior\s+)?(?:written\s+|oral\s+)?notice|any\s+time[,\s]+day\s+or\s+night/i),
      riskLevel: 'critical',
      category: 'Unreasonable Entry Without Notice',
      issue: 'Allows entry into the premises at any time without advance warning or consent.',
      practicalImpact: 'Severe invasion of privacy. Most jurisdictions require a mandatory 24-hour advance written notice except in immediate emergencies.',
      counterProposal: 'Replace with: "Except in active structural emergencies, advance written notice of at least twenty-four (24) hours shall be required, and entry shall only occur during reasonable daytime hours (9:00 AM to 6:00 PM)."'
    });
  }

  // 2. Non-refundable deposits or mandatory turnover fees
  const depositClause = clauses.find(c => /deposit|fee|refurbishment/i.test(c.title + ' ' + c.text));
  if (depositClause && /non-refundable\s+(?:refurbishment|administrative|cleaning|turnover)/i.test(depositClause.text)) {
    redFlags.push({
      id: 'flag-deposit-deduction',
      clauseId: depositClause.id,
      clauseTitle: depositClause.title,
      verbatimQuote: extractQuote(depositClause.text, /non-refundable\s+(?:refurbishment|administrative|cleaning|turnover)[^.]*\./i),
      riskLevel: 'critical',
      category: 'Automatic Deposit Forfeiture',
      issue: 'Guarantees a significant portion of the deposit is retained regardless of property condition at move-out.',
      practicalImpact: 'Financial loss. In many jurisdictions, automatic blanket deductions for standard turnover violate residential tenancy laws.',
      counterProposal: 'Request deletion of the mandatory turnover fee: "Security deposit shall be 100% refundable, less only documented repair costs for physical damage beyond ordinary wear and tear."'
    });
  }

  // 3. Predatory Late Fees
  const lateFeeMatch = rawText.match(/late\s+(?:penalty\s+|fee\s+)?(?:of\s+)?\$(\d+)(?:\.00)?(?:\s+plus\s+an\s+additional[^.]*\$(\d+)[^.]*day)?/i);
  if (lateFeeMatch) {
    const feeClause = clauses.find(c => /late\s+(?:penalty|fee|charge)/i.test(c.text)) || clauses[0];
    const baseAmount = lateFeeMatch[1];
    const dailyAmount = lateFeeMatch[2];
    redFlags.push({
      id: 'flag-late-fee',
      clauseId: feeClause?.id || 'clause-1',
      clauseTitle: feeClause?.title || 'Payment Terms',
      verbatimQuote: lateFeeMatch[0],
      riskLevel: 'warning',
      category: 'Excessive Late Fee & Penalty',
      issue: `Imposes a $${baseAmount} penalty${dailyAmount ? ` plus $${dailyAmount}/day recurring fines` : ''}, which can compound into significant amounts within days.`,
      practicalImpact: 'Disproportionate financial punishment. Most courts consider daily compounding fees an unenforceable punitive penalty.',
      counterProposal: 'Propose: "A five (5) day grace period shall apply. If payment remains overdue after the grace period, a reasonable one-time administrative late fee may be assessed."'
    });
  }

  // 4. Maintenance / AS-IS Trap
  const maintClause = clauses.find(c => /maintenance|repair|as is/i.test(c.title + ' ' + c.text));
  if (maintClause && /sole\s+financial\s+responsibility|exceeding\s+\$\d+|as\s+is\b/i.test(maintClause.text)) {
    redFlags.push({
      id: 'flag-maintenance-trap',
      clauseId: maintClause.id,
      clauseTitle: maintClause.title,
      verbatimQuote: extractQuote(maintClause.text, /sole\s+financial\s+responsibility[^.]*\./i) || extractQuote(maintClause.text, /as\s+is[^.]*\./i),
      riskLevel: 'critical',
      category: 'Habitability & Repair Shift',
      issue: 'Shifts structural and appliance breakdown costs onto the consumer even for ordinary wear and tear.',
      practicalImpact: 'Could result in paying thousands of dollars to fix pre-existing equipment failures through no fault of your own.',
      counterProposal: 'Propose: "The property owner warrants the premises comply with all habitability standards and shall maintain all heating, plumbing, electrical systems, and major appliances in sound working order at their sole expense."'
    });
  }

  // 5. Automatic Renewal with Narrow Window
  const renewalClause = clauses.find(c => /automatic(?:ally)?\s+renew|renewal/i.test(c.title + ' ' + c.text));
  if (renewalClause && /90\s+days|certified\s+registered\s+mail|15%\s+rent\s+increase/i.test(renewalClause.text)) {
    redFlags.push({
      id: 'flag-evergreen-trap',
      clauseId: renewalClause.id,
      clauseTitle: renewalClause.title,
      verbatimQuote: extractQuote(renewalClause.text, /automatically\s+renew[^.]*\./i),
      riskLevel: 'warning',
      category: 'Restrictive Evergreen Renewal',
      issue: 'Automatically locks into another full term with a price increase if a strict certified mail notice deadline is missed.',
      practicalImpact: 'Potentially significant unexpected financial liability if notification timing is slightly off.',
      counterProposal: 'Propose: "Upon expiration, the agreement shall convert to a month-to-month arrangement terminable by either party upon thirty (30) days standard written notice."'
    });
  }

  // 6. Early Termination & Liquidated Damages
  const termClause = clauses.find(c => /early\s+termination|liquidated\s+damages/i.test(c.title + ' ' + c.text));
  if (termClause && /all\s+remaining\s+rent.*\$[\d,]+|liquidated\s+damages/i.test(termClause.text)) {
    redFlags.push({
      id: 'flag-early-termination',
      clauseId: termClause.id,
      clauseTitle: termClause.title,
      verbatimQuote: extractQuote(termClause.text, /liable\s+for\s+all\s+remaining\s+rent[^.]*\./i) || extractQuote(termClause.text, /liquidated\s+damages[^.]*\./i),
      riskLevel: 'critical',
      category: 'Double-Recovery Early Termination Penalty',
      issue: 'Demands payment of all remaining amounts plus an additional buyout fee even for legitimate reasons such as military deployment or health issues.',
      practicalImpact: 'The other party has a common-law duty to mitigate damages (e.g., re-rent the unit). Charging all future payments plus a buyout fee is considered illegal double-recovery in many jurisdictions.',
      counterProposal: 'Propose: "Either party may terminate early upon sixty (60) days advance notice and payment of an early release fee capped at one to two months\' equivalent, upon which the terminating party is discharged from all further liability."'
    });
  }

  // 7. Broad IP Assignment
  const ipClause = clauses.find(c => /intellectual\s+property|inventions?|all\s+worldwide\s+right/i.test(c.title + ' ' + c.text));
  if (ipClause && /outside\s+working\s+hours|pre-existing|never\s+to\s+showcase|portfolio/i.test(ipClause.text)) {
    redFlags.push({
      id: 'flag-ip-grab',
      clauseId: ipClause.id,
      clauseTitle: ipClause.title,
      verbatimQuote: extractQuote(ipClause.text, /all\s+worldwide\s+right[^.]*\./i),
      riskLevel: 'critical',
      category: 'Overreaching Intellectual Property Transfer',
      issue: 'Assigns pre-existing work, outside-hours creations, and bans showcasing work in a personal portfolio.',
      practicalImpact: 'Could result in losing legal rights to your own pre-existing tools, templates, and side projects.',
      counterProposal: 'Propose: "IP assignment applies solely to deliverables created specifically during billable hours. The creator retains full ownership of pre-existing tools and the right to display non-confidential deliverables in personal portfolios."'
    });
  }

  // 8. Net-90 Delayed Payment
  const payClause = clauses.find(c => /net-90|ninety\s+\(90\)\s+days|subjective\s+approval/i.test(c.title + ' ' + c.text));
  if (payClause) {
    redFlags.push({
      id: 'flag-net-90',
      clauseId: payClause.id,
      clauseTitle: payClause.title,
      verbatimQuote: extractQuote(payClause.text, /within\s+ninety\s+\(90\)\s+days[^.]*\./i),
      riskLevel: 'critical',
      category: 'Unreasonable 90-Day Payment Delay',
      issue: 'Forces a 3-month wait after submitting work to be paid, subject to subjective approval.',
      practicalImpact: 'Severe cash flow risk. The paying party effectively receives interest-free financing for 90 days.',
      counterProposal: 'Propose: "Payment terms shall be Net-15 (or Net-30 maximum). Invoices overdue by more than 15 days shall accrue interest at 1.5% per month."'
    });
  }

  // 9. Unlimited Indemnification
  const indemClause = clauses.find(c => /indemnif|hold\s+harmless|unlimited\s+liability/i.test(c.title + ' ' + c.text));
  if (indemClause && /unlimited\s+in\s+amount|regardless\s+of\s+fault/i.test(indemClause.text)) {
    redFlags.push({
      id: 'flag-unlimited-indemnity',
      clauseId: indemClause.id,
      clauseTitle: indemClause.title,
      verbatimQuote: extractQuote(indemClause.text, /unlimited\s+in\s+amount[^.]*\./i),
      riskLevel: 'critical',
      category: 'Unbounded Indemnification Exposure',
      issue: 'Requires paying all losses and attorney fees "regardless of fault", with no dollar cap.',
      practicalImpact: 'A single lawsuit could cause personal financial ruin even without any wrongdoing.',
      counterProposal: 'Propose: "Total liability shall be limited to direct damages and strictly capped at the total fees actually paid in the preceding 6 months."'
    });
  }

  // 10. Moonlighting Ban
  const moonlightingClause = clauses.find(c => /moonlighting|outside\s+employment|personal\s+commercial/i.test(c.title + ' ' + c.text));
  if (moonlightingClause && /100%\s+of\s+their\s+business\s+time|personal\s+laptop|weekends/i.test(moonlightingClause.text)) {
    redFlags.push({
      id: 'flag-moonlighting-ban',
      clauseId: moonlightingClause.id,
      clauseTitle: moonlightingClause.title,
      verbatimQuote: extractQuote(moonlightingClause.text, /shall\s+not\s+engage\s+in\s+any\s+outside[^.]*\./i),
      riskLevel: 'warning',
      category: 'Extensive Moonlighting & Side-Project Ban',
      issue: 'Prohibits any unpaid open source contributions, weekend hobbies, or side development, and may claim ownership of personal-time projects.',
      practicalImpact: 'Restricts career autonomy and personal creative freedom on your own time.',
      counterProposal: 'Request carve-out: "Non-competitive personal projects, open source contributions, and side endeavors conducted solely during non-working hours without using company resources are permitted."'
    });
  }

  // 11. Binding Arbitration & Class Action Waiver
  const arbClause = clauses.find(c => /arbitrat|class\s+action\s+waiver/i.test(c.title + ' ' + c.text));
  if (arbClause && /selected\s+exclusively\s+by\s+landlord|fee-shifting|reimburse\s+all\s+of\s+landlord|selected\s+exclusively\s+by/i.test(arbClause.text)) {
    redFlags.push({
      id: 'flag-arbitration-bias',
      clauseId: arbClause.id,
      clauseTitle: arbClause.title,
      verbatimQuote: extractQuote(arbClause.text, /arbitrator\s+selected\s+exclusively|reimburse\s+all\s+of/i),
      riskLevel: 'critical',
      category: 'One-Sided Arbitration & Unilateral Legal Fees',
      issue: 'The other party picks their own arbitrator, and the consumer must pay legal fees even if prevailing on some claims.',
      practicalImpact: 'Denies access to impartial justice and creates immense financial fear against enforcing legal rights.',
      counterProposal: 'Propose: "Arbitration shall be administered by a recognized neutral arbitration body under standard consumer rules, and each party shall bear their own attorney fees."'
    });
  }

  return redFlags;
}

/**
 * Extract a verbatim quote from text matching a regex pattern.
 */
export function extractQuote(text: string, regex: RegExp): string {
  const match = text.match(regex);
  if (match) return match[0].trim();
  return text.substring(0, 140).trim() + '...';
}
