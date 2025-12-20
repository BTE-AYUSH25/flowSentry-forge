import { load } from "../storage/storageAdapter.ts";
import type { RiskSnapshot } from "../types/snapshot.ts";

export const insightProvider = {
  async fetchInsights(projectId: string) {
    const snapshot = load(`snapshot:${projectId}`) as RiskSnapshot | null;

    if (!snapshot) {
      throw new Error("No insights available");
    }

    return {
      riskScore: snapshot.riskScore.overallScore,
      explanations: snapshot.explanation.details
    };
  }
};
