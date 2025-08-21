#!/usr/bin/env node

// Test script for web view functionality
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 Testing Web View functionality...\n');

// Create test log file with simulated data
const testFile = 'test-web.log';

function generateMemoryData() {
  const baseMemory = 50;
  const data = [];
  
  for (let i = 0; i < 20; i++) {
    const variation = Math.sin(i * 0.3) * 20 + Math.random() * 10;
    const heapUsed = baseMemory + variation;
    const heapTotal = 100;
    const heapPercent = (heapUsed / heapTotal) * 100;
    
    data.push({
      timestamp: Date.now() - (20 - i) * 1000,
      heapUsed: heapUsed.toFixed(2),
      heapTotal: heapTotal.toFixed(2),
      heapPercent: heapPercent.toFixed(2),
      rss: (heapUsed * 1.5).toFixed(2),
      external: (Math.random() * 5).toFixed(2)
    });
  }
  
  return data;
}

// Write initial test data
fs.writeFileSync(testFile, '');
const initialData = generateMemoryData();
initialData.forEach(data => {
  fs.appendFileSync(testFile, JSON.stringify(data) + '\n');
});

console.log('✅ Created test file with initial data');
console.log('📊 Starting web viewer on http://localhost:3456');
console.log('');
console.log('The browser should open automatically.');
console.log('');
console.log('Test the following features:');
console.log('1. Graph visualization (line, area, bars)');
console.log('2. Real-time updates as new data arrives');
console.log('3. Pause/Resume functionality');
console.log('4. Clear button');
console.log('5. Keyboard shortcuts (Space, C, L, R)');
console.log('');
console.log('Press Ctrl+C to stop the test\n');

// Start the web viewer
const viewer = spawn('node', [
  path.join(__dirname, '..', 'src', 'web-graph-viewer.js'),
  '--file', testFile,
  '--metric', 'heapUsed',
  '--accumulate',
  '--style', 'area'
], {
  stdio: 'inherit'
});

// Add new data points periodically
const interval = setInterval(() => {
  const newData = {
    timestamp: Date.now(),
    heapUsed: (50 + Math.random() * 40).toFixed(2),
    heapTotal: '100.00',
    heapPercent: ((50 + Math.random() * 40) / 100 * 100).toFixed(2),
    rss: (75 + Math.random() * 50).toFixed(2),
    external: (Math.random() * 5).toFixed(2)
  };
  
  fs.appendFileSync(testFile, JSON.stringify(newData) + '\n');
  console.log(`📝 Added new data point: ${newData.heapUsed} MB`);
}, 2000);

// Clean up on exit
process.on('SIGINT', () => {
  console.log('\n\n🧹 Cleaning up...');
  clearInterval(interval);
  viewer.kill();
  
  setTimeout(() => {
    try {
      fs.unlinkSync(testFile);
      console.log('✅ Test file cleaned up');
    } catch (e) {
      // Ignore cleanup errors
    }
    process.exit(0);
  }, 100);
});