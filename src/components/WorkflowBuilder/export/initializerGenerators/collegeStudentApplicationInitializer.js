/**
 * College Student Application Initializer Generator
 * 
 * Generates initializer class for CollegeStudentApplication target objects
 */

import { generateBaseInitializerClass, generateInitializerClosing, processWorkflowConditions, generateConditionalFieldsCode } from './baseInitializerGenerator';
import { generateCompletionStatesCode } from './completionStateHandler';

/**
 * Generate a Ruby initializer class file for CollegeStudentApplication
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {string} collegeVarName - The college variable name (lowercase, no spaces)
 * @returns {string} - Ruby initializer class code
 */
export const generateCollegeStudentApplicationInitializer = (workflowData, collegeVarName) => {
  const targetObjectType = 'CollegeStudentApplication';
  const collegeCapitalized = collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1);
  const className = `Initialize${collegeCapitalized}${targetObjectType}Step`;
  
  // Get all workflow steps - this includes all steps across categories
  const workflow = workflowData.workflow || [];
  
  // Filter steps to those with the "One Time" workflow_category
  const relevantSteps = workflow.filter(step => 
    step.workflow_category === 'One Time' || 
    !step.workflow_category // Include steps without category
  );
  
  // Process conditions for this target object type
  const { conditionToRubyMap, conditionalCompletionStates } = 
    processWorkflowConditions(workflowData, relevantSteps, targetObjectType);
  
  // Generate the base class structure
  let rubyCode = generateBaseInitializerClass(className);
  
  // Add target object specific setup code
  rubyCode += `    student = target_object.student
    college = target_object.college

    # Common initialization
    fields["parent_consent_email"] = true

    # One-time workflow initialization
    # Parent consent is handled in the one-time workflow
    # These fields are mutually exclusive for conditional path clarity
    is_home_school = student.high_school.is_home_school?
    is_non_partner = student.high_school.is_non_partner?(college)
    is_regular_high_school = !is_home_school && !is_non_partner
    
    if is_home_school
      # Home School students get special handling
      fields["parent_consent_provided"] = true  # Auto-set for home school
      fields["home_school"] = true
      fields["mou_required"] = true            # Home School Affidavit required
      # Home School students don't get high_school or non_partner flags
    elsif is_non_partner
      # Non-partner high school students
      fields["non_partner"] = true
      fields["parent_consent_required"] = true
      # Non-partner students don't get high_school or home_school flags
    else
      # Regular high school students
      fields["high_school"] = true
      fields["parent_consent_required"] = true
      fields["partner_high_school"] = true
      # Regular high school students don't get home_school or non_partner flags
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
