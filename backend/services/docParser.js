import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts raw text from an uploaded buffer based on file extension / mime type
 */
export async function parseDocument(fileBuffer, mimeType, filename) {
  let text = '';
  
  if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
    const data = await pdfParse(fileBuffer);
    text = data.text;
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    text = result.value;
  } else {
    // Plain text or fallback
    text = fileBuffer.toString('utf-8');
  }

  return cleanAndChunkText(text);
}

/**
 * Cleans raw text and splits into logical clause objects
 */
export function cleanAndChunkText(rawText) {
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Regex to detect clause patterns like "1.", "1.1", "Clause 4", "SECTION 2", "1. PREMISES"
  const lines = cleaned.split('\n');
  const chunks = [];
  let currentChunk = { id: '0', title: 'Preamble / Introduction', text: '' };
  let count = 0;

  const sectionRegex = /^(\d+[\.\d]*|clause\s+\d+|section\s+\d+|[A-Z\s]{4,}:)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (sectionRegex.test(trimmed) && trimmed.length < 100) {
      if (currentChunk.text.trim()) {
        chunks.push(currentChunk);
      }
      count++;
      currentChunk = {
        id: `clause-${count}`,
        title: trimmed,
        text: trimmed + '\n'
      };
    } else {
      currentChunk.text += trimmed + ' ';
    }
  }

  if (currentChunk.text.trim()) {
    chunks.push(currentChunk);
  }

  // Fallback if no explicit numbered sections were found
  if (chunks.length <= 1 && cleaned.length > 300) {
    const paragraphs = cleaned.split('\n\n');
    return paragraphs.map((p, idx) => ({
      id: `paragraph-${idx + 1}`,
      title: `Paragraph ${idx + 1}`,
      text: p.trim()
    }));
  }

  return chunks;
}
