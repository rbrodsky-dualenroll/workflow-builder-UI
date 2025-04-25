/**
 * Approval Step Template Generator
 * 
 * Functions for generating templates for approval steps
 */

import { generateCommentsSection } from './baseTemplateGenerator';

/**
 * Generate template content for approval steps
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template content
 */
export const generateApprovalTemplate = (step, completionState) => {
  let template = '';
  console.log(`generating approval template for step: ${step}`)
  console.log(step)
  // If we have table columns defined and form fields, display them in a data table
  if (step.tableColumns && step.tableColumns.length > 0) {
    template += generateApprovalTable(step, completionState);
  }
  
  // If there are update_attributes, add form fields for them outside of tables
  if (step.parameters && step.parameters.update_attributes) {
    template += generateAttributesForm(step);
  }
  
  // For simple approval steps, show options as a list
  if (!step.tableColumns || step.tableColumns.length === 0) {
    template += generateActionOptionsList(step, completionState);
  }
  
  // Add comments section - based on step settings
  template += generateCommentsSection(true);

  // Add enableCompletedFields JavaScript
  template += `\n\n<%= javascript_tag do %>
  enableCompletedFields('<%= completion_state %>', 'ul', 'label');
<% end %>`;

  return template;
};

/**
 * Generate a data table for approvals with multiple columns/fields
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The table HTML
 */
const generateApprovalTable = (step, completionState) => {
  // Check if the table should use a multiple-row iterator (for approving multiple items)
  const useMultipleRows = step.multipleRows || step.tableColumns.some(col => 
    (typeof col === 'string' && col.toLowerCase() === 'action') || 
    (typeof col === 'object' && col.field && col.field.toLowerCase() === 'action')
  );
    
  let tableHtml = `<table class="data-table" style="width: 100%; margin-top:10px">
  <thead>
    <tr>
      <th>Action Options</th>
      ${step.tableColumns.map(col => {
        // Generate proper column headings
        const colLabel = typeof col === 'string' ? col : (col.label || col.field || '');
        return `<th>${colLabel}</th>`;
      }).join('\n      ')}
    </tr>
  </thead>
  <tbody>
`;

  // If we need to iterate through multiple steps/rows
  if (useMultipleRows) {
    tableHtml += `  <% @active_flow_step_ids.each do |active_flow_step_id| %>
    <% @target = @target_hash[active_flow_step_id] %>
    <% @fields = @fields_hash[active_flow_step_id] %>
    <tr id="<%=active_flow_step_id%>">
`;
  } else {
    tableHtml += `    <tr>
`;
  }
  tableHtml += `<td>${generateActionOptionsList(step, completionState)}</td>`;
  // Generate table cells based on column definitions
  step.tableColumns.forEach((col, index) => {
    const colKey = typeof col === 'string' ? col.toLowerCase() : (col.field || '').toLowerCase();
    console.log(`generating cell for column: ${colKey}`)
    let cellContent = '';

    if (colKey === 'student name') {
      cellContent = `<td><%= @target.student.display_name %></td>`;
    }
    // Handle course number column
    else if (colKey.includes('course') && colKey.includes('number')) {
      cellContent = `<td><%= @course&.number %></td>`;
    }
    // Handle CRN column
    else if (colKey === 'crn') {
      cellContent = `<td><%= @course_section&.number %></td>`;
    }
    // Handle instructor column
    else if (colKey.includes('instructor')) {
      cellContent = `<td><%= @course_section&.instructor&.name %></td>`;
    }
    // Handle custom form field columns
    else if (step.formFields && step.formFields[index]) {
      cellContent = generateFormFieldCell(step.formFields[index]);
    }
    // Default cell content
    else {
      cellContent = `<td><!-- ${col} data goes here --></td>`;
    }

    tableHtml += `      ${cellContent}\n`;
  });

  // Close row and table
  if (useMultipleRows) {
    tableHtml += `    </tr>
  <% end %>
`;
  } else {
    tableHtml += `    </tr>
`;
  }
    
  tableHtml += `  </tbody>
</table>\n\n`;

  return tableHtml;
};

/**
 * Generate HTML for a form field cell in a table
 * @param {Object} field - The form field definition
 * @returns {string} - The cell HTML
 */
const generateFormFieldCell = (field) => {
  switch (field.type) {
    case 'numeric':
    case 'number':
      return `<td id="${field.name}-<%=active_flow_step_id%>">
        <%= number_field_tag "fields[#{active_flow_step_id}][${field.name}]", @fields['${field.name}'], { min: ${field.min || 0}, max: ${field.max || 9999}, size: 8, step: ${field.step || 0.1} } %>
      </td>`;
    case 'radio':
      return `<td style="white-space:nowrap" id="${field.name}-<%=active_flow_step_id%>">
        ${(field.options || []).map(opt => 
          `<label><%= radio_button_tag "fields[#{active_flow_step_id}][${field.name}]", '${opt.value}', @fields['${field.name}'] == '${opt.value}' %>&nbsp;<b>${opt.label}</b></label><br />`
        ).join('')}
      </td>`;
    case 'text':
    default:
      return `<td id="${field.name}-<%=active_flow_step_id%>">
        <%= text_field_tag "fields[#{active_flow_step_id}][${field.name}]", @fields['${field.name}'] %>
      </td>`;
  }
};

/**
 * Generate a form section for update_attributes
 * @param {Object} step - The step data
 * @returns {string} - The form HTML
 */
const generateAttributesForm = (step) => {
  let formHtml = `<div class="update-attributes-form">\n`;
    
  Object.entries(step.parameters.update_attributes).forEach(([targetObj, attributes]) => {
    if (Array.isArray(attributes)) {
      attributes.forEach(attr => {
        // Generate appropriate form field based on attribute name
        if (attr.includes('gpa')) {
          formHtml += `  <div class="form-group">
    <label for="fields_${attr}">GPA:</label>
    <%= number_field_tag "fields[#{active_flow_step_id}][${attr}]", @fields['${attr}'], { min: 0, max: 4, size: 8, step: 0.1 } %>
  </div>\n`;
        } else if (attr.includes('grade')) {
          formHtml += `  <div class="form-group">
    <label>Grade Level:</label><br/>
    <label><%= radio_button_tag "fields[#{active_flow_step_id}][${attr}]", 'Freshman', @fields['${attr}'] == 'Freshman' %>&nbsp;Freshman</label><br/>
    <label><%= radio_button_tag "fields[#{active_flow_step_id}][${attr}]", 'Sophomore', @fields['${attr}'] == 'Sophomore' %>&nbsp;Sophomore</label><br/>
    <label><%= radio_button_tag "fields[#{active_flow_step_id}][${attr}]", 'Junior', @fields['${attr}'] == 'Junior' %>&nbsp;Junior</label><br/>
    <label><%= radio_button_tag "fields[#{active_flow_step_id}][${attr}]", 'Senior', @fields['${attr}'] == 'Senior' %>&nbsp;Senior</label>
  </div>\n`;
        } else {
          formHtml += `  <div class="form-group">
    <label for="fields_${attr}">${attr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</label>
    <%= text_field_tag "fields[#{active_flow_step_id}][${attr}]", @fields['${attr}'] %>
  </div>\n`;
        }
      });
    }
  });
    
  formHtml += `</div>\n\n`;
  
  return formHtml;
};

/**
 * Generate a list of action options with radio buttons
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The list HTML
 */
const generateActionOptionsList = (step, completionState) => {
  let listHtml = `<ul class="main-step-options">\n`;
    
  // Map action options directly from the step configuration
  if (step.actionOptions && step.actionOptions.length > 0) {
    // Add separator before decline/defer options if there are more than 2 options
    let addedSeparator = false;
    console.log("getting step action options")
    step.actionOptions.forEach((option, index) => {
      console.log(option)
      // Use the exact value from the configuration
      const value = option.value;
      // Determine if comments are required
      const requiresComment = option.requiresComment || 
                              value.includes('_more_info') || 
                              value === 'decline' || 
                              value === 'no' || 
                              value === 'decide_later';

      // Determine the class for the label
      let labelClass = '';
      if (value === 'yes' || value === 'approve') {
        labelClass = ' class="js-sep"';
      }
        
      listHtml += `  <li>
    <label${labelClass}>
      <%= radio_button_tag "fields[#{active_flow_step_id}][#{completion_state}]", '${value}', @fields[completion_state] == '${value}', class: 'js-comment-${requiresComment ? 'required' : 'not-required'}' %>
      ${option.label}
    </label>
  </li>\n`;
    });
  } else {
    // Default options if none defined
    listHtml += `  <li>
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
    
  listHtml += `</ul>\n\n`;
  
  return listHtml;
};

export default generateApprovalTemplate;
