import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Import components
import WorkflowHeader from './WorkflowHeader';
import WorkflowContent from './WorkflowContent';
import WorkflowConditionManager from './WorkflowConditionManager';

// Import modals
import StepModal from './modals/StepModal';
import SaveWorkflowModal from './modals/SaveWorkflowModal';
import ConfirmationModal from './modals/ConfirmationModal';
import ConditionManagerModal from './modals/ConditionManagerModal';

// Import custom hooks
import useWorkflowState from './hooks/useWorkflowState';
import useModalState from './hooks/useModalState';

// Import operations
import { addStep, updateStep, deleteStep, moveStep } from './WorkflowOperations';
import { saveWorkflow, importWorkflow, loadTemplateWorkflow } from './FileOperations';
import DevTeamExport from './export/DevTeamExport';

const WorkflowBuilder = () => {
  // Get workflow state from custom hook
  const { 
    workflow, 
    setWorkflow, 
    workflowName, 
    setWorkflowName,
    collegeInfo,
    setCollegeInfo,
  } = useWorkflowState();
  
  // Workflow conditions state
  const [workflowConditions, setWorkflowConditions] = useState({});
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showDevTeamExportModal, setShowDevTeamExportModal] = useState(false);
  const [conditionToAdd, setConditionToAdd] = useState(null);
  
  // Get modal state from custom hook
  const {
    isAddingStep,
    setIsAddingStep,
    editingStep,
    setEditingStep,
    showSaveModal,
    setShowSaveModal,
    showNewWorkflowModal,
    setShowNewWorkflowModal
  } = useModalState();
  
  // Collect usage stats for conditions
  const getConditionUsageStats = () => {
    const stats = {};
    
    // Initialize all conditions with empty arrays
    Object.keys(workflowConditions).forEach(condition => {
      stats[condition] = [];
    });
    
    // Collect usage stats from all steps
    workflow.forEach(step => {
      if (step.conditional && step.workflowCondition) {
        const conditions = Array.isArray(step.workflowCondition) 
          ? step.workflowCondition 
          : [step.workflowCondition];
        
        conditions.forEach(condition => {
          if (workflowConditions[condition]) {
            if (!stats[condition]) {
              stats[condition] = [];
            }
            stats[condition].push(step.id);
          }
        });
      }
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
    addStep(stepData, setWorkflow);
    setIsAddingStep(false);
  };
  
  // Handler for updating a step
  const handleUpdateStep = (stepData) => {
    updateStep(stepData, editingStep, setWorkflow);
    setEditingStep(null);
  };
  
  // Handler for deleting a step
  const handleDeleteStep = (stepId) => {
    deleteStep(stepId, setWorkflow);
  };
  
  // Handler for moving a step
  const handleMoveStep = (dragIndex, hoverIndex) => {
    moveStep(dragIndex, hoverIndex, setWorkflow);
  };

  // Handler for saving the workflow
  const handleSaveWorkflow = () => {
    // Save the workflow structure, conditions, and college info
    saveWorkflow(workflowName, workflow, workflowConditions, collegeInfo);
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
    setWorkflow([]);
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

    importWorkflow(file, setWorkflow, setWorkflowName, setWorkflowConditions, setCollegeInfo)
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
    if (workflow.length > 0) {
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
      await loadTemplateWorkflow('standard-recommended-workflow', setWorkflow, setWorkflowName, setWorkflowConditions, setCollegeInfo);
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
          onExportDevTeam={() => setShowDevTeamExportModal(true)}
        />
        
        {/* Workflow Condition Manager */}
        <WorkflowConditionManager 
          workflowConditions={workflowConditions}
          onManageConditions={() => setShowConditionModal(true)}
        />

        {/* Workflow content (steps) */}
        <WorkflowContent 
          workflow={workflow}
          onEditStep={setEditingStep}
          onDeleteStep={handleDeleteStep}
          moveStep={handleMoveStep}
          onAddStep={() => setIsAddingStep(true)}
        />

        {/* Add Step Modal */}
        <StepModal 
          isOpen={isAddingStep}
          onClose={() => setIsAddingStep(false)}
          title="Add New Step"
          onSubmit={handleAddStep}
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
            initialData={workflow.find(step => step.id === editingStep)}
            onSubmit={handleUpdateStep}
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
          title={"Manage Workflow Conditions"}
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
        
        {/* Dev Team Export Modal */}
        {showDevTeamExportModal && (
          <DevTeamExport
            workflow={workflow}
            workflowName={workflowName}
            collegeInfo={collegeInfo}
            setCollegeInfo={setCollegeInfo}
            onClose={() => setShowDevTeamExportModal(false)}
            workflowConditions={workflowConditions}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default WorkflowBuilder;
