// Utility functions for the workflow builder



/**
 * Determine if a step can potentially terminate a workflow
 * @param {Object} step The step data
 * @returns {boolean} Whether the step can terminate the workflow
 */
export const canStepTerminateWorkflow = (step) => {
  // Explicitly marked steps can terminate workflows
  if (step.causes_termination) {
    return true;
  }
  
  // Approval steps with terminates_workflow or canTerminate options can terminate workflows
  if (step.stepType === 'Approval' && step.actionOptions?.length > 0) {
    return step.actionOptions.some(option => 
      option.terminates_workflow || option.canTerminate || option.value === 'no'
    );
  }
  
  return false;
};

/**
 * Get termination options from a step
 * @param {Object} step The step data
 * @returns {Array} Array of action options that can terminate the workflow
 */
export const getTerminationOptions = (step) => {
  if (step.stepType !== 'Approval' || !step.actionOptions?.length) {
    return [];
  }
  
  return step.actionOptions.filter(option => 
    option.terminates_workflow || option.canTerminate || option.value === 'no'
  );
};

/**
 * Generate a unique ID for a step
 * @returns {string} Unique identifier
 */
export const generateStepId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Validate step form data
 * @param {Object} formData The form data to validate
 * @returns {Object} Object with validation errors
 */
export const validateStep = (formData) => {
  const errors = {};
  
  if (!formData.title.trim()) {
    errors.title = "Title is required";
  }
  
  if (!formData.stepType) {
    errors.stepType = "Step type is required";
  }
  
  if (!formData.role && (formData.stepType === "Approval" || formData.stepType === "Upload" || formData.stepType === "Information")) {
    errors.role = "Role is required";
  }
  
  if (formData.stepType === "Upload" && formData.fileUploads.length === 0) {
    errors.fileUploads = "At least one file upload is required";
  }
  
  // Validate conditionals if the step is conditional
  if (formData.conditional) {
    // Must have at least one named workflow condition
    if (!formData.workflowCondition || !Array.isArray(formData.workflowCondition) || formData.workflowCondition.length === 0) {
      errors.workflowCondition = "At least one workflow condition must be selected when step is marked as conditional";
    }
  }
  
  // For non-Approval steps that can terminate, we enforce comments as required
  // No need to validate Approval steps - comments will be dynamically required for terminating actions
  if (canStepTerminateWorkflow(formData) && formData.stepType !== 'Approval' && !formData.comments?.required) {
    errors.comments = "Comments must be required for non-Approval steps that can terminate the workflow";
  }
  
  return errors;
};

/**
 * Download workflow as JSON file
 * @param {Object} workflow The workflow object to download
 * @param {string} workflowName The name of the workflow
 */
export const downloadWorkflow = (workflow, workflowName) => {
  const fileName = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`;
  const json = JSON.stringify(workflow, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Get step type color based on the step type
 * @param {string} stepType The type of step
 * @returns {string} CSS class for the border color
 */
export const getStepTypeColor = (stepType) => {
  switch (stepType) {
    case 'Approval': return 'border-primary';
    case 'Upload': return 'border-secondary';
    case 'Information': return 'border-yellow-400';
    case 'ProvideConsent': return 'border-green-500';
    case 'CheckHolds': return 'border-orange-500';
    case 'RegisterViaApi': return 'border-purple-500';
    case 'ResolveIssue': return 'border-red-500';
    default: return 'border-gray-400';
  }
};

/**
 * Get workflow category badge styling based on the category type
 * @param {string} workflow_category The workflow category type
 * @returns {string} CSS classes for the badge
 */
export const getWorkflowCategoryBadgeClass = (workflow_category) => {
  switch (workflow_category) {
    case 'One Time': return 'bg-purple-100 text-purple-800';
    case 'Per Academic Year': return 'bg-blue-100 text-blue-800';
    case 'Per Term': return 'bg-green-100 text-green-800';
    case 'Per Course': return 'bg-orange-100 text-orange-800';
    case 'Drop/Withdraw': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
