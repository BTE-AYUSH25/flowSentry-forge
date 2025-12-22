import('./src/rovo-agent/rovoAdapter.js')
  .then(module => console.log('✅ rovoAdapter exists'))
  .catch(error => console.log('❌ rovoAdapter error:', error.message));
