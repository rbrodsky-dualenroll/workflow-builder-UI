/**
 * Test Utility for Feedback Step Grouping
 * 
 * This file provides functions to test the feedback step grouping functionality
 * and includes custom data attributes to support automated testing with Puppeteer.
 */

/**
 * Creates test steps for a workflow with parent and feedback steps
 * @returns {Array} An array of test workflow steps
 */
export const createTestWorkflowSteps = () => {
  return [
    {
      id: 'step1',
      title: 'Step 1 (Regular)',
      stepType: 'Information',
      role: 'Student'
    },
    {
      id: 'step2',
      title: 'Step 2 (Parent with Feedback)',
      stepType: 'Approval',
      role: 'College',
      feedbackLoops: {
        'feedback1': { id: 'feedback1', title: 'Feedback Loop 1' },
        'feedback2': { id: 'feedback2', title: 'Feedback Loop 2' }
      }
    },
    {
      id: 'feedback1_step',
      title: 'Feedback Step 1',
      stepType: 'Upload',
      role: 'Student',
      isFeedbackStep: true,
      feedbackRelationship: {
        parentStepId: 'step2',
        feedbackId: 'feedback1'
      }
    },
    {
      id: 'feedback2_step',
      title: 'Feedback Step 2',
      stepType: 'Information',
      role: 'College',
      isFeedbackStep: true,
      feedbackRelationship: {
        parentStepId: 'step2',
        feedbackId: 'feedback2'
      }
    },
    {
      id: 'step3',
      title: 'Step 3 (Regular)',
      stepType: 'Upload',
      role: 'High School'
    }
  ];
};

/**
 * Analyzes a workflow to validate that feedback steps are properly grouped
 * @param {Array} workflow - Array of workflow steps to analyze
 * @returns {Object} Validation results
 */
export const validateFeedbackGrouping = (workflow) => {
  const results = {
    isValid: true,
    errors: [],
    groups: {}
  };
  
  // Identify parent steps with feedback loops
  const parentSteps = workflow.filter(
    step => step.feedbackLoops && Object.keys(step.feedbackLoops).length > 0
  );
  
  // Check each parent step
  parentSteps.forEach(parent => {
    const parentIndex = workflow.findIndex(step => step.id === parent.id);
    
    // Find all feedback steps for this parent
    const feedbackSteps = workflow.filter(
      step => step.isFeedbackStep && 
              step.feedbackRelationship && 
              step.feedbackRelationship.parentStepId === parent.id
    );
    
    // Record this group
    results.groups[parent.id] = {
      parent,
      feedback: feedbackSteps,
      parentIndex
    };
    
    // Check if all feedback steps are immediately after the parent
    feedbackSteps.forEach(feedbackStep => {
      const feedbackIndex = workflow.findIndex(step => step.id === feedbackStep.id);
      
      // Validate that the feedback step is after its parent
      if (feedbackIndex < parentIndex) {
        results.isValid = false;
        results.errors.push(`Feedback step ${feedbackStep.id} appears before its parent ${parent.id}`);
      }
      
      // Validate that there are no non-related steps between parent and feedback
      for (let i = parentIndex + 1; i < feedbackIndex; i++) {
        const intermediateStep = workflow[i];
        if (
          !intermediateStep.isFeedbackStep || 
          intermediateStep.feedbackRelationship.parentStepId !== parent.id
        ) {
          results.isValid = false;
          results.errors.push(
            `Non-related step ${intermediateStep.id} appears between parent ${parent.id} and feedback ${feedbackStep.id}`
          );
        }
      }
    });
  });
  
  return results;
};

/**
 * Logs the current order of steps in a workflow for debugging purposes
 * @param {Array} workflow - Workflow steps to log
 */
export const logWorkflowOrder = (workflow) => {
  console.group('Workflow Order');
  workflow.forEach((step, index) => {
    let stepInfo = `${index + 1}. ${step.id} - ${step.title} (${step.stepType})`;
    if (step.isFeedbackStep) {
      stepInfo += ` [Feedback for: ${step.feedbackRelationship.parentStepId}]`;
    }
    if (step.feedbackLoops && Object.keys(step.feedbackLoops).length > 0) {
      stepInfo += ` [Parent with ${Object.keys(step.feedbackLoops).length} feedback loops]`;
    }
    console.log(stepInfo);
  });
  console.groupEnd();
};

/**
 * Function to be used in pupppeteer tests to check workflow order
 * This runs in the browser context
 */
export const puppeteerCheckWorkflowOrder = () => {
  // Function to run in browser context
  return Array.from(document.querySelectorAll('[data-testid^="workflow-step-"]')).map(el => ({
    id: el.getAttribute('data-step-id'),
    index: parseInt(el.getAttribute('data-index'), 10),
    isFeedback: el.getAttribute('data-is-feedback') === 'true',
    parentId: el.getAttribute('data-parent-id') || null
  }));
};

/**
 * Example of how to set up a simple Puppeteer test to verify feedback grouping
 */
export const puppeteerTestExample = `
// Example puppeteer test for feedback grouping
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000'); // Adjust URL as needed
  
  // Wait for the app to load
  await page.waitForSelector('[data-testid="workflow-steps-container"]');
  
  // Create a test workflow with parent and feedback steps
  // This would use your actual UI interactions to create steps
  
  // Example of dragging a parent step
  const parentStep = await page.$('[data-step-id="step2"]');
  const targetPosition = await page.$('[data-step-id="step3"]');
  
  if (parentStep && targetPosition) {
    // Get bounding boxes
    const parentBox = await parentStep.boundingBox();
    const targetBox = await targetPosition.boundingBox();
    
    // Perform the drag operation
    await page.mouse.move(parentBox.x + parentBox.width/2, parentBox.y + parentBox.height/2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width/2, targetBox.y + targetBox.height/2);
    await page.mouse.up();
    
    // Verify the result
    const workflowOrder = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-testid^="workflow-step-"]')).map(el => ({
        id: el.getAttribute('data-step-id'),
        isFeedback: el.getAttribute('data-is-feedback') === 'true',
        parentId: el.getAttribute('data-parent-id') || null
      }));
    });
    
    console.log('Workflow order after drag:', workflowOrder);
    
    // Check that parent and feedback steps moved together
    // Your validation logic here
  }
  
  await browser.close();
})();
`;
