import React from 'react';
import { ContractAnalysis } from '../types';

interface RiskScoreCardProps {
  analysis: ContractAnalysis;
}

const RiskScoreCardComponent: React.FC<RiskScoreCardProps> = ({ analysis }) => {
  const score = analysis.overallRiskScore;
  const criticalCount = analysis.redFlags.filter(f => f.riskLevel === 'critical').length;
  const warningCount = analysis.redFlags.filter(f => f.riskLevel === 'warning').length;

  // Determine color theme based on score (100 is safest, 0 is most predatory)
  let badgeClass = 'bg-red-100 text-red-800 border-red-300';
  let barColor = 'bg-red-500';

  if (score >= 80) {
    badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    barColor = 'bg-emerald-500';
  } else if (score >= 60) {
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    barColor = 'bg-amber-500';
  } else if (score >= 40) {
    badgeClass = 'bg-orange-100 text-orange-800 border-orange-300';
    barColor = 'bg-orange-500';
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Consumer Safety Health Score
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
            {analysis.riskScoreLabel}
          </span>
        </div>

        {/* Large Score Indicator */}
        <div className="flex items-baseline gap-3 my-2">
          <span className="font-serif text-5xl font-black text-stone-900 tracking-tight">
            {score}
          </span>
          <span className="text-sm font-medium text-stone-400">/ 100</span>
          <div className="ml-auto text-right">
            <span className="text-xs font-semibold text-stone-600 block">
              {criticalCount} Critical • {warningCount} Warning
            </span>
            <span className="text-[11px] text-stone-400">
              {analysis.redFlags.length} total clauses of concern
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden my-3">
          <div 
            className={`h-full ${barColor} transition-all duration-700 rounded-full`} 
            style={{ width: `${score}%` }} 
          />
        </div>
      </div>

      {/* Subscores Breakdown */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-xs">
        <div>
          <div className="flex justify-between text-[11px] text-stone-500 mb-1">
            <span>Financial Terms</span>
            <span className="font-semibold text-stone-800">{analysis.riskBreakdown.financial}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-stone-800 rounded-full" 
              style={{ width: `${analysis.riskBreakdown.financial}%` }} 
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-stone-500 mb-1">
            <span>Rights & Privacy</span>
            <span className="font-semibold text-stone-800">{analysis.riskBreakdown.rightsProtection}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-stone-800 rounded-full" 
              style={{ width: `${analysis.riskBreakdown.rightsProtection}%` }} 
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-stone-500 mb-1">
            <span>Exit / Termination</span>
            <span className="font-semibold text-stone-800">{analysis.riskBreakdown.terminationFlexibility}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-stone-800 rounded-full" 
              style={{ width: `${analysis.riskBreakdown.terminationFlexibility}%` }} 
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-stone-500 mb-1">
            <span>Liability Fairness</span>
            <span className="font-semibold text-stone-800">{analysis.riskBreakdown.liabilityFairness}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-stone-800 rounded-full" 
              style={{ width: `${analysis.riskBreakdown.liabilityFairness}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const RiskScoreCard = React.memo(RiskScoreCardComponent);
