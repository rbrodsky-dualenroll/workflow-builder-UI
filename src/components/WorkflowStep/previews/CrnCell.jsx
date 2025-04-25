import React from 'react';
import { crnDisplayData, getCrnDisplayLabel, placeholderData } from '../stepUtils';

/**
 * Reusable component for rendering CRN cells with additional display fields
 */
const CrnCell = ({ columnName, step, value }) => {
  // Check if this is a standard column or an input field column
  let isInputColumn = false;
  let inputType = null;
  let fieldName = null;
  let options = null;
  let min = null;
  let max = null;
  let stepVal = null;

  // Find the column definition in tableColumns (if it exists)
  if (step.tableColumns) {
    const columnObj = step.tableColumns.find(col => {
      if (typeof col === 'string') {
        return col === columnName;
      } else if (typeof col === 'object') {
        return (col.displayValue || col.label) === columnName;
      }
      return false;
    });

    // If we found the column and it's an input type
    if (columnObj && typeof columnObj === 'object' && columnObj.type === 'input') {
      isInputColumn = true;
      inputType = columnObj.inputType || 'text';
      fieldName = columnObj.value.replace('fields.', '');
      options = columnObj.options;
      min = columnObj.min;
      max = columnObj.max;
      stepVal = columnObj.step;
    }
  }

  // Render input field if this is an input column
  if (isInputColumn) {
    switch (inputType) {
      case 'number':
        return (
          <input
            type="number"
            name={fieldName}
            className="w-full p-1 border border-gray-300 rounded"
            min={min}
            max={max}
            step={stepVal}
            placeholder={`Enter ${columnName}...`}
          />
        );
      case 'radio':
        return (
          <div className="text-left">
            {(options || []).map((option, idx) => (
              <div key={idx} className="mb-1">
                <label className="flex items-center">
                  <input type="radio" name={fieldName} value={option} className="mr-1" />
                  <span>{option}</span>
                </label>
              </div>
            ))}
          </div>
        );
      case 'select':
        return (
          <select name={fieldName} className="w-full p-1 border border-gray-300 rounded">
            <option value="">Select...</option>
            {(options || []).map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <input
            type="checkbox"
            name={fieldName}
            className="h-4 w-4"
          />
        );
      case 'text':
      default:
        return (
          <input
            type="text"
            name={fieldName}
            className="w-full p-1 border border-gray-300 rounded"
            placeholder={`Enter ${columnName}...`}
          />
        );
    }
  }

  // Only apply special rendering for CRN columns
  if (columnName !== 'CRN' && columnName !== 'Course Reference Number' && columnName !== 'CRN Number') {
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
