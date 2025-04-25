import React, { useState, useEffect } from 'react';
import PreviewContainer from './PreviewContainer';
import CrnCell from './CrnCell';
import { placeholderData } from '../stepUtils';

/**
 * Preview for approval steps
 */
const ApprovalStepPreview = ({ step }) => {
  // Get column names from the step or use defaults
  const columnNames = step.tableColumns || ['Student Name', 'Course Number', 'CRN', 'Instructor'];
  
  // State to track the selected action option
  const [selectedOption, setSelectedOption] = useState(null);
  // State to track if a comment is required based on the selected option
  const [commentRequired, setCommentRequired] = useState(false);
  
  // Find the selected option from step.actionOptions
  const selectedActionOption = selectedOption !== null && step.actionOptions ? 
    step.actionOptions[selectedOption] : null;
    
  // Update comment requirement when action option changes
  useEffect(() => {
    if (!selectedActionOption) {
      setCommentRequired(false);
      return;
    }
    
    // Comments are always required for terminating actions
    if (selectedActionOption.terminates_workflow || 
        selectedActionOption.canTerminate || 
        selectedActionOption.value === 'no') {
      setCommentRequired(true);
      return;
    }
    
    // Comments are never required for Defer actions
    if (selectedActionOption.value === 'defer') {
      setCommentRequired(false);
      return;
    }
    
    // For all other actions, comments are required if the step has comments.required = true
    setCommentRequired(step.comments?.required || false);
  }, [selectedOption, selectedActionOption, step.comments]);
  
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
                      <div key={idx} className="flex flex-col">
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id={`option-${idx}`} 
                            name="actionOption" 
                            className={`h-4 w-4 ${(option.terminates_workflow || option.canTerminate || option.value === 'no') ? 'text-red-500' : ''}`}
                            checked={selectedOption === idx}
                            onChange={() => setSelectedOption(idx)}
                            data-testid={`approval-option-radio-${idx}`}
                          />
                          <label htmlFor={`option-${idx}`} className={`ml-2 text-sm ${(option.terminates_workflow || option.canTerminate || option.value === 'no') ? 'text-red-600 font-medium' : ''}`}>
                            {option.label}
                            {(option.terminates_workflow || option.canTerminate || option.value === 'no') && (
                              <span className="ml-1 text-xs">(Terminates workflow)</span>
                            )}
                          </label>
                        </div>
                        {selectedOption === idx && option.requiresAdditionalInfo && (
                          <div className="mt-2 ml-6">
                            <label htmlFor={`additional-info-${idx}`} className="block text-sm text-gray-600 mb-1">
                              {option.additionalInfoLabel || 'Additional Information'}
                            </label>
                            <input
                              type="text"
                              id={`additional-info-${idx}`}
                              className="w-full text-sm p-1 border border-gray-300 rounded"
                              placeholder={`Enter ${option.additionalInfoLabel || 'additional information'}...`}
                              data-testid={`approval-option-additional-info-input-${idx}`}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="approve" 
                        name="actionOption" 
                        className="h-4 w-4" 
                        checked={selectedOption === 0}
                        onChange={() => setSelectedOption(0)}
                        data-testid="approval-option-radio-default"
                      />
                      <label htmlFor="approve" className="ml-2 text-sm">Approve</label>
                    </div>
                  )}
                </div>
              </td>
              
              {/* Dynamic data cells */}
              {columnNames.map((column, index) => (
                <td key={index} className="p-3 text-center border border-gray-300 bg-gray-100">
                  <CrnCell 
                    columnName={column} 
                    step={step} 
                    value={placeholderData[column] || `Sample ${column}`} 
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comment field */}
      {selectedOption !== null && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Comments
              {commentRequired && (
                <span className="ml-1 text-xs text-red-600 font-normal">
                  {(selectedActionOption?.terminates_workflow || 
                   selectedActionOption?.canTerminate || 
                   selectedActionOption?.value === 'no') 
                    ? "(Required for workflow termination)" 
                    : "(Required)"
                  }
                </span>
              )}
            </label>
          </div>
          <textarea
            className={`w-full border ${commentRequired ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md p-2 text-sm`}
            placeholder={commentRequired ? "Comment required for this action" : "Add optional comment..."}
            rows="3"
          />
        </div>
      )}
    </PreviewContainer>
  );
};

export default ApprovalStepPreview;