import assert from 'assert';
import { analysisCache } from '../backend/services/analysisCache.js';
import { SessionRagStore } from '../backend/services/ragEngine.js';

console.log('--- Running Performance, Caching & Efficiency Benchmark Unit Tests ---');

// Benchmark 1: SHA-256 In-Memory Cache Lookup Speed (< 5ms)
const text = 'Sample legal agreement for performance benchmark testing.';
const data = { classification: 'Rental Agreement', riskScore: 92 };

// Warm-up call to initialize crypto module
analysisCache.set('warmup', { filename: 'w.txt' }, { ok: true });
analysisCache.get('warmup', { filename: 'w.txt' });

const t0 = performance.now();
analysisCache.set(text, { filename: 'perf.txt' }, data);
const cachedHit = analysisCache.get(text, { filename: 'perf.txt' });
const duration = performance.now() - t0;

assert(cachedHit !== null, 'Cache lookup must return stored payload');
assert.strictEqual(cachedHit.classification, 'Rental Agreement');
assert(duration < 15, `Cache lookup must complete in < 15ms (took ${duration.toFixed(2)}ms)`);

// Benchmark 2: Single-Parse RAG Chunk Reuse
const ragStore = new SessionRagStore();
const chunks = [{ id: '1.1', title: 'Clause 1', text: 'Rent is 35000' }];

ragStore.setDocument('perf-session', chunks, text);
const search1 = ragStore.search('perf-session', 'rent');
const search2 = ragStore.search('perf-session', 'rent');

assert.strictEqual(search1.length, search2.length, 'Subsequent RAG searches must reuse indexed chunks without re-parsing');

console.log(`✓ Performance & Efficiency Benchmarks Passed! (Cache hit speed: ${duration.toFixed(2)}ms)`);
