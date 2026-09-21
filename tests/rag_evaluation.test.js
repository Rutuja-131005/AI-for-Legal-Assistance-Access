import assert from 'assert';
import { parseDocument } from '../backend/services/docParser.js';
import { ragStore } from '../backend/services/ragEngine.js';
import { generateLLMResponse } from '../backend/services/llmClient.js';

console.log('--- Running Comprehensive RAG & Isolation Evaluation Unit Tests ---');

// Document A Text (Indiranagar 3.5L rental)
const docAText = `
1. PREMISES AND TERM
1.1 The Landlord hereby leases the Indiranagar premises to the Tenant for 11 months.
1.2 LOCK-IN PERIOD: Both parties agree to a mandatory Lock-in Period of 6 (six) months. If the Tenant vacates prior to completion, the Tenant shall forfeit the entire Security Deposit.

2. RENT AND SECURITY DEPOSIT
2.1 Tenant shall pay a monthly rent of INR 35,000.
2.2 Tenant shall deposit an interest-free Security Deposit of INR 3,50,000.
2.4 PAINTING DEDUCTION: Upon vacating, 1 (one) full month rent (INR 35,000) shall automatically be deducted for painting.
`;

// Document B Text (Koramangala 84K rental with NO lock-in and NO painting fee)
const docBText = `
1. PREMISES AND TERM
1.1 The Landlord leases the Koramangala apartment for 11 months.
1.2 LOCK-IN: There shall be no lock-in period under this agreement.

2. RENT AND DEPOSIT
2.1 Monthly rent shall be INR 28,000.
2.2 Security deposit shall be INR 84,000.
2.3 PAINTING: The Tenant shall not be charged a fixed painting fee or automatic deduction.

3. NOTICE PERIOD
3.1 The Tenant may terminate this agreement by providing 45 days written notice. The Landlord must provide 60 days notice.
`;

// Document C Text (No lock-in clause mentioned at all)
const docCText = `
1. PREMISES AND TERM
1.1 The Landlord leases the flat for 11 months starting October 2026.
2. RENT: Monthly rent is INR 25,000 payable by 5th of each month.
`;

async function runEvaluationTests() {
  // Setup Sessions
  const parsedA = await parseDocument(Buffer.from(docAText), 'text/plain', 'DocA.txt');
  const sessionA = 'session-doc-A';
  ragStore.setDocument(sessionA, parsedA.document_id, parsedA.chunks, docAText, 'DocA.txt', parsedA.extractedFacts);

  const parsedB = await parseDocument(Buffer.from(docBText), 'text/plain', 'DocB.txt');
  const sessionB = 'session-doc-B';
  ragStore.setDocument(sessionB, parsedB.document_id, parsedB.chunks, docBText, 'DocB.txt', parsedB.extractedFacts);

  const parsedC = await parseDocument(Buffer.from(docCText), 'text/plain', 'DocC.txt');
  const sessionC = 'session-doc-C';
  ragStore.setDocument(sessionC, parsedC.document_id, parsedC.chunks, docCText, 'DocC.txt', parsedC.extractedFacts);

  // --- Test 1: Cross-Document Contamination & Document Isolation ---
  const chunksForB = ragStore.search(sessionB, 'What is the security deposit?', { document_id: parsedB.document_id });
  const chunkTextB = chunksForB.map(c => `[${c.clause_title || c.title}]: ${c.text}`).join('\n\n');
  const promptB = `DOCUMENT ID: ${parsedB.document_id}\nDOCUMENT CHUNKS:\n${chunkTextB}\n\nUSER QUESTION:\nWhat is the security deposit?`;
  
  const ansB = await generateLLMResponse({ prompt: promptB });
  assert(ansB.includes('84,000'), `Test 1 Failed: Doc B deposit must be ₹84,000, got: ${ansB}`);
  assert(!ansB.includes('3,50,000'), `Test 1 Failed: Contamination! Doc B response contained Doc A deposit ₹3,50,000.`);
  console.log('✓ Test 1 Passed: No cross-document contamination (Returned ₹84,000 for Doc B)');

  // --- Test 2: Missing Information Handling ---
  const chunksForC = ragStore.search(sessionC, 'What is the lock-in period?', { document_id: parsedC.document_id });
  const chunkTextC = chunksForC.map(c => `[${c.clause_title || c.title}]: ${c.text}`).join('\n\n');
  const promptC = `DOCUMENT ID: ${parsedC.document_id}\nDOCUMENT CHUNKS:\n${chunkTextC}\n\nUSER QUESTION:\nWhat is the lock-in period?`;
  
  const ansC = await generateLLMResponse({ prompt: promptC });
  assert(ansC.toLowerCase().includes('not explicitly stated') || ansC.toLowerCase().includes('insufficient'), `Test 2 Failed: Unstated lock-in must return unstated warning, got: ${ansC}`);
  console.log('✓ Test 2 Passed: Missing information handling (Returned explicit unstated warning)');

  // --- Test 3: Negative Clause Awareness ("no lock-in") ---
  const chunksNegLock = ragStore.search(sessionB, 'What is the lock-in period?', { document_id: parsedB.document_id });
  const chunkTextNegLock = chunksNegLock.map(c => `[${c.clause_title || c.title}]: ${c.text}`).join('\n\n');
  const promptNegLock = `DOCUMENT ID: ${parsedB.document_id}\nDOCUMENT CHUNKS:\n${chunkTextNegLock}\n\nUSER QUESTION:\nWhat is the lock-in period?`;

  const ansNegLock = await generateLLMResponse({ prompt: promptNegLock });
  assert(ansNegLock.toLowerCase().includes('no lock-in'), `Test 3 Failed: Must recognize "no lock-in", got: ${ansNegLock}`);
  console.log('✓ Test 3 Passed: Negative clause recognition ("no lock-in period")');

  // --- Test 4: Automatic Deduction Detection ("no fixed painting fee") ---
  const chunksPainting = ragStore.search(sessionB, 'Is there an automatic painting deduction?', { document_id: parsedB.document_id });
  const chunkTextPainting = chunksPainting.map(c => `[${c.clause_title || c.title}]: ${c.text}`).join('\n\n');
  const promptPainting = `DOCUMENT ID: ${parsedB.document_id}\nDOCUMENT CHUNKS:\n${chunkTextPainting}\n\nUSER QUESTION:\nIs there an automatic painting deduction?`;

  const ansPainting = await generateLLMResponse({ prompt: promptPainting });
  assert(ansPainting.toLowerCase().includes('no automatic painting deduction') || ansPainting.toLowerCase().includes('not be charged'), `Test 4 Failed: Must recognize no automatic deduction, got: ${ansPainting}`);
  console.log('✓ Test 4 Passed: Automatic deduction detection ("no automatic painting deduction")');

  // --- Test 5: Exact Amount Retrieval ---
  assert.strictEqual(parsedB.extractedFacts.security_deposit, 'INR 84,000', `Test 5 Failed: Fact extraction deposit mismatch.`);
  console.log('✓ Test 5 Passed: Exact amount extraction (INR 84,000)');

  // --- Test 6: Tenant vs Landlord Notice Period Distinction ---
  assert.strictEqual(parsedB.extractedFacts.tenant_notice_period, '45 days', `Test 6 Failed: Tenant notice period mismatch.`);
  assert.strictEqual(parsedB.extractedFacts.landlord_notice_period, '60 days', `Test 6 Failed: Landlord notice period mismatch.`);
  console.log('✓ Test 6 Passed: Notice period distinction (Tenant: 45 days, Landlord: 60 days)');

  // --- Test 7: Citation Accuracy & Verification ---
  const citationsB = chunksForB.map(c => c.chunk_id);
  assert(citationsB.every(id => id.startsWith(parsedB.document_id)), `Test 7 Failed: Citations must strictly belong to active document_id.`);
  console.log('✓ Test 7 Passed: Citation accuracy & document_id boundary verification');

  // --- Test 8: Cross-Document Switching ---
  // Query Session A
  const chunksA = ragStore.search(sessionA, 'What is the security deposit?', { document_id: parsedA.document_id });
  const chunkTextA = chunksA.map(c => `[${c.clause_title || c.title}]: ${c.text}`).join('\n\n');
  const ansA = await generateLLMResponse({ prompt: `DOCUMENT ID: ${parsedA.document_id}\nDOCUMENT CHUNKS:\n${chunkTextA}\n\nUSER QUESTION:\nWhat is the security deposit?` });
  assert(ansA.includes('3,50,000') || ansA.includes('350,000') || ansA.includes('3.5'), `Test 8 (Doc A) Failed: Expected 3,50,000 for Doc A, got: ${ansA}`);

  // Switch to Session B
  const ansBSwitch = await generateLLMResponse({ prompt: promptB });
  assert(ansBSwitch.includes('84,000') && !ansBSwitch.includes('3,50,000'), `Test 8 (Doc B Switch) Failed: Context leaked upon switching.`);
  console.log('✓ Test 8 Passed: Cross-document switching (Doc A → Doc B answers updated dynamically)');

  console.log('\n✅ ALL 8 RAG EVALUATION & DOCUMENT ISOLATION TESTS PASSED CLEANLY!\n');
}

runEvaluationTests().catch(err => {
  console.error('❌ RAG Evaluation Test Failure:', err);
  process.exit(1);
});
