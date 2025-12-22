const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Health endpoint
app.get('/__health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mock analyzeProjectRisk endpoint
app.post('/analyzeProjectRisk', (req, res) => {
  console.log('Received request:', req.body);
  res.json({
    success: true,
    analysis: "FlowSentry analysis for DEMO: High risk detected (0.72).",
    data: {
      riskScore: 0.72,
      bottlenecks: ['REVIEW', 'IN_PROGRESS'],
      issuesAnalyzed: 42,
      recommendations: ['Add parallel review', 'Set 24h SLA']
    },
    demoMode: true
  });
});

// Mock Rovo endpoint
app.post('/rovoQueryHandler', (req, res) => {
  const { query, projectId } = req.body.payload || {};
  res.json({
    answer: `Rovo AI response to "${query || 'unknown'}" for ${projectId || 'DEMO'}`,
    suggestedActions: ['Check bottlenecks', 'Review automation rules'],
    confidence: 0.85
  });
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
  console.log(`Health endpoint: http://localhost:${port}/__health`);
});
