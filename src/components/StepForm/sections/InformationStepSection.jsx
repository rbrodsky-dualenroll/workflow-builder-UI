import React, { useState } from 'react';
import Card from '../../common/Card';

/**
 * Information step section for step forms
 */
const InformationStepSection = ({ formData, setFormData, errors = {} }) => {
  const [tempInfoDisplay, setTempInfoDisplay] = useState('');

  const addInfoDisplay = () => {
    if (tempInfoDisplay.trim() === '') return;
    
    setFormData({
      ...formData,
      informationDisplays: [...(formData.informationDisplays || []), tempInfoDisplay]
    });
    setTempInfoDisplay('');
  };

  const removeInfoDisplay = (index) => {
    const updatedDisplays = [...(formData.informationDisplays || [])];
    updatedDisplays.splice(index, 1);
    setFormData({
      ...formData,
      informationDisplays: updatedDisplays
    });
  };

  return (
    <Card title="Information Displays" className="bg-white mb-6">
      <div className="space-y-2 mb-4">
        {formData.informationDisplays?.map((display, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
            <span className="text-sm">{display}</span>
            <button 
              type="button" 
              onClick={() => removeInfoDisplay(index)}
              className="text-red-500 hover:bg-red-50 p-1 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          type="text"
          value={tempInfoDisplay}
          onChange={(e) => setTempInfoDisplay(e.target.value)}
          placeholder="Information to display"
          className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button 
          type="button" 
          onClick={addInfoDisplay}
          className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
        >
          Add Display
        </button>
      </div>
    </Card>
  );
};

export default InformationStepSection;
