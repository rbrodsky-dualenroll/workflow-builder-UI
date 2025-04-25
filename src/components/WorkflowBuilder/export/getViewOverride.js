/**
 * Get the view override path for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - View override path
 */
const getViewOverride = (step) => {
  // If there's an explicit override in the step data, use it
  if (step.viewNameOverride) {
    return step.viewNameOverride;
  }
  
  // Return empty for system steps and steps that don't have views
  if (step.participant_role === 'system' || 
      step.role === 'System' || 
      step.role === 'Processing' || 
      step.stepType === 'system' ||
      step.stepType === 'RegisterViaApi' || 
      step.stepType === 'PendingCompletionOfOneTimeSteps' || 
      step.stepType === 'PendingCompletionOfPerTermSteps' || 
      step.stepType === 'PendingCompletionOfPerYearSteps') {
    return '';
  }
  
  // Special case for ProvideConsent steps - always use the standard path
  if (step.stepType === 'ProvideConsent') {
    const role = (step.role || step.participant_role || 'parent').toLowerCase().replace(/\s+/g, '_');
    return `active_flow_steps/course_registration/${role}/provide_consent`;
  }

  // For all other steps, generate a view path based on role and type
  const role = (step.role || step.participant_role || 'student').toLowerCase().replace(/\s+/g, '_');
  let action = '';
  
  // Determine the action based on step type
  if (step.title) {
    action = step.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_+|_+$)/g, '');
  } else {
    action = step.stepType.toLowerCase().replace(/\s+/g, '_');
  }
  
  // Use standard path format with role and action
  return `active_flow_steps/course_registration/${role}/${action}`;
};

export default getViewOverride;
