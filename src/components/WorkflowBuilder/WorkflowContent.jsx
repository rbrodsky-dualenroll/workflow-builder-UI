import React from 'react';
import WorkflowStep from '../WorkflowStep/WorkflowStep';

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
        <div 
          className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-6"
          data-testid="empty-workflow"
        >
          <p className="text-gray-500 mb-2">No steps in this workflow yet</p>
          <p className="text-gray-400 text-sm">Click "Add Step" below to start building your workflow</p>
        </div>
      ) : (
        <div 
          className="space-y-4 mb-6"
          data-testid="workflow-steps-container"
        >
          {workflow.map((step, index) => (
            <WorkflowStep 
              key={`${step.id}-${index}`}
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
          data-testid="add-step-button"
          data-action="add-step"
          data-id="add-step-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Step
        </button>
      )}
    </>
  );
};

export default WorkflowContent;
