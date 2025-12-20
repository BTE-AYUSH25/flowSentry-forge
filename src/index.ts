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

import { TimingAnalyzerError } from "./timing-analyzer/timingAnalyzer";

import { ingestEvent } from "./ingestion/eventIngestion";
import { updateTiming, computeBottlenecks } from "./timing-analyzer/timingAnalyzer";
import { resolveWorkflow } from "./workflow-resolver/workflowResolver";
import { analyzeGraph } from "./graph-analyzer/graphAnalyzer";
import { analyzeRules } from "./rule-analyzer/ruleAnalyzer";
import { computeRisk } from "./risk-engine/riskEngine";
import { explainRisk } from "./explanation-engine/explanationEngine";

import { getDashboardData } from "./presentation/jira/dashboard";
import { renderReport } from "./presentation/confluence/report";

// External providers (mocked for demo / CI)
import { jiraClient } from "./providers/jiraClient.mock";
import { ruleProvider } from "./providers/ruleProvider.mock";
import { insightProvider } from "./providers/insightProvider.mock";

import { save, read } from "./storage/storageAdapter";
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
} catch (err:any) {
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


/**
 * UI Resolver — SAFE, FAST, READ-ONLY
 * Beginner mistake: recomputing everything here ❌
 * Correct: read stored snapshot ✅
 */
// Forge UI resolver
export async function getRiskSnapshot(event: any) {
  const issueKey = event.context.extension.issue.key;
  const projectKey = issueKey.split("-")[0];

  const snapshot = await read(`snapshot:${projectKey}`);

  return {
    issueKey,
    projectKey,
    ...(snapshot ?? {
      riskScore: 0,
      explanation: "No workflow data collected yet.",
      alerts: []
    })
  };
}
/**
 * DEMO ACTION — used ONLY for demo & video
 * Beginner mistake: wiring UI directly to business logic ❌
 * Correct: controlled demo trigger ✅
 */
export async function runDemoAnalysis(event: any) {
  const issueKey = event.context.extension.issue.key;
  const projectKey = issueKey.split("-")[0];

  const demoSnapshot = {
    riskScore: 0.72,
    explanation:
      "High workflow risk detected. Issues spend excessive time in IN_PROGRESS.",
    alerts: [
      "Bottleneck detected at IN_PROGRESS",
      "Dead-end state detected: DONE"
    ]
  };

  await save(`snapshot:${projectKey}`, demoSnapshot);

  return demoSnapshot;
}
/**
 * Forge entrypoint
 * DO NOT put business logic here.
 * Forge requires this exact export.
 */
/**
 * Forge-required entrypoint.
 * Must exist for handler: index.run
 */
export async function run(event: any, context: any) {
  return { status: "OK" };
}
