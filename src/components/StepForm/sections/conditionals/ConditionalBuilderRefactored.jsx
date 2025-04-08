import React, { useState, useEffect } from 'react';
import FormField from '../../../common/FormField';

/**
 * User-friendly component for building conditional rules
 * Focuses on entity/property selection rather than method names
 */
const ConditionalBuilderRefactored = ({ 
  condition = { entity: '', property: '', comparison: '', value: '', fields: [] },
  onUpdate,
  onDelete
}) => {
  const [localCondition, setLocalCondition] = useState(condition);
  const [showCustomProperty, setShowCustomProperty] = useState(false);
  const [customProperty, setCustomProperty] = useState('');
  
  // Available entities to check - updated to match documentation
  const entityOptions = [
    { value: '', label: '-- Select an entity --' },
    { value: 'Course', label: 'Course' },
    { value: 'Student', label: 'Student' },
    { value: 'HighSchool', label: 'High School' },
    { value: 'Instructor', label: 'Instructor' },
    { value: 'Step', label: 'Step' }
  ];
  
  // Properties available for each entity type - updated to match documentation
  const propertyOptions = {
    Course: [
      { value: 'subject', label: 'Subject' },
      { value: 'department', label: 'Department' },
      { value: 'courseNumber', label: 'Course Number' },
      { value: 'title', label: 'Title' },
      { value: 'category', label: 'Category' },
      { value: 'custom', label: 'Custom property...' }
    ],
    Student: [
      { value: 'gradeLevel', label: 'Grade Level' },
      { value: 'age', label: 'Age' },
      { value: 'program', label: 'Program' },
      { value: 'highSchool', label: 'High School' },
      { value: 'gpa', label: 'GPA' },
      { value: 'custom', label: 'Custom property...' }
    ],
    HighSchool: [
      { value: 'name', label: 'Name' },
      { value: 'type', label: 'Type' },
      { value: 'district', label: 'District' },
      { value: 'custom', label: 'Custom property...' }
    ],
    Instructor: [
      { value: 'name', label: 'Name' },
      { value: 'department', label: 'Department' },
      { value: 'highSchool', label: 'High School' },
      { value: 'experience', label: 'Years of Experience' },
      { value: 'custom', label: 'Custom property...' }
    ],
    Step: [
      { value: 'status', label: 'Status' },
      { value: 'action', label: 'Action' },
      { value: 'comment', label: 'Comment' },
      { value: 'custom', label: 'Custom property...' }
    ]
  };
  
  // Available comparison operators - updated to match documentation
  const comparisonOptions = [
    { value: '', label: '-- Select a comparison --' },
    { value: 'equals', label: 'equals' },
    { value: 'not-equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'not-contains', label: 'does not contain' },
    { value: 'starts-with', label: 'starts with' },
    { value: 'ends-with', label: 'ends with' },
    { value: 'gt', label: 'greater than' },
    { value: 'lt', label: 'less than' },
    { value: 'gte', label: 'greater than or equal to' },
    { value: 'lte', label: 'less than or equal to' },
    { value: 'is-set', label: 'is set' },
    { value: 'is-not-set', label: 'is not set' }
  ];
  
  // Initialize state from props and update when props change
  useEffect(() => {
    setLocalCondition(condition);
    
    // Check if the property is not in the predefined list, treat it as custom
    if (condition.entity && condition.property) {
      const entityProps = propertyOptions[condition.entity] || [];
      const isCustom = !entityProps.some(prop => prop.value === condition.property);
      setShowCustomProperty(isCustom);
      if (isCustom) {
        setCustomProperty(condition.property);
      }
    }
  }, [condition]);
  
  // Handle entity change
  const handleEntityChange = (e) => {
    const newEntity = e.target.value;
    
    const updatedCondition = {
      ...localCondition,
      entity: newEntity,
      property: '' // Reset property when entity changes
    };
    
    setLocalCondition(updatedCondition);
    setShowCustomProperty(false);
    setCustomProperty('');
    
    if (onUpdate) {
      onUpdate(updatedCondition);
    }
  };
  
  // Handle property selection change
  const handlePropertyChange = (e) => {
    const value = e.target.value;
    
    // Check if custom property is selected
    if (value === 'custom') {
      setShowCustomProperty(true);
      
      // Don't update condition yet, wait for custom property input
      const updatedCondition = {
        ...localCondition,
        property: '' // Temporarily clear property until custom value is entered
      };
      
      setLocalCondition(updatedCondition);
      return;
    }
    
    // Normal property selection
    setShowCustomProperty(false);
    setCustomProperty('');
    
    const updatedCondition = {
      ...localCondition,
      property: value
    };
    
    setLocalCondition(updatedCondition);
    
    if (onUpdate) {
      onUpdate(updatedCondition);
    }
  };
  
  // Handle custom property input change
  const handleCustomPropertyChange = (e) => {
    const value = e.target.value;
    setCustomProperty(value);
    
    const updatedCondition = {
      ...localCondition,
      property: value
    };
    
    setLocalCondition(updatedCondition);
    
    if (onUpdate) {
      onUpdate(updatedCondition);
    }
  };
  
  // Handle generic changes to any field
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const updatedCondition = {
      ...localCondition,
      [name]: value
    };
    
    setLocalCondition(updatedCondition);
    
    if (onUpdate) {
      onUpdate(updatedCondition);
    }
  };
  
  // Handle changes to the fields array (comma-separated values)
  const handleFieldsChange = (e) => {
    const fieldsString = e.target.value;
    const fieldsArray = fieldsString.split(',')
      .map(field => field.trim())
      .filter(field => field !== '');
    
    const updatedCondition = {
      ...localCondition,
      fields: fieldsArray
    };
    
    setLocalCondition(updatedCondition);
    
    if (onUpdate) {
      onUpdate(updatedCondition);
    }
  };
  
  // Check if value field should be disabled based on comparison type
  const isValueDisabled = ['is-set', 'is-not-set'].includes(localCondition.comparison);
  
  // Get property options for current entity
  const getPropertyOptions = () => {
    if (!localCondition.entity) return [{ value: '', label: '-- Select entity first --' }];
    
    const options = propertyOptions[localCondition.entity] || [];
    return [
      { value: '', label: '-- Select entity first --' }, 
      ...options
    ];
  };
  
  const currentPropertyOptions = getPropertyOptions();
  
  // Generate the human-readable description of the condition
  const getConditionDescription = () => {
    if (!localCondition.entity && !localCondition.property) return 'Set up your condition above';
    
    let entityLabel = entityOptions.find(e => e.value === localCondition.entity)?.label || localCondition.entity;
    let propertyLabel = '';
    
    if (localCondition.entity && localCondition.property) {
      if (showCustomProperty) {
        propertyLabel = customProperty;
      } else {
        const entityProps = propertyOptions[localCondition.entity] || [];
        propertyLabel = entityProps.find(p => p.value === localCondition.property)?.label || localCondition.property;
      }
    } else if (localCondition.property) {
      propertyLabel = localCondition.property;
    }
    
    let comparisonLabel = comparisonOptions.find(c => c.value === localCondition.comparison)?.label || localCondition.comparison;
    comparisonLabel = comparisonLabel.replace(/\s*\([^)]*\)/g, ''); // Remove parentheses content
    
    let result = `When ${entityLabel}'s ${propertyLabel} ${comparisonLabel}`;
    
    if (!isValueDisabled && localCondition.value) {
      result += ` "${localCondition.value}"`;
    }
    
    if (localCondition.fields && localCondition.fields.length > 0) {
      result += `, set field${localCondition.fields.length > 1 ? 's' : ''}: ${localCondition.fields.join(', ')}`;
    }
    
    return result;
  };
  
  return (
    <div className="border border-gray-200 rounded-md bg-gray-50 mb-4">
      {/* Condition description */}
      <div className="mb-4 p-2 bg-blue-50 border-b border-blue-200 text-sm text-blue-800">
        {getConditionDescription()}
      </div>
      
      <div className="grid grid-cols-1 gap-3 p-4 pt-0">
        {/* Entity and Property Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Entity"
            name="entity"
            type="select"
            value={localCondition.entity || ''}
            onChange={handleEntityChange}
            options={entityOptions}
            placeholder="Select entity type"
            data-testid="scenario-condition-entity-select"
          />
          
          <div>
            <FormField
              label="Property"
              name="property"
              type="select"
              value={showCustomProperty ? 'custom' : (localCondition.property || '')}
              onChange={handlePropertyChange}
              options={currentPropertyOptions}
              disabled={!localCondition.entity}
              data-testid="scenario-condition-property-select"
            />
            
            {showCustomProperty && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customProperty}
                  onChange={handleCustomPropertyChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter custom property"
                  data-testid="scenario-condition-custom-property-input"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Comparison and Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Comparison"
            name="comparison"
            type="select"
            value={localCondition.comparison}
            onChange={handleChange}
            options={comparisonOptions}
            data-testid="scenario-condition-comparison-select"
          />
          
          <FormField
            label="Value"
            name="value"
            type="text"
            value={localCondition.value || ''}
            onChange={handleChange}
            disabled={isValueDisabled}
            placeholder={isValueDisabled ? "Not needed" : "e.g., High School, 18, 3.0"}
            helpText={isValueDisabled ? 'Not needed for this comparison' : null}
            data-testid="scenario-condition-value-input"
          />
        </div>
      </div>
    </div>
  );
};

export default ConditionalBuilderRefactored;
