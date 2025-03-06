import React, { useState } from 'react';
import FormField from '../../common/FormField';
import Card from '../../common/Card';

/**
 * Approval step section for step forms
 */
const ApprovalStepSection = ({ formData, setFormData, errors = {} }) => {
  const [tempActionOption, setTempActionOption] = useState({ label: '', value: '' });
  const [showActionTemplates, setShowActionTemplates] = useState(false);
  
  // Template data for action options (removed feedback options)
  const commonActionOptionTemplates = [
    { label: 'Approve', value: 'approve-yes' },
    { label: 'Decline', value: 'decline-no' },
    { label: 'Defer', value: 'defer' }
  ];

  const addActionOption = () => {
    if (tempActionOption.label.trim() === '') return;
    
    setFormData({
      ...formData,
      actionOptions: [...(formData.actionOptions || []), { ...tempActionOption }]
    });
    setTempActionOption({ label: '', value: '' });
  };

  const addActionTemplate = (template) => {
    if (!formData.actionOptions?.some(opt => opt.value === template.value)) {
      setFormData({
        ...formData,
        actionOptions: [...(formData.actionOptions || []), { ...template }]
      });
    }
  };

  const removeActionOption = (index) => {
    const updatedOptions = [...(formData.actionOptions || [])];
    updatedOptions.splice(index, 1);
    setFormData({
      ...formData,
      actionOptions: updatedOptions
    });
  };

  return (
    <Card title="Action Options" className="bg-white mb-6">
      <p className="text-sm text-gray-600 mb-3">These will appear as radio button choices in the step:</p>
      
      <div className="space-y-2 mb-4">
        {formData.actionOptions?.map((option, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
            <div className="flex items-center">
              <span className="inline-block w-4 h-4 border border-gray-400 rounded-full mr-2"></span>
              <span className="text-sm">{option.label} <span className="text-gray-500 text-xs">({option.value})</span></span>
            </div>
            <button 
              type="button" 
              onClick={() => removeActionOption(index)}
              className="text-red-500 hover:bg-red-50 p-1 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowActionTemplates(!showActionTemplates)}
          className="text-primary bg-white text-sm flex items-center border border-gray-200 px-3 py-1 rounded"
        >
          {showActionTemplates ? 'Hide' : 'Show'} common action options
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transform ${showActionTemplates ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        {showActionTemplates && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonActionOptionTemplates
                // Filter out templates that already exist in formData.actionOptions
                .filter(template => 
                  !formData.actionOptions?.some(option => 
                    option.value === template.value || 
                    option.label.toLowerCase() === template.label.toLowerCase()
                  )
                )
                .map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addActionTemplate(template)}
                    className="text-left text-sm px-2 py-1 rounded flex items-center text-primary bg-white"
                  >
                    <span className="w-4 h-4 mr-2 flex-shrink-0">+</span>
                    {template.label}
                  </button>
                ))
              }
              {commonActionOptionTemplates.length > 0 && 
               formData.actionOptions?.length > 0 && 
               commonActionOptionTemplates.every(template => 
                 formData.actionOptions.some(option => 
                   option.value === template.value || 
                   option.label.toLowerCase() === template.label.toLowerCase()
                 )
               ) && (
                <p className="text-gray-500 text-sm col-span-2 italic">All common actions are already added</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          value={tempActionOption.label}
          onChange={(e) => setTempActionOption({ ...tempActionOption, label: e.target.value })}
          placeholder="Button Label (e.g., Approve)"
          className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={tempActionOption.value}
          onChange={(e) => setTempActionOption({ ...tempActionOption, value: e.target.value })}
          placeholder="Value (e.g., approve-yes)"
          className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button 
          type="button" 
          onClick={addActionOption}
          className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
        >
          Add Option
        </button>
      </div>
    </Card>
  );
};

export default ApprovalStepSection;
