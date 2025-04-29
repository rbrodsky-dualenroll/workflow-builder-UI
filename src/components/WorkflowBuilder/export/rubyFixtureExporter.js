/**
 * Ruby Fixture Exporter Utility
 * 
 * This utility converts workflow data from the workflow builder into a Ruby fixture file format
 * that can be used in the DualEnroll application.
 */

import { generateApplicationFixture } from './applicationFixtureGenerator';

// Import modular components from the index file
import {
  categorizeWorkflowSteps,
  generateVersionNumbers,
  identifyWorkflowCategories,
  generateFileHeader,
  generateCollegeSetup,
  generateActiveFlowDefinition
} from './fixtureGenerators';

// Re-export identifyWorkflowCategories for use by other modules
export { identifyWorkflowCategories };

export const generateRubyFixture = (workflowData, collegeData, options = {}) => {
  // Create a safe variable name for the college
  const collegeVarName = collegeData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Get the workflow
  const workflow = workflowData.workflow || [];
  
  // Generate version numbers for different workflow types
  const versionNumbers = generateVersionNumbers();
  
  // Start building the Ruby code
  let rubyCode = generateFileHeader(collegeVarName, collegeData.id, versionNumbers);
  
  // Get all the steps with workflow_category defined
  const allWorkflowSteps = workflow.filter(step => step.workflow_category);
  console.log('All workflow steps with categories:', allWorkflowSteps.length);
  
  // Generate global workflow categories once (to correctly identify dependencies)
  const workflowCategories = identifyWorkflowCategories(allWorkflowSteps);
  console.log('Global workflow categories:', workflowCategories.map(c => c.name));
  
  // Save the category info to ensure we have consistent info throughout
  window.globalWorkflowCategories = workflowCategories;
  window.hasOneTimeWorkflow = workflowCategories.some(c => c.name === 'college_student_application');
  window.hasPerTermWorkflow = workflowCategories.some(c => c.name === 'student_term');
  
  // Generate college-specific code
  rubyCode += generateCollegeSetup(collegeVarName, collegeData);
  
  // Include application fields if requested
  if (options.includeApplicationFields) {
    rubyCode += generateApplicationFixture(collegeVarName, collegeData.id);
  }
  
  // Categorize steps by workflow category
  const categorizedWorkflow = categorizeWorkflowSteps(workflow);
  
  // Generate each workflow category's ActiveFlowDefinition in order
  // Start with one-time, then per-term, then per-course to ensure dependencies are correct
  workflowCategories.sort((a, b) => {
    if (a.name === 'college_student_application') return -1;
    if (b.name === 'college_student_application') return 1;
    if (a.name === 'student_term') return -1;
    if (b.name === 'student_term') return 1;
    return 0;
  }).forEach(category => {
    // Use the correctly categorized steps for this workflow type
    const categorySteps = categorizedWorkflow[category.name] || [];
    rubyCode += generateActiveFlowDefinition(collegeVarName, category, versionNumbers, categorySteps);
  });
  
  return rubyCode;
};
