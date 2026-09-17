import express from 'express';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { setupSecurityMiddleware } from './server/middleware/security.js';
import { apiLimiter, aiOperationLimiter, uploadLimiter } from './server/middleware/rateLimiter.js';
import {
  validateRequestBody,
  parseDocumentSchema,
  analyzeContractSchema,
  askQuestionSchema,
  compareContractsSchema,
  draftNegotiationSchema,
} from './server/middleware/validator.js';
import { errorHandler } from './server/middleware/errorHandler.js';
import { sessionAuthMiddleware } from './server/middleware/sessionAuth.js';

import { getSystemMetrics } from './server/services/metricsTracker.js';
import {
  analyzeDocumentText,
  answerQuestionLocally,
  compareDocumentsLocally,
  enhanceAnalysisWithAI,
  answerQuestionWithAI,
  getGeminiClient,
  executeGroundedRAGQuery,
  detectLanguageIntent,
  translateLegalExplanation,
} from './server/services/analysisService.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable HTTP Gzip/Brotli compression for fast network transfers
app.use(compression());

// Apply Helmet security headers & CORS
setupSecurityMiddleware(app);

// Sensible production request body parsing limits (10MB max)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attach document session isolation middleware
app.use(sessionAuthMiddleware);

// Global rate limiting for all API routes
app.use('/api', apiLimiter);

// 1. Health Check Endpoint
app.get('/api/health', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const geminiConfigured = !!(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '' && apiKey !== 'YOUR_API_KEY_HERE');
  res.json({
    status: 'ok',
    geminiConfigured,
    timestamp: new Date().toISOString(),
  });
});

// Observability & System Metrics Endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    success: true,
    metrics: getSystemMetrics(),
  });
});

// 2. Parse Document Buffer or Plain Text (Upload Limiter)
app.post(
  '/api/parse-document',
  uploadLimiter,
  validateRequestBody(parseDocumentSchema),
  async (req, res, next) => {
    try {
      const { base64, filename, mimeType, text } = req.body;

      if (text && typeof text === 'string') {
        const clean = text.trim();
        const analysis = analyzeDocumentText(clean, filename);
        return res.json({
          success: true,
          text: clean,
          wordCount: clean.split(/\s+/).filter(Boolean).length,
          filename: filename || 'pasted-contract.txt',
          analysis,
        });
      }

      if (!base64 || !filename) {
        return res.status(400).json({ error: 'Missing document base64 data or filename.' });
      }

      const buffer = Buffer.from(base64, 'base64');
      const { parseDocumentBuffer } = await import('./server/documentParser.js');
      const parsed = await parseDocumentBuffer(buffer, filename, mimeType);
      const analysis = analyzeDocumentText(parsed.text, filename);

      return res.json({
        success: true,
        text: parsed.text,
        wordCount: parsed.wordCount,
        detectedType: parsed.detectedType,
        filename: parsed.filename,
        analysis,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 3. Analyze Contract Endpoint (AI Operation Limiter)
app.post(
  '/api/analyze-contract',
  aiOperationLimiter,
  validateRequestBody(analyzeContractSchema),
  async (req, res, next) => {
    try {
      const { text, filename } = req.body;
      const baseAnalysis = analyzeDocumentText(text.trim(), filename);

      // Enhance with Gemini AI (with prompt injection protection inside service)
      const enhancedAnalysis = await enhanceAnalysisWithAI(baseAnalysis);

      return res.json({ success: true, analysis: enhancedAnalysis });
    } catch (err) {
      next(err);
    }
  }
);

// 4. Grounded Document Q&A (RAG) Endpoint (AI Operation Limiter & Multilingual Support)
app.post(
  '/api/ask-question',
  aiOperationLimiter,
  validateRequestBody(askQuestionSchema),
  async (req, res, next) => {
    try {
      const { question, contractText, rawText, analysis, language = 'en' } = req.body;
      const textToUse = contractText || rawText || '';
      const currentAnalysis = analysis || analyzeDocumentText(textToUse);

      const targetLang = language !== 'en' ? language : detectLanguageIntent(question);

      // Execute RAG Pipeline with Evidence Validation Layer
      const ragResult = await executeGroundedRAGQuery(question, textToUse, currentAnalysis);

      // Translate explanation if target language is Hindi (hi) or Marathi (mr)
      if (targetLang !== 'en' && ragResult.answer) {
        ragResult.answer = await translateLegalExplanation(ragResult.answer, targetLang);
        ragResult.languageUsed = targetLang;
      }

      return res.json({
        success: true,
        ...ragResult,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 5. Compare Documents Endpoint
app.post(
  '/api/compare-documents',
  validateRequestBody(compareContractsSchema),
  async (req, res, next) => {
    try {
      const { doc1Text, doc2Text, doc1Title, doc2Title } = req.body;

      const doc1 = analyzeDocumentText(doc1Text, doc1Title || 'Original Version');
      const doc2 = analyzeDocumentText(doc2Text, doc2Title || 'Revised Counter-Proposal');

      const localComp = compareDocumentsLocally(doc1, doc2);
      return res.json({ success: true, comparison: localComp });
    } catch (err) {
      next(err);
    }
  }
);

// 6. Draft Negotiation Email Endpoint (AI Operation Limiter)
app.post(
  '/api/draft-negotiation',
  aiOperationLimiter,
  validateRequestBody(draftNegotiationSchema),
  async (req, res, next) => {
    try {
      const {
        analysis,
        selectedFlagIds,
        tone = 'diplomatic',
        senderName = 'Tenant / Consumer',
        recipientName = 'Counterparty / Landlord',
        customNotes = '',
      } = req.body;

      const currentAnalysis = analysis;
      const selectedFlags = (currentAnalysis?.redFlags || []).filter(
        f => (selectedFlagIds || []).includes(f.id)
      );

      const targetFlags = selectedFlags.length > 0 ? selectedFlags : (currentAnalysis?.redFlags || []).slice(0, 3);

      const modifications = targetFlags.map(f => ({
        clauseTitle: f.clauseTitle,
        originalQuote: f.verbatimQuote,
        proposedRedline: f.counterProposal,
        justification: f.issue,
      }));

      const ai = getGeminiClient();
      if (ai) {
        try {
          const prompt = `You are ClariLex, drafting a polite, professional negotiation email from ${senderName} to ${recipientName}.
Tone: ${tone}
Contract: ${currentAnalysis?.documentTitle || 'Agreement'}
Additional Notes: ${customNotes || 'None'}

Target Modification Requests:
${JSON.stringify(modifications, null, 2)}

Provide JSON response with:
{
  "subject": "Clear subject line",
  "body": "Complete email body"
}`;

          const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              systemInstruction: 'Draft professional legal negotiation emails. Respond in pure valid JSON format.',
              temperature: 0.3,
            },
          });

          if (aiResponse.text) {
            const clean = aiResponse.text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            const parsed = JSON.parse(clean);
            if (parsed.subject && parsed.body) {
              return res.json({
                success: true,
                draft: {
                  subject: parsed.subject,
                  body: parsed.body,
                  highlightedModifications: modifications,
                },
              });
            }
          }
        } catch (geminiError) {
          console.warn('Gemini negotiation draft fallback to template generator:', geminiError);
        }
      }

      // High quality deterministic draft
      const subject = `Review & Requested Minor Adjustments - ${currentAnalysis?.documentTitle || 'Agreement'} (${senderName})`;
      const bulletPoints = modifications
        .map(
          (m, idx) =>
            `${idx + 1}. Regarding ${m.clauseTitle}:
   Current wording: "${m.originalQuote}"
   Requested adjustment: ${m.proposedRedline}
   Reason: ${m.justification}`
        )
        .join('\n\n');

      const body = `Dear ${recipientName},

Thank you for sending over the ${currentAnalysis?.documentTitle || 'Agreement'}. I am looking forward to working together and appreciate the opportunity to review the document.

Before finalizing, I conducted a review and identified a few terms where I would appreciate minor adjustments to ensure balanced protection for both parties:

${bulletPoints}

${customNotes ? `Additional Note: ${customNotes}\n\n` : ''}Please let me know if these proposed revisions work for you. I am eager to finalize this agreement promptly once these points are resolved.

Thank you for your time and consideration.

Best regards,
${senderName}`;

      return res.json({
        success: true,
        draft: {
          subject,
          body,
          highlightedModifications: modifications,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Attach Global Error Handling Middleware
app.use(errorHandler);

// Vite middleware & Production Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        immutable: true,
        index: false,
      })
    );
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.info(`ClariLex server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
