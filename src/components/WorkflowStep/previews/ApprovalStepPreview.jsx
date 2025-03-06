import React from 'react';
import PreviewContainer from './PreviewContainer';
import { placeholderData } from '../stepUtils';

/**
 * Preview for approval steps
 */
const ApprovalStepPreview = ({ step }) => {
  // Get column names from the step or use defaults
  const columnNames = step.tableColumns || ['Student Name', 'Course Number', 'CRN', 'Instructor'];
  
  return (
    <PreviewContainer step={step}>
      {/* Information Table */}
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {/* Action column with no header */}
              <th className="bg-gray-600 p-2"></th>
              
              {/* Dynamic column headers */}
              {columnNames.map((column, index) => (
                <th key={index} className="bg-gray-600 text-white p-2 font-medium text-center border border-gray-700">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {/* Action buttons column */}
              <td className="p-3 border border-gray-300 bg-gray-100 align-top" style={{minWidth: '120px'}}>
                {/* Action Options as Radio Buttons */}
                <div className="space-y-2">
                  {step.actionOptions && step.actionOptions.length > 0 ? (
                    step.actionOptions.map((option, idx) => (
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
                    ))
                  ) : (
                    <div className="flex items-center">
                      <input type="radio" id="approve" name="actionOption" className="h-4 w-4" />
                      <label htmlFor="approve" className="ml-2 text-sm">Approve</label>
                    </div>
                  )}
                </div>
              </td>
              
              {/* Dynamic data cells */}
              {columnNames.map((column, index) => (
                <td key={index} className="p-3 text-center border border-gray-300 bg-gray-100">
                  {placeholderData[column] || `Sample ${column}`}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </PreviewContainer>
  );
};

export default ApprovalStepPreview;
