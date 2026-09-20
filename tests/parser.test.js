import assert from 'assert';
import { cleanAndChunkText } from '../backend/services/docParser.js';

console.log('--- Running Expanded Document Parser Unit Tests ---');

// Test 1: Standard Document Chunking
const sampleText = `
1. PREMISES AND TERM
1.1 Landlord leases flat to tenant.
1.2 LOCK-IN PERIOD: Mandatory 6 months lock-in period.

2. RENT AND SECURITY DEPOSIT
2.1 Monthly rent is 35,000 INR.
2.2 Security deposit is 3,50,000 INR.
`;

const chunks = cleanAndChunkText(sampleText);
assert(chunks.length >= 2, 'Should detect at least 2 clauses');
assert(chunks[0].title.includes('PREMISES') || chunks[0].title.includes('1.'), 'First chunk should be Clause 1');

// Test 2: Edge Case - Empty Document
const emptyChunks = cleanAndChunkText('');
assert(Array.isArray(emptyChunks), 'Empty input should return empty array');
assert.strictEqual(emptyChunks.length, 0, 'Empty text should result in 0 chunks');

// Test 3: Edge Case - Oversized Document (50KB)
const hugeText = '1. CLAUSE HEADER\n' + 'Sample legal terms line for contract verification.\n'.repeat(1500);
const hugeChunks = cleanAndChunkText(hugeText);
assert(hugeChunks.length > 0, 'Oversized text should be chunked without crashing');

// Test 4: Edge Case - Malformed Text without Section Numbers
const malformedText = 'Unstructured legal text without explicit clause numbers. Paragraph one goes here. Paragraph two follows with details.';
const malformedChunks = cleanAndChunkText(malformedText);
assert(malformedChunks.length > 0, 'Malformed text should produce at least 1 fallback chunk');

// Test 5: Edge Case - Non-English / Multilingual Text
const hindiText = `
1. किराया और सुरक्षा जमा (RENT AND DEPOSIT)
1.1 मासिक किराया INR 35,000 प्रति माह होगा।
1.2 सुरक्षा जमा INR 3,50,000 होगी जो वापसी योग्य है।
`;
const hindiChunks = cleanAndChunkText(hindiText);
assert(hindiChunks.length > 0, 'Multilingual non-English text should be parsed successfully');

console.log('✓ Document Parser Unit Tests (5/5 Edge Cases) Passed!');
