/**
 * Single View Template Generator
 * 
 * This module provides a function to generate a view template for a single step.
 * It handles mapping step configuration details directly to the view template elements
 * by using specialized generators for each step type.
 */

import { getCompletionState } from '../getCompletionState';
import { getParticipantRole } from '../getParticipantInfo';

// Import all step generators
import { 
  generateTemplateHeader, 
  generateTemplateFooter,
  generateGenericTemplate
} from './stepGenerators/baseTemplateGenerator';
import generateApprovalTemplate from './stepGenerators/approvalTemplateGenerator';
import generateUploadTemplate from './stepGenerators/uploadTemplateGenerator';
import generateInformationTemplate from './stepGenerators/informationTemplateGenerator';

/**
 * Generate view template content for a single step
 * @param {Object} step - The step data
 * @returns {string} - The template content
 */
export const generateSingleViewTemplate = (step) => {
  // Define basic template variables
  const completionState = getCompletionState(step);
  const role = getParticipantRole(step);
  
  // Create header with required variables
  let template = generateTemplateHeader(step, completionState);
  
  // Generate the content based on step type
  switch (step.stepType) {
    case 'Approval':
      template += generateApprovalTemplate(step, completionState);
      break;
    case 'Upload':
      template += generateUploadTemplate(step, completionState);
      break;
    case 'Information':
      template += generateInformationTemplate(step);
      break;
    case 'ProvideConsent':
      template += generateConsentTemplate();
      break;
    default:
      // For other step types, use a generic template
      template += generateGenericTemplate(step, completionState);
  }
  
  // Add footer if needed
  template += generateTemplateFooter(step);
  
  return template;
};

export default generateSingleViewTemplate;
