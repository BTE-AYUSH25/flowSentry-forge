import { load } from "../storage/storageAdapter";
import type { RiskSnapshot } from "../types/snapshot";

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
