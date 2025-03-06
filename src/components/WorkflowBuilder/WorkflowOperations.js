/**
 * Functions for workflow step operations
 */

/**
 * Add a new step to the workflow
 */
export const addStep = (stepData, activeScenarioId, setScenarios) => {
  // If the step doesn't have an ID yet, generate one
  const newStep = {
    id: stepData.id || Date.now().toString(),
    ...stepData
  };
  
  setScenarios(prevScenarios => ({
    ...prevScenarios,
    [activeScenarioId]: {
      ...prevScenarios[activeScenarioId],
      steps: [...prevScenarios[activeScenarioId].steps, newStep]
    }
  }));
  
  return newStep;
};

/**
 * Update an existing step
 */
export const updateStep = (stepData, editingStep, activeScenarioId, scenarios, setScenarios) => {
  // Get the step we're editing
  const step = scenarios[activeScenarioId].steps.find(s => s.id === editingStep);
  
  if (activeScenarioId === 'main') {
    // Updating a step in the main workflow - update it in all scenarios
    const updatedScenarios = { ...scenarios };
    
    // Update in main scenario
    updatedScenarios.main.steps = updatedScenarios.main.steps.map(s => 
      s.id === editingStep ? { ...s, ...stepData } : s
    );
    
    // Update in other scenarios if they have the same step (not already customized)
    Object.keys(updatedScenarios).forEach(scenarioId => {
      if (scenarioId === 'main') return;
      
      updatedScenarios[scenarioId].steps = updatedScenarios[scenarioId].steps.map(s => 
        s.id === editingStep ? { ...s, ...stepData } : s
      );
    });
    
    setScenarios(updatedScenarios);
  } else {
    // Updating a step in a conditional scenario - create a new conditional version
    const newStepId = `${editingStep}_${activeScenarioId}`;
    const updatedStep = { ...stepData, id: newStepId, originalStepId: editingStep };
    
    // Replace the step in this scenario only
    setScenarios(prevScenarios => {
      const scenarioSteps = [...prevScenarios[activeScenarioId].steps];
      const stepIndex = scenarioSteps.findIndex(s => s.id === editingStep);
      
      if (stepIndex !== -1) {
        scenarioSteps[stepIndex] = updatedStep;
      }
      
      return {
        ...prevScenarios,
        [activeScenarioId]: {
          ...prevScenarios[activeScenarioId],
          steps: scenarioSteps
        }
      };
    });
  }
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
 * Move a step from one position to another in the workflow
 */
export const moveStep = (dragIndex, hoverIndex, activeScenarioId, setScenarios) => {
  setScenarios(prevScenarios => {
    const currentSteps = prevScenarios[activeScenarioId].steps;
    const draggedStep = {...currentSteps[dragIndex]};
    const updatedSteps = [...currentSteps];
    
    // Remove the dragged item
    updatedSteps.splice(dragIndex, 1);
    // Insert it at the new position
    updatedSteps.splice(hoverIndex, 0, draggedStep);
    
    return {
      ...prevScenarios,
      [activeScenarioId]: {
        ...prevScenarios[activeScenarioId],
        steps: updatedSteps
      }
    };
  });
};
