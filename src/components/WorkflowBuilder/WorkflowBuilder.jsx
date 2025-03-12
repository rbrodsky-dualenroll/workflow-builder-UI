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
import ConfirmationModal from './modals/ConfirmationModal';
import ConditionManagerModal from './modals/ConditionManagerModal';

// Import custom hooks
import useWorkflowState from './hooks/useWorkflowState';
import useModalState from './hooks/useModalState';

// Import operations
import { addStep, updateStep, deleteStep, deleteFeedbackStep, moveStep } from './WorkflowOperations';
import { createScenario, deleteScenario, getMergedWorkflow } from './ScenarioOperations';
import { saveWorkflow, importWorkflow } from './FileOperations';

const WorkflowBuilder = () => {
  // Get workflow state from custom hook
  const { 
    scenarios, 
    setScenarios, 
    activeScenarioId, 
    setActiveScenarioId, 
    masterView, 
    setMasterView, 
    workflowName, 
    setWorkflowName,
    workflow  // This is calculated from the scenarios and active/master view
  } = useWorkflowState(getMergedWorkflow);
  
  // Workflow conditions state
  const [workflowConditions, setWorkflowConditions] = useState({});
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [conditionToAdd, setConditionToAdd] = useState(null);
  
  // Get modal state from custom hook
  const {
    isAddingStep,
    setIsAddingStep,
    editingStep,
    setEditingStep,
    showSaveModal,
    setShowSaveModal,
    showScenarioModal,
    setShowScenarioModal,
    showNewWorkflowModal,
    setShowNewWorkflowModal,
    newScenarioName,
    setNewScenarioName,
    newScenarioCondition,
    setNewScenarioCondition,
    baseScenarioId,
    setBaseScenarioId
  } = useModalState();
  
  // Collect usage stats for conditions
  const getConditionUsageStats = () => {
    const stats = {};
    
    // Initialize all conditions with empty arrays
    Object.keys(workflowConditions).forEach(condition => {
      stats[condition] = [];
    });
    
    // Collect usage stats from all scenarios
    Object.values(scenarios).forEach(scenario => {
      scenario.steps.forEach(step => {
        if (step.conditional && step.workflowCondition && workflowConditions[step.workflowCondition]) {
          if (!stats[step.workflowCondition]) {
            stats[step.workflowCondition] = [];
          }
          stats[step.workflowCondition].push(step.id);
        }
      });
    });
    
    return stats;
  };
  
  // Handler for updating workflow conditions
  const handleUpdateWorkflowConditions = (updatedConditions) => {
    setWorkflowConditions(updatedConditions);
  };
  
  // Handler for managing workflow conditions from a step
  const handleManageWorkflowConditions = (condition) => {
    setConditionToAdd(condition);
    setShowConditionModal(true);
  };
  
  // Handler for adding a new step
  const handleAddStep = (stepData) => {
    addStep(stepData, activeScenarioId, setScenarios);
    setIsAddingStep(false);
  };
  
  // Handler for updating a step
  const handleUpdateStep = (stepData) => {
    updateStep(stepData, editingStep, activeScenarioId, scenarios, setScenarios);
    setEditingStep(null);
  };
  
  // Handler for deleting a step
  const handleDeleteStep = (stepId) => {
    // Check if this is a feedback step
    const stepToDelete = scenarios[activeScenarioId].steps.find(step => step.id === stepId);
    
    if (stepToDelete && stepToDelete.isFeedbackStep) {
      deleteFeedbackStep(stepId, activeScenarioId, setScenarios);
    } else {
      deleteStep(stepId, activeScenarioId, setScenarios);
    }
  };
  
  // Handler for moving a step
  const handleMoveStep = (dragIndex, hoverIndex) => {
    moveStep(dragIndex, hoverIndex, activeScenarioId, setScenarios);
  };
  
  // Handler for creating a new scenario
  const handleCreateScenario = () => {
    if (!newScenarioName.trim()) return;
    
    const updatedScenarios = createScenario(
      scenarios, 
      baseScenarioId, 
      newScenarioName, 
      newScenarioCondition
    );
    
    setScenarios(updatedScenarios);
    
    // Get the new scenario ID (needed to set active scenario)
    const newScenarioId = `scenario_${Date.now()}`;
    
    setNewScenarioName('');
    setNewScenarioCondition('');
    setShowScenarioModal(false);
    setActiveScenarioId(newScenarioId); // Switch to the new scenario
    setMasterView(false);
  };
  
  // Handler for deleting a scenario
  const handleDeleteScenario = (scenarioId) => {
    if (scenarioId === 'main') return; // Cannot delete main scenario
    
    const updatedScenarios = deleteScenario(scenarios, scenarioId);
    setScenarios(updatedScenarios);
    
    if (activeScenarioId === scenarioId) {
      setActiveScenarioId('main');
    }
  };

  // Handler for saving the workflow
  const handleSaveWorkflow = () => {
    // Save both the workflow structure and conditions
    saveWorkflow(workflowName, scenarios, workflowConditions);
    setShowSaveModal(false);
  };

  // Handler for creating a new workflow
  const handleNewWorkflow = () => {
    // Show confirmation modal
    setShowNewWorkflowModal(true);
  };

  // Handler for confirming a new workflow
  const createNewWorkflow = () => {
    // Reset to default state
    setScenarios({
      main: {
        id: 'main',
        name: 'Main Workflow',
        condition: null,
        steps: []
      }
    });
    setActiveScenarioId('main');
    setMasterView(false);
    setWorkflowName('New Workflow');
    setWorkflowConditions({});
    setShowNewWorkflowModal(false);
  };

  // Handler for importing a workflow
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    importWorkflow(file, setScenarios, setWorkflowName, setActiveScenarioId, setMasterView, setWorkflowConditions)
      .then(() => {
        // Reset the file input to allow importing the same file again
        event.target.value = '';
      })
      .catch(error => {
        alert(error.message);
      });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* Header with workflow name and import/save buttons */}
        <WorkflowHeader 
          workflowName={workflowName}
          onSave={() => setShowSaveModal(true)}
          onImport={handleFileUpload}
          onNew={handleNewWorkflow}
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
          onDeleteStep={handleDeleteStep}
          moveStep={handleMoveStep}
          onAddStep={() => setIsAddingStep(true)}
          masterView={masterView}
        />

        {/* Add Step Modal */}
        <StepModal 
          isOpen={isAddingStep}
          onClose={() => setIsAddingStep(false)}
          title="Add New Step"
          onSubmit={handleAddStep}
          scenarioId={activeScenarioId}
          scenarioCondition={scenarios[activeScenarioId]?.condition}
          onAddFeedbackStep={handleAddStep}
          workflowConditions={workflowConditions}
          onManageWorkflowConditions={handleManageWorkflowConditions}
        />

        {/* Edit Step Modal */}
        {editingStep && (
          <StepModal 
            isOpen={editingStep !== null}
            onClose={() => setEditingStep(null)}
            title="Edit Step"
            initialData={scenarios[activeScenarioId]?.steps.find(step => step.id === editingStep)}
            onSubmit={handleUpdateStep}
            scenarioId={activeScenarioId}
            scenarioCondition={scenarios[activeScenarioId]?.condition}
            onAddFeedbackStep={handleAddStep}
            workflowConditions={workflowConditions}
            onManageWorkflowConditions={handleManageWorkflowConditions}
          />
        )}
        
        {/* Condition Manager Modal */}
        <ConditionManagerModal
          isOpen={showConditionModal}
          onClose={() => {
            setShowConditionModal(false);
            setConditionToAdd(null);
          }}
          conditions={workflowConditions}
          onUpdate={handleUpdateWorkflowConditions}
          usageStats={getConditionUsageStats()}
          initialCondition={conditionToAdd}
          title={conditionToAdd ? "Save as Workflow Condition" : "Manage Workflow Conditions"}
        />

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
          onSave={handleSaveWorkflow}
        />

        {/* New Workflow Confirmation Modal */}
        <ConfirmationModal
          isOpen={showNewWorkflowModal}
          onClose={() => setShowNewWorkflowModal(false)}
          onConfirm={createNewWorkflow}
          title="Create New Workflow"
          message="Are you sure you want to create a new workflow? Any unsaved changes will be lost."
          confirmButtonText="Create New"
          confirmButtonClass="bg-blue-600 hover:bg-blue-700"
        />
      </div>
    </DndProvider>
  );
};

export default WorkflowBuilder;
