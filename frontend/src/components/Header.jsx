import React from 'react';
import { FileText, MessageSquare, GitCompare, CheckSquare } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
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
