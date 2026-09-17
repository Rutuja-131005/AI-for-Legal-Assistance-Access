import mammoth from 'mammoth';
import * as pdfParseModule from 'pdf-parse';

// Handle CJS/ESM interop safely for pdf-parse
const pdfParse = pdfParseModule.default || pdfParseModule;

export async function parseDocumentBuffer(buffer, filename, mimeType) {
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
        filename,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('PDF parse error, falling back to raw string extraction:', message);
      const textFallback = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      return {
        text: textFallback.trim(),
        wordCount: textFallback.split(/\s+/).filter(Boolean).length,
        detectedType: 'pdf',
        filename,
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
        filename,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('DOCX parse error:', message);
      throw new Error(`Failed to parse DOCX file: ${message}`, { cause: err });
    }
  }

  // 3. Plain Text / Markdown / Other
  const text = buffer.toString('utf-8').replace(/\r\n/g, '\n').trim();
  return {
    text,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    detectedType: 'txt',
    filename,
  };
}
