#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Terminal Graph Demo - Real-time Heap Monitoring');
console.log('================================================\n');

console.log('This demo will:');
console.log('1. Start a heap monitor that simulates memory usage');
console.log('2. Display a real-time ASCII line graph of the heap');
console.log('\nThe monitor will simulate memory allocation/deallocation');
console.log('to create an interesting graph pattern.\n');

console.log('Starting in 3 seconds...');

setTimeout(() => {
  console.log('\nStarting heap monitor with memory simulation...\n');
  
  // Start the heap monitor with simulation
  const monitor = spawn('node', [
    path.join(__dirname, 'heap-monitor.js'),
    'heap-demo.log',
    '100',
    '--simulate'
  ], {
    stdio: 'inherit'
  });

  // Wait a moment for the monitor to start generating data
  setTimeout(() => {
    console.log('\n\nStarting graph viewer in a new terminal...');
    console.log('(If the graph doesn\'t appear, run this in a second terminal:)');
    console.log('  node graph-viewer.js --file heap-demo.log --metric heapPercent\n');
    
    // Start the graph viewer with block style
    const viewer = spawn('node', [
      path.join(__dirname, 'graph-viewer.js'),
      '--file', 'heap-demo.log',
      '--metric', 'heapPercent',
      '--points', '80',
      '--refresh', '200',
      '--style', 'blocks'
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

  }, 2000);

}, 3000);