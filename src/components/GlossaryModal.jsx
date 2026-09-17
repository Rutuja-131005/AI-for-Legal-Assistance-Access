import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Search, BookOpen, AlertTriangle } from 'lucide-react';
import { LEGAL_GLOSSARY } from '../data/legalGlossary.js';

const GlossaryModalComponent = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
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

  const categories = ['All', 'Liability', 'Financial', 'Dispute', 'General'];

  const filteredTerms = useMemo(() => {
    return LEGAL_GLOSSARY.filter(t => {
      const matchesSearch = (t.term + ' ' + t.definition + ' ' + t.plainEnglishExample).toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'All' || t.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, activeCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
      aria-describedby="glossary-desc"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 id="glossary-title" className="font-serif text-lg font-bold text-stone-900">
                Consumer Legal Glossary & Jargon Explainer
              </h2>
              <p id="glossary-desc" className="text-xs text-stone-600">
                Demystifying boilerplate traps, legal clauses, and Latin terminology.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close glossary"
            className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <label htmlFor="glossary-search-input" className="sr-only">Search legal jargon</label>
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="glossary-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search legal term or phrase..."
              aria-label="Search legal term or phrase"
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
            />
          </div>

          <div className="flex items-center gap-1" role="tablist" aria-label="Glossary categories">
            {categories.map(cat => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 ${
                  activeCategory === cat
                    ? 'bg-stone-900 text-white'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Term Cards */}
        <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
          {filteredTerms.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-500">
              No matching legal terms found.
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    {item.term}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-sans">
                  {item.definition}
                </p>

                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70 text-xs space-y-1">
                  <span className="font-bold text-stone-900 block text-[11px] uppercase tracking-wider">
                    Everyday Consumer Example:
                  </span>
                  <p className="text-stone-700 italic">
                    "{item.plainEnglishExample}"
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Watch Out For: </strong>
                    {item.watchOutFor}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const GlossaryModal = React.memo(GlossaryModalComponent);
