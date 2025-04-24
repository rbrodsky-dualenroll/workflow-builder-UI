/**
 * View Template Generator
 * 
 * This module provides functions to generate view template files for workflow steps.
 * These templates follow the structure used in the DualEnroll application's Rails views.
 */

import getViewOverride from '../getViewOverride';
import getCompletionState from '../getCompletionState';
import { getParticipantRole } from '../getParticipantInfo';
import { snakeCase } from '../utils';

/**
 * Generate view template files for all steps in the workflow
 * @param {Array} steps - All steps from the workflow
 * @param {string} collegeVarName - The college variable name (used for directories)
 * @returns {Array} - Array of objects containing file path and content
 */
export const generateViewTemplates = (steps, collegeVarName) => {
  const templateFiles = [];
  
  // Filter out system steps that don't need view templates
  const stepsNeedingTemplates = steps.filter(step => {
    const role = getParticipantRole(step);
    return role !== 'system';
  });
  
  // Generate templates for each step
  stepsNeedingTemplates.forEach(step => {
    const viewPath = getViewOverride(step);
    
    // Skip if no view path determined
    if (!viewPath || viewPath === '') return;
    
    // Generate the template content
    const templateContent = generateTemplateContent(step);
    
    // Create the full file path
    const filePath = `app/views/themes/${collegeVarName}/${viewPath}.html.erb`;
    
    // Add to the list of template files
    templateFiles.push({
      path: filePath,
      content: templateContent
    });
  });
  
  return templateFiles;
};

/**
 * Generate the content for a view template based on step type
 * @param {Object} step - The step data
 * @returns {string} - The template content
 */
const generateTemplateContent = (step) => {
  const completionState = getCompletionState(step);
  const role = getParticipantRole(step);
  
  // Start with common template header
  let template = generateTemplateHeader(step, completionState);
  
  // Generate the appropriate template body based on step type
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
      template += generateConsentTemplate(step, completionState);
      break;
    default:
      // For other step types, use a generic template
      template += generateGenericTemplate(step, completionState);
  }
  
  // Add common template footer
  template += generateTemplateFooter(step);
  
  return template;
};

/**
 * Generate common template header with variables and setup
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template header content
 */
const generateTemplateHeader = (step, completionState) => {
  return `<% completion_state = @active_flow_step.get_parameter_by_name('completion_state') %>
<% active_flow_step_id = @active_flow_step_ids.first %>
<% @target = @target_hash[active_flow_step_id] %>
<% @fields = @fields_hash[active_flow_step_id] %>

<%= render layout: 'shared/active_view', locals: { active_view_file_instance: __FILE__ } do %>
  <p>${step.description || step.title || 'Please complete this step.'}</p>
<% end %>

<%= render_step_information_block %>

`;
};

/**
 * Generate template content for approval steps
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template content
 */
const generateApprovalTemplate = (step, completionState) => {
  let template = `<ul class="main-step-options">\n`;
  
  // Add approval option
  template += `  <li>
    <label class="js-sep">
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", 'yes', @fields[completion_state] == 'yes', class: 'js-comment-not-required' %>
      ${step.approvalLabel || 'Approve - I have reviewed and approve this request'}
    </label>
  </li>\n`;
  
  // Add decline option if enabled
  if (step.enableDecline !== false) {
    template += `  <li>
    <label>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", 'no', @fields[completion_state] == 'no', class: 'js-comment-required' %>
      ${step.declineLabel || 'Decline - I cannot approve this request'}
    </label>
  </li>\n`;
  }
  
  // Add additional options if specified
  if (step.additionalOptions && step.additionalOptions.length > 0) {
    step.additionalOptions.forEach(option => {
      template += `  <li>
    <label>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", '${option.value}', @fields[completion_state] == '${option.value}', class: 'js-comment-${option.requiresComment ? 'required' : 'not-required'}' %>
      ${option.label}
    </label>
  </li>\n`;
    });
  }
  
  template += `</ul>\n\n`;
  
  // Add comments section
  template += `<%= render partial: 'shared/active_flow_all_comments_list' %>

<div>
  <%= render partial: 'shared/active_flow_comment_entry', locals: {
    make_comment_required_selector: ".js-comment-required",
    make_comment_optional_selector: ".js-comment-not-required",
  } %>
</div>

<%= javascript_tag do %>
  enableCompletedFields('<%= completion_state %>', 'ul', 'label');
<% end %>`;

  return template;
};

/**
 * Generate template content for upload steps
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template content
 */
const generateUploadTemplate = (step, completionState) => {
  let template = '';
  
  // Determine the target based on step configuration
  if (step.role && step.role.toLowerCase() === 'student') {
    template += `<% @target = @student%>\n`;
  }
  
  // Set up document variables
  template += `<% @student_documents = @student.student_documents %>\n\n`;
  
  // Add upload components
  template += `<%= render partial: 'shared/common_upload_document', locals: { upload_document_instructions_partial: 'shared/upload_document_instructions' } %>\n`;
  
  // Add comments section
  template += `<br />
<%= render partial: 'shared/active_flow_all_comments_list' %>
<%= render partial: 'shared/active_flow_comment_entry' %>`;

  return template;
};

/**
 * Generate template content for information steps
 * @param {Object} step - The step data
 * @returns {string} - The template content
 */
const generateInformationTemplate = (step) => {
  let template = `<div class="info-step-content">
  ${step.information || ''}
</div>

<%= render partial: 'shared/active_flow_all_comments_list' %>
<%= render partial: 'shared/active_flow_comment_entry' %>`;

  return template;
};

/**
 * Generate template content for consent steps
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template content
 */
const generateConsentTemplate = (step, completionState) => {
  let template = `<div class="consent-form">
  <h3>${step.title || 'Parent Consent'}</h3>
  <div class="consent-content">
    ${step.consentText || 'I give my consent for my child to participate in this program.'}
  </div>
  
  <ul class="main-step-options">
    <li>
      <label class="js-sep">
        <%= radio_button_tag "fields[#{active_flow_step_id}][consent]", 'yes', @fields['consent'] == 'yes', class: 'js-comment-not-required' %>
        I consent
      </label>
    </li>
    <li>
      <label>
        <%= radio_button_tag "fields[#{active_flow_step_id}][consent]", 'no', @fields['consent'] == 'no', class: 'js-comment-required' %>
        I do not consent
      </label>
    </li>
  </ul>
</div>

<%= render partial: 'shared/active_flow_all_comments_list' %>

<div>
  <%= render partial: 'shared/active_flow_comment_entry', locals: {
    make_comment_required_selector: ".js-comment-required",
    make_comment_optional_selector: ".js-comment-not-required",
  } %>
</div>

<%= javascript_tag do %>
  enableCompletedFields('consent', 'ul', 'label');
<% end %>`;

  return template;
};

/**
 * Generate a generic template for other step types
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template content
 */
const generateGenericTemplate = (step, completionState) => {
  return `<!-- This is a generic template for a ${step.stepType} step -->
<p>This step needs a custom implementation.</p>

<%= render partial: 'shared/active_flow_all_comments_list' %>
<%= render partial: 'shared/active_flow_comment_entry' %>`;
};

/**
 * Generate common template footer
 * @param {Object} step - The step data
 * @returns {string} - The template footer content
 */
const generateTemplateFooter = (step) => {
  return '';
};

export default generateViewTemplates;
