import assert from 'assert';
import { cleanAndChunkText } from '../backend/services/docParser.js';

console.log('--- Running Document Parser Unit Tests ---');

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

console.log('✓ Document Parser Tests Passed!');
