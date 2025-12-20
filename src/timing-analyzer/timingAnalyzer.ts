// src/timing-analyzer/timingAnalyzer.ts

/**
 * MODULE 4: State Timing Analyzer
 *
 * Responsibility:
 * - Track time spent in workflow states
 * - Compute per-state average duration
 * - Detect bottlenecks
 *
 * IMPORTANT:
 * - This module does NOT analyze workflow structure
 * - This module does NOT compute risk scores
 * - This module does NOT access UI
 */

// -----------------------------
// Types (match contract exactly)
// -----------------------------

export type TimingEvent = {
  issueId: string;
  fromState: string;
  toState: string;
  timestamp: string; // ISO-8601
};

export type TimingAnalysis = {
  stateAverages: Record<string, number>; // seconds
  bottlenecks: string[];
};

// -----------------------------
// Custom Error
// -----------------------------

export class TimingAnalyzerError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// -----------------------------
// Internal State (Allowed)
// -----------------------------

/**
 * Internal in-memory state.
 * NOTE:
 * - In production, this is backed by Storage Module
 * - Here we keep it simple & contract-compliant
 */

// issueId -> last transition
const lastSeenState: Record<
  string,
  { state: string; timestamp: number }
> = {};

// state -> total time spent (seconds)
const stateTotals: Record<string, number> = {};

// state -> number of entries
const stateCounts: Record<string, number> = {};

// -----------------------------
// Helper
// -----------------------------

function parseTimestamp(ts: string): number {
  const parsed = Date.parse(ts);
  if (isNaN(parsed)) {
    // Beginner mistake: trusting timestamps blindly
    throw new TimingAnalyzerError(
      "INVALID_TRANSITION_SEQUENCE",
      "Invalid timestamp format"
    );
  }
  return parsed;
}

// -----------------------------
// CONTRACT FUNCTION 1
// -----------------------------

export function updateTiming(event: TimingEvent): void {
  const { issueId, fromState, toState, timestamp } = event;

  if (!issueId || !fromState || !toState) {
    throw new TimingAnalyzerError(
      "INVALID_TRANSITION_SEQUENCE",
      "Missing required event fields"
    );
  }

  const time = parseTimestamp(timestamp);

  const previous = lastSeenState[issueId];

  if (previous) {
    // Calculate duration spent in previous.state
    const durationSeconds =
      (time - previous.timestamp) / 1000;

    if (durationSeconds < 0) {
      // Beginner mistake: ignoring clock skew / ordering
      throw new TimingAnalyzerError(
        "INVALID_TRANSITION_SEQUENCE",
        "Timestamp order invalid"
      );
    }

    // Accumulate totals
    stateTotals[previous.state] =
      (stateTotals[previous.state] || 0) + durationSeconds;

    stateCounts[previous.state] =
      (stateCounts[previous.state] || 0) + 1;
  }

  // Update last seen state for this issue
  lastSeenState[issueId] = {
    state: toState,
    timestamp: time
  };
}

// -----------------------------
// CONTRACT FUNCTION 2
// -----------------------------

export function computeBottlenecks(
  projectId: string // unused here, but required by contract
): TimingAnalysis {
  if (!projectId) {
    throw new TimingAnalyzerError(
      "INSUFFICIENT_DATA",
      "projectId is required"
    );
  }

  const stateAverages: Record<string, number> = {};

  let totalAverage = 0;
  let stateCount = 0;

  // Compute per-state averages
  for (const state of Object.keys(stateTotals)) {
    const avg =
      stateTotals[state] / stateCounts[state];
    stateAverages[state] = avg;

    totalAverage += avg;
    stateCount++;
  }

  if (stateCount === 0) {
    throw new TimingAnalyzerError(
      "INSUFFICIENT_DATA",
      "No timing data available"
    );
  }

  const globalAverage = totalAverage / stateCount;

  // Bottleneck definition (from contract logic):
  // avg > 1.5 × global average
  const bottlenecks = Object.keys(stateAverages).filter(
    (state) => stateAverages[state] > globalAverage * 1.5
  );

  return {
    stateAverages,
    bottlenecks
  };
}
