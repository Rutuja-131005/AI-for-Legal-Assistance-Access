import React from 'react';
import { Shield, Key, FileText, MessageSquare, GitCompare, CheckSquare, Lock } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onOpenApiKeyModal, apiKeyPresent }) {
  const tabs = [
    { id: 'summary', label: 'Document & Summary', icon: FileText },
    { id: 'chat', label: 'Grounded Q&A (RAG)', icon: MessageSquare },
    { id: 'compare', label: 'Compare Agreements', icon: GitCompare },
    { id: 'checklist', label: 'Action Checklist', icon: CheckSquare }
  ];

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextTab = tabs[(index + 1) % tabs.length].id;
      setActiveTab(nextTab);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevTab = tabs[(index - 1 + tabs.length) % tabs.length].id;
      setActiveTab(prevTab);
    }
  };

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e1e2e9' }} role="banner">
      {/* Top Utility Bar */}
      <div style={{ background: '#004243', color: '#ffffff', padding: '0.4rem 1.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.6rem', borderRadius: '4px' }}>
            <Shield size={12} aria-hidden="true" />
            <span>Target Persona: <strong>Riya (First-Time Consumer / Renter)</strong></span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#aceeef' }}>
            <Lock size={12} aria-hidden="true" />
            <span>Session-Only Privacy Active</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onOpenApiKeyModal}
            aria-label="Configure Gemini API key"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '4px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Key size={12} aria-hidden="true" />
            <span>{apiKeyPresent ? 'Gemini API Connected' : 'Configure Gemini API'}</span>
          </button>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#004243', color: 'white', padding: '0.4rem 0.65rem', borderRadius: '6px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }} aria-hidden="true">
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
        <div className="nav-tabs" role="tablist" aria-label="Legal Assistant Navigation">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
