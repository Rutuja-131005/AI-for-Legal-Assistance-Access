import mammoth from 'mammoth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface ParseResult {
  text: string;
  wordCount: number;
  detectedType: 'pdf' | 'docx' | 'txt';
  filename: string;
}

export async function parseDocumentBuffer(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<ParseResult> {
  const lowerName = filename.toLowerCase();

  // 1. PDF
  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(buffer);
      const cleanText = data.text.replace(/\r\n/g, '\n').trim();
      return {
        text: cleanText,
        wordCount: cleanText.split(/\s+/).filter(Boolean).length,
        detectedType: 'pdf',
        filename
      };
    } catch (err: any) {
      console.warn('PDF parse error, falling back to raw string extraction:', err?.message);
      const textFallback = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      return {
        text: textFallback.trim(),
        wordCount: textFallback.split(/\s+/).filter(Boolean).length,
        detectedType: 'pdf',
        filename
      };
    }
  }

  // 2. DOCX
  if (lowerName.endsWith('.docx') || mimeType?.includes('wordprocessingml')) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const cleanText = result.value.replace(/\r\n/g, '\n').trim();
      return {
        text: cleanText,
        wordCount: cleanText.split(/\s+/).filter(Boolean).length,
        detectedType: 'docx',
        filename
      };
    } catch (err: any) {
      console.warn('DOCX parse error:', err?.message);
      throw new Error(`Failed to parse DOCX file: ${err?.message || 'Unknown error'}`);
    }
  }

  // 3. Plain Text / Markdown / Other
  const text = buffer.toString('utf-8').replace(/\r\n/g, '\n').trim();
  return {
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    detectedType: 'txt',
    filename
  };
}
