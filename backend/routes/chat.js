import express from 'express';
import { generateLLMResponse } from '../services/llmClient.js';
import { ragStore } from '../services/ragEngine.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { sessionId, question, apiKey } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question parameter is required.' });
    }

    const relevantChunks = ragStore.search(sessionId, question, 4);
    const chunkContext = relevantChunks.map(c => `[${c.title}]: ${c.text}`).join('\n\n');

    const prompt = `DOCUMENT CHUNKS:\n${chunkContext}\n\nUSER QUESTION:\n${question}`;
    const systemInstruction = 'You are ClariLex RAG Engine. Answer grounded ONLY in the chunks provided. Cite source clauses.';

    const answer = await generateLLMResponse({
      prompt,
      apiKey,
      systemInstruction,
      expectedJson: false
    });

    res.json({
      question,
      answer,
      citations: relevantChunks.map(c => ({ id: c.id, title: c.title }))
    });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({ error: 'Failed to process question: ' + error.message });
  }
});

export default router;
