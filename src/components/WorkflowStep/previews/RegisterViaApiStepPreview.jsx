import React from 'react';
import PreviewContainer from './PreviewContainer';

/**
 * Preview for register via API steps
 */
const RegisterViaApiStepPreview = ({ step }) => {
  return (
    <div className="workflow-step-preview bg-white rounded border border-gray-200">
      <div className="p-4">
        <h3 className="text-lg font-bold mb-3">{step.role}: {step.title || 'Register Via API'}</h3>
        
        <div className="border border-dashed border-gray-300 rounded-md p-5 mb-4">
          {step.description && (
            <p className="text-gray-700 mb-4">{step.description}</p>
          )}
          
          <div className="bg-gray-50 border border-gray-300 rounded-md p-4 mb-4">
            <h4 className="font-medium mb-2">API Registration</h4>
            <p className="text-sm text-gray-700">
              The system will automatically register the student through the {step.apiEndpoint || 'selected'} API integration.
            </p>
            
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs text-gray-500">This step is processed automatically by the system.</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button className="bg-gray-400 text-white font-medium py-2 px-4 rounded-md text-sm uppercase" disabled>
            SYSTEM PROCESSED
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterViaApiStepPreview;
