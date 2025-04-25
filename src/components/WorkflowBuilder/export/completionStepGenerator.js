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
        (option.value === 'no' || option.value?.includes('decline'))
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
  
  // Always add a default catch-all failure step with no specific requirements
  // This is a standard pattern in DualEnroll workflow fixtures
  // It must come last in the list and serves as a final error handler
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
  
  // Look for RegisterViaEthosApi steps in the workflow
  const hasRegistrationApiStep = steps.some(step => 
    step.stepType === 'RegisterViaApi' || 
    step.step_class === 'RegisterViaEthosApiStep' ||
    (step.title && (
      step.title.includes('Register Via') || 
      step.title.includes('Registration Submission') ||
      step.title.includes('Registration XML')
    ))
  );
  
  // Look for ReviewFailedRegistration steps
  const hasReviewFailedRegistrationStep = steps.some(step => 
    step.stepType === 'ReviewFailedRegistration' ||
    (step.title && (
      step.title.includes('Review Failed Registration') || 
      step.title.includes('Review Declined Registration')
    ))
  );
  
  // Create the standard completion steps
  
  // 1. API Registration success
  if (hasRegistrationApiStep) {
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
  }
  
  // 2. Manual review completion
  if (hasReviewFailedRegistrationStep) {
    // Handle college_resubmit_registration_complete
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
  }
  
  // Only generate custom success steps for approval steps with workflow termination if we have neither standard step
  if (!hasRegistrationApiStep && !hasReviewFailedRegistrationStep) {
    // Find approval steps that can terminate the workflow with success
    const terminatingApprovalSteps = steps.filter(step => 
      step.stepType === 'Approval' && 
      step.actionOptions?.some(option => 
        (option.terminates_workflow || option.canTerminate) && 
        (option.value === 'approve-yes' || option.value?.includes('approve') || option.value?.includes('yes'))
      )
    );
    
    // Create success steps for each terminating approval step
    terminatingApprovalSteps.forEach(step => {
      const completionState = getCompletionState(step);
      const successOption = step.actionOptions.find(option => 
        (option.terminates_workflow || option.canTerminate) && 
        (option.value === 'approve-yes' || option.value?.includes('approve') || option.value?.includes('yes'))
      );
      
      if (successOption) {
        // The trigger field for the approval action
        let triggerField = `${completionState}_yes`;
        
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
    });
  }
  
  return completionSteps;
};
