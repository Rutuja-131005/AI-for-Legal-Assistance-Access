import React, { useState } from 'react';
import { 
  FileDiff, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { ContractAnalysis, DocumentComparisonResult } from '../types';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';

interface DocumentComparisonViewProps {
  currentAnalysis: ContractAnalysis;
}

export const DocumentComparisonView: React.FC<DocumentComparisonViewProps> = ({
  currentAnalysis
}) => {
  const sampleMatch = SAMPLE_CONTRACTS.find(s => s.category === currentAnalysis.category);
  const defaultCounter = sampleMatch?.counterOfferText || `AMENDED & BALANCED COUNTER-PROPOSAL\n\n1. REVISED TERMS\nParties agree to standard 30-day notice periods and mutual liability caps.\n\n2. DEPOSIT REFUNDABILITY\nAll security deposits shall be 100% refundable within 21 days less documented damages.\n\n3. NOTICE PRIOR TO ENTRY\n24 hours advance written notice required for all non-emergency entry.`;

  const [counterText, setCounterText] = useState(defaultCounter);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<DocumentComparisonResult | null>(null);

  // Run initial comparison if not run yet
  const handleRunComparison = async () => {
    setComparing(true);
    try {
      const response = await fetch('/api/compare-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc1Text: currentAnalysis.rawText,
          doc2Text: counterText,
          doc1Title: currentAnalysis.documentTitle,
          doc2Title: 'Revised Counter-Proposal'
        })
      });

      const data = await response.json();
      if (data.success) {
        setComparison(data.comparison);
      }
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-stone-100 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <FileDiff className="w-5 h-5 text-stone-700" />
            <span>Side-by-Side Contract Comparison & Diff</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Compare the original version against a revised counter-proposal or second draft to verify safety improvements.
          </p>
        </div>

        <button
          onClick={handleRunComparison}
          disabled={comparing}
          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          {comparing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Analyze Differences</span>
            </>
          )}
        </button>
      </div>

      {/* Comparison Results Card (if run) */}
      {comparison ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Safety Delta Metric Box */}
          <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="text-center md:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                Original Health Score
              </span>
              <span className="font-serif text-3xl font-bold text-red-600">
                {comparison.riskScore1} / 100
              </span>
              <span className="text-xs text-stone-500 block mt-0.5">High Risk Exposure</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-stone-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                Negotiation Safety Delta
              </span>
              <div className="flex items-center gap-1.5 text-xl font-bold text-emerald-600 font-serif">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>+{Math.max(0, comparison.safetyDelta)}% Safer</span>
              </div>
              <span className="text-[11px] text-stone-500 mt-0.5">Measurable Protection Gain</span>
            </div>

            <div className="text-center md:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                Revised Counter-Offer Score
              </span>
              <span className="font-serif text-3xl font-bold text-emerald-600">
                {comparison.riskScore2} / 100
              </span>
              <span className="text-xs text-stone-500 block mt-0.5">Consumer-Balanced</span>
            </div>
          </div>

          {/* Executive Summary of Changes */}
          <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
            <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Summary of Risk Reductions</span>
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed font-sans">
              {comparison.summaryOfChanges}
            </p>
          </div>

          {/* Key Negotiation Wins */}
          {comparison.negotiationWins.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Key Protections Won in Version 2</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {comparison.negotiationWins.map((win, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">✓</span>
                    <span>{win}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clause Diff Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Detailed Clause-by-Clause Comparison
            </h4>
            <div className="space-y-2.5">
              {comparison.clauseDiffs.map((diff, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{diff.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      diff.status === 'improved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : diff.status === 'removed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {diff.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {diff.explanation}
                  </p>
                  {diff.doc1Excerpt && diff.doc2Excerpt && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2 rounded bg-red-50/60 text-red-900 border border-red-200/60">
                        <span className="font-bold block text-[9px] uppercase tracking-wider text-red-700 mb-1">
                          Original Drafter Wording:
                        </span>
                        "{diff.doc1Excerpt}..."
                      </div>
                      <div className="p-2 rounded bg-emerald-50/60 text-emerald-900 border border-emerald-200/60">
                        <span className="font-bold block text-[9px] uppercase tracking-wider text-emerald-700 mb-1">
                          Revised Counter-Offer:
                        </span>
                        "{diff.doc2Excerpt}..."
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Side by Side Input Editor */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Doc 1 (Original) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">
                Version 1: Original Document (Active)
              </span>
              <span className="text-[11px] text-stone-400">
                {currentAnalysis.wordCount} words
              </span>
            </div>
            <textarea
              readOnly
              rows={12}
              value={currentAnalysis.rawText}
              className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 select-all cursor-text focus:outline-hidden"
            />
          </div>

          {/* Doc 2 (Counter-Offer / Revised) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700">
                Version 2: Counter-Proposal or Revised Draft
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">
                Editable text below
              </span>
            </div>
            <textarea
              rows={12}
              value={counterText}
              onChange={e => setCounterText(e.target.value)}
              placeholder="Paste counter-proposal text or modify terms here to measure risk reduction..."
              className="w-full text-xs font-mono p-3 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-stone-900"
            />
          </div>
        </div>
      )}
    </div>
  );
};
