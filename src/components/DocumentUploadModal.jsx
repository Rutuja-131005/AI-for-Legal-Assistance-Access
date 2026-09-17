import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  FileUp, 
  Sparkles, 
  ShieldCheck, 
  Loader2
} from 'lucide-react';
import { SAMPLE_CONTRACTS } from '../data/sampleContracts.js';

const DocumentUploadModalComponent = ({
  isOpen,
  onClose,
  onAnalyzeText,
  onAnalyzeFile,
  isLoading,
  onSelectSample
}) => {
  const [activeTab, setActiveTab] = useState('samples');
  const [pastedText, setPastedText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
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

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await onAnalyzeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await onAnalyzeFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (!pastedText.trim()) return;
    await onAnalyzeText(pastedText, customTitle.trim() || 'Custom Document');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      aria-describedby="upload-modal-desc"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h2 id="upload-modal-title" className="font-serif text-lg font-bold text-stone-900">
              Analyze a Legal Document
            </h2>
            <p id="upload-modal-desc" className="text-xs text-stone-600">
              Upload an agreement, paste contract clauses, or explore pre-loaded examples.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-stone-200 px-6 pt-2 bg-stone-50/50">
          <button
            onClick={() => setActiveTab('samples')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'samples'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Pre-Loaded Samples</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
            <span>Upload File (PDF / DOCX)</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-stone-600" />
            <span>Paste Contract Text</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
              <p className="font-serif text-base font-semibold text-stone-900">
                Parsing & Auditing Contract...
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Segmenting clauses, screening for consumer red flags, and synthesizing plain-language explanations.
              </p>
            </div>
          ) : (
            <>
              {/* SAMPLES TAB */}
              {activeTab === 'samples' && (
                <div className="space-y-3">
                  <div className="text-xs text-stone-600 mb-2">
                    Select a realistic consumer agreement to test the risk detector and grounded Q&A navigator:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SAMPLE_CONTRACTS.map(sample => (
                      <div
                        key={sample.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onSelectSample(sample.id);
                          onClose();
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectSample(sample.id);
                            onClose();
                          }
                        }}
                        className="p-3.5 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50/80 transition-all cursor-pointer group flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {sample.badge}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-900">
                            {sample.title}
                          </h4>
                          <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                            {sample.description}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-stone-800 mt-3 flex items-center gap-1 group-hover:underline">
                          Load Contract →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UPLOAD FILE TAB */}
              {activeTab === 'upload' && (
                <div>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? 'border-stone-900 bg-stone-100'
                        : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <FileUp className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-stone-800">
                      Drag & drop your contract here, or <span className="text-stone-900 underline">browse</span>
                    </p>
                    <p className="text-xs text-stone-500 mt-1">
                      Supports PDF, Microsoft Word (.docx), and plain text (.txt)
                    </p>
                    <p className="text-[11px] text-stone-400 mt-3">
                      Max file size: 25 MB • Session memory only
                    </p>
                  </div>
                </div>
              )}

              {/* PASTE TEXT TAB */}
              {activeTab === 'paste' && (
                <form onSubmit={handlePasteSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Document Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      placeholder="e.g. 2025 Apartment Lease Offer"
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Contract Clauses / Agreement Text
                    </label>
                    <textarea
                      rows={8}
                      value={pastedText}
                      onChange={e => setPastedText(e.target.value)}
                      placeholder="Paste clauses, lease text, employment contract terms, or terms of service here..."
                      className="w-full text-xs font-mono p-3 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!pastedText.trim()}
                      className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors"
                    >
                      Analyze Pasted Text
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* Zero-Retention Privacy Promise */}
          <div className="mt-5 pt-4 border-t border-stone-200 flex items-start gap-2.5 text-stone-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-700">Strict Data Privacy & Zero Retention:</strong> All documents are parsed and analyzed purely within this active session. Documents are never saved to permanent disk or used for model training.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DocumentUploadModal = React.memo(DocumentUploadModalComponent);
