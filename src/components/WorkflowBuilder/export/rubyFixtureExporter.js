/**
 * Ruby Fixture Exporter Utility
 * 
 * This utility converts workflow data from the workflow builder into a Ruby fixture file format
 * that can be used in the DualEnroll application.
 */

import { generateApplicationFixture } from './applicationFixtureGenerator';

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
  // Default categories that are typically present in most workflows
  const defaultCategories = [
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
  
  // TODO: Custom logic to identify actual categories from the workflow scenarios
  // For now, return the default categories
  return defaultCategories;
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
  
  // We need to determine which steps belong to this category
  // For demonstration purposes, let's generate some standard steps for each category
  
  // Generate standard initialization step
  code += `      {
        active_flow_definitions: [${varName}],
        name: 'Initialize ${category.displayName} Workflow',
        version: ${collegeVarName}_${category.name}_active_flow_definition_version_number,
        description: '',
        participant: 'Processing',
        step_class: 'Initialize${collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1)}${category.targetObject}Step',
        view_name_override: '',
        parameters: '',
        participant_role: 'system',
        soft_required_fields: []
      },
`;

  // Add more steps based on the category
  switch (category.name) {
    case 'college_student_application':
      code += generateCollegeStudentApplicationSteps(collegeVarName, varName);
      break;
    case 'student_term_academic_year':
      code += generateStudentTermAcademicYearSteps(collegeVarName, varName);
      break;
    case 'student_term':
      code += generateStudentTermSteps(collegeVarName, varName);
      break;
    case 'registration':
      code += generateRegistrationSteps(collegeVarName, varName, scenarios);
      break;
  }

  return code;
};

/**
 * Generate steps for CollegeStudentApplication workflow
 * @param {string} collegeVarName - The college variable name
 * @param {string} varName - The ActiveFlowDefinition variable name
 * @returns {string} - Ruby code for CollegeStudentApplication steps
 */
const generateCollegeStudentApplicationSteps = (collegeVarName, varName) => {
  return `
      {
        active_flow_definitions: [${varName}],
        name: 'Provide Consent',
        version: ${collegeVarName}_college_student_application_active_flow_definition_version_number,
        description: '',
        participant: 'Parent',
        step_class: 'ProvideConsentStep',
        view_name_override: '',
        parameters: { 'consent' => 'all' },
        participant_role: 'parent',
        soft_required_fields: ['initialization_complete']
      },

      {
        active_flow_definitions: [${varName}],
        name: 'Complete One-Time Workflow',
        version: ${collegeVarName}_college_student_application_active_flow_definition_version_number,
        description: '',
        participant: 'Processing',
        step_class: 'CompleteSubordinateRegistrationActiveFlowStep',
        view_name_override: '',
        parameters: {
          'subordinate_registration_active_flow_target_object_type' => 'CollegeStudentApplication',
          'subordinate_registration_active_flow_category' => 'registration_one_time',
        },
        participant_role: 'system',
        soft_required_fields: ['parent_consent_provided']
      },

      {
        active_flow_definitions: [${varName}],
        name: 'Failed One-Time Workflow',
        version: ${collegeVarName}_college_student_application_active_flow_definition_version_number,
        description: '',
        participant: 'Processing',
        step_class: 'DeclineSubordinateRegistrationActiveFlowStep',
        view_name_override: '',
        parameters: {},
        participant_role: 'system',
        soft_required_fields: []
      },
`;
};

/**
 * Generate steps for StudentTerm Academic Year workflow
 * @param {string} collegeVarName - The college variable name
 * @param {string} varName - The ActiveFlowDefinition variable name
 * @returns {string} - Ruby code for StudentTerm Academic Year steps
 */
const generateStudentTermAcademicYearSteps = (collegeVarName, varName) => {
  return `
      {
        active_flow_definitions: [${varName}],
        name: 'Completion of One-Time Steps',
        version: ${collegeVarName}_student_term_academic_year_active_flow_definition_version_number,
        description: '',
        participant: 'Pending',
        step_class: 'WaitForSubordinateRegistrationActiveFlowCompletionStep',
        view_name_override: '',
        parameters: {
          'inject_subordinate_registration_active_flow_fields' => [
            'esign_enrollment_form_parent_date',
            'esign_enrollment_form_parent_name',
          ],
          'subordinate_registration_active_flow_target_object_type' => 'CollegeStudentApplication',
          'subordinate_registration_active_flow_category' => 'registration_one_time',
          'completion_state' => 'one_time_workflow_complete',
        },
        participant_role: 'system',
        soft_required_fields: ['initialization_complete']
      },

      {
        active_flow_definitions: [${varName}],
        name: 'Approve Student Participation',
        version: ${collegeVarName}_student_term_academic_year_active_flow_definition_version_number,
        description: '',
        participant: 'High School',
        step_class: 'ApprovalStep',
        view_name_override: 'active_flow_steps/course_registration/high_school/approve_student',
        parameters: {
          'completion_state' => 'approve_student',
        },
        participant_role: 'hs',
        soft_required_fields: ['one_time_workflow_complete', 'high_school']
      },

      {
        active_flow_definitions: [${varName}],
        name: 'Complete Academic Year Workflow',
        version: ${collegeVarName}_student_term_academic_year_active_flow_definition_version_number,
        description: '',
        step_class: 'CompleteSubordinateRegistrationActiveFlowStep',
        view_name_override: '',
        parameters: {
          'subordinate_registration_active_flow_target_object_type' => 'StudentTerm',
          'subordinate_registration_active_flow_category' => 'registration_academic_year',
        },
        participant: 'Processing',
        participant_role: 'system',
        soft_required_fields: ['approve_student_yes']
      },
`;
};

/**
 * Generate steps for StudentTerm workflow
 * @param {string} collegeVarName - The college variable name
 * @param {string} varName - The ActiveFlowDefinition variable name
 * @returns {string} - Ruby code for StudentTerm steps
 */
const generateStudentTermSteps = (collegeVarName, varName) => {
  return `
      {
        active_flow_definitions: [${varName}],
        name: 'Complete Per Term Workflow',
        version: ${collegeVarName}_student_term_active_flow_definition_version_number,
        description: '',
        step_class: 'CompleteSubordinateRegistrationActiveFlowStep',
        view_name_override: '',
        parameters: {
          'subordinate_registration_active_flow_target_object_type' => 'StudentTerm',
          'subordinate_registration_active_flow_category' => 'registration',
        },
        participant: 'Processing',
        participant_role: 'system',
        soft_required_fields: ['initialization_complete']
      },

      {
        active_flow_definitions: [${varName}],
        name: 'Decline Per Term Workflow',
        version: ${collegeVarName}_student_term_active_flow_definition_version_number,
        description: '',
        participant: 'Processing',
        step_class: 'DeclineStudentTermStep',
        view_name_override: '',
        parameters: {
          'mailer_signatures' => [
          [:failure, { override_roles: 'student', template: 'student_college_rejection' }]
          ]
        },
        participant_role: 'system',
        soft_required_fields: []
      },
`;
};

/**
 * Generate steps for Registration workflow
 * @param {string} collegeVarName - The college variable name
 * @param {string} varName - The ActiveFlowDefinition variable name
 * @param {Object} scenarios - All scenarios from the workflow
 * @returns {string} - Ruby code for Registration steps
 */
const generateRegistrationSteps = (collegeVarName, varName, scenarios) => {
  // Start with common steps
  let code = `
      {
        active_flow_definitions: [${varName}],
        name: 'Completion of One-Time Steps',
        version: ${collegeVarName}_registration_active_flow_definition_version_number,
        description: '',
        participant: 'Pending',
        step_class: 'WaitForSubordinateRegistrationActiveFlowCompletionStep',
        view_name_override: '',
        parameters: {
          'inject_subordinate_registration_active_flow_fields' => ['esign_enrollment_form_parent_date','esign_enrollment_form_parent_name'],
          'subordinate_registration_active_flow_target_object_type' => 'CollegeStudentApplication',
          'subordinate_registration_active_flow_category' => 'registration_one_time',
          'completion_state' => 'one_time_workflow_complete',
        },
        participant_role: 'system',
        soft_required_fields: ['initialization_complete']
      },

      {
        active_flow_definitions: [${varName}],
        name: 'Completion of Acad Year Steps',
        version: ${collegeVarName}_registration_active_flow_definition_version_number,
        description: '',
        participant: 'Pending',
        step_class: 'WaitForSubordinateRegistrationActiveFlowCompletionStep',
        view_name_override: '',
        parameters: {
          'inject_subordinate_registration_active_flow_fields' => [],
          'subordinate_registration_active_flow_target_object_type' => 'StudentTerm',
          'subordinate_registration_active_flow_category' => 'registration_academic_year',
          'completion_state' => 'student_acad_year_complete',
        },
        participant_role: 'system',
        soft_required_fields: ['one_time_workflow_complete']
      },

      {
        active_flow_definitions: [${varName}],
        name: 'Completion of Per Term Steps',
        version: ${collegeVarName}_registration_active_flow_definition_version_number,
        description: '',
        participant: 'Pending',
        step_class: 'WaitForSubordinateRegistrationActiveFlowCompletionStep',
        view_name_override: '',
        parameters: {
          'inject_subordinate_registration_active_flow_fields' => [],
          'subordinate_registration_active_flow_target_object_type' => 'StudentTerm',
          'subordinate_registration_active_flow_category' => 'registration',
          'completion_state' => 'student_term_complete',
        },
        participant_role: 'system',
        soft_required_fields: ['student_acad_year_complete']
      },
`;

  // Get the main scenario steps
  if (scenarios && scenarios.main && scenarios.main.steps) {
    const mainSteps = scenarios.main.steps;
    
    // Generate step code based on main scenario steps
    mainSteps.forEach((step, index) => {
      code += generateStepForRegistration(step, collegeVarName, varName, index);
    });
  }
  
  // Add standard completion steps
  code += `
      {
        active_flow_definitions: [${varName}],
        name: 'Successful Registration',
        version: ${collegeVarName}_registration_active_flow_definition_version_number,
        description: '',
        participant: 'Processing',
        step_class: 'CompleteRegistrationStep',
        view_name_override: '',
        parameters: '',
        participant_role: 'system',
        soft_required_fields: ['registration_response_yes']
      },
`;

  return code;
};

/**
 * Generate code for a single step in the Registration workflow
 * @param {Object} step - Step data from the workflow
 * @param {string} collegeVarName - The college variable name
 * @param {string} varName - The ActiveFlowDefinition variable name
 * @param {number} index - The step index
 * @returns {string} - Ruby code for the step
 */
const generateStepForRegistration = (step, collegeVarName, varName, index) => {
  // Set up default values
  const completionState = getCompletionState(step);
  const stepClass = getStepClass(step);
  const viewOverride = getViewOverride(step);
  const parameters = getParameters(step, completionState);
  const participantRole = getParticipantRole(step);
  const softRequiredFields = getSoftRequiredFields(step, index);
  
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
  if (step.stepType === 'approval') {
    return snakeCase(step.title || 'approve');
  } else if (step.stepType === 'upload') {
    return snakeCase(step.title || 'upload_document');
  } else {
    return '';
  }
};

/**
 * Get the step class name based on step type
 * @param {Object} step - Step data from the workflow
 * @returns {string} - Step class name
 */
const getStepClass = (step) => {
  switch (step.stepType) {
    case 'approval':
      return 'ApprovalStep';
    case 'upload':
      return 'UploadDocumentStep';
    case 'info':
      return 'InfoStep';
    default:
      return 'ApprovalStep';
  }
};

/**
 * Get the view override path for a step
 * @param {Object} step - Step data from the workflow
 * @returns {string} - View override path
 */
const getViewOverride = (step) => {
  if (step.stepType === 'system') {
    return '';
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
  if (step.stepType === 'system') {
    return "''";
  }
  
  let params = {};
  
  if (completionState) {
    params['completion_state'] = completionState;
  }
  
  if (step.stepType === 'upload') {
    params['document_class'] = 'StudentDocument';
    params['kinds'] = step.documentTypes || ['other'];
  }
  
  // Convert to Ruby hash string
  if (Object.keys(params).length === 0) {
    return "{}";
  }
  
  const paramsStr = Object.entries(params).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `'${key}' => [${value.map(v => `'${v}'`).join(', ')}]`;
    } else {
      return `'${key}' => '${value}'`;
    }
  }).join(', ');
  
  return `{ ${paramsStr} }`;
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
        return 'Processing';
      default:
        return step.role;
    }
  }
  
  return 'Processing';
};

/**
 * Get the soft required fields for a step
 * @param {Object} step - Step data from the workflow
 * @param {number} index - The step index
 * @returns {string} - Comma-separated list of soft required fields
 */
const getSoftRequiredFields = (step, index) => {
  const fields = [];
  
  // First step typically requires initialization_complete
  if (index === 0 && !step.workflowCondition) {
    fields.push('initialization_complete');
  } else if (index > 0) {
    // Add dependency on previous step
    fields.push('initialization_complete');
    
    // If the step has a condition, add it
    if (step.workflowCondition && step.workflowCondition.length > 0) {
      step.workflowCondition.forEach(condition => {
        fields.push(snakeCase(condition));
      });
    }
  }
  
  // Return formatted fields
  return fields.map(field => `'${field}'`).join(', ');
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
