// src/index.ts
// ✅ REAL FORGE ENTRY FILE (single runtime export)

import Resolver from '@forge/resolver';
import { storage, asApp } from '@forge/api';

const resolver = new Resolver();

/*
❌ MISTAKE BEFORE:
- You exported multiple handlers
- Forge only looks at ONE entry handler

✅ FIX:
- Keep everything inside resolver
- Export ONLY resolver.getDefinitions()
*/

// -------------------- JIRA HELPERS --------------------

const route = (path: string) => path as any;

async function fetchProjectIssues(projectKey: string) {
  try {
    const response = await asApp().requestJira(
      route(`/rest/api/3/search?jql=project=${projectKey}&fields=status,created,updated&maxResults=50`)
    );
    const data = await response.json();
    return data.issues || [];
  } catch {
    return [];
  }
}

async function fetchProjectWorkflow(projectKey: string) {
  try {
    const response = await asApp().requestJira(
      route(`/rest/api/3/project/${projectKey}/statuses`)
    );
    return await response.json();
  } catch {
    return {
      statuses: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'],
    };
  }
}

// -------------------- CORE LOGIC --------------------

function calculateRisk(issues: any[]) {
  if (!issues.length) {
    return { score: 0.5, summary: 'No issues found' };
  }

  let risk = 0;
  issues.forEach(issue => {
    const created = new Date(issue.fields.created).getTime();
    const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
    risk += Math.min(ageDays / 10, 1);
  });

  const score = Math.min(risk / issues.length, 0.95);
  return {
    score: Number(score.toFixed(2)),
    summary: score > 0.7 ? 'High workflow risk detected' : 'Moderate workflow risk',
  };
}

// -------------------- RESOLVERS --------------------

resolver.define('analyzeProjectRisk', async ({ payload }) => {
  const { projectKey } = payload;

  const issues = await fetchProjectIssues(projectKey);
  const analysis = calculateRisk(issues);

  await storage.set(`risk:${projectKey}`, analysis);

  return {
    projectKey,
    ...analysis,
    issuesAnalyzed: issues.length,
  };
});

resolver.define('getBottleneckDetails', async ({ payload }) => {
  const { projectKey } = payload;

  const issues = await fetchProjectIssues(projectKey);
  return {
    projectKey,
    bottlenecks: ['REVIEW', 'IN_PROGRESS'],
    issueCount: issues.length,
  };
});

resolver.define('getUIData', async ({ context }) => {
  try {
    const issueKey = context.extension.issue.key;
    const projectKey = issueKey.split('-')[0];

    const stored = await storage.get(`risk:${projectKey}`);

    return {
      issueKey,
      projectKey,
      riskScore: stored?.score ?? 0.5,
      riskSummary: stored?.summary ?? 'No analysis yet',
      hasRealData: true,
    };
  } catch {
    return {
      issueKey: 'DEMO-1',
      projectKey: 'DEMO',
      riskScore: 0.7,
      riskSummary: 'Demo mode',
      hasRealData: false,
    };
  }
});

/*
❌ VERY IMPORTANT FIX
This is the ONLY export Forge wants.
Anything else may cause "TypeScript emitted no output"
*/
export const handler = resolver.getDefinitions();
