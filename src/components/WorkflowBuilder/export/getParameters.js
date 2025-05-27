import { serializeToRubyHash } from './utils';
import { getCompletionState } from './getCompletionState';

/**
 * Generate parameters hash for a step
 * @param {Object} step - Step data from the workflow
 * @param {string} completionState - Completion state name
 * @param {Array} allSteps - All steps in the workflow category
 * @returns {string} - Ruby hash representation of parameters
 */
const getParameters = (step, completionState, allSteps) => {
  // Handle system and initialization steps specially
  if (step.stepType === 'system' || step.stepType === 'initialization') {
    // For system steps, if they have specific parameters, use those
    if (step.parameters && Object.keys(step.parameters).length > 0) {
      // Convert JavaScript object to Ruby hash representation
      return serializeToRubyHash(step.parameters);
    }
    return "''";
  }
  
  let params = {};
  
  // Add completion_state for all non-system steps
  if (completionState) {
    params['completion_state'] = completionState;
  }
  
  // Handle feedback step parameters
  if (step.isFeedbackStep && step.feedbackRelationship) {
    params['feedback_relationship'] = {
      parentStepId: step.feedbackRelationship.parentStepId,
      feedbackId: step.feedbackRelationship.feedbackId,
      parentStepTitle: step.feedbackRelationship.parentStepTitle,
      requestingRole: step.feedbackRelationship.requestingRole
    };
  }
  
  // For ReviewFailedRegistration steps, add clear_states parameters
  if (step.stepType === 'ReviewFailedRegistration') {
    // Add state clearing parameters for the resubmit action
    params['clear_states_by_completion'] = {
      'yes': [
        'college_declined_registration_comments',
        'college_declined',
        'college_resubmit_registration',
        'college_resubmit_registration_yes',
        // Clear registration response fields
        'registration_response_no',
        'registration_response',
        'registration_xml_workflow_file_id',
        'registration_via_ethos_api_processed',
        'registration_via_colleague_api_processed',
        // Any other fields that need to be reset
      ]
    };
  }
  
  // For upload steps, add document class and types
  if (step.stepType === 'Upload') {
    params['document_class'] = step.documentClass || 'StudentDocument';
    
    // Extract document types from fileUploads array
    if (step.fileUploads && step.fileUploads.length > 0) {
      params['kinds'] = step.fileUploads.map(file => file.fileType);
    } else {
      params['kinds'] = ['other']; // Default to 'other' if no file uploads defined
    }
    
    // Add clear_states_by_completion parameters for upload steps
    if (completionState) {
      // If this is a feedback step and has a parent relationship, handle special feedback step clearing
      if (step.isFeedbackStep && step.feedbackRelationship) {
        const parentStep = allSteps.find(s => s.id === step.feedbackRelationship.parentStepId);
        if (parentStep) {
          const parentCompletionState = getCompletionState(parentStep);
          // Updated role-specific suffix to include parent
          const roleSpecificSuffix = step.role && step.role.toLowerCase() === 'student' ? 'student_more_info' : 
                                    (step.role && step.role.toLowerCase() === 'parent' ? 'parent_more_info' :
                                    (step.role && (step.role.toLowerCase() === 'high school' || step.role.toLowerCase() === 'counselor') ? 'hs_more_info' : 
                                    (step.role && step.role.toLowerCase() === 'approver' ? 'approver_more_info' : 'more_info')));
          
          // Updated to match the structure from the example
          params['clear_states_by_completion'] = {
            'complete': [
              completionState, 
              `${completionState}_complete`, 
              parentCompletionState, 
              `${parentCompletionState}_${roleSpecificSuffix}`
            ]
          };
        } else {
          // Fall back to standard behavior if parent not found
          params['clear_states_by_completion'] = {
            'return': [
              completionState,
              `${completionState}_return`,
              `${completionState}_complete`
            ]
          };
        }
      } else {
        // Standard behavior for non-feedback upload steps
        params['clear_states_by_completion'] = {
          'return': [
            completionState,
            `${completionState}_return`,
            `${completionState}_complete`
          ]
        };
      }
    }
  }
  
  if (step.stepType === 'RegistrationEligibilityCheck') {
    // These steps typically don't need additional parameters
    // The step class handles the SIS integration logic
  }
  
  if (step.stepType === 'StudentProgramsCheck') {
    // These steps typically don't need additional parameters
    // The step class handles the SIS integration logic
  }
  
  if (step.stepType === 'CreateHolds' || step.stepType === 'DeleteHolds') {
    if (step.holdCodes) {
      params['hold_codes'] = step.holdCodes.includes(',') ? 
        step.holdCodes.split(',').map(code => code.trim()) : 
        step.holdCodes;
    }
  }
  
  // For approval steps, add clear_states_by_completion to handle returns and feedback loops
  if (step.stepType === 'Approval' && completionState) {
    // Handle feedback loops if present
    if (step.feedbackLoops && Object.keys(step.feedbackLoops).length > 0) {
      params['feedbackLoops'] = {};
      
      // Map all feedback loops
      Object.keys(step.feedbackLoops).forEach(feedbackId => {
        const feedback = step.feedbackLoops[feedbackId];
        params['feedbackLoops'][feedbackId] = {
          recipient: feedback.recipient,
          nextStep: feedback.nextStep
        };
      });
      
      // Add clear_states_by_completion for feedback handling
      if (!params['clear_states_by_completion']) {
        params['clear_states_by_completion'] = {};
      }
      
      // For each feedback loop, add the proper role-specific suffix to the completion state
      Object.keys(step.feedbackLoops).forEach(feedbackId => {
        const feedback = step.feedbackLoops[feedbackId];
        const roleSpecificSuffix = feedback.recipient && feedback.recipient.toLowerCase() === 'student' ? 'student_more_info' : 
                                  (feedback.recipient && feedback.recipient.toLowerCase() === 'parent' ? 'parent_more_info' :
                                  (feedback.recipient && (feedback.recipient.toLowerCase() === 'high school' || feedback.recipient.toLowerCase() === 'counselor') ? 'hs_more_info' : 
                                  (feedback.recipient && feedback.recipient.toLowerCase() === 'approver' ? 'approver_more_info' : 'more_info')));
        
        if (!params['clear_states_by_completion']['yes']) {
          params['clear_states_by_completion']['yes'] = [];
        }
        
        // Add to the list of states to clear when approved
        params['clear_states_by_completion']['yes'].push(`${completionState}_${roleSpecificSuffix}`);
      });
    }
  }

  // Handle specialized step types
  if (step.stepType === 'ProvideConsent') {
    params['consent'] = step.consentType || 'all';
  }
  
  if (step.stepType === 'CheckHolds') {
    params['hold_codes'] = step.holdCodes || '*any*';
    params['holds'] = 'has_holds';
    params['no_holds'] = 'no_holds';
  }
  
  if (step.stepType === 'RegisterViaApi') {
    // Add registration action if not default 'add'
    if (step.registrationAction && step.registrationAction !== 'add') {
      params['action'] = step.registrationAction;
    }
    
    // Add SIS-specific parameters
    const sisIntegration = step.sisIntegration || 'ethos';
    
    switch (sisIntegration) {
      case 'banner_eedm':
        if (step.overrideCode) {
          params['override_code'] = step.overrideCode;
        }
        break;
      case 'colleague':
        if (step.checkRoster) {
          params['check_course_section_roster'] = true;
        }
        break;
      // Add other SIS-specific parameters as needed
    }
  }
  
  if (step.stepType === 'WaitForCompletionOfOneTimeSteps' || 
      step.stepType === 'PendingCompletionOfOneTimeSteps') {
    params['inject_subordinate_registration_active_flow_fields'] = [
      'esign_enrollment_form_parent_date',
      'esign_enrollment_form_parent_name'
    ];
    params['subordinate_registration_active_flow_target_object_type'] = 'CollegeStudentApplication';
    params['subordinate_registration_active_flow_category'] = 'registration_one_time';
    params['completion_state'] = 'one_time_workflow_complete';
  }
  
  if (step.stepType === 'WaitForCompletionOfPerTermSteps') {
    params['inject_subordinate_registration_active_flow_fields'] = [];
    params['subordinate_registration_active_flow_target_object_type'] = 'StudentTerm';
    params['subordinate_registration_active_flow_category'] = 'registration';
    params['completion_state'] = 'student_term_complete';
  }
  
  // Add update_attributes from form data if present
  if (step.updateAttributes && Object.keys(step.updateAttributes).length > 0) {
    params['update_attributes'] = step.updateAttributes;
  }
  
  // Also collect update_attributes from action options with additional info fields
  if (step.actionOptions && step.actionOptions.some(opt => opt.requiresAdditionalInfo)) {
    // Initialize update_attributes if not already present
    if (!params['update_attributes']) {
      params['update_attributes'] = {};
    }
    
    // Add fields from action options
    step.actionOptions.forEach(option => {
      if (option.requiresAdditionalInfo && option.additionalInfoField && option.additionalInfoModel) {
        // Ensure the model path exists in update_attributes
        if (!params['update_attributes'][option.additionalInfoModel]) {
          params['update_attributes'][option.additionalInfoModel] = [];
        }
        
        // Add the field if not already present
        if (!params['update_attributes'][option.additionalInfoModel].includes(option.additionalInfoField)) {
          params['update_attributes'][option.additionalInfoModel].push(option.additionalInfoField);
        }
      }
    });
  }
  
  // Also collect update_attributes from input fields in tableColumns
  if (step.tableColumns && step.tableColumns.some(col => col.type === 'input')) {
    // Initialize update_attributes if not already present
    if (!params['update_attributes']) {
      params['update_attributes'] = {};
    }
    
    // Add fields from table columns
    step.tableColumns.forEach(column => {
      if (column.type === 'input' && column.modelPath && column.value && column.value.startsWith('fields.')) {
        // Extract field name (remove 'fields.' prefix)
        const fieldName = column.value.replace('fields.', '');
        
        // Ensure the model path exists in update_attributes
        if (!params['update_attributes'][column.modelPath]) {
          params['update_attributes'][column.modelPath] = [];
        }
        
        // Add the field if not already present
        if (!params['update_attributes'][column.modelPath].includes(fieldName)) {
          params['update_attributes'][column.modelPath].push(fieldName);
        }
      }
    });
  }
  
  return serializeToRubyHash(params);
};

export default getParameters;
