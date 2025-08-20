#!/usr/bin/env node

const fs = require('fs');

console.log('Quick Lean Accumulation Test');
console.log('============================');
console.log('Creating sample data with peaks and valleys...\n');

// Generate sample data with interesting patterns
const logFile = 'quick-test.log';
const stream = fs.createWriteStream(logFile, { flags: 'w' });

// Create 200 data points with various patterns
for (let i = 0; i < 200; i++) {
  const timestamp = Date.now() - (200 - i) * 1000; // 1 second intervals going back
  
  // Create interesting patterns
  let value;
  if (i < 50) {
    // Rising trend with noise
    value = 20 + (i / 50) * 40 + (Math.random() - 0.5) * 10;
  } else if (i < 100) {
    // Sine wave with spikes
    value = 50 + Math.sin((i - 50) * 0.2) * 20 + (i % 10 === 0 ? 25 : 0);
  } else if (i < 150) {
    // Decline with valleys
    value = 70 - ((i - 100) / 50) * 30 + (i % 15 === 0 ? -20 : 0);
  } else {
    // Recovery with peaks
    value = 35 + ((i - 150) / 50) * 35 + (i % 8 === 0 ? 15 : 0);
  }
  
  value = Math.max(10, Math.min(90, value)); // Clamp between 10-90
  
  const data = {
    timestamp: timestamp,
    heapUsed: value,
    heapTotal: 100,
    heapPercent: value,
    rss: value * 1.2,
    external: value * 0.3
  };
  
  stream.write(JSON.stringify(data) + '\n');
}

stream.end();

console.log('Generated 200 data points with:');
console.log('- Rising trend (0-50)');
console.log('- Sine wave with spikes (50-100)');
console.log('- Decline with valleys (100-150)');
console.log('- Recovery with peaks (150-200)');
console.log('\nNow run:');
console.log('  node graph-viewer.js --file quick-test.log --style lean --accumulate');
console.log('\nOr compare styles:');
console.log('  node graph-viewer.js --file quick-test.log --style blocks --accumulate');
console.log('  node graph-viewer.js --file quick-test.log --style ascii --accumulate');
console.log('\nThe graph will show all 200 points compressed to fit your terminal!');