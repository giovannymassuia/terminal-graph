#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { Tail } = require('tail');
const open = require('open');

class WebGraphViewer {
  constructor(options = {}) {
    this.logFile = options.logFile || 'heap.log';
    this.metric = options.metric || 'heapUsed';
    this.maxDataPoints = options.maxDataPoints || 100;
    this.refreshRate = options.refreshRate || 100;
    this.accumulate = options.accumulate || false;
    this.style = options.style || 'line'; // line, area, bars
    this.port = options.port || 3456;
    this.autoOpen = options.autoOpen !== false; // default true
    
    // Store all metrics data - both memory and CPU
    this.allMetricsData = {
      // Memory metrics
      heapUsed: [],
      heapTotal: [],
      heapPercent: [],
      rss: [],
      external: [],
      // CPU metrics
      cpuPercent: [],
      cpuUser: [],
      cpuSystem: [],
      cpuTotal: []
    };
    this.dataPoints = []; // Keep for backward compatibility
    this.rawData = []; // Store raw data for all metrics
    this.tail = null;
    this.server = null;
    this.connections = new Set();
  }

  async start() {
    console.log(`Starting web graph viewer on http://localhost:${this.port}`);
    console.log(`Monitoring: ${this.logFile}`);
    console.log(`Metric: ${this.metric}`);
    console.log('Press Ctrl+C to exit\n');
    
    // Load existing data
    await this.loadExistingData();
    
    // Start tailing the log file
    this.startTailing();
    
    // Create HTTP server
    this.createServer();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
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
        for (let i = 0; i < lines.length; i++) {
          this.processLogLine(lines[i]);
        }
      } else {
        const startIndex = Math.max(0, lines.length - this.maxDataPoints);
        for (let i = startIndex; i < lines.length; i++) {
          this.processLogLine(lines[i]);
        }
      }
      
      const totalMetrics = Object.values(this.allMetricsData).reduce((sum, arr) => sum + arr.length, 0);
      console.log(`Loaded ${this.dataPoints.length} primary data points, ${totalMetrics} total metric points${this.accumulate ? ' (accumulating)' : ''}`);
    } catch (error) {
      console.error('Error loading existing data:', error.message);
    }
  }

  startTailing() {
    try {
      if (!fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, '');
      }

      this.tail = new Tail(this.logFile, {
        fromBeginning: false,
        follow: true,
        logger: null,
        useWatchFile: true,
        fsWatchOptions: {
          interval: 100
        }
      });

      this.tail.on('line', (line) => {
        this.processLogLine(line);
        this.broadcastUpdate();
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
      
      // Store raw data
      this.rawData.push(data);
      if (!this.accumulate && this.rawData.length > this.maxDataPoints) {
        this.rawData.shift();
      }
      
      // Process all metrics
      const time = new Date(data.timestamp).toLocaleTimeString();
      
      Object.keys(this.allMetricsData).forEach(metric => {
        const value = this.extractMetricValue(data, metric);
        if (value !== null && !isNaN(value)) {
          const point = {
            timestamp: data.timestamp,
            value: parseFloat(value),
            time: time
          };
          
          this.allMetricsData[metric].push(point);
          
          if (!this.accumulate && this.allMetricsData[metric].length > this.maxDataPoints) {
            this.allMetricsData[metric].shift();
          }
        }
      });
      
      // Keep backward compatibility for single metric
      const primaryValue = this.extractMetricValue(data, this.metric);
      if (primaryValue !== null && !isNaN(primaryValue)) {
        const point = {
          timestamp: data.timestamp,
          value: parseFloat(primaryValue),
          time: time
        };
        
        this.dataPoints.push(point);
        
        if (!this.accumulate && this.dataPoints.length > this.maxDataPoints) {
          this.dataPoints.shift();
        }
      }
    } catch (error) {
      // Ignore parse errors
    }
  }

  extractMetricValue(data, metricName = null) {
    const metric = metricName || this.metric;
    switch (metric) {
      // Memory metrics
      case 'heapUsed':
        return parseFloat(data.heapUsed || 0);
      case 'heapTotal':
        return parseFloat(data.heapTotal || 0);
      case 'heapPercent':
        return parseFloat(data.heapPercent || 0);
      case 'rss':
        return parseFloat(data.rss || 0);
      case 'external':
        return parseFloat(data.external || 0);
      // CPU metrics
      case 'cpuPercent':
        return parseFloat(data.cpuPercent || 0);
      case 'cpuUser':
        return parseFloat(data.cpuUser || 0);
      case 'cpuSystem':
        return parseFloat(data.cpuSystem || 0);
      case 'cpuTotal':
        return parseFloat(data.cpuTotal || 0);
      default:
        return parseFloat(data.heapUsed || 0);
    }
  }

  getMetricLabel() {
    const labels = {
      // Memory metrics
      heapUsed: 'Heap Used (MB)',
      heapTotal: 'Heap Total (MB)',
      heapPercent: 'Heap Usage (%)',
      rss: 'RSS Memory (MB)',
      external: 'External Memory (MB)',
      // CPU metrics
      cpuPercent: 'CPU Usage (%)',
      cpuUser: 'CPU User Time (ms)',
      cpuSystem: 'CPU System Time (ms)',
      cpuTotal: 'CPU Total Time (ms)'
    };
    return labels[this.metric] || 'Resource';
  }

  createServer() {
    this.server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${this.port}`);
      
      if (url.pathname === '/') {
        this.serveHTML(res);
      } else if (url.pathname === '/data') {
        this.serveData(res);
      } else if (url.pathname === '/sse') {
        this.serveSSE(req, res);
      } else if (url.pathname === '/config') {
        this.serveConfig(res);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    this.server.listen(this.port, () => {
      console.log(`Web interface available at: http://localhost:${this.port}`);
      
      if (this.autoOpen) {
        open(`http://localhost:${this.port}`);
      }
    });
  }

  serveHTML(res) {
    const htmlPath = path.join(__dirname, '..', 'web', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  serveData(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      dataPoints: this.dataPoints,
      allMetricsData: this.allMetricsData,
      metric: this.metric,
      metricLabel: this.getMetricLabel(),
      accumulate: this.accumulate,
      maxDataPoints: this.maxDataPoints,
      stats: this.calculateStats(),
      allStats: this.calculateAllStats()
    }));
  }

  serveConfig(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      metric: this.metric,
      metricLabel: this.getMetricLabel(),
      accumulate: this.accumulate,
      maxDataPoints: this.maxDataPoints,
      refreshRate: this.refreshRate,
      style: this.style,
      logFile: this.logFile
    }));
  }

  serveSSE(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const connection = { req, res };
    this.connections.add(connection);

    // Send initial data
    res.write(`data: ${JSON.stringify({
      type: 'update',
      dataPoints: this.dataPoints,
      allMetricsData: this.allMetricsData,
      stats: this.calculateStats(),
      allStats: this.calculateAllStats()
    })}\n\n`);

    req.on('close', () => {
      this.connections.delete(connection);
    });
  }

  broadcastUpdate() {
    const data = JSON.stringify({
      type: 'update',
      dataPoints: this.dataPoints,
      allMetricsData: this.allMetricsData,
      stats: this.calculateStats(),
      allStats: this.calculateAllStats()
    });

    this.connections.forEach(({ res }) => {
      res.write(`data: ${data}\n\n`);
    });
  }

  calculateStats(dataPoints = null) {
    const points = dataPoints || this.dataPoints;
    
    if (points.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0 };
    }

    const values = points.map(p => p.value);
    const current = values[values.length - 1];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      current: current.toFixed(2),
      average: average.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2)
    };
  }

  calculateAllStats() {
    const stats = {};
    Object.keys(this.allMetricsData).forEach(metric => {
      stats[metric] = this.calculateStats(this.allMetricsData[metric]);
    });
    return stats;
  }

  stop() {
    console.log('\n\nStopping web graph viewer...');
    
    if (this.tail) {
      this.tail.unwatch();
      this.tail = null;
    }
    
    this.connections.forEach(({ res }) => {
      res.end();
    });
    
    if (this.server) {
      this.server.close();
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
    style: 'line',
    port: 3456,
    autoOpen: true
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
      case '--port':
        options.port = parseInt(args[++i]);
        break;
      case '--no-open':
        options.autoOpen = false;
        break;
      case '--help':
      case '-h':
        console.log(`
Terminal Graph Web Viewer - Browser-based real-time graph viewer

Usage: node web-graph-viewer.js [options]

Options:
  --file, -f <path>      Log file to monitor (default: heap.log)
  --metric, -m <metric>  Metric to display (default: heapUsed)
                        Options: heapUsed, heapTotal, heapPercent, rss, external
  --points, -p <number>  Maximum data points to display (default: 100)
  --refresh, -r <ms>     Refresh rate in milliseconds (default: 100)
  --accumulate, -a      Accumulate all data instead of rolling window
  --style, -s <style>   Graph style: line, area, bars (default: line)
  --port <number>       Server port (default: 3456)
  --no-open            Don't automatically open browser
  --help, -h           Show this help message

Examples:
  node web-graph-viewer.js --file heap.log --metric heapPercent
  node web-graph-viewer.js --accumulate --style area --port 8080
        `);
        process.exit(0);
    }
  }

  const viewer = new WebGraphViewer(options);
  viewer.start().catch(error => {
    console.error('Error starting web viewer:', error);
    process.exit(1);
  });
}

module.exports = WebGraphViewer;