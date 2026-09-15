/**
 * ClariLex - Types & Domain Models
 * AI-Powered Legal Assistance & Document Navigator
 */

export type RiskLevel = 'critical' | 'warning' | 'advisory' | 'standard';

export type DocumentCategory =
  | 'residential_lease'
  | 'employment_agreement'
  | 'independent_contractor'
  | 'nda_confidentiality'
  | 'terms_of_service'
  | 'loan_debt'
  | 'general_contract';

export interface DocumentParty {
  name: string;
  role: string; // e.g. "Landlord", "Tenant", "Employer", "Employee", "Contractor", "Client"
  obligationsCount?: number;
}

export interface Clause {
  id: string;
  index: number;
  title: string;
  category: 'financial' | 'termination' | 'liability' | 'privacy' | 'restrictions' | 'governing_law' | 'general';
  text: string;
  plainEnglishSummary?: string;
  riskLevel: RiskLevel;
  riskReason?: string;
  suggestedRevision?: string;
}

export interface RedFlag {
  id: string;
  clauseId: string;
  clauseTitle: string;
  verbatimQuote: string;
  riskLevel: 'critical' | 'warning' | 'advisory';
  category: string;
  issue: string; // "Why this matters to you"
  counterProposal: string; // "What to ask for instead"
  practicalImpact: string; // Concrete financial or personal impact
  legalPrinciple?: string; // e.g. "Unilateral waiver of liability"
}

export interface RightObligation {
  type: 'right' | 'obligation' | 'restriction';
  party: string;
  description: string;
  importance: 'high' | 'medium' | 'standard';
  clauseReference?: string;
}

export interface ContractAnalysis {
  documentTitle: string;
  category: DocumentCategory;
  categoryDisplayName: string;
  executiveSummary: string;
  keyEntities: {
    parties: DocumentParty[];
    effectiveDate?: string;
    expirationDate?: string;
    jurisdiction?: string;
    totalFinancialCommitment?: string;
    renewalTerms?: string;
    noticePeriod?: string;
  };
  overallRiskScore: number; // 0 to 100 (higher means safer, or 0-100 where higher is riskier? Let's use 0-100 Health Score: 100 is Safe, 30 is Dangerous)
  riskScoreLabel: 'Safe & Balanced' | 'Moderate Caution' | 'Significant Risks' | 'High-Risk Trap';
  riskBreakdown: {
    financial: number; // 0-100 safety
    rightsProtection: number;
    terminationFlexibility: number;
    liabilityFairness: number;
  };
  redFlags: RedFlag[];
  rightsAndObligations: RightObligation[];
  clauses: Clause[];
  missingStandardProtections: string[];
  rawText: string;
  wordCount: number;
  processedAt: string;
}

export interface QuestionAnswer {
  id: string;
  question: string;
  answer: string;
  isGrounded: boolean;
  citedClauses: {
    clauseId: string;
    clauseTitle: string;
    quote: string;
  }[];
  confidence: 'high' | 'medium' | 'low';
  missingClauseWarning?: string;
  timestamp: string;
}

export interface DocumentComparisonResult {
  doc1Title: string;
  doc2Title: string;
  riskScore1: number;
  riskScore2: number;
  safetyDelta: number; // e.g. +18% safer
  summaryOfChanges: string;
  clauseDiffs: {
    category: string;
    title: string;
    status: 'improved' | 'worsened' | 'unchanged' | 'new' | 'removed';
    explanation: string;
    doc1Excerpt?: string;
    doc2Excerpt?: string;
  }[];
  negotiationWins: string[];
  remainingConcerns: string[];
}

export interface SampleContract {
  id: string;
  title: string;
  category: DocumentCategory;
  description: string;
  badge: string;
  riskLevel: 'critical' | 'warning' | 'advisory';
  rawText: string;
  counterOfferText?: string;
  suggestedQuestions: string[];
}

export interface NegotiationDraftRequest {
  selectedRedFlagIds: string[];
  tone: 'diplomatic' | 'assertive' | 'inquisitive';
  senderName: string;
  recipientName: string;
  customNotes?: string;
}

export interface NegotiationDraftResponse {
  subject: string;
  body: string;
  highlightedModifications: {
    clauseTitle: string;
    originalQuote: string;
    proposedRedline: string;
    justification: string;
  }[];
}
