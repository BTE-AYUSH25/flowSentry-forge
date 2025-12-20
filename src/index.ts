// src/index.ts

/**
 * SYSTEM ORCHESTRATOR
 *
 * Purpose:
 * - Integrate Modules 1 → 9
 * - Preserve contracts
 * - Control execution order
 *
 * IMPORTANT:
 * - No logic duplication
 * - No data mutation
 * - No shortcuts
 */

// MODULE IMPORTS
import { TimingAnalyzerError } from "./timing-analyzer/timingAnalyzer.ts";

import { ingestEvent } from "./ingestion/eventIngestion.ts";
import { updateTiming, computeBottlenecks } from "./timing-analyzer/timingAnalyzer.ts";
import { resolveWorkflow } from "./workflow-resolver/workflowResolver.ts";
import { analyzeGraph } from "./graph-analyzer/graphAnalyzer.ts";
import { analyzeRules } from "./rule-analyzer/ruleAnalyzer.ts";
import { computeRisk } from "./risk-engine/riskEngine.ts";
import { explainRisk } from "./explanation-engine/explanationEngine.ts";
import { save } from "./storage/storageAdapter.ts";
import { getDashboardData } from "./presentation/jira/dashboard.ts";
import { renderReport } from "./presentation/confluence/report.ts";

// External providers (mocked for demo / CI)
import { jiraClient } from "./providers/jiraClient.mock.ts";
import { ruleProvider } from "./providers/ruleProvider.mock.ts";
import { insightProvider } from "./providers/insightProvider.mock.ts";


// -----------------------------
// ENTRYPOINT: Webhook Handler
// -----------------------------

export async function handleJiraWebhook(rawEvent: any) {
  // 1️⃣ Normalize incoming event
  const normalizedEvent = ingestEvent(rawEvent);

  // 2️⃣ Update timing metrics
  if (normalizedEvent.eventType === "STATUS_CHANGE") {
    updateTiming({
      issueId: normalizedEvent.issueId,
      fromState: normalizedEvent.fromState!,
      toState: normalizedEvent.toState!,
      timestamp: normalizedEvent.timestamp
    });
  }

  // 3️⃣ Resolve workflow definition
  const workflow = await resolveWorkflow(
    normalizedEvent.projectId,
    jiraClient
  );

  // 4️⃣ Analyze workflow structure
  const graphAnalysis = analyzeGraph(workflow);

  // 5️⃣ Compute timing bottlenecks
 let timingAnalysis;

try {
  timingAnalysis = computeBottlenecks(
    normalizedEvent.projectId
  );
} catch (err) {
  // Beginner mistake:
  // Catching ALL errors silently.
  // We ONLY catch the expected "no data yet" case.
  if (
    err instanceof TimingAnalyzerError &&
    err.code === "INSUFFICIENT_DATA"
  ) {
    // Expected during early lifecycle (first event)
    timingAnalysis = {
      stateAverages: {},
      bottlenecks: []
    };
  } else {
    // Any other error is REAL and must crash
    throw err;
  }
}


  // 6️⃣ Analyze automation rules
  const ruleConflicts = await analyzeRules(
    normalizedEvent.projectId,
    ruleProvider
  );

  // 7️⃣ Compute deterministic risk
  const riskScore = computeRisk(
    graphAnalysis,
    timingAnalysis,
    ruleConflicts
  );

  // 8️⃣ Generate explanations
  const explanation = explainRisk(riskScore, {
    graph: graphAnalysis,
    timing: timingAnalysis,
    automation: ruleConflicts
  });

  // 9️⃣ Persist snapshot (for UI)
  save(`snapshot:${normalizedEvent.projectId}`, {
    riskScore,
    explanation
  });

  return { status: "OK" };
}
