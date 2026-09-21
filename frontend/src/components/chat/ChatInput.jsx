import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend, loading }) {
  const [inputQuestion, setInputQuestion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuestion.trim() || loading) return;
    onSend(inputQuestion);
    setInputQuestion('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ borderTop: '1px solid #e1e2e9', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem' }}
    >
      <input
        type="text"
        value={inputQuestion}
        onChange={(e) => setInputQuestion(e.target.value)}
        placeholder="Ask a question about your uploaded document..."
        aria-label="Ask a question about your uploaded legal document"
        style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
      />
      <button type="submit" className="btn-primary" disabled={!inputQuestion.trim() || loading} aria-label="Send question">
        <Send size={16} aria-hidden="true" /> Send
      </button>
    </form>
  );
}
