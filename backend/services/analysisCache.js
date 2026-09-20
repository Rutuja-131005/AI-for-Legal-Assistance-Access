import crypto from 'crypto';

/**
 * High-performance SHA-256 Analysis Cache Service
 * Provides sub-millisecond (< 1ms) retrieval for duplicate document processing
 */
class AnalysisCache {
  constructor(maxEntries = 100, ttlMs = 3600000) { // 1 hour TTL
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }

  generateHash(text, options = {}) {
    const content = text + JSON.stringify(options);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  get(text, options = {}) {
    const hash = this.generateHash(text, options);
    const entry = this.cache.get(hash);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(hash);
      return null;
    }

    return entry.data;
  }

  set(text, options = {}, data) {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (LRU eviction)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const hash = this.generateHash(text, options);
    this.cache.set(hash, {
      data,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const analysisCache = new AnalysisCache();
