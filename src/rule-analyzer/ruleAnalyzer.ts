// src/rule-analyzer/ruleAnalyzer.ts

/**
 * MODULE 5: Automation Rule Analyzer
 *
 * Responsibility:
 * - Analyze automation rule metadata
 * - Detect conflicting rules
 *
 * IMPORTANT:
 * - This module does NOT execute rules
 * - This module does NOT modify Jira automation
 * - This module does NOT suggest fixes
 */

// -----------------------------
// Types (match contract exactly)
// -----------------------------

export type AutomationRule = {
  id: string;
  trigger: string;
  actions: {
    field: string;
    value: unknown;
  }[];
};

export type RuleConflict = {
  ruleA: string;
  ruleB: string;
  trigger: string;
  field: string;
  conflictType: "OVERWRITE" | "LOOP";
};

export type RuleConflictReport = {
  conflicts: RuleConflict[];
};

// -----------------------------
// Custom Error
// -----------------------------

export class RuleAnalyzerError extends Error {
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
 * Beginners often hardcode REST calls here.
 * DON'T.
 *
 * Keep rule fetching abstract so this module
 * remains testable and replaceable.
 */
export interface AutomationRuleProvider {
  fetchRules(projectId: string): Promise<AutomationRule[]>;
}

// -----------------------------
// MAIN CONTRACT FUNCTION
// -----------------------------

export async function analyzeRules(
  projectId: string,
  ruleProvider: AutomationRuleProvider
): Promise<RuleConflictReport> {
  if (!projectId) {
    throw new RuleAnalyzerError(
      "RULE_ACCESS_DENIED",
      "projectId is required"
    );
  }

  let rules: AutomationRule[];

  try {
    rules = await ruleProvider.fetchRules(projectId);
  } catch {
    throw new RuleAnalyzerError(
      "RULE_ACCESS_DENIED",
      "Unable to fetch automation rules"
    );
  }

  if (!Array.isArray(rules)) {
    throw new RuleAnalyzerError(
      "UNSUPPORTED_RULE_TYPE",
      "Invalid rule data format"
    );
  }

  const conflicts: RuleConflict[] = [];

  // -----------------------------
  // Conflict Detection Logic
  // -----------------------------
  // Definition (from contract):
  // - Same trigger
  // - Same field
  // - Different actions → OVERWRITE
  //
  // NOTE:
  // Beginners often compare entire rules.
  // We ONLY compare trigger + target field.

  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const ruleA = rules[i];
      const ruleB = rules[j];

      // Same trigger required
      if (ruleA.trigger !== ruleB.trigger) continue;

      for (const actionA of ruleA.actions) {
        for (const actionB of ruleB.actions) {
          if (actionA.field === actionB.field) {
            // Detect overwrite conflict
            if (actionA.value !== actionB.value) {
              conflicts.push({
                ruleA: ruleA.id,
                ruleB: ruleB.id,
                trigger: ruleA.trigger,
                field: actionA.field,
                conflictType: "OVERWRITE"
              });
            }

            // Detect loop (simplified heuristic)
            // Beginner mistake: trying to simulate execution
            if (
              actionA.value === "CURRENT" ||
              actionB.value === "CURRENT"
            ) {
              conflicts.push({
                ruleA: ruleA.id,
                ruleB: ruleB.id,
                trigger: ruleA.trigger,
                field: actionA.field,
                conflictType: "LOOP"
              });
            }
          }
        }
      }
    }
  }

  return { conflicts };
}
