import { z } from 'zod';

export const documentUploadSchema = z.object({
  filename: z.string().min(1).max(255).optional(),
  fileType: z.enum(['pdf', 'docx', 'txt']).optional(),
  text: z.string().min(10, 'Document text must be at least 10 characters long').max(500000, 'Document exceeds maximum size limit'),
});

export const analyzePayloadSchema = z.object({
  documentText: z.string().min(10, 'Document text must be at least 10 characters long').max(500000, 'Document exceeds size limit'),
  documentName: z.string().max(255).optional(),
  persona: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),
});

export const chatPayloadSchema = z.object({
  query: z.string().min(1, 'Query cannot be empty').max(2000, 'Query exceeds maximum length'),
  sessionId: z.string().max(100).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(4000)
  })).optional(),
});

export const comparePayloadSchema = z.object({
  docA: z.string().min(10, 'Document A text must be at least 10 characters').max(200000),
  docB: z.string().min(10, 'Document B text must be at least 10 characters').max(200000),
  nameA: z.string().max(255).optional(),
  nameB: z.string().max(255).optional(),
});

export const checklistPayloadSchema = z.object({
  documentText: z.string().min(10, 'Document text must be at least 10 characters').max(500000),
  persona: z.string().max(100).optional(),
});
