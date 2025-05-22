/**
 * Puppeteer test runner for Workflow Builder
 * 
 * This file provides a framework for running Puppeteer tests without Jest.
 */
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, '..', 'screenshots');

// Test runner class
export class TestRunner {
  constructor(options = {}) {
    this.options = {
      headless: 'new',
      appUrl: 'http://localhost:5173/workflow-builder-UI/?test=true',
      verbose: true,
      ...options
    };
    
    this.tests = [];
    this.beforeAllFns = [];
    this.afterAllFns = [];
    this.beforeEachFns = [];
    this.afterEachFns = [];
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }
  
  // Add a test
  test(name, fn) {
    this.tests.push({ name, fn, skip: false });
    return this;
  }
  
  // Skip a test
  skip(name, fn) {
    this.tests.push({ name, fn, skip: true });
    return this;
  }
  
  // Before all tests
  beforeAll(fn) {
    this.beforeAllFns.push(fn);
    return this;
  }
  
  // After all tests
  afterAll(fn) {
    this.afterAllFns.push(fn);
    return this;
  }
  
  // Before each test
  beforeEach(fn) {
    this.beforeEachFns.push(fn);
    return this;
  }
  
  // After each test
  afterEach(fn) {
    this.afterEachFns.push(fn);
    return this;
  }
  
  // Assert condition
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || "Assertion failed");
    }
    return true;
  }
  
  // Take a screenshot
  async takeScreenshot(name) {
    if (!this.page) {
      throw new Error("Page not initialized");
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(screenshotsDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    
    if (this.options.verbose) {
      console.log(`📸 Screenshot saved: ${filepath}`);
    }
    
    return filepath;
  }
  
  // Setup browser and page
  async setup() {
    // Create screenshots directory if it doesn't exist
    try {
      await fs.mkdir(screenshotsDir, { recursive: true });
    } catch (err) {
      // Ignore if directory already exists
    }
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to app
    if (this.options.verbose) {
      console.log(`🌐 Navigating to ${this.options.appUrl}`);
    }
    
    await this.page.goto(this.options.appUrl);
    
    // Run beforeAll functions
    for (const fn of this.beforeAllFns) {
      await fn(this.page, this.browser);
    }
  }
  
  // Teardown browser and page
  async teardown() {
    // Run afterAll functions
    for (const fn of this.afterAllFns) {
      await fn(this.page, this.browser);
    }
    
    // Close browser
    if (this.browser) {
      await this.browser.close();
    }
  }
  
  // Run all tests
  async run() {
    console.log(`\n🚀 Starting test run with ${this.tests.length} tests\n`);
    const startTime = Date.now();
    
    try {
      await this.setup();
      
      // Run tests
      for (const test of this.tests) {
        if (test.skip) {
          console.log(`⏭️  SKIPPED: ${test.name}`);
          this.results.skipped++;
          continue;
        }
        
        try {
          // Run beforeEach functions
          for (const fn of this.beforeEachFns) {
            await fn(this.page, this.browser);
          }
          
          // Run test
          console.log(`🧪 Running: ${test.name}`);
          await test.fn(this.page, this.browser, this);
          
          // Test passed
          console.log(`✅ PASSED: ${test.name}`);
          this.results.passed++;
          
          // Run afterEach functions
          for (const fn of this.afterEachFns) {
            await fn(this.page, this.browser);
          }
        } catch (error) {
          // Test failed
          console.error(`❌ FAILED: ${test.name}`);
          console.error(`   ${error.message}`);
          this.results.failed++;
          this.results.errors.push({ name: test.name, error });
          
          // Take screenshot of failure
          try {
            await this.takeScreenshot(`failure-${test.name.replace(/\s+/g, '-').toLowerCase()}`);
          } catch (screenshotErr) {
            console.error(`   Failed to take screenshot: ${screenshotErr.message}`);
          }
          
          // Run afterEach functions
          try {
            for (const fn of this.afterEachFns) {
              await fn(this.page, this.browser);
            }
          } catch (afterEachErr) {
            console.error(`   Failed in afterEach: ${afterEachErr.message}`);
          }
        }
      }
    } catch (setupError) {
      console.error(`❌ Setup failed: ${setupError.message}`);
      this.results.errors.push({ name: 'Setup', error: setupError });
    } finally {
      try {
        await this.teardown();
      } catch (teardownError) {
        console.error(`❌ Teardown failed: ${teardownError.message}`);
        this.results.errors.push({ name: 'Teardown', error: teardownError });
      }
    }
    
    // Print results
    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n📊 Test Results:`);
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(`   Skipped: ${this.results.skipped}`);
    console.log(`   Duration: ${duration.toFixed(2)}s\n`);
    
    // Exit with appropriate code
    if (this.results.failed > 0) {
      process.exit(1);
    }
  }
  
  // Utility functions
  async waitForSelector(selector, options = {}) {
    return this.page.waitForSelector(selector, { timeout: 5000, ...options });
  }
  
  async waitForTestId(testId, options = {}) {
    return this.waitForSelector(`[data-testid="${testId}"]`, options);
  }
  
  async clickByTestId(testId) {
    const element = await this.waitForTestId(testId);
    await element.click();
  }
  
  async typeIntoInput(testId, text) {
    const element = await this.waitForTestId(testId);
    await element.type(text);
  }
  
  async getTextContent(testId) {
    await this.waitForTestId(testId);
    return this.page.$eval(`[data-testid="${testId}"]`, el => el.textContent);
  }
  
  async elementExists(selector) {
    const element = await this.page.$(selector);
    return !!element;
  }
}

// Helper to create a test suite
export function createTestSuite(options = {}) {
  return new TestRunner(options);
}
