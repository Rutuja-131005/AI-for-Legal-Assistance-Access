import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Disclaimer() {
  return (
    <footer style={{ marginTop: '2rem', borderTop: '1px solid #e1e2e9', background: '#f2f3fa', padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#4f5959' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <AlertCircle size={16} style={{ color: '#004243', flexShrink: 0 }} />
        <span>
          <strong>Informational Disclaimer:</strong> ClariLex provides AI-powered plain-language information and document clarity, not formal legal advice or representation. Laws vary by jurisdiction. For binding legal decisions, consult a licensed attorney.
        </span>
      </div>
    </footer>
  );
}
