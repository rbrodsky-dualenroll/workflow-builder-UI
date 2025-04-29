/**
 * Functions for file operations (import/export workflows)
 * Updated for the flat workflow structure
 */

/**
 * Save workflow to a JSON file
 */
export const saveWorkflow = (workflowName, workflow, workflowConditions = {}, collegeInfo = {}) => {
  // Save the workflow array, conditions, and college info
  const workflowJson = JSON.stringify({
    name: workflowName,
    workflow,
    conditions: workflowConditions,
    collegeInfo
  }, null, 2);
  
  // Create a blob and download it
  const blob = new Blob([workflowJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  return true;
};

/**
 * Import workflow from a file
 */
export const importWorkflow = (file, setWorkflow, setWorkflowName, setWorkflowConditions, setCollegeInfo) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Handle different file formats
        if (importedData.workflow) {
          // Standard format - direct import
          setWorkflow(importedData.workflow);
        } else if (importedData.scenarios) {
          // Legacy format with scenarios - convert to flat structure
          console.warn('Importing legacy scenario-based workflow format - converting to single workflow');
          const convertedWorkflow = convertScenariosToWorkflow(importedData.scenarios);
          setWorkflow(convertedWorkflow);
        } else {
          // Assume it's a plain array of steps (legacy format)
          setWorkflow(importedData);
        }
        
        // Set the workflow name
        if (importedData.name) {
          setWorkflowName(importedData.name);
        } else {
          setWorkflowName(file.name.replace('.json', '').replace(/-/g, ' '));
        }
        
        // Import conditions if available
        if (importedData.conditions && setWorkflowConditions) {
          setWorkflowConditions(importedData.conditions);
        }
        
        // Import college info if available
        if (importedData.collegeInfo && setCollegeInfo) {
          setCollegeInfo(importedData.collegeInfo);
        }
        
        resolve(true);
      } catch (error) {
        reject(new Error('Invalid workflow file'));
      }
    };
    reader.readAsText(file);
  });
};

/**
 * Helper function to convert scenario-based workflow to flat workflow
 * @param {Object} scenarios - The scenarios object from a legacy workflow file
 * @returns {Array} - A flat array of workflow steps with conditional flags
 */
const convertScenariosToWorkflow = (scenarios) => {
  const mergedSteps = [];
  
  // First add main scenario steps
  if (scenarios.main && scenarios.main.steps) {
    mergedSteps.push(...scenarios.main.steps);
  }
  
  // Then add steps from other scenarios with conditional flags
  Object.entries(scenarios).forEach(([scenarioId, scenario]) => {
    if (scenarioId === 'main') return;
    
    // Add each step with its scenario condition
    scenario.steps.forEach(step => {
      // Skip duplicate steps (those that exist in main)
      if (!step.originalStepId && !mergedSteps.some(s => s.id === step.id)) {
        // Add the step with conditional flags
        mergedSteps.push({
          ...step,
          conditional: true,
          workflowCondition: step.workflowCondition || [scenario.condition]
        });
      }
    });
  });
  
  return mergedSteps;
};

/**
 * Load a template workflow
 */
export const loadTemplateWorkflow = async (templateName, setWorkflow, setWorkflowName, setWorkflowConditions, setCollegeInfo) => {
  try {
    // Import the template directly instead of using fetch
    let templateData;
    
    // Use this approach to access templates directly from the assets directory
    try {
      // First try to directly import the template (works in development)
      templateData = await import('../../assets/templates/standard-recommended-workflow.json');
    } catch (error) {
      console.log('Direct import failed, falling back to fetch with base URL');
      // Fallback to fetch with the correct base URL path
      const baseUrl = import.meta.env.BASE_URL || '/workflow-builder-UI/';
      const response = await fetch(`${baseUrl}templates/${templateName}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      templateData = await response.json();
    }
    
    // Handle different template formats
    if (templateData.workflow) {
      // Standard format - direct import
      setWorkflow(templateData.workflow);
    } else if (templateData.scenarios) {
      // Legacy format with scenarios - convert to flat structure
      console.warn('Loading legacy scenario-based template format - converting to single workflow');
      const convertedWorkflow = convertScenariosToWorkflow(templateData.scenarios);
      setWorkflow(convertedWorkflow);
    } else {
      // Assume it's a plain array of steps (legacy format)
      setWorkflow(templateData);
    }
    
    // Set the workflow name
    if (templateData.name) {
      setWorkflowName(templateData.name);
    } else {
      setWorkflowName('Template Workflow');
    }
    
    // Import conditions if available
    if (templateData.conditions && setWorkflowConditions) {
      setWorkflowConditions(templateData.conditions);
    }
    
    // Import college info if available
    if (templateData.collegeInfo && setCollegeInfo) {
      setCollegeInfo(templateData.collegeInfo);
    }
    
    return true;
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
};
