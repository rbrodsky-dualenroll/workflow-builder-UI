/**
 * Generate a merged workflow from all scenarios
 * @param {Object} scenarios The scenarios object
 * @returns {Array} A merged workflow with steps from all scenarios
 */
export const getMergedWorkflow = (scenarios) => {
  // Start with the main workflow
  const mainSteps = scenarios.main.steps;
  const allSteps = [...mainSteps];
  
  // Add steps from conditional scenarios with visual indicators
  Object.entries(scenarios).forEach(([scenarioId, scenario]) => {
    if (scenarioId === 'main') return;
    
    const conditionalSteps = scenario.steps.filter(step => {
      // Check if this step is unique to this scenario
      // (not in main or is a modified version of a main step)
      return !mainSteps.some(mainStep => mainStep.id === step.id);
    });
    
    // Add each conditional step with its scenario condition
    conditionalSteps.forEach(step => {
      // Find where to insert this step
      let insertIndex = allSteps.length;
      
      // Find the step before this one in the original scenario
      const stepIndex = scenario.steps.findIndex(s => s.id === step.id);
      if (stepIndex > 0) {
        const prevStepId = scenario.steps[stepIndex - 1].id;
        // Find where the previous step is in our merged workflow
        const prevIndex = allSteps.findIndex(s => s.id === prevStepId);
        if (prevIndex !== -1) {
          insertIndex = prevIndex + 1;
        }
      }
      
      // Insert the conditional step with scenario information
      allSteps.splice(insertIndex, 0, {
        ...step,
        scenarioId,
        scenarioCondition: scenario.condition,
        conditional: true
      });
    });
  });
  
  return allSteps;
};

/**
 * Create a new scenario based on an existing one
 * @param {Object} scenarios The current scenarios object
 * @param {string} baseScenarioId ID of the scenario to use as a base
 * @param {string} newScenarioName Name for the new scenario
 * @param {string} newScenarioCondition Condition for the new scenario
 * @returns {Object} Updated scenarios object with the new scenario
 */
export const createScenario = (scenarios, baseScenarioId, newScenarioName, newScenarioCondition) => {
  if (!newScenarioName.trim()) return scenarios;
  
  const scenarioId = `scenario_${Date.now()}`;
  const baseSteps = scenarios[baseScenarioId].steps;
  
  return {
    ...scenarios,
    [scenarioId]: {
      id: scenarioId,
      name: newScenarioName,
      condition: newScenarioCondition,
      steps: [...baseSteps] // Copy steps from base scenario
    }
  };
};

/**
 * Delete a scenario
 * @param {Object} scenarios The current scenarios object
 * @param {string} scenarioId ID of the scenario to delete
 * @returns {Object} Updated scenarios object without the deleted scenario
 */
export const deleteScenario = (scenarios, scenarioId) => {
  if (scenarioId === 'main') return scenarios; // Cannot delete main scenario
  
  const { [scenarioId]: removed, ...rest } = scenarios;
  return rest;
};

/**
 * Update a scenario's properties
 * @param {Object} scenarios The current scenarios object
 * @param {string} scenarioId ID of the scenario to update
 * @param {Object} updates Properties to update
 * @returns {Object} Updated scenarios object
 */
export const updateScenario = (scenarios, scenarioId, updates) => {
  return {
    ...scenarios,
    [scenarioId]: {
      ...scenarios[scenarioId],
      ...updates
    }
  };
};
