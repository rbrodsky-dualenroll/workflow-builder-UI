import React from 'react';
import { formatConditionForDisplay } from '../../utils/conditionalUtils';

/**
 * Component for managing workflow conditions
 * This replaces the ScenarioManager component with a simpler interface just for conditions
 */
const WorkflowConditionManager = ({ 
  workflowConditions = {},
  onManageConditions
}) => {
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Workflow Conditions</h2>
        <button 
          onClick={onManageConditions}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
          data-testid="manage-conditions-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Manage Conditions
        </button>
      </div>
      
      {/* Condition list */}
      <div className="mt-3">
        {Object.keys(workflowConditions).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2" data-testid="condition-list">
            {Object.entries(workflowConditions).map(([conditionName, condition]) => (
              <div 
                key={conditionName}
                className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"
                data-testid={`condition-item-${conditionName}`}
              >
                <div className="font-medium text-sm text-gray-800">{conditionName}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {formatConditionForDisplay(condition)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-100 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">No conditions defined</p>
            <p className="text-gray-400 text-xs mt-1">
              Create conditions to make parts of your workflow conditional
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowConditionManager;
