import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRouter from './routes/upload.js';
import analyzeRouter from './routes/analyze.js';
import chatRouter from './routes/chat.js';
import compareRouter from './routes/compare.js';
import checklistRouter from './routes/checklist.js';

import { securityHeaders, rateLimiter, sanitizeBody } from './middleware/securityMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(securityHeaders);
app.use(rateLimiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeBody);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ClariLex AI Backend API',
    security: 'enforced',
    timestamp: new Date().toISOString()
  });
});


// API Routes
app.use('/api/upload', uploadRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/chat', chatRouter);
app.use('/api/compare', compareRouter);
app.use('/api/checklist', checklistRouter);

if (process.env.RUN_STANDALONE === 'true') {
  app.listen(PORT, () => {
    console.log(`ClariLex Backend API running on http://localhost:${PORT}`);
  });
}

export default app;

