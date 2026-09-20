import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function SummaryView({ docData, classification, summary }) {
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClauses, setExpandedClauses] = useState({});

  if (!summary) {
    return (
      <div className="clarilex-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <Info size={36} style={{ color: '#004243', marginBottom: '0.75rem' }} />
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: 0 }}>No Document Loaded Yet</h3>
        <p style={{ fontSize: '0.85rem', color: '#666' }}>Please select a sample document above or upload your agreement to view plain-language analysis.</p>
      </div>
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

  const toggleExpand = (id) => {
    setExpandedClauses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getBadgeClass = (tag) => {
    switch (tag) {
      case 'HIGH RISK': return 'badge-high-risk';
      case 'OBLIGATION': return 'badge-obligation';
      case 'FAVORABLE': return 'badge-favorable';
      default: return 'badge-standard';
    }
  };

  const getTagIcon = (tag) => {
    switch (tag) {
      case 'HIGH RISK': return <ShieldAlert size={14} />;
      case 'OBLIGATION': return <AlertTriangle size={14} />;
      case 'FAVORABLE': return <CheckCircle size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <div>
      {/* Classification Banner */}
      {classification && (
        <div style={{ background: '#004243', color: 'white', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#aceeef', fontWeight: 600 }}>
              Detected Document Type
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', margin: 0, fontWeight: 500 }}>
              {classification.documentType}
            </h2>
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

      {/* Executive Summary Box */}
      <div className="clarilex-card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#004243', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📝 Executive Plain-Language Summary
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#2b3036', lineHeight: 1.6, margin: 0 }}>
          {summary.executiveSummary}
        </p>

        {/* Key Metrics Grid */}
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

      {/* Clause Risk Explorer */}
      <div className="clarilex-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#004243', margin: 0 }}>
            Clause Risk Explorer & Simplification
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input
                type="text"
                placeholder="Search clauses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.4rem 0.6rem 0.4rem 2rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.8rem', width: '180px' }}
              />
            </div>

            {/* Filter Buttons */}
            {['ALL', 'HIGH RISK', 'OBLIGATION', 'FAVORABLE'].map((tag) => (
              <button
                key={tag}
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

        {/* Clause List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredClauses.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>No clauses matched your filter criteria.</p>
          ) : (
            filteredClauses.map((clause, idx) => {
              const isExpanded = expandedClauses[clause.clauseId || idx];
              return (
                <div
                  key={clause.clauseId || idx}
                  id={`clause-${clause.clauseId}`}
                  style={{
                    border: '1px solid #e1e2e9',
                    borderRadius: '6px',
                    padding: '1rem',
                    background: clause.tag === 'HIGH RISK' ? '#fff9f9' : '#ffffff',
                    borderLeft: `4px solid ${clause.tag === 'HIGH RISK' ? '#b30000' : clause.tag === 'OBLIGATION' ? '#9b4500' : '#004243'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.8rem', background: '#e1e2e9', padding: '0.1rem 0.4rem', borderRadius: '3px', fontWeight: 600 }}>
                        {clause.clauseId || `Clause ${idx + 1}`}
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: '#191c21' }}>{clause.title}</strong>
                    </div>

                    <span className={`badge ${getBadgeClass(clause.tag)}`}>
                      {getTagIcon(clause.tag)}
                      <span>{clause.tag}</span>
                    </span>
                  </div>

                  {/* Plain Language Translation */}
                  <div style={{ background: '#f8f9ff', padding: '0.75rem', borderRadius: '6px', margin: '0.5rem 0', border: '1px solid #e6e8ef' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#004243', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
                      💡 Plain-Language Translation
                    </span>
                    <p style={{ fontSize: '0.9rem', color: '#191c21', margin: 0, fontWeight: 500 }}>
                      {clause.simplifiedText}
                    </p>
                    {clause.reason && (
                      <p style={{ fontSize: '0.8rem', color: '#b30000', margin: '0.35rem 0 0 0', fontWeight: 500 }}>
                        ⚠️ <strong>Why it matters:</strong> {clause.reason}
                      </p>
                    )}
                  </div>

                  {/* Original Legal Text Accordion */}
                  <button
                    onClick={() => toggleExpand(clause.clauseId || idx)}
                    style={{ background: 'transparent', border: 'none', color: '#4f5959', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}
                  >
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    <span>{isExpanded ? 'Hide original legal text' : 'View original legal clause text'}</span>
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '0.5rem', padding: '0.65rem', background: '#f2f3fa', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'var(--font-serif)', color: '#444', fontStyle: 'italic', borderLeft: '2px solid #999' }}>
                      "{clause.originalText}"
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
