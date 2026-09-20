import React from 'react';
import { Shield, Key, Sparkles, FileText, MessageSquare, GitCompare, CheckSquare, Lock } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenApiKeyModal, apiKeyPresent }) {
  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e1e2e9' }}>
      {/* Top Utility Bar */}
      <div style={{ background: '#004243', color: '#ffffff', padding: '0.4rem 1.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.6rem', borderRadius: '4px' }}>
            <Shield size={12} />
            <span>Target Persona: <strong>Riya (First-Time Consumer / Renter)</strong></span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#aceeef' }}>
            <Lock size={12} />
            <span>Session-Only Privacy Active</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onOpenApiKeyModal}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Key size={12} />
            <span>{apiKeyPresent ? 'Gemini API Connected' : 'Configure Gemini API'}</span>
          </button>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#004243', color: 'white', padding: '0.4rem 0.65rem', borderRadius: '6px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>
              ⚖️ ClariLex
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, color: '#004243', margin: 0, lineHeight: 1.2 }}>
                ClariLex Legal Navigator
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#4f5959', margin: 0 }}>
                GenAI Plain-Language Legal Assistant & Risk Analysis for Consumers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <FileText size={16} />
            <span>Document & Summary</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} />
            <span>Grounded Q&A (RAG)</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            <GitCompare size={16} />
            <span>Compare Agreements</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <CheckSquare size={16} />
            <span>Action Checklist</span>
          </button>
        </div>
      </div>
    </header>
  );
}
