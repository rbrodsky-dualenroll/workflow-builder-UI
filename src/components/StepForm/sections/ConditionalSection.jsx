import React from 'react';
import FormField from '../../common/FormField';
import Card from '../../common/Card';

/**
 * Conditional logic section for step forms
 */
const ConditionalSection = ({ 
  formData, 
  handleChange,
  scenarioInfo = null,
  errors = {},
}) => {
  // Handle checkbox change specifically
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    handleChange({
      target: {
        name,
        value: checked,
        type: 'checkbox',
        checked
      }
    });
  };
  
  return (
    <Card className="bg-gray-50 mb-6">
      {scenarioInfo && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Conditional Scenario: {scenarioInfo.id}</h3>
          <p className="text-xs text-blue-700">This step is part of the "{scenarioInfo.id}" scenario.</p>
          {scenarioInfo.condition && (
            <p className="text-xs text-blue-700 mt-1">
              <span className="font-medium">Scenario condition:</span> {scenarioInfo.condition}
            </p>
          )}
        </div>
      )}
      
      <FormField 
        label="Is this step conditional?"
        name="conditional"
        type="checkbox"
        value={formData.conditional}
        onChange={handleCheckboxChange}
        error={errors.conditional}
      />

      {formData.conditional && (
        <div className="ml-6">
          <FormField
            label="Triggering Condition"
            name="triggeringCondition"
            type="text"
            value={formData.triggeringCondition}
            onChange={handleChange}
            placeholder="e.g., student.gpa > 3.0"
            error={errors.triggeringCondition}
          />
        </div>
      )}
    </Card>
  );
};

export default ConditionalSection;
