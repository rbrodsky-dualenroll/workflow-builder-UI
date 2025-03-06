import React, { useState } from 'react';
import Card from '../../common/Card';
import FormField from '../../common/FormField';

/**
 * CRN display settings section for step forms
 */
const CrnDisplaySection = ({ formData, setFormData }) => {
  // Check if table columns include CRN
  const hasCrnColumn = (formData.tableColumns || []).includes('CRN');
  
  if (!hasCrnColumn) {
    return null;
  }

  // Define available fields that can be shown with CRN
  const availableFields = [
    { value: 'time', label: 'Meeting Time' },
    { value: 'days', label: 'Meeting Days' },
    { value: 'location', label: 'Location' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'available_seats', label: 'Available Seats' },
    { value: 'campus', label: 'Campus' },
    { value: 'delivery', label: 'Delivery Method' }
  ];

  const handleCrnDisplayChange = (e) => {
    const { name, checked } = e.target;
    
    // Initialize crnDisplay if it doesn't exist
    const currentCrnDisplay = formData.crnDisplay || [];
    
    if (checked) {
      // Add the field if checked
      setFormData({
        ...formData,
        crnDisplay: [...currentCrnDisplay, name]
      });
    } else {
      // Remove the field if unchecked
      setFormData({
        ...formData,
        crnDisplay: currentCrnDisplay.filter(field => field !== name)
      });
    }
  };

  return (
    <Card title="CRN Display Settings" className="bg-white mb-6">
      <p className="text-sm text-gray-600 mb-3">
        Select additional information to display alongside the CRN:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {availableFields.map((field) => (
          <div key={field.value} className="flex items-center">
            <input
              type="checkbox"
              id={`crn-display-${field.value}`}
              name={field.value}
              checked={(formData.crnDisplay || []).includes(field.value)}
              onChange={handleCrnDisplayChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label 
              htmlFor={`crn-display-${field.value}`} 
              className="ml-2 text-sm text-gray-700"
            >
              {field.label}
            </label>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
        <p className="text-xs text-blue-700">
          Selected fields will be displayed underneath the CRN in the table. This helps users see important details about each section without additional clicks.
        </p>
      </div>
    </Card>
  );
};

export default CrnDisplaySection;
