#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const HeapMonitor = require('./heap-monitor');
const GraphViewer = require('./graph-viewer');
const WebGraphViewer = require('./web-graph-viewer');

// Read version from package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const VERSION = packageJson.version;

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`
Terminal Graph - Real-time ASCII line graphs for monitoring
Version: ${VERSION}

Usage: 
  terminal-graph <command> [options]
  npx terminal-graph <command> [options]

Commands:
  monitor [file] [interval]    Start monitoring heap memory
  view [options]               View graph from log file  
  web [options]                View graph in web browser
  demo                         Run interactive demo
  help                         Show this help message

Monitor Options:
  terminal-graph monitor [file] [interval] [--simulate]
    file        Log file path (default: heap.log)
    interval    Sampling interval in ms (default: 100)
    --simulate  Simulate memory activity for testing

View Options (Terminal):
  terminal-graph view [options]
    --file, -f <path>      Log file to monitor (default: heap.log)
    --metric, -m <metric>  Memory: heapUsed, heapTotal, heapPercent, rss, external
                          CPU: cpuPercent, cpuUser, cpuSystem, cpuTotal
    --style, -s <style>    Style: blocks, lean, ascii, dots, braille
    --accumulate, -a       Accumulate all data (no rolling window)
    --points, -p <number>  Max data points for rolling window (default: 100)
    --refresh, -r <ms>     Refresh rate in milliseconds (default: 100)
    
    Keyboard Controls (in terminal view):
      M - Toggle between Memory and CPU modes
      L - Cycle through graph styles
      R - Reload data
      C - Clear and reload

Web View Options:
  terminal-graph web [options]
    --file, -f <path>      Log file to monitor (default: heap.log)
    --metric, -m <metric>  Memory: heapUsed, heapTotal, heapPercent, rss, external
                          CPU: cpuPercent, cpuUser, cpuSystem, cpuTotal
    --style, -s <style>    Style: line, area, bars
    --accumulate, -a       Accumulate all data (no rolling window)
    --points, -p <number>  Max data points for rolling window (default: 100)
    --port <number>        Server port (default: 3456)
    --no-open             Don't automatically open browser
    
    Web Dashboard Controls:
      Toggle between Memory/CPU modes or view both simultaneously

Quick Start:
  # Monitor current process
  terminal-graph monitor
  
  # View in terminal with lean style
  terminal-graph view --style lean --accumulate
  
  # View in web browser
  terminal-graph web --style area --accumulate
  
  # Run demo
  terminal-graph demo

Examples:
  terminal-graph monitor my-app.log 200
  terminal-graph view --file my-app.log --style lean --accumulate
  terminal-graph web --file my-app.log --style area --port 8080
  terminal-graph view -s blocks -m heapPercent -a
  npx terminal-graph demo
`);
}

function runMonitor() {
  const monitorArgs = args.slice(1);
  const logFile = monitorArgs[0] || 'heap.log';
  const interval = parseInt(monitorArgs[1]) || 100;
  const simulate = monitorArgs.includes('--simulate');
  
  const monitor = new HeapMonitor({
    logFile: logFile,
    interval: interval
  });
  
  console.log(`Starting heap monitor...`);
  console.log(`Writing to: ${logFile}`);
  console.log(`Interval: ${interval}ms`);
  if (simulate) {
    console.log('Simulation mode enabled');
  }
  console.log('\nIn another terminal, run:');
  console.log(`  terminal-graph view --file ${logFile}`);
  console.log('\nPress Ctrl+C to stop...\n');
  
  monitor.start();
  
  // Add simulation if requested
  if (simulate) {
    simulateMemoryActivity();
  }
}

function runViewer() {
  const viewerArgs = args.slice(1);
  const options = {
    logFile: 'heap.log',
    metric: 'heapUsed',
    maxDataPoints: 100,
    refreshRate: 100,
    accumulate: false,
    style: 'blocks'
  };

  // Parse viewer arguments
  for (let i = 0; i < viewerArgs.length; i++) {
    switch (viewerArgs[i]) {
      case '--file':
      case '-f':
        options.logFile = viewerArgs[++i];
        break;
      case '--metric':
      case '-m':
        options.metric = viewerArgs[++i];
        break;
      case '--points':
      case '-p':
        options.maxDataPoints = parseInt(viewerArgs[++i]);
        break;
      case '--refresh':
      case '-r':
        options.refreshRate = parseInt(viewerArgs[++i]);
        break;
      case '--accumulate':
      case '-a':
        options.accumulate = true;
        break;
      case '--style':
      case '-s':
        options.style = viewerArgs[++i];
        break;
    }
  }

  const viewer = new GraphViewer(options);
  viewer.start().catch(error => {
    console.error('Error starting viewer:', error);
    process.exit(1);
  });
}

function runWebViewer() {
  const webArgs = args.slice(1);
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

  // Parse web viewer arguments
  for (let i = 0; i < webArgs.length; i++) {
    switch (webArgs[i]) {
      case '--file':
      case '-f':
        options.logFile = webArgs[++i];
        break;
      case '--metric':
      case '-m':
        options.metric = webArgs[++i];
        break;
      case '--points':
      case '-p':
        options.maxDataPoints = parseInt(webArgs[++i]);
        break;
      case '--refresh':
      case '-r':
        options.refreshRate = parseInt(webArgs[++i]);
        break;
      case '--accumulate':
      case '-a':
        options.accumulate = true;
        break;
      case '--style':
      case '-s':
        options.style = webArgs[++i];
        break;
      case '--port':
        options.port = parseInt(webArgs[++i]);
        break;
      case '--no-open':
        options.autoOpen = false;
        break;
    }
  }

  const viewer = new WebGraphViewer(options);
  viewer.start().catch(error => {
    console.error('Error starting web viewer:', error);
    process.exit(1);
  });
}

function runDemo() {
  console.log('Terminal Graph Demo');
  console.log('===================\n');
  console.log('This demo will:');
  console.log('1. Start a heap monitor with simulated memory patterns');
  console.log('2. Display a real-time graph with accumulation');
  console.log('3. Show compression as data accumulates over time\n');
  
  const demoLog = 'demo-heap.log';
  
  // Clear any existing demo log
  if (fs.existsSync(demoLog)) {
    fs.unlinkSync(demoLog);
  }
  
  console.log('Starting monitor with simulation...\n');
  
  // Start monitor process
  const monitor = spawn(process.execPath, [
    path.join(__dirname, 'heap-monitor.js'),
    demoLog,
    '100',
    '--simulate'
  ], {
    stdio: 'inherit'
  });
  
  // Wait for some data, then start viewer
  setTimeout(() => {
    console.log('\n\nStarting graph viewer...\n');
    
    const viewer = spawn(process.execPath, [
      path.join(__dirname, 'graph-viewer.js'),
      '--file', demoLog,
      '--metric', 'heapPercent',
      '--style', 'blocks',
      '--accumulate',
      '--refresh', '300'
    ], {
      stdio: 'inherit'
    });
    
    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n\nStopping demo...');
      monitor.kill();
      viewer.kill();
      
      // Clean up demo file
      setTimeout(() => {
        if (fs.existsSync(demoLog)) {
          fs.unlinkSync(demoLog);
        }
        process.exit(0);
      }, 100);
    });
    
  }, 2000);
}

function simulateMemoryActivity() {
  const arrays = [];
  let growing = true;
  
  setInterval(() => {
    if (growing) {
      arrays.push(new Array(10000).fill(Math.random()));
      if (arrays.length > 100) growing = false;
    } else {
      arrays.pop();
      if (arrays.length === 0) growing = true;
    }
  }, 50);
}

// Main CLI logic
if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

switch (command) {
  case 'monitor':
    runMonitor();
    break;
  case 'view':
    runViewer();
    break;
  case 'web':
    runWebViewer();
    break;
  case 'demo':
    runDemo();
    break;
  case '--version':
  case '-v':
    console.log(`terminal-graph v${VERSION}`);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.log('Run "terminal-graph help" for usage information');
    process.exit(1);
}