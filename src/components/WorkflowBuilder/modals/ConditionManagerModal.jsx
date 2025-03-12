import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { formatConditionForDisplay } from '../../../utils/conditionalUtils';
import ConditionalBuilderRefactored from '../../StepForm/sections/conditionals/ConditionalBuilderRefactored';

/**
 * Modal for creating a new workflow condition
 * Streamlined to show the form directly
 */
const ConditionManagerModal = ({ 
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
    comparison: '==', 
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
        comparison: '==', 
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
    newCondition.property;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
      size="lg"
    >
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
        
        {/* Preview section (optional) */}
        {newCondition.entity && newCondition.property && (
          <div className="mt-3 border-t border-gray-200 pt-3">
            <h4 className="text-sm font-medium mb-2">Condition Preview:</h4>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
              <pre className="whitespace-pre-wrap text-blue-700">
                {formatConditionForDisplay(newCondition)}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg border-t border-gray-200">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleAddNewCondition();
          }}
          className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-md text-sm ml-2"
          disabled={!isValidCondition}
        >
          Save Condition
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ConditionManagerModal;
