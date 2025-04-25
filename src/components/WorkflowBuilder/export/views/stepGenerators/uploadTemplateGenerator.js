/**
 * Upload Step Template Generator
 * 
 * Functions for generating templates for upload document steps
 */

import { generateCommentsSection } from './baseTemplateGenerator';

/**
 * Generate template content for upload steps
 * @param {Object} step - The step data
 * @param {string} completionState - The completion state variable
 * @returns {string} - The template content
 */
export const generateUploadTemplate = (step, completionState) => {
  console.log(`generating upload template for step: ${step}`)
  let template = '';
  
  // Set up document class and content
  const documentClass = step.documentClass || 'StudentDocument';
  template += `<% @${documentClass.toLowerCase().replace(/document$/, '_documents')} = @student.${documentClass.toLowerCase().replace(/document$/, '_documents')} %>\n\n`;
  template += `<% @target = @student %>\n\n`;
  // Add table for collecting additional attributes if needed (e.g., GPA, grade level)
  if (step.parameters && (step.parameters.update_attributes || step.parameters.update_application_field_values)) {
    template += generateAttributeUpdateTable(step);
  }
  
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
  
  // Add the upload component with specific document kinds if specified
  const documentKinds = getDocumentKinds(step);
  
  // Generate the upload component with document kinds and document class
  template += `<%= render partial: 'shared/common_upload_document', locals: { 
  upload_document_instructions_partial: 'shared/upload_document_instructions',
  document_class_name: '${documentClass}',
  document_kinds: [${documentKinds.map(kind => `'${kind}'`).join(', ')}]
} %>\n`;
  
  // Add validation script for required uploads if specified
  if (step.requireUpload) {
    const requiredKinds = documentKinds.length > 0 ? 
      documentKinds.map(kind => `'${kind}'`).join(', ') : 
      "'transcript', 'other'";
      
    template += `\n<% unless @${documentClass.toLowerCase().replace(/document$/, '_documents')}.where(kind: [${requiredKinds}]).exists? %>
  <%= javascript_tag do -%>
    function validateForm(){
    showFlashMsg('Please upload the required document(s)');
    return false;
    }
  <% end -%>
<% end %>\n`;
  }
  
  // Add comments section
  template += generateCommentsSection();

  return template;
};

/**
 * Extract document kinds from the step configuration
 * @param {Object} step - The step data
 * @returns {Array} - Array of document kinds
 */
const getDocumentKinds = (step) => {
  const documentKinds = [];
  
  // Get document kinds from step parameters
  if (step.parameters && step.parameters.kinds && Array.isArray(step.parameters.kinds)) {
    documentKinds.push(...step.parameters.kinds);
  }
  
  // Get document kinds from fileUploads as a fallback
  if (documentKinds.length === 0 && step.fileUploads && step.fileUploads.length > 0) {
    step.fileUploads.forEach(file => {
      if (file.fileType && !documentKinds.includes(file.fileType)) {
        documentKinds.push(file.fileType);
      }
    });
  }
  
  // Add 'other' as a fallback if no document kinds specified
  if (documentKinds.length === 0) {
    documentKinds.push('other');
  }
  
  return documentKinds;
};

/**
 * Generate a table for collecting attribute updates
 * @param {Object} step - The step data
 * @returns {string} - The table HTML
 */
const generateAttributeUpdateTable = (step) => {
  let tableHtml = '';
  
  // Get attributes to update
  const attributesToUpdate = [];
  
  if (step.parameters && step.parameters.update_attributes) {
    Object.entries(step.parameters.update_attributes).forEach(([targetObj, attrs]) => {
      if (Array.isArray(attrs)) {
        attrs.forEach(attr => attributesToUpdate.push({ name: attr, target: targetObj }));
      }
    });
  }
  
  if (step.parameters && step.parameters.update_application_field_values && Array.isArray(step.parameters.update_application_field_values)) {
    step.parameters.update_application_field_values.forEach(field => {
      attributesToUpdate.push({ name: field, target: 'application' });
    });
  }
  
  if (attributesToUpdate.length > 0) {
    // Create column headings based on attributes
    const columns = ['Action', 'Student Name'];
    const fieldTypes = {};
    
    attributesToUpdate.forEach(attr => {
      let columnLabel = attr.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      columns.push(columnLabel);
      
      // Determine field type based on attribute name
      if (attr.name.includes('gpa')) {
        fieldTypes[attr.name] = 'number';
      } else if (attr.name.includes('grade') || attr.name.includes('current')) {
        fieldTypes[attr.name] = 'radio';
      } else if (attr.name.includes('year')) {
        fieldTypes[attr.name] = 'year';
      } else if (attr.name.includes('id')) {
        fieldTypes[attr.name] = 'id';
      } else {
        fieldTypes[attr.name] = 'text';
      }
    });
    
    // Get completion state
    const completionStateValue = step.parameters && step.parameters.completion_state ? 
                                step.parameters.completion_state : 'approve_gpa';
    
    // Create table
    tableHtml = `<table class="data-table" style="margin-top:10px">
  <tr>
    ${columns.map(col => `<th${col === 'Action' ? ' width="30px;"' : ''}>${col}</th>`).join('\n    ')}
  </tr>
  <% @active_flow_step_ids.each do |active_flow_step_id| %>
    <% @target = @target_hash[active_flow_step_id] %>
    <% @fields = @fields_hash[active_flow_step_id] %>
    <tr id="<%=active_flow_step_id%>">
      <td style="white-space:nowrap" id="approve-<%=active_flow_step_id%>">
        <label>
          <%= radio_button_tag "fields[#{active_flow_step_id}][#{completionStateValue}]", 'yes', @fields[completion_state] == 'yes' %>
          <b>Approve</b>
        </label><br />
        <hr style="border-bottom-color: #8e8e8e">
        <label>
          <%= radio_button_tag "fields[#{active_flow_step_id}][#{completionStateValue}]", 'decline', @fields[completion_state] == 'decline' %>
          <b>Deny</b>
        </label><br/>
      </td>
      <td><%= @target.student.display_name %></td>`;
    
    // Add field cells
    attributesToUpdate.forEach(attr => {
      const fieldType = fieldTypes[attr.name];
      let fieldHtml = '';
      
      switch (fieldType) {
        case 'number':
          fieldHtml = `<td id="${attr.name}-<%=active_flow_step_id%>">
        <%= number_field_tag "fields[#{active_flow_step_id}][${attr.name}]", @fields['${attr.name}'], { min: 0, max: 4, size: 8, step: 0.1 } %>
      </td>`;
          break;
        case 'year':
          const currentYear = new Date().getFullYear();
          fieldHtml = `<td>
        <%= number_field_tag "fields[#{active_flow_step_id}][${attr.name}]", @fields['${attr.name}'], { min: ${currentYear}, max: ${currentYear + 10}, size: 8, step: 1 } %>
      </td>`;
          break;
        case 'id':
          fieldHtml = `<td>
        <%= text_field_tag "fields[#{active_flow_step_id}][${attr.name}]", @fields['${attr.name}'], { size: 12, maxlength: 20 } %>
      </td>`;
          break;
        case 'radio':
          fieldHtml = `<td style="white-space:nowrap" id="${attr.name}-<%=active_flow_step_id%>">
        <label><%= radio_button_tag "fields[#{active_flow_step_id}][${attr.name}]", 'Freshman', @fields['${attr.name}'] == 'Freshman' %>&nbsp;<b>Freshman</b></label><br />
        <label><%= radio_button_tag "fields[#{active_flow_step_id}][${attr.name}]", 'Sophomore', @fields['${attr.name}'] == 'Sophomore' %>&nbsp;<b>Sophomore</b></label><br />
        <label><%= radio_button_tag "fields[#{active_flow_step_id}][${attr.name}]", 'Junior', @fields['${attr.name}'] == 'Junior' %>&nbsp;<b>Junior</b></label><br />
        <label><%= radio_button_tag "fields[#{active_flow_step_id}][${attr.name}]", 'Senior', @fields['${attr.name}'] == 'Senior' %>&nbsp;<b>Senior</b></label><br />
      </td>`;
          break;
        default:
          fieldHtml = `<td>
        <%= text_field_tag "fields[#{active_flow_step_id}][${attr.name}]", @fields['${attr.name}'] %>
      </td>`;
      }
      
      tableHtml += `      ${fieldHtml}\n`;
    });
    
    // Close table
    tableHtml += `    </tr>\n  <% end %>\n</table>\n\n`;
    
    // Add validation script if required
    if (attributesToUpdate.some(attr => attr.name.includes('gpa'))) {
      tableHtml += `\n<script type="text/javascript">\n  function validateForm() {\n    // Check if a transcript is uploaded\n    <% unless @student.student_documents.where(kind: 'transcript').exists? %>\n    showFlashMsg('Please upload a transcript');\n    return false;\n    <% end %>\n\n    $("#notice").hide();\n    var ok = true;\n    $("tr").each(function(){\n      var stepId = $(this).attr('id');\n      var $approveGpa = $('#approve-' + stepId).find("input[type=radio]:checked");\n      var $gpa = $('#gpa-' + stepId).find('input');\n      var $academicYear = $('input[type=radio][name^="fields[' + stepId + '][hs_current_grade]"]');\n\n      if ($approveGpa.val() == 'yes') {\n        if ($gpa.val() == '') {\n          $("#notice").text('One or more GPAs are blank for approved students');\n          ok = false;\n          $("#notice").css("color","red");\n          $("#notice").show();\n          $gpa.css("border", "1px solid red");\n          setFocus($gpa);\n        } else {\n          $gpa.css("border", "1px solid gray");\n\n          if (!$academicYear.is(":checked")) {\n            $("#notice").text('One or more Academic Years have not been selected for approved students');\n            ok = false;\n            $("#notice").css("color","red");\n            $("#notice").show();\n            $academicYear.css("border", "1px solid red");\n            setFocus($academicYear);\n          } else {\n            $academicYear.css("border", "1px solid gray");\n          }\n        }\n      }\n    });\n    return ok;\n  }\n</script>\n`;
    }
  }
  
  return tableHtml;
};

export default generateUploadTemplate;
