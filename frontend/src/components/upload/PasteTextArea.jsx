import React, { useState } from 'react';

export default function PasteTextArea({ onTextSubmit }) {
  const [rawTextInput, setRawTextInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rawTextInput.trim()) return;
    onTextSubmit(rawTextInput);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="paste-text-area" className="visually-hidden">Paste legal document text</label>
      <textarea
        id="paste-text-area"
        rows={5}
        value={rawTextInput}
        onChange={(e) => setRawTextInput(e.target.value)}
        placeholder="Paste raw contract clauses, rental agreement text, or offer letter text here..."
        aria-label="Paste raw legal document text for analysis"
        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', marginBottom: '0.75rem' }}
      />
      <button type="submit" className="btn-primary" disabled={!rawTextInput.trim()}>
        Analyze Pasted Text
      </button>
    </form>
  );
}
