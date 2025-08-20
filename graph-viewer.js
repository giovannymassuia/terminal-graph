#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Tail } = require('tail');
const GraphRenderer = require('./graph-renderer');

class GraphViewer {
  constructor(options = {}) {
    this.logFile = options.logFile || 'heap.log';
    this.metric = options.metric || 'heapUsed'; // heapUsed, heapTotal, heapPercent, rss, external
    this.maxDataPoints = options.maxDataPoints || 100;
    this.refreshRate = options.refreshRate || 100; // ms
    this.accumulate = options.accumulate || false; // Accumulate data instead of rolling window
    this.style = options.style || 'blocks'; // blocks, ascii, braille
    this.dataPoints = [];
    this.renderer = null;
    this.tail = null;
    this.isRunning = false;
  }

  async start() {
    console.clear();
    console.log(`Starting graph viewer for ${this.logFile}`);
    console.log(`Monitoring metric: ${this.metric}`);
    console.log('Press Ctrl+C to exit...\n');
    
    // Initialize renderer
    this.renderer = new GraphRenderer({
      width: process.stdout.columns || 80,
      height: Math.min(20, process.stdout.rows - 10),
      maxDataPoints: this.maxDataPoints,
      title: `Node.js Heap Monitor - ${this.getMetricLabel()}`,
      yLabel: this.getMetricUnit(),
      showLegend: true,
      style: this.style,
      showTimeAxis: true
    });

    // Load existing data from file
    await this.loadExistingData();
    
    // Start tailing the log file
    this.startTailing();
    
    // Handle terminal resize
    process.stdout.on('resize', () => {
      this.renderer.width = process.stdout.columns || 80;
      this.renderer.height = Math.min(20, process.stdout.rows - 10);
      this.render();
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
    
    // Initial render
    this.render();
    
    // Set up refresh interval
    this.refreshInterval = setInterval(() => {
      this.render();
    }, this.refreshRate);
    
    this.isRunning = true;
  }

  async loadExistingData() {
    try {
      if (!fs.existsSync(this.logFile)) {
        console.log('Log file does not exist yet. Waiting for data...');
        return;
      }

      const content = fs.readFileSync(this.logFile, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (this.accumulate) {
        // Load all data when accumulating
        for (let i = 0; i < lines.length; i++) {
          this.processLogLine(lines[i]);
        }
      } else {
        // Load only the last maxDataPoints entries for rolling window
        const startIndex = Math.max(0, lines.length - this.maxDataPoints);
        for (let i = startIndex; i < lines.length; i++) {
          this.processLogLine(lines[i]);
        }
      }
      
      console.log(`Loaded ${this.dataPoints.length} existing data points${this.accumulate ? ' (accumulating)' : ''}`);
    } catch (error) {
      console.error('Error loading existing data:', error.message);
    }
  }

  startTailing() {
    try {
      // Create file if it doesn't exist
      if (!fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, '');
      }

      this.tail = new Tail(this.logFile, {
        fromBeginning: false,
        follow: true,
        logger: null, // Disable internal logging
        useWatchFile: true,
        fsWatchOptions: {
          interval: 100
        }
      });

      this.tail.on('line', (line) => {
        this.processLogLine(line);
      });

      this.tail.on('error', (error) => {
        console.error('Tail error:', error);
      });

      this.tail.watch();
    } catch (error) {
      console.error('Error starting tail:', error.message);
    }
  }

  processLogLine(line) {
    if (!line || !line.trim()) return;
    
    try {
      const data = JSON.parse(line);
      const value = this.extractMetricValue(data);
      
      if (value !== null && !isNaN(value)) {
        this.dataPoints.push({
          timestamp: data.timestamp,
          value: parseFloat(value)
        });
        
        // Handle accumulation vs rolling window
        if (!this.accumulate) {
          // Keep only the last maxDataPoints (rolling window)
          if (this.dataPoints.length > this.maxDataPoints) {
            this.dataPoints.shift();
          }
        }
        // If accumulate is true, keep all points (graph will compress them visually)
      }
    } catch (error) {
      // Ignore parse errors for malformed lines
    }
  }

  extractMetricValue(data) {
    switch (this.metric) {
      case 'heapUsed':
        return parseFloat(data.heapUsed);
      case 'heapTotal':
        return parseFloat(data.heapTotal);
      case 'heapPercent':
        return parseFloat(data.heapPercent);
      case 'rss':
        return parseFloat(data.rss);
      case 'external':
        return parseFloat(data.external);
      default:
        return parseFloat(data.heapUsed);
    }
  }

  getMetricLabel() {
    const labels = {
      heapUsed: 'Heap Used',
      heapTotal: 'Heap Total',
      heapPercent: 'Heap Usage %',
      rss: 'RSS Memory',
      external: 'External Memory'
    };
    return labels[this.metric] || 'Memory';
  }

  getMetricUnit() {
    if (this.metric === 'heapPercent') {
      return 'Percent (%)';
    }
    return 'Memory (MB)';
  }

  render() {
    if (!this.renderer) return;
    
    // Clear screen
    this.renderer.clear();
    
    // Build info line
    let info = `Data points: ${this.dataPoints.length}`;
    if (this.accumulate && this.dataPoints.length > this.renderer.width - 10) {
      const compressionRatio = (this.dataPoints.length / (this.renderer.width - 10)).toFixed(1);
      info += ` (${compressionRatio}:1 compression)`;
    }
    info += ` | Mode: ${this.accumulate ? 'Accumulate' : 'Rolling'}`;
    info += ` | Refresh: ${this.refreshRate}ms | File: ${this.logFile}`;
    
    // Render graph
    const output = this.renderer.render(this.dataPoints, {
      info: info
    });
    
    console.log(output);
  }

  stop() {
    console.log('\n\nStopping graph viewer...');
    this.isRunning = false;
    
    if (this.tail) {
      this.tail.unwatch();
      this.tail = null;
    }
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    
    process.exit(0);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    logFile: 'heap.log',
    metric: 'heapUsed',
    maxDataPoints: 100,
    refreshRate: 100,
    accumulate: false,
    style: 'blocks'
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
      case '-f':
        options.logFile = args[++i];
        break;
      case '--metric':
      case '-m':
        options.metric = args[++i];
        break;
      case '--points':
      case '-p':
        options.maxDataPoints = parseInt(args[++i]);
        break;
      case '--refresh':
      case '-r':
        options.refreshRate = parseInt(args[++i]);
        break;
      case '--accumulate':
      case '-a':
        options.accumulate = true;
        break;
      case '--style':
      case '-s':
        options.style = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
Terminal Graph Viewer - Real-time ASCII line graph for log monitoring

Usage: node graph-viewer.js [options]

Options:
  --file, -f <path>      Log file to monitor (default: heap.log)
  --metric, -m <metric>  Metric to display (default: heapUsed)
                        Options: heapUsed, heapTotal, heapPercent, rss, external
  --points, -p <number>  Maximum data points to display (default: 100)
  --refresh, -r <ms>     Refresh rate in milliseconds (default: 100)
  --accumulate, -a      Accumulate all data instead of rolling window
  --style, -s <style>   Graph style: blocks, ascii, braille, dots, lean (default: blocks)
  --help, -h            Show this help message

Examples:
  node graph-viewer.js --file heap.log --metric heapPercent --points 150
  node graph-viewer.js --accumulate --style blocks
  node graph-viewer.js -s lean -m rss --accumulate
  node graph-viewer.js -s ascii -m heapUsed
        `);
        process.exit(0);
    }
  }

  const viewer = new GraphViewer(options);
  viewer.start().catch(error => {
    console.error('Error starting viewer:', error);
    process.exit(1);
  });
}

module.exports = GraphViewer;