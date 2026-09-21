import React, { useState } from 'react';
import { Home, Briefcase } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';
import FileDropArea from './upload/FileDropArea.jsx';
import PasteTextArea from './upload/PasteTextArea.jsx';

export default function UploadZone({ onDocumentLoaded }) {
  const [activeMode, setActiveMode] = useState('upload');

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      onDocumentLoaded({ loading: true });
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.fullText) {
        onDocumentLoaded({
          sessionId: data.sessionId,
          filename: data.filename,
          text: data.fullText,
          chunks: data.chunks
        });
      }
    } catch (err) {
      console.error('File upload fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        onDocumentLoaded({
          sessionId: `session-${Date.now()}`,
          filename: file.name,
          text: e.target.result,
          chunks: [{ id: 'clause-1', title: '1. Document Content', text: e.target.result }]
        });
      };
      reader.readAsText(file);
    }
  };

  const handleTextSubmit = (rawText) => {
    onDocumentLoaded({
      sessionId: `session-${Date.now()}`,
      filename: 'Pasted Legal Text',
      text: rawText,
      chunks: [{ id: 'clause-1', title: '1. Document Content', text: rawText }]
    });
  };

  const handleSampleSelect = (sample) => {
    onDocumentLoaded({
      sessionId: `sample-${sample.id}`,
      filename: sample.filename,
      text: sample.text,
      sampleData: sample
    });
  };

  return (
    <div className="clarilex-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', margin: 0, color: '#004243' }}>
            Select or Upload Legal Agreement
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
            Upload PDF/DOCX or pick a 1-click pre-loaded sample document.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: '#f2f3fa', padding: '0.25rem', borderRadius: '6px' }} role="group" aria-label="Document input mode selector">
          <button
            onClick={() => setActiveMode('upload')}
            aria-pressed={activeMode === 'upload'}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none', background: activeMode === 'upload' ? 'white' : 'transparent', fontWeight: activeMode === 'upload' ? 600 : 400, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveMode('samples')}
            aria-pressed={activeMode === 'samples'}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none', background: activeMode === 'samples' ? 'white' : 'transparent', fontWeight: activeMode === 'samples' ? 600 : 400, cursor: 'pointer', fontSize: '0.8rem', color: '#004243' }}
          >
            ✨ 1-Click Samples
          </button>
          <button
            onClick={() => setActiveMode('text')}
            aria-pressed={activeMode === 'text'}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none', background: activeMode === 'text' ? 'white' : 'transparent', fontWeight: activeMode === 'text' ? 600 : 400, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Paste Text
          </button>
        </div>
      </div>

      {activeMode === 'samples' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }} role="list" aria-label="Pre-loaded sample documents">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              role="button"
              tabIndex={0}
              aria-label={`Analyze ${sample.title}: ${sample.subtitle}`}
              onClick={() => handleSampleSelect(sample)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSampleSelect(sample); } }}
              style={{
                background: '#ffffff',
                border: '1.5px solid #004243',
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#004243', marginBottom: '0.5rem' }}>
                {sample.icon === 'Home' ? <Home size={18} /> : <Briefcase size={18} />}
                <strong style={{ fontSize: '0.95rem' }}>{sample.title}</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#555', margin: 0, marginBottom: '0.75rem' }}>{sample.subtitle}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-standard">{sample.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#004243', fontWeight: 600 }}>Analyze Now →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeMode === 'upload' && <FileDropArea onFileUpload={handleFileUpload} />}
      {activeMode === 'text' && <PasteTextArea onTextSubmit={handleTextSubmit} />}
    </div>
  );
}
