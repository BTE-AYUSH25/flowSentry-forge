// src/rovo-agent/types.ts

/**
 * Type definitions for Rovo AI Agent integration
 */

export interface RovoAgentConfig {
  enabled: boolean;
  confidenceThreshold: number;
  autoAnalyze: boolean;
  suggestActions: boolean;
  safetyChecks: boolean;
}

export interface RovoQuery {
  id: string;
  question: string;
  projectId: string;
  timestamp: string;
  response?: RovoResponse;
  processingTime?: number;
}

export interface RovoResponse {
  answer: string;
  dataPoints: any[];
  suggestedActions: string[];
  confidence: number;
  sourceModules: string[];
  followUpQuestions?: string[];
}

export interface RovoActionSuggestion {
  action: string;
  rationale: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  estimatedImpact: number;
  prerequisites: string[];
  risks: string[];
}

export interface RovoConversation {
  id: string;
  projectId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: any;
  }>;
  summary?: string;
  actionsTaken: string[];
  createdAt: string;
  updatedAt: string;
}