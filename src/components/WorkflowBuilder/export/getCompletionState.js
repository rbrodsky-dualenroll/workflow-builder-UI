import { snakeCase } from './utils';

/**
 * Get the completion state for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Completion state name
 */
const getCompletionState = (step) => {
  if (step.stepType === 'Approval') {
    if (step.title === 'Parent Consent') {
      return 'parent_consent_provided';
    }
    return snakeCase(step.title || 'approve');
  } else if (step.stepType === 'Upload') {
    return snakeCase(step.title || 'upload_document');
  } else if (step.stepType === 'Initialization') {
    return "initialization_complete";
  } else if (step.stepType === 'WaitForCompletionOfOneTimeSteps') {
    return "one_time_workflow_complete";
  } else if (step.stepType === 'ProvideConsent') {
    return 'parent_consent_provided';
  } else if (step.stepType === 'CheckHolds') {
    return 'holds_checked_via_ethos_api';
  } else if (step.stepType === 'RegisterViaApi') {
    return 'registration_via_colleague_api';
  } else {
    return snakeCase(step.title || 'complete');
  }
};

/**
 * Get the completion state values for a step
 * @param {Object} step - Step data from the workflow
 * @returns {Array} - Array of completion state values
 */
const getCompletionStateValues = (step) => {
  const baseState = getCompletionState(step);
  
  if (!baseState) {
    return [];
  }
  
  // For approval steps with feedback loops, include the role-specific more_info states
  if (step.stepType === 'Approval' && step.feedbackLoops && Object.keys(step.feedbackLoops).length > 0) {
    const states = [baseState, `${baseState}_yes`, `${baseState}_no`, `${baseState}_declined`];
    
    // Add states for each feedback loop
    Object.entries(step.feedbackLoops).forEach(([feedbackId, feedback]) => {
      if (feedback.recipient) {
        const roleSpecificSuffix = feedback.recipient.toLowerCase() === 'student' ? 'student_more_info' : 
                                  (feedback.recipient.toLowerCase() === 'parent' ? 'parent_more_info' :
                                  (feedback.recipient.toLowerCase() === 'high school' || feedback.recipient.toLowerCase() === 'counselor' ? 'hs_more_info' : 
                                  (feedback.recipient.toLowerCase() === 'approver' ? 'approver_more_info' : 'more_info')));
        states.push(`${baseState}_${roleSpecificSuffix}`);
      }
    });
    
    return states;
  }
  
  // For standard approval steps, we typically have yes/no/declined states
  if (step.stepType === 'Approval') {
    return [baseState, `${baseState}_yes`, `${baseState}_no`, `${baseState}_declined`];
  }
  
  // For upload steps, we typically have complete/return states
  if (step.stepType === 'Upload') {
    return [baseState, `${baseState}_complete`, `${baseState}_return`];
  }
  
  // For special step types, handle specific state values
  if (step.stepType === 'CheckHolds') {
    return [baseState, `${baseState}_has_holds`, `${baseState}_no_holds`];
  }
  
  if (step.stepType === 'RegisterViaApi') {
    return [baseState, `${baseState}_processed`, `${baseState}_course_section_full`];
  }
  
  // Default case
  return [baseState, `${baseState}_complete`];
};

export { getCompletionState, getCompletionStateValues };
