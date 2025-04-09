/**
 * Utility functions for creating and managing feedback steps
 */

/**
 * Creates a new feedback step with appropriate defaults
 * 
 * @param {Object} options - Configuration options for the feedback step
 * @param {string} options.recipientRole - Role that will receive the feedback request
 * @param {string} options.stepTitle - Title for the feedback step
 * @param {string} options.requestingRole - Role that is requesting the feedback
 * @param {string} options.parentStepTitle - Title of the parent step requesting feedback
 * @param {string} options.feedbackId - Unique ID for this feedback relationship
 * @param {string} options.parentStepId - ID of the parent step
 * @returns {Object} The newly created feedback step object
 */
import { generateUniqueId } from './idUtils';

export const createFeedbackStep = ({ 
  recipientRole, 
  stepTitle,
  requestingRole, 
  parentStepTitle = 'Previous Step',
  feedbackId,
  parentStepId,
  parentStepData // Add this parameter to pass the full parent step data
}) => {
  if (!parentStepId) {
    throw new Error('Parent step ID is required for feedback steps');
  }

  // Inherit key properties from parent step
  const inheritedProperties = {
    conditional: parentStepData.conditional || false,
    workflowCondition: parentStepData.workflowCondition || [],
    workflow_category: parentStepData.workflow_category || 'Per Course',
    tableColumns: parentStepData.tableColumns || ['Student Name', 'Document', 'Upload Status']
  };

  return {
    ...inheritedProperties,
    stepType: 'Upload',
    title: stepTitle.trim(),
    role: recipientRole,
    description: `Please provide the requested information to continue the process.`,
    
    fileUploads: [
      { label: 'Supporting Documentation', required: true }
    ],
    actionOptions: [{
      label: `Return to ${requestingRole}`,
      value: `return-to-${requestingRole.toLowerCase().replace(/\s+/g, '-')}`
    }],
    
    comments: {
      required: true,
      public: true
    },
    
    // Keep feedback-specific metadata
    isFeedbackStep: true,
    feedbackRelationship: {
      feedbackId: feedbackId,
      parentStepId: parentStepId,
      parentStepTitle: parentStepTitle,
      requestingRole: requestingRole,
      recipientRole: recipientRole // Adding this for better consistency and symmetry
    },
    
    // Default empty displays and other fields
    informationDisplays: [],
    showCrnInfo: false,
    crnDisplay: []
  };
};
/**
 * Validates feedback step configuration
 * 
 * @param {Object} feedbackConfig - The feedback configuration to validate
 * @returns {Object} Validation errors (empty if valid)
 */
export const validateFeedbackStep = (feedbackConfig) => {
  const errors = {};
  
  if (!feedbackConfig.recipient) {
    errors.recipient = 'A recipient role is required';
  }
  
  if (!feedbackConfig.nextStep || !feedbackConfig.nextStep.trim()) {
    errors.nextStep = 'A step name is required';
  }
  
  return errors;
};
