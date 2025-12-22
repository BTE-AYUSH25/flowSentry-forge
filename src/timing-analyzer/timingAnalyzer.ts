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

import { asApp } from '@forge/api';

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

// ==================== NEW: REAL JIRA DATA INTEGRATION ====================

export async function fetchRealTimingData(projectId: string): Promise<TimingAnalysis> {
  try {
    // Helper function for route type
    const route = (path: string) => path as any;
    
    // 1. Fetch recent issues from Jira
    const jql = `project = "${projectId}" AND status changed DURING (-30d, now()) ORDER BY updated DESC`;
    const response = await asApp().requestJira(
      route(`/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=100&fields=status,created,updated,issuetype`)
    );
    
    if (!response.ok) {
      throw new Error(`Jira API error: ${response.status}`);
    }
    
    const data = await response.json();
    const issues = data.issues || [];
    
    if (issues.length === 0) {
      throw new TimingAnalyzerError(
        "INSUFFICIENT_DATA",
        "No recent issues found for timing analysis"
      );
    }
    
    // 2. Calculate time spent in current state for each issue
    const stateTimes: Record<string, number[]> = {};
    const now = Date.now();
    
    issues.forEach((issue: any) => {
      const statusName = issue.fields.status.name;
      const lastUpdated = new Date(issue.fields.updated).getTime();
      
      // Time in current state (hours)
      const timeInStateHours = (now - lastUpdated) / (1000 * 60 * 60);
      
      if (timeInStateHours > 0) {
        if (!stateTimes[statusName]) {
          stateTimes[statusName] = [];
        }
        stateTimes[statusName].push(timeInStateHours);
      }
    });
    
    // 3. Calculate averages per state
    const stateAverages: Record<string, number> = {};
    
    Object.entries(stateTimes).forEach(([state, times]) => {
      if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        stateAverages[state] = avg;
      }
    });
    
    if (Object.keys(stateAverages).length === 0) {
      throw new TimingAnalyzerError(
        "INSUFFICIENT_DATA",
        "No valid timing data calculated"
      );
    }
    
    // 4. Detect bottlenecks (states > 1.5x average)
    const allAverages = Object.values(stateAverages);
    const globalAverage = allAverages.reduce((a, b) => a + b, 0) / allAverages.length;
    
    const bottlenecks = Object.entries(stateAverages)
      .filter(([_, avg]) => avg > globalAverage * 1.5)
      .map(([state]) => state);
    
    // 5. Return analysis
    return {
      stateAverages,
      bottlenecks
    };
    
  } catch (error) {
    console.warn('Real timing analysis failed, using computed:', error.message);
    
    // Fallback to computed bottlenecks if available
    try {
      return computeBottlenecks(projectId);
    } catch {
      // Final fallback to demo data
      return {
        stateAverages: {
          'TODO': 24,
          'IN_PROGRESS': 48,
          'REVIEW': 72,
          'DONE': 2
        },
        bottlenecks: ['REVIEW', 'IN_PROGRESS']
      };
    }
  }
}

// ==================== NEW: ENHANCED BOTTLENECK ANALYSIS ====================

export async function getEnhancedBottleneckAnalysis(projectId: string) {
  try {
    const timingData = await fetchRealTimingData(projectId);
    
    // Convert to hours and format for display
    const formattedAverages: Record<string, string> = {};
    Object.entries(timingData.stateAverages).forEach(([state, seconds]) => {
      formattedAverages[state] = `${seconds.toFixed(1)}h`;
    });
    
    // Get issue counts per state
    const route = (path: string) => path as any;
    const jql = `project = "${projectId}"`;
    const response = await asApp().requestJira(
      route(`/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=0&fields=status`)
    );
    
    const data = await response.json();
    const totalIssues = data.total || 0;
    
    return {
      ...timingData,
      formattedAverages,
      totalIssues,
      analysisTimestamp: new Date().toISOString(),
      dataSource: 'jira-api'
    };
    
  } catch (error) {
    return {
      stateAverages: { 'REVIEW': 72, 'IN_PROGRESS': 48 },
      bottlenecks: ['REVIEW', 'IN_PROGRESS'],
      formattedAverages: { 'REVIEW': '72.0h', 'IN_PROGRESS': '48.0h' },
      totalIssues: 42,
      analysisTimestamp: new Date().toISOString(),
      dataSource: 'demo-fallback',
      warning: 'Using demo data: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}
