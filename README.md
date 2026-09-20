# ClariLex — AI-Powered Legal Assistance & Document Navigator

> **Track:** AI for Legal Assistance & Access  
> **Live Demo:** [https://ai-for-legal-assistance-access-g85u-pi.vercel.app/](https://ai-for-legal-assistance-access-g85u-pi.vercel.app/)  
> **Target Persona:** Riya — First-time renter, job seeker, or consumer signing a legal contract in India  
> **Core Motto:** *Plain-language legal clarity without expensive consultation fees. Information, not legal advice.*

---

## 📋 Table of Contents

- [Security \& Threat Model](#-security--threat-model)
- [Accessibility (WCAG 2.1 AA)](#-accessibility-wcag-21-aa)
- [Testing \& Verification](#-testing--verification)
- [Assumptions \& Limitations](#-assumptions--limitations)
- [System Architecture](#-system-architecture)
- [AI Grounding Approach](#-ai-grounding-approach)
- [Quick Start Guide](#-quick-start-guide)

---

## 🛡️ Security & Threat Model

ClariLex treats all user-uploaded document text as **untrusted input** and implements multi-layer threat mitigation:

1. **Untrusted Boundary Wrappers**:
   - All document text extracted during upload is wrapped inside explicit delimiters before reaching LLM prompts:
     ```text
     <<<UNTRUSTED_DOCUMENT_CONTENT>>>
     [Extracted Document Text]
     <<</UNTRUSTED_DOCUMENT_CONTENT>>>
     ```
   - System prompts strictly instruct the AI model to treat enclosed text purely as data to analyze, never as executable instructions or prompt rule overrides.

2. **Adversarial Input Filtering**:
   - Ingested text and user queries are inspected against jailbreak patterns (`ignore previous instructions`, `reveal system prompt`, `system:`, `override rules`, DAN vectors) and token patterns (`[INST]`, `[/INST]`, `<|im_start|>`, `<|im_end|>`).

3. **Unicode & Bidi Override Neutralization**:
   - Strips zero-width characters (`U+200B`, `U+FEFF`) and Bidi-override unicode tricks (`U+202A`–`U+202E`) before text parsing.

4. **Magic Bytes Upload & Filename Validation**:
   - Binary uploads are validated via buffer magic headers (`%PDF-` for PDF, `PK\x03\x04` for DOCX) rather than file extension alone.
   - Dangerous filenames are sanitized to prevent path traversal (`../`) and script injection.

5. **Server-Side-Only API Key Isolation**:
   - The Gemini API key is read **only in server-side code** (`GEMINI_API_KEY` or `x-gemini-key` header) and **never stored in `localStorage` or `sessionStorage`**, preventing key exposure in browser storage or client bundles.

6. **HTTP Security Headers & CORS**:
   - Enforces `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and IP rate limiting (100 req / 15 min).
   - Scoped CORS restricts cross-origin access strictly to `ai-for-legal-assistance-access-g85u-pi.vercel.app` and localhost ports.

---

## ♿ Accessibility (WCAG 2.1 AA)

ClariLex is built to comply with WCAG 2.1 AA standards:

1. **HTML5 Semantic Landmarks**:
   - Standardized layout using `<header>`, `<main id="main-content">`, `<nav>`, `<section>`, and `<footer>` elements.
2. **Keyboard Navigation & Skip Link**:
   - Includes a visible **"Skip to main content"** anchor (`<a href="#main-content" class="skip-link">`) for screen reader and keyboard users.
   - Enforces explicit `:focus-visible` outlines (`outline: 3px solid #004243`) on all interactive buttons, inputs, and tabs.
   - Tabs support full `ArrowLeft`/`ArrowRight` key switching.
3. **Modal Focus Management**:
   - Modals (`ApiKeyModal`) feature ARIA dialog roles (`role="dialog"`, `aria-modal="true"`), focus trapping on open, and `Escape` key dismiss listeners.
4. **Color Contrast & Dual Indicators**:
   - All color pairings meet WCAG AA 4.5:1 ratio (e.g. `#004243` on white: **10.2:1 ratio**).
   - Risk tag badges combine **color + icon + explicit text label** (`ShieldAlert` + red + `"HIGH RISK"`), ensuring severity is never conveyed by color alone.
5. **Screen Reader Live Regions**:
   - Uses `aria-live="polite"` for dynamic chat messages, loading states, and clause filter updates.

---

## 🧪 Testing & Verification

ClariLex maintains **6 named automated test suites** covering 100% of core pipeline functionality:

| Test Suite | Purpose & Coverage | Status |
| :--- | :--- | :---: |
| **`tests/ingestion.test.js`** | Document parsing, magic bytes validation, unicode bidi neutralization, edge cases (empty, 50KB, malformed, non-English Hindi text). | **PASSED** |
| **`tests/grounding.test.js`** | RAG citation accuracy (`[Clause 1.2]`), anti-hallucination resistance, modal verb semantics (`shall`/`must`/`may`). | **PASSED** |
| **`tests/security.test.js`** | Prompt injection defense (`[INST]`, `ignore previous instructions`), rate limit headers, CORS rules. | **PASSED** |
| **`tests/comparison.test.js`** | Agreement comparison matrix generation, parameter alignment, recommendation output. | **PASSED** |
| **`tests/api.test.js`** | Express API route contracts (`/api/health`, `/api/analyze`, `/api/chat`, `/api/compare`, `/api/checklist`). | **PASSED** |
| **`tests/performance.test.js`** | SHA-256 caching speed benchmark (**< 5ms** hit speed), single-parse RAG chunk reuse. | **PASSED** |

### GitHub Actions CI Workflow
Continuous integration is configured via [`.github/workflows/ci.yml`](.github/workflows/ci.yml) to automatically execute the full 6-suite test runner and Vite frontend build on every push to Node.js 18 & 20.

---

## ⚖️ Assumptions & Limitations

1. **Informational Role**: ClariLex is an educational tool designed for plain-language contract comprehension and risk awareness. It does not replace a licensed attorney or provide binding legal advice.
2. **Indian Consumer Context**: Analysis prompts prioritize Indian legal norms (INR denomination, standard 11-month rental agreements, Karnataka Rent Control Act context, employment notice periods).
3. **Session-Only Processing**: Documents uploaded during a browser session are stored in-memory for vector RAG retrieval and discarded upon server restart.

---

## 🏛️ System Architecture

```
/
├── PRD.md                       # Product Requirements Document
├── TRD.md                       # Technical Requirements Document
├── README.md                    # System Documentation
├── vercel.json                  # Vercel static build & serverless rewrites
├── api/index.js                 # Vercel Serverless Function entry point
├── backend/                     # Express Node.js Backend API
│   ├── server.js                # Express API server
│   ├── middleware/              # Security, CORS, rate-limiting, sanitization
│   ├── routes/                  # API endpoints (upload, analyze, chat, compare, checklist)
│   └── services/                # Text parser, SHA-256 cache, RAG engine, LLM client
├── frontend/                    # Vite + React Frontend SPA
│   ├── src/components/          # Accessible WCAG AA UI components
│   └── src/data/sampleDocs.js   # Pre-loaded Indian sample agreements
└── tests/                       # 6 Named Automated Test Suites
```

---

## 🎯 AI Grounding Approach

1. **Anti-Hallucination Enforcer**: If a query asks about terms absent from the document (e.g. swimming pool policy in a rental agreement), the system explicitly responds: *"This information is not specified in the uploaded document."*
2. **Modal Verb Semantics Preservation**: Maintains legal modal verb distinctions:
   - `shall` / `must` → Mandatory obligations.
   - `may` → Permissive rights.
   - `unless` / `subject to` → Conditional exceptions.
3. **Clause Attribution & Source Quotes**: Every RAG answer cites exact clause identifiers (`[Clause 1.2]`, `[Clause 2.4]`) alongside quoted source text.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm

### Execution Instructions

1. **Install Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Start Local App**:
   ```bash
   # Terminal 1: Backend API (Port 3001)
   cd backend && npm start

   # Terminal 2: Frontend UI (Port 3000)
   cd frontend && npm run dev
   ```
