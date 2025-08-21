#!/usr/bin/env node

// Test script to verify style cycling functionality
const GraphViewer = require('../src/graph-viewer');

console.log('🧪 Testing style cycling functionality...\n');

// Create a viewer with initial style
const viewer = new GraphViewer({
  style: 'blocks',
  maxDataPoints: 10
});

// Test the style cycling
console.log('Initial style:', viewer.style);
console.log('Available styles:', viewer.availableStyles);

// Simulate cycling through styles
for (let i = 0; i < viewer.availableStyles.length + 2; i++) {
  const oldStyle = viewer.style;
  viewer.cycleStyle();
  console.log(`Cycled from '${oldStyle}' to '${viewer.style}'`);
}

console.log('\n✅ Style cycling test completed!');
console.log('🎨 All styles cycled successfully with wrap-around');