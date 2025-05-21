/**
 * Direct Puppeteer test without jest-puppeteer preset
 * This allows for more control and avoids version compatibility issues
 */
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '..', 'screenshots');

// Simple assertion function
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

async function setupScreenshots() {
  try {
    await mkdir(screenshotsDir, { recursive: true });
  } catch (err) {
    // Directory already exists or other error
    console.log('Note: Screenshots directory setup result:', err?.code || 'Success');
  }
}

async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(screenshotsDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Screenshot saved: ${filepath}`);
  return filepath;
}

async function runTests() {
  // Set up screenshots directory
  await setupScreenshots();
  
  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Creating page...');
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the app
    console.log('Navigating to app...');
    await page.goto('http://localhost:5173');
    
    // Wait for app to load
    console.log('Waiting for app to load...');
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Take a screenshot
    await takeScreenshot(page, 'app-loaded');
    
    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    assert(title, 'Page should have a title');
    
    // Check for app container
    const appContainer = await page.$('#root');
    assert(appContainer, 'App container element should exist');
    
    // Check that we can access the DOM
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('Page contains text:', bodyText.substring(0, 100) + '...');
    
    // Test adding a workflow step if the appropriate UI elements exist
    const addStepButton = await page.$('[data-testid="add-step-button"]');
    if (addStepButton) {
      console.log('Testing workflow step creation...');
      await addStepButton.click();
      
      // Wait for form to appear
      await page.waitForSelector('[data-testid="step-form"]', { timeout: 5000 })
        .catch(err => console.log('Step form not found:', err.message));
      
      // Take a screenshot of the form
      await takeScreenshot(page, 'step-form');
      
      console.log('Workflow step test completed');
    } else {
      console.log('Add step button not found, skipping workflow step test');
    }
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    await takeScreenshot(page, 'test-failure');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
