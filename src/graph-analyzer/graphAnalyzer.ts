// src/graph-analyzer/graphAnalyzer.ts

/**
 * MODULE 3: Workflow Graph Analyzer
 *
 * Responsibility:
 * - Analyze workflow STRUCTURE ONLY
 * - No timing, no risk, no persistence
 *
 * IMPORTANT:
 * - Pure function
 * - Deterministic output
 * - No side effects
 */

// -----------------------------
// Types (match contract exactly)
// -----------------------------

export type WorkflowDefinition = {
  workflowId: string;
  states: string[];
  transitions: { from: string; to: string }[];
};

export type GraphAnalysis = {
  cycles: string[][];
  deadEnds: string[];
  maxDepth: number;
  unreachableStates: string[];
};

// -----------------------------
// Custom Error
// -----------------------------

export class GraphAnalyzerError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// -----------------------------
// MAIN CONTRACT FUNCTION
// -----------------------------

export function analyzeGraph(
  workflow: WorkflowDefinition
): GraphAnalysis {
  // ---- Basic validation ----
  if (
    !workflow ||
    !Array.isArray(workflow.states) ||
    !Array.isArray(workflow.transitions)
  ) {
    throw new GraphAnalyzerError(
      "INVALID_GRAPH",
      "Workflow definition is invalid"
    );
  }

  // ---- Build adjacency list ----
  // Beginners often forget to initialize empty lists for all nodes
  const graph: Record<string, string[]> = {};
  for (const state of workflow.states) {
    graph[state] = [];
  }

  for (const t of workflow.transitions) {
    if (graph[t.from]) {
      graph[t.from].push(t.to);
    }
  }

  // -----------------------------
  // 1. Detect unreachable states
  // -----------------------------

  const visited = new Set<string>();

  // Assume first state is entry point
  // Beginner mistake: assuming ALL states are reachable
  const startState = workflow.states[0];

  function dfsReach(state: string) {
    if (visited.has(state)) return;
    visited.add(state);
    for (const next of graph[state]) {
      dfsReach(next);
    }
  }

  dfsReach(startState);

  const unreachableStates = workflow.states.filter(
    (s) => !visited.has(s)
  );

  // -----------------------------
  // 2. Detect dead ends
  // -----------------------------
  // Dead end = no outgoing transitions
  const deadEnds = workflow.states.filter(
    (s) => graph[s].length === 0
  );

  // -----------------------------
  // 3. Detect cycles
  // -----------------------------

  const cycles: string[][] = [];
  const stack = new Set<string>();
  const visitedCycle = new Set<string>();

  function dfsCycle(node: string, path: string[]) {
    if (stack.has(node)) {
      // Cycle detected
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart));
      return;
    }

    if (visitedCycle.has(node)) return;

    visitedCycle.add(node);
    stack.add(node);

    for (const next of graph[node]) {
      dfsCycle(next, [...path, next]);
    }

    stack.delete(node);
  }

  for (const state of workflow.states) {
    dfsCycle(state, [state]);
  }

  // -----------------------------
  // 4. Compute maximum depth
  // -----------------------------
  // Longest path without revisiting nodes

  let maxDepth = 0;

  function dfsDepth(node: string, depth: number, seen: Set<string>) {
    maxDepth = Math.max(maxDepth, depth);

    for (const next of graph[node]) {
      // Beginner mistake: not preventing infinite recursion on cycles
      if (!seen.has(next)) {
        const newSeen = new Set(seen);
        newSeen.add(next);
        dfsDepth(next, depth + 1, newSeen);
      }
    }
  }

  dfsDepth(startState, 1, new Set([startState]));

  return {
    cycles,
    deadEnds,
    maxDepth,
    unreachableStates
  };
}
