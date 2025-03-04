import { useState } from 'react';
import WorkflowStep from './WorkflowStep';
import StepForm from './StepForm';

const WorkflowBuilder = () => {
  const [workflow, setWorkflow] = useState([]);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [workflowName, setWorkflowName] = useState('New Workflow');

  const addStep = (stepData) => {
    const newStep = {
      id: Date.now().toString(),
      ...stepData
    };
    
    setWorkflow([...workflow, newStep]);
    setIsAddingStep(false);
  };

  const updateStep = (stepData) => {
    const updatedWorkflow = workflow.map(step => 
      step.id === editingStep ? { ...step, ...stepData } : step
    );
    
    setWorkflow(updatedWorkflow);
    setEditingStep(null);
  };

  const deleteStep = (stepId) => {
    setWorkflow(workflow.filter(step => step.id !== stepId));
  };

  const moveStep = (stepId, direction) => {
    const stepIndex = workflow.findIndex(step => step.id === stepId);
    if (
      (direction === 'up' && stepIndex === 0) || 
      (direction === 'down' && stepIndex === workflow.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    const updatedWorkflow = [...workflow];
    const step = updatedWorkflow[stepIndex];
    
    updatedWorkflow.splice(stepIndex, 1);
    updatedWorkflow.splice(newIndex, 0, step);
    
    setWorkflow(updatedWorkflow);
  };

  const saveWorkflow = () => {
    const workflowJson = JSON.stringify(workflow, null, 2);
    
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
        const importedWorkflow = JSON.parse(e.target.result);
        setWorkflow(importedWorkflow);
        setWorkflowName(file.name.replace('.json', '').replace(/-/g, ' '));
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
    }
  };

  return (
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
              onMove={moveStep}
            />
          ))}
        </div>
      )}

      <button 
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center text-sm"
        onClick={() => setIsAddingStep(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Step
      </button>

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
              initialData={workflow.find(step => step.id === editingStep)}
              onSubmit={updateStep}
              onCancel={() => setEditingStep(null)}
            />
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
  );
};

export default WorkflowBuilder;
