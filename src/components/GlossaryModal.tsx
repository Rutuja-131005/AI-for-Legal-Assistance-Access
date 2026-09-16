import React, { useState } from 'react';
import { X, Search, BookOpen, AlertTriangle } from 'lucide-react';
import { LEGAL_GLOSSARY } from '../data/legalGlossary';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Liability', 'Financial', 'Dispute', 'General'];

  const filteredTerms = LEGAL_GLOSSARY.filter(t => {
    const matchesSearch = (t.term + ' ' + t.definition + ' ' + t.plainEnglishExample).toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Legal Glossary & Jargon Explainer">
      <div 
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
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Consumer Legal Glossary & Jargon Explainer
              </h2>
              <p className="text-xs text-stone-500">
                Demystifying boilerplate traps, legal clauses, and Latin terminology.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close glossary"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search legal term or phrase..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div className="flex items-center gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
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
          {filteredTerms.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {item.term}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600">
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
                <p className="text-stone-600 italic">
                  "{item.plainEnglishExample}"
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Watch Out For: </strong>
                  {item.watchOutFor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
