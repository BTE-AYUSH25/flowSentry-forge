/**
 * Snapshot type
 *
 * This represents the persisted analysis result.
 * Shared across providers, demo, and presentation.
 */

export interface RiskSnapshot {
  riskScore: {
    overallScore: number;
  };
  explanation: {
    summary: string;
    details: string[];
  };
}
