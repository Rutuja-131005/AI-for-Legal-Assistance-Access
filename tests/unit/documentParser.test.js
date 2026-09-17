import { describe, it, expect } from 'vitest';
import { parseDocumentBuffer } from '../../server/documentParser.js';

describe('documentParser (File Type & Error Resilience)', () => {
  it('parses plain text buffer correctly', async () => {
    const textContent = 'RESIDENTIAL LEASE AGREEMENT\n1. PREMISES AND TERM\nSample text content.';
    const buffer = Buffer.from(textContent, 'utf-8');

    const result = await parseDocumentBuffer(buffer, 'lease.txt', 'text/plain');

    expect(result.detectedType).toBe('txt');
    expect(result.text).toContain('RESIDENTIAL LEASE AGREEMENT');
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.filename).toBe('lease.txt');
  });

  it('handles corrupted PDF buffer gracefully with string fallback', async () => {
    const corruptBuffer = Buffer.from('Corrupted PDF raw content with some text inside.', 'utf-8');

    const result = await parseDocumentBuffer(corruptBuffer, 'corrupt.pdf', 'application/pdf');

    expect(result.detectedType).toBe('pdf');
    expect(result.text).toBeDefined();
  });

  it('throws descriptive error on corrupted DOCX buffer', async () => {
    const corruptBuffer = Buffer.from('NOT_A_ZIP_OR_DOCX_FILE', 'utf-8');

    await expect(
      parseDocumentBuffer(corruptBuffer, 'corrupt.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ).rejects.toThrow(/Failed to parse DOCX file/i);
  });
});
