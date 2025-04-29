import React, { useState, useEffect } from 'react';
import FormField from '../../../common/FormField';

/**
 * User-friendly component for building conditional rules
 * Uses precise entity/property mappings that match actual Ruby methods
 */
const ConditionalBuilderRefactored = ({ 
  condition = { entity: '', property: '', comparison: '', value: '', fields: [] },
  onUpdate,
  onDelete
}) => {
  const [localCondition, setLocalCondition] = useState(condition);
  const [showCustomProperty, setShowCustomProperty] = useState(false);
  const [customProperty, setCustomProperty] = useState('');
  
  // Available entities with names that match the Ruby variables
  const entityOptions = [
    { value: '', label: '-- Select an entity --' },
    { value: 'Course', label: 'Course' },
    { value: 'CourseSection', label: 'Course Section' },
    { value: 'Student', label: 'Student' },
    { value: 'HighSchool', label: 'High School' },
    { value: 'Instructor', label: 'Instructor' },
    { value: 'Term', label: 'Term' },
    { value: 'College', label: 'College' }
  ];
  
  // Properties mapped to their actual Ruby method names
  const propertyOptions = {
    Course: [
      { value: 'has_requisites', label: 'Has Prerequisites', rubyMethod: 'has_requisites?' },
      { value: 'has_course_category', label: 'Has Course Category', rubyMethod: 'has_course_category?' },
      { value: 'title', label: 'Title', rubyMethod: 'title' },
      { value: 'number', label: 'Course Number', rubyMethod: 'number' },
      { value: 'subject', label: 'Subject', rubyMethod: 'subject' },
      { value: 'department', label: 'Department', rubyMethod: 'department' },
      { value: 'credits', label: 'Credits', rubyMethod: 'credits' },
      { value: 'custom', label: 'Custom property...' }
    ],
    CourseSection: [
      { value: 'is_full', label: 'Is Full', rubyMethod: 'is_full?' },
      { value: 'is_wish_list', label: 'Is Wish List', rubyMethod: 'is_wish_list?' },
      { value: 'location', label: 'Location', rubyMethod: 'location' },
      { value: 'number', label: 'Section Number', rubyMethod: 'number' },
      { value: 'capacity', label: 'Capacity', rubyMethod: 'capacity' },
      { value: 'enrollment_count', label: 'Enrollment Count', rubyMethod: 'enrollment_count' },
      { value: 'custom', label: 'Custom property...' }
    ],
    Student: [
      { value: 'is_minor', label: 'Is Minor', rubyMethod: 'is_minor?' },
      { value: 'has_parent_consent', label: 'Has Parent Consent', rubyMethod: 'has_parent_consent?' },
      { value: 'name', label: 'Name', rubyMethod: 'name' },
      { value: 'display_name', label: 'Display Name', rubyMethod: 'display_name' },
      { value: 'email', label: 'Email', rubyMethod: 'email' },
      { value: 'age', label: 'Age', rubyMethod: 'age' },
      { value: 'grade', label: 'Grade Level', rubyMethod: 'grade' },
      { value: 'has_student_number', label: 'Has Student Number', rubyMethod: 'has_student_number?' },
      { value: 'custom', label: 'Custom property...' }
    ],
    HighSchool: [
      { value: 'is_home_school', label: 'Is Home School', rubyMethod: 'is_home_school?' },
      { value: 'is_non_partner', label: 'Is Non-Partner', rubyMethod: 'is_non_partner?(college)' },
      { value: 'name', label: 'Name', rubyMethod: 'name' },
      { value: 'type', label: 'Type', rubyMethod: 'type' },
      { value: 'city', label: 'City', rubyMethod: 'city' },
      { value: 'state', label: 'State', rubyMethod: 'state' },
      { value: 'custom', label: 'Custom property...' }
    ],
    Instructor: [
      { value: 'name', label: 'Name', rubyMethod: 'name' },
      { value: 'email', label: 'Email', rubyMethod: 'email' },
      { value: 'highest_degree', label: 'Highest Degree', rubyMethod: 'highest_degree' },
      { value: 'custom', label: 'Custom property...' }
    ],
    Term: [
      { value: 'name', label: 'Name', rubyMethod: 'name' },
      { value: 'start_date', label: 'Start Date', rubyMethod: 'start_date' },
      { value: 'end_date', label: 'End Date', rubyMethod: 'end_date' },
      { value: 'custom', label: 'Custom property...' }
    ],
    College: [
      { value: 'name', label: 'Name', rubyMethod: 'name' },
      { value: 'city', label: 'City', rubyMethod: 'city' },
      { value: 'state', label: 'State', rubyMethod: 'state' },
      { value: 'custom', label: 'Custom property...' }
    ]
  };
  
  // Comparison operators mapped to Ruby syntax
  const comparisonOptions = [
    { value: '', label: '-- Select a comparison --' },
    { value: 'equals', label: 'equals', rubyOperator: '==' },
    { value: 'not-equals', label: 'does not equal', rubyOperator: '!=' },
    { value: 'contains', label: 'contains', rubyOperator: 'include?' },
    { value: 'not-contains', label: 'does not contain', rubyOperator: '!include?' },
    { value: 'greater-than', label: 'greater than', rubyOperator: '>' },
    { value: 'less-than', label: 'less than', rubyOperator: '<' },
    { value: 'greater-than-or-equal', label: 'greater than or equal to', rubyOperator: '>=' },
    { value: 'less-than-or-equal', label: 'less than or equal to', rubyOperator: '<=' },
    { value: 'present', label: 'is present', rubyOperator: 'present?' },
    { value: 'blank', label: 'is blank', rubyOperator: 'blank?' }
  ];
  
  // Common field values that map to actual DualEnroll application fields
  const commonFieldValues = [
    'home_school',
    'non_partner',
    'has_prereqs',
    'high_school',
    'hs_student',
    'parent_consent_required',
    'parent_consent_provided',
    'wish_list',
    'requires_transcript',
    'no_parent_email',
    'sections_released',
    'sections_released_yes'
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
    
    // Find the selected property option to get the Ruby method name
    const entityProps = propertyOptions[localCondition.entity] || [];
    const selectedProp = entityProps.find(prop => prop.value === value);
    
    const updatedCondition = {
      ...localCondition,
      property: value,
      rubyMethod: selectedProp?.rubyMethod
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
      property: value,
      rubyMethod: value + (value.endsWith('?') ? '' : '') // Preserve method syntax
    };
    
    setLocalCondition(updatedCondition);
    
    if (onUpdate) {
      onUpdate(updatedCondition);
    }
  };
  
  // Handle generic changes to any field
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If changing comparison, find the Ruby operator
    let updatedValues = { [name]: value };
    if (name === 'comparison') {
      const selectedComparison = comparisonOptions.find(comp => comp.value === value);
      updatedValues.rubyOperator = selectedComparison?.rubyOperator;
    }
    
    const updatedCondition = {
      ...localCondition,
      ...updatedValues
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
  const isValueDisabled = ['present', 'blank'].includes(localCondition.comparison);
  
  // Get property options for current entity
  const getPropertyOptions = () => {
    if (!localCondition.entity) return [{ value: '', label: '-- Select entity first --' }];
    
    const options = propertyOptions[localCondition.entity] || [];
    return [
      { value: '', label: '-- Select property --' }, 
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
    
    let result = `When ${entityLabel}'s ${propertyLabel} ${comparisonLabel}`;
    
    if (!isValueDisabled && localCondition.value) {
      result += ` "${localCondition.value}"`;
    }
    
    if (localCondition.fields && localCondition.fields.length > 0) {
      result += `, set field${localCondition.fields.length > 1 ? 's' : ''}: ${localCondition.fields.join(', ')}`;
    }
    
    return result;
  };
  
  // Get the actual Ruby code that would be generated
  const getRubyCodePreview = () => {
    if (!localCondition.entity || !localCondition.property) return '';
    
    let entityVar = '';
    switch (localCondition.entity) {
      case 'Student':
        entityVar = 'student';
        break;
      case 'HighSchool':
        entityVar = 'student.high_school';
        break;
      case 'Course':
        entityVar = 'course';
        break;
      case 'CourseSection':
        entityVar = 'course_section';
        break;
      case 'Instructor':
        entityVar = 'instructor';
        break;
      case 'Term':
        entityVar = 'term';
        break;
      case 'College':
        entityVar = 'college';
        break;
      default:
        entityVar = localCondition.entity.toLowerCase();
    }
    
    // Get the Ruby method name for this property
    let methodName = '';
    if (showCustomProperty) {
      methodName = customProperty;
    } else {
      const entityProps = propertyOptions[localCondition.entity] || [];
      const selectedProp = entityProps.find(p => p.value === localCondition.property);
      methodName = selectedProp?.rubyMethod || localCondition.property;
    }
    
    // Build the Ruby code based on comparison type and value
    let rubyCode = '';
    
    if (methodName.endsWith('?')) {
      if (localCondition.comparison === 'not-equals' || 
          (localCondition.value === 'false' || localCondition.value === false)) {
        rubyCode = `!${entityVar}.${methodName}`;
      } else {
        rubyCode = `${entityVar}.${methodName}`;
      }
    } else {
      const comparisonOp = comparisonOptions.find(c => c.value === localCondition.comparison)?.rubyOperator || '==';
      
      if (comparisonOp === 'present?') {
        rubyCode = `${entityVar}.${methodName}.present?`;
      } else if (comparisonOp === 'blank?') {
        rubyCode = `${entityVar}.${methodName}.blank?`;
      } else if (comparisonOp.includes('include?')) {
        if (comparisonOp.startsWith('!')) {
          rubyCode = `!${entityVar}.${methodName}.to_s.include?('${localCondition.value}')`;
        } else {
          rubyCode = `${entityVar}.${methodName}.to_s.include?('${localCondition.value}')`;
        }
      } else {
        // Check if the value is numeric
        const numValue = Number(localCondition.value);
        if (!isNaN(numValue) && numValue.toString() === String(localCondition.value)) {
          rubyCode = `${entityVar}.${methodName} ${comparisonOp} ${localCondition.value}`;
        } else {
          rubyCode = `${entityVar}.${methodName} ${comparisonOp} '${localCondition.value}'`;
        }
      }
    }
    
    return rubyCode;
  };
  
  // Suggestions for fields to set based on the condition
  const getFieldSuggestions = () => {
    if (!localCondition.entity || !localCondition.property) return [];
    
    // Return suggestions based on the condition
    const entity = localCondition.entity.toLowerCase();
    const property = localCondition.property.toLowerCase();
    
    // Return common fields plus context-specific suggestions
    const suggestions = [...commonFieldValues];
    
    if (entity === 'highschool' && property.includes('home_school')) {
      suggestions.push('home_school', 'parent_consent_provided');
    } else if (entity === 'highschool' && property.includes('non_partner')) {
      suggestions.push('non_partner', 'parent_consent_required');
    } else if (entity === 'course' && property.includes('requisites')) {
      suggestions.push('has_prereqs');
    } else if (entity === 'coursesection' && property.includes('wish_list')) {
      suggestions.push('wish_list');
    }
    
    return suggestions;
  };
  
  // Generate field suggestions tooltip content
  const fieldSuggestionsContent = () => {
    const suggestions = getFieldSuggestions();
    if (suggestions.length === 0) return null;
    
    return (
      <div className="p-2">
        <p className="font-semibold mb-1">Common Field Names:</p>
        <ul className="text-xs">
          {suggestions.map(field => (
            <li key={field} className="mb-1">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => {
                  const currentFields = localCondition.fields || [];
                  if (!currentFields.includes(field)) {
                    const newFields = [...currentFields, field];
                    const updatedCondition = {
                      ...localCondition,
                      fields: newFields
                    };
                    setLocalCondition(updatedCondition);
                    if (onUpdate) {
                      onUpdate(updatedCondition);
                    }
                  }
                }}
              >
                {field}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
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
        
        {/* Fields to set */}
        <div>
          <div className="flex items-start">
            <div className="flex-grow">
              <FormField
                label="Fields to Set (comma-separated)"
                name="fieldsString"
                type="text"
                value={localCondition.fields ? localCondition.fields.join(', ') : ''}
                onChange={handleFieldsChange}
                placeholder="e.g., home_school, parent_consent_required"
                data-testid="scenario-condition-fields-input"
              />
            </div>
            <div className="ml-2 mt-6">
              <div className="relative group">
                <button type="button" className="bg-gray-200 p-1 rounded-full text-gray-600 hover:bg-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-1 w-64 bg-white shadow-lg rounded-md p-2 z-10 hidden group-hover:block">
                  {fieldSuggestionsContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ruby code preview */}
        <div className="mt-2 p-2 bg-gray-100 rounded-md text-sm font-mono">
          <div className="text-xs text-gray-500 mb-1">Ruby code preview:</div>
          {getRubyCodePreview() || <span className="text-gray-400">Complete the form to see code preview</span>}
        </div>
        
        {/* Delete button */}
        {onDelete && (
          <div className="text-right">
            <button
              type="button"
              onClick={onDelete}
              className="text-red-600 hover:text-red-800 text-sm"
              data-testid="delete-condition-button"
            >
              Remove Condition
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionalBuilderRefactored;
