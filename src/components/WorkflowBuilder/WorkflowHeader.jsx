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
        >
          New Workflow
        </button>
        <input 
          type="file" 
          id="import-workflow" 
          accept=".json" 
          onChange={onImport} 
          className="hidden"
        />
        <label htmlFor="import-workflow" className="bg-secondary hover:bg-secondary-600 text-white px-4 py-2 rounded text-sm cursor-pointer">
          Import Workflow
        </label>
        <button 
          onClick={onSave}
          className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded text-sm"
        >
          Save Workflow
        </button>
      </div>
    </div>
  );
};

export default WorkflowHeader;
