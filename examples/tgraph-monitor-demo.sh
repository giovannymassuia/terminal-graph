#!/bin/bash

# tgraph-monitor Demo Script
# Shows how to use tgraph-monitor with different commands

echo "🎯 tgraph-monitor Demo - Wrap Any Command with Memory Monitoring"
echo "=============================================================="
echo ""

echo "This demo shows how tgraph-monitor can wrap any Node.js command:"
echo ""

echo "✨ Available Commands:"
echo "  tgraph-monitor node app.js              # Monitor Node.js directly"
echo "  tgraph-monitor npm run dev              # Monitor npm scripts"
echo "  tgraph-monitor pnpm dev                 # Monitor pnpm scripts"
echo "  tgraph-monitor yarn start               # Monitor yarn scripts"
echo ""

echo "🔧 Environment Variables:"
echo "  export TGRAPH_LOG_FILE=my-app.log       # Custom log file"
echo "  export TGRAPH_INTERVAL=1000             # Custom interval (ms)"
echo "  export TGRAPH_METRIC=heapUsed           # Default viewing metric"
echo ""

echo "📊 Running Example: tgraph-monitor node examples/test-pnpm-style.js"
echo ""
echo "This will:"
echo "1. Start monitoring the Node.js process automatically"
echo "2. Log memory data to memory-monitor.log"
echo "3. Show you the command to view the graph in another terminal"
echo ""

read -p "Press Enter to start the demo (or Ctrl+C to exit)..."

echo ""
echo "🚀 Starting tgraph-monitor demo..."
echo ""
echo "💡 In another terminal, run this to see the live graph:"
echo "   terminal-graph view --file memory-monitor.log --accumulate --style lean"
echo ""
echo "Press Ctrl+C to stop the demo"
echo ""

# Clean up any existing log
rm -f memory-monitor.log

# Start the demo
tgraph-monitor node examples/test-pnpm-style.js

echo ""
echo "✅ Demo complete!"
echo "📊 Memory data saved to: memory-monitor.log"
echo ""
echo "📈 View the final graph:"
echo "   terminal-graph view --file memory-monitor.log --accumulate --refresh 0"