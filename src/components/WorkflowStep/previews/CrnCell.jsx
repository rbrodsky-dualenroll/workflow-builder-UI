import React from 'react';
import { crnDisplayData, getCrnDisplayLabel } from '../stepUtils';

/**
 * Reusable component for rendering CRN cells with additional display fields
 */
const CrnCell = ({ columnName, step, value }) => {
  // Only apply special rendering for CRN columns
  if (columnName !== 'CRN' || !step.crnDisplay || step.crnDisplay.length === 0) {
    return value;
  }
  
  return (
    <div>
      <div className="font-medium">{value || '4857'}</div>
      <div className="mt-1 border-t border-gray-300 pt-1 text-xs">
        {step.crnDisplay.map((field, idx) => (
          <div key={idx} className="py-0.5">
            <span className="font-medium">{getCrnDisplayLabel(field)}:</span> {crnDisplayData[field]}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrnCell;
