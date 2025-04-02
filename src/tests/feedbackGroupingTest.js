/**
 * Puppeteer test for feedback step grouping functionality
 * 
 * This script tests:
 * 1. Parent steps move together with their feedback children
 * 2. Feedback steps cannot be dragged independently
 * 3. Moving a parent maintains the order of its feedback children
 */

import puppeteer from 'puppeteer';
import { 
  createTestWorkflow, 
  getWorkflowStepOrder, 
  dragStepToPosition,
  validateFeedbackRelationships,
  setupTestWorkflow,
  logWorkflowState
} from '../utils/puppeteerTestUtils.js';

// Test configuration
const config = {
  baseUrl: 'http://localhost:5173', // Updated to match dev server port
  headless: false, // Set to true for CI environments
  slowMo: 100, // Slow down operations to make them visible during testing
  testTimeoutMs: 60000, // 60 seconds
};

/**
 * Main test function for feedback step grouping
 */
async function testFeedbackStepGrouping() {
  const browser = await puppeteer.launch({ 
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  try {
    const page = await browser.newPage();
    await page.goto(config.baseUrl);
    
    console.log('Setting up test workflow...');
    await setupTestWorkflow(page);
    
    // Get initial workflow state
    console.log('Initial workflow state:');
    const initialOrder = await getWorkflowStepOrder(page);
    console.log('Initial step order:', initialOrder);
    
    // Test 1: Move parent step down
    console.log('\nTest 1: Moving parent step (step2) after step3...');
    await dragStepToPosition(page, 'step2', 'step3', true);
    
    const afterMoveDownOrder = await getWorkflowStepOrder(page);
    console.log('Step order after moving down:', afterMoveDownOrder);
    
    // Verify parent and feedback children moved together
    const downMoveRelationships = await validateFeedbackRelationships(page);
    console.log('Relationship validation after moving down:', downMoveRelationships);
    
    // Test 2: Move parent step back up
    console.log('\nTest 2: Moving parent step (step2) before step1...');
    await dragStepToPosition(page, 'step2', 'step1', false);
    
    const afterMoveUpOrder = await getWorkflowStepOrder(page);
    console.log('Step order after moving up:', afterMoveUpOrder);
    
    // Verify parent and feedback children moved together
    const upMoveRelationships = await validateFeedbackRelationships(page);
    console.log('Relationship validation after moving up:', upMoveRelationships);
    
    // Test 3: Try to move a feedback step
    console.log('\nTest 3: Attempting to move a feedback step (should not be possible)...');
    
    // Try to drag a feedback step
    try {
      await dragStepToPosition(page, 'feedback1_step', 'step3', false);
      
      // Check if the order changed (it shouldn't)
      const afterFeedbackDragOrder = await getWorkflowStepOrder(page);
      const didFeedbackMove = JSON.stringify(afterFeedbackDragOrder) !== JSON.stringify(afterMoveUpOrder);
      
      console.log('Did feedback step move:', didFeedbackMove);
      console.log('Step order after trying to move feedback:', afterFeedbackDragOrder);
      
      if (didFeedbackMove) {
        console.error('ERROR: Feedback step moved independently, should have been prevented!');
      } else {
        console.log('SUCCESS: Feedback step did not move independently as expected.');
      }
    } catch (error) {
      console.log('Could not attempt to move feedback step:', error.message);
    }
    
    // Test 4: Add a new feedback step
    console.log('\nTest 4: Adding a new feedback step to parent...');
    
    // Simulate adding a new feedback step via browser API
    await page.evaluate(() => {
      if (window.testWorkflowState) {
        const newFeedbackStep = {
          id: 'new_feedback_step',
          title: 'New Feedback Step',
          stepType: 'Information',
          role: 'Student',
          isFeedbackStep: true,
          feedbackRelationship: {
            parentStepId: 'step2',
            feedbackId: 'new_feedback'
          }
        };
        
        // Add to steps array (in a real app, would use proper workflow operations)
        window.testWorkflowState.scenarios.main.steps.push(newFeedbackStep);
        
        // Update UI
        if (typeof window.testWorkflowState.updateUI === 'function') {
          window.testWorkflowState.updateUI();
        }
      }
    });
    
    // Check if the new feedback step is correctly positioned
    const afterAddingFeedbackOrder = await getWorkflowStepOrder(page);
    console.log('Step order after adding feedback:', afterAddingFeedbackOrder);
    
    const addFeedbackRelationships = await validateFeedbackRelationships(page);
    console.log('Relationship validation after adding feedback:', addFeedbackRelationships);
    
    // Final state summary
    console.log('\nFinal workflow state:');
    await logWorkflowState(page);
    
    // Log test completion
    console.log('\nAll tests completed!');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testFeedbackStepGrouping()
  .then(() => console.log('Test script completed'))
  .catch(err => console.error('Test script failed:', err));
