import React, { useState } from 'react';
import CollapsibleCard from '../../common/CollapsibleCard';
import FormField from '../../common/FormField';
import { createFeedbackStep, validateFeedbackStep } from '../../../utils/feedbackStepUtils';

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
    
    // Create a unique ID for the feedback loop
    const feedbackId = `feedback_${Date.now()}`;
    
    // Create the feedback step using our utility function
    const newFeedbackStep = createFeedbackStep({
      recipientRole: newFeedback.recipient,
      stepTitle: newFeedback.nextStep.trim(),
      requestingRole: formData.role,
      parentStepTitle: formData.title || 'Requesting Step',
      feedbackId: feedbackId,
      parentStepId: formData.id || `pending_${Date.now()}`
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
    >
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
        <p className="text-sm text-blue-700">
          Feedback loops create additional steps when the user needs to request more information from another participant.
          These steps will automatically include document upload capabilities and return actions.
        </p>
      </div>
      
      {/* List of existing feedback loops */}
      {feedbackLoops.length > 0 && (
        <div className="space-y-2 mb-4">
          {feedbackLoops.map((feedback) => (
            <div 
              key={feedback.id} 
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
            >
              <div>
                <span className="font-medium">Send to: </span>
                <span className="text-primary">{feedback.recipient}</span>
                <span className="mx-2">→</span>
                <span className="font-medium">Step name: </span>
                <span className="text-primary">{feedback.nextStep}</span>
              </div>
              <button 
                type="button" 
                onClick={() => removeFeedbackLoop(feedback.id)}
                className="text-red-500 hover:bg-red-50 p-1 rounded"
                aria-label="Remove feedback loop"
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
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <h4 className="text-sm font-medium mb-2">Add New Feedback Loop (Optional)</h4>
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
          />
          
          <FormField
            label="Feedback Step Name *"
            name="nextStep"
            type="text"
            value={newFeedback.nextStep}
            onChange={(e) => setNewFeedback({ ...newFeedback, nextStep: e.target.value })}
            placeholder="Enter step name (e.g., Provide Additional Information)"
            error={feedbackErrors.nextStep}
          />
        </div>
        
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={addFeedbackLoop}
            disabled={!newFeedback.recipient || !newFeedback.nextStep.trim()}
            className="bg-primary hover:bg-primary-600 text-white rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Feedback Loop
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>
          Adding a feedback loop will automatically create a Document Upload step with the specified name.
          This step will include required comments and an action to return to {formData.role}.
        </p>
      </div>
    </CollapsibleCard>
  );
};

export default FeedbackLoopsSection;
