// src/index.ts - ENHANCED WITH ROVO AI

/**
 * SYSTEM ORCHESTRATOR (Enhanced with Rovo AI)
 */

import { TimingAnalyzerError } from "./timing-analyzer/timingAnalyzer";
import { ingestEvent } from "./ingestion/eventIngestion";
import { updateTiming, computeBottlenecks } from "./timing-analyzer/timingAnalyzer";
import { resolveWorkflow } from "./workflow-resolver/workflowResolver";
import { analyzeGraph } from "./graph-analyzer/graphAnalyzer";
import { analyzeRules } from "./rule-analyzer/ruleAnalyzer";
import { computeRisk } from "./risk-engine/riskEngine";
import { explainRisk } from "./explanation-engine/explanationEngine";
import { save, read } from "./storage/storageAdapter";

// Rovo AI Agent Integration
import { FlowSentryRovoAgent } from "./rovo-agent/rovoAdapter";
import { CompetitionMode } from "./competition/competition-mode";

// External providers
import { jiraClient } from "./providers/jiraClient.mock";
import { ruleProvider } from "./providers/ruleProvider.mock";

/**
 * ENTRYPOINT: Webhook / Trigger Handler (Enhanced)
 */
export async function handleJiraWebhook(rawEvent: any) {
  // 1. INGESTION (Module 1)
  const normalizedEvent = ingestEvent(rawEvent);

  // 2. TIMING UPDATE (Module 4)
  if (normalizedEvent.eventType === "STATUS_CHANGE") {
    updateTiming({
      issueId: normalizedEvent.issueId,
      fromState: normalizedEvent.fromState!,
      toState: normalizedEvent.toState!,
      timestamp: normalizedEvent.timestamp
    });
  }

  // 3. RESOLUTION & STRUCTURE (Module 2 & 3)
  const workflow = await resolveWorkflow(normalizedEvent.projectId, jiraClient);
  const graphAnalysis = analyzeGraph(workflow);

  // 4. BOTTLENECK ANALYSIS (Module 4)
  let timingAnalysis;
  try {
    timingAnalysis = computeBottlenecks(normalizedEvent.projectId);
  } catch (err: any) {
    if (err instanceof TimingAnalyzerError && err.code === "INSUFFICIENT_DATA") {
      timingAnalysis = { stateAverages: {}, bottlenecks: [] };
    } else {
      throw err;
    }
  }

  // 5. AUTOMATION ANALYSIS (Module 5)
  const ruleConflicts = await analyzeRules(normalizedEvent.projectId, ruleProvider);

  // 6. RISK COMPUTATION (Module 6)
  const riskScore = computeRisk(graphAnalysis, timingAnalysis, ruleConflicts);

  // 7. EXPLANATION GENERATION (Module 7)
  const explanation = explainRisk(riskScore, {
    graph: graphAnalysis,
    timing: timingAnalysis,
    automation: ruleConflicts
  });

  // 8. STORAGE PERSISTENCE (Module 9)
  const snapshotKey = `snapshot:${normalizedEvent.projectId}`;
  await save(snapshotKey, {
    riskScore: riskScore.overallScore,
    explanation: explanation,
    alerts: [...graphAnalysis.deadEnds, ...timingAnalysis.bottlenecks]
  });

  // 🆕 9. ROVO AI AGENT ANALYSIS (Module 11 - Optional Enhancement)
  if (process.env.ENABLE_ROVO_AI === 'true') {
    try {
      const rovoAgent = new FlowSentryRovoAgent(normalizedEvent.projectId);
      
      // Auto-analyze high-risk events
      if (riskScore.overallScore > 0.6) {
        const rovoAnalysis = await rovoAgent.processQuery(
          `High risk detected (${riskScore.overallScore.toFixed(2)}). Analyze root causes.`
        );
        
        await save(`rovo:${normalizedEvent.projectId}`, {
          ...rovoAnalysis,
          triggeredBy: 'high-risk-event',
          triggeredAt: new Date().toISOString()
        });
        
        console.log(`[Rovo AI] Analysis completed for ${normalizedEvent.projectId}`);
      }
    } catch (rovoError) {
  const errorMessage = rovoError instanceof Error ? rovoError.message : 'Unknown error';
  console.warn('[Rovo AI] Agent analysis skipped:', errorMessage);
  // Non-critical - main flow continues
}
  }

  // 🆕 10. COMPETITION MODE FEATURES (Module 12)
  if (process.env.COMPETITION_MODE === 'true') {
    CompetitionMode.enable();
    console.log('[Competition Mode] Event processed with enhanced features');
  }

  // 11. THE "GUARDIAN" MOVE (Original Advanced Feature)
  if (riskScore.overallScore > 0.8) {
     console.log(`[FlowSentry] CRITICAL RISK on ${normalizedEvent.issueId}: Initiating Guard Action.`);
  }

  return { status: "OK", riskScore: riskScore.overallScore };
}

/**
 * UI RESOLVER (Enhanced with Rovo data)
 */
export async function getRiskSnapshot(event: any) {
  const issueKey = event.context.extension.issue.key;
  const projectKey = issueKey.split("-")[0];

  // Fetch the latest prepared analysis
  const snapshot: any = await read(`snapshot:${projectKey}`);
  const rovoInsights: any = await read(`rovo:${projectKey}`);

  return {
    issueKey,
    projectKey,
    riskScore: snapshot?.riskScore || 0,
    explanation: snapshot?.explanation || { 
      summary: "Analyzing workflow health...", 
      details: [] 
    },
    alerts: snapshot?.alerts || [],
    // 🆕 Rovo AI enhancements
    rovoInsights: rovoInsights || null,
    hasAI: !!rovoInsights,
    competitionMode: process.env.COMPETITION_MODE === 'true'
  };
}

/**
 * 🆕 ROVO QUERY HANDLER
 */
export async function rovoQueryHandler(event: any) {
  const { projectId, query } = event.payload;
  
  try {
    const agent = new FlowSentryRovoAgent(projectId);
    const response = await agent.processQuery(query);
    
    // Store for UI access
    await save(`rovo-query:${projectId}:${Date.now()}`, {
      query,
      response,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: true,
      ...response
    };
  } catch (error:any) {
    return {
      success: false,
      error: error.message,
      analysis: "Unable to process query at this time.",
      suggestedActions: ["Check workflow data availability", "Try again in a moment"]
    };
  }
}

/**
 * 🆕 COMPETITION REPORT HANDLER
 */
export async function competitionReportHandler(event: any) {
  const { projectId } = event.payload;
  
  try {
    if (process.env.COMPETITION_MODE !== 'true') {
      throw new Error('Competition mode not enabled');
    }
    
    const report = await CompetitionMode.generateSubmissionReport(projectId);
    
    return {
      success: true,
      report,
      generatedAt: new Date().toISOString()
    };
  } catch (error:any) {
    return {
      success: false,
      error: error.message,
      report: null
    };
  }
}

/**
 * DEMO HANDLER (Enhanced)
 */
export async function runDemoAnalysis(event: any) {
  const issueKey = event.context.extension.issue.key;
  const projectKey = issueKey.split("-")[0];

  const demoSnapshot = {
    riskScore: 0.72,
    explanation: {
        summary: "High workflow risk detected. Issues spend excessive time in IN_PROGRESS.",
        details: ["Structural cycle detected between REVIEW and REWORK."]
    },
    alerts: [
      "Bottleneck detected at IN_PROGRESS",
      "Dead-end state detected: DONE"
    ],
    // 🆕 Added Rovo demo data
    rovoInsights: {
      analysis: "Rovo AI analysis shows review process is major bottleneck.",
      suggestedActions: [
        "Add parallel review path",
        "Set SLA of 24h for IN_REVIEW state"
      ],
      confidence: 0.85
    }
  };

  await save(`snapshot:${projectKey}`, demoSnapshot);
  return demoSnapshot;
}

// Forge Entrypoint
export async function run() {
  return { status: "OK", version: "2.0.0", features: ["rovo-ai", "competition-mode"] };
}
// Add this export to satisfy the manifest's handler requirement
export const uiResolver = getRiskSnapshot;