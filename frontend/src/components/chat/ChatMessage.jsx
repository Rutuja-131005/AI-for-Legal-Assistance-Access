import React from 'react';
import { Bot, User, Bookmark } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

export default function ChatMessage({ msg }) {
  const cleanContent = DOMPurify.sanitize(msg.content || '');

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
        maxWidth: '85%'
      }}
    >
      {msg.role === 'assistant' && (
        <div style={{ background: '#004243', color: 'white', padding: '0.4rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={18} aria-hidden="true" />
        </div>
      )}

      <div
        style={{
          background: msg.role === 'user' ? '#004243' : '#f8f9ff',
          color: msg.role === 'user' ? 'white' : '#191c21',
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          border: msg.role === 'user' ? 'none' : '1px solid #e1e2e9',
          fontSize: '0.9rem',
          lineHeight: 1.5
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: cleanContent }} />

        {msg.citations && msg.citations.length > 0 && (
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f5b5c' }}>
            <Bookmark size={12} aria-hidden="true" />
            <span>Sources: {msg.citations.map(c => c.title).join(', ')}</span>
          </div>
        )}
      </div>

      {msg.role === 'user' && (
        <div style={{ background: '#4f5959', color: 'white', padding: '0.4rem', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={18} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
