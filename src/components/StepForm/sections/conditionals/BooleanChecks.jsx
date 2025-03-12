import React, { useState } from 'react';
import FormField from '../../../common/FormField';

/**
 * Component for managing boolean method checks
 * This provides a simpler way to set fields based on boolean methods
 */
const BooleanChecks = ({ 
  booleanChecks = {}, 
  onChange 
}) => {
  // Available check types (more user-friendly)
  const checkOptions = [
    { value: 'student_needs_immunization', label: 'Student needs immunization' },
    { value: 'is_first_time_student', label: 'Student is a first-time student' },
    { value: 'has_financial_aid', label: 'Student has financial aid' },
    { value: 'is_scholarship_recipient', label: 'Student is a scholarship recipient' },
    { value: 'is_on_academic_probation', label: 'Student is on academic probation' },
    { value: 'is_graduating_senior', label: 'Student is a graduating senior' },
    { value: 'course_requires_prerequisite', label: 'Course requires prerequisites' },
    { value: 'section_is_full', label: 'Course section is full' },
    { value: 'section_needs_college_approval', label: 'Section needs college approval' },
    { value: 'high_school_outside_district', label: 'High school is outside district' },
    { value: 'instructor_is_qualified', label: 'Instructor is qualified' }
  ];
  
  const [selectedCheck, setSelectedCheck] = useState('');
  const [newFields, setNewFields] = useState('');
  
  // Add a new boolean check
  const handleAddCheck = () => {
    if (!selectedCheck || !newFields.trim()) return;
    
    // Parse fields string to array
    const fieldsArray = newFields.split(',')
      .map(field => field.trim())
      .filter(field => field !== '');
    
    if (fieldsArray.length === 0) return;
    
    // Create updated checks object
    const updatedChecks = {
      ...booleanChecks,
      [selectedCheck]: fieldsArray
    };
    
    onChange(updatedChecks);
    
    // Reset form fields
    setSelectedCheck('');
    setNewFields('');
  };
  
  // Remove a boolean check
  const handleRemoveCheck = (method) => {
    const updatedChecks = { ...booleanChecks };
    delete updatedChecks[method];
    onChange(updatedChecks);
  };
  
  // Get display label for a check method
  const getCheckLabel = (method) => {
    const option = checkOptions.find(opt => opt.value === method);
    return option ? option.label : method;
  };
  
  return (
    <div className="mt-6 p-4 border border-gray-200 rounded-md bg-blue-50">
      <h3 className="text-md font-medium mb-3">Simple Condition Checks</h3>
      <p className="text-sm text-gray-600 mb-3">
        Define common yes/no checks that can set workflow fields when true.
      </p>
      
      {/* Existing boolean checks */}
      {Object.keys(booleanChecks).length > 0 ? (
        <div className="mb-4 space-y-2">
          {Object.entries(booleanChecks).map(([method, fields]) => (
            <div 
              key={method}
              className="flex items-start justify-between p-2 bg-white rounded border border-blue-200"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{getCheckLabel(method)}</div>
                <div className="text-xs text-gray-500">
                  When true, sets fields: {fields.join(', ')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCheck(method)}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label="Remove boolean check"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4 p-3 bg-white border border-dashed border-blue-300 rounded-md text-center text-gray-500 text-sm">
          No checks defined yet
        </div>
      )}
      
      {/* Add new boolean check */}
      <div className="space-y-3">
        <FormField
          label="What condition do you want to check?"
          name="selectedCheck"
          type="select"
          value={selectedCheck}
          onChange={(e) => setSelectedCheck(e.target.value)}
          options={checkOptions}
          placeholder="Select a condition to check"
        />
        
        <FormField
          label="What workflow fields should be set when this is true?"
          name="newFields"
          type="text"
          value={newFields}
          onChange={(e) => setNewFields(e.target.value)}
          placeholder="e.g., immunization_required, orientation_needed"
          helpText="Comma-separated list of fields to set to true when condition is true"
        />
        
        <button
          type="button"
          onClick={handleAddCheck}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded border border-blue-300"
          disabled={!selectedCheck || !newFields.trim()}
        >
          Add Check
        </button>
      </div>
    </div>
  );
};

export default BooleanChecks;
