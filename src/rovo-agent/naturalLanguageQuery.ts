/**
 * Natural Language Processing for FlowSentry
 */

export class NaturalLanguageProcessor {
  static patterns = {
    timing: /\b(how long|duration|time spent|stuck|bottleneck|slow)\b/i,
    risk: /\b(risk|danger|score|health|critical)\b/i,
    structure: /\b(cycle|dead end|complex|structure|flow)\b/i,
    improvement: /\b(improve|better|optimize|fix|resolve)\b/i,
    whatif: /\b(what if|if we|simulate|predict|forecast)\b/i
  };

  static async process(question: string, projectId: string) {
    const matchedPatterns: string[] = [];
    
    for (const [type, pattern] of Object.entries(this.patterns)) {
      if (pattern.test(question)) {
        matchedPatterns.push(type);
      }
    }
    
    // Default to comprehensive analysis if no specific pattern
    const analysisType = matchedPatterns[0] || 'comprehensive';
    
    return {
      question,
      analysisType,
      matchedPatterns,
      requiresDeepAnalysis: matchedPatterns.includes('whatif') || matchedPatterns.includes('improvement'),
      timestamp: new Date().toISOString()
    };
  }

  static generateResponse(analysisType: string, data: any): string {
    // Define responses with index signature
    const responses: Record<string, string> = {
      timing: `Based on timing analysis, ${data.bottlenecks?.length > 0 
        ? `bottlenecks detected at: ${data.bottlenecks.join(', ')}. Average time per state: ${JSON.stringify(data.stateAverages)}`
        : 'timing appears optimal across all states.'}`,
      
      risk: `Risk assessment: ${data.overallScore !== undefined 
        ? `Score: ${data.overallScore} (${data.overallScore > 0.7 ? 'High' : data.overallScore > 0.4 ? 'Medium' : 'Low'})`
        : 'Calculating risk metrics...'}`,
      
      structure: `Workflow structure: ${data.cycles?.length > 0 
        ? `${data.cycles.length} cycle(s) detected`
        : 'No structural issues found'}. ${data.deadEnds?.length > 0 
        ? `Dead ends: ${data.deadEnds.join(', ')}`
        : ''}`,
      
      whatif: `What-if simulation: ${data.improvementPercentage 
        ? `Potential improvement: ${data.improvementPercentage}% by ${data.primaryAction || 'addressing key issues'}`
        : 'Running simulation...'}`,
      
      comprehensive: `Comprehensive analysis complete. Key findings: ${data.summary || 'Workflow operating within normal parameters.'}`
    };
    
    return responses[analysisType] || responses.comprehensive;
  }
}