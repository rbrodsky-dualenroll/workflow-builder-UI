import React from 'react';

/**
 * Container component for step preview with consistent styling
 */
const PreviewContainer = ({ step, children }) => {
  return (
    <div className="workflow-step-preview bg-white rounded border border-gray-200">
      <div className="p-4">
        <h3 className="text-lg font-bold mb-3">{step.role}: {step.title || 'Step'}</h3>
        
        <div className="border border-dashed border-gray-300 rounded-md p-5 mb-4">
          {step.description && (
            <p className="text-gray-700 mb-4">{step.description}</p>
          )}
          
          {children}
          
          {step.comments && step.comments.required && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
              <div className="border border-gray-300 rounded-md p-3 bg-white text-gray-400 text-sm">
                Note: comments entered here will be communicated to the student and will be visible to other participants.
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <button className="bg-primary text-white font-medium py-2 px-4 rounded-md text-sm uppercase">
            COMPLETE STEP
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewContainer;
