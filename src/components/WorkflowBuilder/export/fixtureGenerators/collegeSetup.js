/**
 * Utilities for generating file header and college setup code
 */

/**
 * Generate the file header with version numbers
 * @param {string} collegeVarName - The college variable name
 * @param {string} collegeId - The college ID
 * @param {Object} versionNumbers - Version numbers for different workflow types
 * @returns {string} - Ruby code for the file header
 */
export const generateFileHeader = (collegeVarName, collegeId, versionNumbers) => {
  return `${collegeVarName}_id = ${collegeId}

${collegeVarName}_college_student_application_active_flow_definition_version_number = ${versionNumbers.college_student_application}
${collegeVarName}_student_term_academic_year_active_flow_definition_version_number = ${versionNumbers.student_term_academic_year}
${collegeVarName}_student_term_active_flow_definition_version_number = ${versionNumbers.student_term}
${collegeVarName}_registration_active_flow_definition_version_number = ${versionNumbers.registration}

`;
};

/**
 * Generate college setup code
 * @param {string} collegeVarName - The college variable name
 * @param {Object} collegeData - College information (name, id, city, etc.)
 * @returns {string} - Ruby code for college setup
 */
export const generateCollegeSetup = (collegeVarName, collegeData) => {
  return `# College attributes to override
college_always_update_attributes = {
  inst_name: "${collegeData.name}",
  admission_application_url: nil,
  branded_host: '${collegeVarName}',
}

# Update or create College
if College.exists?(id: ${collegeVarName}_id)
  College.update(${collegeVarName}_id, college_always_update_attributes)
else
  College.seed(:id,
    {
      # id will be set by seed-fu based on the first argument
      ope_id: "00000000",
      type_label: "${collegeData.type || 'Public: 2-year'}",
      type_level: 2, profit: false,
      city: "${collegeData.city || 'City'}",
      state: "${collegeData.state || 'ST'}",
      zip: "${collegeData.zip || '00000'}",
      phone: "${collegeData.phone || '0000000000'}",
      url: "${collegeData.url || 'www.example.edu'}",
      enrollment: 0,
    }.merge(college_always_update_attributes)
  )
end

College.find(${collegeVarName}_id).set_local_option(LocalOption::College::USE_COLLEGE_STUDENT_APPLICATION, true)

`;
};
