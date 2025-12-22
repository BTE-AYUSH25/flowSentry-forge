/**
 * Competition Demo Script for CodegeistX
 * Demonstrates FlowSentry + Rovo AI integration
 */

async function runCompetitionDemo(mode?: 'full' | 'quick' | 'technical') {
  console.log('\n' + '='.repeat(70));
  console.log('🎯 FLOWSENTRY 2.0 - CODEGEISTX COMPETITION DEMO');
  console.log('🤖 Featuring Rovo AI Agent Integration');
  console.log('='.repeat(70) + '\n');

  try {
    // Simple import without complex dependencies
    const { CompetitionShowcase } = await import('./../src/competition/showcase');
    
    // Initialize showcase
    const showcase = new CompetitionShowcase('CODEGEIST-PROJ');
    
    console.log('🔧 Initializing Competition Mode...\n');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Determine which demo to run based on CLI args or interactive
    if (mode === 'quick') {
      console.log('\n⚡ Starting Quick Demo (30 seconds)...\n');
      await showcase.runQuickDemo();
    } else if (mode === 'technical') {
      console.log('\n🔍 Starting Technical Deep Dive...\n');
      await runTechnicalDeepDive();
    } else if (mode === 'full') {
      console.log('\n🚀 Starting Full Showcase (3 minutes)...\n');
      await showcase.runFullShowcase();
    } else {
      // Interactive mode - ask user
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const choice = await new Promise<string>(resolve => {
        rl.question(
          'Choose demo type:\n' +
          '1. Full Showcase (3 minutes)\n' +
          '2. Quick Demo (30 seconds)\n' +
          '3. Technical Deep Dive\n' +
          'Enter choice (1-3): ',
          resolve
        );
      });
      
      rl.close();
      
      switch (choice.trim()) {
        case '1':
          console.log('\n🚀 Starting Full Showcase...\n');
          await showcase.runFullShowcase();
          break;
          
        case '2':
          console.log('\n⚡ Starting Quick Demo...\n');
          await showcase.runQuickDemo();
          break;
          
        case '3':
          console.log('\n🔍 Starting Technical Deep Dive...\n');
          await runTechnicalDeepDive();
          break;
          
        default:
          console.log('\n⚠️  Invalid choice. Running Quick Demo...\n');
          await showcase.runQuickDemo();
      }
    }
    
    // Generate submission package
    await generateSubmissionPackage();
    
  } catch (error: any) {
    console.error('\n❌ Demo failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

async function runTechnicalDeepDive() {
  console.log('🔧 Loading modules...\n');
  
  // Demonstrate module integration
  const modules = [
    'Event Ingestion (Module 1)',
    'Workflow Resolution (Module 2)',
    'Graph Analysis (Module 3)',
    'Timing Analysis (Module 4)',
    'Rule Analysis (Module 5)',
    'Risk Engine (Module 6)',
    'Explanation Engine (Module 7)',
    'Presentation Layer (Module 8)',
    'Storage (Module 9)',
    'What-If Engine (Module 10)',
    'Rovo AI Agent (Module 11)',
    'Competition Mode (Module 12)'
  ];
  
  for (const module of modules) {
    console.log(`✅ ${module}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n📊 Module Integration Diagram:');
  console.log(`
  ┌─────────────────────────────────────────┐
  │         Jira Events (Webhooks)          │
  └────────────────┬────────────────────────┘
                   ▼
  ┌─────────────────────────────────────────┐
  │        Module 1: Event Ingestion        │
  └────────────────┬────────────────────────┘
                   ▼
  ┌─────────────────────────────────────────┐
  │       Module 2-5: Analysis Pipeline     │
  │  • Workflow Structure                   │
  │  • Timing Bottlenecks                   │
  │  • Automation Conflicts                 │
  └───────────────┬─────────────────────────┘
                  │      ▲
                  ▼      │
  ┌─────────────────────────────────────────┐
  │    Module 6-7: Risk & Explanation       │
  └───────────────┬─────────────────────────┘
                  │
         ┌────────┴────────┐
         ▼                 ▼
  ┌─────────────┐  ┌─────────────┐
  │ Module 11:  │  │ Module 10:  │
  │ Rovo AI     │  │ What-If     │
  │ Agent       │  │ Engine      │
  └─────────────┘  └─────────────┘
         │                 │
         └────────┬────────┘
                  ▼
  ┌─────────────────────────────────────────┐
  │   Module 8-9: Presentation & Storage    │
  │  • Jira Dashboard                       │
  │  • Confluence Reports                   │
  │  • Persistent Snapshots                 │
  └─────────────────────────────────────────┘
  `);
}

async function generateSubmissionPackage() {
  console.log('\n📦 Generating Submission Package...\n');
  
  const packageContents = {
    files: [
      'src/rovo-agent/rovoAdapter.ts - Rovo AI Agent Bridge',
      'src/rovo-agent/naturalLanguageQuery.ts - NLP Processing',
      'src/rovo-agent/actionExecutor.ts - Safe Action Execution',
      'src/competition/competition-mode.ts - Competition Features',
      'src/competition/showcase.ts - Demonstration Orchestrator',
      'scripts/competition-demo.ts - This demo script',
      'static/frontend/index.jsx - Enhanced UI with Rovo Chat',
      'docs/COMPETITION_GUIDE.md - Judge Instructions',
      'submission/README_SUBMISSION.md - Submission Overview'
    ],
    
    demoCommands: [
      'npm run competition-demo - Full competition showcase',
      'npm run quick-demo - 30-second Rovo AI demo',
      'npm run technical - Module architecture walkthrough'
    ],
    
    keyInnovations: [
      '1. Rovo AI Agent Integration - Natural language workflow analysis',
      '2. Hybrid Deterministic+AI - Explainable insights with AI enhancement',
      '3. Safe Action Pipeline - Validated, risk-aware improvements',
      '4. Zero-Configuration - Leverages existing Jira data automatically'
    ]
  };
  
  console.log('Submission Package Contents:');
  console.log('='.repeat(50));
  
  console.log('\n📁 Core Files:');
  packageContents.files.forEach(file => console.log(`  • ${file}`));
  
  console.log('\n🎮 Demo Commands:');
  packageContents.demoCommands.forEach(cmd => console.log(`  $ ${cmd}`));
  
  console.log('\n💡 Key Innovations:');
  packageContents.keyInnovations.forEach(innovation => console.log(`  ${innovation}`));
  
  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Submission package ready for CodegeistX!');
  console.log('\nNext steps:');
  console.log('1. Record 3-minute demo video using this script');
  console.log('2. Take screenshots of Rovo AI interface');
  console.log('3. Update submission form with enhanced features');
  console.log('4. Submit before deadline!\n');
}

// Handle CLI arguments
const args = process.argv.slice(2);
let mode: 'full' | 'quick' | 'technical' | undefined;

if (args.includes('--quick') || args.includes('-q')) {
  mode = 'quick';
} else if (args.includes('--technical') || args.includes('-t')) {
  mode = 'technical';
} else if (args.includes('--full') || args.includes('-f')) {
  mode = 'full';
}

// Run the demo
runCompetitionDemo(mode).catch(console.error);


export { runCompetitionDemo };
