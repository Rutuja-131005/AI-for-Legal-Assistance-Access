import { describe, it, expect } from 'vitest';
import { parseDocumentBuffer } from '../../server/documentParser';

describe('documentParser (File Type & Error Resilience)', () => {
  it('parses plain text documents correctly', async () => {
    const text = 'This is a test contract for equipment leasing.';
    const buffer = Buffer.from(text, 'utf-8');

    const result = await parseDocumentBuffer(buffer, 'test-contract.txt', 'text/plain');
    expect(result.detectedType).toBe('txt');
    expect(result.text).toBe(text);
    expect(result.wordCount).toBe(8);
  });

  it('handles empty document buffers gracefully', async () => {
    const buffer = Buffer.from('', 'utf-8');
    const result = await parseDocumentBuffer(buffer, 'empty.txt', 'text/plain');

    expect(result.detectedType).toBe('txt');
    expect(result.text).toBe('');
    expect(result.wordCount).toBe(0);
  });

  it('handles Unicode plain text documents', async () => {
    const unicodeText = 'LEASE AGREEMENT — 租賃協議 — €1,200 / month';
    const buffer = Buffer.from(unicodeText, 'utf-8');

    const result = await parseDocumentBuffer(buffer, 'unicode.txt', 'text/plain');
    expect(result.text).toBe(unicodeText);
  });

  it('handles corrupted PDF buffer gracefully with string fallback', async () => {
    const corruptedPdfBuffer = Buffer.from('%PDF-1.4 Corrupted header data without valid PDF structure', 'utf-8');
    const result = await parseDocumentBuffer(corruptedPdfBuffer, 'corrupted.pdf', 'application/pdf');

    expect(result.detectedType).toBe('pdf');
    expect(result.text).toBeDefined();
  });

  it('throws descriptive error on corrupted DOCX buffer', async () => {
    const corruptedDocxBuffer = Buffer.from('Not a valid zip docx archive', 'utf-8');

    await expect(
      parseDocumentBuffer(corruptedDocxBuffer, 'invalid.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ).rejects.toThrow('Failed to parse DOCX file');
  });
});
