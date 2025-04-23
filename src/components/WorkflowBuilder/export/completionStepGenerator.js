/**
 * Completion and Failure Step Generator
 * 
 * This module generates appropriate completion and failure steps based on the workflow definition.
 * - Failure steps are generated for each step that can terminate the workflow with a decline response
 * - Completion steps are generated for successful paths through the workflow
 */

import { getCompletionState } from './getCompletionState';

/**
 * Generate failure steps for a workflow category
 * 
 * This function generates DeclineRegistrationStep entries for each step that can
 * terminate the workflow with a "decline" action. Each step with a terminating
 * action option will get its own failure step.
 * 
 * @param {Array} steps - All steps in the workflow
 * @param {string} collegeVarName - The college variable name
 * @param {string} category - The workflow category name
 * @param {number} versionNumber - The version number
 * @returns {Array} - Array of failure step objects
 */
export const generateFailureSteps = (steps, collegeVarName, category, versionNumber) => {
  // Only generate failure steps for registration workflow
  if (category !== 'registration') {
    return [];
  }
  
  const failureSteps = [];
  const addedTriggerFields = new Set(); // Track which trigger fields we've already added
  
  // Find all steps that can terminate the workflow with a decline response
  steps.forEach(step => {
    // Skip steps without actionOptions or system steps
    if (step.participant_role === 'system' || !step.actionOptions) {
      return;
    }
    
    // We only care about Approval steps with decline options that terminate the workflow
    if (step.stepType === 'Approval') {
      // Check for terminates_workflow action options
      const terminatingOptions = step.actionOptions.filter(option => 
        (option.terminates_workflow || option.canTerminate) && 
        (option.value === 'decline-no' || option.value?.includes('decline'))
      );
      
      if (terminatingOptions.length > 0) {
        // For each terminating option, create a failure step
        terminatingOptions.forEach(option => {
          // Create the soft_required_field based on the option
          const completionState = getCompletionState(step);
          const optionValue = option.value.replace('decline-', '');
          
          // The trigger field that will activate this failure step
          let triggerField;
          
          // If the option value already includes a full path (like confirm_enrollment_declined),
          // use it directly; otherwise, construct it
          if (option.value.includes('_')) {
            triggerField = option.value;
          } else {
            triggerField = `${completionState}_${optionValue}`;
          }
          
          // Only add if we don't already have a failure step with this trigger field
          if (!addedTriggerFields.has(triggerField)) {
            addedTriggerFields.add(triggerField);
            
            // Create the failure step with the specific trigger
            const failureStep = {
              name: 'Registration Failure',
              stepType: 'Registration Failure',
              title: 'Registration Failure',
              version: `${collegeVarName}_${category}_active_flow_definition_version_number`,
              participant: 'Processing',
              step_class: 'DeclineRegistrationStep',
              view_name_override: '',
              parameters: {
                'mailer_signatures': [
                  [
                    ':failure',
                    {
                      'override_roles': ['student'],
                      'subject': 'Registration Could Not Be Completed',
                      'template': 'student_registration_failure'
                    }
                  ]
                ]
              },
              participant_role: 'system',
              soft_required_fields: [`'${triggerField}'`]
            };
            
            failureSteps.push(failureStep);
          }
        });
      }
    }
  });
  
  // Add a default catch-all failure step with no specific requirements
  // This is present in the fixture files and is used as a catch-all
  // Only add if we have at least one other failure step
  if (failureSteps.length > 0) {
    failureSteps.push({
      name: 'Registration Failure',
      stepType: 'Registration Failure',
      title: 'Registration Failure',
      version: `${collegeVarName}_${category}_active_flow_definition_version_number`,
      participant: 'Processing',
      step_class: 'DeclineRegistrationStep',
      view_name_override: '',
      parameters: {
        'mailer_signatures': [
          [
            ':failure',
            {
              'override_roles': ['student'],
              'subject': 'Registration Could Not Be Completed',
              'template': 'student_registration_failure'
            }
          ]
        ]
      },
      participant_role: 'system',
      soft_required_fields: []
    });
  }
  
  return failureSteps;
};

/**
 * Generate successful completion steps for a workflow category
 * 
 * This function identifies terminal success points in the workflow and generates
 * appropriate CompleteRegistrationStep entries for each one.
 * 
 * @param {Array} steps - All steps in the workflow
 * @param {string} collegeVarName - The college variable name
 * @param {string} category - The workflow category name
 * @param {number} versionNumber - The version number
 * @returns {Array} - Array of completion step objects
 */
export const generateCompletionSteps = (steps, collegeVarName, category, versionNumber) => {
  // Only generate completion steps for registration workflow
  if (category !== 'registration') {
    return [];
  }
  
  const completionSteps = [];
  const addedTriggerFields = new Set(); // Track which trigger fields we've already added
  
  // Core success states that should trigger completion
  const coreSuccessStates = [
    'registration_response_yes',   // API registration success
    'college_resubmit_registration_complete', // Manual review success
    'college_resubmit_registration_yes'  // Resubmission approved
  ];
  
  // First, make sure we have a completion step for the registration_response_yes state
  // This is the standard success path when using RegisterViaEthosApi
  addedTriggerFields.add('registration_response_yes');
  completionSteps.push({
    name: 'Successful Registration',
    stepType: 'Successful Registration',
    title: 'Successful Registration',
    version: `${collegeVarName}_${category}_active_flow_definition_version_number`,
    participant: 'Processing',
    step_class: 'CompleteRegistrationStep',
    view_name_override: '',
    parameters: { 'completion_state': 'successful_registration' },
    participant_role: 'system',
    soft_required_fields: [`'registration_response_yes'`]
  });
  
  // Add a direct success step for registration_via_ethos_api for colleges that use
  // the SuccessfulRegistrationActiveFlowStep pattern
  addedTriggerFields.add('registration_via_ethos_api');
  completionSteps.push({
    name: 'Successful Registration',
    stepType: 'Successful Registration',
    title: 'Successful Registration',
    version: `${collegeVarName}_${category}_active_flow_definition_version_number`,
    participant: 'Processing',
    step_class: 'SuccessfulRegistrationActiveFlowStep',
    view_name_override: '',
    parameters: { 'completion_state': 'successful_registration' },
    participant_role: 'system',
    soft_required_fields: [`'registration_via_ethos_api'`]
  });
  
  // Add a completion step for college_resubmit_registration_complete
  // This is used when a registration initially fails but is manually fixed
  addedTriggerFields.add('college_resubmit_registration_complete');
  completionSteps.push({
    name: 'Successful Registration',
    stepType: 'Successful Registration',
    title: 'Successful Registration',
    version: `${collegeVarName}_${category}_active_flow_definition_version_number`,
    participant: 'Processing',
    step_class: 'CompleteRegistrationStep',
    view_name_override: '',
    parameters: { 'completion_state': 'successful_registration' },
    participant_role: 'system',
    soft_required_fields: [`'college_resubmit_registration_complete'`]
  });
  
  // Add a completion step for college_resubmit_registration_yes
  // This is used when a college approves resubmission of a failed registration
  addedTriggerFields.add('college_resubmit_registration_yes');
  completionSteps.push({
    name: 'Successful Registration',
    stepType: 'Successful Registration',
    title: 'Successful Registration',
    version: `${collegeVarName}_${category}_active_flow_definition_version_number`,
    participant: 'Processing',
    step_class: 'CompleteRegistrationStep',
    view_name_override: '',
    parameters: { 'completion_state': 'successful_registration' },
    participant_role: 'system',
    soft_required_fields: [`'college_resubmit_registration_yes'`]
  });
  
  // Look for specific API registration steps in the workflow
  const registrationApiSteps = steps.filter(step => 
    step.stepType === 'RegisterViaApi' || 
    step.step_class === 'RegisterViaEthosApiStep' ||
    step.stepType === 'Registration Submission' ||
    (step.title && (step.title.includes('Registration Submission') || 
                   step.title.includes('Register Via') || 
                   step.title.includes('Registration XML Data Exchange') ||
                   step.title.includes('Registration Submission to')))
  );
  
  // If we don't have any RegisterViaApi steps but there are steps with terminates_workflow on approve,
  // add completion steps for those terminal approval successes
  if (registrationApiSteps.length === 0) {
    const terminatingApprovalSteps = steps.filter(step => 
      step.stepType === 'Approval' && 
      step.actionOptions?.some(option => 
        (option.terminates_workflow || option.canTerminate) && 
        (option.value === 'approve-yes' || option.value?.includes('approve') || option.value?.includes('yes'))
      )
    );
    
    terminatingApprovalSteps.forEach(step => {
      const completionState = getCompletionState(step);
      const successOption = step.actionOptions.find(option => 
        (option.terminates_workflow || option.canTerminate) && 
        (option.value === 'approve-yes' || option.value?.includes('approve') || option.value?.includes('yes'))
      );
      
      if (successOption) {
        // The trigger field for the approval action
        let triggerField = `${completionState}_yes`;
        
        if (!addedTriggerFields.has(triggerField)) {
          addedTriggerFields.add(triggerField);
          
          completionSteps.push({
            name: 'Successful Registration',
            stepType: 'Successful Registration',
            title: 'Successful Registration',
            version: `${collegeVarName}_${category}_active_flow_definition_version_number`,
            participant: 'Processing',
            step_class: 'CompleteRegistrationStep',
            view_name_override: '',
            parameters: { 'completion_state': 'successful_registration' },
            participant_role: 'system',
            soft_required_fields: [`'${triggerField}'`]
          });
        }
      }
    });
  }
  
  return completionSteps;
};
