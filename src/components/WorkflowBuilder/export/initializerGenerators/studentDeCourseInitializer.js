/**
 * Student DE Course Initializer Generator
 * 
 * Generates initializer class for StudentDeCourse target objects
 */

import { generateBaseInitializerClass, generateInitializerClosing, processWorkflowConditions, generateConditionalFieldsCode } from './baseInitializerGenerator';
import { generateCompletionStatesCode } from './completionStateHandler';

/**
 * Generate a Ruby initializer class file for StudentDeCourse
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {string} collegeVarName - The college variable name (lowercase, no spaces)
 * @returns {string} - Ruby initializer class code
 */
export const generateStudentDeCourseInitializer = (workflowData, collegeVarName) => {
  const targetObjectType = 'StudentDeCourse';
  const collegeCapitalized = collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1);
  const className = `Initialize${collegeCapitalized}CourseRegistrationStep`;
  
  // Get all workflow steps
  const workflow = workflowData.workflow || [];
  const relevantSteps = workflow.slice();
  
  console.log(`Generating initializer for ${targetObjectType}`);
  console.log(`Total steps: ${relevantSteps.length}`);
  
  // Process conditions for this target object type
  const { conditionToRubyMap, conditionalCompletionStates } = 
    processWorkflowConditions(workflowData, relevantSteps, targetObjectType);
  
  // Generate the base class structure
  let rubyCode = generateBaseInitializerClass(className);
  
  // Add target object specific setup code
  rubyCode += `    student = target_object.student
    college = target_object.college
    course = target_object.course
    course_section = target_object.course_section

    # Common initialization
    fields["parent_consent_email"] = true

    # Per-course workflow initialization
    # Set high school type
    if student.high_school.is_home_school?
      fields["home_school"] = true
    elsif student.high_school.is_non_partner?(college)
      fields["non_partner"] = true
    else
      fields["high_school"] = true
      fields["hs_student"] = true
    end

    # Set course prerequisites flag if applicable
    if course.has_requisites?
      fields["has_prereqs"] = true
    end

    # Set wish list flag if applicable
    if course_section.is_wish_list?
      fields["wish_list"] = true
    end

`;

  // Add conditional fields based on workflow conditions
  rubyCode += generateConditionalFieldsCode(conditionToRubyMap);
  
  // Add completion states for conditional branches
  rubyCode += generateCompletionStatesCode(conditionToRubyMap, conditionalCompletionStates);
  
  // Set up student signature for enrollment form
  rubyCode += `    # Set up student signature for enrollment form
    fields["esign_enrollment_form_sign"] = target_object.student.display_name
    fields["esign_enrollment_form_date"] = Time.now.strftime('%-d %b %Y')

`;

  // Complete the initializer class
  rubyCode += generateInitializerClosing();
  
  return rubyCode;
};
