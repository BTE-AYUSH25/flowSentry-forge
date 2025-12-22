/**
 * Safe Action Execution for Rovo-suggested changes
 */

export type RovoAction = {
  type: 'ADD_TRANSITION' | 'REMOVE_RULE' | 'OPTIMIZE_STATE' | 'FLAG_ISSUE';
  details: any;
  safetyCheckRequired: boolean;
  estimatedImpact: number;
};

export class RovoActionExecutor {
  static async execute(action: RovoAction, projectId: string, context: any = {}): Promise<{
    success: boolean;
    message: string;
    changes: any[];
    safetyVerified: boolean;
  }> {
    console.log(`[ActionExecutor] Executing ${action.type} for ${projectId}`);
    
    // Safety check for high-impact actions
    if (action.safetyCheckRequired) {
      const safetyResult = await this.validateSafety(action, projectId);
      if (!safetyResult.safe) {
        return {
          success: false,
          message: `Action blocked by safety check: ${safetyResult.reason}`,
          changes: [],
          safetyVerified: false
        };
      }
    }
    
    try {
      let result;
      
      switch (action.type) {
        case 'ADD_TRANSITION':
          result = await this.simulateAddTransition(action.details, projectId);
          break;
          
        case 'REMOVE_RULE':
          result = await this.simulateRemoveRule(action.details, projectId);
          break;
          
        case 'OPTIMIZE_STATE':
          result = await this.simulateOptimizeState(action.details, projectId);
          break;
          
        case 'FLAG_ISSUE':
          result = await this.simulateFlagIssue(action.details, projectId);
          break;
          
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }
      
      return {
        success: true,
        message: `Action simulated successfully. ${action.type} would ${action.estimatedImpact > 0 ? 'improve' : 'impact'} workflow.`,
        changes: result.changes || [],
        safetyVerified: true
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Action failed: ${error.message}`,
        changes: [],
        safetyVerified: false
      };
    }
  }
  
  private static async validateSafety(action: RovoAction, projectId: string): Promise<{
    safe: boolean;
    reason: string;
    riskChange: number;
  }> {
    // Load current risk
    const { load } = await import('../storage/storageAdapter');
    const snapshot = load(`snapshot:${projectId}`);
    
    if (!snapshot) {
      return { safe: true, reason: 'No baseline risk data', riskChange: 0 };
    }
    
    const currentRisk = snapshot.riskScore?.overallScore || 0.5;
    
    // Simulate risk change (simplified - would be more complex in production)
    let riskChange = 0;
    
    switch (action.type) {
      case 'ADD_TRANSITION':
        riskChange = -0.15; // Generally reduces risk
        break;
      case 'REMOVE_RULE':
        riskChange = action.details.isConflicting ? -0.2 : 0.1;
        break;
      case 'OPTIMIZE_STATE':
        riskChange = -0.25;
        break;
      default:
        riskChange = 0;
    }
    
    const newRisk = currentRisk + riskChange;
    
    if (newRisk > 0.8) {
      return { 
        safe: false, 
        reason: `Would increase risk to ${newRisk.toFixed(2)} (above 0.8 threshold)`,
        riskChange 
      };
    }
    
    return { 
      safe: true, 
      reason: `Risk change: ${riskChange > 0 ? '+' : ''}${riskChange.toFixed(2)}`,
      riskChange 
    };
  }
  
  private static async simulateAddTransition(details: any, projectId: string) {
    const { from, to, condition } = details;
    return {
      changes: [
        {
          type: 'transition_added',
          from,
          to,
          condition: condition || 'manual',
          simulated: true,
          impact: 'Reduces bottleneck risk by allowing alternative flow'
        }
      ]
    };
  }
  
  private static async simulateRemoveRule(details: any, projectId: string) {
    const { ruleId, reason } = details;
    return {
      changes: [
        {
          type: 'rule_removed',
          ruleId,
          reason: reason || 'Conflict resolution',
          simulated: true,
          impact: 'Reduces automation conflicts and potential loops'
        }
      ]
    };
  }
  
  private static async simulateOptimizeState(details: any, projectId: string) {
    const { state, optimizations } = details;
    return {
      changes: [
        {
          type: 'state_optimized',
          state,
          optimizations: optimizations || ['sla_enabled', 'auto_escalation'],
          simulated: true,
          impact: 'Reduces time spent in bottleneck state'
        }
      ]
    };
  }
  
  private static async simulateFlagIssue(details: any, projectId: string) {
    const { issueId, flagType } = details;
    return {
      changes: [
        {
          type: 'issue_flagged',
          issueId,
          flagType: flagType || 'bottleneck_alert',
          simulated: true,
          impact: 'Increases visibility of problematic issues'
        }
      ]
    };
  }
  
  static generateActionFromSuggestion(suggestion: string, context: any): RovoAction {
    const lowerSuggestion = suggestion.toLowerCase();
    
    if (lowerSuggestion.includes('add transition') || lowerSuggestion.includes('create flow')) {
      return {
        type: 'ADD_TRANSITION',
        details: { from: 'REVIEW', to: 'QUICK_APPROVAL' },
        safetyCheckRequired: true,
        estimatedImpact: -0.15
      };
    }
    
    if (lowerSuggestion.includes('remove rule') || lowerSuggestion.includes('disable automation')) {
      return {
        type: 'REMOVE_RULE',
        details: { ruleId: 'RULE-CONFLICT-1', isConflicting: true },
        safetyCheckRequired: true,
        estimatedImpact: -0.2
      };
    }
    
    if (lowerSuggestion.includes('optimize') || lowerSuggestion.includes('improve state')) {
      return {
        type: 'OPTIMIZE_STATE',
        details: { state: 'IN_REVIEW', optimizations: ['auto_assign', 'sla_tracking'] },
        safetyCheckRequired: true,
        estimatedImpact: -0.25
      };
    }
    
    // Default action
    return {
      type: 'FLAG_ISSUE',
      details: { issueId: `${context.projectId}-1`, flagType: 'review_required' },
      safetyCheckRequired: false,
      estimatedImpact: 0.05
    };
  }
}
