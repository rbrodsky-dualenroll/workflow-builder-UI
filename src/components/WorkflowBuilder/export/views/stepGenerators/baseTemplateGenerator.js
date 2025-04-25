/**
 * Base Template Generator
 * 
 * Common functions for generating base template elements regardless of step type
 */

/**
 * Generate the template header with initial variables and setup
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template header
 */
export const generateTemplateHeader = (step) => {
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
 * Generate standard comments section for a template
 * @param {boolean} includeRequiredLogic - Whether to include required/optional logic
 * @returns {string} - The comments section template
 */
export const generateCommentsSection = (includeRequiredLogic = false) => {
  if (includeRequiredLogic) {
    return `\n<%= render partial: 'shared/active_flow_all_comments_list' %>

<div>
  <%= render partial: 'shared/active_flow_comment_entry', locals: {
    make_comment_required_selector: ".js-comment-required",
    make_comment_optional_selector: ".js-comment-not-required",
  } %>
</div>`;
  }
  
  return `\n<%= render partial: 'shared/active_flow_all_comments_list' %>
<%= render partial: 'shared/active_flow_comment_entry' %>`;
};

/**
 * Generate a generic template for unspecialized step types
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template content
 */
export const generateGenericTemplate = (step) => {
  return `<!-- This is a generic template for a ${step.stepType} step -->
<p>This step needs a custom implementation.</p>

${generateCommentsSection()}`;
};

/**
 * Generate common template footer
 * @returns {string} - The template footer
 */
export const generateTemplateFooter = () => {
  return '';
};
