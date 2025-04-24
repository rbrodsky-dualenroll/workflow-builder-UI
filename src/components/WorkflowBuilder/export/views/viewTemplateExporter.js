/**
 * View Template Exporter
 * 
 * This module provides functionality to generate view template files for all steps 
 * in a workflow and include them in the export zip file.
 */

import getViewOverride from '../getViewOverride';
import { generateSingleViewTemplate } from './singleViewGenerator';
import { getMergedWorkflow } from '../../ScenarioOperations';

/**
 * Determines if a step should have a view template
 * @param {Object} step - The step data
 * @returns {boolean} - Whether the step should have a view template
 */
const shouldGenerateViewForStep = (step) => {
  // Skip system steps
  if (step.role === 'System' || 
      step.participant_role === 'system' || 
      step.role === 'Processing' ||
      step.stepType === 'system') {
    return false;
  }
  
  // Skip RegisterViaApi and Pending steps
  if (step.stepType === 'RegisterViaApi' || 
      step.stepType === 'PendingCompletionOfOneTimeSteps' || 
      step.stepType === 'PendingCompletionOfPerTermSteps' || 
      step.stepType === 'PendingCompletionOfPerYearSteps') {
    return false;
  }
  
  // Skip parent consent steps
  if (step.stepType === 'ProvideConsent' && 
      (step.role === 'Parent' || step.participant_role === 'parent')) {
    return false;
  }
  
  return true;
};

/**
 * Generate a view path for a step
 * @param {Object} step - The step data
 * @returns {string} - The view path
 */
const generateViewPath = (step) => {
  // Parent consent steps should never have a view path
  if (step.stepType === 'ProvideConsent' && 
      (step.role === 'Parent' || step.participant_role === 'parent')) {
    return '';
  }
  
  // If no view override, generate a path based on role and step type
  const role = (step.role || 'student').toLowerCase().replace(/\s+/g, '_');
  let action = '';
  
  switch (step.stepType.toLowerCase()) {
    case 'approval':
      // Generate a slug based on the step title
      const slug = step.title ? 
        step.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_+|_+$)/g, '') : 
        'approve';
      action = slug;
      break;
    case 'upload':
      action = 'provide_additional_info';
      break;
    case 'information':
      action = 'information';
      break;
    default:
      action = step.stepType.toLowerCase().replace(/\s+/g, '_');
  }
  
  return `active_flow_steps/course_registration/${role}/${action}`;
};

/**
 * Generate view template files for all steps in the workflow
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {string} collegeVarName - The college variable name for directory path
 * @returns {Array} - Array of objects with file path and content
 */
export const generateViewTemplates = (workflowData, collegeVarName) => {
  const templateFiles = [];
  const { scenarios } = workflowData;
  
  // Get all steps from all scenarios
  const allSteps = getMergedWorkflow(scenarios);
  
  // Filter steps that should have view templates
  const stepsNeedingViews = allSteps.filter(shouldGenerateViewForStep);
  
  // Track already generated views to avoid duplicates
  const generatedViews = new Set();
  
  // Generate template for each step
  for (const step of stepsNeedingViews) {
    // Get or generate view path
    const viewPath = generateViewPath(step);
    
    // Skip if no view path or already generated
    if (!viewPath || generatedViews.has(viewPath)) continue;
    
    // Mark as generated
    generatedViews.add(viewPath);
    
    // Generate view content
    const viewContent = generateSingleViewTemplate(step);
    
    // Parse the path to get the file name with underscore prefix
    const pathParts = viewPath.split('/');
    const fileName = pathParts.pop();
    const partialFileName = `_${fileName}.html.erb`;
    
    // Recreate path with proper partial naming
    const partialPath = [...pathParts, partialFileName].join('/');
    
    // Create file path
    const filePath = `app/views/themes/${collegeVarName}/${partialPath}`;
    
    // Add to template files
    templateFiles.push({
      path: filePath,
      content: viewContent,
      viewPath: viewPath // Store original view path for updating step references
    });
    
    // Update the step's viewNameOverride to match (except for parent consent)
    if (!(step.stepType === 'ProvideConsent' && 
         (step.role === 'Parent' || step.participant_role === 'parent'))) {
      step.viewNameOverride = viewPath;
    }
  }
  
  return templateFiles;
};

/**
 * Add view template files to the ZIP archive
 * @param {JSZip} zip - The JSZip object
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {string} collegeVarName - The college variable name
 */
export const addViewTemplatesToZip = (zip, workflowData, collegeVarName) => {
  const viewTemplates = generateViewTemplates(workflowData, collegeVarName);
  
  // Create a folder for view templates
  const viewsFolder = zip.folder('views');
  
  // Add each template file to the ZIP
  viewTemplates.forEach(template => {
    // Get relative path (removing app/views/ prefix)
    const relativePath = template.path.replace(/^app\/views\//, '');
    viewsFolder.file(relativePath, template.content);
  });
  
  return viewTemplates.length; // Return count of templates added
};

export default {
  generateViewTemplates,
  addViewTemplatesToZip,
  shouldGenerateViewForStep,
  generateViewPath
};
