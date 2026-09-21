import React, { useState } from 'react';
import { CheckSquare, Download, Printer, Shield, FileText, CheckCircle2 } from 'lucide-react';
import ChecklistItem from './checklist/ChecklistItem.jsx';

export default function ChecklistView({ checklist, docTitle }) {
  const [checkedItems, setCheckedItems] = useState({});

  if (!checklist) {
    return (
      <div className="clarilex-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <CheckSquare size={36} style={{ color: '#004243', marginBottom: '0.75rem' }} aria-hidden="true" />
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: 0 }}>No Action Checklist Generated Yet</h3>
        <p style={{ fontSize: '0.85rem', color: '#666' }}>Please load an agreement in the first tab to generate your custom action checklist.</p>
      </div>
    );
  }

  const toggleCheck = (key) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const downloadExport = () => {
    const textContent = `CLARILEX ACTION CHECKLIST & NEXT STEPS
Agreement: ${docTitle || 'Legal Document'}
Date Generated: ${new Date().toLocaleDateString()}

==================================================
1. VERIFY BEFORE SIGNING
==================================================
${(checklist.verifyItems || []).map(item => `[ ] ${item}`).join('\n')}

==================================================
2. NEGOTIATE THESE TERMS
==================================================
${(checklist.negotiateItems || []).map(item => `[ ] ${item}`).join('\n')}

==================================================
3. CONSULT A LICENSED LAWYER FOR
==================================================
${(checklist.lawyerItems || []).map(item => `[ ] ${item}`).join('\n')}

--------------------------------------------------
Disclaimer: ClariLex provides informational guidance only and does not constitute legal advice.
`;

    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ClariLex_Action_Checklist_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="clarilex-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e1e2e9', paddingBottom: '1rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#004243', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📋 Action Checklist & Next Steps
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
            Prioritized steps to verify, negotiate, or clarify before signing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={downloadExport} className="btn-secondary" aria-label="Export checklist as TXT or Markdown">
            <Download size={15} aria-hidden="true" /> Export TXT / Markdown
          </button>
          <button onClick={() => window.print()} className="btn-primary" aria-label="Print Action Plan">
            <Printer size={15} aria-hidden="true" /> Print Action Plan
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: '#f8f9ff', border: '1px solid #bce0ff', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f5b5c', marginBottom: '0.75rem' }}>
            <CheckCircle2 size={20} aria-hidden="true" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 0 }}>1. Verify Before Signing</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '1rem' }}>Physical checks, title deeds, and calculations to perform yourself.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {checklist.verifyItems?.map((item, idx) => (
              <ChecklistItem key={`verify-${idx}`} itemKey={`verify-${idx}`} itemText={item} isChecked={checkedItems[`verify-${idx}`]} onToggle={toggleCheck} />
            ))}
          </div>
        </div>

        <div style={{ background: '#fff6ee', border: '1px solid #ffd6b3', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9b4500', marginBottom: '0.75rem' }}>
            <FileText size={20} aria-hidden="true" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 0 }}>2. Negotiate These Terms</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '1rem' }}>Specific clauses to ask the landlord or employer to modify or cap.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {checklist.negotiateItems?.map((item, idx) => (
              <ChecklistItem key={`negotiate-${idx}`} itemKey={`negotiate-${idx}`} itemText={item} isChecked={checkedItems[`negotiate-${idx}`]} onToggle={toggleCheck} />
            ))}
          </div>
        </div>

        <div style={{ background: '#fff0f0', border: '1px solid #ffb4b4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b30000', marginBottom: '0.75rem' }}>
            <Shield size={20} aria-hidden="true" />
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', margin: 0 }}>3. Consult a Lawyer For</h4>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '1rem' }}>High-exposure risks requiring professional legal consultation.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {checklist.lawyerItems?.map((item, idx) => (
              <ChecklistItem key={`lawyer-${idx}`} itemKey={`lawyer-${idx}`} itemText={item} isChecked={checkedItems[`lawyer-${idx}`]} onToggle={toggleCheck} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
