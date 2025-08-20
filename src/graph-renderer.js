class GraphRenderer {
  constructor(options = {}) {
    this.width = options.width || process.stdout.columns || 80;
    this.height = options.height || 20;
    this.maxDataPoints = options.maxDataPoints || this.width - 10;
    this.title = options.title || 'Terminal Graph';
    this.yLabel = options.yLabel || 'Value';
    this.showLegend = options.showLegend !== false;
    this.colors = options.colors || false; // ANSI colors support
    this.style = options.style || 'blocks'; // 'blocks', 'ascii', 'braille', 'dots', 'lean'
    this.showTimeAxis = options.showTimeAxis !== false;
  }

  render(dataPoints, options = {}) {
    const { min, max, current, average } = this.calculateStats(dataPoints);
    const graph = this.createGraph(dataPoints, min, max);
    const output = this.formatOutput(graph, min, max, current, average, dataPoints, options);
    return output;
  }

  calculateStats(dataPoints) {
    if (!dataPoints.length) {
      return { min: 0, max: 100, current: 0, average: 0 };
    }

    const values = dataPoints.map(p => p.value || p);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const current = values[values.length - 1];
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    return { min, max, current, average };
  }

  createGraph(dataPoints, min, max) {
    const graph = Array(this.height).fill().map(() => Array(this.width - 10).fill(' '));
    
    if (!dataPoints.length) return graph;

    const graphWidth = this.width - 10;
    const range = max - min || 1;
    
    // Create filled area under the line if using blocks style
    const fillUnder = this.style === 'blocks';
    
    // Compress data if needed to fit all points
    let points;
    if (dataPoints.length <= graphWidth) {
      // All points fit - use them directly
      points = dataPoints;
    } else {
      // Compress data to fit width - sample points to preserve peaks and valleys
      points = this.compressData(dataPoints, graphWidth);
    }
    
    // Plot the line
    for (let i = 0; i < points.length; i++) {
      const value = points[i].value || points[i];
      // Map point index to x position on graph
      const x = Math.floor((i / Math.max(points.length - 1, 1)) * (graphWidth - 1));
      const y = this.height - 1 - Math.floor(((value - min) / range) * (this.height - 1));
      
      if (y >= 0 && y < this.height && x >= 0 && x < graphWidth) {
        // Draw the point
        graph[y][x] = this.getPointChar(y, this.height);
        
        // Fill under the line if using blocks style
        if (fillUnder) {
          for (let fillY = y + 1; fillY < this.height; fillY++) {
            if (graph[fillY][x] === ' ') {
              graph[fillY][x] = this.getFillChar(fillY, y, this.height);
            }
          }
        }
        
        // Connect with previous point if exists
        if (i > 0) {
          const prevValue = points[i - 1].value || points[i - 1];
          const prevX = Math.floor(((i - 1) / Math.max(points.length - 1, 1)) * (graphWidth - 1));
          const prevY = this.height - 1 - Math.floor(((prevValue - min) / range) * (this.height - 1));
          
          // Draw line between points
          this.drawLine(graph, prevX, prevY, x, y, fillUnder);
        }
      }
    }
    
    return graph;
  }

  compressData(dataPoints, targetWidth) {
    // Use peak-preserving compression
    const compressionRatio = dataPoints.length / targetWidth;
    const compressed = [];
    
    for (let i = 0; i < targetWidth; i++) {
      const startIdx = Math.floor(i * compressionRatio);
      const endIdx = Math.floor((i + 1) * compressionRatio);
      
      // Find min, max, and average in this segment
      let segmentMin = Infinity;
      let segmentMax = -Infinity;
      let sum = 0;
      let count = 0;
      let lastTimestamp = 0;
      
      for (let j = startIdx; j < endIdx && j < dataPoints.length; j++) {
        const val = dataPoints[j].value || dataPoints[j];
        segmentMin = Math.min(segmentMin, val);
        segmentMax = Math.max(segmentMax, val);
        sum += val;
        count++;
        lastTimestamp = dataPoints[j].timestamp || Date.now();
      }
      
      if (count > 0) {
        // Decide which value to use based on variation
        const avg = sum / count;
        const variation = segmentMax - segmentMin;
        
        // If high variation, prefer extremes to preserve peaks
        let value;
        if (variation > (segmentMax * 0.1)) {
          // Check neighbors to decide if this is a peak or valley
          const prevVal = i > 0 ? compressed[i-1].value : avg;
          const nextIdx = Math.min(endIdx + 1, dataPoints.length - 1);
          const nextVal = dataPoints[nextIdx] ? (dataPoints[nextIdx].value || dataPoints[nextIdx]) : avg;
          
          // Use max if it's likely a peak, min if it's likely a valley
          if (Math.abs(segmentMax - avg) > Math.abs(segmentMin - avg)) {
            value = segmentMax;
          } else {
            value = segmentMin;
          }
        } else {
          value = avg;
        }
        
        compressed.push({
          value: value,
          timestamp: lastTimestamp
        });
      }
    }
    
    return compressed;
  }

  getPointChar(y, height) {
    if (this.style === 'blocks') {
      return '█';
    } else if (this.style === 'braille') {
      return '⣿';
    } else if (this.style === 'dots') {
      return '⡇';  // Vertical line character
    } else if (this.style === 'lean') {
      return ':';  // Simple colon for lean look
    }
    return '●';
  }

  getFillChar(fillY, lineY, height) {
    if (this.style === 'blocks') {
      const distance = fillY - lineY;
      if (distance === 1) return '▀';
      if (distance === 2) return '▄';
      return '░';
    } else if (this.style === 'dots') {
      const distance = fillY - lineY;
      // Use different density dots based on distance from line
      if (distance === 1) return '⠒';
      if (distance === 2) return '⠂';
      return '⠀';
    } else if (this.style === 'lean') {
      // Use colons for lean appearance
      return ':';
    }
    return '·';
  }

  drawLine(graph, x1, y1, x2, y2, fillUnder = false) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      if (x >= 0 && x < this.width - 10 && y >= 0 && y < this.height) {
        if (graph[y][x] === ' ' || graph[y][x] === '░' || graph[y][x] === '⠀') {
          // Choose character based on style
          if (this.style === 'blocks') {
            graph[y][x] = '█';
            // Fill under the line
            if (fillUnder) {
              for (let fillY = y + 1; fillY < this.height; fillY++) {
                if (graph[fillY][x] === ' ') {
                  graph[fillY][x] = '░';
                }
              }
            }
          } else if (this.style === 'dots') {
            // Use simple dots/colons for lean appearance
            graph[y][x] = '⡇';
            // Fill under with dots
            if (fillUnder) {
              for (let fillY = y + 1; fillY < this.height; fillY++) {
                if (graph[fillY][x] === ' ') {
                  const distance = fillY - y;
                  if (distance === 1) graph[fillY][x] = '⠒';
                  else if (distance === 2) graph[fillY][x] = '⠂';
                  else graph[fillY][x] = '⠀';
                }
              }
            }
          } else if (this.style === 'lean') {
            // Use simple characters for lean appearance
            graph[y][x] = ':';
            // Fill under with colons
            if (fillUnder) {
              for (let fillY = y + 1; fillY < this.height; fillY++) {
                if (graph[fillY][x] === ' ') {
                  graph[fillY][x] = ':';
                }
              }
            }
          } else {
            // ASCII style
            if (dx > dy * 2) {
              graph[y][x] = '─';
            } else if (dy > dx * 2) {
              graph[y][x] = '│';
            } else if ((sx === 1 && sy === 1) || (sx === -1 && sy === -1)) {
              graph[y][x] = '\\';
            } else {
              graph[y][x] = '/';
            }
          }
        }
      }

      if (x === x2 && y === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  formatOutput(graph, min, max, current, average, dataPoints, options = {}) {
    const lines = [];
    
    // Title
    const titlePadding = Math.floor((this.width - this.title.length) / 2);
    lines.push(' '.repeat(titlePadding) + this.title);
    lines.push('═'.repeat(this.width));
    
    // Graph with Y-axis labels
    for (let y = 0; y < this.height; y++) {
      const value = max - (y / (this.height - 1)) * (max - min);
      const label = value.toFixed(1).padStart(7);
      const row = graph[y].join('');
      lines.push(`${label} │${row}`);
    }
    
    // X-axis
    lines.push(' '.repeat(8) + '└' + '─'.repeat(this.width - 10));
    
    // Time axis labels
    if (this.showTimeAxis && dataPoints.length > 0) {
      const timeLabels = this.generateTimeLabels(dataPoints);
      lines.push(' '.repeat(9) + timeLabels);
    }
    
    // Stats
    if (this.showLegend) {
      lines.push('');
      lines.push(`Current: ${current.toFixed(2)} | Average: ${average.toFixed(2)} | Min: ${min.toFixed(2)} | Max: ${max.toFixed(2)}`);
    }
    
    // Additional info from options
    if (options.info) {
      lines.push(options.info);
    }
    
    return lines.join('\n');
  }

  generateTimeLabels(dataPoints) {
    const width = this.width - 10;
    
    if (dataPoints.length === 0) return '';
    
    // Get time range from all data points
    const startTime = dataPoints[0].timestamp;
    const endTime = dataPoints[dataPoints.length - 1].timestamp;
    const duration = endTime - startTime;
    
    // Generate labels at intervals
    const labels = Array(width).fill(' ');
    const labelCount = Math.min(5, Math.floor(width / 10)); // Max 5 labels
    
    for (let i = 0; i < labelCount; i++) {
      const position = Math.floor((i / Math.max(labelCount - 1, 1)) * (width - 1));
      const timeOffset = (i / Math.max(labelCount - 1, 1)) * duration;
      const seconds = Math.floor(timeOffset / 1000);
      
      let label;
      if (seconds < 60) {
        label = `${seconds}s`;
      } else if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        label = secs > 0 ? `${mins}m${secs}s` : `${mins}m`;
      } else {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        label = mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
      }
      
      // Position the label
      // Special handling for the last label (rightmost) - right-align it
      if (i === labelCount - 1) {
        // Right-align the last label to prevent overflow
        const startPos = Math.max(0, width - label.length);
        for (let k = 0; k < label.length && startPos + k < width; k++) {
          labels[startPos + k] = label[k];
        }
      } else {
        // Left-align other labels normally
        for (let k = 0; k < label.length && position + k < width; k++) {
          labels[position + k] = label[k];
        }
      }
    }
    
    return labels.join('');
  }

  clear() {
    // Clear screen and move cursor to top
    process.stdout.write('\x1b[2J\x1b[H');
  }
}

module.exports = GraphRenderer;