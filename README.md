# Terminal Graph 📊

Real-time ASCII line graphs for your terminal. Monitor memory usage, visualize data streams, and create beautiful terminal dashboards.

## Features

- **Real-time Monitoring**: Continuously monitors Node.js heap memory usage
- **ASCII Line Graphs**: Beautiful terminal-based visualization
- **Log File Based**: Writes metrics to a log file for persistence
- **Multiple Metrics**: Monitor heap used, heap total, RSS, external memory, or heap percentage
- **Configurable**: Adjustable refresh rates, data points, and graph dimensions
- **Tail Support**: Follows log files in real-time for live updates

## Installation

### Global Install
```bash
npm install -g terminal-graph
# or
yarn global add terminal-graph
```

### Use with npx (no install needed)
```bash
npx terminal-graph demo
# or with pnpx
pnpx terminal-graph demo
```

### Local Project
```bash
npm install terminal-graph
```

## Quick Start

```bash
# Run the demo
terminal-graph demo

# Monitor current process
terminal-graph monitor

# View graph with lean style
terminal-graph view --style lean --accumulate
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
- `--metric, -m` - Metric to display: heapUsed, heapTotal, heapPercent, rss, external
- `--style, -s` - Graph style: blocks, lean, ascii, dots, braille
- `--accumulate, -a` - Accumulate all data instead of rolling window
- `--points, -p` - Maximum data points for rolling window (default: 100)
- `--refresh, -r` - Refresh rate in milliseconds (default: 100)

### Graph Styles

- **blocks** - Filled area chart with █ and ░ (default)
- **lean** - Minimal style using : characters
- **ascii** - Traditional ASCII with /, \, ─, │
- **dots** - Braille characters for high resolution
- **braille** - Unicode braille patterns

## Monitoring Your Own Application

### Method 1: Integrate HeapMonitor Class

```javascript
const HeapMonitor = require('./heap-monitor');

// In your application
const monitor = new HeapMonitor({
  logFile: 'app-heap.log',
  interval: 500  // 500ms interval
});

monitor.start();

// Your application code here...
```

### Method 2: External Monitoring

1. Add monitoring to your app:
```javascript
// In your app.js
setInterval(() => {
  const used = process.memoryUsage();
  const data = {
    timestamp: Date.now(),
    heapUsed: (used.heapUsed / 1024 / 1024).toFixed(2),
    heapTotal: (used.heapTotal / 1024 / 1024).toFixed(2),
    heapPercent: ((used.heapUsed / used.heapTotal) * 100).toFixed(2),
    rss: (used.rss / 1024 / 1024).toFixed(2),
    external: (used.external / 1024 / 1024).toFixed(2)
  };
  
  fs.appendFileSync('app-heap.log', JSON.stringify(data) + '\n');
}, 100);
```

2. View with graph viewer:
```bash
node graph-viewer.js --file app-heap.log --metric heapPercent
```

## Log File Format

The log file contains JSON lines with memory metrics:

```json
{"timestamp":1234567890,"heapUsed":"12.34","heapTotal":"56.78","external":"1.23","rss":"90.12","heapPercent":"21.74"}
```

## Graph Display

The graph shows:
- **Y-axis**: Memory usage (MB) or percentage
- **X-axis**: Time progression (newest data on the right)
- **Legend**: Current, average, min, and max values
- **Line**: Connected data points showing the trend

Example output:
```
                    Node.js Heap Monitor - Heap Usage %
════════════════════════════════════════════════════════════════════════════════
   95.0 │                                              ●━━━●                          
   90.0 │                                          ●━━━┘   └━━●                      
   85.0 │                                      ●━━━┘           └━━●                  
   80.0 │                                  ●━━━┘                   └━━●              
   75.0 │                              ●━━━┘                           └━━●          
   70.0 │                          ●━━━┘                                   └━━●      
   65.0 │                      ●━━━┘                                           └━━●  
   60.0 │                  ●━━━┘                                                     
   55.0 │              ●━━━┘                                                         
   50.0 │          ●━━━┘                                                             
        └────────────────────────────────────────────────────────────────────────

Current: 68.45 | Average: 72.31 | Min: 50.00 | Max: 95.00
Data points: 80 | Refresh: 200ms | File: heap-demo.log
```

## Features Explained

- **Real-time Updates**: Uses the `tail` package to follow log files as they're written
- **Responsive Design**: Adapts to terminal size changes
- **Line Interpolation**: Connects data points with ASCII characters (─, │, /, \)
- **Statistics**: Shows current, average, minimum, and maximum values
- **Configurable Metrics**: Choose what memory metric to visualize
- **Performance**: Efficient rendering with configurable refresh rates

## License

MIT