/**
 * Ruby Fixture Exporter Utility
 * 
 * This utility converts workflow data from the workflow builder into a Ruby fixture file format
 * that can be used in the DualEnroll application.
 */

import { generateApplicationFixture } from './applicationFixtureGenerator';
import { getMergedWorkflow } from '../ScenarioOperations';
/**
 * Generate a Ruby fixture file based on workflow data
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {Object} collegeData - College information (name, id, city, etc.)
 * @param {Object} options - Additional options for generation
 * @returns {string} - Ruby fixture file content
 */
export const generateRubyFixture = (workflowData, collegeData, options = {}) => {
  // Create a safe variable name for the college
  const collegeVarName = collegeData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Extract scenarios and steps
  const { scenarios, workflowName } = workflowData;
  
  // Generate version numbers for different workflow types
  const versionNumbers = generateVersionNumbers(scenarios);
  
  // Start building the Ruby code
  let rubyCode = generateFileHeader(collegeVarName, collegeData.id, versionNumbers);
  
  // Generate ActiveFlowDefinitions for each workflow category
  const workflowCategories = identifyWorkflowCategories(scenarios);
  
  // Generate college-specific code
  rubyCode += generateCollegeSetup(collegeVarName, collegeData);
  
  // Include application fields if requested
  if (options.includeApplicationFields) {
    rubyCode += generateApplicationFixture(collegeVarName, collegeData.id);
  }
  
  // Generate each workflow category's ActiveFlowDefinition
  workflowCategories.forEach(category => {
    rubyCode += generateActiveFlowDefinition(collegeVarName, category, versionNumbers, scenarios);
  });
  

  
  return rubyCode;
};

/**
 * Generate version numbers for different workflow types
 * @param {Object} scenarios - All scenarios from the workflow
 * @returns {Object} - Version numbers for different workflow types
 */
const generateVersionNumbers = (scenarios) => {
  return {
    college_student_application: 1,
    student_term_academic_year: 1,
    student_term: 1,
    registration: 1
  };
};

/**
 * Identify workflow categories from the scenarios
 * @param {Object} scenarios - All scenarios from the workflow
 * @returns {Array} - List of workflow categories
 */
const identifyWorkflowCategories = (scenarios) => {
  // All possible workflow categories
  const allPossibleCategories = [
    {
      name: 'college_student_application',
      targetObject: 'CollegeStudentApplication',
      category: 'registration_one_time',
      displayName: 'One Time Per-Student Parent Consent'
    },
    {
      name: 'student_term_academic_year',
      targetObject: 'StudentTerm',
      category: 'registration_academic_year',
      displayName: 'Academic Year Per-Student'
    },
    {
      name: 'student_term',
      targetObject: 'StudentTerm',
      category: 'registration',
      displayName: 'Per-Term Per-Student'
    },
    {
      name: 'registration',
      targetObject: 'StudentDeCourse',
      category: 'registration',
      displayName: 'Registration'
    }
  ];
  
  // Get all merged steps from all scenarios
  const allSteps = getMergedWorkflow(scenarios);
  
  // Check which workflow categories are actually used in the steps
  const usedCategories = new Set();
  
  // Always include Registration workflow as it's the main entry point
  usedCategories.add('registration');
  
  // Check for specific workflow categories in the steps
  allSteps.forEach(step => {
    const stepCategory = step.workflow_category ? step.workflow_category.toLowerCase() : '';
    
    if (stepCategory.includes('one time')) {
      usedCategories.add('college_student_application');
    }
    
    if (stepCategory.includes('academic year') || stepCategory.includes('per academic year')) {
      usedCategories.add('student_term_academic_year');
    }
    
    if (stepCategory.includes('per term')) {
      usedCategories.add('student_term');
    }
  });
  
  // Return only the categories that are actually used in the workflow
  return allPossibleCategories.filter(category => usedCategories.has(category.name));
};

/**
 * Generate the file header with version numbers
 * @param {string} collegeVarName - The college variable name
 * @param {string} collegeId - The college ID
 * @param {Object} versionNumbers - Version numbers for different workflow types
 * @returns {string} - Ruby code for the file header
 */
const generateFileHeader = (collegeVarName, collegeId, versionNumbers) => {
  return `${collegeVarName}_id = ${collegeId}

${collegeVarName}_college_student_application_active_flow_definition_version_number = ${versionNumbers.college_student_application}
${collegeVarName}_student_term_academic_year_active_flow_definition_version_number = ${versionNumbers.student_term_academic_year}
${collegeVarName}_student_term_active_flow_definition_version_number = ${versionNumbers.student_term}
${collegeVarName}_registration_active_flow_definition_version_number = ${versionNumbers.registration}

`;
};

/**
 * Generate college setup code
 * @param {string} collegeVarName - The college variable name
 * @param {Object} collegeData - College information (name, id, city, etc.)
 * @returns {string} - Ruby code for college setup
 */
const generateCollegeSetup = (collegeVarName, collegeData) => {
  return `# College attributes to override
college_always_update_attributes = {
  inst_name: "${collegeData.name}",
  admission_application_url: nil,
  branded_host: '${collegeVarName}',
}

# Update or create College
if College.exists?(id: ${collegeVarName}_id)
  College.update(${collegeVarName}_id, college_always_update_attributes)
else
  College.seed(:id,
    {
      # id will be set by seed-fu based on the first argument
      ope_id: "00000000",
      type_label: "${collegeData.type || 'Public: 2-year'}",
      type_level: 2, profit: false,
      city: "${collegeData.city || 'City'}",
      state: "${collegeData.state || 'ST'}",
      zip: "${collegeData.zip || '00000'}",
      phone: "${collegeData.phone || '0000000000'}",
      url: "${collegeData.url || 'www.example.edu'}",
      enrollment: 0,
    }.merge(college_always_update_attributes)
  )
end

College.find(${collegeVarName}_id).set_local_option(LocalOption::College::USE_COLLEGE_STUDENT_APPLICATION, true)

`;
};

/**
 * Generate ActiveFlowDefinition code for a specific workflow category
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @param {Object} versionNumbers - Version numbers for different workflow types
 * @param {Object} scenarios - All scenarios from the workflow
 * @returns {string} - Ruby code for ActiveFlowDefinition
 */
const generateActiveFlowDefinition = (collegeVarName, category, versionNumbers, scenarios) => {
  const versionNumber = versionNumbers[category.name];
  const varName = `${collegeVarName}_${category.name}_active_flow_definition`;
  
  let code = `# ${collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1)} ActiveFlowDefinition for ${category.targetObject} (${category.category}).
afd = ActiveFlowDefinition.where(owner_id: ${collegeVarName}_id, owner_type: 'College', target_object_type: '${category.targetObject}', category: '${category.category}')
if afd.present? && afd.first.version_number < ${collegeVarName}_${category.name}_active_flow_definition_version_number
  afd_id = afd.first.id
  afd.first.destroy
  afd = nil
end

if afd.blank?
  ${varName} = ActiveFlowDefinition.create({
    name: '${collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1)} ${category.displayName}',
    version_number: ${collegeVarName}_${category.name}_active_flow_definition_version_number,
    description: '${collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1)} ${category.targetObject} ActiveFlowDefinition',
    category: '${category.category}',
    target_object_type: '${category.targetObject}',
    owner_type: 'College',
    owner_id: ${collegeVarName}_id
  })
  if ${varName}.persisted?

    ActiveFlowStepTrigger.create([
`;

  // Add steps based on the workflow category
  code += generateStepsForCategory(collegeVarName, category, versionNumber, scenarios);

  code += `    ])
  end
end

`;

  return code;
};

/**
 * Map workflow category to ActiveFlowDefinition category
 * @param {string} workflowCategory - The workflow category from the step
 * @returns {string} - The corresponding ActiveFlowDefinition category
 */
const getWorkflowCategoryKey = (workflowCategory) => {
  if (!workflowCategory) return 'registration'; // Default to registration
  
  switch (workflowCategory.toLowerCase()) {
    case 'one time':
      return 'registration_one_time';
    case 'academic year':
      return 'registration_academic_year';
    case 'per term':
      return 'registration';  // Per Term steps go in the main StudentTerm flow
    case 'per course':
      return 'registration';  // Per Course steps go in the main registration flow
    default:
      return 'registration';
  }
};

/**
 * Generate ActiveFlowStepTrigger code for steps in a workflow category
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @param {number} versionNumber - The version number for this workflow category
 * @param {Object} scenarios - All scenarios from the workflow
 * @returns {string} - Ruby code for ActiveFlowStepTrigger entries
 */
const generateStepsForCategory = (collegeVarName, category, versionNumber, scenarios) => {
  let code = '';
  const varName = `${collegeVarName}_${category.name}_active_flow_definition`;
  // Get all used categories to determine which ones to pend
  const usedCategories = identifyWorkflowCategories(scenarios);
  // Get all merged steps from all scenarios
  const allSteps = getMergedWorkflow(scenarios);
  
  // Filter steps based on workflow category
  const categorySteps = allSteps.filter(step => {
    const stepCategory = getWorkflowCategoryKey(step.workflow_category);
    return stepCategory === category.category;
  });
  const waitForCompletionOfOneTimeStepsStep = {
    stepType: 'WaitForCompletionOfOneTimeSteps',
    title: 'Completion of One-Time Steps',
    version: `${collegeVarName}_student_term_academic_year_active_flow_definition_version_number`,
    participant: 'Pending',
    step_class: 'WaitForSubordinateRegistrationActiveFlowCompletionStep',
    view_name_override: '',
    parameters: {
      'inject_subordinate_registration_active_flow_fields': [
        'esign_enrollment_form_parent_date',
        'esign_enrollment_form_parent_name',
        'failure_reason',
      ],
      'subordinate_registration_active_flow_target_object_type': 'CollegeStudentApplication',
      'subordinate_registration_active_flow_category': 'registration_one_time',
      'completion_state': 'one_time_workflow_complete',
    },
    participant_role: 'system',
    soft_required_fields: ['initialization_complete'],
  };
  const waitForCompletionOfAcademicYearStepsStep = {
    id: 'step_3',
    stepType: 'waitForCompletionOfAcademicYearSteps',
    title: 'Completion of Academic Year Steps',
    version: `${collegeVarName}_student_term_academic_year_active_flow_definition_version_number`,
    participant: 'Pending',
    step_class: 'WaitForSubordinateRegistrationActiveFlowCompletionStep',
    view_name_override: '',
    parameters: {
      'inject_subordinate_registration_active_flow_fields': [
        'esign_enrollment_form_parent_date',
        'esign_enrollment_form_parent_name',
      ],
      'subordinate_registration_active_flow_target_object_type': 'StudentDeCourse',
      'subordinate_registration_active_flow_category': 'registration_academic_year',
      'completion_state': 'academic_year_workflow_complete',
    },
    participant_role: 'system',
    soft_required_fields: ['initialization_complete'],
  };
  const waitForCompletionOfPerTermStepsStep = {
    id: 'step_4',
    stepType: 'waitForCompletionOfPerTermSteps',
    title: 'Completion of Per Term Steps',
    version: `${collegeVarName}_student_term_academic_year_active_flow_definition_version_number`,
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
    soft_required_fields: ['initialization_complete'],
  };
  
  const initializeClassName = category.name === 'registration' ? 'CourseRegistration' : category.targetObject;
  const initializationStep = {
    id: 'step_1',
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
  // Add filtered steps based on workflow category
  if (categorySteps.length > 0) {
    // First add any default steps for this category
    switch (category.name) {
      case 'college_student_application':
        categorySteps.unshift(initializationStep);
        break;
      case 'student_term_academic_year':
        categorySteps.unshift(waitForCompletionOfOneTimeStepsStep);
        categorySteps.unshift(initializationStep);
        break;
      case 'student_term':
        if (usedCategories.some(obj => obj.name === 'registration_academic_year')) {
          categorySteps.unshift(waitForCompletionOfAcademicYearStepsStep);
        }
        categorySteps.unshift(waitForCompletionOfOneTimeStepsStep);
        categorySteps.unshift(initializationStep);
        break;
      case 'registration':
        if (usedCategories.some(obj => obj.name === 'registration_per_term')) {
          categorySteps.unshift(waitForCompletionOfPerTermStepsStep);   
        }
        if (usedCategories.some(obj => obj.name === 'registration_academic_year')) {
          categorySteps.unshift(waitForCompletionOfAcademicYearStepsStep);
        }
        categorySteps.unshift(waitForCompletionOfOneTimeStepsStep);
        categorySteps.unshift(initializationStep);
      break;
    }

    const completeOneTimeWorkflowStep = {
      id: 'step_5',
      stepType: 'CompleteOneTimeWorkflow',
      title: 'Complete One-Time Workflow',
      version: `${collegeVarName}_college_student_application_active_flow_definition_version_number`,
      participant: 'Processing',
      step_class: 'CompleteSubordinateRegistrationActiveFlowStep',
      view_name_override: '',
      parameters: {
        'subordinate_registration_active_flow_target_object_type': 'CollegeStudentApplication',
        'subordinate_registration_active_flow_category': 'registration_one_time',
      },
      participant_role: 'system'
    }
    const failedOneTimeWorkflowStep = {
      id: 'step_6',
      stepType: 'FailedOneTimeWorkflow',
      title: 'Failed One-Time Workflow',
      version: `${collegeVarName}_college_student_application_active_flow_definition_version_number`,
      participant: 'Processing',
      step_class: 'DeclineSubordinateRegistrationActiveFlowStep',
      view_name_override: '',
      parameters: {},
      participant_role: 'system',
      soft_required_fields: []
    }
    const completeRegistrationWorkflowStep = {
      id: 'step_7',
      stepType: 'CompleteRegistrationWorkflow',
      title: 'Successful Registration',
      version: `${collegeVarName}_registration_active_flow_definition_version_number`,
      participant: 'Processing',
      step_class: 'SuccessfulRegistrationActiveFlowStep',
      view_name_override: '',
      parameters: {
        'subordinate_registration_active_flow_target_object_type': 'Registration',
        'subordinate_registration_active_flow_category': 'registration',
      },
      participant_role: 'system',
      soft_required_fields: ['registration_response_yes']
    }
    // Add category-specific completion step
    switch (category.name) {
      case 'college_student_application':
        categorySteps.push(completeOneTimeWorkflowStep);
        categorySteps.push(failedOneTimeWorkflowStep);
        break;
      case 'student_term_academic_year':
        break;
      case 'student_term':
        break;
      case 'registration':
        categorySteps.push(completeRegistrationWorkflowStep);
        break;
    }
    // Now add the custom steps for this category
    categorySteps.forEach((step, index) => {
      code += generateStepForCategory(step, collegeVarName, varName, index, categorySteps);
    });
  }
  return code;
};


/**
 * Generate code for a single step in the Registration workflow
 * @param {Object} step - Step data from the workflow
 * @param {string} collegeVarName - The college variable name
 * @param {string} varName - The ActiveFlowDefinition variable name
 * @param {number} index - The step index
 * @param {Array} allSteps - All steps in the workflow
 * @returns {string} - Ruby code for the step
 */
const generateStepForCategory = (step, collegeVarName, varName, index, allSteps) => {
  // Set up default values
  const completionState = getCompletionState(step);
  const stepClass = getStepClass(step);
  const viewOverride = getViewOverride(step);
  const parameters = getParameters(step, completionState);
  const participantRole = getParticipantRole(step);
  const softRequiredFields = getSoftRequiredFields(step, index, allSteps);
  
  return `
      {
        active_flow_definitions: [${varName}],
        name: '${step.title || 'Step ' + (index + 1)}',
        version: ${collegeVarName}_registration_active_flow_definition_version_number,
        description: '',
        participant: '${getParticipant(step)}',
        step_class: '${stepClass}',
        view_name_override: '${viewOverride}',
        parameters: ${parameters},
        participant_role: '${participantRole}',
        soft_required_fields: [${softRequiredFields}]
      },
`;
};

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
  } else if (step.stepType === 'Initialization' ) {
    return "initialization_complete"
  } else if (step.stepType === 'WaitForCompletionOfOneTimeSteps') {
    return "one_time_workflow_complete"
  } else {
    return snakeCase(step.title || 'complete');
  }
};

/**
 * Get the step class name based on step type
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Step class name
 */
const getStepClass = (step) => {
  switch (step.stepType) {
    case 'Approval':
      return step.title === 'Parent Consent' ? 'ProvideConsentStep': 'ApprovalStep';
    case 'Upload':
      return 'UploadDocumentStep';
    case 'Info':
      return 'InfoStep';
    default:
      return step.step_class;
  }
};

/**
 * Get the view override path for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - View override path
 */
const getViewOverride = (step) => {
  console.log(`GETTING VIEW OVERRIDE FOR STEP: ${JSON.stringify(step)}`);
  if (step.participant_role === 'system' ){
    return '';
  }
  if (step.viewNameOverride){
    return step.viewNameOverride;
  } else if (step.role === 'High School'){
    if (step.workflow_category === 'Per Course' && step.stepType === 'Approval'){
      return 'active_flow_steps/course_registration/high_school/confirm_enrollment'
    }
  } else if (step.role === 'College'){
    if (step.workflow_category === 'Per Course' && step.stepType === 'Approval'){
      return 'active_flow_steps/course_registration/college/review_course'
    }
  }
  const role = step.role || 'student';
  const action = getActionName(step);
  
  return `active_flow_steps/course_registration/${role.toLowerCase()}/${action}`;
};

/**
 * Get the action name for a view path
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Action name for the view path
 */
const getActionName = (step) => {
  switch (step.stepType) {
    case 'approval':
      return 'approve';
    case 'upload':
      return 'provide_additional_info';
    case 'info':
      return 'info';
    default:
      return 'approve';
  }
};

/**
 * Generate parameters hash for a step
 * @param {Object} step - Step data from the workflow
 * @param {string} completionState - Completion state name
 * @returns {string} - Ruby hash representation of parameters
 */
const getParameters = (step, completionState) => {
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
  
  // For upload steps, add document class and types
  if (step.stepType === 'Upload') {
    params['document_class'] = 'StudentDocument';
    params['kinds'] = step.documentTypes || ['other'];
    
    // Add clear_states_by_completion parameters for upload steps
    // This allows steps to properly handle the 'return' case
    if (completionState) {
      params['clear_states_by_completion'] = {
        'return': [
          completionState,
          `${completionState}_return`,
          `${completionState}_complete`
        ]
      };
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
      
      // Add feedback trigger states to clear on completion
      Object.keys(step.feedbackLoops).forEach(feedbackId => {
        if (!params['clear_states_by_completion']['yes']) {
          params['clear_states_by_completion']['yes'] = [];
        }
        params['clear_states_by_completion']['yes'].push(`${completionState}_feedback_${feedbackId}`);
      });
    }
  }
  
  return serializeToRubyHash(params);
};

/**
 * Helper function to convert a JavaScript object to a Ruby hash string representation
 * @param {Object} obj - The object to convert
 * @returns {string} - Ruby hash string representation
 */
const serializeToRubyHash = (obj) => {
  if (!obj || Object.keys(obj).length === 0) {
    return "{}";
  }
  
  const serializeValue = (value) => {
    if (value === null || value === undefined) {
      return 'nil';
    } else if (typeof value === 'string') {
      return `'${value}'`;
    } else if (Array.isArray(value)) {
      return `[${value.map(v => serializeValue(v)).join(', ')}]`;
    } else if (typeof value === 'object') {
      const entries = Object.entries(value).map(([k, v]) => {
        return `'${k}' => ${serializeValue(v)}`;
      }).join(', ');
      return `{${entries}}`;
    } else {
      return value.toString();
    }
  };
  
  const entries = Object.entries(obj).map(([key, value]) => {
    return `'${key}' => ${serializeValue(value)}`;
  }).join(', ');
  
  return `{ ${entries} }`;
};

/**
 * Get the participant role for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Participant role
 */
const getParticipantRole = (step) => {
  if (step.role) {
    switch (step.role.toLowerCase()) {
      case 'college':
        return 'coll';
      case 'high school':
        return 'hs';
      case 'student':
        return 'student';
      case 'parent':
        return 'parent';
      case 'approver':
        return 'approver';
      case 'processing':
      case 'system':
        return 'system';
      default:
        return step.role.toLowerCase();
    }
  }
  
  return 'system';
};

/**
 * Get the participant name for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Participant name
 */
const getParticipant = (step) => {
  if (step.role) {
    switch (step.role.toLowerCase()) {
      case 'college':
        return 'College';
      case 'high school':
        return 'High School';
      case 'student':
        return 'Student';
      case 'parent':
        return 'Parent';
      case 'approver':
        return 'Approver';
      case 'processing':
      case 'system':
        if (step.participant){
          return step.participant;
        }
        return 'Processing';
      default:
        return step.role;
    }
  }
  
  return 'Processing';
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
  
  // For approval steps, we typically have yes/no/declined states
  if (step.stepType === 'Approval') {
    return [baseState, `${baseState}_yes`, `${baseState}_no`, `${baseState}_declined`];
  }
  
  // For upload steps, we typically have complete/return states
  if (step.stepType === 'Upload') {
    return [baseState, `${baseState}_complete`, `${baseState}_return`];
  }
  
  // Default case
  return [baseState, `${baseState}_complete`];
};

/**
 * Get the soft required fields for a step
 * @param {Object} step - Step data from the workflow
 * @param {number} index - The step index
 * @param {Array} allSteps - All steps in the workflow category
 * @returns {string} - Comma-separated list of soft required fields
 */
const getSoftRequiredFields = (step, index, allSteps) => {
  console.log('getSoftRequiredFields', step, index, allSteps);
  const fields = [];
  
  // Special handling for feedback steps
  if (step.isFeedbackStep && step.feedbackRelationship) {
    // Find the parent step
    const parentStepId = step.feedbackRelationship.parentStepId;
    const parentStep = allSteps.find(s => s.id === parentStepId);
    
    if (parentStep) {
      // For feedback steps, depend on the appropriate feedback trigger state from the parent
      const feedbackId = step.feedbackRelationship.feedbackId;
      const feedbackTriggerState = `${getCompletionState(parentStep)}_feedback_${feedbackId}`;
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
  
  // For non-first steps, we need to determine dependencies
  // For scenario-specific steps, always add the scenario condition
  if (step.scenarioId && step.scenarioId !== 'main' && step.scenarioCondition) {
    fields.push(snakeCase(step.scenarioCondition));
  }
  
  // If the step has explicit workflowCondition fields, add those
  if (step.conditional && step.workflowCondition && step.workflowCondition.length > 0) {
    step.workflowCondition.forEach(condition => {
      fields.push(snakeCase(condition));
    });
  }
  
  // Get the previous step to create a dependency

  // If the previous step is scenario-specific and this one isn't, go back to the most recent non-scenario condition
  let previousStep = allSteps[index - 1];
  if (previousStep && previousStep.scenarioId && previousStep.scenarioId !== step.scenarioId) {
    console.log('previousStep.scenarioId', previousStep.scenarioId);
    console.log('step.scenarioId', step.scenarioId);
    // Find the most recent step with a matching scenario or matching lack of scenario
    // the main scenarios will just not have any scenarioId
    let matchingStepFound = false
    while(!matchingStepFound) {
      previousStep = allSteps[index - 1];
      if (previousStep.scenarioId && previousStep.scenarioId !== step.scenarioId) {
        index--;
      } else {
        matchingStepFound = true;
      }
    }


  }
  // similar problem if the previous step is feedback step, gotta go back
  if (previousStep && previousStep.isFeedbackStep && previousStep.feedbackRelationship) {
    let matchingStepFound = false
    while(!matchingStepFound) {
      previousStep = allSteps[index - 1];
      if (previousStep.isFeedbackStep && previousStep.feedbackRelationship) {
        index--;
      } else if (previousStep.scenarioId && previousStep.scenarioId !== step.scenarioId) {
        index--;
      } else {
        matchingStepFound = true;
      }
    }
  }

  
  if (previousStep) {
    // If the previous step is a system step with a completion_state parameter, use that
    if (previousStep.parameters && 
        previousStep.parameters.completion_state) {
      fields.push(previousStep.parameters.completion_state);
    }else {
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
  
  // Handle special cases for common step types
  if (step.title) {
    const title = step.title.toLowerCase();
    
    // For student term related steps, add dependencies
    if (title.includes('term') || title.includes('academic year')) {
      if (!fields.some(f => f.includes('student_term_complete'))) {
        fields.push('student_term_complete');
      }
    }
    
    // For prerequisite or transcript related steps
    if (title.includes('prereq') || title.includes('transcript')) {
      if (step.title.toLowerCase().includes('review') && !fields.some(f => f.includes('upload_transcript_complete'))) {
        fields.push('upload_transcript_complete');
      }
    }
    
    // For steps that include 'Review' in their titles
    if (title.includes('review') && step.role && step.role.toLowerCase() === 'college') {
      // Add a dependency on the previous step's completion
      if (previousStep && previousStep.stepType === 'Upload') {
        fields.push(`${getCompletionState(previousStep)}_complete`);
      }
    }
  }
  
  // Return formatted fields, ensuring no duplicates
  const uniqueFields = [...new Set(fields)];
  return uniqueFields.map(field => `'${field}'`).join(', ');
};

/**
 * Convert a string to snake_case
 * @param {string} str - The string to convert
 * @returns {string} - snake_case string
 */
const snakeCase = (str) => {
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_');
};
