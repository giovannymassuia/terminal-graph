#!/usr/bin/env node

// Test script for the reload feature
const GraphViewer = require('../src/graph-viewer');
const fs = require('fs');

console.log('🧪 Testing reload and style cycling features...\n');

// Create a test log file with initial data
const testFile = 'test-reload.log';
const initialData = [
  { timestamp: Date.now() - 5000, heapUsed: 50, heapTotal: 100, heapPercent: 50, rss: 120, external: 5 },
  { timestamp: Date.now() - 4000, heapUsed: 55, heapTotal: 100, heapPercent: 55, rss: 125, external: 5 },
  { timestamp: Date.now() - 3000, heapUsed: 52, heapTotal: 100, heapPercent: 52, rss: 122, external: 5 },
];

// Write initial data
fs.writeFileSync(testFile, '');
initialData.forEach(data => {
  fs.appendFileSync(testFile, JSON.stringify(data) + '\n');
});

console.log('✅ Created test file with initial data');
console.log('📊 Starting viewer...');
console.log('');
console.log('Instructions:');
console.log('1. Press R to reload the data');
console.log('2. Press C to clear and reload');
console.log('3. Press L to cycle through styles (blocks → lean → ascii → dots → braille)');
console.log('4. Press Q to quit');
console.log('');

// Create and start viewer
const viewer = new GraphViewer({
  logFile: testFile,
  metric: 'heapUsed',
  accumulate: true,
  style: 'lean',
  refreshRate: 500
});

// Add more data after 2 seconds
setTimeout(() => {
  const newData = { 
    timestamp: Date.now(), 
    heapUsed: 60, 
    heapTotal: 100, 
    heapPercent: 60, 
    rss: 130, 
    external: 5 
  };
  fs.appendFileSync(testFile, JSON.stringify(newData) + '\n');
  console.log('\n📝 Added new data point - press R to reload or L to try different styles!');
}, 2000);

// Start the viewer
viewer.start().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

// Clean up on exit
process.on('exit', () => {
  try {
    fs.unlinkSync(testFile);
    console.log('\n🧹 Cleaned up test file');
  } catch (e) {
    // Ignore cleanup errors
  }
});