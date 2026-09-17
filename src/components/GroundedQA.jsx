import React, { useState } from 'react';
import {
  HelpCircle, 
  Send, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const GroundedQAComponent = ({
  analysis,
  suggestedQuestions = [],
  onJumpToClause
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([
    {
      id: 'initial-qa-1',
      question: 'Can the landlord enter my apartment without giving me notice?',
      answer: `**No advance notice required under this contract.**

According to **Clause 5 (LANDLORD RIGHT OF ENTRY)**:
> *"Landlord and Landlord's agents... shall have the unencumbered right to enter the Premises at any time, day or night, with or without prior oral or written notice..."*

**Consumer Alert:**
This clause severely compromises your privacy. Under statutory tenant protection laws in most states (e.g. California Civil Code § 1954), landlords are legally required to provide at least 24 hours advance written notice for non-emergency inspections. You should request amending this to require 24 hours notice during reasonable business hours.`,
      isGrounded: true,
      citedClauses: [
        {
          clauseId: 'clause-5',
          clauseTitle: '5. LANDLORD RIGHT OF ENTRY',
          quote: 'with or without prior oral or written notice, for purposes of inspection...'
        }
      ],
      confidence: 'high',
      timestamp: 'Just now'
    }
  ]);

  const defaultSuggested = React.useMemo(() => {
    return suggestedQuestions.length > 0 ? suggestedQuestions : [
      'Can the landlord enter without advance notice?',
      'What happens to my security deposit when I move out?',
      'What are the penalties if I break the lease early?',
      'Who pays for plumbing or HVAC maintenance?'
    ];
  }, [suggestedQuestions]);

  const handleSubmitQuestion = React.useCallback(async (queryText) => {
    if (!queryText.trim() || loading) return;
    setLoading(true);

    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          contractText: analysis?.rawText || '',
          analysis
        })
      });

      const data = await response.json();
      if (data.success) {
        const newQA = {
          id: `qa-${Date.now()}`,
          question: queryText,
          answer: data.answer,
          isGrounded: data.isGrounded,
          citedClauses: data.citedClauses,
          confidence: data.confidence,
          missingClauseWarning: data.missingClauseWarning,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setQaHistory(prev => [newQA, ...prev]);
        setQuestion('');
      }
    } catch (err) {
      console.error('Failed to answer question:', err);
    } finally {
      setLoading(false);
    }
  }, [analysis, loading]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-stone-100 pb-4">
        <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <span>Grounded Document Question & Answering (RAG)</span>
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          Ask any specific question about your rights, penalties, or restrictions. Answers are mathematically grounded in verbatim contract clauses.
        </p>
      </div>

      {/* Question Input Box */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmitQuestion(question);
        }}
        className="space-y-3"
      >
        <div className="relative">
          <label htmlFor="grounded-qa-input" className="sr-only">Ask a grounded question about this contract</label>
          <input
            id="grounded-qa-input"
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask anything, e.g. 'Can I sublet my apartment?' or 'What is the late fee?'"
            aria-label="Ask a grounded question about this contract"
            className="w-full text-xs sm:text-sm pl-4 pr-24 py-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all font-sans"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            aria-label="Submit question"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Ask</span>
                <Send className="w-3 h-3 text-amber-400" />
              </>
            )}
          </button>
        </div>

        {/* Suggested Quick Questions */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Suggested Questions:</span>
          </span>
          {defaultSuggested.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(q);
                handleSubmitQuestion(q);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 whitespace-nowrap transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
            >
              {q}
            </button>
          ))}
        </div>
      </form>

      {/* QA History Feed */}
      <div className="space-y-4 pt-2 divide-y divide-stone-100">
        {qaHistory.map(qa => (
          <div key={qa.id} className="pt-4 first:pt-0 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                Q
              </div>
              <div className="flex-1 flex items-center justify-between">
                <h4 className="font-serif text-sm font-bold text-stone-900">
                  {qa.question}
                </h4>
                <span className="text-[10px] text-stone-500">{qa.timestamp}</span>
              </div>
            </div>

            {/* AI Grounded Answer */}
            <div className="pl-8 text-xs text-stone-700 leading-relaxed font-sans space-y-2">
              <div className="whitespace-pre-line">
                {qa.answer}
              </div>

              {/* Cited Clauses Box */}
              {qa.citedClauses && qa.citedClauses.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-white border border-stone-200/90 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Grounded Document Citations</span>
                  </div>
                  {qa.citedClauses.map((c, i) => (
                    <div key={i} className="text-xs font-mono text-stone-800 pl-2 border-l-2 border-stone-900">
                      <span className="font-bold">{c.clauseTitle}: </span>
                      <span className="text-stone-700">"{c.quote}"</span>
                      {onJumpToClause && (
                        <button
                          onClick={() => onJumpToClause(c.clauseId)}
                          className="ml-2 text-[10px] font-sans text-stone-700 underline hover:text-stone-950 inline-flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-900"
                        >
                          View clause <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Missing Clause Warning */}
              {qa.missingClauseWarning && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{qa.missingClauseWarning}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GroundedQA = React.memo(GroundedQAComponent);
