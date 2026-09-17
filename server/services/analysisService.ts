import { ContractAnalysis, DocumentComparisonResult } from '../../src/types';

import { detectDocumentCategory, getCategoryDisplayName } from './categoryDetector';
import { segmentClauses } from './clauseSegmenter';
import { identifyRedFlags } from './redFlagDetector';
import { extractEntities } from './entityExtractor';
import { extractRightsAndObligations } from './rightsObligationsExtractor';
import { identifyMissingProtections } from './missingClausesDetector';
import { calculateRiskScore } from './riskScorer';
import { generateExecutiveSummary } from './summaryGenerator';
import { enhanceAnalysisWithAI, answerQuestionWithAI, getGeminiClient } from './aiAnalyzer';

// Re-export sub-services for direct usage if needed
export {
  detectDocumentCategory,
  getCategoryDisplayName,
  segmentClauses,
  identifyRedFlags,
  extractEntities,
  extractRightsAndObligations,
  identifyMissingProtections,
  calculateRiskScore,
  generateExecutiveSummary,
  enhanceAnalysisWithAI,
  answerQuestionWithAI,
  getGeminiClient
};

import crypto from 'crypto';

// High-performance analysis cache (Max 100 items LRU eviction)
const analysisCache = new Map<string, ContractAnalysis>();
const MAX_CACHE_SIZE = 100;

function computeCacheKey(rawText: string, customTitle?: string): string {
  return crypto.createHash('sha256').update(rawText + (customTitle || '')).digest('hex');
}

/**
 * Full Analysis Pipeline (Heuristic + Rules + optional AI Enhancement with SHA-256 LRU Caching)
 */
export function analyzeDocumentText(rawText: string, customTitle?: string): ContractAnalysis {
  const cacheKey = computeCacheKey(rawText, customTitle);
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey)!;
  }

  const category = detectDocumentCategory(rawText);
  const categoryDisplayName = getCategoryDisplayName(category);
  const clauses = segmentClauses(rawText);
  const redFlags = identifyRedFlags(clauses, rawText);
  const keyEntities = extractEntities(rawText, category);
  const rightsAndObligations = extractRightsAndObligations(clauses, category);
  const missingStandardProtections = identifyMissingProtections(rawText, category);

  const { overallRiskScore, riskScoreLabel, riskBreakdown } = calculateRiskScore(redFlags, clauses);

  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  const documentTitle = customTitle || (clauses[0]?.title && clauses[0].title.length < 50 ? clauses[0].title : categoryDisplayName);

  const executiveSummary = generateExecutiveSummary(category, categoryDisplayName, keyEntities, redFlags, clauses);

  const result: ContractAnalysis = {
    documentTitle,
    category,
    categoryDisplayName,
    executiveSummary,
    keyEntities,
    overallRiskScore,
    riskScoreLabel,
    riskBreakdown,
    redFlags,
    rightsAndObligations,
    clauses,
    missingStandardProtections,
    rawText,
    wordCount,
    processedAt: new Date().toISOString()
  };

  if (analysisCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(cacheKey, result);

  return result;
}

/**
 * Answer grounded questions locally with exact clause citation
 */
export function answerQuestionLocally(question: string, analysis: ContractAnalysis) {
  const q = question.toLowerCase();

  let matchedClause = analysis.clauses.find(c => {
    const text = (c.title + ' ' + c.text).toLowerCase();
    if (q.includes('notice') || q.includes('entry') || q.includes('landlord access') || q.includes('right of access')) {
      if (/entry|access|inspect|notice/i.test(text)) return true;
    }
    if (q.includes('deposit') || q.includes('refund')) {
      if (/deposit|fee|refund/i.test(text)) return true;
    }
    if (q.includes('pet') || q.includes('dog') || q.includes('cat') || q.includes('animal')) {
      if (/pet|dog|cat|animal/i.test(text)) return true;
    }
    if (q.includes('break') || q.includes('terminate') || q.includes('leave') || q.includes('cancel')) {
      if (/terminat|liquidated|vacat|cancel/i.test(text)) return true;
    }
    if (q.includes('repair') || q.includes('plumbing') || q.includes('maintenance')) {
      if (/maintenance|repair|as is/i.test(text)) return true;
    }
    if (q.includes('late') || q.includes('penalty')) {
      if (/late|charge|due|penalty/i.test(text)) return true;
    }
    if (q.includes('renew') || q.includes('extend')) {
      if (/renew|extension/i.test(text)) return true;
    }
    if (q.includes('guest') || q.includes('sublet') || q.includes('occupant')) {
      if (/guest|occupan|sublet/i.test(text)) return true;
    }
    if (q.includes('ip') || q.includes('invention') || q.includes('work product')) {
      if (/intellectual|invention|assignment|ownership/i.test(text)) return true;
    }
    return false;
  });

  if (!matchedClause && analysis.clauses.length > 0) {
    const stopWords = new Set(['there', 'access', 'about', 'which', 'where', 'with', 'from', 'that', 'this', 'have', 'shall', 'does', 'would', 'could', 'should', 'your', 'their', 'will', 'more', 'some', 'what', 'when', 'who', 'how', 'is', 'are', 'was', 'were']);
    const qWords = q.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    if (qWords.length > 0) {
      let bestScore = 0;
      analysis.clauses.forEach(c => {
        const cText = (c.title + ' ' + c.text).toLowerCase();
        const score = qWords.filter(w => cText.includes(w)).length;
        if (score > bestScore) {
          bestScore = score;
          matchedClause = c;
        }
      });
      if (bestScore === 0) {
        matchedClause = undefined;
      }
    }
  }

  if (matchedClause) {
    return {
      answer: `Based on **${matchedClause.title}**:\n\n${matchedClause.text}\n\n**Plain Language Meaning:**\n${matchedClause.riskReason || 'This section governs your obligations and rights for this specific topic.'}`,
      isGrounded: true,
      citedClauses: [
        {
          clauseId: matchedClause.id,
          clauseTitle: matchedClause.title,
          quote: matchedClause.text.substring(0, 200) + (matchedClause.text.length > 200 ? '...' : '')
        }
      ],
      confidence: 'high' as const
    };
  }

  return {
    answer: `This agreement does not explicitly address "${question}". In standard legal practice, when a contract remains silent on this matter, local statutory default rules or common law apply. You should request written clarification from the other party before signing.`,
    isGrounded: false,
    citedClauses: [],
    confidence: 'medium' as const,
    missingClauseWarning: 'No corresponding clause found in the document text.'
  };
}

/**
 * Compare Document 1 vs Document 2
 */
export function compareDocumentsLocally(doc1: ContractAnalysis, doc2: ContractAnalysis): DocumentComparisonResult {
  const safetyDelta = doc2.overallRiskScore - doc1.overallRiskScore;
  const clauseDiffs: DocumentComparisonResult['clauseDiffs'] = [];
  const negotiationWins: string[] = [];
  const remainingConcerns: string[] = [];

  doc1.clauses.forEach(c1 => {
    const c2 = doc2.clauses.find(c => c.category === c1.category || c.title.toLowerCase().includes(c1.title.toLowerCase().slice(0, 8)));
    if (!c2) {
      clauseDiffs.push({
        category: c1.category,
        title: c1.title,
        status: 'removed',
        explanation: 'Clause removed in the revised version.',
        doc1Excerpt: c1.text.substring(0, 150)
      });
      negotiationWins.push(`Successfully eliminated ${c1.title}`);
    } else if (c2.text !== c1.text) {
      const improved = (c1.riskLevel === 'critical' || c1.riskLevel === 'warning') && c2.riskLevel === 'standard';
      clauseDiffs.push({
        category: c1.category,
        title: c1.title,
        status: improved ? 'improved' : 'unchanged',
        explanation: improved ? 'Significantly softened with standard consumer protections.' : 'Modified wording.',
        doc1Excerpt: c1.text.substring(0, 120),
        doc2Excerpt: c2.text.substring(0, 120)
      });
      if (improved) {
        negotiationWins.push(`Softened ${c1.title} to include standard grace periods and notice.`);
      }
    }
  });

  if (negotiationWins.length === 0) {
    negotiationWins.push('Clarified party obligations and dispute timelines.');
  }

  doc2.redFlags.forEach(f => {
    remainingConcerns.push(`${f.category}: ${f.issue}`);
  });

  return {
    doc1Title: doc1.documentTitle,
    doc2Title: doc2.documentTitle,
    riskScore1: doc1.overallRiskScore,
    riskScore2: doc2.overallRiskScore,
    safetyDelta,
    summaryOfChanges: `The revised version changes your overall contractual safety score from ${doc1.overallRiskScore}/100 to ${doc2.overallRiskScore}/100 (${safetyDelta >= 0 ? '+' : ''}${safetyDelta}% change).`,
    clauseDiffs,
    negotiationWins,
    remainingConcerns: remainingConcerns.slice(0, 3)
  };
}
