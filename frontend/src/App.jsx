import React, { useState } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import SummaryView from './components/SummaryView';
import GroundedChat from './components/GroundedChat';
import CompareView from './components/CompareView';
import ChecklistView from './components/ChecklistView';
import Disclaimer from './components/Disclaimer';
import { SAMPLE_DOCUMENTS } from './data/sampleDocs';

export default function App() {
  const [activeTab, setActiveTab] = useState('summary');
  const [docSession, setDocSession] = useState({
    sessionId: `sample-${SAMPLE_DOCUMENTS[0].id}`,
    document_id: `DOC_SAMPLE_${SAMPLE_DOCUMENTS[0].id}`,
    filename: SAMPLE_DOCUMENTS[0].filename,
    text: SAMPLE_DOCUMENTS[0].text,
    classification: SAMPLE_DOCUMENTS[0].classification,
    summary: SAMPLE_DOCUMENTS[0].summary,
    checklist: SAMPLE_DOCUMENTS[0].checklist
  });
  const [loading, setLoading] = useState(false);

  const handleDocumentLoaded = async (loadedData) => {
    if (loadedData.loading) {
      setLoading(true);
      return;
    }

    if (loadedData.sampleData) {
      setDocSession({
        sessionId: `sample-${loadedData.sampleData.id}`,
        document_id: `DOC_SAMPLE_${loadedData.sampleData.id}`,
        filename: loadedData.sampleData.filename,
        text: loadedData.sampleData.text,
        classification: loadedData.sampleData.classification,
        summary: loadedData.sampleData.summary,
        checklist: loadedData.sampleData.checklist
      });
      setLoading(false);
      return;
    }

    // Call API server for live upload analysis
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: loadedData.sessionId,
          document_id: loadedData.document_id,
          text: loadedData.text,
          filename: loadedData.filename
        })
      });
      const data = await response.json();

      setDocSession({
        sessionId: loadedData.sessionId,
        document_id: data.document_id || loadedData.document_id || `DOC_${Date.now()}`,
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
        document_id: loadedData.document_id || `DOC_${Date.now()}`,
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
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main id="main-content" className="main-content" tabIndex="-1">

        <UploadZone onDocumentLoaded={handleDocumentLoaded} loading={loading} />

        {loading ? (
          <div className="clarilex-card" role="status" aria-live="polite" style={{ textAlign: 'center', padding: '3rem' }}>
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
                document_id={docSession.document_id}
                docText={docSession.text}
              />
            )}

            {activeTab === 'compare' && (
              <CompareView />
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
    </div>
  );
}
