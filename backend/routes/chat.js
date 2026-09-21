import express from 'express';
import { generateLLMResponse } from '../services/llmClient.js';
import { ragStore } from '../services/ragEngine.js';
import { chatInputSchema } from '../validators/schemas.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { sessionId, document_id, question } = req.body;
    const validation = chatInputSchema.safeParse({ query: question || '', sessionId });
    if (!validation.success) {
      return res.status(400).json({ error: 'Question parameter is required and must be valid text.' });
    }
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
    console.error('[Chat Error]', error.message);
    res.status(500).json({ error: 'Failed to process your question. Please try again.' });
  }
});

export default router;
