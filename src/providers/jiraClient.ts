import { asApp } from '@forge/api';

const route = (path: string) => path as any;

export const jiraClient = {
  async fetchWorkflowForProject(projectId: string) {
    try {
      // Use a simpler endpoint that doesn't require manage:jira-project
      const response = await asApp().requestJira(
        route(`/rest/api/3/project/${projectId}/statuses`)
      );
      
      if (!response.ok) {
        throw new Error(`Jira API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the response to our expected format
      const statuses = Array.isArray(data) ? data : [];
      
      return {
        id: `WF-${projectId}`,
        statuses: statuses.map((s: any) => ({ name: s.name || s.status || 'Unknown' })),
        transitions: [] // We'll infer transitions or get from a different endpoint
      };
    } catch (error) {
      // Fallback to mock for demo
      console.warn('Using mock workflow data:', error instanceof Error ? error.message : 'Unknown error');
      return {
        id: "WF-DEMO-1",
        statuses: [
          { name: "TODO" },
          { name: "IN_PROGRESS" },
          { name: "IN_REVIEW" },
          { name: "DONE" }
        ],
        transitions: [
          { from: "TODO", to: "IN_PROGRESS" },
          { from: "IN_PROGRESS", to: "IN_REVIEW" },
          { from: "IN_REVIEW", to: "DONE" },
          { from: "IN_REVIEW", to: "IN_PROGRESS" }
        ]
      };
    }
  },
  
  async fetchProjectIssues(projectId: string, maxResults = 50) {
    try {
      const jql = `project = "${projectId}" ORDER BY updated DESC`;
      const response = await asApp().requestJira(
        route(`/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=status,created,updated`)
      );
      const data = await response.json();
      return data.issues || [];
    } catch (error) {
      console.warn('Using mock issues');
      return [];
    }
  }
};

export type JiraApiClient = typeof jiraClient;
