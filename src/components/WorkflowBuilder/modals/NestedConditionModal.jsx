import React, { useState, useEffect } from 'react';
import { formatConditionForDisplay } from '../../../utils/conditionalUtils';
import ConditionalBuilderRefactored from '../../StepForm/sections/conditionals/ConditionalBuilderRefactored';

/**
 * A special version of the Condition Manager that's designed to work 
 * directly within the Scenario Modal without using a separate Modal component
 */
const NestedConditionModal = ({ 
  isOpen, 
  onClose, 
  conditions = {},
  onUpdate,
  initialCondition = null,
  title = "Add New Condition"
}) => {
  // State for the new condition
  const [newConditionName, setNewConditionName] = useState('');
  const [newCondition, setNewCondition] = useState({ 
    entity: '', 
    property: '', 
    comparison: '', 
    value: '', 
    fields: [] 
  });
  
  // When the modal opens with an initial condition, use it
  useEffect(() => {
    if (isOpen && initialCondition) {
      setNewCondition(initialCondition);
      
      // Generate a default name from the entity and property if available
      if (initialCondition.entity && initialCondition.property) {
        const defaultName = `${initialCondition.entity}_${initialCondition.property}`;
        setNewConditionName(defaultName);
      } else if (initialCondition.method) {
        // Fallback to method for backward compatibility
        setNewConditionName(initialCondition.method);
      }
    } else if (!isOpen) {
      // Reset form when modal closes
      setNewConditionName('');
      setNewCondition({ 
        entity: '', 
        property: '', 
        comparison: '', 
        value: '', 
        fields: [] 
      });
    }
  }, [isOpen, initialCondition]);
  
  // Handle adding the new condition
  const handleAddNewCondition = () => {
    if (!newConditionName.trim() || !newCondition) return;
    
    // Create a copy of the condition with the new name as the field
    const conditionWithField = {
      ...newCondition,
      fields: [newConditionName.trim()]
    };
    
    // Add it to existing conditions
    const updatedConditions = {
      ...conditions,
      [newConditionName.trim()]: conditionWithField
    };
    
    onUpdate(updatedConditions);
    onClose();
  };

  // Check if condition is valid for saving
  const isValidCondition = newConditionName.trim() && 
    newCondition.entity && 
    newCondition.property && 
    newCondition.comparison;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200]" data-testid="nested-modal">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="bg-white rounded-lg max-w-3xl w-5/6 max-h-[90vh] overflow-y-auto z-[201] relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 p-6 pb-4">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <button 
            onClick={onClose}
            className=""
            aria-label="Close modal"
            data-testid="nested-modal-close-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          {/* Condition Name */}
          <div className="mb-4">
            <label htmlFor="conditionName" className="block text-sm font-medium text-gray-700 mb-1">
              Condition Name:
            </label>
            <input
              type="text"
              id="conditionName"
              value={newConditionName}
              onChange={(e) => setNewConditionName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="e.g., student_above_18, high_school_payment_policy"
              data-testid="condition-name-input"
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will be used as the workflow field that gets set when the condition is true.
            </p>
          </div>
          
          {/* Condition Builder Form */}
          <ConditionalBuilderRefactored
            condition={newCondition}
            onUpdate={setNewCondition}
          />
        </div>
        
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-col rounded-b-lg border-t border-gray-200">
          <div className="sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleAddNewCondition();
              }}
              className={`px-4 py-2 ${isValidCondition ? 'bg-primary hover:bg-primary-600' : 'bg-gray-300 cursor-not-allowed'} text-white rounded-md text-sm ml-2`}
              disabled={!isValidCondition}
              data-testid="save-condition-button"
            >
              Save Condition
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              data-testid="cancel-condition-button"
            >
              Cancel
            </button>
          </div>
          {!isValidCondition && (
            <div className="mt-2 text-xs text-red-600">
              {!newConditionName.trim() ? 'Please provide a condition name. ' : ''}
              {!newCondition.entity ? 'Please select an entity. ' : ''}
              {!newCondition.property ? 'Please select a property. ' : ''}
              {!newCondition.comparison ? 'Please select a comparison. ' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NestedConditionModal;