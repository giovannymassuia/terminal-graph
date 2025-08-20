/**
 * Memory Monitoring Setup for Node.js Apps
 * 
 * Add this to your Node.js application to enable memory monitoring
 * that works with terminal-graph.
 */

const fs = require('fs');

class MemoryMonitor {
  constructor(options = {}) {
    this.logFile = options.logFile || 'app-memory.log';
    this.interval = options.interval || 1000; // 1 second default
    this.includeGC = options.includeGC || false;
    this.includeCustomMetrics = options.includeCustomMetrics || false;
    this.customMetrics = new Map();
    this.intervalId = null;
    this.stream = null;
    this.startTime = Date.now();
  }

  /**
   * Start monitoring memory usage
   */
  start() {
    console.log(`📊 Memory monitoring started: ${this.logFile}`);
    
    this.stream = fs.createWriteStream(this.logFile, { flags: 'a' });
    
    this.intervalId = setInterval(() => {
      this.captureMemoryData();
    }, this.interval);

    // Monitor GC events if requested
    if (this.includeGC) {
      this.setupGCMonitoring();
    }

    // Handle process exit
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
    process.on('exit', () => this.stop());
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.stream) {
      this.stream.end();
      this.stream = null;
    }
    
    console.log('\n📊 Memory monitoring stopped');
  }

  /**
   * Add custom metric to track
   */
  addCustomMetric(name, getValue) {
    this.customMetrics.set(name, getValue);
  }

  /**
   * Capture and log memory data
   */
  captureMemoryData() {
    const memUsage = process.memoryUsage();
    const uptime = Date.now() - this.startTime;
    
    const data = {
      timestamp: Date.now(),
      uptime: uptime,
      // Core memory metrics (compatible with terminal-graph)
      heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
      external: (memUsage.external / 1024 / 1024).toFixed(2),
      rss: (memUsage.rss / 1024 / 1024).toFixed(2),
      heapPercent: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2),
      // Additional useful metrics
      arrayBuffers: (memUsage.arrayBuffers / 1024 / 1024).toFixed(2)
    };

    // Add custom metrics if enabled
    if (this.includeCustomMetrics) {
      for (const [name, getValue] of this.customMetrics) {
        try {
          data[name] = getValue();
        } catch (error) {
          console.error(`Error collecting custom metric ${name}:`, error);
        }
      }
    }

    // Write to log file
    this.stream.write(JSON.stringify(data) + '\n');
  }

  /**
   * Setup garbage collection monitoring (requires --expose-gc)
   */
  setupGCMonitoring() {
    if (global.gc) {
      const originalGC = global.gc;
      global.gc = (...args) => {
        const beforeGC = process.memoryUsage();
        const result = originalGC.apply(global, args);
        const afterGC = process.memoryUsage();
        
        // Log GC event
        const gcData = {
          timestamp: Date.now(),
          event: 'gc',
          freedMemory: (beforeGC.heapUsed - afterGC.heapUsed) / 1024 / 1024,
          heapBefore: (beforeGC.heapUsed / 1024 / 1024).toFixed(2),
          heapAfter: (afterGC.heapUsed / 1024 / 1024).toFixed(2)
        };
        
        this.stream.write(JSON.stringify(gcData) + '\n');
        return result;
      };
    }
  }

  /**
   * Static method to quickly add monitoring to any app
   */
  static quickSetup(logFile = 'app-memory.log', interval = 1000) {
    const monitor = new MemoryMonitor({ logFile, interval });
    monitor.start();
    return monitor;
  }
}

module.exports = MemoryMonitor;

// Auto-start monitoring if this file is run directly or env var is set
if (require.main === module || process.env.AUTO_MEMORY_MONITOR) {
  const logFile = process.env.MEMORY_LOG_FILE || 'auto-memory.log';
  const interval = parseInt(process.env.MEMORY_LOG_INTERVAL) || 1000;
  
  console.log(`🚀 Auto-starting memory monitoring...`);
  console.log(`   Log file: ${logFile}`);
  console.log(`   Interval: ${interval}ms`);
  console.log('\nTo view graph run:');
  console.log(`   terminal-graph view --file ${logFile} --accumulate --style lean\n`);
  
  MemoryMonitor.quickSetup(logFile, interval);
}