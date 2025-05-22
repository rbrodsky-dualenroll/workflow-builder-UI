// jest-setup.js
require('expect-puppeteer');

// Create screenshots directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Set default timeout for all tests
jest.setTimeout(30000);

// Before each test, log the test name
beforeEach(async () => {
  const testName = expect.getState().currentTestName;
  console.log(`\n🧪 Running test: ${testName}`);
});

// After each test, check for browser console errors
afterEach(async () => {
  const browserLogs = await page.evaluate(() => {
    return {
      errors: window._puppeteerErrors || [],
      warnings: window._puppeteerWarnings || []
    };
  });

  if (browserLogs.errors.length > 0) {
    console.warn('⚠️ Browser console errors:');
    browserLogs.errors.forEach(error => console.error(`  ${error}`));
  }

  // Take screenshot on test failure
  if (expect.getState().assertionCalls !== expect.getState().expectedAssertionsNumber) {
    const testName = expect.getState().currentTestName.replace(/\s+/g, '-').toLowerCase();
    await page.screenshot({ 
      path: `screenshots/failure-${testName}-${Date.now()}.png`,
      fullPage: true 
    });
  }
});

// Add a listener to capture browser console logs
beforeAll(async () => {
  // Inject script to capture console errors
  await page.evaluateOnNewDocument(() => {
    window._puppeteerErrors = [];
    window._puppeteerWarnings = [];
    
    // Override console.error
    const originalError = console.error;
    console.error = (...args) => {
      window._puppeteerErrors.push(args.join(' '));
      originalError.apply(console, args);
    };
    
    // Override console.warn
    const originalWarn = console.warn;
    console.warn = (...args) => {
      window._puppeteerWarnings.push(args.join(' '));
      originalWarn.apply(console, args);
    };
  });
  
  // Navigate to the app 
  await page.goto(global.BASE_URL);
  
  // Wait for app to be fully loaded
  await page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 })
    .catch(() => {
      console.warn('Warning: App container selector not found. Checking alternative selectors...');
      // Try to find the root element as a fallback
      return page.waitForSelector('#root', { timeout: 5000 })
        .catch(() => console.warn('Warning: Root element not found either. Tests may fail.'));
    });
});
