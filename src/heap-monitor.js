#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class HeapMonitor {
  constructor(options = {}) {
    this.logFile = options.logFile || 'heap.log';
    this.interval = options.interval || 100; // ms
    this.maxEntries = options.maxEntries || 1000;
    this.includeCpu = options.includeCpu !== false; // Default to true, can be disabled
    this.stream = null;
    this.monitoring = false;
    
    // CPU monitoring state
    this.previousCpuUsage = null;
    this.previousTime = null;
  }

  start() {
    if (this.monitoring) {
      console.log('Monitoring already started');
      return;
    }

    this.monitoring = true;
    this.stream = fs.createWriteStream(this.logFile, { flags: 'a' });
    
    console.log(`Starting resource monitoring to ${this.logFile}`);
    console.log(`Interval: ${this.interval}ms`);
    console.log(`CPU monitoring: ${this.includeCpu ? 'enabled' : 'disabled'}`);
    console.log('Press Ctrl+C to stop...\n');

    // Initialize CPU monitoring if enabled
    if (this.includeCpu) {
      this.previousCpuUsage = process.cpuUsage();
      this.previousTime = process.hrtime.bigint();
    }

    this.intervalId = setInterval(() => {
      this.captureMetrics();
    }, this.interval);

    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  captureMetrics() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
    const externalMB = memUsage.external / 1024 / 1024;
    const rssMB = memUsage.rss / 1024 / 1024;
    
    const data = {
      timestamp: Date.now(),
      // Memory metrics
      heapUsed: heapUsedMB.toFixed(2),
      heapTotal: heapTotalMB.toFixed(2),
      external: externalMB.toFixed(2),
      rss: rssMB.toFixed(2),
      heapPercent: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)
    };

    // Add CPU metrics if enabled
    if (this.includeCpu && this.previousCpuUsage && this.previousTime) {
      const currentCpuUsage = process.cpuUsage(this.previousCpuUsage);
      const currentTime = process.hrtime.bigint();
      
      // Calculate elapsed time in microseconds
      const elapsedTimeUs = Number(currentTime - this.previousTime) / 1000;
      
      // Calculate CPU percentage
      const totalCpuTimeUs = currentCpuUsage.user + currentCpuUsage.system;
      const cpuPercent = elapsedTimeUs > 0 ? (totalCpuTimeUs / elapsedTimeUs) * 100 : 0;
      
      // Add CPU metrics to data
      data.cpuPercent = Math.min(cpuPercent, 100).toFixed(2); // Cap at 100%
      data.cpuUser = (currentCpuUsage.user / 1000).toFixed(2); // Convert to milliseconds
      data.cpuSystem = (currentCpuUsage.system / 1000).toFixed(2); // Convert to milliseconds
      data.cpuTotal = ((currentCpuUsage.user + currentCpuUsage.system) / 1000).toFixed(2);
      
      // Update for next measurement
      this.previousCpuUsage = process.cpuUsage();
      this.previousTime = process.hrtime.bigint();
    }

    const logLine = JSON.stringify(data) + '\n';
    this.stream.write(logLine);

    // Enhanced console output
    let consoleOutput = `\rHeap: ${data.heapUsed}MB / ${data.heapTotal}MB (${data.heapPercent}%)`;
    if (this.includeCpu && data.cpuPercent !== undefined) {
      consoleOutput += ` | CPU: ${data.cpuPercent}%`;
    }
    consoleOutput += ` | RSS: ${data.rss}MB`;
    
    process.stdout.write(consoleOutput);
  }

  stop() {
    if (!this.monitoring) return;
    
    console.log('\n\nStopping resource monitoring...');
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

// Simulate CPU activity for demonstration
function simulateCpuActivity() {
  setInterval(() => {
    // Create some CPU load with variable intensity
    const startTime = Date.now();
    const duration = Math.random() * 20 + 10; // 10-30ms of work
    
    while (Date.now() - startTime < duration) {
      // CPU intensive task
      Math.sqrt(Math.random() * 1000000);
    }
  }, 100 + Math.random() * 100); // Random intervals between 100-200ms
}

// Main execution
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    logFile: 'resource.log',
    interval: 100,
    includeCpu: true // Default to true
  };
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--log-file' && i + 1 < args.length) {
      options.logFile = args[++i];
    } else if (arg === '--interval' && i + 1 < args.length) {
      options.interval = parseInt(args[++i]);
    } else if (arg === '--no-cpu') {
      options.includeCpu = false;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Resource Monitor - Monitor memory and CPU usage

Usage: node heap-monitor.js [options]

Options:
  --log-file <file>     Log file name (default: resource.log)
  --interval <ms>       Monitoring interval in ms (default: 100)
  --no-cpu             Disable CPU monitoring (memory only)
  --simulate           Simulate memory activity for demo
  --simulate-cpu       Simulate CPU activity for demo
  --help, -h           Show this help

Examples:
  node heap-monitor.js --log-file app.log --interval 200
  node heap-monitor.js --no-cpu --simulate
  node heap-monitor.js --simulate --simulate-cpu
`);
      process.exit(0);
    } else if (!arg.startsWith('--')) {
      // First non-flag argument is log file (backward compatibility)
      options.logFile = arg;
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        options.interval = parseInt(args[++i]) || 100;
      }
    }
  }
  
  const monitor = new HeapMonitor(options);
  
  // Start monitoring
  monitor.start();
  
  // Optional: simulate activities for demo purposes
  if (process.argv.includes('--simulate')) {
    console.log('🎭 Starting memory simulation...');
    simulateMemoryActivity();
  }
  
  if (process.argv.includes('--simulate-cpu')) {
    console.log('🎭 Starting CPU simulation...');
    simulateCpuActivity();
  }
}

module.exports = HeapMonitor;