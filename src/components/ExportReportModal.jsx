import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Copy, Check, FileText, ShieldAlert } from 'lucide-react';

const ExportReportModalComponent = ({
  isOpen,
  onClose,
  analysis
}) => {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      const modalElement = modalRef.current;
      if (modalElement) {
        const focusableElements = modalElement.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !analysis) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateMarkdownReport = () => {
    return `# ClariLex Document Analysis Report
Generated for: ${analysis.documentTitle}
Category: ${analysis.categoryDisplayName}
Date Analyzed: ${new Date().toLocaleDateString()}
Health Safety Score: ${analysis.overallRiskScore}/100 (${analysis.riskScoreLabel})

## Executive Summary
${analysis.executiveSummary}

## Key Entities & Commitments
- Parties: ${(analysis.keyEntities?.parties || []).map(p => `${p.name} (${p.role})`).join(', ')}
- Financial Obligations: ${analysis.keyEntities?.totalFinancialCommitment || 'Refer to text'}
- Renewal Terms: ${analysis.keyEntities?.renewalTerms || 'Standard'}
- Exit Notice Period: ${analysis.keyEntities?.noticePeriod || 'Standard'}

## Identified Red Flags (${(analysis.redFlags || []).length})
${(analysis.redFlags || []).map((f, i) => `
### ${i + 1}. [${(f.riskLevel || '').toUpperCase()}] ${f.category} (${f.clauseTitle})
- Verbatim Excerpt: "${f.verbatimQuote}"
- Issue: ${f.issue}
- Real-World Impact: ${f.practicalImpact}
- Recommended Counter-Proposal: ${f.counterProposal}
`).join('\n')}

## Missing Standard Consumer Protections
${(analysis.missingStandardProtections || []).map(m => `- ${m}`).join('\n')}

---
Disclaimer: ClariLex provides document literacy information and AI analysis, not formal legal advice. Consult a qualified attorney for legal counsel.`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      aria-describedby="export-modal-desc"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 id="export-modal-title" className="font-serif text-lg font-bold text-stone-900">
                Export & Share Contract Audit Report
              </h2>
              <p id="export-modal-desc" className="text-xs text-stone-600">
                Download printable PDF summaries or copy markdown reports for negotiations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied MD!' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close export report dialog"
              className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 max-h-[580px] overflow-y-auto print:max-h-none print:overflow-visible space-y-6 font-sans">
          {/* Document Header */}
          <div className="border-b border-stone-300 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">
                  ClariLex Contract Review Brief
                </span>
                <h1 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                  {analysis.documentTitle}
                </h1>
                <p className="text-xs text-stone-600 mt-0.5">
                  Category: {analysis.categoryDisplayName} • Date: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-stone-600 block">Health Score</span>
                <span className="font-serif text-3xl font-bold text-stone-900">
                  {analysis.overallRiskScore}/100
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-800 block">
                  {analysis.riskScoreLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
              Executive Summary
            </h3>
            <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
              {analysis.executiveSummary}
            </p>
          </div>

          {/* Red Flags List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2 flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Identified Red Flags ({(analysis.redFlags || []).length})</span>
            </h3>
            <div className="space-y-3">
              {(analysis.redFlags || []).map((flag, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-900">
                      {idx + 1}. {flag.category} ({flag.clauseTitle})
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-800">
                      {flag.riskLevel}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-stone-800 italic bg-white p-2 rounded border border-stone-200">
                    "{flag.verbatimQuote}"
                  </p>
                  <p className="text-stone-700">
                    <strong>Issue:</strong> {flag.issue}
                  </p>
                  <p className="text-emerald-900">
                    <strong>Recommended Redline:</strong> {flag.counterProposal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ethics & Legal Aid Disclaimer */}
          <div className="pt-4 border-t border-stone-200 text-[10px] text-stone-600 text-center">
            ClariLex provides AI-powered document literacy and information, not formal legal advice. Consult a qualified attorney or local legal aid clinic for legal counsel before signing binding agreements.
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExportReportModal = React.memo(ExportReportModalComponent);
