/**
 * Forge entrypoint for FlowSentry
 *
 * This file proves:
 * - Forge runtime usage
 * - Atlassian integration
 *
 * IMPORTANT:
 * - No business logic here
 * - Calls existing orchestrator only
 */

import Resolver from "@forge/resolver";
import { handleJiraWebhook } from "../src/index";

const resolver = new Resolver();

/**
 * Minimal Forge function
 * Triggered by Jira UI or manually for demo
 */
resolver.define("run", async () => {
  // Simulated Jira event (same as demo.ts)
  await handleJiraWebhook({
    source: "jira",
    eventType: "issue_transitioned",
    receivedAt: new Date().toISOString(),
    payload: {
      issue: {
        id: "ISSUE-1",
        fields: { project: { id: "DEMO-PROJ" } }
      },
      changelog: {
        fromString: "IN_REVIEW",
        toString: "DONE"
      }
    }
  });

  return {
    status: "FlowSentry Forge execution successful"
  };
});

export const run = resolver.getDefinitions();
