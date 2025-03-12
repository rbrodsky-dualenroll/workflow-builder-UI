import React, { useState, useEffect } from 'react';
import FormField from '../../common/FormField';
import CollapsibleCard from '../../common/CollapsibleCard';
import ConditionSelector from './conditionals/ConditionSelector';
import { parseConditionals, stringifyConditionals, formatConditionalsForDisplay, formatConditionForDisplay } from '../../../utils/conditionalUtils';

/**
 * Conditional logic section for step forms
 * Simplified to use the modal for condition creation
 */
const ConditionalSection = ({ 
  formData, 
  handleChange,
  scenarioInfo = null,
  errors = {},
  workflowConditions = {},
  onManageWorkflowConditions
}) => {
  // Configure state for our conditionals
  const [conditions, setConditions] = useState([]);
  
  // Initialize conditions when form data changes
  useEffect(() => {
    if (formData?.triggeringCondition) {
      setConditions(parseConditionals(formData.triggeringCondition));
    } else {
      setConditions([]);
    }
  }, [formData?.triggeringCondition]);
  
  // Handle condition selection from workflow conditions
  const handleConditionSelect = (conditionName) => {
    // Toggle the condition on/off if it's already selected
    const newValue = formData?.workflowCondition === conditionName ? '' : conditionName;
    
    // Update formData with conditional=true and the selected condition
    handleChange({
      target: {
        name: 'conditional',
        value: newValue !== '',
        type: 'checkbox',
        checked: newValue !== ''
      }
    });
    
    // Update the workflowCondition field
    handleChange({
      target: {
        name: 'workflowCondition',
        value: newValue,
        type: 'text'
      }
    });
    
    // Also set the triggeringCondition if a condition is selected (for backward compatibility)
    if (newValue) {
      handleChange({
        target: {
          name: 'triggeringCondition',
          value: JSON.stringify(workflowConditions[newValue]),
          type: 'text'
        }
      });
    } else {
      // Clear the triggering condition if no condition is selected
      handleChange({
        target: {
          name: 'triggeringCondition',
          value: '',
          type: 'text'
        }
      });
    }
  };
  
  return (
    <CollapsibleCard 
      title="Conditionals" 
      className="mb-6" 
      bodyClassName="bg-gray-50"
    >
      {scenarioInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Conditional Scenario: {scenarioInfo.id}</h3>
          <p className="text-xs text-blue-700">This step is part of the "{scenarioInfo.id}" scenario.</p>
          {scenarioInfo.condition && (
            <p className="text-xs text-blue-700 mt-1">
              <span className="font-medium">Scenario condition:</span> {scenarioInfo.condition}
            </p>
          )}
        </div>
      )}
            <div className="mb-4">
        <p className="text-sm mb-4">Select the conditions that must be met for this step to be shown in the workflow:</p>
        
        {/* Display available conditions as checkboxes */}
        {Object.keys(workflowConditions).length > 0 ? (
          <div className="space-y-3 mb-4">
            {Object.entries(workflowConditions).map(([conditionName, condition]) => (
              <div key={conditionName} className="flex items-start">
                <input
                  id={`condition-${conditionName}`}
                  type="checkbox"
                  checked={formData?.workflowCondition === conditionName}
                  onChange={() => handleConditionSelect(conditionName)}
                  className="h-4 w-4 mt-1 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={`condition-${conditionName}`} className="ml-2 block">
                  <div className="font-medium text-sm">{conditionName}</div>
                  <div className="text-xs text-gray-600">
                    {formatConditionForDisplay(condition)}
                  </div>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-100 border border-dashed border-gray-300 rounded-md mb-4 text-center">
            <p className="text-gray-500 text-sm">No workflow conditions available. Create your first condition below.</p>
          </div>
        )}
        
        {/* Add New Condition button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            // Create a new empty condition that will be populated in the modal
            const newCondition = { 
              entity: '', 
              property: '', 
              comparison: '==', 
              value: '', 
              fields: [] 
            };
            onManageWorkflowConditions(newCondition);
          }}
          className="w-full px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-md text-sm flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Condition
        </button>
      </div>
    </CollapsibleCard>
  );
};

export default ConditionalSection;
