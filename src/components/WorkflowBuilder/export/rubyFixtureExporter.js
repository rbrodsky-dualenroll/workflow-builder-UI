/**
 * Ruby Fixture Exporter Utility
 * 
 * This utility converts workflow data from the workflow builder into a Ruby fixture file format
 * that can be used in the DualEnroll application.
 */

import { generateApplicationFixture } from './applicationFixtureGenerator';
import { getMergedWorkflow } from '../ScenarioOperations';

// Import modular components
import getViewOverride from './getViewOverride';
import getStepClass from './getStepClass';
import { getParticipantRole, getParticipant } from './getParticipantInfo';
import { getCompletionState, getCompletionStateValues } from './getCompletionState';
import getParameters from './getParameters';
import getSoftRequiredFields from './getSoftRequiredFields';
import { serializeToRubyHash, snakeCase, getWorkflowCategoryKey } from './utils';
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
  const parameters = getParameters(step, completionState, allSteps);
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


















