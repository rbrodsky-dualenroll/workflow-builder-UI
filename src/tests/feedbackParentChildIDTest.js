/**
 * Test script to verify parent-child ID consistency
 * 
 * This script specifically tests:
 * 1. That parent IDs are properly maintained when steps are moved
 * 2. That parent IDs are preserved when steps are updated
 */

import puppeteer from 'puppeteer';
import { 
  createTestWorkflow, 
  setupTestWorkflow,
  dragStepToPosition,
  validateParentChildIDs,
  logWorkflowState
} from '../utils/puppeteerTestUtils.js';

// Test configuration
const config = {
  baseUrl: 'http://localhost:5173', // Updated to match actual dev server port
  headless: false,
  slowMo: 100,
  testTimeoutMs: 60000,
};

/**
 * Main test function for feedback parent-child ID consistency
 */
async function testFeedbackParentChildIDs() {
  const browser = await puppeteer.launch({ 
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  let testPassed = true;
  const testResults = {
    initialState: null,
    afterMove: null,
    afterEdit: null
  };
  
  try {
    const page = await browser.newPage();
    await page.goto(config.baseUrl);
    
    console.log('Setting up test workflow...');
    await setupTestWorkflow(page);
    
    // Get initial workflow state - validate parent-child IDs
    console.log('\n=== INITIAL STATE TEST ===');
    testResults.initialState = await validateParentChildIDs(page);
    console.log('Initial parent-child ID validation:', testResults.initialState);
    
    if (!testResults.initialState.valid) {
      console.error('❌ FAIL: Initial state has parent-child ID issues');
      testPassed = false;
    } else {
      console.log('✅ PASS: Initial state has valid parent-child IDs');
    }
    
    // Test 1: Move parent step down and verify IDs remain consistent
    console.log('\n=== MOVE PARENT STEP TEST ===');
    console.log('Moving parent step (step2) after step3...');
    await dragStepToPosition(page, 'step2', 'step3', true);
    
    // Check ID consistency after move
    testResults.afterMove = await validateParentChildIDs(page);
    console.log('Parent-child ID validation after move:', testResults.afterMove);
    
    if (!testResults.afterMove.valid) {
      console.error('❌ FAIL: After move state has parent-child ID issues');
      testPassed = false;
    } else {
      console.log('✅ PASS: After move state has valid parent-child IDs');
    }
    
    // Test 2: Edit the parent step title and verify relationships
    console.log('\n=== EDIT PARENT STEP TEST ===');
    
    // Find and click the edit button for step2
    await page.click('[data-action="edit-step"]');
    await page.waitForSelector('[data-testid="field-title"]');
    
    // Change the title
    await page.evaluate(() => {
      document.querySelector('[data-testid="field-title"]').value = '';
    });
    await page.type('[data-testid="field-title"]', 'Updated Parent Step');
    
    // Save the form
    await page.click('[data-testid="modal-save-button"]');
    
    // Check ID consistency after edit
    await page.waitForTimeout(500); // Give UI time to update
    testResults.afterEdit = await validateParentChildIDs(page);
    console.log('Parent-child ID validation after edit:', testResults.afterEdit);
    
    if (!testResults.afterEdit.valid) {
      console.error('❌ FAIL: After edit state has parent-child ID issues');
      testPassed = false;
    } else {
      console.log('✅ PASS: After edit state has valid parent-child IDs');
    }
    
    // Final state summary
    console.log('\n=== FINAL WORKFLOW STATE ===');
    await logWorkflowState(page);
    
    // Log test completion
    if (testPassed) {
      console.log('\n✅ All tests PASSED!');
    } else {
      console.log('\n❌ Some tests FAILED!');
    }
    
  } catch (error) {
    console.error('Test error:', error);
    testPassed = false;
  } finally {
    await browser.close();
    return testPassed;
  }
}

// Run the test
testFeedbackParentChildIDs()
  .then(passed => {
    console.log('Test script completed with result:', passed ? 'PASS' : 'FAIL');
    process.exit(passed ? 0 : 1);
  })
  .catch(err => {
    console.error('Test script failed with error:', err);
    process.exit(1);
  });
