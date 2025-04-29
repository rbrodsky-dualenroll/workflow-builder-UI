/**
 * Utilities for generating step code
 */
import getViewOverride from '../getViewOverride';
import getStepClass from '../getStepClass';
import { getParticipantRole, getParticipant } from '../getParticipantInfo';
import { getCompletionState } from '../getCompletionState';
import getParameters from '../getParameters';
import getSoftRequiredFields from '../getSoftRequiredFields';
import { normalizeStepNames, normalizeParticipantRoles } from './normalization';
import { generateFailureSteps, generateCompletionSteps } from '../completionStepGenerator';

/**
 * Extract the category name from varName
 * @param {string} collegeVarName - The college variable name
 * @param {string} varName - The active flow definition variable name
 * @returns {string} - The extracted category name
 */
export const extractCategoryName = (collegeVarName, varName) => {
  // The varName follows pattern: collegeVarName_categoryName_active_flow_definition
  // We need to extract just the categoryName part
  const fullPrefix = `${collegeVarName}_`;
  const fullSuffix = '_active_flow_definition';
  
  // Remove the prefix and suffix to get the category name
  return varName
    .replace(fullPrefix, '')
    .replace(fullSuffix, '');
};

/**
 * Generate code for a single step in a workflow category
 * @param {Object} step - Step data from the workflow
 * @param {string} collegeVarName - The college variable name
 * @param {string} varName - The ActiveFlowDefinition variable name
 * @param {number} index - The step index
 * @param {Array} allSteps - All steps in the workflow
 * @returns {string} - Ruby code for the step
 */
export const generateStepForCategory = (step, collegeVarName, varName, index, allSteps) => {
  // Extract category name from the variable name
  const categoryName = extractCategoryName(collegeVarName, varName);
  
  // Apply normalization to the step
  step = normalizeStepNames(step);
  step = normalizeParticipantRoles(step);
  
  // Set up default values
  const completionState = getCompletionState(step);
  const stepClass = getStepClass(step);
  
  // Always blank out view_name_override for ProvideConsent steps
  let viewOverride = '';
  if (step.stepType === 'ProvideConsent') {
    viewOverride = '';
  } else {
    viewOverride = getViewOverride(step);
  }
  
  const parameters = getParameters(step, completionState, allSteps);
  
  // Get participant and role
  let participant = getParticipant(step);
  let participantRole = getParticipantRole(step);
  
  // Get soft required fields
  const softRequiredFields = getSoftRequiredFields(step, index, allSteps);
  
  return `
      {
        active_flow_definitions: [${varName}],
        name: '${step.title || 'Step ' + (index + 1)}',
        version: ${collegeVarName}_${categoryName}_active_flow_definition_version_number,
        description: '',
        participant: '${participant}',
        step_class: '${stepClass}',
        view_name_override: '${viewOverride}',
        parameters: ${parameters},
        participant_role: '${participantRole}',
        soft_required_fields: [${softRequiredFields}]
      },
`;
};

/**
 * Determine if a step is an initialization step
 * @param {Object} step - The step to check
 * @returns {boolean} - True if the step is an initialization step
 */
export const isInitializationStep = (step) => {
  return step.stepType === 'Initialization' || 
    (step.title && step.title.toLowerCase().includes('initialization'));
};

/**
 * Determine if a step is a waiting step
 * @param {Object} step - The step to check
 * @returns {boolean} - True if the step is a waiting step
 */
export const isWaitingStep = (step) => {
  // Check for various indicators that this is a waiting step
  return (
    // Check step type
    step.stepType?.toLowerCase().includes('waitfor') ||
    step.stepType?.toLowerCase().includes('pending') ||
    step.stepType?.toLowerCase().includes('completion of') ||
    
    // Check step title
    (step.title && (
      step.title.toLowerCase().includes('completion of') ||
      step.title.toLowerCase().includes('pending completion') ||
      step.title.toLowerCase().includes('wait for')
    )) ||
    
    // Check step class
    (step.step_class && (
      step.step_class?.toLowerCase().includes('waitfor') ||
      step.step_class?.toLowerCase().includes('pendingcompletion') ||
      step.step_class?.toLowerCase().includes('waitforsubordinate')
    ))
  );
};

/**
 * Create a default initialization step for a category
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @returns {Object} - The initialization step
 */
export const createInitializationStep = (collegeVarName, category) => {
  const initializeClassName = category.name === 'registration' ? 'CourseRegistration' : category.targetObject;
  
  return {
    stepType: 'Initialization',
    title: `${category.displayName} Initialization`,
    version: `${collegeVarName}_${category.name}_active_flow_definition_version_number`,
    participant: 'Processing',
    step_class: `Initialize${collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1)}${initializeClassName}Step`,
    view_name_override: '',
    parameters: '',
    participant_role: 'system',
    soft_required_fields: [],
  };
};

/**
 * Create a waiting for one-time workflow completion step
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @returns {Object} - The waiting step
 */
export const createWaitForOneTimeCompletionStep = (collegeVarName, category) => {
  return {
    stepType: 'PendingCompletionOfOneTimeSteps',
    title: 'Pending Completion of One-Time Steps',
    version: `${collegeVarName}_${category.name}_active_flow_definition_version_number`,
    participant: 'Pending',
    step_class: 'WaitForSubordinateRegistrationActiveFlowCompletionStep',
    view_name_override: '',
    parameters: {
      'inject_subordinate_registration_active_flow_fields': [
        'esign_enrollment_form_parent_date',
        'esign_enrollment_form_parent_name',
      ],
      'subordinate_registration_active_flow_target_object_type': 'CollegeStudentApplication',
      'subordinate_registration_active_flow_category': 'registration_one_time',
      'completion_state': 'one_time_workflow_complete',
    },
    participant_role: 'system',
    soft_required_fields: ['initialization_complete'],
  };
};

/**
 * Create a waiting for per-term workflow completion step
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @returns {Object} - The waiting step
 */
export const createWaitForPerTermCompletionStep = (collegeVarName, category) => {
  // This step should always depend on the one-time workflow completion
  // If there's no one-time workflow, this step shouldn't be added
  return {
    stepType: 'PendingCompletionOfPerTermSteps',
    title: 'Pending Completion of Per Term Steps',
    version: `${collegeVarName}_${category.name}_active_flow_definition_version_number`,
    participant: 'Pending',
    step_class: 'WaitForSubordinateRegistrationActiveFlowCompletionStep',
    view_name_override: '',
    parameters: {
      'inject_subordinate_registration_active_flow_fields': [],
      'subordinate_registration_active_flow_target_object_type': 'StudentTerm',
      'subordinate_registration_active_flow_category': 'registration',
      'completion_state': 'student_term_complete',
    },
    participant_role: 'system',
    soft_required_fields: ['one_time_workflow_complete']
  };
};

/**
 * Create a complete one-time workflow step
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @returns {Object} - The completion step
 */
export const createCompleteOneTimeWorkflowStep = (collegeVarName, category) => {
  // This step is specific to the college_student_application workflow
  return {
    stepType: 'CompleteOneTimeWorkflow',
    title: 'Complete One-Time Workflow',
    version: `${collegeVarName}_${category.name}_active_flow_definition_version_number`,
    participant: 'Processing',
    step_class: 'CompleteSubordinateRegistrationActiveFlowStep',
    view_name_override: '',
    parameters: {
      'subordinate_registration_active_flow_target_object_type': 'CollegeStudentApplication',
      'subordinate_registration_active_flow_category': 'registration_one_time',
    },
    participant_role: 'system',
    soft_required_fields: ['mou_review_yes']
  };
};

/**
 * Create a failed one-time workflow step
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @returns {Object} - The failure step
 */
export const createFailedOneTimeWorkflowStep = (collegeVarName, category) => {
  return {
    stepType: 'FailedOneTimeWorkflow',
    title: 'Failed One-Time Workflow',
    version: `${collegeVarName}_${category.name}_active_flow_definition_version_number`,
    participant: 'Processing',
    step_class: 'DeclineSubordinateRegistrationActiveFlowStep',
    view_name_override: '',
    parameters: {},
    participant_role: 'system',
    soft_required_fields: []
  };
};

/**
 * Create a complete per-term workflow step
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @param {string} requiredField - Required field for the step
 * @returns {Object} - The completion step
 */
export const createCompletePerTermWorkflowStep = (collegeVarName, category, requiredField) => {
  return {
    stepType: 'CompletePerTermWorkflow',
    title: 'Complete Per Term Workflow',
    version: `${collegeVarName}_${category.name}_active_flow_definition_version_number`,
    participant: 'Processing',
    step_class: 'CompleteSubordinateRegistrationActiveFlowStep',
    view_name_override: '',
    parameters: {
      'subordinate_registration_active_flow_target_object_type': 'StudentTerm',
      'subordinate_registration_active_flow_category': 'registration',
    },
    participant_role: 'system',
    soft_required_fields: ['parent_consent_provided', requiredField]
  };
};

/**
 * Create a decline per-term workflow step
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @returns {Object} - The decline step
 */
export const createDeclinePerTermWorkflowStep = (collegeVarName, category) => {
  return {
    stepType: 'DeclinePerTermWorkflow',
    title: 'Decline Per Term Workflow',
    version: `${collegeVarName}_${category.name}_active_flow_definition_version_number`,
    participant: 'Processing',
    step_class: 'DeclineStudentTermStep',
    view_name_override: '',
    parameters: {
      'mailer_signatures': [
        ['failure', { 'override_roles': 'student', 'template': 'student_college_rejection' }]
      ]
    },
    participant_role: 'system',
    soft_required_fields: []
  };
};
