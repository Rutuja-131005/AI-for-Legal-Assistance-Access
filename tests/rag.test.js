import assert from 'assert';
import { SessionRagStore } from '../backend/services/ragEngine.js';

console.log('--- Running Expanded RAG Engine Citation Unit Tests ---');

const ragStore = new SessionRagStore();
const chunks = [
  { id: '1.2', title: '1.2 LOCK-IN PERIOD', text: 'Mandatory 6 months lock-in period. Forfeit deposit if vacating early.' },
  { id: '2.1', title: '2.1 MONTHLY RENT', text: 'Monthly rent of INR 35,000 payable on 5th of every month.' },
  { id: '2.4', title: '2.4 PAINTING DEDUCTION', text: '1 month rent deducted for mandatory painting upon exit.' }
];

ragStore.setDocument('test-session', chunks, 'full text here');

// Test 1: Citation Match Accuracy for Painting Deduction
const searchResults = ragStore.search('test-session', 'painting deduction deposit', 2);
assert(searchResults.length > 0, 'Should find relevant chunks');
assert(searchResults[0].id === '2.4' || searchResults[0].id === '1.2', 'Top result should match query terms');
assert(searchResults[0].title.includes('PAINTING') || searchResults[0].title.includes('LOCK-IN'), 'Citation title must match chunk');

// Test 2: Citation Match Accuracy for Lock-in Period
const lockInResults = ragStore.search('test-session', 'lock-in period forfeit', 1);
assert.strictEqual(lockInResults[0].id, '1.2', 'Query for lock-in forfeit must cite Clause 1.2');

// Test 3: Unknown Session Handling
const unknownResults = ragStore.search('non-existent-session', 'rent query', 2);
assert(Array.isArray(unknownResults), 'Unknown session should return empty array');
assert.strictEqual(unknownResults.length, 0, 'Unknown session length should be 0');

console.log('✓ RAG Engine Citation Accuracy Tests Passed!');
