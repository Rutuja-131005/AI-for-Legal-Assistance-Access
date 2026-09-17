/**
 * Calculates a normalized Health Safety Score (0-100 scale), risk tier classification label,
 * and 4-axis category breakdown (Financial, Rights Protection, Exit Flexibility, Liability).
 * 
 * @param redFlags Array of identified contract red flags
 * @param clauses Array of segmented contract clauses
 * @returns RiskScoreResult containing score, label, and breakdown
 */
export function calculateRiskScore(redFlags = [], clauses = []) {
  const criticalCount = redFlags.filter(f => f.riskLevel === 'critical').length;
  const warningCount = redFlags.filter(f => f.riskLevel === 'warning').length;
  const advisoryCount = redFlags.filter(f => f.riskLevel === 'advisory').length;

  const clauseCriticals = clauses.filter(c => c.riskLevel === 'critical').length;
  const clauseWarnings = clauses.filter(c => c.riskLevel === 'warning').length;

  const totalDeductions = (criticalCount * 14) + (warningCount * 8) + (advisoryCount * 4) + (clauseCriticals * 5) + (clauseWarnings * 2);
  const overallRiskScore = Math.max(15, Math.min(100, Math.round(100 - totalDeductions)));

  let riskScoreLabel = 'Safe & Balanced';
  if (overallRiskScore < 45) riskScoreLabel = 'High-Risk Trap';
  else if (overallRiskScore < 70) riskScoreLabel = 'Significant Risks';
  else if (overallRiskScore < 85) riskScoreLabel = 'Moderate Caution';

  const financialFlags = redFlags.filter(f => /financial|fee|deposit|late|penalty|payment|cost/i.test(f.category + ' ' + f.issue)).length;
  const rightsFlags = redFlags.filter(f => /entry|privacy|ip|moonlighting|arbitration|rights/i.test(f.category + ' ' + f.issue)).length;
  const terminationFlags = redFlags.filter(f => /termination|evergreen|renew|cancel|vacate/i.test(f.category + ' ' + f.issue)).length;
  const liabilityFlags = redFlags.filter(f => /indemnif|liability|as-is|habitability|repair/i.test(f.category + ' ' + f.issue)).length;

  const riskBreakdown = {
    financial: Math.max(15, Math.min(100, 100 - (financialFlags * 18) - (criticalCount * 5))),
    rightsProtection: Math.max(15, Math.min(100, 100 - (rightsFlags * 18) - (criticalCount * 6))),
    terminationFlexibility: Math.max(15, Math.min(100, 100 - (terminationFlags * 18) - (warningCount * 8))),
    liabilityFairness: Math.max(15, Math.min(100, 100 - (liabilityFlags * 18) - (criticalCount * 5))),
  };

  return {
    overallRiskScore,
    riskScoreLabel,
    riskBreakdown
  };
}
