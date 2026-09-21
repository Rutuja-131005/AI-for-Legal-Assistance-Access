import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import RiskBadge from './RiskBadge.jsx';

export default function ClauseCard({ clause, idx }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanSimplified = DOMPurify.sanitize(clause.simplifiedText || '');
  const cleanOriginal = DOMPurify.sanitize(clause.originalText || '');
  const cleanReason = DOMPurify.sanitize(clause.reason || '');

  return (
    <div
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

        <RiskBadge tag={clause.tag} />
      </div>

      <div style={{ background: '#f8f9ff', padding: '0.75rem', borderRadius: '6px', margin: '0.5rem 0', border: '1px solid #e6e8ef' }}>
        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#004243', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>
          💡 Plain-Language Translation
        </span>
        <p style={{ fontSize: '0.9rem', color: '#191c21', margin: 0, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: cleanSimplified }} />
        {cleanReason && (
          <p style={{ fontSize: '0.8rem', color: '#b30000', margin: '0.35rem 0 0 0', fontWeight: 500 }}>
            ⚠️ <strong>Why it matters:</strong> <span dangerouslySetInnerHTML={{ __html: cleanReason }} />
          </p>
        )}
      </div>

      <button
        onClick={() => setIsExpanded(prev => !prev)}
        aria-expanded={isExpanded}
        aria-controls={`clause-text-${clause.clauseId || idx}`}
        style={{ background: 'transparent', border: 'none', color: '#4f5959', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}
      >
        {isExpanded ? <ChevronUp size={12} aria-hidden="true" /> : <ChevronDown size={12} aria-hidden="true" />}
        <span>{isExpanded ? 'Hide original legal text' : 'View original legal clause text'}</span>
      </button>

      {isExpanded && (
        <div id={`clause-text-${clause.clauseId || idx}`} style={{ marginTop: '0.5rem', padding: '0.65rem', background: '#f2f3fa', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'var(--font-serif)', color: '#444', fontStyle: 'italic', borderLeft: '2px solid #999' }}>
          "{cleanOriginal}"
        </div>
      )}
    </div>
  );
}
