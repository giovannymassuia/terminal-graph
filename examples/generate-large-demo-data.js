#!/usr/bin/env node

/**
 * Generate large demo data set for testing resolution control
 * Creates 1000+ data points to test compression
 */

const fs = require('fs');
const path = require('path');

const logFile = 'large-demo-metrics.log';

console.log(`📊 Generating large demo data set for resolution testing...`);
console.log(`📁 Output file: ${logFile}\n`);

// Clear existing file
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

const stream = fs.createWriteStream(logFile, { flags: 'a' });

// Simulation parameters
const duration = 1200; // 1200 data points (plenty for compression testing)
const interval = 100; // 100ms between points
let timestamp = Date.now() - (duration * interval); // Start in the past

// State variables for realistic patterns
let memoryBase = 40; // Base memory usage
let memoryLoad = 0;
let cpuBase = 5; // Base CPU usage
let cpuSpike = 0;
let trend = 1;
let majorGcCounter = 0;

console.log('Generating data points with complex patterns:');
console.log('- CPU: Base 5-15% with periodic spikes (20-90%)');
console.log('- Memory: Gradual increase with major/minor GC events');
console.log('- Complex patterns to test peak preservation\n');

for (let i = 0; i < duration; i++) {
  timestamp += interval;
  
  // Create complex CPU patterns
  if (i % 12 === 0) {
    // Major CPU spike every 12 points
    cpuSpike = 40 + Math.random() * 50; // 40-90% spike
  } else if (i % 5 === 0) {
    // Minor CPU spike every 5 points
    cpuSpike = Math.max(cpuSpike, 20 + Math.random() * 25); // 20-45% spike
  } else {
    cpuSpike *= 0.8; // Decay spike
  }
  
  // Background CPU varies between 5-20% with patterns
  cpuBase = 8 + Math.sin(i * 0.1) * 5 + Math.sin(i * 0.05) * 3 + Math.random() * 4;
  const cpuPercent = Math.min(100, cpuBase + cpuSpike);
  
  // Create complex memory patterns
  majorGcCounter++;
  
  if (majorGcCounter > 30 && i % 45 === 0) {
    // Major GC event - significant drop
    memoryLoad *= 0.3;
    majorGcCounter = 0;
  } else if (i % 15 === 0) {
    // Minor GC event - small drop  
    memoryLoad *= 0.7;
  } else {
    // Gradual memory increase with variation
    memoryLoad += Math.random() * 3 + Math.sin(i * 0.02) * 1;
  }
  
  // Memory has long-term trend plus oscillations
  memoryBase = 35 + Math.sin(i * 0.08) * 15 + (i * 0.02) + Math.sin(i * 0.003) * 5;
  const heapUsed = Math.max(10, memoryBase + memoryLoad);
  const heapTotal = Math.max(heapUsed * 1.4, 80);
  const heapPercent = (heapUsed / heapTotal) * 100;
  
  // RSS follows heap with additional overhead
  const rss = heapUsed + 25 + Math.random() * 8 + Math.sin(i * 0.07) * 5;
  
  // External memory varies with some correlation to heap
  const external = 8 + Math.sin(i * 0.15) * 4 + Math.random() * 3 + (heapUsed * 0.05);
  
  // CPU time accumulates realistically  
  const cpuUser = i * 12 + cpuPercent * 3 + Math.sin(i * 0.03) * 20;
  const cpuSystem = i * 6 + cpuPercent * 1.5 + Math.sin(i * 0.04) * 10;
  const cpuTotal = cpuUser + cpuSystem;
  
  const data = {
    timestamp: timestamp,
    // Memory metrics
    heapUsed: heapUsed.toFixed(2),
    heapTotal: heapTotal.toFixed(2),
    heapPercent: heapPercent.toFixed(2),
    rss: rss.toFixed(2),
    external: external.toFixed(2),
    // CPU metrics
    cpuPercent: cpuPercent.toFixed(2),
    cpuUser: cpuUser.toFixed(2),
    cpuSystem: cpuSystem.toFixed(2),
    cpuTotal: cpuTotal.toFixed(2)
  };
  
  stream.write(JSON.stringify(data) + '\n');
  
  // Show progress
  if (i % 100 === 0) {
    process.stdout.write(`\r${'█'.repeat(Math.floor((i/duration) * 40))}${'░'.repeat(40 - Math.floor((i/duration) * 40))} ${i}/${duration} points`);
  }
}

stream.end();

console.log(`\r${'█'.repeat(40)} ${duration}/${duration} points`);
console.log('\n\n✅ Large demo data generated successfully!\n');

console.log('📊 Data characteristics:');
console.log('- 1200+ data points for comprehensive testing');
console.log('- CPU: Complex patterns with major/minor spikes (5-90%)');
console.log('- Memory: Realistic GC patterns with trends (10-80MB)');
console.log('- Perfect for testing resolution control (50-1000 points)\n');

console.log('🚀 To test resolution control:');
console.log('\n1. Web dashboard (test resolution slider):');
console.log('   terminal-graph web --file large-demo-metrics.log --metric cpuPercent --accumulate --port 3459\n');
console.log('2. Terminal view (accumulate mode):');
console.log('   terminal-graph view --file large-demo-metrics.log --metric heapUsed --accumulate --style lean\n');
console.log('3. Compare web views at different resolutions!');