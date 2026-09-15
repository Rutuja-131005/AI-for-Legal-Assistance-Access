import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Sparkles
} from 'lucide-react';
import { RedFlag } from '../types';

interface RedFlagsListProps {
  redFlags: RedFlag[];
  onJumpToClause?: (clauseId: string) => void;
  onSelectForNegotiation?: (flagId: string) => void;
}

export const RedFlagsList: React.FC<RedFlagsListProps> = ({
  redFlags,
  onJumpToClause,
  onSelectForNegotiation
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'advisory'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(redFlags[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFlags = redFlags.filter(flag => {
    if (filter === 'all') return true;
    return flag.riskLevel === filter;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span>Risk & Red Flag Detector</span>
            <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {redFlags.length} Identified
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Automated screening of predatory terms, fee traps, and unilateral waivers.
          </p>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({redFlags.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'critical' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-50'
            }`}
          >
            Critical ({redFlags.filter(f => f.riskLevel === 'critical').length})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              filter === 'warning' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            Warning ({redFlags.filter(f => f.riskLevel === 'warning').length})
          </button>
        </div>
      </div>

      {/* Flags List */}
      <div className="space-y-3">
        {filteredFlags.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No red flags in this severity tier.
          </div>
        ) : (
          filteredFlags.map(flag => {
            const isExpanded = expandedId === flag.id;
            const isCritical = flag.riskLevel === 'critical';

            return (
              <div
                key={flag.id}
                className={`rounded-xl border transition-all ${
                  isCritical
                    ? 'border-red-200/90 bg-red-50/20'
                    : 'border-amber-200/90 bg-amber-50/20'
                }`}
              >
                {/* Collapsed Header Bar */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : flag.id)}
                  className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shrink-0 mt-0.5 border ${
                        isCritical
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {flag.riskLevel}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        {flag.category}
                        <span className="text-xs font-normal text-stone-500">
                          • {flag.clauseTitle}
                        </span>
                      </h4>
                      <p className="text-xs text-stone-700 mt-1 line-clamp-1">
                        {flag.issue}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="text-stone-400 hover:text-stone-700 p-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-stone-200/60 space-y-3.5">
                    {/* Verbatim Document Quote */}
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center justify-between">
                        <span>Verbatim Contract Excerpt</span>
                        {onJumpToClause && (
                          <button
                            onClick={() => onJumpToClause(flag.clauseId)}
                            className="text-[11px] font-medium text-stone-700 hover:text-stone-900 flex items-center gap-1 hover:underline"
                          >
                            <span>Inspect in Reader</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <blockquote className="font-mono text-xs text-stone-800 bg-white p-3 rounded-lg border border-stone-200/80 leading-relaxed border-l-4 border-l-stone-900">
                        "{flag.verbatimQuote}"
                      </blockquote>
                    </div>

                    {/* Why this matters (Plain English) & Practical Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/60">
                        <strong className="block text-stone-900 mb-1">
                          Why this matters to you:
                        </strong>
                        <p className="text-stone-600 leading-relaxed">
                          {flag.issue}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/60">
                        <strong className="block text-stone-900 mb-1">
                          Real-World Impact:
                        </strong>
                        <p className="text-stone-600 leading-relaxed">
                          {flag.practicalImpact}
                        </p>
                      </div>
                    </div>

                    {/* Suggested Counter-Proposal / Redline */}
                    <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Recommended Redline / Counter-Proposal</span>
                        </div>
                        <button
                          onClick={() => handleCopy(flag.id, flag.counterProposal)}
                          className="px-2 py-0.5 text-[11px] font-medium text-emerald-800 hover:text-emerald-950 bg-white/80 hover:bg-white rounded border border-emerald-300 transition-colors flex items-center gap-1"
                        >
                          {copiedId === flag.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Redline</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs font-mono text-emerald-900 leading-relaxed">
                        {flag.counterProposal}
                      </p>
                    </div>

                    {/* Quick Negotiation Draft Hook */}
                    {onSelectForNegotiation && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => onSelectForNegotiation(flag.id)}
                          className="text-xs font-medium text-stone-700 hover:text-stone-950 flex items-center gap-1 hover:underline"
                        >
                          <span>Include in Negotiation Letter Draft →</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
