import React, { useState } from 'react';
import Card from '../common/Card';
import { formatConditionForDisplay } from '../../utils/conditionalUtils';
import ConditionalBuilderRefactored from '../StepForm/sections/conditionals/ConditionalBuilderRefactored';

/**
 * Component for managing workflow-level conditions that can be reused across steps
 */
const WorkflowConditionManager = ({ 
  conditions = {}, 
  onUpdate,
  usageStats = {}, // Maps condition names to step IDs using them
  isModal = false
}) => {
  const [isAddingCondition, setIsAddingCondition] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);
  const [newConditionName, setNewConditionName] = useState('');
  const [newCondition, setNewCondition] = useState({ method: '', comparison: '==', value: '', fields: [] });
  
  // Handle adding a new condition
  const handleAddCondition = () => {
    if (!newConditionName.trim()) return;
    
    // Update the workflow conditions
    const updatedConditions = {
      ...conditions,
      [newConditionName.trim()]: {
        ...newCondition,
        fields: [newConditionName.trim()] // The condition name itself is the field to set
      }
    };
    
    onUpdate(updatedConditions);
    
    // Reset form
    setNewConditionName('');
    setNewCondition({ method: '', comparison: '==', value: '', fields: [] });
    setIsAddingCondition(false);
  };
  
  // Handle updating an existing condition
  const handleUpdateCondition = () => {
    if (!editingCondition) return;
    
    // Update the condition in the workflow conditions
    const updatedConditions = {
      ...conditions
    };
    
    // Keep the fields as-is since they match the condition name
    updatedConditions[editingCondition] = newCondition;
    
    onUpdate(updatedConditions);
    
    // Reset form
    setNewCondition({ method: '', comparison: '==', value: '', fields: [] });
    setEditingCondition(null);
  };
  
  // Handle editing an existing condition
  const handleEditCondition = (conditionName) => {
    setNewCondition(conditions[conditionName]);
    setEditingCondition(conditionName);
  };
  
  // Handle deleting a condition
  const handleDeleteCondition = (conditionName) => {
    const isUsed = usageStats[conditionName] && usageStats[conditionName].length > 0;
    
    if (isUsed) {
      // Show confirmation dialog if condition is in use
      if (!window.confirm(`This condition is used by ${usageStats[conditionName].length} step(s). Are you sure you want to delete it? Steps using this condition will no longer work properly.`)) {
        return;
      }
    }
    
    // Create new object without the deleted condition
    const updatedConditions = {...conditions};
    delete updatedConditions[conditionName];
    
    onUpdate(updatedConditions);
  };
  
  const renderContent = () => (
    <>
      <p className="text-sm text-gray-600 mb-4">
        Conditions defined here can be reused across multiple steps in your workflow. 
        Each condition is automatically associated with a workflow field of the same name.
      </p>
      
      {/* List of existing conditions */}
      {Object.keys(conditions).length > 0 ? (
        <div className="mb-6 space-y-4">
          {Object.entries(conditions).map(([conditionName, condition]) => {
            const isUsed = usageStats[conditionName] && usageStats[conditionName].length > 0;
            
            return (
              <div 
                key={conditionName}
                className="border border-gray-200 rounded-md p-3 bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-primary">{conditionName}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatConditionForDisplay(condition)}
                    </div>
                    
                    {isUsed && (
                      <div className="mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Used in {usageStats[conditionName].length} step{usageStats[conditionName].length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEditCondition(conditionName)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="Edit condition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCondition(conditionName)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete condition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-300 rounded-md mb-6">
          <p className="text-gray-500">No conditions defined yet. Create your first condition to get started.</p>
        </div>
      )}
      
      {/* Add/Edit condition form */}
      {(isAddingCondition || editingCondition) ? (
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-3">
            {editingCondition ? `Edit Condition: ${editingCondition}` : 'Add New Condition'}
          </h3>
          
          {!editingCondition && (
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
                placeholder="e.g., needs_immunization, high_school_location, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will be used as the workflow field that gets set when the condition is true.
              </p>
            </div>
          )}
          
          <ConditionalBuilderRefactored
            condition={newCondition}
            onUpdate={setNewCondition}
          />
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddingCondition(false);
                setEditingCondition(null);
                setNewConditionName('');
                setNewCondition({ method: '', comparison: '==', value: '', fields: [] });
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editingCondition ? handleUpdateCondition() : handleAddCondition();
              }}
              className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-md text-sm"
              disabled={!editingCondition && !newConditionName.trim()}
            >
              {editingCondition ? 'Update Condition' : 'Add Condition'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingCondition(true)}
          className="w-full border rounded-md p-3 flex items-center justify-center bg-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Condition
        </button>
      )}
    </>
  );
  
  // Render either as a card or directly (for modal view)
  if (isModal) {
    return <div className="p-4">{renderContent()}</div>;
  } else {
    return (
      <Card title="Workflow Conditions" className="mb-6">
        <div className="p-4">
          {renderContent()}
        </div>
      </Card>
    );
  }
};

export default WorkflowConditionManager;
