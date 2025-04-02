import React from 'react';

/**
 * Header component for the workflow builder
 */
const WorkflowHeader = ({ 
  workflowName, 
  onSave, 
  onImport,
  onNew,
}) => {
  return (
    <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-primary">{workflowName}</h1>
      <div className="flex gap-2">
        <button
          onClick={onNew}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
          data-testid="new-workflow-button"
          data-action="new-workflow"
        >
          New Workflow
        </button>
        <input 
          type="file" 
          id="import-workflow" 
          accept=".json" 
          onChange={onImport} 
          className="hidden"
          data-testid="import-workflow-input"
        />
        <label 
          htmlFor="import-workflow" 
          className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded text-sm cursor-pointer"
          data-testid="import-workflow-button"
          data-action="import-workflow"
        >
          Import Workflow
        </label>
        <button 
          onClick={onSave}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded text-sm"
          data-testid="save-workflow-button"
          data-action="save-workflow"
        >
          Save Workflow
        </button>
      </div>
    </div>
  );
};

export default WorkflowHeader;
