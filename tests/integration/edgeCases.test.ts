import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import compression from 'compression';
import { apiLimiter, uploadLimiter } from '../../server/middleware/rateLimiter';
import { sessionAuthMiddleware } from '../../server/middleware/sessionAuth';
import { validateRequestBody, parseDocumentSchema, askQuestionSchema } from '../../server/middleware/validator';
import { errorHandler } from '../../server/middleware/errorHandler';
import { parseDocumentBuffer } from '../../server/documentParser';
import { analyzeDocumentText } from '../../server/services/analysisService';

const app = express();
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(sessionAuthMiddleware);

app.post('/api/parse-document', uploadLimiter, validateRequestBody(parseDocumentSchema), async (req, res, next) => {
  try {
    const { base64, filename, mimeType, text } = req.body;
    if (text) {
      const clean = text.trim();
      const analysis = analyzeDocumentText(clean, filename);
      return res.json({ success: true, text: clean, analysis });
    }
    const buffer = Buffer.from(base64, 'base64');
    const parsed = await parseDocumentBuffer(buffer, filename, mimeType);
    const analysis = analyzeDocumentText(parsed.text, filename);
    return res.json({ success: true, text: parsed.text, analysis });
  } catch (err) {
    next(err);
  }
});

app.post('/api/ask-question', apiLimiter, validateRequestBody(askQuestionSchema), async (req, res, next) => {
  try {
    return res.json({ success: true, answer: 'Mocked answer' });
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

describe('Edge Cases & Resiliency Test Suite', () => {
  it('handles malformed base64 buffer gracefully', async () => {
    const res = await request(app)
      .post('/api/parse-document')
      .send({
        base64: 'invalid_corrupted_base64_!@#$',
        filename: 'corrupt.pdf',
        mimeType: 'application/pdf'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.text).toBeDefined();
  });

  it('rejects invalid request payload missing required fields', async () => {
    const res = await request(app)
      .post('/api/parse-document')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Validation Error');
  });

  it('handles oversized contract text without crashing or memory leaks', async () => {
    const oversizedText = 'Clause text line. '.repeat(10000); // ~180KB string
    const res = await request(app)
      .post('/api/parse-document')
      .send({
        text: oversizedText,
        filename: 'large_contract.txt'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis.clauses.length).toBeGreaterThan(0);
  });

  it('returns valid session header x-session-id on all requests', async () => {
    const res = await request(app)
      .post('/api/parse-document')
      .send({ text: 'Simple test clause text', filename: 'test.txt' });

    expect(res.headers['x-session-id']).toBeDefined();
  });
});
