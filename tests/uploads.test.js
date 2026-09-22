import assert from 'assert';
import { validateMagicBytes, sanitizeFilename } from '../backend/middleware/securityMiddleware.js';
import { parseDocument } from '../backend/services/docParser.js';

console.log('--- Running Edge Case & Upload Validation Suite ---');

// Test 1: Disguised Executable (.exe buffer with .pdf extension) Rejection
const exeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00');
assert(!validateMagicBytes(exeBuffer, 'malicious.pdf'), 'Executable file disguised as PDF should be rejected by signature validator');

// Test 2: Corrupted PDF Header
const corruptPdf = Buffer.from('CORRUPT_HEADER_BYTE_STREAM');
assert(!validateMagicBytes(corruptPdf, 'broken.pdf'), 'Corrupted PDF without %PDF header must fail signature check');

// Test 3: Corrupted DOCX Header
const corruptDocx = Buffer.from('CORRUPT_DOCX_HEADER_BYTE_STREAM');
assert(!validateMagicBytes(corruptDocx, 'broken.docx'), 'Corrupted DOCX without PK header must fail signature check');

// Test 4: Empty Upload Handling
async function testEmptyDocument() {
  const result = await parseDocument(Buffer.from(''), 'text/plain', 'empty.txt');
  assert(result.fullText !== undefined && Array.isArray(result.chunks), 'Parser should handle empty/whitespace documents gracefully without crashing');
}
await testEmptyDocument();

// Test 5: Oversized Text Safety
const oversizedText = 'A'.repeat(1 * 1024 * 1024); // 1MB
async function testOversizedDocument() {
  const result = await parseDocument(Buffer.from(oversizedText), 'text/plain', 'large.txt');
  assert(result.fullText.length > 0, 'Parser should safely parse and chunk large documents');
}
await testOversizedDocument();

console.log('✓ All Edge Case & Upload Validation Tests Passed!');
