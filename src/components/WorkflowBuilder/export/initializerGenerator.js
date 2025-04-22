/**
 * Initializer Generator
 * 
 * This module generates a Ruby initializer class file based on the workflow scenarios
 * to handle setting conditional fields and completion states appropriately.
 */

import { getMergedWorkflow } from '../ScenarioOperations';
import { getCompletionState } from './getCompletionState';
import { snakeCase } from './utils';

/**
 * Generate a Ruby initializer class file for a specific target object type
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {string} collegeVarName - The college variable name (lowercase, no spaces)
 * @param {string} targetObjectType - The target object type (e.g., 'CollegeStudentApplication', 'StudentTerm', 'StudentDeCourse')
 * @returns {string} - Ruby initializer class code
 */
export const generateInitializerClass = (workflowData, collegeVarName, targetObjectType) => {
  // Determine the appropriate class name
  let classNameSuffix;
  if (targetObjectType === 'StudentDeCourse') {
    classNameSuffix = 'CourseRegistration';
  } else {
    classNameSuffix = targetObjectType;
  }
  
  const collegeCapitalized = collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1);
  const className = `Initialize${collegeCapitalized}${classNameSuffix}Step`;
  
  // Start building the initializer class
  let rubyCode = `class ${className} < Step

  def self.required_fields
    return ['active_flow_step_id']
  end

  def self.provided_fields(*args)
    return ['initialization_complete']
  end

  def self.on_activate(*args)
    fields = args[0]
    active_flow_step = ActiveFlowStep.find(fields['active_flow_step_id'])
    target_object = active_flow_step.get_target_object
`;

  // Add appropriate object references
  if (targetObjectType === 'CollegeStudentApplication') {
    rubyCode += `    student = target_object.student
    college = target_object.college

`;
  } else if (targetObjectType === 'StudentTerm') {
    rubyCode += `    student = target_object.student
    college = target_object.college
    term = target_object.term

`;
  } else if (targetObjectType === 'StudentDeCourse') {
    rubyCode += `    student = target_object.student
    college = target_object.college
    course = target_object.course
    course_requisites = course.has_requisites?
    course_section = target_object.course_section

`;
  }

  // Parent consent email (common in all initializers)
  rubyCode += `    fields['parent_consent_email'] = true

`;

  // Add type-specific conditions based on the reference example
  if (targetObjectType === 'CollegeStudentApplication') {
    rubyCode += `    if student.high_school.is_home_school?
      fields['mou_required'] = true
    else
      fields['high_school'] = true
    end

`;
  } else if (targetObjectType === 'StudentTerm') {
    rubyCode += `    if student.high_school.is_home_school?
      fields['parent_consent_provided'] = true
    else
      fields['parent_consent_required'] = true
    end

`;
  } else if (targetObjectType === 'StudentDeCourse') {
    rubyCode += `    # Is student home schooled or not?
    if student.high_school.is_home_school?
      fields['home_school'] = true
      if course_requisites
        if !fields['upload_transcript_complete'] && student.has_completed?('upload_transcript', college)
          fields['upload_transcript'] = fields['upload_transcript_complete'] = true
          fields['review_prereqs'] = fields['review_prereqs_yes'] = true
        end
        student.set_completed('upload_transcript', college)
      else
        fields['upload_transcript'] = fields['upload_transcript_complete'] = true
      end
    elsif student.high_school.is_non_partner?(college)
      fields['non_partner'] = true
    else
      fields['hs_student'] = true
    end

    # Only need to upload transcript for prereqs one time
    if course_requisites
      fields['has_prereqs'] = true
    else
      fields['review_prereqs'] = fields['review_prereqs_yes'] = true
    end

`;
  }

  // Set up student signature for enrollment form (common across all)
  rubyCode += `    # Set up student signature for enrollment form
    fields['esign_enrollment_form_sign'] = target_object.student.display_name
    fields['esign_enrollment_form_date'] = Time.now.strftime('%-d %b %Y')

`;

  // Complete the step
  rubyCode += `    fields['initialization_complete'] = true
    fields = active_flow_step.complete_step(fields)
    return fields
  end

end`;

  return rubyCode;
};

export default generateInitializerClass;
