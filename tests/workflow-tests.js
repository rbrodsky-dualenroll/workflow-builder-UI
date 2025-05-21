/**
 * Workflow Builder Tests
 * 
 * This file contains tests for the Workflow Builder application
 * using our custom test runner instead of Jest.
 */
import { createTestSuite } from './test-runner.js';

// Create a test suite
const runner = createTestSuite({
  appUrl: 'http://localhost:5173',
  verbose: true
});

// Setup
runner.beforeAll(async (page) => {
  console.log('Setting up test environment...');
  
  // Wait for app to load
  await page.waitForSelector('body', { timeout: 5000 });
  
  // Take initial screenshot
  await runner.takeScreenshot('initial-state');
});

// Basic tests
runner.test('Page has correct title', async (page, browser, runner) => {
  const title = await page.title();
  console.log(`Page title: ${title}`);
  runner.assert(title, 'Page should have a title');
});

runner.test('App container exists', async (page, browser, runner) => {
  const appRoot = await page.$('#root');
  runner.assert(appRoot, 'App root element should exist');
});

// Workflow specific tests - uncomment when ready
/*
runner.test('Can add a workflow step', async (page, browser, runner) => {
  // Check if add step button exists
  const addStepExists = await runner.elementExists('[data-testid="add-step-button"]');
  
  if (!addStepExists) {
    console.log('Add step button not found, skipping test');
    return;
  }
  
  // Click add step button
  await runner.clickByTestId('add-step-button');
  
  // Wait for step form
  await runner.waitForTestId('step-form');
  
  // Fill out form
  await runner.typeIntoInput('step-title-input', 'Test Step');
  await page.select('[data-testid="step-type-select"]', 'Approval');
  await page.select('[data-testid="step-role-select"]', 'Student');
  
  // Save step
  await runner.clickByTestId('save-step-button');
  
  // Take screenshot after adding
  await runner.takeScreenshot('after-adding-step');
  
  // Verify step was added
  const stepExists = await page.evaluate(() => {
    const steps = document.querySelectorAll('[data-testid^="workflow-step-"]');
    return Array.from(steps).some(step => 
      step.textContent.includes('Test Step')
    );
  });
  
  runner.assert(stepExists, 'New step should appear in the workflow');
});
*/

// Run all tests
runner.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
