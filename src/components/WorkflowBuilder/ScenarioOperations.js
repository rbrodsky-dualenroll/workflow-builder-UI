/**
 * Functions for scenario management
 */

/**
 * Create a new scenario based on an existing scenario
 */
export const createScenario = (scenarios, baseScenarioId, scenarioName, condition = '') => {
  const baseScenario = scenarios[baseScenarioId] || scenarios.main;
  const newScenarioId = `scenario_${Date.now()}`;
  
  return {
    ...scenarios,
    [newScenarioId]: {
      id: newScenarioId,
      name: scenarioName,
      steps: [...baseScenario.steps],
      condition: condition // Store the scenario condition
    }
  };
};

/**
 * Delete a scenario
 */
export const deleteScenario = (scenarios, scenarioId) => {
  // Cannot delete main scenario
  if (scenarioId === 'main') return scenarios;
  
  const updatedScenarios = { ...scenarios };
  delete updatedScenarios[scenarioId];
  
  return updatedScenarios;
};

/**
 * Update a scenario's properties (name, condition)
 */
export const updateScenario = (scenarios, updatedScenario) => {
  if (!updatedScenario || !updatedScenario.id || !scenarios[updatedScenario.id]) {
    return scenarios;
  }
  
  return {
    ...scenarios,
    [updatedScenario.id]: {
      ...scenarios[updatedScenario.id],
      name: updatedScenario.name,
      condition: updatedScenario.condition
    }
  };
};

/**
 * Get a merged view of all scenarios for the master view
 */
export const getMergedWorkflow = (scenarios) => {
  
  // Start with main workflow steps
  let mergedSteps = [...(scenarios.main?.steps || [])];
  
  // Track which main steps have been overridden by scenario-specific versions
  const overriddenMainStepIds = new Set();
  
  // Identify unique scenario steps and track their insertion positions
  const scenarioSteps = [];
  
  // First pass: collect all scenario-specific steps
  Object.keys(scenarios).forEach(scenarioId => {
    if (scenarioId === 'main') return;
    
    const scenario = scenarios[scenarioId];
    
    scenario.steps.forEach(step => {
      // Check if this is a scenario-specific override of a main step
      if (step.scenarioSpecific && step.originalStepId) {
        // Mark the original step as having a scenario-specific override
        overriddenMainStepIds.add(step.originalStepId);
        
        // For this type of step, we want to insert it right after its original
        const enhancedStep = {
          ...step,
          scenarioId,
          scenarioName: scenario.name,
          scenarioCondition: scenario.condition,
          conditional: true,
          workflowCondition: step.workflowCondition || scenario.condition,
          _isOverride: true, // Flag for UI to show it's an override
        };
        
        // Add to collection with reference to the original step
        scenarioSteps.push({
          step: enhancedStep,
          insertAfterStepId: step.originalStepId,
          scenarioId,
          isOverride: true
        });
        
        // Skip the rest of the logic for this step
        return;
      }
      
      // Handle regular scenario-specific steps that don't exist in main
      const originalId = step.originalStepId || step.id;
      const existsInMain = mergedSteps.some(mainStep => mainStep.id === originalId);
      
      if (!existsInMain) {
        // Prepare step with scenario metadata
        const enhancedStep = {
          ...step,
          scenarioId,
          scenarioName: scenario.name,
          scenarioCondition: scenario.condition,
          conditional: true,
          workflowCondition: step.workflowCondition || scenario.condition,
          // For debugging
          _scenarioContext: {
            stepIndex: scenario.steps.findIndex(s => s.id === step.id),
            prevStepId: step.addedAfterStepId,
            originalStepId: step.originalStepId
          }
        };
        
        // Find which step in the original scenario comes before this one
        // This is crucial for determining insertion order
        const stepIndex = scenario.steps.findIndex(s => s.id === step.id);
        let insertAfterStepId = null;
        
        if (stepIndex > 0) {
          // Get the previous step in this scenario
          const prevStep = scenario.steps[stepIndex - 1];
          
          // Use its ID or original ID if it's a modified main step
          insertAfterStepId = prevStep.originalStepId || prevStep.id;
        } else if (step.addedAfterStepId) {
          // Use explicitly tracked insertion point if available
          insertAfterStepId = step.addedAfterStepId;
        }
        
        // Add to our collection with insertion reference
        scenarioSteps.push({
          step: enhancedStep,
          insertAfterStepId: insertAfterStepId,
          scenarioId,
          isOverride: false
        });
      }
    });
  });
  
  // Topologically sort the scenario steps for insertion
  const insertedStepIds = new Set(mergedSteps.map(step => step.id));
  let remainingSteps = [...scenarioSteps];
  let insertedThisPass = true;
  
  // Continue inserting steps as long as we're making progress
  while (remainingSteps.length > 0 && insertedThisPass) {
    insertedThisPass = false;
    
    // Find steps whose dependencies are satisfied
    const stepsToInsert = [];
    remainingSteps = remainingSteps.filter(item => {
      if (!item.insertAfterStepId || insertedStepIds.has(item.insertAfterStepId)) {
        stepsToInsert.push(item);
        return false; // Remove from remaining
      }
      return true; // Keep in remaining
    });
    
    // Insert the steps
    stepsToInsert.forEach(item => {
      let insertIndex = mergedSteps.length; // Default to end
      
      if (item.insertAfterStepId) {
        // Find the referenced step
        const refIndex = mergedSteps.findIndex(s => s.id === item.insertAfterStepId);
        if (refIndex !== -1) {
          insertIndex = refIndex + 1;
        } else {
          console.warn(`Referenced step ${item.insertAfterStepId} not found in merged steps for ${item.step.title}`);
        }
      } else {
        console.log(`No reference step for ${item.step.title}, appending to end`);
      }
      
      // Insert the step
      mergedSteps.splice(insertIndex, 0, item.step);
      insertedStepIds.add(item.step.id);
      insertedThisPass = true;
    });
  }
  
  // If any steps couldn't be inserted due to circular dependencies,
  // append them at the end as a fallback
  if (remainingSteps.length > 0) {
    console.warn(`${remainingSteps.length} scenario steps had unresolvable ordering and were appended to the end`);
    remainingSteps.forEach(item => {
      mergedSteps.push(item.step);
    });
  }
  
  return mergedSteps;
};
