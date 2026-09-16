import { DocumentCategory, RedFlag, Clause } from '../../src/types';

export interface EntitiesData {
  parties: { name: string; role: string }[];
  effectiveDate?: string;
  totalFinancialCommitment?: string;
  renewalTerms?: string;
  noticePeriod?: string;
  jurisdiction?: string;
}

/**
 * Generate a dynamic plain-English executive summary based strictly on document analysis results.
 * NEVER hardcodes fake sample text — all references use extracted party names and detected flags.
 */
export function generateExecutiveSummary(
  category: DocumentCategory,
  categoryDisplayName: string,
  entities: EntitiesData,
  redFlags: RedFlag[],
  clauses: Clause[]
): string {
  const party1 = entities.parties[0]?.name || 'the first party';
  const party2 = entities.parties[1]?.name || 'the second party';

  const criticalFlags = redFlags.filter(f => f.riskLevel === 'critical');
  const warningFlags = redFlags.filter(f => f.riskLevel === 'warning');

  let summary = `This ${categoryDisplayName.toLowerCase()} governs the relationship between ${party1} (${entities.parties[0]?.role || 'Party A'}) and ${party2} (${entities.parties[1]?.role || 'Party B'}). `;

  if (redFlags.length === 0) {
    summary += `Our automated analysis found standard, well-balanced terms across all ${clauses.length} clauses analyzed, with no critical red flags detected.`;
  } else {
    summary += `Our automated analysis flagged ${redFlags.length} primary area(s) of potential concern (${criticalFlags.length} critical, ${warningFlags.length} warning). `;
    
    const keyIssues = redFlags.slice(0, 3).map(f => f.category).join(', ');
    summary += `Key areas requiring review include: ${keyIssues}. `;

    if (criticalFlags.length > 0) {
      summary += `Specifically, critical issues were identified regarding ${criticalFlags[0].category.toLowerCase()}: "${criticalFlags[0].issue}". `;
    }

    if (entities.noticePeriod && entities.noticePeriod !== 'Not specified') {
      summary += `The agreement specifies a notice requirement of ${entities.noticePeriod}. `;
    }

    summary += `Reviewing and negotiating these terms before signing is strongly recommended.`;
  }

  return summary;
}
