import React, { useState } from 'react';
import { Info, Search } from 'lucide-react';
import ClauseCard from './summary/ClauseCard.jsx';

export default function SummaryView({ docData, classification, summary }) {
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!summary) {
    return (
      <section aria-label="Document Summary" className="clarilex-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <Info size={36} style={{ color: '#004243', marginBottom: '0.75rem' }} aria-hidden="true" />
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: 0 }}>No Document Loaded Yet</h3>
        <p style={{ fontSize: '0.85rem', color: '#666' }}>Please select a sample document above or upload your agreement to view plain-language analysis.</p>
      </section>
    );
  }

  const clauses = summary.clauses || [];
  const filteredClauses = clauses.filter(c => {
    const matchesTag = riskFilter === 'ALL' || c.tag === riskFilter;
    const matchesSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.simplifiedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.originalText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <section aria-label="Document Summary & Analysis">
      {classification && (
        <div style={{ background: '#004243', color: 'white', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#aceeef', fontWeight: 600 }}>Detected Document Type</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', margin: 0, fontWeight: 500 }}>{classification.documentType}</h2>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
            {classification.detectedParties && (
              <div>
                <span style={{ color: '#aceeef', display: 'block', fontSize: '0.7rem' }}>PARTIES</span>
                <strong>{classification.detectedParties.join(' & ')}</strong>
              </div>
            )}
            {classification.jurisdiction && (
              <div>
                <span style={{ color: '#aceeef', display: 'block', fontSize: '0.7rem' }}>JURISDICTION</span>
                <strong>{classification.jurisdiction}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="clarilex-card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#004243', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📝 Executive Plain-Language Summary
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#2b3036', lineHeight: 1.6, margin: 0 }}>{summary.executiveSummary}</p>

        {summary.keyMetrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e1e2e9' }}>
            {summary.keyMetrics.map((m, idx) => (
              <div key={idx} style={{ background: '#f8f9ff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e1e2e9' }}>
                <span style={{ fontSize: '0.75rem', color: '#666', display: 'block', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{m.label}</span>
                <strong style={{ fontSize: '1.1rem', color: '#004243', display: 'block', margin: '0.2rem 0' }}>{m.value}</strong>
                <span style={{ fontSize: '0.75rem', color: m.impact.includes('Risk') ? '#b30000' : '#0f5b5c', fontWeight: 500 }}>{m.impact}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="clarilex-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#004243', margin: 0 }}>Clause Risk Explorer & Simplification</h3>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} aria-hidden="true" />
              <input
                type="text"
                aria-label="Search clauses by title or text"
                placeholder="Search clauses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.4rem 0.6rem 0.4rem 2rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.8rem', width: '180px' }}
              />
            </div>

            {['ALL', 'HIGH RISK', 'OBLIGATION', 'FAVORABLE'].map((tag) => (
              <button
                key={tag}
                aria-label={`Filter by ${tag}`}
                aria-pressed={riskFilter === tag}
                onClick={() => setRiskFilter(tag)}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '0.75rem',
                  fontWeight: riskFilter === tag ? 600 : 400,
                  background: riskFilter === tag ? '#004243' : 'white',
                  color: riskFilter === tag ? 'white' : '#333',
                  cursor: 'pointer'
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} aria-live="polite">
          {filteredClauses.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>No clauses matched your filter criteria.</p>
          ) : (
            filteredClauses.map((clause, idx) => (
              <ClauseCard key={clause.clauseId || idx} clause={clause} idx={idx} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
