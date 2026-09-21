import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { documentUploadSchema, chatPayloadSchema } from '../validators/schemas.js';

describe('Security Controls & Validator Suite (.spec.js)', () => {
  it('validates document upload payload via Zod schema', () => {
    const valid = documentUploadSchema.safeParse({
      text: 'This is a valid legal document text with over ten characters.',
      filename: 'test.pdf'
    });
    expect(valid.success).toBe(true);

    const invalid = documentUploadSchema.safeParse({ text: 'short' });
    expect(invalid.success).toBe(false);
  });

  it('validates chat payload via Zod schema', () => {
    const valid = chatPayloadSchema.safeParse({
      query: 'What is the lock-in period?',
      sessionId: 'session-123'
    });
    expect(valid.success).toBe(true);

    const empty = chatPayloadSchema.safeParse({ query: '' });
    expect(empty.success).toBe(false);
  });

  it('sanitizes dangerous HTML and XSS injection vectors via DOMPurify', () => {
    const xssPayload = '<img src=x onerror=alert(1)><strong>Clause 1</strong>';
    const sanitized = DOMPurify.sanitize(xssPayload);
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toContain('<strong>Clause 1</strong>');
  });
});
