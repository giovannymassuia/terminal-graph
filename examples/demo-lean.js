#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Terminal Graph - Lean Style Accumulation Demo');
console.log('=============================================\n');

console.log('This demo shows:');
console.log('- Lean colon-based visual style (:)');
console.log('- Real-time data accumulation');
console.log('- Automatic compression as data grows');
console.log('- Time axis showing elapsed duration\n');

console.log('The monitor will create varying patterns for 90 seconds.');
console.log('Watch the graph accumulate and compress data!\n');

console.log('Starting in 3 seconds...');

setTimeout(() => {
  console.log('\nStarting lean demo...\n');
  
  // Start the heap monitor with varied patterns
  const monitor = spawn('node', ['-e', `
    const fs = require('fs');
    const logFile = 'lean-demo.log';
    const stream = fs.createWriteStream(logFile, { flags: 'w' }); // Clear previous data
    
    console.log('Generating memory patterns with lean visualization...');
    console.log('Graph will show in lean colon style with accumulation\\n');
    
    let iteration = 0;
    
    // Create interesting patterns that will show peaks and valleys
    const getValue = (i) => {
      const base = 40;
      const wave1 = Math.sin(i * 0.05) * 20;       // Slow wave
      const wave2 = Math.sin(i * 0.2) * 10;        // Fast wave
      const spike = i % 100 < 5 ? 30 : 0;          // Periodic spikes
      const noise = (Math.random() - 0.5) * 5;     // Random noise
      return Math.max(10, Math.min(90, base + wave1 + wave2 + spike + noise));
    };
    
    const interval = setInterval(() => {
      const value = getValue(iteration);
      
      const data = {
        timestamp: Date.now(),
        heapUsed: value,
        heapTotal: 100,
        heapPercent: value,
        rss: value * 1.2,
        external: value * 0.3
      };
      
      stream.write(JSON.stringify(data) + '\\n');
      
      // Show progress
      const progress = Math.floor((iteration / 900) * 100); // 900 = 90 seconds
      process.stdout.write('\\rProgress: ' + progress + '% | Value: ' + value.toFixed(1) + '% | Points: ' + (iteration + 1) + '   ');
      
      iteration++;
      
      // Stop after 90 seconds (900 iterations at 100ms)
      if (iteration >= 900) {
        console.log('\\n\\nDemo complete! Final graph shows all 900 data points compressed.');
        clearInterval(interval);
        stream.end();
        setTimeout(() => process.exit(0), 2000);
      }
    }, 100);
    
    process.on('SIGINT', () => {
      clearInterval(interval);
      stream.end();
      process.exit(0);
    });
  `], {
    stdio: 'inherit'
  });

  // Wait for some data to accumulate, then start the graph viewer
  setTimeout(() => {
    console.log('\n\nStarting lean-style graph viewer with accumulation...');
    console.log('Watch how it compresses data as more points are added!\n');
    
    // Start the graph viewer with lean style and accumulation
    const viewer = spawn('node', [
      path.join(__dirname, 'graph-viewer.js'),
      '--file', 'lean-demo.log',
      '--metric', 'heapPercent',
      '--accumulate',           // Enable accumulation
      '--style', 'lean',        // Use lean colon style
      '--refresh', '300'        // Slower refresh for better visibility
    ], {
      stdio: 'inherit'
    });

    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n\nStopping demo...');
      monitor.kill();
      viewer.kill();
      process.exit(0);
    });

  }, 3000); // Wait 3 seconds for initial data

}, 3000);