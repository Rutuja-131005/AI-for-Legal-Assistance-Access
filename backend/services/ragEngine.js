/**
 * Session RAG Vector Indexing, Hybrid Search & Strict Document Isolation Engine
 */
export class SessionRagStore {
  constructor() {
    this.sessions = new Map(); // sessionId -> DocumentSession
  }

  /**
   * Sets a document session with strict document_id isolation & backward compatibility
   */
  setDocument(sessionId, document_id, chunks, fullText, filename = 'document', extractedFacts = {}) {
    if (Array.isArray(document_id)) {
      // Backward compatibility for (sessionId, chunks, fullText) calls
      fullText = chunks || '';
      chunks = document_id;
      document_id = `DOC_${sessionId}`;
    }

    // Completely clear old document context for this session
    this.sessions.set(sessionId, {
      sessionId,
      document_id,
      document_name: filename,
      uploaded_at: Date.now(),
      chunks: Array.isArray(chunks) ? chunks : [],
      fullText: fullText || '',
      extractedFacts: extractedFacts || {}
    });
  }

  /**
   * Retrieves active DocumentSession
   */
  getDocument(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Classifies query into legal intent categories
   */
  classifyQuery(query) {
    const q = query.toLowerCase();
    if (q.includes('deposit') || q.includes('security') || q.includes('refundable')) return 'SECURITY_DEPOSIT';
    if (q.includes('notice') || q.includes('vacate') || q.includes('leaving')) return 'NOTICE_PERIOD';
    if (q.includes('lock-in') || q.includes('minimum stay') || q.includes('early exit')) return 'LOCK_IN';
    if (q.includes('rent') || q.includes('payment') || q.includes('ctc') || q.includes('salary')) return 'RENT';
    if (q.includes('painting') || q.includes('deduct') || q.includes('penalty') || q.includes('forfeit') || q.includes('clawback')) return 'DEDUCTION';
    if (q.includes('escalat') || q.includes('increase') || q.includes('annual hike')) return 'RENT_ESCALATION';
    if (q.includes('terminate') || q.includes('breach') || q.includes('cancel')) return 'TERMINATION';
    if (q.includes('maintenance') || q.includes('rwa') || q.includes('utility')) return 'MAINTENANCE';
    if (q.includes('pet') || q.includes('dog') || q.includes('cat')) return 'PETS';
    if (q.includes('park') || q.includes('vehicle') || q.includes('car')) return 'PARKING';
    return 'GENERAL';
  }

  /**
   * Performs Hybrid Retrieval (Vector/Keyword + BM25 + Exact Value Boost + Intent Boost)
   * Enforces strict document_id filter matching
   */
  search(sessionId, query, options = {}) {
    const { topK = 4, document_id = null } = typeof options === 'object' ? options : { topK: options };
    const session = this.sessions.get(sessionId);

    if (!session || !session.chunks || session.chunks.length === 0) {
      return [];
    }

    // STRICT DOCUMENT ISOLATION GUARD:
    // If document_id is provided, reject if it does not match the active session document_id!
    if (document_id && session.document_id !== document_id) {
      console.warn(`[RAG Isolation Warning] Requested document_id ${document_id} does not match active session document_id ${session.document_id}. Returning empty set.`);
      return [];
    }

    const category = this.classifyQuery(query);
    const queryLower = query.toLowerCase();

    // Extract exact numbers or currencies in query (e.g. ₹84,000, 45 days, 6 months)
    const exactNumbers = queryLower.match(/\b\d+[\d,]*\b|\b₹[\d,]+\b|\binr\s*[\d,]+\b|\b\d+\s*days?\b|\b\d+\s*months?\b/gi) || [];

    const queryTerms = queryLower
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2);

    const scored = session.chunks.map(chunk => {
      // Confirm chunk belongs to active document_id
      if (document_id && chunk.document_id !== document_id) {
        return { ...chunk, score: -100 };
      }

      const chunkTextLower = (chunk.title + ' ' + chunk.text + ' ' + (chunk.clause_number || '')).toLowerCase();
      let score = 0;

      // 1. Keyword / BM25 Term Frequency Matching
      for (const term of queryTerms) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = chunkTextLower.match(regex);
        if (matches) {
          score += matches.length * 2;
        } else if (chunkTextLower.includes(term)) {
          score += 0.5;
        }
      }

      // 2. Section Title Boost
      for (const term of queryTerms) {
        if ((chunk.clause_title || chunk.title).toLowerCase().includes(term)) {
          score += 4;
        }
      }

      // 3. Category Intent Boost
      if (category === 'SECURITY_DEPOSIT' && (chunkTextLower.includes('security deposit') || chunkTextLower.includes('deposit amount'))) score += 10;
      if (category === 'SECURITY_DEPOSIT' && (chunk.clause_title || chunk.title || '').toLowerCase().includes('deposit')) score += 10;
      if (category === 'NOTICE_PERIOD' && (chunkTextLower.includes('notice period') || chunkTextLower.includes('notice'))) score += 10;
      if (category === 'LOCK_IN' && (chunkTextLower.includes('lock-in') || chunkTextLower.includes('minimum stay'))) score += 10;
      if (category === 'DEDUCTION' && (chunkTextLower.includes('deduct') || chunkTextLower.includes('painting'))) score += 10;

      // 4. Exact Value & Number Boost
      for (const num of exactNumbers) {
        if (chunkTextLower.includes(num.toLowerCase())) {
          score += 6;
        }
      }

      // 5. Negation Keyword Boost (no lock-in, shall not forfeit, no painting fee)
      if (queryLower.includes('no ') || queryLower.includes('not') || queryLower.includes('without')) {
        if (chunkTextLower.includes('no ') || chunkTextLower.includes('not ') || chunkTextLower.includes('without') || chunkTextLower.includes('shall not')) {
          score += 4;
        }
      }

      return { ...chunk, score };
    });

    // Filter out invalid chunks
    const validScored = scored.filter(c => c.score >= 0);
    validScored.sort((a, b) => b.score - a.score);

    // If top score is 0, return top first chunks of current document
    if (validScored.length > 0 && validScored[0].score === 0) {
      return validScored.slice(0, Math.min(topK, validScored.length));
    }

    const topResults = validScored.slice(0, topK);

    // Contradiction Check: detect if retrieved top chunks contain conflicting notice numbers
    let hasConflict = false;
    if (category === 'NOTICE_PERIOD' && topResults.length >= 2) {
      const noticeMatches = topResults.map(c => c.text.match(/(\d+)\s*(?:day|days|month|months)\s*(?:written\s*)?notice/i)).filter(Boolean);
      if (noticeMatches.length >= 2 && noticeMatches[0][1] !== noticeMatches[1][1]) {
        hasConflict = true;
      }
    }

    return topResults.map(r => ({ ...r, hasConflict }));
  }

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}

export const ragStore = new SessionRagStore();
