import React, { useState } from 'react';
import Card from '../../common/Card';

/**
 * Upload step section for step forms
 */
const UploadStepSection = ({ formData, setFormData, errors = {} }) => {
  const [tempFileUpload, setTempFileUpload] = useState({ fileType: '', label: '' });

  const addFileUpload = () => {
    if (tempFileUpload.label.trim() === '' || tempFileUpload.fileType.trim() === '') return;
    
    setFormData({
      ...formData,
      fileUploads: [...(formData.fileUploads || []), { ...tempFileUpload }]
    });
    setTempFileUpload({ fileType: '', label: '' });
  };

  const removeFileUpload = (index) => {
    const updatedUploads = [...(formData.fileUploads || [])];
    updatedUploads.splice(index, 1);
    setFormData({
      ...formData,
      fileUploads: updatedUploads
    });
  };

  return (
    <Card title="File Uploads" className="bg-white mb-6">
      {errors.fileUploads && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {errors.fileUploads}
        </div>
      )}
      
      <div className="space-y-2 mb-4">
        {formData.fileUploads?.map((file, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
            <span className="text-sm">{file.label} <span className="text-xs">({file.fileType})</span></span>
            <button 
              type="button" 
              onClick={() => removeFileUpload(index)}
              className="text-red-500 hover:bg-red-50 p-1 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          value={tempFileUpload.label}
          onChange={(e) => setTempFileUpload({ ...tempFileUpload, label: e.target.value })}
          placeholder="File Label (e.g., Transcript)"
          className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          value={tempFileUpload.fileType}
          onChange={(e) => setTempFileUpload({ ...tempFileUpload, fileType: e.target.value })}
          placeholder="File Type (e.g., pdf)"
          className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button 
          type="button" 
          onClick={addFileUpload}
          className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
        >
          Add File
        </button>
      </div>
    </Card>
  );
};

export default UploadStepSection;
