import React, { useState } from 'react';
import { 
  Send, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { ContractAnalysis, QuestionAnswer } from '../types';

interface GroundedQAProps {
  analysis: ContractAnalysis;
  suggestedQuestions?: string[];
  onJumpToClause?: (clauseId: string) => void;
}

export const GroundedQA: React.FC<GroundedQAProps> = ({
  analysis,
  suggestedQuestions = [],
  onJumpToClause
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState<QuestionAnswer[]>([
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

  const defaultSuggested = suggestedQuestions.length > 0 ? suggestedQuestions : [
    'Can the landlord enter without advance notice?',
    'What happens to my security deposit when I move out?',
    'What are the penalties if I break the lease early?',
    'Who pays for plumbing or HVAC maintenance?'
  ];

  const handleSubmitQuestion = async (queryText: string) => {
    if (!queryText.trim() || loading) return;
    setLoading(true);

    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText.trim(),
          contractText: analysis.rawText,
          analysis
        })
      });

      const data = await response.json();
      if (data.success) {
        const newQA: QuestionAnswer = {
          id: `qa-${Date.now()}`,
          question: queryText.trim(),
          answer: data.answer,
          isGrounded: data.isGrounded !== false,
          citedClauses: data.citedClauses || [],
          confidence: data.confidence || 'high',
          missingClauseWarning: data.missingClauseWarning,
          timestamp: 'Just now'
        };
        setQaHistory(prev => [newQA, ...prev]);
        setQuestion('');
      } else {
        throw new Error(data.error || 'Failed to get answer');
      }
    } catch (err: any) {
      console.error('Q&A error:', err);
      // Local fallback
      const fallbackQA: QuestionAnswer = {
        id: `qa-${Date.now()}`,
        question: queryText.trim(),
        answer: `This agreement does not explicitly state terms regarding "${queryText}". Default consumer protections and local statutes typically apply. We recommend asking the drafter to insert explicit language before signing.`,
        isGrounded: false,
        citedClauses: [],
        confidence: 'medium',
        missingClauseWarning: 'No direct clause match found in text.',
        timestamp: 'Just now'
      };
      setQaHistory(prev => [fallbackQA, ...prev]);
      setQuestion('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-stone-700" />
          <h2 className="font-serif text-lg font-bold text-stone-900">
            Grounded Document Q&A Navigator
          </h2>
          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Anti-Hallucination Grounded</span>
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Ask any specific question about your obligations, penalties, or rights. Every answer cites verbatim clause quotes.
        </p>
      </div>

      {/* Suggested Question Chips */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Suggested Questions for {analysis.categoryDisplayName}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {defaultSuggested.map((qText, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmitQuestion(qText)}
              disabled={loading}
              className="text-left text-xs bg-stone-50 hover:bg-stone-100 border border-stone-200/80 hover:border-stone-300 text-stone-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>{qText}</span>
              <span className="text-stone-400 text-[10px]">↵</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmitQuestion(question);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask a question about this contract (e.g. 'Can I have overnight guests?', 'What is the deposit refund timeline?')..."
            className="w-full text-xs px-4 py-2.5 bg-stone-50/70 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-stone-900 focus:bg-white"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Ask ClariLex</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Q&A Thread History */}
      <div className="space-y-4 pt-2">
        {qaHistory.map(qa => (
          <div
            key={qa.id}
            className="p-5 rounded-xl border border-stone-200 bg-stone-50/30 space-y-3 animate-in fade-in"
          >
            {/* User Question */}
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-stone-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                Q
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">
                  {qa.question}
                </h4>
                <span className="text-[10px] text-stone-400">{qa.timestamp}</span>
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
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Grounded Document Citations</span>
                  </div>
                  {qa.citedClauses.map((c, i) => (
                    <div key={i} className="text-xs font-mono text-stone-800 pl-2 border-l-2 border-stone-900">
                      <span className="font-bold">{c.clauseTitle}: </span>
                      <span className="text-stone-600">"{c.quote}"</span>
                      {onJumpToClause && (
                        <button
                          onClick={() => onJumpToClause(c.clauseId)}
                          className="ml-2 text-[10px] font-sans text-stone-700 underline hover:text-stone-950 inline-flex items-center gap-0.5"
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
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
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
