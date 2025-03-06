import React from 'react';
import PreviewContainer from './PreviewContainer';

/**
 * Preview for provide consent steps
 */
const ProvideConsentStepPreview = ({ step }) => {
  return (
    <PreviewContainer step={step}>
      <div className="bg-gray-50 border border-gray-300 rounded-md p-4 mb-4">
        <h4 className="font-medium mb-2">Consent Required</h4>
        <p className="text-sm text-gray-700 mb-4">
          By checking the box below, I consent to my student's enrollment in dual credit courses. I understand the academic implications of enrolling in college-level coursework.
        </p>
        
        <div className="flex items-center mb-2">
          <input type="checkbox" id="consent" className="h-4 w-4 text-primary focus:ring-primary" />
          <label htmlFor="consent" className="ml-2 text-sm font-medium">I consent to my student's enrollment</label>
        </div>
      </div>
    </PreviewContainer>
  );
};

export default ProvideConsentStepPreview;
