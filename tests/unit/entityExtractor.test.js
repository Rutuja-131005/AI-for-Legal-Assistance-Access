import { describe, it, expect } from 'vitest';
import { extractEntities } from '../../server/services/entityExtractor.js';

describe('entityExtractor Service', () => {
  it('extracts party names and roles correctly from lease preamble', () => {
    const text = 'This agreement is by and between Skyline Holdings LLC ("Landlord"), and Riya Sharma ("Tenant"). Dated this October 1, 2024. Rent of $2,450. 30 days notice.';
    const entities = extractEntities(text, 'residential_lease');

    expect(entities.parties.length).toBe(2);
    expect(entities.parties[0].name).toBe('Skyline Holdings LLC');
    expect(entities.parties[0].role).toBe('Landlord');
    expect(entities.parties[1].name).toBe('Riya Sharma');
    expect(entities.parties[1].role).toBe('Tenant');
    expect(entities.noticePeriod).toBe('30 Days Notice');
  });

  it('returns Not detected instead of hardcoded sample names when parties cannot be parsed', () => {
    const text = 'Arbitrary contract without party preambles.';
    const entities = extractEntities(text, 'residential_lease');

    expect(entities.parties[0].name).toBe('Not detected');
    expect(entities.parties[1].name).toBe('Not detected');
  });
});
