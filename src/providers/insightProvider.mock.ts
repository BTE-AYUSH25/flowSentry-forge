/**
 * MOCK Insight Provider
 *
 * Acts as read-only bridge between
 * storage and presentation layer.
 */

import { load } from "../storage/storageAdapter";

export const insightProvider = {
  async fetchInsights(projectId: string) {
    const snapshot = load(`snapshot:${projectId}`);

    if (!snapshot) {
      throw new Error("No insights available");
    }

    return {
      riskScore: snapshot.riskScore.overallScore,
      explanations: snapshot.explanation.details
    };
  }
};
