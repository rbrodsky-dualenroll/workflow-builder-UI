import React from 'react';
import ConditionalBuilderRefactored from './ConditionalBuilderRefactored';

/**
 * Component for managing a list of conditional rules with 
 * precise Ruby method mappings
 */
const ConditionalList = ({ conditions = [], onChange }) => {
  // Generate a unique name for a new condition based on entity and property
  const generateConditionName = (condition) => {
    if (!condition.entity || !condition.property) return '';
    
    // Create a snake_case name from entity and property
    const entityPart = condition.entity.toLowerCase();
    const propertyPart = condition.property.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    
    return `${entityPart}_${propertyPart}`;
  };
  
  // Add a new empty condition
  const handleAddCondition = () => {
    onChange([
      ...conditions,
      { 
        entity: '', 
        property: '', 
        comparison: 'equals', 
        value: '', 
        fields: [],
        name: ''  // Will be generated when entity/property are set
      }
    ]);
  };
  
  // Update a condition at a specific index
  const handleUpdateCondition = (index, updatedCondition) => {
    const newConditions = [...conditions];
    
    // If entity or property changed, generate a new name
    if ((updatedCondition.entity && updatedCondition.entity !== newConditions[index].entity) ||
        (updatedCondition.property && updatedCondition.property !== newConditions[index].property)) {
      updatedCondition.name = generateConditionName(updatedCondition);
    }
    
    // If fields are empty but entity/property are set, auto-add the condition name as a field
    if (updatedCondition.entity && updatedCondition.property && 
        (!updatedCondition.fields || updatedCondition.fields.length === 0) && 
        updatedCondition.name) {
      updatedCondition.fields = [updatedCondition.name];
    }
    
    newConditions[index] = updatedCondition;
    onChange(newConditions);
  };
  
  // Delete a condition at a specific index
  const handleDeleteCondition = (index) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    onChange(newConditions);
  };
  
  // Migration: convert legacy method-based conditions to entity/property structure
  React.useEffect(() => {
    // Check if any conditions need migration
    const needsMigration = conditions.some(condition => 
      condition.method && (!condition.entity || !condition.property)
    );
    
    if (needsMigration) {
      const migratedConditions = conditions.map(condition => {
        // Skip conditions that already have entity/property
        if (condition.entity && condition.property) return condition;
        
        // Extract entity and property from method if available
        if (condition.method) {
          let entity = '';
          let property = '';
          
          // Try to parse entity_property format
          if (condition.method.includes('_')) {
            const parts = condition.method.split('_');
            entity = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
            property = parts.slice(1).join('_');
          } else {
            // Default to Student entity if we can't determine
            entity = 'Student';
            property = condition.method;
          }
          
          return {
            ...condition,
            entity,
            property,
            name: condition.method
          };
        }
        
        return condition;
      });
      
      onChange(migratedConditions);
    }
  }, [conditions, onChange]);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium">Conditional Rules</h3>
        <button
          type="button"
          onClick={handleAddCondition}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded border border-blue-300 text-sm hover:bg-blue-200"
          data-testid="add-condition-button"
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
          <p>Each condition should have a unique name that will be used in the workflow code.</p>
        </div>
      )}
    </div>
  );
};

export default ConditionalList;
