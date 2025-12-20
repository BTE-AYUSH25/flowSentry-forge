// src/risk-engine/riskEngine.ts

/**
 * MODULE 6: Risk Scoring Engine
 *
 * Responsibility:
 * - Aggregate analysis signals
 * - Compute a deterministic risk score
 *
 * IMPORTANT:
 * - NO Jira API calls
 * - NO storage access
 * - NO LLM usage
 * - NO dynamic learning
 */

// -----------------------------
// Types (match contract exactly)
// -----------------------------

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

export type RiskScore = {
  overallScore: number; // 0.0 → 1.0
  breakdown: {
    structure: number;
    timing: number;
    automation: number;
  };
};

// -----------------------------
// Custom Error
// -----------------------------

export class RiskEngineError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// -----------------------------
// CONFIG (STATIC, NOT DYNAMIC)
// -----------------------------

/**
 * IMPORTANT:
 * Beginners often try to "learn" weights.
 * DO NOT.
 *
 * Weights are static, explicit, and explainable.
 */
const WEIGHTS = {
  STRUCTURE: 0.5,
  TIMING: 0.3,
  AUTOMATION: 0.2
};

// -----------------------------
// MAIN CONTRACT FUNCTION
// -----------------------------

export function computeRisk(
  graph: GraphAnalysis,
  timing: TimingAnalysis,
  automation: RuleConflictReport
): RiskScore {
  // ---- Validation ----
  if (!graph || !timing || !automation) {
    throw new RiskEngineError(
      "MISSING_SIGNAL",
      "All analysis inputs are required"
    );
  }

  // -----------------------------
  // 1. Structure Risk
  // -----------------------------
  /**
   * Structure risk components:
   * - cycles
   * - dead ends
   * - unreachable states
   * - excessive depth
   */

  const structureSignals =
    graph.cycles.length +
    graph.deadEnds.length +
    graph.unreachableStates.length +
    Math.max(0, graph.maxDepth - 5); // depth threshold

  // Normalize to [0,1]
  const structureRisk = Math.min(structureSignals / 10, 1);

  // -----------------------------
  // 2. Timing Risk
  // -----------------------------
  /**
   * Timing risk is proportional to number of bottlenecks.
   *
   * Beginner mistake:
   * - Using raw duration values directly
   * Instead, we count bottleneck STATES.
   */

  const timingSignals = timing.bottlenecks.length;
  const timingRisk = Math.min(timingSignals / 5, 1);

  // -----------------------------
  // 3. Automation Risk
  // -----------------------------
  /**
   * Automation risk comes from conflicting rules.
   * LOOP conflicts are worse than OVERWRITE.
   */

  let automationSignals = 0;

  for (const conflict of automation.conflicts) {
    automationSignals +=
      conflict.conflictType === "LOOP" ? 2 : 1;
  }

  const automationRisk = Math.min(automationSignals / 5, 1);

  // -----------------------------
  // 4. Weighted Aggregation
  // -----------------------------
  const overallScore =
    structureRisk * WEIGHTS.STRUCTURE +
    timingRisk * WEIGHTS.TIMING +
    automationRisk * WEIGHTS.AUTOMATION;

  return {
    overallScore: Number(overallScore.toFixed(2)),
    breakdown: {
      structure: Number(structureRisk.toFixed(2)),
      timing: Number(timingRisk.toFixed(2)),
      automation: Number(automationRisk.toFixed(2))
    }
  };
}
