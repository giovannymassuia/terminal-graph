#!/usr/bin/env node

/**
 * Generate comprehensive demo data with realistic CPU and memory patterns
 */

const fs = require('fs');
const path = require('path');

const logFile = 'demo-full-metrics.log';

console.log(`📊 Generating comprehensive demo data with CPU and memory metrics...`);
console.log(`📁 Output file: ${logFile}\n`);

// Clear existing file
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

const stream = fs.createWriteStream(logFile, { flags: 'a' });

// Simulation parameters
const duration = 60; // 60 data points
const interval = 100; // 100ms between points
let timestamp = Date.now() - (duration * interval); // Start in the past

// State variables for realistic patterns
let memoryBase = 40; // Base memory usage
let memoryLoad = 0;
let cpuBase = 5; // Base CPU usage
let cpuSpike = 0;
let trend = 1;

console.log('Generating data points with patterns:');
console.log('- CPU: Base 5-10% with periodic spikes (30-70%)');
console.log('- Memory: Gradual increase with GC drops\n');

for (let i = 0; i < duration; i++) {
  timestamp += interval;
  
  // Create realistic CPU patterns
  if (i % 8 === 0) {
    // CPU spike every 8 points (heavy computation)
    cpuSpike = 30 + Math.random() * 40; // 30-70% spike
  } else {
    cpuSpike *= 0.7; // Decay spike
  }
  
  // Background CPU varies between 5-15%
  cpuBase = 5 + Math.sin(i * 0.2) * 5 + Math.random() * 5;
  const cpuPercent = Math.min(100, cpuBase + cpuSpike);
  
  // Create realistic memory patterns
  if (i % 15 === 0) {
    // GC event - memory drops
    memoryLoad *= 0.6;
  } else {
    // Gradual memory increase
    memoryLoad += Math.random() * 2;
  }
  
  // Memory oscillates and trends upward
  memoryBase = 40 + Math.sin(i * 0.1) * 10 + (i * 0.3);
  const heapUsed = memoryBase + memoryLoad;
  const heapTotal = Math.max(heapUsed * 1.5, 100);
  const heapPercent = (heapUsed / heapTotal) * 100;
  
  // RSS is always higher than heap
  const rss = heapUsed + 20 + Math.random() * 10;
  
  // External memory varies
  const external = 5 + Math.sin(i * 0.3) * 3 + Math.random() * 2;
  
  // CPU time accumulates
  const cpuUser = i * 10 + cpuPercent * 2;
  const cpuSystem = i * 5 + cpuPercent;
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
  if (i % 10 === 0) {
    process.stdout.write(`\r${'█'.repeat(Math.floor((i/duration) * 30))}${'░'.repeat(30 - Math.floor((i/duration) * 30))} ${i}/${duration} points`);
  }
}

stream.end();

console.log(`\r${'█'.repeat(30)} ${duration}/${duration} points`);
console.log('\n\n✅ Demo data generated successfully!\n');

console.log('📊 Data characteristics:');
console.log('- CPU: Ranges from 5% to 70% with periodic spikes');
console.log('- Memory: Gradual increase from 40MB to ~60MB with GC drops');
console.log('- All metrics have realistic patterns\n');

console.log('🚀 To view the data, run:');
console.log('\n1. Terminal view (Memory):');
console.log('   terminal-graph view --file demo-full-metrics.log --metric heapUsed --accumulate --style lean\n');
console.log('2. Terminal view (CPU):');
console.log('   terminal-graph view --file demo-full-metrics.log --metric cpuPercent --accumulate --style lean\n');
console.log('3. Web dashboard:');
console.log('   terminal-graph web --file demo-full-metrics.log --metric cpuPercent --port 3458\n');
console.log('Press M in terminal view to toggle between CPU and Memory modes!');