import React, { useState, useEffect } from 'react';
import FormField from '../../../common/FormField';

/**
 * User-friendly component for building conditional rules
 * Focuses on entity/property selection rather than method names
 */
const ConditionalBuilderRefactored = ({ 
  condition = { entity: '', property: '', comparison: '==', value: '', fields: [] },
  onUpdate,
  onDelete
}) => {
  const [localCondition, setLocalCondition] = useState(condition);
  
  // Available entities to check
  const entityOptions = [
    { value: 'student', label: 'Student' },
    { value: 'course', label: 'Course' },
    { value: 'section', label: 'Course Section' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'high_school', label: 'High School' },
    { value: 'term', label: 'Term' },
    { value: 'registration', label: 'Registration' }
  ];
  
  // Properties available for each entity type
  const propertyOptions = {
    student: [
      { value: 'age', label: 'Age' },
      { value: 'gpa', label: 'GPA' },
      { value: 'grade_level', label: 'Grade Level' },
      { value: 'has_financial_aid', label: 'Has Financial Aid' },
      { value: 'is_first_time', label: 'First-Time Student' },
      { value: 'has_parent_consent', label: 'Has Parent Consent' }
    ],
    course: [
      { value: 'credits', label: 'Credits' },
      { value: 'category', label: 'Category' },
      { value: 'discipline', label: 'Discipline' },
      { value: 'has_prerequisites', label: 'Has Prerequisites' }
    ],
    section: [
      { value: 'location', label: 'Location' },
      { value: 'format', label: 'Format' },
      { value: 'instructor_type', label: 'Instructor Type' },
      { value: 'capacity', label: 'Capacity' },
      { value: 'enrollment_count', label: 'Enrollment Count' }
    ],
    instructor: [
      { value: 'is_high_school', label: 'Is High School Instructor' },
      { value: 'is_college', label: 'Is College Instructor' },
      { value: 'credentials', label: 'Credentials' },
      { value: 'discipline', label: 'Discipline' }
    ],
    high_school: [
      { value: 'has_feeder_schools', label: 'Has Feeder Schools' },
      { value: 'payment_policy', label: 'Payment Policy' },
      { value: 'is_home_school', label: 'Is Home School' }
    ],
    term: [
      { value: 'past_withdraw_deadline', label: 'Past Withdraw Deadline' },
      { value: 'past_drop_deadline', label: 'Past Drop Deadline' },
      { value: 'is_current', label: 'Is Current Term' }
    ],
    registration: [
      { value: 'past_due', label: 'Has Past Due Payment' },
      { value: 'has_refund', label: 'Has Refund' },
      { value: 'approval_status', label: 'Approval Status' }
    ]
  };
  
  // Available comparison operators
  const comparisonOptions = [
    { value: '==', label: 'Equals (==)' },
    { value: '!=', label: 'Not equals (!=)' },
    { value: '>', label: 'Greater than (>)' },
    { value: '<', label: 'Less than (<)' },
    { value: '>=', label: 'Greater than or equal (>=)' },
    { value: '<=', label: 'Less than or equal (<=)' },
    { value: 'includes', label: 'Includes' },
    { value: 'present', label: 'Is present' },
    { value: 'blank', label: 'Is blank' },
    { value: 'true', label: 'Is true' },
    { value: 'false', label: 'Is false' }
  ];
  
  // Initialize state from props and update when props change
  useEffect(() => {
    setLocalCondition(condition);
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
  const isValueDisabled = ['present', 'blank', 'true', 'false'].includes(localCondition.comparison);
  
  // Get property options for current entity
  const currentPropertyOptions = localCondition.entity ? propertyOptions[localCondition.entity] || [] : [];
  
  // Generate the human-readable description of the condition
  const getConditionDescription = () => {
    if (!localCondition.entity && !localCondition.property) return 'Set up your condition above';
    
    let entityLabel = entityOptions.find(e => e.value === localCondition.entity)?.label || localCondition.entity;
    let propertyLabel = '';
    
    if (localCondition.entity && localCondition.property) {
      propertyLabel = currentPropertyOptions.find(p => p.value === localCondition.property)?.label || localCondition.property;
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
    <div className="p-4 border border-gray-200 rounded-md bg-gray-50 mb-4">
      <div className="flex justify-between mb-2">
        <h4 className="text-sm font-medium">Condition Rule</h4>
        {onDelete && (
          <button 
            type="button" 
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete condition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Condition description */}
      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
        {getConditionDescription()}
      </div>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        {/* Entity and Property Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="What entity are you checking?"
            name="entity"
            type="select"
            value={localCondition.entity || ''}
            onChange={handleEntityChange}
            options={entityOptions}
            placeholder="Select entity type"
          />
          
          <FormField
            label="What property are you checking?"
            name="property"
            type="select"
            value={localCondition.property || ''}
            onChange={handleChange}
            options={currentPropertyOptions}
            placeholder={localCondition.entity ? "Select property" : "Select entity first"}
            disabled={!localCondition.entity}
          />
        </div>
        
        {/* Comparison and Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="What comparison should be made?"
            name="comparison"
            type="select"
            value={localCondition.comparison}
            onChange={handleChange}
            options={comparisonOptions}
          />
          
          <FormField
            label="What value to compare against?"
            name="value"
            type="text"
            value={localCondition.value || ''}
            onChange={handleChange}
            disabled={isValueDisabled}
            placeholder={isValueDisabled ? "Not needed for this comparison" : "e.g., High School, 18, 3.0"}
            helpText={isValueDisabled ? 'Value not needed for this comparison type' : 'Value to compare against'}
          />
        </div>
        
        {/* Fields to set */}
        <FormField
          label="What workflow fields should be set to true when this condition is met?"
          name="fieldsString"
          type="text"
          value={localCondition.fields?.join(', ') || ''}
          onChange={handleFieldsChange}
          placeholder="e.g., capacity_override, high_school_location_processing"
          helpText="Comma-separated list of fields to set to true when condition is met"
        />
      </div>
    </div>
  );
};

export default ConditionalBuilderRefactored;
