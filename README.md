# ClariLex — AI for Legal Assistance & Access

[![CI Suite](https://github.com/Rutuja-131005/AI-for-Legal-Assistance-Access/actions/workflows/ci.yml/badge.svg)](https://github.com/Rutuja-131005/AI-for-Legal-Assistance-Access/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-729b1b.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Empowering non-lawyers with AI-driven, accessible, and grounded legal contract analysis, risk detection, and plain-language guidance.**

---

## 🌟 Overview

**ClariLex** is an enterprise-grade AI legal assistant designed to democratize access to legal understanding. Contracts are often dense, predatory, and written in complex legalese. ClariLex analyzes legal documents, flags high-risk clauses, extracts rights & obligations, provides balanced counter-proposals, and answers questions with exact quote citations—without fabricating legal information.

---

## ✨ Key Features

- 📑 **Instant Contract Analysis**: Classifies document categories (Leases, Employment, Contractor, Terms of Service, NDAs) and extracts key entities (Landlord/Tenant, Employer/Employee).
- 🚩 **Predatory Red Flag Detection**: Highlights dangerous indemnities, automatic renewals, unilateral termination rights, and excessive late fees with severity rankings.
- ⚖️ **Rights & Obligations Matrix**: Breaks down tenant/employer duties and rights into plain-language summaries.
- 💬 **Grounded Q&A Engine**: Ask questions about the contract and receive answers grounded strictly in document text with exact clause citations (zero-hallucination fallback).
- 🔄 **Document Comparison & Negotiation**: Compare modified drafts against original contracts to track negotiation wins and remaining safety concerns.
- ♿ **WAI-ARIA Accessibility**: Fully accessible keyboard navigation, screen-reader support, ARIA tablists, and accessible dialog modals.
- 🛡️ **Hardened Security Architecture**: Strict CORS, 3-tier rate limiting, Helmet HTTP headers, XML prompt injection isolation (`<untrusted_document_data>`), and Zod validation.

---

## 🏗️ Architecture & Technology Stack

```
AI-for-Legal-Assistance-Access/
├── server/                       # Node.js + Express Backend Layer
│   ├── middleware/               # Security, Rate Limiter, Validator, Session Auth
│   │   ├── security.ts           # Helmet headers & CORS origin enforcement
│   │   ├── rateLimiter.ts        # 3-Tier IP Rate Limiting (Global, Upload, AI)
│   │   ├── validator.ts          # Zod Payload Schemas & Size Caps
│   │   └── errorHandler.ts       # Secure error sanitizer (no stack trace leak)
│   └── services/                 # Modular Domain Logic Layer
│       ├── categoryDetector.ts   # Document Category Classifier
│       ├── clauseSegmenter.ts    # Section & Clause Boundary Splitter
│       ├── redFlagDetector.ts    # Predatory Pattern Matcher & Risk Engine
│       ├── entityExtractor.ts    # Party & Date Entity Extraction
│       ├── rightsObligationsExtractor.ts # Rights & Obligations Matrix Generator
│       ├── riskScorer.ts         # Weighted Safety Score Algorithm (0-100)
│       ├── aiAnalyzer.ts         # Gemini 2.5 Flash LLM Integrator
│       └── analysisService.ts    # Main Orchestrator Pipeline
├── src/                          # React 19 Frontend Application
│   ├── components/               # Accessible UI Components
│   └── types/                    # Shared TypeScript Type Definitions
├── tests/                        # Vitest Automated Test Suite (63 Tests)
│   ├── unit/                     # Unit Tests (Parsers, Services, Detectors)
│   ├── integration/              # Integration API Endpoint Tests
│   ├── security/                 # Penetration & Prompt Injection Tests
│   ├── components/               # React Component Tests
│   └── accessibility/            # WAI-ARIA Role & Focus Tests
└── .github/workflows/ci.yml      # CI/CD Automated Test Pipeline
```

---

## 🔒 Security & Privacy

ClariLex is built following strict application security guidelines:

1. **Backend-Only API Keys**: `GEMINI_API_KEY` is strictly managed server-side and never exposed to the client bundle.
2. **Prompt Injection Defense**: Untrusted user documents are sanitized and enclosed in `<untrusted_document_data>` tags before LLM processing.
3. **Rate Limiting**: Protects against DoS and API abuse via tiered memory limiters.
4. **Session Isolation**: Document sessions use isolated headers to prevent cross-tenant data access.
5. **No Sample-Data Pollution**: Real document analysis never leaks hardcoded sample names (`Skyline Real Estate`, `Riya Sharma`).

---

## 🧪 Automated Testing & Coverage

ClariLex maintains a 100% passing test suite powered by Vitest, `@testing-library/react`, and `jsdom`.

```bash
# Run full test suite
npm test

# Run tests with code coverage report
npm run test:coverage

# Run TypeScript type safety check
npm run typecheck

# Run ESLint code quality check
npm run lint
```

### Test Suite Summary

- **Test Files**: `13`
- **Total Tests**: `63` (`100% Passing`)
- **Overall Line Coverage**: `71.23%`
  - *Core Business Logic*: `84.5%`
  - *Security & Middleware*: `91.9%`
  - *API Integration*: `85.0%`
- **Typecheck Result**: `0 Compilation Errors` (`tsc --noEmit`)
- **Lint Result**: `0 Errors, 0 Warnings` (`eslint .`)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later
- **npm**: `v10.x` or later

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rutuja-131005/AI-for-Legal-Assistance-Access.git
   cd AI-for-Legal-Assistance-Access
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   PORT=3001
   NODE_ENV=development
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Express Backend API: `http://localhost:3001`

---

## 📦 Production Build

To build the application bundle and backend server for deployment:

```bash
npm run build
```

To run the production build:
```bash
npm start
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
