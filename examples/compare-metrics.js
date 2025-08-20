#!/usr/bin/env node

/**
 * Compare Different Metrics Demo
 * Shows the difference between heapUsed (MB) vs heapPercent (%)
 */

const fs = require('fs');

console.log('📊 Creating sample data to compare metrics...\n');

// Generate sample data with realistic memory patterns
const logFile = 'metrics-comparison.log';
const stream = fs.createWriteStream(logFile, { flags: 'w' });

console.log('Generating 100 data points with memory growth pattern...');

for (let i = 0; i < 100; i++) {
  const timestamp = Date.now() - (100 - i) * 500; // 500ms intervals
  
  // Create realistic memory growth pattern
  let baseMemory, totalHeap;
  
  if (i < 25) {
    // Startup phase - gradual growth
    baseMemory = 5 + (i / 25) * 15; // 5MB to 20MB
    totalHeap = baseMemory * 1.5; // heap total grows with usage
  } else if (i < 50) {
    // Active phase - more memory usage
    baseMemory = 20 + ((i - 25) / 25) * 30; // 20MB to 50MB
    totalHeap = baseMemory * 1.4;
  } else if (i < 75) {
    // Heavy usage phase
    baseMemory = 50 + ((i - 50) / 25) * 50; // 50MB to 100MB
    totalHeap = baseMemory * 1.3;
  } else {
    // Peak phase with some spikes
    const spike = i % 5 === 0 ? 30 : 0; // Occasional spikes
    baseMemory = 100 + ((i - 75) / 25) * 50 + spike; // 100MB to 150MB + spikes
    totalHeap = Math.max(baseMemory * 1.2, 150);
  }
  
  // Add some realistic noise
  baseMemory += (Math.random() - 0.5) * 5;
  totalHeap += (Math.random() - 0.5) * 8;
  
  // Ensure totalHeap >= heapUsed
  totalHeap = Math.max(totalHeap, baseMemory * 1.1);
  
  const heapPercent = (baseMemory / totalHeap) * 100;
  
  const data = {
    timestamp: timestamp,
    heapUsed: baseMemory.toFixed(2),
    heapTotal: totalHeap.toFixed(2),
    heapPercent: heapPercent.toFixed(2),
    rss: (baseMemory * 1.8).toFixed(2),
    external: (baseMemory * 0.1).toFixed(2)
  };
  
  stream.write(JSON.stringify(data) + '\n');
}

stream.end();

console.log('✅ Data generated successfully!\n');

console.log('Now compare the different metrics:');
console.log('');
console.log('1️⃣  View ACTUAL MEMORY in MB (recommended):');
console.log('   terminal-graph view --file metrics-comparison.log --metric heapUsed --style lean');
console.log('');
console.log('2️⃣  View PERCENTAGE (0-100%):');
console.log('   terminal-graph view --file metrics-comparison.log --metric heapPercent --style lean');
console.log('');
console.log('3️⃣  View TOTAL HEAP SIZE in MB:');
console.log('   terminal-graph view --file metrics-comparison.log --metric heapTotal --style lean');
console.log('');
console.log('4️⃣  View TOTAL PROCESS MEMORY (RSS) in MB:');
console.log('   terminal-graph view --file metrics-comparison.log --metric rss --style lean');
console.log('');
console.log('Notice how:');
console.log('- heapUsed shows actual MB (grows from ~5MB to ~180MB)');
console.log('- heapPercent shows % utilization (stays around 70-90%)');
console.log('- heapTotal shows V8 heap size (grows as needed)');
console.log('- rss shows total process memory (highest values)');
console.log('');
console.log('For memory leak detection, use: --metric heapUsed');
console.log('For heap efficiency monitoring, use: --metric heapPercent');