#!/bin/bash

# Monitor Example App Script
# This script starts the example app and monitoring in parallel

echo "🎯 Starting Node.js App with Memory Monitoring Demo"
echo "=================================================="
echo ""

# Kill any existing processes
pkill -f "example-app.js" 2>/dev/null
pkill -f "terminal-graph" 2>/dev/null

# Clean up old log file
rm -f example-app-memory.log

echo "🚀 Starting example Node.js application..."
echo "   - Server will run on http://localhost:3000"
echo "   - Memory will be monitored every 250ms"
echo "   - Log file: example-app-memory.log"
echo ""

# Start the example app in the background
node examples/example-app.js &
APP_PID=$!

# Wait a moment for the app to start and generate some data
echo "⏳ Waiting for app to start and generate initial data..."
sleep 3

echo ""
echo "📊 Starting terminal-graph viewer with accumulation..."
echo "   - Style: lean (colon-based)"
echo "   - Mode: accumulate (keeps all historical data)"
echo "   - Refresh: 500ms for smooth updates"
echo ""
echo "💡 Try these URLs in another terminal to see memory spikes:"
echo "   curl http://localhost:3000/heavy    # Heavy processing"
echo "   curl http://localhost:3000/cache    # Cache buildup"
echo "   curl http://localhost:3000/leak     # Memory leak simulation"
echo "   curl http://localhost:3000/stress   # Stress test"
echo "   curl http://localhost:3000/gc       # Trigger GC (if --expose-gc)"
echo ""
echo "Press Ctrl+C to stop both the app and monitoring"
echo ""

# Start terminal-graph viewer
terminal-graph view \
  --file example-app-memory.log \
  --metric heapUsed \
  --style lean \
  --accumulate \
  --refresh 500

# Cleanup on exit
echo ""
echo "🛑 Stopping example application..."
kill $APP_PID 2>/dev/null
wait $APP_PID 2>/dev/null
echo "✅ Demo complete!"