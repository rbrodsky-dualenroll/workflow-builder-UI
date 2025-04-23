import { snakeCase } from './utils';
import { getCompletionState, getCompletionStateValues } from './getCompletionState';

/**
 * Get the soft required fields for a step
 * @param {Object} step - Step data from the workflow
 * @param {number} index - The step index
 * @param {Array} allSteps - All steps in the workflow category
 * @returns {string} - Comma-separated list of soft required fields
 */
const getSoftRequiredFields = (step, index, allSteps) => {
  // Special handling for Registration Failure and Successful Registration steps
  // These steps should use their own soft_required_fields directly
  if (step.stepType === 'Registration Failure' || step.stepType === 'Successful Registration') {
    // For these special steps, just use the soft_required_fields directly from the step
    // Don't apply the standard dependency logic
    if (step.soft_required_fields) {
      return step.soft_required_fields.join(', ');
    }
    return '';
  }

  const fields = [];

  // Special handling for ReviewFailedRegistration
  if (step.stepType === "ReviewFailedRegistration"){
    fields.push('registration_response_no')
    return fields.map(field => `'${field}'`).join(', ');
  }
  
  // Special handling for feedback steps
  if (step.isFeedbackStep && step.feedbackRelationship) {
    // Find the parent step
    const parentStepId = step.feedbackRelationship.parentStepId;
    const parentStep = allSteps.find(s => s.id === parentStepId);
    
    if (parentStep) {
      // For feedback steps, depend on the parent step's completion state + role-specific suffix
      const parentCompletionState = getCompletionState(parentStep);
      const roleSpecificSuffix = step.role && step.role.toLowerCase() === 'student' ? 'student_more_info' : 
                                (step.role && step.role.toLowerCase() === 'parent' ? 'parent_more_info' :
                                (step.role && (step.role.toLowerCase() === 'high school' || step.role.toLowerCase() === 'counselor') ? 'hs_more_info' : 
                                (step.role && step.role.toLowerCase() === 'approver' ? 'approver_more_info' : 'more_info')));

      // This follows the pattern: parent_completion_state_role_more_info
      // Example: college_approval_student_more_info
      const feedbackTriggerState = `${parentCompletionState}_${roleSpecificSuffix}`;
      fields.push(feedbackTriggerState);
      return fields.map(field => `'${field}'`).join(', ');
    }
  }
  
  // System steps like CompleteRegistrationStep have special handling
  if (step.stepType === 'system' || step.stepClass === 'CompleteRegistrationStep') {
    // System steps that complete the flow often depend on a specific condition
    if (step.title && step.title.toLowerCase().includes('complete') || 
        step.name && step.name.toLowerCase().includes('complete')) {
      fields.push('registration_response_yes');
      return fields.map(field => `'${field}'`).join(', ');
    }
  }
  
  // For non-first steps, we need to determine dependencies
  // For scenario-specific steps, always add the scenario condition
  if (step.scenarioId && step.scenarioId !== 'main' && step.scenarioCondition) {
    fields.push(snakeCase(step.scenarioCondition));
  }
  
  // If the step has explicit workflowCondition fields, add those
  if (step.conditional && step.workflowCondition && step.workflowCondition.length > 0) {
    step.workflowCondition.forEach(condition => {
      fields.push(snakeCase(condition));
    });
  }
  
  // Get the previous step to create a dependency
  // If the previous step is scenario-specific and this one isn't, go back to the most recent non-scenario condition
  let previousStep = allSteps[index - 1];
  if (previousStep && previousStep.scenarioId && previousStep.scenarioId !== step.scenarioId) {
    // Find the most recent step with a matching scenario or matching lack of scenario
    // the main scenarios will just not have any scenarioId
    let matchingStepFound = false;
    let tempIndex = index - 1;
    while(!matchingStepFound && tempIndex > 0) {
      const currentStep = allSteps[tempIndex];
      if (currentStep.scenarioId && currentStep.scenarioId !== step.scenarioId) {
        tempIndex--;
      } else {
        matchingStepFound = true;
        previousStep = currentStep;
      }
    }
  }
  
  // Similar problem if the previous step is feedback step, gotta go back
  if (previousStep && previousStep.isFeedbackStep && previousStep.feedbackRelationship) {
    let matchingStepFound = false;
    let tempIndex = index - 1;
    while(!matchingStepFound && tempIndex > 0) {
      const currentStep = allSteps[tempIndex];
      if (currentStep.isFeedbackStep && currentStep.feedbackRelationship) {
        tempIndex--;
      } else if (currentStep.scenarioId && currentStep.scenarioId !== step.scenarioId) {
        tempIndex--;
      } else {
        matchingStepFound = true;
        previousStep = currentStep;
      }
    }
  }

  // Handle step dependencies based on the previous step
  if (previousStep) {
    // If the previous step is a system step with a completion_state parameter, use that
    if (previousStep.parameters && previousStep.parameters.completion_state) {
      fields.push(previousStep.parameters.completion_state);
    } else {
      // Get the previous step's completion state values
      const previousStepCompletionStates = getCompletionStateValues(previousStep);
      
      // Use the most appropriate completion state for dependency
      // For approval steps, we want to depend on the 'yes' state
      // For upload steps, we want to depend on the 'complete' state
      if (previousStep.stepType === 'Approval' && previousStep.title === 'Parent Consent') {
        fields.push('parent_consent_provided');
      } else if (previousStep.stepType === 'Approval' && previousStepCompletionStates.includes(`${getCompletionState(previousStep)}_yes`)) {
        fields.push(`${getCompletionState(previousStep)}_yes`);
      } else if (previousStep.stepType === 'Upload' && previousStepCompletionStates.includes(`${getCompletionState(previousStep)}_complete`)) {
        fields.push(`${getCompletionState(previousStep)}_complete`);
      } else if (previousStep.stepType === 'CheckHolds') {
        // For CheckHolds steps, set up the dependency on the result
        if (step.title && step.title.toLowerCase().includes('resolve')) {
          fields.push(`${getCompletionState(previousStep)}_has_holds`);
        } else {
          fields.push(`${getCompletionState(previousStep)}_no_holds`);
        }
      } else if (previousStepCompletionStates.length > 0) {
        // Default to the first completion state if we can't determine a specific one
        fields.push(previousStepCompletionStates[0]);
      }
    }
    // If the previous step was a conditional, find the nearest non conditional, non scenario, non feedback ancestor and add THEIR completion state as well
    if (previousStep.conditional) {
      let tempIndex = index - 1;
      while(tempIndex > 0) {
        const currentStep = allSteps[tempIndex];
        if (currentStep.conditional || currentStep.scenarioId || currentStep.isFeedbackStep) {
          tempIndex--;
        } else {
          if (currentStep.parameters && currentStep.parameters.completion_state) {
            fields.push(currentStep.parameters.completion_state);
          } else {
            // Get the previous step's completion state values
            const currentStepCompletionStates = getCompletionStateValues(currentStep);
            
            // Use the most appropriate completion state for dependency
            // For approval steps, we want to depend on the 'yes' state
            // For upload steps, we want to depend on the 'complete' state
            if (currentStep.stepType === 'Approval' && currentStep.title === 'Parent Consent') {
              fields.push('parent_consent_provided');
            } else if (currentStep.stepType === 'Approval' && currentStepCompletionStates.includes(`${getCompletionState(currentStep)}_yes`)) {
              fields.push(`${getCompletionState(currentStep)}_yes`);
            } else if (currentStep.stepType === 'Upload' && currentStepCompletionStates.includes(`${getCompletionState(currentStep)}_complete`)) {
              fields.push(`${getCompletionState(currentStep)}_complete`);
            } else if (currentStep.stepType === 'CheckHolds') {
              // For CheckHolds steps, set up the dependency on the result
              if (step.title && step.title.toLowerCase().includes('resolve')) {
                fields.push(`${getCompletionState(currentStep)}_has_holds`);
              } else {
                fields.push(`${getCompletionState(currentStep)}_no_holds`);
              }
            } else if (currentStepCompletionStates.length > 0) {
              // Default to the first completion state if we can't determine a specific one
              fields.push(currentStepCompletionStates[0]);
            }
          }
          break;
        }
      }
    }
  }
  
  // For steps that have a specific 'addedAfterStepId', add a dependency on that step
  if (step.addedAfterStepId) {
    const afterStep = allSteps.find(s => s.id === step.addedAfterStepId);
    if (afterStep) {
      // Add completion state of the referenced step
      const afterStepCompletionState = getCompletionState(afterStep);
      if (afterStepCompletionState) {
        if (afterStep.stepType === 'Approval') {
          fields.push(`${afterStepCompletionState}_yes`);
        } else if (afterStep.stepType === 'Upload') {
          fields.push(`${afterStepCompletionState}_complete`);
        } else {
          fields.push(afterStepCompletionState);
        }
      }
    }
  }
  
  
  // For steps with no dependencies, use 'initialization_complete' as a fallback
  if (fields.length === 0 && step.stepType !== 'Initialization') {
    fields.push('initialization_complete');
  }
  
  // Return formatted fields, ensuring no duplicates
  const uniqueFields = [...new Set(fields)];
  return uniqueFields.map(field => `'${field}'`).join(', ');
};

export default getSoftRequiredFields;
