import { describe, it, expect } from 'vitest';
import { chatPayloadSchema } from '../validators/schemas.js';

describe('GroundedChat Component Q&A Specs (.spec.jsx)', () => {
  it('validates user chat query payload', () => {
    const valid = chatPayloadSchema.safeParse({
      query: 'What happens to the security deposit if I leave early?',
      sessionId: 'test-session-99'
    });
    expect(valid.success).toBe(true);
  });
});
