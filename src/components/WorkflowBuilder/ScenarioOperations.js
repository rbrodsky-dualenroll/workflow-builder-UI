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
  const mainSteps = [...(scenarios.main?.steps || [])];
  
  // For each conditional scenario
  Object.keys(scenarios).forEach(scenarioId => {
    if (scenarioId === 'main') return;
    
    const scenario = scenarios[scenarioId];
    
    // Add scenario information to custom steps
    const scenarioSteps = scenario.steps.map(step => {
      // Skip steps that already exist in main workflow
      const originalId = step.originalStepId || step.id;
      const existsInMain = mainSteps.some(mainStep => mainStep.id === originalId);
      
      if (!existsInMain) {
        return {
          ...step,
          scenarioId,
          scenarioName: scenario.name, // Add the human-readable scenario name
          scenarioCondition: scenario.condition, // Add scenario condition
          conditional: true,
          workflowCondition: step.workflowCondition || scenario.condition // Use step condition or inherit from scenario
        };
      }
      return null;
    }).filter(Boolean);
    
    // Merge scenario steps with main steps
    mainSteps.push(...scenarioSteps);
  });
  
  return mainSteps;
};
