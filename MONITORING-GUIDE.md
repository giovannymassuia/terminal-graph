# 📊 Node.js App Memory Monitoring Guide

This guide shows you how to monitor your Node.js application's memory usage in real-time with beautiful terminal graphs.

## 🚀 Quick Demo

**1. Run the complete example:**
```bash
./monitor-example.sh
```

This starts both an example Node.js app and the monitoring graph. Try making requests to see memory spikes!

**2. Trigger memory patterns:**
```bash
# In another terminal, try these:
curl http://localhost:3000/heavy    # Heavy processing spike
curl http://localhost:3000/cache    # Cache buildup pattern
curl http://localhost:3000/leak     # Memory leak simulation
curl http://localhost:3000/stress   # Stress test pattern
```

**3. Interactive Controls:**
While monitoring, use these keyboard shortcuts:
- **R** - Reload data from file (restart from beginning)
- **C** - Clear screen and reload
- **L** - Loop through graph styles (blocks → lean → ascii → dots → braille)
- **Q** - Quit the viewer
- **Ctrl+C** - Exit

## 🛠️ Setting Up Your Own App

### Method 1: tgraph-monitor Command (Easiest!)

Simply wrap any Node.js command with `tgraph-monitor`:

```bash
# Monitor any Node.js command
tgraph-monitor node app.js
tgraph-monitor npm run dev
tgraph-monitor pnpm dev
tgraph-monitor yarn start
tgraph-monitor npm test

# View in another terminal
terminal-graph view --file memory-monitor.log --accumulate --style lean
```

**Environment Variables:**
```bash
export TGRAPH_LOG_FILE=my-app-memory.log
export TGRAPH_INTERVAL=1000
export TGRAPH_METRIC=heapUsed

tgraph-monitor pnpm dev  # Uses your settings
```

### Method 2: Quick Integration

Add this to your existing Node.js app:

```javascript
// At the top of your main app file
const MemoryMonitor = require('./monitoring-setup');

// Start monitoring (creates app-memory.log)
const monitor = MemoryMonitor.quickSetup('my-app-memory.log', 500);

// Your existing app code...
const express = require('express');
const app = express();

// Your routes and logic...

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('View memory graph with:');
  console.log('  terminal-graph view --file my-app-memory.log --accumulate --style lean');
});
```

### Method 3: Environment Variable Setup

**1. Set environment variables:**
```bash
export AUTO_MEMORY_MONITOR=true
export MEMORY_LOG_FILE=my-app.log
export MEMORY_LOG_INTERVAL=1000
```

**2. Require the monitoring module:**
```javascript
// Add this line anywhere in your app
require('./monitoring-setup');

// Rest of your app...
```

**3. Start your app normally:**
```bash
node your-app.js
```

**4. View the graph:**
```bash
terminal-graph view --file my-app.log --accumulate --style lean
```

### Method 4: Manual Setup

```javascript
const MemoryMonitor = require('./monitoring-setup');

class MyApp {
  constructor() {
    // Create monitor with custom options
    this.monitor = new MemoryMonitor({
      logFile: 'my-custom-app.log',
      interval: 250,                 // Monitor every 250ms
      includeCustomMetrics: true     // Enable custom metrics
    });
    
    // Add custom metrics to track
    this.monitor.addCustomMetric('activeConnections', () => {
      return this.server.connections || 0;
    });
    
    this.monitor.addCustomMetric('cacheSize', () => {
      return this.cache.size;
    });
  }
  
  start() {
    // Start memory monitoring
    this.monitor.start();
    
    // Start your app
    this.startServer();
  }
}
```

## 📈 Monitoring Strategies

### Basic Monitoring (Recommended)
```bash
# Simple setup for most apps
terminal-graph view --file app-memory.log --accumulate --style lean
```

### Development Monitoring
```bash
# High refresh rate for development
terminal-graph view --file app-memory.log --accumulate --style blocks --refresh 200
```

### Production Monitoring
```bash
# Lower refresh rate for production
terminal-graph view --file app-memory.log --accumulate --refresh 2000 --points 500
```

### CI/CD Integration
```bash
# Generate memory report
node your-app.js &
APP_PID=$!
sleep 60  # Run for 1 minute
kill $APP_PID

# View final accumulated graph
terminal-graph view --file app-memory.log --accumulate --refresh 0
```

## 📊 Understanding the Graph

### Metrics Available

| Metric | Y-Axis Shows | Best For | Example Values |
|--------|--------------|----------|---------------|
| **heapUsed** | MB (actual memory) | Memory leak detection | 0-500MB |
| **heapPercent** | Percentage (0-100%) | Heap utilization | 0-100% |
| **heapTotal** | MB (allocated heap) | V8 heap growth | 0-1000MB |
| **rss** | MB (total process memory) | System memory usage | 0-2000MB |
| **external** | MB (C++ objects) | Native memory usage | 0-100MB |

**Recommended for most monitoring: `--metric heapUsed`** (shows actual MB usage)

### Interactive Features

During monitoring, you can:
- **Press R** to reload all data from the beginning of the log file
- **Press C** to clear the screen and reload
- **Press L** to cycle through graph styles (blocks → lean → ascii → dots → braille)
- **Press Q** to quit cleanly
- Use these to customize your view without restarting the monitoring process!

### Memory Patterns to Watch For

**✅ Healthy Patterns:**
- Gradual growth during startup
- Periodic drops (garbage collection)
- Stable usage during idle periods

**⚠️ Warning Patterns:**
- Continuous growth without drops
- Large spikes that don't recover
- Sawtooth pattern (frequent GC)

**🚨 Problem Patterns:**
- Steady upward trend (memory leak)
- Sudden massive spikes
- Out-of-memory crashes

## 🎯 Graph Styles for Different Use Cases

### `--style lean`
Best for: Long-term monitoring, production dashboards
```
   65.0 │                     :         :                                      
   60.0 │                    ::        : :                                     
   55.0 │                 :  ::        : :  ::                               
   50.0 │              ::  :    ::    :   :: : :  : :                        
```

### `--style blocks`
Best for: Development, detailed analysis
```
   65.0 │                     █         █                                      
   60.0 │                    ██        █ █                                     
   55.0 │                 █  ██        █ █  ██                               
   50.0 │              ██  █    ██    █   ██ █ █  █ █                        
```

### `--style ascii`
Best for: Traditional terminals, compatibility
```
   65.0 │                     ●         ●                                      
   60.0 │                    ●●        ● ●                                     
   55.0 │                 ●  ●●        ● ●  ●●                               
   50.0 │              ●●  ●    ●●    ●   ●● ● ●  ● ●                        
```

## 🔧 Advanced Configuration

### Custom Metrics Example
```javascript
const monitor = new MemoryMonitor({
  logFile: 'detailed-app.log',
  interval: 500,
  includeCustomMetrics: true
});

// Track database connections
monitor.addCustomMetric('dbConnections', () => {
  return database.pool.totalCount;
});

// Track active HTTP requests
monitor.addCustomMetric('activeRequests', () => {
  return requestCounter.active;
});

// Track cache hit rate
monitor.addCustomMetric('cacheHitRate', () => {
  return (cache.hits / (cache.hits + cache.misses) * 100).toFixed(2);
});
```

### GC Monitoring (Advanced)
```bash
# Start with GC exposure for detailed analysis
node --expose-gc your-app.js

# Monitor GC events in the graph
terminal-graph view --file app-memory.log --accumulate --style lean
```

## 📱 Mobile-Friendly Monitoring

For smaller terminals or mobile SSH:

```bash
# Compact view
terminal-graph view --file app.log --accumulate --style lean --points 50

# Ultra-compact
terminal-graph view --file app.log --style ascii --points 30 --refresh 1000
```

## 🚀 Production Tips

1. **Log Rotation**: Implement log rotation for long-running apps
2. **Alerts**: Set up alerts based on memory thresholds
3. **Dashboards**: Use accumulation mode for historical analysis
4. **Performance**: Use longer intervals (1000ms+) in production
5. **Storage**: Monitor log file size, implement cleanup

## 🎯 Troubleshooting Common Issues

### "No data points" Error
```bash
# Check if log file exists and has data
ls -la *.log
tail app-memory.log

# Make sure app is writing to the correct file
```

### Graph Not Updating
```bash
# Check if monitoring is running
ps aux | grep node

# Verify log file is being written
tail -f app-memory.log
```

### High Memory Usage
```bash
# Use GC monitoring to see collection patterns
node --expose-gc --max-old-space-size=4096 your-app.js

# Monitor with faster refresh for debugging
terminal-graph view --file app.log --refresh 100 --style blocks
```

Start with the **Quick Demo** above to see everything in action! 🎉