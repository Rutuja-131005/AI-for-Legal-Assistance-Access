/**
 * Session RAG Vector Indexing & Keyword Relevance Engine
 */
export class SessionRagStore {
  constructor() {
    this.sessions = new Map(); // sessionId -> { chunks: Array, fullText: string }
  }

  setDocument(sessionId, chunks, fullText) {
    this.sessions.set(sessionId, {
      chunks,
      fullText,
      timestamp: Date.now()
    });
  }

  getDocument(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * Performs TF-IDF / Keyword Similarity Search to retrieve top K chunks grounded in user query
   */
  search(sessionId, query, topK = 4) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.chunks || session.chunks.length === 0) {
      return [];
    }

    const queryTerms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2);

    const scored = session.chunks.map(chunk => {
      const chunkLower = (chunk.title + ' ' + chunk.text).toLowerCase();
      let score = 0;

      for (const term of queryTerms) {
        // Count term frequency
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = chunkLower.match(regex);
        if (matches) {
          score += matches.length * 2;
        } else if (chunkLower.includes(term)) {
          score += 0.5;
        }
      }

      // Bonus for section titles
      for (const term of queryTerms) {
        if (chunk.title.toLowerCase().includes(term)) {
          score += 3;
        }
      }

      return { ...chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // If top score is 0, return first 3 chunks as general context fallback
    if (scored[0].score === 0) {
      return session.chunks.slice(0, Math.min(topK, session.chunks.length));
    }

    return scored.slice(0, topK);
  }

  clearSession(sessionId) {
    this.sessions.delete(sessionId);
  }
}

export const ragStore = new SessionRagStore();
