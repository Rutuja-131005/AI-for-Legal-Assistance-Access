import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { RiskScoreCard } from './components/RiskScoreCard';
import { ExecutiveSummaryCard } from './components/ExecutiveSummaryCard';
import { RedFlagsList } from './components/RedFlagsList';
import { RightsObligationsMatrix } from './components/RightsObligationsMatrix';
import { ClauseExplorer } from './components/ClauseExplorer';
import { GroundedQA } from './components/GroundedQA';
import { DocumentComparisonView } from './components/DocumentComparisonView';
import { NegotiationDrafterView } from './components/NegotiationDrafterView';
import { GlossaryModal } from './components/GlossaryModal';
import { ExportReportModal } from './components/ExportReportModal';
import { SAMPLE_CONTRACTS } from './data/sampleContracts';
import { ContractAnalysis } from './types';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'qa' | 'compare' | 'negotiate'>('overview');
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeClauseId, setActiveClauseId] = useState<string | undefined>(undefined);
  const [negotiationPreselectedFlag, setNegotiationPreselectedFlag] = useState<string | undefined>(undefined);

  // Load the initial residential lease sample on first mount
  useEffect(() => {
    handleSelectSample('residential-lease-trap');
  }, []);

  const handleSelectSample = async (sampleId: string) => {
    const sample = SAMPLE_CONTRACTS.find(s => s.id === sampleId);
    if (!sample) return;

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sample.rawText,
          filename: sample.title
        })
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to analyze sample contract:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeText = async (text: string, title?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          filename: title
        })
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setIsUploadOpen(false);
        setActiveTab('overview');
      }
    } catch (err) {
      console.error('Failed to analyze text:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeFile = async (file: File) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result;
        if (!result) return;

        const base64Data = typeof result === 'string'
          ? (result.split(',')[1] || result)
          : btoa(new Uint8Array(result).reduce((data, byte) => data + String.fromCharCode(byte), ''));

        const response = await fetch('/api/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: base64Data,
            filename: file.name,
            mimeType: file.type
          })
        });

        const data = await response.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
          setIsUploadOpen(false);
          setActiveTab('overview');
        }
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to parse file:', err);
      setLoading(false);
    }
  };

  const handleJumpToClause = (clauseId: string) => {
    setActiveClauseId(clauseId);
    setActiveTab('clauses');
  };

  const handleSelectForNegotiation = (flagId: string) => {
    setNegotiationPreselectedFlag(flagId);
    setActiveTab('negotiate');
  };

  const activeSample = SAMPLE_CONTRACTS.find(s => s.category === analysis?.category);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col selection:bg-amber-200">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        analysis={analysis}
        onOpenUpload={() => setIsUploadOpen(true)}
        onSelectSample={handleSelectSample}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {analysis ? (
          <>
            {/* VIEW 1: OVERVIEW & RED FLAGS */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-8">
                    <ExecutiveSummaryCard analysis={analysis} />
                  </div>
                  <div className="lg:col-span-4">
                    <RiskScoreCard analysis={analysis} />
                  </div>
                </div>

                {/* Red Flags Screening Section */}
                <RedFlagsList
                  redFlags={analysis.redFlags}
                  onJumpToClause={handleJumpToClause}
                  onSelectForNegotiation={handleSelectForNegotiation}
                />

                {/* Rights vs Obligations Balance Matrix */}
                <RightsObligationsMatrix items={analysis.rightsAndObligations} />

                {/* Quick Action Footer for Overview */}
                <div className="p-4 rounded-xl bg-stone-900 text-stone-100 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-amber-400">
                      Take Action on Identified Risks
                    </h4>
                    <p className="text-xs text-stone-300 mt-0.5">
                      You can navigate clauses directly, ask grounded questions, or generate a customized counter-proposal letter.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('qa')}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium transition-colors"
                    >
                      Ask Questions →
                    </button>
                    <button
                      onClick={() => setActiveTab('negotiate')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
                    >
                      Draft Counter-Offer Letter →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: CLAUSE EXPLORER */}
            {activeTab === 'clauses' && (
              <div className="animate-in fade-in duration-300">
                <ClauseExplorer
                  clauses={analysis.clauses}
                  activeClauseId={activeClauseId}
                  onSelectClause={id => setActiveClauseId(id)}
                />
              </div>
            )}

            {/* VIEW 3: GROUNDED Q&A */}
            {activeTab === 'qa' && (
              <div className="animate-in fade-in duration-300">
                <GroundedQA
                  analysis={analysis}
                  suggestedQuestions={activeSample?.suggestedQuestions}
                  onJumpToClause={handleJumpToClause}
                />
              </div>
            )}

            {/* VIEW 4: VERSION DIFF & COMPARE */}
            {activeTab === 'compare' && (
              <div className="animate-in fade-in duration-300">
                <DocumentComparisonView currentAnalysis={analysis} />
              </div>
            )}

            {/* VIEW 5: NEGOTIATION DRAFTER */}
            {activeTab === 'negotiate' && (
              <div className="animate-in fade-in duration-300">
                <NegotiationDrafterView
                  analysis={analysis}
                  preselectedFlagId={negotiationPreselectedFlag}
                />
              </div>
            )}
          </>
        ) : (
          /* Loading / Empty State */
          <div className="py-24 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center mx-auto text-2xl font-serif font-bold">
              C
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Loading ClariLex Legal Navigator...
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Preparing contract segmentation, rule screening, and plain-language summaries.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50 py-6 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900">ClariLex</span>
            <span>•</span>
            <span>Consumer Contract Literacy & Navigation</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsGlossaryOpen(true)}
              className="hover:text-stone-900 underline"
            >
              Legal Jargon Dictionary
            </button>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>In-Memory Zero Retention</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAnalyzeText={handleAnalyzeText}
        onAnalyzeFile={handleAnalyzeFile}
        isLoading={loading}
        onSelectSample={handleSelectSample}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {analysis && (
        <ExportReportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          analysis={analysis}
        />
      )}
    </div>
  );
}
