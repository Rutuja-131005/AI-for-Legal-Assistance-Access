import { describe, it, expect } from 'vitest';
import express from 'express';
import supertest from 'supertest';

import { setupSecurityMiddleware } from '../../server/middleware/security.js';
import {
  validateRequestBody,
  analyzeContractSchema,
} from '../../server/middleware/validator.js';
import { errorHandler } from '../../server/middleware/errorHandler.js';
import { analyzeDocumentText } from '../../server/services/analysisService.js';

const app = express();
setupSecurityMiddleware(app);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/analyze-contract', validateRequestBody(analyzeContractSchema), (req, res) => {
  const { text, filename } = req.body;
  const analysis = analyzeDocumentText(text, filename);
  res.json({ success: true, analysis });
});

app.use(errorHandler);

const request = supertest(app);

describe('API Endpoints (Integration)', () => {
  it('GET /api/health returns status ok', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('POST /api/analyze-contract analyzes document text successfully', async () => {
    const contractText = `RESIDENTIAL LEASE AGREEMENT
1. LANDLORD ACCESS
Landlord may enter premises at any time day or night without prior notice.`;

    const res = await request.post('/api/analyze-contract').send({ text: contractText });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.analysis).toBeDefined();
    expect(res.body.analysis.category).toBe('residential_lease');
    expect(res.body.analysis.redFlags.length).toBeGreaterThan(0);
  });

  it('POST /api/analyze-contract returns 400 for empty payload', async () => {
    const res = await request.post('/api/analyze-contract').send({ text: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
