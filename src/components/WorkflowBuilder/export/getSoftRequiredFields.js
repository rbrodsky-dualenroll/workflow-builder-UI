import { snakeCase } from './utils';
import { getCompletionState, getCompletionStateValues } from './getCompletionState';
import { getParticipantRole } from './getParticipantInfo';

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
  
  // If the step has explicit workflowCondition fields, add those
  if (step.conditional && step.workflowCondition && step.workflowCondition.length > 0) {
    // Handle both array and string formats for workflowCondition
    const conditions = Array.isArray(step.workflowCondition) 
      ? step.workflowCondition 
      : [step.workflowCondition];
    
    conditions.forEach(condition => {
      fields.push(snakeCase(condition));
    });
  }
  
  // Get the previous step to create a dependency
  let previousStep = allSteps[index - 1];
  
  // Skip feedback steps when looking for dependencies
  // and look back to find a non-feedback step
  if (previousStep && previousStep.isFeedbackStep) {
    let tempIndex = index - 1;
    while(tempIndex > 0) {
      tempIndex--;
      const currentStep = allSteps[tempIndex];
      if (!currentStep.isFeedbackStep) {
        previousStep = currentStep;
        break;
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
    
    // If the previous step is conditional, we need to also depend on a non-conditional step
    // to ensure proper workflow progression regardless of condition
    if (previousStep.conditional) {
      let tempIndex = index - 1;
      let foundNonConditionalStep = false;
      
      while(tempIndex > 0 && !foundNonConditionalStep) {
        tempIndex--;
        const currentStep = allSteps[tempIndex];
        
        // Skip other conditional steps and feedback steps
        if (!currentStep.conditional && !currentStep.isFeedbackStep) {
          foundNonConditionalStep = true;
          
          // Add dependency on this non-conditional step
          if (currentStep.parameters && currentStep.parameters.completion_state) {
            fields.push(currentStep.parameters.completion_state);
          } else {
            // Get completion state values
            const currentStepCompletionStates = getCompletionStateValues(currentStep);
            
            // Use the most appropriate completion state
            if (currentStep.stepType === 'Approval' && currentStep.title === 'Parent Consent') {
              fields.push('parent_consent_provided');
            } else if (currentStep.stepType === 'Approval' && currentStepCompletionStates.includes(`${getCompletionState(currentStep)}_yes`)) {
              fields.push(`${getCompletionState(currentStep)}_yes`);
            } else if (currentStep.stepType === 'Upload' && currentStepCompletionStates.includes(`${getCompletionState(currentStep)}_complete`)) {
              fields.push(`${getCompletionState(currentStep)}_complete`);
            } else if (currentStep.stepType === 'CheckHolds') {
              if (step.title && step.title.toLowerCase().includes('resolve')) {
                fields.push(`${getCompletionState(currentStep)}_has_holds`);
              } else {
                fields.push(`${getCompletionState(currentStep)}_no_holds`);
              }
            } else if (currentStepCompletionStates.length > 0) {
              // Default to the first completion state
              fields.push(currentStepCompletionStates[0]);
            }
          }
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
  
  // Add participant role specific fields
  const participantRole = getParticipantRole(step);
  
  // For High School steps, add the 'high_school' condition
  if (participantRole === 'hs' || step.role === 'High School' || step.role === 'Counselor') {
    // Ensure we have high_school in the fields array
    if (!fields.includes('high_school')) {
      console.log(`Adding high_school soft required field to step "${step.title}"`); 
      fields.push('high_school');
    }
  }
  
  // Return formatted fields, ensuring no duplicates
  const uniqueFields = [...new Set(fields)];
  return uniqueFields.map(field => `'${field}'`).join(', ');
};

export default getSoftRequiredFields;