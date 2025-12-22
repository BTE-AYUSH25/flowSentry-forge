/**
 * Forge entrypoint for FlowSentry
 */

import Resolver from "@forge/resolver";

const resolver = new Resolver();

resolver.define("run", async () => {
  // Simulate a Jira event (since handleJiraWebhook is no longer exported)
  console.log("[FlowSentry] Demo webhook processing...");
  
  return {
    status: "FlowSentry Forge execution successful",
    demoMode: true
  };
});

export const run = resolver.getDefinitions();