#!/bin/bash

# Web View Demo Script
echo "🌐 Terminal Graph - Web View Demo"
echo "=================================="
echo ""
echo "This demo will:"
echo "1. Start a Node.js app with memory monitoring"
echo "2. Open a web browser with the interactive dashboard"
echo "3. Show real-time memory updates in the browser"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Clean up any existing demo files
rm -f demo-web.log 2>/dev/null

# Start the example app in the background
echo "📊 Starting example app with memory monitoring..."
node examples/example-app.js --log demo-web.log &
APP_PID=$!

# Wait for initial data
sleep 2

# Start the web viewer
echo "🌐 Starting web viewer on http://localhost:3456..."
echo ""
echo "The browser should open automatically."
echo "If not, open http://localhost:3456 manually."
echo ""
echo "Test these features in the browser:"
echo "  • Click style dropdown to switch between line/area/bars"
echo "  • Click Pause button to freeze the graph"
echo "  • Click Clear button to reset data"
echo "  • Use keyboard shortcuts (Space, C, L, R)"
echo ""
echo "Make requests to trigger memory changes:"
echo "  curl http://localhost:3000/heavy"
echo "  curl http://localhost:3000/cache"
echo "  curl http://localhost:3000/leak"
echo ""
echo "Press Ctrl+C to stop the demo"
echo ""

# Start web viewer
node src/web-graph-viewer.js --file demo-web.log --metric heapUsed --accumulate --style area

# Cleanup on exit
trap "echo ''; echo 'Stopping demo...'; kill $APP_PID 2>/dev/null; rm -f demo-web.log; exit" INT TERM

# Wait for interrupt
wait