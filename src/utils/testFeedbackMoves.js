/**
 * Test utility for validating feedback step movement
 * 
 * This file provides a simple test case to validate that feedback steps
 * move correctly with their parent steps.
 */

// Import the operations to test
import { moveStep, addStep } from '../components/WorkflowBuilder/WorkflowOperations';

// Mock workflow with parent steps and feedback loops
const createTestWorkflow = () => {
  return [
    {
      id: 'step1',
      title: 'Step 1',
      stepType: 'Information',
      feedbackLoops: {} // No feedback loops
    },
    {
      id: 'step2',
      title: 'Step 2',
      stepType: 'Approval',
      feedbackLoops: {
        'feedback1': { stepId: 'feedback1_step', title: 'Feedback Loop 1' },
        'feedback2': { stepId: 'feedback2_step', title: 'Feedback Loop 2' }
      }
    },
    {
      id: 'feedback1_step',
      title: 'Feedback 1',
      stepType: 'Upload',
      isFeedbackStep: true,
      feedbackRelationship: {
        parentStepId: 'step2',
        feedbackId: 'feedback1'
      }
    },
    {
      id: 'feedback2_step',
      title: 'Feedback 2',
      stepType: 'Approval',
      isFeedbackStep: true,
      feedbackRelationship: {
        parentStepId: 'step2',
        feedbackId: 'feedback2'
      }
    },
    {
      id: 'step3',
      title: 'Step 3',
      stepType: 'Information',
      feedbackLoops: {} // No feedback loops
    },
    {
      id: 'step4',
      title: 'Step 4',
      stepType: 'Approval',
      feedbackLoops: {
        'feedback3': { stepId: 'feedback3_step', title: 'Feedback Loop 3' }
      }
    },
    {
      id: 'feedback3_step',
      title: 'Feedback 3',
      stepType: 'Information',
      isFeedbackStep: true,
      feedbackRelationship: {
        parentStepId: 'step4',
        feedbackId: 'feedback3'
      }
    }
  ];
};

/**
 * Test moving a parent step down in the workflow
 */
export const testMoveParentStepDown = () => {
  // Create a mock scenarios object
  const scenarios = {
    main: {
      id: 'main',
      name: 'Main Workflow',
      steps: createTestWorkflow()
    }
  };
  
  let updatedScenarios = null;
  
  // Mock setScenarios function
  const setScenarios = (updater) => {
    if (typeof updater === 'function') {
      updatedScenarios = updater(scenarios);
    } else {
      updatedScenarios = updater;
    }
  };
  
  // Test moving step2 (index 1) to position 4 (between step3 and step4)
  moveStep(1, 4, 'main', setScenarios);
  
  // Expected order of IDs after move
  const expectedOrder = ['step1', 'step3', 'step2', 'feedback1_step', 'feedback2_step', 'step4', 'feedback3_step'];
  
  // Actual order of IDs after move
  const actualOrder = updatedScenarios.main.steps.map(step => step.id);
  
  // Check if feedback steps moved with parent
  const success = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
  
  return {
    success,
    expected: expectedOrder,
    actual: actualOrder,
    message: success ? 'Parent step moved down successfully with its feedback children' : 'Failed to move parent step down with its feedback children'
  };
};

/**
 * Test moving a parent step up in the workflow
 */
export const testMoveParentStepUp = () => {
  // Create a mock scenarios object
  const scenarios = {
    main: {
      id: 'main',
      name: 'Main Workflow',
      steps: createTestWorkflow()
    }
  };
  
  let updatedScenarios = null;
  
  // Mock setScenarios function
  const setScenarios = (updater) => {
    if (typeof updater === 'function') {
      updatedScenarios = updater(scenarios);
    } else {
      updatedScenarios = updater;
    }
  };
  
  // Test moving step4 (index 5) to position 0 (before step1)
  moveStep(5, 0, 'main', setScenarios);
  
  // Expected order of IDs after move
  const expectedOrder = ['step4', 'feedback3_step', 'step1', 'step2', 'feedback1_step', 'feedback2_step', 'step3'];
  
  // Actual order of IDs after move
  const actualOrder = updatedScenarios.main.steps.map(step => step.id);
  
  // Check if feedback steps moved with parent
  const success = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
  
  return {
    success,
    expected: expectedOrder,
    actual: actualOrder,
    message: success ? 'Parent step moved up successfully with its feedback children' : 'Failed to move parent step up with its feedback children'
  };
};

/**
 * Test adding a new feedback step to a parent
 */
export const testAddFeedbackStep = () => {
  // Create a mock scenarios object
  const scenarios = {
    main: {
      id: 'main',
      name: 'Main Workflow',
      steps: createTestWorkflow()
    }
  };
  
  let updatedScenarios = null;
  
  // Mock setScenarios function
  const setScenarios = (updater) => {
    if (typeof updater === 'function') {
      updatedScenarios = updater(scenarios);
    } else {
      updatedScenarios = updater;
    }
  };
  
  // New feedback step to add to step2
  const newFeedbackStep = {
    id: 'new_feedback_step',
    title: 'New Feedback',
    stepType: 'Upload',
    isFeedbackStep: true,
    feedbackRelationship: {
      parentStepId: 'step2',
      feedbackId: 'new_feedback'
    }
  };
  
  // Add the new feedback step
  addStep(newFeedbackStep, 'main', setScenarios);
  
  // Expected order of IDs after adding feedback step
  // New feedback should be after the existing feedback steps for step2
  const expectedOrder = [
    'step1', 
    'step2', 
    'feedback1_step', 
    'feedback2_step', 
    'new_feedback_step', // Should be inserted here
    'step3', 
    'step4', 
    'feedback3_step'
  ];
  
  // Actual order of IDs after adding feedback step
  const actualOrder = updatedScenarios.main.steps.map(step => step.id);
  
  // Check if feedback step was added in the right position
  const success = JSON.stringify(actualOrder) === JSON.stringify(expectedOrder);
  
  return {
    success,
    expected: expectedOrder,
    actual: actualOrder,
    message: success ? 'Feedback step added in correct position' : 'Failed to add feedback step in correct position'
  };
};

/**
 * Execute all tests and report results
 */
export const runAllTests = () => {
  const results = {
    moveDown: testMoveParentStepDown(),
    moveUp: testMoveParentStepUp(),
    addFeedback: testAddFeedbackStep()
  };
  
  console.log('Test Results:', results);
  return results;
};
