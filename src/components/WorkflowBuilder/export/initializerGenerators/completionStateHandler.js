/**
 * Completion State Handler
 * 
 * Utilities for managing workflow completion states
 */

import { snakeCase } from '../utils';

/**
 * Get the standard completion state from a step
 * @param {Object} step - A workflow step
 * @returns {string|null} - The completion state or null
 */
export const getStepCompletionState = (step) => {
  if (!step) return null;
  
  // Return specific completion states based on step type
  switch (step.stepType) {
    case 'Approval':
      // For approval steps, look for the "approve-yes" action if available
      if (step.actionOptions && step.actionOptions.length > 0) {
        const approveAction = step.actionOptions.find(action => 
          action.value === 'approve-yes' || action.value === 'yes');
        if (approveAction) {
          return `${snakeCase(step.title)}_yes`;
        }
      }
      // Default to _yes suffix for approvals if no actions found
      return `${snakeCase(step.title)}_yes`;
      
    case 'Upload':
      // Use _complete suffix for upload steps
      return `${snakeCase(step.title)}_complete`;
      
    case 'ProvideConsent':
      // Use _provided suffix for consent steps
      return `${snakeCase(step.title)}_provided`;
      
    case 'Information':
      // Use _viewed suffix for information steps
      return `${snakeCase(step.title)}_viewed`;
      
    default:
      // Default pattern for other step types
      return `${snakeCase(step.title)}_complete`;
  }
};

/**
 * Identify conditional branches and their completion states in a workflow
 * @param {Array} steps - Workflow steps
 * @returns {Object} - Map of condition names to completion states they lead to
 */
export const identifyConditionalBranches = (steps) => {
  const conditionalBranches = {};
  
  // First, identify steps that are conditional
  const conditionalSteps = steps.filter(step => step.conditional && step.workflowCondition);
  console.log('Conditional steps found:', conditionalSteps.length);
  
  if (conditionalSteps.length > 0) {
    conditionalSteps.forEach(step => {
      const conditions = Array.isArray(step.workflowCondition) ? 
        step.workflowCondition : [step.workflowCondition];
      console.log(`Found conditional step "${step.title}" with conditions:`, conditions);
    });
  }
  
  // For each conditional step, find the completion states that would be reached
  conditionalSteps.forEach(conditionalStep => {
    // Handle both array and string condition formats
    const conditions = Array.isArray(conditionalStep.workflowCondition) ? 
      conditionalStep.workflowCondition : [conditionalStep.workflowCondition];
    
    conditions.forEach(conditionName => {
      if (!conditionalBranches[conditionName]) {
        conditionalBranches[conditionName] = {
          steps: [],
          completionStates: []
        };
      }
      
      conditionalBranches[conditionName].steps.push(conditionalStep);
      
      // Get completion state for this step
      const completionState = getStepCompletionState(conditionalStep);
      if (completionState && !conditionalBranches[conditionName].completionStates.includes(completionState)) {
        conditionalBranches[conditionName].completionStates.push(completionState);
        console.log(`Added completion state "${completionState}" for condition "${conditionName}"`);
      }
    });
  });
  
  // Find direct downstream steps that would be part of this conditional chain
  Object.keys(conditionalBranches).forEach(conditionName => {
    const branch = conditionalBranches[conditionName];
    
    // For each step in this branch, look for direct downstream steps only
    branch.steps.forEach(step => {
      findDirectDownstreamSteps(steps, step, branch, conditionName);
    });
  });
  
  // Handle paired Upload/Approval steps, but only if they have a direct relationship
  Object.keys(conditionalBranches).forEach(conditionName => {
    const branch = conditionalBranches[conditionName];
    
    // Look for upload steps in this branch
    const uploadSteps = branch.steps.filter(step => step.stepType === 'Upload');
    
    // For each upload step, find approval steps that directly depend on it
    uploadSteps.forEach(uploadStep => {
      const uploadCompletionState = getStepCompletionState(uploadStep);
      if (!uploadCompletionState) return;
      
      // Find approval steps that have this upload's completion state in their dependencies
      steps.forEach(potentialApprovalStep => {
        if (potentialApprovalStep.stepType !== 'Approval' || 
            branch.steps.some(s => s.id === potentialApprovalStep.id)) {
          return; // Skip non-approval steps or steps already in branch
        }
        
        if (potentialApprovalStep.softRequiredFields) {
          const dependencies = Array.isArray(potentialApprovalStep.softRequiredFields) ? 
            potentialApprovalStep.softRequiredFields : [potentialApprovalStep.softRequiredFields];
          
          // Check for direct dependency on this upload step
          const isDependentOnUpload = dependencies.some(dep => 
            dep === uploadCompletionState || dep.includes(uploadCompletionState));
          
          if (isDependentOnUpload) {
            branch.steps.push(potentialApprovalStep);
            
            // Add the completion state
            const approvalCompletionState = getStepCompletionState(potentialApprovalStep);
            if (approvalCompletionState && !branch.completionStates.includes(approvalCompletionState)) {
              branch.completionStates.push(approvalCompletionState);
              console.log(`Added dependent approval completion state "${approvalCompletionState}" for condition "${conditionName}"`);
            }
          }
        }
      });
    });
  });
  
  // Special case for homeschool conditions - only add associated steps that have a clear relationship
  Object.keys(conditionalBranches).forEach(conditionName => {
    if (conditionName === 'homeschool' || conditionName.includes('home_school')) {
      const branch = conditionalBranches[conditionName];
      
      // Check if we have an upload step with "affidavit" in the title
      const affidavitUploadStep = branch.steps.find(step => 
        step.stepType === 'Upload' && 
        step.title.toLowerCase().includes('affidavit'));
      
      if (affidavitUploadStep) {
        // Look for a corresponding approval step with "review" and "affidavit" in title
        const affidavitReviewSteps = steps.filter(step => 
          step.stepType === 'Approval' && 
          step.title.toLowerCase().includes('review') && 
          step.title.toLowerCase().includes('affidavit'));
        
        // Only add if there are clear naming evidence they're related
        if (affidavitReviewSteps.length > 0) {
          affidavitReviewSteps.forEach(affidavitReviewStep => {
            if (!branch.steps.some(s => s.id === affidavitReviewStep.id)) {
              branch.steps.push(affidavitReviewStep);
              
              const approvalCompletionState = getStepCompletionState(affidavitReviewStep);
              if (approvalCompletionState && !branch.completionStates.includes(approvalCompletionState)) {
                branch.completionStates.push(approvalCompletionState);
                console.log(`Added related affidavit review state "${approvalCompletionState}" for homeschool condition`);
              }
            }
          });
        } else {
          console.log(`No related affidavit review steps found for homeschool condition`);
        }
      }
    }
  });
  
  // Log all identified branches
  Object.keys(conditionalBranches).forEach(conditionName => {
    console.log(`Condition ${conditionName} leads to terminal steps:`, 
      conditionalBranches[conditionName].steps.map(s => s.title));
    console.log(`Completion states for ${conditionName}:`, 
      conditionalBranches[conditionName].completionStates);
  });
  
  return conditionalBranches;
};

/**
 * Find only direct downstream steps that explicitly mention this step or condition
 * @param {Array} allSteps - All workflow steps
 * @param {Object} step - The current step to find downstream steps for
 * @param {Object} branch - The branch info to update
 * @param {string} conditionName - The name of the condition this branch is for
 */
function findDirectDownstreamSteps(allSteps, step, branch, conditionName) {
  const stepId = step.id;
  const stepCompletionState = getStepCompletionState(step);
  
  // Look through all steps to find ones that directly depend on this step
  allSteps.forEach(potentialDownstreamStep => {
    // Skip if this is the same step or already in our branch
    if (potentialDownstreamStep.id === stepId || 
        branch.steps.some(s => s.id === potentialDownstreamStep.id)) {
      return;
    }
    
    // Check if this step depends on our current step via softRequiredFields
    if (potentialDownstreamStep.softRequiredFields) {
      const dependencies = Array.isArray(potentialDownstreamStep.softRequiredFields) ? 
        potentialDownstreamStep.softRequiredFields : [potentialDownstreamStep.softRequiredFields];
      
      // Check for direct dependency on this condition or step's completion state
      const isDependentOnCondition = dependencies.some(dep => 
        dep === conditionName || dep.includes(conditionName));
      
      const isDependentOnStep = stepCompletionState && dependencies.some(dep => 
        dep === stepCompletionState || dep.includes(stepCompletionState));
      
      if (isDependentOnCondition || isDependentOnStep) {
        // This is a direct downstream step in the same branch
        branch.steps.push(potentialDownstreamStep);
        
        // Add its completion state
        const downstreamCompletionState = getStepCompletionState(potentialDownstreamStep);
        if (downstreamCompletionState && !branch.completionStates.includes(downstreamCompletionState)) {
          branch.completionStates.push(downstreamCompletionState);
          console.log(`Added direct downstream completion state "${downstreamCompletionState}" for condition "${conditionName}"`);
        }
        
        // Do NOT recursively find more downstream steps - this is the key change
        // to prevent completion states from unrelated steps being included
      }
    }
  });
}

/**
 * Generate code to handle conditional completion states
 * @param {Map} conditionToRubyMap - Map of condition names to Ruby code
 * @param {Map} conditionalCompletionStates - Map of condition names to completion states
 * @returns {string} - Generated Ruby code for handling completion states
 */
export const generateCompletionStatesCode = (conditionToRubyMap, conditionalCompletionStates) => {
  let rubyCode = '';
  
  // Handle completion states for conditional branches
  if (conditionalCompletionStates.size > 0) {
    rubyCode += `    # Set completion states for students who don't meet condition criteria\n`;
    
    // For each condition, set completion states for students who don't meet the condition
    conditionalCompletionStates.forEach((completionStates, conditionName) => {
      const conditionData = conditionToRubyMap.get(conditionName);
      if (conditionData && completionStates.length > 0) {
        rubyCode += `    # Auto-complete steps for students who don't qualify for ${conditionName}\n`;
        rubyCode += `    unless ${conditionData.rubyCode}\n`;
        
        // Set all completion states
        completionStates.forEach(state => {
          rubyCode += `      fields["${state}"] = true\n`;
        });
        
        rubyCode += `    end\n\n`;
      }
    });
  }
  
  return rubyCode;
};
