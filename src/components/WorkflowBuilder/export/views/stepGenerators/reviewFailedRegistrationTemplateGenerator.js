/**
 * Review Failed Registration Template Generator
 * 
 * Functions for generating templates for review failed registration steps
 */

import { generateCommentsSection } from './baseTemplateGenerator';

/**
 * Generate template content for review failed registration steps
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template content
 */
export const generateReviewFailedRegistrationTemplate = (step, completionState) => {
  // Start with basic explanation of the step's purpose
  let template = `<% @student = @target.student %>
<%= render layout: 'shared/active_view', locals: { active_view_file_instance: __FILE__ } do %>
  <p style="margin-bottom: 10px">One of your students, <em><%= @student.display_name %></em>, wishes to enroll in <em><%= @target.course_section.display_name %>.</em>
    This student's registration was submitted but could not be completed. Please review the student's registration and see if it can be corrected for resubmission,
    then indicate below how the registration should be handled.
  </p>
<% end -%>

<h3 style="margin-top: 10px">Explanation:</h3><br />
<%= text_area_tag 'fields[registration_response_reason]', @fields['registration_response_reason'], style: 'width:99%; padding: 10px;', disabled: 'disabled' %>
<br />

<% @student_documents = @student.student_documents %>
<% if @student_documents.present? %>
  <%= render partial: 'shared/student_documents_list', locals: {hide_term: true} %>
<% end %>
<br />`;

  // Generate the action options
  template += `<h3 style="margin-top: 10px"><u>Rejected Registration Disposition</u></h3>
<br />
<ul style="margin: 10px 10px;">`;

  // Add standard action options
  
  // Check if we have feedback steps for students
  const hasFeedbackStepsForStudents = checkForFeedbackOptions(step, 'student');
  if (hasFeedbackStepsForStudents) {
    template += `
  <li style="margin: 10px 10px;">
    <label>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", 'student_resolve_issues', @fields[completion_state] == 'student_resolve_issues', class: 'js-comment-required' %>
      <b>Student resolve issues</b>
    </label>
  </li>`;
  }

  // Check if we have feedback steps for high school
  const hasFeedbackStepsForHS = checkForFeedbackOptions(step, 'high_school') || 
                                checkForFeedbackOptions(step, 'counselor');
  if (hasFeedbackStepsForHS) {
    template += `
  <li style="margin: 10px 10px;">
    <label>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", 'hs_resolve_issues', @fields[completion_state] == 'hs_resolve_issues', class: 'js-comment-required' %>
      <b>Counselor resolve issues</b>
    </label>
  </li>`;
  }

  // Standard options that should always be available
  template += `
  <li style="margin: 10px 10px;">
    <label>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", 'yes', @fields[completion_state] == 'yes', class: 'js-comment-not-required' %>
      <b>I have corrected the issue; resubmit</b>
    </label>
  </li>
  <li style="margin: 10px 10px;">
    <label>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", 'complete', @fields[completion_state] == 'complete', class: 'js-comment-not-required' %>
      <b>Student was manually enrolled in SIS. Change to complete in DualEnroll.com.</b>
    </label>
  </li>
  <li style="margin: 10px 10px;">
    <label>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", 'decline', @fields[completion_state] == 'decline', class: 'js-comment-required' %>
      <b>Terminate the registration and notify the student and counselor</b>
    </label>
  </li>
</ul>`;

  // Add comments section
  template += `
<%= render partial: 'shared/active_flow_all_comments_list' %>
<%= render partial: 'shared/active_flow_comment_entry', locals: {
  public_target: 'student',
  make_comment_required_selector: ".js-comment-required",
  make_comment_optional_selector: ".js-comment-not-required",
} %>`;

  return template;
};

/**
 * Check if a step has associated feedback options with a specific role
 * @param {Object} step - The step data
 * @param {string} role - The role to check for feedback options
 * @returns {boolean} - Whether feedback options exist
 */
const checkForFeedbackOptions = (step, role) => {
  if (!step.feedbackLoops) return false;
  
  return Object.values(step.feedbackLoops).some(option => 
    option.feedbackStepRole?.toLowerCase() === role.toLowerCase()
  );
};

export default generateReviewFailedRegistrationTemplate;