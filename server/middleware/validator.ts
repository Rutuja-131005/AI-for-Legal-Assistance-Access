import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Maximum length constraints
export const MAX_TEXT_LENGTH = 500_000; // ~500KB text (~100k words)
export const MAX_QUESTION_LENGTH = 2_000;
export const MAX_BASE64_LENGTH = 14_000_000; // ~10MB file payload

// Schema for /api/parse-document
export const parseDocumentSchema = z.object({
  base64: z.string().max(MAX_BASE64_LENGTH, 'File payload exceeds maximum limit of 10MB.').optional(),
  filename: z.string().max(255, 'Filename is too long.').optional(),
  mimeType: z.string().max(100, 'MIME type is too long.').optional(),
  text: z.string().max(MAX_TEXT_LENGTH, 'Document text exceeds maximum length limit of 500,000 characters.').optional(),
}).refine(data => Boolean(data.text?.trim()) || Boolean(data.base64 && data.filename), {
  message: 'Either non-empty document text or base64 file data with filename must be provided.',
});

// Schema for /api/analyze-contract
export const analyzeContractSchema = z.object({
  text: z.string().min(1, 'Contract text cannot be empty.').max(MAX_TEXT_LENGTH, 'Contract text exceeds maximum limit (500,000 chars).'),
  filename: z.string().max(255, 'Filename is too long.').optional(),
});

// Schema for /api/ask-question
export const askQuestionSchema = z.object({
  question: z.string().min(1, 'Question cannot be empty.').max(MAX_QUESTION_LENGTH, 'Question text is too long (max 2,000 chars).'),
  contractText: z.string().max(MAX_TEXT_LENGTH, 'Contract text is too long.').optional(),
  rawText: z.string().max(MAX_TEXT_LENGTH, 'Contract text is too long.').optional(),
  analysis: z.record(z.string(), z.unknown()).optional(),
});

// Schema for /api/compare-contracts
export const compareContractsSchema = z.object({
  doc1Text: z.string().min(1, 'First document text is required.').max(MAX_TEXT_LENGTH, 'Document 1 text is too long.'),
  doc2Text: z.string().min(1, 'Second document text is required.').max(MAX_TEXT_LENGTH, 'Document 2 text is too long.'),
  doc1Title: z.string().max(255, 'Document 1 title is too long.').optional(),
  doc2Title: z.string().max(255, 'Document 2 title is too long.').optional(),
});

// Schema for /api/draft-negotiation
export const draftNegotiationSchema = z.object({
  analysis: z.record(z.string(), z.unknown()).optional(),
  selectedFlagIds: z.array(z.string().max(100)).max(50).optional(),
  tone: z.enum(['diplomatic', 'firm', 'collaborative', 'formal']).optional(),
  senderName: z.string().max(100, 'Sender name is too long.').optional(),
  recipientName: z.string().max(100, 'Recipient name is too long.').optional(),
  customNotes: z.string().max(2000, 'Custom notes are too long.').optional(),
});

/**
 * Middleware factory for Zod body validation.
 * Returns HTTP 400 Bad Request on validation failure.
 */
export function validateRequestBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      return res.status(400).json({
        error: issue ? `Invalid input (${issue.path.join('.')}): ${issue.message}` : 'Invalid request payload.',
      });
    }
    req.body = result.data;
    next();
  };
}
