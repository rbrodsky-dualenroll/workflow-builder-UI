import { snakeCase } from './utils';

/**
 * Get the completion state for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Completion state name
 */
const getCompletionState = (step) => {
  if (step.stepType === 'ReviewFailedRegistration') {
    return 'college_resubmit_registration';
  } else if (step.stepType === 'Approval') {
    if (step.title === 'Parent Consent') {
      return 'parent_consent_provided';
    } else if (step.title === 'Review Declined Registration' || step.title === 'Resolve Failed Registration') {
      return 'college_resubmit_registration';
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
  } else if (step.stepType === 'CheckHolds' || step.step_class === 'CheckHoldsViaEthosApiStep') {
    return 'holds_checked_via_ethos_api';
  } else if (step.stepType === 'RegisterViaApi' || step.step_class === 'RegisterViaEthosApiStep') {
    return 'registration_via_ethos_api';
  } else if (step.stepType === 'CheckEligibility' || step.step_class === 'RegistrationEligibilityViaEthosApiStep') {
    return 'student_eligibility_checked_via_ethos_api';
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
  
  // For special approval steps, provide custom state values
  if (baseState === 'college_resubmit_registration' || step.stepType === 'ReviewFailedRegistration') {
    return [
      baseState, 
      `${baseState}_yes`, 
      `${baseState}_no`, 
      `${baseState}_complete`,
      `${baseState}_choose_new_section`,
      // We don't include _student_resolve_issues or _hs_resolve_issues here as those are handled by feedback loops
    ];
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
  
  if (step.stepType === 'RegisterViaApi' || step.step_class === 'RegisterViaEthosApiStep') {
    return [baseState, `registration_response_yes`, `registration_response_no`, `${baseState}_processed`, `${baseState}_course_section_full`, `registration_via_ethos_api_processed`];
  }
  
  if (step.stepType === 'CheckEligibility' || step.step_class === 'RegistrationEligibilityViaEthosApiStep') {
    return [baseState, `${baseState}_eligible`, `${baseState}_ineligible`, 'ineligibility_reasons'];
  }
  
  // Default case
  return [baseState, `${baseState}_complete`];
};

export { getCompletionState, getCompletionStateValues };
