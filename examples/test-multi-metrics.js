#!/usr/bin/env node

// Test script for multi-metric web view functionality
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 Testing Multi-Metric Web View functionality...\n');

// Create test log file with varied memory patterns
const testFile = 'test-multi-metrics.log';

function generateMemoryPattern() {
  const data = [];
  const startTime = Date.now() - (30 * 1000); // 30 seconds ago
  
  for (let i = 0; i < 30; i++) {
    const time = startTime + (i * 1000);
    
    // Create different patterns for each metric
    const heapUsed = 40 + Math.sin(i * 0.2) * 15 + Math.random() * 5;
    const heapTotal = heapUsed + 20 + Math.cos(i * 0.15) * 10;
    const heapPercent = (heapUsed / heapTotal) * 100;
    const rss = heapUsed * 1.3 + Math.sin(i * 0.1) * 8;
    const external = 2 + Math.random() * 3;
    
    data.push({
      timestamp: time,
      heapUsed: heapUsed.toFixed(2),
      heapTotal: heapTotal.toFixed(2),
      heapPercent: heapPercent.toFixed(2),
      rss: rss.toFixed(2),
      external: external.toFixed(2)
    });
  }
  
  return data;
}

// Write initial test data
fs.writeFileSync(testFile, '');
const initialData = generateMemoryPattern();
initialData.forEach(data => {
  fs.appendFileSync(testFile, JSON.stringify(data) + '\n');
});

console.log('✅ Created test file with multi-metric data');
console.log('🌐 Starting web viewer with multi-metric support...');
console.log('');
console.log('Open http://localhost:3456 in your browser to test:');
console.log('');
console.log('🔹 View Mode Testing:');
console.log('  • Click "Single" - Traditional single metric view');
console.log('  • Click "Multi" - Grid of 5 separate charts');
console.log('  • Click "Compare" - Overlay multiple metrics');
console.log('');
console.log('🔹 Compare Mode Features:');
console.log('  • Check/uncheck metrics to show/hide');
console.log('  • Use number keys 1-5 to toggle quickly');
console.log('  • Each metric has a unique color');
console.log('  • Legend shows active metrics');
console.log('');
console.log('🔹 Interactive Features:');
console.log('  • M key - cycle view modes');
console.log('  • L key - cycle chart styles');
console.log('  • Space - pause/resume');
console.log('  • C - clear data');
console.log('');
console.log('🔹 Style Testing:');
console.log('  • Line - classic with data points');
console.log('  • Area - filled gradient charts');
console.log('  • Bars - vertical bar charts');
console.log('');
console.log('Press Ctrl+C to stop the test\n');

// Start the web viewer
const viewer = spawn('node', [
  path.join(__dirname, '..', 'src', 'web-graph-viewer.js'),
  '--file', testFile,
  '--accumulate'
], {
  stdio: 'inherit'
});

// Add varied data points to test real-time updates
let counter = 0;
const interval = setInterval(() => {
  counter++;
  
  // Create different update patterns
  const heapUsed = 45 + Math.sin(counter * 0.3) * 20 + Math.random() * 8;
  const heapTotal = heapUsed + 25 + Math.cos(counter * 0.2) * 12;
  const heapPercent = (heapUsed / heapTotal) * 100;
  const rss = heapUsed * 1.4 + Math.sin(counter * 0.25) * 10;
  const external = 1.5 + Math.random() * 4;
  
  const newData = {
    timestamp: Date.now(),
    heapUsed: heapUsed.toFixed(2),
    heapTotal: heapTotal.toFixed(2),
    heapPercent: heapPercent.toFixed(2),
    rss: rss.toFixed(2),
    external: external.toFixed(2)
  };
  
  fs.appendFileSync(testFile, JSON.stringify(newData) + '\n');
  
  if (counter % 5 === 0) {
    console.log(`📝 Added data point ${counter}: Heap=${newData.heapUsed}MB, RSS=${newData.rss}MB, %=${newData.heapPercent}%`);
  }
}, 1500);

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
    
    console.log('\n🎉 Multi-metric web view test completed!');
    console.log('');
    console.log('Features tested:');
    console.log('  ✅ Single view mode');
    console.log('  ✅ Multi-chart grid view');
    console.log('  ✅ Compare/overlay view');
    console.log('  ✅ Real-time updates');
    console.log('  ✅ Interactive controls');
    console.log('  ✅ Keyboard shortcuts');
    console.log('  ✅ Style switching');
    
    process.exit(0);
  }, 100);
});