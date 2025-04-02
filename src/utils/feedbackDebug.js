/**
 * Debug utilities for feedback loop grouping
 * 
 * This file provides helper functions to debug and validate
 * the feedback step grouping functionality.
 */

/**
 * Log the structure of a workflow, highlighting parent-child relationships
 * @param {Array} steps - The workflow steps to analyze
 */
export const logWorkflowStructure = (steps) => {
  console.group('Workflow Structure:');
  
  // Track which steps are feedback children
  const feedbackSteps = new Set();
  
  // First pass - identify all feedback steps
  steps.forEach(step => {
    if (step.isFeedbackStep && step.feedbackRelationship) {
      feedbackSteps.add(step.id);
    }
  });
  
  // Second pass - log the structure with proper indentation
  steps.forEach((step, index) => {
    if (feedbackSteps.has(step.id)) {
      // This is a feedback step - find its parent
      const parentId = step.feedbackRelationship?.parentStepId;
      console.log(
        `  └─ %c[${index}] ${step.id} (Feedback Child of ${parentId})%c - ${step.title}`,
        'color: #6366f1; font-weight: bold;',
        'color: inherit;'
      );
    } else if (step.feedbackLoops && Object.keys(step.feedbackLoops).length > 0) {
      // This is a parent step with feedback loops
      console.log(
        `%c[${index}] ${step.id}%c - ${step.title} (Parent with ${Object.keys(step.feedbackLoops).length} feedback loops)`,
        'color: #2563eb; font-weight: bold;',
        'color: inherit;'
      );
    } else {
      // Regular step
      console.log(`[${index}] ${step.id} - ${step.title}`);
    }
  });
  
  console.groupEnd();
};

/**
 * Check if all feedback steps are positioned correctly after their parent steps
 * @param {Array} steps - The workflow steps to validate
 * @returns {Object} Validation results
 */
export const validateFeedbackGrouping = (steps) => {
  const issues = [];
  
  // Create a map of parent steps to their indices
  const parentIndices = {};
  steps.forEach((step, index) => {
    parentIndices[step.id] = index;
  });
  
  // Check each feedback step
  steps.forEach((step, index) => {
    if (step.isFeedbackStep && step.feedbackRelationship) {
      const parentId = step.feedbackRelationship.parentStepId;
      const parentIndex = parentIndices[parentId];
      
      // Skip if parent doesn't exist in the workflow
      if (parentIndex === undefined) {
        issues.push({
          stepId: step.id,
          issue: `Parent step ${parentId} not found in workflow`
        });
        return;
      }
      
      // Check if this feedback step comes after its parent
      if (index <= parentIndex) {
        issues.push({
          stepId: step.id,
          issue: `Feedback step at index ${index} appears before its parent at index ${parentIndex}`
        });
      }
      
      // Check if there are any non-feedback steps for this parent between parent and this step
      for (let i = parentIndex + 1; i < index; i++) {
        const intermediateStep = steps[i];
        if (!intermediateStep.isFeedbackStep || 
            !intermediateStep.feedbackRelationship || 
            intermediateStep.feedbackRelationship.parentStepId !== parentId) {
          // Found a step that isn't a feedback step for this parent
          if (!intermediateStep.isFeedbackStep) {
            issues.push({
              stepId: step.id,
              issue: `Non-feedback step ${intermediateStep.id} appears between parent and feedback step`
            });
          } else {
            issues.push({
              stepId: step.id,
              issue: `Feedback step for different parent (${intermediateStep.feedbackRelationship?.parentStepId}) appears between parent and feedback step`
            });
          }
          break;
        }
      }
    }
  });
  
  const valid = issues.length === 0;
  
  return {
    valid,
    issues,
    message: valid ? 'All feedback steps are correctly grouped with their parents' : 
      `Found ${issues.length} grouping issues`
  };
};

/**
 * Add debug functions to window for console access
 */
export const setupDebugTools = (scenarioGetter) => {
  window.debugFeedbackGrouping = {
    // Log the structure of the current workflow
    logStructure: () => {
      const activeScenario = scenarioGetter();
      if (activeScenario && activeScenario.steps) {
        logWorkflowStructure(activeScenario.steps);
      } else {
        console.error('No active workflow available');
      }
    },
    
    // Validate the current workflow
    validate: () => {
      const activeScenario = scenarioGetter();
      if (activeScenario && activeScenario.steps) {
        const result = validateFeedbackGrouping(activeScenario.steps);
        console.log(`Validation ${result.valid ? 'passed ✅' : 'failed ❌'}`);
        if (!result.valid) {
          console.log('Issues:', result.issues);
        }
        return result;
      } else {
        console.error('No active workflow available');
        return null;
      }
    }
  };
  
  console.log(
    '%cFeedback Grouping Debug Tools Available',
    'color: #2563eb; font-weight: bold;'
  );
  console.log(
    'Usage:\n' +
    '- window.debugFeedbackGrouping.logStructure() - Log the structure of the current workflow\n' +
    '- window.debugFeedbackGrouping.validate() - Check if feedback steps are correctly grouped'
  );
};
