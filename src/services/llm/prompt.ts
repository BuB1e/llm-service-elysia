import type { ControlAnalysisInput } from '../../types/llm.types';

export enum PromptType {
  CONTROL = 'control',
  TEST = 'test',
}

/**
 * Builds a prompt for ISO 27001 control analysis based on the prompt type.
 * This function is centralized here (domain logic) and is provider-agnostic.
 */
export function buildControlPrompt(
  input: ControlAnalysisInput,
  promptType: PromptType
): string {
  switch (promptType) {
    case PromptType.CONTROL:
      return `
You are an ISO 27001:2022 consultant and auditor.

Control: ${input.controlCode} - ${input.title}
Description: ${input.description}
Guidance: ${input.guidance}

Reference context:
${input.retrievedContext ?? ''}

User status: ${input.status}
Current practice: ${input.currentPractice}
Evidence summary: ${input.evidenceSummary}
Company context: ${input.context}

Task:
1) Gap Analysis
2) Action Plan
3) Required Evidence
4) Recommended Documents
5) Risk Rating
6) Maturity (0-5)
`.trim();

    case PromptType.TEST:
      return `
Control code: ${input.controlCode}
Title: ${input.title}
Description: ${input.description}
Guidance: ${input.guidance}
Status: ${input.status}
Current practice: ${input.currentPractice}
Evidence summary: ${input.evidenceSummary}
Company context: ${input.context}

Please tell what this context is about.
`.trim();

    default:
      // Exhaustive check - TypeScript will error if a PromptType case is missing
      const _exhaustiveCheck: never = promptType;
      throw new Error(`Unknown prompt type: ${_exhaustiveCheck}`);
  }
}
