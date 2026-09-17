import { describe, it, expect, vi } from 'vitest';
import { enhanceAnalysisWithAI, answerQuestionWithAI } from '../../server/services/aiAnalyzer.js';
import { analyzeDocumentText } from '../../server/services/analysisService.js';

describe('Heuristic Fallback Engine (Offline Mode)', () => {
  it('returns structured base analysis uninterrupted when GEMINI_API_KEY is unset or empty', async () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const sampleText = `RESIDENTIAL LEASE AGREEMENT
1. LANDLORD ACCESS
Landlord may enter premises at any time day or night without prior notice.`;

    const baseAnalysis = analyzeDocumentText(sampleText, 'Heuristic Fallback Contract');
    const result = await enhanceAnalysisWithAI(baseAnalysis);

    expect(result).toBeDefined();
    expect(result.documentTitle).toBe('Heuristic Fallback Contract');
    expect(result.redFlags.length).toBeGreaterThan(0);
    expect(result.redFlags[0].category).toContain('Entry Without Notice');

    process.env.GEMINI_API_KEY = origKey;
  });

  it('answerQuestionWithAI returns null when API key is missing (allowing local grounded RAG fallback)', async () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const answerResult = await answerQuestionWithAI('Can landlord enter?', 'Sample text');
    expect(answerResult).toBeNull();

    process.env.GEMINI_API_KEY = origKey;
  });
});
