import React, { useState, useEffect, useRef } from 'react';
import { X, Key, Check, Info } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey }) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputKey(apiKey || '');
  }, [apiKey, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (inputRef.current) inputRef.current.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div className="clarilex-card" style={{ maxWidth: '480px', width: '100%', position: 'relative' }}>
        <button
          onClick={onClose}
          aria-label="Close API Key Configuration"
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#666' }}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ background: '#004243', color: 'white', padding: '0.5rem', borderRadius: '6px' }}>
            <Key size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 id="api-modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: 0 }}>
              Configure Gemini API Key
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>Enables live LLM inference</p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="gemini-key-input" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Google Gemini API Key
            </label>
            <input
              id="gemini-key-input"
              ref={inputRef}
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="AIzaSy..."
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ background: '#f0f9f9', border: '1px solid #aceeef', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#0f5b5c', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            <div>
              <strong>Keyless Hackathon Mode:</strong> ClariLex includes an intelligent local fallback legal reasoning engine and pre-loaded sample agreements, so you can test all features offline even without an API key!
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {savedSuccess ? <><Check size={16} aria-hidden="true" /> Saved!</> : 'Save & Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
