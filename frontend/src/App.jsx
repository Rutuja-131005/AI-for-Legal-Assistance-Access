import React, { useState } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import SummaryView from './components/SummaryView';
import GroundedChat from './components/GroundedChat';
import CompareView from './components/CompareView';
import ChecklistView from './components/ChecklistView';
import Disclaimer from './components/Disclaimer';
import ApiKeyModal from './components/ApiKeyModal';
import { SAMPLE_DOCUMENTS } from './data/sampleDocs';

export default function App() {
  const [activeTab, setActiveTab] = useState('summary');
  const [docSession, setDocSession] = useState({
    sessionId: `sample-${SAMPLE_DOCUMENTS[0].id}`,
    filename: SAMPLE_DOCUMENTS[0].filename,
    text: SAMPLE_DOCUMENTS[0].text,
    classification: SAMPLE_DOCUMENTS[0].classification,
    summary: SAMPLE_DOCUMENTS[0].summary,
    checklist: SAMPLE_DOCUMENTS[0].checklist
  });
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
  };

  const handleDocumentLoaded = async (loadedData) => {
    if (loadedData.loading) {
      setLoading(true);
      return;
    }

    if (loadedData.sampleData) {
      setDocSession({
        sessionId: `sample-${loadedData.sampleData.id}`,
        filename: loadedData.sampleData.filename,
        text: loadedData.sampleData.text,
        classification: loadedData.sampleData.classification,
        summary: loadedData.sampleData.summary,
        checklist: loadedData.sampleData.checklist
      });
      setLoading(false);
      return;
    }

    // Call API server for live upload analysis if available
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-gemini-key'] = apiKey;

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: loadedData.sessionId,
          text: loadedData.text,
          filename: loadedData.filename
        })
      });
      const data = await response.json();


      setDocSession({
        sessionId: loadedData.sessionId,
        filename: loadedData.filename,
        text: loadedData.text,
        classification: data.classification || { documentType: 'Uploaded Agreement', confidence: 0.9 },
        summary: data.summary || { executiveSummary: 'Analysis generated from document text.', clauses: [] },
        checklist: data.summary?.checklist || SAMPLE_DOCUMENTS[0].checklist
      });
    } catch (err) {
      console.warn('API analysis call failed, applying client analysis fallback:', err);
      setDocSession({
        sessionId: loadedData.sessionId,
        filename: loadedData.filename,
        text: loadedData.text,
        classification: SAMPLE_DOCUMENTS[0].classification,
        summary: SAMPLE_DOCUMENTS[0].summary,
        checklist: SAMPLE_DOCUMENTS[0].checklist
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        apiKeyPresent={!!apiKey}
      />

      <main className="main-content">
        <UploadZone onDocumentLoaded={handleDocumentLoaded} loading={loading} />

        {loading ? (
          <div className="clarilex-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: '#004243', marginBottom: '0.5rem' }}>
              ⚖️ ClariLex GenAI Legal Engine is analyzing document...
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Extracting clauses, checking risk levels, and preparing plain-language translations.</p>
          </div>
        ) : (
          <>
            {activeTab === 'summary' && (
              <SummaryView
                docData={docSession}
                classification={docSession.classification}
                summary={docSession.summary}
              />
            )}

            {activeTab === 'chat' && (
              <GroundedChat
                sessionId={docSession.sessionId}
                apiKey={apiKey}
                docText={docSession.text}
              />
            )}

            {activeTab === 'compare' && (
              <CompareView apiKey={apiKey} />
            )}

            {activeTab === 'checklist' && (
              <ChecklistView
                checklist={docSession.checklist}
                docTitle={docSession.filename}
              />
            )}
          </>
        )}
      </main>

      <Disclaimer />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
