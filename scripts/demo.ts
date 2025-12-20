/**
 * DEMO SCRIPT — FlowSentry
 *
 * Purpose:
 * - Prove end-to-end system works
 * - No Jira access required
 * - Uses mock providers
 *
 * This is what you:
 * - Run locally
 * - Run in Codespaces
 * - Record for demo video
 *
 * IMPORTANT:
 * - This file is NOT production code
 * - This file is NOT part of core logic
 * - It ONLY orchestrates and prints output
 */

// -----------------------------
// IMPORT ORCHESTRATOR + PROVIDERS
// -----------------------------

import { handleJiraWebhook } from "../src/index";

// -----------------------------
// DEMO ENTRYPOINT
// -----------------------------

async function runDemo() {
  console.log("====================================");
  console.log("🚀 FlowSentry — Codegeist Demo Start");
  console.log("====================================\n");

  /**
   * STEP 1: Simulate a Jira webhook event
   *
   * Beginner mistake:
   * - Sending random or incomplete payloads
   * We use a REALISTIC Jira-like structure.
   */
  const demoWebhookEvent = {
    source: "jira",
    eventType: "issue_transitioned",
    receivedAt: "2024-01-01T10:00:00Z",
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
  };

  console.log("📥 Incoming Jira Event:");
  console.log(JSON.stringify(demoWebhookEvent, null, 2));
  console.log("\n------------------------------------\n");

  /**
   * STEP 2: Pass event through FULL SYSTEM
   *
   * This triggers:
   * - Event ingestion
   * - Timing update
   * - Workflow resolution
   * - Graph analysis
   * - Rule analysis
   * - Risk computation
   * - Explanation generation
   * - Storage snapshot
   */
  const result = await handleJiraWebhook(demoWebhookEvent);

  console.log("✅ Webhook processed:");
  console.log(result);
  console.log("\n------------------------------------\n");

  /**
   * STEP 3: Fetch dashboard output
   *
   * Beginner mistake:
   * - Recomputing risk here
   * We ONLY read prepared insights.
   */
  const { getDashboardData } = await import(
    "../src/presentation/jira/dashboard"
  );
  const { insightProvider } = await import(
    "../src/providers/insightProvider.mock"
  );

  const dashboard = await getDashboardData(
    "DEMO-PROJ",
    insightProvider
  );

  console.log("📊 Jira Dashboard View:");
  console.log(JSON.stringify(dashboard, null, 2));
  console.log("\n------------------------------------\n");

  /**
   * STEP 4: Generate Confluence report
   *
   * This is static rendering from facts.
   */
  const { renderReport } = await import(
    "../src/presentation/confluence/report"
  );

  // Load snapshot directly for report data
  const { load } = await import("../src/storage/storageAdapter");

  const snapshot = load("snapshot:DEMO-PROJ");

  const report = renderReport("DEMO-PROJ", {
    riskScore: snapshot.riskScore.overallScore,
    summary: snapshot.explanation.summary,
    details: snapshot.explanation.details
  });

  console.log("📄 Confluence Report:");
  console.log("Title:", report.title);
  console.log("Body:\n");
  console.log(report.body);

  console.log("\n====================================");
  console.log("🎉 Demo completed successfully");
  console.log("====================================");
}

/**
 * Run demo safely
 *
 * Beginner mistake:
 * - Not handling async errors
 */
runDemo().catch((err) => {
  console.error("❌ Demo failed:");
  console.error(err);
  process.exit(1);
});
