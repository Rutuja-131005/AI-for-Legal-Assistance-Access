import express from 'express';
import { generateLLMResponse } from '../services/llmClient.js';
import { ragStore } from '../services/ragEngine.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const apiKey = req.headers['x-gemini-key'] || req.body?.apiKey;
    const { sessionId, document_id, question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question parameter is required.' });
    }

    const docSession = ragStore.getDocument(sessionId);
    const activeDocId = document_id || (docSession ? docSession.document_id : null);

    const relevantChunks = ragStore.search(sessionId, question, { topK: 4, document_id: activeDocId });
    const chunkContext = relevantChunks.map(c => `[${c.clause_title || c.title}]: ${c.text}`).join('\n\n');

    const prompt = `DOCUMENT ID: ${activeDocId || 'ACTIVE'}\nDOCUMENT CHUNKS:\n${chunkContext}\n\nUSER QUESTION:\n${question}`;
    const systemInstruction = 'You are ClariLex RAG Engine. Answer grounded ONLY in the currently active document chunks provided. Never assume or cite information from other documents. If information is missing, state it is not in the document.';

    const answer = await generateLLMResponse({
      prompt,
      apiKey,
      systemInstruction,
      expectedJson: false,
      sessionId,
      document_id: activeDocId
    });

    res.json({
      question,
      answer,
      document_id: activeDocId,
      citations: relevantChunks.map(c => ({
        id: c.chunk_id || c.id,
        clause_number: c.clause_number,
        title: c.clause_title || c.title
      }))
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Failed to process question: ' + error.message });
  }
});

export default router;
