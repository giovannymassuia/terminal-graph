#!/usr/bin/env node

/**
 * Example Node.js App with Memory Patterns
 * 
 * This app demonstrates different memory usage patterns that will create
 * interesting graphs when monitored with terminal-graph.
 */

const fs = require('fs');
const http = require('http');

// Initialize memory monitoring
const { HeapMonitor } = require('./index');

class ExampleApp {
  constructor() {
    this.server = null;
    this.monitor = null;
    this.dataStore = new Map();
    this.cacheArrays = [];
    this.longLivedObjects = [];
    this.tempBuffers = [];
    this.phase = 'startup';
    this.iteration = 0;
  }

  startMonitoring() {
    console.log('📊 Starting memory monitoring...');
    this.monitor = new HeapMonitor({
      logFile: 'example-app-memory.log',
      interval: 250 // Monitor every 250ms for detailed graphs
    });
    this.monitor.start();
  }

  startServer() {
    this.server = http.createServer((req, res) => {
      // Each request creates some memory activity
      this.handleRequest(req, res);
    });

    this.server.listen(3000, () => {
      console.log('🚀 Example server running on http://localhost:3000');
      console.log('📈 Memory patterns will create interesting graphs!');
      console.log('\nTo monitor with terminal-graph:');
      console.log('  terminal-graph view --file example-app-memory.log --metric heapUsed --style lean --accumulate');
      console.log('\nTry these endpoints to trigger memory patterns:');
      console.log('  - GET /  - Basic response');
      console.log('  - GET /heavy - Heavy processing');
      console.log('  - GET /cache - Cache buildup');
      console.log('  - GET /leak - Simulated memory leak');
      console.log('  - GET /gc - Trigger garbage collection');
      console.log('  - GET /stress - Memory stress test');
    });
  }

  handleRequest(req, res) {
    const url = req.url;
    const startTime = Date.now();

    try {
      switch(url) {
        case '/':
          this.handleBasic(res);
          break;
        case '/heavy':
          this.handleHeavyProcessing(res);
          break;
        case '/cache':
          this.handleCacheBuildup(res);
          break;
        case '/leak':
          this.handleMemoryLeak(res);
          break;
        case '/gc':
          this.handleGarbageCollection(res);
          break;
        case '/stress':
          this.handleStressTest(res);
          break;
        default:
          res.writeHead(404);
          res.end('Not found');
      }
    } catch (error) {
      res.writeHead(500);
      res.end(`Error: ${error.message}`);
    }

    const duration = Date.now() - startTime;
    console.log(`${new Date().toISOString()} ${req.method} ${url} - ${duration}ms - Heap: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
  }

  handleBasic(res) {
    // Minimal memory usage
    const data = { message: 'Hello World', timestamp: new Date().toISOString() };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  handleHeavyProcessing(res) {
    // Create temporary large data structures
    const largeArray = new Array(100000).fill(0).map((_, i) => ({
      id: i,
      data: `Heavy processing item ${i}`,
      timestamp: Date.now(),
      nested: {
        value: Math.random(),
        processed: true
      }
    }));

    // Simulate processing
    const result = largeArray
      .filter(item => item.nested.value > 0.5)
      .map(item => ({ 
        id: item.id, 
        processed: item.nested.processed,
        result: item.nested.value * 100
      }))
      .slice(0, 1000); // Keep only top 1000

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Heavy processing completed',
      processed: largeArray.length,
      results: result.length
    }));

    // Arrays will be garbage collected after this function
  }

  handleCacheBuildup(res) {
    // Simulate cache that grows over time
    const cacheKey = `cache_${Date.now()}`;
    const cacheData = new Array(10000).fill(0).map((_, i) => ({
      key: `item_${i}`,
      value: `Cached data item ${i}`.repeat(10), // Make strings longer
      created: Date.now()
    }));

    this.dataStore.set(cacheKey, cacheData);

    // Clean old cache entries occasionally (but keep some for growth)
    if (this.dataStore.size > 50) {
      const keys = Array.from(this.dataStore.keys());
      const keysToDelete = keys.slice(0, keys.length - 45); // Keep 45, delete rest
      keysToDelete.forEach(key => this.dataStore.delete(key));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Data cached',
      cacheSize: this.dataStore.size,
      totalItems: this.dataStore.size * 10000
    }));
  }

  handleMemoryLeak(res) {
    // Simulate memory leak by keeping references
    const leakyData = new Array(50000).fill(0).map((_, i) => ({
      id: i,
      data: `Leaked object ${i}`,
      bigString: 'x'.repeat(1000),
      circular: null
    }));

    // Create circular references (harder to GC)
    leakyData.forEach((item, index) => {
      item.circular = leakyData[(index + 1) % leakyData.length];
    });

    // Keep references so they can't be garbage collected easily
    this.longLivedObjects.push(leakyData);

    // Occasionally clean some old leaks
    if (this.longLivedObjects.length > 10) {
      this.longLivedObjects.splice(0, 5);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Memory leak simulated',
      leakedObjects: this.longLivedObjects.length,
      totalLeakedItems: this.longLivedObjects.reduce((sum, arr) => sum + arr.length, 0)
    }));
  }

  handleGarbageCollection(res) {
    // Force garbage collection if available
    if (global.gc) {
      const beforeGC = process.memoryUsage();
      global.gc();
      const afterGC = process.memoryUsage();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'Garbage collection triggered',
        before: {
          heapUsed: (beforeGC.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
          heapTotal: (beforeGC.heapTotal / 1024 / 1024).toFixed(2) + 'MB'
        },
        after: {
          heapUsed: (afterGC.heapUsed / 1024 / 1024).toFixed(2) + 'MB',
          heapTotal: (afterGC.heapTotal / 1024 / 1024).toFixed(2) + 'MB'
        },
        freed: ((beforeGC.heapUsed - afterGC.heapUsed) / 1024 / 1024).toFixed(2) + 'MB'
      }));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'GC not available. Start with --expose-gc flag',
        tip: 'node --expose-gc example-app.js'
      }));
    }
  }

  handleStressTest(res) {
    // Create multiple types of memory pressure
    const buffers = [];
    const objects = [];
    
    // Create buffers of random sizes
    for (let i = 0; i < 100; i++) {
      buffers.push(Buffer.alloc(Math.random() * 100000));
    }
    
    // Create objects with varying complexity
    for (let i = 0; i < 10000; i++) {
      objects.push({
        id: i,
        data: new Array(Math.floor(Math.random() * 100) + 10).fill(0).map(j => ({
          value: Math.random(),
          text: `Stress test object ${i}_${j}`.repeat(Math.floor(Math.random() * 5) + 1)
        }))
      });
    }

    // Keep temporary references
    this.tempBuffers.push(buffers, objects);

    // Clean up old temp data
    if (this.tempBuffers.length > 20) {
      this.tempBuffers.splice(0, 10);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Stress test completed',
      buffersCreated: buffers.length,
      objectsCreated: objects.length,
      tempReferences: this.tempBuffers.length
    }));
  }

  startBackgroundActivity() {
    // Background activity that creates periodic memory patterns
    setInterval(() => {
      this.iteration++;
      
      // Change phases every 100 iterations (25 seconds at 250ms intervals)
      if (this.iteration % 100 === 0) {
        const phases = ['startup', 'growth', 'stable', 'cleanup', 'peak'];
        this.phase = phases[Math.floor(this.iteration / 100) % phases.length];
        console.log(`📈 Phase change: ${this.phase} (iteration ${this.iteration})`);
      }

      // Different memory patterns based on phase
      switch (this.phase) {
        case 'startup':
          this.simulateStartup();
          break;
        case 'growth':
          this.simulateGrowth();
          break;
        case 'stable':
          this.simulateStable();
          break;
        case 'cleanup':
          this.simulateCleanup();
          break;
        case 'peak':
          this.simulatePeak();
          break;
      }
    }, 2000); // Every 2 seconds
  }

  simulateStartup() {
    // Gradual memory increase during startup
    const smallArray = new Array(1000).fill(0).map(i => ({ startup: i }));
    this.cacheArrays.push(smallArray);
    if (this.cacheArrays.length > 5) this.cacheArrays.shift();
  }

  simulateGrowth() {
    // Faster memory growth
    const mediumArray = new Array(5000).fill(0).map(i => ({ growth: i, data: 'x'.repeat(100) }));
    this.cacheArrays.push(mediumArray);
    if (this.cacheArrays.length > 15) this.cacheArrays.shift();
  }

  simulateStable() {
    // Stable memory with occasional spikes
    if (this.iteration % 5 === 0) {
      const spikeArray = new Array(2000).fill(0).map(i => ({ spike: i }));
      this.cacheArrays.push(spikeArray);
    }
    if (this.cacheArrays.length > 10) this.cacheArrays.shift();
  }

  simulateCleanup() {
    // Cleanup phase - memory should decrease
    this.cacheArrays = this.cacheArrays.slice(-3);
    this.longLivedObjects = this.longLivedObjects.slice(-2);
  }

  simulatePeak() {
    // Peak usage with large allocations
    const largeArray = new Array(10000).fill(0).map(i => ({ 
      peak: i, 
      data: 'large'.repeat(50),
      buffer: Buffer.alloc(1000)
    }));
    this.cacheArrays.push(largeArray);
    if (this.cacheArrays.length > 25) this.cacheArrays.shift();
  }

  start() {
    console.log('🎯 Starting Example Node.js App with Memory Monitoring');
    console.log('This app will create interesting memory patterns for graphing.\n');
    
    this.startMonitoring();
    this.startServer();
    this.startBackgroundActivity();

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down gracefully...');
      if (this.monitor) this.monitor.stop();
      if (this.server) this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, shutting down...');
      if (this.monitor) this.monitor.stop();
      if (this.server) this.server.close();
      process.exit(0);
    });
  }
}

// Start the app
if (require.main === module) {
  const app = new ExampleApp();
  app.start();
}

module.exports = ExampleApp;