#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class HeapMonitor {
  constructor(options = {}) {
    this.logFile = options.logFile || 'heap.log';
    this.interval = options.interval || 100; // ms
    this.maxEntries = options.maxEntries || 1000;
    this.stream = null;
    this.monitoring = false;
  }

  start() {
    if (this.monitoring) {
      console.log('Monitoring already started');
      return;
    }

    this.monitoring = true;
    this.stream = fs.createWriteStream(this.logFile, { flags: 'a' });
    
    console.log(`Starting heap monitoring to ${this.logFile}`);
    console.log(`Interval: ${this.interval}ms`);
    console.log('Press Ctrl+C to stop...\n');

    this.intervalId = setInterval(() => {
      this.captureHeapMetrics();
    }, this.interval);

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  captureHeapMetrics() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const externalMB = memUsage.external / 1024 / 1024;
    const rssMB = memUsage.rss / 1024 / 1024;
    
    const data = {
      timestamp: Date.now(),
      heapUsed: heapUsedMB.toFixed(2),
      heapTotal: heapTotalMB.toFixed(2),
      external: externalMB.toFixed(2),
      rss: rssMB.toFixed(2),
      heapPercent: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)
    };

    const logLine = JSON.stringify(data) + '\n';
    this.stream.write(logLine);

    // Also log to console for visibility
    process.stdout.write(`\rHeap: ${data.heapUsed}MB / ${data.heapTotal}MB (${data.heapPercent}%) | RSS: ${data.rss}MB`);
  }

  stop() {
    if (!this.monitoring) return;
    
    console.log('\n\nStopping heap monitoring...');
    this.monitoring = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
    
    process.exit(0);
  }
}

// Simulate some memory activity for demonstration
function simulateMemoryActivity() {
  const arrays = [];
  let growing = true;
  
  setInterval(() => {
    if (growing) {
      // Allocate memory
      arrays.push(new Array(10000).fill(Math.random()));
      if (arrays.length > 100) growing = false;
    } else {
      // Release memory
      arrays.pop();
      if (arrays.length === 0) growing = true;
    }
  }, 50);
}

// Main execution
if (require.main === module) {
  const monitor = new HeapMonitor({
    logFile: process.argv[2] || 'heap.log',
    interval: parseInt(process.argv[3]) || 100
  });
  
  // Start monitoring
  monitor.start();
  
  // Optional: simulate memory activity for demo purposes
  if (process.argv.includes('--simulate')) {
    simulateMemoryActivity();
  }
}

module.exports = HeapMonitor;