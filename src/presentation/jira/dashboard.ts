/**
 * MODULE 8A: Jira Presentation (Dashboard)
 *
 * Responsibility:
 * - Prepare data for Jira UI components
 *
 * IMPORTANT:
 * - No analysis
 * - No risk computation
 * - No storage
 * - No API calls inside UI logic
 */

// -----------------------------
// Types (match contract exactly)
// -----------------------------

export type ViewModel = {
  riskScore: number;
  alerts: string[];
};

// -----------------------------
// Custom Error
// -----------------------------

export class PresentationError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// -----------------------------
// External Dependency (abstracted)
// -----------------------------

/**
 * Beginners often fetch data directly from Jira here.
 * DON'T.
 *
 * Presentation only consumes prepared insight data.
 */
export interface InsightProvider {
  fetchInsights(projectId: string): Promise<{
    riskScore: number;
    explanations: string[];
  }>;
}

// -----------------------------
// CONTRACT FUNCTION
// -----------------------------

export async function getDashboardData(
  projectId: string,
  insightProvider: InsightProvider
): Promise<ViewModel> {
  if (!projectId) {
    throw new PresentationError(
      "PERMISSION_DENIED",
      "projectId is required"
    );
  }

  let insights;
  try {
    insights = await insightProvider.fetchInsights(projectId);
  } catch {
    throw new PresentationError(
      "PERMISSION_DENIED",
      "Unable to fetch insights"
    );
  }

  if (
    typeof insights.riskScore !== "number" ||
    !Array.isArray(insights.explanations)
  ) {
    throw new PresentationError(
      "UI_RENDER_LIMIT",
      "Invalid insight data"
    );
  }

  return {
    riskScore: insights.riskScore,
    alerts: insights.explanations
  };
}
