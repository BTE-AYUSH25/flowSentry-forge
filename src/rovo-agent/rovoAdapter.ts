// src/rovo-agent/rovoAdapter.ts

export type RovoAnalysis = {
  analysis: string;
  dataPoints: any[];
  suggestedActions: string[];
  confidence: number;
  timestamp: string;
  source?: 'real-data' | 'mock-data';
  disclaimer?: string;
};

export class FlowSentryRovoAgent {
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
    console.log(`🤖 Rovo AI Agent created for project: ${projectId}`);
  }

  /**
   * Natural Language Query Interface with REAL Jira data
   */
  async processQuery(naturalLanguageQuery: string): Promise<RovoAnalysis> {
    console.log(`[Rovo Agent] Processing query: "${naturalLanguageQuery}"`);
    
    const intent = this.analyzeIntent(naturalLanguageQuery);
    
    // Try to fetch real data first
    try {
      const realResponse = await this.generateRealResponse(intent);
      return {
        analysis: realResponse.analysis,
        dataPoints: realResponse.dataPoints || [],
        suggestedActions: realResponse.suggestedActions || [],
        confidence: realResponse.confidence || 0.8,
        timestamp: new Date().toISOString(),
        source: 'real-data'
      };
    } catch (error) {
      console.warn('Real data analysis failed, using enhanced mock:', error);
      return this.generateEnhancedMockResponse(intent);
    }
  }

  private analyzeIntent(query: string): { type: string; priority: string } {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('bottleneck') || lowerQuery.includes('stuck') || lowerQuery.includes('slow')) {
      return { type: 'bottleneck-analysis', priority: 'high' };
    }
    
    if (lowerQuery.includes('risk') || lowerQuery.includes('danger') || lowerQuery.includes('score')) {
      return { type: 'risk-analysis', priority: 'high' };
    }
    
    if (lowerQuery.includes('what if') || lowerQuery.includes('improve') || lowerQuery.includes('better')) {
      return { type: 'what-if-scenario', priority: 'medium' };
    }
    
    if (lowerQuery.includes('rule') || lowerQuery.includes('automation') || lowerQuery.includes('conflict')) {
      return { type: 'rule-analysis', priority: 'medium' };
    }
    
    return { type: 'general-analysis', priority: 'low' };
  }

  private async generateRealResponse(intent: { type: string; priority: string }): Promise<any> {
    // Helper for route type
    const route = (path: string) => path as any;
    
    try {
      // Import dynamically to avoid circular dependencies
      const { asApp } = await import('@forge/api');
      
      // Fetch real project data from Jira
      const response = await asApp().requestJira(
        route(`/rest/api/3/search?jql=project=${this.projectId}&maxResults=50&fields=status,created,updated,priority,issuetype`)
      );
      
      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status}`);
      }
      
      const data = await response.json();
      const issues = data.issues || [];
      
      if (issues.length === 0) {
        throw new Error('No issues found in project');
      }
      
      // Analyze real issue data
      const analysis = await this.analyzeRealIssues(issues, intent);
      
      return {
        analysis: analysis.summary,
        dataPoints: analysis.metrics,
        suggestedActions: analysis.recommendations,
        confidence: Math.min(0.9 + (issues.length / 100), 0.95), // Higher confidence with more data
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      throw new Error(`Real analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async analyzeRealIssues(issues: any[], intent: { type: string; priority: string }) {
    // Calculate real metrics from Jira issues
    const now = Date.now();
    const statusCounts: Record<string, number> = {};
    const statusTimes: Record<string, number[]> = {};
    let totalRisk = 0;
    
    issues.forEach(issue => {
      const status = issue.fields.status.name;
      const created = new Date(issue.fields.created).getTime();
      const updated = new Date(issue.fields.updated).getTime();
      const priority = issue.fields.priority?.name || 'Medium';
      
      // Count issues per status
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      
      // Track time in current status
      if (!statusTimes[status]) {
        statusTimes[status] = [];
      }
      statusTimes[status].push((now - updated) / (1000 * 60 * 60)); // hours
      
      // Simple risk calculation
      const timeInState = (now - updated) / (1000 * 60 * 60 * 24); // days
      const priorityWeight = priority === 'Highest' ? 1.5 : priority === 'High' ? 1.2 : 1.0;
      totalRisk += Math.min(timeInState * priorityWeight, 10);
    });
    
    // Calculate bottlenecks
    const statusAverages: Record<string, number> = {};
    Object.entries(statusTimes).forEach(([status, times]) => {
      statusAverages[status] = times.reduce((a, b) => a + b, 0) / times.length;
    });
    
    const globalAverage = Object.values(statusAverages).reduce((a, b) => a + b, 0) / Object.keys(statusAverages).length;
    const bottlenecks = Object.entries(statusAverages)
      .filter(([_, avg]) => avg > globalAverage * 1.5)
      .map(([state]) => state);
    
    // Generate response based on intent
    switch (intent.type) {
      case 'bottleneck-analysis':
        return {
          summary: `Real analysis: ${bottlenecks.length} bottlenecks detected. ${bottlenecks[0] || 'No state'} is the most critical (${statusAverages[bottlenecks[0]]?.toFixed(1) || 'N/A'}h average).`,
          metrics: bottlenecks.map(b => ({
            state: b,
            avgTimeHours: statusAverages[b]?.toFixed(1),
            issueCount: statusCounts[b] || 0
          })),
          recommendations: [
            'Optimize workflow transitions',
            'Set SLA alerts for bottleneck states',
            'Review assignment and review processes'
          ]
        };
        
      case 'risk-analysis':
        const avgRisk = totalRisk / issues.length;
        const riskLevel = avgRisk > 7 ? 'High' : avgRisk > 3 ? 'Medium' : 'Low';
        return {
          summary: `Real-time risk analysis: ${riskLevel} risk (${avgRisk.toFixed(2)}/10). ${issues.length} issues analyzed.`,
          metrics: [
            { metric: 'Average Risk Score', value: avgRisk.toFixed(2) },
            { metric: 'Issues Analyzed', value: issues.length },
            { metric: 'Critical States', value: bottlenecks.length },
            { metric: 'Total Time at Risk', value: `${(totalRisk / 24).toFixed(1)} days` }
          ],
          recommendations: [
            'Prioritize bottleneck resolution',
            'Review aging issues weekly',
            'Implement risk-based prioritization'
          ]
        };
        
      case 'what-if-scenario':
        const improvement = Math.min(bottlenecks.length * 15, 50);
        return {
          summary: `What-if simulation: Optimizing ${bottlenecks.length} bottlenecks could improve throughput by ~${improvement}% and reduce average cycle time by ${Math.round(improvement / 2)}%.`,
          metrics: [
            { improvement: 'Potential Throughput Gain', value: `${improvement}%` },
            { improvement: 'Risk Reduction', value: `${Math.round(improvement * 0.6)}%` },
            { improvement: 'Cycle Time Reduction', value: `${Math.round(improvement / 2)}%` }
          ],
          recommendations: [
            'Implement parallel review workflow',
            'Add quick-approval path for low-risk changes',
            'Automate status transitions where possible'
          ]
        };
        
      default:
        return {
          summary: `Comprehensive analysis complete. ${issues.length} issues analyzed. ${bottlenecks.length} bottlenecks identified.`,
          metrics: Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
            avgTime: statusAverages[status]?.toFixed(1) + 'h'
          })),
          recommendations: [
            'Regular workflow health checks',
            'Monitor key metrics weekly',
            'Review automation rule effectiveness'
          ]
        };
    }
  }

  private generateEnhancedMockResponse(intent: { type: string; priority: string }): RovoAnalysis {
    const responses = {
      'bottleneck-analysis': {
        analysis: 'Enhanced analysis: REVIEW state shows 3.5x average cycle time (72h vs 20h baseline). IN_PROGRESS at 2.1x average. Consider workflow optimization.',
        dataPoints: [
          { state: 'REVIEW', multiplier: 3.5, avgTime: '72h', issueCount: 15, severity: 'High' },
          { state: 'IN_PROGRESS', multiplier: 2.1, avgTime: '48h', issueCount: 22, severity: 'Medium' },
          { state: 'TODO', multiplier: 1.2, avgTime: '24h', issueCount: 8, severity: 'Low' }
        ],
        suggestedActions: [
          'Implement parallel review process for REVIEW state',
          'Set SLA of 24h for IN_PROGRESS state with auto-escalation',
          'Add intermediate "In Review" substates to track progress'
        ],
        confidence: 0.88
      },
      'risk-analysis': {
        analysis: 'Workflow risk assessment: Overall score 0.72/1.0 (High Risk). Primary contributors: Timing bottlenecks (0.8), Structural complexity (0.4).',
        dataPoints: [
          { metric: 'Overall Risk', value: 0.72, threshold: 0.7 },
          { metric: 'Timing Risk', value: 0.8, trend: 'increasing' },
          { metric: 'Structural Risk', value: 0.4, trend: 'stable' },
          { metric: 'Automation Risk', value: 0.6, trend: 'decreasing' }
        ],
        suggestedActions: [
          'Immediate review of automation rule conflicts',
          'Optimize REVIEW state workflow within 2 sprints',
          'Implement monitoring dashboard for real-time visibility'
        ],
        confidence: 0.92
      },
      'what-if-scenario': {
        analysis: 'What-if simulation: Adding parallel review could reduce bottleneck time by 40% and overall risk by 25%. Throughput improvement estimated at 30%.',
        dataPoints: [
          { improvement: 'Risk Reduction', value: '25%', confidence: 'High' },
          { improvement: 'Bottleneck Time', value: '40%', confidence: 'Medium' },
          { improvement: 'Throughput', value: '+30%', confidence: 'Medium' },
          { improvement: 'Cycle Time', value: '-35%', confidence: 'Medium' }
        ],
        suggestedActions: [
          'Implement parallel review workflow (2-3 sprints)',
          'Test with pilot team for 1 sprint before full rollout',
          'Monitor KPIs: cycle time, throughput, satisfaction'
        ],
        confidence: 0.78
      },
      'rule-analysis': {
        analysis: 'Automation rule analysis: 3 potential conflicts detected. Rules modifying same fields could cause race conditions or overwrites.',
        dataPoints: [
          { conflict: 'Rule 42 vs Rule 87', type: 'Status overwrite', trigger: 'Issue updated', severity: 'High' },
          { conflict: 'Rule 15 vs Rule 23', type: 'Field conflict', trigger: 'Transition', severity: 'Medium' },
          { conflict: 'Rule 08 vs Rule 12', type: 'Notification spam', trigger: 'Comment added', severity: 'Low' }
        ],
        suggestedActions: [
          'Disable redundant Rule #87 (keep #42 active)',
          'Add execution order priority to conflicting rules',
          'Implement rule dependency graph for visualization',
          'Weekly rule effectiveness review'
        ],
        confidence: 0.85
      }
    };

    const response = responses[intent.type as keyof typeof responses] || {
      analysis: 'Enhanced workflow analysis complete. System operating within parameters but optimization opportunities exist for continuous improvement.',
      dataPoints: [
        { type: 'general', message: 'Workflow operating within normal parameters' },
        { type: 'recommendation', priority: 'Medium', effort: 'Low' },
        { type: 'monitoring', frequency: 'Weekly', focus: 'Bottleneck states' }
      ],
      suggestedActions: [
        'Monitor key metrics weekly in team sync',
        'Quarterly workflow review and optimization',
        'Enable detailed analytics for trend analysis',
        'Consider Rovo AI integration for predictive insights'
      ],
      confidence: 0.75
    };

    return {
      analysis: response.analysis,
      dataPoints: response.dataPoints || [],
      suggestedActions: response.suggestedActions || [],
      confidence: response.confidence || 0.8,
      timestamp: new Date().toISOString(),
      source: 'mock-data',
      disclaimer: 'Enhanced mock data - Connect to Jira for real-time analysis'
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default FlowSentryRovoAgent;
