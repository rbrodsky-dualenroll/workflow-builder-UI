/**
 * Single View Template Generator
 * 
 * This module provides a function to generate a view template for a single step.
 * It handles mapping step configuration details directly to the view template elements.
 */

import { getCompletionState } from '../getCompletionState';
import { getParticipantRole } from '../getParticipantInfo';

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
      template += generateConsentTemplate(step, completionState);
      break;
    default:
      // For other step types, use a generic template
      template += generateGenericTemplate(step, completionState);
  }
  
  return template;
};

/**
 * Generate the template header with initial variables and setup
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template header
 */
const generateTemplateHeader = (step, completionState) => {
  // Determine the target object based on workflow_category
  let targetSetup = '';
  
  if (step.workflow_category === 'Per Course') {
    targetSetup = `<% @student_de_course = @target %>\n<% @student = @student_de_course.student %>\n<% @course_section = @student_de_course.course_section %>\n<% @course = @course_section&.course %>\n`;
  } else if (step.workflow_category === 'Per Term') {
    targetSetup = `<% @student_term = @target %>\n<% @student = @student_term.student %>\n`;
  } else if (step.workflow_category === 'One Time') {
    targetSetup = `<% @college_student_application = @target %>\n<% @student = @college_student_application.student %>\n`;
  } else {
    // Default target setup
    targetSetup = `<% @student = @target %>\n`;
  }

  return `<% completion_state = @active_flow_step.get_parameter_by_name('completion_state') %>
<% active_flow_step_id = @active_flow_step_ids.first %>
<% @target = @target_hash[active_flow_step_id] %>
<% @fields = @fields_hash[active_flow_step_id] %>

${targetSetup}
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
  let template = '';
  
  // If we have table columns defined, display them in a table
  if (step.tableColumns && step.tableColumns.length > 0) {
    template += `<div class="workflow-data-table mb-4">
  <table class="table table-bordered">
    <thead>
      <tr>
        ${step.tableColumns.map(col => `<th>${col}</th>`).join('\n        ')}
      </tr>
    </thead>
    <tbody>
      <tr>
        ${step.tableColumns.map(col => {
          // Map column names to their likely ruby variables
          let cellContent = '';
          if (col.toLowerCase().includes('student') && col.toLowerCase().includes('name')) {
            cellContent = '<%= @student.name %>';
          } else if (col.toLowerCase().includes('course') && col.toLowerCase().includes('number')) {
            cellContent = '<%= @course&.number %>';
          } else if (col.toLowerCase() === 'crn') {
            cellContent = '<%= @course_section&.number %>';
          } else if (col.toLowerCase().includes('instructor')) {
            cellContent = '<%= @course_section&.instructor&.name %>';
          } else {
            cellContent = `<!-- ${col} data goes here -->`;
          }
          return `<td>${cellContent}</td>`;
        }).join('\n        ')}
      </tr>
    </tbody>
  </table>
</div>\n\n`;
  }
  
  template += `<ul class="main-step-options">\n`;
  
  // Map action options directly from the step configuration
  if (step.actionOptions && step.actionOptions.length > 0) {
    step.actionOptions.forEach(option => {
      // Extract value and determine if comments are required
      const value = option.value.includes('-') ? option.value.split('-')[1] : option.value;
      const requiresComment = option.requiresComment || option.value.includes('no') || option.value === 'defer';
      
      template += `  <li>
    <label${option.value.includes('yes') ? ' class="js-sep"' : ''}>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", '${value}', @fields[completion_state] == '${value}', class: 'js-comment-${requiresComment ? 'required' : 'not-required'}' %>
      ${option.label}
    </label>
  </li>\n`;
    });
  } else {
    // Default options if none defined
    template += `  <li>
    <label class="js-sep">
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", 'yes', @fields[completion_state] == 'yes', class: 'js-comment-not-required' %>
      ${step.approvalLabel || 'Approve - I have reviewed and approve this request'}
    </label>
  </li>
  <li>
    <label>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", 'no', @fields[completion_state] == 'no', class: 'js-comment-required' %>
      ${step.declineLabel || 'Decline - I cannot approve this request'}
    </label>
  </li>\n`;
  }
  
  template += `</ul>\n\n`;
  
  // Add comments section - based on step settings
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
  
  // Set up target based on role
  if (step.role && step.role.toLowerCase() === 'student') {
    template += `<% @target = @student%>\n`;
  }
  
  // Set up document variables
  template += `<% @student_documents = @student.student_documents %>\n\n`;
  
  // Add upload instructions based on step configuration
  let uploadInstructions = '';
  if (step.fileUploads && step.fileUploads.length > 0) {
    uploadInstructions = `<div class="upload-instructions mb-4">
  <h4 class="text-lg font-medium">Please upload the following:</h4>
  <ul class="list-disc ml-6">
    ${step.fileUploads.map(file => `<li>${file.label || file.type}</li>`).join('\n    ')}
  </ul>
</div>\n\n`;
    template += uploadInstructions;
  }
  
  // Add the upload component
  template += `<%= render partial: 'shared/common_upload_document', locals: { 
  upload_document_instructions_partial: 'shared/upload_document_instructions',
  document_kinds: [${step.fileUploads ? step.fileUploads.map(file => `'${file.type || "other"}'`).join(', ') : "'other'"}]
} %>\n`;
  
  // Add comments section
  template += `\n<%= render partial: 'shared/active_flow_all_comments_list' %>
<%= render partial: 'shared/active_flow_comment_entry' %>`;

  return template;
};

/**
 * Generate template content for information steps
 * @param {Object} step - The step data
 * @returns {string} - The template content
 */
const generateInformationTemplate = (step) => {
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

export default generateSingleViewTemplate;
