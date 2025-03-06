import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import components
import WorkflowHeader from './WorkflowHeader';
import ScenarioManager from './ScenarioManager';
import WorkflowContent from './WorkflowContent';

// Import modals
import StepModal from './modals/StepModal';
import ScenarioModal from './modals/ScenarioModal';
import SaveWorkflowModal from './modals/SaveWorkflowModal';

// Import utilities
import { 
  getMergedWorkflow, 
  createScenario as createScenarioUtil, 
  deleteScenario as deleteScenarioUtil,
  updateScenario as updateScenarioUtil
} from './scenarioUtils';

const WorkflowBuilderRefactored = () => {
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
  const [masterView, setMasterView] = useState(false);
  
  // UI state
  const [workflowName, setWorkflowName] = useState('New Workflow');
  
  // Modal states
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  
  // New scenario form state
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioCondition, setNewScenarioCondition] = useState('');
  const [baseScenarioId, setBaseScenarioId] = useState('main');
  
  // Helper to get current workflow based on active scenario
  const workflow = masterView 
    ? getMergedWorkflow(scenarios) 
    : scenarios[activeScenarioId]?.steps || [];

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
  
  // Create a new scenario
  const handleCreateScenario = () => {
    if (!newScenarioName.trim()) return;
    
    setScenarios(prevScenarios => 
      createScenarioUtil(prevScenarios, baseScenarioId, newScenarioName, newScenarioCondition)
    );
    
    // Get the new scenario ID (needed to set active scenario)
    const newScenarioId = `scenario_${Date.now()}`;
    
    setNewScenarioName('');
    setNewScenarioCondition('');
    setShowScenarioModal(false);
    setActiveScenarioId(newScenarioId); // Switch to the new scenario
    setMasterView(false);
  };
  
  // Delete a scenario
  const handleDeleteScenario = (scenarioId) => {
    if (scenarioId === 'main') return; // Cannot delete main scenario
    
    setScenarios(prevScenarios => deleteScenarioUtil(prevScenarios, scenarioId));
    
    if (activeScenarioId === scenarioId) {
      setActiveScenarioId('main');
    }
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Header with workflow name and import/save buttons */}
        <WorkflowHeader 
          workflowName={workflowName}
          onSave={() => setShowSaveModal(true)}
          onImport={handleFileUpload}
        />
        
        {/* Scenario manager */}
        <ScenarioManager 
          scenarios={scenarios}
          activeScenarioId={activeScenarioId}
          setActiveScenarioId={setActiveScenarioId}
          masterView={masterView}
          setMasterView={setMasterView}
          onAddScenario={() => setShowScenarioModal(true)}
          onDeleteScenario={handleDeleteScenario}
        />

        {/* Workflow content (steps) */}
        <WorkflowContent 
          workflow={workflow}
          onEditStep={setEditingStep}
          onDeleteStep={deleteStep}
          moveStep={moveStep}
          onAddStep={() => setIsAddingStep(true)}
          masterView={masterView}
        />

        {/* Add Step Modal */}
        <StepModal 
          isOpen={isAddingStep}
          onClose={() => setIsAddingStep(false)}
          title="Add New Step"
          onSubmit={addStep}
          scenarioId={activeScenarioId}
          scenarioCondition={scenarios[activeScenarioId]?.condition}
        />

        {/* Edit Step Modal */}
        {editingStep && (
          <StepModal 
            isOpen={editingStep !== null}
            onClose={() => setEditingStep(null)}
            title="Edit Step"
            initialData={scenarios[activeScenarioId]?.steps.find(step => step.id === editingStep)}
            onSubmit={updateStep}
            scenarioId={activeScenarioId}
            scenarioCondition={scenarios[activeScenarioId]?.condition}
          />
        )}

        {/* Create Scenario Modal */}
        <ScenarioModal 
          isOpen={showScenarioModal}
          onClose={() => setShowScenarioModal(false)}
          scenarioName={newScenarioName}
          setScenarioName={setNewScenarioName}
          scenarioCondition={newScenarioCondition}
          setScenarioCondition={setNewScenarioCondition}
          baseScenarioId={baseScenarioId}
          setBaseScenarioId={setBaseScenarioId}
          scenarios={scenarios}
          onCreate={handleCreateScenario}
        />

        {/* Save Workflow Modal */}
        <SaveWorkflowModal 
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          workflowName={workflowName}
          setWorkflowName={setWorkflowName}
          onSave={saveWorkflow}
        />
      </div>
    </DndProvider>
  );
};

export default WorkflowBuilderRefactored;
