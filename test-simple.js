import('./src/competition/showcase.ts')
  .then(module => {
    console.log('✅ Import successful!');
    console.log('Exports:', Object.keys(module));
  })
  .catch(error => {
    console.log('❌ Import failed:', error.message);
    console.log('Trying with .js extension...');
    return import('./src/competition/showcase.js');
  })
  .then(module => {
    console.log('✅ Import with .js successful!');
  })
  .catch(error => {
    console.log('❌ Both imports failed:', error.message);
  });
