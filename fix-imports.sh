#!/bin/bash

echo "🔧 Fixing imports to use .ts extensions..."

# Fix showcase.ts
sed -i "s|from '../rovo-agent/rovoAdapter';|from '../rovo-agent/rovoAdapter.ts';|g" src/competition/showcase.ts
sed -i "s|from './competition-mode';|from './competition-mode.ts';|g" src/competition/showcase.ts

# Fix competition-mode.ts (if it has imports)
if grep -q "import.*from" src/competition/competition-mode.ts; then
  sed -i "s|from '\.\./|from '../|g" src/competition/competition-mode.ts
  sed -i "s|from '\./|from './|g" src/competition/competition-mode.ts
fi

# Fix rovoAdapter.ts
sed -i "s|import.*from '../timing-analyzer/timingAnalyzer';|import { computeBottlenecks } from '../timing-analyzer/timingAnalyzer.ts';|g" src/rovo-agent/rovoAdapter.ts
sed -i "s|import.*from '../workflow-resolver/workflowResolver';|import { resolveWorkflow } from '../workflow-resolver/workflowResolver.ts';|g" src/rovo-agent/rovoAdapter.ts
sed -i "s|import.*from '../graph-analyzer/graphAnalyzer';|import { analyzeGraph } from '../graph-analyzer/graphAnalyzer.ts';|g" src/rovo-agent/rovoAdapter.ts
sed -i "s|import.*from '../providers/jiraClient.mock';|import { jiraClient } from '../providers/jiraClient.mock.ts';|g" src/rovo-agent/rovoAdapter.ts
sed -i "s|import.*from '../ai-engine/whatIf';|import { simulateImprovement } from '../ai-engine/whatIf.ts';|g" src/rovo-agent/rovoAdapter.ts
sed -i "s|import.*from '../storage/storageAdapter';|import { load } from '../storage/storageAdapter.ts';|g" src/rovo-agent/rovoAdapter.ts

# Fix competition-demo.ts
sed -i "s|import.*from '../src/competition/showcase';|import { CompetitionShowcase } from '../src/competition/showcase.ts';|g" scripts/competition-demo.ts

echo "✅ Imports fixed!"
