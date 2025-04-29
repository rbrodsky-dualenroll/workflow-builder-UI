/**
 * Base Initializer Generator
 * 
 * Common functions and utilities for initializer generation
 */

import { transformConditionToRuby } from './conditionMapper';
import { identifyConditionalBranches, generateCompletionStatesCode } from './completionStateHandler';

/**
 * Generate the base initializer class structure
 * @param {string} className - The name of the Ruby class
 * @returns {string} - Ruby initializer class code base structure
 */
export const generateBaseInitializerClass = (className) => {
  return `class ${className} < Step

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
};

/**
 * Generate the common closing code for all initializers
 * @returns {string} - Ruby code for closing the initializer
 */
export const generateInitializerClosing = () => {
  return `
    # Complete the initialization
    fields["initialization_complete"] = true
    fields = active_flow_step.complete_step(fields)
    return fields
  end

end`;
};

/**
 * Process workflow conditions and extract relevant ones
 * @param {Object} workflowData - The workflow data
 * @param {Array} relevantSteps - The steps relevant to this initializer
 * @param {string} targetObjectType - The target object type
 * @returns {Object} - Maps of conditions and completion states
 */
export const processWorkflowConditions = (workflowData, relevantSteps, targetObjectType) => {
  // Create maps to store conditions and their completion states
  const conditionToRubyMap = new Map();
  const conditionalCompletionStates = new Map();
  
  // First, analyze the workflow to identify all conditional branches and their completion states
  console.log(`Analyzing workflow for ${targetObjectType}...`);
  console.log(`Total steps for analysis: ${relevantSteps.length}`);
  
  // Log all steps that have conditional logic
  const conditionalSteps = relevantSteps.filter(step => step.conditional && step.workflowCondition);
  if (conditionalSteps.length > 0) {
    console.log(`Found ${conditionalSteps.length} conditional steps`);
    conditionalSteps.forEach(step => {
      const conditions = Array.isArray(step.workflowCondition) ? 
        step.workflowCondition : [step.workflowCondition];
      console.log(`Conditional step: "${step.title}" with condition:`, conditions);
    });
  } else {
    console.log('No conditional steps found in the workflow');
  }
  
  // Identify conditional branches and completion states
  const conditionalBranches = identifyConditionalBranches(relevantSteps);
  console.log('Identified conditional branches:', Object.keys(conditionalBranches));
  
  // Get all condition names used by relevant steps
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
  
  // Process conditions from workflowData
  if (workflowData.conditions && Object.keys(workflowData.conditions).length > 0) {
    console.log('Processing conditions from workflowData:', Object.keys(workflowData.conditions));
    
    // Filter conditions to those used by this workflow's steps
    Object.entries(workflowData.conditions).forEach(([conditionName, condition]) => {
      console.log(`Processing condition ${conditionName}:`, condition);
      
      // Skip conditions not used by relevant steps
      if (!relevantConditionNames.has(conditionName)) {
        console.log(`Skipping condition ${conditionName} - not used by ${targetObjectType} steps`);
        return;
      }
      
      // Skip conditions that refer to entities not available in this initializer
      if (!isConditionRelevantForTargetObject(condition, targetObjectType)) {
        console.log(`Skipping condition ${conditionName} - refers to entities not available in ${targetObjectType}`);
        return;
      }
      
      // Transform condition to Ruby code - first try using the rubyMethod directly if provided
      let rubyCondition = null;
      
      if (condition.rubyMethod) {
        console.log(`Condition has rubyMethod: ${condition.rubyMethod}`);
        // Use the entity variable with the method
        const entityVar = getEntityVariable(condition.entity);
        
        // Special handling for methods needing parameters
        if (condition.rubyMethod === 'is_non_partner?') {
          rubyCondition = `${entityVar}.is_non_partner?(college)`;
        } else {
          rubyCondition = `${entityVar}.${condition.rubyMethod}`;
        }
      } else {
        // Try the standard transformation
        rubyCondition = transformConditionToRuby(condition);
      }
      
      console.log(`Transformed condition ${conditionName} to:`, rubyCondition);
      
      if (rubyCondition) {
        conditionToRubyMap.set(conditionName, {
          rubyCode: rubyCondition,
          fields: condition.fields || [conditionName]
        });
        
        // Store completion states for this condition
        if (conditionalBranches[conditionName]) {
          conditionalCompletionStates.set(conditionName, conditionalBranches[conditionName].completionStates);
          console.log(`Completion states for ${conditionName}:`, conditionalBranches[conditionName].completionStates);
        } else {
          console.log(`No completion states found for condition ${conditionName}`);
        }
      } else {
        console.warn(`Failed to transform condition ${conditionName} to Ruby code`);
      }
    });
  } else {
    console.log('No conditions defined in workflowData, creating conditions from step requirements');
    
    // Create conditions based on step requirements
    relevantConditionNames.forEach(conditionName => {
      console.log(`Creating condition from step requirement: ${conditionName}`);
      
      // Try to determine condition type from the name
      let rubyCondition = null;
      let fields = [conditionName];
      
      // Check for common patterns in condition names
      if (conditionName.includes('home_school') || conditionName.includes('homeschool')) {
        rubyCondition = 'student.high_school.is_home_school?';
      } else if (conditionName.includes('non_partner') || conditionName.includes('nonpartner')) {
        rubyCondition = 'student.high_school.is_non_partner?(college)';
      } else if (conditionName.includes('prereq') || conditionName.includes('requisites')) {
        rubyCondition = 'course.has_requisites?';
      } else if (conditionName.includes('wish_list')) {
        rubyCondition = 'course_section.is_wish_list?';
      } else if (conditionName.includes('section_full')) {
        rubyCondition = 'course_section.is_full?';
      } else if (conditionName.includes('minor')) {
        rubyCondition = 'student.is_minor?';
      } else {
        // Fallback to using the condition name as a field check
        rubyCondition = `fields['${conditionName}']`;
      }
      
      if (rubyCondition) {
        conditionToRubyMap.set(conditionName, { rubyCode: rubyCondition, fields });
        
        // Store completion states if available
        if (conditionalBranches[conditionName]) {
          conditionalCompletionStates.set(conditionName, conditionalBranches[conditionName].completionStates);
          console.log(`Completion states for ${conditionName}:`, conditionalBranches[conditionName].completionStates);
        }
      }
    });
  }
  
  return { conditionToRubyMap, conditionalCompletionStates };
};

/**
 * Check if a condition is relevant for a given target object type
 * @param {Object} condition - The condition to check
 * @param {string} targetObjectType - The target object type
 * @returns {boolean} - Whether the condition is relevant
 */
function isConditionRelevantForTargetObject(condition, targetObjectType) {
  // Skip empty condition checks
  if (!condition) return false;
  
  // Get entity from condition
  const entity = condition.entity ? condition.entity.toLowerCase() : '';
  const conditionName = condition.name || '';
  
  // Handle direct rubyMethod conditions based on the method name
  if (condition.rubyMethod) {
    if (targetObjectType !== 'StudentDeCourse' && 
        (condition.rubyMethod.includes('requisites') || 
         condition.rubyMethod.includes('course_section'))) {
      return false;
    }
    if (targetObjectType !== 'StudentTerm' && 
        condition.rubyMethod.includes('term')) {
      return false;
    }
  }
  
  // Course-related conditions should only be in StudentDeCourse initializers
  if (targetObjectType !== 'StudentDeCourse' && 
      (entity === 'course' || entity === 'course_section' || 
       conditionName.toLowerCase().includes('course') || 
       conditionName.toLowerCase().includes('prereq'))) {
    return false;
  }
  
  // Term-related conditions should only be in StudentTerm initializers
  if (targetObjectType !== 'StudentTerm' && 
      (entity === 'term' || 
       conditionName.toLowerCase().includes('term'))) {
    return false;
  }
  
  return true;
}

/**
 * Get the entity variable for a given entity name
 * @param {string} entity - The entity name
 * @returns {string} - The entity variable
 */
function getEntityVariable(entity) {
  if (!entity) return 'student'; // Default to student
  
  const entityMap = {
    'Student': 'student',
    'student': 'student',
    'HighSchool': 'student.high_school',
    'high_school': 'student.high_school',
    'Course': 'course',
    'course': 'course',
    'CourseSection': 'course_section',
    'course_section': 'course_section',
    'Term': 'term',
    'term': 'term',
    'Instructor': 'instructor',
    'instructor': 'instructor',
    'College': 'college',
    'college': 'college'
  };
  
  return entityMap[entity] || entity.toLowerCase();
}

/**
 * Generate code to set conditional fields based on conditions
 * @param {Map} conditionToRubyMap - Map of condition names to Ruby code
 * @returns {string} - Generated Ruby code for setting conditional fields
 */
export const generateConditionalFieldsCode = (conditionToRubyMap) => {
  let rubyCode = '';
  
  if (conditionToRubyMap.size > 0) {
    rubyCode += `    # Conditional fields based on workflow conditions\n`;
    
    // Process each condition and set fields accordingly
    conditionToRubyMap.forEach((conditionData, conditionName) => {
      // Ensure we have at least the condition name as a field
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
  }
  
  return rubyCode;
};
