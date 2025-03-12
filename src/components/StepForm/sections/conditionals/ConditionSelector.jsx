import React from 'react';
import { formatConditionForDisplay } from '../../../../utils/conditionalUtils';

/**
 * Component for selecting an existing workflow condition
 */
const ConditionSelector = ({ 
  workflowConditions = {}, 
  selectedCondition = null,
  onSelect,
  onCreateNew
}) => {
  const handleConditionSelect = (conditionName) => {
    onSelect(conditionName);
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Select a Condition</h3>
      
      {Object.keys(workflowConditions).length > 0 ? (
        <div className="space-y-2 mb-4">
          {Object.entries(workflowConditions).map(([conditionName, condition]) => (
            <div 
              key={conditionName}
              className={`p-3 border rounded-md cursor-pointer ${
                selectedCondition === conditionName
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleConditionSelect(conditionName)}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-2 flex-shrink-0 ${
                  selectedCondition === conditionName
                    ? 'bg-primary-500'
                    : 'border border-gray-300'
                }`}>
                  {selectedCondition === conditionName && (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-medium">{conditionName}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {formatConditionForDisplay(condition)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md mb-4 text-center">
          <p className="text-gray-500 text-sm">No workflow conditions available.</p>
        </div>
      )}
      
      <button
        type="button"
        onClick={onCreateNew}
        className="text-primary hover:text-primary-600 text-sm flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Create a new condition
      </button>
    </div>
  );
};

export default ConditionSelector;
