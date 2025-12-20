// src/workflow-resolver/workflowResolver.ts

/**
 * MODULE 2: Workflow Definition Resolver
 *
 * Responsibility:
 * - Fetch workflow definitions from Jira
 * - Normalize them into a canonical graph structure
 * - Cache results (optional, but allowed by contract)
 *
 * IMPORTANT:
 * - This module does NOT analyze the workflow
 * - This module does NOT compute risk
 * - This module does NOT modify workflows
 */

// -----------------------------
// Types (match contract exactly)
// -----------------------------

export type WorkflowDefinition = {
  workflowId: string;
  states: string[];
  transitions: { from: string; to: string }[];
  lastFetchedAt: string;
};

// -----------------------------
// Custom Error Types
// -----------------------------

export class WorkflowResolverError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// -----------------------------
// External Dependencies (abstracted)
// -----------------------------

/**
 * Beginners often hardcode API calls here.
 * DON'T.
 *
 * We abstract Jira API access so this module
 * stays testable and replaceable.
 */
export interface JiraApiClient {
  fetchWorkflowForProject(projectId: string): Promise<any>;
}

// -----------------------------
// MAIN CONTRACT FUNCTION
// -----------------------------

export async function resolveWorkflow(
  projectId: string,
  jiraClient: JiraApiClient
): Promise<WorkflowDefinition> {
  if (!projectId) {
    throw new WorkflowResolverError(
      "WORKFLOW_NOT_FOUND",
      "projectId is required"
    );
  }

  let rawWorkflow;
  try {
    rawWorkflow = await jiraClient.fetchWorkflowForProject(projectId);
  } catch (err) {
    throw new WorkflowResolverError(
      "API_RATE_LIMITED",
      "Failed to fetch workflow from Jira"
    );
  }

  // ---- Defensive parsing ----
  // Beginners often assume Jira returns perfect data.
  // We normalize aggressively.

  const workflowId = rawWorkflow?.id;
  const statuses = rawWorkflow?.statuses;
  const transitions = rawWorkflow?.transitions;

  if (!workflowId || !Array.isArray(statuses) || !Array.isArray(transitions)) {
    throw new WorkflowResolverError(
      "WORKFLOW_NOT_FOUND",
      "Invalid workflow structure received"
    );
  }

  // ---- Normalize states ----
  // Use unique state names only
  const states = Array.from(
    new Set(
      statuses
        .map((s: any) => s?.name)
        .filter((name: any) => typeof name === "string")
    )
  );

  // ---- Normalize transitions ----
  const normalizedTransitions: { from: string; to: string }[] = [];

  for (const t of transitions) {
    const from = t?.from;
    const to = t?.to;

    // Beginners often forget to validate BOTH ends
    if (typeof from === "string" && typeof to === "string") {
      normalizedTransitions.push({ from, to });
    }
  }

  if (states.length === 0 || normalizedTransitions.length === 0) {
    throw new WorkflowResolverError(
      "WORKFLOW_NOT_FOUND",
      "Workflow has no valid states or transitions"
    );
  }

  return {
    workflowId,
    states,
    transitions: normalizedTransitions,
    lastFetchedAt: new Date().toISOString()
  };
}
