import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  CheckCircle2,
  BookOpen,
  Check,
  Copy,
  Sparkles
} from 'lucide-react';

const ClauseExplorerComponent = ({
  clauses = [],
  activeClauseId,
  onSelectClause
}) => {
  const [selectedId, setSelectedId] = useState(activeClauseId || clauses[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const activeReaderRef = useRef(null);

  useEffect(() => {
    if (activeClauseId) {
      setSelectedId(activeClauseId);
      activeReaderRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeClauseId]);

  const filteredClauses = React.useMemo(() => {
    return clauses.filter(c => {
      const matchesSearch = (c.title + ' ' + c.text).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [clauses, searchQuery, categoryFilter]);

  const activeClause = React.useMemo(() => {
    return clauses.find(c => c.id === selectedId) || clauses[0];
  }, [clauses, selectedId]);

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { id: 'all', label: 'All Clauses' },
    { id: 'financial', label: 'Financial / Rent' },
    { id: 'termination', label: 'Exit / Renewal' },
    { id: 'liability', label: 'Liability & Indemnity' },
    { id: 'restrictions', label: 'Restrictions' },
    { id: 'privacy', label: 'IP & Privacy' },
    { id: 'governing_law', label: 'Disputes' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
      {/* Header Search & Filter Bar */}
      <div className="p-4 border-b border-stone-200 bg-stone-50/70 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-stone-700" />
              <span>Interactive Clause Explorer</span>
            </h2>
            <p className="text-xs text-stone-500">
              Select any section to inspect verbatim text, risk ratings, and plain-English translations.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <label htmlFor="clause-search-input" className="sr-only">Search clauses or keywords</label>
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="clause-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search clauses or keywords..."
              aria-label="Search clauses or keywords"
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Clause Categories">
          {categories.map(cat => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={categoryFilter === cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 ${
                categoryFilter === cat.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Split View: Directory (Left) + Detailed Reader (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* Left: Clause List */}
        <div className="lg:col-span-4 border-r border-stone-200 max-h-[560px] overflow-y-auto divide-y divide-stone-100" role="listbox" aria-label="Contract Clauses">
          {filteredClauses.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No matching clauses found.
            </div>
          ) : (
            filteredClauses.map(clause => {
              const isSelected = clause.id === selectedId;
              const isCritical = clause.riskLevel === 'critical';
              const isWarning = clause.riskLevel === 'warning';

              return (
                <div
                  key={clause.id}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => {
                    setSelectedId(clause.id);
                    onSelectClause?.(clause.id);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(clause.id);
                      onSelectClause?.(clause.id);
                    }
                  }}
                  className={`p-3.5 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 ${
                    isSelected
                      ? 'bg-stone-100/90 border-l-4 border-l-stone-900'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono text-stone-600 uppercase font-semibold">
                      {clause.category}
                    </span>
                    {isCritical && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase">
                        Critical
                      </span>
                    )}
                    {isWarning && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                        Caution
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                    {clause.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">
                    {clause.text}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Active Clause Deep Inspection */}
        <div ref={activeReaderRef} className="lg:col-span-8 p-6 max-h-[560px] overflow-y-auto space-y-4">
          {activeClause ? (
            <>
              {/* Active Clause Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600">
                      {activeClause.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        activeClause.riskLevel === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : activeClause.riskLevel === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {activeClause.riskLevel === 'standard' ? 'Standard Terms' : `${activeClause.riskLevel} Risk`}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {activeClause.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopyText(activeClause.text)}
                  className="px-3 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Copy Clause</span>
                    </>
                  )}
                </button>
              </div>

              {/* Plain English Translation Card */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Simple Explanation ("In Plain Language")</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  {activeClause.riskReason || 
                    `This clause outlines standard responsibilities relating to ${activeClause.category}. It establishes procedural timelines and binding conditions.`}
                </p>
              </div>

              {/* Neutral Verification Checklist: What You Should Check */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2 text-xs">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>What You Should Check (Neutral Verification Checklist)</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-amber-900 font-sans">
                  <li>Verify if written notice deadlines align with local consumer laws.</li>
                  <li>Confirm whether financial penalties or fees have grace periods.</li>
                  <li>Check if obligations apply equally to both parties (mutual protection).</li>
                </ul>
              </div>

              {/* Suggested Fairer Counter-Revision if Risky */}
              {activeClause.suggestedRevision && (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Suggested Consumer-Friendly Modification</span>
                  </div>
                  <p className="text-xs font-mono text-emerald-900 leading-relaxed">
                    {activeClause.suggestedRevision}
                  </p>
                </div>
              )}

              {/* Verbatim Contract Text */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Verbatim Contract Text
                </div>
                <div className="p-4 rounded-xl bg-stone-900 text-stone-100 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-amber-400 selection:text-stone-900 border border-stone-800">
                  {activeClause.text}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-stone-500">
              Select a clause from the left to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ClauseExplorer = React.memo(ClauseExplorerComponent);
