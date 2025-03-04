import { useState, useEffect } from 'react';
import WorkflowStep from './WorkflowStep';
import StepForm from './StepForm';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const WorkflowBuilder = () => {
  // Main state for scenarios and active scenario
  const [scenarios, setScenarios] = useState({
    main: {
      id: 'main',
      name: 'Main Workflow',
      condition: null,
      steps: []
    }
  });
  const [activeScenarioId, setActiveScenarioId] = useState('main');
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioCondition, setNewScenarioCondition] = useState('');
  const [baseScenarioId, setBaseScenarioId] = useState('main');
  const [masterView, setMasterView] = useState(false);
  
  // UI state
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  
  // Helper to get current workflow based on active scenario
  const workflow = masterView 
    ? getMergedWorkflow() 
    : scenarios[activeScenarioId]?.steps || [];

  // Generate a merged workflow from all scenarios
  function getMergedWorkflow() {
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
  }

  const addStep = (stepData) => {
    const newStep = {
      id: Date.now().toString(),
      ...stepData
    };
    
    setScenarios(prevScenarios => ({
      ...prevScenarios,
      [activeScenarioId]: {
        ...prevScenarios[activeScenarioId],
        steps: [...prevScenarios[activeScenarioId].steps, newStep]
      }
    }));
    setIsAddingStep(false);
  };

  const updateStep = (stepData) => {
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
    
    setEditingStep(null);
  };

  const deleteStep = (stepId) => {
    setScenarios(prevScenarios => {
      const updatedScenarios = { ...prevScenarios };
      
      if (activeScenarioId === 'main') {
        // If deleting from main, remove from all scenarios
        Object.keys(updatedScenarios).forEach(scenarioId => {
          updatedScenarios[scenarioId].steps = updatedScenarios[scenarioId].steps.filter(step => step.id !== stepId);
        });
      } else {
        // If deleting from a scenario, only remove from that scenario
        updatedScenarios[activeScenarioId].steps = updatedScenarios[activeScenarioId].steps.filter(step => step.id !== stepId);
      }
      
      return updatedScenarios;
    });
  };

  const moveStep = (dragIndex, hoverIndex) => {
    const currentSteps = scenarios[activeScenarioId].steps;
    const draggedStep = currentSteps[dragIndex];
    const updatedSteps = [...currentSteps];
    
    // Remove the dragged item
    updatedSteps.splice(dragIndex, 1);
    // Insert it at the new position
    updatedSteps.splice(hoverIndex, 0, draggedStep);
    
    setScenarios(prevScenarios => ({
      ...prevScenarios,
      [activeScenarioId]: {
        ...prevScenarios[activeScenarioId],
        steps: updatedSteps
      }
    }));
  };
  
  // Create a new scenario based on an existing one
  const createScenario = () => {
    if (!newScenarioName.trim()) return;
    
    const scenarioId = `scenario_${Date.now()}`;
    const baseSteps = scenarios[baseScenarioId].steps;
    
    setScenarios(prevScenarios => ({
      ...prevScenarios,
      [scenarioId]: {
        id: scenarioId,
        name: newScenarioName,
        condition: newScenarioCondition,
        steps: [...baseSteps] // Copy steps from base scenario
      }
    }));
    
    setNewScenarioName('');
    setNewScenarioCondition('');
    setShowScenarioModal(false);
    setActiveScenarioId(scenarioId); // Switch to the new scenario
  };
  
  // Delete a scenario
  const deleteScenario = (scenarioId) => {
    if (scenarioId === 'main') return; // Cannot delete main scenario
    
    setScenarios(prevScenarios => {
      const { [scenarioId]: removed, ...rest } = prevScenarios;
      return rest;
    });
    
    if (activeScenarioId === scenarioId) {
      setActiveScenarioId('main');
    }
  };
  
  // Update a scenario's properties
  const updateScenario = (scenarioId, updates) => {
    setScenarios(prevScenarios => ({
      ...prevScenarios,
      [scenarioId]: {
        ...prevScenarios[scenarioId],
        ...updates
      }
    }));
  };

  const saveWorkflow = () => {
    // Save the entire scenarios object
    const workflowJson = JSON.stringify({
      name: workflowName,
      scenarios
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
    
    setShowSaveModal(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.scenarios) {
          // New format with scenarios
          setScenarios(importedData.scenarios);
          if (importedData.name) {
            setWorkflowName(importedData.name);
          } else {
            setWorkflowName(file.name.replace('.json', '').replace(/-/g, ' '));
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
      } catch (error) {
        alert('Invalid workflow file');
      }
    };
    reader.readAsText(file);
  };

  // Modal backdrop click handler
  const handleModalBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not its children
    if (e.target === e.currentTarget) {
      setIsAddingStep(false);
      setEditingStep(null);
      setShowSaveModal(false);
      setShowScenarioModal(false);
    }
  };

  return (
  <DndProvider backend={HTML5Backend}>
  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
    <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-primary">{workflowName}</h1>
      <div className="flex gap-2">
        <input 
          type="file" 
          id="import-workflow" 
          accept=".json" 
          onChange={handleFileUpload} 
          className="hidden"
        />
        <label htmlFor="import-workflow" className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded text-sm cursor-pointer">
          Import Workflow
        </label>
        <button 
          onClick={() => setShowSaveModal(true)}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded text-sm"
        >
          Save Workflow
        </button>
      </div>
    </div>
    
    {/* Scenario Selection Panel */}
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Scenarios</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowScenarioModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Scenario
          </button>
          <button 
            onClick={() => setMasterView(!masterView)}
            className={`px-3 py-1 rounded text-sm flex items-center ${masterView ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {masterView ? 'Exit Master View' : 'Master View'}
          </button>
        </div>
      </div>
      
      {/* Scenario tabs */}
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.values(scenarios).map(scenario => (
          <button
            key={scenario.id}
            onClick={() => { setActiveScenarioId(scenario.id); setMasterView(false); }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors 
              ${activeScenarioId === scenario.id && !masterView 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}
              ${scenario.id === 'main' ? 'border-l-4 border-l-primary' : ''}
            `}
          >
            {scenario.name}
            {scenario.id !== 'main' && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                {scenario.condition || 'No condition'}
              </span>
            )}
            {scenario.id !== 'main' && (
              <button 
                onClick={(e) => { e.stopPropagation(); deleteScenario(scenario.id); }}
                className="ml-2 text-gray-500 hover:text-red-500"
                title="Delete scenario"
              >
                ×
              </button>
            )}
          </button>
        ))}
      </div>
    </div>

        {workflow.length === 0 ? (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-6">
      <p className="text-gray-500 mb-2">No steps in this workflow yet</p>
    <p className="text-gray-400 text-sm">Click "Add Step" below to start building your workflow</p>
  </div>
  ) : (
      <div className="space-y-4 mb-6">
      {workflow.map((step, index) => (
      <WorkflowStep 
      key={step.id}
    step={step}
    index={index}
    onEdit={() => setEditingStep(step.id)}
    onDelete={() => deleteStep(step.id)}
    moveStep={moveStep}
  />
  ))}
  </div>
  )}

        {!masterView && (
          <button 
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center text-sm"
            onClick={() => setIsAddingStep(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Step
          </button>
        )}

        {/* Modal for Adding a Step */}
    {isAddingStep && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleModalBackdropClick}>
      <div className="bg-white rounded-lg p-6 w-5/6 max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-primary">Add New Step</h2>
    <button 
      onClick={() => setIsAddingStep(false)}
    className="text-gray-500 hover:text-gray-700"
  >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
  </button>
  </div>
    <StepForm 
      onSubmit={addStep}
      onCancel={() => setIsAddingStep(false)}
      scenarioId={activeScenarioId}
      scenarioCondition={scenarios[activeScenarioId]?.condition}
    />
  </div>
  </div>
  )}

        {/* Modal for Editing a Step */}
    {editingStep && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleModalBackdropClick}>
      <div className="bg-white rounded-lg p-6 w-5/6 max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-primary">Edit Step</h2>
    <button 
      onClick={() => setEditingStep(null)}
    className="text-gray-500 hover:text-gray-700"
  >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
  </button>
  </div>
    <StepForm 
      initialData={scenarios[activeScenarioId]?.steps.find(step => step.id === editingStep)}
      onSubmit={updateStep}
      onCancel={() => setEditingStep(null)}
      scenarioId={activeScenarioId}
      scenarioCondition={scenarios[activeScenarioId]?.condition}
    />
  </div>
  </div>
  )}

        {/* Modal for Creating New Scenario */}
        {showScenarioModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleModalBackdropClick}>
            <div className="bg-white rounded-lg p-6 w-4/5 max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-primary">Create New Scenario</h2>
                <button 
                  onClick={() => setShowScenarioModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <label htmlFor="scenario-name" className="block text-sm font-medium mb-1">Scenario Name</label>
                <input
                  id="scenario-name"
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Home School Path"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="scenario-condition" className="block text-sm font-medium mb-1">Condition (When this scenario applies)</label>
                <input
                  id="scenario-condition"
                  type="text"
                  value={newScenarioCondition}
                  onChange={(e) => setNewScenarioCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., student.homeSchool === true"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="base-scenario" className="block text-sm font-medium mb-1">Base Scenario</label>
                <select
                  id="base-scenario"
                  value={baseScenarioId}
                  onChange={(e) => setBaseScenarioId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Object.values(scenarios).map(scenario => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">The new scenario will start with a copy of this scenario's steps</p>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowScenarioModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={createScenario}
                  className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded"
                  disabled={!newScenarioName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Saving Workflow */}
        {showSaveModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleModalBackdropClick}>
      <div className="bg-white rounded-lg p-6 w-4/5 max-w-md" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-primary">Save Workflow</h2>
    <button 
      onClick={() => setShowSaveModal(false)}
    className="text-gray-500 hover:text-gray-700"
  >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
  </button>
  </div>
    <div className="mb-4">
      <label htmlFor="workflow-name" className="block text-sm font-medium mb-1">Workflow Name</label>
    <input
      id="workflow-name"
    type="text"
    value={workflowName}
    onChange={(e) => setWorkflowName(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
  </div>
    <div className="flex justify-end gap-2">
      <button 
      onClick={() => setShowSaveModal(false)}
    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
  >
      Cancel
  </button>
    <button 
      onClick={saveWorkflow}
    className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded"
  >
      Save
  </button>
  </div>
  </div>
  </div>
  )}
  </div>
  </DndProvider>
  );
};

export default WorkflowBuilder;
