import assert from 'assert';
import { generateLLMResponse } from '../backend/services/llmClient.js';

console.log('--- Running Document Comparison Engine Unit Tests ---');

const comparePrompt = 'Compare document A and document B for tenancy agreements.';
const comparisonResult = await generateLLMResponse({
  prompt: comparePrompt,
  expectedJson: true
});

assert(comparisonResult.matrix !== undefined, 'Comparison output must contain comparison matrix');
assert(Array.isArray(comparisonResult.matrix), 'Matrix must be an array of parameter objects');
assert(comparisonResult.matrix.length >= 3, 'Matrix must contain at least 3 comparison parameters');
assert(comparisonResult.recommendation !== undefined, 'Comparison output must include a recommendation summary');

console.log('✓ Document Comparison Engine Unit Tests Passed!');
