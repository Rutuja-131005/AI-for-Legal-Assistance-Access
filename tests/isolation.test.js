import assert from 'assert';
import { ragStore } from '../backend/services/ragEngine.js';

console.log('--- Running Session & Document Isolation Unit Suite ---');

// Setup Session A (Rental Agreement)
const sessionA = 'session-user-alpha';
ragStore.setDocument(sessionA, 'DOC_ALPHA', [
  { chunk_id: 'c1', title: '1. Rent', text: 'Monthly rent for Flat 402 is INR 45,000.' }
], 'Monthly rent for Flat 402 is INR 45,000.', 'Rental_Alpha.pdf');

// Setup Session B (Employment Contract)
const sessionB = 'session-user-beta';
ragStore.setDocument(sessionB, 'DOC_BETA', [
  { chunk_id: 'c2', title: '1. Salary', text: 'Fixed annual CTC is INR 24,00,000.' }
], 'Fixed annual CTC is INR 24,00,000.', 'Employment_Beta.pdf');

// Test 1: Session A search should NEVER return Session B chunks
const searchA = ragStore.search(sessionA, 'What is the salary or rent?');
assert(searchA.every(c => c.text.includes('45,000')), 'Session A search must strictly return Session A chunks only');
assert(!searchA.some(c => c.text.includes('24,00,000')), 'Session A must NOT leak Session B employment data');

// Test 2: Session B search should NEVER return Session A chunks
const searchB = ragStore.search(sessionB, 'What is the monthly rent?');
assert(searchB.every(c => c.text.includes('24,00,000')), 'Session B search must strictly return Session B chunks only');
assert(!searchB.some(c => c.text.includes('Flat 402')), 'Session B must NOT leak Session A rental data');

console.log('✓ All Session & Document Isolation Tests Passed!');
