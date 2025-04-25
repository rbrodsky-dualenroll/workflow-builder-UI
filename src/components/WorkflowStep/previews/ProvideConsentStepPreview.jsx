import React from 'react';
import PreviewContainer from './PreviewContainer';

/**
 * Preview for provide consent steps
 */
const ProvideConsentStepPreview = ({ step }) => {
  return (
    <PreviewContainer step={step}>
      <div className="mb-4">
        <div className="mb-3">
          <h4 className="font-medium mb-2">Parent Consent Form</h4>
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
            <p className="text-sm mb-4">
              Your child, <em>[Student Name]</em>, has signed up to take classes this term.
            </p>
            <p className="text-sm mb-4">
              I have read all the information provided and understand the conditions of enrollment.
              To facilitate this program, I hereby give permission for the college to release all student
              account information, including financial, academic, and enrollment records, to the student's high school,
              and the high school to release grades to the college.
            </p>
            <div className="mt-5">
              <label className="block text-sm font-medium mb-1">
                Sign electronically by entering your first and last name:
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  disabled
                  className="border border-gray-300 rounded px-3 py-2 bg-white text-gray-600"
                  placeholder="Parent Name"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PreviewContainer>
  );
};

export default ProvideConsentStepPreview;
