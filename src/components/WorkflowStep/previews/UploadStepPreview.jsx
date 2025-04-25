import React from 'react';
import PreviewContainer from './PreviewContainer';

/**
 * Preview for upload steps
 */
const UploadStepPreview = ({ step }) => {
  return (
    <PreviewContainer step={step}>
      {/* Document Class Information */}
      {step.documentClass && (
        <div className="mb-3">
          <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
            <span className="text-sm font-medium text-blue-800">
              Document Class: {step.documentClass}
            </span>
          </div>
        </div>
      )}
      
      {/* File Uploads */}
      {step.fileUploads && step.fileUploads.length > 0 && (
        <div>
          <div className="mb-4">
            {step.fileUploads.map((file, idx) => (
              <div key={idx} className="mb-3">
                <h4 className="font-medium mb-1">{file.label}</h4>
                <div className="border border-gray-300 rounded-md p-3 bg-gray-50 flex items-center">
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded mr-3 text-sm">
                    Choose File
                  </button>
                  <span className="text-gray-500 text-sm">No file chosen</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Accepted formats: {file.fileType}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PreviewContainer>
  );
};

export default UploadStepPreview;
