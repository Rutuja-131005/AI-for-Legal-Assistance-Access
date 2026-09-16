import { Clause } from '../../src/types';

/**
 * Segment raw contract text into structured clauses.
 */
export function segmentClauses(text: string): Clause[] {
  const lines = text.split('\n');
  const clauses: Clause[] = [];

  const clauseHeaderRegex = /^(?:\d+(?:\.\d+)?[.)\]]?\s*|(?:ARTICLE|SECTION|CLAUSE)\s+[IVX\d]+(?:\.\d+)?)/i;

  let currentTitle = 'Introduction / Preamble';
  let currentLines: string[] = [];
  let clauseIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentLines.length > 0) currentLines.push('');
      continue;
    }

    const match = trimmed.match(clauseHeaderRegex);
    const isAllCapsHeader = trimmed.length < 60 && trimmed === trimmed.toUpperCase() && /^[A-Z0-9\s,.\-:]+$/.test(trimmed) && /[A-Z]{3,}/.test(trimmed);

    if (match || isAllCapsHeader) {
      if (currentLines.length > 0 && trimmed.length < 80) {
        const fullClauseText = currentLines.join('\n').trim();
        if (fullClauseText.length > 20) {
          clauses.push(buildClauseObject(clauseIndex++, currentTitle, fullClauseText));
        }
        currentTitle = trimmed;
        currentLines = [];
      } else if (currentLines.length === 0 && trimmed.length < 80) {
        currentTitle = trimmed;
      } else {
        currentLines.push(trimmed);
      }
    } else {
      currentLines.push(trimmed);
    }
  }

  if (currentLines.length > 0) {
    const fullClauseText = currentLines.join('\n').trim();
    if (fullClauseText.length > 10) {
      clauses.push(buildClauseObject(clauseIndex, currentTitle, fullClauseText));
    }
  }

  if (clauses.length === 0 && text.trim().length > 0) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    if (paragraphs.length > 0) {
      paragraphs.forEach((p, idx) => {
        const firstLine = p.split('\n')[0].substring(0, 40);
        clauses.push(buildClauseObject(idx, `Section ${idx + 1}: ${firstLine}`, p.trim()));
      });
    } else {
      clauses.push(buildClauseObject(0, 'Full Document Terms', text.trim()));
    }
  }

  return clauses;
}

function categorizeClause(title: string, text: string): Clause['category'] {
  const combined = (title + ' ' + text).toLowerCase();
  if (/rent|fee|deposit|payment|invoice|cost|charges|financial|price|billing/i.test(combined)) return 'financial';
  if (/terminat|cancel|vacat|surrender|expire|renew|notice period/i.test(combined)) return 'termination';
  if (/liabilit|indemnif|hold harmless|damage|fault|warrant|breach/i.test(combined)) return 'liability';
  if (/privacy|data|personal information|confidential|ip|intellectual property|invention|work product/i.test(combined)) return 'privacy';
  if (/restrict|prohibit|exclusive|non-compete|non-solicit|moonlighting|guest|occupan/i.test(combined)) return 'restrictions';
  if (/governing law|jurisdiction|arbitrat|dispute|court|jury/i.test(combined)) return 'governing_law';
  return 'general';
}

function buildClauseObject(index: number, title: string, text: string): Clause {
  const category = categorizeClause(title, text);
  const id = `clause-${index + 1}`;
  const lowerText = text.toLowerCase();

  let riskLevel: Clause['riskLevel'] = 'standard';
  let riskReason = '';
  let suggestedRevision = '';

  if (
    /without(?:\s+prior)?\s+(?:oral\s+or\s+written\s+)?notice/i.test(lowerText) ||
    /at\s+any\s+time[,\s]+day\s+or\s+night/i.test(lowerText) ||
    /non-refundable(?:\s+.*fee)?/i.test(lowerText) ||
    /unlimited\s+liability/i.test(lowerText) ||
    /irrevocably\s+transfers/i.test(lowerText) ||
    /liquidated\s+damages.*\$[0-9,]+/i.test(lowerText)
  ) {
    riskLevel = 'critical';
    riskReason = 'Contains one-sided terms granting unchecked authority or excessive penalties.';
    suggestedRevision = 'Request mutual notice periods and reasonable caps on fees or liabilities.';
  } else if (
    /late\s+fee|mandatory\s+arbitration|automatic(?:ally)?\s+renew|net-90|as\s+is\b|waives?\s+all\s+rights/i.test(lowerText)
  ) {
    riskLevel = 'warning';
    riskReason = 'Imposes restrictive burdens or waives standard consumer protections.';
    suggestedRevision = 'Negotiate standard commercial terms, grace periods, or mutual remedies.';
  }

  return {
    id,
    index,
    title,
    category,
    text,
    riskLevel,
    riskReason,
    suggestedRevision,
  };
}
