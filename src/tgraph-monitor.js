#!/usr/bin/env node

/**
 * tgraph-monitor - Wrap any Node.js command with memory monitoring
 * 
 * Usage:
 *   tgraph-monitor node app.js
 *   tgraph-monitor npm run dev
 *   tgraph-monitor pnpm dev
 *   tgraph-monitor yarn start
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Parse arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  showHelp();
  process.exit(0);
}

function showHelp() {
  console.log(`
tgraph-monitor - Wrap any Node.js command with memory monitoring

Usage:
  tgraph-monitor <command> [args...]

Examples:
  tgraph-monitor node app.js              # Monitor Node.js app directly
  tgraph-monitor npm run dev              # Monitor npm dev script
  tgraph-monitor pnpm dev                 # Monitor pnpm dev script
  tgraph-monitor yarn start               # Monitor yarn start script
  tgraph-monitor npm test                 # Monitor tests

Options:
  --log-file <file>     Log file name (default: memory-monitor.log)
  --interval <ms>       Monitoring interval (default: 500ms)
  --help, -h           Show this help

Environment Variables:
  TGRAPH_LOG_FILE       Override log file name
  TGRAPH_INTERVAL       Override monitoring interval
  TGRAPH_METRIC         Default metric for viewing (default: heapUsed)

After starting, view the graph in another terminal:
  terminal-graph view --file memory-monitor.log --accumulate --style lean
`);
}

// Parse tgraph-monitor specific options
let logFile = process.env.TGRAPH_LOG_FILE || 'memory-monitor.log';
let interval = parseInt(process.env.TGRAPH_INTERVAL) || 500;
let metric = process.env.TGRAPH_METRIC || 'heapUsed';

const filteredArgs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--log-file') {
    logFile = args[++i];
  } else if (args[i] === '--interval') {
    interval = parseInt(args[++i]);
  } else {
    filteredArgs.push(args[i]);
  }
}

if (filteredArgs.length === 0) {
  console.error('Error: No command specified');
  showHelp();
  process.exit(1);
}

const command = filteredArgs[0];
const commandArgs = filteredArgs.slice(1);

console.log(`🎯 Starting tgraph-monitor`);
console.log(`📊 Memory will be logged to: ${logFile}`);
console.log(`⏱️  Monitoring interval: ${interval}ms`);
console.log(`🚀 Running: ${command} ${commandArgs.join(' ')}`);
console.log(`\n📈 View graph in another terminal:`);
console.log(`   terminal-graph view --file ${logFile} --metric ${metric} --accumulate --style lean`);
console.log(`\nPress Ctrl+C to stop both monitoring and the process\n`);

// Clean up old log file
if (fs.existsSync(logFile)) {
  fs.unlinkSync(logFile);
}

// Setup monitoring
const monitoringCode = `
const fs = require('fs');

let stream;
try {
  stream = fs.createWriteStream('${logFile}', { flags: 'a' });
} catch (error) {
  console.error('Failed to create monitoring log file:', error.message);
  process.exit(1);
}

function logMemoryUsage() {
  try {
    const memUsage = process.memoryUsage();
    const data = {
      timestamp: Date.now(),
      heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
      heapPercent: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2),
      rss: (memUsage.rss / 1024 / 1024).toFixed(2),
      external: (memUsage.external / 1024 / 1024).toFixed(2)
    };
    
    stream.write(JSON.stringify(data) + '\\n');
  } catch (error) {
    // Silently ignore monitoring errors to not interfere with the main process
  }
}

// Start monitoring
const monitorInterval = setInterval(logMemoryUsage, ${interval});

// Cleanup on exit
const cleanup = () => {
  clearInterval(monitorInterval);
  if (stream && !stream.destroyed) {
    stream.end();
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Log initial state
logMemoryUsage();
`;

// Create a temporary file with monitoring code
const tempMonitorFile = path.join(__dirname, '..', 'temp-monitor.js');
fs.writeFileSync(tempMonitorFile, monitoringCode);

// Start the command with Node.js preload for monitoring
const childProcess = spawn(command, commandArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: (process.env.NODE_OPTIONS || '') + ` -r "${tempMonitorFile}"`
  }
});

// Handle cleanup
const cleanup = () => {
  if (fs.existsSync(tempMonitorFile)) {
    try {
      fs.unlinkSync(tempMonitorFile);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
};

childProcess.on('close', (code) => {
  cleanup();
  console.log(`\n🛑 Process exited with code ${code}`);
  console.log(`📊 Memory data saved to: ${logFile}`);
  console.log(`📈 View final graph with:`);
  console.log(`   terminal-graph view --file ${logFile} --metric ${metric} --accumulate --refresh 0`);
  process.exit(code);
});

childProcess.on('error', (error) => {
  cleanup();
  console.error(`\n❌ Error starting process: ${error.message}`);
  process.exit(1);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping monitoring and process...');
  childProcess.kill('SIGINT');
  cleanup();
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, stopping...');
  childProcess.kill('SIGTERM');
  cleanup();
});