import React, { useState, useEffect } from 'react';
import FormField from '../../common/FormField';
import CollapsibleCard from '../../common/CollapsibleCard';
import { getTerminationOptions } from '../../../utils/workflowUtils';

/**
 * Approval step section for step forms
 */
const ApprovalStepSection = ({ formData, setFormData, errors = {} }) => {
  const [tempActionOption, setTempActionOption] = useState({ 
    label: '', 
    value: '',
    requiresAdditionalInfo: false,
    additionalInfoLabel: '',
    canTerminate: false
  });
  const [showActionTemplates, setShowActionTemplates] = useState(false);
  
  // Template data for action options
  const commonActionOptionTemplates = [
    { label: 'Approve', value: 'approve-yes', canTerminate: false, terminates_workflow: false },
    { label: 'Decline', value: 'decline-no', canTerminate: true, terminates_workflow: true },
    { label: 'Defer', value: 'defer', canTerminate: false, terminates_workflow: false }
  ];
  
  // Auto-set termination flag and update comments requirement based on action options
  useEffect(() => {
    // Skip if there are no action options or this is initial setup
    if (!formData.actionOptions || formData.actionOptions.length === 0) return;
    
    // Get the terminating options
    const terminatingOptions = getTerminationOptions(formData);
    const hasTerminatingOption = terminatingOptions.length > 0;
    
    // Create a copy of the form data for updates
    const updatedData = { ...formData };
    
    // Always set canTerminate based on whether there are terminating options
    updatedData.canTerminate = hasTerminatingOption;
    
    // If there are terminating options, ensure comments are required
    if (hasTerminatingOption) {
      updatedData.comments = {
        ...(formData.comments || {}),
        required: true
      };
    }
    
    // Only update if something changed
    if (updatedData.canTerminate !== formData.canTerminate || 
        updatedData.comments?.required !== formData.comments?.required) {
      setFormData(updatedData);
    }
  }, [formData.actionOptions, setFormData]);

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
    <CollapsibleCard 
      title="Action Options" 
      className="bg-white mb-6"
      defaultCollapsed={true} 
      id="action-options-section"
    >
      <p className="text-sm text-gray-600 mb-3">These will appear as radio button choices in the step:</p>
      
      <div className="space-y-2 mb-4">
        {formData.actionOptions?.map((option, index) => (
          <div key={index} className={`bg-gray-50 p-2 rounded-md border ${option.canTerminate ? 'border-red-200' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
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
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                {/* Show termination indicator for default options */}
                {formData.actionOptions[index].value === 'decline-no' ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-red-600"></div>
                    <span className="ml-2 text-sm text-gray-700">
                      Terminates workflow
                      <span className="ml-1 text-xs text-gray-500">(Default behavior)</span>
                    </span>
                  </div>
                ) : formData.actionOptions[index].value === 'approve-yes' || formData.actionOptions[index].value === 'defer' ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 rounded-full bg-green-600"></div>
                    <span className="ml-2 text-sm text-gray-700">
                      Continues workflow
                      <span className="ml-1 text-xs text-gray-500">(Default behavior)</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`can-terminate-${index}`}
                      checked={option.canTerminate || option.terminates_workflow || false}
                      onChange={(e) => {
                        const updatedOptions = [...(formData.actionOptions || [])];
                        updatedOptions[index] = {
                          ...updatedOptions[index],
                          canTerminate: e.target.checked,
                          terminates_workflow: e.target.checked
                        };
                        setFormData({
                          ...formData,
                          actionOptions: updatedOptions
                        });
                      }}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      data-testid={`action-option-can-terminate-checkbox-${index}`}
                    />
                    <label htmlFor={`can-terminate-${index}`} className="ml-2 text-sm text-gray-700">
                      This action will terminate the workflow
                    </label>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`requires-additional-info-${index}`}
                    checked={option.requiresAdditionalInfo || false}
                    onChange={(e) => {
                      const updatedOptions = [...(formData.actionOptions || [])];
                      updatedOptions[index] = {
                        ...updatedOptions[index],
                        requiresAdditionalInfo: e.target.checked
                      };
                      setFormData({
                        ...formData,
                        actionOptions: updatedOptions
                      });
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    data-testid={`action-option-additional-info-checkbox-${index}`}
                  />
                  <label htmlFor={`requires-additional-info-${index}`} className="ml-2 text-sm text-gray-700">
                    Requires additional information
                  </label>
                </div>
                
                {option.requiresAdditionalInfo && (
                  <div className="mt-2 pl-6">
                    <label htmlFor={`additional-info-label-${index}`} className="block text-sm text-gray-700 mb-1">
                      Label for additional information
                    </label>
                    <input
                      type="text"
                      id={`additional-info-label-${index}`}
                      value={option.additionalInfoLabel || ''}
                      onChange={(e) => {
                        const updatedOptions = [...(formData.actionOptions || [])];
                        updatedOptions[index] = {
                          ...updatedOptions[index],
                          additionalInfoLabel: e.target.value
                        };
                        setFormData({
                          ...formData,
                          actionOptions: updatedOptions
                        });
                      }}
                      placeholder="e.g., Student ID, Reason, etc."
                      className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
                      data-testid={`action-option-additional-info-label-${index}`}
                    />
                  </div>
                )}
              </div>
            </div>
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
          data-testid="new-action-option-label-input"
        />
        <input
          type="text"
          value={tempActionOption.value}
          onChange={(e) => setTempActionOption({ ...tempActionOption, value: e.target.value })}
          placeholder="Value (e.g., approve-yes)"
          className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
          data-testid="new-action-option-value-input"
        />
        <button 
          type="button" 
          onClick={addActionOption}
          className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
          data-testid="add-action-option-button"
        >
          Add Option
        </button>
      </div>
      
      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="new-option-can-terminate"
              checked={tempActionOption.canTerminate || false}
              onChange={(e) => {
                setTempActionOption({ 
                  ...tempActionOption, 
                  canTerminate: e.target.checked,
                  terminates_workflow: e.target.checked
                });
              }}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              data-testid="new-action-option-can-terminate-checkbox"
            />
            <label htmlFor="new-option-can-terminate" className="ml-2 text-sm text-gray-700">
              This action will terminate the workflow
              {tempActionOption.label && tempActionOption.label.toLowerCase() === 'decline' && (
                <span className="ml-1 text-xs text-gray-500">(Recommended for "Decline" actions)</span>
              )}
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="new-option-requires-additional-info"
              checked={tempActionOption.requiresAdditionalInfo || false}
              onChange={(e) => setTempActionOption({ 
                ...tempActionOption, 
                requiresAdditionalInfo: e.target.checked 
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              data-testid="new-action-option-additional-info-checkbox"
            />
            <label htmlFor="new-option-requires-additional-info" className="ml-2 text-sm text-gray-700">
              Requires additional information
            </label>
          </div>
        </div>
        
        {tempActionOption.requiresAdditionalInfo && (
          <div className="mt-2 pl-6">
            <label htmlFor="new-option-additional-info-label" className="block text-sm text-gray-700 mb-1">
              Label for additional information
            </label>
            <input
              type="text"
              id="new-option-additional-info-label"
              value={tempActionOption.additionalInfoLabel || ''}
              onChange={(e) => setTempActionOption({ 
                ...tempActionOption, 
                additionalInfoLabel: e.target.value 
              })}
              placeholder="e.g., Student ID, Reason, etc."
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
              data-testid="new-action-option-additional-info-label-input"
            />
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

export default ApprovalStepSection;