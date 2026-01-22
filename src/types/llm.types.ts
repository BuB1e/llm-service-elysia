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
  evidenceDescription?: string | null;
  userContext?: string | null;
  // below this is not currently used but reserved for future use
  retrievedContext?: string; // RAG-ready: will be populated when RAG is implemented
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
