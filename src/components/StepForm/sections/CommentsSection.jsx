import React from 'react';
import Card from '../../common/Card';

/**
 * Comments section for step forms
 */
const CommentsSection = ({ formData, setFormData, errors = {} }) => {
  const handleCommentsChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      comments: {
        ...(formData.comments || {}),
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  return (
    <Card title="Comments" className="bg-white mb-6">
      <div className="flex items-center mb-4">
        <input
          id="commentsRequired"
          name="required"
          type="checkbox"
          checked={formData.comments?.required || false}
          onChange={handleCommentsChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="commentsRequired" className="ml-2 text-sm font-medium text-gray-700">Require Comments</label>
      </div>

      {formData.comments?.required && (
        <div className="flex items-center mb-4 ml-6">
          <input
            id="commentsPublic"
            name="public"
            type="checkbox"
            checked={formData.comments?.public ?? true}
            onChange={handleCommentsChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="commentsPublic" className="ml-2 text-sm font-medium text-gray-700">Make Comments Public</label>
        </div>
      )}
    </Card>
  );
};

export default CommentsSection;
