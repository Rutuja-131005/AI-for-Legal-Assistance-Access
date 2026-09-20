import express from 'express';
import { generateLLMResponse } from '../services/llmClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { documentText, documentType, apiKey } = req.body;

    const prompt = `Generate an action checklist for document type "${documentType || 'Legal Agreement'}":\n\n${(documentText || '').slice(0, 3000)}`;

    const checklist = await generateLLMResponse({
      prompt,
      apiKey,
      expectedJson: true
    });

    res.json({ checklist });
  } catch (error) {
    console.error('Checklist Error:', error);
    res.status(500).json({ error: 'Failed to generate checklist: ' + error.message });
  }
});

export default router;
