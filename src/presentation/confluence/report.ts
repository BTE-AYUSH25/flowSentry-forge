/**
 * MODULE 8B: Confluence Presentation (Reporting)
 *
 * Responsibility:
 * - Generate report payloads for Confluence
 *
 * IMPORTANT:
 * - This module prepares content ONLY
 * - It does NOT decide what is risky
 */

// -----------------------------
// Types
// -----------------------------

export type ConfluencePage = {
  title: string;
  body: string;
};

// -----------------------------
// CONTRACT FUNCTION
// -----------------------------

export function renderReport(
  projectId: string,
  data: {
    riskScore: number;
    summary: string;
    details: string[];
  }
): ConfluencePage {
  if (!projectId) {
    throw new Error("PERMISSION_DENIED");
  }

  // Beginners often over-format HTML here.
  // Keep it simple and portable.
  const bodyLines = [
    `## Workflow Risk Report`,
    ``,
    `**Overall Risk Score:** ${data.riskScore}`,
    ``,
    `### Summary`,
    data.summary,
    ``,
    `### Details`,
    ...data.details.map((d) => `- ${d}`)
  ];

  return {
    title: `Workflow Risk Report — ${projectId}`,
    body: bodyLines.join("\n")
  };
}
