import { describe, it, expect } from 'vitest';
import { documentUploadSchema } from '../validators/schemas.js';

describe('UploadZone Component Schema Specs (.spec.jsx)', () => {
  it('validates document text schema correctly', () => {
    const valid = documentUploadSchema.safeParse({
      text: 'Sample contract text for rental agreement validation test.',
      filename: 'rental.docx'
    });
    expect(valid.success).toBe(true);
  });

  it('rejects oversized filenames or empty text', () => {
    const result = documentUploadSchema.safeParse({ text: '' });
    expect(result.success).toBe(false);
  });
});
