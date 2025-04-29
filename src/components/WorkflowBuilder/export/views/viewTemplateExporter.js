/**
 * View Template Exporter
 * 
 * This module provides functionality to generate view template files for all steps 
 * in a workflow and include them in the export zip file.
 */

import { generateSingleViewTemplate} from './singleViewGenerator';
import { generateConsentTemplate, generateParentConsentInstructionsTemplate } from './stepGenerators/consentTemplateGenerator';
import { getWorkflow } from '../../../../utils/workflowUtils';

/**
 * Determines if a step should have a view template
 * @param {Object} step - The step data
 * @returns {boolean} - Whether the step should have a view template
 */
const shouldGenerateViewForStep = (step) => {
  // Skip system and backend-only steps 
  if (step.role === 'System' || 
      step.participant_role === 'system' || 
      step.role === 'Processing' ||
      step.stepType === 'system') {
    return false;
  }
  
  // Skip steps that shouldn't have user interfaces
  const noUIStepTypes = [
    'RegisterViaApi', 
    'PendingCompletionOfOneTimeSteps',
    'PendingCompletionOfPerTermSteps',
    'PendingCompletionOfPerYearSteps',
    'InitializeStudentTerm',
    'InitializeRegistration',
    'CompleteRegistration',
    'DeclineRegistration'
  ];
  
  // Ensure ReviewFailedRegistration steps always have a view
  if (step.stepType === 'ReviewFailedRegistration') {
    return true;
  }
  
  if (noUIStepTypes.includes(step.stepType)) {
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
  // Get role part of the path
  const role = (step.role || step.participant_role || 'student').toLowerCase().replace(/\s+/g, '_');
  
  // Simple snake case of title for the action
  let action = '';
  
  // Special case for ReviewFailedRegistration to ensure consistent naming
  if (step.stepType === 'ReviewFailedRegistration') {
    action = 'review_declined_registration';
  } else if (step.title) {
    action = step.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_+|_+$)/g, '');
  } else {
    // Fallback based on step type
    switch (step.stepType.toLowerCase()) {
      case 'approval':
        action = 'approve';
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
  
  // Use getWorkflow to get all steps
  const allSteps = getWorkflow(workflowData.workflow);
  
  // Filter steps that should have view templates
  const stepsNeedingViews = allSteps.filter(shouldGenerateViewForStep);
  
  // Track already generated views to avoid duplicates
  const generatedViews = new Set();
  
  // Generate main consent template
  const consentPath = `active_flow_steps/course_registration/parent/_provide_consent`;
  const consentContent = generateConsentTemplate();
  const consentFilePath = `app/views/themes/${collegeVarName}/${consentPath}.html.erb`;
  
  templateFiles.push({
    path: consentFilePath,
    content: consentContent,
    viewPath: consentPath
  });
  
  // Generate consent instructions template - using the parent directory
  const instructionsDir = `active_flow_steps/course_registration/parent`;
  const instructionsFile = '_parent_provide_consent_instructions.html.erb';
  const instructionsFilePath = `app/views/themes/${collegeVarName}/${instructionsDir}/${instructionsFile}`;
  const instructionsContent = generateParentConsentInstructionsTemplate();
  // Explicitly log to see what's being added
  console.log('Adding consent instructions template:', instructionsFilePath);
  
  templateFiles.push({
    path: instructionsFilePath,
    content: instructionsContent,
    viewPath: `${instructionsDir}/_parent_provide_consent_instructions`
  });
  
  // Generate template for each step
  for (const step of stepsNeedingViews) {
    // Skip consent steps (already handled)
    if (step.stepType === 'ProvideConsent') continue;
    
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
    
    // Update the step's viewNameOverride to match
    step.viewNameOverride = viewPath;
  }
  
  // Ensure we return the complete list of template files
  return templateFiles;
};

/**
 * Add view template files to the ZIP archive
 * @param {JSZip} zip - The JSZip object
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {string} collegeVarName - The college variable name
 * @returns {number} - Number of template files added
 */
export const addViewTemplatesToZip = (zip, workflowData, collegeVarName) => {
  const viewTemplates = generateViewTemplates(workflowData, collegeVarName);
  
  // Create a folder for view templates
  const viewsFolder = zip.folder('views');
  
  // Add each template file to the ZIP
  viewTemplates.forEach(template => {
    // Get relative path (removing app/views/ prefix)
    const relativePath = template.path.replace(/^app\/views\//, '');
    
    // Log what we're adding to the ZIP
    console.log('Adding to ZIP:', relativePath);
    
    // Create the file in the ZIP
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