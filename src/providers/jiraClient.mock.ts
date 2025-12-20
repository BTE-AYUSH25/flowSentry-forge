/**
 * MOCK Jira Client
 *
 * Simulates Jira workflow API.
 * Used ONLY for demo / CI / Codegeist proof.
 *
 * IMPORTANT:
 * - Structure matches real Jira concepts
 * - Data is deterministic
 * - No business logic here
 */

export const jiraClient = {
  async fetchWorkflowForProject(projectId: string) {
    // Beginner mistake:
    // Returning random data → breaks determinism
    // We return fixed, realistic data instead.

    if (!projectId) {
      throw new Error("Project not found");
    }

    return {
      id: "WF-DEMO-1",
      statuses: [
        { name: "TODO" },
        { name: "IN_REVIEW" },
        { name: "DONE" }
      ],
      transitions: [
        { from: "TODO", to: "IN_REVIEW" },
        { from: "IN_REVIEW", to: "DONE" }
      ]
    };
  }
};
