/**
 * Utilities for normalizing step names, completion states, and other values
 */

/**
 * Normalize step parameter and field names to use one_time_workflow_complete consistently
 * @param {Object} step - Step data to normalize
 * @returns {Object} - The normalized step
 */
export const normalizeStepNames = (step) => {
  if (step.parameters && step.parameters.completion_state) {
    // Replace any onetime variations with one_time
    if (step.parameters.completion_state === 'onetime_workflow_complete') {
      step.parameters.completion_state = 'one_time_workflow_complete';
    } else if (step.parameters.completion_state === 'complete_onetime_workflow') {
      step.parameters.completion_state = 'complete_one_time_workflow';
    } else if (step.parameters.completion_state === 'failed_onetime_workflow') {
      step.parameters.completion_state = 'failed_one_time_workflow';
    }
  }
  
  if (step.soft_required_fields) {
    step.soft_required_fields = step.soft_required_fields.map(field => {
      if (field === 'onetime_workflow_complete') return 'one_time_workflow_complete';
      if (field === 'complete_onetime_workflow') return 'complete_one_time_workflow';
      return field;
    });
  }
  
  return step;
};

/**
 * Normalize parent/guardian roles to parent
 * @param {Object} step - Step data to normalize
 * @returns {Object} - The normalized step
 */
export const normalizeParticipantRoles = (step) => {
  if (step.participant === 'Parent/Guardian') {
    step.participant = 'Parent';
  }
  if (step.participant_role === 'parent/guardian') {
    step.participant_role = 'parent';
  }
  
  return step;
};
