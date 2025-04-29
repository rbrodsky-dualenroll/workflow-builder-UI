import { snakeCase } from './utils';
import { getCompletionState, getCompletionStateValues } from './getCompletionState';
import { getParticipantRole } from './getParticipantInfo';

/**
 * Identify conditional branches and their completion states in a workflow
 * with hardcoded handling for High School role steps
 * 
 * @param {Array} steps - Workflow steps
 * @returns {Object} - Map of condition names to completion states they lead to
 */
export const identifyConditionalBranches = (steps) => {
  const conditionalBranches = {};
  
  // First, identify all explicit conditions used in the workflow
  const allConditions = new Set();
  steps.forEach(step => {
    if (step.conditional && step.workflowCondition) {
      const conditions = Array.isArray(step.workflowCondition) 
        ? step.workflowCondition 
        : [step.workflowCondition];
      
      conditions.forEach(condition => allConditions.add(condition));
    }
  });
  
  // HARDCODED EDGE CASE: Check for High School role steps
  const hasHighSchoolRoleSteps = steps.some(step => 
    step.role === 'High School' || step.role === 'Counselor');
  
  if (hasHighSchoolRoleSteps) {
    allConditions.add('high_school');
    console.log('Added implicit high_school condition based on High School role steps');
  }
  
  console.log('All conditions found in workflow:', Array.from(allConditions));
  
  // For each condition, identify all steps that depend on it and their completion states
  allConditions.forEach(conditionName => {
    // Create the branch entry if it doesn't exist
    if (!conditionalBranches[conditionName]) {
      conditionalBranches[conditionName] = {
        steps: [],
        completionStates: []
      };
    }
    
    // Find all steps directly conditional on this condition
    // HARDCODED EDGE CASE: Also include High School role steps for 'high_school' condition
    const directConditionalSteps = steps.filter(step => {
      // Check for explicit conditional attribute with matching condition
      if (step.conditional && step.workflowCondition) {
        const conditions = Array.isArray(step.workflowCondition) 
          ? step.workflowCondition 
          : [step.workflowCondition];
        
        if (conditions.includes(conditionName)) {
          return true;
        }
      }
      
      // HARDCODED EDGE CASE: Check for high_school condition based on role
      if (conditionName === 'high_school') {
        if (step.role === 'High School' || step.role === 'Counselor') {
          console.log(`Treating step "${step.title}" as conditional on high_school due to High School role`);
          return true;
        }
      }
      
      return false;
    });
    
    // Add these steps to the branch
    directConditionalSteps.forEach(step => {
      // Add the step if not already in the branch
      if (!conditionalBranches[conditionName].steps.some(s => s.id === step.id)) {
        conditionalBranches[conditionName].steps.push(step);
      }
      
      // Add the step's completion state if it has one
      const completionState = getCompletionState(step);
      if (completionState && !conditionalBranches[conditionName].completionStates.includes(completionState)) {
        conditionalBranches[conditionName].completionStates.push(completionState);
        console.log(`Added completion state "${completionState}" for condition "${conditionName}"`);
      }
      
      // No call to findDirectDownstreamSteps here - we're not recursively finding dependent steps
      // since that could include unrelated steps in the workflow
    });
  });
  
  // Log the results
  Object.keys(conditionalBranches).forEach(conditionName => {
    console.log(`Condition "${conditionName}" leads to steps:`, 
      conditionalBranches[conditionName].steps.map(s => s.title));
    console.log(`Completion states for "${conditionName}":`, 
      conditionalBranches[conditionName].completionStates);
  });
  
  return conditionalBranches;
};

/**
 * Find the most recent completion state for each conditional path preceding the current step
 * @param {Object} step - Current step
 * @param {number} index - The step index
 * @param {Array} allSteps - All steps in the workflow
 * @returns {Array} - Array of completion states from conditional paths
 */
const findConditionalCompletionStates = (step, index, allSteps) => {
  const conditionalStates = [];
  
  // Get all conditional branches
  const conditionalPaths = identifyConditionalBranches(allSteps);
  
  console.log(`Finding conditional completion states for step ${step.title} at index ${index}`);
  
  // For each condition, find the most recent step that precedes the current step
  Object.keys(conditionalPaths).forEach(condition => {
    // Even if this is the current step's condition, we still need to check
    // other conditional paths to ensure they merge back into the main flow
    const isStepInCurrentCondition = step.conditional && 
        step.workflowCondition && 
        (Array.isArray(step.workflowCondition) 
          ? step.workflowCondition.includes(condition)
          : step.workflowCondition === condition);
    
    // Special handling for High School role steps
    const isHighSchoolRoleStep = (step.role === 'High School' || step.role === 'Counselor') && condition === 'high_school';
    
    // Skip only if this step is explicitly in the current condition path
    // We still want to process other paths to ensure merging
    if (isStepInCurrentCondition || isHighSchoolRoleStep) {
      console.log(`Step ${step.title} is part of condition ${condition}, skipping this condition`);
      return;
    }
    
    // For each conditional path, we need to find the latest completion state
    // to ensure that all paths merge back correctly
    let latestCompletionState = null;
    let latestStepIndex = -1;
    
    // Get all steps in this condition branch
    const stepsInCondition = conditionalPaths[condition].steps || [];
    console.log(`Condition ${condition} has ${stepsInCondition.length} steps`);
    
    // Find the most recent step in this condition path that comes before the current step
    stepsInCondition.forEach(conditionalStep => {
      const conditionalStepIndex = allSteps.findIndex(s => s.id === conditionalStep.id);
      
      // Only consider steps that come before the current step
      if (conditionalStepIndex < index && conditionalStepIndex > latestStepIndex) {
        // Only use steps with completion states
        if (conditionalStep.completion_state || getCompletionState(conditionalStep)) {
          latestStepIndex = conditionalStepIndex;
          
          // Use the explicit completion_state if available, otherwise generate one
          latestCompletionState = conditionalStep.completion_state || getCompletionState(conditionalStep);
          
          // For approval steps, we typically want the _yes variant
          if (conditionalStep.stepType === 'Approval') {
            latestCompletionState += '_yes';
          } 
          // For upload steps, we typically want the _complete variant
          else if (conditionalStep.stepType === 'Upload') {
            latestCompletionState += '_complete';
          }
          
          console.log(`Found completion state ${latestCompletionState} from step ${conditionalStep.title} in condition ${condition}`);
        }
      }
    });
    
    // If we found a completion state, add it to our list
    if (latestCompletionState) {
      conditionalStates.push(latestCompletionState);
      console.log(`Added completion state ${latestCompletionState} from condition ${condition} to step ${step.title}'s soft_required_fields`);
    }
  });
  
  return conditionalStates;
};

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

  if (step.title === "Failed One-Time Workflow") {
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
  if (step.conditional && step.workflowCondition) {
    // Handle both array and string formats for workflowCondition
    const conditions = Array.isArray(step.workflowCondition) 
      ? step.workflowCondition 
      : [step.workflowCondition];
    
    conditions.forEach(condition => {
      fields.push(snakeCase(condition));
    });
  }
  
  // Special handling for High School role steps (implicit high_school condition)
  if (step.role === 'High School' || step.role === 'Counselor') {
    if (!fields.includes('high_school')) {
      fields.push('high_school');
    }
  }
  
  // Find all completion states from conditional branches that precede this step
  // This is the key change to implement the requested functionality
  const conditionalCompletionStates = findConditionalCompletionStates(step, index, allSteps);
  fields.push(...conditionalCompletionStates);
  
  // Get the previous step to create a dependency
  let previousStep = allSteps[index - 1];
  
  // Skip feedback steps when looking for dependencies
  // and look back to find a non-feedback step and a step that matches the condition of the current step
  // ensure the previous step belongs to the same condition as the current step
  console.log('FINDING PREVIOUS STEP FOR DEPENDENCY');
  console.log(`Current step: ${step.title}`);
  console.log(step)
  if (previousStep && previousStep.conditional && previousStep.workflowCondition[0] !== step.workflowCondition[0]) {
    // Find the most recent step with a matching scenario or matching lack of scenario
    // the main scenarios will just not have any scenarioId
    let matchingStepFound = false;
    let tempIndex = index - 1;
    while(!matchingStepFound && tempIndex > 0) {
      const currentStep = allSteps[tempIndex];
      if (currentStep.conditional && currentStep.workflowCondition[0] !== step.workflowCondition[0]) {
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
      } else if (currentStep.condition && currentStep.workflowCondition[0] !== step.workflowCondition[0]) {
        tempIndex--;
      } else {
        matchingStepFound = true;
        previousStep = currentStep;
      }
    }
  }



  // Handle step dependencies based on the previous step
  if (previousStep) {
    console.log(`Previous step: ${previousStep.title}`);
    console.log(previousStep)
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
      fields.push('high_school');
    }
  }
  
  // Return formatted fields, ensuring no duplicates
  const uniqueFields = [...new Set(fields)];
  return uniqueFields.map(field => `'${field}'`).join(', ');
};

/**
 * Find all steps that are conditional on a specific condition
 * with hardcoded handling for High School role steps
 * 
 * @param {Array} steps - All workflow steps
 * @param {string} conditionName - The condition name to filter by
 * @returns {Array} - Steps that are conditional on the specified condition
 */
const findConditionalSteps = (steps, conditionName) => {
  return steps.filter(step => {
    // Check for explicit conditional attribute with matching condition
    if (step.conditional && step.workflowCondition) {
      const conditions = Array.isArray(step.workflowCondition) 
        ? step.workflowCondition 
        : [step.workflowCondition];
      
      if (conditions.includes(conditionName)) {
        return true;
      }
    }
    
    // HARDCODED EDGE CASE: Check for high_school condition based on role
    if (conditionName === 'high_school') {
      if (step.role === 'High School' || step.role === 'Counselor') {
        console.log(`Treating step "${step.title}" as conditional on high_school due to High School role`);
        return true;
      }
    }
    
    return false;
  });
};

export default getSoftRequiredFields;