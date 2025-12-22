/**
 * REAL Automation Rule Provider for Jira
 * 
 * Uses Forge API to fetch actual automation rules.
 * Falls back to mock data for demo/development.
 */

export const ruleProvider = {
  async fetchRules(projectId: string) {
    try {
      // Import dynamically to avoid circular dependencies
      const { asApp } = await import('@forge/api');
      
      // Helper for route type
      const route = (path: string) => path as any;
      
      // Try to fetch real automation rules from Jira
      // Note: This requires 'read:automation-rule' permission in manifest
      const response = await asApp().requestJira(
        route(`/rest/cb-automation/latest/project/${projectId}/rule`)
      );
      
      if (!response.ok) {
        throw new Error(`Automation API error: ${response.status}`);
      }
      
      const rules = await response.json();
      
      // Transform to our internal format
      return rules.map((rule: any) => ({
        id: rule.id || `RULE-${Math.random().toString(36).substr(2, 9)}`,
        name: rule.name || 'Unnamed Rule',
        trigger: rule.trigger?.type || rule.trigger || 'UNKNOWN_TRIGGER',
        actions: Array.isArray(rule.actions) 
          ? rule.actions.map((action: any) => ({
              field: action.field || 'status',
              value: action.value || 'UNKNOWN_VALUE'
            }))
          : [{ field: 'status', value: 'UNKNOWN' }],
        enabled: rule.enabled !== false,
        ruleType: rule.ruleType || 'JIRA_AUTOMATION',
        lastModified: rule.lastModified || new Date().toISOString()
      }));
      
    } catch (error) {
      console.warn('Using mock automation rules (real API failed):', 
        error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback to realistic mock data
      return this.getMockRules(projectId);
    }
  },
  
  async fetchRuleConflicts(projectId: string) {
    try {
      const rules = await this.fetchRules(projectId);
      
      // Detect conflicts between rules
      const conflicts: Array<{
        ruleA: string;
        ruleB: string;
        trigger: string;
        field: string;
        conflictType: "OVERWRITE" | "LOOP" | "CONFLICT";
      }> = [];
      
      // Check for overlapping triggers and fields
      for (let i = 0; i < rules.length; i++) {
        for (let j = i + 1; j < rules.length; j++) {
          const ruleA = rules[i];
          const ruleB = rules[j];
          
          // Same trigger?
          if (ruleA.trigger === ruleB.trigger) {
            // Check for conflicting actions on same field
            for (const actionA of ruleA.actions) {
              for (const actionB of ruleB.actions) {
                if (actionA.field === actionB.field) {
                  if (actionA.value !== actionB.value) {
                    conflicts.push({
                      ruleA: ruleA.id,
                      ruleB: ruleB.id,
                      trigger: ruleA.trigger,
                      field: actionA.field,
                      conflictType: "OVERWRITE"
                    });
                  }
                }
              }
            }
          }
        }
      }
      
      return {
        rules: rules,
        conflicts: conflicts,
        totalRules: rules.length,
        conflictingRules: conflicts.length,
        analysisTimestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.warn('Rule conflict analysis failed:', error);
      return {
        rules: [],
        conflicts: [],
        totalRules: 0,
        conflictingRules: 0,
        analysisTimestamp: new Date().toISOString(),
        error: 'Analysis failed'
      };
    }
  },
  
  getMockRules(projectId: string) {
    // Realistic mock data for demonstration
    return [
      {
        id: "RULE-AUTO-001",
        name: "Auto-Close Resolved Issues",
        trigger: "ISSUE_UPDATED",
        actions: [
          { field: "status", value: "DONE" }
        ],
        enabled: true,
        ruleType: "AUTO_CLOSE",
        lastModified: "2024-01-15T10:30:00Z"
      },
      {
        id: "RULE-AUTO-002",
        name: "Send for Review on Ready",
        trigger: "ISSUE_UPDATED",
        actions: [
          { field: "status", value: "IN_REVIEW" }
        ],
        enabled: true,
        ruleType: "STATUS_TRANSITION",
        lastModified: "2024-01-10T14:20:00Z"
      },
      {
        id: "RULE-AUTO-003",
        name: "Notify Team on High Priority",
        trigger: "ISSUE_CREATED",
        actions: [
          { field: "notify", value: "team@example.com" }
        ],
        enabled: true,
        ruleType: "NOTIFICATION",
        lastModified: "2024-01-05T09:15:00Z"
      },
      {
        id: "RULE-AUTO-004",
        name: "Assign to Triage on New Issue",
        trigger: "ISSUE_CREATED",
        actions: [
          { field: "assignee", value: "triage-team" }
        ],
        enabled: false, // Disabled rule
        ruleType: "ASSIGNMENT",
        lastModified: "2023-12-20T16:45:00Z"
      }
    ];
  }
};

export type AutomationRuleProvider = typeof ruleProvider;
