import React, { useState } from 'react';
import { 
  Mail, 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  CheckSquare, 
  Square,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { ContractAnalysis, RedFlag, NegotiationDraftResponse } from '../types';

interface NegotiationDrafterViewProps {
  analysis: ContractAnalysis;
  preselectedFlagId?: string;
}

export const NegotiationDrafterView: React.FC<NegotiationDrafterViewProps> = ({
  analysis,
  preselectedFlagId
}) => {
  const [selectedFlagIds, setSelectedFlagIds] = useState<string[]>(() => {
    if (preselectedFlagId) return [preselectedFlagId];
    return analysis.redFlags.slice(0, 3).map(f => f.id);
  });

  const [senderName, setSenderName] = useState(
    analysis.keyEntities.parties[1]?.name || 'Riya Sharma'
  );
  const [recipientName, setRecipientName] = useState(
    analysis.keyEntities.parties[0]?.name || 'Property Manager / Landlord'
  );
  const [tone, setTone] = useState<'diplomatic' | 'assertive' | 'inquisitive'>('diplomatic');
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState<NegotiationDraftResponse | null>(null);

  const toggleFlag = (id: string) => {
    setSelectedFlagIds(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleGenerateDraft = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/draft-negotiation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis,
          selectedFlagIds,
          tone,
          senderName,
          recipientName,
          customNotes
        })
      });

      const data = await response.json();
      if (data.success) {
        setDraft(data.draft);
      }
    } catch (err) {
      console.error('Draft error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-stone-100 pb-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-stone-700" />
          <span>Negotiation Email & Redline Letter Drafter</span>
        </h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Generate an articulate, courteous, and legally informed letter requesting modifications to one-sided contract clauses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration & Flag Selector */}
        <div className="lg:col-span-5 space-y-4">
          {/* Party Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Recipient / Drafter
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={e => setRecipientName(e.target.value)}
                className="w-full text-xs px-3 py-1.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Negotiation Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTone('diplomatic')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  tone === 'diplomatic'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                Diplomatic
                <span className="block text-[10px] opacity-70 mt-0.5">Collaborative</span>
              </button>
              <button
                type="button"
                onClick={() => setTone('assertive')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  tone === 'assertive'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                Standard
                <span className="block text-[10px] opacity-70 mt-0.5">Firm & Direct</span>
              </button>
              <button
                type="button"
                onClick={() => setTone('inquisitive')}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  tone === 'inquisitive'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                Inquisitive
                <span className="block text-[10px] opacity-70 mt-0.5">Legal Clarification</span>
              </button>
            </div>
          </div>

          {/* Flags Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Select Clauses to Contest ({selectedFlagIds.length} chosen)
              </label>
              <button
                type="button"
                onClick={() => {
                  if (selectedFlagIds.length === analysis.redFlags.length) {
                    setSelectedFlagIds([]);
                  } else {
                    setSelectedFlagIds(analysis.redFlags.map(f => f.id));
                  }
                }}
                className="text-[11px] text-stone-500 hover:text-stone-900 underline"
              >
                {selectedFlagIds.length === analysis.redFlags.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 border border-stone-200 rounded-xl p-2 bg-stone-50/50">
              {analysis.redFlags.map(flag => {
                const isSelected = selectedFlagIds.includes(flag.id);
                return (
                  <div
                    key={flag.id}
                    onClick={() => toggleFlag(flag.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 text-xs ${
                      isSelected
                        ? 'border-stone-900 bg-white shadow-xs'
                        : 'border-stone-200/80 bg-white/70 hover:bg-white text-stone-600'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-stone-900">
                      {isSelected ? <CheckSquare className="w-4 h-4 text-stone-900" /> : <Square className="w-4 h-4 text-stone-400" />}
                    </div>
                    <div>
                      <span className="font-bold text-stone-900 block">{flag.category}</span>
                      <span className="text-[11px] text-stone-500 line-clamp-1">{flag.issue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Personal Circumstances / Context (Optional)
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              placeholder="e.g. 'I work remotely so quiet daytime hours are essential' or 'Moving from out of state'..."
              className="w-full text-xs p-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateDraft}
            disabled={loading || selectedFlagIds.length === 0}
            className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate Negotiation Email</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Letter Preview */}
        <div className="lg:col-span-7 flex flex-col justify-between border border-stone-200 rounded-xl bg-stone-50/50 p-5 min-h-[460px]">
          {draft ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-mono text-stone-400 uppercase">
                    Email Subject
                  </span>
                  <div className="text-xs font-bold text-stone-900">
                    {draft.subject}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(`Subject: ${draft.subject}\n\n${draft.body}`)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 rounded-lg border border-stone-300 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Entire Email</span>
                    </>
                  )}
                </button>
              </div>

              {/* Body Text */}
              <div className="bg-white p-4 rounded-xl border border-stone-200/90 font-sans text-xs text-stone-800 leading-relaxed whitespace-pre-wrap selection:bg-amber-100 shadow-xs max-h-[380px] overflow-y-auto">
                {draft.body}
              </div>
            </div>
          ) : (
            <div className="my-auto py-16 text-center space-y-2">
              <FileText className="w-10 h-10 text-stone-300 mx-auto" />
              <h4 className="text-sm font-bold text-stone-800">
                Ready to Draft Your Counter-Offer
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Select the red flag clauses on the left, then click "Generate Negotiation Email" to create a diplomatic, itemized counter-proposal.
              </p>
            </div>
          )}

          {/* Advice note */}
          <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-stone-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              Negotiation Tip: Courteous tone paired with clear rationale achieves the highest success rate in contract revisions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
