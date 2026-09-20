import express from 'express';
import { generateLLMResponse } from '../services/llmClient.js';
import { analysisCache } from '../services/analysisCache.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { sessionId, apiKey, text, filename } = req.body;
    let documentData = ragStore.getDocument(sessionId);
    let fullText = text || (documentData ? documentData.fullText : '');

    if (!fullText) {
      return res.status(400).json({ error: 'No document text found for session.' });
    }

    // Check Cache
    const cachedResult = analysisCache.get(fullText, { filename });
    if (cachedResult) {
      return res.json({
        sessionId,
        cached: true,
        ...cachedResult
      });
    }

    // Step 1: Detect Document Type
    const classification = await generateLLMResponse({
      prompt: `Classify the following legal document text:\n\n${fullText.slice(0, 2000)}`,
      apiKey,
      expectedJson: true
    });

    // Step 2: Summary & Risk Analysis
    const analysis = await generateLLMResponse({
      prompt: `Simplify and analyze risks for document type "${classification.documentType || 'Legal Agreement'}":\n\n${fullText}`,
      apiKey,
      expectedJson: true
    });

    const result = { classification, summary: analysis };
    analysisCache.set(fullText, { filename }, result);

    res.json({
      sessionId,
      cached: false,
      ...result
    });

  } catch (error) {
    console.error('Analyze Error:', error);
    res.status(500).json({ error: 'Failed to analyze document: ' + error.message });
  }
});

export default router;
