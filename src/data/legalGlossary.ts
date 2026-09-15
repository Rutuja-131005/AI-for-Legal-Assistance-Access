export interface GlossaryTerm {
  term: string;
  category: 'Financial' | 'Liability' | 'Dispute' | 'General';
  definition: string;
  plainEnglishExample: string;
  watchOutFor: string;
}

export const LEGAL_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Indemnity / Hold Harmless',
    category: 'Liability',
    definition: 'An agreement where one party promises to pay for any legal fees, damages, or financial losses suffered by the other party.',
    plainEnglishExample: 'If a visitor trips in the apartment and sues the landlord, a broad indemnity clause means YOU pay the landlord\'s legal bills.',
    watchOutFor: 'Unilateral clauses requiring you to indemnify the other party for "any and all claims" even when you were not negligent.'
  },
  {
    term: 'Liquidated Damages',
    category: 'Financial',
    definition: 'A predetermined fixed sum of money agreed upon in advance that one party must pay if they breach or break the contract.',
    plainEnglishExample: 'A clause stating: "If you break your 1-year lease, you must pay an immediate $5,000 penalty."',
    watchOutFor: 'Clauses where the specified penalty is excessively higher than any actual financial harm the landlord or company would suffer.'
  },
  {
    term: 'Automatic Renewal (Evergreen Clause)',
    category: 'General',
    definition: 'A provision where a contract automatically extends for another full period unless notice is given in a very specific window.',
    plainEnglishExample: 'Your 1-year lease automatically re-locks you in for another entire year unless you send registered mail exactly 90 days before.',
    watchOutFor: 'Narrow notice windows (e.g. "exactly between day 60 and 65") or renewals at steep unstated rent increases.'
  },
  {
    term: 'Severability',
    category: 'General',
    definition: 'A clause stating that if a court finds one specific sentence or term in the contract to be illegal, the rest of the contract remains valid.',
    plainEnglishExample: 'If a judge rules that the $250 daily late fee is an illegal penalty, the rest of the lease is still enforceable.',
    watchOutFor: 'This is standard and usually harmless, but protects the drafter when they push the envelope with extreme clauses.'
  },
  {
    term: 'Binding Arbitration & Class Action Waiver',
    category: 'Dispute',
    definition: 'Surrendering your constitutional right to take a dispute before a public judge or jury, forcing it into a private arbitrator, and waiving group lawsuits.',
    plainEnglishExample: 'If the company wrongfully bills 100,000 customers $10 each, no one can join a group lawsuit; everyone must pay thousands for an individual private arbitrator.',
    watchOutFor: 'Clauses specifying that the company picks the arbitrator and that you must pay the arbitration filing fees.'
  },
  {
    term: 'Joint and Several Liability',
    category: 'Financial',
    definition: 'In agreements with roommates or co-signers, the landlord can legally collect 100% of unpaid rent or damages from ANY single tenant.',
    plainEnglishExample: 'If your roommate skips town without paying their half of the rent, the landlord can legally demand the entire amount from you.',
    watchOutFor: 'Signing with roommates without a separate written roommate agreement dividing specific shares.'
  },
  {
    term: 'At-Will Employment',
    category: 'General',
    definition: 'An employment arrangement where either the employee or employer can end the job at any time, for any reason (as long as it is not illegal discrimination), without notice.',
    plainEnglishExample: 'You can quit tomorrow with no penalty, but the employer can also lay you off tomorrow with zero severance.',
    watchOutFor: 'When paired with a post-employment non-compete preventing you from finding work for 1-2 years.'
  },
  {
    term: 'Force Majeure ("Act of God")',
    category: 'General',
    definition: 'A clause that frees both parties from liability or contractual obligation when an extraordinary event or circumstance beyond control occurs (wars, pandemics, natural disasters).',
    plainEnglishExample: 'If a hurricane destroys the office building, the contractor is not penalized for missing the project deadline.',
    watchOutFor: 'One-sided clauses where the landlord is excused from providing heat/power during storms, but the tenant still must pay 100% rent.'
  },
  {
    term: 'Subrogation Waiver',
    category: 'Liability',
    definition: 'Preventing your insurance company from suing the other party to recover money they paid out for an accident or damage.',
    plainEnglishExample: 'If the landlord\'s roof leaks and ruins your laptop, your renters insurance pays you, but cannot go after the landlord to recoup the cost.',
    watchOutFor: 'Make sure your own insurance policy permits you to sign contracts with a subrogation waiver before signing.'
  },
  {
    term: 'Invention Assignment',
    category: 'General',
    definition: 'A clause transferring ownership of all creative work, software, designs, or patents you create to the employer or client.',
    plainEnglishExample: 'Writing a mobile game on your personal laptop at home on Saturday, but the company claims they own 100% of it.',
    watchOutFor: 'Clauses that do not explicitly exclude works created entirely on your own time without using company equipment or proprietary data.'
  }
];
