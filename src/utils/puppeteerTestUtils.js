/**
 * Puppeteer Test Utilities
 * 
 * This file contains functions to help test the workflow builder with Puppeteer.
 * It provides helpers for creating test workflows, simulating drag and drop,
 * and validating the results.
 */

/**
 * Creates a test workflow with parent steps and feedback children
 * @returns {Array} Test workflow steps
 */
export const createTestWorkflow = () => {
  return [
    {
      id: 'step1',
      title: 'Step 1',
      stepType: 'Information',
      role: 'Student'
    },
    {
      id: 'step2',
      title: 'Parent Step with Feedback',
      stepType: 'Approval',
      role: 'College',
      feedbackLoops: {
        'feedback1': { 
          id: 'feedback1', 
          title: 'Feedback Loop 1'
        },
        'feedback2': { 
          id: 'feedback2', 
          title: 'Feedback Loop 2'
        }
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
      role: 'Student',
      isFeedbackStep: true,
      feedbackRelationship: {
        parentStepId: 'step2',
        feedbackId: 'feedback2'
      }
    },
    {
      id: 'step3',
      title: 'Step 3',
      stepType: 'Upload',
      role: 'College'
    }
  ];
};

/**
 * Puppeteer helper to validate the workflow step order
 * @param {Object} page - Puppeteer page object
 * @returns {Array} - Array of step IDs in order
 */
export const getWorkflowStepOrder = async (page) => {
  return page.evaluate(() => {
    const steps = document.querySelectorAll('[data-testid^="workflow-step-"]');
    return Array.from(steps).map(step => step.getAttribute('data-step-id'));
  });
};

/**
 * Puppeteer helper to simulate dragging a step to a new position
 * @param {Object} page - Puppeteer page object
 * @param {string} sourceStepId - ID of the step to drag
 * @param {string} targetStepId - ID of the step to drop onto
 * @param {boolean} placeAfter - Whether to place after the target (true) or before (false)
 */
export const dragStepToPosition = async (page, sourceStepId, targetStepId, placeAfter = true) => {
  // Get the elements
  const sourceStep = await page.$(`[data-testid="workflow-step-${sourceStepId}"]`);
  const targetStep = await page.$(`[data-testid="workflow-step-${targetStepId}"]`);
  
  if (!sourceStep || !targetStep) {
    throw new Error(`Could not find steps: sourceId=${sourceStepId}, targetId=${targetStepId}`);
  }
  
  // Get element positions
  const sourceBoundingBox = await sourceStep.boundingBox();
  const targetBoundingBox = await targetStep.boundingBox();
  
  // Calculate drag positions
  const sourceX = sourceBoundingBox.x + sourceBoundingBox.width / 2;
  const sourceY = sourceBoundingBox.y + sourceBoundingBox.height / 2;
  
  const targetX = targetBoundingBox.x + targetBoundingBox.width / 2;
  let targetY = targetBoundingBox.y;
  
  // If placing after the target, aim for the bottom of the target step
  if (placeAfter) {
    targetY += targetBoundingBox.height;
  }
  
  // Perform the drag operation
  await page.mouse.move(sourceX, sourceY);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 10 }); // Move in steps for smoother drag
  await page.mouse.up();
  
  // Give the UI time to update
  await page.waitForTimeout(500);
};

/**
 * Puppeteer helper to check if steps have the correct parent-child relationship
 * @param {Object} page - Puppeteer page object
 * @returns {Object} - Object with validation results
 */
export const validateFeedbackRelationships = async (page) => {
  return page.evaluate(() => {
    // Get all step elements
    const steps = document.querySelectorAll('[data-testid^="workflow-step-"]');
    const stepArray = Array.from(steps);
    
    const validationResults = {
      feedbackStepsCount: 0,
      parentsWithFeedback: 0,
      groupedCorrectly: true,
      issues: []
    };
    
    // Find all feedback steps
    const feedbackSteps = stepArray.filter(step => 
      step.getAttribute('data-is-feedback') === 'true'
    );
    
    validationResults.feedbackStepsCount = feedbackSteps.length;
    
    // Check each feedback step
    for (const feedbackStep of feedbackSteps) {
      const parentId = feedbackStep.getAttribute('data-parent-id');
      const parentStep = document.querySelector(`[data-testid="workflow-step-${parentId}"]`);
      
      if (!parentStep) {
        validationResults.groupedCorrectly = false;
        validationResults.issues.push(`Could not find parent with ID ${parentId}`);
        continue;
      }
      
      // Get the indices to check if they're adjacent
      const parentIndex = stepArray.indexOf(parentStep);
      const feedbackIndex = stepArray.indexOf(feedbackStep);
      
      // Check if the feedback step is immediately after the parent
      // or immediately after another feedback step with the same parent
      let isCorrectlyPlaced = false;
      
      if (feedbackIndex === parentIndex + 1) {
        isCorrectlyPlaced = true;
      } else if (feedbackIndex > parentIndex) {
        // Check if all steps between parent and this feedback are also feedback steps
        // for the same parent
        isCorrectlyPlaced = true;
        for (let i = parentIndex + 1; i < feedbackIndex; i++) {
          const intermediateStep = stepArray[i];
          if (
            intermediateStep.getAttribute('data-is-feedback') !== 'true' ||
            intermediateStep.getAttribute('data-parent-id') !== parentId
          ) {
            isCorrectlyPlaced = false;
            break;
          }
        }
      }
      
      if (!isCorrectlyPlaced) {
        validationResults.groupedCorrectly = false;
        validationResults.issues.push(
          `Feedback step ${feedbackStep.getAttribute('data-step-id')} is not correctly placed with parent ${parentId}`
        );
      }
    }
    
    // Find all parent steps with feedback
    const parentSteps = stepArray.filter(step => {
      const stepId = step.getAttribute('data-step-id');
      return feedbackSteps.some(fs => fs.getAttribute('data-parent-id') === stepId);
    });
    
    validationResults.parentsWithFeedback = parentSteps.length;
    
    return validationResults;
  });
};

/**
 * Creates a test scenario in the browser
 * @param {Object} page - Puppeteer page object
 * @param {Array} steps - Array of step objects
 */
export const setupTestWorkflow = async (page, steps = null) => {
  if (!steps) {
    steps = createTestWorkflow();
  }
  
  // Use the browser context to set up the workflow
  await page.evaluate((workflowSteps) => {
    // Assume we have a global workflow state we can modify for testing
    if (window.testWorkflowState) {
      window.testWorkflowState.scenarios = {
        main: {
          id: 'main',
          name: 'Test Workflow',
          steps: workflowSteps
        }
      };
      
      // Trigger any necessary UI updates
      if (typeof window.testWorkflowState.updateUI === 'function') {
        window.testWorkflowState.updateUI();
      }
    }
  }, steps);
};

/**
 * Helper to log the current workflow state to the console
 * Useful for debugging
 * @param {Object} page - Puppeteer page object
 */
export const logWorkflowState = async (page) => {
  const stepOrder = await getWorkflowStepOrder(page);
  console.log('Current workflow step order:', stepOrder);
  
  const relationships = await validateFeedbackRelationships(page);
  console.log('Feedback relationship validation:', relationships);

  const idConsistency = await validateParentChildIDs(page);
  console.log('Parent-child ID consistency validation:', idConsistency);
};

/**
 * Validate parent-child ID consistency to identify potential issues
 * @param {Object} page - Puppeteer page object
 * @returns {Object} - Validation results
 */
export const validateParentChildIDs = async (page) => {
  return page.evaluate(() => {
    const allSteps = Array.from(document.querySelectorAll('[data-testid^="workflow-step-"]'));
    const issues = [];
    
    // Find all feedback steps
    const feedbackSteps = allSteps.filter(step => step.getAttribute('data-is-feedback') === 'true');
    
    // Track all parent IDs and their corresponding feedback steps
    const parentMap = {};
    
    feedbackSteps.forEach(feedbackStep => {
      const feedbackId = feedbackStep.getAttribute('data-step-id');
      const parentId = feedbackStep.getAttribute('data-parent-id');
      
      if (!parentId) {
        issues.push(`Feedback step ${feedbackId} is missing a parent ID`);
        return;
      }
      
      // Check if parent exists
      const parentStep = allSteps.find(step => step.getAttribute('data-step-id') === parentId);
      
      if (!parentStep) {
        issues.push(`Feedback step ${feedbackId} references non-existent parent ${parentId}`);
        return;
      }
      
      // Track this feedback step under its parent
      if (!parentMap[parentId]) {
        parentMap[parentId] = [];
      }
      parentMap[parentId].push(feedbackId);
    });
    
    return {
      valid: issues.length === 0,
      issues,
      parentMap, // Map of parent IDs to their child feedback step IDs
      stats: {
        totalFeedbackSteps: feedbackSteps.length,
        uniqueParents: Object.keys(parentMap).length
      }
    };
  });
};
