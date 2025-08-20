#!/usr/bin/env node

/**
 * Example script that simulates a typical development server
 * This demonstrates how tgraph-monitor can wrap any command
 */

console.log('🚀 Mock development server starting...');
console.log('📦 Simulating pnpm dev behavior');
console.log('🌐 Server would be running on http://localhost:3000');
console.log('');

let memoryLoad = [];
let counter = 0;

// Simulate development server memory patterns
const developmentActivity = setInterval(() => {
  counter++;
  
  // Simulate different phases of development
  if (counter < 10) {
    console.log(`🔧 [${new Date().toLocaleTimeString()}] Build phase - compiling modules...`);
    // Simulate build memory usage
    memoryLoad.push(new Array(50000).fill(Math.random()));
  } else if (counter < 20) {
    console.log(`⚡ [${new Date().toLocaleTimeString()}] Dev server ready - watching for changes...`);
    // Stable memory usage
    if (counter % 3 === 0) {
      memoryLoad = memoryLoad.slice(-5); // Cleanup old build artifacts
    }
  } else if (counter < 30) {
    console.log(`🔄 [${new Date().toLocaleTimeString()}] Hot reload triggered - rebuilding...`);
    // Simulate hot reload memory spikes
    memoryLoad.push(new Array(30000).fill(Math.random()));
    if (counter % 4 === 0) {
      memoryLoad = memoryLoad.slice(-3);
    }
  } else {
    console.log(`💫 [${new Date().toLocaleTimeString()}] Development server running smoothly`);
    // Periodic memory cleanup
    if (counter % 2 === 0) {
      memoryLoad = memoryLoad.slice(-2);
    }
  }
  
  if (counter >= 50) {
    console.log('');
    console.log('✅ Development server simulation complete!');
    console.log('🎯 This demonstrates typical pnpm dev memory patterns');
    clearInterval(developmentActivity);
    
    // Keep process alive for a bit to see final memory state
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }
}, 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Development server shutting down gracefully...');
  clearInterval(developmentActivity);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('');
  console.log('🛑 Received SIGTERM, shutting down...');
  clearInterval(developmentActivity);
  process.exit(0);
});