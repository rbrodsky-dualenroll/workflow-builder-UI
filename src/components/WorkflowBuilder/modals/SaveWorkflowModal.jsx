import React from 'react';
import Modal from './Modal';

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Workflow" size="sm">
      <div className="px-6 pb-6">
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
    </Modal>
  );
};

export default SaveWorkflowModal;
