/**
 * Student Term Initializer Generator
 * 
 * Generates initializer class for StudentTerm target objects
 */

import { generateBaseInitializerClass, generateInitializerClosing, processWorkflowConditions, generateConditionalFieldsCode } from './baseInitializerGenerator';
import { generateCompletionStatesCode } from './completionStateHandler';

/**
 * Generate a Ruby initializer class file for StudentTerm
 * @param {Object} workflowData - The workflow data from the WorkflowBuilder
 * @param {string} collegeVarName - The college variable name (lowercase, no spaces)
 * @returns {string} - Ruby initializer class code
 */
export const generateStudentTermInitializer = (workflowData, collegeVarName) => {
  const targetObjectType = 'StudentTerm';
  const collegeCapitalized = collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1);
  const className = `Initialize${collegeCapitalized}${targetObjectType}Step`;
  
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
    term = target_object.term

    # Common initialization
    fields["parent_consent_email"] = true

    # Per-term workflow initialization
    # Parent consent based on student age
    if student.is_minor?
      fields["parent_consent_required"] = true
    else
      fields["parent_consent_provided"] = true
    end
    
    # Handle home school vs non-partner vs partner high school
    if student.high_school.is_home_school?
      fields["home_school"] = true
    elsif student.high_school.is_non_partner?(college)
      fields["non_partner"] = true
    else
      fields["high_school"] = true
      fields["partner_high_school"] = true
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
