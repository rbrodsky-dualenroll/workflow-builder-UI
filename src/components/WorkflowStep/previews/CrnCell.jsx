import React from 'react';
import { crnDisplayData, getCrnDisplayLabel } from '../stepUtils';

/**
 * Reusable component for rendering CRN cells with additional display fields
 */
const CrnCell = ({ columnName, step, value }) => {
  // Only apply special rendering for CRN columns
  if (columnName !== 'CRN') {
    return value;
  }
  
  // Generate multiple placeholder CRNs
  const crnValues = [
    { crn: '4857', selected: true },
    { crn: '4858', selected: false },
    { crn: '4859', selected: false }
  ];
  
  // Get display fields (if any)
  const displayFields = step.crnDisplay || [];
  
  return (
    <div className="text-left">
      {crnValues.map((crnItem, crnIndex) => (
        <div key={crnIndex} className="mb-3 pb-3 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
          <div className="flex items-center">
            <input 
              type="radio" 
              id={`crn-${crnItem.crn}`} 
              name="selectedCrn" 
              defaultChecked={crnItem.selected}
              className="h-4 w-4 mr-2" 
            />
            <label htmlFor={`crn-${crnItem.crn}`} className="font-medium">{crnItem.crn}</label>
          </div>
          
          {displayFields.length > 0 && (
            <div className="mt-1 ml-6 pt-1 text-xs">
              {displayFields.map((field, idx) => (
                <div key={idx} className="py-0.5">
                  <span className="font-medium">{getCrnDisplayLabel(field)}:</span> {crnDisplayData[field]}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CrnCell;
