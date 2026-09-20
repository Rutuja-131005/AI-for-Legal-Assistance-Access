# ClariLex — AI-Powered Legal Assistance & Document Navigator

> **Track:** AI for Legal Assistance & Access  
> **Live Demo:** [https://ai-for-legal-assistance-access-g85u-pi.vercel.app/](https://ai-for-legal-assistance-access-g85u-pi.vercel.app/)  
> **Target Persona:** Riya — First-time renter, job seeker, or consumer signing a legal contract in India  
> **Core Motto:** *Plain-language legal clarity without expensive consultation fees. Information, not legal advice.*

---


## ⚖️ Problem & Solution

Legal documents are intentionally dense, filled with jargon, hidden penalties, restrictive covenants, and lock-in periods. Ordinary consumers routinely sign contracts (rental agreements, job offer letters, loan agreements, platform terms of service) without understanding their rights or exposure.

**ClariLex** bridges this gap using Generative AI to:
1. **Simplify**: Turn complex legal clauses into plain English tailored to an Indian consumer context (INR awareness, lock-in, security deposit, notice periods).
2. **Flag Risks**: Auto-classify clauses as `HIGH RISK`, `OBLIGATION`, `STANDARD`, or `FAVORABLE` with explicit explanations of *why* they matter.
3. **Grounded Q&A (RAG)**: Answer free-form questions anchored strictly in the uploaded document with exact clause citations (`[Clause 4.2]`).
4. **Compare Agreements**: Diff two contracts side-by-side (e.g. Job Offer A vs Job Offer B).
5. **Action Checklist**: Provide an exportable, prioritized list of things to verify, negotiate, or consult a lawyer about.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm

### Setup Instructions

1. **Install Root & Subproject Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Set Up API Key (Optional)**:
   - Create a `.env` file inside `backend/` with `GEMINI_API_KEY=your_key_here`.
   - Alternatively, enter your Gemini API Key directly in the ClariLex UI settings modal.
   - *Note:* ClariLex includes an intelligent pre-analyzed fallback engine and 4 built-in sample contracts, so you can test the full app immediately even without an API key!

3. **Start the Servers**:
   ```bash
   # Terminal 1: Start Backend API (Port 3001)
   cd backend
   npm run dev

   # Terminal 2: Start Frontend UI (Port 3000)
   cd frontend
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

---

## 🏛️ Repository Architecture

```
/
├── PRD.md                       # Product Requirements Document
├── TRD.md                       # Technical Requirements Document
├── README.md                    # System Overview & Instructions
├── .gitignore                   # Workspace exclusions
├── backend/                     # Express Node.js Backend API
│   ├── server.js                # Express API server
│   ├── routes/                  # API endpoints (upload, analyze, chat, compare, checklist)
│   └── services/                # Text parser, RAG engine, LLM client
├── frontend/                    # Vite + React Frontend SPA
│   ├── src/components/          # Accessible UI components (Summary, Risk Tags, RAG Chat, Compare, Checklist)
│   └── src/data/sampleDocs.js   # Pre-loaded Indian sample agreements
├── prompts/                     # System prompt templates
├── sample-docs/                 # Raw sample documents (.txt)
└── tests/                       # Automated parser & RAG tests
```

---

## 🛡️ Legal & Privacy Disclaimer

ClariLex is an educational and informational tool powered by Generative AI. It does not provide legal advice, draft enforceable contracts, or replace a qualified attorney. Documents are processed session-only in memory by default.
