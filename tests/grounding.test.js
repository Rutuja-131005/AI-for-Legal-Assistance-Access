import assert from 'assert';
import { generateLLMResponse } from '../backend/services/llmClient.js';
import { SessionRagStore } from '../backend/services/ragEngine.js';

console.log('--- Running Grounding, Anti-Hallucination & Modal Verb Unit Tests ---');

// Test 1: RAG Search & Citation Accuracy
const ragStore = new SessionRagStore();
const chunks = [
  { id: '1.2', title: '1.2 LOCK-IN PERIOD', text: 'Both parties agree to a mandatory Lock-in Period of 6 months. Tenant shall forfeit deposit if vacating early.' },
  { id: '2.4', title: '2.4 PAINTING DEDUCTION', text: 'Landlord reserves the right to deduct 1 month rent (INR 35,000) for mandatory painting.' }
];

ragStore.setDocument('test-grounding-session', chunks, 'full text here');

const searchResults = ragStore.search('test-grounding-session', 'lock-in deposit forfeit', 1);
assert.strictEqual(searchResults[0].id, '1.2', 'Query for lock-in forfeit must cite Clause 1.2');

// Test 2: Anti-Hallucination Resistance (Absent Answer Query)
const absentAnswer = await generateLLMResponse({
  prompt: 'DOCUMENT CHUNKS:\n[Clause 1]: Rent is 35,000\n\nUSER QUESTION:\nIs swimming pool access and parking fee included?',
  expectedJson: false
});
assert(
  absentAnswer.includes('not specified'),
  'System must state information is not specified for absent queries'
);

// Test 3: Modal Verb Semantics Preservation ('shall' / 'must' / 'may')
const modalPrompt = `DOCUMENT CHUNKS:\n[Clause 5.1 NOTICE PERIOD]: Post completion of Lock-in Period, either party must give 2 months written notice prior to termination.\n\nUSER QUESTION:\nWhat are the notice period requirements?`;
const modalResponse = await generateLLMResponse({ prompt: modalPrompt, expectedJson: false });
assert(
  modalResponse.includes('must') || modalResponse.includes('shall') || modalResponse.includes('document states'),
  'Response must preserve modal verb semantics and use calibrated legal language'
);

console.log('✓ Grounding & Modal Verb Unit Tests Passed!');
