import React from 'react';
import PreviewContainer from './PreviewContainer';

/**
 * Preview for information steps
 */
const InformationStepPreview = ({ step }) => {
  return (
    <PreviewContainer step={step}>
      {step.informationDisplays && step.informationDisplays.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          {step.informationDisplays.map((info, idx) => (
            <p key={idx} className="mb-2 last:mb-0">{info}</p>
          ))}
        </div>
      )}
    </PreviewContainer>
  );
};

export default InformationStepPreview;
