/**
 * Information Step Template Generator
 * 
 * Functions for generating templates for information steps
 */

import { generateCommentsSection } from './baseTemplateGenerator';

/**
 * Generate template content for information steps
 * @param {Object} step - The step data
 * @returns {string} - The template content
 */
export const generateInformationTemplate = (step) => {
  // Format information content with proper HTML
  let formattedInfo = '';
  
  if (step.informationDisplays && step.informationDisplays.length > 0) {
    formattedInfo = step.informationDisplays.map(info => {
      return `<div class="info-item mb-4">
    <h4 class="font-medium">${info.title || 'Information'}</h4>
    <div>${info.content || ''}</div>
  </div>`;
    }).join('\n\n');
  } else {
    formattedInfo = step.information || 'Information to be displayed to the user.';
  }
  
  let template = `<div class="info-step-content">
  ${formattedInfo}
</div>

${generateCommentsSection()}`;

  return template;
};

export default generateInformationTemplate;
