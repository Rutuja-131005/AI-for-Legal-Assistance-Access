import assert from 'assert';
import { SessionRagStore } from '../backend/services/ragEngine.js';

console.log('--- Running RAG Engine Unit Tests ---');

const ragStore = new SessionRagStore();
const chunks = [
  { id: '1.2', title: '1.2 LOCK-IN PERIOD', text: 'Mandatory 6 months lock-in period. Forfeit deposit if vacating early.' },
  { id: '2.1', title: '2.1 MONTHLY RENT', text: 'Monthly rent of INR 35,000 payable on 5th of every month.' },
  { id: '2.4', title: '2.4 PAINTING DEDUCTION', text: '1 month rent deducted for mandatory painting upon exit.' }
];

ragStore.setDocument('test-session', chunks, 'full text here');

const searchResults = ragStore.search('test-session', 'painting deduction deposit', 2);
assert(searchResults.length > 0, 'Should find relevant chunks');
assert(searchResults[0].id === '2.4' || searchResults[0].id === '1.2', 'Top result should match query terms');

console.log('✓ RAG Engine Tests Passed!');
