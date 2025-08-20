# Terminal Graph 📊

Real-time ASCII line graphs for your terminal. Monitor memory usage, visualize data streams, and create beautiful terminal dashboards.

## Features

- **Real-time Monitoring**: Continuously monitors Node.js heap memory usage
- **ASCII Line Graphs**: Beautiful terminal-based visualization with multiple styles
- **Log File Based**: Writes metrics to files for persistence and analysis
- **Multiple Metrics**: Monitor heap used, heap total, RSS, external memory, or heap percentage
- **Data Accumulation**: Intelligent compression preserves peaks while fitting terminal width
- **Multiple Graph Styles**: blocks, lean, ascii, dots, braille - choose your preference
- **Easy Integration**: Drop-in monitoring for any Node.js application

## Installation & Setup

### Clone and Install Locally (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/giovannymassuia/terminal-graph.git
cd terminal-graph

# Install dependencies
npm install

# Link globally for CLI usage
npm link

# Now you can use terminal-graph anywhere
terminal-graph --help
```

### Alternative: Install from GitHub

```bash
# Install directly from GitHub (when published)
npm install -g git+https://github.com/giovannymassuia/terminal-graph.git
```

### Development Setup

```bash
# Clone and setup
git clone https://github.com/giovannymassuia/terminal-graph.git
cd terminal-graph
npm install

# Run examples and tests
npm run demo                                    # Run built-in demo
node examples/example-app.js                    # Run example app
./examples/monitor-example.sh                   # Complete monitoring demo
```

## Project Structure

```
terminal-graph/
├── src/                          # Core implementation
│   ├── cli.js                   # Main CLI entry point
│   ├── heap-monitor.js          # Memory monitoring class
│   ├── graph-viewer.js          # Real-time graph viewer
│   ├── graph-renderer.js        # ASCII rendering engine
│   ├── monitoring-setup.js      # Drop-in monitoring helper
│   └── index.js                 # Main exports
├── examples/                     # Example implementations
│   ├── example-app.js           # Complete example Node.js app
│   ├── monitor-example.sh       # Demo script
│   ├── compare-metrics.js       # Metrics comparison tool
│   └── *.js                    # Various demos and tests
├── MONITORING-GUIDE.md          # Comprehensive monitoring guide
└── README.md                    # This file
```

## Quick Start

```bash
# Run the complete demo (recommended first experience)
./examples/monitor-example.sh

# Or run individual commands:
terminal-graph demo              # Built-in demo
terminal-graph monitor          # Monitor current process
terminal-graph view --style lean --accumulate  # View with lean style
```

## CLI Usage

### Commands

#### `terminal-graph monitor [options]`
Start monitoring heap memory usage.

```bash
terminal-graph monitor                  # Default: heap.log, 100ms interval
terminal-graph monitor app.log 200      # Custom file and interval
terminal-graph monitor --simulate       # With simulated memory patterns
```

#### `terminal-graph view [options]`
View real-time graph from log file.

```bash
terminal-graph view                     # Default settings
terminal-graph view --style lean        # Minimal colon style
terminal-graph view --accumulate        # Keep all historical data
terminal-graph view -s blocks -a        # Filled blocks with accumulation
```

#### `terminal-graph demo`
Run an interactive demo with simulated data.

```bash
terminal-graph demo
```

### Options Reference

#### Monitor Options
- `file` - Log file path (default: heap.log)
- `interval` - Sampling interval in ms (default: 100)
- `--simulate` - Add simulated memory activity

#### View Options
- `--file, -f` - Log file to monitor (default: heap.log)
- `--metric, -m` - Metric to display: **heapUsed** (recommended), heapTotal, heapPercent, rss, external
- `--style, -s` - Graph style: blocks, lean, ascii, dots, braille
- `--accumulate, -a` - Accumulate all data instead of rolling window
- `--points, -p` - Maximum data points for rolling window (default: 100)
- `--refresh, -r` - Refresh rate in milliseconds (default: 100)

### Graph Styles

- **blocks** - Filled area chart with █ and ░ (default)
- **lean** - Minimal style using : characters (great for long-term monitoring)
- **ascii** - Traditional ASCII with /, \, ─, │
- **dots** - Braille characters for high resolution
- **braille** - Unicode braille patterns

## Monitoring Your Node.js Application

### Method 1: Quick Integration (Easiest)

```javascript
// At the top of your main app file
const MemoryMonitor = require('terminal-graph/src/monitoring-setup');

// Start monitoring (creates app-memory.log)
const monitor = MemoryMonitor.quickSetup('my-app-memory.log', 500);

// Your existing app code...
const express = require('express');
const app = express();

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('View memory graph with:');
  console.log('  terminal-graph view --file my-app-memory.log --accumulate --style lean');
});
```

### Method 2: Environment Variable Setup

```bash
# Set environment variables
export AUTO_MEMORY_MONITOR=true
export MEMORY_LOG_FILE=my-app.log
export MEMORY_LOG_INTERVAL=1000

# Option A: Require in your app code
# Add this line anywhere in your app
require('terminal-graph/src/monitoring-setup');

# Option B: Preload when starting your app
node -r terminal-graph/src/monitoring-setup your-app.js

# View the graph
terminal-graph view --file my-app.log --accumulate --style lean
```

### Method 3: Manual Integration

```javascript
const { HeapMonitor } = require('terminal-graph');

const monitor = new HeapMonitor({
  logFile: 'app-heap.log',
  interval: 500  // 500ms interval
});

monitor.start();

// Your application code here...
```

## Understanding Metrics

| Metric | Y-Axis Shows | Best For | Example Values |
|--------|--------------|----------|----------------|
| **heapUsed** | MB (actual memory) | **Memory leak detection** | 0-500MB |
| **heapPercent** | Percentage (0-100%) | Heap utilization | 0-100% |
| **heapTotal** | MB (allocated heap) | V8 heap growth | 0-1000MB |
| **rss** | MB (total process memory) | System memory usage | 0-2000MB |
| **external** | MB (C++ objects) | Native memory usage | 0-100MB |

**Recommended for most monitoring: `--metric heapUsed`** (shows actual MB usage)

## Example Output

```
                    Node.js Heap Monitor - Heap Used (MB)
════════════════════════════════════════════════════════════════════════════════
   180.0 │                                              :::                          
   160.0 │                                          ::   : ::                      
   140.0 │                                      ::      :   ::                  
   120.0 │                                  :::           :   ::              
   100.0 │                              :::                 :   ::          
    80.0 │                          :::                       :   ::      
    60.0 │                      :::                             :   ::  
    40.0 │                  :::                                   :     
    20.0 │              :::                                         :         
     0.0 │          :::                                                             
        └────────────────────────────────────────────────────────────────────────
        12:34:20                                                        12:34:50

Current: 168.45 MB | Average: 82.31 MB | Min: 15.20 MB | Max: 180.00 MB
Data points: 450 (compressed from 1200) | Refresh: 500ms | example-app-memory.log
```

## Advanced Usage

### Memory Pattern Detection

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

### Production Monitoring

```bash
# Long-term monitoring with log rotation
terminal-graph view --file app-memory.log --accumulate --refresh 2000 --points 500

# Mobile-friendly compact view
terminal-graph view --file app.log --style lean --points 50 --refresh 1000
```

## Log File Format

The log file contains JSON lines with memory metrics:

```json
{"timestamp":1234567890,"heapUsed":"12.34","heapTotal":"56.78","external":"1.23","rss":"90.12","heapPercent":"21.74"}
```

## Features Explained

- **Real-time Updates**: Uses the `tail` package to follow log files as they're written
- **Responsive Design**: Adapts to terminal size changes
- **Peak Preservation**: Intelligent compression keeps important memory spikes visible
- **Statistics**: Shows current, average, minimum, and maximum values
- **Multiple Metrics**: Choose what memory aspect to visualize
- **Performance**: Efficient rendering with configurable refresh rates

## Contributing

This is a personal project for battle-testing before potential npm publication. Feel free to:

- Report issues or bugs
- Suggest improvements
- Submit pull requests
- Share your use cases

## License

MIT

---

**Getting Started**: Run `./examples/monitor-example.sh` for the complete experience! 🚀