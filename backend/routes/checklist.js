import express from 'express';
import { generateLLMResponse } from '../services/llmClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { documentText, documentType } = req.body;

    const prompt = `Generate an action checklist for document type "${documentType || 'Legal Agreement'}":\n\n${(documentText || '').slice(0, 3000)}`;

    const checklist = await generateLLMResponse({
      prompt,
      expectedJson: true
    });

    res.json({ checklist });
  } catch (error) {
    console.error('[Checklist Error]', error.message);
    res.status(500).json({ error: 'Checklist generation failed. Please try again.' });
  }
});

export default router;
