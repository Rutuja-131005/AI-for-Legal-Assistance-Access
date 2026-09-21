import { describe, it, expect } from 'vitest';
import { analyzePayloadSchema } from '../validators/schemas.js';

describe('SummaryView Component Payload Specs (.spec.jsx)', () => {
  it('validates summary analysis payload', () => {
    const valid = analyzePayloadSchema.safeParse({
      documentText: 'Tenant agrees to pay monthly rent of INR 35,000 on or before the 5th of each month.',
      documentName: 'Rental_Agreement.pdf',
      persona: 'Riya'
    });
    expect(valid.success).toBe(true);
  });
});
