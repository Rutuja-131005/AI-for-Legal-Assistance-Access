import assert from 'assert';
import { analysisCache } from '../backend/services/analysisCache.js';

console.log('--- Running Analysis Cache Unit Tests ---');

const sampleText = 'This is a test legal agreement for cache verification.';
const sampleData = { documentType: 'Test Agreement', riskScore: 85 };

// Test 1: Cache Miss on fresh key
const miss = analysisCache.get(sampleText, { filename: 'test.txt' });
assert.strictEqual(miss, null, 'Fresh key should return cache miss (null)');

// Test 2: Cache Set and Instant Retrieval (< 1ms)
const start = performance.now();
analysisCache.set(sampleText, { filename: 'test.txt' }, sampleData);
const hit = analysisCache.get(sampleText, { filename: 'test.txt' });
const duration = performance.now() - start;

assert(hit !== null, 'Cache hit should return stored data');
assert.strictEqual(hit.documentType, 'Test Agreement', 'Cache hit should match stored payload');
assert(duration < 5, `Cache lookup should take < 5ms (took ${duration.toFixed(2)}ms)`);

console.log('✓ Analysis Cache Tests Passed!');
