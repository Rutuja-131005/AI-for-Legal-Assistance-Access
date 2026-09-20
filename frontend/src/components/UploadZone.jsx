import React, { useState } from 'react';
import { UploadCloud, FileText, Sparkles, Home, Briefcase, CreditCard, ShieldAlert } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';

export default function UploadZone({ onDocumentLoaded, loading }) {
  const [activeMode, setActiveMode] = useState('upload'); // 'upload', 'text', 'samples'
  const [rawTextInput, setRawTextInput] = useState('');
  const [dragOver, setDragOver] = useState(false);

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
      console.error('File upload failed, using client text reader fallback:', err);
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

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!rawTextInput.trim()) return;
    onDocumentLoaded({
      sessionId: `session-${Date.now()}`,
      filename: 'Pasted Legal Text',
      text: rawTextInput,
      chunks: [{ id: 'clause-1', title: '1. Document Content', text: rawTextInput }]
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
            Upload PDF/DOCX or pick a 1-click pre-loaded sample document to test persona Riya's experience.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: '#f2f3fa', padding: '0.25rem', borderRadius: '6px' }}>
          <button
            onClick={() => setActiveMode('upload')}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none', background: activeMode === 'upload' ? 'white' : 'transparent', fontWeight: activeMode === 'upload' ? 600 : 400, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveMode('samples')}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none', background: activeMode === 'samples' ? 'white' : 'transparent', fontWeight: activeMode === 'samples' ? 600 : 400, cursor: 'pointer', fontSize: '0.8rem', color: '#004243' }}
          >
            ✨ 1-Click Samples
          </button>
          <button
            onClick={() => setActiveMode('text')}
            style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none', background: activeMode === 'text' ? 'white' : 'transparent', fontWeight: activeMode === 'text' ? 600 : 400, cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* 1-Click Samples Mode */}
      {activeMode === 'samples' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSampleSelect(sample)}
              style={{
                background: '#ffffff',
                border: '1.5px solid #004243',
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,66,67,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#004243', marginBottom: '0.5rem' }}>
                {sample.icon === 'Home' ? <Home size={18} /> : <Briefcase size={18} />}
                <strong style={{ fontSize: '0.95rem' }}>{sample.title}</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#555', margin: 0, marginBottom: '0.75rem' }}>
                {sample.subtitle}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-standard">{sample.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#004243', fontWeight: 600 }}>Analyze Now →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload File Mode */}
      {activeMode === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]); }}
          style={{
            border: `2px dashed ${dragOver ? '#004243' : '#bfc8c8'}`,
            background: dragOver ? '#f0f9f9' : '#fafafa',
            borderRadius: '8px',
            padding: '2rem 1rem',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          <UploadCloud size={40} style={{ color: '#004243', marginBottom: '0.5rem' }} />
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#191c21' }}>Drag & Drop your document here</h4>
          <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 1rem 0' }}>Supports PDF, DOCX, TXT (up to 10 MB)</p>
          <label className="btn-primary" style={{ cursor: 'pointer' }}>
            Browse File
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      )}

      {/* Paste Text Mode */}
      {activeMode === 'text' && (
        <form onSubmit={handleTextSubmit}>
          <textarea
            rows={5}
            value={rawTextInput}
            onChange={(e) => setRawTextInput(e.target.value)}
            placeholder="Paste raw contract clauses, rental agreement text, or offer letter text here..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', marginBottom: '0.75rem' }}
          />
          <button type="submit" className="btn-primary" disabled={!rawTextInput.trim()}>
            Analyze Pasted Text
          </button>
        </form>
      )}
    </div>
  );
}
