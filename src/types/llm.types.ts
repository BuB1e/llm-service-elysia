/**
 * Type definitions for LLM Service
 */

// Input for control analysis
export interface ControlAnalysisInput {
  controlCode: string;
  title: string;
  description: string;
  guidance: string;
  status: string;
  currentPractice: string;
  evidenceSummary: string;
  context: string;
  retrievedContext?: string; // RAG-ready: will be populated when RAG is implemented
  testmode?: boolean;
}

// Result from AI analysis
export interface ControlAnalysisResult {
  aiSuggestion: string;
  testMode?: boolean;       // Indicates this is a test mode response
  connectionStatus?: string; // Connection status for test mode ('ok' or error)
  // Future fields can be added here for structured parsing:
  // gapAnalysis?: string;
  // actionPlan?: string[];
  // requiredEvidence?: string[];
  // riskRating?: string;
  // maturityLevel?: number;
}
