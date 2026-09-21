import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

export default function FileDropArea({ onFileUpload }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) onFileUpload(e.dataTransfer.files[0]); }}
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
      <label className="btn-primary" style={{ cursor: 'pointer' }} aria-label="Browse and upload a legal document file">
        Browse File
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          aria-label="Upload legal document (PDF, DOCX, or TXT)"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files[0] && onFileUpload(e.target.files[0])}
        />
      </label>
    </div>
  );
}
