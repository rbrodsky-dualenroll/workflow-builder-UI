import React from 'react';
import PreviewContainer from './PreviewContainer';
import { placeholderData } from '../stepUtils';

/**
 * Preview for check holds steps
 */
const CheckHoldsStepPreview = ({ step }) => {
  // Get the column names from the step or use defaults
  const columnNames = step.tableColumns || ['Hold Names', 'Messages', 'Student Name', 'Section', 'Grade'];
  
  return (
    <PreviewContainer step={step}>
      <div className="bg-gray-50 border border-gray-300 rounded-md p-4 mb-4">
        <h4 className="font-medium mb-2">Student Hold Check</h4>
        <p className="text-sm text-gray-700 mb-4">
          This student has the following holds: {'{HOLDS LISTED}'}
        </p>
        
        {/* Table with header column and data column */}
        <div className="mb-4">
          {/* Action buttons */}
          <div className="mb-2">
            <div className="bg-gray-100 p-3 rounded-md">
              <div className="flex items-center mb-2">
                <input type="radio" id="proceed" name="holdAction" className="h-4 w-4" />
                <label htmlFor="proceed" className="ml-2 text-sm">Proceed Anyway</label>
              </div>
              <div className="flex items-center">
                <input type="radio" id="retry" name="holdAction" className="h-4 w-4" />
                <label htmlFor="retry" className="ml-2 text-sm">Retry</label>
              </div>
            </div>
          </div>

          {/* Header row */}
          <div className="bg-gray-600 p-2 text-white font-medium text-center mb-px">
            {columnNames[0] || 'Hold Names'}
          </div>
          
          {/* Data row 1 */}
          <div className="bg-gray-100 p-3 text-center mb-2">
            {placeholderData[columnNames[0]] || `Financial Hold, Orientation Required`}
          </div>
          
          {/* Additional column pairs */}
          {columnNames.slice(1).map((column, index) => (
            <div key={index}>
              <div className="bg-gray-600 p-2 text-white font-medium text-center mb-px">
                {column}
              </div>
              <div className="bg-gray-100 p-3 text-center mb-2">
                {placeholderData[column] || `Sample ${column}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PreviewContainer>
  );
};

export default CheckHoldsStepPreview;
