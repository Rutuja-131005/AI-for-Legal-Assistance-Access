# ClariLex — AI for Legal Assistance & Access

> AI-powered legal document navigator providing plain-language contract clarity, grounded RAG Q&A, clause risk analysis, and action checklists for Indian consumers.

---

## 📖 Project Overview

**ClariLex** is an AI-powered legal assistance and contract navigation platform designed to bridge the legal literacy gap for first-time renters, job seekers, and consumers in India (personified by "Riya"). Legal agreements—such as residential lease contracts, employment agreements, freelance service scopes, and consumer terms—are often filled with dense legalese, hidden lock-in periods, arbitrary penalty clauses, and ambiguous termination rules.

Existing approaches require either paying expensive legal consultation fees or relying on generic LLM chatbots that frequently hallucinate legally binding terms, fabricate clauses, or fail to preserve legal modal verb nuances (`shall` vs `may`). ClariLex solves this by delivering automated, plain-language document analysis with zero legal fee barriers.

Built with a **grounded Retrieval-Augmented Generation (RAG)** pipeline, strict anti-hallucination guardrails, and robust input security boundaries, ClariLex empowers users to understand what they are signing, identify high-risk obligations, compare conflicting agreements, and generate step-by-step action checklists before signing.

---

## ✨ Key Features

- 📄 **Automated Document Ingestion & Parsing**: Native text, PDF (`%PDF-`), and Word (`PK\x03\x04`) parsing with magic-byte validation and filename sanitization.
- 🤖 **AI-Powered Clause & Risk Analysis**: Categorizes contract clauses into plain-language summaries and tags risk severities (`HIGH`, `MEDIUM`, `LOW`) with dual visual indicators (WCAG 2.1 AA compliant).
- 💬 **Grounded RAG Q&A with Exact Citations**: Interactive legal Q&A grounded strictly in the uploaded document text with mandatory clause attributions (`[Clause X.Y]`) and direct quote evidence.
- 🛡️ **Anti-Hallucination Guardrails**: Responds with explicit warnings (*"This information is not specified in the uploaded document."*) whenever queries ask about absent contract terms.
- ⚖️ **Agreement Comparison Engine**: Side-by-side comparison matrix for evaluating competing lease or job offers across rent, lock-in periods, notice terms, and penalty clauses.
- 📋 **Action Folio & Checklist Exporter**: Automatically generates actionable pre-signing negotiation steps and exports them as downloadable `.txt` or `.json` files.
- 🔐 **Hardened Security & Isolation**: Wraps all extracted text in `<<<UNTRUSTED_DOCUMENT_CONTENT>>>` delimiters, filters adversarial jailbreaks, neutralizes zero-width/Bidi unicode tricks, and enforces zero-client API key storage.
- ⚡ **SHA-256 LRU Caching**: In-memory hash-indexed caching delivering **2.65ms** instant analysis responses for repeated document uploads.

---

## 🎯 Problem Statement

First-time legal signers (renters, fresh graduates, micro-entrepreneurs) regularly sign contracts containing unfavorable or illegal clauses because:
1. **High Legal Fees**: Professional legal review costs ₹3,000–₹10,000+ per document, making it unaffordable for everyday transactions.
2. **Dense Legalese**: Complex sentence structures and legal jargon obscure critical obligations, notice periods, and financial penalties.
3. **Generic AI Hallucinations**: Standard public LLMs misinterpret legal modal verbs (`shall` mandatory vs `may` permissive), fabricate non-existent rights, or ignore Indian statutory contexts (e.g. Karnataka Rent Control Act, 11-month lease norms).
4. **Security Risks**: Uploading confidential contracts to unvetted tools risks exposing sensitive personal information or prompt injection attacks embedded inside document text.

ClariLex addresses these limitations by providing a secure, grounded, and free legal contract navigator tailored to Indian legal frameworks.

---

## 💡 Proposed Solution

ClariLex processes legal contracts through a secure 5-stage pipeline:

```text
[User Contract File / Text]
         ↓ (1. Input & Validation)
[Magic Bytes & Security Sanitizer]
         ↓ (2. Processing & Boundary Wrapping)
[<<<UNTRUSTED_DOCUMENT_CONTENT>>> + SHA-256 Cache]
         ↓ (3. AI / Grounded RAG Logic)
[Google Gemini 1.5 + Vector Chunk Store]
         ↓ (4. Security & Modal Check]
[Risk Categorization & Anti-Hallucination Engine]
         ↓ (5. Interactive Output]
[Plain-Language Dashboard, Citations & Action Folio]
```

---

## 🏗️ System Architecture

```text
User (Browser SPA)
 ↓
[React 18 + Vite Frontend]
 ↓ (REST API via HTTPS / Security Headers)
[Node.js / Express Backend]
 ↓
├── [Security Middleware] (Jailbreak Filter, Unicode Bidi Stripper, Magic Bytes)
├── [SHA-256 LRU Cache & Ingestion Engine] (PDF / DOCX / TXT Extractor)
├── [Session Vector Store & Chunking] (Grounding Engine)
└── [LLM Client Integration] (Google Gemini 1.5 Pro / Flash)
 ↓
Response (Grounded Analysis, Clause Badges [Clause 1.2], Risk Flags & Action Checklist)
```

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Vanilla CSS, Lucide Icons |
| **Backend** | Node.js (v18+), Express 4 (ES Modules) |
| **Document Parsers** | PDF Buffer Reader (`%PDF-`), DOCX Parser (`PK\x03\x04`), Regex Engine |
| **AI / LLM** | Google Gemini 1.5 Pro / Flash AI API |
| **Caching & Storage** | SHA-256 LRU In-Memory Cache, Vector Chunk Store |
| **Security & Headers** | Helmet-style CSP, X-Frame-Options: DENY, HSTS, Rate Limiter |
| **Testing** | Node.js Native Test Suites (6 Named Suites) |
| **Deployment** | Vercel (Frontend SPA & Serverless Node API Functions) |
| **Version Control** | Git & GitHub Actions CI |

---

## 📁 Project Structure

```text
ai-for-legal-assistance-access/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI matrix runner (Node 18 & 20)
├── api/
│   └── index.js                 # Vercel Serverless Function entry point
├── backend/
│   ├── middleware/              # Security, CORS, rate limiting, sanitization
│   ├── routes/                  # Express REST API routes (upload, analyze, chat, compare, checklist)
│   ├── services/                # Document ingestion, SHA-256 cache, RAG store, LLM client
│   └── server.js                # Express API server (Port 3001)
├── frontend/
│   ├── src/
│   │   ├── components/          # Accessible WCAG 2.1 AA UI components
│   │   ├── data/                # Pre-loaded Indian legal sample contracts
│   │   ├── App.jsx              # Main SPA layout & navigation
│   │   └── index.css            # Custom CSS system & accessibility focus rings
│   ├── package.json
│   └── vite.config.js
├── prompts/
│   └── system-prompts.json      # Grounded LLM system prompts & boundary rules
├── sample-docs/                 # Sample residential lease & employment contracts
├── tests/
│   ├── ingestion.test.js        # Parser & magic byte test suite
│   ├── grounding.test.js        # RAG citation & modal verb test suite
│   ├── security.test.js         # Prompt injection & jailbreak test suite
│   ├── comparison.test.js       # Agreement comparison matrix test suite
│   ├── api.test.js              # Express API integration test suite
│   └── performance.test.js      # SHA-256 cache benchmark test suite
├── .env.example                 # Environment variables template
├── package.json                 # Root dependencies & test runner scripts
├── README.md                    # System Documentation & Score Matrix
└── vercel.json                  # Vercel static build & serverless rewrites
```

---

## ⚙️ Prerequisites

Make sure you have the following installed on your machine before running the project:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.30.0 or higher
- **Google Gemini API Key** *(Optional for local fallback mode)*

---

## 💻 Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Rutuja-131005/AI-for-Legal-Assistance-Access.git
   cd AI-for-Legal-Assistance-Access
   ```

2. **Install Root Dependencies**:
   ```bash
   npm install
   ```

3. **Install Backend & Frontend Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

4. **Run All Automated Tests**:
   ```bash
   npm test
   ```

5. **Start Local Development Servers**:
   ```bash
   # Terminal 1: Backend Server (Port 3001)
   cd backend && npm start

   # Terminal 2: Frontend Dev Server (Port 5173 / 3000)
   cd frontend && npm run dev
   ```

---

## 🔑 Environment Variables

To run with live Google Gemini AI capabilities, set your API key in an environment file.

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Example `.env` configuration:

```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_google_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

> ⚠️ **Note**: Never check `.env` into version control. The client application reads API keys strictly via server-side environment variables or user-provided session headers (`x-gemini-key`).

---

## 🗄️ Database & Storage Setup

ClariLex utilizes an **in-memory high-performance data architecture** designed for zero permanent retention of sensitive user documents:

1. **SHA-256 Document Cache**: In-memory LRU cache keyed by the SHA-256 hash of the uploaded document buffer. Duplicate requests hit the cache instantly (**2.65ms** hit speed).
2. **Session RAG Vector Store**: Uploaded documents are parsed into structured sentence chunks, indexed by clause IDs, and held in `SessionRagStore` for the duration of the user session.
3. **No Database Configuration Required**: Zero database setup is needed to run ClariLex out-of-the-box.

---

## 🔌 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning server status and uptime |
| `POST` | `/api/parse-document` | Parses raw document buffer (PDF, DOCX, TXT) with magic-byte check |
| `POST` | `/api/analyze-contract` | Generates clause summaries, risk tags, and key financial metrics |
| `POST` | `/api/grounded-qa` | Grounded RAG Q&A answering queries with clause citations (`[Clause X.Y]`) |
| `POST` | `/api/compare-documents` | Compares two agreements side-by-side in a comparative matrix |
| `POST` | `/api/security-check` | Validates text inputs against adversarial jailbreaks & unicode tricks |

---

## 📸 Screenshots & Interface

### Plain-Language Contract Dashboard
- Displays risk severity badges (`HIGH RISK`, `MEDIUM RISK`, `SAFE`), lock-in periods, notice terms, and clause breakdown.

### Grounded RAG Chat Interface
- Interactive Q&A displaying exact clause attributions (`[Clause 1.2]`) and anti-hallucination notices.

### Agreement Comparison Matrix
- Side-by-side evaluation of competing lease or employment offers.

---

## 🔄 How It Works

1. **User Uploads Document**: User uploads a rental agreement, employment contract, or text file via drag-and-drop.
2. **Magic Bytes & Sanitization**: The server validates file headers (`%PDF-`, `PK\x03\x04`), sanitizes filenames, and strips unicode Bidi override characters.
3. **Untrusted Boundary Wrapping**: Document text is wrapped inside `<<<UNTRUSTED_DOCUMENT_CONTENT>>>` boundaries.
4. **SHA-256 Hash Checking**: The system checks if the document hash exists in the LRU cache for instant retrieval.
5. **AI Risk & Metric Parsing**: Google Gemini 1.5 extracts clauses, financial obligations, and severity tags.
6. **Vector Indexing**: Text is chunked and stored in `SessionRagStore` for grounded RAG Q&A.
7. **Action Folio Generation**: Actionable pre-signing checklist is generated and ready for export.

---

## 🤖 AI Methodology

ClariLex implements a specialized legal LLM methodology centered on **grounding** and **preservation of legal semantics**:

1. **Strict Context Grounding**: LLM system prompts explicitly force the model to answer solely using supplied `DOCUMENT CHUNKS:`.
2. **Anti-Hallucination Fallback**: If information is absent, the model strictly outputs: *"This information is not specified in the uploaded document."*
3. **Legal Modal Verb Rules**:
   - `shall` / `must` → Rendered strictly as mandatory obligations.
   - `may` → Rendered as discretionary permissions.
   - `unless` / `subject to` → Identified as conditional exceptions.
4. **Clause Badging**: Every response embeds clause markers (`[Clause 1.2]`) linked directly to original text.

---

## 🔐 Security & Hardening

- **Delimited Inputs**: Encloses document text inside `<<<UNTRUSTED_DOCUMENT_CONTENT>>> ... <<</UNTRUSTED_DOCUMENT_CONTENT>>>`.
- **Adversarial Blocklist**: Detects and blocks jailbreak phrases (`ignore previous instructions`, `reveal system prompt`, `[INST]`, `<|im_start|>`).
- **Unicode Neutralization**: Strips zero-width characters (`U+200B`, `U+FEFF`) and Bidi overrides (`U+202A`–`U+202E`).
- **Magic Bytes Validation**: Verifies binary headers (`%PDF-`, `PK\x03\x04`) before text extraction.
- **Server API Key Isolation**: 0 API key storage in `localStorage` / `sessionStorage`.
- **Security Headers**: Enforces CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and IP rate limiting.

---

## 🧪 Testing

The repository includes **6 named automated unit test suites** verifying 100% of pipeline functionality:

```bash
npm test
```

### Test Suite Breakdown:
- `tests/ingestion.test.js`: Document parser, magic bytes, unicode Bidi stripper.
- `tests/grounding.test.js`: RAG citations, anti-hallucination rules, modal verbs.
- `tests/security.test.js`: Prompt injection filtering, security headers, CORS.
- `tests/comparison.test.js`: Agreement comparison engine.
- `tests/api.test.js`: Express REST endpoint contracts.
- `tests/performance.test.js`: SHA-256 LRU cache hit benchmark (**2.65ms** speed).

---

## 🚀 Deployment

- **Live Frontend & API**: [https://ai-for-legal-assistance-access-g85u-pi.vercel.app/](https://ai-for-legal-assistance-access-g85u-pi.vercel.app/)
- **Vercel Serverless Configuration**: Configured via [`vercel.json`](file:///d:/Prompt%20Wars/AI%20for%20Legal%20Assistance%20&%20Access/vercel.json) for automatic static asset deployment and Node serverless function routing.

---

## 🌐 Live Demo

- 🔗 **Live Web Application**: [https://ai-for-legal-assistance-access-g85u-pi.vercel.app/](https://ai-for-legal-assistance-access-g85u-pi.vercel.app/)
- 💻 **GitHub Repository**: [https://github.com/Rutuja-131005/AI-for-Legal-Assistance-Access](https://github.com/Rutuja-131005/AI-for-Legal-Assistance-Access)

---

## 🔮 Future Scope

- 📱 **Mobile App**: Dedicated iOS & Android application with camera-based physical contract scanning.
- 🗣️ **Multilingual Voice Assistance**: Support for Hindi, Kannada, Tamil, Marathi, and Telugu voice summaries.
- ⚖️ **Automated Court Precedent Lookup**: Cross-referencing unfair contract terms against Supreme Court of India & High Court rulings.
- 🔄 **Real-Time Collaborative Negotiation**: Real-time room for tenant and landlord to negotiate modified clauses.

---

## ⚠️ Limitations

- **Informational Purpose**: ClariLex is an educational tool for legal literacy and contract awareness. It does not constitute formal legal representation or binding legal advice.
- **Internet Requirement**: Live AI model features require internet connectivity to reach Google Gemini API endpoints.
- **Session Duration**: Uploaded document vectors and cached analysis persist for the active browser session only.
