import React, { useState, useEffect } from 'react';
import CollapsibleCard from '../../common/CollapsibleCard';
import FormField from '../../common/FormField';
import { createFeedbackStep, validateFeedbackStep } from '../../../utils/feedbackStepUtils';
import { generateUniqueId } from '../../../utils/idUtils';

/**
 * FeedbackLoopsSection component for managing multiple feedback loops
 */
const FeedbackLoopsSection = ({ formData, setFormData, onAddFeedbackStep }) => {
  const [newFeedback, setNewFeedback] = useState({
    recipient: '',
    nextStep: ''
  });
  
  // Track validation errors for the new feedback form
  const [feedbackErrors, setFeedbackErrors] = useState({});
  
  // Track feedback creation success animation
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Auto-collapse success message after timeout
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);
  
  // Toggle preview when form fields change if preview is active
  useEffect(() => {
    if (showPreview && (newFeedback.recipient || newFeedback.nextStep)) {
      // Keep preview open but refresh its contents
      setShowPreview(true);
    }
  }, [newFeedback.recipient, newFeedback.nextStep]);
  
  // Available recipient roles
  const recipientOptions = [
    { value: 'Student', label: 'Student' },
    { value: 'High School', label: 'High School' },
    { value: 'College', label: 'College' },
    { value: 'Approver', label: 'Approver' },
    { value: 'Parent', label: 'Parent' },
  ];
  
  // Add a new feedback loop
  const addFeedbackLoop = () => {
    // Validate the form
    const errors = validateFeedbackStep(newFeedback);
    
    if (Object.keys(errors).length > 0) {
      setFeedbackErrors(errors);
      return;
    }
    
    // Clear any previous errors
    setFeedbackErrors({});
    
    // Ensure parent step has an ID
    const parentId = formData.id || generateUniqueId('step_');
    
    // If we had to generate a new parent ID, update the form data
    if (!formData.id) {
      setFormData(prev => ({
        ...prev,
        id: parentId
      }));
    }

    // Create a unique ID for the feedback loop
    const feedbackId = generateUniqueId('feedback_');
    
    // Create the feedback step using our utility function
    const newFeedbackStep = createFeedbackStep({
      recipientRole: newFeedback.recipient,
      stepTitle: newFeedback.nextStep.trim(),
      requestingRole: formData.role,
      parentStepTitle: formData.title || 'Requesting Step',
      feedbackId: feedbackId,
      parentStepId: parentId,
      parentStepData: formData  // Pass the entire parent step data
    });
    
    // Add the feedback relationship to the parent step
    setFormData({
      ...formData,
      pendingFeedbackSteps: [...(formData.pendingFeedbackSteps || []), newFeedbackStep],
      feedbackLoops: {
        ...(formData.feedbackLoops || {}),
        [feedbackId]: {
          recipient: newFeedback.recipient,
          nextStep: newFeedback.nextStep.trim()
        }
      }
    });
    
    // Reset the new feedback form
    setNewFeedback({
      recipient: '',
      nextStep: ''
    });
    
    // Show success animation
    setShowSuccess(true);
  };
  
  // Remove a feedback loop
  const removeFeedbackLoop = (feedbackId) => {
    const updatedFeedbackLoops = { ...(formData.feedbackLoops || {}) };
    delete updatedFeedbackLoops[feedbackId];
    
    // Remove from pendingFeedbackSteps using the unique feedbackId
    const updatedPendingSteps = (formData.pendingFeedbackSteps || []).filter(step => 
      step.feedbackId !== feedbackId
    );
    
    setFormData({
      ...formData,
      feedbackLoops: updatedFeedbackLoops,
      pendingFeedbackSteps: updatedPendingSteps
    });
  };
  
  // Get all feedback loops as an array for display
  const feedbackLoops = Object.entries(formData.feedbackLoops || {}).map(
    ([id, data]) => ({ id, ...data })
  );
  
  return (
    <CollapsibleCard 
      title="Feedback Loops (Optional)" 
      className="bg-white mb-6"
      defaultCollapsed={true}
      id="feedback-loops-section"
      data-testid="feedback-loops-section"
    >
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4" data-testid="feedback-loops-info">
        <p className="text-sm text-blue-700 mb-2">
          Feedback loops create additional steps when the user needs to request more information from another participant.
          These steps will automatically include document upload capabilities and return actions.
        </p>
        
        {/* Visual diagram of feedback flow */}
        <div className="my-3 p-3 bg-white rounded-md border border-blue-100" data-testid="feedback-diagram">
          <h4 className="text-sm font-medium text-blue-800 mb-2">How Feedback Loops Work:</h4>
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="bg-gray-100 p-2 rounded-md border border-gray-200 text-center">
              <div className="font-medium text-gray-800">{formData.role || 'This Step'}</div>
              <div className="text-xs text-gray-500">Requests information</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="bg-blue-100 p-2 rounded-md border border-blue-200 text-center">
              <div className="font-medium text-blue-800">Recipient</div>
              <div className="text-xs text-blue-500">Uploads documents</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <div className="bg-gray-100 p-2 rounded-md border border-gray-200 text-center">
              <div className="font-medium text-gray-800">{formData.role || 'This Step'}</div>
              <div className="text-xs text-gray-500">Reviews response</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Success message */}
      {showSuccess && (
        <div className="bg-green-50 p-3 rounded-md border border-green-200 mb-4 flex items-center transition-all duration-500 ease-in-out" data-testid="feedback-success-message">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-700">Feedback loop created successfully!</span>
        </div>
      )}
      
      {/* List of existing feedback loops */}
      {feedbackLoops.length > 0 && (
        <div className="space-y-2 mb-4" data-testid="existing-feedback-loops">
          {feedbackLoops.map((feedback) => (
            <div 
              key={feedback.id} 
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200 relative overflow-hidden"
              data-testid={`feedback-loop-${feedback.id}`}
              data-feedback-id={feedback.id}
            >
              {/* Left colored border to indicate feedback type */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" aria-hidden="true" />
              
              {/* Feedback icon */}
              <div className="absolute -left-1 -top-1 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center transform -rotate-45 text-xs">
                ↩
              </div>
              
              <div className="ml-2">
                <div className="flex items-center mb-1">
                  <span className="font-medium">Send to: </span>
                  <span className="text-primary font-bold ml-1">{feedback.recipient}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Step name: </span>
                  <span className="text-primary font-bold ml-1">{feedback.nextStep}</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => removeFeedbackLoop(feedback.id)}
                className="text-white bg-red-500 hover:bg-red-600 p-1.5 rounded-full flex items-center justify-center shadow-sm transition-colors duration-200"
                aria-label="Remove feedback loop"
                data-testid={`remove-feedback-${feedback.id}`}
                data-action="remove-feedback"
                data-feedback-id={feedback.id}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Form for adding a new feedback loop */}
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200" data-testid="add-feedback-form">
        <h4 className="text-sm font-medium mb-2" data-testid="add-feedback-heading">Add New Feedback Loop (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <FormField
            label="Send feedback to *"
            name="recipient"
            type="select"
            value={newFeedback.recipient}
            onChange={(e) => setNewFeedback({ ...newFeedback, recipient: e.target.value })}
            options={[
              { value: '', label: 'Select recipient...' }, 
              ...recipientOptions
            ]}
            error={feedbackErrors.recipient}
            data-testid="field-feedback-recipient"
          />
          
          <FormField
            label="Feedback Step Name *"
            name="nextStep"
            type="text"
            value={newFeedback.nextStep}
            onChange={(e) => setNewFeedback({ ...newFeedback, nextStep: e.target.value })}
            placeholder="Enter step name (e.g., Provide Additional Information)"
            error={feedbackErrors.nextStep}
            data-testid="feedback-step-name-input"
          />
        </div>
        
        {/* Preview toggle button */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-primary hover:text-primary-600 text-sm flex items-center"
            data-testid="toggle-feedback-preview-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              {showPreview ? (
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              ) : (
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
              )}
            </svg>
            {showPreview ? "Hide Preview" : "Preview Feedback Step"}
          </button>
        </div>
        
        {/* Preview section */}
        {showPreview && newFeedback.recipient && newFeedback.nextStep && (
          <div className="mb-4 border border-primary-200 rounded-md p-3 bg-primary-50" data-testid="feedback-preview">
            <h5 className="text-sm font-medium text-primary-800 mb-1">Preview:</h5>
            <div className="bg-white rounded-md border border-gray-200 p-3 text-sm">
              <div className="flex mb-2">
                <div className="w-24 font-medium">Step Type:</div>
                <div className="text-gray-800">Upload</div>
              </div>
              <div className="flex mb-2">
                <div className="w-24 font-medium">Title:</div>
                <div className="text-gray-800">{newFeedback.nextStep || "Feedback Step"}</div>
              </div>
              <div className="flex mb-2">
                <div className="w-24 font-medium">Role:</div>
                <div className="text-gray-800">{newFeedback.recipient || "Recipient"}</div>
              </div>
              <div className="flex mb-2">
                <div className="w-24 font-medium">Files:</div>
                <div className="text-gray-800">Supporting Documentation (Required)</div>
              </div>
              <div className="flex">
                <div className="w-24 font-medium">Actions:</div>
                <div className="text-gray-800">Return to {formData.role || "Requestor"}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={addFeedbackLoop}
            disabled={!newFeedback.recipient || !newFeedback.nextStep.trim()}
            className="bg-primary hover:bg-primary-600 text-white rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="add-feedback-loop-button"
            data-action="add-feedback-loop"
          >
            Add Feedback Loop
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs">
        <p>
          Adding a feedback loop will automatically create a Document Upload step with the specified name.
          This step will include required comments and an action to return to {formData.role}.
        </p>
      </div>
    </CollapsibleCard>
  );
};

export default FeedbackLoopsSection;
