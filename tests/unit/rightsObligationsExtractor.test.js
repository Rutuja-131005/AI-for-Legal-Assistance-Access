import { describe, it, expect } from 'vitest';
import { extractRightsAndObligations } from '../../server/services/rightsObligationsExtractor.js';

describe('rightsObligationsExtractor Service', () => {
  it('extracts tenant rights, obligations, and restrictions from clause array', () => {
    const clauses = [
      {
        id: 'c1',
        index: 0,
        title: 'RENT',
        category: 'financial',
        text: 'Tenant shall pay monthly rent of $2,000.',
        riskLevel: 'standard'
      },
      {
        id: 'c2',
        index: 1,
        title: 'RESTRICTIONS',
        category: 'restrictions',
        text: 'Tenant shall not have overnight guests exceeding 3 days.',
        riskLevel: 'warning'
      }
    ];

    const items = extractRightsAndObligations(clauses, 'residential_lease');
    expect(items.length).toBeGreaterThan(0);

    const obligation = items.find(i => i.type === 'obligation');
    expect(obligation).toBeDefined();
    expect(obligation.party).toBe('Tenant');

    const restriction = items.find(i => i.type === 'restriction');
    expect(restriction).toBeDefined();
    expect(restriction.party).toBe('Tenant');
  });
});
