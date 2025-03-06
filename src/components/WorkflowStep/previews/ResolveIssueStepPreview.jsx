import React from 'react';
import PreviewContainer from './PreviewContainer';

/**
 * Preview for resolve issue steps
 */
const ResolveIssueStepPreview = ({ step }) => {
  return (
    <PreviewContainer step={step}>
      <div className="bg-gray-50 border border-gray-300 rounded-md p-4 mb-4">
        <h4 className="font-medium mb-2">Issue Resolution</h4>
        <p className="text-sm text-gray-700 mb-3">
          Please address the following issue: {step.issueType || 'Registration Issue'}
        </p>
        
        {step.fileUploads && step.fileUploads.length > 0 ? (
          <div className="mt-4">
            <h5 className="text-sm font-medium mb-2">Supporting Documents:</h5>
            {step.fileUploads.map((file, idx) => (
              <div key={idx} className="mb-2">
                <div className="border border-gray-300 rounded-md p-2 bg-white flex items-center">
                  <button className="bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2 text-xs">
                    Choose File
                  </button>
                  <span className="text-gray-500 text-xs">No file chosen</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      
      {step.actionOptions && step.actionOptions.length > 0 ? (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Resolution Options:</h4>
          <div className="space-y-2">
            {step.actionOptions.map((option, idx) => (
              <div key={idx} className="flex items-center">
                <input 
                  type="radio" 
                  id={`option-${idx}`} 
                  name="actionOption" 
                  className="h-4 w-4"
                />
                <label htmlFor={`option-${idx}`} className="ml-2 text-sm">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Resolution Options:</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="radio" id="resolved" name="resolution" className="h-4 w-4" />
              <label htmlFor="resolved" className="ml-2 text-sm">Issue Resolved</label>
            </div>
            <div className="flex items-center">
              <input type="radio" id="unresolved" name="resolution" className="h-4 w-4" />
              <label htmlFor="unresolved" className="ml-2 text-sm">Issue Cannot Be Resolved</label>
            </div>
          </div>
        </div>
      )}
    </PreviewContainer>
  );
};

export default ResolveIssueStepPreview;
