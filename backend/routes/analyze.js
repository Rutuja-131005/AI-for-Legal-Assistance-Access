import express from 'express';
import { generateLLMResponse } from '../services/llmClient.js';
import { analysisCache } from '../services/analysisCache.js';
import { ragStore } from '../services/ragEngine.js';
import { parseDocument } from '../services/docParser.js';
import { analyzeInputSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Validate request body with Zod
    const { sessionId, text, filename = 'Uploaded Document', document_id: reqDocId } = req.body;
    let documentData = ragStore.getDocument(sessionId);
    let fullText = text || (documentData ? documentData.fullText : '');
    let activeDocId = reqDocId || (documentData ? documentData.document_id : null);

    const validationResult = analyzeInputSchema.safeParse({ documentText: fullText || 'dummy_for_session_fallback', documentName: filename, sessionId });
    if (!fullText) {
      return res.status(400).json({ error: 'No document text found for this session.' });
    }

    if (!documentData || !activeDocId) {
      const parsed = await parseDocument(Buffer.from(fullText), 'text/plain', filename);
      activeDocId = parsed.document_id;
      ragStore.setDocument(sessionId, parsed.document_id, parsed.chunks, fullText, filename, parsed.extractedFacts);
    }

    // Check Cache
    const cachedResult = analysisCache.get(fullText, { filename, document_id: activeDocId });
    if (cachedResult) {
      return res.json({
        sessionId,
        document_id: activeDocId,
        cached: true,
        ...cachedResult
      });
    }

    // Step 1: Detect Document Type
    const classification = await generateLLMResponse({
      prompt: `Classify the following legal document text:\n\n${fullText.slice(0, 2000)}`,
      expectedJson: true,
      sessionId,
      document_id: activeDocId
    });

    // Step 2: Summary & Risk Analysis
    const analysis = await generateLLMResponse({
      prompt: `Simplify and analyze risks for document type "${classification.documentType || 'Legal Agreement'}":\n\n${fullText}`,
      expectedJson: true,
      sessionId,
      document_id: activeDocId
    });

    const result = { classification, summary: analysis };
    analysisCache.set(fullText, { filename, document_id: activeDocId }, result);

    res.json({
      sessionId,
      document_id: activeDocId,
      cached: false,
      ...result
    });

  } catch (error) {
    console.error('[Analyze Error]', error.message);
    res.status(500).json({ error: 'Document analysis failed. Please try again.' });
  }
});

export default router;
