import express from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { parseDocument } from '../services/docParser.js';
import { ragStore } from '../services/ragEngine.js';
import { validateMagicBytes, sanitizeFilename } from '../middleware/securityMiddleware.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const sessionId = req.body.sessionId || `session-${crypto.randomUUID()}`;
    let filename = 'Uploaded Document';

    if (req.file) {
      // V-006: Sanitize the filename before use
      filename = sanitizeFilename(req.file.originalname);

      // V-005: Validate magic bytes match claimed file type
      if (!validateMagicBytes(req.file.buffer, req.file.originalname)) {
        return res.status(400).json({
          error: 'File content does not match its declared type. Upload rejected.'
        });
      }

      const parsed = await parseDocument(req.file.buffer, req.file.mimetype, filename);
      ragStore.setDocument(sessionId, parsed.document_id, parsed.chunks, parsed.fullText, filename, parsed.extractedFacts);
      
      return res.json({
        sessionId,
        document_id: parsed.document_id,
        filename,
        clauseCount: parsed.chunks.length,
        chunks: parsed.chunks,
        fullText: parsed.fullText,
        extractedFacts: parsed.extractedFacts
      });
    } else if (req.body.text) {
      const textContent = req.body.text;
      filename = sanitizeFilename(req.body.filename || 'Custom Text Document');
      const parsed = await parseDocument(Buffer.from(textContent), 'text/plain', filename);
      ragStore.setDocument(sessionId, parsed.document_id, parsed.chunks, textContent, filename, parsed.extractedFacts);
      
      return res.json({
        sessionId,
        document_id: parsed.document_id,
        filename,
        clauseCount: parsed.chunks.length,
        chunks: parsed.chunks,
        fullText: textContent,
        extractedFacts: parsed.extractedFacts
      });
    } else {
      return res.status(400).json({ error: 'No file or text content provided.' });
    }
  } catch (error) {
    console.error('[Upload Error]', error.message);
    res.status(500).json({ error: 'Document processing failed. Please try again with a valid file.' });
  }
});

export default router;
