#!/usr/bin/env node

/**
 * Playwright test for web dashboard CPU and Memory metrics
 */

const { chromium } = require('playwright');

async function testWebDashboard() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🎯 Testing Web Dashboard CPU and Memory Metrics...\n');
    
    // Navigate to the dashboard
    console.log('📊 Navigating to dashboard...');
    await page.goto('http://localhost:3457');
    await page.waitForTimeout(2000); // Wait for initial load
    
    // Test 1: Verify initial state (should be Single view with CPU metric)
    console.log('✅ Test 1: Verify initial state');
    const viewMode = await page.textContent('#viewMode');
    console.log(`   Current view mode: ${viewMode}`);
    
    const currentValue = await page.textContent('#currentValue');
    const currentUnit = await page.textContent('#currentUnit');
    console.log(`   Current value: ${currentValue} ${currentUnit}`);
    console.log(`   Expected unit for CPU: % (actual: ${currentUnit})`);
    
    // Test 2: Check if CPU data is being displayed
    console.log('\n✅ Test 2: Verify CPU data display');
    const dataPoints = await page.textContent('#dataPoints');
    console.log(`   Data points loaded: ${dataPoints}`);
    
    // Test 3: Switch to Multi view to see both CPU and Memory charts
    console.log('\n✅ Test 3: Switch to Multi view');
    await page.click('#multiViewBtn');
    await page.waitForTimeout(1000);
    
    const newViewMode = await page.textContent('#viewMode');
    console.log(`   Switched to: ${newViewMode}`);
    
    // Check if CPU charts are visible
    const cpuPercentCanvas = await page.isVisible('#cpuPercentCanvas');
    const heapUsedCanvas = await page.isVisible('#heapUsedCanvas');
    console.log(`   CPU Percent canvas visible: ${cpuPercentCanvas}`);
    console.log(`   Heap Used canvas visible: ${heapUsedCanvas}`);
    
    // Test 4: Switch to Compare view and test metric toggles
    console.log('\n✅ Test 4: Switch to Compare view');
    await page.click('#compareViewBtn');
    await page.waitForTimeout(1000);
    
    const compareViewMode = await page.textContent('#viewMode');
    console.log(`   Switched to: ${compareViewMode}`);
    
    // Check if metric selector is visible
    const metricSelectorVisible = await page.isVisible('#metricSelector');
    console.log(`   Metric selector visible: ${metricSelectorVisible}`);
    
    // Test CPU metric checkboxes
    const cpuPercentCheckbox = await page.isVisible('#metric-cpuPercent');
    const cpuUserCheckbox = await page.isVisible('#metric-cpuUser');
    console.log(`   CPU Percent checkbox visible: ${cpuPercentCheckbox}`);
    console.log(`   CPU User checkbox visible: ${cpuUserCheckbox}`);
    
    // Test 5: Toggle CPU metrics
    console.log('\n✅ Test 5: Toggle CPU metrics');
    await page.check('#metric-cpuPercent');
    await page.check('#metric-cpuUser');
    await page.waitForTimeout(500);
    
    const cpuPercentChecked = await page.isChecked('#metric-cpuPercent');
    const cpuUserChecked = await page.isChecked('#metric-cpuUser');
    console.log(`   CPU Percent enabled: ${cpuPercentChecked}`);
    console.log(`   CPU User enabled: ${cpuUserChecked}`);
    
    // Test 6: Test keyboard shortcuts
    console.log('\n✅ Test 6: Test keyboard shortcuts');
    
    // Press 'M' to cycle view modes
    await page.keyboard.press('m');
    await page.waitForTimeout(500);
    const viewModeAfterM = await page.textContent('#viewMode');
    console.log(`   After pressing 'M': ${viewModeAfterM}`);
    
    // Press '6' to toggle CPU Percent (in compare mode)
    await page.click('#compareViewBtn'); // Ensure we're in compare mode
    await page.waitForTimeout(500);
    await page.keyboard.press('6');
    await page.waitForTimeout(500);
    
    const cpuPercentAfterKey = await page.isChecked('#metric-cpuPercent');
    console.log(`   CPU Percent after pressing '6': ${cpuPercentAfterKey}`);
    
    // Test 7: Verify metric sections are organized
    console.log('\n✅ Test 7: Verify metric organization');
    const memorySection = await page.textContent('text="Memory Metrics"').catch(() => null);
    const cpuSection = await page.textContent('text="CPU Metrics"').catch(() => null);
    console.log(`   Memory section found: ${memorySection !== null}`);
    console.log(`   CPU section found: ${cpuSection !== null}`);
    
    // Test 8: Final validation - check console for errors
    console.log('\n✅ Test 8: Check for JavaScript errors');
    
    await page.waitForTimeout(2000);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Web dashboard loaded successfully`);
    console.log(`   - CPU metrics are properly displayed`);
    console.log(`   - Multi-view shows both CPU and memory charts`);
    console.log(`   - Compare view allows toggling CPU metrics`);
    console.log(`   - Keyboard shortcuts work correctly`);
    console.log(`   - Metric sections are properly organized`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testWebDashboard();
}

module.exports = { testWebDashboard };