import React from 'react';
import { 
  FileText, 
  UploadCloud, 
  ShieldCheck, 
  BookOpen, 
  FileDiff, 
  Mail, 
  Download, 
  Sparkles,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts';
import { ContractAnalysis } from '../types';

interface HeaderProps {
  activeTab: 'overview' | 'clauses' | 'qa' | 'compare' | 'negotiate';
  setActiveTab: (tab: 'overview' | 'clauses' | 'qa' | 'compare' | 'negotiate') => void;
  analysis: ContractAnalysis | null;
  onOpenUpload: () => void;
  onSelectSample: (sampleId: string) => void;
  onOpenGlossary: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  analysis,
  onOpenUpload,
  onSelectSample,
  onOpenGlossary,
  onOpenExport
}) => {
  return (
    <header className="border-b border-stone-200 bg-stone-50/95 sticky top-0 z-40 backdrop-blur-sm">
      {/* Regulatory & Safety Ethics Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-1.5 mx-auto text-center font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            <strong>Legal Literacy Notice:</strong> ClariLex provides AI-powered document analysis and plain-language education, not legal counsel or formal legal advice.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-stone-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero Retention: In-memory session only</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-serif text-2xl font-bold shadow-sm ring-1 ring-stone-900/10">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
                  ClariLex
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200 text-stone-700 tracking-wide uppercase">
                  Consumer Navigator
                </span>
              </div>
              <p className="text-xs text-stone-500 font-sans hidden sm:block">
                Demystifying legal contracts • Plain English • Grounded risk flags
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Quick Sample Selector */}
            <div className="relative group hidden lg:block">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Sample Contracts</span>
              </button>
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-stone-200 py-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Select a test contract
                </div>
                {SAMPLE_CONTRACTS.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => onSelectSample(sample.id)}
                    className="w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors text-xs text-stone-800 flex flex-col gap-0.5"
                  >
                    <span className="font-medium text-stone-900">{sample.title}</span>
                    <span className="text-[11px] text-amber-700">{sample.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Glossary Button */}
            <button
              onClick={onOpenGlossary}
              className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1.5"
              title="Legal Jargon Explainer"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Legal Glossary</span>
            </button>

            {/* Export Analysis */}
            {analysis && (
              <button
                onClick={onOpenExport}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1.5"
                title="Download Analysis Report"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Export Report</span>
              </button>
            )}

            {/* Upload New Document */}
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (When Document is loaded) */}
        {analysis && (
          <nav className="flex space-x-1 border-t border-stone-200/80 pt-1 pb-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="Analysis Sections">
            <button
              role="tab"
              aria-selected={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                activeTab === 'overview'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Overview & Red Flags</span>
              {analysis.redFlags.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'overview' ? 'bg-amber-500 text-stone-950' : 'bg-red-100 text-red-700'
                }`}>
                  {analysis.redFlags.length}
                </span>
              )}
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'clauses'}
              onClick={() => setActiveTab('clauses')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                activeTab === 'clauses'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Clause Explorer</span>
              <span className="text-[10px] opacity-70">({analysis.clauses.length})</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'qa'}
              onClick={() => setActiveTab('qa')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                activeTab === 'qa'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Grounded Q&A</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'compare'}
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                activeTab === 'compare'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileDiff className="w-3.5 h-3.5" />
              <span>Version Diff & Compare</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'negotiate'}
              onClick={() => setActiveTab('negotiate')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-stone-900 ${
                activeTab === 'negotiate'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Negotiation Drafter</span>
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};
