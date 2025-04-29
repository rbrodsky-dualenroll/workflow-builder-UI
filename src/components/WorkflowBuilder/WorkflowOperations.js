import { generateUniqueId } from '../../utils/idUtils';

/**
 * Functions for workflow step operations - simplified for flat workflow structure
 */

/**
 * Add a new step to the workflow
 * If it's a feedback step, insert it immediately after the parent step
 */
export const addStep = (stepData, setWorkflow) => {
  // If the step doesn't have an ID yet, generate one
  const newStep = {
    id: stepData.id || generateUniqueId('step_'),
    ...stepData
  };
  
  setWorkflow(prevWorkflow => {
    const currentSteps = [...prevWorkflow];
    
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
        return currentSteps;
      }
    }
    
    // For regular steps, just append to the end
    return [...currentSteps, newStep];
  });
  
  return newStep;
};

/**
 * Update an existing step
 */
export const updateStep = (stepData, editingStep, setWorkflow) => {
  setWorkflow(prevWorkflow => {
    // Find the step we're editing
    const stepToUpdate = prevWorkflow.find(s => s.id === editingStep);
    
    if (!stepToUpdate) {
      console.error('Step not found for update');
      return prevWorkflow;
    }
    
    // Update the step by merging step data, keeping the original ID
    const updatedWorkflow = prevWorkflow.map(step => 
      step.id === editingStep 
        ? { ...stepToUpdate, ...stepData, id: step.id } 
        : step
    );
    
    // If this is a feedback step, update the parent's feedback loops with the new role
    if (stepData.isFeedbackStep && stepData.feedbackRelationship) {
      const parentStepId = stepData.feedbackRelationship.parentStepId;
      const feedbackId = stepData.feedbackRelationship.feedbackId;
      
      // Find the parent step
      const parentIndex = updatedWorkflow.findIndex(step => step.id === parentStepId);
      
      if (parentIndex !== -1) {
        const parentStep = updatedWorkflow[parentIndex];
        
        // Update the feedback loop in the parent with the new recipient role
        if (parentStep.feedbackLoops && parentStep.feedbackLoops[feedbackId]) {
          // Create updated feedback loops with the new recipient role
          const updatedFeedbackLoops = {
            ...parentStep.feedbackLoops,
            [feedbackId]: {
              ...parentStep.feedbackLoops[feedbackId],
              recipient: stepData.role, // Update recipient to match the step's role
              nextStep: stepData.title   // Update next step to match the step's title
            }
          };
          
          // Update the parent step with the new feedback loops
          updatedWorkflow[parentIndex] = {
            ...parentStep,
            feedbackLoops: updatedFeedbackLoops
          };
        }
      }
    }
    
    // Update child steps if this is a parent step with feedback children
    if (stepData.feedbackLoops && Object.keys(stepData.feedbackLoops).length > 0) {
      // Find any feedback steps that reference this parent step
      return updatedWorkflow.map(step => {
        if (step.isFeedbackStep && 
            step.feedbackRelationship && 
            step.feedbackRelationship.parentStepId === editingStep) {
          // Update the feedback relationship to ensure it maintains the correct parent info
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
      });
    }
    
    return updatedWorkflow;
  });
};

/**
 * Delete a step from the workflow
 */
export const deleteStep = (stepId, setWorkflow) => {
  setWorkflow(prevWorkflow => {
    // Find the step to check if it's a parent step
    const stepToDelete = prevWorkflow.find(step => step.id === stepId);
    
    if (stepToDelete && stepToDelete.isFeedbackStep) {
      // For feedback steps, delete this step and update the parent's feedback loops
      return deleteFeedbackStep(stepId, setWorkflow, prevWorkflow);
    } else if (stepToDelete && stepToDelete.feedbackLoops && Object.keys(stepToDelete.feedbackLoops).length > 0) {
      // For parent steps with feedback loops, delete all related feedback steps too
      return prevWorkflow.filter(step => 
        step.id !== stepId && 
        !(step.isFeedbackStep && 
          step.feedbackRelationship && 
          step.feedbackRelationship.parentStepId === stepId)
      );
    } else {
      // For regular steps, just remove the step
      return prevWorkflow.filter(step => step.id !== stepId);
    }
  });
};

/**
 * Delete a feedback step from the workflow and update its parent step
 */
export const deleteFeedbackStep = (stepId, setWorkflow, currentWorkflow = null) => {
  // If current workflow is provided, use it directly (for internal use)
  if (currentWorkflow) {
    // Find the feedback step to get its relationship info
    const feedbackStep = currentWorkflow.find(step => step.id === stepId);
    
    if (feedbackStep && feedbackStep.isFeedbackStep && feedbackStep.feedbackRelationship) {
      const parentStepId = feedbackStep.feedbackRelationship.parentStepId;
      const feedbackId = feedbackStep.feedbackRelationship.feedbackId;
      
      // Remove the feedback step
      const updatedWorkflow = currentWorkflow.filter(step => step.id !== stepId);
      
      // Update the parent step's feedback loops
      if (parentStepId && feedbackId) {
        const parentIndex = updatedWorkflow.findIndex(step => step.id === parentStepId);
        
        if (parentIndex !== -1) {
          const parentStep = updatedWorkflow[parentIndex];
          
          if (parentStep.feedbackLoops) {
            // Create a new feedbackLoops object without this feedback
            const updatedFeedbackLoops = { ...parentStep.feedbackLoops };
            delete updatedFeedbackLoops[feedbackId];
            
            // Update the parent step
            updatedWorkflow[parentIndex] = {
              ...parentStep,
              feedbackLoops: updatedFeedbackLoops
            };
          }
        }
      }
      
      return updatedWorkflow;
    }
    
    // If not a feedback step or no relationship info, just remove the step
    return currentWorkflow.filter(step => step.id !== stepId);
  }
  
  // If no current workflow provided, use the setWorkflow function
  setWorkflow(prevWorkflow => {
    // Find the feedback step to get its relationship info
    const feedbackStep = prevWorkflow.find(step => step.id === stepId);
    
    if (feedbackStep && feedbackStep.isFeedbackStep && feedbackStep.feedbackRelationship) {
      const parentStepId = feedbackStep.feedbackRelationship.parentStepId;
      const feedbackId = feedbackStep.feedbackRelationship.feedbackId;
      
      // Remove the feedback step
      const updatedWorkflow = prevWorkflow.filter(step => step.id !== stepId);
      
      // Update the parent step's feedback loops
      if (parentStepId && feedbackId) {
        const parentIndex = updatedWorkflow.findIndex(step => step.id === parentStepId);
        
        if (parentIndex !== -1) {
          const parentStep = updatedWorkflow[parentIndex];
          
          if (parentStep.feedbackLoops) {
            // Create a new feedbackLoops object without this feedback
            const updatedFeedbackLoops = { ...parentStep.feedbackLoops };
            delete updatedFeedbackLoops[feedbackId];
            
            // Update the parent step
            updatedWorkflow[parentIndex] = {
              ...parentStep,
              feedbackLoops: updatedFeedbackLoops
            };
          }
        }
      }
      
      return updatedWorkflow;
    }
    
    // If not a feedback step or no relationship info, just remove the step
    return prevWorkflow.filter(step => step.id !== stepId);
  });
};

/**
 * Move a step from one position to another in the workflow,
 * ensuring that feedback loop children steps move with their parent
 */
export const moveStep = (dragIndex, hoverIndex, setWorkflow) => {
  setWorkflow(prevWorkflow => {
    const newWorkflow = [...prevWorkflow];
    
    // Find the step being dragged
    const draggedStep = newWorkflow[dragIndex];
    
    // Find all child steps for this parent (if any)
    const childSteps = newWorkflow.filter(
      step => step.feedbackRelationship && 
              step.feedbackRelationship.parentStepId === draggedStep.id
    );
    
    // If no child steps, perform a simple move
    if (childSteps.length === 0) {
      // Remove the dragged item
      const [removedStep] = newWorkflow.splice(dragIndex, 1);
      // Insert it at the new position
      newWorkflow.splice(hoverIndex, 0, removedStep);
      return newWorkflow;
    }
    
    // With child steps, move the entire group
    // Remove the dragged step and its children
    const filteredSteps = newWorkflow.filter(
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
    filteredSteps.splice(childInsertIndex, 0, ...childSteps);
    
    return filteredSteps;
  });
};
