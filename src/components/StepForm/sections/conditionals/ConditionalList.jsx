import React from 'react';
import ConditionalBuilderRefactored from './ConditionalBuilderRefactored';

/**
 * Component for managing a list of conditional rules
 */
const ConditionalList = ({ conditions = [], onChange }) => {
  // Add a new empty condition
  const handleAddCondition = () => {
    onChange([
      ...conditions,
      { method: '', comparison: '==', value: '', fields: [] }
    ]);
  };
  
  // Update a condition at a specific index
  const handleUpdateCondition = (index, updatedCondition) => {
    const newConditions = [...conditions];
    newConditions[index] = updatedCondition;
    onChange(newConditions);
  };
  
  // Delete a condition at a specific index
  const handleDeleteCondition = (index) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    onChange(newConditions);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium">Conditional Rules</h3>
        <button
          type="button"
          onClick={handleAddCondition}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded border border-blue-300 text-sm hover:bg-blue-200"
        >
          Add Condition
        </button>
      </div>
      
      {conditions.length === 0 && (
        <div className="text-center p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md">
          <p className="text-gray-500 text-sm">No conditional rules defined. Click 'Add Condition' to create one.</p>
        </div>
      )}
      
      {conditions.map((condition, index) => (
        <ConditionalBuilderRefactored
          key={index}
          condition={condition}
          onUpdate={(updatedCondition) => handleUpdateCondition(index, updatedCondition)}
          onDelete={() => handleDeleteCondition(index)}
        />
      ))}
      
      {conditions.length > 0 && (
        <div className="text-xs text-gray-500 mt-2 italic">
          <p>Multiple conditions are evaluated independently. If any condition is true, the associated fields will be set.</p>
        </div>
      )}
    </div>
  );
};

export default ConditionalList;
