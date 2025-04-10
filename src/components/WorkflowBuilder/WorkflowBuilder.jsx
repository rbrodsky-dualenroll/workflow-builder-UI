import { useState, useEffect } from 'react';
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
import { createScenario, deleteScenario, updateScenario, getMergedWorkflow } from './ScenarioOperations';
import { saveWorkflow, importWorkflow, loadTemplateWorkflow } from './FileOperations';

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
  
  // Expose scenarios to window for StepForm to use
  useEffect(() => {
    window.workflowBuilderState = { scenarios, activeScenarioId };
    return () => {
      delete window.workflowBuilderState;
    };
  }, [scenarios, activeScenarioId]);
  
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
    baseScenarioId,
    setBaseScenarioId,
    scenarioCondition,
    setScenarioCondition
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
  
  // Handler for managing workflow conditions from the scenario modal
  const handleManageWorkflowConditionsFromScenario = (updatedConditions) => {
    setWorkflowConditions(updatedConditions);
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
    if (!newScenarioName.trim() || !scenarioCondition) return;
    
    const updatedScenarios = createScenario(
      scenarios, 
      baseScenarioId, 
      newScenarioName,
      scenarioCondition // Pass the scenario condition
    );
    
    setScenarios(updatedScenarios);
    
    // Get the new scenario ID (needed to set active scenario)
    const newScenarioId = `scenario_${Date.now()}`;
    
    setNewScenarioName('');
    setScenarioCondition(''); // Reset scenario condition
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
  
  // Handler for updating a scenario
  const handleUpdateScenario = (updatedScenario) => {
    if (!updatedScenario || !updatedScenario.id) return;
    
    const updatedScenarios = updateScenario(scenarios, updatedScenario);
    setScenarios(updatedScenarios);
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
        steps: []
      }
    });
    setActiveScenarioId('main');
    setMasterView(false);
    setWorkflowName('New Workflow');
    setWorkflowConditions({});
    setShowNewWorkflowModal(false);
    
    // If we were trying to load a template, do that now
    if (window.loadingTemplate) {
      loadTemplate();
    }
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

  // Handler for starting from a template
  const handleStartFromTemplate = () => {
    // Show confirmation modal if there are existing steps
    if (Object.values(scenarios).some(scenario => scenario.steps.length > 0)) {
      setShowNewWorkflowModal(true);
      // Store that we're trying to load a template
      window.loadingTemplate = true;
    } else {
      loadTemplate();
    }
  };

  // Function to load the template
  const loadTemplate = async () => {
    try {
      await loadTemplateWorkflow('standard-recommended-workflow', setScenarios, setWorkflowName, setActiveScenarioId, setMasterView, setWorkflowConditions);
      // Clear the flag
      window.loadingTemplate = false;
    } catch (error) {
      alert('Error loading template: ' + error.message);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 h-auto">
        {/* Header with workflow name and import/save buttons */}
        <WorkflowHeader 
          workflowName={workflowName}
          onSave={() => setShowSaveModal(true)}
          onImport={handleFileUpload}
          onNew={handleNewWorkflow}
          onStartFromTemplate={handleStartFromTemplate}
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
          onUpdateScenario={handleUpdateScenario}
          workflowConditions={workflowConditions}
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
          scenarioCondition={activeScenarioId !== 'main' ? scenarios[activeScenarioId]?.condition : ''}
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
          title={"Add New Conditional"}
        />

        {/* Create Scenario Modal */}
        <ScenarioModal 
          isOpen={showScenarioModal}
          onClose={() => setShowScenarioModal(false)}
          scenarioName={newScenarioName}
          setScenarioName={setNewScenarioName}
          baseScenarioId={baseScenarioId}
          setBaseScenarioId={setBaseScenarioId}
          scenarios={scenarios}
          onCreate={handleCreateScenario}
          workflowConditions={workflowConditions}
          onManageWorkflowConditions={handleManageWorkflowConditionsFromScenario}
          scenarioCondition={scenarioCondition}
          setScenarioCondition={setScenarioCondition}
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
