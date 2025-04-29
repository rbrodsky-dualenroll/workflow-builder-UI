/**
 * Initializer Generator
 * 
 * This module generates a Ruby initializer class file based on the workflow conditions
 * to handle setting conditional fields and completion states appropriately.
 */

import { generateCollegeStudentApplicationInitializer } from './collegeStudentApplicationInitializer';
import { generateStudentTermInitializer } from './studentTermInitializer';
import { generateStudentDeCourseInitializer } from './studentDeCourseInitializer';

/**
 * Generate a Ruby initializer class file for a specific target object type
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {string} collegeVarName - The college variable name (lowercase, no spaces)
 * @param {string} targetObjectType - The target object type (e.g., 'CollegeStudentApplication', 'StudentTerm', 'StudentDeCourse')
 * @returns {string} - Ruby initializer class code
 */
export const generateInitializerClass = (workflowData, collegeVarName, targetObjectType) => {
  console.log('Generating initializer for target object type:', targetObjectType);
  
  // Call the appropriate initializer generator based on target object type
  switch (targetObjectType) {
    case 'CollegeStudentApplication':
      return generateCollegeStudentApplicationInitializer(workflowData, collegeVarName);
      
    case 'StudentTerm':
      return generateStudentTermInitializer(workflowData, collegeVarName);
      
    case 'StudentDeCourse':
      return generateStudentDeCourseInitializer(workflowData, collegeVarName);
      
    default:
      console.error(`Unsupported target object type: ${targetObjectType}`);
      return `# Error: Unsupported target object type: ${targetObjectType}`;
  }
};

/**
 * Determine appropriate workflow category for a target object type
 * @param {string} targetObjectType - The target object type
 * @returns {string} - The primary workflow category for this object type
 */
export function getWorkflowCategoryForTargetObjectType(targetObjectType) {
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

// Export the main function as default
export default generateInitializerClass;
