import React, { useState } from 'react';
import Card from '../../common/Card';

/**
 * Common document classes for DualEnroll
 */
const DOCUMENT_CLASSES = [
  { value: 'StudentDocument', label: 'Student Document' },
  { value: 'CollegeDocument', label: 'College Document' },
  { value: 'HighSchoolDocument', label: 'High School Document' },
  { value: 'CourseDocument', label: 'Course Document' },
  { value: 'CourseSectionDocument', label: 'Course Section Document' },
  { value: 'CourseReviewDocument', label: 'Course Review Document' },
  { value: 'InstructorDocument', label: 'Instructor Document' },
];

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

  const handleDocumentClassChange = (e) => {
    setFormData({
      ...formData,
      documentClass: e.target.value
    });
  };

  // Set a default document class if none exists
  React.useEffect(() => {
    if (!formData.documentClass) {
      setFormData({
        ...formData,
        documentClass: 'StudentDocument'
      });
    }
  }, []);

  return (
    <Card title="Document Upload Configuration" className="bg-white mb-6">
      {errors.fileUploads && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {errors.fileUploads}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document Class
        </label>
        <select
          value={formData.documentClass || 'StudentDocument'}
          onChange={handleDocumentClassChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          data-testid="document-class-select"
        >
          {DOCUMENT_CLASSES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Select the document class that will be used to store uploaded files
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Accepted File Types
        </label>
        <div className="space-y-2 mb-4">
          {formData.fileUploads?.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border border-gray-200">
              <span className="text-sm">{file.label} <span className="text-xs">({file.fileType})</span></span>
              <button 
                type="button" 
                onClick={() => removeFileUpload(index)}
                className="text-red-500 hover:bg-red-50 p-1 rounded"
                data-testid={`remove-file-${index}`}
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
            data-testid="file-label-input"
          />
          <input
            type="text"
            value={tempFileUpload.fileType}
            onChange={(e) => setTempFileUpload({ ...tempFileUpload, fileType: e.target.value })}
            placeholder="File Type (e.g., pdf)"
            className="col-span-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            data-testid="file-type-input"
          />
          <button 
            type="button" 
            onClick={addFileUpload}
            className="bg-secondary hover:bg-secondary-600 text-white rounded-md px-3 py-2 text-sm"
            data-testid="add-file-button"
          >
            Add File
          </button>
        </div>
      </div>
    </Card>
  );
};

export default UploadStepSection;
