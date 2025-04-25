# Form Fields Enhancements in Workflow Builder

## Overview

We've enhanced the Workflow Builder with robust support for input form fields in two key areas:

1. **Table Column Input Fields**: Add form fields directly in table columns
2. **Action Option Form Fields**: Associate form fields with specific action options

These improvements ensure tighter integration with DualEnroll's backend by automatically generating the appropriate `update_attributes` parameters in the Ruby fixtures.

## Key Changes

### 1. Table Column Input Fields

**Implementation:**
- Added input field types (text, number, radio, select, checkbox)
- Predefined standard input columns (GPA, Grade Level, etc.)
- Custom input field creation with model path specification
- Automatic `update_attributes` generation from column definitions

**Benefits:**
- Match common DualEnroll patterns (GPA entry, grade level selection)
- Ensure proper field names for Ruby model attributes
- Generate correct view templates with appropriate form fields
- Standardize input validation (min/max ranges, step values, options)

### 2. Action Option Form Fields

**Implementation:**
- Enhanced action options with additional information fields
- Predefined common properties (student ID, GPA, etc.)
- Model path selection for proper attribute mapping
- Field type configuration with validation options

**Benefits:**
- Support patterns like "Student ID for returning students"
- Ensure consistent naming with DualEnroll models
- Generate appropriate update_attributes in Ruby fixtures

### 3. Ruby Fixture Generation

**Implementation:**
- Enhanced `getParameters.js` to collect input fields
- Automatic `update_attributes` parameter generation
- Support for multiple model paths in a single step

**Benefits:**
- Correctly update DualEnroll models in the backend
- Remove manual parameter configuration
- Ensure consistency with actual application behavior

### 4. ERB Template Generation

**Implementation:**
- Enhanced `approvalTemplateGenerator.js` for input fields
- Generate appropriate form field tags based on type:
  - `text_field_tag` for text input
  - `number_field_tag` for numbers with min/max/step
  - `radio_button_tag` groups for radio options
  - `select_tag` for dropdown selects
  - `check_box_tag` for checkboxes

**Benefits:**
- Match DualEnroll's actual view templates
- Ensure proper form field names and values
- Support the variety of input types used in the application

## Example Use Cases

### High School GPA and Grade Input

```ruby
{
  active_flow_definitions: [student_term_active_flow_definition],
  name: 'Approve Student Participation',
  version: student_term_active_flow_definition_version_number,
  description: '',
  participant: 'Approver',
  step_class: 'UploadDocumentStep',
  view_name_override: 'active_flow_steps/course_registration/high_school/provide_gpa',
  parameters: {
    'completion_state' => 'approve_gpa',
    'document_class' => 'StudentDocument',
    'kinds' => ['transcript'],
    'update_attributes' => { 'college_student_application' => ['hs_gpa', 'hs_current_grade'] },
  },
  participant_role: 'approver',
  soft_required_fields: ['initialization_complete', 'non_partner']
}
```

Generated ERB template for a GPA input field:

```erb
<td id="hs_gpa-<%=active_flow_step_id%>">
  <%= number_field_tag "fields[#{active_flow_step_id}][hs_gpa]", @fields['hs_gpa'], { min: 0, max: 4, size: 8, step: 0.1 } %>
</td>
```

### Student ID for Returning Students

```ruby
{
  active_flow_definitions: [student_term_active_flow_definition],
  name: "Application Decision",
  version: student_term_active_flow_definition_version_number,
  description: "",
  step_class: "ApprovalStep",
  view_name_override: 'active_flow_steps/course_registration/college/application_decision',
  parameters: {
    'completion_state' => 'application_decision',
    'update_attributes' => { 'college_student_application' => [ 'student_number' ] },
  },
  participant: "College",
  participant_role: 'coll',
  soft_required_fields: ['approve_gpa_yes', 'no_student_id'],
}
```

## Documentation Added

Comprehensive documentation has been added to guide users in utilizing these new features:

- `docs/input_fields_documentation.md`: Detailed guide on input field usage
- Inline help text in the UI to explain concepts and options

## Testing

A test file has been created to ensure proper functionality:
- Verify input field creation and configuration
- Test generation of update_attributes
- Ensure proper ERB template generation
