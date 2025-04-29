/**
 * Utilities for generating ActiveFlowDefinition code
 */

import { 
  generateStepForCategory, 
  isInitializationStep, 
  isWaitingStep,
  createInitializationStep,
  createWaitForOneTimeCompletionStep,
  createWaitForPerTermCompletionStep,
  createCompleteOneTimeWorkflowStep,
  createFailedOneTimeWorkflowStep,
  createCompletePerTermWorkflowStep,
  createDeclinePerTermWorkflowStep
} from './stepGenerator';

import { generateFailureSteps, generateCompletionSteps } from '../completionStepGenerator';
import { identifyWorkflowCategories } from './categorization';

export const generateActiveFlowDefinition = (collegeVarName, category, versionNumbers, categorySteps) => {
  const versionNumber = versionNumbers[category.name];
  const varName = `${collegeVarName}_${category.name}_active_flow_definition`;
  
  let code = `# ${collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1)} ActiveFlowDefinition for ${category.targetObject} (${category.category}).
afd = ActiveFlowDefinition.where(owner_id: ${collegeVarName}_id, owner_type: 'College', target_object_type: '${category.targetObject}', category: '${category.category}')
if afd.present? && afd.first.version_number < ${collegeVarName}_${category.name}_active_flow_definition_version_number
  afd_id = afd.first.id
  afd.first.destroy
  afd = nil
end

if afd.blank?
  ${varName} = ActiveFlowDefinition.create({
    name: '${collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1)} ${category.displayName}',
    version_number: ${collegeVarName}_${category.name}_active_flow_definition_version_number,
    description: '${collegeVarName.charAt(0).toUpperCase() + collegeVarName.slice(1)} ${category.targetObject} ActiveFlowDefinition',
    category: '${category.category}',
    target_object_type: '${category.targetObject}',
    owner_type: 'College',
    owner_id: ${collegeVarName}_id
  })
  if ${varName}.persisted?

    ActiveFlowStepTrigger.create([
`;

  // Add steps based on the workflow category
  code += generateStepsForCategory(collegeVarName, category, versionNumber, categorySteps);

  code += `    ])
  end
end

`;

  return code;
};

/**
 * Generate ActiveFlowStepTrigger code for steps in a workflow category
 * @param {string} collegeVarName - The college variable name
 * @param {Object} category - The workflow category
 * @param {number} versionNumber - The version number for this workflow category
 * @param {Array} categorySteps - Steps for this specific category
 * @returns {string} - Ruby code for ActiveFlowStepTrigger entries
 */
export const generateStepsForCategory = (collegeVarName, category, versionNumber, categorySteps) => {
  let code = '';
  const varName = `${collegeVarName}_${category.name}_active_flow_definition`;
  
  console.log('\n\n==== DEBUG START: generateStepsForCategory ====');
  console.log(`Processing category: ${category.name} (${category.targetObject})`);
  
  // Create a new array to hold all the steps in the correct order
  const finalSteps = [];
  
  // USE GLOBAL WORKFLOW CATEGORIES INFO - fix for one-time detection
  console.log('Using global workflow categories info:');
  console.log('- hasOneTimeWorkflow (global):', window.hasOneTimeWorkflow);
  console.log('- hasPerTermWorkflow (global):', window.hasPerTermWorkflow);
  
  // Get all the workflow categories that are actually in use
  console.log('Input category steps with categories:');
  categorySteps.forEach(step => {
    if (step.workflow_category) {
      console.log(`  - "${step.title}": workflow_category = "${step.workflow_category}"`);
    }
  });
  
  // START OF STEP GENERATION LOGIC - FIXED ORDER
  
  // STEP 1: Always add the initialization step first
  const initStep = createInitializationStep(collegeVarName, category);
  finalSteps.push(initStep);
  console.log('Added initialization step:', initStep.title);
  
  // SPECIAL HANDLING FOR REGISTRATION WORKFLOW
  if (category.name === 'registration') {
    console.log('Processing registration workflow steps');
    
    // STEP 2: Add one-time completion step if one-time workflow exists
    // Use the GLOBAL hasOneTimeWorkflow flag
    if (window.hasOneTimeWorkflow) {
      console.log('Adding one-time completion step to registration workflow');
      const oneTimeStep = createWaitForOneTimeCompletionStep(collegeVarName, category);
      console.log('One-time step created:', oneTimeStep);
      finalSteps.push(oneTimeStep);
    } else {
      console.log('Skipped one-time completion step - no one-time workflow found');
    }
    
    // STEP 3: Add per-term completion step if per-term workflow exists
    // Use the GLOBAL hasPerTermWorkflow flag
    if (window.hasPerTermWorkflow) {
      console.log('Adding per-term completion step to registration workflow');
      const perTermStep = createWaitForPerTermCompletionStep(collegeVarName, category);
      finalSteps.push(perTermStep);
    } else {
      console.log('Skipped per-term completion step - no per-term workflow found');
    }
  }
  
  // SPECIAL HANDLING FOR STUDENT_TERM WORKFLOW
  if (category.name === 'student_term' && window.hasOneTimeWorkflow) {
    console.log('Adding one-time completion step to student_term workflow');
    const oneTimeStep = createWaitForOneTimeCompletionStep(collegeVarName, category);
    finalSteps.push(oneTimeStep);
  }
  
  // STEP 4: Add all user-defined steps
  console.log('Adding user-defined steps...');
  const userSteps = categorySteps.filter(step => 
    !isInitializationStep(step) && !isWaitingStep(step)
  );
  console.log(`Found ${userSteps.length} user-defined steps`);
  userSteps.forEach(step => console.log(`  - "${step.title}": ${step.stepType}`));
  finalSteps.push(...userSteps);
  
  // STEP 5: Add standard completion steps based on workflow category
  if (category.name === 'college_student_application') {
    // One-time workflow completion and failure steps
    finalSteps.push(createCompleteOneTimeWorkflowStep(collegeVarName, category));
    finalSteps.push(createFailedOneTimeWorkflowStep(collegeVarName, category));
  } else if (category.name === 'student_term') {
    // Per-term workflow completion and decline steps
    finalSteps.push(createCompletePerTermWorkflowStep(collegeVarName, category, 'holds_checked_via_ethos_api_no_holds'));
    finalSteps.push(createCompletePerTermWorkflowStep(collegeVarName, category, 'review_student_record_yes'));
    finalSteps.push(createDeclinePerTermWorkflowStep(collegeVarName, category));
  }
  
  // STEP 6: Generate failure and completion steps for registration workflow
  if (category.name === 'registration') {
    // Generate failure and completion steps based on the workflow definition
    const failureSteps = generateFailureSteps(categorySteps, collegeVarName, category.name, versionNumber);
    const completionSteps = generateCompletionSteps(categorySteps, collegeVarName, category.name, versionNumber);
    
    // Add failure steps after normal steps
    finalSteps.push(...failureSteps);
    
    // Add completion steps after failure steps
    finalSteps.push(...completionSteps);
  }
  
  // GENERATE THE CODE FOR ALL STEPS
  console.log('\nFinal steps in order:');
  finalSteps.forEach((step, i) => console.log(`${i+1}. ${step.title} (${step.stepType})`));
  
  finalSteps.forEach((step, index) => {
    code += generateStepForCategory(step, collegeVarName, varName, index, finalSteps);
  });
  
  console.log('==== DEBUG END: generateStepsForCategory ====\n\n');
  return code;
};
