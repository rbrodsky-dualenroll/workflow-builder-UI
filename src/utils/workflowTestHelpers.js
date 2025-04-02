/**
 * Test utilities for workflow operations
 * This file contains helper functions to test feedback step grouping
 */

/**
 * Creates a test workflow with parent and feedback steps
 * @returns {Array} An array of test workflow steps
 */
export const createTestWorkflow = () => {
  return [
    {
      id: 'step1',
      title: 'Step 1 (Regular)',
      stepType: 'Information'
    },
    {
      id: 'step2',
      title: 'Step 2 (Parent with Feedback)',
      stepType: 'Approval',
      feedbackLoops: {
        'feedback1': { id: 'feedback1', title: 'Feedback Loop 1' },
        'feedback2': { id: 'feedback2', title: 'Feedback Loop 2' }
      }
    },
    {
      id: 'feedback1_step',
      title: 'Feedback Step 1',
      stepType: 'Upload',
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
      isFeedbackStep: true,
      feedbackRelationship: {
        parentStepId: 'step2',
        feedbackId: 'feedback2'
      }
    },
    {
      id: 'step3',
      title: 'Step 3 (Regular)',
      stepType: 'Upload'
    }
  ];
};

/**
 * Test function to check if moving a parent step correctly moves its feedback steps
 * @param {Function} moveStep - The moveStep function to test
 * @returns {Object} Test results
 */
export const testParentMoveWithFeedback = (moveStep) => {
  // Create test workflow
  const workflow = createTestWorkflow();
  
  // Simulate movement of parent step (index 1) to after step 3 (index 4)
  // Original order: [step1, step2, feedback1, feedback2, step3]
  // Expected result: [step1, step3, step2, feedback1, feedback2]
  
  const scenarios = {
    'main': {
      id: 'main',
      name: 'Test Workflow',
      steps: workflow
    }
  };
  
  let result = null;
  
  // Mock setScenarios function
  const setScenarios = (updater) => {
    if (typeof updater === 'function') {
      result = updater(scenarios);
    } else {
      result = updater;
    }
  };
  
  // Move the parent step
  moveStep(1, 4, 'main', setScenarios);
  
  // Check if result is as expected
  const expectedOrder = ['step1', 'step3', 'step2', 'feedback1_step', 'feedback2_step'];
  const actualOrder = result.main.steps.map(step => step.id);
  
  return {
    success: JSON.stringify(expectedOrder) === JSON.stringify(actualOrder),
    expected: expectedOrder,
    actual: actualOrder
  };
};

/**
 * Test function to check if moving a parent step with feedback steps back to original position works
 * @param {Function} moveStep - The moveStep function to test
 * @returns {Object} Test results
 */
export const testParentMoveBack = (moveStep) => {
  // Create a workflow where the parent has already been moved
  const workflow = [
    { id: 'step1', title: 'Step 1 (Regular)', stepType: 'Information' },
    { id: 'step3', title: 'Step 3 (Regular)', stepType: 'Upload' },
    {
      id: 'step2',
      title: 'Step 2 (Parent with Feedback)',
      stepType: 'Approval',
      feedbackLoops: {
        'feedback1': { id: 'feedback1', title: 'Feedback Loop 1' },
        'feedback2': { id: 'feedback2', title: 'Feedback Loop 2' }
      }
    },
    {
      id: 'feedback1_step',
      title: 'Feedback Step 1',
      stepType: 'Upload',
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
      isFeedbackStep: true,
      feedbackRelationship: {
        parentStepId: 'step2',
        feedbackId: 'feedback2'
      }
    }
  ];
  
  const scenarios = {
    'main': {
      id: 'main',
      name: 'Test Workflow',
      steps: workflow
    }
  };
  
  let result = null;
  const setScenarios = (updater) => {
    if (typeof updater === 'function') {
      result = updater(scenarios);
    } else {
      result = updater;
    }
  };
  
  // Move the parent step back to its original position
  // Original order: [step1, step3, step2, feedback1, feedback2]
  // Expected result: [step1, step2, feedback1, feedback2, step3]
  moveStep(2, 1, 'main', setScenarios);
  
  // Check if result is as expected
  const expectedOrder = ['step1', 'step2', 'feedback1_step', 'feedback2_step', 'step3'];
  const actualOrder = result.main.steps.map(step => step.id);
  
  return {
    success: JSON.stringify(expectedOrder) === JSON.stringify(actualOrder),
    expected: expectedOrder,
    actual: actualOrder
  };
};
