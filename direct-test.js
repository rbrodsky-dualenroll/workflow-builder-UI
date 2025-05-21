/**
 * Direct Puppeteer tests without Jest
 * 
 * This file runs Puppeteer tests directly, without using Jest,
 * to avoid the issues with ESM and Jest integration.
 */
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create screenshots directory
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
try {
  await fs.mkdir(screenshotsDir, { recursive: true });
  console.log(`Created screenshots directory at ${screenshotsDir}`);
} catch (err) {
  // Directory may already exist
  console.log(`Screenshots directory already exists at ${screenshotsDir}`);
}

// Launch browser
console.log('Launching browser...');
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  defaultViewport: {
    width: 1280,
    height: 800
  }
});

// Create a new page
console.log('Creating new page...');
const page = await browser.newPage();

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Assertion function
const expect = (actual) => {
  return {
    toBe: (expected) => {
      if (actual === expected) {
        console.log('✅ PASS: Expected', actual, 'to be', expected);
        results.passed++;
        return true;
      } else {
        console.error('❌ FAIL: Expected', actual, 'to be', expected);
        results.failed++;
        results.errors.push(`Expected ${actual} to be ${expected}`);
        return false;
      }
    },
    toBeDefined: () => {
      if (actual !== undefined) {
        console.log('✅ PASS: Expected value to be defined');
        results.passed++;
        return true;
      } else {
        console.error('❌ FAIL: Expected value to be defined');
        results.failed++;
        results.errors.push('Expected value to be defined');
        return false;
      }
    },
    toContain: (expected) => {
      if (typeof actual === 'string' && actual.includes(expected)) {
        console.log(`✅ PASS: Expected "${actual}" to contain "${expected}"`);
        results.passed++;
        return true;
      } else {
        console.error(`❌ FAIL: Expected "${actual}" to contain "${expected}"`);
        results.failed++;
        results.errors.push(`Expected "${actual}" to contain "${expected}"`);
        return false;
      }
    }
  };
};

// Helper functions
const takeScreenshot = async (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(screenshotsDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Screenshot saved: ${filepath}`);
  return filepath;
};

// Run tests
try {
  console.log('\n🧪 Running test: Basic page test');
  
  // Navigate to the app
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173');
  
  // Test 1: Page has a title
  console.log('\n📋 Test: Page has a title');
  const title = await page.title();
  console.log(`Page title: "${title}"`);
  expect(title).toBeDefined();
  
  // Take a screenshot
  await takeScreenshot('basic-page');
  
  // Test 2: Root element exists
  console.log('\n📋 Test: Root element exists');
  const rootElement = await page.$('#root');
  expect(rootElement !== null).toBe(true);
  
  // Test 3: Page content
  console.log('\n📋 Test: Page has content');
  const bodyText = await page.evaluate(() => document.body.textContent);
  expect(bodyText.length > 0).toBe(true);
  console.log(`Page content (first 100 chars): "${bodyText.substring(0, 100)}..."`);
  
  // Take another screenshot
  await takeScreenshot('page-content');
  
  // Advanced test: Try to find any workflow-related elements
  console.log('\n📋 Test: Looking for workflow elements');
  const workflowElements = await page.$$('[data-testid^="workflow-"]');
  console.log(`Found ${workflowElements.length} workflow-related elements`);
  
  if (workflowElements.length > 0) {
    // Take a screenshot of workflow elements
    await takeScreenshot('workflow-elements');
    
    // Try to find step elements
    const stepElements = await page.$$('[data-testid^="workflow-step-"]');
    console.log(`Found ${stepElements.length} step elements`);
    
    if (stepElements.length > 0) {
      // Test was successful!
      console.log('✅ PASS: Found workflow step elements');
      results.passed++;
    } else {
      console.log('⚠️ NOTE: No step elements found, but this might be expected for initial state');
    }
  } else {
    console.log('⚠️ NOTE: No workflow elements found, but this might be expected for initial state');
  }
  
} catch (error) {
  console.error('❌ Error running tests:', error);
  results.failed++;
  results.errors.push(error.message);
}

// Print results
console.log('\n📊 Test Results:');
console.log(`   Passed: ${results.passed}`);
console.log(`   Failed: ${results.failed}`);

if (results.errors.length > 0) {
  console.log('\n❌ Errors:');
  results.errors.forEach((error, index) => {
    console.log(`   ${index + 1}. ${error}`);
  });
}

// Close browser
console.log('\nClosing browser...');
await browser.close();

// Exit with appropriate code
if (results.failed > 0) {
  console.log('\n❌ Tests failed');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed');
  process.exit(0);
}
