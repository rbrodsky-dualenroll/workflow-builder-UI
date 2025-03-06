import React from 'react';

/**
 * Modal for saving a workflow
 */
const SaveWorkflowModal = ({ 
  isOpen, 
  onClose, 
  workflowName,
  setWorkflowName,
  onSave,
}) => {
  if (!isOpen) return null;

  // Handle backdrop click to close the modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg p-6 w-4/5 max-w-md" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-primary">Save Workflow</h2>
          <button 
            onClick={onClose}
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
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveWorkflowModal;
