#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Terminal Graph - Accumulation Mode Test');
console.log('========================================\n');

console.log('This test will demonstrate the accumulation feature:');
console.log('- Graph will continuously accumulate all data points');
console.log('- As more data comes in, it will compress to fit the display');
console.log('- All peaks and valleys will be preserved');
console.log('- Time axis will show the full duration\n');

console.log('The monitor will generate varying memory patterns for 2 minutes.');
console.log('Watch how the graph compresses and readjusts!\n');

console.log('Starting in 3 seconds...');

setTimeout(() => {
  console.log('\nStarting heap monitor with varying patterns...\n');
  
  // Start the heap monitor with custom simulation
  const monitor = spawn('node', ['-e', `
    const fs = require('fs');
    const logFile = 'accumulate-test.log';
    const stream = fs.createWriteStream(logFile, { flags: 'a' });
    
    console.log('Generating memory patterns for 2 minutes...');
    console.log('Check the graph in another terminal with:');
    console.log('  node graph-viewer.js --file accumulate-test.log --accumulate --metric heapPercent\\n');
    
    let iteration = 0;
    const patterns = [
      () => 30 + Math.sin(iteration * 0.1) * 20,  // Sine wave
      () => 40 + Math.random() * 30,               // Random
      () => 20 + (iteration % 30),                 // Sawtooth
      () => iteration % 40 < 20 ? 70 : 30,         // Square wave
      () => 50 + Math.sin(iteration * 0.05) * 40 * Math.sin(iteration * 0.3), // Complex wave
    ];
    
    let patternIndex = 0;
    let patternCounter = 0;
    
    const interval = setInterval(() => {
      // Switch patterns every 30 iterations
      if (patternCounter++ > 30) {
        patternCounter = 0;
        patternIndex = (patternIndex + 1) % patterns.length;
        console.log('Switching to pattern', patternIndex + 1);
      }
      
      const value = patterns[patternIndex]();
      const data = {
        timestamp: Date.now(),
        heapUsed: value,
        heapTotal: 100,
        heapPercent: value,
        rss: value * 1.5,
        external: value * 0.3
      };
      
      stream.write(JSON.stringify(data) + '\\n');
      process.stdout.write('\\rIteration: ' + iteration + ' | Pattern: ' + (patternIndex + 1) + ' | Value: ' + value.toFixed(1) + '%   ');
      
      iteration++;
      
      // Stop after 2 minutes
      if (iteration > 1200) { // 100ms * 1200 = 120 seconds
        console.log('\\n\\nTest complete! Check the accumulated graph.');
        clearInterval(interval);
        stream.end();
        process.exit(0);
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

  // Wait a moment for the monitor to start generating data
  setTimeout(() => {
    console.log('\n\nStarting graph viewer in accumulation mode...');
    console.log('(If the graph doesn\'t appear, run this in a second terminal:)');
    console.log('  node graph-viewer.js --file accumulate-test.log --accumulate --metric heapPercent\n');
    
    // Start the graph viewer in accumulation mode
    const viewer = spawn('node', [
      path.join(__dirname, 'graph-viewer.js'),
      '--file', 'accumulate-test.log',
      '--metric', 'heapPercent',
      '--accumulate',  // Enable accumulation mode
      '--style', 'blocks',
      '--refresh', '500'  // Slower refresh for better visibility
    ], {
      stdio: 'inherit'
    });

    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n\nStopping test...');
      monitor.kill();
      viewer.kill();
      process.exit(0);
    });

  }, 2000);

}, 3000);