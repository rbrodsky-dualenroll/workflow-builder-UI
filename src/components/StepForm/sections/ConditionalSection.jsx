import React, { useState, useEffect } from 'react';
import FormField from '../../common/FormField';
import Card from '../../common/Card';
import ConditionSelector from './conditionals/ConditionSelector';
import { parseConditionals, stringifyConditionals, formatConditionalsForDisplay } from '../../../utils/conditionalUtils';

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
  // Parse conditionals from the form data
  const [conditions, setConditions] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [createCustom, setCreateCustom] = useState(false);
  
  // Initialize conditions and selected condition when form data changes
  useEffect(() => {
    if (formData) {
      console.log('Conditional state update:', {
        conditional: formData.conditional,
        triggeringCondition: formData.triggeringCondition,
        workflowCondition: formData.workflowCondition
      });
      
      if (formData.triggeringCondition) {
        setConditions(parseConditionals(formData.triggeringCondition));
      } else {
        setConditions([]);
      }
      
      // Check if this is using a known workflow condition
      setSelectedCondition(formData.workflowCondition || null);
      setCreateCustom(!formData.workflowCondition);
    }
  }, [formData?.conditional, formData?.triggeringCondition, formData?.workflowCondition]);
  
  // Separate effect to handle conditional flag changes
  useEffect(() => {
    if (formData) {
      console.log('Conditional flag changed to:', formData.conditional);
      
      // Reset everything if conditional is false
      if (!formData.conditional) {
        setConditions([]);
        setSelectedCondition(null);
        setCreateCustom(false);
      }
    }
  }, [formData?.conditional]);
  
  // Handle checkbox change specifically
  const handleCheckboxChange = (e) => {
    console.log('Checkbox change:', e.target.checked);
    
    // Directly update formData in parent component
    handleChange({
      target: {
        name: 'conditional',
        value: e.target.checked,
        type: 'checkbox',
        checked: e.target.checked
      }
    });
    
    // If unchecking conditional, clear conditions
    if (!e.target.checked) {
      console.log('Unchecking conditional, clearing conditions');
      setConditions([]);
      setSelectedCondition(null);
      setCreateCustom(false);
      
      // Clear triggering condition
      handleChange({
        target: {
          name: 'triggeringCondition',
          value: '',
          type: 'text'
        }
      });
      
      // Clear workflow condition
      handleChange({
        target: {
          name: 'workflowCondition',
          value: '',
          type: 'text'
        }
      });
    }
  };
  
  // Handle condition selection from workflow conditions
  const handleConditionSelect = (conditionName) => {
    setSelectedCondition(conditionName);
    setCreateCustom(false);
    
    // Update the form data
    handleChange({
      target: {
        name: 'workflowCondition',
        value: conditionName,
        type: 'text'
      }
    });
    
    // Also set the triggeringCondition (needed for backward compatibility)
    handleChange({
      target: {
        name: 'triggeringCondition',
        value: JSON.stringify(workflowConditions[conditionName]),
        type: 'text'
      }
    });
  };
  
  // Handle switching to custom condition mode
  const handleCreateNew = () => {
    setSelectedCondition(null);
    setCreateCustom(true);
    
    // Clear the workflowCondition field
    handleChange({
      target: {
        name: 'workflowCondition',
        value: '',
        type: 'text'
      }
    });
  };
  
  // Handle changes to conditions (rarely used directly now)
  const handleConditionsChange = (newConditions) => {
    setConditions(newConditions);
    
    // Update the form data with stringified conditions
    handleChange({
      target: {
        name: 'triggeringCondition',
        value: stringifyConditionals(newConditions),
        type: 'text'
      }
    });
  };

  // Handle opening the condition builder modal
  const handleOpenConditionBuilder = () => {
    // Create a basic empty condition if none exists
    if (conditions.length === 0) {
      const basicCondition = { 
        method: '', 
        comparison: '==', 
        value: '', 
        fields: [] 
      };
      handleConditionsChange([basicCondition]);
    }
    
    if (onManageWorkflowConditions) {
      onManageWorkflowConditions(conditions[0]);
    }
  };
  
  return (
    <Card className="bg-gray-50 mb-6">
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
      
      <div className="flex items-center mb-4">
        <input
          id="conditional-checkbox"
          name="conditional"
          type="checkbox"
          checked={formData?.conditional || false}
          onChange={handleCheckboxChange}
          className={`h-4 w-4 text-primary focus:ring-primary ${errors?.conditional ? 'border-red-500' : 'border-gray-300'} rounded`}
        />
        <label htmlFor="conditional-checkbox" className="ml-2 text-sm font-medium text-gray-700">
          Is this step conditional?
        </label>
        {errors?.conditional && <p className="text-red-500 text-sm ml-2">{errors.conditional}</p>}
      </div>
      {formData?.conditional && (
        <div className="ml-6 mt-4">
          {/* Condition Selection */}
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-sm font-medium">Choose a Condition Type</h3>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onManageWorkflowConditions(null);
              }}
              className="text-sm underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Manage All Conditions
            </button>
          </div>

          <div className="flex space-x-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={selectedCondition !== null}
                onChange={() => {
                  if (createCustom) {
                    setCreateCustom(false);
                    // Select the first condition by default
                    const firstCondition = Object.keys(workflowConditions)[0];
                    if (firstCondition) {
                      handleConditionSelect(firstCondition);
                    }
                  }
                }}
                className="mr-2"
                disabled={Object.keys(workflowConditions).length === 0}
              />
              <span className={Object.keys(workflowConditions).length === 0 ? "text-gray-400" : ""}>
                Use existing workflow condition
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={createCustom}
                onChange={() => handleCreateNew()}
                className="mr-2"
              />
              <span>Create custom condition</span>
            </label>
          </div>

          {selectedCondition !== null && (
            <ConditionSelector
              workflowConditions={workflowConditions}
              selectedCondition={selectedCondition}
              onSelect={handleConditionSelect}
              onCreateNew={handleCreateNew}
            />
          )}
          
          {createCustom && (
            <div className="mb-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleOpenConditionBuilder();
                }}
                className="mb-4 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded-md text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {conditions.length > 0 ? "Edit Condition" : "Create a New Condition"}
              </button>

              {conditions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <h4 className="text-sm font-medium mb-1 text-blue-800">Currently Defined Condition:</h4>
                  <pre className="text-xs whitespace-pre-wrap text-blue-700">
                    {formatConditionalsForDisplay(conditions)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ConditionalSection;
