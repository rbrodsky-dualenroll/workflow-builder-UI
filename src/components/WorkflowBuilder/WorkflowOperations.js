import { generateUniqueId } from '../../utils/idUtils';

/**
 * Functions for workflow step operations
 */

/**
 * Add a new step to the workflow
 * If it's a feedback step, insert it immediately after the parent step
 */
export const addStep = (stepData, activeScenarioId, setScenarios) => {
  // If the step doesn't have an ID yet, generate one
  const newStep = {
    id: stepData.id || generateUniqueId('step_'),
    ...stepData
  };
  
  setScenarios(prevScenarios => {
    const currentSteps = [...prevScenarios[activeScenarioId].steps];
    
    // Check if this is a feedback step
    if (newStep.isFeedbackStep && newStep.feedbackRelationship) {
      const parentStepId = newStep.feedbackRelationship.parentStepId;
      
      // Find the parent step index
      const parentIndex = currentSteps.findIndex(step => step.id === parentStepId);
      
      if (parentIndex !== -1) {
        // Find the last feedback step for this parent, if any
        let insertIndex = parentIndex + 1;
        
        // Find all feedback steps for this parent
        const feedbackSteps = currentSteps.filter(step => 
          step.isFeedbackStep && 
          step.feedbackRelationship && 
          step.feedbackRelationship.parentStepId === parentStepId
        );
        
        // If there are existing feedback steps, insert after the last one
        if (feedbackSteps.length > 0) {
          // Get the indices of all feedback steps for this parent
          const feedbackIndices = feedbackSteps.map(step => 
            currentSteps.findIndex(s => s.id === step.id)
          );
          
          // Insert after the last feedback step for this parent
          insertIndex = Math.max(...feedbackIndices) + 1;
        }
        
        // Insert the new feedback step at the calculated position
        currentSteps.splice(insertIndex, 0, newStep);
        
        return {
          ...prevScenarios,
          [activeScenarioId]: {
            ...prevScenarios[activeScenarioId],
            steps: currentSteps
          }
        };
      }
    }
    
    // For scenario steps, record the preceding step for proper ordering in master view
    if (activeScenarioId !== 'main') {
      // Try to identify the step after which this new step is being added
      let addedAfterStepId = null;
      
      if (currentSteps.length > 0) {
        // By default, we're adding after the last step
        addedAfterStepId = currentSteps[currentSteps.length - 1].id;
        
        // If we're inserting at a specific position (rather than at the end),
        // we can optionally track which step we're inserting after
        if (stepData.insertAfterStepId) {
          addedAfterStepId = stepData.insertAfterStepId;
        }
      }
      
      // Store the referential information in the step
      newStep.addedAfterStepId = addedAfterStepId;
    }
    
    // If this is a scenario step, ensure it gets the scenario condition
    if (activeScenarioId !== 'main' && !newStep.isFeedbackStep) {
      // Get the scenario condition and name
      const scenarioCondition = prevScenarios[activeScenarioId].condition;
      const scenarioName = prevScenarios[activeScenarioId].name;
      
      // Make sure step has the right conditional settings
      if (!newStep.workflowCondition || newStep.workflowCondition.length === 0) {
        newStep.conditional = true;
        newStep.workflowCondition = [scenarioCondition];
      }
      
      // Always set the scenario name for display purposes
      newStep.scenarioName = scenarioName;
    }
  
    return {
      ...prevScenarios,
      [activeScenarioId]: {
        ...prevScenarios[activeScenarioId],
        steps: [...currentSteps, newStep]
      }
    };
  });
  
  return newStep;
};

/**
 * Update an existing step
 */
export const updateStep = (stepData, editingStep, activeScenarioId, scenarios, setScenarios) => {
  setScenarios(prevScenarios => {
    const updatedScenarios = { ...prevScenarios };
    
    // Find the step we're editing
    const stepToUpdate = updatedScenarios[activeScenarioId].steps.find(s => s.id === editingStep);
    
    if (!stepToUpdate) {
      console.error('Step not found for update');
      return prevScenarios;
    }
    
    // Merge new data WITHOUT changing the ID
    const updatedStep = {
      ...stepToUpdate,  // Preserve the original step
      ...stepData,      // Merge in new data
      id: stepToUpdate.id  // EXPLICITLY keep the original ID
    };
    
    // When editing a step in a scenario (not main), track its relationship to main workflow
    if (activeScenarioId !== 'main') {
      // If we're editing a step that exists in the main workflow, record original ID
      const mainSteps = prevScenarios.main.steps;
      const mainStepWithSameId = mainSteps.find(s => s.id === updatedStep.id);
      
      if (mainStepWithSameId) {
        // This is a modified version of a main step
        updatedStep.originalStepId = mainStepWithSameId.id;
      } else if (!updatedStep.originalStepId && !updatedStep.addedAfterStepId) {
        // This is a scenario-specific step that doesn't yet have reference information
        // Determine which step it follows in the scenario
        const currentSteps = updatedScenarios[activeScenarioId].steps;
        const stepIndex = currentSteps.findIndex(s => s.id === editingStep);
        
        if (stepIndex > 0) {
          updatedStep.addedAfterStepId = currentSteps[stepIndex - 1].id;
        }
      }
    }
    
    // Update the step in the scenario's steps array
    updatedScenarios[activeScenarioId].steps = updatedScenarios[activeScenarioId].steps.map(
      step => step.id === editingStep ? updatedStep : step
    );
    
    // If this is a feedback step, update the parent's feedback loops with the new role
    if (updatedStep.isFeedbackStep && updatedStep.feedbackRelationship) {
      const parentStepId = updatedStep.feedbackRelationship.parentStepId;
      const feedbackId = updatedStep.feedbackRelationship.feedbackId;
      
      // Find the parent step
      const parentIndex = updatedScenarios[activeScenarioId].steps.findIndex(step => step.id === parentStepId);
      
      if (parentIndex !== -1) {
        const parentStep = updatedScenarios[activeScenarioId].steps[parentIndex];
        
        // Update the feedback loop in the parent with the new recipient role
        if (parentStep.feedbackLoops && parentStep.feedbackLoops[feedbackId]) {
          // Create updated feedback loops with the new recipient role
          const updatedFeedbackLoops = {
            ...parentStep.feedbackLoops,
            [feedbackId]: {
              ...parentStep.feedbackLoops[feedbackId],
              recipient: updatedStep.role, // Update recipient to match the step's role
              nextStep: updatedStep.title   // Update next step to match the step's title
            }
          };
          
          // Update the parent step with the new feedback loops
          updatedScenarios[activeScenarioId].steps[parentIndex] = {
            ...parentStep,
            feedbackLoops: updatedFeedbackLoops
          };
        }
      }
    }
    
    // Update child steps if this is a parent step with feedback children
    if (updatedStep.feedbackLoops && Object.keys(updatedStep.feedbackLoops).length > 0) {
      // Find any feedback steps that reference this parent step
      updatedScenarios[activeScenarioId].steps = updatedScenarios[activeScenarioId].steps.map(step => {
        if (step.isFeedbackStep && 
            step.feedbackRelationship && 
            step.feedbackRelationship.parentStepId === editingStep) {
          // Update the feedback relationship to ensure it maintains the correct parent info
          return {
            ...step,
            feedbackRelationship: {
              ...step.feedbackRelationship,
              parentStepTitle: updatedStep.title || step.feedbackRelationship.parentStepTitle,
              requestingRole: updatedStep.role || step.feedbackRelationship.requestingRole
            }
          };
        }
        return step;
      });
    }
    
    // If in main scenario, propagate changes to other scenarios that haven't been customized
    if (activeScenarioId === 'main') {
      Object.keys(updatedScenarios).forEach(scenarioId => {
        if (scenarioId === 'main') return;
        
        // Only update if the step hasn't been customized in this scenario
        updatedScenarios[scenarioId].steps = updatedScenarios[scenarioId].steps.map(
          step => {
            // Check if this step is the original or a direct copy of the main scenario step
            if (step.id === editingStep || step.originalStepId === editingStep) {
              return { 
                ...step, 
                ...stepData,
                id: step.id,  // PRESERVE ORIGINAL ID
                originalStepId: editingStep  // Make sure we track its relation to the main step
              };
            }
            
            // If this is a feedback step whose parent is being updated
            if (step.isFeedbackStep && 
                step.feedbackRelationship && 
                (step.feedbackRelationship.parentStepId === editingStep ||
                 step.feedbackRelationship.parentStepId === stepData.id)) {
              return {
                ...step,
                feedbackRelationship: {
                  ...step.feedbackRelationship,
                  parentStepTitle: stepData.title || step.feedbackRelationship.parentStepTitle,
                  requestingRole: stepData.role || step.feedbackRelationship.requestingRole
                }
              };
            }
            
            return step;
          }
        );
      });
    }
    
    return updatedScenarios;
  });
};

/**
 * Delete a step from the workflow
 */
export const deleteStep = (stepId, activeScenarioId, setScenarios) => {
  setScenarios(prevScenarios => {
    const updatedScenarios = { ...prevScenarios };
    
    if (activeScenarioId === 'main') {
      // Find the step to check if it's a parent step
      const stepToDelete = updatedScenarios.main.steps.find(step => step.id === stepId);
      
      // If deleting from main, remove from all scenarios
      Object.keys(updatedScenarios).forEach(scenarioId => {
        // Remove the step itself
        updatedScenarios[scenarioId].steps = updatedScenarios[scenarioId].steps.filter(step => step.id !== stepId);
        
        // If it's a parent step, also remove all its feedback child steps
        if (stepToDelete && stepToDelete.feedbackLoops && Object.keys(stepToDelete.feedbackLoops).length > 0) {
          // Get all feedback IDs from this parent
          const feedbackIds = Object.keys(stepToDelete.feedbackLoops);
          
          // Remove any feedback steps that have a relationship with this parent
          updatedScenarios[scenarioId].steps = updatedScenarios[scenarioId].steps.filter(step => 
            !(step.isFeedbackStep && 
              step.feedbackRelationship && 
              step.feedbackRelationship.parentStepId === stepId)
          );
        }
      });
    } else {
      // Find the step to check if it's a parent step
      const stepToDelete = updatedScenarios[activeScenarioId].steps.find(step => step.id === stepId);
      
      // If deleting from a scenario, only remove from that scenario
      updatedScenarios[activeScenarioId].steps = updatedScenarios[activeScenarioId].steps.filter(step => step.id !== stepId);
      
      // If it's a parent step, also remove all its feedback child steps
      if (stepToDelete && stepToDelete.feedbackLoops && Object.keys(stepToDelete.feedbackLoops).length > 0) {
        // Remove any feedback steps that have a relationship with this parent
        updatedScenarios[activeScenarioId].steps = updatedScenarios[activeScenarioId].steps.filter(step => 
          !(step.isFeedbackStep && 
            step.feedbackRelationship && 
            step.feedbackRelationship.parentStepId === stepId)
        );
      }
    }
    
    return updatedScenarios;
  });
};

/**
 * Delete a feedback step from the workflow and update its parent step
 */
export const deleteFeedbackStep = (stepId, activeScenarioId, setScenarios) => {
  setScenarios(prevScenarios => {
    const updatedScenarios = { ...prevScenarios };
    
    // Find the feedback step to get its relationship info
    let feedbackStep = null;
    let parentStepId = null;
    let feedbackId = null;
    
    // Find the feedback step in the active scenario
    const steps = updatedScenarios[activeScenarioId].steps;
    feedbackStep = steps.find(step => step.id === stepId);
    
    // If we found the feedback step and it has relationship data
    if (feedbackStep && feedbackStep.isFeedbackStep && feedbackStep.feedbackRelationship) {
      parentStepId = feedbackStep.feedbackRelationship.parentStepId;
      feedbackId = feedbackStep.feedbackRelationship.feedbackId;
    }
    
    // Remove the feedback step from appropriate scenarios
    if (activeScenarioId === 'main') {
      // Remove from all scenarios
      Object.keys(updatedScenarios).forEach(scenarioId => {
        updatedScenarios[scenarioId].steps = updatedScenarios[scenarioId].steps.filter(step => step.id !== stepId);
      });
    } else {
      // Remove only from this scenario
      updatedScenarios[activeScenarioId].steps = updatedScenarios[activeScenarioId].steps.filter(step => step.id !== stepId);
    }
    
    // Update the parent step's feedback loops if we found both the parent ID and feedback ID
    if (parentStepId && feedbackId) {
      const scenarioKeys = activeScenarioId === 'main' ? Object.keys(updatedScenarios) : [activeScenarioId];
      
      scenarioKeys.forEach(scenarioId => {
        // Find the parent in this scenario
        const parentIndex = updatedScenarios[scenarioId].steps.findIndex(step => step.id === parentStepId);
        
        if (parentIndex !== -1) {
          const parentStep = updatedScenarios[scenarioId].steps[parentIndex];
          
          // If the parent has feedbackLoops
          if (parentStep.feedbackLoops) {
            // Create a new feedbackLoops object without this feedback
            const updatedFeedbackLoops = { ...parentStep.feedbackLoops };
            delete updatedFeedbackLoops[feedbackId];
            
            // Update the parent step
            updatedScenarios[scenarioId].steps[parentIndex] = {
              ...parentStep,
              feedbackLoops: updatedFeedbackLoops
            };
          }
        }
      });
    }
    
    return updatedScenarios;
  });
};

/**
 * Move a step from one position to another in the workflow,
 * ensuring that feedback loop children steps move with their parent
 */
export const moveStep = (dragIndex, hoverIndex, activeScenarioId, setScenarios) => {
  setScenarios(prevScenarios => {
    const currentSteps = [...prevScenarios[activeScenarioId].steps];
    
    // Find the step being dragged
    const draggedStep = currentSteps[dragIndex];
    
    // Find all child steps for this parent (if any)
    const childSteps = currentSteps.filter(
      step => step.feedbackRelationship && 
              step.feedbackRelationship.parentStepId === draggedStep.id
    );
    
    // If no child steps, perform a simple move
    if (childSteps.length === 0) {
      const updatedSteps = [...currentSteps];
      updatedSteps.splice(dragIndex, 1);
      updatedSteps.splice(hoverIndex, 0, draggedStep);
      
      return {
        ...prevScenarios,
        [activeScenarioId]: {
          ...prevScenarios[activeScenarioId],
          steps: updatedSteps
        }
      };
    }
    
    // With child steps, move the entire group
    // Remove the dragged step and its children
    const filteredSteps = currentSteps.filter(
      step => step.id !== draggedStep.id && 
              !childSteps.some(child => child.id === step.id)
    );
    
    // Calculate the correct insertion index
    let insertIndex = hoverIndex;
    
    // Adjust insertion index if moving downward
    if (dragIndex < hoverIndex) {
      const childCount = childSteps.length;
      insertIndex -= childCount;
    }
    
    // Insert the parent step first
    filteredSteps.splice(insertIndex, 0, draggedStep);
    
    // Then insert the child steps immediately after
    const childInsertIndex = insertIndex + 1;
    
    // Ensure feedback steps keep their parent reference
    const updatedChildSteps = childSteps.map(childStep => {
      if (childStep.isFeedbackStep && childStep.feedbackRelationship) {
        return {
          ...childStep,
          feedbackRelationship: {
            ...childStep.feedbackRelationship,
            parentStepId: draggedStep.id // Explicitly ensure parent ID is maintained
          }
        };
      }
      return childStep;
    });
    
    filteredSteps.splice(childInsertIndex, 0, ...updatedChildSteps);
    
    return {
      ...prevScenarios,
      [activeScenarioId]: {
        ...prevScenarios[activeScenarioId],
        steps: filteredSteps
      }
    };
  });
};
