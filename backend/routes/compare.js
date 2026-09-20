import express from 'express';
import { generateLLMResponse } from '../services/llmClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { docAText, docBText, docAName, docBName, apiKey } = req.body;

    if (!docAText || !docBText) {
      return res.status(400).json({ error: 'Both Document A and Document B text are required for comparison.' });
    }

    const prompt = `Compare Document A (${docAName || 'Doc A'}) and Document B (${docBName || 'Doc B'}) side-by-side:\n\nDOCUMENT A:\n${docAText.slice(0, 3000)}\n\nDOCUMENT B:\n${docBText.slice(0, 3000)}`;

    const comparison = await generateLLMResponse({
      prompt,
      apiKey,
      expectedJson: true
    });

    res.json({ comparison });
  } catch (error) {
    console.error('Compare Error:', error);
    res.status(500).json({ error: 'Failed to compare documents: ' + error.message });
  }
});

export default router;
