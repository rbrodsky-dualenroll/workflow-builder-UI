import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import WorkflowConditionManager from '../WorkflowConditionManager';
import { formatConditionForDisplay } from '../../../utils/conditionalUtils';
import ConditionalBuilderRefactored from '../../StepForm/sections/conditionals/ConditionalBuilderRefactored';

/**
 * Modal for managing workflow conditions
 */
const ConditionManagerModal = ({ 
  isOpen, 
  onClose, 
  conditions,
  onUpdate,
  usageStats,
  initialCondition = null,
  title = "Manage Workflow Conditions"
}) => {
  // Track if we're adding a new condition from a step
  const [addingNewCondition, setAddingNewCondition] = useState(false);
  const [newConditionName, setNewConditionName] = useState('');
  const [newCondition, setNewCondition] = useState(null);
  
  // When the modal opens with an initial condition, set up for adding it
  useEffect(() => {
    if (isOpen && initialCondition) {
      setAddingNewCondition(true);
      setNewCondition(initialCondition);
      
      // Generate a default name from the condition if possible
      if (initialCondition.method) {
        // Try to extract a reasonable name from the method
        let defaultName = '';
        if (initialCondition.method.includes('_')) {
          // For method names like 'student_age', use the last part
          const parts = initialCondition.method.split('_');
          defaultName = parts[parts.length - 1];
          
          // Add a descriptor based on the comparison
          if (initialCondition.comparison === '>' && initialCondition.value) {
            defaultName = `${defaultName}_above_${initialCondition.value}`;
          } else if (initialCondition.comparison === '<' && initialCondition.value) {
            defaultName = `${defaultName}_below_${initialCondition.value}`;
          } else if (initialCondition.value) {
            defaultName = `${defaultName}_is_${initialCondition.value}`.replace(/\s+/g, '_');
          }
        } else {
          // For simple method names, use the whole name
          defaultName = initialCondition.method;
        }
        
        // Clean up the name
        defaultName = defaultName.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        setNewConditionName(defaultName);
      }
    } else {
      setAddingNewCondition(false);
      setNewConditionName('');
      setNewCondition(null);
    }
  }, [isOpen, initialCondition]);

  // Handle updating workflow conditions
  const handleUpdateConditions = (updatedConditions) => {
    onUpdate(updatedConditions);
    
    // If we were adding a new condition, we can close after update
    if (addingNewCondition) {
      onClose();
    }
  };
  
  // Handle adding the new condition from a step
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={title}
      size="lg"
    >
      {addingNewCondition ? (
        <div className="p-4">
          <h3 className="text-lg font-medium mb-3">Save Condition as Reusable Workflow Condition</h3>
          
          <div className="mb-4">
            <label htmlFor="conditionName" className="block text-sm font-medium text-gray-700 mb-1">
              Condition Name:
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="conditionName"
                value={newConditionName}
                onChange={(e) => setNewConditionName(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="e.g., student_age_above_18"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddNewCondition();
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-md text-sm"
                disabled={!newConditionName.trim()}
              >
                Save Condition
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This name will be used as the workflow field that gets set when the condition is true.
            </p>
          </div>
          
          {/* Condition builder */}
          <div className="mt-4 border border-gray-200 rounded-md p-4 bg-gray-50">
            <h4 className="text-sm font-medium mb-3">Define Condition:</h4>
            <ConditionalBuilderRefactored
              condition={newCondition}
              onUpdate={setNewCondition}
            />
          </div>
          
          {/* Show condition preview */}
          {newCondition && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <h4 className="text-sm font-medium mb-2">Condition Preview:</h4>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                <pre className="whitespace-pre-wrap text-gray-700">
                  {formatConditionForDisplay(newCondition)}
                </pre>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              type="button"
              onClick={() => {
                setAddingNewCondition(false);
                setNewConditionName('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to all conditions
            </button>
          </div>
        </div>
      ) : (
        <WorkflowConditionManager 
          conditions={conditions}
          onUpdate={handleUpdateConditions}
          usageStats={usageStats}
          isModal={true}
        />
      )}
      
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
        <button
          type="button"
          onClick={onClose}
          className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default ConditionManagerModal;
