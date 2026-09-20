import assert from 'assert';
import { cleanAndChunkText } from '../backend/services/docParser.js';
import { neutralizeUnicode, validateMagicBytes, sanitizeFilename } from '../backend/middleware/securityMiddleware.js';

console.log('--- Running Ingestion & Document Parser Unit Tests ---');

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

// Test 2: Unicode & Bidi Neutralization
const maliciousUnicode = 'Legal\u200BText\u202AWith\u202EBidi\uFEFFOverrides';
const cleanedUnicode = neutralizeUnicode(maliciousUnicode);
assert.strictEqual(cleanedUnicode, 'LegalTextWithBidiOverrides', 'Should strip zero-width and bidi override characters');

// Test 3: Magic Bytes Upload Validation
const pdfHeader = Buffer.from('%PDF-1.4 header text');
assert(validateMagicBytes(pdfHeader, 'agreement.pdf'), 'PDF magic bytes should be valid');

const invalidPdf = Buffer.from('NOT_A_PDF_HEADER');
assert(!validateMagicBytes(invalidPdf, 'fake.pdf'), 'Invalid magic bytes should fail validation');

// Test 4: Filename Sanitization
const dangerousFilename = '../../etc/passwd\0malicious<script>.pdf';
const safeFilename = sanitizeFilename(dangerousFilename);
assert(!safeFilename.includes('..'), 'Should strip path traversal characters');
assert(!safeFilename.includes('<script>'), 'Should neutralize HTML script tags in filename');

// Test 5: Edge Case - Empty Document
const emptyChunks = cleanAndChunkText('');
assert.strictEqual(emptyChunks.length, 0, 'Empty text should result in 0 chunks');

// Test 6: Edge Case - Oversized Document (50KB)
const hugeText = '1. CLAUSE HEADER\n' + 'Sample legal terms line for contract verification.\n'.repeat(1500);
const hugeChunks = cleanAndChunkText(hugeText);
assert(hugeChunks.length > 0, 'Oversized text should be chunked without crashing');

console.log('✓ Ingestion Unit Tests Passed!');
