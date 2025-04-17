/**
 * Application Fixture Generator
 * 
 * This module generates a standardized Ruby fixture for application fields and pages
 * that can be included in the workflow fixture export.
 */

/**
 * Generate a Ruby fixture for application fields and pages
 * @param {string} collegeVarName - The college variable name (lowercase, no spaces)
 * @param {string} collegeId - The college ID
 * @returns {string} - Ruby fixture code for application fields and pages
 */
export const generateApplicationFixture = (collegeVarName, collegeId) => {
  return `
# Always recreate CollegeStudentApplicationPage instances
CollegeStudentApplicationPage.where(owner_id: ${collegeVarName}_id, owner_type: 'College').destroy_all

CollegeStudentApplicationPage.create!([
  {
    owner_id: ${collegeVarName}_id,
    owner_type: 'College',
    kind: 'default',
    order: 1,
    internal_name: 'student_address',
    display_name: 'Student Information',
  },
  {
    owner_id: ${collegeVarName}_id,
    owner_type: 'College',
    kind: 'default',
    order: 2,
    internal_name: 'student_demographics',
    display_name: 'Student Demographics',
  },
  {
    owner_id: ${collegeVarName}_id,
    owner_type: 'College',
    kind: 'default',
    order: 3,
    internal_name: 'parent_information',
    display_name: 'Parent Information',
  },
  {
    owner_id: ${collegeVarName}_id,
    owner_type: 'College',
    kind: 'default',
    order: 4,
    internal_name: 'high_school',
    display_name: 'High School',
  },
  {
    owner_id: ${collegeVarName}_id,
    owner_type: 'College',
    kind: 'default',
    order: 5,
    internal_name: 'ferpa',
    display_name: 'FERPA Consent',
  },
  {
    owner_id: ${collegeVarName}_id,
    owner_type: 'College',
    kind: 'default',
    order: 6,
    internal_name: 'programs',
    display_name: 'Programs',
    exclude_when_true_method: 'student_high_school_has_no_programs?',
  },
])

# Create standard field groups and fields
name_and_address_group = ApplicationFieldGroup.where({
  owner_id: ${collegeVarName}_id,
  owner_type: 'College',
  name: 'name_and_address',
}).first_or_create

name_and_address_group.create_or_update_field({
  internal_name: 'street1',
  display_name: 'Street Address',
  field_type: 'text',
  ui_type: 'text_field',
  required: true,
  maximum_length: 30,
  display_size: 30,
})

name_and_address_group.create_or_update_field({
  internal_name: 'city',
  display_name: 'Town/City',
  field_type: 'text',
  ui_type: 'text_field',
  required: true,
  maximum_length: 25,
})

name_and_address_group.create_or_update_field({
  internal_name: 'cell_phone',
  display_name: 'Cell Phone',
  field_type: 'text',
  ui_type: 'text_field',
  required: true,
  include_in_dx: true,
  ui_validation_method: 'valid_cell_phone',
  backend_validation_method: 'valid_cell_phone',
  order: 9,
})

name_and_address_group.create_or_update_field({
  internal_name: 'email',
  display_name: 'Email',
  field_type: 'text',
  ui_type: 'text_field',
  ui_validation_method: 'valid_email',
  backend_validation_method: 'valid_email',
  required: true,
})

name_and_address_group.create_or_update_field({
  internal_name: 'gender',
  display_name: 'Gender',
  field_type: 'text',
  ui_type: 'drop_down',
  required: true,
  allowed_values: ['Female', 'Male'],
})

demographics_group = ApplicationFieldGroup.where({
  owner_id: ${collegeVarName}_id,
  owner_type: 'College',
  name: 'citizenship',
}).first_or_create

demographics_group.create_or_update_field({
  internal_name: 'citizenship_country',
  display_name: 'Citizenship Country',
  field_type: 'text',
  ui_type: 'drop_down',
  allowed_values: 'countries',
  required: true,
})

high_school_group = ApplicationFieldGroup.where({
  owner_id: ${collegeVarName}_id,
  owner_type: 'College',
  name: 'high_school',
}).first_or_create

high_school_group.create_or_update_field({
  internal_name: 'hs_current_grade',
  display_name: 'Grade Level (at time of applying)',
  field_type: 'text',
  ui_type: 'drop_down',
  allowed_values: ['9th', '10th', '11th', '12th'],
  required: true,
})

high_school_group.create_or_update_field({
  internal_name: 'hs_grad_date',
  display_name: 'Anticipated Graduation Date',
  field_type: 'text',
  ui_type: 'drop_down',
  allowed_values: 'high_school_grad_year',
  required: true,
})

ferpa_group = ApplicationFieldGroup.where({
  owner_id: ${collegeVarName}_id,
  owner_type: 'College',
  name: 'ferpa',
}).first_or_create

ferpa_group.create_or_update_field({
  internal_name: 'ferpa_consent',
  display_name: '',
  field_type: 'text',
  ui_type: 'radio_button',
  allowed_values: {
    'true' =>  ' Authorize',
    'false' => ' Do Not Authorize',
  },
  include_in_dx: true,
  include_in_reports: true,
  required: true,
})

# Create a basic enrollment form
Form.where(college_id: ${collegeVarName}_id).destroy_all

Form.create([
  {
    :college_id => ${collegeVarName}_id,
    :name => "enrollment_form",
    :parts => "header,body,parent_heading,parent_accept,parent_signature,section_break,student_heading,student_accept,student_signature,footer",
    :header => "<h3>HIGH SCHOOL PARTNERSHIPS REGISTRATION & AUTHORIZATION FORM</h3>",
    :student_accept => "<i>I have read and understand the guidelines.</i>\\r\\n",
    :parent_accept => "<i>I have read and understand the guidelines.</i>\\r\\n",
    :body => "<table width='99%'>
<tr><td>Student Name: <b>&nbsp;&nbsp;{{ student.name }}&nbsp;&nbsp;</b></td><td>Date of Birth: <b>&nbsp;&nbsp;{{ student.birth_date }}&nbsp;&nbsp;</b></td></tr>
<tr><td>Address: <b>&nbsp;&nbsp;{{ student.street1 }}&nbsp;&nbsp;</b></td><td>High School: <b>&nbsp;&nbsp;{{ high_school.name }}&nbsp;&nbsp;</b></td></tr>
<tr><td>City/State/Zip: <b>&nbsp;&nbsp;{{ student.city_state_zip }}&nbsp;&nbsp;</b></td><td>Grad Date: <b>&nbsp;&nbsp;{{ student.hs_grad_date }}&nbsp;&nbsp;</b></td></tr>
<tr><td>Email: <b>&nbsp;&nbsp;{{ student.email }}&nbsp;&nbsp;</b></td><td>Gender: <b>&nbsp;&nbsp;{{ student.gender_str }}&nbsp;&nbsp;</b></td></tr>
<tr><td>Cell Phone: <b>&nbsp;&nbsp;{{ student.cell_phone }}&nbsp;&nbsp;</b></td><td>Course: <b>&nbsp;&nbsp;{{ course.title }}&nbsp;&nbsp;</b></td></tr>
</table>",
    :footer => "",
  },
])
`;
};

export default generateApplicationFixture;
