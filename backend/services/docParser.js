import crypto from 'crypto';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Generates a unique, deterministic document_id based on SHA-256 hash of content & filename
 */
export function generateDocumentId(rawText, filename = 'document') {
  const hash = crypto.createHash('sha256').update(rawText + filename).digest('hex').substring(0, 12);
  return `DOC_${hash}`;
}

/**
 * Extracts raw text from an uploaded buffer based on file extension / mime type
 */
export async function parseDocument(fileBuffer, mimeType, filename = 'document') {
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

  const document_id = generateDocumentId(text, filename);
  const chunks = cleanAndChunkText(text, document_id, filename);
  const extractedFacts = extractLegalFacts(text);

  return {
    document_id,
    document_name: filename,
    fullText: text,
    chunks,
    extractedFacts
  };
}

/**
 * Cleans raw text and performs structure-aware legal chunking with rich metadata
 */
export function cleanAndChunkText(rawText, document_id = 'DOC_DEFAULT', document_name = 'Document') {
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const lines = cleaned.split('\n');
  const chunks = [];
  let currentChunk = {
    document_id,
    document_name,
    chunk_id: `${document_id}_CLAUSE_0`,
    id: '0',
    clause_number: 'Preamble',
    clause_title: 'Preamble / Introduction',
    title: 'Preamble / Introduction',
    paragraph_index: 0,
    content_type: 'PREAMBLE',
    text: ''
  };
  let count = 0;

  // Pattern matching for legal clauses, sections, schedules, annexures
  const sectionRegex = /^((?:clause|section|article|schedule|annexure)\s+\d+[\.\d]*|^\d+[\.\d]*\s+[A-Z\s]{2,}|^[A-Z\s]{4,}:)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (sectionRegex.test(trimmed) && trimmed.length < 120) {
      if (currentChunk.text.trim()) {
        chunks.push(currentChunk);
      }
      count++;
      
      const clauseNumMatch = trimmed.match(/(?:clause|section|article|schedule|annexure)\s*(\d+[\.\d]*)|(^[\d\.]+)/i);
      const clause_number = clauseNumMatch ? (clauseNumMatch[1] || clauseNumMatch[2] || `${count}`) : `${count}`;

      currentChunk = {
        document_id,
        document_name,
        chunk_id: `${document_id}_CLAUSE_${count}`,
        id: `clause-${count}`,
        clause_number: clause_number.replace(/\.$/, ''),
        clause_title: trimmed,
        title: trimmed,
        paragraph_index: count,
        content_type: 'CLAUSE',
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
  if (chunks.length <= 1 && cleaned.length > 200) {
    const paragraphs = cleaned.split('\n\n');
    return paragraphs.map((p, idx) => ({
      document_id,
      document_name,
      chunk_id: `${document_id}_PARA_${idx + 1}`,
      id: `paragraph-${idx + 1}`,
      clause_number: `${idx + 1}`,
      clause_title: `Paragraph ${idx + 1}`,
      title: `Paragraph ${idx + 1}`,
      paragraph_index: idx + 1,
      content_type: 'PARAGRAPH',
      text: p.trim()
    }));
  }

  return chunks;
}

/**
 * Structured Legal Fact Extraction Engine with Negation Awareness
 */
export function extractLegalFacts(rawText) {
  const lower = rawText.toLowerCase();

  // 1. Security Deposit
  let security_deposit = null;
  const depositMatch = rawText.match(/(?:security deposit|deposit amount|interest-free deposit)[^.\n]*?(\bINR|\$|₹|\bRs\.?)\s*([\d,]+)/i) ||
                       rawText.match(/(?:security deposit|deposit amount)[^.\n]*?(\bINR|\$|₹|\bRs\.?)\s*([\d,]+)/i);
  if (depositMatch) {
    security_deposit = `${depositMatch[1]} ${depositMatch[2]}`.trim();
  }

  // 2. Monthly Rent / Salary
  let monthly_rent = null;
  const rentMatch = rawText.match(/(?:monthly rent|rent amount|rent of)[^.\n]*?(\bINR|\$|₹|\bRs\.?)\s*([\d,]+)/i);
  if (rentMatch) {
    monthly_rent = `${rentMatch[1]} ${rentMatch[2]}`.trim();
  }

  // 3. Lock-in Period & Negation Awareness
  let lock_in_period = null;
  if (/no\s+lock-in|without\s+any\s+lock-in|shall\s+not\s+be\s+subject\s+to\s+(?:any\s+)?lock-in|zero\s+lock-in/i.test(rawText)) {
    lock_in_period = 'NONE';
  } else {
    const lockInMatch = rawText.match(/(\d+\s*(?:month|months|year|years))\s*lock-in/i) ||
                        rawText.match(/lock-in\s*period[^.\n]*?(\d+\s*(?:month|months|year|years))/i);
    if (lockInMatch) {
      lock_in_period = lockInMatch[1].trim();
    }
  }

  // 4. Tenant Notice Period
  let tenant_notice_period = null;
  const tenantNoticeMatch = rawText.match(/tenant[^.\n]*?(\d+\s*(?:day|days|month|months))\s*(?:written\s*)?notice/i) ||
                            rawText.match(/(\d+\s*(?:day|days|month|months))\s*(?:written\s*)?notice[^.\n]*?tenant/i) ||
                            rawText.match(/terminate[^.\n]*?(\d+\s*(?:day|days|month|months))\s*(?:written\s*)?notice/i);
  if (tenantNoticeMatch) {
    tenant_notice_period = tenantNoticeMatch[1].trim();
  }

  // 5. Landlord Notice Period
  let landlord_notice_period = null;
  const landlordNoticeMatch = rawText.match(/landlord[^.\n]*?(\d+\s*(?:day|days|month|months))\s*(?:written\s*)?notice/i) ||
                              rawText.match(/lessor[^.\n]*?(\d+\s*(?:day|days|month|months))\s*(?:written\s*)?notice/i);
  if (landlordNoticeMatch) {
    landlord_notice_period = landlordNoticeMatch[1].trim();
  }

  // 6. Painting Deduction & Negation Awareness
  let painting_deduction = null;
  if (/no\s+(?:fixed\s+)?painting\s+(?:fee|deduction|charge)|shall\s+not\s+be\s+charged\s+a\s+(?:fixed\s+)?painting/i.test(rawText)) {
    painting_deduction = 'NONE';
  } else {
    const paintingMatch = rawText.match(/(\d+\s*month(?:'s)?\s*rent|\bINR|\$|₹|\bRs\.?\s*[\d,]+)[^.\n]*?painting/i) ||
                          rawText.match(/painting[^.\n]*?(\d+\s*month(?:'s)?\s*rent|\bINR|\$|₹|\bRs\.?\s*[\d,]+)/i);
    if (paintingMatch) {
      painting_deduction = paintingMatch[1].trim();
    }
  }

  // 7. Rent Escalation & Negation Awareness
  let rent_escalation = null;
  if (/no\s+(?:annual\s+)?escalation|no\s+(?:rent\s+)?increase|shall\s+not\s+be\s+escalated/i.test(rawText)) {
    rent_escalation = 'NONE';
  } else {
    const escalationMatch = rawText.match(/(\d+%\s*(?:annual|yearly)?\s*(?:escalation|increase))/i) ||
                            rawText.match(/escalat(?:e|ion)[^.\n]*?(\d+%\s*(?:annual|yearly)?)/i);
    if (escalationMatch) {
      rent_escalation = escalationMatch[1].trim();
    }
  }

  return {
    monthly_rent,
    security_deposit,
    lock_in_period,
    tenant_notice_period,
    landlord_notice_period,
    rent_escalation,
    painting_deduction
  };
}
