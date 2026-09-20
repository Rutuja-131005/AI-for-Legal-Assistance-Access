import express from 'express';
import multer from 'multer';
import { parseDocument } from '../services/docParser.js';
import { ragStore } from '../services/ragEngine.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const sessionId = req.body.sessionId || `session-${Date.now()}`;
    let textContent = '';
    let filename = 'Uploaded Document';

    if (req.file) {
      filename = req.file.originalname;
      const chunks = await parseDocument(req.file.buffer, req.file.mimetype, filename);
      const fullText = chunks.map(c => c.text).join('\n');
      ragStore.setDocument(sessionId, chunks, fullText);
      return res.json({
        sessionId,
        filename,
        clauseCount: chunks.length,
        chunks,
        fullText
      });
    } else if (req.body.text) {
      textContent = req.body.text;
      filename = req.body.filename || 'Custom Text Document';
      const chunks = await parseDocument(Buffer.from(textContent), 'text/plain', filename);
      ragStore.setDocument(sessionId, chunks, textContent);
      return res.json({
        sessionId,
        filename,
        clauseCount: chunks.length,
        chunks,
        fullText: textContent
      });
    } else {
      return res.status(400).json({ error: 'No file or text content provided.' });
    }
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process document upload: ' + error.message });
  }
});

export default router;
