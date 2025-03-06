import React from 'react';
import WorkflowStep from '../WorkflowStep';

/**
 * Component to display the workflow content (steps)
 */
const WorkflowContent = ({
  workflow = [],
  onEditStep,
  onDeleteStep,
  moveStep,
  onAddStep,
  masterView
}) => {
  return (
    <>
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
              onEdit={() => onEditStep(step.id)}
              onDelete={() => onDeleteStep(step.id)}
              moveStep={moveStep}
            />
          ))}
        </div>
      )}

      {!masterView && (
        <button 
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md flex items-center justify-center text-sm"
          onClick={onAddStep}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Step
        </button>
      )}
    </>
  );
};

export default WorkflowContent;
