import React from 'react';
import { 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  RotateCw, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ContractAnalysis } from '../types';

interface ExecutiveSummaryCardProps {
  analysis: ContractAnalysis;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({ analysis }) => {
  const { keyEntities, missingStandardProtections } = analysis;

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              {analysis.categoryDisplayName}
            </span>
            <span className="text-xs text-stone-400">
              {analysis.wordCount} words • {analysis.clauses.length} clauses analyzed
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            {analysis.documentTitle}
          </h1>
        </div>
      </div>

      {/* Executive Plain Language Summary */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-stone-600" />
          <span>Plain-Language Executive Summary (ELIF)</span>
        </h3>
        <p className="text-sm text-stone-700 leading-relaxed font-sans bg-stone-50/70 p-4 rounded-xl border border-stone-200/60">
          {analysis.executiveSummary}
        </p>
      </div>

      {/* Key Entities & Contract Parameters Grid */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
          Key Contract Terms at a Glance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Parties */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1 font-medium">
              <Users className="w-3.5 h-3.5 text-stone-600" />
              <span>Parties</span>
            </div>
            <div className="text-xs font-semibold text-stone-900 space-y-0.5">
              {keyEntities.parties.map((p, i) => (
                <div key={i} className="truncate">
                  <span className="text-stone-500 font-normal">{p.role}: </span>
                  {p.name}
                </div>
              ))}
            </div>
          </div>

          {/* Financial Obligation */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-stone-600" />
              <span>Financial Commitments</span>
            </div>
            <div className="text-xs font-semibold text-stone-900">
              {keyEntities.totalFinancialCommitment || 'Refer to individual fee clauses'}
            </div>
          </div>

          {/* Renewal Mechanism */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1 font-medium">
              <RotateCw className="w-3.5 h-3.5 text-stone-600" />
              <span>Renewal Type</span>
            </div>
            <div className="text-xs font-semibold text-stone-900">
              {keyEntities.renewalTerms || 'Standard expiration'}
            </div>
          </div>

          {/* Notice Period */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-stone-600" />
              <span>Exit Notice Period</span>
            </div>
            <div className="text-xs font-semibold text-stone-900">
              {keyEntities.noticePeriod || 'Standard 30 days'}
            </div>
          </div>
        </div>
      </div>

      {/* Missing Standard Protections Warning */}
      {missingStandardProtections && missingStandardProtections.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Missing Standard Legal Protections (What this contract omits)</span>
          </div>
          <p className="text-xs text-amber-800/90 leading-normal">
            Contracts often hide unfair terms through <em>omission</em>—failing to state statutory rights that protect consumers:
          </p>
          <ul className="space-y-1 pl-5 list-disc text-xs text-amber-900">
            {missingStandardProtections.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
