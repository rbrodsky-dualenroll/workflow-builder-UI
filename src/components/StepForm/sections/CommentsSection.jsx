import React, { useEffect, useState } from 'react';
import Card from '../../common/Card';
import { canStepTerminateWorkflow } from '../../../utils/workflowUtils';

/**
 * Comments section for step forms with enhanced configuration for terminating steps
 */
const CommentsSection = ({ formData, setFormData, errors = {} }) => {
  // Keep track of user's explicit choices about comments
  const [userExplicitlySelectedComments, setUserExplicitlySelectedComments] = useState(false);

  // Only auto-set comments to required if this is not an Approval step with terminating actions
  // For Approval steps with terminating actions, comments will be required dynamically when those actions are selected
  useEffect(() => {
    // Get the user's current choice
    const currentRequiredSetting = formData.comments?.required || false;
    
    // If user has explicitly made a choice, don't override it
    if (userExplicitlySelectedComments) {
      return;
    }

    // Determine if this needs comments statically
    const needsStaticComments = canStepTerminateWorkflow(formData) && formData.stepType !== 'Approval';
    
    // If this is not an Approval step but can terminate workflow, set comments to required
    if (needsStaticComments && !currentRequiredSetting) {
      setFormData({
        ...formData,
        comments: {
          ...(formData.comments || {}),
          required: true
        }
      });
    }
  }, [formData.actionOptions, formData.stepType, userExplicitlySelectedComments]);
  const handleCommentsChange = (e) => {
    const { name, type, checked, value } = e.target;
    
    // User has made an explicit choice
    setUserExplicitlySelectedComments(true);
    
    setFormData({
      ...formData,
      comments: {
        ...(formData.comments || {}),
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  // Check if this step can terminate the workflow
  const canTerminate = canStepTerminateWorkflow(formData);
  
  // Determine if this is an approval step with terminating options
  const isApprovalWithTerminatingOptions = formData.stepType === 'Approval' && canTerminate;
  
  // Determine if comments should be forced required (not for approval steps with terminating options)
  const forceRequireComments = canTerminate && !isApprovalWithTerminatingOptions;
  
  return (
    <Card title="Comments" className="bg-white mb-6">
      {errors.comments && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.comments}</p>
        </div>
      )}
      
      {canTerminate && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This step has action options that can terminate the workflow. 
            Comments are automatically required when termination options are selected, regardless of the setting below.
          </p>
        </div>
      )}
      
      <div className="flex items-center mb-4">
        <input
          id="commentsRequired"
          name="required"
          type="checkbox"
          checked={formData.comments?.required || false}
          onChange={handleCommentsChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          data-testid="comments-required-checkbox"
          disabled={forceRequireComments} // Only disable for non-Approval terminating steps
        />
        <label htmlFor="commentsRequired" className="ml-2 text-sm font-medium text-gray-700">
          Require Comments for All Actions
          <span className="ml-1 text-xs text-gray-500">
            (When unchecked, comments are still required for terminating actions)
          </span>
        </label>
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
