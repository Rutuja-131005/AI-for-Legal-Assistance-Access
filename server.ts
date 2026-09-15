import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { parseDocumentBuffer } from './server/documentParser';
import {
  analyzeDocumentText,
  answerQuestionLocally,
  compareDocumentsLocally
} from './server/analysisEngine';
import { ContractAnalysis, RedFlag } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health Check
app.get('/api/health', (req, res) => {
  const hasKey = !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
});

// 2. Parse Document Buffer or Plain Text
app.post('/api/parse-document', async (req, res) => {
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
        analysis
      });
    }

    if (!base64 || !filename) {
      return res.status(400).json({ error: 'Missing document base64 data or filename.' });
    }

    const buffer = Buffer.from(base64, 'base64');
    const parsed = await parseDocumentBuffer(buffer, filename, mimeType);
    const analysis = analyzeDocumentText(parsed.text, filename);

    return res.json({
      success: true,
      text: parsed.text,
      wordCount: parsed.wordCount,
      detectedType: parsed.detectedType,
      filename: parsed.filename,
      analysis
    });
  } catch (err: any) {
    console.error('Document parse error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to process document.' });
  }
});

// 3. Analyze Contract
app.post('/api/analyze-contract', async (req, res) => {
  try {
    const { text, filename } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide valid contract text to analyze.' });
    }

    const baseAnalysis = analyzeDocumentText(text.trim(), filename);
    const ai = getGeminiClient();

    // If Gemini is available, enhance the executive summary and check for subtle edge-case risks
    if (ai) {
      try {
        const prompt = `You are ClariLex, an expert consumer legal literacy assistant.
Analyze the following legal document for a non-lawyer consumer.
Identify key parties, explain the document in simple plain English (ELIF), highlight unfair or risky clauses, and specify practical counter-proposals.

Document Title: ${baseAnalysis.documentTitle}
Document Text:
"""
${text.slice(0, 14000)}
"""

Provide your answer in strict JSON format matching this schema:
{
  "executiveSummary": "3-4 concise, plain-English sentences explaining what this contract is, what obligations it places on the consumer, and major traps to be wary of.",
  "additionalRedFlags": [
    {
      "clauseTitle": "Title or section name",
      "verbatimQuote": "exact quote from text",
      "riskLevel": "critical" | "warning" | "advisory",
      "category": "e.g. Penalty, Privacy, Termination, Liability",
      "issue": "Plain English explanation of why this matters to the consumer",
      "counterProposal": "Specific fairer phrasing to request instead",
      "practicalImpact": "Concrete financial or personal harm"
    }
  ]
}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text.trim());
          if (parsed.executiveSummary) {
            baseAnalysis.executiveSummary = parsed.executiveSummary;
          }
          if (Array.isArray(parsed.additionalRedFlags)) {
            parsed.additionalRedFlags.forEach((item: any, idx: number) => {
              if (item.issue && item.verbatimQuote) {
                const exists = baseAnalysis.redFlags.some(
                  f => f.issue.toLowerCase().includes(item.issue.toLowerCase().slice(0, 25))
                );
                if (!exists) {
                  baseAnalysis.redFlags.push({
                    id: `ai-flag-${Date.now()}-${idx}`,
                    clauseId: `clause-${idx + 1}`,
                    clauseTitle: item.clauseTitle || 'Contract Term',
                    verbatimQuote: item.verbatimQuote,
                    riskLevel: item.riskLevel || 'warning',
                    category: item.category || 'Potential Risk',
                    issue: item.issue,
                    counterProposal: item.counterProposal || 'Propose mutual and balanced terms.',
                    practicalImpact: item.practicalImpact || 'Potential contractual disadvantage.'
                  });
                }
              }
            });
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini enrichment skipped, using robust local legal analysis:', geminiError?.message);
      }
    }

    return res.json({ success: true, analysis: baseAnalysis });
  } catch (err: any) {
    console.error('Analysis error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to analyze contract.' });
  }
});

// 4. Grounded Document Q&A (RAG)
app.post('/api/ask-question', async (req, res) => {
  try {
    const { question, contractText, analysis } = req.body;
    if (!question || !contractText) {
      return res.status(400).json({ error: 'Question and contractText are required.' });
    }

    const currentAnalysis: ContractAnalysis = analysis || analyzeDocumentText(contractText);
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are ClariLex, a grounded legal document navigator.
Answer the user's question strictly using the provided contract text.

RULES:
1. Ground your answer in the text. Cite exact clause numbers, headings, and verbatim quotes.
2. If the contract DOES NOT explicitly address the question, explicitly state:
"⚠️ Missing Term: This agreement does not explicitly address this topic."
Then explain what statutory consumer protections or standard practices usually apply.
3. Use plain, friendly, and accessible English. No dense jargon without immediate translation.
4. Conclude with a reminder that this is informational legal literacy, not legal advice.

Contract Text:
"""
${contractText.slice(0, 16000)}
"""

User Question: "${question}"

Provide your response in JSON format with fields:
{
  "answer": "Clear, grounded answer with markdown formatting and plain-language explanation.",
  "isGrounded": true/false,
  "confidence": "high" | "medium" | "low",
  "citedClauses": [
    {
      "clauseTitle": "Heading or Section",
      "quote": "Short exact quote from the document"
    }
  ],
  "missingClauseWarning": "Warning if the document failed to mention standard protections, or null"
}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text.trim());
          return res.json({
            success: true,
            answer: parsed.answer,
            isGrounded: parsed.isGrounded !== false,
            confidence: parsed.confidence || 'high',
            citedClauses: (parsed.citedClauses || []).map((c: any, i: number) => ({
              clauseId: `cited-${i}`,
              clauseTitle: c.clauseTitle || 'Document Excerpt',
              quote: c.quote || ''
            })),
            missingClauseWarning: parsed.missingClauseWarning || undefined
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini Q&A fallback to local retrieval:', geminiError?.message);
      }
    }

    // Fallback: In-memory semantic keyword & clause retrieval engine
    const localResult = answerQuestionLocally(question, currentAnalysis);
    return res.json({
      success: true,
      ...localResult
    });
  } catch (err: any) {
    console.error('Q&A error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to process question.' });
  }
});

// 5. Compare Documents (Diff & Safety Delta)
app.post('/api/compare-documents', async (req, res) => {
  try {
    const { doc1Text, doc2Text, doc1Title, doc2Title } = req.body;
    if (!doc1Text || !doc2Text) {
      return res.status(400).json({ error: 'Both doc1Text and doc2Text are required for comparison.' });
    }

    const doc1 = analyzeDocumentText(doc1Text, doc1Title || 'Original Version');
    const doc2 = analyzeDocumentText(doc2Text, doc2Title || 'Revised Counter-Proposal');

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are ClariLex, comparing two versions of a consumer legal contract (e.g. Landlord's original vs Tenant's revised counter-proposal).
Analyze the changes between Version 1 and Version 2.

Version 1 (Original):
"""
${doc1Text.slice(0, 8000)}
"""

Version 2 (Revised / Counter-Proposal):
"""
${doc2Text.slice(0, 8000)}
"""

Respond in JSON format:
{
  "summaryOfChanges": "Comprehensive explanation of what changed and how the risk level shifted for the consumer.",
  "negotiationWins": ["List of key protections won in Version 2"],
  "remainingConcerns": ["Any risks that still persist in Version 2"]
}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text.trim());
          const localComp = compareDocumentsLocally(doc1, doc2);
          return res.json({
            success: true,
            comparison: {
              ...localComp,
              summaryOfChanges: parsed.summaryOfChanges || localComp.summaryOfChanges,
              negotiationWins: parsed.negotiationWins || localComp.negotiationWins,
              remainingConcerns: parsed.remainingConcerns || localComp.remainingConcerns
            }
          });
        }
      } catch (geminiError) {
        console.warn('Gemini comparison fallback to local comparison:', geminiError);
      }
    }

    const localComp = compareDocumentsLocally(doc1, doc2);
    return res.json({ success: true, comparison: localComp });
  } catch (err: any) {
    console.error('Comparison error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to compare documents.' });
  }
});

// 6. Draft Negotiation Email
app.post('/api/draft-negotiation', async (req, res) => {
  try {
    const {
      analysis,
      selectedFlagIds,
      tone = 'diplomatic',
      senderName = 'Riya Sharma',
      recipientName = 'Landlord / Property Manager',
      customNotes = ''
    } = req.body;

    const currentAnalysis: ContractAnalysis = analysis;
    const selectedFlags: RedFlag[] = (currentAnalysis?.redFlags || []).filter(
      (f: RedFlag) => (selectedFlagIds || []).includes(f.id)
    );

    const targetFlags = selectedFlags.length > 0 ? selectedFlags : (currentAnalysis?.redFlags || []).slice(0, 3);

    const modifications = targetFlags.map(f => ({
      clauseTitle: f.clauseTitle,
      originalQuote: f.verbatimQuote,
      proposedRedline: f.counterProposal,
      justification: f.issue
    }));

    const ai = getGeminiClient();
    if (ai) {
      try {
        const prompt = `You are ClariLex, drafting a polite, professional, and constructive negotiation email on behalf of a consumer (${senderName}) to the counterparty (${recipientName}).

Tone style: ${tone} (e.g. collaborative, standard business, or firm legal inquiry).
Contract: ${currentAnalysis?.documentTitle || 'Agreement'}
Additional User Context: ${customNotes || 'None'}

Specific Clauses & Requested Modifications:
${JSON.stringify(modifications, null, 2)}

Draft a complete, ready-to-send email.
Respond in JSON:
{
  "subject": "Clear, professional email subject line",
  "body": "Complete email body including greeting, courteous framing of excitement about the agreement, clear itemized requests with rationale and proposed counter-language, and polite call to action."
}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text.trim());
          return res.json({
            success: true,
            draft: {
              subject: parsed.subject,
              body: parsed.body,
              highlightedModifications: modifications
            }
          });
        }
      } catch (geminiError) {
        console.warn('Gemini negotiation draft fallback to template generator:', geminiError);
      }
    }

    // High quality deterministic draft
    const subject = `Review & Requested Minor Adjustments - ${currentAnalysis?.documentTitle || 'Agreement'} (${senderName})`;
    const bulletPoints = modifications.map((m, idx) => 
      `${idx + 1}. Regarding ${m.clauseTitle}:
   Current wording: "${m.originalQuote}"
   Requested adjustment: ${m.proposedRedline}
   Reason: To ensure standard mutual protection and align with local guidelines.`
    ).join('\n\n');

    const body = `Dear ${recipientName},

Thank you for sending over the ${currentAnalysis?.documentTitle || 'Agreement'}. I am excited about moving forward and appreciate the opportunity to collaborate.

Before signing, I conducted a careful review and identified a few minor terms that deviate from standard consumer practices. In the spirit of establishing a fair and mutually protected relationship, I would be grateful if we could make the following adjustments:

${bulletPoints}

${customNotes ? `Note: ${customNotes}\n\n` : ''}I am eager to finalize this agreement promptly once these points are addressed. Please let me know if these proposed revisions work for you, or if you would like to discuss them briefly over the phone.

Thank you very much for your time and understanding.

Warm regards,
${senderName}`;

    return res.json({
      success: true,
      draft: {
        subject,
        body,
        highlightedModifications: modifications
      }
    });
  } catch (err: any) {
    console.error('Negotiation draft error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to draft negotiation letter.' });
  }
});

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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ClariLex server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
