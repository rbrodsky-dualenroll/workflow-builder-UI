/**
 * Functions for file operations (import/export workflows)
 */

/**
 * Save workflow to a JSON file
 */
export const saveWorkflow = (workflowName, scenarios, workflowConditions = {}) => {
  // Save the entire scenarios object and conditions
  const workflowJson = JSON.stringify({
    name: workflowName,
    scenarios,
    conditions: workflowConditions
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
export const importWorkflow = (file, setScenarios, setWorkflowName, setActiveScenarioId, setMasterView, setWorkflowConditions) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // Always reset to a fresh state before importing
        if (importedData.scenarios) {
          // New format with scenarios
          setScenarios(importedData.scenarios);
          if (importedData.name) {
            setWorkflowName(importedData.name);
          } else {
            setWorkflowName(file.name.replace('.json', '').replace(/-/g, ' '));
          }
          
          // Import conditions if available
          if (importedData.conditions && setWorkflowConditions) {
            setWorkflowConditions(importedData.conditions);
          }
        } else {
          // Old format with just a workflow array
          setScenarios({
            main: {
              id: 'main',
              name: 'Main Workflow',
              condition: null,
              steps: importedData
            }
          });
          setWorkflowName(file.name.replace('.json', '').replace(/-/g, ' '));
        }
        
        setActiveScenarioId('main');
        setMasterView(false);
        
        resolve(true);
      } catch (error) {
        reject(new Error('Invalid workflow file'));
      }
    };
    reader.readAsText(file);
  });
};
