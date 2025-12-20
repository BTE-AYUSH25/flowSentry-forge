/**
 * Forge entrypoint for FlowSentry
 */

import Resolver from "@forge/resolver";
import { handleJiraWebhook } from "../src/index.ts";

// 🔑 TypeScript fix: Forge Resolver is constructable at runtime,
// but its NodeNext typings don't declare it.
const resolver = new (Resolver as unknown as { new (): any })();

resolver.define("run", async () => {
  await handleJiraWebhook({
    source: "jira",
    eventType: "issue_transitioned",
    receivedAt: new Date().toISOString(),
    payload: {
      issue: {
        id: "ISSUE-1",
        fields: {
          project: { id: "DEMO-PROJ" }
        }
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
