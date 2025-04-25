# Input Fields in Workflow Builder

This document explains how to use input fields in the Workflow Builder to create dynamic forms that collect and update data in the DualEnroll system.

## Overview

Input fields in the Workflow Builder serve two primary purposes:

1. **Table Column Input Fields**: Add form fields directly in data tables for collecting information like GPA, grade level, etc.
2. **Action Option Form Fields**: Associate form fields with specific action options (e.g., requiring a student ID when selecting "Approve Returning Student").

Both types automatically update the `update_attributes` parameter in the generated Ruby fixture, ensuring proper data flow to the appropriate models in DualEnroll.

## Table Column Input Fields

### Adding Input Columns

When adding a table column, you have two options:

1. **Standard Input Fields**: Select from predefined input columns like "GPA Input", "Grade Level Input", etc.
2. **Custom Input Fields**: Create your own by selecting "Custom Field" and enabling "This is an input field"

For custom input fields, you'll need to specify:
- **Display Label**: What users will see in the UI
- **Field Name**: The Ruby code field name (without `fields.` prefix)
- **Input Type**: Text, Number, Radio Buttons, Select, or Checkbox
- **Model Path**: Which model to update (CollegeStudentApplication, StudentDeCourse, etc.)
- **Additional Properties**: Options for radio/select, min/max/step for numbers

### How Input Columns Work

Input columns generate form fields in the table cells. For example, a "GPA Input" column creates:

```erb
<td id="hs_gpa-<%=active_flow_step_id%>">
  <%= number_field_tag "fields[#{active_flow_step_id}][hs_gpa]", @fields['hs_gpa'], { min: 0, max: 4, size: 8, step: 0.1 } %>
</td>
```

These fields update values in the ActiveFlow fields hash when submitted, which are then persisted to the specified model through the `update_attributes` parameter.

## Action Option Form Fields

### Configuring Form Fields for Action Options

When creating or editing an action option, you can:

1. Check "Requires additional information"
2. Provide configuration details:
   - Label for the field
   - Field name for Ruby code
   - Input field type
   - Model path for update_attributes
   - Field-specific properties (options, min/max, etc.)

### Predefined Properties

For convenience, common properties are predefined for quick selection:
- Student ID
- High School GPA
- Grade Level
- Graduation Year
- Registration Notes
- Approval/Decline Reasons

### How Action Option Fields Work

When a user selects an action option with an associated form field, the additional field appears for data entry. The entered value is stored in the fields hash and then included in the `update_attributes` parameter to update the appropriate model.

## Generated Ruby Parameters

The integration into the Ruby fixture is handled automatically. For a step with input fields, the generated parameters will include an `update_attributes` section:

```ruby
'parameters' => {
  'completion_state' => 'approve_gpa',
  'document_class' => 'StudentDocument',
  'kinds' => ['transcript'],
  'update_attributes' => { 'college_student_application' => ['hs_gpa', 'hs_current_grade'] },
}
```

This tells DualEnroll to take these field values from the ActiveFlow fields hash and update the corresponding attributes in the CollegeStudentApplication model.

## Example Use Cases

### High School GPA and Grade Level Input

A common pattern is to have high schools provide GPA and grade level information:

1. Add a step with a table that includes:
   - Student Name (display field)
   - GPA Input (number input field)
   - Grade Level Input (radio buttons)
   - Graduation Year Input (number input field)

2. Configure all input fields to update the `college_student_application` model

### Student ID for Returning Students

Another common pattern is collecting student IDs for returning students:

1. Create an approval step with multiple action options
2. For the "Approve Returning Student" option:
   - Check "Requires additional information"
   - Set label to "Student ID"
   - Set field name to "student_number"
   - Set model path to "college_student_application"

## Best Practices

1. **Use Standard Fields**: When possible, use the predefined input fields to ensure consistency with the core DualEnroll application.

2. **Match Field Names**: Ensure field names match the attribute names in the DualEnroll models.

3. **Validate Inputs**: Set appropriate min/max values for number fields and provide a complete set of options for radio/select inputs.

4. **Consider Model Relationships**: Choose the correct model path based on what the field should update:
   - `college_student_application` for student profile data
   - `student_de_course` for course registration data
   - `student_term` for term-specific data
