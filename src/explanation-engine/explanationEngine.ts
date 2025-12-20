// src/explanation-engine/explanationEngine.ts

/**
 * MODULE 7: Insight Explanation Engine
 *
 * Responsibility:
 * - Convert risk scores + analysis facts into explanations
 *
 * IMPORTANT:
 * - This module does NOT compute risk
 * - This module does NOT change numbers
 * - This module does NOT hide uncertainty
 * - This module must remain deterministic
 */

// -----------------------------
// Types (match contract exactly)
// -----------------------------

export type RiskScore = {
  overallScore: number;
  breakdown: {
    structure: number;
    timing: number;
    automation: number;
  };
};

export type GraphAnalysis = {
  cycles: string[][];
  deadEnds: string[];
  maxDepth: number;
  unreachableStates: string[];
};

export type TimingAnalysis = {
  stateAverages: Record<string, number>;
  bottlenecks: string[];
};

export type RuleConflictReport = {
  conflicts: {
    ruleA: string;
    ruleB: string;
    trigger: string;
    field: string;
    conflictType: "OVERWRITE" | "LOOP";
  }[];
};

export type Explanation = {
  summary: string;
  details: string[];
};

// -----------------------------
// Custom Error
// -----------------------------

export class ExplanationEngineError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// -----------------------------
// MAIN CONTRACT FUNCTION
// -----------------------------

export function explainRisk(
  riskScore: RiskScore,
  analyses: {
    graph: GraphAnalysis;
    timing: TimingAnalysis;
    automation: RuleConflictReport;
  }
): Explanation {
  // ---- Validation ----
  if (!riskScore || !analyses) {
    throw new ExplanationEngineError(
      "EXPLANATION_MISMATCH",
      "Risk score and analyses are required"
    );
  }

  const details: string[] = [];

  // -----------------------------
  // Structure explanations
  // -----------------------------
  const graph = analyses.graph;

  if (graph.cycles.length > 0) {
    details.push(
      `${graph.cycles.length} workflow cycle(s) detected, which may cause issues to loop indefinitely.`
    );
  }

  if (graph.deadEnds.length > 0) {
    details.push(
      `Dead-end states detected: ${graph.deadEnds.join(", ")}. Issues may get stuck here.`
    );
  }

  if (graph.unreachableStates.length > 0) {
    details.push(
      `Unreachable states found: ${graph.unreachableStates.join(", ")}. These states are never entered.`
    );
  }

  if (graph.maxDepth > 5) {
    details.push(
      `Workflow depth is ${graph.maxDepth}, which increases complexity and review overhead.`
    );
  }

  // -----------------------------
  // Timing explanations
  // -----------------------------
  const timing = analyses.timing;

  if (timing.bottlenecks.length > 0) {
    details.push(
      `Bottleneck states detected: ${timing.bottlenecks.join(
        ", "
      )}. These states take significantly longer than average.`
    );
  }

  // -----------------------------
  // Automation explanations
  // -----------------------------
  const automation = analyses.automation;

  if (automation.conflicts.length > 0) {
    const loopConflicts = automation.conflicts.filter(
      (c) => c.conflictType === "LOOP"
    ).length;

    const overwriteConflicts = automation.conflicts.filter(
      (c) => c.conflictType === "OVERWRITE"
    ).length;

    if (loopConflicts > 0) {
      details.push(
        `${loopConflicts} automation loop conflict(s) detected, which can cause repeated updates.`
      );
    }

    if (overwriteConflicts > 0) {
      details.push(
        `${overwriteConflicts} automation overwrite conflict(s) detected, where rules modify the same field.`
      );
    }
  }

  // -----------------------------
  // Summary generation
  // -----------------------------
  /**
   * Beginner mistake:
   * - Recomputing risk or changing severity here
   * We ONLY reflect what already exists.
   */

  let summary = "Workflow risk is low.";

  if (riskScore.overallScore >= 0.7) {
    summary = "Workflow risk is high due to multiple structural, timing, or automation issues.";
  } else if (riskScore.overallScore >= 0.4) {
    summary = "Workflow risk is moderate and may impact sprint predictability.";
  }

  // Fallback if no details (important for transparency)
  if (details.length === 0) {
    details.push(
      "No significant workflow, timing, or automation issues detected."
    );
  }

  return {
    summary,
    details
  };
}
