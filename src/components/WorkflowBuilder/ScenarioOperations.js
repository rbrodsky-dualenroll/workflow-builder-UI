/**
 * Functions for scenario management
 */

/**
 * Create a new scenario based on an existing scenario
 */
export const createScenario = (scenarios, baseScenarioId, scenarioName, scenarioCondition) => {
  const baseScenario = scenarios[baseScenarioId] || scenarios.main;
  const newScenarioId = `scenario_${Date.now()}`;
  
  return {
    ...scenarios,
    [newScenarioId]: {
      id: newScenarioId,
      name: scenarioName,
      condition: scenarioCondition,
      steps: [...baseScenario.steps]
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
          scenarioCondition: scenario.condition,
          conditional: true
        };
      }
      return null;
    }).filter(Boolean);
    
    // Merge scenario steps with main steps
    mainSteps.push(...scenarioSteps);
  });
  
  return mainSteps;
};
