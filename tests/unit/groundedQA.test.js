import { describe, it, expect } from 'vitest';
import { answerQuestionLocally, analyzeDocumentText } from '../../server/services/analysisService.js';

describe('groundedQA Service (Local Grounding Engine)', () => {
  const rawText = `RESIDENTIAL LEASE AGREEMENT
1. PET POLICY
No pets or animals of any kind are permitted on the premises.

2. SECURITY DEPOSIT
Tenant shall deposit $2,000 as security deposit.`;

  const analysis = analyzeDocumentText(rawText);

  it('grounds answer with exact clause citation when query matches clause content', () => {
    const result = answerQuestionLocally('Are pets allowed in the apartment?', analysis);

    expect(result.isGrounded).toBe(true);
    expect(result.citedClauses.length).toBeGreaterThan(0);
    expect(result.citedClauses[0].clauseTitle).toContain('PET POLICY');
    expect(result.confidence).toBe('high');
  });

  it('returns ungrounded warning when question asks about topic absent from contract', () => {
    const result = answerQuestionLocally('What is the parking space number?', analysis);

    expect(result.isGrounded).toBe(false);
    expect(result.missingClauseWarning).toBeDefined();
    expect(result.citedClauses.length).toBe(0);
  });
});
