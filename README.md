# Terminal Graph 📊

Real-time ASCII line graphs for your terminal. Monitor memory usage, visualize data streams, and create beautiful terminal dashboards.

## Features

- **Real-time Monitoring**: Continuously monitors Node.js heap memory usage
- **Dual View Modes**: Terminal ASCII graphs or modern web browser interface
- **Multi-Metric Views**: Single metric focus, multi-chart grid, or metric comparison overlays
- **ASCII Line Graphs**: Beautiful terminal-based visualization with multiple styles
- **Web Dashboard**: Interactive browser-based graphs with real-time updates and multiple view modes
- **Interactive Controls**: Reload data with 'R', clear with 'C', cycle styles with 'L', quit with 'Q' during monitoring
- **Log File Based**: Writes metrics to files for persistence and analysis
- **Multiple Metrics**: Monitor memory (heap used, heap total, RSS, external) and CPU (usage %, user, system, total)
- **Data Accumulation**: Intelligent compression preserves peaks while fitting terminal width
- **Multiple Graph Styles**: Terminal (blocks, lean, ascii, dots, braille) or Web (line, area, bars)
- **Easy Integration**: Drop-in monitoring for any Node.js application

## Installation & Setup

### Install from npm (Recommended)

```bash
# Install globally
npm install -g terminal-graph

# Or use directly with npx (no installation needed)
npx terminal-graph demo
npx terminal-graph --help
```

### Development Setup

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
# Install directly from GitHub
npm install -g git+https://github.com/giovannymassuia/terminal-graph.git
```

### Development Workflow

```bash
# Run examples and tests
npm run demo                                    # Run built-in demo
node examples/example-app.js                    # Run example app
./examples/monitor-example.sh                   # Complete monitoring demo

# Use conventional commits (for contributors)
npm run commit                                  # Guided commit with proper formatting
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
terminal-graph view --style lean --accumulate  # Terminal view with lean style
terminal-graph web --style area --accumulate   # Web browser view (multi-metric capable)
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
View real-time graph in terminal.

```bash
terminal-graph view                     # Default settings
terminal-graph view --style lean        # Minimal colon style
terminal-graph view --accumulate        # Keep all historical data
terminal-graph view -s blocks -a        # Filled blocks with accumulation
```

#### `terminal-graph web [options]`
View real-time graph in web browser with multiple view modes.

```bash
terminal-graph web                      # Default settings (opens browser)
terminal-graph web --style area         # Area chart style
terminal-graph web --port 8080          # Custom port
terminal-graph web --no-open            # Don't auto-open browser
```

**Web View Modes:**
- **Single**: Traditional single-metric graph (like terminal view)
- **Multi**: Grid of separate charts for all metrics simultaneously
- **Compare**: Overlay multiple metrics on one chart for comparison

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

#### Terminal View Options
- `--file, -f` - Log file to monitor (default: heap.log)
- `--metric, -m` - Metric to display:
  - **Memory**: heapUsed (default), heapTotal, heapPercent, rss, external
  - **CPU**: cpuPercent, cpuUser, cpuSystem, cpuTotal
- `--style, -s` - Graph style: blocks, lean, ascii, dots, braille
- `--accumulate, -a` - Accumulate all data instead of rolling window
- `--points, -p` - Maximum data points for rolling window (default: 100)
- `--refresh, -r` - Refresh rate in milliseconds (default: 100)

#### Web View Options
- `--file, -f` - Log file to monitor (default: heap.log)
- `--metric, -m` - Initial metric to display:
  - **Memory**: heapUsed (default), heapTotal, heapPercent, rss, external
  - **CPU**: cpuPercent, cpuUser, cpuSystem, cpuTotal
- `--style, -s` - Graph style: line, area, bars
- `--accumulate, -a` - Accumulate all data instead of rolling window
- `--points, -p` - Maximum data points for rolling window (default: 100)
- `--port` - Server port (default: 3456)
- `--no-open` - Don't automatically open browser

#### Interactive Controls

**Terminal View:**
- `R` - Reload data from file (restart from beginning)
- `C` - Clear screen and reload
- `L` - Loop through graph styles (blocks → lean → ascii → dots → braille)
- `M` - Toggle between Memory and CPU metrics
- `Q` - Quit the viewer
- `Ctrl+C` - Exit

**Web View:**
- `Space` - Pause/Resume updates
- `C` - Clear data
- `L` - Cycle through styles (line → area → bars)
- `M` - In Single view: Toggle between Memory/CPU metrics; In other views: Cycle view modes
- `1-9` - Toggle metrics in Compare mode (1-5 for Memory, 6-9 for CPU metrics)
- `R` - Reload page

### Graph Styles

**Terminal Styles:**
- **blocks** - Filled area chart with █ and ░ (default)
- **lean** - Minimal style using : characters (great for long-term monitoring)
- **ascii** - Traditional ASCII with /, \, ─, │
- **dots** - Braille characters for high resolution
- **braille** - Unicode braille patterns

**Web Styles:**
- **line** - Classic line chart with data points
- **area** - Filled area chart with gradient
- **bars** - Bar chart visualization

## Web View Features

The web interface provides three distinct view modes for analyzing memory data:

### 📊 Single View Mode
Traditional single-metric focus with detailed statistics:
- Visual toggle buttons to switch between Memory and CPU metrics
- Large main graph showing selected metric (heapUsed by default)
- Live statistics cards showing current, average, min, max values with appropriate units (MB, %, ms)
- Interactive controls for pause/resume, clear, and style switching

### 📈 Multi View Mode  
Grid layout showing all metrics simultaneously:

**Memory Metrics:**
- **Heap Used**: Actual memory usage in MB - best for leak detection
- **Heap Total**: Allocated heap size in MB - shows V8 memory allocation
- **Heap Percent**: Usage percentage (0-100%) - normalized view across apps
- **RSS**: Total process memory in MB - system memory impact
- **External**: C++ objects memory in MB - native module usage

**CPU Metrics:**
- **CPU Usage %**: Overall CPU utilization percentage
- **CPU User Time**: Time spent in user mode (ms)
- **CPU System Time**: Time spent in system/kernel mode (ms)
- **CPU Total Time**: Combined user + system time (ms)

Each chart updates independently and can be viewed in line, area, or bar style.

### 🔀 Compare View Mode
Overlay multiple metrics on one chart for direct comparison:
- Select which metrics to display using checkboxes or number keys (1-9)
- Each metric has a unique color for easy identification
- Legend shows active metrics with color coding
- Perfect for correlation analysis (e.g., heap usage vs. RSS)

### Keyboard Navigation
- `M` - In Single view: Toggle between Memory/CPU metrics; In other views: Cycle modes
- `1-9` - In Compare mode: toggle individual metrics (1-5 for Memory, 6-9 for CPU)
- `L` - Cycle graph styles across all active charts
- `Space` - Pause/resume real-time updates
- `C` - Clear all data and reset charts
- `R` - Reload the page

## Monitoring Your Node.js Application

### Method 1: tgraph-monitor Command (Easiest!)

Simply wrap any command with `tgraph-monitor`:

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

### Method 3: Environment Variable Setup

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

### Method 4: Manual Integration

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

### Memory Metrics
| Metric | Y-Axis Shows | Best For | Example Values |
|--------|--------------|----------|----------------|
| **heapUsed** | MB (actual memory) | **Memory leak detection** | 0-500MB |
| **heapPercent** | Percentage (0-100%) | Heap utilization | 0-100% |
| **heapTotal** | MB (allocated heap) | V8 heap growth | 0-1000MB |
| **rss** | MB (total process memory) | System memory usage | 0-2000MB |
| **external** | MB (C++ objects) | Native memory usage | 0-100MB |

### CPU Metrics
| Metric | Y-Axis Shows | Best For | Example Values |
|--------|--------------|----------|----------------|
| **cpuPercent** | % (0-100) | **CPU usage monitoring** | 0-100% |
| **cpuUser** | ms (cumulative) | User mode activity | Increases over time |
| **cpuSystem** | ms (cumulative) | System calls tracking | Increases over time |
| **cpuTotal** | ms (cumulative) | Total CPU time | Increases over time |

**Recommended defaults:**
- Memory monitoring: `--metric heapUsed` (shows actual MB usage)
- CPU monitoring: `--metric cpuPercent` (shows utilization %)

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
[R] Reload  [C] Clear  [L] Style (blocks)  [Q] Quit
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
{
  "timestamp": 1234567890,
  "heapUsed": "12.34",
  "heapTotal": "56.78",
  "heapPercent": "21.74",
  "rss": "90.12",
  "external": "1.23",
  "cpuPercent": "15.25",
  "cpuUser": "123.45",
  "cpuSystem": "67.89",
  "cpuTotal": "191.34"
}
```

## Features Explained

- **Real-time Updates**: Uses the `tail` package to follow log files as they're written
- **Responsive Design**: Adapts to terminal size changes
- **Peak Preservation**: Intelligent compression keeps important memory spikes visible
- **Statistics**: Shows current, average, minimum, and maximum values
- **Multiple Metrics**: Choose what memory aspect to visualize
- **Performance**: Efficient rendering with configurable refresh rates

## Contributing

This project welcomes contributions! The project uses automated publishing with semantic versioning.

### How to Contribute

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Make your changes** following existing patterns
4. **Use conventional commits**: `npm run commit` (guided commit helper)
5. **Submit a pull request** with clear description

### Commit Message Format

This project uses [Conventional Commits](https://conventionalcommits.org/) for automated releases:

```bash
# Use the commit helper (recommended)
npm run commit

# Or format manually:
feat: add new graph style
fix: resolve timestamp alignment issue
docs: update installation guide
perf: optimize rendering performance
```

### Automated Publishing

- **feat:** → Minor version bump (1.0.0 → 1.1.0)
- **fix:** → Patch version bump (1.0.0 → 1.0.1)
- **BREAKING CHANGE:** → Major version bump (1.0.0 → 2.0.0)

Contributors can:
- Report issues or bugs
- Suggest improvements
- Submit pull requests
- Share your use cases

See [PUBLISH.md](PUBLISH.md) for detailed publishing workflow.

## License

MIT

---

**Getting Started**: Run `./examples/monitor-example.sh` for the complete experience! 🚀