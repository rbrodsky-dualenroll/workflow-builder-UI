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
 * with hardcoded handling for High School role steps
 * 
 * @param {Array} steps - Workflow steps
 * @returns {Object} - Map of condition names to completion states they lead to
 */
export const identifyConditionalBranches = (steps) => {
  const conditionalBranches = {};
  
  // First, identify all explicit conditions used in the workflow
  const allConditions = new Set();
  steps.forEach(step => {
    if (step.conditional && step.workflowCondition) {
      const conditions = Array.isArray(step.workflowCondition) 
        ? step.workflowCondition 
        : [step.workflowCondition];
      
      conditions.forEach(condition => allConditions.add(condition));
    }
  });
  
  // HARDCODED EDGE CASE: Check for conditions based on role
  // High School role steps implicitly mean high_school condition
  // Approver role steps for home school students imply home_school condition
  const hasHighSchoolRoleSteps = steps.some(step => 
    step.role === 'High School' || step.role === 'Counselor');
  
  if (hasHighSchoolRoleSteps) {
    allConditions.add('high_school');
    console.log('Added implicit high_school condition based on High School role steps');
  }
  
  // Check for home_school related steps
  const hasHomeSchoolSteps = steps.some(step => 
    (step.title && step.title.toLowerCase().includes('home school')) ||
    (step.description && step.description.toLowerCase().includes('home school')));
  
  if (hasHomeSchoolSteps) {
    allConditions.add('home_school');
    console.log('Added implicit home_school condition based on steps with Home School in title/description');
  }
  
  // Check for non_partner related steps
  const hasNonPartnerSteps = steps.some(step => 
    (step.title && step.title.toLowerCase().includes('non partner')) ||
    (step.description && step.description.toLowerCase().includes('non partner')));
  
  if (hasNonPartnerSteps) {
    allConditions.add('non_partner');
    console.log('Added implicit non_partner condition based on steps with Non Partner in title/description');
  }
  
  console.log('All conditions found in workflow:', Array.from(allConditions));
  
  // For each condition, identify all steps that depend on it and their completion states
  allConditions.forEach(conditionName => {
    // Create the branch entry if it doesn't exist
    if (!conditionalBranches[conditionName]) {
      conditionalBranches[conditionName] = {
        steps: [],
        completionStates: []
      };
    }
    
    // Find all steps directly conditional on this condition
    // HARDCODED EDGE CASE: Also include role-specific steps for their respective conditions
    const directConditionalSteps = steps.filter(step => {
      // Check for explicit conditional attribute with matching condition
      if (step.conditional && step.workflowCondition) {
        const conditions = Array.isArray(step.workflowCondition) 
          ? step.workflowCondition 
          : [step.workflowCondition];
        
        if (conditions.includes(conditionName)) {
          return true;
        }
      }
      
      // HARDCODED EDGE CASE: Check for conditions based on role/title/description
      if (conditionName === 'high_school' && (step.role === 'High School' || step.role === 'Counselor')) {
        console.log(`Treating step "${step.title}" as conditional on high_school due to High School role`);
        return true;
      } else if (conditionName === 'home_school' && 
                ((step.title && step.title.toLowerCase().includes('home school')) || 
                 (step.description && step.description.toLowerCase().includes('home school')))) {
        console.log(`Treating step "${step.title}" as conditional on home_school due to content`);
        return true;
      } else if (conditionName === 'non_partner' && 
                ((step.title && step.title.toLowerCase().includes('non partner')) || 
                 (step.description && step.description.toLowerCase().includes('non partner')))) {
        console.log(`Treating step "${step.title}" as conditional on non_partner due to content`);
        return true;
      }
      
      return false;
    });
    
    // Add these steps to the branch
    directConditionalSteps.forEach(step => {
      // Add the step if not already in the branch
      if (!conditionalBranches[conditionName].steps.some(s => s.id === step.id)) {
        conditionalBranches[conditionName].steps.push(step);
      }
      
      // Add the step's completion state if it has one
      const completionState = getStepCompletionState(step);
      if (completionState && !conditionalBranches[conditionName].completionStates.includes(completionState)) {
        conditionalBranches[conditionName].completionStates.push(completionState);
        console.log(`Added completion state "${completionState}" for condition "${conditionName}"`);
      }
    });
  });
  
  // Log the results
  Object.keys(conditionalBranches).forEach(conditionName => {
    console.log(`Condition "${conditionName}" leads to steps:`, 
      conditionalBranches[conditionName].steps.map(s => s.title));
    console.log(`Completion states for "${conditionName}":`, 
      conditionalBranches[conditionName].completionStates);
  });
  
  return conditionalBranches;
};

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
    
    // Special handling for high_school vs home_school vs non_partner paths
    // This ensures each conditional path properly gets the other paths' completion states
    const hasHighSchool = conditionToRubyMap.has('high_school');
    const hasHomeSchool = conditionToRubyMap.has('home_school');
    const hasNonPartner = conditionToRubyMap.has('non_partner');
    
    if ((hasHighSchool && hasHomeSchool) || (hasHighSchool && hasNonPartner) || (hasHomeSchool && hasNonPartner)) {
      rubyCode += `    # Ensure merge of conditional paths for high school types\n`;
      
      // High School students need home_school and non_partner completion states
      if (hasHighSchool) {
        const highSchoolCondition = conditionToRubyMap.get('high_school').rubyCode;
        rubyCode += `    # High School students get completion states from other paths\n`;
        rubyCode += `    if ${highSchoolCondition}\n`;
        
        // Set home_school completion states
        if (hasHomeSchool && conditionalCompletionStates.has('home_school')) {
          rubyCode += `      # Set home_school completion states for high_school students\n`;
          conditionalCompletionStates.get('home_school').forEach(state => {
            rubyCode += `      fields["${state}"] = true\n`;
          });
        }
        
        // Set non_partner completion states
        if (hasNonPartner && conditionalCompletionStates.has('non_partner')) {
          rubyCode += `      # Set non_partner completion states for high_school students\n`;
          conditionalCompletionStates.get('non_partner').forEach(state => {
            rubyCode += `      fields["${state}"] = true\n`;
          });
        }
        
        rubyCode += `    end\n\n`;
      }
      
      // Home School students need high_school and non_partner completion states
      if (hasHomeSchool) {
        const homeSchoolCondition = conditionToRubyMap.get('home_school').rubyCode;
        rubyCode += `    # Home School students get completion states from other paths\n`;
        rubyCode += `    if ${homeSchoolCondition}\n`;
        
        // Set high_school completion states
        if (hasHighSchool && conditionalCompletionStates.has('high_school')) {
          rubyCode += `      # Set high_school completion states for home_school students\n`;
          conditionalCompletionStates.get('high_school').forEach(state => {
            rubyCode += `      fields["${state}"] = true\n`;
          });
        }
        
        // Set non_partner completion states
        if (hasNonPartner && conditionalCompletionStates.has('non_partner')) {
          rubyCode += `      # Set non_partner completion states for home_school students\n`;
          conditionalCompletionStates.get('non_partner').forEach(state => {
            rubyCode += `      fields["${state}"] = true\n`;
          });
        }
        
        rubyCode += `    end\n\n`;
      }
      
      // Non-Partner students need high_school and home_school completion states
      if (hasNonPartner) {
        const nonPartnerCondition = conditionToRubyMap.get('non_partner').rubyCode;
        rubyCode += `    # Non-Partner students get completion states from other paths\n`;
        rubyCode += `    if ${nonPartnerCondition}\n`;
        
        // Set high_school completion states
        if (hasHighSchool && conditionalCompletionStates.has('high_school')) {
          rubyCode += `      # Set high_school completion states for non_partner students\n`;
          conditionalCompletionStates.get('high_school').forEach(state => {
            rubyCode += `      fields["${state}"] = true\n`;
          });
        }
        
        // Set home_school completion states
        if (hasHomeSchool && conditionalCompletionStates.has('home_school')) {
          rubyCode += `      # Set home_school completion states for non_partner students\n`;
          conditionalCompletionStates.get('home_school').forEach(state => {
            rubyCode += `      fields["${state}"] = true\n`;
          });
        }
        
        rubyCode += `    end\n\n`;
      }
    }
  }
  
  return rubyCode;
};