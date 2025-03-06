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
export const createFeedbackStep = ({ 
  recipientRole, 
  stepTitle,
  requestingRole, 
  parentStepTitle = 'Previous Step',
  feedbackId,
  parentStepId
}) => {
  // Create a default return action button that references the requesting role
  const returnAction = {
    label: `Return to ${requestingRole}`,
    value: `return-to-${requestingRole.toLowerCase().replace(/\s+/g, '-')}`
  };

  // Generate a truly unique ID for this feedback step
  const uniqueStepId = `feedback_step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create the feedback step with document upload as the default type
  return {
    id: uniqueStepId, // Add a truly unique ID for each feedback step
    stepType: 'Upload',
    title: stepTitle.trim(),
    role: recipientRole,
    description: `Please provide the requested information to continue the process.`,
    // Default to requiring document upload
    fileUploads: [
      { label: 'Supporting Documentation', required: true }
    ],
    // Add a default action to return to the requesting role
    actionOptions: [returnAction],
    // Default to requiring comments
    comments: {
      required: true,
      public: true
    },
    // Relationship information
    isFeedbackStep: true,
    feedbackRelationship: {
      feedbackId: feedbackId,
      parentStepId: parentStepId,
      parentStepTitle: parentStepTitle,
      requestingRole: requestingRole
    }
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
