import React from 'react';
import { Shield } from 'lucide-react';
import { useGroundedChat } from '../hooks/useGroundedChat.js';
import ChatMessage from './chat/ChatMessage.jsx';
import ChatInput from './chat/ChatInput.jsx';

export default function GroundedChat({ sessionId, document_id }) {
  const { messages, loading, sendMessage } = useGroundedChat(sessionId, document_id);

  const initialWelcome = {
    role: 'assistant',
    content: 'Hello! I am ClariLex Grounded Legal Navigator. I answer questions strictly based on your uploaded document context with exact clause citations. What would you like to ask about your agreement?',
    citations: []
  };

  const allMessages = messages.length > 0 ? messages : [initialWelcome];

  const suggestedQuestions = [
    'What is my mandatory notice period if I decide to leave?',
    'What happens to my security deposit if I vacate during the lock-in period?',
    'Are there any non-negotiable automatic deductions mentioned?',
    'What happens if I delay monthly payment past the due date?'
  ];

  return (
    <div className="clarilex-card" style={{ display: 'flex', flexDirection: 'column', height: '640px' }}>
      <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #e1e2e9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#004243', margin: 0 }}>
            💬 Grounded Document Q&A (RAG Engine)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
            Answers strictly derived from uploaded document clauses — zero external hallucination.
          </p>
        </div>
        <span className="badge badge-favorable" style={{ fontSize: '0.7rem' }}>
          <Shield size={12} aria-hidden="true" /> Strict Document Locking
        </span>
      </div>

      <div style={{ padding: '0.75rem 0', display: 'flex', gap: '0.5rem', overflowX: 'auto', borderBottom: '1px solid #f0f0f0' }}>
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(sq)}
            style={{
              whiteSpace: 'nowrap',
              padding: '0.3rem 0.65rem',
              borderRadius: '16px',
              border: '1px solid #aceeef',
              background: '#f0f9f9',
              color: '#004243',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            💡 {sq}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {allMessages.map((msg, index) => (
          <ChatMessage key={index} msg={msg} />
        ))}
        {loading && (
          <div role="status" aria-live="polite" style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', paddingLeft: '2.5rem' }}>
            Analyzing document context for citations...
          </div>
        )}
      </div>

      <ChatInput onSend={sendMessage} loading={loading} />
    </div>
  );
}
