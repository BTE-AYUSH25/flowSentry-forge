// Try both .js and .ts extensions
try {
  // Try .js first (if compiled)
  const module1 = require('./src/rovo-agent/rovoAdapter.js');
  console.log('✅ Loaded .js module');
} catch {
  try {
    // Try .ts with ts-node
    require('ts-node/register');
    const module2 = require('./src/rovo-agent/rovoAdapter.ts');
    console.log('✅ Loaded .ts module with ts-node');
  } catch (error) {
    console.log('❌ Both failed:', error.message);
  }
}
