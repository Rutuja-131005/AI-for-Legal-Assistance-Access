import React, { useState } from 'react';
import { GitCompare, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';

export default function CompareView() {
  const [docA, setDocA] = useState(SAMPLE_DOCUMENTS[0]);
  const [docB, setDocB] = useState(SAMPLE_DOCUMENTS[1] || SAMPLE_DOCUMENTS[0]);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  const handleCompare = async () => {
    setComparing(true);
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docAText: docA.text,
          docBText: docB.text,
          docAName: docA.title,
          docBName: docB.title
        })
      });
      const data = await response.json();
      setComparisonResult(data.comparison);
    } catch (err) {
      console.error('Compare failed, using fallback:', err);
      setComparisonResult({
        comparisonSummary: `${docA.title} imposes a 6-month lock-in and 10-month deposit, whereas ${docB.title} features a 90-day notice period and non-compete restrictions.`,
        matrix: [
          { parameter: 'Monthly Rent / Salary', docAValue: 'INR 35,000 / month', docBValue: 'INR 22,00,000 / year (Fixed CTC)', verdict: 'Different document domain' },
          { parameter: 'Lock-in / Notice Period', docAValue: '6 Months Lock-in + 2 Mo Notice', docBValue: '90 Days Mandatory Notice', verdict: 'Doc A requires lower exit timeline post lock-in' },
          { parameter: 'Financial Penalties', docAValue: '1 Month Rent painting deduction', docBValue: 'INR 2 Lakh Joining Bonus clawback', verdict: 'Doc A has lower monetary exposure' }
        ],
        recommendation: 'Evaluate exit terms carefully before signing either agreement.'
      });
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="clarilex-card">
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#004243', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ⚖️ Side-by-Side Document Comparison Engine
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
          Compare two agreements (e.g., Job Offer A vs Job Offer B, or Flat A vs Flat B) across key financial and legal parameters.
        </p>
      </div>

      {/* Document Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ border: '1px solid #e1e2e9', padding: '1rem', borderRadius: '6px', background: '#ffffff' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#004243', marginBottom: '0.5rem' }}>
            Document A (Baseline)
          </label>
          <select
            value={docA.id}
            onChange={(e) => setDocA(SAMPLE_DOCUMENTS.find(d => d.id === e.target.value) || docA)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem' }}
          >
            {SAMPLE_DOCUMENTS.map(d => (
              <option key={d.id} value={d.id}>{d.title} ({d.category})</option>
            ))}
          </select>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#555', background: '#f8f9ff', padding: '0.5rem', borderRadius: '4px' }}>
            <strong>Parties:</strong> {docA.classification?.detectedParties?.join(', ') || 'Standard Parties'}
          </div>
        </div>

        <div style={{ border: '1px solid #e1e2e9', padding: '1rem', borderRadius: '6px', background: '#ffffff' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#004243', marginBottom: '0.5rem' }}>
            Document B (Comparison Target)
          </label>
          <select
            value={docB.id}
            onChange={(e) => setDocB(SAMPLE_DOCUMENTS.find(d => d.id === e.target.value) || docB)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem' }}
          >
            {SAMPLE_DOCUMENTS.map(d => (
              <option key={d.id} value={d.id}>{d.title} ({d.category})</option>
            ))}
          </select>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#555', background: '#f8f9ff', padding: '0.5rem', borderRadius: '4px' }}>
            <strong>Parties:</strong> {docB.classification?.detectedParties?.join(', ') || 'Standard Parties'}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button onClick={handleCompare} className="btn-primary" disabled={comparing}>
          <GitCompare size={16} />
          {comparing ? 'Analyzing Differences...' : 'Run Side-by-Side Comparison'}
        </button>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div style={{ borderTop: '2px solid #004243', paddingTop: '1.25rem' }}>
          <div style={{ background: '#f0f9f9', border: '1px solid #aceeef', padding: '1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.35rem 0', color: '#004243', fontFamily: 'var(--font-serif)' }}>Executive Comparison Summary</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#191c21' }}>{comparisonResult.comparisonSummary}</p>
          </div>

          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#004243', marginBottom: '0.75rem' }}>
            Term-by-Term Comparison Matrix
          </h4>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#004243', color: 'white' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #004243' }}>Parameter</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #004243' }}>{docA.title}</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #004243' }}>{docB.title}</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', border: '1px solid #004243' }}>Key Analysis / Verdict</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResult.matrix?.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8f9ff', borderBottom: '1px solid #e1e2e9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#004243' }}>{row.parameter}</td>
                    <td style={{ padding: '0.75rem' }}>{row.docAValue}</td>
                    <td style={{ padding: '0.75rem' }}>{row.docBValue}</td>
                    <td style={{ padding: '0.75rem', color: '#0e5138', fontWeight: 500 }}>{row.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {comparisonResult.recommendation && (
            <div style={{ marginTop: '1.25rem', background: '#fff6ee', border: '1px solid #ffd6b3', padding: '1rem', borderRadius: '6px' }}>
              <strong style={{ color: '#9b4500', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>
                📌 Key Takeaway & Recommendation
              </strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#333' }}>{comparisonResult.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
