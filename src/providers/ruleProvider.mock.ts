/**
 * MOCK Automation Rule Provider
 *
 * Simulates Jira Automation rules.
 */

export const ruleProvider = {
  async fetchRules(projectId: string) {
    if (!projectId) {
      throw new Error("Rules unavailable");
    }

    return [
      {
        id: "RULE-1",
        trigger: "ISSUE_UPDATED",
        actions: [
          { field: "status", value: "DONE" }
        ]
      },
      {
        id: "RULE-2",
        trigger: "ISSUE_UPDATED",
        actions: [
          { field: "status", value: "IN_REVIEW" }
        ]
      }
    ];
  }
};
