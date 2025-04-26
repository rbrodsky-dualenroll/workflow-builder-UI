/**
 * Initializer Generator
 * 
 * This module generates a Ruby initializer class file based on the workflow scenarios
 * to handle setting conditional fields and completion states appropriately.
 */

import { getMergedWorkflow } from '../ScenarioOperations';
import { getCompletionState } from './getCompletionState';
import { snakeCase } from './utils';

/**
 * Map UI property names to actual Ruby model method names
 * @param {string} entity - The entity name (e.g., 'student', 'course')
 * @param {string} property - The property name from the UI
 * @returns {string} - The actual method name in the Ruby model
 */
const mapPropertyToRubyMethod = (entity, property) => {
  // Skip if no entity or property
  if (!entity || !property) return property;
  
  // Convert to lowercase for consistent matching
  const entityLower = entity.toLowerCase();
  const propertyLower = property.toLowerCase();
  
  // Entity-specific method mappings
  const methodMappings = {
    course: {
      'prerequisites': 'requisites',
      'hasprerequisites': 'has_requisites',
      'has_prerequisites': 'has_requisites'
    },
    student: {
      'ishomeschool': 'high_school_is_home_school',
      'is_homeschool': 'high_school_is_home_school',
      'isminor': 'is_minor',
      'is_minor': 'is_minor',
      'hasparentconsent': 'has_parent_consent',
      'has_parent_consent': 'has_parent_consent'
    },
    'high_school': {
      'isnonpartner': 'is_non_partner',
      'is_nonpartner': 'is_non_partner',
      'is_non_partner': 'is_non_partner',
      'ishomeschool': 'is_home_school',
      'is_homeschool': 'is_home_school',
      'is_home_school': 'is_home_school'
    },
    section: {
      'isfull': 'is_full',
      'is_full': 'is_full',
      'enrollmentcount': 'enrollment_count',
      'enrollment_count': 'enrollment_count',
      'capacity': 'capacity'
    }
  };
  
  // If we have a mapping for this entity and property, use it
  if (methodMappings[entityLower] && methodMappings[entityLower][propertyLower]) {
    return methodMappings[entityLower][propertyLower];
  }
  
  // Default to the original property
  return property;
};

/**
 * Helper function to transform a condition into Ruby code
 * @param {Object} condition - The condition object to transform
 * @returns {string} - A string with the Ruby condition
 */
const transformConditionToRuby = (condition) => {
  if (!condition) return null;
  
  console.log('Transforming condition to Ruby:', condition);
  
  let entityVar = '';
  let entity = condition.entity;
  let property = condition.property;
  let comparison = condition.comparison;
  let value = condition.value;
  
  // If we have a method property but not entity, try to parse the method
  if (!entity && condition.method) {
    console.log('Parsing method:', condition.method);
    
    // Try to extract entity and property from method (format: entity_property)
    if (condition.method.includes('_')) {
      const parts = condition.method.split('_');
      entity = parts[0];
      property = parts.slice(1).join('_');
    } else {
      property = condition.method;
    }
    
    // If we still don't have comparison and value, use them from condition
    if (!comparison) comparison = condition.comparison || '==';
    if (value === undefined) value = condition.value;
    
    console.log('Parsed entity:', entity, 'property:', property);
  }
  
  // Map entities to appropriate Ruby variables
  switch (entity) {
    case 'Student':
    case 'student':
      entityVar = 'student';
      break;
    case 'HighSchool':
    case 'high_school':
      entityVar = 'student.high_school';
      break;
    case 'Course':
    case 'course':
      entityVar = 'course';
      break;
    case 'Instructor':
    case 'instructor':
      entityVar = 'instructor';
      break;
    case 'Step':
    case 'step':
      entityVar = 'active_flow_step';
      break;
    default:
      entityVar = snakeCase(entity || 'student');
  }
  
  // Handle special cases for common checks
  if ((entity === 'Student' || entity === 'student') && 
      (property === 'isHomeschool' || property === 'is_homeschool') && 
      (comparison === 'equals' || comparison === '==') && 
      (value === 'true' || value === true)) {
    return `${entityVar}.high_school.is_home_school?`;
  }
  
  if ((entity === 'HighSchool' || entity === 'high_school') && 
      (property === 'type') && 
      (comparison === 'equals' || comparison === '==') && 
      (value === 'Non-Partner')) {
    return `${entityVar}.is_non_partner?(college)`;
  }
  
  if ((entity === 'Course' || entity === 'course') && 
      (property === 'hasPrerequisites' || property === 'has_prerequisites') && 
      (comparison === 'equals' || comparison === '==') && 
      (value === 'true' || value === true)) {
    return `course.has_requisites?`;
  }
  
  // Handle even more special cases based on condition names
  // This section translates common condition names to specific Ruby code expressions
  if (condition.name) {
    const conditionNameLower = condition.name.toLowerCase();
    
    // Home school conditions
    if (conditionNameLower.includes('home_school') || conditionNameLower.includes('homeschool')) {
      return 'student.high_school.is_home_school?';
    }
    
    // Non-partner high school conditions
    if (conditionNameLower.includes('non_partner') || conditionNameLower.includes('nonpartner')) {
      return 'student.high_school.is_non_partner?(college)';
    }
    
    // Course prerequisites conditions
    if (conditionNameLower.includes('prerequisites') || conditionNameLower.includes('prereqs')) {
      return 'course.has_requisites?';
    }
    
    // Parent consent conditions
    if (conditionNameLower.includes('parent_consent')) {
      return 'student.has_parent_consent?';
    }
    
    // Course section full conditions
    if (conditionNameLower.includes('section_full') || conditionNameLower.includes('course_full')) {
      return 'course_section.is_full?';
    }
  }
  
  // Special method detection by common patterns
  if (condition.method) {
    const methodLower = condition.method.toLowerCase();
    
    if (methodLower.includes('is_home_school') || methodLower.includes('home_school')) {
      return 'student.high_school.is_home_school?';
    }
    
    if (methodLower.includes('is_non_partner') || methodLower.includes('non_partner')) {
      return 'student.high_school.is_non_partner?(college)';
    }
    
    if (methodLower.includes('has_requisites') || methodLower.includes('prerequisites')) {
      return 'course.has_requisites?';
    }
  }
  
  // Map property to the correct Ruby method name
  property = mapPropertyToRubyMethod(entity, property);
  
  // For other property-based conditions
  const methodName = property ? snakeCase(property) : (condition.method || '');
  
  // If we have a condition with no parsed method after all this, return null
  if (!methodName) {
    console.warn('Could not determine method name for condition', condition);
    return null;
  }
  
  // Build the Ruby condition based on comparison type
  switch (comparison || condition.comparison) {
    case 'equals':
    case '==':
      if (value === 'true' || value === true) {
        return `${entityVar}.${methodName}?`;
      } else if (value === 'false' || value === false) {
        return `!${entityVar}.${methodName}?`;
      } else {
        // Check if value is numeric
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue.toString() === String(value)) {
          return `${entityVar}.${methodName} == ${value}`;
        }
        return `${entityVar}.${methodName} == '${value}'`;
      }
    case 'not-equals':
    case '!=':
      if (value === 'true' || value === true) {
        return `!${entityVar}.${methodName}?`;
      } else if (value === 'false' || value === false) {
        return `${entityVar}.${methodName}?`;
      } else {
        // Check if value is numeric
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue.toString() === String(value)) {
          return `${entityVar}.${methodName} != ${value}`;
        }
        return `${entityVar}.${methodName} != '${value}'`;
      }
    case 'contains':
    case 'includes':
      return `${entityVar}.${methodName}.to_s.include?('${value}')`;
    case 'not-contains':
      return `!${entityVar}.${methodName}.to_s.include?('${value}')`;
    case 'gt':
    case '>':
      return `${entityVar}.${methodName} > ${value}`;
    case 'lt':
    case '<':
      return `${entityVar}.${methodName} < ${value}`;
    case 'gte':
    case '>=':
      return `${entityVar}.${methodName} >= ${value}`;
    case 'lte':
    case '<=':
      return `${entityVar}.${methodName} <= ${value}`;
    case 'is-set':
    case 'present':
      return `${entityVar}.${methodName}.present?`;
    case 'is-not-set':
    case 'blank':
      return `${entityVar}.${methodName}.blank?`;
    case 'custom':
      return value;
    default:
      return `${entityVar}.${methodName} == '${value}'`;
  }
};

/**
 * Get the workflow completion state from a step
 * @param {Object} step - A workflow step
 * @returns {string|null} - The completion state or null
 */
const getStepCompletionState = (step) => {
  if (!step) return null;
  
  // For approval steps, get the completion state from actionOptions
  if (step.stepType === 'Approval' && step.actionOptions && step.actionOptions.length > 0) {
    // Look for the "approve-yes" action
    const approveAction = step.actionOptions.find(action => action.value === 'approve-yes');
    if (approveAction) {
      return `${snakeCase(step.title)}_yes`;
    }
  }
  
  // For upload steps, use a completion state based on title
  if (step.stepType === 'Upload') {
    return `${snakeCase(step.title)}_complete`;
  }
  
  // For other steps, use a default pattern
  return `${snakeCase(step.title)}_complete`;
};

/**
 * Identify conditional branches and their completion states in a workflow
 * @param {Array} steps - Workflow steps
 * @returns {Object} - Map of condition names to completion states they lead to
 */
const identifyConditionalBranches = (steps) => {
  const conditionalBranches = {};
  
  // First, identify steps that are conditional
  const conditionalSteps = steps.filter(step => step.conditional && step.workflowCondition);
  console.log('Conditional steps in relevant category:', conditionalSteps.length);
  
  if (conditionalSteps.length > 0) {
    console.log('First conditional step:', {
      title: conditionalSteps[0].title,
      conditional: conditionalSteps[0].conditional,
      workflowCondition: conditionalSteps[0].workflowCondition,
      category: conditionalSteps[0].workflow_category
    });
  }
  
  // For each conditional step, find the completion states that would be reached
  conditionalSteps.forEach(conditionalStep => {
    const conditions = Array.isArray(conditionalStep.workflowCondition) ? 
      conditionalStep.workflowCondition : [conditionalStep.workflowCondition];
    
    conditions.forEach(conditionName => {
      if (!conditionalBranches[conditionName]) {
        conditionalBranches[conditionName] = {
          steps: [],
          completionStates: []
        };
      }
      
      conditionalBranches[conditionName].steps.push(conditionalStep);
      
      // Get completion state for this step
      const completionState = getStepCompletionState(conditionalStep);
      if (completionState) {
        conditionalBranches[conditionName].completionStates.push(completionState);
      }
    });
  });
  
  return conditionalBranches;
};

/**
 * Generate a Ruby initializer class file for a specific target object type
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {string} collegeVarName - The college variable name (lowercase, no spaces)
 * @param {string} targetObjectType - The target object type (e.g., 'CollegeStudentApplication', 'StudentTerm', 'StudentDeCourse')
 * @returns {string} - Ruby initializer class code
 */
export const generateInitializerClass = (workflowData, collegeVarName, targetObjectType) => {
  console.log('Initializer generator received conditions:', workflowData.conditions);
  // Determine the appropriate class name
  let classNameSuffix;
  if (targetObjectType === 'StudentDeCourse') {
    classNameSuffix = 'CourseRegistration';
  } else {
    classNameSuffix = targetObjectType;
  }
  
  const collegeCapitalized = collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1);
  const className = `Initialize${collegeCapitalized}${classNameSuffix}Step`;
  
  // Process workflow to extract conditional logic
  const mergedWorkflow = workflowData.scenarios ? 
    getMergedWorkflow(workflowData.scenarios) : 
    workflowData.steps || [];
  console.log('Merged workflow steps count:', mergedWorkflow.length);

  // Filter steps based on workflow category
  const relevantWorkflowCategory = getWorkflowCategoryForTargetObjectType(targetObjectType);
  console.log('Target object type:', targetObjectType, 'Maps to category:', relevantWorkflowCategory);
  
  // Log all workflow categories present in steps
  const workflowCategories = new Set(mergedWorkflow.map(step => step.workflow_category));
  console.log('Workflow categories in steps:', Array.from(workflowCategories));
  
  // Get steps for both approaches - we'll try both ways
  const relevantStepsByCategory = mergedWorkflow.filter(step => 
    step.workflow_category === relevantWorkflowCategory);
  console.log('Steps with matching category:', relevantStepsByCategory.length);
  
  // Get all conditional steps regardless of category
  const allConditionalSteps = getAllConditionalSteps(mergedWorkflow);
  console.log('All conditional steps regardless of category:', allConditionalSteps.length);
  
  // Only use steps from the relevant category
  const relevantSteps = relevantStepsByCategory;
  console.log('Using steps from relevant category for branch identification:', relevantSteps.length);
  
  // Identify conditional branches and completion states
  const conditionalBranches = identifyConditionalBranches(relevantSteps);
  
  // Map conditions to Ruby code
  const conditionToRubyMap = new Map();
  const conditionalCompletionStates = new Map();
  
  // Extract conditions from workflowCondition references in RELEVANT steps only
  const conditionsFromSteps = new Map();
  relevantSteps.filter(step => step.conditional).forEach(step => {
    if (step.workflowCondition && step.workflowCondition.length > 0) {
      step.workflowCondition.forEach(conditionName => {
        // If we haven't seen this condition before, create a placeholder
        if (!conditionsFromSteps.has(conditionName)) {
          // Try to determine the type of condition based on its name
          let condition = {
            fields: [conditionName]
          };
          
          // Add entity/property based on condition name patterns
          if (conditionName.includes('student_is_homeschool')) {
            condition.entity = 'Student';
            condition.property = 'isHomeschool';
            condition.comparison = 'equals';
            condition.value = 'true';
          } else if (conditionName.includes('high_school_is_non_partner')) {
            condition.entity = 'HighSchool';
            condition.property = 'type';
            condition.comparison = 'equals';
            condition.value = 'Non-Partner';
          } else if (conditionName.includes('course_has_prerequisites')) {
            condition.entity = 'Course';
            condition.property = 'hasPrerequisites';
            condition.comparison = 'equals';
            condition.value = 'true';
          }
          
          conditionsFromSteps.set(conditionName, condition);
        }
      });
    }
  });
  
  console.log('Reconstructed conditions from steps:', Object.fromEntries(conditionsFromSteps));
  
  // Use conditions from steps if no conditions found in workflowData
  if (!workflowData.conditions && conditionsFromSteps.size > 0) {
    workflowData.conditions = Object.fromEntries(conditionsFromSteps);
    console.log('Using reconstructed conditions');
  }
  
  console.log('Conditions in workflow data:', workflowData.conditions ? Object.keys(workflowData.conditions) : 'none');
  
  // Add debug info if we're getting conditions in a different format than expected
  if (!workflowData.conditions && workflowData.scenarios) {
    console.warn('Conditions not found in workflowData.conditions, attempting to locate them elsewhere');
    
    // Try to extract conditions from scenarios
    const scenarioIds = Object.keys(workflowData.scenarios);
    if (scenarioIds.length > 0) {
      const firstScenario = workflowData.scenarios[scenarioIds[0]];
      
      // Check if conditions are stored in the first scenario
      if (firstScenario.conditions) {
        console.log('Found conditions in first scenario:', firstScenario.conditions);
        workflowData.conditions = firstScenario.conditions;
      } else if (firstScenario.workflowConditions) {
        console.log('Found conditions as workflowConditions in first scenario:', firstScenario.workflowConditions);
        workflowData.conditions = firstScenario.workflowConditions;
      }
    }
    
    // Try to find conditions in window state if available
    if (typeof window !== 'undefined' && window.workflowBuilderState) {
      console.log('Checking window.workflowBuilderState for conditions');
      if (window.workflowBuilderState.workflowConditions) {
        console.log('Found conditions in window.workflowBuilderState:', window.workflowBuilderState.workflowConditions);
        workflowData.conditions = window.workflowBuilderState.workflowConditions;
      }
    }
    
    // If we still don't have conditions, create a default empty object
    if (!workflowData.conditions) {
      console.warn('Still no conditions found. Creating empty conditions object.');
      workflowData.conditions = {};
    }
  }
  
  if (workflowData.conditions) {
    // Get all condition names used by relevant steps to filter out irrelevant conditions
    const relevantConditionNames = new Set();
    relevantSteps.forEach(step => {
      if (step.conditional && step.workflowCondition) {
        if (Array.isArray(step.workflowCondition)) {
          step.workflowCondition.forEach(condName => relevantConditionNames.add(condName));
        } else {
          relevantConditionNames.add(step.workflowCondition);
        }
      }
    });
    console.log(`Relevant condition names for ${targetObjectType}:`, Array.from(relevantConditionNames));
    
    // Only process conditions that are used by relevant steps
    Object.entries(workflowData.conditions).forEach(([conditionName, condition]) => {
      // Skip conditions not used by this initializer's target object type
      if (!relevantConditionNames.has(conditionName)) {
        console.log(`Skipping condition ${conditionName} - not relevant for ${targetObjectType}`);
        return;
      }
      
      console.log(`Processing condition ${conditionName}:`, condition);
      
      // Check if condition refers to entities not available in this initializer
      let rubyCondition = transformConditionToRuby(condition);
      
      // Skip if the condition refers to course/courses in a non-course initializer
      if (targetObjectType !== 'StudentDeCourse' && 
          (rubyCondition?.includes('course.') || 
           rubyCondition?.includes('course_section.') || 
           conditionName.toLowerCase().includes('course') || 
           conditionName.toLowerCase().includes('prereq'))) {
        console.log(`Skipping condition ${conditionName} - refers to course entities not available in ${targetObjectType}`);
        return;
      }
      
      // Skip if the condition refers to term in a non-term initializer
      if (targetObjectType !== 'StudentTerm' && 
          (rubyCondition?.includes('term.') || 
           conditionName.toLowerCase().includes('term'))) {
        console.log(`Skipping condition ${conditionName} - refers to term entities not available in ${targetObjectType}`);
        return;
      }
      
      console.log(`Transformed condition ${conditionName} to Ruby code:`, rubyCondition);
      
      if (rubyCondition) {
        conditionToRubyMap.set(conditionName, {
          rubyCode: rubyCondition,
          fields: condition.fields || []
        });
        console.log(`Added to conditionToRubyMap with fields:`, condition.fields || []);
        
        // Store completion states for this condition
        if (conditionalBranches[conditionName]) {
          conditionalCompletionStates.set(conditionName, conditionalBranches[conditionName].completionStates);
          console.log(`Added completion states for ${conditionName}:`, conditionalBranches[conditionName].completionStates);
        } else {
          console.log(`No completion states found for condition ${conditionName}`);
          
          // Try looking for partial matches in branch names
          const partialMatches = Object.keys(conditionalBranches).filter(branch => 
            branch.includes(conditionName) || conditionName.includes(branch));
          
          if (partialMatches.length > 0) {
            console.log(`Found partial matches for ${conditionName}:`, partialMatches);
            // Use the first partial match's completion states
            const firstMatch = partialMatches[0];
            conditionalCompletionStates.set(conditionName, conditionalBranches[firstMatch].completionStates);
            console.log(`Using completion states from ${firstMatch}:`, conditionalBranches[firstMatch].completionStates);
          }
        }
      } else {
        console.log(`Failed to transform condition ${conditionName} to Ruby code`);
      }
    });
  } else {
    console.log('No conditions found in workflowData');
  }
  
  // Start building the initializer class
  let rubyCode = `class ${className} < Step

  def self.required_fields
    return ["active_flow_step_id"]
  end

  def self.provided_fields(*args)
    return ["initialization_complete"]
  end

  def self.on_activate(*args)
    fields = args[0]
    active_flow_step = ActiveFlowStep.find(fields["active_flow_step_id"])
    target_object = active_flow_step.get_target_object
`;

  // Add appropriate object references based on target object type
  if (targetObjectType === 'CollegeStudentApplication') {
    rubyCode += `    student = target_object.student
    college = target_object.college

`;
  } else if (targetObjectType === 'StudentTerm') {
    rubyCode += `    student = target_object.student
    college = target_object.college
    term = target_object.term

`;
  } else if (targetObjectType === 'StudentDeCourse') {
    rubyCode += `    student = target_object.student
    college = target_object.college
    course = target_object.course
    course_section = target_object.course_section

`;
  }

  // Common initialization
  rubyCode += `    # Common initialization
    fields["parent_consent_email"] = true

`;

  // Add target object type specific initialization based on workflow
  if (targetObjectType === 'CollegeStudentApplication') {
    rubyCode += `    # One-time workflow initialization
    # Parent consent is handled in the one-time workflow
    if student.high_school.is_home_school?
      fields["parent_consent_provided"] = true
      fields["home_school"] = true
    else
      fields["parent_consent_required"] = true
      fields["partner_high_school"] = true
    end

`;
  } else if (targetObjectType === 'StudentTerm') {
    rubyCode += `    # Per-term workflow initialization
    # Term-specific initialization
    
`;
  } else if (targetObjectType === 'StudentDeCourse') {
    rubyCode += `    # Per-course workflow initialization
    # Set high school type
    if student.high_school.is_home_school?
      fields["home_school"] = true
    elsif student.high_school.is_non_partner?(college)
      fields["non_partner"] = true
    else
      fields["high_school"] = true
    end

`;
  }
  
  if (conditionToRubyMap.size > 0) {
    rubyCode += `    # Conditional fields based on workflow conditions\n`;
    console.log('Adding conditional fields section');
    
    // Process each condition and set fields accordingly
    conditionToRubyMap.forEach((conditionData, conditionName) => {
      console.log(`Processing condition: ${conditionName} with Ruby code: ${conditionData.rubyCode}`);
      console.log(`Fields for condition: ${conditionData.fields ? conditionData.fields.join(', ') : 'none'}`);
      
      // Ensure we have at least the condition name as a field if no fields are specified
      const fields = conditionData.fields && conditionData.fields.length > 0 ? 
                     conditionData.fields : [conditionName];
      
      rubyCode += `    # Condition: ${conditionName}\n`;
      rubyCode += `    if ${conditionData.rubyCode}\n`;
      
      // Set fields for this condition
      fields.forEach(field => {
        rubyCode += `      fields["${field}"] = true\n`;
      });
      
      rubyCode += `    end\n\n`;
    });
  } else {
    console.log('No conditions found for this workflow category');
  }
  
  // Handle completion states for conditional branches
  if (conditionalCompletionStates.size > 0) {
    rubyCode += `    # Set completion states for students who don't meet condition criteria\n`;
    
    // For each condition, set completion states for students who don't meet the condition
    conditionalCompletionStates.forEach((completionStates, conditionName) => {
      const conditionData = conditionToRubyMap.get(conditionName);
      if (conditionData && completionStates.length > 0) {
        rubyCode += `    # Auto-complete steps for students who don't qualify for ${conditionName}\n`;
        rubyCode += `    unless ${conditionData.rubyCode}\n`;
        
        // Set all completion states
        completionStates.forEach(state => {
          rubyCode += `      fields["${state}"] = true\n`;
        });
        
        rubyCode += `    end\n\n`;
      }
    });
  }

  // Set up student signature for enrollment form (common across all)
  rubyCode += `    # Set up student signature for enrollment form
    fields["esign_enrollment_form_sign"] = target_object.student.display_name
    fields["esign_enrollment_form_date"] = Time.now.strftime('%-d %b %Y')

`;

  // Complete the step
  rubyCode += `    fields["initialization_complete"] = true
    fields = active_flow_step.complete_step(fields)
    return fields
  end

end`;

  return rubyCode;
};

/**
 * Determine appropriate workflow category for a target object type
 * @param {string} targetObjectType - The target object type
 * @returns {string} - The primary workflow category for this object type
 */
function getWorkflowCategoryForTargetObjectType(targetObjectType) {
  switch (targetObjectType) {
    case 'CollegeStudentApplication':
      return 'One Time';
    case 'StudentTerm':
      return 'Per Term';
    case 'StudentDeCourse':
      return 'Per Course';
    default:
      return '';
  }
}

/**
 * Get all steps with conditionals, regardless of workflow category
 * @param {Array} steps - All workflow steps
 * @returns {Array} - Steps that have conditional logic
 */
function getAllConditionalSteps(steps) {
  return steps.filter(step => step.conditional && step.workflowCondition);
}

/**
 * Get relevant workflow categories for a target object type
 * @param {string} targetObjectType - The target object type
 * @returns {Array<string>} - Array of relevant workflow categories
 */
function getRelevantWorkflowCategories(targetObjectType) {
  switch (targetObjectType) {
    case 'CollegeStudentApplication':
      return ['One Time'];
    case 'StudentTerm':
      return ['Per Term'];
    case 'StudentDeCourse':
      return ['Per Course'];
    default:
      return [];
  }
}

export default generateInitializerClass;
