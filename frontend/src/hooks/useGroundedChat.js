import { useState, useCallback } from 'react';

export function useGroundedChat(sessionId, activeDocId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(async (query) => {
    if (!query.trim()) return;
    const userMsg = { role: 'user', content: query, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, document_id: activeDocId, question: query })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chat request failed');
      const assistantMsg = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
      return data;
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}`, isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [sessionId, activeDocId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearChat };
}
