import { z } from 'zod';

export const uploadInputSchema = z.object({
  filename: z.string().optional(),
  fileType: z.string().optional(),
  text: z.string().optional()
});

export const analyzeInputSchema = z.object({
  documentText: z.string({ required_error: 'documentText is required' }).min(1, 'documentText cannot be empty'),
  documentName: z.string().optional(),
  persona: z.string().optional(),
  sessionId: z.string().optional()
});

export const chatInputSchema = z.object({
  query: z.string({ required_error: 'query is required' }).min(1, 'query cannot be empty'),
  sessionId: z.string().optional(),
  history: z.array(z.any()).optional()
});

export const compareInputSchema = z.object({
  docA: z.string({ required_error: 'docA is required' }).min(1, 'docA cannot be empty'),
  docB: z.string({ required_error: 'docB is required' }).min(1, 'docB cannot be empty'),
  nameA: z.string().optional(),
  nameB: z.string().optional()
});

export const checklistInputSchema = z.object({
  documentText: z.string({ required_error: 'documentText is required' }).min(1, 'documentText cannot be empty'),
  persona: z.string().optional()
});
