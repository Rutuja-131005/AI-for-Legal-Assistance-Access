import React from 'react';
import { FileText, MessageSquare, GitCompare, CheckSquare, Globe, PhoneCall } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, jurisdiction = 'India (General)', setJurisdiction = () => {} }) {
  const tabs = [
    { id: 'summary', label: 'Document & Summary', icon: FileText },
    { id: 'chat', label: 'Grounded Q&A (RAG)', icon: MessageSquare },
    { id: 'compare', label: 'Compare Agreements', icon: GitCompare },
    { id: 'checklist', label: 'Action Checklist', icon: CheckSquare }
  ];

  const jurisdictions = [
    'India (General)',
    'Maharashtra',
    'Karnataka',
    'Delhi NCR',
    'United States / Intl'
  ];

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab(tabs[(index + 1) % tabs.length].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab(tabs[(index - 1 + tabs.length) % tabs.length].id);
    }
  };

  return (
    <header style={{ background: '#ffffff', borderBottom: '1px solid #e1e2e9' }} role="banner">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#004243', color: 'white', padding: '0.4rem 0.65rem', borderRadius: '6px', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }} aria-hidden="true">
            ⚖️ ClariLex
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 600, color: '#004243', margin: 0, lineHeight: 1.2 }}>
              ClariLex Legal Navigator
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#4f5959', margin: 0 }}>
              GenAI Plain-Language Legal Assistant & Risk Analysis
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8f9ff', border: '1px solid #cde', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
            <Globe size={15} style={{ color: '#004243' }} aria-hidden="true" />
            <label htmlFor="jurisdiction-select" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#004243' }}>Jurisdiction:</label>
            <select
              id="jurisdiction-select"
              aria-label="Select Legal Jurisdiction"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', fontWeight: 500, color: '#191c21', cursor: 'pointer' }}
            >
              {jurisdictions.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          <div style={{ background: '#fff0f0', border: '1px solid #ffb4b4', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', color: '#b30000', display: 'flex', alignItems: 'center', gap: '0.35rem' }} title="National Legal Services Authority Helpline">
            <PhoneCall size={13} aria-hidden="true" />
            <span>Emergency Legal Aid: <strong>15100 (NALSA)</strong></span>
          </div>
        </div>
      </div>

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
